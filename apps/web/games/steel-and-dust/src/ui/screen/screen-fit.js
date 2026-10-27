import { buttonScale } from '../../data/settings.js';
import { applyButtonLayout, applyStickZone } from '../layout/apply-button-layout.js';
import { layoutForScreen } from '../layout/layout-draft.js';
import { customStickPlace } from '../layout/stick-place.js';
import { fitMenus, menuBox } from './menu-area.js';
import { arrangeStage, STICK_RADIUS, stickRestPosition } from './stage-layout.js';
import { fitTouchLayer } from './touch-area.js';
import { readHinge } from './viewport-segments.js';

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

function screenOf(elements) {
  return { width: elements.app.clientWidth, height: elements.app.clientHeight };
}

function fitStage({ elements, game, ui, window, safe }) {
  const hinge = readHinge(window);
  const screen = screenOf(elements);
  const { rect, touchArea } = arrangeStage({
    ...screen,
    safe,
    touch: ui.showsTouchControls(),
    buttonScale: buttonScale(game.settings),
    hinge,
  });

  fitMenus(elements.menus, menuBox({ hinge, ...screen }));
  fitTouchLayer(elements.touch, touchArea);
  Object.assign(elements.stage.style, {
    left: `${rect.x}px`,
    top: `${rect.y}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });

  return touchArea;
}

function controlsLayout({ elements, game }) {
  return layoutForScreen(
    game.settings.buttonLayout,
    elements.app.clientWidth,
    elements.app.clientHeight,
  );
}

// the stick of the custom layout for the way the phone is held, placed on the touch layer
function customStick(context, scale) {
  const stick = controlsLayout(context)?.stick;
  if (!stick) {
    return null;
  }
  const layer = context.touchArea ?? screenOf(context.elements);
  return customStickPlace({ stick, layer, radius: STICK_RADIUS * scale * stick.size });
}

function fitControls(context) {
  const { elements, game } = context;
  applyButtonLayout(elements.touch, controlsLayout(context));
  applyStickZone(elements.stickZone, customStick(context, buttonScale(game.settings))?.zone);
}

// in px of the stick zone, which is as tall as the touch layer: the app, or a folded phone's bottom
// half. The app still measures while the touch layer is hidden (the layout editor places its copy
// of the stick from the title or pause menu)
function originalStickRest({ context, window, safe, scale }) {
  const { elements, touchArea } = context;
  const { controlsBelow } = arrangeStage({
    ...screenOf(elements),
    safe,
    touch: true,
    buttonScale: scale,
    hinge: readHinge(window),
  });

  return stickRestPosition({
    zoneHeight: touchArea?.height ?? elements.app.getBoundingClientRect().height,
    safe,
    stageBottom: elements.stage.getBoundingClientRect().bottom - (touchArea?.y ?? 0),
    controlsBelow,
    buttonScale: scale,
  });
}

export function createScreenFit({ document, window, elements, game, ui }) {
  const readSafeArea = createSafeArea(document, window);
  const context = { elements, game, touchArea: null };
  const layout = {
    originalStickRest(scale) {
      return originalStickRest({ context, window, safe: readSafeArea(), scale });
    },
    stickRest(scale) {
      return customStick(context, scale)?.rest ?? layout.originalStickRest(scale);
    },
    fit() {
      context.touchArea = fitStage({ elements, game, ui, window, safe: readSafeArea() });
      fitControls(context);
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
  // folding a phone halfway changes its segments without always changing its size
  window.navigator.devicePosture?.addEventListener('change', layout.fit);
}
