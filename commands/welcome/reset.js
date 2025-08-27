import {
  SlashCommandSubcommandBuilder,
  MessageFlags
} from "discord.js";
import { loadData, saveData } from "../../helpers/dataManager.js";
import { buildWelcomeEmbed } from "../../helpers/welcomeEmbedBuilder.js";
import { resolvePlaceholders } from "../../helpers/placeholderUtils.js";

const configName = "welcomeConfig";
const validStandaloneKeys = ["description", "image", "thumbnail", "fields", "author"];

const typeLabels = {
  greeting: "greeting",
  "log.join": "log join",
  "log.left": "log left"
};

function getRemainingValidKeys(embed, targetToRemove) {
  return validStandaloneKeys.filter((key) => {
    if (key === targetToRemove) return false;
    if (key === "fields") return Array.isArray(embed.fields) && embed.fields.length > 0;
    if (key === "thumbnail" || key === "image") return embed[key] && embed[key] !== "disable";
    return typeof embed[key] === "string" && embed[key].trim() !== "";
  });
}

function getChoiceOptions() {
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
    .setDescription("Reset konfigurasi greeting atau log welcome")
    .addStringOption(opt =>
      opt.setName("type")
        .setDescription("Tipe konfigurasi")
        .setRequired(true)
        .addChoices(
          { name: "Greeting", value: "greeting" },
          { name: "Log Join", value: "log.join" },
          { name: "Log Left", value: "log.left" }
        )
    )
    .addStringOption(opt =>
      opt.setName("choice")
        .setDescription("Bagian yang ingin di-reset")
        .setRequired(true)
        .addChoices(...getChoiceOptions())
    ),

  async execute(interaction) {
    const guildId = interaction.guild?.id;
    const type = interaction.options.getString("type");
    const target = interaction.options.getString("choice");
    const allConfig = loadData(configName);

    const [baseType, subType] = type.split(".");
    const isLogSub = baseType === "log" && subType;
    const typeLabel = typeLabels[type] ?? type;

    const config = isLogSub
      ? allConfig[guildId]?.log?.[subType]
      : allConfig[guildId]?.[type];

    if (!config || !config.embed) {
      await interaction.reply({
        content: `⚠️ Belum ada konfigurasi ${typeLabel}.`,
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

    const label = getChoiceOptions().find(opt => opt.value === target)?.name;

    // Reset semua
    if (target === "all") {
      const defaultContent = type === "greeting" ? "{mention}" : "";
      const defaultEmbed = type === "greeting"
        ? { image: "default" }
        : subType === "join"
          ? {
              color: "#98FF98",
              header: "Member joined the server",
              description: "{mention} {memberordinal} to join\ncreated {created} ago\nID: {userid}",
              thumbnail: "avatar"
            }
          : {
              color: "#F08080",
              header: "Member left the server",
              description: "{mention} joined {joindate} ago\nID: {userid}\nRoles: {roles}",
              thumbnail: "avatar"
            };

      if (isLogSub) {
        allConfig[guildId].log[subType] = {
          content: defaultContent,
          embed: defaultEmbed
        };
      } else {
        allConfig[guildId][type] = {
          channelId: config.channelId,
          content: defaultContent,
          embed: defaultEmbed
        };
      }

      saveData(configName, allConfig);

      const resolvedContent = resolvePlaceholders({ content: defaultContent }, interaction.member).content;
      const resolvedEmbedConfig = resolvePlaceholders(defaultEmbed, interaction.member);
      const embed = buildWelcomeEmbed(interaction.member, resolvedEmbedConfig);

      await interaction.reply({
        content: `✅ Konfigurasi ${typeLabel} telah direset ke default.\n\n${resolvedContent || ""}`,
        embeds: [embed],
        flags: MessageFlags.Ephemeral
      });
      const isDisabled = isLogSub
        ? allConfig[guildId]?.log?.enabled === false
        : allConfig[guildId]?.[type]?.enabled === false;

      if (isDisabled) {
        await interaction.followUp({
          content: `⚠️ Fitur ${typeLabel} saat ini dinonaktifkan.\nGunakan \`/welcome channel\` untuk mengaktifkan kembali.`,
          flags: MessageFlags.Ephemeral
        });
      }
      return;
    }

    // Validasi agar tidak menghapus properti terakhir yang valid
    const embedConfig = config.embed;
    const remainingValid = getRemainingValidKeys(embedConfig, target);

    if (validStandaloneKeys.includes(target) && remainingValid.length === 0) {
      await interaction.reply({
        content: `⚠️ \`${label}\` tidak bisa dihapus jika embed tidak punya konten lain.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Hapus properti tertentu
    if (target === "content") {
      if (isLogSub) {
        allConfig[guildId].log[subType].content = "";
      } else {
        allConfig[guildId][type].content = "";
      }
    } else {
      if (isLogSub) {
        delete allConfig[guildId].log[subType].embed[target];
      } else {
        delete allConfig[guildId][type].embed[target];
      }
    }

    saveData(configName, allConfig);

    const finalConfig = isLogSub
      ? allConfig[guildId].log[subType]
      : allConfig[guildId][type];

    const resolvedContent = resolvePlaceholders({ content: finalConfig.content }, interaction.member).content;
    const resolvedEmbedConfig = resolvePlaceholders(finalConfig.embed, interaction.member);
    const previewEmbed = buildWelcomeEmbed(interaction.member, resolvedEmbedConfig);

    await interaction.reply({
      content: `\`${label}\` telah dihapus dari konfigurasi ${typeLabel}.\n\n${resolvedContent || ""}`,
      embeds: [previewEmbed],
      flags: MessageFlags.Ephemeral
    });
    const isDisabled = isLogSub
      ? allConfig[guildId]?.log?.enabled === false
      : allConfig[guildId]?.[type]?.enabled === false;

    if (isDisabled) {
      await interaction.followUp({
        content: `⚠️ Fitur ${typeLabel} saat ini dinonaktifkan.\nGunakan \`/welcome channel\` untuk mengaktifkan kembali.`,
        flags: MessageFlags.Ephemeral
      });
    }
  }
};