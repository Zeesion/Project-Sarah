import { getUserData, updateUserData } from "../helpers/dataManager.js";
import { EmbedBuilder } from "discord.js";

export default async function pendingOverride(client, message) {
  // 💡 Skip kalau pesan kosong (bisa terjadi di attachment-only messages)
  if (!message.content) return;

  const userId = message.author.id;

  // 📦 Ambil data pending override dari user storage
  const pending = getUserData("pending", userId);
  if (!pending || Date.now() >= pending.expiresAt) return;

  // ✅ Jalan hanya kalau kirim pesan di channel tempat command dijalankan
  if (pending.commandChannelId !== message.channel.id) return;

  // 🎯 Ambil channel target untuk override
  const targetChannel = client.channels.cache.get(pending.channelId);
  if (!targetChannel || !targetChannel.isTextBased()) return;

  // 🧼 Hapus pesan original supaya gak double muncul
  try {
    await message.delete();
  } catch (_) {} // Optional: log error jika perlu

  // 🎨 Warna embed fallback ke biru jika tidak ditentukan
  const finalColor = pending.color ?? 0x00bfff;

  // 📤 Kirim sebagai embed kalau di-set, atau plain text jika tidak
  if (pending.embed) {
    const embed = new EmbedBuilder()
      .setColor(finalColor)
      .setDescription(message.content)
      .setFooter({
        text: message.guild?.name || "Sarah",
        iconURL: message.guild?.iconURL?.() ?? undefined
      })
      .setTimestamp(new Date());

    await targetChannel.send({ embeds: [embed] });
  } else {
    await targetChannel.send(message.content);
  }

  // 🔄 Reset pending status agar tidak override lagi
  updateUserData("pending", userId, () => undefined);

  // 📛 Opsional flag buat handler lain agar skip eksekusi selanjutnya
  return { skipNext: true };
}