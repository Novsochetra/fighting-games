import { COVERING_GEAR, GEAR_TONES } from '../../../art/face-kit/index.js';
import { composeKitFace } from './compose.js';
import { kitLookOf } from './looks.js';
import { kitMoodOf } from './moods.js';
import { facePart, facialPart, gearPart, hairPart, moodsOf } from './parts.js';

export { KIT_MOOD_NAMES } from './moods.js';
export { kitLookOf } from './looks.js';

const toneOf = (tone, palette) =>
  GEAR_TONES[tone] ?? [palette.clothLight, palette.cloth, palette.clothShade, palette.clothDeep];

// a hat or band takes the accent letters, which no face in the kit uses; with none on, they stay
// what the recipe has, a keeper's glove cuffs among them
export function gearColours(tone, palette) {
  if (!tone) {
    return {};
  }

  const [accentPale, accentLight, accent, accentShade] = toneOf(tone, palette);

  return { accentPale, accentLight, accent, accentShade };
}

export function kitGridFor(request) {
  const look = kitLookOf(request);

  if (!look) {
    return null;
  }

  const mood = kitMoodOf(request.mood, moodsOf(look.face));
  const grid = composeKitFace({
    face: facePart(look.face, mood),
    facial: look.facial ? facialPart(look.facial) : null,
    hair: look.hair ? hairPart(look.hair) : null,
    gear: look.gear ? gearPart(look.gear) : null,
    covers: COVERING_GEAR.has(look.gear),
  });

  return { grid, tone: look.gear ? (look.tone ?? 'kit') : null };
}
