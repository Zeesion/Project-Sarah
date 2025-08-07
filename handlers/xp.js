import { getUserData, updateUserData } from "../helpers/dataManager.js";
import {
  getLevelFromTotalXP,
  getTotalXPForLevel
} from "../helpers/levelUtils.js";
import { getActiveChannels } from "../helpers/chatChannelManager.js";
import { getLevelStyle, createLevelUpEmbed } from "../helpers/levelUpHandler.js";
import { isBadgeLevel } from "../helpers/levelUtils.js";

// 📈 Fungsi utama XP handler
export default async function xp(client, message) {
  const userId    = message.author.id;
  const username  = message.author.username;
  const channelId = message.channel.id;
  const guildId   = message.guild?.id;
  if (!guildId) return;

  // 💡 Booster logic: apakah channel aktif?
  const isBoosterChannel = getActiveChannels(guildId).includes(channelId);

  // 🎲 Booster XP: 50–100% untuk booster, 0–10% untuk biasa
  const boosterRate = 0.5 + Math.random() * (isBoosterChannel ? 0.5 : 0.1);

  // 🚀 Hitung XP
  const baseXP   = 5;
  const bonusXP  = Math.floor(baseXP * boosterRate);
  const totalXP  = baseXP + bonusXP;

  // 🔍 Ambil data user untuk persona
  const personaData = await getUserData("sarahStats", userId);
  const persona = personaData?.persona || "Netral";

  // 📦 Update XP & kirim notif kalau naik level
  updateUserData("userStats", userId, prev => {
    const oldXP    = prev?.xp || 0;
    const newXP    = oldXP + totalXP;
    const oldLevel = getLevelFromTotalXP(oldXP);
    const newLevel = getLevelFromTotalXP(newXP);
    const leveledUp = newLevel > oldLevel;

    const currentLevelXP = getTotalXPForLevel(newLevel);
    const nextLevelXP = getTotalXPForLevel(newLevel + 1);
    const progressPercent = (((newXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100).toFixed(2);

    if (leveledUp) {
      if (isBadgeLevel(newLevel)) {
        const embed = createLevelUpEmbed(message.author, newLevel, client);
        message.channel.send({ embeds: [embed] });
      } else {
        const style = getLevelStyle(persona).trim();
        const messageLine = `${style} <@${userId}> naik ke level ${newLevel}!`;
        message.channel.send(messageLine);
      }
    }

    return {
      ...prev,
      username,
      guildId,
      level: newLevel,
      xp: newXP,
      nextxp: nextLevelXP,
      progress: progressPercent,
      messages: (prev?.messages || 0) + 1,
      lastActive: Date.now()
    };
  });
}