import { describe, expect, it } from 'vitest';
import { GROUND_Y, VIEW_WIDTH } from '../../../src/config.js';
import { burrowIn, dropIn } from '../../../src/data/missions/ambushes.js';
import { layoutMission } from '../../../src/data/missions/layout.js';
import { groundAt } from '../../../src/sim/stage/terrain.js';

const SPEC = {
  name: 'Test Road',
  theme: 'pineRidge',
  boss: 'khan',
  reinforcements: ['grunt'],
  crates: ['ration', 'sword'],
  endWall: 'palisade',
  zones: [
    { screens: 1, waves: [['grunt'], ['grunt', 'knife']] },
    { screens: 3, waves: [['grunt'], ['knife'], ['grunt', 'grunt']] },
    { boss: 'colossus', label: 'Gate' },
    { boss: 'khan', label: 'Camp' },
  ],
};

describe('laying out a mission', () => {
  const mission = layoutMission(SPEC, 4);

  it('numbers the mission and its fighting zones', () => {
    expect(mission).toMatchObject({ index: 4, number: 5, name: 'Test Road' });
    expect(mission.zones.map((zone) => zone.label)).toEqual([
      'Zone 5-1',
      'Zone 5-2',
      'Gate',
      'Camp',
    ]);
  });

  it('places zones one after another with road between them', () => {
    const [first, wide, gate, camp] = mission.zones;
    expect(first).toMatchObject({ left: 300, right: 300 + VIEW_WIDTH, at: 410, screens: 1 });
    expect(wide.left).toBe(first.right + 300);
    expect(wide.right - wide.left).toBe(VIEW_WIDTH * 3);
    expect(gate.right - gate.left).toBe(VIEW_WIDTH);
    expect(mission.length).toBe(camp.right);
  });

  it('sends every wave of a single screen in at the start, the last one locking', () => {
    const [first] = mission.zones;
    expect(first.waves.map((wave) => wave.at)).toEqual([first.at, first.at]);
    expect(first.waves.map((wave) => wave.lock)).toEqual([false, true]);
  });

  it('spreads the waves of a wide zone across it, the last on its final screen', () => {
    const wide = mission.zones[1];
    const spots = wide.waves.map((wave) => wave.at);
    expect(spots[0]).toBe(wide.at);
    expect(spots[1]).toBeGreaterThan(spots[0]);
    expect(spots[2] - VIEW_WIDTH * 0.42).toBeGreaterThanOrEqual(wide.right - VIEW_WIDTH - 1);
    expect(wide.waves.map((wave) => wave.lock)).toEqual([false, false, true]);
  });

  it('turns a boss zone into one locked wave of that boss', () => {
    expect(mission.zones[2]).toMatchObject({ boss: 'colossus', screens: 1 });
    expect(mission.zones[2].waves).toEqual([
      { kinds: ['colossus'], ambush: null, at: mission.zones[2].at, lock: true },
    ]);
  });

  it('keeps the way a wave ambushes the hero, and lays out its raiders as any wave', () => {
    const zones = [
      { screens: 2, waves: [['grunt'], dropIn(['knife', 'grunt']), burrowIn(['ghoul'])] },
    ];
    const [zone] = layoutMission({ ...SPEC, zones }, 0).zones;
    expect(zone.waves.map(({ kinds, ambush, lock }) => [kinds, ambush, lock])).toEqual([
      [['grunt'], null, false],
      [['knife', 'grunt'], 'drop', false],
      [['ghoul'], 'burrow', true],
    ]);
  });

  it('puts crates before every zone and inside the wide ones, leaves the weapon ones out, and the wall at the end', () => {
    const [first, wide, , camp] = mission.zones;
    expect(mission.crates.map((crate) => [crate.x, crate.item])).toEqual([
      [first.left - 120, 'ration'],
      [wide.left + VIEW_WIDTH + 60, 'ration'],
      [camp.left - 120, 'ration'],
    ]);
    expect(mission.props).toEqual([{ kind: 'palisade', x: mission.length - 12, y: GROUND_Y }]);
  });

  it('stands every crate and prop on the ground of a hilly road', () => {
    const hilly = layoutMission(
      {
        ...SPEC,
        zones: SPEC.zones.map((zone) => ({
          ...zone,
          ground: [
            [-200, 0],
            [-150, 30],
            [150, 30],
            [200, 0],
          ],
        })),
      },
      0,
    );
    const things = [...hilly.crates, ...hilly.props];
    for (const thing of things) {
      expect(thing.y).toBe(groundAt(hilly.terrain, thing.x));
    }
    expect(things.some((thing) => thing.y < GROUND_Y)).toBe(true);
  });

  it("stands the way in from the last mission behind the hero's start, first of the props", () => {
    const entered = layoutMission({ ...SPEC, entry: 'palisadeBroken' }, 6);
    expect(entered.props[0]).toEqual({ kind: 'palisadeBroken', x: 10, y: GROUND_Y });
    expect(entered.props.slice(1)).toEqual(mission.props);
    expect(mission.props.some((prop) => prop.kind === 'palisadeBroken')).toBe(false);
  });
});
