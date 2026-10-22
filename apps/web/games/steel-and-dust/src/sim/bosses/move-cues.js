import { spawnCrescent } from '../hazards/crescents.js';
import { addBurst } from '../summons/bursts.js';
import { announceBossUltimate } from './announce.js';
import { blowWarHorn } from './war-horn.js';

// the light catches the blade drawn back behind the boss, a beat before it springs
function glint(game, fighter) {
  const x = fighter.x - fighter.facing * 18;
  addBurst(game, { sprite: 'glint', x, y: fighter.y - 14, scale: 1 });
}

// a boss move's own beats, each on the tick its data names
export function playMoveCues(game, fighter, move, time) {
  if (time === move.glint) {
    glint(game, fighter);
  }
  if (time === 0 && move.bossUltimate) {
    announceBossUltimate(game, fighter, move);
  }
  if (time === move.startup && move.horn) {
    blowWarHorn(game, fighter, move.horn);
  }
  if (move.crescents?.includes(time)) {
    spawnCrescent(game, fighter);
  }
}
