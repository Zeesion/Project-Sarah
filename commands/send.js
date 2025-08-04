import {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
  PermissionsBitField
} from "discord.js";

import {
  getUserData,
  updateUserData
} from "../helpers/dataManager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("send")
    .setDescription("Kirim ulang pesan override Sarah")
    .addSubcommand(sub =>
      sub.setName("message")
        .setDescription("Kirim override pesan biasa (Admin only)")
        .addStringOption(option =>
          option.setName("channel")
            .setDescription("Channel tujuan override (opsional)")
            .setAutocomplete(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName("embed")
        .setDescription("Kirim override pesan dengan warna embed (Admin only)")
        .addStringOption(option =>
          option.setName("channel")
            .setDescription("Channel tujuan override (opsional)")
            .setAutocomplete(true)
        )
        .addStringOption(option =>
          option.setName("color")
            .setDescription("Warna embed dalam format hex (contoh: #ffaa00)")
        )
    )
    .addSubcommand(sub =>
      sub.setName("cancel")
        .setDescription("Batalkan override pesan aktif (Admin only)")
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "❌ Command ini hanya bisa digunakan di server.",
        flags: MessageFlags.Ephemeral
      });
    }
    const sub = interaction.options.getSubcommand();

    // 🚫 Permission check
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: "🚫 Kamu tidak punya izin untuk command ini.",
        flags: MessageFlags.Ephemeral
      });
    }

    // ❎ Cancel override
    if (sub === "cancel") {
      const current = getUserData("pending", interaction.user.id);
      const now = Date.now();

      if (!current || !current.expiresAt || current.expiresAt < now) {
        return interaction.reply({
          content: "🫥 Tidak ada override aktif.",
          flags: MessageFlags.Ephemeral
        });
      }

      updateUserData("pending", interaction.user.id, () => null);
      return interaction.reply({
        content: "❎ Override pesan Sarah berhasil dibatalkan.",
        flags: MessageFlags.Ephemeral
      });
    }

    // 🛑 Cegah override baru kalau masih aktif
    const current = getUserData("pending", interaction.user.id);
    const now = Date.now();

    if (current && current.expiresAt && current.expiresAt > now) {
      return interaction.reply({
        content: "⚠️ Override kamu masih aktif.\nGunakan `/send cancel` dulu sebelum set yang baru.",
        flags: MessageFlags.Ephemeral
      });
    }

    // 📤 Kirim ulang override
    const channelId = interaction.options.getString("channel");
    const targetChannel = channelId
      ? interaction.guild.channels.cache.get(channelId)
      : interaction.channel;

    if (!targetChannel || !targetChannel.isTextBased()) {
      return interaction.reply({
        content: `❌ Channel dengan ID "${channelId}" tidak valid.`,
        flags: MessageFlags.Ephemeral
      });
    }

    const useEmbed = sub === "embed";
    const hex = interaction.options.getString("color");
    const isHex = /^#?[0-9a-fA-F]{6}$/.test(hex ?? "");
    const embedColor = useEmbed && isHex
      ? parseInt(hex.replace("#", ""), 16)
      : 0x00bfff;

    updateUserData("pending", interaction.user.id, () => ({
      channelId: targetChannel.id,
      commandChannelId: interaction.channel.id,
      embed: useEmbed,
      color: embedColor,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 menit
    }));

    const isSame = targetChannel.id === interaction.channel.id;
    const location = isSame ? "di sini" : `ke <#${targetChannel.id}>`;
    const style = useEmbed ? "dalam bentuk embed 🎨" : "sebagai teks biasa";
    const note = `Sarah akan mengirim ulang pesan kamu ${location} ${style}.\nGunakan \`/send cancel\` untuk membatalkan.`

    const reply = useEmbed
      ? {
          embeds: [
            new EmbedBuilder()
              .setColor(embedColor)
              .setDescription(`🧃 Sarah standby...\n${note}`)
          ],
          flags: MessageFlags.Ephemeral
        }
      : {
          content: `💬 Sarah standby...\n${note}`,
          flags: MessageFlags.Ephemeral
        };

    await interaction.reply(reply);
  },

  async autocomplete(interaction) {
    if (!interaction.guild) {
      return interaction.respond([
        { value: "unavailable" }
      ]);
    }
    const focused = interaction.options.getFocused().toLowerCase();

    const choices = interaction.guild.channels.cache
      .filter(ch => ch.isTextBased())
      .sort((a, b) => a.rawPosition - b.rawPosition)
      .filter(ch => ch.name.toLowerCase().includes(focused))
      .map(ch => ({
        name: ch.name,
        value: ch.id
      }));

    await interaction.respond(choices.slice(0, 25));
  }
};