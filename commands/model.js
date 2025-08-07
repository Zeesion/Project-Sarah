import {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags
} from "discord.js";

import {
  getUserModel,
  setUserModel,
  getModelAlias,
  getAllModelAliases,
  getDefaultModel
} from "../helpers/modelManager.js";

import { checkCooldown } from "../helpers/cooldownManager.js";

const modelList = {
  "gemini-2.5-pro":        { rpm: 5,  tpm: 250_000, rpd: 100 },
  "gemini-2.5-flash":      { rpm: 10, tpm: 250_000, rpd: 250 },
  "gemini-2.5-flash-lite": { rpm: 15, tpm: 250_000, rpd: 1000 },
  "gemini-2.0-flash":      { rpm: 15, tpm: 1_000_000, rpd: 200 },
  "gemini-2.0-flash-lite": { rpm: 30, tpm: 1_000_000, rpd: 200 }
};

const command = {
  data: new SlashCommandBuilder()
    .setName("model")
    .setDescription("Kelola model Gemini Sarah")
    .addSubcommand(sub =>
      sub.setName("list")
        .setDescription("Tampilkan semua model Gemini")
    )
    .addSubcommand(sub =>
      sub.setName("info")
        .setDescription("Tampilkan model yang sedang dipakai")
    )
    .addSubcommand(sub =>
      sub.setName("set")
        .setDescription("Ganti model Gemini")
        .addStringOption(opt =>
          opt.setName("choice")
            .setDescription("Pilih model")
            .setRequired(true)
            .addChoices(...getAllModelAliases())
        )
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const delay = 5000;

    if (!checkCooldown("model", userId, delay)) {
      const readyAt = Math.floor((Date.now() + delay) / 1000);
      return interaction.reply({
        content: `⏳ Cooldown aktif! Coba lagi <t:${readyAt}:R>.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const sub = interaction.options.getSubcommand();

    // 📦 Tampilkan semua model
    if (sub === "list") {
      const embed = new EmbedBuilder()
        .setTitle("📦 Daftar Model Sarah")
        .setColor(0x3498db)
        .setDescription("Model tersedia di Sarah:")
        .addFields(
          Object.entries(modelList).map(([key, spec]) => ({
            name: `🧠 ${getModelAlias(key)}`,
            value: `🔹 \`RPM: ${spec.rpm}\`\n🔹 \`TPM: ${spec.tpm.toLocaleString()}\`\n🔹 \`RPD: ${spec.rpd}\``,
            inline: false
          }))
        );

      await interaction.reply({ embeds: [embed] });
      return;
    }

    // 🧠 Tampilkan model aktif
    if (sub === "info") {
      const current = getUserModel(userId);
      const spec = modelList[current] || {};
      const alias = getModelAlias(current);

      const embed = new EmbedBuilder()
        .setTitle("🧠 Model Aktif Sarah")
        .setColor(0x2ecc71)
        .setDescription(`Sarah sedang pakai model: \`${alias}\``)
        .addFields([
          { name: "RPM", value: `\`${spec.rpm ?? "-"}\``, inline: true },
          { name: "TPM", value: `\`${spec.tpm?.toLocaleString() ?? "-"}\``, inline: true },
          { name: "RPD", value: `\`${spec.rpd ?? "-"}\``, inline: true }
        ]);

      await interaction.reply({ embeds: [embed] });
      return;
    }

    // 🔄 Set model baru
    if (sub === "set") {
      const chosen = interaction.options.getString("choice");
      const current = getUserModel(userId);

      if (chosen === current) {
        await interaction.reply({
          content: `❓ Model \`${getModelAlias(chosen)}\` sudah aktif.`,
          flags: MessageFlags.Ephemeral
        });
        return;
      }

      const success = setUserModel(userId, chosen);

      if (!success) {
        await interaction.reply("🚫 Model tidak dikenali atau tidak bisa digunakan.");
        return;
      }

      await interaction.reply(`🔄 Model berhasil diubah ke: \`${getModelAlias(chosen)}\``);
    }
  }
};

export default command;