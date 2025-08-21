import {
  SlashCommandSubcommandBuilder,
  MessageFlags,
} from "discord.js";
import { loadData, saveData } from "../../helpers/dataManager.js";
import { buildWelcomeEmbed } from "../../helpers/welcomeEmbedBuilder.js";
import { resolvePlaceholders } from "../../helpers/placeholderUtils.js";

const configName = "welcomeConfig";

// Properti embed yang bisa berdiri sendiri
const validStandaloneKeys = ["description", "image", "thumbnail", "fields", "author"];

/**
 * Cek properti embed yang masih valid setelah satu dihapus
 */
function getRemainingValidKeys(embed, targetToRemove) {
  return validStandaloneKeys.filter((key) => {
    if (key === targetToRemove) return false;

    if (key === "fields") {
      return Array.isArray(embed.fields) && embed.fields.length > 0;
    }

    if (key === "thumbnail" || key === "image") {
      return embed[key] && embed[key] !== "disable";
    }

    return typeof embed[key] === "string" && embed[key].trim() !== "";
  });
}

function getUpdatedLabels(interaction) {
  const fields = [
    "message", "color", "author", "header",
    "description", "footer", "thumbnail", "image", "field"
  ];

  const labels = {
    message: "Message",
    color: "Color",
    author: "Author",
    header: "Header",
    description: "Description",
    footer: "Footer",
    thumbnail: "Thumbnail",
    image: "Image",
    field: "Field"
  };

  return fields
    .filter((key) => interaction.options.getString(key))
    .map((key) => labels[key] || key);
}

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName("settings")
    .setDescription("Kustomisasi pesan welcome")
    .addStringOption(opt =>
      opt.setName("message").setDescription("Pesan di luar embed").setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName("color").setDescription("Warna embed (hex)").setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName("author").setDescription("Nama author di embed").setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName("header").setDescription("Judul embed").setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName("description").setDescription("Deskripsi embed").setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName("footer").setDescription("Footer embed").setRequired(false)
    )
    .addStringOption(opt =>
      opt
        .setName("thumbnail")
        .setDescription("Avatar User, Server Logo, Custom PNG, Custom GIF, Disable")
        .setRequired(false)
        .addChoices(
          { name: "Avatar User", value: "avatar" },
          { name: "Server Logo", value: "server" },
          { name: "Custom PNG", value: "image" },
          { name: "Custom GIF", value: "gif" },
          { name: "Disable", value: "disable" }
        )
    )
    .addStringOption(opt =>
      opt
        .setName("image")
        .setDescription("Custom PNG, Custom GIF, Default, Disable")
        .setRequired(false)
        .addChoices(
          { name: "Custom PNG", value: "image" },
          { name: "Custom GIF", value: "gif" },
          { name: "Default", value: "default" },
          { name: "Disable", value: "disable" }
        )
    )
    .addStringOption(opt =>
      opt.setName("field").setDescription("Judul | Isi").setRequired(false)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const config = loadData(configName)[guildId] ?? {};

    // Ambil input dari user
    const message = interaction.options.getString("message");
    const color = interaction.options.getString("color");
    const author = interaction.options.getString("author");
    const header = interaction.options.getString("header");
    const description = interaction.options.getString("description");
    const footer = interaction.options.getString("footer");
    const thumbnail = interaction.options.getString("thumbnail");
    const image = interaction.options.getString("image");
    const field = interaction.options.getString("field");

    // Simulasi embed setelah update
    const simulatedEmbed = {
      ...(config.embed || {}),
      ...(color && { color }),
      ...(author && { author }),
      ...(header && { header }),
      ...(description && { description }),
      ...(footer && { footer }),
      ...(thumbnail && { thumbnail }),
      ...(image && { image }),
      ...(field && {
        fields: [
          ...(config.embed?.fields || []),
          {
            name: field.split("|")[0]?.trim() || "",
            value: field.split("|")[1]?.trim() || "",
            inline: false
          }
        ]
      })
    };

    // Validasi: jika user disable thumbnail/image, pastikan masih ada konten lain
    if (thumbnail === "disable") {
      const remaining = getRemainingValidKeys(simulatedEmbed, "thumbnail");
      if (remaining.length === 0) {
        return interaction.reply({
          content: "⚠️ `Thumbnail` tidak bisa di-disable jika embed tidak punya konten lain.",
          flags: MessageFlags.Ephemeral
        });
      }
    }

    if (image === "disable") {
      const remaining = getRemainingValidKeys(simulatedEmbed, "image");
      if (remaining.length === 0) {
        return interaction.reply({
          content: "⚠️ `Image` tidak bisa di-disable jika embed tidak punya konten lain.",
          flags: MessageFlags.Ephemeral
        });
      }
    }

    // Simpan config
    const updated = {
      ...config,
      embed: simulatedEmbed,
      content: message ?? config.content
    };

    const allConfig = loadData(configName);
    allConfig[guildId] = updated;
    saveData(configName, allConfig);

    if (!updated.channelId) {
      return interaction.reply({
        content: "⚠️ Channel welcome belum ditetapkan.",
        flags: MessageFlags.Ephemeral
      });
    }

    // Preview
    const resolvedEmbedConfig = resolvePlaceholders(updated.embed, interaction.member);
    const resolvedContent = resolvePlaceholders({ content: updated.content }, interaction.member).content;
    const embed = buildWelcomeEmbed(interaction.member, resolvedEmbedConfig);
    const updatedLabels = getUpdatedLabels(interaction);
    const labelText = updatedLabels.length > 0
      ? updatedLabels.join(", ")
      : "Welcome";

    await interaction.reply({
      content: `\`${labelText}\` berhasil diperbarui:\n\n${resolvedContent || ""}`,
      embeds: [embed],
      flags: MessageFlags.Ephemeral
    });
  }
};