import { DUEL_UI } from '../../art/duel/palette.js';
import { SAVE_CAM_ART } from '../../art/save-cam.js';
import { hash } from '../duel/hash.js';
import { drawImpact } from '../duel/impact.js';
import { ART } from '../duel/layout.js';
import { band, ring } from '../duel/shapes.js';
import { shotPoint } from './flight.js';
import { contactAt } from './glove-pull.js';
import { contactTick } from './timing.js';
import { project } from './view.js';

export const contactOnScreen = contactAt;

// a fist thrown at the ball: a star of white at his gloves, and lines flying off the way it goes
function fistFlash(pen, { at, since, dive }) {
  if (since >= 10) {
    return;
  }

  for (let i = 0; i < 6; i += 1) {
    const angle = -Math.PI / 2 + (dive || 1) * 0.6 + (i - 2.5) * 0.3;
    const reach = 8 + since * 3;

    band(pen, {
      from: { x: at.x + Math.cos(angle) * (reach - 6), y: at.y + Math.sin(angle) * (reach - 6) },
      to: { x: at.x + Math.cos(angle) * reach, y: at.y + Math.sin(angle) * reach },
      width: 2,
      color: DUEL_UI.white,
    });
  }

  ring(pen, { ...at, radius: 3 + since * 1.5, width: 2, color: DUEL_UI.white });
}

// the ball rings off the post: a white ring there and a shiver along it
function clang(pen, { at, since }) {
  if (since < 3 || since > 16) {
    return;
  }

  ring(pen, { ...at, radius: since * 1.4, width: 1, color: SAVE_CAM_ART.post[3] });
  pen.rect([at.x - 1 + (since % 2), at.y - 30, 1, 60], SAVE_CAM_ART.post[3]);
}

// the shot's own burst where it meets him, drawn behind him so his gloves and the ball show on it
export function drawContactBurst(pen, { moment, ticks, art }) {
  const since = ticks - contactTick();

  if (since >= 0) {
    const at = contactOnScreen(moment);

    drawImpact(pen, { sinceHit: since, impact: { x: at.x, y: at.y }, art });
  }
}

// what lands in front of him at the contact: a fist, a post
export function drawContact(pen, { moment, ticks, pose }) {
  const since = ticks - contactTick();

  if (since < 0) {
    return;
  }

  if (moment.outcome === 'punch') {
    fistFlash(pen, { at: pose.gloves, since, dive: moment.dive });
  }

  if (moment.outcome === 'post') {
    clang(pen, { at: project(shotPoint(moment.aim, 1)), since });
  }
}

// the whole view goes white at the contact and fades back in a few ticks
export function drawFlash(pen, ticks) {
  const since = ticks - contactTick();

  if (since < 0 || since >= 6) {
    return;
  }

  pen.context.save();
  pen.context.globalAlpha *= since < 2 ? 0.6 : 0.6 * (1 - (since - 1) / 5);
  pen.rect([0, 0, ART.width, ART.height], SAVE_CAM_ART.flash);
  pen.context.restore();
}

// a small shake after the contact, in whole art pixels, the same for a frame drawn twice
export function shakeOf(ticks) {
  const since = ticks - contactTick();

  if (since < 0 || since > 10) {
    return { x: 0, y: 0 };
  }

  const power = since < 5 ? 2 : 1;

  return {
    x: Math.round((hash(ticks, 221) - 0.5) * 2 * power),
    y: Math.round((hash(ticks, 222) - 0.5) * 2 * power),
  };
}
