import { describe, expect, it } from 'vitest';
import { holdChanceOf, meetBall, touchChanceOf } from '../../../src/sim/possession.js';
import { looseBallAt, matchInPlay, only } from '../../support/match-driver.js';

const middleOf = (match) => match.pitch.width / 2;

describe('meeting a loose ball', () => {
  it('goes to the nearest player in reach', () => {
    const match = matchInPlay();

    only(match, [1, 13]);
    Object.assign(match.players[1], { x: 300, y: 200 });
    Object.assign(match.players[13], { x: 290, y: 200 });
    looseBallAt(match, { x: 302, y: 200 });
    meetBall(match);

    expect(match.ball.owner).toBe(1);
    expect(match.ball.lastTouch).toBe(1);
  });

  it('leaves a ball over a player’s head, and one just kicked by them', () => {
    const match = matchInPlay();
    const player = match.players[1];

    only(match, [1]);
    Object.assign(player, { x: 300, y: 200 });
    looseBallAt(match, { x: 302, y: 200, z: 70 });
    meetBall(match);

    expect(match.ball.owner).toBe(null);

    looseBallAt(match, { x: 302, y: 200 });
    player.noPickup = 5;
    meetBall(match);

    expect(match.ball.owner).toBe(null);
  });

  it('lets a keeper in their box hold a slow ball high up', () => {
    const match = matchInPlay();
    const keeper = match.players[11];

    only(match, [11]);
    Object.assign(keeper, { x: match.pitch.length - 18, y: middleOf(match) });
    looseBallAt(match, { x: match.pitch.length - 18, y: middleOf(match) + 8, z: 60, vx: 3 });
    meetBall(match);

    expect(match.ball.owner).toBe(11);
  });
});

describe('a keeper’s save', () => {
  it('waits for a shot to pass nearest them before going for it', () => {
    const match = matchInPlay();
    const keeper = match.players[11];

    only(match, [11]);
    Object.assign(keeper, { x: match.pitch.length - 18, y: middleOf(match) });
    looseBallAt(match, {
      x: match.pitch.length - 34,
      y: middleOf(match),
      z: 10,
      vx: 14,
      kick: 'shot',
    });
    meetBall(match);

    expect(match.ball.owner).toBe(null);
    expect(keeper.noPickup).toBe(0);
  });

  it('reaches more at the body than at full stretch, and a good keeper more of both', () => {
    expect(touchChanceOf(0.2)).toBeGreaterThan(touchChanceOf(1));
    expect(touchChanceOf(1, 0.2)).toBeGreaterThan(touchChanceOf(1));
  });

  it('holds a soft shot more than a hard one, and at the body more than at full stretch', () => {
    expect(holdChanceOf(8, 0)).toBeGreaterThan(holdChanceOf(14, 0));
    expect(holdChanceOf(10, 0)).toBeGreaterThan(holdChanceOf(10, 1));
    expect(holdChanceOf(20, 1)).toBeGreaterThan(0);
  });

  it('parries, is beaten or holds a hard shot, and says so for each save', () => {
    const seen = new Set();

    for (let seed = 1; seed <= 60; seed += 1) {
      const match = matchInPlay(seed);
      const keeper = match.players[11];

      only(match, [11]);
      Object.assign(keeper, { x: match.pitch.length - 18, y: middleOf(match), noPickup: 0 });
      looseBallAt(match, {
        x: match.pitch.length - 16,
        y: middleOf(match) + 18,
        z: 10,
        vx: 14,
        kick: 'shot',
      });
      match.events = [];
      meetBall(match);

      const save = match.events.find((event) => event.type === 'save');

      if (match.ball.owner === 11) {
        seen.add(save?.parried === false ? 'held' : 'held without a save');
      } else {
        seen.add(save ? 'parried' : 'beaten');
      }
    }

    expect([...seen].sort()).toEqual(['beaten', 'held', 'parried']);
  });
});

describe('a ball in the air', () => {
  it('comes down off the chest at the waist', () => {
    const match = matchInPlay();

    only(match, [4]);
    Object.assign(match.players[4], { x: 600, y: 300 });
    looseBallAt(match, { x: 604, y: 300, z: 24, vz: -1, vx: 2 });
    meetBall(match);

    expect(match.ball.owner).toBe(4);
  });

  it('is headed away higher up by a defender meeting it on its way down', () => {
    const match = matchInPlay();

    only(match, [4]);
    Object.assign(match.players[4], { x: 400, y: 300 });
    looseBallAt(match, { x: 404, y: 300, z: 44, vz: -2, vx: -3, lastTouch: 13 });
    meetBall(match);

    expect(match.ball.owner).toBe(null);
    expect(match.ball.lastTouch).toBe(4);
    expect(match.ball.vx).toBeGreaterThan(0);
  });

  it('is cushioned down higher up by an attacker with no one to head it on to', () => {
    const match = matchInPlay();

    only(match, [9]);
    Object.assign(match.players[9], { x: 1100, y: 300 });
    looseBallAt(match, { x: 1104, y: 300, z: 44, vz: -2, vx: 3, lastTouch: 7 });
    match.controlled = 1;
    meetBall(match);

    expect(match.ball.owner).toBe(9);
  });

  it('goes over a player as it climbs past their chest', () => {
    const match = matchInPlay();

    only(match, [4]);
    Object.assign(match.players[4], { x: 600, y: 300 });
    looseBallAt(match, { x: 604, y: 300, z: 44, vz: 3, vx: 3, lastTouch: 2 });
    meetBall(match);

    expect(match.ball.lastTouch).toBe(2);
  });

  it('lets a shot past a defender at the end of his reach more often than at his body', () => {
    const blockedAt = (offset) => {
      let blocked = 0;

      for (let seed = 1; seed <= 40; seed += 1) {
        const match = matchInPlay(seed);

        only(match, [9, 14]);
        Object.assign(match.players[14], { x: 1500, y: 540 + offset, stun: 0, noPickup: 0 });
        looseBallAt(match, { x: 1508, y: 540, vx: 12, kick: 'shot', lastTouch: 9 });
        meetBall(match);
        blocked += match.players[14].noPickup === 0 ? 1 : 0;
      }

      return blocked;
    };

    expect(blockedAt(2)).toBeGreaterThan(blockedAt(15));
    expect(blockedAt(15)).toBeGreaterThan(0);
  });
});
