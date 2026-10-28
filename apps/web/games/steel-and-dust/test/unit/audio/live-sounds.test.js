import { describe, expect, it } from 'vitest';
import { buildChain } from '../../../src/audio/context/build-chain.js';
import { HEAVY_SOUNDS } from '../../../src/audio/live/heavy/index.js';
import { LIVE_SOUNDS } from '../../../src/audio/live/live-sounds.js';
import { HEROES } from '../../../src/data/heroes.js';
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
    const shared = Object.keys(LIVE_SOUNDS).filter((key) => !Object.hasOwn(HEAVY_SOUNDS, key));
    expect(shared.sort()).toEqual(
      [
        'pickup',
        'heal',
        'warn',
        'clear',
        'go',
        'chargeLevel1',
        'chargeMax',
        'ultEnd',
        'stamp',
        'wipe',
        'reveal',
        'tallyOpen',
        'tallyTotal',
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
        'rustle',
        'branchSnap',
        'gritTrickle',
        'perchLeap',
        'clank',
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
        'stoneGaze',
        'goldPillar',
        'roots',
        'faceRise',
        'faceBeam',
        'crumble',
        'reform',
        'tide',
        'splash',
        'nagaHiss',
        'rainbow',
      ].sort(),
    );
  });

  // each Shade's heavy has a charge of its own (and may have more), named after the Shade
  it('gives every Shade a heavy charge and the empty bar its fizzle', () => {
    expect(Object.keys(HEAVY_SOUNDS)).toContain('heavyEmpty');
    for (const { id } of HEROES) {
      expect(Object.keys(HEAVY_SOUNDS)).toContain(
        `heavy${id[0].toUpperCase()}${id.slice(1)}Charge`,
      );
    }
    for (const key of Object.keys(HEAVY_SOUNDS)) {
      expect(key.startsWith('heavy')).toBe(true);
    }
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

  it('click is a short highpassed tick', () => {
    const live = fakeLive();
    click(live, { start: 1, volume: 0.2 });
    const [filter] = nodesOfKind(live.context, 'biquad');
    expect(filter.type).toBe('highpass');
    expect(filter.frequency.events).toEqual([['setValueAtTime', 3000, 1]]);
    expect(reaches(nodesOfKind(live.context, 'bufferSource')[0], live.chain.effectsBus)).toBe(true);
  });
});
