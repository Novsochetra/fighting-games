import { COLORS } from '../../art/colors.js';
import { arenaBounds } from '../fighters/arena-bounds.js';
import { GRAVITY } from '../fighters/physics.js';
import { floorUnder } from '../fighters/terrain-motion.js';
import { shake } from '../fx/camera-fx.js';
import { addFloatText } from '../fx/effects.js';
import { markPounce } from '../hazards/pounce-mark.js';
import { floorBelow } from '../stage/terrain.js';
import { addBurst } from '../summons/bursts.js';

const MOUTH = { ahead: 12, up: 52 };
const EYES = { ahead: 26, up: 40 };

// the howl rings out from his throat, and the pack answers from both sides of the screen
export function howl(game, boss, move, time) {
  const x = boss.x + boss.facing * MOUTH.ahead;
  addBurst(game, { sprite: 'howl', x, y: boss.y - MOUTH.up, scale: 1 });
  if (time !== move.howls[0]) {
    return;
  }
  for (let i = 0; i < move.pack; i++) {
    game.stage.spawnQueue.push({ kind: 'hound', side: i % 2 ? 1 : -1, delay: 30 + i * 20 });
  }
  game.stage.reinforcementTimer = 0;
  game.io.sfx('howl', false, { x: boss.x });
}

// he springs at the spot the hero stands on as he leaves the ground, marked there till he lands
export function leap(game, boss, move) {
  const bounds = arenaBounds(game, boss);
  const target = Math.min(bounds.max, Math.max(bounds.min, game.player.x));
  const flight = move.startup - move.leapAt;
  boss.facing = target >= boss.x ? 1 : -1;
  Object.assign(boss, {
    vx: (target - boss.x) / flight,
    vy: (-GRAVITY * (flight + 1)) / 2,
    airborne: true,
  });
  const y = floorBelow(game.terrain, target, boss.y);
  markPounce(game, { x: target, y, side: boss.side, life: flight });
  game.io.sfx('jump', false, { x: boss.x });
}

export function smashBones(game, boss) {
  const y = floorUnder(game.terrain, boss);
  const x = boss.x + boss.facing * 14;
  addBurst(game, { sprite: 'bones', x, y, scale: 1, direction: boss.facing });
  shake(game, 5, 14);
}

// his eyes leave a red streak behind him as he lunges
export function trailEyes(game, boss, move, time) {
  if ((time - move.startup) % 2 === 0) {
    const x = boss.x + boss.facing * EYES.ahead;
    addBurst(game, {
      sprite: 'redeye',
      x,
      y: boss.y - EYES.up,
      scale: 1,
      direction: -boss.facing,
    });
  }
}

// a lunge that draws blood feeds him, once a lunge
export function feed(game, boss, move, time) {
  if (time === 0) {
    boss.ai.fed = false;
  }
  if (!boss.hitConfirmed || boss.ai.fed) {
    return;
  }
  const healed = Math.min(boss.maxHp - boss.hp, move.heals);
  boss.ai.fed = true;
  boss.hp += healed;
  addFloatText(game, { x: boss.x, y: boss.y - 60, text: `+${healed}`, color: COLORS.scarlet });
}
