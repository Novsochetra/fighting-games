import { describe, expect, it } from 'vitest';
import { RIVAL_TAGS, rivalOf } from '../../../../src/render/cinematics/intro/rivals.js';
import {
  createIntro,
  isIntroDone,
  updateIntro,
} from '../../../../src/render/cinematics/intro/timeline.js';
import { TEAMS } from '../../../../src/data/teams/index.js';

const OPTIONS = {
  home: TEAMS['cambodia-youth'],
  away: TEAMS['japan-youth'],
  cup: { en: 'Asian Youth Championship', km: 'ជើងឯកយុវជនអាស៊ី' },
  round: { en: 'Final', km: 'វគ្គផ្ដាច់ព្រ័ត្រ' },
  venueName: 'Asia Stadium',
  rival: 'haruto',
};

function ticksToFinish(state, input = () => ({})) {
  let ticks = 0;

  while (!isIntroDone(state) && ticks < 1000) {
    updateIntro(state, input(ticks));
    ticks += 1;
  }

  return ticks;
}

describe('the match intro', () => {
  it('lasts about four seconds with a rival to watch', () => {
    const ticks = ticksToFinish(createIntro(OPTIONS));

    expect(ticks).toBeGreaterThanOrEqual(220);
    expect(ticks).toBeLessThanOrEqual(260);
  });

  it('is shorter with no rival, and still lands KICK OFF last', () => {
    const state = createIntro({ ...OPTIONS, rival: null });

    expect(state.rival).toBeNull();
    expect(ticksToFinish(state)).toBeLessThan(ticksToFinish(createIntro(OPTIONS)));
    expect(state.beats.kickoff).toBeGreaterThan(state.beats.out);
  });

  it('brings each graphic in after the one before it', () => {
    const { beats } = createIntro(OPTIONS);

    expect(beats.cup).toBeLessThan(beats.teams);
    expect(beats.teams).toBeLessThan(beats.rival);
    expect(beats.rival).toBeLessThan(beats.out);
    expect(beats.kickoff).toBeLessThan(beats.length);
  });

  it('sends the graphics off on a first press of pass, and ends on a second', () => {
    const state = createIntro(OPTIONS);

    updateIntro(state);
    updateIntro(state, { pass: true });

    expect(state.tick).toBe(state.beats.out);
    expect(state.skipped).toBe(true);
    expect(isIntroDone(state)).toBe(false);

    updateIntro(state, { pass: true });
    expect(isIntroDone(state)).toBe(true);
  });

  it('runs on to its end after one press, under a second later', () => {
    const state = createIntro(OPTIONS);

    updateIntro(state, { pass: true });

    expect(ticksToFinish(state)).toBeLessThan(60);
  });

  it('stays done', () => {
    const state = createIntro(OPTIONS);

    ticksToFinish(state);
    updateIntro(state, { pass: true });

    expect(state.tick).toBe(state.beats.length);
  });

  it('keeps only the names of the teams, and their kits as the pitch shows them', () => {
    const state = createIntro(OPTIONS);

    expect(state.teams[0]).toEqual({
      id: 'cambodia-youth',
      name: TEAMS['cambodia-youth'].name,
      short: 'CAM',
      kit: 'cambodia',
    });
    expect(state.kits).toHaveLength(2);
    expect(state.kits[0].shirt).toHaveLength(4);
    expect(state.kits[0].shirt).not.toEqual(state.kits[1].shirt);
  });

  it('takes a cup by its name or as a cup of the story', () => {
    const named = createIntro({ ...OPTIONS, cup: { name: OPTIONS.cup, kind: 'knockout' } });

    expect(named.cup).toEqual(OPTIONS.cup);
  });
});

describe('the rival to watch', () => {
  it('is found by id, with their name, tag, side and shirt number', () => {
    const rival = rivalOf('haruto', [OPTIONS.home, OPTIONS.away]);

    expect(rival).toMatchObject({
      character: 'haruto',
      mood: 'smirk',
      name: { en: 'Haruto', km: 'ហារូតូ' },
      tag: RIVAL_TAGS.haruto,
      side: 1,
      number: 10,
    });
  });

  it('stands on the home side when the home squad has them', () => {
    expect(rivalOf('rithy', [TEAMS['phnom-penh-elite'], OPTIONS.home]).side).toBe(0);
  });

  it('takes an age, a mood and a tag of its own', () => {
    const tag = { en: 'Old friend', km: 'មិត្តចាស់' };
    const rival = rivalOf({ character: 'rithy', age: 'teen', mood: 'determined', tag }, []);

    expect(rival).toMatchObject({ age: 'teen', mood: 'determined', tag, side: 1, number: null });
  });

  it('is null when no one is named', () => {
    expect(rivalOf(null)).toBeNull();
    expect(rivalOf({})).toBeNull();
  });

  it('has a tag in both languages for every rival of the story', () => {
    for (const tag of Object.values(RIVAL_TAGS)) {
      expect(tag.en).toBeTruthy();
      expect(tag.km).toBeTruthy();
    }
  });
});
