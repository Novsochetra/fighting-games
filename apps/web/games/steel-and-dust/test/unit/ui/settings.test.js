import { describe, expect, it, vi } from 'vitest';
import { HAPTIC_CUES } from '../../../src/data/haptics.js';
import { defaultSettings } from '../../../src/data/settings.js';
import { createSectionPanel, sectionHtml } from '../../../src/ui/settings/section-panel.js';
import { settingsHtml } from '../../../src/ui/settings/settings-panel.js';
import {
  SETTINGS_SCHEMA,
  SETTINGS_SECTIONS,
  steppedValue,
} from '../../../src/ui/settings/settings-schema.js';

const definition = (key) => SETTINGS_SCHEMA.find((entry) => entry.key === key);
const section = (id) => SETTINGS_SECTIONS.find((entry) => entry.id === id);

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

describe('settings sections', () => {
  it('list each section, which opens on a screen of its own', () => {
    const html = settingsHtml();
    expect(html.match(/data-section="[a-z]+"/g)).toEqual([
      'data-section="sound"',
      'data-section="gameplay"',
      'data-section="screen"',
      'data-section="touch"',
      'data-section="training"',
    ]);
    expect(html).toContain('Touch controls<small>Joystick and buttons</small>');
    expect(html).not.toContain('setrow');
  });

  it('hold every setting once', () => {
    const keys = SETTINGS_SCHEMA.map((entry) => entry.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toEqual(
      expect.arrayContaining(['music', 'difficulty', 'shake', 'skin', 'training']),
    );
  });
});

describe('a section of settings', () => {
  const visibility = (overrides = {}) => ({
    isTouchOn: () => false,
    canVibrate: false,
    settings: defaultSettings(false),
    ...overrides,
  });

  it('shows only its own rows', () => {
    const html = sectionHtml(section('sound'), visibility(), defaultSettings(false));
    expect(html.match(/data-k="[a-zA-Z]+"/g)).toEqual(['data-k="music"', 'data-k="sfx"']);
  });

  it('hides rows that do not apply', () => {
    const settings = defaultSettings(false);
    expect(sectionHtml(section('gameplay'), visibility(), settings)).not.toContain('Hold ATTACK');
    expect(sectionHtml(section('gameplay'), visibility(), settings)).not.toContain('Vibration');
    expect(sectionHtml(section('training'), visibility(), settings)).not.toContain('Show hitboxes');
    expect(sectionHtml(section('gameplay'), visibility(), settings)).toContain(
      'data-k="difficulty"',
    );
  });

  it('shows touch and training rows when they apply', () => {
    const settings = { ...defaultSettings(true), training: true };
    const shown = visibility({ isTouchOn: () => true, canVibrate: true, settings });
    expect(sectionHtml(section('gameplay'), shown, settings)).toContain('Hold ATTACK');
    expect(sectionHtml(section('gameplay'), shown, settings)).toContain('Vibration');
    expect(sectionHtml(section('training'), shown, settings)).toContain('Show hitboxes');
  });

  it('shows the button layout only with touch controls, with an Edit button and no stepper', () => {
    const touchControls = section('touch');
    expect(sectionHtml(touchControls, visibility(), defaultSettings(false))).not.toContain(
      'Button layout',
    );
    const touch = visibility({ isTouchOn: () => true });
    const html = sectionHtml(touchControls, touch, defaultSettings(true));
    const row = html.match(/<div class="setrow" data-k="buttonLayout">.*?<\/div>/)[0];
    expect(row).toContain('<span class="val">Default</span>');
    expect(row).toContain('data-act="layout">Edit</button>');
    expect(row).not.toContain('data-d=');
    const custom = { ...defaultSettings(true), buttonLayout: { landscape: {}, portrait: null } };
    expect(sectionHtml(touchControls, touch, custom)).toContain('<span class="val">Custom</span>');
  });
});

describe('section panel', () => {
  it('leaves a row that opens its own editor alone when stepped', () => {
    const game = { settings: defaultSettings(true), io: { saveSettings: vi.fn() } };
    const audio = { sfx: vi.fn() };
    const visibility = { isTouchOn: () => true, canVibrate: false, settings: game.settings };
    const panel = createSectionPanel({ game, audio, layout: {}, visibility });
    expect(panel.change('buttonLayout', 1, true)).toBe(false);
    expect(game.settings.buttonLayout).toBeNull();
    expect(game.io.saveSettings).not.toHaveBeenCalled();
    expect(panel.change('shake', -1, false)).toBe(true);
    expect(game.settings.shake).toBe(1);
  });

  it('gives a taste of a blow as Vibration turns on, and nothing as it turns off', () => {
    const io = { saveSettings: vi.fn(), vibrate: vi.fn() };
    const game = { settings: { ...defaultSettings(true), haptics: false }, io };
    const visibility = { isTouchOn: () => true, canVibrate: true, settings: game.settings };
    const audio = { sfx: vi.fn() };
    const panel = createSectionPanel({ game, audio, layout: {}, visibility });

    panel.change('haptics', 1, false);
    expect(io.vibrate).toHaveBeenCalledWith(HAPTIC_CUES.bigHit);

    panel.change('haptics', -1, false);
    expect(io.vibrate).toHaveBeenCalledTimes(1);
  });
});
