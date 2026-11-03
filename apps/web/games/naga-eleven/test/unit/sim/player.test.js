import { describe, expect, it } from 'vitest';
import { FORMATS } from '../../../src/data/formats.js';
import { createPlayer } from '../../../src/sim/player.js';

const SLOT = { team: 1, slotIndex: 9, index: 20, slot: FORMATS['11'].formation[9] };

describe('a player made from a spec', () => {
  it('carries the spec’s name, number, star, stats and moves', () => {
    const player = createPlayer(
      {
        id: 'sochetra',
        name: 'Sochetra',
        number: 10,
        role: 'forward',
        star: 'sochetra',
        moves: ['naga-shot'],
        stats: { speed: 70, shot: 80 },
        spiritMax: 90,
      },
      SLOT,
    );

    expect(player).toMatchObject({ id: 'sochetra', number: 10, star: 'sochetra', spiritMax: 90 });
    expect(player.stats).toMatchObject({ speed: 70, shot: 80, pass: 50 });
    expect(player.moves).toEqual(['naga-shot']);
    expect(player.spirit).toBeLessThan(player.spiritMax);
  });

  it('plays the role of its slot and faces the goal its team attacks', () => {
    const player = createPlayer({ role: 'keeper' }, SLOT);

    expect(player.role).toBe('forward');
    expect(player.facing).toEqual({ x: -1, y: 0 });
    expect(player).toMatchObject({ dive: null, lastKick: -Infinity, charge: 0 });
  });

  it('carries the star a rival hunts, and none for anyone else', () => {
    expect(createPlayer({ star: 'rithy', hunts: 'sochetra' }, SLOT).hunts).toBe('sochetra');
    expect(createPlayer({ star: 'rithy' }, SLOT).hunts).toBeNull();
  });
});
