import { describe, expect, it } from 'vitest';
import { chooseDuel, currentRound, finishDuel } from '../../../../src/sim/duel/index.js';
import { attachDuels } from '../../../../src/sim/duel/attach.js';
import { tick } from '../../../../src/sim/tick.js';
import { holdBallAt, matchInPlay, only } from '../../../support/match-driver.js';

// the computer's striker lets a special go at the player's keeper, who answers with his skill
function specialAtTheKeeper(seed, guard) {
  const match = attachDuels(matchInPlay(seed, { humanTeam: 1 }));
  const striker = holdBallAt(match, { x: 1450, y: 540 }, match.players[9]);
  const keeper = match.players[11];

  Object.assign(striker, { star: 'sochetra', skill: null, moves: ['naga-shot'], spirit: 100 });
  Object.assign(keeper, { star: 'dara', moves: [guard], spirit: 100, x: 1784, y: 540 });
  only(match, [striker.index, keeper.index]);
  match.hooks.special(match, striker);
  chooseDuel(match, 'defend', guard);
  tick(match);

  return { match, round: currentRound(match.duel), keeper };
}

describe('a keeper’s skill in a duel', () => {
  it('decides the round’s style, aim and dive as it is settled', () => {
    for (const [guard, style] of [
      ['angkor-wall', 'wall'],
      ['mountain-guard', 'punch'],
    ]) {
      const { round } = specialAtTheKeeper(5, guard);

      expect(round.result.style, guard).toBe(style);
      expect(round.result.aim).toEqual({ side: expect.any(Number), height: expect.any(Number) });
      expect([-1, 0, 1]).toContain(round.result.dive);
    }
  });

  it('never dives for a wall, which sends a save back into play, and punches away wide', () => {
    for (let seed = 1; seed <= 12; seed += 1) {
      const wall = specialAtTheKeeper(seed, 'angkor-wall');
      const punch = specialAtTheKeeper(seed, 'mountain-guard');

      expect(wall.round.result.dive).toBe(0);
      expect(['saved', 'goal', 'wide']).toContain(wall.round.result.word);
      expect(['parried', 'goal', 'wide']).toContain(punch.round.result.word);

      finishDuel(wall.match);

      if (wall.round.result.word === 'saved') {
        expect(wall.match.ball.owner).toBeNull();
        expect(wall.match.ball.vx).toBeLessThan(0);
      }
    }
  });

  it('places a goal where the round aimed it, the keeper beaten the way it said', () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      const { match, round, keeper } = specialAtTheKeeper(seed, 'mountain-guard');

      if (round.result.word !== 'goal') {
        continue;
      }

      finishDuel(match);

      const across = (match.ball.y - match.pitch.width / 2) / (match.goal.width / 2);

      expect(Math.sign(across)).toBe(Math.sign(round.result.aim.side));
      expect(keeper.dive?.side ?? 0).toBe(round.result.dive);
    }
  });
});
