import { SlashCommandBuilder, MessageFlags } from "discord.js";
import {
  updateUserData,
  loadData,
  saveData
} from "../helpers/dataManager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("forgetme")
    .setDescription("Anonimkan jejak chat kamu di channel tertentu")
    .addStringOption((option) =>
      option
        .setName("channel")
        .setDescription("Pilih channel yang ingin kamu hapus jejaknya")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    if (!interaction.guild) {
      return interaction.respond([
        { value: "unavailable" }
      ]);
    }

    const input = interaction.options.getFocused();
    const chatChannels = loadData("chatChannels");
    const chatHistory = loadData("chatHistory");
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    const guildChannels = chatChannels[guildId] ?? {};
    const activeChannelIds = Object.keys(guildChannels).filter(channelId => {
      if (!guildChannels[channelId]?.active) return false;

      const history = chatHistory[guildId]?.[channelId]?.messages;
      if (!history) return false;

      return history.some(msg => msg.userId === userId && !msg.anonymized);
    });

    const choices = activeChannelIds.map(id => {
      const channelObj = interaction.client.channels.cache.get(id);
      const channelName = channelObj ? `${channelObj.name}` : `${id}`;
      return { name: channelName, value: id };
    });

    const filtered = choices.filter(choice =>
      choice.name.toLowerCase().includes(input.toLowerCase())
    );

    await interaction.respond(filtered.slice(0, 10));
  },

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "❌ Command ini hanya bisa digunakan di server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const userId = interaction.user.id;
    const username = interaction.user.username;
    const channelId = interaction.options.getString("channel");

    const chatHistory = loadData("chatHistory");
    const guildId = interaction.guild.id;
    const channelData = chatHistory[guildId]?.[channelId];

    if (!channelData || !channelData.messages) {
      await interaction.reply({
        content: `⚠️ Channel <#${channelId}> tidak ditemukan atau belum ada jejak chat.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    let anonymizedCount = 0;

    channelData.messages = channelData.messages.map((msg) => {
      if (msg.userId === userId || msg.username === username) {
        anonymizedCount++;
        return {
          ...msg,
          userId: `anon-${Date.now()}`,
          username: "Pengguna Terhapus",
          anonymized: true
        };
      }
      return msg;
    });

    chatHistory[guildId] ??= {};
    chatHistory[guildId][channelId] = channelData;
    saveData("chatHistory", chatHistory);

    // 🔄 Reset persona jika ada
    updateUserData("persona", userId, () => undefined);

    // 📝 Log ke forgetme.json
    const forgetList = loadData("forgetme") || {};
    forgetList[userId] = {
      channelId,
      anonymizedCount,
      timestamp: new Date().toISOString()
    };
    saveData("forgetme", forgetList);

    await interaction.reply({
      content: `✅ Jejak kamu *${anonymizedCount} pesan* di <#${channelId}> sudah dianonimkan.`,
      flags: MessageFlags.Ephemeral
    });
  }
};