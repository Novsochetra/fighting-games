import { createHelpPanel } from '../ui/help/help-panel.js';
import { createHeroPanel } from '../ui/heroes/hero-panel.js';
import { createMenuActions } from '../ui/menus/menu-actions.js';
import { createMissionPanel } from '../ui/missions/mission-panel.js';
import { MenuController } from '../ui/menus/menu-controller.js';
import { installMenuEvents } from '../ui/menus/menu-events.js';
import { createNavigator, handleMenuKey } from '../ui/menus/menu-navigation.js';
import { createFullscreen, installFullscreen } from '../ui/screen/fullscreen.js';
import { installGestureGuards, installMenuTapFix } from '../ui/screen/gesture-guards.js';
import { createScreenFit, installScreenFit } from '../ui/screen/screen-fit.js';
import { createSettingsPanel } from '../ui/settings/settings-panel.js';

function isIos(navigator) {
  return (
    /iP(hone|od|ad)/.test(navigator.platform) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function createPanels({ elements, game, audio, layout, ui, window }) {
  return {
    settings: createSettingsPanel({
      list: elements.settingsList,
      game,
      audio,
      layout,
      ui,
      canVibrate: !!window.navigator.vibrate,
    }),
    help: createHelpPanel({ tabs: elements.helpTabs, body: elements.helpBody, game, ui }),
    heroes: createHeroPanel({ list: elements.heroList, game }),
    missions: createMissionPanel({ list: elements.missionList, game }),
  };
}

export function installUi({ window, elements, game, audio, ui, pad }) {
  const { document } = window;
  const layout = createScreenFit({ document, window, elements, game, ui });
  ui.onTouchShownChange = () => layout.applyTouchSettings();
  const fullscreen = createFullscreen({ document, screen: window.screen, ui });
  const panels = createPanels({ elements, game, audio, layout, ui, window });
  const context = () => ({
    ui,
    fullscreen,
    isIos: isIos(window.navigator),
    padConnected: pad.connected,
  });
  const menus = new MenuController({ document, game, audio, ui, context, panels });
  const act = createMenuActions({ game, audio, ui, fullscreen, menus, location: window.location });
  const navigate = createNavigator({ menus, audio, act });
  menus.navigate = navigate;
  menus.handleKey = (event) => handleMenuKey(event, { menus, navigate, ui });
  installMenuEvents({ document, menus, act, ui, panels, audio });
  installScreenFit(window, layout);
  installFullscreen({ window, document, fullscreen, layout });
  installGestureGuards({ window, document, elements });
  installMenuTapFix(elements.menus);
  return { layout, fullscreen, menus, act };
}
