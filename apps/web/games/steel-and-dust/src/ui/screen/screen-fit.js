import { buttonScale } from '../../data/settings.js';
import { applyButtonLayout, applyStickZone } from '../layout/apply-button-layout.js';
import { layoutForScreen } from '../layout/layout-draft.js';
import { customStickPlace } from '../layout/stick-place.js';
import { fitMenus, menuBox } from './menu-area.js';
import { pausePlace, placePause } from './pause-place.js';
import { createSafeArea } from './safe-area.js';
import { arrangeStage, STICK_RADIUS, stickRestPosition } from './stage-layout.js';
import { fitTouchLayer, touchAreaOf } from './touch-area.js';
import { onFoldChange, readHinge } from './viewport-segments.js';

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

// read again on every use rather than kept from the last fit, which may not have run yet when a
// fold or a turn reaches the layout editor
function hingeNow({ window, elements }) {
  return readHinge(window, screenOf(elements));
}

function fitStage({ elements, game, ui, window, safe }) {
  const hinge = hingeNow({ window, elements });
  const screen = screenOf(elements);
  const arranged = arrangeStage({
    ...screen,
    safe,
    touch: ui.showsTouchControls(),
    buttonScale: buttonScale(game.settings),
    hinge,
  });
  const { rect } = arranged;

  fitMenus(elements.menus, menuBox({ hinge, ...screen }));
  fitTouchLayer(elements.touch, touchAreaOf(hinge));
  placePause(elements.app, pausePlace({ ...arranged, hinge, width: screen.width }));
  Object.assign(elements.stage.style, {
    left: `${rect.x}px`,
    top: `${rect.y}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });
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
  const layer = touchAreaOf(hingeNow(context)) ?? screenOf(context.elements);
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
function originalStickRest({ context, safe, scale }) {
  const { elements } = context;
  const hinge = hingeNow(context);
  const touchArea = touchAreaOf(hinge);
  const { controlsBelow } = arrangeStage({
    ...screenOf(elements),
    safe,
    touch: true,
    buttonScale: scale,
    hinge,
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
  const context = { elements, game, window };
  const layout = {
    originalStickRest(scale) {
      return originalStickRest({ context, safe: readSafeArea(), scale });
    },
    // where the touch layer stands, null for the whole screen (the layout editor lays its copy there)
    touchArea() {
      return touchAreaOf(hingeNow(context));
    },
    stickRest(scale) {
      return customStick(context, scale)?.rest ?? layout.originalStickRest(scale);
    },
    fit() {
      fitStage({ elements, game, ui, window, safe: readSafeArea() });
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
  onFoldChange(window, layout.fit);
}
