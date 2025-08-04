import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Client, Collection, GatewayIntentBits } from "discord.js";

// Path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Client setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

// Load command files
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const commandPath = path.join(commandsPath, file);
  const commandUrl = pathToFileURL(commandPath);
  const command = await import(commandUrl.href);

  if (command.default?.data && command.default?.execute) {
    client.commands.set(command.default.data.name, command.default);
  } else {
    console.warn(`❗ Command ${file} tidak valid.`);
  }
}

// Load event files
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
  const eventPath = path.join(eventsPath, file);
  const eventUrl = pathToFileURL(eventPath);
  const handler = await import(eventUrl.href);
  const eventName = file.split(".")[0];

  client.on(eventName, (...args) => handler.default(client, ...args));
}

// Login
client.login(process.env.DISCORD_TOKEN);