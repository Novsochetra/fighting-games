import { ENEMY_SPRITES } from '../data/enemies/enemy-sprites.js';

// the ko strip: frame 0 stands, 1-4 fly backward, the rest land and lie still
const FIRST_GROUND_FRAME = 5;
const AIR_FRAME_BY_SPEED = [
  [-1.5, 1],
  [0, 2],
  [1.5, 3],
];
// no sheet has a jump strip: a hop rises on the walk's knee-up frame and comes down on its stride
const HOP_RISE_FRAME = 1;
const HOP_FALL_FRAME = 0;

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

function hopFrame(fighter) {
  return ['walk', fighter.vy < 0 ? HOP_RISE_FRAME : HOP_FALL_FRAME];
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

// a move plays the strip it names, or the one named as it is, or the attack strip
export function stripForMove(sprite, move) {
  const own = move.strip ?? move.id;
  return sprite.strips[own] ? own : 'attack';
}

// a rush with its own strip (a lunge or a charge) keeps running through it; other strikes hold
function activeFrame({ move, moveTime }, { name, strike, last }) {
  if (!move.sustain || name === 'attack') {
    return strike;
  }
  return strike + (((moveTime - move.startup) >> 2) % (last - strike + 1));
}

// a move with a timeline of its own starts each frame of its strip on the tick it names; while it
// is active it may loop a run of frames instead, for as long as a rush or a daze lasts
export function timelineFrame({ frameAt, loopFrames, startup, active }, moveTime) {
  if (loopFrames && moveTime >= startup && moveTime < startup + active) {
    const [first, last, ticks] = loopFrames;
    return first + (Math.floor((moveTime - startup) / ticks) % (last - first + 1));
  }
  let frame = 0;
  while (frame + 1 < frameAt.length && frameAt[frame + 1] <= moveTime) {
    frame++;
  }
  return frame;
}

// wind-up frames lead to the strike frame, which holds while the hitbox is out
function moveFrame(sprite, move, moveTime) {
  const name = stripForMove(sprite, move);
  if (move.frameAt && name === (move.strip ?? move.id)) {
    return [name, timelineFrame(move, moveTime)];
  }
  const strike = sprite.strips[name].strike ?? 0;
  if (moveTime < move.startup) {
    return [name, Math.floor((moveTime / move.startup) * strike)];
  }
  if (moveTime < move.startup + move.active) {
    return [name, activeFrame({ move, moveTime }, { name, strike, last: lastFrame(sprite, name) })];
  }
  const recovered = (moveTime - move.startup - move.active) / move.recovery;
  const last = lastFrame(sprite, name);
  return [name, Math.min(last, strike + 1 + Math.floor(recovered * (last - strike)))];
}

// a move's tick counts on once the tick is played, so the frame drawn is the one for the tick just
// played, the tick its hitbox and its cues (a boulder leaving his hand) were played on
function attackFrame(fighter, sprite) {
  return moveFrame(sprite, fighter.move, Math.max(0, fighter.moveTime - 1));
}

// the frame a boss's move draws on tick `time` of it, for a cue played on that tick
export function moveFrameAt(fighter, time) {
  return moveFrame(ENEMY_SPRITES[fighter.def.sprite], fighter.move, time);
}

const FRAME_BY_STATE = {
  idle: (fighter, sprite) => play(fighter, sprite, ['idle', 9, true]),
  walk: walkFrame,
  attack: attackFrame,
  hurt: (fighter, sprite) => play(fighter, sprite, ['hurt', 4, false]),
  air: hopFrame,
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
