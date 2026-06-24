import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import {
  getBlackjackSession,
  hitBlackjack,
  standBlackjack,
  startBlackjack,
} from '../services/blackjack.js';

const CUSTOM_ID_PREFIX = 'blackjack';

export const data = new SlashCommandBuilder()
  .setName('blackjack')
  .setDescription('Play a simple blackjack game against the dealer.');

export async function execute(interaction) {
  const game = startBlackjack(interaction.user.id);

  await interaction.reply(renderGame(game));
}

export async function handleButton(interaction) {
  if (!interaction.customId.startsWith(`${CUSTOM_ID_PREFIX}:`)) {
    return false;
  }

  const [, action, ownerId] = interaction.customId.split(':');

  if (interaction.user.id !== ownerId) {
    await interaction.reply({
      content: 'Only the player who started this blackjack game can use these buttons.',
      ephemeral: true,
    });
    return true;
  }

  let game = getBlackjackSession(ownerId);

  if (action === 'new') {
    game = startBlackjack(ownerId);
  } else if (!game) {
    await interaction.reply({
      content: 'This blackjack game is no longer active. Start a new one with /blackjack.',
      ephemeral: true,
    });
    return true;
  } else if (action === 'hit') {
    game = hitBlackjack(ownerId);
  } else if (action === 'stand') {
    game = standBlackjack(ownerId);
  }

  await interaction.update(renderGame(game));
  return true;
}

function renderGame(game) {
  const embed = new EmbedBuilder()
    .setTitle('Blackjack')
    .setColor(game.status === 'playing' ? 0x1b6fbb : 0x2f8f46)
    .setDescription(getStatusText(game))
    .addFields(
      {
        name: `Dealer (${game.dealerTotalText})`,
        value: game.dealerText,
      },
      {
        name: `Player (${game.playerTotal})`,
        value: game.playerText,
      },
    );

  return {
    embeds: [embed],
    components: [buildActionRow(game)],
  };
}

function buildActionRow(game) {
  const isPlaying = game.status === 'playing';

  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${CUSTOM_ID_PREFIX}:hit:${game.playerId}`)
      .setLabel('Hit')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(!isPlaying),
    new ButtonBuilder()
      .setCustomId(`${CUSTOM_ID_PREFIX}:stand:${game.playerId}`)
      .setLabel('Stand')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(!isPlaying),
    new ButtonBuilder()
      .setCustomId(`${CUSTOM_ID_PREFIX}:new:${game.playerId}`)
      .setLabel('New Game')
      .setStyle(ButtonStyle.Success),
  );
}

function getStatusText(game) {
  if (game.status === 'playing') {
    return 'Choose Hit to draw a card or Stand to let the dealer play.';
  }

  return game.result;
}
