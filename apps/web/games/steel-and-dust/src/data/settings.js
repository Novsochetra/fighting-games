import { sanitizeButtonLayout } from './button-layout.js';

export function defaultSettings(coarsePointer) {
  return {
    music: 60,
    sfx: 80,
    shake: 2,
    numbers: true,
    haptics: true,
    flash: true,
    touch: 'auto',
    buttonSize: 1,
    buttonLayout: null,
    stick: 'fixed',
    padHidesTouch: true,
    aim: coarsePointer,
    holdToCombo: true,
    difficulty: 1,
    training: false,
    hitboxes: false,
    hero: 'moss',
  };
}

const RENAMED_KEYS = { btn: 'buttonSize', autoAtk: 'holdToCombo' };

export function migrateSettings(stored) {
  const settings = {};
  for (const [key, value] of Object.entries(stored)) {
    settings[RENAMED_KEYS[key] ?? key] = value;
  }
  if ('buttonLayout' in settings) {
    settings.buttonLayout = sanitizeButtonLayout(settings.buttonLayout);
  }
  return settings;
}

export const BUTTON_SCALES = [0.82, 1, 1.2];

export function buttonScale(settings) {
  return BUTTON_SCALES[settings.buttonSize] || 1;
}
