import { CINE, FALLBACK_KITS } from '../../../art/cinematics/palette.js';
import { colourGap, matchKits } from '../../actors/kit-clash.js';

// a shirt as dark as the graphics' navy panels (black, navy) vanished on them: its side's bars,
// plates and sash take the kit's trim instead, or silver when the trim is lost or matches the
// other side's shirt
const SINKS_UNDER = 130;

const sinks = (ramp) => colourGap(ramp[2], CINE.panel[1]) < SINKS_UNDER;

function bandOf(kit, other) {
  if (!sinks(kit.shirt)) {
    return kit.shirt;
  }

  const matches = colourGap(kit.trim[2], other.shirt[2]) < SINKS_UNDER;

  return sinks(kit.trim) || matches ? CINE.silver : kit.trim;
}

// each side's kit as the pitch shows it, the away side changing when the two would clash, with
// `band`, the ramp the graphics paint that side in
export function kitsOf(teams) {
  const kits = matchKits({ teams });
  const outfields = [0, 1].map((side) => kits[side]?.outfield ?? FALLBACK_KITS[side]);

  return outfields.map((kit, side) => ({ ...kit, band: bandOf(kit, outfields[1 - side]) }));
}

const shortOf = (team, side) => team?.short ?? ['HOM', 'AWY'][side];

// what the graphics need of a team: its names, never the live team object
export const teamCard = (team, side) => ({
  id: team?.id ?? null,
  name: team?.name ?? shortOf(team, side),
  short: shortOf(team, side),
  kit: team?.kit ?? null,
});

// the letters of the SHIRT pixel map (src/art/cinematics/icons.js) in a kit's shades
export const shirtColours = (kit) => ({
  O: CINE.ink,
  L: kit.shirt[3],
  S: kit.shirt[2],
  D: kit.shirt[1],
  T: kit.trim[2],
});
