import 'dotenv/config';

const requiredVariables = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID'];

for (const name of requiredVariables) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

export const config = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  guildId: process.env.DISCORD_GUILD_ID || null,
};
