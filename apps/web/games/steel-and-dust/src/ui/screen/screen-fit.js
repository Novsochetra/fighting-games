import { buttonScale } from '../../data/settings.js';
import { applyButtonLayout } from '../layout/apply-button-layout.js';
import { layoutForScreen } from '../layout/layout-draft.js';
import { isPortrait, stageRect, stickRestPosition } from './stage-layout.js';

const SAFE_AREA_PROBE =
  'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;' +
  'padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) ' +
  'env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px);';

// CSS env() is the only way to read the phone's notch and home-bar insets
function createSafeArea(document, window) {
  const probe = document.createElement('div');
  probe.style.cssText = SAFE_AREA_PROBE;
  document.body.appendChild(probe);
  return () => {
    const style = window.getComputedStyle(probe);
    return {
      top: parseFloat(style.paddingTop) || 0,
      right: parseFloat(style.paddingRight) || 0,
      bottom: parseFloat(style.paddingBottom) || 0,
      left: parseFloat(style.paddingLeft) || 0,
    };
  };
}

function applyTouchClasses(document, { game, ui }) {
  const { classList } = document.body;
  classList.toggle('touch-on', ui.showsTouchControls());
  classList.toggle('stick-fixed', game.settings.stick === 'fixed');
  classList.toggle('stick-hidden', game.settings.stick === 'hidden');
  document.documentElement.style.setProperty('--btn', String(buttonScale(game.settings)));
}

export function createScreenFit({ document, window, elements, game, ui }) {
  const readSafeArea = createSafeArea(document, window);
  const layout = {
    stickRest(scale) {
      // the stick zone is as tall as the app, which still measures while the touch layer is hidden
      // (the layout editor places its copy of the stick from the title or pause menu)
      return stickRestPosition({
        zoneHeight: elements.app.getBoundingClientRect().height,
        safe: readSafeArea(),
        stageBottom: elements.stage.getBoundingClientRect().bottom,
        portrait: isPortrait(elements.app.clientWidth, elements.app.clientHeight),
        buttonScale: scale,
      });
    },
    fit() {
      const width = elements.app.clientWidth;
      const height = elements.app.clientHeight;
      const portrait = isPortrait(width, height) && ui.showsTouchControls();
      const rect = stageRect({
        width,
        height,
        safe: readSafeArea(),
        portrait,
        buttonScale: buttonScale(game.settings),
      });
      Object.assign(elements.stage.style, {
        left: `${rect.x}px`,
        top: `${rect.y}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      });
      applyButtonLayout(elements.touch, layoutForScreen(game.settings.buttonLayout, width, height));
      layout.onFit?.();
    },
    applyTouchSettings() {
      applyTouchClasses(document, { game, ui });
      layout.fit();
    },
  };
  return layout;
}

export function installScreenFit(window, layout) {
  window.addEventListener('resize', layout.fit);
  window.visualViewport?.addEventListener('resize', layout.fit);
  window.addEventListener('orientationchange', () => window.setTimeout(layout.fit, 250));
}
