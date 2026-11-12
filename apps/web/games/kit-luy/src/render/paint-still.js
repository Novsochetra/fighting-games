import { SCENE, SKY } from '../art/palette.js';
import { bulbsOf } from './scene.js';

const AWNING_HEIGHT = 4;
const CROWN = [3, 7, 9, 11, 9, 5];

function paintSky(context, { width, horizon }) {
  const band = Math.ceil(horizon / SKY.length);

  SKY.forEach((color, i) => {
    context.fillStyle = color;
    context.fillRect(0, i * band, width, band);

    // one dithered row eases each band into the next
    for (let x = i % 2; x < width; x += 2) {
      context.fillRect(x, i * band - 1, 1, 1);
    }
  });
}

function paintStall(context, stall, horizon) {
  const top = horizon - stall.height;

  context.fillStyle = SCENE.stall;
  context.fillRect(stall.x + 1, top + AWNING_HEIGHT, stall.width - 2, stall.height);

  for (let x = 0; x < stall.width; x++) {
    context.fillStyle = Math.floor(x / 3) % 2 ? SCENE.awningStripe : SCENE.awning;
    context.fillRect(stall.x + x, top, 1, AWNING_HEIGHT + (x % 3 === 1 ? 1 : 0));
  }
}

function paintPalm(context, palm, horizon) {
  const top = horizon - palm.height;

  context.fillStyle = SCENE.palm;
  context.fillRect(palm.x, top, 2, palm.height);

  CROWN.forEach((width, row) => {
    context.fillRect(palm.x + 1 - Math.floor(width / 2), top - 3 + row, width, 1);
  });
}

function paintWires(context, scene) {
  context.fillStyle = SCENE.wire;

  for (const string of scene.strings) {
    for (const bulb of bulbsOf(scene, string)) {
      context.fillRect(bulb.x - 4, bulb.y - 1, 8, 1);
    }
  }
}

export function paintStill(context, scene) {
  paintSky(context, scene);
  context.fillStyle = SCENE.ground;
  context.fillRect(0, scene.horizon, scene.width, scene.height - scene.horizon);
  scene.palms.forEach((palm) => paintPalm(context, palm, scene.horizon));
  scene.stalls.forEach((stall) => paintStall(context, stall, scene.horizon));
  paintWires(context, scene);
}
