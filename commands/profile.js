import { SlashCommandBuilder } from "discord.js";
import { getUserData } from "../helpers/dataManager.js";
import { getLevelBadge } from "../helpers/levelUtils.js";

// 📊 Render bar XP visual
function renderXPBar(progress) {
  const totalBlocks = 11;
  const filledBlocks = Math.round(progress / 11);
  return "▰".repeat(filledBlocks) + "▱".repeat(totalBlocks - filledBlocks);
}

// 🔠 Kapitalisasi awal kata
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Lihat profil kamu di Sarah"),

  async execute(interaction) {
    const userId   = interaction.user.id;
    const username = interaction.member?.displayName || interaction.user.username;
    const stats    = getUserData("userStats", userId) || {};

    stats.level     = stats.level     || 0;
    stats.xp        = stats.xp        || 0;
    stats.nextXP    = stats.nextxp    || 0;
    stats.progress  = stats.progress  || 0;
    stats.messages  = stats.messages  || 0;

    const lastSeen = stats.lastActive
    ? `<t:${Math.floor(stats.lastActive / 1000)}:R>`
    : "Belum ada aktivitas";
    const persona = getUserData("persona", userId)?.persona || "Netral";
    const badge   = stats.level > 0 ? getLevelBadge(stats.level) : null;
    const statsLines = [
      `\u2063\u2000↳ Persona: ${capitalize(persona)}`,
      `\u2002↳ Terakhir Aktif: ${lastSeen}`
    ];

    if (badge) statsLines.splice(1, 0, `\u2002↳ Badge: ${badge}`);

    const embed = {
      color: 0x00bfff,
      author: {
        name: username,
        iconURL: interaction.user.displayAvatarURL()
      },
      fields: [
        {
          name: `**📌 Statistik**`,
          value: statsLines.join("\n"),
          inline: false
        },
        {
          name: `**📜 Aktivitas**`,
          value: [
            `\u2063\u2000↳ Pesan: ${stats.messages}`,
            `\u2002↳ Level: ${stats.level}`,
            `\u2002↳ Exp: [${stats.xp}/${stats.nextXP}]`,
            `\`${renderXPBar(stats.progress)} ${stats.progress}%\``
          ].join("\n"),
          inline: false
        },
      ],
      footer: {
        text: interaction.guild?.name || "Sarah"
      },
      timestamp: new Date()
    };

    await interaction.reply({ embeds: [embed] });
  }
};