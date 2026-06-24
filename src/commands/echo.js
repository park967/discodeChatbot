import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('echo')
  .setDescription('Repeat a message privately.')
  .addStringOption((option) =>
    option
      .setName('text')
      .setDescription('The text to repeat.')
      .setRequired(true),
  );

export async function execute(interaction) {
  const text = interaction.options.getString('text', true);

  await interaction.reply({
    content: text,
    ephemeral: true,
  });
}
