import { make, slotOf } from '../dom.js';
import {
  isVolume,
  SETTING_CHOICES,
  SETTING_KEYS,
  stepSetting,
  writeSettings,
} from '../settings-store.js';

const LANG_NAMES = { en: 'English', km: 'ខ្មែរ' };

const VOLUME_STEPS = SETTING_CHOICES.sound.length - 1;

function volumeNodes(view, value) {
  const cells = make(view.document, 'span', { className: 'volume-cells' });

  for (let step = 1; step <= VOLUME_STEPS; step += 1) {
    cells.append(make(view.document, 'i', { className: step <= value ? 'is-on' : '' }));
  }

  const number = value ? view.number(value) : view.say('off');

  return [cells, make(view.document, 'span', { className: 'volume-number', text: number })];
}

function valueNodes(view, key, value) {
  if (key === 'lang') {
    return [
      make(view.document, 'span', { className: 'lang-name', text: LANG_NAMES[value], lang: value }),
    ];
  }

  return isVolume(key)
    ? volumeNodes(view, value)
    : [make(view.document, 'span', { text: view.say(value) })];
}

function valueText(view, key, value) {
  if (key === 'lang') {
    return LANG_NAMES[value];
  }

  return isVolume(key) ? String(value) : view.say(value);
}

function renderRow(section, { key, value, view }) {
  const slot = slotOf(section, key);
  const row = slot?.closest('[data-adjust]');
  const choices = SETTING_CHOICES[key];

  slot?.replaceChildren(...valueNodes(view, key, value));
  row?.setAttribute('aria-valuemin', '0');
  row?.setAttribute('aria-valuemax', String(choices.length - 1));
  row?.setAttribute('aria-valuenow', String(choices.indexOf(value)));
  row?.setAttribute('aria-valuetext', valueText(view, key, value));
}

// each change is kept at once, and told to the game as `setting` { key, value }; a side screen,
// so Back returns to the screen it opened over
export const SETTINGS_SCREEN = {
  side: true,
  render(section, { view }) {
    for (const key of SETTING_KEYS) {
      renderRow(section, { key, value: view.settings[key], view });
    }
  },
  adjust(key, by, app) {
    app.settings = stepSetting(app.settings, key, by);
    writeSettings(app.storage, app.settings);
    app.emit('setting', { key, value: app.settings[key] });

    if (key === 'lang') {
      app.applyLang(app.settings.lang);
    } else {
      app.rerender();
    }
  },
};
