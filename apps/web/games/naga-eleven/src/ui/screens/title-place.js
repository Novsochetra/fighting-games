import { createSafeArea } from '../../../../../packages/screen/src/safe-area.js';
import { titleSpots } from './title-spots.js';

function rectOf(node) {
  const { x, y, width, height } = node.getBoundingClientRect();

  return { x, y, width, height };
}

// whole pixels, rounded inward, so a box never reaches a pixel past the room it was given
function wholePixels({ x, y, width, height }) {
  const left = Math.ceil(x);
  const top = Math.ceil(y);

  return {
    x: left,
    y: top,
    width: Math.floor(x + width) - left,
    height: Math.floor(y + height) - top,
  };
}

function setSpot(section, name, spot) {
  for (const [side, value] of Object.entries(wholePixels(spot))) {
    section.style.setProperty(`--${name}-${side}`, `${value}px`);
  }

  section.dataset[name] = spot.place;
}

export function placeTitle(section, { canvas, window, safe }) {
  const spots = titleSpots({
    stage: rectOf(canvas),
    screen: { width: window.innerWidth, height: window.innerHeight },
    safe,
  });

  setSpot(section, 'head', spots.head);
  setSpot(section, 'prompt', spots.prompt);
}

// the title's words stand where the title art leaves room, so they follow the stage: each fit
// sets the canvas's box (src/ui/stage.js), and a turned phone changes the room around it
export function followStage(document, section) {
  const window = document.defaultView;
  const canvas = document.getElementById('pitch');

  if (!window || !canvas || !section) {
    return;
  }

  const safeArea = createSafeArea(document, window);
  const place = () => placeTitle(section, { canvas, window, safe: safeArea() });

  new window.MutationObserver(place).observe(canvas, { attributeFilter: ['style'] });
  window.addEventListener('resize', place);
  place();
}
