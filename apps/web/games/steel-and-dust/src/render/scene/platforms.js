import { RENDER_SCALE, VIEW_WIDTH } from '../../config.js';
import { PLATFORM_SPRITES } from '../../data/platform-sprites.js';
import { groundAt } from '../../sim/stage/terrain.js';

const DIRECTORY = 'assets/sprites/platforms/';

export function loadPlatformSprites({ createImage, baseUrl }) {
  const sheets = { images: {}, ready: {} };
  for (const [kind, sprite] of Object.entries(PLATFORM_SPRITES)) {
    const image = createImage();
    image.onload = () => {
      sheets.ready[kind] = true;
    };
    image.src = `${baseUrl}${DIRECTORY}${sprite.file}`;
    sheets.images[kind] = image;
  }
  return sheets;
}

// each half of the deck's last row is stretched down to the ground under its own leg
function drawLegs(context, { image, platform, sprite, terrain }) {
  const half = image.width / 2;
  const legTop = platform.y + (image.height - sprite.topY) / RENDER_SCALE;
  sprite.legs.forEach((legX, side) => {
    const length = groundAt(terrain, platform.x + legX) - legTop;
    if (length > 0) {
      const destination = platform.x + (side * half) / RENDER_SCALE;
      context.drawImage(
        image,
        side * half,
        image.height - 1,
        half,
        1,
        destination,
        legTop,
        half / RENDER_SCALE,
        length,
      );
    }
  });
}

function drawPlatform(context, { image, platform, sprite, terrain }) {
  drawLegs(context, { image, platform, sprite, terrain });
  const top = platform.y - sprite.topY / RENDER_SCALE;
  context.drawImage(
    image,
    platform.x,
    Math.round(top),
    image.width / RENDER_SCALE,
    image.height / RENDER_SCALE,
  );
}

export function drawPlatforms(painter, { cameraX, terrain, sheets }) {
  for (const platform of terrain.platforms) {
    const sprite = PLATFORM_SPRITES[platform.kind];
    const onScreen = platform.x + platform.width > cameraX && platform.x < cameraX + VIEW_WIDTH;
    if (onScreen && sheets.ready[platform.kind]) {
      const image = sheets.images[platform.kind];
      drawPlatform(painter.context, { image, platform, sprite, terrain });
    }
  }
}
