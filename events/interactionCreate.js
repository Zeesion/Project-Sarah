import { MessageFlags } from "discord.js";

import leaderboardCommand from "../commands/leaderboard.js";
import helpCommand from "../commands/help.js";

export default async (client, interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error("❌ Error:", err);
      await interaction.reply({
        content: "❌ Error terjadi.",
        flags: MessageFlags.Ephemeral
      });
    }
  }

  if (interaction.isAutocomplete()) {
    if (!interaction.inGuild()) {
      return; // 🚫 Skip autocomplete di DM biar gak log error
    }
    const command = client.commands.get(interaction.commandName);
    if (command?.autocomplete) {
      try {
        await command.autocomplete(interaction);
      } catch (err) {
        console.error("❌ Autocomplete error:", err);
      }
    }
  }

  if (interaction.isButton() && interaction.customId.startsWith("leaderboard_")) {
    try {
      await leaderboardCommand.handleButton(interaction);
    } catch (err) {
      console.error("❌ Leaderboard button error:", err);
    }
  }

  if (interaction.isStringSelectMenu() && interaction.customId.startsWith("leaderboard_category_")) {
    try {
      await leaderboardCommand.handleSelect(interaction);
    } catch (err) {
      console.error("❌ Leaderboard category error:", err);
    }
  }

  if (interaction.isStringSelectMenu() && interaction.customId.startsWith("help_category_select_")) {
    try {
      await helpCommand.handleSelect(interaction);
    } catch (err) {
      console.error("❌ Help dropdown error:", err);
    }
  }
};