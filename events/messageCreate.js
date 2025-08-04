import { handleMessage } from "../helpers/messagePipeline.js";

export default async (client, message) => {
  // Ignore bot messages or empty content
  if (message.author.bot || !message.content) return;

  await handleMessage(client, message);
};