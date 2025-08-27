import { loadData } from "../helpers/dataManager.js";
import { buildWelcomeEmbed } from "../helpers/welcomeEmbedBuilder.js";
import { resolvePlaceholders } from "../helpers/placeholderUtils.js";

const configName = "welcomeConfig";

/**
 * Listener untuk member baru join
 * @param {Client} client - Instance bot
 * @param {GuildMember} member - Member yang baru join
 */
export default async function (client, member) {
  if (!member || !member.guild || !member.user) return;
  if (member.user.bot) return;

  const guildId = member.guild.id;
  const config = loadData(configName)[guildId];
  if (!config || !config.enabled) return;

  const inviteData = await getInviteData(member, client);
  Object.assign(inviteData, {
    status: "joined",
  });

  // 🎉 Greeting
  if (config.greeting?.channelId) {
    const greetingChannel = member.guild.channels.cache.get(config.greeting.channelId);
    if (greetingChannel?.isTextBased()) {
      const resolvedContent = resolvePlaceholders({ content: config.greeting.content }, member, inviteData).content;
      const resolvedEmbedConfig = resolvePlaceholders(config.greeting.embed, member, inviteData);
      const embed = buildWelcomeEmbed(member, resolvedEmbedConfig);

      try {
        await greetingChannel.send({
          content: resolvedContent || "",
          embeds: [embed]
        });
      } catch (err) {
        console.error(`[GREETING] Gagal kirim ke ${member.user.tag}:`, err);
      }
    }
  }

  // 📋 Log
  if (config.log?.channelId) {
    const logChannel = member.guild.channels.cache.get(config.log.channelId);
    const logConfig = config.log?.join;

    if (logChannel?.isTextBased() && logConfig) {
      const resolvedLogContent = resolvePlaceholders({ content: logConfig.content }, member, inviteData).content;
      const resolvedLogEmbedConfig = resolvePlaceholders(logConfig.embed, member, inviteData);
      const logEmbed = buildWelcomeEmbed(member, resolvedLogEmbedConfig);

      try {
        await logChannel.send({
          content: resolvedLogContent || "",
          embeds: [logEmbed]
        });
      } catch (err) {
        console.error(`[LOG] Gagal kirim log join ${member.user.tag}:`, err);
      }
    }
  }
}

/**
 * Tracking invite dengan membandingkan cache sebelum dan sesudah
 * @param {GuildMember} member
 * @param {Client} client
 * @returns {Object} inviteData
 */
export async function getInviteData(member, client) {
  const guildId = member.guild.id;
  const oldUses = client.inviteCache?.get(guildId) ?? new Map();

  try {
    const newInvites = await member.guild.invites.fetch();
    client.inviteCache.set(guildId, new Map(newInvites.map(inv => [inv.code, inv.uses])));

    const used = newInvites.find(inv => {
      const prev = oldUses.get(inv.code) ?? 0;
      return inv.uses > prev;
    });

    return used
      ? { inviter: used.inviter, inviteCount: used.uses }
      : {};
  } catch (err) {
    console.warn(`[INVITE] Gagal fetch invites untuk ${member.guild.name}:`, err);
    return {};
  }
}