import { describe, expect, it } from 'vitest';
import { KICK } from '../../../src/data/tuning.js';
import { attachDuels } from '../../../src/sim/duel/attach.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { tick } from '../../../src/sim/tick.js';
import { holdBallAt, matchInPlay, playOut, playTicks } from '../../support/match-driver.js';

describe('the hooks the duels hang on', () => {
  it('run a duel the hook begins: the match waits in it, ticking the duel, until it ends', () => {
    const match = matchInPlay(2);
    let duelTicks = 0;

    match.hooks = {
      duel(each) {
        if (each.tick === 200) {
          each.phase = 'duel';

          return true;
        }

        return false;
      },
      duelTick(each) {
        duelTicks += 1;

        if (duelTicks === 30) {
          each.phase = 'play';
        }
      },
    };

    while (match.tick < 200) {
      tick(match);
    }

    const clock = match.clock;

    expect(match.phase).toBe('duel');

    playTicks(match, 30);

    expect(match.phase).toBe('play');
    expect(match.clock).toBe(clock);
  });

  it('hand a star’s full charge with spirit to spare to the special hook', () => {
    const match = matchInPlay(3);
    const star = holdBallAt(match, { x: 1500, y: 540 });
    const specials = [];

    Object.assign(star, { star: 'sochetra', moves: ['naga-shot'], spirit: 100 });
    match.hooks = {
      special(each, player) {
        specials.push(player.index);
        each.phase = 'duel';

        return true;
      },
    };
    playTicks(match, 1, { held: { shoot: true }, pressed: { shoot: true } });
    playTicks(match, KICK.chargeTicks + 2, { held: { shoot: true } });
    playTicks(match, 1, { held: { shoot: false } });

    expect(specials).toEqual([star.index]);
    expect(match.phase).toBe('duel');
  });
});

describe('a match with the duels attached', () => {
  it(
    'plays out to full time, stars and all, the computer on both sides',
    { timeout: 60000 },
    () => {
      for (const format of ['7', '11']) {
        const match = createMatch({ seed: 4, format });
        const types = new Set();

        Object.assign(match.players[format === '7' ? 6 : 9], {
          star: 'sochetra',
          moves: ['naga-shot'],
          spirit: 100,
        });
        Object.assign(match.sides[1][format === '7' ? 6 : 9], {
          star: 'rithy',
          moves: ['preah-khan-strike'],
        });
        attachDuels(match);
        playOut(match, (each, events) => events.forEach((event) => types.add(event.type)));

        expect(match.phase).toBe('over');
        expect(types.has('goal') || types.has('save')).toBe(true);
      }
    },
  );
});
