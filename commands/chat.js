import {
  SlashCommandBuilder,
  PermissionsBitField,
  MessageFlags,
  EmbedBuilder,
} from "discord.js";

import {
  enableChannel,
  deleteChannel,
  getActiveChannels,
} from "../helpers/chatChannelManager.js";
import { loadData, saveData } from "../helpers/dataManager.js";
import { checkCooldown } from "../helpers/cooldownManager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("chat")
    .setDescription("Kelola status chat Sarah di channel ini")
    .addSubcommand(sub =>
      sub.setName("enable").setDescription("Aktifkan chat di channel ini (Admin only)")
    )
    .addSubcommand(sub =>
      sub.setName("disable").setDescription("Nonaktifkan chat di channel ini (Admin only)")
    )
    .addSubcommand(sub =>
      sub.setName("channels").setDescription("Lihat daftar channel aktif (Admin only)")
    ),

  async execute(interaction) {
    // ⛳ Validasi: hanya bisa di server (guild)
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: "❌ Command ini hanya bisa digunakan di server.",
        flags: MessageFlags.Ephemeral,
      });
    }
    const userId = interaction.user.id;
    const delay = 5000; // 5 detik
    if (!checkCooldown("chat", userId, delay)) {
      const readyAt = Math.floor((Date.now() + delay) / 1000);
      return interaction.reply({
        content: `⏳ Cooldown aktif! Coba lagi <t:${readyAt}:R>.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    // ✅ Validasi: user harus admin
    const isAdmin = interaction.member?.permissions?.has(PermissionsBitField.Flags.Administrator) ?? false;
    if (!isAdmin) {
      return interaction.reply({
        content: "🚫 Kamu tidak punya izin untuk command ini",
        flags: MessageFlags.Ephemeral,
      });
    }

    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const channelId = interaction.channel.id;

    if (subcommand === "enable") {
      const isAlreadyEnabled = getActiveChannels(guildId).includes(channelId);

      if (isAlreadyEnabled) {
        await interaction.reply({
          content: "❓ Channel ini sudah aktif. Sarah udah standby kok 🫡",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      enableChannel(guildId, channelId);
      await interaction.reply("🥂 Sarah diaktifkan di channel ini!");
      await interaction.channel.send("Yay! Halo semuanya, Kenalin nama aku Sarah. 🎉");
    }

    else if (subcommand === "disable") {
      const isAlreadyDisabled = !getActiveChannels(guildId).includes(channelId);

      if (isAlreadyDisabled) {
        await interaction.reply({
          content: "⚠️ Channel ini sudah nonaktif atau belum pernah diaktifkan.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      deleteChannel(guildId, channelId);

      const historyData = loadData("chatHistory");
      if (historyData?.[guildId]) {
        delete historyData[guildId][channelId];
        if (Object.keys(historyData[guildId]).length === 0) {
          delete historyData[guildId];
        }
        saveData("chatHistory", historyData);
      }

      const forgetList = loadData("forgetme") || {};
      for (const uid in forgetList) {
        if (forgetList[uid]?.channelId === channelId) {
          delete forgetList[uid];
        }
      }
      saveData("forgetme", forgetList);

      await interaction.reply("🧼 Chat Sarah dimatikan dan datanya dihapus dari channel ini.");
    }

    else if (subcommand === "channels") {
      const historyData = loadData("chatHistory");
      const fullData = loadData("chatChannels");
      const activeEntries = Object.entries(fullData[guildId] || {})
        .filter(([, data]) => data.active);

      const fields = activeEntries.map(([id, data]) => {
        const lastActive = data.lastActive
          ? new Date(data.lastActive).toLocaleString("id-ID", {
              dateStyle: "medium",
            })
          : "–";

        const messages = historyData?.[guildId]?.[id]?.messages ?? [];

        const totalUserChats = messages.filter(msg => msg.userId !== "Sarah").length;
        const totalSarahChats = messages.filter(msg => msg.userId === "Sarah").length;

        const chatSummary = `User: ${totalUserChats} | Sarah: ${totalSarahChats}`;

        return {
          name: `<#${id}>`,
          value: `\`⏰ Aktif sejak ${lastActive}\n🗨️ ${chatSummary}\``,
          inline: false,
        };
      });

      let totalUserAll = 0;
      let totalSarahAll = 0;
      let totalMessagesAll = 0;

      for (const cid in historyData?.[guildId] || {}) {
        const messages = historyData[guildId][cid]?.messages ?? [];

        const userChats = messages.filter(msg => msg.userId !== "Sarah").length;
        const sarahChats = messages.filter(msg => msg.userId === "Sarah").length;
        const totalMessages = userChats + sarahChats;

        totalUserAll += userChats;
        totalSarahAll += sarahChats;
        totalMessagesAll += totalMessages;
      }

      const embed = new EmbedBuilder()
        .setTitle("📡 Channel Chat Aktif")
        .setColor(0x3498db)
        .setDescription(
          fields.length
            ? "Berikut daftar channel tempat Sarah aktif:"
            : "Tidak ada channel yang aktif saat ini."
        )
        .addFields(fields)
        .setFooter({
          text: `Total Pesan ${totalMessagesAll}`,
        }).setTimestamp();

      await interaction.reply({
        embeds: [embed],
      });
    }
  },
};