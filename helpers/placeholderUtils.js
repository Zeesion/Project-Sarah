import { format, intervalToDuration } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Format durasi dari timestamp ke bentuk pendek seperti "2 bulan 24 hari"
 * @param {Date} from - Tanggal awal
 * @param {Date} to - Tanggal akhir (default: sekarang)
 * @returns {string} - Format durasi pendek
 */
function formatDurationShort(from, to = new Date()) {
  const duration = intervalToDuration({ start: from, end: to });

  const units = [
    { key: "years", label: "tahun" },
    { key: "months", label: "bulan" },
    { key: "days", label: "hari" },
    { key: "hours", label: "jam" },
    { key: "minutes", label: "menit" }
  ];

  const parts = units
    .map(({ key, label }) => {
      const value = duration[key];
      return value ? `${value} ${label}` : null;
    })
    .filter(Boolean)
    .slice(0, 2); // ambil 2 unit teratas

  return parts.join(" ");
}

/**
 * Resolve placeholders in any value (string, array, object) using member and optional invite data.
 * @param {any} input - String, object, atau array yang berisi placeholder
 * @param {GuildMember} member - Member yang baru join
 * @param {Object} inviteData - Data invite opsional
 * @returns {any} - Value dengan placeholder yang sudah diganti
 */
export function resolvePlaceholders(input, member, inviteData = {}) {
  const guild = member.guild;
  const username = member.user.username;
  const mention = `<@${member.id}>`;
  const server = guild.name;
  const memberCount = guild.memberCount;

  const joinDate = format(member.joinedAt, "d MMMM yyyy", { locale: id });
  const accountCreated = formatDurationShort(member.user.createdAt);

  const inviter = inviteData.inviter ? `<@${inviteData.inviter.id}>` : "Unknown";
  const inviteCount = inviteData.inviter?.inviteCount ?? 0;

  const replacements = {
    "{username}": username,
    "{mention}": mention,
    "{server}": server,
    "{membercount}": memberCount.toString(),
    "{joindate}": joinDate,
    "{created}": accountCreated,
    "{inviter}": inviter,
    "{invitercount}": `${inviter} (${inviteCount} invites)`
  };

  const replaceInString = (str) => {
    return Object.entries(replacements).reduce((acc, [key, val]) => {
      const regex = new RegExp(key, "gi");
      return acc.replace(regex, val);
    }, str);
  };

  const resolve = (value) => {
    if (typeof value === "string") return replaceInString(value);
    if (Array.isArray(value)) return value.map((v) => resolve(v));
    if (value && typeof value === "object") {
      const resolved = {};
      for (const [key, val] of Object.entries(value)) {
        resolved[key] = resolve(val);
      }
      return resolved;
    }
    return value;
  };

  return resolve(input);
}