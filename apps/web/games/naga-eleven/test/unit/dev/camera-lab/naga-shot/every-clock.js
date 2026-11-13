import { clockAt, planFor } from '../../../../../dev/camera-lab/src/naga-shot/sequence.js';
import { ENDINGS } from '../../../../../dev/camera-lab/src/naga-shot/world.js';

export const SETTINGS = [
  { camera: 'full', repeat: false },
  { camera: 'short', repeat: false },
  { camera: 'off', repeat: true },
];

export function everyClock(settings) {
  const plan = planFor(settings);

  return Array.from({ length: plan.total }, (_, frame) => clockAt(plan, frame));
}

export const firstOf = (settings, stage) =>
  everyClock(settings).find((clock) => clock.stage === stage);

export const lastOf = (settings, stage) =>
  everyClock(settings).findLast((clock) => clock.stage === stage);

export const EVERY_CASE = SETTINGS.flatMap((settings) =>
  ENDINGS.map((ending) => [`${ending} on ${settings.camera}`, { ...settings, ending }]),
);
