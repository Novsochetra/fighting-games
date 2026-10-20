export function findElements(document) {
  const byId = (id) => document.getElementById(id);
  return {
    app: byId('app'),
    stage: byId('stage'),
    canvas: byId('game'),
    touch: byId('touch'),
    stickZone: byId('stickZone'),
    stickBase: byId('stickBase'),
    stickKnob: byId('stickKnob'),
    pauseButton: byId('pauseBtn'),
    ultButton: document.querySelector('#touch [data-action="ult"]'),
    touchButtons: [...document.querySelectorAll('#touch .tb')],
    menus: byId('menus'),
    settingsList: byId('settingsList'),
    helpTabs: byId('helpTabs'),
    helpBody: byId('helpBody'),
    heroList: byId('heroList'),
    missionList: byId('missionList'),
  };
}
