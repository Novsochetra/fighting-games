import { describe, expect, it } from 'vitest';

import { CINEMA } from '../../../../src/data/cinema.js';
import { createBudget } from '../../../../src/render/cinema/budget.js';
import {
  createPace,
  hearSkills,
  holdsFrame,
  stepPace,
} from '../../../../src/ui/flow/match-pace.js';

const { punchIn: RULES } = CINEMA;

const sessionOf = (cinema, { tick = 1000, half = 1 } = {}) => ({
  cinema,
  pace: createPace(),
  budget: createBudget(),
  match: { tick, half, phase: 'play' },
});

const SKILL = [{ type: 'skill', player: 7, move: 'kite-cross' }];

function framesOf(session) {
  let stepped = 0;
  let frames = 0;

  while (session.pace.punchIn && frames < 200) {
    stepped += stepPace(session) ? 1 : 0;
    frames += 1;
  }

  return { stepped, frames };
}

describe('the camera in open play', () => {
  it('punches in on the player of a skill, its first frames at half speed', () => {
    const session = sessionOf('full');

    hearSkills(session, SKILL);

    expect(session.pace.punchIn).toMatchObject({ player: 7, slow: RULES.slowTicks });
    expect(framesOf(session)).toEqual({
      frames: RULES.ticks + 1,
      stepped: RULES.ticks + 1 - RULES.slowTicks / 2,
    });
  });

  it('punches in without slowing on a camera that adds no time, and not at all when off', () => {
    const short = sessionOf('short');
    const off = sessionOf('off');

    hearSkills(short, SKILL);
    hearSkills(off, SKILL);

    expect(short.pace.punchIn.slow).toBe(0);
    expect(off.pace.punchIn).toBeNull();

    const { stepped, frames } = framesOf(short);

    expect(stepped).toBe(frames);
  });

  it('rests between punch-ins, and keeps to so many a half', () => {
    const session = sessionOf('full');

    hearSkills(session, SKILL);
    session.pace.punchIn = null;
    session.match.tick += RULES.gapTicks - 1;
    hearSkills(session, SKILL);
    expect(session.pace.punchIn).toBeNull();

    for (let i = 1; i < RULES.mostPerHalf + 2; i += 1) {
      session.pace.punchIn = null;
      session.match.tick += RULES.gapTicks;
      hearSkills(session, SKILL);
    }

    expect(session.pace.inHalf).toBe(RULES.mostPerHalf);

    session.pace.punchIn = null;
    session.match.half = 2;
    session.match.tick += RULES.gapTicks;
    hearSkills(session, SKILL);
    expect(session.pace.inHalf).toBe(1);
  });

  it('lets go as play stops, and counts every frame it holds as show', () => {
    const session = sessionOf('full');

    hearSkills(session, SKILL);
    expect(holdsFrame(session)).toBe(true);
    expect(session.budget.shows).toBe(1);

    session.match.phase = 'duel';

    expect(holdsFrame(session)).toBe(false);
    expect(session.pace.punchIn).toBeNull();
  });

  it('plays no slow motion once the match has spent its share of real time on shows', () => {
    const session = sessionOf('full');

    session.budget.shows = 1e6;
    hearSkills(session, SKILL);

    expect(session.pace.punchIn.slow).toBe(0);
  });
});
