import {
  REST,
  Routes,
  version as discordVersion,
  ActivityType
} from "discord.js";
import chalk from "chalk";
import gradient from "gradient-string";

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

    // 🌈 Gradient Header
    const header = gradient(["#6662f5", "#716df8", "#7d78fa", "#8a84fb"]);
    console.log(header(`\n👋 ${client.user.displayName} is waking up...\n`));

    // 📋 Informasi Server (jika guild mode)
    let guildName = "Global Command Registration";
    if (targetGuild) {
      const guild = client.guilds.cache.get(targetGuild);
      guildName = guild ? `${guild.name} (${guild.id})` : `Guild ID: ${targetGuild}`;
    }

    // 🎬 Startup Log Detail
    console.log(chalk.bold.hex("#a6a1ff")("Startup Log ───────────────────────────────"));
    console.log(chalk.hex("#8a84fb")("• Bot Aktif Sebagai : ") + chalk.hex("#acaac7")(client.user.tag));
    console.log(chalk.hex("#8a84fb")("• Jumlah Command    : ") + chalk.hex("#acaac7")(commandsJSON.length));
    console.log(chalk.hex("#8a84fb")("• Mode Registrasi   : ") + chalk.hex("#acaac7")(targetGuild ? "Guild-only" : "Global-wide"));
    console.log(chalk.hex("#8a84fb")("• Target Registrasi : ") + chalk.hex("#acaac7")(guildName));
    console.log(chalk.hex("#8a84fb")("• Versi Discord.js  : ") + chalk.hex("#acaac7")(`v${discordVersion}`));
    console.log(chalk.hex("#8a84fb")("• Jumlah Server     : ") + chalk.hex("#acaac7")(client.guilds.cache.size));
    console.log(chalk.hex("#8a84fb")("• Owner Bot         : ") + chalk.hex("#acaac7")(`@${owner?.username || "Tidak ditemukan"}`));
    console.log(chalk.hex("#8a84fb")("• Invite Link       : ") +
      chalk.underline.hex("#42f5b3")(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=551903390721`)
    );
    console.log(chalk.bold.hex("#a6a1ff")("────────────────────────────────────────────\n"));

    // 🌀 Status Updater Tiap 5 Menit
    function updateActivity() {
      try {
        const serverCount = client.guilds.cache.size;
        const messages = [
          `/help • sarah ❤️`,
          `${serverCount} servers 🤖`
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