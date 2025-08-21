import {
  SlashCommandSubcommandBuilder,
  MessageFlags
} from "discord.js";
import { loadData } from "../../helpers/dataManager.js";
import { buildWelcomeEmbed } from "../../helpers/welcomeEmbedBuilder.js";
import { resolvePlaceholders } from "../../helpers/placeholderUtils.js";

const configName = "welcomeConfig";

// Properti embed yang bisa berdiri sendiri
const validStandaloneKeys = ["description", "image", "thumbnail", "fields", "author"];

/**
 * Cek apakah embed punya konten yang bisa ditampilkan
 * @param {Object} embed
 * @returns {boolean}
 */
function hasValidEmbedContent(embed = {}) {
  return validStandaloneKeys.some((key) => {
    if (key === "fields") {
      return Array.isArray(embed.fields) && embed.fields.length > 0;
    }
    if (key === "thumbnail" || key === "image") {
      return embed[key] && embed[key] !== "disable";
    }
    return typeof embed[key] === "string" && embed[key].trim() !== "";
  });
}

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName("test")
    .setDescription("Tampilkan preview welcome"),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const config = loadData(configName)[guildId];

    if (!config) {
      await interaction.reply({
        content: "⚠️ Belum ada konfigurasi welcome.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    if (!config.channelId) {
      await interaction.reply({
        content: "⚠️ Channel welcome belum di-set. Gunakan `/welcome channel`.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    if (!config.embed || !hasValidEmbedContent(config.embed)) {
      await interaction.reply({
        content: "⚠️ Embed belum dikonfigurasi. Gunakan `/welcome settings`.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // 🔧 Resolusi placeholder hanya untuk bagian embed
    const resolvedEmbedConfig = resolvePlaceholders(config.embed, interaction.member);
    const embed = buildWelcomeEmbed(interaction.member, resolvedEmbedConfig);
    const resolvedContent = resolvePlaceholders({ content: config.content }, interaction.member).content;
    const channelMention = `<#${config.channelId}>`;

    await interaction.reply({
      content: `**📨 Preview Welcome Message**\nWelcome channel: ${channelMention}\n\n${resolvedContent || ""}`,
      embeds: [embed],
      flags: MessageFlags.Ephemeral
    });
  }
};