import { canVibrate } from '../../../../packages/input/src/rumble.js';
import { createCreditsPanel, installCreditsEnd } from '../ui/credits/credits-panel.js';
import { createSupportersFeed } from '../ui/credits/supporters-feed.js';
import { createHelpPanel } from '../ui/help/help-panel.js';
import { installCarouselEvents } from '../ui/heroes/carousel-events.js';
import { createHeroPanel } from '../ui/heroes/hero-panel.js';
import { createLayoutEditor } from '../ui/layout/layout-editor.js';
import { installBoardEvents } from '../ui/leaderboard/board-events.js';
import { createLeaderboardPanel } from '../ui/leaderboard/leaderboard-panel.js';
import { createArcadeExit } from '../ui/menus/arcade-exit.js';
import { createMenuActions } from '../ui/menus/menu-actions.js';
import { MenuController } from '../ui/menus/menu-controller.js';
import { installMenuEvents } from '../ui/menus/menu-events.js';
import { createNavigator, handleMenuKey } from '../ui/menus/menu-navigation.js';
import { installPostEvents } from '../ui/post/post-events.js';
import { createPostPanel } from '../ui/post/post-panel.js';
import { createFullscreen, installFullscreen } from '../ui/screen/fullscreen.js';
import {
  installGestureGuards,
  installMenuTapFix,
} from '../../../../packages/screen/src/gesture-guards.js';
import { createScreenFit, installScreenFit } from '../ui/screen/screen-fit.js';
import { installSettingsEvents } from '../ui/settings/settings-events.js';
import { createSettingsPanels } from '../ui/settings/settings-panel.js';
import { createShare } from '../ui/share/share-run.js';
import { createSkinPicker } from '../ui/skins/skin-picker.js';

function isIos(navigator) {
  return (
    /iP(hone|od|ad)/.test(navigator.platform) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function createPanels({ elements, game, audio, layout, ui, window, supporters, online }) {
  const panels = {
    ...createSettingsPanels({ elements, game, audio, layout, ui, canVibrate: canVibrate(window) }),
    help: createHelpPanel({
      tabs: elements.helpTabs,
      body: elements.helpBody,
      game,
      ui,
      layout,
    }),
    heroes: createHeroPanel({ list: elements.heroList, game }),
    leaderboard: createLeaderboardPanel({
      list: elements.leaderboardList,
      game,
      online,
      isOnline: () => window.navigator.onLine !== false,
    }),
    post: createPostPanel({ root: elements.postPanel, game, online, ui }),
    credits: createCreditsPanel({ root: elements.credits, game, feed: supporters }),
  };
  panels.layout = createLayoutEditor({ window, game, audio, layout, settings: panels.section });
  panels.skins = createSkinPicker({ window, game, audio, layout, settings: panels.section });
  return panels;
}

// keys, the d-pad and clicks reach the menus here
function installMenuInput({ document, elements, menus, act, ui, panels, audio }) {
  const navigate = createNavigator({ menus, audio, act });

  menus.navigate = navigate;
  menus.handleKey = (event) => handleMenuKey(event, { menus, navigate, ui });
  installMenuEvents({ document, menus, act, ui, panels, audio });
  installSettingsEvents({ elements, menus });
  installBoardEvents({ root: document.getElementById('m-leaderboard'), menus, panels });
  installPostEvents({ root: elements.postPanel, menus, act });
  installCarouselEvents({ stage: elements.heroStage, menus, audio });
  installCreditsEnd({ root: elements.credits, menus });
}

export function installUi({ window, elements, game, audio, ui, pad, online }) {
  const { document } = window;
  const layout = createScreenFit({ document, window, elements, game, ui });
  ui.onTouchShownChange = () => layout.applyTouchSettings();
  // first, so a resize or a fold refits the page before the layout editor redraws over it
  installScreenFit(window, layout);
  const fullscreen = createFullscreen({ document, screen: window.screen, ui });
  const supporters = createSupportersFeed((address) => window.fetch(address));
  const panels = createPanels({ elements, game, audio, layout, ui, window, supporters, online });
  const share = createShare({ window, document });
  const context = () => ({
    ui,
    fullscreen,
    online,
    share,
    isIos: isIos(window.navigator),
    padConnected: pad.connected,
  });
  const menus = new MenuController({ document, game, audio, ui, context, panels });
  panels.skins.select = (item) => menus.select(item);
  online.onChange = () => ['leaderboard', 'post'].forEach((id) => menus.redraw(id));
  const leaveForArcade = createArcadeExit({
    location: window.location,
    history: window.history,
    referrer: document.referrer,
  });
  const actions = { game, audio, ui, fullscreen, menus, leaveForArcade, online, share };
  const act = createMenuActions(actions);
  installMenuInput({ document, elements, menus, act, ui, panels, audio });
  installFullscreen({ window, document, fullscreen, layout });
  installGestureGuards({
    window,
    document,
    root: elements.app,
    surfaces: [elements.stage, elements.touch],
  });
  installMenuTapFix(elements.menus);
  return { layout, fullscreen, menus, act, supporters };
}
