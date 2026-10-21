import { createLoaderGate, loaderPercent, loaderPhase, stepLoaderGate } from './loader-gate.js';
import { createLoaderView } from './loader-view.js';

// one loading screen for both waits: the menu art when the page opens, and a mission's road and the
// picked Shade during play. `scene` is the share of the scene that is in while it waits, null when
// it is not waiting
export function createLoader(element, now) {
  const gate = createLoaderGate(now);
  const view = createLoaderView(element);
  const boot = { done: false, progress: 0 };
  const update = (time, scene) => {
    const waiting = !boot.done || scene !== null;
    const progress = boot.done ? (scene ?? 1) : boot.progress;
    view.render(stepLoaderGate(gate, { waiting, progress, now: time }), loaderPercent(gate));
  };
  return {
    update,
    showWords: view.showWords,
    bootProgress(fraction, time) {
      if (!boot.done) {
        boot.progress = fraction;
        update(time, null);
      }
    },
    // the screen comes down on the next update, from the game's own frame loop, so it never lifts
    // before the game has built its title
    bootDone() {
      boot.done = true;
    },
    phase: () => loaderPhase(gate),
  };
}
