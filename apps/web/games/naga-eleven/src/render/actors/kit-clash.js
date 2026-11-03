import { KEEPER_SPARES, KITS, PLAIN_KITS } from '../../art/kits.js';

// two shirts closer than this look alike from the stand (Chrey's blue and Riverside's teal, at
// 115, read as one side)
const CLASH = 130;

const channels = (hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));

// "redmean": a cheap distance between colours that weighs them roughly as the eye does
export function colourGap(first, second) {
  const [red1, green1, blue1] = channels(first);
  const [red2, green2, blue2] = channels(second);
  const redMean = (red1 + red2) / 2;
  const [red, green, blue] = [red1 - red2, green1 - green2, blue1 - blue2];

  return Math.sqrt(
    (2 + redMean / 256) * red * red + 4 * green * green + (2 + (255 - redMean) / 256) * blue * blue,
  );
}

const baseOf = (ramp) => ramp[Math.min(2, ramp.length - 1)];

export const looksAlike = (first, second) =>
  colourGap(baseOf(first.shirt), baseOf(second.shirt)) < CLASH;

const kitSetOf = (team, side) => KITS[team?.kit] ?? KITS[team?.id] ?? PLAIN_KITS[side];

function outfieldChoices(first, second) {
  if (!looksAlike(first.home, second.home)) {
    return ['home', 'home'];
  }

  return looksAlike(first.home, second.away) ? ['away', 'home'] : ['home', 'away'];
}

// a keeper dressed like either side's outfield or the other keeper changes into the first spare
// that stands apart from all three, as a keeper stands among the other side's forwards
function keeperOf(own, others) {
  const clashes = (kit) => others.some((other) => looksAlike(kit, other));

  if (!clashes(own)) {
    return { keeper: own, keeperChoice: 'keeper' };
  }

  const spare = KEEPER_SPARES.findIndex((kit) => !clashes(kit));

  return spare < 0
    ? { keeper: own, keeperChoice: 'keeper' }
    : { keeper: KEEPER_SPARES[spare], keeperChoice: `keeper-${spare}` };
}

// the side listed second changes into its away kit when the two home kits look alike; and if
// that one clashes too, the first side changes instead; of the keepers, the second changes first
export function matchKits(match) {
  const sets = [0, 1].map((side) => kitSetOf(match.teams?.[side], side));
  const choices = outfieldChoices(...sets);
  const outfields = choices.map((choice, side) => sets[side][choice]);
  const second = keeperOf(sets[1].keeper, [...outfields, sets[0].keeper]);
  const first = keeperOf(sets[0].keeper, [...outfields, second.keeper]);

  return [first, second].map((keeper, side) => ({
    choice: choices[side],
    outfield: outfields[side],
    ...keeper,
    id: match.teams?.[side]?.kit ?? `plain-${side}`,
  }));
}
