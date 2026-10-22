import { COLORS } from '../../art/colors.js';
import { bodyPoint } from '../fighters/body-point.js';
import { addRing } from '../fx/effects.js';
import { missionOf } from '../stage/mission.js';

// the horn's mouth, in his own units (body-point.js)
const HORN = { ahead: 10, up: 36 };

// the horn calls the road's raiders in from both sides
export function blowWarHorn(game, boss, count) {
  const kinds = missionOf(game).reinforcements;
  for (let i = 0; i < count; i++) {
    const kind = kinds[(Math.random() * kinds.length) | 0];
    game.stage.spawnQueue.push({ kind, side: i % 2 ? 1 : -1, delay: 20 + i * 24 });
  }
  game.stage.reinforcementTimer = 0;
  addRing(game, { ...bodyPoint(boss, HORN), color: COLORS.gold, big: true });
  game.io.sfx('warHorn', false, { x: boss.x });
}
