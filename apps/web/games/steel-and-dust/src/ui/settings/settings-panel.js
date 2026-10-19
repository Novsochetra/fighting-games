import { refreshAttackTokens } from '../../sim/fighters/tokens.js';
import { SETTINGS_SCHEMA, steppedValue } from './settings-schema.js';

function valueHtml(definition, settings) {
  const value = settings[definition.key];
  if (definition.range) {
    return `${value}%<span class="meter"><i style="width:${value}%"></i></span>`;
  }
  return definition.format(value);
}

function rowHtml(definition, settings) {
  const note = definition.note ? `<small>${definition.note}</small>` : '';
  return (
    `<div class="setrow" data-k="${definition.key}"><span class="lbl">${definition.label}${note}</span>` +
    '<span class="stepper"><button type="button" data-d="-1" aria-label="Less">‹</button>' +
    `<span class="val">${valueHtml(definition, settings)}</span>` +
    '<button type="button" data-d="1" aria-label="More">›</button></span></div>'
  );
}

export function settingsHtml(visibility, settings) {
  return SETTINGS_SCHEMA.filter(
    (definition) => !definition.visible || definition.visible(visibility),
  )
    .map((definition) =>
      definition.group
        ? `<div class="group">${definition.group}</div>`
        : rowHtml(definition, settings),
    )
    .join('');
}

const AFTER_CHANGE = {
  music: ({ audio }) => audio.syncVolumes(),
  sfx: ({ audio }) => audio.syncVolumes(),
  touch: ({ layout }) => layout.applyTouchSettings(),
  buttonSize: ({ layout }) => layout.applyTouchSettings(),
  stick: ({ layout }) => layout.applyTouchSettings(),
  difficulty: ({ game }) => refreshAttackTokens(game),
};

export function createSettingsPanel({ list, game, audio, layout, ui, canVibrate }) {
  const visibility = { isTouchOn: ui.isTouchOn, canVibrate, settings: game.settings };
  return {
    build() {
      list.innerHTML = settingsHtml(visibility, game.settings);
    },
    change(key, step, wrap) {
      const definition = SETTINGS_SCHEMA.find((entry) => entry.key === key);
      if (!definition) {
        return false;
      }
      game.settings[key] = steppedValue(definition, game.settings[key], { step, wrap });
      game.io.saveSettings(game.settings);
      audio.sfx('ui');
      AFTER_CHANGE[key]?.({ audio, layout, game });
      return true;
    },
  };
}
