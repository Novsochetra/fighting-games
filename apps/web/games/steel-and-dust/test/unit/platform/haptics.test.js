import { describe, expect, it, vi } from 'vitest';
import { HAPTIC_CUES } from '../../../src/data/haptics.js';
import { canVibrate, createHaptics, rumble } from '../../../src/platform/haptics.js';

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
    expect(() =>
      createHaptics({ navigator, ui: { lastInput: 'pad' } }).play(HAPTIC_CUES.hit),
    ).not.toThrow();
    const bare = { ui: { lastInput: 'touch' }, navigator: {} };
    expect(() => createHaptics(bare).play(HAPTIC_CUES.hit)).not.toThrow();
  });

  it('plays each rumble of a cue after the one before it, waiting between them', async () => {
    const actuator = fakeActuator();
    await rumble(actuator, HAPTIC_CUES.bossKnockOut.pad);
    expect(actuator.playEffect.mock.calls.map(([, effect]) => effect)).toEqual([
      { startDelay: 0, duration: 140, strongMagnitude: 1, weakMagnitude: 0.7 },
      { startDelay: 80, duration: 320, strongMagnitude: 0.8, weakMagnitude: 0.3 },
    ]);
  });

  it('drops the rest of a cue that a newer one cut short', async () => {
    const actuator = fakeActuator('preempted');
    await rumble(actuator, HAPTIC_CUES.clear.pad);
    expect(actuator.playEffect).toHaveBeenCalledTimes(1);
  });

  it('swallows a pad that refuses the effect', async () => {
    const actuator = {
      playEffect: () => {
        throw new DOMException('no rumble', 'NotSupportedError');
      },
    };
    await expect(rumble(actuator, HAPTIC_CUES.hit.pad)).resolves.toBe('unsupported');
  });

  it('offers vibration where a phone or a gamepad can give it', () => {
    expect(canVibrate({ navigator: { vibrate() {} } })).toBe(true);
    expect(canVibrate({ navigator: {}, GamepadHapticActuator: class {} })).toBe(true);
    expect(canVibrate({ navigator: {} })).toBe(false);
  });
});
