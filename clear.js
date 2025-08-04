import "dotenv/config";
import { REST, Routes } from "discord.js";

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

(async () => {
  try {
    // 🧹 Hapus command global
    const globalCommands = await rest.get(Routes.applicationCommands(clientId));
    console.log(`🧹 Menghapus ${globalCommands.length} command global...`);

    for (const cmd of globalCommands) {
      await rest.delete(Routes.applicationCommand(clientId, cmd.id));
      console.log(`❌ Global: ${cmd.name} dihapus`);
    }

    // 🧹 Hapus command di server (guild)
    const guildCommands = await rest.get(Routes.applicationGuildCommands(clientId, guildId));
    console.log(`🧹 Menghapus ${guildCommands.length} command dari server...`);

    for (const cmd of guildCommands) {
      await rest.delete(Routes.applicationGuildCommand(clientId, guildId, cmd.id));
      console.log(`❌ Server: ${cmd.name} dihapus`);
    }

    console.log("✅ Semua command sudah dihapus.");
  } catch (err) {
    console.error("❌ Error saat hapus command:", err);
  }
})();