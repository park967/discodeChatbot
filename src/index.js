import { Client, EmbedBuilder, Events, GatewayIntentBits } from 'discord.js';
import { buttonHandlers, commandMap } from './commands/index.js';
import { config } from './config.js';
import { askGeminiChatbot } from './services/gemini.js';
import { askGameChatbot } from './services/openai.js';
import { findGameByName } from './services/steam.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) {
    try {
      for (const handleButton of buttonHandlers) {
        if (await handleButton(interaction)) return;
      }
    } catch (error) {
      console.error('Error while handling button interaction:', error);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: 'There was an error while handling that button.',
          ephemeral: true,
        });
      }
    }

    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command = commandMap.get(interaction.commandName);

  if (!command) {
    await interaction.reply({
      content: 'Unknown command.',
      ephemeral: true,
    });
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error while running /${interaction.commandName}:`, error);

    const response = {
      content: 'There was an error while running this command.',
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(response);
    } else {
      await interaction.reply(response);
    }
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.guild) return;

  if (isChatbotRequest(message)) {
    await replyWithChatbot(message);
    return;
  }

  if (isGameRecommendationRequest(message.content)) {
    await replyWithGameRecommendation(message);
  }
});

client.login(config.token);

async function replyWithGameRecommendation(message) {
  const recommendation = parseRecommendationRequest(message.content);

  try {
    await message.channel.sendTyping();

    const game =
      (await findGameByName(recommendation.term, recommendation.filters)) ||
      (await findGameByName(recommendation.term));

    if (!game) {
      await message.reply(
        '\uc870\uac74\uc5d0 \ub9de\ub294 \uac8c\uc784\uc744 \ubabb \ucc3e\uc558\uc5b4\uc694. \uc608: "\ud560\uc778\ud558\ub294 \uba40\ud2f0 \uac8c\uc784 \ucd94\ucc9c\ud574\uc918"',
      );
      return;
    }

    await message.reply({
      content: `${recommendation.reason} \uc774 \uac8c\uc784 \uc5b4\ub54c\uc694?`,
      embeds: [buildGameEmbed(game)],
    });
  } catch (error) {
    console.error('Error while recommending a game:', error);
    await message.reply(
      '\uac8c\uc784 \ucd94\ucc9c \uc911\uc5d0 \uc624\ub958\uac00 \ub0ac\uc5b4\uc694. \uc7a0\uc2dc \ud6c4 \ub2e4\uc2dc \ubb3c\uc5b4\ubd10 \uc8fc\uc138\uc694.',
    );
  }
}

async function replyWithChatbot(message) {
  if (!config.geminiApiKey && !config.openaiApiKey) {
    await message.reply(
      'AI API key\uac00 \uc544\uc9c1 \uc5c6\uc5b4\uc694. `.env`\uc5d0 `GEMINI_API_KEY=...` \ub610\ub294 `OPENAI_API_KEY=...`\ub97c \ub123\uace0 \ubd07\uc744 \ub2e4\uc2dc \ucf1c\uc8fc\uc138\uc694.',
    );
    return;
  }

  const prompt = cleanChatbotPrompt(message);

  if (!prompt) {
    await message.reply('\ubb50\uac00 \uad81\uae08\ud55c\uc9c0 \uac19\uc774 \uc801\uc5b4\uc8fc\uba74 \ub2f5\ud560\uac8c\uc694.');
    return;
  }

  try {
    await message.channel.sendTyping();

    const answer = config.geminiApiKey
      ? await askGeminiChatbot(prompt, {
          apiKey: config.geminiApiKey,
          model: config.geminiModel,
        })
      : await askGameChatbot(prompt, {
          apiKey: config.openaiApiKey,
          model: config.openaiModel,
        });

    await message.reply(answer ? limitDiscordMessage(answer) : '\ub2f5\ubcc0\uc744 \ub9cc\ub4e4\uc9c0 \ubabb\ud588\uc5b4\uc694.');
  } catch (error) {
    console.error('Error while running OpenAI chatbot:', error);
    await message.reply(
      'AI \ub2f5\ubcc0 \uc911\uc5d0 \uc624\ub958\uac00 \ub0ac\uc5b4\uc694. API \ud0a4\ub098 \ubaa8\ub378 \uc774\ub984\uc744 \ud655\uc778\ud574 \uc8fc\uc138\uc694.',
    );
  }
}

function isGameRecommendationRequest(content) {
  const normalized = content.replace(/\s+/g, '').toLowerCase();

  return (
    normalized.includes('\uac8c\uc784\ucd94\ucc9c') ||
    normalized.includes('\uac9c\ucd94\ucc9c') ||
    /(?:\uac8c\uc784|\uac9c).*\ucd94\ucc9c|\ucd94\ucc9c.*(?:\uac8c\uc784|\uac9c)/.test(normalized)
  );
}

function isChatbotRequest(message) {
  const content = message.content.trim().toLowerCase();

  return (
    message.mentions.has(client.user) ||
    content.startsWith('gamebot') ||
    content.startsWith('\uac8c\uc784\ubd07') ||
    content.startsWith('\ubd07\uc544')
  );
}

function cleanChatbotPrompt(message) {
  return message.content
    .replaceAll(`<@${client.user.id}>`, '')
    .replaceAll(`<@!${client.user.id}>`, '')
    .replace(/^\s*gamebot\s*/i, '')
    .replace(/^\s*\uac8c\uc784\ubd07\s*/i, '')
    .replace(/^\s*\ubd07\uc544\s*/i, '')
    .trim();
}

function parseRecommendationRequest(content) {
  const normalized = content.toLowerCase();
  const filters = {
    maxPrice: parseMaxPrice(normalized),
    minPrice: null,
    multiplayerOnly: /(\uba40\ud2f0|\uac19\uc774|\uce5c\uad6c|co-?op|coop|multi)/i.test(normalized),
    onSaleOnly: /(\ud560\uc778|\uc138\uc77c|sale)/i.test(normalized),
  };

  const matchedTopic = [
    ['survival', /(\uc0dd\uc874|\uc11c\ubc14\uc774\ubc8c|survival)/i, '\uc0dd\uc874 \uac8c\uc784\uc73c\ub85c \ucc3e\uc544\ubd24\uc5b4\uc694.'],
    ['horror', /(\uacf5\ud3ec|\ud638\ub7ec|horror)/i, '\uacf5\ud3ec \uac8c\uc784\uc73c\ub85c \ucc3e\uc544\ubd24\uc5b4\uc694.'],
    ['rpg', /(rpg|\uc54c\ud53c\uc9c0|\uc5ed\ud560)/i, 'RPG \ucabd\uc73c\ub85c \ucc3e\uc544\ubd24\uc5b4\uc694.'],
    ['strategy', /(\uc804\ub7b5|strategy|\uc2dc\ubbac)/i, '\uc804\ub7b5 \uac8c\uc784\uc73c\ub85c \ucc3e\uc544\ubd24\uc5b4\uc694.'],
    ['roguelike', /(\ub85c\uadf8\ub77c\uc774\ud06c|\ub85c\uadf8\ub77c\uc774\ud2b8|rogue)/i, '\ub85c\uadf8\ub77c\uc774\ud06c \ub290\ub08c\uc73c\ub85c \ucc3e\uc544\ubd24\uc5b4\uc694.'],
    ['co-op', /(\ud611\ub3d9|\ucf54\uc635|co-?op|coop)/i, '\ud611\ub3d9 \uac8c\uc784\uc73c\ub85c \ucc3e\uc544\ubd24\uc5b4\uc694.'],
    ['indie', /(\uc778\ub514|indie)/i, '\uc778\ub514 \uac8c\uc784\uc73c\ub85c \ucc3e\uc544\ubd24\uc5b4\uc694.'],
    ['action', /(\uc561\uc158|action)/i, '\uc561\uc158 \uac8c\uc784\uc73c\ub85c \ucc3e\uc544\ubd24\uc5b4\uc694.'],
  ].find(([, pattern]) => pattern.test(normalized));

  if (matchedTopic) {
    return {
      filters,
      reason: matchedTopic[2],
      term: matchedTopic[0],
    };
  }

  const defaultTerms = ['stardew valley', 'hades', 'terraria', 'deep rock galactic', 'slay the spire'];
  const term = defaultTerms[Math.floor(Math.random() * defaultTerms.length)];

  return {
    filters,
    reason: '\ubb34\ub09c\ud558\uac8c \ucd94\ucc9c\ud560 \ub9cc\ud55c \uac8c\uc784\uc73c\ub85c \uace8\ub77c\ubd24\uc5b4\uc694.',
    term,
  };
}

function parseMaxPrice(content) {
  const tenThousandWonMatch = content.match(/(\d+)\s*\ub9cc\uc6d0/);
  if (tenThousandWonMatch) {
    return Number(tenThousandWonMatch[1]) * 10000;
  }

  const thousandWonMatch = content.match(/(\d+)\s*\ucc9c\uc6d0/);
  if (thousandWonMatch) {
    return Number(thousandWonMatch[1]) * 1000;
  }

  const wonMatch = content.match(/(\d{4,})\s*\uc6d0/);
  if (wonMatch) {
    return Number(wonMatch[1]);
  }

  return null;
}

function buildGameEmbed(game) {
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

  return embed;
}

function limitDiscordMessage(value) {
  if (value.length <= 1900) {
    return value;
  }

  return `${value.slice(0, 1897)}...`;
}
