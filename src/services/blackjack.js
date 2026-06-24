const sessions = new Map();
const suits = ['S', 'H', 'D', 'C'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function startBlackjack(playerId) {
  const game = {
    playerId,
    deck: shuffle(createDeck()),
    dealer: [],
    player: [],
    status: 'playing',
    result: null,
  };

  draw(game.player, game.deck);
  draw(game.dealer, game.deck);
  draw(game.player, game.deck);
  draw(game.dealer, game.deck);

  settleOpeningBlackjack(game);
  sessions.set(playerId, game);

  return toView(game);
}

export function getBlackjackSession(playerId) {
  const game = sessions.get(playerId);
  return game ? toView(game) : null;
}

export function hitBlackjack(playerId) {
  const game = requireActiveGame(playerId);

  draw(game.player, game.deck);

  if (getHandValue(game.player) > 21) {
    game.status = 'finished';
    game.result = 'Bust. Dealer wins.';
  }

  return toView(game);
}

export function standBlackjack(playerId) {
  const game = requireActiveGame(playerId);

  while (getHandValue(game.dealer) < 17) {
    draw(game.dealer, game.deck);
  }

  game.status = 'finished';
  game.result = decideWinner(game);

  return toView(game);
}

function requireActiveGame(playerId) {
  const game = sessions.get(playerId);

  if (!game || game.status !== 'playing') {
    throw new Error('No active blackjack game found.');
  }

  return game;
}

function settleOpeningBlackjack(game) {
  const playerBlackjack = isBlackjack(game.player);
  const dealerBlackjack = isBlackjack(game.dealer);

  if (!playerBlackjack && !dealerBlackjack) {
    return;
  }

  game.status = 'finished';

  if (playerBlackjack && dealerBlackjack) {
    game.result = 'Both have blackjack. Push.';
  } else if (playerBlackjack) {
    game.result = 'Blackjack. You win.';
  } else {
    game.result = 'Dealer has blackjack. Dealer wins.';
  }
}

function decideWinner(game) {
  const playerTotal = getHandValue(game.player);
  const dealerTotal = getHandValue(game.dealer);

  if (dealerTotal > 21) {
    return 'Dealer busts. You win.';
  }

  if (playerTotal > dealerTotal) {
    return 'You win.';
  }

  if (playerTotal < dealerTotal) {
    return 'Dealer wins.';
  }

  return 'Push.';
}

function createDeck() {
  return suits.flatMap((suit) => ranks.map((rank) => ({ rank, suit })));
}

function shuffle(cards) {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function draw(hand, deck) {
  const card = deck.pop();

  if (!card) {
    throw new Error('The blackjack deck is empty.');
  }

  hand.push(card);
}

function getHandValue(hand) {
  let total = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.rank === 'A') {
      total += 11;
      aces += 1;
    } else if (['K', 'Q', 'J'].includes(card.rank)) {
      total += 10;
    } else {
      total += Number(card.rank);
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

function isBlackjack(hand) {
  return hand.length === 2 && getHandValue(hand) === 21;
}

function toView(game) {
  const revealDealer = game.status !== 'playing';
  const visibleDealer = revealDealer ? game.dealer : [game.dealer[0]];

  return {
    playerId: game.playerId,
    status: game.status,
    result: game.result,
    dealerText: formatHand(visibleDealer, revealDealer ? null : 'Hidden'),
    dealerTotalText: revealDealer ? String(getHandValue(game.dealer)) : '?',
    playerText: formatHand(game.player),
    playerTotal: getHandValue(game.player),
  };
}

function formatHand(hand, hiddenLabel = null) {
  const cards = hand.map((card) => `${card.rank}${card.suit}`);

  if (hiddenLabel) {
    cards.push(hiddenLabel);
  }

  return cards.join('  ');
}
