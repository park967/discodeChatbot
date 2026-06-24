const STEAM_SEARCH_URL = 'https://store.steampowered.com/api/storesearch';
const STEAM_DETAILS_URL = 'https://store.steampowered.com/api/appdetails';
const STEAM_APP_URL = 'https://store.steampowered.com/app';

export async function findGameByName(name) {
  const searchResult = await searchSteam(name);
  const firstMatch = searchResult.items?.[0];

  if (!firstMatch?.id) {
    return null;
  }

  const details = await getSteamAppDetails(firstMatch.id);

  return normalizeGame(firstMatch, details);
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
    developers: formatList(details?.developers),
    genres: formatList(details?.genres?.map((genre) => genre.description)),
    platforms: formatPlatforms(details?.platforms),
  };
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

function formatList(items) {
  if (!items?.length) return null;
  return items.slice(0, 5).join(', ');
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
