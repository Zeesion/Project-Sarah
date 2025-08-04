import { getUserData, updateUserData } from "../helpers/dataManager.js";

export default async function afkRecovery(client, message) {
  const userId = message.author.id;
  const username = message.author.username;

  // Ambil data AFK user dari storage
  const afkInfo = getUserData("afk", userId);
  if (!afkInfo) return; // Skip kalau tidak sedang AFK

  // Persiapkan mention dan validasi apakah ada reason & pemanggil
  const triggerMention = afkInfo.trigger ? `<@${afkInfo.trigger}>` : null;
  const hasTrigger = !!triggerMention;
  const hasReason = !!afkInfo.reason;

  // 💬 Pilihan response jika ada trigger + alasan
  const withTriggerAndReason = [
    `🎯 ${triggerMention} berhasil panggil ${username} dari AFK! Urusan "${afkInfo.reason}" kelar.`,
    `📡 ${username} connect lagi setelah AFK karena "${afkInfo.reason}". Good call, ${triggerMention}!`,
    `🌈 ${username} udah balik! AFK gara-gara "${afkInfo.reason}". Thanks udah manggil, ${triggerMention}.`,
    `🫶 "${afkInfo.reason}" selesai. ${username} join lagi, manggilnya on point banget ${triggerMention}!`,
    `🚪 ${username} kembali dari AFK ("${afkInfo.reason}"). ${triggerMention}, timing panggilnya mantap!`
  ];

  // 💬 Response kalau cuma ada trigger (tanpa reason)
  const withTriggerOnly = [
    `📶 ${username} balik! Makasih buat notifikasinya tadi, ${triggerMention}.`,
    `✨ ${username} muncul lagi. ${triggerMention} pingnya on point.`,
    `🧭 ${username} reconnect. No reason given, tapi ${triggerMention} tetap responsif 😄`,
    `🎈 ${username} udah online lagi. ${triggerMention} sempat panggil, dan timingnya pas.`,
    `📲 ${triggerMention} panggil ${username} saat AFK, dan sekarang dia udah balik.`
  ];

  // 💬 Response kalau cuma ada reason (tanpa trigger)
  const withReasonOnly = [
    `🛎️ ${username} balik setelah AFK gara-gara "${afkInfo.reason}".`,
    `🎒 "${afkInfo.reason}" beres, dan sekarang ${username} aktif lagi.`,
    `🏁 AFK kelar: "${afkInfo.reason}". ${username} udah muncul.`,
    `📬 ${username} reconnect. Tadi sempat AFK karena "${afkInfo.reason}".`,
    `📓 ${username} selesaiin "${afkInfo.reason}", sekarang udah nongol lagi.`
  ];

  // 💬 Response default (tanpa trigger maupun reason)
  const pureReturn = [
    `🎮 ${username} connect lagi, AFK selesai.`,
    `⚡ ${username} aktif lagi. Deteksi AFK beres.`,
    `🎲 ${username} balik ke mode online.`,
    `🕹️ ${username} muncul! Udah balik dari AFK, walau tanpa alasan jelas.`
  ];

  // Tentukan response style berdasarkan trigger & reason
  const responseMap = {
    "11": withTriggerAndReason,
    "10": withTriggerOnly,
    "01": withReasonOnly,
    "00": pureReturn
  };

  const logicKey = `${hasTrigger ? 1 : 0}${hasReason ? 1 : 0}`;
  const selected = responseMap[logicKey];
  const messageText = selected[Math.floor(Math.random() * selected.length)];

  // Kirim response dan hapus status AFK
  await message.channel.send(`${messageText}`);
  updateUserData("afk", userId, () => undefined);
}