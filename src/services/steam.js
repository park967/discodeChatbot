const STEAM_SEARCH_URL = 'https://store.steampowered.com/api/storesearch';
const STEAM_DETAILS_URL = 'https://store.steampowered.com/api/appdetails';
const STEAM_APP_URL = 'https://store.steampowered.com/app';

const MULTIPLAYER_CATEGORY_KEYWORDS = [
  'multi-player',
  'multiplayer',
  'co-op',
  'coop',
  'pvp',
  'mmo',
];

export async function findGameByName(name, options = {}) {
  const filters = {
    maxPrice: options.maxPrice ?? null,
    minPrice: options.minPrice ?? null,
    multiplayerOnly: options.multiplayerOnly ?? false,
    onSaleOnly: options.onSaleOnly ?? false,
  };
  const searchResult = await searchSteam(name);
  const maxMatches = hasFilters(filters) ? 20 : 1;
  const matches = searchResult.items?.slice(0, maxMatches) || [];

  for (const match of matches) {
    if (!match?.id) continue;

    const details = await getSteamAppDetails(match.id);
    const game = normalizeGame(match, details);

    if (matchesFilters(game, filters)) {
      return game;
    }
  }

  return null;
}

async function searchSteam(term) {
  const url = new URL(STEAM_SEARCH_URL);
  url.searchParams.set('term', term);
  url.searchParams.set('l', 'koreana');
  url.searchParams.set('cc', 'KR');

  const response = await fetchJson(url);
  return response;
}

async function getSteamAppDetails(appId) {
  const url = new URL(STEAM_DETAILS_URL);
  url.searchParams.set('appids', appId);
  url.searchParams.set('l', 'koreana');
  url.searchParams.set('cc', 'KR');

  const response = await fetchJson(url);
  const entry = response[String(appId)];

  if (!entry?.success) {
    return null;
  }

  return entry.data;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'discord-game-info-bot/0.1',
    },
  });

  if (!response.ok) {
    throw new Error(`Steam API request failed: ${response.status}`);
  }

  return response.json();
}

function normalizeGame(searchResult, details) {
  const appId = searchResult.id;

  return {
    appId,
    name: details?.name || searchResult.name,
    url: `${STEAM_APP_URL}/${appId}`,
    imageUrl: details?.header_image || searchResult.tiny_image || null,
    description: cleanText(details?.short_description),
    releaseDate: details?.release_date?.date || null,
    price: formatPrice(details, searchResult),
    finalPriceKrw: getFinalPriceKrw(details),
    discount: formatDiscount(details),
    discountPercent: details?.price_overview?.discount_percent || 0,
    developers: formatList(details?.developers),
    isMultiplayer: hasMultiplayer(details?.categories),
    multiplayerSummary: formatMultiplayer(details?.categories),
    genres: formatList(details?.genres?.map((genre) => genre.description)),
    platforms: formatPlatforms(details?.platforms),
  };
}

function hasFilters(options) {
  return Boolean(
    options.multiplayerOnly ||
      options.onSaleOnly ||
      options.minPrice !== null ||
      options.maxPrice !== null,
  );
}

function matchesFilters(game, options) {
  if (options.multiplayerOnly && !game.isMultiplayer) {
    return false;
  }

  if (options.onSaleOnly && game.discountPercent <= 0) {
    return false;
  }

  if (options.minPrice !== null && !isPriceAtLeast(game, options.minPrice)) {
    return false;
  }

  if (options.maxPrice !== null && !isPriceAtMost(game, options.maxPrice)) {
    return false;
  }

  return true;
}

function isPriceAtLeast(game, minPrice) {
  return game.finalPriceKrw !== null && game.finalPriceKrw >= minPrice;
}

function isPriceAtMost(game, maxPrice) {
  return game.finalPriceKrw !== null && game.finalPriceKrw <= maxPrice;
}

function cleanText(value) {
  if (!value) return null;

  return value
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

function formatPrice(details, searchResult) {
  if (details?.is_free) {
    return 'Free';
  }

  if (details?.price_overview?.final_formatted) {
    return details.price_overview.final_formatted;
  }

  if (searchResult?.price?.final) {
    return searchResult.price.final;
  }

  return null;
}

function getFinalPriceKrw(details) {
  if (details?.is_free) {
    return 0;
  }

  if (typeof details?.price_overview?.final === 'number') {
    return Math.round(details.price_overview.final / 100);
  }

  return null;
}

function formatDiscount(details) {
  const price = details?.price_overview;

  if (!price?.discount_percent) {
    return null;
  }

  const original = price.initial_formatted || `${Math.round(price.initial / 100)} KRW`;
  const final = price.final_formatted || `${Math.round(price.final / 100)} KRW`;

  return `${price.discount_percent}% off (${original} -> ${final})`;
}

function formatList(items) {
  if (!items?.length) return null;
  return items.slice(0, 5).join(', ');
}

function hasMultiplayer(categories) {
  return getMultiplayerCategories(categories).length > 0;
}

function formatMultiplayer(categories) {
  const multiplayerCategories = getMultiplayerCategories(categories);

  if (!multiplayerCategories.length) {
    return 'No multiplayer tags found';
  }

  return formatList(multiplayerCategories);
}

function getMultiplayerCategories(categories) {
  if (!categories?.length) return [];

  return categories
    .map((category) => category.description)
    .filter((description) => {
      const normalized = description.toLowerCase();
      return MULTIPLAYER_CATEGORY_KEYWORDS.some((keyword) =>
        normalized.includes(keyword),
      );
    });
}

function formatPlatforms(platforms) {
  if (!platforms) return null;

  const names = [
    platforms.windows ? 'Windows' : null,
    platforms.mac ? 'macOS' : null,
    platforms.linux ? 'Linux' : null,
  ].filter(Boolean);

  return formatList(names);
}
