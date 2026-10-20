import { ENEMY_SPRITES } from '../data/enemies/enemy-sprites.js';

// the ko strip: frame 0 stands, 1-4 fly backward, the rest land and lie still
const FIRST_GROUND_FRAME = 5;
const AIR_FRAME_BY_SPEED = [
  [-1.5, 1],
  [0, 2],
  [1.5, 3],
];

function lastFrame(sprite, name) {
  return sprite.strips[name].frames - 1;
}

// the strip restarts whenever the state or the strip changes
function play(fighter, sprite, [name, ticksPerFrame, loop]) {
  const key = `${fighter.state}:${name}`;
  if (fighter.spriteName !== key) {
    fighter.spriteName = key;
    fighter.spriteStart = fighter.animTime;
  }
  const frame = Math.floor((fighter.animTime - fighter.spriteStart) / ticksPerFrame);
  const count = sprite.strips[name].frames;
  return [name, loop ? frame % count : Math.min(count - 1, frame)];
}

function airFrame(fighter, sprite) {
  const match = AIR_FRAME_BY_SPEED.find(([below]) => fighter.vy < below);
  return ['ko', Math.min(lastFrame(sprite, 'ko'), match ? match[1] : 4)];
}

function groundFrame(fighter, sprite) {
  const [, frame] = play(fighter, sprite, ['ko', 4, false]);
  return ['ko', Math.min(lastFrame(sprite, 'ko'), FIRST_GROUND_FRAME + frame)];
}

function getupFrame(fighter, sprite) {
  const last = lastFrame(sprite, 'ko');
  const span = last - FIRST_GROUND_FRAME + 1;
  return ['ko', Math.max(FIRST_GROUND_FRAME, last - Math.floor((fighter.stateTime / 16) * span))];
}

function walkFrame(fighter, sprite) {
  const frame = play(fighter, sprite, ['walk', 6, true]);
  if (fighter.walkDirection < 0) {
    frame[1] = lastFrame(sprite, 'walk') - frame[1];
  }
  return frame;
}

export function stripForMove(sprite, move) {
  return sprite.strips[move.id] ? move.id : 'attack';
}

// a rush with its own strip (a lunge or a charge) keeps running through it; other strikes hold
function activeFrame({ move, moveTime }, { name, strike, last }) {
  if (!move.sustain || name === 'attack') {
    return strike;
  }
  return strike + (((moveTime - move.startup) >> 2) % (last - strike + 1));
}

// wind-up frames lead to the strike frame, which holds while the hitbox is out
function attackFrame(fighter, sprite) {
  const { move, moveTime } = fighter;
  const name = stripForMove(sprite, move);
  const strike = sprite.strips[name].strike ?? 0;
  if (moveTime < move.startup) {
    return [name, Math.floor((moveTime / move.startup) * strike)];
  }
  if (moveTime < move.startup + move.active) {
    return [name, activeFrame(fighter, { name, strike, last: lastFrame(sprite, name) })];
  }
  const recovered = (moveTime - move.startup - move.active) / move.recovery;
  const last = lastFrame(sprite, name);
  return [name, Math.min(last, strike + 1 + Math.floor(recovered * (last - strike)))];
}

const FRAME_BY_STATE = {
  idle: (fighter, sprite) => play(fighter, sprite, ['idle', 9, true]),
  walk: walkFrame,
  attack: attackFrame,
  hurt: (fighter, sprite) => play(fighter, sprite, ['hurt', 4, false]),
  juggle: airFrame,
  down: groundFrame,
  getup: getupFrame,
  ko: (fighter, sprite) =>
    fighter.airborne ? airFrame(fighter, sprite) : groundFrame(fighter, sprite),
};

// [strip name, frame] for an enemy drawn from a sprite sheet
export function enemyAnimation(fighter, sprite) {
  const frameFor = FRAME_BY_STATE[fighter.state] || FRAME_BY_STATE.idle;
  return frameFor(fighter, sprite);
}

export function enemySpriteFrame(fighter) {
  const sprite = ENEMY_SPRITES[fighter.def.sprite];
  return sprite ? enemyAnimation(fighter, sprite) : null;
}
