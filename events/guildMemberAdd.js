import { loadData } from "../helpers/dataManager.js";
import { buildWelcomeEmbed } from "../helpers/welcomeEmbedBuilder.js";
import { resolvePlaceholders } from "../helpers/placeholderUtils.js";

const configName = "welcomeConfig";

export default async function (client, member) {
  if (!member || !member.guild || !member.user) return;
  if (member.user.bot) return;

  const guildId = member.guild.id;
  const config = loadData(configName)[guildId];
  if (!config || !config.enabled || !config.channelId || !config.embed) return;

  const channel = member.guild.channels.cache.get(config.channelId);
  if (!channel || !channel.isTextBased()) return;

  // 🧠 Ambil data siapa yang invite (opsional)
  const inviteData = await getInviteData(member); // kamu bisa ganti dengan sistemmu sendiri

  const resolvedContent = resolvePlaceholders({ content: config.content }, member, inviteData).content;
  const resolvedEmbedConfig = resolvePlaceholders(config.embed, member, inviteData);
  const embed = buildWelcomeEmbed(member, resolvedEmbedConfig);

  try {
    await channel.send({
      content: resolvedContent || "",
      embeds: [embed]
    });
  } catch (err) {
    console.error(`[WELCOME] Gagal dikirim ke ${member.user.tag}:`, err);
  }
}

// 🔧 Contoh fungsi tracking invite (bisa kamu ganti)
async function getInviteData(member) {
  try {
    const invites = await member.guild.invites.fetch();
    const used = invites.find(inv => inv.uses > 0 && inv.inviter);
    return used
      ? { inviter: used.inviter, inviteCount: used.uses }
      : {};
  } catch {
    return {};
  }
}