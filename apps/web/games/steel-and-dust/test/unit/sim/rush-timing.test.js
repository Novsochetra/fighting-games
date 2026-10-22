import { describe, expect, it } from 'vitest';
import { HERO_SPRITES } from '../../../src/data/hero-sprites.js';
import { POUNDING_LION } from '../../../src/data/ultimates/pounding-lion.js';
import { WEAPONS } from '../../../src/data/weapons/index.js';
import {
  blowAt,
  FISTS_ROW,
  RUSH_BLOWS,
  RUSH_END,
  rushFrame,
  WAKE_AT,
} from '../../../src/sim/ultimates/rush-timing.js';

const { rushAt, rush, zipTicks, windTicks, pride, pounceAt } = POUNDING_LION;

describe("Pounding the Lion's rush", () => {
  it('strikes once for every lion of the pride, one blow straight after another', () => {
    expect(RUSH_BLOWS).toHaveLength(pride.length);
    expect(RUSH_BLOWS[0].start).toBe(rushAt);
    RUSH_BLOWS.slice(1).forEach((blow, i) => expect(blow.start).toBe(RUSH_BLOWS[i].end));
    expect(RUSH_END).toBe(RUSH_BLOWS.at(-1).end);
    expect(WAKE_AT).toBeGreaterThan(RUSH_END);
    expect(WAKE_AT).toBeLessThan(pounceAt);
  });

  it('zips in and winds up before each blow lands, and holds it a moment after', () => {
    for (const blow of RUSH_BLOWS) {
      expect(blow.strikeAt).toBe(blow.start + zipTicks + windTicks);
      expect(blow.end).toBeGreaterThan(blow.strikeAt + 1);
    }
  });

  it('gets quicker as it goes, with the elbow drop held longest', () => {
    const ticks = rush.map((blow) => blow.ticks);
    const run = ticks.slice(0, -1);
    run.slice(1).forEach((tick, i) => expect(tick).toBeLessThanOrEqual(run[i]));
    expect(ticks.at(-1)).toBe(Math.max(...ticks));
  });

  it('fights with elbows, knees and kicks from his own strips, never two the same in a row', () => {
    rush.forEach(({ sprite: [strip, strike] }, i) => {
      expect(strike, strip).toBeGreaterThan(0);
      expect(strike, strip).toBeLessThan(HERO_SPRITES.frames[strip]);
      if (i > 0) {
        expect(rush[i - 1].sprite).not.toEqual([strip, strike]);
      }
    });
  });

  it('draws him bare-handed: the fists row of every strip', () => {
    expect(FISTS_ROW).toBe(WEAPONS.fists.spriteRow);
    for (let time = rushAt; time < WAKE_AT; time++) {
      expect(rushFrame(time)[2], `tick ${time}`).toBe(FISTS_ROW);
    }
  });

  it('dashes, winds up on the frame before the strike, then strikes', () => {
    const [first] = RUSH_BLOWS;
    const [strip, strike] = first.sprite;
    expect(rushFrame(first.start)[0]).toBe('dash');
    expect(rushFrame(first.strikeAt - 1)).toEqual([strip, strike - 1, FISTS_ROW]);
    expect(rushFrame(first.strikeAt)).toEqual([strip, strike, FISTS_ROW]);
    expect(rushFrame(first.end - 1)).toEqual([strip, strike, FISTS_ROW]);
    expect(rushFrame(RUSH_END)[0]).toBe('dash');
  });

  it('knows which blow a tick belongs to', () => {
    expect(blowAt(rushAt - 1)).toBe(-1);
    expect(blowAt(rushAt)).toBe(0);
    expect(blowAt(RUSH_END - 1)).toBe(RUSH_BLOWS.length - 1);
    expect(blowAt(RUSH_END)).toBe(-1);
  });
});
