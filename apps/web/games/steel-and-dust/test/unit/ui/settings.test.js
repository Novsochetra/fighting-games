import { describe, expect, it } from 'vitest';
import { defaultSettings } from '../../../src/data/settings.js';
import { settingsHtml } from '../../../src/ui/settings/settings-panel.js';
import { SETTINGS_SCHEMA, steppedValue } from '../../../src/ui/settings/settings-schema.js';

const definition = (key) => SETTINGS_SCHEMA.find((entry) => entry.key === key);

describe('settings steppers', () => {
  it('move volumes in steps of 10 between 0 and 100', () => {
    expect(steppedValue(definition('music'), 60, { step: 1 })).toBe(70);
    expect(steppedValue(definition('music'), 100, { step: 1 })).toBe(100);
    expect(steppedValue(definition('music'), 0, { step: -1 })).toBe(0);
  });

  it('clamp option lists, or wrap them when chosen with Enter', () => {
    expect(steppedValue(definition('shake'), 2, { step: 1, wrap: false })).toBe(2);
    expect(steppedValue(definition('shake'), 2, { step: 1, wrap: true })).toBe(0);
    expect(steppedValue(definition('touch'), 'auto', { step: 1 })).toBe('on');
  });

  it('let the joystick be fixed, floating or hidden, and hide the controls with a gamepad', () => {
    expect(steppedValue(definition('stick'), 'float', { step: 1 })).toBe('hidden');
    expect(steppedValue(definition('stick'), 'hidden', { step: 1, wrap: true })).toBe('fixed');
    expect(definition('stick').format('hidden')).toBe('Hidden');
    expect(defaultSettings(true).padHidesTouch).toBe(true);
    expect(steppedValue(definition('padHidesTouch'), true, { step: -1 })).toBe(false);
  });
});

describe('settings list', () => {
  const visibility = (overrides = {}) => ({
    isTouchOn: () => false,
    canVibrate: false,
    settings: defaultSettings(false),
    ...overrides,
  });

  it('hides rows that do not apply', () => {
    const html = settingsHtml(visibility(), defaultSettings(false));
    expect(html).not.toContain('Hold ATTACK');
    expect(html).not.toContain('Vibration');
    expect(html).not.toContain('Show hitboxes');
    expect(html).toContain('data-k="difficulty"');
  });

  it('shows touch and training rows when they apply', () => {
    const settings = { ...defaultSettings(true), training: true };
    const html = settingsHtml(
      visibility({ isTouchOn: () => true, canVibrate: true, settings }),
      settings,
    );
    expect(html).toContain('Hold ATTACK');
    expect(html).toContain('Vibration');
    expect(html).toContain('Show hitboxes');
  });
});
