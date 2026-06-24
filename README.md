# Discord Game Info Chatbot

A Discord slash-command bot that can look up basic game information.

## Requirements

- Node.js 22.12.0 or newer
- A Discord application and bot token from the Discord Developer Portal

## Setup

1. Install dependencies:

   ```bash
   npm.cmd install
   ```

2. Copy `.env.example` to `.env`, then fill in:

   ```env
   DISCORD_TOKEN=...
   DISCORD_CLIENT_ID=...
   DISCORD_GUILD_ID=...
   ```

3. Register slash commands:

   ```bash
   npm.cmd run deploy
   ```

4. Start the bot:

   ```bash
   npm.cmd run dev
   ```

## Commands

- `/ping` checks whether the bot is online.
- `/echo text:<message>` repeats a message privately.
- `/game name:<game title>` searches Steam and returns basic game information.
- `/game name:<game title> multiplayer:true` searches for a multiplayer-supported match.

If `DISCORD_GUILD_ID` is set, commands are registered only to that server and usually update quickly. If it is omitted, commands are registered globally and may take longer to appear.

## Notes

The `/game` command uses Steam's public store endpoints, so it does not need a separate game API key. If you want richer data later, you can replace `src/services/steam.js` with another provider such as RAWG, IGDB, or Steam Web API.
