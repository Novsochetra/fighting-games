import { describe, expect, it } from 'vitest';
import {
  canPassFirstTime,
  firstTimePassOf,
  readyFirstTimePass,
  runOntoBall,
} from '../../../src/sim/receiving.js';
import { holdStick } from '../../../src/sim/stick-hold.js';
import { looseBallAt, matchInPlay, steered } from '../../support/match-driver.js';

function passOnItsWay(gap) {
  const match = matchInPlay();
  const player = Object.assign(steered(match), { x: 900, y: 540, receiving: 60 });

  looseBallAt(match, { x: 900 - gap, y: 540, vx: 6, kick: 'pass' });

  return { match, player };
}

describe('meeting a pass', () => {
  it('can be played first time only as the ball is about to reach him', () => {
    expect(canPassFirstTime(passOnItsWay(60).match, passOnItsWay(60).player)).toBe(true);
    expect(canPassFirstTime(passOnItsWay(300).match, passOnItsWay(300).player)).toBe(false);
  });

  it('plays the readied pass once, along the stick as it is then, else as it was', () => {
    const { player } = passOnItsWay(60);

    readyFirstTimePass(player, { x: 0, y: -1 });

    expect(firstTimePassOf(player, { x: 0, y: 0 })).toMatchObject({
      kind: 'pass',
      aim: { x: 0, y: -1 },
      lofted: false,
    });
    expect(firstTimePassOf(player, { x: 0, y: 0 })).toBe(null);

    readyFirstTimePass(player, { x: 0, y: 0 });

    expect(firstTimePassOf(player, { x: 1, y: 0 }).aim).toEqual({ x: 1, y: 0 });
  });

  it('runs onto the ball whatever the stick held over from the pass says', () => {
    const { match, player } = passOnItsWay(300);

    match.input.sources.keys.held.right = true;
    holdStick(match, 60);

    expect(runOntoBall(match, player, { stick: { x: 1, y: 0 }, action: null }).move).toMatchObject({
      x: -1,
      y: 0,
    });
  });

  it('bends the run with a stick the player has moved, to take the ball on into space', () => {
    const { match, player } = passOnItsWay(300);
    const { move } = runOntoBall(match, player, { stick: { x: 0, y: -1 }, action: null });

    expect(move.x).toBeLessThan(0);
    expect(move.y).toBeLessThan(-0.3);
  });
});
