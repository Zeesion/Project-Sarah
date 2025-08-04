import { getUserData, updateUserData } from "../helpers/dataManager.js";

// 🕒 Konversi durasi AFK ke bentuk yang manusiawi
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours   = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const days    = Math.floor(ms / (1000 * 60 * 60 * 24));

  return [
    days    && `${days} hari`,
    hours   && `${hours} jam`,
    minutes && `${minutes} menit`,
    `${seconds} detik`
  ].filter(Boolean).join(" ");
}

export default async function afkMentions(client, message) {
  const afkTargets = new Set();

  // 🎯 Cek mention user
  for (const mention of message.mentions.users.values()) {
    afkTargets.add(mention.id);
  }

  // 🎯 Cek reply message target
  if (message.reference?.messageId) {
    try {
      const repliedMsg = await message.channel.messages.fetch(message.reference.messageId);
      if (repliedMsg?.author?.id) afkTargets.add(repliedMsg.author.id);
    } catch (err) {
      console.warn("❗ Gagal ambil reply:", err);
    }
  }

  // 💬 Generate pesan AFK
  function renderAfkMessage(afk) {
    const duration   = formatDuration(Date.now() - afk.since);
    const hasReason  = !!afk.reason;
    const reasonText = hasReason ? `${afk.reason}` : "";

    const messages = hasReason
      ? [
          `🔕 ${afk.username} lagi AFK nih, katanya: ${reasonText}. Udah ${duration} gak kelihatan.`,
          `🕒 ${afk.username} off dulu. Reason: ${reasonText}. ${duration} berlalu begitu aja.`,
          `📭 ${afk.username} gak bisa nimbrung sekarang, katanya: ${reasonText}. ${duration} gak aktif.`,
          `✋ ${afk.username} rehat dulu karena ${reasonText}. Udah ${duration}, semoga urusannya lancar.`,
          `📌 ${afk.username} lagi AFK, alasannya: ${reasonText}. ${duration} gak nongol.`
        ]
      : [
          `🔕 ${afk.username} lagi AFK, tapi gak bilang kenapa. ${duration} gak kelihatan.`,
          `⏳ ${afk.username} ambil jeda. ${duration} gak aktif.`,
          `🚪 ${afk.username} belum muncul lagi. Udah ${duration} gak ada kabar.`,
          `📴 ${afk.username} off cukup lama. ${duration} udah lewat.`,
          `🕶️ ${afk.username} AFK tanpa info. ${duration} gak kelihatan.`
        ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  // 📢 Kirim pesan ke user yang disebut dan sedang AFK
  for (const targetId of afkTargets) {
    const afk = getUserData("afk", targetId);
    if (afk) {
      const messageText = renderAfkMessage(afk);
      await message.reply(messageText);

      updateUserData("afk", targetId, current => ({
        ...current,
        trigger: message.author.id
      }));
    }
  }
}