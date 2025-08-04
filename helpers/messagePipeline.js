import pendingOverride from "../handlers/pendingOverride.js";
import afkAwareness from "../handlers/afkAwareness.js";
import afkRecovery from "../handlers/afkRecovery.js";
import afkMentions from "../handlers/afkMentions.js";
import xp from "../handlers/xp.js";
import sarahChat from "../handlers/sarahChat.js";

// 🧩 Daftar handler yang diproses secara berurutan
const handlers = [
  pendingOverride,
  afkAwareness,
  afkRecovery,
  afkMentions,
  xp,
  sarahChat
];

// 🔄 Pipeline utama untuk menangani pesan
export async function handleMessage(client, message) {
  for (const handler of handlers) {
    try {
      const result = await handler(client, message);
      if (result?.skipNext) break;
    } catch (e) {
      console.error(`💥 Error in handler ${handler.name || "unknown"}:`, e);
    }
  }
}