const MAX_LEVEL = 100;

// 📈 XP yang dibutuhkan untuk naik level berikutnya
export function getXPForNextLevel(level) {
  if (level >= MAX_LEVEL) return Infinity;
  return Math.ceil((level + 1) ** 2.2 * 15);
}

// 🧮 Total XP dari level 0 hingga level tertentu
export function getTotalXPForLevel(level) {
  let sum = 0;
  for (let i = 0; i < level; i++) {
    sum += getXPForNextLevel(i);
  }
  return sum;
}

// 📊 Hitung level berdasarkan total XP
export function getLevelFromTotalXP(xp) {
  let level = 0;
  let remainingXP = xp;

  while (remainingXP >= getXPForNextLevel(level)) {
    remainingXP -= getXPForNextLevel(level);
    level++;
    if (level >= MAX_LEVEL) return MAX_LEVEL;
  }

  return level;
}

// 📉 Hitung progress level dari total XP
export function getProgressFromTotalXP(xp) {
  const level = getLevelFromTotalXP(xp);
  const xpToCurrent = getTotalXPForLevel(level);
  const xpToNext = getXPForNextLevel(level);
  const progress = ((xp - xpToCurrent) / xpToNext) * 100;

  return Math.max(0, Math.min(100, Math.floor(progress)));
}

// 📍 Hitung progress berdasarkan XP dalam level saat ini
export function getProgressFromCurrentXP(xpInLevel, level) {
  const nextXP = getXPForNextLevel(level);
  const progress = (xpInLevel / nextXP) * 100;

  return Math.max(0, Math.min(100, Math.floor(progress)));
}

// 🔄 Sinkronisasi level berdasarkan XP pengguna
export function syncUserLevel(stats) {
  if (!stats || typeof stats.level !== "number" || typeof stats.xp !== "number") return;

  while (stats.xp >= getXPForNextLevel(stats.level)) {
    stats.xp -= getXPForNextLevel(stats.level);
    stats.level++;

    if (stats.level >= MAX_LEVEL) {
      stats.level = MAX_LEVEL;
      stats.xp = 0;
      break;
    }
  }
}

// 🏅 Badge keren sesuai level
export function getLevelBadge(level) {
  if (level === MAX_LEVEL) return "**⊰ Titan Chatting ⊱**";
  if (level >= 95) return "**⊰ Penguasa Server ⊱**";
  if (level >= 90) return "**⊰ Dewa Multitask ⊱**";
  if (level >= 85) return "**⊰ Legenda Tongkrongan ⊱**";
  if (level >= 80) return "**⊰ Arsitek Obrolan ⊱**";
  if (level >= 75) return "**⊰ Dukun Chat ⊱**";
  if (level >= 70) return "**⊰ Penjaga Malam ⊱**";
  if (level >= 65) return "**⊰ Sultan Sticker ⊱**";
  if (level >= 60) return "**⊰ Pahlawan Spam ⊱**";
  if (level >= 55) return "**⊰ Influencer Tongkrongan ⊱**";
  if (level >= 50) return "**⊰ Komandan Chat ⊱**";
  if (level >= 45) return "**⊰ Tukang Baper ⊱**";
  if (level >= 40) return "**⊰ Master Receh ⊱**";
  if (level >= 35) return "**⊰ Dewa Typing ⊱**";
  if (level >= 30) return "**⊰ Raja Reaksi ⊱**";
  if (level >= 25) return "**⊰ Pemersatu Timeline ⊱**";
  if (level >= 20) return "**⊰ Spammer Santuy ⊱**";
  if (level >= 15) return "**⊰ Penggibah Pemula ⊱**";
  if (level >= 10) return "**⊰ Tukang Nimbrung ⊱**";
  if (level >= 5)  return "**⊰ Tukang Nyimak ⊱**";

  return "";
}

// 🎭 Respon kenaikan level berdasarkan persona
const levelStyleBank = {
  ceria: [
    "🎉 Wihh mantap cuy!",
    "🚀 Naik lagii~ gila!",
    "🙌 Gasss terus!",
    "⚡️ Gila, kamu ngegas banget!",
    "🔥 Levelnya kebakar nih!"
  ],
  sarkastik: [
    "🙄 Yaelah baru naik.",
    "🫥 Naik? Baru juga login.",
    "😏 Hmmm... akhirnya.",
    "🫢 Serius nih naik?",
    "🫠 Kirain stuck."
  ],
  kalem: [
    "🌙 Pelan tapi tajam.",
    "🍃 Naik dalam sunyi.",
    "🧘 Diam-diam stabil.",
    "🕯️ Konsisten tuh indah.",
    "🌾 Langkah kecil, dampak besar."
  ],
  profesional: [
    "📊 Terpantau naik.",
    "🧠 Optimalisasi tercapai.",
    "📐 Presisi leveling.",
    "🔍 Kenaikan sesuai proyeksi.",
    "🧭 Stabil. Efisien. Naik."
  ],
  empatik: [
    "🤍 Kamu layak dapet ini.",
    "👏 Bangga banget liat kamu naik!",
    "🤗 Level baru, kamu makin solid!",
    "💞 Seneng liat perkembanganmu.",
    "🫶 Kamu terus berkembang!"
  ]
};

export function getLevelStyle(persona) {
  const styles = levelStyleBank[persona] || ["🌟 Naik cuy!"];
  return styles[Math.floor(Math.random() * styles.length)];
}