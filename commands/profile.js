import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { getUserData } from "../helpers/dataManager.js";
import { getLevelBadge, getBadgeImageURL } from "../helpers/levelUpHandler.js";
import { checkCooldown } from "../helpers/cooldownManager.js";

// 🔠 Kapitalisasi awal kata
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// 🌀 XP Bar
function renderXpBar(progress) {
  const filled = Math.round((progress / 100) * 9);
  return `${"▰".repeat(filled)}${"▱".repeat(9 - filled)} ${progress}%`;
}

// 📋 Layout Grid Clean (monospace block)
function formatProfileGrid({ stats, gaya, badge }) {
  const pad = (label, value) => `\`${label.padEnd(8)}:\` ${value}`;
  const lines = [];

  if (badge?.title) {
    lines.push(pad("▸ Badge", badge.title));
  }

  if (gaya.toLowerCase() !== "netral") {
    lines.push(pad("▸ Gaya", capitalize(gaya)));
  }

  lines.push(
    pad("▸ Level", stats.level),
    pad("▸ Pesan", stats.messages)
  );

  return lines.join("\n");
}

export default {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Lihat profil kamu atau orang lain di Sarah")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("User yang ingin kamu lihat profilnya")
        .setRequired(false)
    ),

  async execute(interaction) {
    const delay = 5000;
    const invokerId = interaction.user.id;

    if (!checkCooldown("profile", invokerId, delay)) {
      const readyAt = Math.floor((Date.now() + delay) / 1000);
      return interaction.reply({
        content: `⏳ Cooldown aktif! Coba lagi <t:${readyAt}:R>.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    // 🔍 Ambil target user (default ke diri sendiri)
    const targetUser = interaction.options.getUser("user") || interaction.user;
    const targetMember = interaction.guild?.members.cache.get(targetUser.id);
    const username = targetMember?.displayName || targetUser.username;
    const avatarURL = targetUser.displayAvatarURL();

    const stats = getUserData("userStats", targetUser.id) || {};
    stats.level     = stats.level     || 0;
    stats.xp        = stats.xp        || 0;
    stats.nextXP    = stats.nextxp    || 0;
    stats.progress  = stats.progress  || 0;
    stats.messages  = stats.messages  || 0;

    const gaya = getUserData("sarahStats", targetUser.id)?.persona || "Netral";
    const badge = stats.level > 0 ? getLevelBadge(stats.level, interaction.client) : null;
    const badgeImageURL = stats.level > 0 ? getBadgeImageURL(stats.level) : null;

    // 🔧 Buat embed dinamis
    const createEmbed = () => ({
      color: 0x2f3136,
      author: {
        name: username,
        iconURL: avatarURL
      },
      thumbnail: badgeImageURL ? { url: badgeImageURL } : undefined,
      description: formatProfileGrid({ stats, gaya, badge }),
      footer: {
        text: `${renderXpBar(stats.progress)}`
      },
      timestamp: new Date()
    });

    await interaction.reply({ embeds: [createEmbed()] });
  }
}