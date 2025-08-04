import { loadData, updateGuildChannelData, saveData } from "../helpers/dataManager.js";

// ✅ Aktifkan channel di guild tertentu
export function enableChannel(guildId, channelId) {
  updateGuildChannelData("chatChannels", guildId, channelId, (prev) => ({
    ...prev,
    active: true,
    lastActive: new Date().toISOString(),
  }));
}

// 🚫 Nonaktifkan channel di guild tertentu
export function disableChannel(guildId, channelId) {
  updateGuildChannelData("chatChannels", guildId, channelId, (prev) => ({
    ...prev,
    active: false,
  }));
}

// 🧹 Hapus channel sepenuhnya dari storage
export function deleteChannel(guildId, channelId) {
  const data = loadData("chatChannels");
  if (!data[guildId]) return;

  delete data[guildId][channelId];

  // Jika data guild kosong, hapus juga guild-nya
  if (Object.keys(data[guildId]).length === 0) {
    delete data[guildId];
  }

  saveData("chatChannels", data);
}

// 📡 Ambil semua channel yang aktif dari satu guild
export function getActiveChannels(guildId) {
  const data = loadData("chatChannels")[guildId] || {};
  return Object.entries(data)
    .filter(([, val]) => val.active)
    .map(([channelId]) => channelId);
}