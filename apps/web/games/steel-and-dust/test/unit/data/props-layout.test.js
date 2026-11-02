import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { RENDER_SCALE, VIEW_WIDTH } from '../../../src/config.js';
import { WALL_DEBRIS } from '../../../src/art/wall-debris.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { doorwayOf, propsShown } from '../../../src/data/missions/props-layout.js';
import { PROP_SPRITES } from '../../../src/data/prop-sprites.js';
import { pngSize } from '../../support/png-size.js';

const PROPS = fileURLToPath(new URL('../../../assets/sprites/props/', import.meta.url));

const leftEdge = ({ kind, x }) => x - PROP_SPRITES[kind].feetX / RENDER_SCALE;

describe("a road's way out and way in", () => {
  it('opens every road after the first on the wall the road before closes with, broken open', () => {
    for (const [i, mission] of MISSIONS.entries()) {
      expect(mission.entry).toBe(i ? `${MISSIONS[i - 1].endWall}Broken` : undefined);
    }
  });

  for (const mission of MISSIONS) {
    const wall = mission.props.at(-1);

    it(`smashes ${mission.name}'s ${wall.kind} open over the same columns it stood on`, () => {
      const { broken, face } = mission.wayOut;
      expect(broken.kind).toBe(`${wall.kind}Broken`);
      expect(face).toBe(leftEdge(wall));
      expect(leftEdge(broken)).toBe(face);
      expect(broken.y).toBe(wall.y);
      const whole = pngSize(join(PROPS, PROP_SPRITES[wall.kind].file));
      expect(pngSize(join(PROPS, PROP_SPRITES[broken.kind].file)).width).toBe(whole.width);
      expect(WALL_DEBRIS[wall.kind].length).toBeGreaterThan(0);
    });
  }

  for (const mission of MISSIONS) {
    const wall = mission.props.at(-1);

    it(`stands ${mission.name}'s closing wall whole on the road's last screen`, () => {
      const { width, feetX } = PROP_SPRITES[wall.kind];
      expect(leftEdge(wall)).toBeGreaterThan(mission.length - VIEW_WIDTH);
      expect(wall.x + (width - feetX) / RENDER_SCALE).toBeLessThanOrEqual(mission.length);
    });
  }

  for (const [kind, sprite] of Object.entries(PROP_SPRITES)) {
    it(`gives the ${kind} sprite its own width${kind.endsWith('Broken') ? ' and a doorway' : ''}`, () => {
      expect(pngSize(join(PROPS, sprite.file)).width).toBe(sprite.width);

      if (!kind.endsWith('Broken')) {
        expect(sprite.doorway).toBeUndefined();
        return;
      }

      const { dark, opening } = sprite.doorway;
      const [left, top, right, bottom] = dark ? [dark[0], 0, dark[1], 1] : opening;
      expect(0 < left && left < right && right < sprite.width).toBe(true);
      expect(top < bottom && bottom <= sprite.width * 2).toBe(true);
      expect(Boolean(dark) !== Boolean(opening)).toBe(true);
    });
  }

  it("sets a door's dark on the road where the door stands", () => {
    const door = doorwayOf({ kind: 'templeDoorBroken', x: 100, y: 180 });
    expect(door).toMatchObject({ dark: true, left: 100 - 8 + 21, right: 100 - 8 + 27.5 });
  });

  it("sets a fence's opening on the road where the fence stands", () => {
    const fence = doorwayOf({ kind: 'palisadeBroken', x: 10, y: 180 });
    const opening = { x: 10 - 8 + 11, y: 180 - 55, width: 19, height: 56 };
    expect(fence).toMatchObject({ dark: false, left: 13, right: 32, opening });
  });

  it('shows the closing wall whole until it is smashed, and the way in all along', () => {
    const mission = MISSIONS[7];
    expect(propsShown(mission, false)).toBe(mission.props);
    expect(propsShown(mission, true)).toEqual([mission.props[0], mission.wayOut.broken]);
  });
});
