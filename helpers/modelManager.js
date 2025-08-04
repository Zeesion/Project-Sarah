// 🧠 State lokal untuk model AI yang sedang digunakan
let currentModel = "gemini-2.5-flash";

// 📍 Ambil nama model yang aktif saat ini
export function getCurrentModel() {
  return currentModel;
}

// 🔄 Ganti model jika valid
export function setModel(modelName) {
  const validModels = [
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite"
  ];

  if (!validModels.includes(modelName)) return false;

  currentModel = modelName;
  return true;
}