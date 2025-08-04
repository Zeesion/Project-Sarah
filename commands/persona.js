import {
  SlashCommandBuilder,
  MessageFlags
} from "discord.js";

import {
  getUserData,
  updateUserData
} from "../helpers/dataManager.js";

// 🎭 Deskripsi gaya bicara Sarah
const personas = {
  ceria:       "Ramah, penuh semangat, suka emoji ✨",
  sarkastik:   "Nyentil, pedas, tapi tetap lucu 😏",
  kalem:       "Tenang, lembut, cocok buat malam 🌙",
  profesional: "Sopan, to the point, tanpa ekspresi 🙇‍♀️",
  empatik:     "Penuh pengertian, cocok untuk curhat 💞"
};

// 🗣️ Contoh gaya bicara per persona
const previews = {
  ceria:       "Hai haii! Semangat banget hari ini yaa ✨",
  sarkastik:   "Oh tentu, kamu pasti paling bener deh 😏",
  kalem:       "Selamat malam. Semoga harimu tenang 🌙",
  profesional: "Salam. Semoga Anda dalam keadaan baik.",
  empatik:     "Aku di sini kalau kamu butuh teman 💞"
};

export default {
  data: new SlashCommandBuilder()
    .setName("persona")
    .setDescription("Atur atau lihat gaya bicara Sarah")
    .addSubcommand(sub =>
      sub.setName("set")
        .setDescription("Setel gaya bicara Sarah")
        .addStringOption(opt =>
          opt.setName("gaya")
            .setDescription("Pilih gaya bicara")
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName("preview")
        .setDescription("Lihat contoh gaya bicara Sarah")
        .addStringOption(opt =>
          opt.setName("gaya")
            .setDescription("Gaya yang ingin dilihat contoh nya")
            .setRequired(true)
            .setAutocomplete(true)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const gaya = interaction.options.getString("gaya");

    // 🧪 Preview gaya bicara
    if (sub === "preview") {
      if (!previews[gaya]) {
        return interaction.reply({
          content: `❌ Gaya "${gaya}" tidak tersedia.`,
          flags: MessageFlags.Ephemeral
        });
      }

      return interaction.reply({
        content: `🎭 Contoh gaya **${gaya}**:\n> ${previews[gaya]}\n\n📝 Deskripsi: ${personas[gaya]}`,
        flags: MessageFlags.Ephemeral
      });
    }

    // 🔧 Setel gaya bicara
    if (sub === "set") {
      if (!personas[gaya]) {
        return interaction.reply({
          content: `❌ Gaya "${gaya}" tidak tersedia.`,
          flags: MessageFlags.Ephemeral
        });
      }

      const current = getUserData("persona", interaction.user.id)?.persona;
      if (current === gaya) {
        return interaction.reply({
          content: `ℹ️ Sarah sudah menggunakan gaya bicara **${gaya}**.`,
          flags: MessageFlags.Ephemeral
        });
      }

      updateUserData("persona", interaction.user.id, prev => ({
        ...prev,
        persona: gaya
      }));

      return interaction.reply({
        content: `✅ Gaya bicara Sarah disetel menjadi **${gaya}**.\n📝 ${personas[gaya]}`,
        flags: MessageFlags.Ephemeral
      });
    }
  },

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused();

    const matched = Object.keys(personas)
      .filter(p => p.toLowerCase().includes(focused.toLowerCase()))
      .map(p => ({ name: p, value: p }));

    await interaction.respond(matched.slice(0, 25));
  }
};