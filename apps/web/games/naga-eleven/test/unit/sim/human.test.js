import { describe, expect, it } from 'vitest';
import { KICK } from '../../../src/data/tuning.js';
import { humanIntent, restartAction } from '../../../src/sim/human.js';
import { clearPresses } from '../../../src/sim/input-state.js';
import { holdStick } from '../../../src/sim/stick-hold.js';
import { holdBallAt, looseBallAt, matchInPlay, steered } from '../../support/match-driver.js';

function press(match, held, pressed = {}) {
  Object.assign(match.input.sources.keys.held, held);
  Object.assign(match.input.pressed, pressed);
}

// holds a button for some ticks and lets it go, returning what letting go did
function holdAndLetGo(match, player, { button, ticks, held = {}, act = humanIntent }) {
  press(match, { ...held, [button]: true }, { [button]: true });
  act(match, player, { x: 0, y: 0 });
  clearPresses(match.input);

  for (let i = 1; i < ticks; i += 1) {
    act(match, player, { x: 0, y: 0 });
  }

  match.input.sources.keys.held[button] = false;

  return act(match, player, { x: 0, y: 0 });
}

describe('the player with the ball', () => {
  it('passes along the grass on a tap of pass, along the stick', () => {
    const match = matchInPlay();
    const player = holdBallAt(match, { x: 600, y: 400 });
    const intent = holdAndLetGo(match, player, { button: 'pass', ticks: 2, held: { down: true } });

    expect(intent.action).toMatchObject({ kind: 'pass', aim: { x: 0, y: 1 }, lofted: false });
  });

  it('lofts a pass held longer, the further the longer it is held', () => {
    const match = matchInPlay();
    const player = holdBallAt(match, { x: 600, y: 400 });
    const { action } = holdAndLetGo(match, player, { button: 'pass', ticks: 30 });

    expect(action).toMatchObject({ kind: 'pass', lofted: true });
    expect(action.power).toBeCloseTo(30 / KICK.chargeTicks, 1);
  });

  it('charges a shot while shoot is held and strikes it on letting go', () => {
    const match = matchInPlay();
    const player = holdBallAt(match, { x: 1500, y: 540 });

    press(match, { shoot: true }, { shoot: true });
    expect(humanIntent(match, player).action).toBe(null);
    clearPresses(match.input);

    for (let i = 0; i < 100; i += 1) {
      humanIntent(match, player);
    }

    expect(player.charge).toBe(KICK.chargeTicks);

    match.input.sources.keys.held.shoot = false;

    expect(humanIntent(match, player).action).toMatchObject({ kind: 'shoot', power: 1 });
  });

  it('lets a star with spirit for a shot move go as a special from a full charge', () => {
    const match = matchInPlay();
    const player = holdBallAt(match, { x: 1500, y: 540 });

    Object.assign(player, { star: 'sochetra', moves: ['naga-shot'], spirit: 100 });
    match.hooks = { special: () => true };

    const { action } = holdAndLetGo(match, player, {
      button: 'shoot',
      ticks: KICK.chargeTicks + 5,
    });

    expect(action.kind).toBe('special');
  });
});

describe('the player without the ball', () => {
  it('takes another mate with pass, and slides in with shoot at a carrier', () => {
    const match = matchInPlay();
    const player = steered(match);

    holdBallAt(match, { x: 900, y: 300 }, match.players[15]);
    press(match, {}, { pass: true });
    expect(humanIntent(match, player).action).toEqual({ kind: 'switch' });

    clearPresses(match.input);
    Object.assign(player, { x: 300, y: 300 });
    press(match, {}, { shoot: true });
    expect(humanIntent(match, player).action).toEqual({ kind: 'tackle' });
  });

  it('readies a first-time pass, not another mate, with pass as a pass reaches him', () => {
    const match = matchInPlay();
    const player = Object.assign(steered(match), { x: 900, y: 540, receiving: 30 });

    looseBallAt(match, { x: 860, y: 540, vx: 4, kick: 'pass' });
    press(match, { up: true }, { pass: true });

    expect(humanIntent(match, player).action).toBe(null);
    expect(player.flick).toBeGreaterThan(0);
  });

  it('readies a first-time strike with shoot at a ball coming in', () => {
    const match = matchInPlay();
    const player = Object.assign(steered(match), { x: 1500, y: 540 });

    looseBallAt(match, { x: 1440, y: 540, z: 30, vx: 6 });
    press(match, {}, { shoot: true });

    expect(humanIntent(match, player).action).toBe(null);
    expect(player.strike).toBeGreaterThan(0);
  });

  it('runs onto a pass played to them whatever the stick still says from the pass', () => {
    const match = matchInPlay();
    const player = Object.assign(steered(match), { x: 900, y: 540, receiving: 60 });

    looseBallAt(match, { x: 600, y: 540, vx: 6, kick: 'pass' });
    press(match, { right: true });
    holdStick(match, 60);

    expect(humanIntent(match, player).move.x).toBeLessThan(0);
  });

  it('sprints while sprint is held', () => {
    const match = matchInPlay();

    press(match, { sprint: true, right: true });

    expect(humanIntent(match, steered(match))).toMatchObject({
      sprint: true,
      move: { x: 1, y: 0 },
    });
  });
});

describe('the taker at a restart', () => {
  it('plays it short on a tap and long on a held pass or on shoot', () => {
    const match = matchInPlay();
    const player = holdBallAt(match, { x: 600, y: 0 });
    const tap = holdAndLetGo(match, player, { button: 'pass', ticks: 2, act: restartAction });
    const shoot = holdAndLetGo(match, player, { button: 'shoot', ticks: 2, act: restartAction });

    expect(tap).toMatchObject({ kind: 'pass', lofted: false });
    expect(shoot).toMatchObject({ kind: 'pass', lofted: true });
  });
});

describe('the player’s keeper with the ball in his hands', () => {
  it('stays where he is whatever the stick says, and throws it on a tap of pass', () => {
    const match = matchInPlay();
    const keeper = holdBallAt(match, { x: 40, y: 540 }, match.players[0]);
    const { action } = holdAndLetGo(match, keeper, {
      button: 'pass',
      ticks: 2,
      held: { up: true },
    });

    expect(humanIntent(match, keeper).move).toEqual({ x: 0, y: 0 });
    expect(action).toMatchObject({ kind: 'pass', aim: { x: 0, y: -1 }, lofted: false });
  });
});
