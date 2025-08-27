import { intervalToDuration } from "date-fns";

/**
 * Format durasi dari timestamp ke bentuk pendek seperti "2 bulan 24 hari"
 * @param {Date} from - Tanggal awal
 * @param {Date} to - Tanggal akhir (default: sekarang)
 * @returns {string} - Format durasi pendek
 */
function formatDurationShort(from, to = new Date()) {
  const duration = intervalToDuration({ start: from, end: to });

  const units = [
    { key: "years", label: "years" },
    { key: "months", label: "months" },
    { key: "days", label: "days" },
    { key: "hours", label: "hours" },
    { key: "minutes", label: "minutes" },
    { key: "seconds", label: "seconds" }
  ];

  const parts = units
    .map(({ key, label }) => {
      const value = duration[key];
      return value ? `${value} ${label}` : null;
    })
    .filter(Boolean)
    .slice(0, 2); // ambil 1 unit teratas

  return parts.join(", ");
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
  const userId = member.id;
  const mention = `<@${member.id}>`;
  const server = guild.name;
  const memberCountRaw = guild.memberCount;
  const memberCount = memberCountRaw.toString();

  // Inline ordinal logic
  const suffixes = ["th", "st", "nd", "rd"];
  const v = memberCountRaw % 100;
  const ordinalSuffix = suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  const memberOrdinal = `${memberCountRaw}${ordinalSuffix}`;

  const joinDate = member.joinedAt
    ? formatDurationShort(member.joinedAt)
    : "Unknown";

  const accountCreated = member.user.createdAt
    ? formatDurationShort(member.user.createdAt)
    : "Unknown";

  const inviter = inviteData.inviter ? `<@${inviteData.inviter.id}>` : "Unknown";
  const inviteCount = inviteData.inviteCount ?? 0;

  const roles = member.roles?.cache
    .filter(role => role.id !== guild.id)
    .map(role => `<@&${role.id}>`) // ini akan tampil dengan warna role di Discord UI
    .join(", ") || "";

  const replacements = {
    "{status}": inviteData.status,
    "{username}": username,
    "{userid}": userId,
    "{mention}": mention,
    "{server}": server,
    "{membercount}": memberCount,
    "{memberordinal}": memberOrdinal,
    "{joindate}": joinDate,
    "{created}": accountCreated,
    "{inviter}": inviter,
    "{invitecount}": inviteCount.toString(),
    "{roles}": roles
  };

  const replaceInString = (str) => {
    return Object.entries(replacements)
      .sort(([a], [b]) => b.length - a.length)
      .reduce((acc, [key, val]) => {
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