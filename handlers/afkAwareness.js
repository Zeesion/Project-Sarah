import {
  getUserData,
  loadData,
  getGuildChannelData,
  updateGuildChannelData
} from "../helpers/dataManager.js";

// ⛅ Cek status AFK
function checkAfkStatus(userId) {
  const afkInfo = getUserData("afk", userId);
  if (!afkInfo) return null;

  const now = Date.now();
  const since = afkInfo.since ?? now;
  const reason = afkInfo.reason ?? null;
  const trigger = afkInfo.trigger ?? null;
  const duration = now - since;

  return {
    isAfk: true,
    reason,
    trigger,
    since,
    duration,
    recoveredAt: now
  };
}

// ⏳ Format durasi
function formatAfkDuration(ms) {
  const sec = Math.floor(ms / 1000) % 60;
  const min = Math.floor(ms / (1000 * 60)) % 60;
  const hrs = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  return [days && `${days} hari`, hrs && `${hrs} jam`, min && `${min} menit`, `${sec} detik`]
    .filter(Boolean)
    .join(" ");
}

// 💬 Bikin catatan AFK
function generateAfkNote(username, afkLog) {
  if (!afkLog) return null;
  const durationText = formatAfkDuration(afkLog.duration);
  return `${username} baru muncul setelah ${durationText}${afkLog.reason ? ` karena ${afkLog.reason}` : ""}.`;
}

// 🎯 Handler awareness AFK
export default async function afkAwareness(client, message) {
  const userId = message?.author?.id;
  const username = message?.author?.username;
  const channelId = message?.channel?.id;
  const guildId = message?.guild?.id;

  if (!userId || !channelId || !guildId) return;

  const afkInfo = checkAfkStatus(userId);
  if (!afkInfo) return;

  const afkNote = generateAfkNote(username, afkInfo);
  if (!afkNote) return;

  const activeChannels = loadData("chatChannels")[guildId] || {};

  for (const [injectChannelId, config] of Object.entries(activeChannels)) {
    if (!config?.active) continue;

    const history = getGuildChannelData("chatHistory", guildId, injectChannelId)?.messages ?? [];

    const updated = [...history, {
      userId: "Sarah",
      username: "Sarah",
      anonymized: false,
      message: afkNote,
      timestamp: Date.now(),
      metadata: {
        fromAfkRecovery: true,
        forUserId: userId,
        duration: afkInfo.duration
      }
    }].slice(-100);

    updateGuildChannelData("chatHistory", guildId, injectChannelId, () => ({
      messages: updated
    }));
  }
}