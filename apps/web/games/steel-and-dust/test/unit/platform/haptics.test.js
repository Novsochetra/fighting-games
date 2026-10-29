import { describe, expect, it, vi } from 'vitest';
import { HAPTIC_CUES } from '../../../src/data/haptics.js';
import { createHaptics } from '../../../src/platform/haptics.js';

function fakeActuator(result = 'complete') {
  return { playEffect: vi.fn(async () => result) };
}

function fakeNavigator(actuator) {
  const pad = { connected: true, mapping: 'standard', vibrationActuator: actuator };

  return { vibrate: vi.fn(), getGamepads: () => [null, pad] };
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('haptics', () => {
  it('plays a cue on the gamepad when the pad was used last', async () => {
    const actuator = fakeActuator();
    const navigator = fakeNavigator(actuator);

    createHaptics({ navigator, ui: { lastInput: 'pad' } }).play(HAPTIC_CUES.hurt);
    await settle();

    expect(actuator.playEffect).toHaveBeenCalledWith('dual-rumble', {
      startDelay: 0,
      duration: 150,
      strongMagnitude: 0.9,
      weakMagnitude: 0.3,
    });
    expect(navigator.vibrate).not.toHaveBeenCalled();
  });

  it('buzzes the phone when it was touched last', async () => {
    const actuator = fakeActuator();
    const navigator = fakeNavigator(actuator);

    createHaptics({ navigator, ui: { lastInput: 'touch' } }).play(HAPTIC_CUES.bossKnockOut);
    await settle();

    expect(navigator.vibrate).toHaveBeenCalledWith([60, 40, 90]);
    expect(actuator.playEffect).not.toHaveBeenCalled();
  });

  it('stays still under a keyboard or a mouse', async () => {
    const actuator = fakeActuator();
    const navigator = fakeNavigator(actuator);

    for (const lastInput of ['key', 'mouse']) {
      createHaptics({ navigator, ui: { lastInput } }).play(HAPTIC_CUES.hit);
    }

    await settle();

    expect(navigator.vibrate).not.toHaveBeenCalled();
    expect(actuator.playEffect).not.toHaveBeenCalled();
  });

  it('copes with a pad that cannot rumble and a browser without either', () => {
    const navigator = fakeNavigator(undefined);
    const bare = { ui: { lastInput: 'touch' }, navigator: {} };

    expect(() =>
      createHaptics({ navigator, ui: { lastInput: 'pad' } }).play(HAPTIC_CUES.hit),
    ).not.toThrow();
    expect(() => createHaptics(bare).play(HAPTIC_CUES.hit)).not.toThrow();
  });
});
