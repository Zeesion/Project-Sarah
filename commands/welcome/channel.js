import {
  SlashCommandSubcommandBuilder,
  ChannelType,
  MessageFlags
} from "discord.js";
import { loadData, saveData } from "../../helpers/dataManager.js";

const configName = "welcomeConfig";

/**
 * Membuat atau memperbarui konfigurasi welcome default.
 * @param {string} channelId - ID channel yang dipilih.
 * @param {Object} existing - Konfigurasi sebelumnya (jika ada).
 * @returns {Object} - Konfigurasi baru yang sudah digabung.
 */
function getDefaultWelcomeConfig(channelId, existing = {}) {
  const embed = {
    ...existing.embed,
    image: existing.embed?.image ?? "default"
  };

  return {
    ...existing,
    channelId,
    enabled: true,
    embed,
    content: existing.content ?? "{mention}"
  };
}

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName("channel")
    .setDescription("Set channel untuk welcome member baru")
    .addChannelOption(opt =>
      opt
        .setName("channel")
        .setDescription("Tempat welcome dikirim")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    const guildId = interaction.guild.id;

    const config = loadData(configName);
    const existing = config[guildId] || {};

    // 🧩 Update config dengan helper
    config[guildId] = getDefaultWelcomeConfig(channel.id, existing);
    saveData(configName, config);

    const isFirstTime = !existing.channelId;
    await interaction.reply({
      content: isFirstTime
        ? `📌 Channel welcome di-set ke ${channel}`
        : `📌 Channel welcome diperbarui ke ${channel}`,
      flags: MessageFlags.Ephemeral
    });
  }
};