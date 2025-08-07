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

function buildDropdown(selectedKey = "menu", isDM = false) {
  if (isDM) return null;

  const placeholderText = `📘 Help command ${selectedKey}`;
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("help_category_select")
      .setPlaceholder(placeholderText)
      .addOptions(
        Object.entries(helpEmbeds)
          .filter(([key, val]) =>
            key !== "menu" && (!val.requiresGuild || !isDM)
          )
          .map(([key, value]) => {
            const item = value?.[0] || {};
            return new StringSelectMenuOptionBuilder()
              .setLabel(item.title || key)
              .setValue(key)
              .setDescription(`Detail ${key}`)
          })
      )
  );
}

function buildEmbeds(category, user) {
  const data = helpEmbeds[category] || [];
  return data.map(item =>
    new EmbedBuilder()
      .setAuthor({ name: item.title, iconURL: user.displayAvatarURL() })
      .setDescription(item.description)
      .addFields(...item.fields)
      .setColor(0x2ecc71)
  );
}

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Lihat semua command yang tersedia"),

  async execute(interaction) {
    const userId = interaction.user.id;
    const delay = 10000; // 10 detik
    if (!checkCooldown("help", userId, delay)) {
      const readyAt = Math.floor((Date.now() + delay) / 1000);
      return interaction.reply({
        content: `⏳ Cooldown aktif! Coba lagi <t:${readyAt}:R>.`,
        flags: MessageFlags.Ephemeral,
      });
    }
    const isDM = !interaction.inGuild();
    const category = "menu";
    const embeds = buildEmbeds(category, interaction.user);
    const row = buildDropdown(category, isDM);

    await interaction.reply({
      embeds,
      components: row ? [row] : []
    });

    if (row) {
      setTimeout(async () => {
        try {
          const msg = await interaction.fetchReply();

          // Clone embed lama dan ubah warnanya
          const expiredEmbeds = msg.embeds.map(embed =>
            EmbedBuilder.from(embed).setColor(0x999999) // warna expired
          );

          // Disable dropdown
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

    const validKey = helpEmbeds[selectedKey]?.requiresGuild && isDM
      ? "menu"
      : selectedKey;

    const embeds = buildEmbeds(validKey, interaction.user);
    const row = buildDropdown(validKey, isDM);

    await interaction.update({
      embeds,
      components: row ? [row] : []
    });
  }
};