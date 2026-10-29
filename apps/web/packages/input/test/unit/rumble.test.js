import { describe, expect, it, vi } from 'vitest';
import { buzzPhone, canVibrate, rumble, rumblePad } from '../../src/rumble.js';

const TWO_RUMBLES = [
  { ms: 140, strong: 1, weak: 0.7 },
  { wait: 80, ms: 320, strong: 0.8, weak: 0.3 },
];

function fakeActuator(result = 'complete') {
  return { playEffect: vi.fn(async () => result) };
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('rumble', () => {
  it('plays each rumble of a cue after the one before it, waiting between them', async () => {
    const actuator = fakeActuator();

    await rumble(actuator, TWO_RUMBLES);

    expect(actuator.playEffect.mock.calls.map(([, effect]) => effect)).toEqual([
      { startDelay: 0, duration: 140, strongMagnitude: 1, weakMagnitude: 0.7 },
      { startDelay: 80, duration: 320, strongMagnitude: 0.8, weakMagnitude: 0.3 },
    ]);
  });

  it('drops the rest of a cue that a newer one cut short', async () => {
    const actuator = fakeActuator('preempted');

    await rumble(actuator, TWO_RUMBLES);

    expect(actuator.playEffect).toHaveBeenCalledTimes(1);
  });

  it('swallows a pad that refuses the effect', async () => {
    const actuator = {
      playEffect: () => {
        throw new DOMException('no rumble', 'NotSupportedError');
      },
    };

    await expect(rumble(actuator, TWO_RUMBLES)).resolves.toBe('unsupported');
  });

  it('rumbles the first standard pad, and passes over a browser without pads', async () => {
    const actuator = fakeActuator();
    const pad = { connected: true, mapping: 'standard', vibrationActuator: actuator };

    rumblePad({ getGamepads: () => [null, pad] }, TWO_RUMBLES.slice(0, 1));
    await settle();

    expect(actuator.playEffect).toHaveBeenCalledTimes(1);
    expect(() => rumblePad({}, TWO_RUMBLES)).not.toThrow();
  });

  it('buzzes a phone, and swallows one that refuses', () => {
    const vibrate = vi.fn();

    buzzPhone({ vibrate }, [60, 40, 90]);

    expect(vibrate).toHaveBeenCalledWith([60, 40, 90]);
    expect(() =>
      buzzPhone(
        {
          vibrate: () => {
            throw new TypeError('blocked');
          },
        },
        [60],
      ),
    ).not.toThrow();
  });

  it('offers vibration where a phone or a gamepad can give it', () => {
    const chrome = {
      navigator: { vibrate() {} },
      Gamepad: { prototype: { vibrationActuator: null } },
    };
    const macSafari = { navigator: {}, Gamepad: { prototype: { vibrationActuator: null } } };

    expect(canVibrate(chrome)).toBe(true);
    expect(canVibrate(macSafari)).toBe(true);
    expect(canVibrate({ navigator: {}, Gamepad: { prototype: {} } })).toBe(false);
    expect(canVibrate({ navigator: {} })).toBe(false);
  });

  // Firefox's pads have the actuator interface for its own hapticActuators, but no rumble we play
  it('does not offer it for a pad that only has Firefox hapticActuators', () => {
    const firefox = {
      navigator: {},
      Gamepad: { prototype: { hapticActuators: [] } },
      GamepadHapticActuator: {},
    };

    expect(canVibrate(firefox)).toBe(false);
  });
});
