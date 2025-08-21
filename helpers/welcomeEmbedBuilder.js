import { EmbedBuilder } from "discord.js";
import { resolvePlaceholders } from "./placeholderUtils.js";

// Fallback URLs
const fallbackThumbnailPng = "https://raw.githubusercontent.com/Zeesion/Project-Sarah/main/assets/Welcome/custom-thumbnail.png";
const fallbackThumbnailGif = "https://raw.githubusercontent.com/Zeesion/Project-Sarah/main/assets/Welcome/custom-thumbnail.gif";
const fallbackImagePng = "https://raw.githubusercontent.com/Zeesion/Project-Sarah/main/assets/Welcome/custom-image.png";
const fallbackImageGif = "https://raw.githubusercontent.com/Zeesion/Project-Sarah/main/assets/Welcome/custom-image.gif";
const fallbackImage = "https://raw.githubusercontent.com/Zeesion/Project-Sarah/main/assets/Welcome/default-image.png";

/**
 * Inject query string untuk bypass cache Discord.
 */
export function resolveMediaSource(url, cacheBust = false) {
  if (!url || typeof url !== "string") return null;
  if (!url.startsWith("http")) return null;
  return cacheBust ? `${url}?v=${Date.now()}` : url;
}

/**
 * Normalisasi config embed agar siap dipakai builder.
 */
export function normalizeEmbedConfig(config = {}, user, guild) {
  return {
    ...config,
    thumbnail:
      config.thumbnail === "avatar"
        ? user?.displayAvatarURL?.()
        : config.thumbnail === "server"
        ? guild?.iconURL?.()
        : config.thumbnail === "gif"
        ? resolveMediaSource(fallbackThumbnailGif, true)
        : config.thumbnail === "image"
        ? resolveMediaSource(fallbackThumbnailPng, true)
        : typeof config.thumbnail === "string" && config.thumbnail.startsWith("http")
        ? resolveMediaSource(config.thumbnail, true)
        : null,

    image:
      config.image === "gif"
        ? resolveMediaSource(fallbackImageGif, true)
        : config.image === "image"
        ? resolveMediaSource(fallbackImagePng, true)
        : config.image === "default"
        ? resolveMediaSource(fallbackImage, true)
        : typeof config.image === "string" && config.image.startsWith("http")
        ? resolveMediaSource(config.image, true)
        : null,
  };
}

/**
 * Membangun embed sapaan berdasarkan config dan user.
 */
export function buildWelcomeEmbed(member, rawConfig = {}) {
  const withPlaceholders = resolvePlaceholders(rawConfig, member);
  const normalized = normalizeEmbedConfig(withPlaceholders, member.user, member.guild);

  const embed = new EmbedBuilder();

  if (normalized.header) embed.setTitle(normalized.header);
  if (normalized.description) embed.setDescription(normalized.description);
  if (normalized.author) embed.setAuthor({ name: normalized.author });
  if (normalized.footer) embed.setFooter({ text: normalized.footer });
  if (normalized.color) embed.setColor(normalized.color);
  if (normalized.thumbnail) embed.setThumbnail(normalized.thumbnail);
  if (normalized.image) embed.setImage(normalized.image);
  if (Array.isArray(normalized.fields)) embed.addFields(...normalized.fields);

  return embed;
}