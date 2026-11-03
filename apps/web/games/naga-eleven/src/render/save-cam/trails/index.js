import { wings } from './beasts.js';
import { bolt, flame, river, streak } from './lines.js';
import { coils, twinCoils, windCoils } from './naga.js';
import { smoothTrail } from './path.js';
import { heads } from './seven-naga.js';
import { blade, crescent, eclipse, horns, kite } from './shapes.js';
import { wave } from './wave.js';

// each look's shot, flying away from the camera into the goal, as its trail seen from behind
const TRAILS = {
  naga: coils,
  'twin-naga': twinCoils,
  'seven-naga': heads,
  'flying-naga': windCoils,
  garuda: wings,
  'storm-garuda': wings,
  moon: crescent,
  eclipse,
  sword: blade,
  rocket: flame,
  kouprey: horns,
  mekong: river,
  'tonle-sap': wave,
  wave,
  lightning: bolt,
  kite,
  plain: streak,
};

export const TRAIL_LOOKS = Object.keys(TRAILS);

export function drawCamTrail(pen, { points, look, art, tick }) {
  if (points.length < 2) {
    return;
  }

  (TRAILS[look] ?? streak)(pen, { points: smoothTrail(points), art, tick });
}
