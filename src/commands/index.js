import * as echo from './echo.js';
import * as game from './game.js';
import * as ping from './ping.js';

export const commands = [ping, echo, game];

export const commandMap = new Map(
  commands.map((command) => [command.data.name, command]),
);
