import { describe, expect, it } from 'vitest';
import { newSave, stageOf, teamSpecFor } from '../../../../src/campaign/index.js';
import { CHAPTERS } from '../../../../src/data/story/index.js';
import { TEAMS } from '../../../../src/data/teams/index.js';
import { createInput } from '../../../../src/sim/input-state.js';
import { drawMatchSession } from '../../../../src/ui/flow/match-draw.js';
import {
  createMatchSession,
  isMatchSessionDone,
  matchSessionResult,
  stepMatchSession,
} from '../../../../src/ui/flow/match-session.js';
import { createPlayedMatch, heroOf } from '../../../../src/ui/flow/match-setup.js';
import { createTv } from '../../../../src/ui/flow/match-tv.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';

// the chapter 1 final, against Royal Kids and Rithy
function finalSession() {
  const save = {
    ...newSave({ seed: 4 }),
    stage: CHAPTERS[0].stages.findIndex((stage) => stage.id === 'ch1-final'),
  };
  const stage = stageOf(save, CHAPTERS, TEAMS);
  const teams = [teamSpecFor(save, stage.at.team, TEAMS), teamSpecFor(save, stage.opponent, TEAMS)];
  const match = createPlayedMatch({ seed: 9, format: stage.at.format, teams, length: 'short' });

  const session = createMatchSession({
    match,
    venue: stage.venue,
    triggers: stage.triggers,
    sceneOf: (id) => CHAPTERS[0].scenes[id] ?? null,
    heroAge: stage.at.heroAge,
    lang: 'en',
    knockout: stage.rule === 'knockout',
  });

  session.specs = teams;
  session.tv = createTv(session, { cup: stage.at.cup?.name, round: stage.round, rival: 'rithy' });

  return session;
}

function note(seen, session, wasReplaying) {
  if (session.overlay) {
    seen.scenes.add(session.overlay.state.scene ?? session.overlay);
  }

  if (!wasReplaying && session.tv?.replay) {
    seen.replays += 1;
  }
}

// a player who leans on pass: scenes press on, duel menus take their first option
function playOut(session, most = 40000) {
  const input = createInput();
  const seen = { scenes: new Set(), replays: 0, intro: Boolean(session.tv?.intro) };

  for (let i = 0; i < most && !isMatchSessionDone(session); i += 1) {
    const wasReplaying = Boolean(session.tv?.replay);

    input.sources.keys.held.pass = i % 20 < 2;
    stepMatchSession(session, input);
    note(seen, session, wasReplaying);
  }

  return seen;
}

describe('a story match session', () => {
  it('plays the chapter 1 final to its end, with its story moments over the match', () => {
    const session = finalSession();
    const seen = playOut(session);
    const result = matchSessionResult(session);
    const goals = session.match.score[0] + session.match.score[1];

    expect(isMatchSessionDone(session)).toBe(true);
    expect(seen.intro).toBe(true);
    expect(seen.scenes.size).toBeGreaterThan(0);
    expect(seen.replays).toBe(goals);
    expect(result.goalsFor + result.goalsAgainst).toBeGreaterThanOrEqual(0);
    expect(result.penalties === null || typeof result.penalties === 'boolean').toBe(true);
    expect(heroOf(session.match)).toBeTruthy();
  }, 60000);

  it('draws a frame of the match', () => {
    const session = finalSession();
    const canvas = createPixelCanvas(768, 432);

    for (let i = 0; i < 30; i += 1) {
      stepMatchSession(session, createInput());
    }

    expect(() => drawMatchSession(canvas.getContext('2d'), session, { tick: 30 })).not.toThrow();
  });
});
