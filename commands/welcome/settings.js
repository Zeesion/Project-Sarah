import {
  SlashCommandSubcommandBuilder,
  MessageFlags
} from "discord.js";
import { loadData, saveData } from "../../helpers/dataManager.js";
import { buildWelcomeEmbed } from "../../helpers/welcomeEmbedBuilder.js";
import { resolvePlaceholders } from "../../helpers/placeholderUtils.js";

const configName = "welcomeConfig";
const validStandaloneKeys = ["description", "image", "thumbnail", "fields", "author"];

const typeLabels = {
  greeting: "greeting",
  "log.join": "log join",
  "log.left": "log left"
};

function getRemainingValidKeys(embed, targetToRemove) {
  return validStandaloneKeys.filter((key) => {
    if (key === targetToRemove) return false;
    if (key === "fields") return Array.isArray(embed.fields) && embed.fields.length > 0;
    if (key === "thumbnail" || key === "image") return embed[key] && embed[key] !== "disable";
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

function upsertFlexibleFieldWithInline(fields = [], rawInput) {
  const parts = rawInput.split("|").map(p => p.trim());
  const [namePart = "", valuePart = "", inlinePart = ""] = parts;

  const indexMatch = namePart.match(/^(\d+)\s+(.*)$/);
  const name = indexMatch ? indexMatch[2] || "" : namePart || "";
  const value = valuePart || "";
  const inline = /inline\s*:\s*true/i.test(inlinePart);

  const newField = { name, value, inline };
  const index = indexMatch ? parseInt(indexMatch[1], 10) - 1 : fields.findIndex(f => f.name === name);

  if (index >= 0 && fields[index]) {
    fields[index] = newField;
  } else {
    fields.push(newField);
  }

  return fields;
}

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName("settings")
    .setDescription("Kustomisasi pesan greeting atau log welcome")
    .addStringOption(opt =>
      opt.setName("type")
        .setDescription("Tipe konfigurasi")
        .setRequired(true)
        .addChoices(
          { name: "Greeting", value: "greeting" },
          { name: "Log Join", value: "log.join" },
          { name: "Log Left", value: "log.left" }
        )
    )
    .addStringOption(opt => opt.setName("message").setDescription("Pesan di luar embed").setRequired(false))
    .addStringOption(opt => opt.setName("color").setDescription("Warna embed (hex)").setRequired(false))
    .addStringOption(opt => opt.setName("author").setDescription("Nama author di embed").setRequired(false))
    .addStringOption(opt => opt.setName("header").setDescription("Judul embed").setRequired(false))
    .addStringOption(opt => opt.setName("description").setDescription("Deskripsi embed").setRequired(false))
    .addStringOption(opt => opt.setName("footer").setDescription("Footer embed").setRequired(false))
    .addStringOption(opt =>
      opt.setName("thumbnail")
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
      opt.setName("image")
        .setDescription("Custom PNG, Custom GIF, Default, Disable")
        .setRequired(false)
        .addChoices(
          { name: "Custom PNG", value: "image" },
          { name: "Custom GIF", value: "gif" },
          { name: "Default", value: "default" },
          { name: "Disable", value: "disable" }
        )
    )
    .addStringOption(opt => opt.setName("field").setDescription("Judul | Isi").setRequired(false)),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const type = interaction.options.getString("type");
    const allConfig = loadData(configName);
    const config = allConfig[guildId] ?? {};
    const [baseType, subType] = type.split(".");
    const isLogSub = baseType === "log" && subType;
    const typeLabel = typeLabels[type] ?? type;

    const channelId = isLogSub ? config.log?.channelId : config[type]?.channelId;
    if (!channelId) {
      return interaction.reply({
        content: `⚠️ Channel untuk ${typeLabel} belum diatur.\nGunakan \`/welcome channel\`.`,
        flags: MessageFlags.Ephemeral
      });
    }

    const targetConfig = isLogSub ? config.log?.[subType] ?? {} : config[type] ?? {};

    const message = interaction.options.getString("message");
    const color = interaction.options.getString("color");
    const author = interaction.options.getString("author");
    const header = interaction.options.getString("header");
    const description = interaction.options.getString("description");
    const footer = interaction.options.getString("footer");
    const thumbnail = interaction.options.getString("thumbnail");
    const image = interaction.options.getString("image");
    const field = interaction.options.getString("field");

    const simulatedEmbed = {
      ...(targetConfig.embed || {}),
      ...(color && { color }),
      ...(author && { author }),
      ...(header && { header }),
      ...(description && { description }),
      ...(footer && { footer }),
      ...(thumbnail && { thumbnail }),
      ...(image && { image }),
      ...(field && {
        fields: upsertFlexibleFieldWithInline(targetConfig.embed?.fields || [], field)
      })
    };

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

    if (isLogSub) {
      config.log = {
        ...config.log,
        [subType]: {
          ...targetConfig,
          embed: simulatedEmbed,
          content: message ?? targetConfig.content
        }
      };
    } else {
      config[type] = {
        ...targetConfig,
        embed: simulatedEmbed,
        content: message ?? targetConfig.content
      };
    }

    config.enabled = !!(config.greeting || config.log);
    allConfig[guildId] = config;
    saveData(configName, allConfig);

    const previewData = {
      status: subType === "join" ? "joined" : subType === "left" ? "left" : "greeting"
    };

    const resolvedEmbedConfig = resolvePlaceholders(simulatedEmbed, interaction.member, previewData);
    const resolvedContent = resolvePlaceholders({ content: message ?? targetConfig.content }, interaction.member, previewData).content;
    const embed = buildWelcomeEmbed(interaction.member, resolvedEmbedConfig);
    const updatedLabels = getUpdatedLabels(interaction);
    const labelText = updatedLabels.length > 0 ? updatedLabels.join(", ") : "Welcome";

    await interaction.reply({
      content: `✅ \`${labelText}\` berhasil diperbarui untuk ${typeLabel}:\n\n${resolvedContent || ""}`,
      embeds: [embed],
      flags: MessageFlags.Ephemeral
    });

    const isDisabled = isLogSub
      ? config?.log?.enabled === false
      : config?.[type]?.enabled === false;

    if (isDisabled) {
      await interaction.followUp({
        content: `⚠️ Fitur ${typeLabel} saat ini dinonaktifkan.\nGunakan \`/welcome channel\` untuk mengaktifkan kembali.`,
        flags: MessageFlags.Ephemeral
      });
    }
  }
};