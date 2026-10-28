import { describe, expect, it } from 'vitest';
import { VIEW_WIDTH } from '../../../src/config.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { groundAt } from '../../../src/data/missions/terrain.js';
import { TEMPLE_BOULDER } from '../../../src/data/temple-boulders.js';
import { cameraTarget } from '../../../src/sim/stage/camera.js';
import { rollOn } from '../../../src/sim/hazards/boulder-roll.js';

// how far the hero may have run on past the spot by the time it rolls, dashing through the warning
const RUN_ON = [0, 150, 300];

const placed = MISSIONS.flatMap((mission) =>
  mission.boulders.map((boulder) => ({
    mission,
    boulder,
    label: `${mission.name} at ${boulder.x}`,
  })),
);

const zoneOf = (mission, x) => mission.zones.find((zone) => x > zone.left && x < zone.right);

// the screen the camera shows with the hero `lead` past the spot, in the boulder's fight
function screenLeft(mission, boulder, lead) {
  const zone = zoneOf(mission, boulder.x);
  const game = {
    arena: { left: zone.left, right: zone.right },
    player: { x: boulder.x + lead },
    missionIndex: mission.index,
  };

  return cameraTarget(game);
}

// from just past the right edge of that screen to just past its left edge, or false where it breaks
function rollsAcross(terrain, left) {
  const x = left + VIEW_WIDTH + TEMPLE_BOULDER.margin;
  const boulder = { x, y: groundAt(terrain, x), vy: 0, rolled: 0 };

  while (boulder.x > left - TEMPLE_BOULDER.margin) {
    if (!rollOn(terrain, boulder)) {
      return false;
    }
  }

  return true;
}

describe('the boulders up the temple road', () => {
  it('wait in the Mirage Temple, one in each of three fights', () => {
    const roads = new Set(placed.map(({ mission }) => mission.name));
    const zones = new Set(placed.map(({ mission, boulder }) => zoneOf(mission, boulder.x)));

    expect([...roads]).toEqual(['Mirage Temple']);
    expect(zones.size).toBe(3);
  });

  it('each break loose inside a fight, never a boss fight', () => {
    for (const { mission, boulder, label } of placed) {
      expect(zoneOf(mission, boulder.x)?.boss, label).toBeNull();
    }
  });

  it('each roll clear across the screen, however far the hero has run on, with no rise to break on', () => {
    for (const { mission, boulder, label } of placed) {
      for (const lead of RUN_ON) {
        const left = screenLeft(mission, boulder, lead);

        expect(rollsAcross(mission.terrain, left), `${label}, ${lead} on`).toBe(true);
      }
    }
  });
});
