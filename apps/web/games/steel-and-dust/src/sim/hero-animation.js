import { CHARGE_TAP } from '../config.js';
import { HERO_MOVE_SPRITES, HERO_SPRITES } from '../data/hero-sprites.js';

const FRAMES = HERO_SPRITES.frames;
const JUMP_FRAME_BY_SPEED = [
  [-3, 2],
  [-1.5, 3],
  [0, 4],
  [1, 5],
  [2.5, 6],
];

function play(fighter, name, ticksPerFrame, loop) {
  if (fighter.spriteName !== name) {
    fighter.spriteName = name;
    fighter.spriteStart = fighter.animTime;
  }
  const frame = Math.floor((fighter.animTime - fighter.spriteStart) / ticksPerFrame);
  return [name, loop ? frame % FRAMES[name] : Math.min(FRAMES[name] - 1, frame)];
}

function hold(fighter, name, frame) {
  fighter.spriteName = name;
  return [name, frame];
}

function groundFrame(fighter) {
  const sinceLanding = fighter.animTime - fighter.landedAt;
  if (sinceLanding < 9) {
    return hold(fighter, 'land', [3, 2, 1][Math.floor(sinceLanding / 3)]);
  }
  if (fighter.state === 'idle') {
    return play(fighter, 'idle', 8, true);
  }
  const walk = play(fighter, 'walk', 6, true);
  if (fighter.walkDirection < 0) {
    walk[1] = FRAMES.walk - 1 - walk[1];
  }
  return walk;
}

function jumpFrame(fighter) {
  const match = JUMP_FRAME_BY_SPEED.find(([below]) => fighter.vy < below);
  return hold(fighter, 'jump', match ? match[1] : 7);
}

// the strike frame is held while the hitbox is active; multi-hit moves cycle the strip instead
function attackFrame(fighter) {
  const { move, moveTime } = fighter;
  const [name, strike] = move.sprite || HERO_MOVE_SPRITES[move.id] || ['slash1', 2];
  const count = FRAMES[name];
  fighter.spriteName = name;
  if (moveTime < move.startup) {
    return [name, Math.floor((moveTime / move.startup) * strike)];
  }
  if (move.multiHit && moveTime < move.startup + move.active) {
    return [name, ((moveTime - move.startup) >> 2) % count];
  }
  if (moveTime < move.startup + move.active) {
    return [name, strike];
  }
  const recovered = (moveTime - move.startup - move.active) / move.recovery;
  return [name, Math.min(count - 1, strike + 1 + Math.floor(recovered * (count - 1 - strike)))];
}

function offsetFrame(fighter, [name, ticks, first, last]) {
  const frame = play(fighter, name, ticks, false);
  frame[1] = Math.min(last, first + frame[1]);
  return frame;
}

function winFrame(fighter) {
  const frame = play(fighter, 'win', 8, false);
  if (frame[1] >= 1) {
    frame[1] = 1 + (Math.floor((fighter.animTime - fighter.spriteStart - 8) / 8) % 3);
  }
  return frame;
}

const FRAME_BY_STATE = {
  idle: groundFrame,
  walk: groundFrame,
  air: jumpFrame,
  squat: (fighter) => hold(fighter, 'jump', fighter.stateTime < 2 ? 0 : 1),
  charge: (fighter) =>
    fighter.stateTime < CHARGE_TAP ? play(fighter, 'idle', 8, true) : hold(fighter, 'cleave', 1),
  ult: (fighter) => {
    fighter.spriteName = fighter.ultFrame[0];
    return fighter.ultFrame;
  },
  attack: attackFrame,
  // frame 0 of the dash strip is a full-body smear, too loud for a move used this often
  dash: (fighter) => offsetFrame(fighter, ['dash', 5, 1, 3]),
  hurt: (fighter) => play(fighter, 'hurt', 4, false),
  juggle: (fighter) => play(fighter, 'juggle', 6, true),
  ko: (fighter) => (fighter.airborne ? play(fighter, 'juggle', 6, true) : hold(fighter, 'ko', 3)),
  down: (fighter) => offsetFrame(fighter, ['down', 4, 2, 3]),
  getup: (fighter) => hold(fighter, 'getup', Math.min(4, Math.floor((fighter.stateTime / 16) * 5))),
  win: winFrame,
};

// [strip name, frame] for the hero's sprite; remembers when the strip started on the fighter
export function heroAnimation(fighter) {
  const frameFor = FRAME_BY_STATE[fighter.state];
  return frameFor ? frameFor(fighter) : play(fighter, 'idle', 8, true);
}
