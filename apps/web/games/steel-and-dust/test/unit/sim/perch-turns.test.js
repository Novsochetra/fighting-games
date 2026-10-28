import { describe, expect, it } from 'vitest';
import { DROP } from '../../../src/data/ambush.js';
import { nextTurn, perchesTaken } from '../../../src/sim/hazards/perch-turns.js';

const tower = { kind: 'ledge', layerX: 120 };
const lintel = { kind: 'ledge', layerX: 300 };
const onPerch = (perch, time, fields = {}) => ({
  kind: 'dropMark',
  perch: { spot: perch, layerX: perch.layerX },
  x: perch.layerX,
  time,
  delay: 0,
  raider: null,
  ...fields,
});

describe('raiders taking turns on a perch with no room left', () => {
  it('counts every raider on a perch or waiting its turn on one, not those already leaping', () => {
    const game = {
      projectiles: [
        onPerch(tower, 10),
        onPerch(tower, 0, { delay: 40 }),
        onPerch(lintel, 70, { raider: {} }),
        { kind: 'dropMark', perch: null, raider: null },
      ],
    };

    expect(perchesTaken(game)).toHaveLength(2);
  });

  it('waits on the place the last of its queue leaps off soonest, then a beat more', () => {
    const game = {
      projectiles: [onPerch(tower, 50), onPerch(tower, 0, { delay: 30 }), onPerch(lintel, 20)],
    };
    const turn = nextTurn(game, 120);

    expect(turn.perch.spot).toBe(lintel);
    expect(turn.delay).toBe(DROP.warn - 20 + DROP.turn);
  });

  it('is none with no raider on a perch to follow', () => {
    expect(nextTurn({ projectiles: [] }, 120)).toBeNull();
  });
});
