import { createSectionPanel } from './section-panel.js';
import { SETTINGS_SECTIONS } from './settings-schema.js';

function linkHtml({ id, title, note }) {
  return (
    `<button type="button" class="setlink" data-section="${id}">` +
    `<span class="lbl">${title}<small>${note}</small></span>` +
    '<span class="go stone-btn" aria-hidden="true">›</span></button>'
  );
}

export function settingsHtml() {
  return SETTINGS_SECTIONS.map(linkHtml).join('');
}

// back on Settings, the highlight stays on the section just left, so a pad player goes on from
// where they were
export function createSettingsPanels({ elements, game, audio, layout, ui, canVibrate }) {
  const visibility = { isTouchOn: ui.isTouchOn, canVibrate, settings: game.settings };
  const state = { section: SETTINGS_SECTIONS[0] };
  const settings = {
    build() {
      elements.settingsSections.innerHTML = settingsHtml();
    },

    pick(id) {
      state.section = SETTINGS_SECTIONS.find((entry) => entry.id === id) ?? state.section;
    },

    firstSelected: () => SETTINGS_SECTIONS.indexOf(state.section),
  };
  const section = createSectionPanel({
    list: elements.sectionRows,
    title: elements.sectionTitle,
    game,
    audio,
    layout,
    visibility,
    section: () => state.section,
  });

  return { settings, section };
}
