// a tab opens its board where the menu is, as How to play's tabs do
export function installBoardEvents({ root, menus, panels }) {
  root.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-tab]');

    if (tab) {
      panels.leaderboard.state.tab = tab.dataset.tab;
      menus.redraw('leaderboard');
    }
  });
}
