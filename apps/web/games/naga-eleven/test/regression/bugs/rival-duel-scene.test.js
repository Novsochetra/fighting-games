import { describe, expect, it } from 'vitest';
import { CHAPTERS } from '../../../src/data/story/index.js';
import { attachDuels } from '../../../src/sim/duel/index.js';
import { drainEvents } from '../../../src/sim/events.js';
import { tick } from '../../../src/sim/tick.js';
import { checkTriggers, createWatch } from '../../../src/story/index.js';
import { duelStars } from '../../../src/story/match-reads.js';
import { fakeMatch } from '../../support/story-fixtures.js';
import { finalSession } from '../../support/story-session.js';

// In the chapter 1 final the rival's duel scene fired on Rithy's shot at Dara, a keeper duel:
// Rithy told Sochetra "You're quick, village boy", Sochetra answered him and the narrator said
// "Choose your move" while the player picked Catch or Punch as the keeper. A rival's duel scene is
// written for Sochetra himself and the rival meeting, so it waits for that duel.
const RIVAL_DUEL = [{ when: 'firstDuel', with: 'rithy', scene: 'ch1-final-duel' }];

const fired = (match, duel) =>
  checkTriggers(createWatch(RIVAL_DUEL), match, [{ type: 'duel', duel }]).map((one) => one.scene);

describe('the rival’s duel scene', () => {
  const match = fakeMatch({ phase: 'duel' });

  it('waits through Rithy’s shot at Dara, the keeper', () => {
    const shot = { kind: 'keeper', attacker: 13, defender: 0, shooter: 13, keeper: 0 };

    expect(fired(match, shot)).toEqual([]);
  });

  it('waits through Rithy’s run at a teammate of Sochetra’s', () => {
    expect(fired(match, { kind: 'field', attacker: 13, defender: 3 })).toEqual([]);
    expect(fired(match, { kind: 'field', attacker: 2, defender: 13 })).toEqual([]);
  });

  it('plays when Sochetra and Rithy meet, whoever has the ball', () => {
    expect(fired(match, { kind: 'field', attacker: 13, defender: 6 })).toEqual(['ch1-final-duel']);
    expect(fired(match, { kind: 'field', attacker: 6, defender: 13 })).toEqual(['ch1-final-duel']);
  });

  it('plays in the chapter 1 final at a duel of Sochetra’s with Rithy', () => {
    const played = finalSession({ seed: 6 }).match;
    const watch = createWatch(
      CHAPTERS[0].stages.find((stage) => stage.id === 'ch1-final').triggers,
    );
    let met = null;

    // nobody sits at the pad here, so the computer picks both sides' moves; Rithy shoots at Dara
    // first in this match
    attachDuels(played, { watched: false });

    while (played.phase !== 'over' && !met) {
      tick(played);

      const events = drainEvents(played);
      const duel = events.find((event) => event.type === 'duel')?.duel;
      const hit = checkTriggers(watch, played, events).find(
        (one) => one.scene === 'ch1-final-duel',
      );

      met = hit ? new Set(duelStars(duel, played)) : null;
    }

    expect([...(met ?? [])].sort()).toEqual(['rithy', 'sochetra']);
  });
});
