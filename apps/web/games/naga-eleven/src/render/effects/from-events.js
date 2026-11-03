import { shakeCamera } from '../camera.js';
import { addEffect } from './effect-list.js';
import { MOVE_HANDLERS } from './from-moves.js';

// only a goal and the end of a duel shake the view: a jolt on every hard shot tired the eyes
const SHAKE = { goal: 6, duelEnd: 4 };

const playerOf = (match, index) => match.players[index] ?? null;

function shake(camera, power) {
  if (camera) {
    shakeCamera(camera, power);
  }
}

function onShot(effects, match, event) {
  const shooter = playerOf(match, event.player);
  const direction = shooter?.facing?.x >= 0 ? 1 : -1;

  addEffect(effects, {
    kind: 'grass',
    x: match.ball.x,
    y: match.ball.y,
    direction,
    born: match.tick,
    seed: match.tick,
  });
}

// the net's own ripple is the venue's (src/render/venues/goals/ripple.js); a goal here flashes
// the view, shakes it and is kept for the banner and the celebration
function onGoal(effects, match, event, camera) {
  effects.goal = {
    team: event.team,
    scorer: event.scorer ?? null,
    move: event.move ?? null,
    born: match.tick,
  };
  effects.flash = { born: match.tick };
  shake(camera, SHAKE.goal);
}

function onTackle(effects, match, event) {
  const target = playerOf(match, event.target) ?? playerOf(match, event.player);

  if (target) {
    addEffect(effects, {
      kind: 'dust',
      x: target.x,
      y: target.y,
      born: match.tick,
      seed: match.tick + 5,
    });
  }
}

const HANDLERS = {
  shot: onShot,
  goal: onGoal,
  tackle: onTackle,
  save: (effects, match, event) => onTackle(effects, match, { target: event.keeper }),
  duelEnd: (effects, match, event, camera) => shake(camera, SHAKE.duelEnd),
};

export function effectsFromEvents(effects, match, camera) {
  for (const event of match.events ?? []) {
    HANDLERS[event.type]?.(effects, match, event, camera);
    MOVE_HANDLERS[event.type]?.(effects, match, event);
  }
}
