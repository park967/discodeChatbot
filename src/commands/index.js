import * as echo from './echo.js';
import * as game from './game.js';
import * as blackjack from './blackjack.js';
import * as ping from './ping.js';

export const commands = [ping, echo, game, blackjack];

export const commandMap = new Map(
  commands.map((command) => [command.data.name, command]),
);

export const buttonHandlers = commands
  .filter((command) => typeof command.handleButton === 'function')
  .map((command) => command.handleButton);
