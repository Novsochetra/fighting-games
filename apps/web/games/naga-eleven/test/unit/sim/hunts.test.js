import { describe, expect, it } from 'vitest';
import { pairKey } from '../../../src/sim/duel/geometry.js';
import { goesForBall, huntOf, huntTicksOf, playedTicksOf } from '../../../src/sim/hunts.js';
import { holdBallAt, looseBallAt, matchInPlay } from '../../support/match-driver.js';

// a quick match with the computer's centre forward hunting the player's, who stands near him
function huntingMatch() {
  const match = matchInPlay();
  const star = Object.assign(match.players[9], { star: 'sochetra', x: 1200, y: 540 });
  const rival = Object.assign(match.players[20], {
    star: 'rithy',
    hunts: 'sochetra',
    x: 1300,
    y: 560,
  });

  return { match, star, rival };
}

describe('a rival’s hunt', () => {
  it('is nobody’s in a match where no one hunts', () => {
    const match = matchInPlay();

    expect(huntOf(match, 0)).toBeNull();
    expect(huntOf(match, 1)).toBeNull();
  });

  it('sends the rival after the star he is named for while the star is near', () => {
    const { match, star, rival } = huntingMatch();

    expect(huntOf(match, 1)).toEqual({ hunter: rival.index, quarry: star.index });
    expect(huntOf(match, 0)).toBeNull();
  });

  it('leaves a star far up the pitch to the side’s shape', () => {
    const { match, star } = huntingMatch();

    star.x = 300;

    expect(huntOf(match, 1)).toBeNull();
  });

  it('is over once the two have met in a duel', () => {
    const { match, star, rival } = huntingMatch();

    match.duelMemory = { pairs: { [pairKey(star, rival)]: match.tick } };

    expect(huntOf(match, 1)).toBeNull();
  });

  it('waits while the rival is down or in a slide', () => {
    const { match, rival } = huntingMatch();

    rival.stun = 12;

    expect(huntOf(match, 1)).toBeNull();

    Object.assign(rival, { stun: 0, tackle: 6 });

    expect(huntOf(match, 1)).toBeNull();
  });

  it('looks for the star on the other side only', () => {
    const { match, star } = huntingMatch();

    star.star = null;
    match.players[15].star = 'sochetra';

    expect(huntOf(match, 1)).toBeNull();
  });

  it('lasts the first two fifths of the match at most, met or not', () => {
    const { match, star, rival } = huntingMatch();
    const playFor = (ticks) => Object.assign(match, { half: 1, clock: match.halfTicks - ticks });

    expect(huntTicksOf(match)).toBeCloseTo(0.4 * 2 * match.halfTicks);

    playFor(huntTicksOf(match) - 1);

    expect(huntOf(match, 1)).toEqual({ hunter: rival.index, quarry: star.index });

    playFor(huntTicksOf(match));

    expect(huntOf(match, 1)).toBeNull();
  });

  it('keeps the same time in a short match, though never past half of it', () => {
    const full = matchInPlay();
    const short = matchInPlay(1, { halfSeconds: 120 });
    const shorter = matchInPlay(1, { halfSeconds: 90 });

    expect(huntTicksOf(short)).toBe(huntTicksOf(full));
    expect(huntTicksOf(shorter)).toBe(shorter.halfTicks);
  });

  it('counts the play gone in both halves', () => {
    const match = matchInPlay();

    Object.assign(match, { half: 2, clock: match.halfTicks - 30 });

    expect(playedTicksOf(match)).toBe(match.halfTicks + 30);
  });
});

describe('a loose ball near the star a rival hunts', () => {
  it('is the rival’s to go for', () => {
    const { match, star } = huntingMatch();
    const hunt = huntOf(match, 1);

    looseBallAt(match, { x: star.x + 120, y: star.y });

    expect(goesForBall(match, hunt)).toBe(true);
  });

  it('is left to his side away from the star, with the ball held, or with no hunt on', () => {
    const { match, star } = huntingMatch();
    const hunt = huntOf(match, 1);

    looseBallAt(match, { x: star.x - 400, y: star.y });

    expect(goesForBall(match, hunt)).toBe(false);
    expect(goesForBall(match, null)).toBe(false);

    holdBallAt(match, { x: star.x + 20, y: star.y }, match.players[4]);

    expect(goesForBall(match, hunt)).toBe(false);
  });
});
