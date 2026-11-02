import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { RENDER_SCALE } from '../../../src/config.js';
import { WALL_DEBRIS } from '../../../src/art/wall-debris.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { propsShown } from '../../../src/data/missions/props-layout.js';
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

  it('shows the closing wall whole until it is smashed, and the way in all along', () => {
    const mission = MISSIONS[7];
    expect(propsShown(mission, false)).toBe(mission.props);
    expect(propsShown(mission, true)).toEqual([mission.props[0], mission.wayOut.broken]);
  });
});
