import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from "discord.js";
import helpEmbeds from "../handlers/helpEmbeds.js";

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
      .setColor(Math.floor(Math.random() * 0xffffff))
  );
}

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Lihat semua command yang tersedia"),

  async execute(interaction) {
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
          row.components[0].setDisabled(true);
          await msg.edit({ components: [row] });
        } catch (err) {
          console.error("❌ Gagal disable dropdown:", err);
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