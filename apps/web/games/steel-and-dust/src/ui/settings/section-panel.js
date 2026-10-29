import { refreshAttackTokens } from '../../sim/fighters/tokens.js';
import { buzz } from '../../sim/fx/haptics.js';
import { SETTINGS_SCHEMA, steppedValue } from './settings-schema.js';

function valueHtml(definition, settings) {
  const value = settings[definition.key];
  if (definition.range) {
    return `${value}%<span class="meter"><i style="width:${value}%"></i></span>`;
  }
  return definition.format(value);
}

function controlHtml(definition, settings) {
  const value = `<span class="val">${valueHtml(definition, settings)}</span>`;
  if (definition.action) {
    return `<span class="stepper">${value}<button type="button" class="xbtn stone-btn" data-act="${definition.action}">${definition.actionLabel ?? 'Edit'}</button></span>`;
  }
  return (
    '<span class="stepper"><button type="button" class="stone-btn" data-d="-1" aria-label="Less">‹</button>' +
    `${value}<button type="button" class="stone-btn" data-d="1" aria-label="More">›</button></span>`
  );
}

function rowHtml(definition, settings) {
  const note = definition.note ? `<small>${definition.note}</small>` : '';
  return (
    `<div class="setrow" data-k="${definition.key}"><span class="lbl">${definition.label}${note}</span>` +
    `${controlHtml(definition, settings)}</div>`
  );
}

export function sectionHtml(section, visibility, settings) {
  return section.rows
    .filter((definition) => !definition.visible || definition.visible(visibility))
    .map((definition) => rowHtml(definition, settings))
    .join('');
}

const AFTER_CHANGE = {
  music: ({ audio }) => audio.syncVolumes(),
  sfx: ({ audio }) => audio.syncVolumes(),
  touch: ({ layout }) => layout.applyTouchSettings(),
  buttonSize: ({ layout }) => layout.applyTouchSettings(),
  stick: ({ layout }) => layout.applyTouchSettings(),
  padOpacity: ({ layout }) => layout.applyTouchSettings(),
  padHidesTouch: ({ layout }) => layout.applyTouchSettings(),
  difficulty: ({ game }) => refreshAttackTokens(game),
  // turned on, it gives a taste of what a blow feels like
  haptics: ({ game }) => buzz(game, 'bigHit'),
};

export function createSectionPanel({ list, title, game, audio, layout, visibility, section }) {
  return {
    build() {
      title.textContent = section().title;
      list.innerHTML = sectionHtml(section(), visibility, game.settings);
    },

    change(key, step, wrap) {
      const definition = SETTINGS_SCHEMA.find((entry) => entry.key === key);
      if (!definition || definition.action) {
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
