import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ANGKOR_HEAVY_ART as ART } from '../../../src/art/heavy-fx/angkor.js';
import { buildChain } from '../../../src/audio/context/build-chain.js';
import { ANGKOR_HEAVY_SOUNDS } from '../../../src/audio/live/heavy/angkor.js';
import { ULT_MAX } from '../../../src/config.js';
import { ANGKOR_HEAVY_FEEL as FEEL } from '../../../src/data/heavy-feel/angkor.js';
import { sealOf } from '../../../src/render/fx/heavy/angkor-seal.js';
import { shaftHeight } from '../../../src/render/fx/heavy/angkor-shaft.js';
import { ANGKOR_HEAVY_KIT as KIT } from '../../../src/sim/fx/heavy/angkor.js';
import { equipWeapon } from '../../../src/sim/stage/flow.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks, tap } from '../../support/test-game.js';
import { createFakeAudioContext, nodesOfKind } from '../audio/fake-audio-context.js';

const originalRandom = Math.random;
const kinds = (game) => game.particles.map((particle) => particle.kind);
const angkorCount = (game) => kinds(game).filter((kind) => kind.startsWith('angkor')).length;

function angkorGame(weapon) {
  const game = createPlayingGame({ settings: { hero: 'angkor' } });
  runTicks(game, 30);
  if (weapon) {
    equipWeapon(game, weapon);
  }
  spawnEnemy(game, 'grunt', 1);
  const raider = game.fighters.find((fighter) => fighter.side === 'enemy');
  Object.assign(raider, { entering: false, x: game.player.x + 24, hp: 900 });
  raider.ai.cooldown = 9999;
  game.player.facing = 1;
  game.ultMeter = ULT_MAX;
  return { game, raider };
}

function inHeavy() {
  const { game, raider } = angkorGame();
  tap(game, 'heavy');
  runTicks(game, 2);
  game.particles.length = 0;
  return { game, raider, player: game.player, move: game.player.move };
}

