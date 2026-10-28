import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PAINTED_BACKDROPS } from '../../../src/data/backdrops/index.js';
import { readPngAlpha } from '../../support/png-alpha.js';

const ROOT = join(import.meta.dirname, '../../../');
const ROADS = Object.entries(PAINTED_BACKDROPS).filter(([, backdrop]) => backdrop.canopy);
// canopy-columns.js eases a trunk into the boughs round it over this many columns
const TRUNK_EDGE = 5;
// a stalk leans by up to a pixel or two, into a gap at least this wide beside it
const LEANING_ROOM = 4;

function paintingOf({ folder, canopy }) {
  return readPngAlpha(join(ROOT, `assets/backdrops/${folder}/${canopy.layer}.png`));
}

const columnsOf = (painting) => Array.from({ length: painting.width }, (_, x) => x);
const rowsOf = (from, to) => Array.from({ length: to - from }, (_, i) => from + i);
const paintedShare = (painting, [from, to], rows) => {
  const cells = rowsOf(from, to + 1).flatMap((x) => rows.map((y) => painting.alpha(x, y) > 0));

  return cells.filter(Boolean).length / cells.length;
};
const within = (spans, edge, x) => spans.some(([from, to]) => x >= from - edge && x <= to + edge);

describe('the painted trees raiders drop out of on a road with a canopy', () => {
  it('are on three roads, in a repeating layer of each painting, swaying down to a foot in it', () => {
    expect(ROADS.map(([road]) => road).sort()).toEqual(['bambooPass', 'fireflyHollow', 'oldGrove']);
    for (const [road, backdrop] of ROADS) {
      const { canopy } = backdrop;
      const layer = backdrop.layers.find((one) => one.name === canopy.layer);

      expect(layer && !layer.once, road).toBe(true);
      expect(canopy.foot, road).toBeLessThan(paintingOf(backdrop).height);
      expect(canopy.fade > 0 && canopy.fade <= canopy.foot, road).toBe(true);
    }
  });

  it('hold still trunks the painting has there, solid down through the rows that sway', () => {
    for (const [road, backdrop] of ROADS.filter(([, { canopy }]) => canopy.trunks)) {
      const { foot, fade, trunks } = backdrop.canopy;
      const painting = paintingOf(backdrop);

      for (const trunk of trunks) {
        expect(
          paintedShare(painting, trunk, rowsOf(foot - fade, foot)),
          `${road} ${trunk}`,
        ).toBeGreaterThan(0.85);
      }
    }
  });

  it('end all that hangs from the boughs above the foot, so nothing swaying is cut short', () => {
    for (const [road, backdrop] of ROADS.filter(([, { canopy }]) => canopy.trunks)) {
      const { foot, trunks } = backdrop.canopy;
      const painting = paintingOf(backdrop);
      const hanging = columnsOf(painting).filter(
        (x) => !within(trunks, TRUNK_EDGE, x) && painting.alpha(x, foot) > 0,
      );

      expect(hanging, road).toEqual([]);
    }
  });

  it('lean every stalk the painting has as one, each with room beside it to lean into', () => {
    for (const [road, backdrop] of ROADS.filter(([, { canopy }]) => canopy.stalks)) {
      const { foot, stalks } = backdrop.canopy;
      const painting = paintingOf(backdrop);
      const solid = columnsOf(painting).filter(
        (x) => paintedShare(painting, [x, x], rowsOf(0, foot)) > 0.9,
      );

      expect(
        solid.filter((x) => !within(stalks, 0, x)),
        road,
      ).toEqual([]);
      stalks.slice(1).forEach(([from], i) => {
        expect(from - stalks[i][1], `${road} ${from}`).toBeGreaterThan(LEANING_ROOM);
      });
    }
  });
});
