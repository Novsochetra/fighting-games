import { describe, expect, it } from 'vitest';
import { HUD } from '../../../../src/art/hud.js';
import { PHASE_TICKS } from '../../../../src/data/tuning.js';
import { looksOf } from '../../../../src/render/actors/looks.js';
import { bannerOf } from '../../../../src/render/hud/banners.js';
import { BANNER_TEXT } from '../../../../src/render/hud/labels.js';
import { fixtureMatch } from '../../../integration/render/actors/match-fixture.js';

function bannerAt(fields, effects = null) {
  const match = Object.assign(fixtureMatch(), fields);

  return bannerOf(match, { kits: looksOf(match).kits, effects, lang: 'en' });
}

describe('the banner of the moment', () => {
  it('announces each phase of the match across the view', () => {
    expect(bannerAt({ phase: 'kickoff', phaseTicks: 10 }).label).toBe(BANNER_TEXT.kickOff);
    expect(bannerAt({ phase: 'halfTime', phaseTicks: 10 }).label).toBe(BANNER_TEXT.halfTime);
    expect(bannerAt({ phase: 'over', phaseTicks: 9000 }).label).toBe(BANNER_TEXT.fullTime);
    expect(bannerAt({ phase: 'kickoff', phaseTicks: 10 }).size).toBe('big');
  });

  it('is gone once its phase has had its time, and in open play', () => {
    expect(bannerAt({ phase: 'kickoff', phaseTicks: PHASE_TICKS.kickoff })).toBeNull();
    expect(bannerAt({ phase: 'play' })).toBeNull();
  });

  it('calls a goal in the scoring side colours, with the scorer under it', () => {
    const effects = { goal: { team: 1, scorer: 20, move: null } };
    const match = fixtureMatch();
    const banner = bannerAt({ phase: 'goal', phaseTicks: 5, lastScorer: 1 }, effects);

    expect(banner.label).toBe(BANNER_TEXT.goal);
    expect(banner.ramp).toBe(looksOf(match).kits[1].outfield.shirt);
    expect(banner.line).toBe('MINJUN');
    expect(banner.wave).toBe(true);
  });

  it('tags a restart small, in the colours of the side that takes it', () => {
    for (const [kind, label] of [
      ['throwIn', BANNER_TEXT.throwIn],
      ['corner', BANNER_TEXT.corner],
      ['goalKick', BANNER_TEXT.goalKick],
    ]) {
      const banner = bannerAt({
        phase: 'restart',
        phaseTicks: 4,
        restart: { kind, team: 0, x: 0, y: 0 },
      });

      expect(banner).toMatchObject({ size: 'small', label });
    }

    expect(bannerAt({ phase: 'restart', restart: { kind: 'kickoff', team: 0 } })).toBeNull();
  });

  it('has every banner in Khmer too', () => {
    for (const label of Object.values(BANNER_TEXT)) {
      expect(label.km).toMatch(/[ក-៿]/);
    }

    expect(HUD.gold).toHaveLength(4);
  });
});
