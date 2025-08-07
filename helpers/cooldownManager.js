const cooldowns = new Map();

export function checkCooldown(commandName, userId, delay = 5000) {
  const key = `${commandName}:${userId}`;
  const now = Date.now();
  const lastUsed = cooldowns.get(key) || 0;

  if (now - lastUsed < delay) {
    return false; // Masih cooldown
  }

  cooldowns.set(key, now);
  return true;
}