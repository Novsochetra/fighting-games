import { afterEach, describe, expect, it } from 'vitest';

import { UNIT } from '../../../../src/render/duel/layout.js';
import { createDuelShow } from '../../../../src/render/duel/show.js';
import { updateDuelShow } from '../../../../src/render/duel/timeline.js';
import { goalStyleOf } from '../../../../src/render/save-cam/backdrop.js';
import { setSaveCamCanvasFactory } from '../../../../src/render/save-cam/backdrops/still.js';
import {
  createSaveCam,
  drawSaveCam,
  prepareSaveCam,
} from '../../../../src/render/save-cam/index.js';
import { FRAME } from '../../../../src/render/save-cam/view.js';
import { VENUES } from '../../../../src/render/venues/catalog.js';
import { stepMatchShows } from '../../../../src/ui/flow/match-shows.js';
import { fakeMatch, forwardOn, giveBall, keeperOn } from '../../../support/duel-fixtures.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { strictContext } from '../duel/strict-context.js';

const IDS = Object.keys(VENUES);
const MOMENT = {
  shooter: 4,
  keeper: 5,
  move: 'naga-shot',
  result: 'goal',
  aim: { side: -0.7, height: 0.6 },
  dive: -1,
};

const hexAt = (canvas, x, y) => {
  const at = ((y * UNIT + 1) * canvas.width + x * UNIT + 1) * 4;

  return `#${[...canvas.data.subarray(at, at + 3)].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
};

function drawn(venue, ticks, { context = null } = {}) {
  const canvas = context ? null : createPixelCanvas(768, 432);
  const cam = createSaveCam(fakeMatch(), MOMENT, { length: 96, venue });

  cam.ticks = ticks;
  drawSaveCam(context ?? canvas.getContext('2d'), cam, { tick: 500 + ticks, bars: false });

  return canvas;
}

afterEach(() => setSaveCamCanvasFactory(null));

describe('the save cam at each venue', { timeout: 20000 }, () => {
  it.each(IDS)('draws the %s through a goal and its bulge with no NaN', (venue) => {
    const { context, bad } = strictContext();

    setSaveCamCanvasFactory(createPixelCanvas);

    for (const ticks of [4, 30, 40, 52, 70, 96]) {
      drawn(venue, ticks, { context });
    }

    expect(bad).toEqual([]);
  });

  it.each(IDS)('stands the %s’s own posts either side of the keeper', (venue) => {
    const canvas = drawn(venue, 4);
    const { post } = goalStyleOf(venue);

    expect(post).toContain(hexAt(canvas, FRAME.left - 2, 70));
    expect(post).toContain(hexAt(canvas, FRAME.right + 1, 70));
  });

  it.each(IDS.filter((id) => id !== 'world-stadium'))(
    'paints the %s the same from its cached canvas as laid down in runs',
    (venue) => {
      const runs = drawn(venue, 30);

      setSaveCamCanvasFactory(createPixelCanvas);

      expect(drawn(venue, 30).data).toEqual(runs.data);
    },
  );
});

describe('a venue’s save cam painted ahead', () => {
  it('paints its stills as the match is set up, so its first show paints none', () => {
    const made = [];

    setSaveCamCanvasFactory((width, height) => {
      made.push([width, height]);

      return createPixelCanvas(width, height);
    });
    prepareSaveCam('city-school-stadium');

    expect(made).toEqual([
      [256, 144],
      [256, 144],
    ]);

    for (const ticks of [4, 30, 52]) {
      drawn('city-school-stadium', ticks);
    }

    expect(made).toHaveLength(2);
  });
});

describe('the venue reaches the save cam', () => {
  it('from the match session in open play', () => {
    const match = fakeMatch();
    const session = { match, venue: 'village-field', duelShow: null, saveCamShow: null };

    Object.assign(match, { phase: 'saveCam', saveCam: { ...MOMENT, result: 'saved' } });
    stepMatchShows(session, {});

    expect(session.saveCamShow.venue).toBe('village-field');
  });

  it("from the duel show, in a duel's keeper round", () => {
    const match = fakeMatch({ humanTeam: null });
    const shooter = Object.assign(forwardOn(match, 0), { star: 'sochetra', x: 850, spirit: 200 });

    Object.assign(keeperOn(match, 1), { spirit: 200 });
    shooter.moves = ['naga-shot'];
    giveBall(match, shooter);
    match.hooks.special(match, shooter);

    const show = createDuelShow(match, { venue: 'city-school-stadium' });

    for (let i = 0; i < 2000 && !show.saveCam; i += 1) {
      updateDuelShow(show, {});
      match.hooks.duelTick?.(match);
    }

    expect(show.saveCam.venue).toBe('city-school-stadium');
  });
});
