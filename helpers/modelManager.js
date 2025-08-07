import {
  getUserData,
  updateUserData
} from "./dataManager.js";

// 🌍 Default model global (fallback universal)
let currentModel = "gemini-2.0-flash-lite";

// ✅ Model valid yang didukung sistem
const validModels = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite"
];

// 🎨 Alias nama model untuk tampilan publik
const modelAliases = {
  "gemini-2.5-pro":        "Sarah Prime",
  "gemini-2.5-flash":      "Sarah Core",
  "gemini-2.5-flash-lite": "Sarah Core Lite",
  "gemini-2.0-flash":      "Legacy Flash",
  "gemini-2.0-flash-lite": "Legacy Lite"
};

// 🔍 Ambil model default global
export function getDefaultModel() {
  return currentModel;
}

// 🔄 Set model default (non-user)
export function setDefaultModel(modelName) {
  if (!isValidModel(modelName)) return false;
  currentModel = modelName;
  return true;
}

// ✅ Cek apakah model valid
export function isValidModel(modelName) {
  return validModels.includes(modelName);
}

// 📛 Ambil nama alias model
export function getModelAlias(modelName) {
  return modelAliases[modelName] ?? modelName;
}

// 📋 Format dropdown (untuk addChoices)
export function getAllModelAliases() {
  return validModels.map(model => ({
    value: model,
    name: getModelAlias(model)
  }));
}

// 👤 Ambil preferensi model milik user
export function getUserModel(userId) {
  const data = getUserData("sarahStats", userId);
  return isValidModel(data?.preferredModel) ? data.preferredModel : getDefaultModel();
}

// 🧠 Simpan preferensi model user ke sarahStats.json
export function setUserModel(userId, modelName) {
  if (!isValidModel(modelName)) return false;

  updateUserData("sarahStats", userId, current => ({
    ...current,
    preferredModel: modelName
  }));

  return true;
}