import { describe, expect, it } from 'vitest';
import { PAINTED_BACKDROPS } from '../../../src/data/backdrops/index.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { findPerch, perchesOf, perchX } from '../../../src/sim/hazards/drop-perches.js';

const onRoad = (theme, cameraX) => ({
  missionIndex: MISSIONS.findIndex((mission) => mission.theme === theme),
  camera: { x: cameraX },
});
const onScreen = (game, perch) => perchX(game, perch) - game.camera.x;

describe('the perches raiders wait on to drop', () => {
  it("are a road's own trees, towers and girders, in the layer that paints them", () => {
    expect(perchesOf(onRoad('pineRidge', 0))).toMatchObject({ layer: 'near', parallax: 0.45 });
    expect(perchesOf(onRoad('oldGrove', 0))).toBeNull();
    expect(perchesOf(onRoad('raiderCamp', 0))).toBeNull();
  });

  it('are found nearest the spot asked for, among those in sight', () => {
    const game = onRoad('emberWoods', 0);
    const { spots } = PAINTED_BACKDROPS.emberWoods.perches;
    const perch = findPerch(game, 180);

    expect(perch.kind).toBe('crown');
    expect(Math.abs(onScreen(game, perch) - spots[1].x)).toBeLessThanOrEqual(3);
  });

  it('hide a raider in the thick of a crown, and stand it anywhere along a ledge', () => {
    const crown = findPerch(onRoad('emberWoods', 0), 150);
    const ledge = findPerch(onRoad('bayon', 0), 120);

    expect(onScreen(onRoad('emberWoods', 0), crown)).toBeCloseTo(186, 0);
    expect(onScreen(onRoad('bayon', 0), ledge)).toBe(120);
  });

  it('are found on the next copy of the layer as it repeats along the road', () => {
    const cameraX = 384 / 0.45;
    const game = onRoad('bayon', cameraX);
    const perch = findPerch(game, cameraX + 130);

    expect(onScreen(game, perch)).toBeCloseTo(130, 5);
    expect(perch.layerX).toBeGreaterThan(384);
  });

  it('are none when nothing a raider could wait on is in sight', () => {
    const cameraX = 1000 / 0.45;

    expect(findPerch(onRoad('ironWorks', cameraX), cameraX + 190)).toBeNull();
  });

  it('keep to their tree as the road scrolls, slower than the road', () => {
    const game = onRoad('pineRidge', 0);
    const perch = findPerch(game, 140);
    const before = onScreen(game, perch);

    game.camera.x = 100;

    expect(onScreen(game, perch)).toBeCloseTo(before - 45, 5);
  });
});
