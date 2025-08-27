import { loadData } from "../helpers/dataManager.js";
import { buildWelcomeEmbed } from "../helpers/welcomeEmbedBuilder.js";
import { resolvePlaceholders } from "../helpers/placeholderUtils.js";

const configName = "welcomeConfig";

/**
 * Listener untuk member keluar
 * @param {Client} client - Instance bot
 * @param {GuildMember} member - Member yang keluar
 */
export default async function (client, member) {
  if (!member || !member.guild || !member.user) return;
  if (member.user.bot) return;

  const guildId = member.guild.id;
  const config = loadData(configName)[guildId];
  if (!config || !config.enabled || !config.log?.channelId) return;

  const leftData = {
    status: "left",
  };

  const logChannel = member.guild.channels.cache.get(config.log.channelId);
  const logConfig = config.log?.left;

  if (logChannel?.isTextBased() && logConfig) {
    const resolvedLogContent = resolvePlaceholders({ content: logConfig.content }, member, leftData).content;
    const resolvedLogEmbedConfig = resolvePlaceholders(logConfig.embed, member, leftData);
    const logEmbed = buildWelcomeEmbed(member, resolvedLogEmbedConfig);

    try {
      await logChannel.send({
        content: resolvedLogContent || "",
        embeds: [logEmbed]
      });
    } catch (err) {
      console.error(`[LOG] Gagal kirim log left ${member.user.tag}:`, err);
    }
  }
}