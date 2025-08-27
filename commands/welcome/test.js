import {
  SlashCommandSubcommandBuilder,
  MessageFlags
} from "discord.js";
import { loadData } from "../../helpers/dataManager.js";
import { buildWelcomeEmbed } from "../../helpers/welcomeEmbedBuilder.js";
import { resolvePlaceholders } from "../../helpers/placeholderUtils.js";
import { getInviteData } from "../../events/guildMemberAdd.js";

const configName = "welcomeConfig";
const validStandaloneKeys = ["description", "image", "thumbnail", "fields", "author"];

const typeLabels = {
  greeting: "greeting",
  "log.join": "log join",
  "log.left": "log left"
};

function hasValidEmbedContent(embed = {}) {
  return validStandaloneKeys.some((key) => {
    if (key === "fields") return Array.isArray(embed.fields) && embed.fields.length > 0;
    if (key === "thumbnail" || key === "image") return embed[key] && embed[key] !== "disable";
    return typeof embed[key] === "string" && embed[key].trim() !== "";
  });
}

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName("test")
    .setDescription("Tampilkan preview greeting atau log welcome")
    .addStringOption(opt =>
      opt.setName("type")
        .setDescription("Tipe konfigurasi yang ingin diuji")
        .setRequired(true)
        .addChoices(
          { name: "Greeting", value: "greeting" },
          { name: "Log Join", value: "log.join" },
          { name: "Log Left", value: "log.left" }
        )
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const type = interaction.options.getString("type");
    const [baseType, subType] = type.split(".");
    const isLogSub = baseType === "log" && subType;
    const typeLabel = typeLabels[type] ?? type;

    const config = loadData(configName)[guildId];
    const target = isLogSub
      ? config?.log?.[subType]
      : config?.[type];

    const channelId = type === "greeting"
      ? config?.greeting?.channelId
      : config?.log?.channelId;

    if (!target || !channelId) {
      await interaction.reply({
        content: `⚠️ Channel ${typeLabel} belum diatur.\nGunakan \`/welcome channel\`.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    if (!target.embed || !hasValidEmbedContent(target.embed)) {
      await interaction.reply({
        content: `⚠️ Embed ${typeLabel} belum lengkap.\nGunakan \`/welcome settings\`.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const inviteData = await getInviteData(interaction.member, interaction.client);
    const finalInviteData = inviteData?.inviter
      ? inviteData
      : {
          inviter: interaction.user,
          inviteCount: 21
        };

    const previewData = {
      ...finalInviteData,
      status: subType === "join" ? "joined" : subType === "left" ? "left" : "greeting",
      embedColor: target?.embed?.color || ""
    };

    const resolvedEmbedConfig = resolvePlaceholders(target.embed, interaction.member, previewData);
    const resolvedContent = resolvePlaceholders({ content: target.content }, interaction.member, previewData).content;

    const channel = interaction.guild.channels.cache.get(channelId);
    const channelMention = channel ? `<#${channel.id}>` : "`(Channel tidak ditemukan)`";

    const embed = buildWelcomeEmbed(interaction.member, resolvedEmbedConfig);

    await interaction.reply({
      content: `**📨 Preview ${typeLabel} Message**\nChannel: ${channelMention}\n\n${resolvedContent || ""}`,
      embeds: [embed],
      flags: MessageFlags.Ephemeral
    });
    
    const isDisabled = isLogSub
      ? config?.log?.enabled === false
      : config?.[type]?.enabled === false;

    if (isDisabled) {
      await interaction.followUp({
        content: `⚠️ Fitur ${typeLabel} saat ini dinonaktifkan.\nGunakan \`/welcome channel\` untuk mengaktifkan kembali.`,
        flags: MessageFlags.Ephemeral
      });
    }
  }
};