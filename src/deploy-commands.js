import { REST, Routes } from 'discord.js';
import { commands } from './commands/index.js';
import { config } from './config.js';

const rest = new REST({ version: '10' }).setToken(config.token);
const payload = commands.map((command) => command.data.toJSON());

try {
  const route = config.guildId
    ? Routes.applicationGuildCommands(config.clientId, config.guildId)
    : Routes.applicationCommands(config.clientId);

  console.log(
    `Registering ${payload.length} command(s) ${
      config.guildId ? `for guild ${config.guildId}` : 'globally'
    }...`,
  );

  await rest.put(route, { body: payload });
  console.log('Slash commands registered successfully.');
} catch (error) {
  console.error('Failed to register slash commands.');
  console.error(error);
  process.exitCode = 1;
}
