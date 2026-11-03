import { describe, expect, it } from 'vitest';
import { DRILL_IDS } from '../../../../src/data/training.js';
import { PITCH_SIDE } from '../../../../src/data/skins/pitch-side.js';
import { drillKeys } from '../../../../src/render/training/touch-keys.js';
import { createDrill } from '../../../../src/training/index.js';

const STICK = ['up', 'down', 'left', 'right'];

const drillIn = (drill, phase) => Object.assign(createDrill(drill, { seed: 3 }), { phase });

const skinInputs = new Set(
  PITCH_SIDE.layouts.landscape.items.flatMap((item) =>
    Array.isArray(item.inputs) ? item.inputs : Object.values(item.inputs),
  ),
);

describe('the keys a drill shows on the touch pad', () => {
  it('are the stick and RUN for the slalom, the stick and SHOOT for the shots, PASS to focus', () => {
    expect(drillKeys(drillIn('cone-dribble', 'play'))).toEqual([...STICK, 'sprint']);
    expect(drillKeys(drillIn('target-shot', 'play'))).toEqual([...STICK, 'shoot']);
    expect(drillKeys(drillIn('spirit-focus', 'play'))).toEqual(['pass']);
  });

  it.each(DRILL_IDS)('stay the one list from READY to the finish of %s', (drill) => {
    const shown = drillKeys(drillIn(drill, 'ready'));

    expect(drillKeys(drillIn(drill, 'play'))).toBe(shown);
    expect(drillKeys(drillIn(drill, 'finish'))).toBe(shown);
  });

  it.each(DRILL_IDS)('are all of them on the cards of %s, and all the skin’s own', (drill) => {
    expect(drillKeys(drillIn(drill, 'intro'))).toBeNull();
    expect(drillKeys(drillIn(drill, 'result'))).toBeNull();

    for (const input of drillKeys(drillIn(drill, 'play'))) {
      expect(skinInputs.has(input)).toBe(true);
    }
  });
});
