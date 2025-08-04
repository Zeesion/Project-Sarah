import {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder
} from "discord.js";

import { loadData } from "../helpers/dataManager.js";
import { getLevelBadge } from "../helpers/levelUtils.js";
import { getActiveChannels } from "../helpers/chatChannelManager.js";

const userState = new Map();
const PAGE_SIZE = 10;

function generateLeaderboardEmbed(data, interaction, page = 0, category = "global") {
  const sorted = Object.entries(data).sort(
    ([, a], [, b]) => (b.level || 0) - (a.level || 0)
  );

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const pageData = sorted.slice(start, start + PAGE_SIZE);

  const rankEmoji = ["🥇", "🥈", "🥉"];
  const userId = interaction.user.id;
  const userIndex = sorted.findIndex(([id]) => id === userId);
  const userRank = userIndex + 1;

  const userEmoji =
    userIndex === 0 ? "🥇" :
    userIndex === 1 ? "🥈" :
    userIndex === 2 ? "🥉" :
    `**${userRank}.**`;

  const guildId = interaction.guild?.id;
  const boosterChannels = getActiveChannels(guildId);
  const boosterNote = boosterChannels.length
    ? `> XP Booster aktif di ${boosterChannels.map(id => `<#${id}>`).join(" • ")}`
    : "";

  const header = userIndex !== -1
    ? [`> Kamu berada di peringkat ${userEmoji}`, boosterNote].filter(Boolean).join("\n")
    : "";

  const description = [header, ...pageData.map(([id, user], i) => {
    const rank = start + i;
    const emoji = rank < 3 ? rankEmoji[rank] : `**#${rank + 1}.**`;
    const badge = getLevelBadge(user.level);
    const badgeText = badge ? `${badge}` : "";
    const usernameDisplay = category === "global"
      ? (user.globalName || user.username || `User ${id}`)
      : `<@${id}>`;

    return `${emoji} ${usernameDisplay} Level ${user.level || 0} ${badgeText}`;
  })].join("\n\n") || "Belum ada data.";

  const guildName = interaction.guild?.name || "Server";
  const authorTitle = category === "global"
    ? "Leaderboard Global"
    : `Leaderboard ${guildName}`;

  return new EmbedBuilder()
    .setColor(0xf5a623)
    .setAuthor({
      name: authorTitle,
      iconURL: interaction.client.user.displayAvatarURL()
    })
    .setDescription(description)
    .setFooter({ text: `Halaman ${page + 1}/${totalPages}` })
    .setTimestamp();
}

function generateButtons(page, totalPages) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`leaderboard_prev_${page}`)
      .setLabel("⬅️ Sebelumnya")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),

    new ButtonBuilder()
      .setCustomId(`leaderboard_next_${page}`)
      .setLabel("Selanjutnya ➡️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= totalPages - 1)
  );
}

function generateCategoryDropdown(currentCategory = "global", isGuild = true) {
  const options = [
    ...(isGuild ? [{
      label: "Leaderboard Server",
      value: "local",
      default: currentCategory === "local"
    }] : []),
    {
      label: "Leaderboard Global",
      value: "global",
      default: currentCategory === "global"
    }
  ];

  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("leaderboard_category")
      .setPlaceholder(currentCategory === "global"
        ? "Leaderboard Global"
        : "Leaderboard Server")
      .addOptions(options)
  );
}

export default {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Lihat leaderboard komunitas"),

  async execute(interaction) {
    const allStats = loadData("userStats");
    const isGuild = !!interaction.guild;
    const category = isGuild ? "local" : "global";

    const filteredStats = category === "local"
      ? Object.fromEntries(Object.entries(allStats).filter(([, user]) =>
          user.guildId === interaction.guild.id))
      : allStats;

    const currentPage = 0;
    const totalPages = Math.ceil(Object.keys(filteredStats).length / PAGE_SIZE);
    const embed = generateLeaderboardEmbed(filteredStats, interaction, currentPage, category);
    const buttons = generateButtons(currentPage, totalPages);
    const dropdown = isGuild ? generateCategoryDropdown(category, true) : null;

    await interaction.reply({
      embeds: [embed],
      components: dropdown ? [dropdown, buttons] : [buttons],
      withResponse: true
    });

    userState.set(interaction.user.id, { page: currentPage, category });

    setTimeout(async () => {
      const state = userState.get(interaction.user.id);
      if (!state) return;

      const allStats = loadData("userStats");
      const guildId = interaction.guild?.id;
      const filteredStats = state.category === "local" && guildId
        ? Object.fromEntries(Object.entries(allStats).filter(([, user]) =>
            user.guildId === guildId))
        : allStats;

      const totalPages = Math.ceil(Object.keys(filteredStats).length / PAGE_SIZE);
      const latestEmbed = generateLeaderboardEmbed(
        filteredStats, interaction, state.page, state.category
      );

      const expiredDropdown = dropdown
        ? generateCategoryDropdown(state.category, isGuild)
        : null;

      if (expiredDropdown) expiredDropdown.components[0].setDisabled(true);

      const expiredButtons = generateButtons(state.page, totalPages);
      expiredButtons.components.forEach(btn => btn.setDisabled(true));

      await interaction.editReply({
        embeds: [latestEmbed],
        components: expiredDropdown
          ? [expiredDropdown, expiredButtons]
          : [expiredButtons]
      });
    }, 60_000);
  },

  async handleButton(interaction) {
    const state = userState.get(interaction.user.id) || { page: 0, category: "global" };
    const stats = loadData("userStats");
    const guildId = interaction.guild?.id;

    const filteredStats = state.category === "local" && guildId
      ? Object.fromEntries(Object.entries(stats).filter(([, user]) =>
          user.guildId === guildId))
      : stats;

    const [_, action, pageStr] = interaction.customId.split("_");
    let page = parseInt(pageStr);
    page = action === "next" ? page + 1 : page - 1;

    userState.set(interaction.user.id, { page, category: state.category });

    const totalPages = Math.ceil(Object.keys(filteredStats).length / PAGE_SIZE);
    const embed = generateLeaderboardEmbed(filteredStats, interaction, page, state.category);
    const buttons = generateButtons(page, totalPages);
    const dropdown = interaction.guild
      ? generateCategoryDropdown(state.category, true)
      : null;

    await interaction.update({
      embeds: [embed],
      components: dropdown ? [dropdown, buttons] : [buttons]
    });
  },

  async handleSelect(interaction) {
    const selected = interaction.values[0];
    const allStats = loadData("userStats");
    const guildId = interaction.guild?.id;

    const filteredStats = selected === "local" && guildId
      ? Object.fromEntries(Object.entries(allStats).filter(([, user]) =>
          user.guildId === guildId))
      : allStats;

    const totalPages = Math.ceil(Object.keys(filteredStats).length / PAGE_SIZE);
    const embed = generateLeaderboardEmbed(filteredStats, interaction, 0, selected);
    const buttons = generateButtons(0, totalPages);
    const dropdown = interaction.guild
      ? generateCategoryDropdown(selected, true)
      : null;

    userState.set(interaction.user.id, { page: 0, category: selected });

    await interaction.update({
      embeds: [embed],
      components: dropdown ? [dropdown, buttons] : [buttons]
    });
  }
};