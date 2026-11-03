import { SAVE_CAM_ASIA } from '../../../../art/save-cam/venues/asia.js';
import { hash } from '../../../duel/hash.js';
import { packAll } from '../../../venues/kit/colour.js';
import { paintGround, paintLines } from '../ground.js';
import { chalkOf, pitchAt } from '../pitch.js';
import { paintFloodlights, paintNightRoof } from './roof.js';
import { BOARDS, LOWER, paintPanels, paintTiers, UPPER } from './stand.js';

// The Asian Youth Championship by night, behind the goal: the venue's bowl under its starry sky,
// the floodlights along its roof, its two tiers and the LED ring between them, its boards and its
// pitch lit bright in the middle and falling off to the sides. Cameras flash in the crowd
const art = packAll(SAVE_CAM_ASIA);

const light = ({ across }) => 1 - Math.min(1.2, (across / 10) ** 2);

function paint(raster, frame) {
  paintNightRoof(raster, art);
  paintTiers(raster, { art, frame });
  paintFloodlights(raster, art);
  paintPanels(raster, { art, frame });
  paintGround(raster, (spot, column, row) => pitchAt(spot, column, row, { art, light }), {
    top: BOARDS.bottom,
  });
  paintLines(raster, chalkOf(art));
}

const TIERS = [UPPER, LOWER];

// now and then a camera flashes somewhere up the stand, a pixel or two of white
function live(pen, { tick }) {
  for (let i = 0; i < 3; i += 1) {
    const beat = Math.floor(tick / 3) + i * 7;

    if (hash(i, beat, 211) < 0.3) {
      const tier = TIERS[Math.floor(hash(i, beat, 212) * 2)];
      const x = Math.floor(hash(i, beat, 213) * 256);
      const y = tier.top + Math.floor(hash(i, beat, 214) * tier.rows) * tier.pitch;

      pen.rect([x, y, tier.size - 1 || 1, tier.size - 1 || 1], SAVE_CAM_ASIA.lamp);
    }
  }
}

export const ASIA_BACKDROP = {
  id: 'asia-stadium',
  paint,
  live,
  frameOf: (ticks) => (Math.floor(ticks / 12) % 3 === 2 ? 1 : 0),
  sky: 'night',
  goal: { ...SAVE_CAM_ASIA.goal, bamboo: false },
};
