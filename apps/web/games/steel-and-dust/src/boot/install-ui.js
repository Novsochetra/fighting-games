import { createHelpPanel } from '../ui/help/help-panel.js';
import { installCarouselEvents } from '../ui/heroes/carousel-events.js';
import { createHeroPanel } from '../ui/heroes/hero-panel.js';
import { createLayoutEditor } from '../ui/layout/layout-editor.js';
import { createLeaderboardPanel } from '../ui/leaderboard/leaderboard-panel.js';
import { createMenuActions } from '../ui/menus/menu-actions.js';
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
  const panels = {
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
    leaderboard: createLeaderboardPanel({ list: elements.leaderboardList, game }),
  };
  panels.layout = createLayoutEditor({ window, game, audio, layout, settings: panels.settings });
  return panels;
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
  installCarouselEvents({ stage: elements.heroStage, menus, audio });
  installScreenFit(window, layout);
  installFullscreen({ window, document, fullscreen, layout });
  installGestureGuards({ window, document, elements });
  installMenuTapFix(elements.menus);
  return { layout, fullscreen, menus, act };
}
