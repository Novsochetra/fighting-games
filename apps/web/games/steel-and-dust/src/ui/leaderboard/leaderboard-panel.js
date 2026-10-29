import { leaderboardHtml } from './device-board-html.js';
import { onlineBoardHtml, onlineLatest, runsOfTab } from './online-board-html.js';

export const BOARD_TABS = [
  ['week', 'This week'],
  ['all', 'All time'],
  ['device', 'This device'],
];

function tabsHtml(open) {
  const tabs = BOARD_TABS.map(
    ([id, label]) =>
      `<button type="button" role="tab" data-tab="${id}" aria-selected="${id === open}">${label}</button>`,
  );

  return `<div class="tabs" role="tablist">${tabs.join('')}</div>`;
}

function latestRow({ game, online }, tab) {
  if (tab === 'device') {
    return game.leaderboard.indexOf(game.lastRun);
  }

  const runs = runsOfTab(online, tab);

  return runs ? onlineLatest(runs, online.posted, tab) : -1;
}

// the tabs come first, then the rows; it opens on the run that just ended, if it is on the board,
// and keeps the row a gamepad or the arrow keys are on in view: a phone held sideways shows only
// half the board at once
export function createLeaderboardPanel({ list, game, online, isOnline }) {
  const state = { tab: 'week' };
  const sources = { game, online };

  return {
    state,

    build() {
      const body =
        state.tab === 'device'
          ? leaderboardHtml(game.leaderboard, game.lastRun)
          : onlineBoardHtml(online, state.tab);

      list.innerHTML = tabsHtml(state.tab) + body;

      if (state.tab !== 'device') {
        online.load();
      }
    },

    // a run that just ended and was not posted is on this device's board; offline, so is the rest
    chooseTab() {
      const unposted = game.lastRun && !online.rankOf(game.lastRun);

      state.tab = !isOnline() || unposted ? 'device' : 'week';
    },

    firstSelected() {
      const row = latestRow(sources, state.tab);

      return row >= 0 ? BOARD_TABS.length + row : BOARD_TABS.findIndex(([id]) => id === state.tab);
    },

    focus(index) {
      const rows = list.querySelectorAll('.board-row');

      rows[index - BOARD_TABS.length]?.scrollIntoView({ block: 'nearest' });
    },
  };
}
