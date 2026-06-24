import { Client, Events, GatewayIntentBits } from 'discord.js';
import { buttonHandlers, commandMap } from './commands/index.js';
import { config } from './config.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
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

client.login(config.token);
