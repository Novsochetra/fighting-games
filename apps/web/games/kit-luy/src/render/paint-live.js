import { BULBS, SCENE } from '../art/palette.js';
import { bulbsOf } from './scene.js';

function paintStars(context, scene, seconds) {
  context.fillStyle = SCENE.star;

  for (const star of scene.stars) {
    context.globalAlpha = 0.25 + 0.75 * Math.abs(Math.sin(seconds * star.speed + star.phase));
    context.fillRect(star.x, star.y, 1, 1);
  }
}

function paintBulbs(context, scene, seconds) {
  for (const string of scene.strings) {
    for (const bulb of bulbsOf(scene, string)) {
      const glow = 0.5 + 0.5 * Math.sin(seconds * 2.4 + bulb.index * 1.7);

      context.fillStyle = BULBS[bulb.index % BULBS.length];
      context.globalAlpha = 0.12 + 0.2 * glow;
      context.fillRect(bulb.x - 2, bulb.y - 1, 5, 5);
      context.globalAlpha = 0.6 + 0.4 * glow;
      context.fillRect(bulb.x - 1, bulb.y, 3, 3);
    }
  }
}

function paintLamps(context, scene, seconds) {
  context.fillStyle = SCENE.lamp;

  scene.stalls.forEach((stall, i) => {
    const x = stall.x + Math.floor(stall.width / 2);
    const y = scene.horizon - stall.height + 7;

    context.globalAlpha = 0.14 + 0.06 * Math.sin(seconds * 3 + i);
    context.fillRect(x - 3, y - 2, 7, 6);
    context.globalAlpha = 0.9;
    context.fillRect(x, y, 1, 2);
  });
}

function paintMotes(context, scene, seconds) {
  context.fillStyle = SCENE.mote;

  for (const mote of scene.motes) {
    const y = scene.height - ((mote.y + seconds * mote.speed) % scene.height);
    const x = mote.x + Math.round(Math.sin(seconds * 0.7 + mote.phase) * 3);

    context.globalAlpha = 0.2 + 0.25 * Math.abs(Math.sin(seconds + mote.phase));
    context.fillRect(x, Math.round(y), 2, 2);
  }
}

export function paintLive(context, scene, seconds) {
  paintStars(context, scene, seconds);
  paintBulbs(context, scene, seconds);
  paintLamps(context, scene, seconds);
  paintMotes(context, scene, seconds);
  context.globalAlpha = 1;
}
