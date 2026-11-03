import { describe, expect, it } from 'vitest';
import { fixtureRounds, playFixture, playRound } from '../../../src/campaign/group-fixtures.js';

const pairNames = (rounds) => rounds.map((round) => round.map((pair) => pair.join('-')));

describe('the other group matches', () => {
  it("in a group of four, one a round, the pair the hero's opponent is not in", () => {
    const group = { teams: ['h', 'a', 'b', 'c'], opponents: ['a', 'b', 'c'] };

    expect(pairNames(fixtureRounds(group, 'h'))).toEqual([['b-c'], ['a-c'], ['a-b']]);
  });

  it('in a group of three, the one match with the first round', () => {
    const group = { teams: ['h', 'a', 'b'], opponents: ['a', 'b'] };

    expect(pairNames(fixtureRounds(group, 'h'))).toEqual([['a-b'], []]);
  });

  it('in a group of five, every pair once, spread over the rounds', () => {
    const group = { teams: ['h', 'a', 'b', 'c', 'd'], opponents: ['a', 'b', 'c', 'd'] };
    const rounds = fixtureRounds(group, 'h');

    expect(rounds.flat()).toHaveLength(6);
    expect(rounds.map((round) => round.length)).toEqual([2, 1, 2, 1]);
  });

  it('plays a round by the group, the cup and the seed', () => {
    const group = {
      teams: ['h', 'a', 'b', 'c'],
      opponents: ['a', 'b', 'c'],
      round: 0,
      strengths: { a: 50, b: 60, c: 40 },
    };
    const play = (seed) =>
      playRound({ group, heroTeam: 'h', cupId: 'cup', record: { replays: 0 }, seed });

    expect(play(1)).toEqual(play(1));
    expect(play(1)[0]).toMatchObject({ home: 'b', away: 'c' });
  });
});

describe('a played-out match', () => {
  const strengths = { strong: 80, weak: 55, even: 60, other: 60 };
  const scores = (pair) =>
    Array.from({ length: 400 }, (_, seed) => playFixture(pair, { strengths, seed: seed + 1 }));

  it('is the same for the same seed', () => {
    expect(playFixture(['strong', 'weak'], { strengths, seed: 5 })).toEqual(
      playFixture(['strong', 'weak'], { strengths, seed: 5 }),
    );
  });

  it('is won far more often by the stronger team', () => {
    const results = scores(['weak', 'strong']);
    const strongWins = results.filter((result) => result.awayGoals > result.homeGoals).length;
    const weakWins = results.filter((result) => result.homeGoals > result.awayGoals).length;

    expect(strongWins).toBeGreaterThan(weakWins * 4);
  });

  it('has scores that look like football', () => {
    const results = scores(['even', 'other']);
    const goals = results.map((result) => result.homeGoals + result.awayGoals);
    const average = goals.reduce((sum, value) => sum + value, 0) / goals.length;
    const draws = results.filter((result) => result.homeGoals === result.awayGoals).length;

    expect(
      Math.max(...results.flatMap((result) => [result.homeGoals, result.awayGoals])),
    ).toBeLessThanOrEqual(6);
    expect(average).toBeGreaterThan(2);
    expect(average).toBeLessThan(3.4);
    expect(draws / results.length).toBeGreaterThan(0.15);
    expect(draws / results.length).toBeLessThan(0.4);
  });

  it('plays a team of unknown strength as an average one', () => {
    const result = playFixture(['nobody', 'even'], { strengths, seed: 3 });

    expect(result).toMatchObject({ home: 'nobody', away: 'even' });
  });
});
