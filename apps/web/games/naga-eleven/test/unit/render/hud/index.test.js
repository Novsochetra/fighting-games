import { describe, expect, it } from 'vitest';
import { HUD } from '../../../../src/art/hud.js';
import { drawHud } from '../../../../src/render/hud/index.js';
import { fixtureMatch } from '../../../integration/render/actors/match-fixture.js';
import { createRecordingContext } from '../../../support/recording-context.js';

function hudOf(fields, options = {}) {
  const match = Object.assign(fixtureMatch(), fields);
  const { context, calls } = createRecordingContext();
  const minimaps = [];

  context.measureText = (text) => ({ width: [...text].length * 5 });

  const setUp = calls.length;

  drawHud(context, match, { ...options, minimap: () => minimaps.push(match) });

  const fills = calls.filter((call) => call.name === 'fillStyle').map((call) => call.args[0]);

  return {
    drawn: calls.length > setUp,
    minimap: minimaps.length > 0,
    band: fills.includes(HUD.banner),
  };
}

const GOAL = { phase: 'goal', phaseTicks: 20, lastScorer: 0 };

describe('the HUD and what is laid over the match', () => {
  it('raises the GOAL band in play', () => {
    expect(hudOf(GOAL, { effects: {} }).band).toBe(true);
  });

  it('keeps its banner waiting while a story scene holds the match', () => {
    const held = hudOf(GOAL, { effects: { held: true } });

    expect(held.band).toBe(false);
    expect(held.drawn).toBe(true);
  });

  it('stays off before kick off while television’s opening card plays', () => {
    const before = { phase: 'kickoff', tick: 0, phaseTicks: 0 };

    expect(hudOf(before, { tv: true }).drawn).toBe(false);
    expect(hudOf({ ...before, tick: 1, phaseTicks: 1 }, { tv: true }).minimap).toBe(true);
    expect(hudOf(before).minimap).toBe(true);
  });
});
