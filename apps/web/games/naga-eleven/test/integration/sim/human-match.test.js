import { describe, expect, it } from 'vitest';
import { FORMATS } from '../../../src/data/formats.js';
import { KICK } from '../../../src/data/tuning.js';
import { startRestart } from '../../../src/sim/restart-setup.js';
import {
  holdBallAt,
  looseBallAt,
  matchInPlay,
  only,
  playTicks,
  playUntil,
  steered,
} from '../../support/match-driver.js';

const middleOf = (match) => match.pitch.width / 2;

function clearTheirSide(match) {
  for (const opponent of match.sides[1]) {
    Object.assign(opponent, { y: 20, stun: 9999, noPickup: 9999 });
  }
}

describe('a match against the player', () => {
  it('lets the player run the ball up and put it in an empty net', () => {
    const match = matchInPlay(3);

    clearTheirSide(match);
    holdBallAt(match, { x: match.pitch.length - 260, y: middleOf(match) });
    playTicks(match, 20, { held: { right: true } });
    playTicks(match, 1, { held: { right: true, shoot: true }, pressed: { shoot: true } });
    playTicks(match, 10, { held: { right: true, shoot: true } });
    playTicks(match, 60, { held: { right: false, shoot: false } });

    expect(match.score).toEqual([1, 0]);
    expect(match.phase).toBe('goal');
  });

  it('hands the player the kicker at each kick off of theirs', () => {
    for (const format of ['7', '11']) {
      const match = matchInPlay(4, { format });

      expect(steered(match).slotIndex).toBe(FORMATS[format].kicker);
      expect(steered(match).team).toBe(0);
    }
  });

  it('lofts a held pass over the other side to a mate far up the pitch', () => {
    const match = matchInPlay(5);
    const passer = holdBallAt(match, { x: 500, y: middleOf(match) });
    const mate = Object.assign(match.players[10], { x: 1250, y: middleOf(match) - 60 });
    let highest = 0;

    only(match, [passer.index, mate.index, 17]);
    Object.assign(match.players[17], { x: 800, y: middleOf(match), stun: 0, noPickup: 0 });
    playTicks(match, 1, { held: { pass: true, right: true }, pressed: { pass: true } });
    playTicks(match, KICK.loftFrom + 10, { held: { pass: true, right: true } });
    playTicks(match, 1, { held: { pass: false, right: false } });
    playUntil(match, (each) => {
      highest = Math.max(highest, each.ball.z);

      return each.ball.owner !== null;
    });

    expect(highest).toBeGreaterThan(40);
    expect(match.ball.owner).toBe(mate.index);
  });

  it('taps a pass along the grass to the mate the stick points at, who comes to meet it', () => {
    const match = matchInPlay(8);
    const passer = holdBallAt(match, { x: 600, y: middleOf(match) });
    const mate = Object.assign(match.players[10], { x: 860, y: middleOf(match) + 40 });

    only(match, [passer.index, mate.index, 7, 14]);
    Object.assign(match.players[7], { x: 700, y: middleOf(match) - 170, stun: 0, noPickup: 0 });
    Object.assign(match.players[14], { x: 900, y: middleOf(match) + 120, stun: 0, noPickup: 0 });
    playTicks(match, 1, { held: { pass: true, right: true }, pressed: { pass: true } });
    playTicks(match, 1, { held: { pass: false, right: true } });

    expect(match.controlled).toBe(mate.index);

    playUntil(match, (each) => each.ball.owner !== null, 200);

    expect(match.ball.owner).toBe(mate.index);
    expect(mate.x).toBeLessThan(860);
  });

  it('volleys a ball coming in at the waist first time when shoot is pressed for it', () => {
    const match = matchInPlay(6);
    const striker = Object.assign(match.players[9], {
      x: match.pitch.length - 140,
      y: middleOf(match),
    });

    only(match, [9, 11]);
    match.controlled = 9;
    looseBallAt(match, {
      x: striker.x - 60,
      y: middleOf(match),
      z: 30,
      vx: 5,
      vz: 0.5,
      lastTouch: 8,
    });
    match.events = [];
    playTicks(match, 1, { held: { shoot: true }, pressed: { shoot: true } });
    playUntil(match, (each) => each.events.some((event) => event.type === 'shot'), 40);

    expect(match.events.find((event) => event.type === 'shot')).toMatchObject({ player: 9 });
  });

  it('lets the player take their own throw-in, aimed with the stick', () => {
    const match = matchInPlay(7);

    looseBallAt(match, { x: 900, y: -8, vy: -2, lastTouch: 15 });
    startRestart(match);

    const taker = steered(match);

    playUntil(match, (each) => each.ball.owner === taker.index, 600);
    playTicks(match, 1, { held: { pass: true, down: true }, pressed: { pass: true } });
    playTicks(match, 1, { held: { pass: false, down: true } });

    expect(match.phase).toBe('play');
    expect(match.ball.vy).toBeGreaterThan(0);
  });
});
