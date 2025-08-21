import { SlashCommandSubcommandBuilder, MessageFlags } from "discord.js";
import { loadData, saveData } from "../../helpers/dataManager.js";

const configName = "welcomeConfig";

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName("disable")
    .setDescription("Nonaktifkan welcome"),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const config = loadData(configName);

    if (!config[guildId]) {
      config[guildId] = {};
    }

    // 🔒 Guard: kalau sudah nonaktif, jangan disable lagi
    if (config[guildId].enabled === false) {
      await interaction.reply({
        content: "⚠️ Welcome channel belum di-set.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    config[guildId].enabled = false;
    saveData(configName, config);

    await interaction.reply({
      content: "🚫 Fitur welcome telah dinonaktifkan.",
      flags: MessageFlags.Ephemeral
    });
  }
};