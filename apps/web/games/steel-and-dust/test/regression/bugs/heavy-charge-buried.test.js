import { describe, expect, it } from 'vitest';
import { buildChain } from '../../../src/audio/context/build-chain.js';
import { HEAVY_SOUNDS } from '../../../src/audio/live/heavy/index.js';
import { HEROES } from '../../../src/data/heroes.js';
import {
  createFakeAudioContext,
  nodesOfKind,
  reaches,
} from '../../unit/audio/fake-audio-context.js';

// Bug: each Shade's heavy charge was built at the level of the event sounds, which play alone,
// and came out about 18 dB down in a fight: as loud as the music under it and well under the
// swing and hit that follow, so players never heard it. Every Shade's heavy sound now goes out
// through a boost, the charge the most
const CHARGE_GAIN = 4;

function boostOf(key) {
  const context = createFakeAudioContext({ state: 'running' });
  const chain = buildChain(context);
  context.nodes.length = 0;
  HEAVY_SOUNDS[key]({ context, chain, nodes: [], sources: [] }, 1);
  const boosts = nodesOfKind(context, 'gain').filter((node) =>
    node.connections.includes(chain.effectsBus),
  );
  const sources = [...nodesOfKind(context, 'oscillator'), ...nodesOfKind(context, 'bufferSource')];
  return { boosts, sources };
}

const charges = HEROES.map(({ id }) => `heavy${id[0].toUpperCase()}${id.slice(1)}Charge`);

describe("a Shade's heavy charge in a fight", () => {
  it.each(charges)('%s goes out through a boost of 12 dB', (key) => {
    const { boosts, sources } = boostOf(key);
    expect(boosts.map((node) => node.gain.value)).toEqual([CHARGE_GAIN]);
    for (const source of sources) {
      expect(reaches(source, boosts[0])).toBe(true);
    }
  });

  it('raises the fizzle of a heavy with no bar too, if less', () => {
    const [boost] = boostOf('heavyEmpty').boosts;
    expect(boost.gain.value).toBeGreaterThan(1);
    expect(boost.gain.value).toBeLessThan(CHARGE_GAIN);
  });
});
