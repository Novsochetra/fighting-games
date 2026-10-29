import { createSafeArea } from '../../../../../packages/screen/src/safe-area.js';
import { onFoldChange, readHinge } from '../../../../../packages/screen/src/viewport-segments.js';
import { placeShell, renderShell } from '../../../../../packages/touch-pad/src/pad-shell.js';
import { buttonScale } from '../../data/settings.js';
import { customStick, fitControls, frameOf, padLayoutOf } from './fit-pad.js';
import { fitMenus, menuBox } from './menu-area.js';
import { pausePlace, placePause } from './pause-place.js';
import { arrangeStage, stickRestPosition } from './stage-layout.js';
import { fitTouchLayer, touchAreaOf } from './touch-area.js';

function applyTouchClasses(document, { game, ui }) {
  const { classList } = document.body;
  classList.toggle('touch-on', ui.showsTouchControls());
  classList.toggle('stick-fixed', game.settings.stick === 'fixed');
  classList.toggle('stick-hidden', game.settings.stick === 'hidden');
  document.documentElement.style.setProperty('--btn', String(buttonScale(game.settings)));
  document.documentElement.style.setProperty('--pad-opacity', String(game.settings.padOpacity));
}

function screenOf(elements) {
  return { width: elements.app.clientWidth, height: elements.app.clientHeight };
}

// read again on every use rather than kept from the last fit, which may not have run yet when a
// fold or a turn reaches the Skins screen
function hingeNow({ window, elements }) {
  return readHinge(window, screenOf(elements));
}

// a skin with a shell keeps the stage inside its frame, between its controls, behind its bezel
function fitStage(context, safe) {
  const { elements, game, ui } = context;
  const hinge = context.hingeNow();
  const screen = screenOf(elements);
  const scale = buttonScale(game.settings);
  const padLayout = padLayoutOf(context);
  const arranged = arrangeStage({
    ...screen,
    safe,
    touch: ui.showsTouchControls(),
    buttonScale: scale,
    hinge,
    frame: frameOf(padLayout, scale),
  });
  const { rect } = arranged;

  context.stageRect = rect;
  fitMenus(elements.menus, menuBox({ hinge, ...screen }));
  fitTouchLayer(elements.touch, touchAreaOf(hinge));
  placePause(elements.app, pausePlace({ ...arranged, hinge, width: screen.width }));
  renderShell(elements.shell, padLayout);
  placeShell(elements.shell, rect);
  Object.assign(elements.stage.style, {
    left: `${rect.x}px`,
    top: `${rect.y}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });
}

// in px of the stick zone, which is as tall as the touch layer: the app, or a folded phone's bottom
// half. The app still measures while the touch layer is hidden (the Skins screen places its copy
// of the stick from the title or pause menu)
function originalStickRest({ context, safe, scale }) {
  const { elements } = context;
  const hinge = context.hingeNow();
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
  const context = { elements, game, ui, window, hingeNow: () => hingeNow({ window, elements }) };
  const layout = {
    padLayout() {
      return padLayoutOf(context);
    },
    // where the stage stands now, which a copy of the shell puts its bezel round
    stageRect() {
      return context.stageRect;
    },
    // the Skins screen shows the skin looked at, each key in the shape looked at, as if picked (null
    // for the ones picked)
    previewSkin(skinId, keyShapes = {}) {
      context.preview = skinId ? { skinId, keyShapes } : null;
      layout.fit();
    },
    originalStickRest(scale) {
      return originalStickRest({ context, safe: readSafeArea(), scale });
    },
    // where the touch layer stands, null for the whole screen (the Skins screen lays its copy there)
    touchArea() {
      return touchAreaOf(context.hingeNow());
    },
    stickRest(scale) {
      return customStick(context, scale)?.rest ?? layout.originalStickRest(scale);
    },
    fit() {
      fitStage(context, readSafeArea());
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
