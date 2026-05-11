export const atlanticTownCities = [
  'Amherst, NS',
  'Antigonish, NS',
  'Bathurst, NB',
  'Bedford, NS',
  'Bridgewater, NS',
  'Campbellton, NB',
  'Charlottetown, PE',
  'Clarenville, NL',
  'Conception Bay South, NL',
  'Corner Brook, NL',
  'Cornwall, PE',
  'Dartmouth, NS',
  'Dieppe, NB',
  'Edmundston, NB',
  'Fredericton, NB',
  'Gander, NL',
  'Grand Falls-Windsor, NL',
  'Halifax, NS',
  'Happy Valley-Goose Bay, NL',
  'Kensington, PE',
  'Kentville, NS',
  'Labrador City, NL',
  'Miramichi, NB',
  'Moncton, NB',
  'Montague, PE',
  'Mount Pearl, NL',
  'New Glasgow, NS',
  'New Minas, NS',
  'Oromocto, NB',
  'Quispamsis, NB',
  'Riverview, NB',
  'Rothesay, NB',
  'Sackville, NB',
  'Saint John, NB',
  'Shediac, NB',
  'Souris, PE',
  "St. John's, NL",
  'Stephenville, NL',
  'Stratford, PE',
  'Summerside, PE',
  'Sussex, NB',
  'Sydney, NS',
  'Truro, NS',
  'Wolfville, NS',
  'Woodstock, NB',
  'Yarmouth, NS',
] as const;

const atlanticTownCitySet = new Set(atlanticTownCities);

const atlanticTownCitiesByCity = new Map<string, AtlanticTownCity[]>();
for (const townCity of atlanticTownCities) {
  const cityName = townCity.split(',')[0]?.trim().toLowerCase() ?? '';
  const entries = atlanticTownCitiesByCity.get(cityName) ?? [];
  entries.push(townCity);
  atlanticTownCitiesByCity.set(cityName, entries);
}

export type AtlanticTownCity = (typeof atlanticTownCities)[number];

export function normalizeAtlanticTownCity(value: string): AtlanticTownCity | null {
  const trimmedValue = value.trim();
  if (atlanticTownCitySet.has(trimmedValue as AtlanticTownCity)) {
    return trimmedValue as AtlanticTownCity;
  }

  const cityMatches = atlanticTownCitiesByCity.get(trimmedValue.toLowerCase()) ?? [];
  return cityMatches.length === 1 ? cityMatches[0] : null;
}

export function isCanonicalAtlanticTownCity(value: string): value is AtlanticTownCity {
  return atlanticTownCitySet.has(value.trim() as AtlanticTownCity);
}

export function topAtlanticTownCitySearchResult(query: string): AtlanticTownCity | null {
  return filterAtlanticTownCities(query)[0] ?? null;
}

export function isKnownAtlanticTownCity(value: string): value is AtlanticTownCity {
  return normalizeAtlanticTownCity(value) !== null;
}

export function filterAtlanticTownCities(query: string): AtlanticTownCity[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [...atlanticTownCities];

  return atlanticTownCities.filter((townCity) => townCity.toLowerCase().includes(normalizedQuery));
}
