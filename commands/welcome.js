import { MessageFlags, SlashCommandBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES module fix untuk __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path ke folder subcommand
const subcommandsPath = path.join(__dirname, "welcome");
const subcommandFiles = fs.readdirSync(subcommandsPath).filter(file => file.endsWith(".js"));

// Buat command utama /welcome
const command = new SlashCommandBuilder()
  .setName("welcome")
  .setDescription("Kelola welcome member baru");

// Map untuk handler subcommand
const subcommands = new Map();

// Import dan gabungkan semua subcommand
for (const file of subcommandFiles) {
  const sub = await import(`./welcome/${file}`);
  command.addSubcommand(sub.default.data);
  subcommands.set(sub.default.data.name, sub.default.execute);
}

export default {
  data: command,
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "❌ Command ini hanya bisa digunakan di server.",
        flags: MessageFlags.Ephemeral
      });
    }
    // ✅ Validasi permission admin
    if (!interaction.member.permissions.has("Administrator")) {
      await interaction.reply({
        content: "🚫 Kamu tidak punya izin untuk command ini.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // 🔍 Ambil subcommand dan handler-nya
    const subName = interaction.options.getSubcommand();
    const handler = subcommands.get(subName);

    if (!handler) {
      await interaction.reply({
        content: `❌ Subcommand \`${subName}\` tidak ditemukan.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // 🚀 Eksekusi subcommand
    try {
      await handler(interaction);
    } catch (err) {
      console.error(`❌ Error di subcommand /welcome ${subName}:`, err);
      await interaction.reply({
        content: "⚠️ Terjadi error saat menjalankan command.",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
};