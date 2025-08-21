import {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  MessageFlags
} from "discord.js";

import { loadData } from "../helpers/dataManager.js";
import { getLevelBadge } from "../helpers/levelUpHandler.js";
import { checkCooldown } from "../helpers/cooldownManager.js";

const userState = new Map();
const PAGE_SIZE = 10;

function generateLeaderboardEmbed(data, interaction, page = 0, category = "global") {
  const sorted = Object.entries(data).sort(([, a], [, b]) => (b.level || 0) - (a.level || 0));
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

  const header = [`✧･ﾟ: *✧･ﾟ:* 　*Kamu rank ${userEmoji}*　 *:･ﾟ✧*:･ﾟ✧`];
  const description = [header, ...pageData.map(([id, user], i) => {
    const rank = start + i;
    const emoji = rank < 3 ? rankEmoji[rank] : `**#${rank + 1}.**`;
    const badge = getLevelBadge(user.level, interaction.client);
    const badgeText = badge?.full || "";
    const levelText = `Level ${user.level || 0}`;

    const formatStats = category === "global"
      ? `\`@${user.globalName || user.username || `User @${id}`}\` ${levelText} ${badgeText}`
      : `<@${id}> ${levelText} ${badgeText}`;

    return `${emoji} ${formatStats}`;
  })].join("\n\n") || "Belum ada data.";

  const guildName = interaction.guild?.name || "Server";
  const authorTitle = category === "global"
    ? "Leaderboard Global"
    : `Leaderboard ${guildName}`;

  return new EmbedBuilder()
    .setColor(0xf1c40f)
    .setAuthor({ name: authorTitle, iconURL: interaction.client.user.displayAvatarURL() })
    .setDescription(description)
    .setFooter({ text: "xᴘ ʙᴏᴏsᴛᴇʀ - sᴀʀᴀʜ ᴄʜᴀɴɴᴇʟ" })
    .setTimestamp();
}

function generateButtons(page, totalPages, userId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`leaderboard_prev_${page}_${userId}`)
      .setEmoji("⬅️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),

    new ButtonBuilder()
      .setCustomId("page_info")
      .setLabel(`${page + 1} / ${totalPages}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),

    new ButtonBuilder()
      .setCustomId(`leaderboard_next_${page}_${userId}`)
      .setEmoji("➡️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= totalPages - 1)
  );
}

function generateCategoryDropdown(currentCategory = "global", isGuild = true, userId) {
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
      .setCustomId(`leaderboard_category_${userId}`)
      .setPlaceholder(currentCategory === "global" ? "Leaderboard Global" : "Leaderboard Server")
      .addOptions(options)
  );
}

export default {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Lihat leaderboard komunitas"),

  async execute(interaction) {
    const userId = interaction.user.id;
    const delay = 10000;
    if (!checkCooldown("leaderboard", userId, delay)) {
      const readyAt = Math.floor((Date.now() + delay) / 1000);
      return interaction.reply({
        content: `⏳ Cooldown aktif! Coba lagi <t:${readyAt}:R>.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const allStats = loadData("userStats");
    const isGuild = !!interaction.guild;
    const category = isGuild ? "local" : "global";

    const filteredStats = category === "local"
      ? Object.fromEntries(Object.entries(allStats).filter(([, user]) => user.guildId === interaction.guild.id))
      : allStats;

    const currentPage = 0;
    const totalPages = Math.ceil(Object.keys(filteredStats).length / PAGE_SIZE);
    const embed = generateLeaderboardEmbed(filteredStats, interaction, currentPage, category);
    const buttons = generateButtons(currentPage, totalPages, userId);
    const dropdown = isGuild ? generateCategoryDropdown(category, true, userId) : null;

    await interaction.reply({
      embeds: [embed],
      components: dropdown ? [dropdown, buttons] : [buttons]
    });

    userState.set(userId, { page: currentPage, category });

    setTimeout(async () => {
      const state = userState.get(userId);
      if (!state) return;

      const allStats = loadData("userStats");
      const guildId = interaction.guild?.id;
      const filteredStats = state.category === "local" && guildId
        ? Object.fromEntries(Object.entries(allStats).filter(([, user]) => user.guildId === guildId))
        : allStats;

      const totalPages = Math.ceil(Object.keys(filteredStats).length / PAGE_SIZE);
      const expiredEmbed = generateLeaderboardEmbed(filteredStats, interaction, state.page, state.category)
        .setColor(0x999999)
        .setTimestamp(Date.now());

      const expiredDropdown = dropdown
        ? generateCategoryDropdown(state.category, isGuild, userId)
        : null;

      if (expiredDropdown) expiredDropdown.components[0].setDisabled(true);

      const expiredButtons = generateButtons(state.page, totalPages, userId);
      expiredButtons.components.forEach(btn => btn.setDisabled(true));

      await interaction.editReply({
        embeds: [expiredEmbed],
        components: expiredDropdown ? [expiredDropdown, expiredButtons] : [expiredButtons]
      });
    }, 60_000);
  },

  async handleButton(interaction) {
    const parts = interaction.customId.split("_");
    const expectedUserId = parts[3];
    if (interaction.user.id !== expectedUserId) return;

    const action = parts[1];
    let page = parseInt(parts[2]);
    page = action === "next" ? page + 1 : page - 1;

    const state = userState.get(interaction.user.id) || { page: 0, category: "global" };
    userState.set(interaction.user.id, { page, category: state.category });

    const stats = loadData("userStats");
    const guildId = interaction.guild?.id;
    const filteredStats = state.category === "local" && guildId
      ? Object.fromEntries(Object.entries(stats).filter(([, user]) => user.guildId === guildId))
      : stats;

    const totalPages = Math.ceil(Object.keys(filteredStats).length / PAGE_SIZE);
    const embed = generateLeaderboardEmbed(filteredStats, interaction, page, state.category).setTimestamp(Date.now());
    const buttons = generateButtons(page, totalPages, interaction.user.id);
    const dropdown = interaction.guild ? generateCategoryDropdown(state.category, true, interaction.user.id) : null;

    await interaction.update({
      embeds: [embed],
      components: dropdown ? [dropdown, buttons] : [buttons]
    });
  },

  async handleSelect(interaction) {
    const parts = interaction.customId.split("_");
    const expectedUserId = parts[2];
    if (interaction.user.id !== expectedUserId) return;

    const selected = interaction.values[0];
    const allStats = loadData("userStats");
    const guildId = interaction.guild?.id;

    const filteredStats = selected === "local" && guildId
      ? Object.fromEntries(Object.entries(allStats).filter(([, user]) => user.guildId === guildId))
      : allStats;

    const totalPages = Math.ceil(Object.keys(filteredStats).length / PAGE_SIZE);
    const embed = generateLeaderboardEmbed(filteredStats, interaction, 0, selected).setTimestamp(Date.now());
    const buttons = generateButtons(0, totalPages, interaction.user.id);
    const dropdown = interaction.guild
      ? generateCategoryDropdown(selected, true, interaction.user.id)
      : null;

    userState.set(interaction.user.id, { page: 0, category: selected });

    await interaction.update({
      embeds: [embed],
      components: dropdown ? [dropdown, buttons] : [buttons]
    });
  }
};