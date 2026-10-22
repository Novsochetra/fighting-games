import { describe, expect, it } from 'vitest';
import { buildChain } from '../../../src/audio/context/build-chain.js';
import { LIVE_SOUNDS } from '../../../src/audio/live/live-sounds.js';
import { click } from '../../../src/audio/live/layers.js';
import { createFakeAudioContext, nodesOfKind, reaches } from './fake-audio-context.js';

function fakeLive() {
  const context = createFakeAudioContext({ state: 'running' });
  const chain = buildChain(context);
  context.nodes.length = 0;
  return { context, chain };
}

const scheduledNodes = (context) => [
  ...nodesOfKind(context, 'oscillator'),
  ...nodesOfKind(context, 'bufferSource'),
];

describe('live sounds', () => {
  it('covers the menu, event, Shade signature and boss sounds', () => {
    expect(Object.keys(LIVE_SOUNDS).sort()).toEqual(
      [
        'pickup',
        'heal',
        'warn',
        'clear',
        'go',
        'chargeLevel1',
        'chargeMax',
        'ult',
        'ultEnd',
        'ui',
        'uiOk',
        'uiBack',
        'combo',
        'lowDurability',
        'thorns',
        'swarm',
        'stampede',
        'freeze',
        'flames',
        'ignite',
        'phoenix',
        'roar',
        'pounce',
        'echo',
        'sever',
        'relief',
        'technique',
        'warHorn',
        'bossUltimate',
        'venomSpit',
        'splat',
        'hypnosis',
        'dig',
        'eruption',
        'buzz',
        'howl',
        'zap',
        'gust',
        'thunder',
        'flame',
        'steam',
        'sizzle',
        'mirage',
        'scarabs',
        'curse',
        'jarBreak',
        'sunBreak',
        'sunfall',
        'mirageBolt',
        'chainHook',
        'parry',
        'axeWhirl',
        'cleave',
      ].sort(),
    );
  });

  it.each(Object.keys(LIVE_SOUNDS))(
    '%s starts at its time and plays into the effects bus',
    (key) => {
      const live = fakeLive();
      LIVE_SOUNDS[key](live, 3);
      const nodes = scheduledNodes(live.context);
      expect(nodes.length).toBeGreaterThan(0);
      for (const node of nodes) {
        expect(node.starts[0][0]).toBeGreaterThanOrEqual(3);
        expect(reaches(node, live.chain.effectsBus)).toBe(true);
      }
    },
  );

  it('builds the ultimate as a swelling detuned chord with a held gain', () => {
    const live = fakeLive();
    LIVE_SOUNDS.ult(live, 0);
    const saws = nodesOfKind(live.context, 'oscillator').filter((node) => node.type === 'sawtooth');
    expect(saws).toHaveLength(8);
    const swell = nodesOfKind(live.context, 'gain')[0];
    expect(swell.gain.events.map((event) => event[0])).toEqual([
      'setValueAtTime',
      'linearRampToValueAtTime',
      'setValueAtTime',
      'exponentialRampToValueAtTime',
    ]);
  });

  it('click is a short highpassed tick', () => {
    const live = fakeLive();
    click(live, { start: 1, volume: 0.2 });
    const [filter] = nodesOfKind(live.context, 'biquad');
    expect(filter.type).toBe('highpass');
    expect(filter.frequency.events).toEqual([['setValueAtTime', 3000, 1]]);
    expect(reaches(nodesOfKind(live.context, 'bufferSource')[0], live.chain.effectsBus)).toBe(true);
  });
});
