import { getUserData, updateUserData } from "./dataManager.js";

// 🚫 Mengecek apakah user sudah invoke forgetme
export function checkForgetStatus(userId) {
  const forgetData = getUserData("forgetme", userId);
  return Boolean(forgetData?.isForgotten);
}

// 🎭 Menentukan nama yang ditampilkan (anonim atau asli)
export function getDisplayName(userId, fallbackUsername) {
  const isForgotten = checkForgetStatus(userId);
  return isForgotten ? `Pengguna_${userId.slice(0, 6)}` : fallbackUsername;
}

// 📦 Bangun objek pesan baru dengan anonimisasi jika perlu
export function buildMessageObject(userId, username, messageText) {
  const isForgotten = checkForgetStatus(userId);
  return {
    userId,
    username: getDisplayName(userId, username),
    anonymized: isForgotten,
    message: messageText,
    timestamp: Date.now()
  };
}

// 🔄 Format histori buat dikirim ke Gemini
export function formatHistoryForModel(historyArray) {
  return historyArray.map(entry => ({
    role: entry.userId === "Sarah" ? "model" : "user",
    parts: [
      {
        text:
          entry.userId === "Sarah"
            ? entry.message
            : `${entry.username}: ${entry.message}`
      }
    ]
  }));
}

// 📜 Bangun instruksi sistem berdasarkan persona + mode forget
export function getSystemInstruction(personaText, userId, username) {
  const isForgotten = checkForgetStatus(userId);
  const safeUsername = getDisplayName(userId, username);
  const overrideIntro = isForgotten
    ? `Catatan: Jangan gunakan nama asli atau info pribadi pengguna.`
    : ``;

  return `${overrideIntro}\nNama pengguna: ${safeUsername}\n\n${personaText}`;
}

// 🧹 Membersihkan output Gemini dari slip identitas (opsional auto patch)
export function sanitizeOutputFromModel(text, userId, { isError = false } = {}) {
  const isForgotten = checkForgetStatus(userId);
  if (!isForgotten || isError) return text;

  // 🚨 Regex hapus slip nama/ID yang tidak seharusnya muncul
  const patched = text
    .replace(new RegExp(userId, "g"), "Pengguna")
    .replace(/(@?\b\w{3,32}\b)/g, match =>
      match.toLowerCase().includes("pengguna") ? match : "Pengguna");

  // ✂️ Potong tanda kutip atau sapaan yang terlalu spesifik
  return patched.replace(/(["“”'])?Pengguna(["“”'])?/g, "Pengguna");
}

// 👤 Ambil pesan terakhir dari user (bukan Sarah)
export function getLastUserMessage(historyArray) {
  return historyArray.slice().reverse().find(entry => entry.userId !== "Sarah");
}