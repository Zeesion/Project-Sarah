import { GoogleGenAI } from "@google/genai";
import {
  getGuildChannelData,
  updateGuildChannelData,
  getUserData,
  updateUserData
} from "../helpers/dataManager.js";
import { personaInstructions } from "../helpers/personaInstructions.js";
import { getCurrentModel } from "../helpers/modelManager.js";
import { handleGeminiError } from "./geminiError.js";
import { getActiveChannels } from "../helpers/chatChannelManager.js";
import {
  checkForgetStatus,
  getDisplayName,
  buildMessageObject,
  formatHistoryForModel,
  getSystemInstruction,
  sanitizeOutputFromModel
} from "../helpers/forgetHandler.js";

// 🔑 Inisialisasi Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Safereply
async function safeReply(message, content) {
  try {
    if (
      message?.id &&
      message?.channel?.id &&
      !message.deleted &&
      message.channel.type === 0
    ) {
      await message.channel.send({
        content,
        message_reference: {
          message_id: message.id,
          channel_id: message.channel.id
        }
      });
    } else {
      await message.channel.send({ content });
    }
  } catch (err) {
    console.warn("safeReply error:", err);
  }
}

export default async function sarahChat(client, message) {
  const userId    = message.author.id;
  const username  = message.author.username;
  const channelId = message.channel.id;
  const guildId   = message.guild?.id;
  if (!guildId) return;

  // 🚫 Filter channel nonaktif
  const activeChannelIds = getActiveChannels(guildId);
  if (!activeChannelIds.includes(channelId)) return;

  // 🎭 Persona & forget status
  const personaData = getUserData("persona", userId);
  const isForgotten = checkForgetStatus(userId);
  const displayName = getDisplayName(userId, username);
  const persona = isForgotten ? "Netral" : personaData?.persona || "Netral";

  // 📌 Auto-assign default persona kalau belum ada
  if (!personaData && !isForgotten) {
    updateUserData("persona", userId, () => ({ persona }));
  }

  // 🧠 Ambil histori dari channel
  const history = getGuildChannelData("chatHistory", guildId, channelId)?.messages ?? [];

  // 🆕 Tambahkan pesan baru ke histori
  const newMessage = buildMessageObject(userId, username, message.content);
  const updatedHistory = [...history, newMessage].slice(-100);

  updateGuildChannelData("chatHistory", guildId, channelId, () => ({
    messages: updatedHistory
  }));

  // 🔄 Format histori buat Gemini
  const formattedHistory = formatHistoryForModel(updatedHistory);

  await message.channel.sendTyping();

  // 📜 Instruksi sistem untuk Gemini
  const personaText = personaInstructions[persona] || personaInstructions["Netral"];
  const systemInstruction = getSystemInstruction(personaText, userId, username);

  let responseText = "";
  let isErrorResponse = false;

  // 🤖 Request ke Gemini model
  try {
    const currentModel = getCurrentModel();
    const response = await ai.models.generateContent({
      model: currentModel,
      contents: formattedHistory,
      config: { systemInstruction }
    });

    responseText = response?.text?.trim();
  } catch (err) {
    const errorCode = err?.error?.status || err?.status || "UNKNOWN";
    const errorMessage = err?.error?.message || err?.message || err?.toString();
    const errorDetails = err?.error?.details || [];

    const { userMessage, logMessage } = handleGeminiError(errorCode, errorMessage, errorDetails);
    console.warn(logMessage);
    responseText = userMessage;
    isErrorResponse = true;

    updatedHistory.push({
      userId: "Sarah",
      username: "Sarah",
      anonymized: false,
      message: responseText,
      timestamp: Date.now()
    });

    updateGuildChannelData("chatHistory", guildId, channelId, () => ({
      messages: updatedHistory
    }));
  }

  if (!responseText) return;

  // 🧹 Bersihkan dan sanitasi output dari Gemini
  const cleanText = sanitizeOutputFromModel(responseText, userId, { isError: isErrorResponse });

  // 📝 Push response ke histori kalau bukan error
  if (!isErrorResponse) {
    updatedHistory.push({
      userId: "Sarah",
      username: "Sarah",
      anonymized: false,
      message: cleanText,
      timestamp: Date.now()
    });

    updateGuildChannelData("chatHistory", guildId, channelId, () => ({
      messages: updatedHistory
    }));
  }

  // 📦 Kirim reply ke channel, split kalau panjang
  const chunks = cleanText.match(/(.|[\r\n]){1,2000}/g);
  for (let i = 0; i < chunks.length; i++) {
    i === 0
      ? await safeReply(message, chunks[i])
      : await message.channel.send(chunks[i]);
  }
}