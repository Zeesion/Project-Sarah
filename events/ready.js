import {
  REST,
  Routes,
  version as discordVersion,
  ActivityType
} from "discord.js";
import chalk from "chalk";

export default async (client) => {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  const commandsJSON = Array.from(client.commands.values()).map((cmd) =>
    cmd.data.toJSON()
  );

  try {
    const targetGuild = process.env.GUILD_ID;

    const route = targetGuild
      ? Routes.applicationGuildCommands(process.env.CLIENT_ID, targetGuild)
      : Routes.applicationCommands(process.env.CLIENT_ID);

    await rest.put(route, { body: commandsJSON });

    const app = await client.application.fetch();
    const owner = app.owner;

    // 📋 Informasi Server (jika guild mode)
    let guildName = "Global Command Registration";
    if (targetGuild) {
      const guild = client.guilds.cache.get(targetGuild);
      guildName = guild ? `${guild.name} (${guild.id})` : `Guild ID: ${targetGuild}`;
    }

    // 🎬 Startup Log Detail
    console.log(chalk.bold.hex("#33aaff")("──────────────────────────────────────────────────────"));
    console.log(chalk.hex("#33aaff")("• Bot Aktif Sebagai : ") + chalk.bold.white(client.user.tag));
    console.log(chalk.hex("#33aaff")("• Jumlah Command    : ") + chalk.bold.white(commandsJSON.length));
    console.log(chalk.hex("#33aaff")("• Mode Registrasi   : ") + chalk.bold.white(targetGuild ? "Guild-only" : "Global-wide"));
    console.log(chalk.hex("#33aaff")("• Target Registrasi : ") + chalk.bold.white(guildName));
    console.log(chalk.hex("#33aaff")("• Versi Discord.js  : ") + chalk.bold.white(`v${discordVersion}`));
    console.log(chalk.hex("#33aaff")("• Jumlah Server     : ") + chalk.bold.white(client.guilds.cache.size));
    console.log(chalk.hex("#33aaff")("• Owner Bot         : ") + chalk.bold.white(`@${owner?.username || "Tidak ditemukan"}`));
    console.log(chalk.hex("#33aaff")("• Invite Link       : ") + chalk.underline.greenBright(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=551903390721`));
    console.log(chalk.bold.hex("#33aaff")("──────────────────────────────────────────────────────\n"));

    // 🌀 Status Updater Tiap 5 Menit
    function updateActivity() {
      try {
        const serverCount = client.guilds.cache.size;
        const messages = [
          `/help`,
          `${serverCount} servers`
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        client.user.setActivity(randomMessage, { type: ActivityType.Watching });
      } catch (err) {
        console.error("❌ Gagal set activity:", err);
      }
    }

    updateActivity();
    setInterval(updateActivity, 5 * 30 * 1000);

  } catch (err) {
    console.error("❌ Gagal daftar command:", err);
  }
};