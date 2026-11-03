import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { matchScreen, trainingScreen } from '../../../src/ui/app/canvas-screens.js';
import { createTrainingSession } from '../../../src/ui/flow/training-session.js';

// the touch layer lay over the whole canvas and took every touch, so on a phone no tap reached a
// drill's card, a duel's menu or a scene's box, and the PASS key sat over the drill's RETRY
const TOUCH_CSS = readFileSync(new URL('../../../styles/touch.css', import.meta.url), 'utf8');

const ruleOf = (css, selector) =>
  css.match(new RegExp(`(^|\\n)${selector.replace('.', '\\.')} \\{([^}]*)\\}`))?.[2] ?? '';

describe('taps on a phone', () => {
  it('pass through the touch layer to the canvas, but for its keys and stick', () => {
    expect(ruleOf(TOUCH_CSS, '.touch')).toMatch(/pointer-events: none/);
  });

  it('meet no touch pad over a drill card, only while the drill runs', () => {
    const session = createTrainingSession('cone-dribble', { seed: 3, level: 1, lang: 'en' });
    const screen = trainingScreen(session);

    for (const [phase, shown] of [
      ['intro', false],
      ['ready', true],
      ['play', true],
      ['result', false],
    ]) {
      session.state.phase = phase;
      expect(screen.playing).toBe(shown);
    }
  });

  it('meet no touch pad over a duel menu, a scene or a television card', () => {
    const session = { done: false, overlay: null, duelShow: null, penaltyShow: null, tv: {} };
    const screen = matchScreen({ ...session, venue: 'village-field' });
    const live = (changes) => matchScreen({ ...session, ...changes }).playing;

    expect(screen.playing).toBe(true);
    expect(live({ duelShow: { stage: 'menu' } })).toBe(false);
    expect(live({ overlay: {} })).toBe(false);
    expect(live({ tv: { intro: {} } })).toBe(false);
    expect(live({ tv: { replay: {} } })).toBe(false);
    expect(live({ penaltyShow: {} })).toBe(false);
    expect(live({ done: true })).toBe(false);
  });
});
