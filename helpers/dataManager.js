import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// 📁 Path generator
export function getFilePath(name) {
  return path.join(dataDir, `${name}.json`);
}

// 📥 Load data dari file
export function loadData(name) {
  const filePath = getFilePath(name);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// 📤 Simpan data ke file
export function saveData(name, data) {
  const filePath = getFilePath(name);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// 👤 Ambil data user
export function getUserData(name, userId) {
  const data = loadData(name);
  return data[userId] ?? null;
}

// 🔁 Update data user
export function updateUserData(name, userId, updaterFn) {
  const data = loadData(name);
  const current = data[userId] ?? {};
  const updated = updaterFn(current);

  if (updated === undefined) {
    delete data[userId];
  } else {
    data[userId] = updated;
  }

  saveData(name, data);
}

// 💬 Ambil data channel dari guild tertentu
export function getGuildChannelData(name, guildId, channelId) {
  const data = loadData(name);
  return data[guildId]?.[channelId] ?? null;
}

// 🔄 Update data channel per-guild
export function updateGuildChannelData(name, guildId, channelId, updaterFn) {
  const data = loadData(name);
  data[guildId] = data[guildId] || {};

  const current = data[guildId][channelId] ?? {};
  const updated = updaterFn(current);

  if (updated === undefined) {
    delete data[guildId][channelId];
  } else {
    data[guildId][channelId] = updated;
  }

  // ⏳ Baru setelah update, clean yang kosong
  if (data[guildId][channelId] && Object.keys(data[guildId][channelId]).length === 0) {
    delete data[guildId][channelId];
  }
  if (data[guildId] && Object.keys(data[guildId]).length === 0) {
    delete data[guildId];
  }

  saveData(name, data);
}