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

      const { middle, inside } = sprite.doorway;
      expect(middle).toBeGreaterThan(0);
      expect(middle).toBeLessThan(sprite.width);

      if (inside) {
        const [left, top, right, bottom] = inside;
        expect(left < middle && middle < right && top < bottom).toBe(true);
        expect(right <= sprite.width && bottom <= sprite.feetY).toBe(true);
      }
    });
  }

  it("sets a broken wall's doorway on the road where the wall stands", () => {
    const wall = { kind: 'templeDoorBroken', x: 100, y: 180 };
    const { middle, inside } = doorwayOf(wall);
    expect(middle).toBe(100 - 16 / RENDER_SCALE + 50 / RENDER_SCALE);
    expect(inside).toEqual({
      x: 100 - 8 + 18,
      y: 180 - 139 / RENDER_SCALE + 21,
      width: (75 - 36) / RENDER_SCALE,
      height: (118 - 42) / RENDER_SCALE,
    });
    expect(doorwayOf({ kind: 'palisadeBroken', x: 10, y: 180 }).inside).toBeNull();
  });

  it('shows the closing wall whole until it is smashed, and the way in all along', () => {
    const mission = MISSIONS[7];
    expect(propsShown(mission, false)).toBe(mission.props);
    expect(propsShown(mission, true)).toEqual([mission.props[0], mission.wayOut.broken]);
  });
});
