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
  )
  .addBooleanOption((option) =>
    option
      .setName('multiplayer')
      .setDescription('Only return a game that supports multiplayer.'),
  );

export async function execute(interaction) {
  const name = interaction.options.getString('name', true);
  const multiplayerOnly = interaction.options.getBoolean('multiplayer') ?? false;

  await interaction.deferReply();

  const game = await findGameByName(name, { multiplayerOnly });

  if (!game) {
    await interaction.editReply(
      multiplayerOnly
        ? `No multiplayer game found for "${name}".`
        : `No game found for "${name}".`,
    );
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
      { name: 'Multiplayer', value: game.multiplayerSummary, inline: false },
      { name: 'Genres', value: game.genres || 'Unknown', inline: false },
      { name: 'Platforms', value: game.platforms || 'Unknown', inline: false },
    )
    .setFooter({ text: `Steam App ID: ${game.appId}` });

  if (game.imageUrl) {
    embed.setImage(game.imageUrl);
  }

  await interaction.editReply({ embeds: [embed] });
}
