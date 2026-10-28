import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { selectMission } from '../../../src/sim/stage/flow.js';
import { groundAt } from '../../../src/sim/stage/terrain.js';
import { createTestGame } from '../../support/test-game.js';

// Bug: the Angkor moat's water was set a little under the road's usual height, but the causeway it
// cuts through stands 16 px above that, so the water lay 22 px down the breach. Between the road and
// the water the near strip showed through at the road's own height, the naga and the stone it
// stands on, and read as a bridge over the breach; and a fighter fell 22 px past the lip before the
// water took it. The water now lies just under the lip of its own banks
const LIP_TO_WATER = 3;

function moatsOf(mission) {
  const game = createTestGame();

  selectMission(game, mission.index);

  return (game.terrain.water ?? []).map((span) => ({ span, terrain: game.terrain }));
}

describe('the water in a breach', () => {
  it('lies just under the lip of the lower of its two banks', () => {
    const moats = MISSIONS.flatMap(moatsOf);

    expect(moats.length).toBeGreaterThan(0);
    for (const { span, terrain } of moats) {
      const lip = Math.max(groundAt(terrain, span.from - 1), groundAt(terrain, span.to));

      expect(span.level - lip, `moat at ${span.from}`).toBe(LIP_TO_WATER);
    }
  });
});
