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
  )
  .addIntegerOption((option) =>
    option
      .setName('min_price')
      .setDescription('Minimum discounted price in KRW.')
      .setMinValue(0),
  )
  .addIntegerOption((option) =>
    option
      .setName('max_price')
      .setDescription('Maximum discounted price in KRW.')
      .setMinValue(0),
  )
  .addBooleanOption((option) =>
    option
      .setName('on_sale')
      .setDescription('Only return a game that is currently discounted.'),
  );

export async function execute(interaction) {
  const name = interaction.options.getString('name', true);
  const multiplayerOnly = interaction.options.getBoolean('multiplayer') ?? false;
  const minPrice = interaction.options.getInteger('min_price');
  const maxPrice = interaction.options.getInteger('max_price');
  const onSaleOnly = interaction.options.getBoolean('on_sale') ?? false;

  await interaction.deferReply();

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    await interaction.editReply('min_price must be less than or equal to max_price.');
    return;
  }

  const game = await findGameByName(name, {
    maxPrice,
    minPrice,
    multiplayerOnly,
    onSaleOnly,
  });

  if (!game) {
    await interaction.editReply(`No game found for "${name}" with those filters.`);
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
      { name: 'Discount', value: game.discount || 'None', inline: true },
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
