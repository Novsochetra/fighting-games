import { describe, expect, it } from 'vitest';
import { DROP } from '../../../src/data/ambush.js';
import { PAINTED_BACKDROPS } from '../../../src/data/backdrops/index.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { findPerch, perchesOf, perchX, placesOn } from '../../../src/sim/hazards/drop-perches.js';

const onRoad = (theme, cameraX) => ({
  missionIndex: MISSIONS.findIndex((mission) => mission.theme === theme),
  camera: { x: cameraX },
});
const onScreen = (game, perch) => perchX(game, perch) - game.camera.x;

describe('the perches raiders wait on to drop', () => {
  it("are a road's own trees, towers and girders, in the layer that paints them", () => {
    expect(perchesOf(onRoad('pineRidge', 0))).toMatchObject({ layer: 'near', parallax: 0.45 });
    expect(perchesOf(onRoad('oldGrove', 0))).toBeNull();
    expect(perchesOf(onRoad('sandstormPass', 0))).toBeNull();
  });

  it('are found nearest the spot asked for, among those in sight', () => {
    const game = onRoad('emberWoods', 0);
    const { spots } = PAINTED_BACKDROPS.emberWoods.perches;
    const perch = findPerch(game, 180);

    expect(perch.kind).toBe('crown');
    expect(Math.abs(onScreen(game, perch) - spots[1].x)).toBeLessThanOrEqual(3);
  });

  it('hide a raider in the thick of a crown, and stand raiders spread along a ledge', () => {
    const crown = findPerch(onRoad('emberWoods', 0), 150);
    const ledge = findPerch(onRoad('bayon', 0), 120);

    expect(onScreen(onRoad('emberWoods', 0), crown)).toBe(
      PAINTED_BACKDROPS.emberWoods.perches.spots[1].x,
    );
    expect(onScreen(onRoad('bayon', 0), ledge)).toBe(136);
  });

  it('have as many places on a ledge as have room, from one end of it to the other', () => {
    const [lintel] = PAINTED_BACKDROPS.bayon.perches.spots;
    const [floor] = PAINTED_BACKDROPS.raiderCamp.perches.spots;
    const walkways = PAINTED_BACKDROPS.wardenFortress.perches.spots;

    expect(placesOn(lintel)).toEqual([102, 136]);
    expect(placesOn(floor)).toHaveLength(1);
    expect(walkways.map((walkway) => placesOn(walkway).length)).toEqual([2, 2, 3]);
    for (const walkway of walkways) {
      const places = placesOn(walkway);

      places
        .slice(1)
        .forEach((place, i) => expect(place - places[i]).toBeGreaterThanOrEqual(DROP.room));
    }
  });

  it('are found on the next copy of the layer as it repeats along the road', () => {
    const cameraX = 384 / 0.45;
    const game = onRoad('bayon', cameraX);
    const perch = findPerch(game, cameraX + 130);

    expect(onScreen(game, perch)).toBeCloseTo(136, 5);
    expect(perch.layerX).toBeGreaterThan(384);
  });

  it('stand a raider clear of those already on the perch, or nowhere when there is no room', () => {
    const game = onRoad('bayon', 0);
    const first = findPerch(game, 120);
    const second = findPerch(game, 120, [first]);
    const lintel = PAINTED_BACKDROPS.bayon.perches.spots[0];

    expect(second.spot).toBe(first.spot);
    expect(Math.abs(onScreen(game, second) - onScreen(game, first))).toBeGreaterThanOrEqual(
      DROP.room,
    );
    expect(onScreen(game, second)).toBeGreaterThanOrEqual(lintel.from);
    expect(onScreen(game, second)).toBeLessThanOrEqual(lintel.to);
    expect(findPerch(game, 120, [first, second])).toBeNull();
  });

  it('hold one raider in a crown, sending the next to another crown in sight', () => {
    const game = onRoad('emberWoods', 0);
    const first = findPerch(game, 186);
    const second = findPerch(game, 186, [first]);

    expect(second.spot).not.toBe(first.spot);
    expect(second.kind).toBe('crown');
  });

  it('are never taken behind a hammer or a tower standing on the road, nor under one', () => {
    const game = onRoad('ironWorks', 400);
    const girder = findPerch(game, 640);
    const roadX = perchX(game, girder);

    expect(girder.spot).toBe(PAINTED_BACKDROPS.ironWorks.perches.spots[0]);
    expect(findPerch({ ...game, hammers: [{ x: roadX }] }, 640)).toBeNull();
    expect(findPerch({ ...game, towers: [{ x: roadX, state: 'standing' }] }, 640)).toBeNull();
    expect(findPerch({ ...game, towers: [{ x: roadX, state: 'gone' }] }, 640)).toEqual(girder);
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
