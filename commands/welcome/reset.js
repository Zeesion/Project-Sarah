import {
  SlashCommandSubcommandBuilder,
  MessageFlags
} from "discord.js";
import { loadData, saveData } from "../../helpers/dataManager.js";
import { buildWelcomeEmbed } from "../../helpers/welcomeEmbedBuilder.js";
import { resolvePlaceholders } from "../../helpers/placeholderUtils.js";

const configName = "welcomeConfig";

// Properti yang bisa berdiri sendiri secara valid
const validStandaloneKeys = ["description", "image", "thumbnail", "fields", "author"];

/**
 * Cek properti embed yang masih valid setelah satu dihapus
 */
function getRemainingValidKeys(embed, targetToRemove) {
  return validStandaloneKeys.filter((key) => {
    if (key === targetToRemove) return false;

    if (key === "fields") {
      return Array.isArray(embed.fields) && embed.fields.length > 0;
    }

    if (key === "thumbnail" || key === "image") {
      return embed[key] && embed[key] !== "disable";
    }

    return typeof embed[key] === "string" && embed[key].trim() !== "";
  });
}

export function getChoiceOptions() {
  return [
    { name: "Message", value: "content" },
    { name: "Color", value: "color" },
    { name: "Author", value: "author" },
    { name: "Header", value: "header" },
    { name: "Description", value: "description" },
    { name: "Footer", value: "footer" },
    { name: "Thumbnail", value: "thumbnail" },
    { name: "Image", value: "image" },
    { name: "Fields", value: "fields" },
    { name: "Default", value: "all" }
  ];
}

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName("reset")
    .setDescription("Reset konfigurasi welcome")
    .addStringOption((opt) =>
      opt
        .setName("choice")
        .setDescription("Pilih yang ingin di-reset")
        .setRequired(true)
        .addChoices(...getChoiceOptions())
    ),

  async execute(interaction) {
    const guildId = interaction.guild?.id;
    const allConfig = loadData(configName);
    const config = allConfig[guildId];

    if (!config || !config.embed) {
      await interaction.reply({
        content: "⚠️ Belum ada konfigurasi welcome.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    if (!interaction.member) {
      await interaction.reply({
        content: "⚠️ Tidak bisa menampilkan preview karena data member tidak tersedia.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const target = interaction.options.getString("choice");

    // Reset semua
    if (target === "all") {
      allConfig[guildId].content = "{mention}";
      allConfig[guildId].embed = {
        image: "default"
      };
      saveData(configName, allConfig);

      const resolvedContent = resolvePlaceholders({ content: allConfig[guildId].content }, interaction.member).content;
      const resolvedEmbedConfig = resolvePlaceholders(allConfig[guildId].embed, interaction.member);
      const embed = buildWelcomeEmbed(interaction.member, resolvedEmbedConfig);

      await interaction.reply({
        content: `✅ Konfigurasi welcome telah direset ke default.\n\n${resolvedContent || ""}`,
        embeds: [embed],
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Validasi agar tidak menghapus properti terakhir yang valid
    const embedConfig = config.embed;
    const remainingValid = getRemainingValidKeys(embedConfig, target);
    const label = getChoiceOptions().find((opt) => opt.value === target)?.name;

    if (validStandaloneKeys.includes(target) && remainingValid.length === 0) {
      await interaction.reply({
        content: `⚠️ \`${label}\` tidak bisa dihapus jika embed tidak punya konten lain.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Hapus properti tertentu
    if (target === "content") {
      allConfig[guildId].content = "";
    } else {
      delete allConfig[guildId].embed[target];
    }
    saveData(configName, allConfig);

    const resolvedContent = resolvePlaceholders({ content: allConfig[guildId].content }, interaction.member).content;
    const resolvedEmbedConfig = resolvePlaceholders(allConfig[guildId].embed, interaction.member);
    const previewEmbed = buildWelcomeEmbed(interaction.member, resolvedEmbedConfig);

    await interaction.reply({
      content: `\`${label}\` telah dihapus dari konfigurasi welcome.\n\n${resolvedContent || ""}`,
      embeds: [previewEmbed],
      flags: MessageFlags.Ephemeral
    });
  }
};