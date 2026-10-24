import { WEAPONS } from '../../data/weapons/index.js';
import { randomBetween } from '../../lib/math.js';
import { enemySpriteFrame } from '../enemy-animation.js';
import { addDust } from '../fx/particles.js';
import { RUN_STRIDE_TICKS, heroAnimation } from '../hero-animation.js';
import { isPlayer } from './loadout.js';
import { floorUnder } from './terrain-motion.js';

const RUN_WIND_TICKS = 6;

// a few spaced echoes, not one per tick
function wantsAfterimage(fighter) {
  if (fighter.state === 'dash') {
    return fighter.stateTime % 4 === 1 && fighter.stateTime < 14;
  }
  const move = fighter.move;
  return (
    fighter.state === 'attack' &&
    move &&
    move.afterimages &&
    fighter.hitboxActive &&
    fighter.animTime % 3 === 0
  );
}

function addAfterimage(fighter) {
  fighter.afterimages.push({
    x: fighter.x,
    y: fighter.y,
    joints: fighter.joints,
    facing: fighter.facing,
    pose: fighter.pose,
    sprite: isPlayer(fighter) ? heroAnimation(fighter) : enemySpriteFrame(fighter),
    row: isPlayer(fighter) ? WEAPONS[fighter.weapon.id].spriteRow : 0,
    life: 12,
    ghost: fighter.move?.ghost,
  });
}

function addWindLine(game, fighter) {
  game.particles.push({
    kind: 'streak',
    x: fighter.x - fighter.facing * randomBetween(4, 10),
    y: fighter.y - randomBetween(6, 30),
    vx: -fighter.facing * randomBetween(1.2, 2.2),
    vy: 0,
    life: 10,
    maxLife: 10,
    length: randomBetween(5, 10) | 0,
  });
}

// a run kicks dust up and sounds a footstep with each stride, and streams the air past the hero
function addRunEffects(game, fighter) {
  const strideTime = fighter.animTime - fighter.spriteStart;
  if (strideTime % RUN_STRIDE_TICKS === 0) {
    const y = floorUnder(game.terrain, fighter);
    addDust(game, { x: fighter.x - fighter.facing * 6, y, count: 2 });
    game.io.sfx('step', false, { x: fighter.x });
  }
  if (fighter.animTime % RUN_WIND_TICKS === 0) {
    addWindLine(game, fighter);
  }
}

export function addMotionEffects(game, fighter) {
  if (wantsAfterimage(fighter)) {
    addAfterimage(fighter);
  }
  if (fighter.state === 'dash' && fighter.stateTime < 12 && fighter.stateTime % 2 === 0) {
    addWindLine(game, fighter);
  }
  if (fighter.state === 'walk' && !fighter.entering && fighter.animTime % 14 === 0) {
    const y = floorUnder(game.terrain, fighter);
    addDust(game, { x: fighter.x - fighter.facing * 5, y, count: 1 });
  }
  if (fighter.state === 'run') {
    addRunEffects(game, fighter);
  }
  for (const image of fighter.afterimages) {
    image.life--;
  }
  fighter.afterimages = fighter.afterimages.filter((image) => image.life > 0);
}
