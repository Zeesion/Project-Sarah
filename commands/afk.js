import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { updateUserData } from "../helpers/dataManager.js";
import { checkCooldown } from "../helpers/cooldownManager.js";


export default {
  data: new SlashCommandBuilder()
    .setName("afk")
    .setDescription("Tandai dirimu sedang AFK")
    .addStringOption((option) =>
      option
        .setName("alasan")
        .setDescription("Alasan kamu AFK")
        .setRequired(false)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const delay = 5000; // 5 detik
    if (!checkCooldown("afk", userId, delay)) {
      const readyAt = Math.floor((Date.now() + delay) / 1000);
      return interaction.reply({
        content: `⏳ Cooldown aktif! Coba lagi <t:${readyAt}:R>.`,
        flags: MessageFlags.Ephemeral,
      });
    }
    const username = interaction.member?.displayName || interaction.user.username;
    const reason = interaction.options.getString("alasan") || null;

    updateUserData("afk", userId, () => ({
      username,
      reason,
      since: Date.now()
    }));

    const afkMessages = reason
      ? [
          `Yahh, ${username} lagi AFK nih. Katanya "${reason}". Cepat balik ya 🤙`,
          `Info penting 🚨: ${username} off dulu. Alasannya? "${reason}". Jangan dicariin yaa~`,
          `Pssst... ${username} lagi cabut dulu. Lagi "${reason}". Sabarin aja~`,
          `${username} nyempil dulu bentar karena "${reason}". Biarin dia rehat dulu 🤫`,
          `${username} pamit sebentar, katanya "${reason}". Good luck! 💪`
        ]
      : [
          `Oke gengs, ${username} lagi AFK dulu. Kasih ruang buat dia healing 😌`,
          `${username} off dulu yaa~ nanti juga balik lagi dengan vibes baru ✨`,
          `Woy, ${username} lagi ngilang bentar. Jangan di-mention dulu 😅`,
          `Update status: ${username} AFK. Mungkin lagi ngecharge sosial energi 🔋`,
          `Heads-up! ${username} ambil jeda dulu. Biarkan ia bernafas 🫠`
        ];

    const randomAFK = afkMessages[Math.floor(Math.random() * afkMessages.length)];
    await interaction.reply(randomAFK);
  }
};