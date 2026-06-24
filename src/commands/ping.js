import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Check whether the bot is online.');

export async function execute(interaction) {
  const sent = await interaction.reply({
    content: 'Pinging...',
    fetchReply: true,
  });

  await interaction.editReply(
    `Pong! WebSocket: ${interaction.client.ws.ping}ms, round trip: ${
      sent.createdTimestamp - interaction.createdTimestamp
    }ms`,
  );
}
