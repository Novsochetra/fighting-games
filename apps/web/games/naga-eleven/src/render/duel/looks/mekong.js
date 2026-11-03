import { GROUND, KICKER } from '../paths.js';
import { scatter, withFade } from './fade.js';
import { drawRiver } from './water.js';

// the passes that built the combo, as the river's way in along the grass to the kicker's foot
function passes(scene) {
  return Array.from({ length: 8 }, (_, i) => ({
    x: i * ((KICKER.x + 8) / 7) - 8,
    y: GROUND - 3 - Math.round(Math.sin(i * 1.3 + scene.tick / 10) * 2),
  }));
}

// the Mekong Current: a river of light runs in along the passes and carries the ball on
function back(pen, scene) {
  const shot = Array.from({ length: 14 }, (_, i) => scene.trailPoint((13 - i) * 0.04));

  withFade(pen, scene, () => {
    drawRiver(pen, { points: passes(scene), width: 5, art: scene.art, tick: scene.tick });
    drawRiver(pen, { points: shot, width: 9, art: scene.art, tick: scene.tick });
  });
  scatter(pen, { scene, points: shot, colors: [scene.art.body[4], scene.art.accent[3]] });
}

// the passers' run, a river of light winding across the band, dimmer than the shot's own
function bandFigure(pen, cut) {
  const points = Array.from({ length: 21 }, (_, i) => ({
    x: cut.offset + i * 14 - 10,
    y: cut.top + cut.height / 2 + 12 + Math.round(Math.sin(i * 0.55 + cut.tick / 12) * 12),
  }));
  const dim = { ...cut.art, body: [cut.art.body[0], ...cut.art.body.slice(0, 4)] };

  drawRiver(pen, { points, width: 12, art: dim, tick: cut.tick });
}

export const MEKONG = { back, band: bandFigure };
