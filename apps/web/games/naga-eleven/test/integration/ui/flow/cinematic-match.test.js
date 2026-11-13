import { describe, expect, it } from 'vitest';

import { CINEMA } from '../../../../src/data/cinema.js';
import { createInput } from '../../../../src/sim/input-state.js';
import { createMatchSession, stepMatchSession } from '../../../../src/ui/flow/match-session.js';
import { createPlayedMatch } from '../../../../src/ui/flow/match-setup.js';
import { zoomOf } from '../../../../src/ui/flow/match-zoom.js';
import { sidesOf, storyMatch } from '../../../support/story-matches.js';

// the chapter 3 final under a cinematic camera
function finalSession(cinema) {
  const entry = storyMatch('ch3-final');
  const input = createInput();
  const match = createPlayedMatch({
    seed: 5,
    format: entry.stage.at.format,
    teams: sidesOf(entry),
    input,
  });

  return createMatchSession({
    match,
    venue: entry.stage.venue,
    heroAge: entry.stage.at.heroAge,
    lang: 'en',
    cinema,
  });
}

// what one frame did: whether the match jumped ticks, was held still in play, was zoomed, began a
// chase or a punch-in
function noteFrame(seen, session, { before, punchIn }) {
  const { match, duelShow } = session;
  const counts = {
    jumps: match.tick - before > 1,
    held: match.tick === before && match.phase === 'play' && !duelShow,
    zoomed: Boolean(zoomOf(session)),
    chases: duelShow?.stage === 'chase' && duelShow.stageTicks === 1,
    punchIns: Boolean(session.pace.punchIn) && session.pace.punchIn !== punchIn,
  };

  for (const [key, happened] of Object.entries(counts)) {
    seen[key] += happened ? 1 : 0;
  }
}

// the final played out, the player tapping PASS now and then for the duels' menus
function playFinal(cinema) {
  const session = finalSession(cinema);
  const input = session.match.input;
  const seen = { held: 0, zoomed: 0, punchIns: 0, jumps: 0, chases: 0 };

  for (let frame = 0; frame < 60000 && !session.done; frame += 1) {
    const before = session.match.tick;
    const punchIn = session.pace.punchIn;

    input.sources.keys.held.pass = frame % 30 === 0;
    stepMatchSession(session, input);
    noteFrame(seen, session, { before, punchIn });
  }

  return { session, seen };
}

describe('the cinematic camera over a whole match', { timeout: 30000 }, () => {
  it('punches in on skills, slowing play without ever skipping a tick of it', () => {
    const { session, seen } = playFinal('full');

    expect(session.done).toBe(true);
    expect(seen.punchIns).toBeGreaterThan(2);
    expect(seen.held).toBeGreaterThan(seen.punchIns);
    expect(seen.jumps).toBe(0);
    expect(seen.chases).toBeGreaterThan(0);
  });

  it('keeps every show of the match within its share of the real time', () => {
    const { budget } = playFinal('full').session;

    expect(budget.shows / (budget.shows + budget.play)).toBeLessThanOrEqual(CINEMA.budget.share);
  });

  it('never zooms or slows a match whose camera is off', () => {
    const { seen } = playFinal('off');

    expect(seen).toMatchObject({ held: 0, zoomed: 0, punchIns: 0, chases: 0 });
  });
});
