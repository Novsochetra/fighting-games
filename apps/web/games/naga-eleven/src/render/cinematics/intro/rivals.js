import { CHARACTERS } from '../../../data/characters.js';

export const RIVAL_TAGS = {
  rithy: { en: 'The Phnom Penh star', km: 'តារាភ្នំពេញ' },
  haruto: { en: "Japan's playmaker", km: 'អ្នករៀបចំល្បែងរបស់ជប៉ុន' },
  minjun: { en: "Korea's engine", km: 'ម៉ាស៊ីនកណ្ដាលទីរបស់កូរ៉េ' },
  farhad: { en: "Iran's giant keeper", km: 'អ្នកចាំទីយក្សរបស់អ៊ីរ៉ង់' },
  rafael: { en: "Brazil's joyful genius", km: 'ទេពកោសល្យដ៏រីករាយរបស់ប្រេស៊ីល' },
  lukas: { en: "Germany's iron defender", km: 'ខ្សែការពារដែករបស់អាល្លឺម៉ង់' },
};

const STAR_TAG = { en: 'The star to stop', km: 'តារាដែលត្រូវទប់ស្កាត់' };

const starOf = (team, character) =>
  (team?.players ?? []).find((player) => player.star === character);

// the rival plays for the side whose squad has them; with no squads given, the away side
function sideOf(character, teams) {
  const side = teams.findIndex((team) => starOf(team, character));

  return side === -1 ? 1 : side;
}

function defaultsOf({ character, side: chosen }, teams) {
  const side = chosen ?? sideOf(character, teams);

  return {
    mood: 'smirk',
    name: CHARACTERS[character]?.name ?? character,
    tag: RIVAL_TAGS[character] ?? STAR_TAG,
    side,
    number: starOf(teams[side], character)?.number ?? null,
  };
}

const given = (spec) =>
  Object.fromEntries(Object.entries(spec).filter(([, value]) => value !== undefined));

// `rival` is a character id or { character, age, mood, name, tag, side, number }; null for none
export function rivalOf(rival, teams = []) {
  const spec = typeof rival === 'string' ? { character: rival } : rival;

  if (!spec?.character) {
    return null;
  }

  return { age: undefined, ...defaultsOf(spec, teams), ...given(spec) };
}
