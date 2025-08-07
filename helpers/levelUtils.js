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

// 🏅 Cek apakah level termasuk level badge
export function isBadgeLevel(level) {
  const badgeLevels = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  return badgeLevels.includes(level);
}