describe("the Angkor Warrior's heavy", () => {
  beforeEach(() => {
    Math.random = seededRandom(11);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('lifts grit off the ground and turns lotus light in to his chest as he winds up', () => {
    const { game, player, move } = inHeavy();
    KIT.windup(game, player, move);
    for (let time = 0; time < move.startup; time++) {
      KIT.gather(game, player, move, time);
    }
    const grit = game.particles.filter((particle) => particle.kind === 'angkorGrit');
    expect(grit.length).toBeGreaterThanOrEqual(move.startup);
    grit.forEach((grain) => expect(grain.vy).toBeLessThan(0));
    expect(kinds(game)).toContain('angkorSwirl');
    expect(kinds(game)).toContain('angkorChip');
  });

  it('lifts no grit while he is in the air', () => {
    const { game, player, move } = inHeavy();
    player.airborne = true;
    KIT.windup(game, player, move);
    KIT.gather(game, player, move, 0);
    KIT.release(game, player, move);
    expect(kinds(game)).not.toContain('angkorGrit');
    expect(kinds(game)).not.toContain('angkorShaft');
    expect(kinds(game)).toContain('angkorPetal');
  });

  it('strikes with pillars out of the seal, chips off his front foot and petals flung forward', () => {
    const { game, player, move } = inHeavy();
    KIT.release(game, player, move);
    const shafts = game.particles.filter((particle) => particle.kind === 'angkorShaft');
    expect(shafts).toHaveLength(4);
    expect(shafts.some((shaft) => shaft.x < player.x)).toBe(true);
    expect(shafts.some((shaft) => shaft.x > player.x)).toBe(true);
    const petals = game.particles.filter((particle) => particle.kind === 'angkorPetal');
    petals.forEach((petal) => expect(Math.sign(petal.vx)).toBe(player.facing));
  });

  it('opens a lotus where a blow lands and chips the stone away from him', () => {
    const { game, raider, player, move } = inHeavy();
    KIT.impact(game, { attacker: player, target: raider, move, x: raider.x, y: raider.y - 20 });
    const bloom = game.particles.find((particle) => particle.kind === 'angkorBloom');
    expect(bloom).toMatchObject({ x: raider.x, y: raider.y - 20 });
    const chips = game.particles.filter((particle) => particle.kind === 'angkorChip');
    chips.forEach((chip) => expect(chip.vx).toBeGreaterThan(0));
  });

  it('moves its own kinds: grit hangs, chips land, light closes in, pillars stay put', () => {
    const { game, player, move } = inHeavy();
    KIT.gather(game, player, move, 1);
    KIT.release(game, player, move);
    const byKind = (kind) => game.particles.find((particle) => particle.kind === kind);
    const grit = byKind('angkorGrit');
    const swirl = byKind('angkorSwirl');
    const shaft = { ...byKind('angkorShaft') };
    const chip = byKind('angkorChip');
    const rise = { y: grit.y, radius: swirl.radius };
    for (let i = 0; i < 12; i++) {
      for (const particle of game.particles) {
        KIT.particles[particle.kind](particle, game.terrain);
      }
    }
    expect(grit.y).toBeLessThan(rise.y - 4);
    expect(Math.abs(grit.vy)).toBeLessThan(0.5);
    expect(swirl.radius).toBeLessThan(rise.radius / 10);
    expect(chip.y).toBeLessThanOrEqual(player.y + 0.01);
    expect(byKind('angkorShaft')).toMatchObject({ x: shaft.x, y: shaft.y });
  });

  it('raises each pillar fast and sinks it back into the ground', () => {
    const pillar = (life) => shaftHeight({ life, maxLife: 16, tall: 14 });
    expect(pillar(16)).toBeLessThan(pillar(13));
    expect(pillar(13)).toBe(14);
    expect(pillar(6)).toBeLessThan(pillar(12));
    expect(pillar(0)).toBe(0);
  });

  it('opens its seal and lights its petals over the wind-up, flashes as he strikes, then is gone', () => {
    const fighter = { airborne: false };
    const move = { startup: 12 };
    const seal = (time) => sealOf(ART, { fighter, move, time });
    expect(seal(0).rx).toBeLessThan(seal(8).rx);
    expect(seal(0).lit).toBeLessThan(seal(11).lit);
    expect(seal(11).lit).toBe(8);
    expect(seal(10).color).toBe(ART.hot);
    expect(seal(12).color).toBe(ART.white);
    expect(seal(17)).not.toBeNull();
    expect(seal(18)).toBeNull();
    const airborne = sealOf(ART, { fighter: { airborne: true }, move, time: 8 });
    expect(airborne.rx).toBeLessThan(seal(8).rx);
  });

  it.each([null, 'sword'])(
    'keeps a whole chain with %s within its share of particles',
    (weapon) => {
      const { game } = angkorGame(weapon);
      let most = 0;
      for (let i = 0; i < 150; i++) {
        if (i % 26 === 0) {
          tap(game, 'heavy');
        } else {
          runTicks(game, 1);
        }
        most = Math.max(most, angkorCount(game));
      }
      expect(most).toBeGreaterThan(10);
      expect(most).toBeLessThanOrEqual(60);
    },
  );

  it('holds his ground: a firm short step, shorter on the Tempest and the launcher', () => {
    expect(FEEL.lunge).toBeLessThanOrEqual(1.5);
    expect(FEEL.moves.K3.lunge).toBeLessThan(FEEL.lunge);
    expect(FEEL.moves.UK.lunge).toBeLessThan(FEEL.lunge);
    expect(FEEL.lean).toBeGreaterThanOrEqual(4);
  });

  it('rings its charge out within a quarter second, no louder than the game charges', () => {
    const context = createFakeAudioContext({ state: 'running' });
    const live = { context, chain: buildChain(context) };
    context.nodes.length = 0;
    ANGKOR_HEAVY_SOUNDS.heavyAngkorCharge(live, 2);
    for (const gain of nodesOfKind(context, 'gain')) {
      const [, peak] = gain.gain.events.find((event) => event[0] === 'linearRampToValueAtTime');
      const [, , end] = gain.gain.events.find(
        (event) => event[0] === 'exponentialRampToValueAtTime',
      );
      expect(peak).toBeLessThanOrEqual(0.1);
      expect(end).toBeLessThanOrEqual(2.25);
    }
  });
});
