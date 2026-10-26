import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
    expect(rumbles()).toContainEqual(expect.objectContaining({ duration: 40, weakMagnitude: 0.4 }));
    expect(rumbles()).toContainEqual(
      expect.objectContaining({ duration: 100, strongMagnitude: 0.6 }),
    );
  });

  it('thumps the gamepad when a raider lands a blow on the hero', async () => {
    const { game, rumbles } = playWith('pad');
    const raider = raiderBeside(game, { facing: -1, hasToken: true });
    raider.x = game.player.x + 12;
    raider.ai.cooldown = 0;
    runTicks(game, 200);
    await settle();
    expect(game.player.hp).toBeLessThan(game.player.maxHp);
    expect(rumbles()).toContainEqual(
      expect.objectContaining({ duration: 150, strongMagnitude: 0.9 }),
    );
  });

  it('buzzes the phone instead when the hero is played by touch', async () => {
    const { game, navigator, rumbles } = playWith('touch');
    raiderBeside(game, { hp: 1 });
    tap(game, 'light');
    runTicks(game, 12);
    await settle();
    expect(navigator.vibrate).toHaveBeenCalledWith(7);
    expect(navigator.vibrate).toHaveBeenCalledWith(22);
    expect(rumbles()).toEqual([]);
  });

  it('keeps still with Vibration off', async () => {
    const { game, navigator, rumbles } = playWith('pad', { haptics: false });
    raiderBeside(game, { hp: 1 });
    tap(game, 'light');
    runTicks(game, 12);
    await settle();
    expect(rumbles()).toEqual([]);
    expect(navigator.vibrate).not.toHaveBeenCalled();
  });
});
