import { describe, expect, it } from 'vitest';
import { KITS } from '../../../src/art/kits.js';
import { VIEW } from '../../../src/config.js';
import { createEffects } from '../../../src/render/effects/index.js';
import { drawComboCounters } from '../../../src/render/hud/combo-counter.js';
import { comboRect } from '../../../src/render/hud/layout.js';
import { createPixelCanvas } from '../../support/pixel-canvas.js';
import { fixtureMatch } from '../../integration/render/actors/match-fixture.js';

// The other side's combo counter, at the top right, was drawn straight on the crowd: "x2 COMBO" and
// its bar in yellow on a yellow and red stand could not be read. Each counter stands on a plate.

// a stand's yellow and red, a shade off any colour the HUD draws in
const CROWD = ['#e8b820', '#b8202a'];

function crowdCanvas() {
  const canvas = createPixelCanvas(VIEW.width, VIEW.height);
  const context = canvas.getContext('2d');

  for (let x = 0; x < VIEW.width; x += 2) {
    context.fillStyle = CROWD[(x >> 1) % 2];
    context.fillRect(x, 0, 2, VIEW.height);
  }

  return canvas;
}

const crowdAt = (canvas, x, y) => {
  const at = (y * canvas.width + x) * 4;
  const hex = `#${[...canvas.data.subarray(at, at + 3)].map((value) => value.toString(16).padStart(2, '0')).join('')}`;

  return CROWD.includes(hex);
};

// the box round all the counter drew in its corner, and the crowd pixels left inside it
function crowdInside(canvas, box) {
  const drawn = [];

  for (let y = box.y; y < box.y + box.height; y += 1) {
    for (let x = box.x; x < box.x + box.width; x += 1) {
      if (!crowdAt(canvas, x, y)) {
        drawn.push([x, y]);
      }
    }
  }

  const xs = drawn.map(([x]) => x);
  const ys = drawn.map(([, y]) => y);
  const left = Math.min(...xs) + 3;
  const right = Math.max(...xs) - 3;
  let showing = 0;

  for (let y = Math.min(...ys) + 3; y <= Math.max(...ys) - 3; y += 1) {
    for (let x = left; x <= right; x += 1) {
      showing += crowdAt(canvas, x, y) ? 1 : 0;
    }
  }

  return showing;
}

function countersOver(canvas, { lang, shirts }) {
  const match = fixtureMatch();
  const effects = createEffects();

  effects.combos[0] = { level: 3, climbedAt: 560, endedAt: null, endLevel: 0, endBurst: false };
  effects.combos[1] = { level: 2, climbedAt: 560, endedAt: null, endLevel: 0, endBurst: false };
  match.combo = { team: 1, level: 2, since: 560 };
  drawComboCounters(canvas.getContext('2d'), match, {
    effects,
    kits: shirts.map((kit) => ({ outfield: kit })),
    lang,
    tick: 600,
  });

  return match;
}

describe('the combo counters', () => {
  it('stand on a plate of their own, so the crowd never shows between the digits', () => {
    for (const lang of ['en', 'km']) {
      for (const shirts of [
        [KITS.cambodia.home, KITS.japan.home],
        [KITS['chrey-school'].home, KITS['royal-kids'].home],
        [KITS.cambodia.away, KITS['phnom-penh-elite'].home],
      ]) {
        const canvas = crowdCanvas();
        const match = countersOver(canvas, { lang, shirts });

        for (const team of [0, 1]) {
          const box = comboRect(match, team);
          const around = { x: box.x - 8, y: box.y - 8, width: box.width + 16, height: 64 };

          expect(crowdInside(canvas, around), `${lang} side ${team}`).toBe(0);
        }
      }
    }
  });
});
