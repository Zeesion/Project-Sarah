import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  MessageFlags
} from "discord.js";
import helpEmbeds from "../handlers/helpEmbeds.js";
import { checkCooldown } from "../helpers/cooldownManager.js";

function buildDropdown(selectedKey = "menu", isDM = false, interaction) {
  if (isDM) return null;

  const userId = interaction.user.id;
  const placeholderText = `📘 Help command ${selectedKey}`;
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`help_category_select_${userId}`)
      .setPlaceholder(placeholderText)
      .addOptions(
        Object.entries(helpEmbeds)
          .filter(([key, val]) => {
            const isAdminOnly = val?.[0]?.requiresAdmin;
            const isGuildOnly = val?.[0]?.requiresGuild;
            const isAdmin = interaction.member?.permissions.has("Administrator");

            return (
              key !== "menu" &&
              (!isGuildOnly || !isDM) &&
              (!isAdminOnly || isAdmin)
            );
          })
          .map(([key, value]) => {
            const item = value?.[0] || {};
            return new StringSelectMenuOptionBuilder()
              .setLabel(item.title || key)
              .setValue(key)
              .setDescription(`Detail ${key}`);
          })
      )
  );
}

function buildEmbeds(category, user, isAdmin = false) {
  const data = helpEmbeds[category] || [];

  return data.map(item => {
    const filteredFields = item.fields.filter(field => !field.requiresAdmin || isAdmin);

    return new EmbedBuilder()
      .setAuthor({ name: item.title, iconURL: user.displayAvatarURL() })
      .setDescription(item.description)
      .addFields(...filteredFields)
      .setColor(0x2ecc71)
  });
}

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Lihat semua command yang tersedia"),

  async execute(interaction) {
    const userId = interaction.user.id;
    const delay = 10000;
    if (!checkCooldown("help", userId, delay)) {
      const readyAt = Math.floor((Date.now() + delay) / 1000);
      return interaction.reply({
        content: `⏳ Cooldown aktif! Coba lagi <t:${readyAt}:R>.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const isDM = !interaction.inGuild();
    const category = "menu";
    const isAdmin = interaction.member?.permissions.has("Administrator");
    const embeds = buildEmbeds(category, interaction.user, isAdmin);
    const row = buildDropdown(category, isDM, interaction);

    await interaction.reply({
      embeds,
      components: row ? [row] : []
    });

    if (row) {
      setTimeout(async () => {
        try {
          const msg = await interaction.fetchReply();

          const expiredEmbeds = msg.embeds.map(embed =>
            EmbedBuilder.from(embed).setColor(0x999999)
          );

          row.components[0].setDisabled(true);

          await msg.edit({
            embeds: expiredEmbeds,
            components: [row]
          });
        } catch (err) {
          console.error("❌ Gagal ubah warna embed:", err);
        }
      }, 60_000);
    }
  },

  async handleSelect(interaction) {
    const isDM = !interaction.inGuild();
    const selectedKey = interaction.values[0];
    const isAdmin = interaction.member?.permissions.has("Administrator");
    const selectedData = helpEmbeds[selectedKey]?.[0];

    const parts = interaction.customId.split("_");
    const expectedUserId = parts[3];
    if (interaction.user.id !== expectedUserId) return;

    const validKey =
      selectedData?.requiresGuild && isDM
        ? "menu"
        : selectedData?.requiresAdmin && !isAdmin
        ? "menu"
        : selectedKey;

    const embeds = buildEmbeds(validKey, interaction.user, isAdmin);
    const row = buildDropdown(validKey, isDM, interaction);

    await interaction.update({
      embeds,
      components: row ? [row] : []
    });
  }
};