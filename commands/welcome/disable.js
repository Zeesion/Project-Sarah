import { SlashCommandSubcommandBuilder, MessageFlags } from "discord.js";
import { loadData, saveData } from "../../helpers/dataManager.js";

const configName = "welcomeConfig";

const typeLabels = {
  greeting: "greeting",
  log: "log"
};

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName("disable")
    .setDescription("Nonaktifkan greeting atau log welcome")
    .addStringOption(opt =>
      opt.setName("type")
        .setDescription("Tipe yang ingin dinonaktifkan")
        .setRequired(true)
        .addChoices(
          { name: "Greeting", value: "greeting" },
          { name: "Log", value: "log" }
        )
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const type = interaction.options.getString("type"); // "greeting" atau "log"
    const config = loadData(configName);

    if (!config[guildId]) {
      config[guildId] = { enabled: true };
    }

    const guildConfig = config[guildId];

    if (type === "greeting") {
      if (!guildConfig.greeting?.channelId) {
        return interaction.reply({
          content: `⚠️ Channel untuk greeting belum diatur.`,
          flags: MessageFlags.Ephemeral
        });
      }

      guildConfig.greeting.enabled = false;
    }

    if (type === "log") {
      if (!guildConfig.log?.channelId) {
        return interaction.reply({
          content: `⚠️ Channel untuk log belum diatur.`,
          flags: MessageFlags.Ephemeral
        });
      }

      guildConfig.log.enabled = false;
    }

    // Update flag global
    const hasGreeting = guildConfig.greeting?.enabled !== false;
    const hasLog = guildConfig.log?.enabled !== false;
    const typeLabel = typeLabels[type] ?? type;
    guildConfig.enabled = hasGreeting || hasLog;

    saveData(configName, config);

    await interaction.reply({
      content: `🚫 Fitur ${typeLabel} telah dinonaktifkan.`,
      flags: MessageFlags.Ephemeral
    });
  }
};