import {
  SlashCommandSubcommandBuilder,
  ChannelType,
  MessageFlags
} from "discord.js";
import { loadData, saveData } from "../../helpers/dataManager.js";

const configName = "welcomeConfig";

/**
 * Membuat atau memperbarui konfigurasi welcome tipe tertentu.
 * @param {string} type - "greeting" atau "log"
 * @param {string} channelId - ID channel yang dipilih
 * @param {Object} existing - Konfigurasi sebelumnya
 * @returns {Object} - Konfigurasi baru yang sudah digabung
 */
function getUpdatedConfig(type, channelId, existing = {}) {
  if (type === "log") {
    const defaultJoin = {
      content: "",
      embed: {
        color: "#98FF98",
        header: "Member joined the server",
        description: "{mention} {memberordinal} to join\ncreated {created} ago\nID: {userid}",
        thumbnail: "avatar"
      }
    };

    const defaultLeft = {
      content: "",
      embed: {
        color: "#F08080",
        header: "Member left the server",
        description: "{mention} joined {joindate} ago\nID: {userid}\nRoles: {roles}",
        thumbnail: "avatar"
      }
    };

    return {
      ...existing,
      enabled: true,
      log: {
        channelId,
        join: existing.log?.join ?? defaultJoin,
        left: existing.log?.left ?? defaultLeft
      }
    };
  }

  const target = existing[type] ?? {};
  const defaultContent = "{mention}";
  const defaultEmbed = { image: "default" };

  const embed = {
    ...defaultEmbed,
    ...target.embed
  };

  return {
    ...existing,
    enabled: true,
    [type]: {
      ...target,
      channelId,
      embed,
      content: target.content ?? defaultContent
    }
  };
}

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName("channel")
    .setDescription("Set channel untuk greeting atau log welcome")
    .addStringOption(opt =>
      opt.setName("type")
        .setDescription("Tipe konfigurasi")
        .setRequired(true)
        .addChoices(
          { name: "Greeting", value: "greeting" },
          { name: "Log", value: "log" }
        )
    )
    .addChannelOption(opt =>
      opt.setName("channel")
        .setDescription("Channel tempat pesan dikirim")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    const type = interaction.options.getString("type"); // "greeting" atau "log"
    const channel = interaction.options.getChannel("channel");
    const guildId = interaction.guild.id;

    const config = loadData(configName);
    const existing = config[guildId] || {};

    config[guildId] = getUpdatedConfig(type, channel.id, existing);
    saveData(configName, config);
    const replyText = `📌 Channel ${type} diaktifkan ke ${channel}`;
    await interaction.reply({
      content: replyText,
      flags: MessageFlags.Ephemeral
    });
  }
};