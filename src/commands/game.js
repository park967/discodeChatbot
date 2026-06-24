import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { findGameByName } from '../services/steam.js';

export const data = new SlashCommandBuilder()
  .setName('game')
  .setDescription('Look up basic game information from Steam.')
  .addStringOption((option) =>
    option
      .setName('name')
      .setDescription('Game title to search for.')
      .setRequired(true)
      .setMaxLength(100),
  );

export async function execute(interaction) {
  const name = interaction.options.getString('name', true);

  await interaction.deferReply();

  const game = await findGameByName(name);

  if (!game) {
    await interaction.editReply(`No game found for "${name}".`);
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(game.name)
    .setURL(game.url)
    .setColor(0x1b6fbb)
    .setDescription(game.description || 'No description available.')
    .addFields(
      { name: 'Release date', value: game.releaseDate || 'Unknown', inline: true },
      { name: 'Price', value: game.price || 'Unknown', inline: true },
      { name: 'Developers', value: game.developers || 'Unknown', inline: true },
      { name: 'Genres', value: game.genres || 'Unknown', inline: false },
      { name: 'Platforms', value: game.platforms || 'Unknown', inline: false },
    )
    .setFooter({ text: `Steam App ID: ${game.appId}` });

  if (game.imageUrl) {
    embed.setImage(game.imageUrl);
  }

  await interaction.editReply({ embeds: [embed] });
}
