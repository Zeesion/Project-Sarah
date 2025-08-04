import { getUserData, updateUserData } from "../helpers/dataManager.js";
import {
  getLevelFromTotalXP,
  getLevelBadge,
  getLevelStyle,
  getTotalXPForLevel
} from "../helpers/levelUtils.js";
import { getActiveChannels } from "../helpers/chatChannelManager.js";

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
  function getRandomPercentBooster(min, max) {
    return min + Math.random() * (max - min);
  }

  const boosterRate = getRandomPercentBooster(
    isBoosterChannel ? 0.5 : 0.0,
    isBoosterChannel ? 1.0 : 0.1
  );

  // 🚀 Hitung XP
  const baseXP   = 5;
  const bonusXP  = Math.floor(baseXP * boosterRate);
  const totalXP  = baseXP + bonusXP;

  // 📦 Update XP & kirim notif kalau naik level
  updateUserData("userStats", userId, prev => {
    const oldXP    = prev?.xp || 0;
    const newXP    = oldXP + totalXP;
    const oldLevel = getLevelFromTotalXP(oldXP);
    const newLevel = getLevelFromTotalXP(newXP);
    const leveledUp = newLevel > oldLevel;

    const XPToNextLevel = getTotalXPForLevel(newLevel + 1);
    const progressPercent = ((newXP / XPToNextLevel) * 100).toFixed(2);

    if (leveledUp) {
      const badge = getLevelBadge(newLevel);
      const style = getLevelStyle("Netral").trim(); // default style kalau persona dihapus
      const messageLine = `${style} <@${userId}> naik ke level ${newLevel}! ${badge}`;
      message.channel.send(messageLine);
    }

    return {
      ...prev,
      username,
      guildId,
      level: newLevel,
      xp: newXP,
      nextxp: XPToNextLevel,
      progress: progressPercent,
      messages: (prev?.messages || 0) + 1,
      lastActive: Date.now()
    };
  });
}