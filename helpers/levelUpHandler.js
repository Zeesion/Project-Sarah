import { EmbedBuilder } from "discord.js";

// 🏅 Fallback emoji untuk tiap badge
const fallbackEmojis = {
  Lumirith: "<:Lumirith:1402987330767425700>",
  Aetherion: "<:Aetherion:1402987312035663912>",
  Myrren: "<:Myrren:1402987293886648474>",
  Salune: "<:Salune:1402987277139050536>",
  Eidrix: "<:Eidrix:1402987244700303441>",
  Thalor: "<:Thalor:1402987226782236704>",
  Kairox: "<:Kairox:1402987206540398712>",
  Oscen: "<:Oscen:1402987049262518323>",
  Vireon: "<:Vireon:1402986780151775344>",
  Nexis: "<:Nexis:1402986674090279003>",
};

const emojiCache = new Map();

function getEmoji(name, client) {
  if (emojiCache.has(name)) return emojiCache.get(name);

  const emoji = client.emojis.cache.find(e => e.name === name);
  const emojiStr = emoji?.toString() || fallbackEmojis[name] || "";

  emojiCache.set(name, emojiStr);
  if (!emoji) console.warn(`[WARN] Emoji "${name}" fallback digunakan`);

  return emojiStr;
}

export function getLevelBadge(level, client) {
  const badgeMap = [
    { min: 100, name: "Lumirith", title: "⊰ʟᴜᴍɪʀɪᴛʜ⊱" },
    { min: 90, name: "Aetherion", title: "⊰ᴀᴇᴛʜᴇʀɪᴏɴ⊱" },
    { min: 80, name: "Myrren", title: "⊰ᴍʏʀʀᴇɴ⊱" },
    { min: 70, name: "Salune", title: "⊰sᴀʟᴜɴᴇ⊱" },
    { min: 60, name: "Eidrix", title: "⊰ᴇɪᴅʀɪx⊱" },
    { min: 50, name: "Thalor", title: "⊰ᴛʜᴀʟᴏʀ⊱" },
    { min: 40, name: "Kairox", title: "⊰ᴋᴀɪʀᴏx⊱" },
    { min: 30, name: "Oscen", title: "⊰ᴏsᴄᴇɴ⊱" },
    { min: 20, name: "Vireon", title: "⊰ᴠɪʀᴇᴏɴ⊱" },
    { min: 10, name: "Nexis", title: "⊰ɴᴇxɪs⊱" },
  ];

  for (const badge of badgeMap) {
    if (level >= badge.min) {
      const emoji = getEmoji(badge.name, client);
      return {
        title: `**${badge.title}**`,
        emoji,
        full: `**${badge.title}** ${emoji}`
      };
    }
  }

  return { title: "", emoji: "", full: "" };
}

const levelStyleBank = {
  ceria: [
    "🎉 Wihh mantap cuy!",
    "🚀 Naik lagii~ gila!",
    "🙌 Gasss terus!",
    "⚡️ Gila, kamu ngegas banget!",
    "🔥 Levelnya kebakar nih!",
  ],
  sarkastik: [
    "🙄 Yaelah baru naik.",
    "🫥 Naik? Baru juga mulai.",
    "😏 Hmmm... akhirnya.",
    "🫢 Serius nih naik?",
    "🫠 Kirain stuck.",
  ],
  kalem: [
    "🌙 Pelan tapi tajam.",
    "🍃 Naik dalam sunyi.",
    "🧘 Diam-diam stabil.",
    "🕯️ Konsisten tuh indah.",
    "🌾 Langkah kecil, dampak besar.",
  ],
  profesional: [
    "📊 Terpantau naik.",
    "🧠 Optimalisasi tercapai.",
    "📐 Presisi leveling.",
    "🔍 Kenaikan sesuai proyeksi.",
    "🧭 Stabil. Efisien. Naik.",
  ],
  empatik: [
    "🤍 Kamu layak dapet ini.",
    "👏 Bangga banget liat kamu naik!",
    "🤗 Level baru, kamu makin solid!",
    "💞 Seneng liat perkembanganmu.",
    "🫶 Kamu terus berkembang!",
  ],
};

export function getLevelStyle(persona) {
  const styles = levelStyleBank[persona] || ["🌟 Naik cuy!"];
  return styles[Math.floor(Math.random() * styles.length)];
}

function getBadgeImageFile(level) {
  const badgeRanges = [
    { min: 100, file: "lvl100" },
    { min: 90, file: "lvl90" },
    { min: 80, file: "lvl80" },
    { min: 70, file: "lvl70" },
    { min: 60, file: "lvl60" },
    { min: 50, file: "lvl50" },
    { min: 40, file: "lvl40" },
    { min: 30, file: "lvl30" },
    { min: 20, file: "lvl20" },
    { min: 10, file: "lvl10" },
  ];

  for (const badge of badgeRanges) {
    if (level >= badge.min) return badge.file;
  }

  return "";
}

export function getBadgeImageURL(level, version = "2") {
  const file = getBadgeImageFile(level);
  return file
    ? `https://raw.githubusercontent.com/Zeesion/Project-Sarah/main/assets/Badge/${file}.png?v=${version}`
    : "";
}

export function createLevelUpEmbed(user, level, client) {
  const badge = getLevelBadge(level, client);
  const badgeImageURL = getBadgeImageURL(level, "2");

  const embed = new EmbedBuilder()
    .setTitle(`🎖️ Level Up!`)
    .setDescription(
      `Selamat <@${user.id}>\nKamu mendapatkan:\n\`▸ Badge\` ${badge.title}`
    )
    .setColor(0xffd700)

  if (badgeImageURL) {
    embed.setThumbnail(badgeImageURL);
  }

  return embed;
}