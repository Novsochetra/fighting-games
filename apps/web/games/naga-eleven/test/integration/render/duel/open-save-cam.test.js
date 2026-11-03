import { describe, expect, it } from 'vitest';

import { SAVE_CAM_TICKS } from '../../../../src/render/save-cam/index.js';
import { stepMatchShows } from '../../../../src/ui/flow/match-shows.js';
import { fakeMatch } from '../../../support/duel-fixtures.js';

// a match the sim has paused for a save cam in its `saveCam` phase
function pausedSession(moment = {}) {
  const match = fakeMatch();

  match.phase = 'saveCam';
  match.saveCam = {
    shooter: 4,
    keeper: 5,
    move: 'kouprey-kick',
    guard: 'bayon-eyes',
    result: 'saved',
    ...moment,
  };

  return { match, duelShow: null, saveCamShow: null };
}

// the show ended it: the sim's endSaveCam has let play go on
const isEnded = (session) => session.match.phase === 'play' && session.match.saveCam === null;

describe('the save cam in open play', () => {
  it('comes up as the sim pauses for it, plays its length and lets play go on', () => {
    const session = pausedSession();

    stepMatchShows(session, {});

    expect(session.saveCamShow.moment.guardLook).toBe('bayon');

    for (let i = 1; i < SAVE_CAM_TICKS.open; i += 1) {
      stepMatchShows(session, {});
    }

    expect(isEnded(session)).toBe(true);
    expect(session.saveCamShow).toBeNull();
  });

  it('is skipped by a press once it has run a moment', () => {
    const session = pausedSession();

    for (let i = 0; i <= SAVE_CAM_TICKS.skipAfter; i += 1) {
      stepMatchShows(session, { pressed: { pass: i < 3 } });
    }

    expect(isEnded(session)).toBe(false);

    stepMatchShows(session, { pressed: { shoot: true } });

    expect(isEnded(session)).toBe(true);
  });

  it('goes when the sim moves on by itself, and never comes up in plain play', () => {
    const session = pausedSession();

    stepMatchShows(session, {});
    session.match.phase = 'goal';
    stepMatchShows(session, {});

    expect(session.saveCamShow).toBeNull();
    expect(session.match.phase).toBe('goal');

    session.match.phase = 'play';
    stepMatchShows(session, {});

    expect(session.saveCamShow).toBeNull();
  });
});
