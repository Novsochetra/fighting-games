export function findElements(document) {
  const byId = (id) => document.getElementById(id);
  return {
    app: byId('app'),
    shell: byId('shell'),
    stage: byId('stage'),
    canvas: byId('game'),
    touch: byId('touch'),
    pauseButton: byId('pauseBtn'),
    menus: byId('menus'),
    settingsList: byId('settingsList'),
    helpTabs: byId('helpTabs'),
    helpBody: byId('helpBody'),
    leaderboardList: byId('leaderboardList'),
    postPanel: byId('postPanel'),
    credits: byId('m-credits'),
    heroStage: byId('heroStage'),
    heroList: byId('heroList'),
  };
}
