import { describe, expect, it } from 'vitest';
import { SPIKE_TRAP } from '../../../src/data/spike-traps.js';
import {
  SPIKE_BEAT,
  spikeFrame,
  spikePhase,
  spikesUp,
} from '../../../src/sim/hazards/spike-beat.js';
import { createSpikeTraps, updateSpikeTraps } from '../../../src/sim/hazards/spike-traps.js';
import { createLootGame, soundKeys, spawnEnemy } from '../../support/loot-game.js';

const SPOT = 200;
const WARN_AT = SPIKE_TRAP.rest;
const RISE_AT = SPIKE_TRAP.rest + SPIKE_TRAP.warn;
const SINK_AT = RISE_AT + SPIKE_TRAP.rise + SPIKE_TRAP.up;

// one tile at the start of its beat, on screen
function templeGame() {
  const { game, sounds } = createLootGame();
  game.player.x = SPOT - 80;
  game.camera.x = 0;
  const tile = { ...createSpikeTraps([{ x: SPOT, y: game.player.y }])[1], time: 0 };
  game.spikeTraps = [tile];

  return { game, sounds, tile };
}

function runBeat(game, ticks) {
  for (let i = 0; i < ticks; i++) {
    updateSpikeTraps(game);
  }
}

describe("a spike trap's beat", () => {
  it('lies flat, puffs dust, shoots its spikes up, holds them and sinks them back', () => {
    expect(spikePhase(0)).toEqual({ phase: 'rest', at: 0 });
    expect(spikePhase(WARN_AT).phase).toBe('warn');
    expect(spikePhase(RISE_AT)).toEqual({ phase: 'rise', at: 0 });
    expect(spikePhase(SINK_AT).phase).toBe('sink');
    expect(spikePhase(SPIKE_BEAT)).toEqual({ phase: 'rest', at: 0 });
    expect([0, WARN_AT, RISE_AT, RISE_AT + SPIKE_TRAP.rise, SINK_AT].map(spikeFrame)).toEqual([
      0, 1, 2, 3, 4,
    ]);
  });

  it('stabs only from the moment the spikes shoot up until they sink', () => {
    expect(spikesUp(RISE_AT - 1)).toBe(false);
    expect(spikesUp(RISE_AT)).toBe(true);
    expect(spikesUp(SINK_AT - 1)).toBe(true);
    expect(spikesUp(SINK_AT)).toBe(false);
  });

  it('lays a row of tiles edge to edge around its spot, each coming up after the one before', () => {
    const row = createSpikeTraps([{ x: 500, y: 184 }]);
    const risesAt = row.map((tile) => (RISE_AT - tile.time + SPIKE_BEAT) % SPIKE_BEAT);

    expect(row.map((tile) => tile.x)).toEqual([
      500 - SPIKE_TRAP.pitch,
      500,
      500 + SPIKE_TRAP.pitch,
    ]);
    expect(risesAt[1] - risesAt[0]).toBe(SPIKE_TRAP.stagger);
    expect(risesAt[2] - risesAt[1]).toBe(SPIKE_TRAP.stagger);
  });
});

describe('a spike trap', () => {
  it('grinds as the dust puffs, and rings as the spikes come up, once a beat', () => {
    const { game, sounds } = templeGame();

    runBeat(game, SPIKE_BEAT);

    expect(soundKeys(sounds)).toEqual(['dig', 'spikeTrap']);
  });

  it('keeps quiet off screen', () => {
    const { game, sounds } = templeGame();
    game.camera.x = SPOT + 200;

    runBeat(game, SPIKE_BEAT);

    expect(sounds).toEqual([]);
  });

  it('throws up and finishes the raider on it as the spikes come up, and spares the one beside it', () => {
    const { game } = templeGame();
    const on = spawnEnemy(game, 'ghoul', SPOT + 4);
    const beside = spawnEnemy(game, 'ghoul', SPOT + SPIKE_TRAP.halfWidth + 16);

    runBeat(game, RISE_AT - 1);
    expect(on.hp).toBe(on.def.hp);
    runBeat(game, 1);

    expect(on.state).toBe('ko');
    expect(on.airborne).toBe(true);
    expect(beside.hp).toBe(beside.def.hp);
  });

  it('hurts the hero standing on it, but not one in the air over it', () => {
    const { game } = templeGame();
    const before = game.player.hp;
    game.player.x = SPOT;

    runBeat(game, RISE_AT);
    expect(game.player.hp).toBeLessThan(before);
    expect(game.player.hp).toBeGreaterThan(0);

    const second = templeGame();
    Object.assign(second.game.player, { x: SPOT, y: second.tile.y - 30, airborne: true });
    runBeat(second.game, RISE_AT + 2);
    expect(second.game.player.hp).toBe(before);
  });

  it('stabs a raider stepping onto the raised spikes, once a beat', () => {
    const { game } = templeGame();
    const raider = spawnEnemy(game, 'tombguard', SPOT + 60);

    runBeat(game, RISE_AT + 8);
    expect(raider.hp).toBe(raider.def.hp);
    raider.x = SPOT;
    runBeat(game, 1);
    const stabbed = raider.hp;
    Object.assign(raider, { x: SPOT, y: game.player.y, airborne: false, state: 'idle' });
    runBeat(game, 4);

    expect(stabbed).toBeLessThan(raider.def.hp);
    expect(raider.hp).toBe(stabbed);
  });
});
