import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HAPTIC_CUES } from '../../../src/data/haptics.js';
import { HEROES } from '../../../src/data/heroes.js';
import { ULTIMATES } from '../../../src/data/ultimates/index.js';
import { createHaptics } from '../../../src/platform/haptics.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks, tap } from '../../support/test-game.js';

const originalRandom = Math.random;
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

// the hero's own controller: a standard pad that records every rumble, on a phone that records
// every buzz, with the player's last input deciding which one they hold
function playWith(lastInput, settings = {}) {
  const actuator = { playEffect: vi.fn(async () => 'complete') };
  const pad = { connected: true, mapping: 'standard', vibrationActuator: actuator };
  const navigator = { vibrate: vi.fn(), getGamepads: () => [pad] };
  const haptics = createHaptics({ navigator, ui: { lastInput } });

  const game = createPlayingGame({ settings, io: { vibrate: haptics.play } });
  const rumbles = () => actuator.playEffect.mock.calls.map(([, effect]) => effect);

  return { game, navigator, rumbles };
}

function raiderBeside(game, changes) {
  spawnEnemy(game, 'grunt', 1);
  const raider = game.fighters.find((fighter) => fighter.side === 'enemy');

  Object.assign(raider, { entering: false, x: 200, ...changes });
  game.player.x = raider.x - 14;
  game.player.facing = 1;

  return raider;
}

// an ultimate can't start once the fight is over, so it opens a fresh fight
function fireUltimate(lastInput, settings) {
  const played = playWith(lastInput, settings);

  played.game.ultMeter = 100;
  tap(played.game, 'ult');
  expect(played.game.player.state).toBe('ult');

  return played;
}

function asEffect({ wait = 0, ms, strong, weak }) {
  return { startDelay: wait, duration: ms, strongMagnitude: strong, weakMagnitude: weak };
}

describe('haptics in a fight', () => {
  beforeEach(() => {
    Math.random = seededRandom(7);
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  it('rumbles the gamepad as a jab lands and harder as the raider goes down', async () => {
    const { game, rumbles } = playWith('pad');
    const raider = raiderBeside(game, { hp: 1 });

    tap(game, 'light');
    runTicks(game, 12);
    await settle();

    expect(raider.state).toBe('ko');
    expect(rumbles()).toContainEqual(asEffect(HAPTIC_CUES.hit.pad[0]));
    expect(rumbles()).toContainEqual(asEffect(HAPTIC_CUES.knockOut.pad[0]));
  });

  it('thumps the gamepad when a raider lands a blow on the hero', async () => {
    const { game, rumbles } = playWith('pad');
    const raider = raiderBeside(game, { facing: -1, hasToken: true });

    raider.x = game.player.x + 12;
    raider.ai.cooldown = 0;
    runTicks(game, 200);
    await settle();

    expect(game.player.hp).toBeLessThan(game.player.maxHp);
    expect(rumbles()).toContainEqual(asEffect(HAPTIC_CUES.hurt.pad[0]));
  });

  it("swells the gamepad over the ultimate's cut-in, rumble after rumble", async () => {
    const { rumbles } = fireUltimate('pad');
    await settle();

    expect(rumbles()).toEqual(HAPTIC_CUES.ultimate.pad.map(asEffect));
  });

  // a blow landing mid-swell would cut it short; the first can land on the cut-in's last tick, so
  // the ticks before it, the ultimate's own tick and intro - 2 more, rumble nothing else
  it.each(HEROES.map((hero) => hero.id))(
    "lets nothing else rumble over %s's cut-in, then rumbles the blows",
    (hero) => {
      const cues = [];
      const game = createPlayingGame({
        settings: { hero },
        io: { vibrate: (cue) => cues.push(cue) },
      });

      for (const side of [-1, 1]) {
        spawnEnemy(game, 'grunt', side);
      }

      for (const [i, raider] of game.fighters.filter(({ side }) => side === 'enemy').entries()) {
        Object.assign(raider, { entering: false, x: game.player.x + (i ? 16 : -16) });
      }

      game.ultMeter = 100;
      tap(game, 'ult');
      runTicks(game, ULTIMATES[hero].intro - 2);
      expect(cues).toEqual([HAPTIC_CUES.ultimate]);

      runTicks(game, 400);
      expect(cues.length).toBeGreaterThan(1);
    },
  );

  it('buzzes the phone instead when the hero is played by touch', async () => {
    const { game, navigator, rumbles } = playWith('touch');
    raiderBeside(game, { hp: 1 });

    tap(game, 'light');
    runTicks(game, 12);
    const ultimate = fireUltimate('touch');
    await settle();

    expect(navigator.vibrate).toHaveBeenCalledWith(HAPTIC_CUES.hit.phone);
    expect(navigator.vibrate).toHaveBeenCalledWith(HAPTIC_CUES.knockOut.phone);
    expect(ultimate.navigator.vibrate).toHaveBeenCalledWith(HAPTIC_CUES.ultimate.phone);
    expect([...rumbles(), ...ultimate.rumbles()]).toEqual([]);
  });

  it('keeps still with Vibration off', async () => {
    const { game, navigator, rumbles } = playWith('pad', { haptics: false });
    raiderBeside(game, { hp: 1 });

    tap(game, 'light');
    runTicks(game, 12);
    const ultimate = fireUltimate('pad', { haptics: false });
    await settle();

    expect([...rumbles(), ...ultimate.rumbles()]).toEqual([]);
    expect(navigator.vibrate).not.toHaveBeenCalled();
  });
});
