import { steersWithDpad } from '../../data/skins/skins.js';
import { controlsHtml } from './controls.js';
import { movesHtml } from './moves.js';
import { soundTestHtml } from './sound-test.js';
import { tipsHtml } from './tips.js';

const TABS = [
  ['controls', 'Controls'],
  ['moves', 'Moves'],
  ['tips', 'Tips'],
  ['sounds', 'Sounds'],
];

function bodyHtml(state, { game, ui, layout }) {
  const touch = ui.isTouchOn();
  const bodies = {
    controls: () =>
      controlsHtml({ touch, stick: game.settings.stick, dpad: steersWithDpad(layout.padLayout()) }),
    moves: () => movesHtml({ weaponId: state.weapon, heroId: game.settings.hero, touch }),
    tips: tipsHtml,
    sounds: soundTestHtml,
  };
  return bodies[state.tab]();
}

export function createHelpPanel({ tabs, body, game, ui, layout }) {
  const state = { tab: 'controls', weapon: 'fists' };
  return {
    state,
    build() {
      tabs.innerHTML = TABS.map(
        ([id, label]) =>
          `<button type="button" role="tab" data-tab="${id}" aria-selected="${id === state.tab}">${label}</button>`,
      ).join('');
      body.innerHTML = bodyHtml(state, { game, ui, layout });
    },
  };
}
