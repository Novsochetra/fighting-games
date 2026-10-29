import { classesOf, element } from './pad-markup.js';
import { installPadStyles } from './pad-styles.js';

const layoutsByLayer = new WeakMap();

// a skin may wrap the game in a shell, a handheld's case, with a bezel round the game's screen; the
// game gives it a layer of its own behind its stage, so the stage shows through the bezel and the
// controls stand over both. The same layout again is left as it is
export function renderShell(layer, layout) {
  if (layoutsByLayer.get(layer) === layout) {
    return;
  }

  layoutsByLayer.set(layer, layout);

  if (!layout.shell) {
    layer.replaceChildren();
    return;
  }

  const { ownerDocument: document } = layer;
  const shell = element(document, 'div', classesOf('pad-shell', layout.shell));

  installPadStyles(document);
  shell.append(element(document, 'div', 'pad-bezel'));
  layer.replaceChildren(shell);
}

const MEASURES = ['x', 'y', 'width', 'height'];

// `rect` is where the game's screen stands, in px of the layer; the bezel goes round it
export function placeShell(layer, rect) {
  for (const measure of MEASURES) {
    layer.style.setProperty(`--pad-screen-${measure}`, `${rect[measure]}px`);
  }
}
