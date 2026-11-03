import { describe, expect, it } from 'vitest';
import { CARD, KEYS } from '../../../../src/art/training/cards.js';
import { VIEW } from '../../../../src/config.js';
import { DRILL_IDS, DRILLS } from '../../../../src/data/training.js';
import { seconds } from '../../../../src/render/training/hud.js';
import { HOW_TO_ICONS } from '../../../../src/render/training/icons.js';
import { INTRO_CARD } from '../../../../src/render/training/intro-card.js';
import { LABELS } from '../../../../src/render/training/labels.js';
import { RESULT_BUTTONS } from '../../../../src/render/training/result-card.js';
import { statsOf } from '../../../../src/render/training/stats.js';
import { createDrill } from '../../../../src/training/index.js';
import { parseColor } from '../../../support/pixel-color.js';

function luminance(color) {
  const [red, green, blue] = parseColor(color).map((value) => {
    const share = value / 255;

    return share <= 0.03928 ? share / 12.92 : ((share + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(words, face) {
  const light = Math.max(luminance(words), luminance(face));
  const dark = Math.min(luminance(words), luminance(face));

  return (light + 0.05) / (dark + 0.05);
}

const inView = (box) =>
  box.x >= 0 && box.y >= 0 && box.x + box.width <= VIEW.width && box.y + box.height <= VIEW.height;

describe('the training cards', () => {
  it('stand inside the view, the buttons inside the card and apart', () => {
    const { pass, shoot } = RESULT_BUTTONS;

    expect(inView(INTRO_CARD)).toBe(true);

    for (const box of [pass, shoot]) {
      expect(box.x).toBeGreaterThan(INTRO_CARD.x);
      expect(box.x + box.width).toBeLessThan(INTRO_CARD.x + INTRO_CARD.width);
      expect(box.y + box.height).toBeLessThan(INTRO_CARD.y + INTRO_CARD.height);
    }

    expect(pass.x + pass.width).toBeLessThan(shoot.x);
  });

  it.each(DRILL_IDS)('have a picture for each how-to line of %s', (drill) => {
    expect(HOW_TO_ICONS[drill]).toHaveLength(DRILLS[drill].howTo.length);
  });

  it.each(DRILL_IDS)('list the score, the best combo and two lines of %s', (drill) => {
    const stats = statsOf(createDrill(drill, { seed: 1 }));

    expect(stats).toHaveLength(4);
    expect(stats[0]).toMatchObject({ label: LABELS.score, value: '0' });
    expect(stats.every((stat) => typeof stat.value === 'string' || stat.value.en)).toBe(true);
  });

  it('writes every word of its own in both languages', () => {
    for (const words of Object.values(LABELS)) {
      expect(words.en).toBeTruthy();
      expect(words.km).toMatch(/[ក-៿]/);
    }
  });

  it.each(Object.keys(KEYS))('writes the %s key in words that stand out from its face', (key) => {
    const { face, ink } = KEYS[key];

    expect(contrast(ink ?? CARD.text, face)).toBeGreaterThanOrEqual(3);
  });

  it('shows time in seconds with a tenth', () => {
    expect(seconds(0)).toBe('0.0');
    expect(seconds(90)).toBe('1.5');
    expect(seconds(-5)).toBe('0.0');
  });
});
