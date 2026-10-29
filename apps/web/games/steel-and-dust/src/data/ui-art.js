// every image the menus' stylesheets draw: the stone kit and the title painting for either way up
// (the hero cards' strips are named by the heroes table, ui/loading/boot-art.js); the loading screen
// holds the title until all of it is in (test/unit/data/ui-art.test.js keeps UI_ART and SKIN_ART in
// step with the stylesheets)
const MENU_ART = [
  'assets/ui/select/bg-landscape.png',
  'assets/ui/select/bg-portrait.png',
  'assets/ui/kit/button.png',
  'assets/ui/kit/button-primary.png',
  'assets/ui/kit/title-crest.png',
  'assets/ui/kit/title-rule.png',
  'assets/ui/kit/panel.png',
  'assets/ui/kit/panel-crest.png',
  'assets/ui/kit/panel-foot.png',
  'assets/ui/kit/stone-button.png',
  'assets/ui/settings/lotus-band.png',
  'assets/ui/hud/panel-frame.png',
  'assets/ui/hud/score-frame.png',
  'assets/ui/select/card.png',
  'assets/ui/select/card-crest.png',
  'assets/ui/select/card-selected.png',
  'assets/ui/select/card-crest-selected.png',
  'assets/ui/select/arrow.png',
];

// the loading screen's own art, which the page preloads ahead of everything else
export const LOADER_ART = [
  'assets/ui/loading/bg.png',
  'assets/ui/loading/bokator-run.png',
  'assets/ui/loading/naga-tail.png',
  'assets/ui/loading/naga-body.png',
  'assets/ui/loading/naga-head.png',
  'assets/ui/loading/dust.png',
];

// the loading screen's own art goes first, so it is up before the menus' art starts coming in
export const UI_ART = [...LOADER_ART, ...MENU_ART];

// the Clear skins' board and gloss, either way up, and their keys, up and pressed: only the Skins
// screen and a fight in one of them draw these, so they come once the menu art is in
// (boot/start-loading.js), not holding the title for every player
export const SKIN_ART = [
  'assets/skins/clear/insides-landscape.webp',
  'assets/skins/clear/insides-portrait.webp',
  'assets/skins/clear/gloss-landscape.webp',
  'assets/skins/clear/gloss-portrait.webp',
  'assets/skins/clear/key-round.webp',
  'assets/skins/clear/key-round-pressed.webp',
  'assets/skins/clear/dpad.webp',
];
