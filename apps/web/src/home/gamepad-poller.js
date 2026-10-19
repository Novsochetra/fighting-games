import { newlyPressed, readAllGamepads } from './gamepad.js';

// Polls only while a pad is connected, so phones without one do not run a frame loop.
export function createGamepadPoller({ getGamepads, requestFrame, onAction }) {
  let previous = new Set();
  let running = false;

  function tick() {
    const pads = Array.from(getGamepads() ?? []).filter(Boolean);
    if (pads.length === 0) {
      running = false;
      previous = new Set();
      return;
    }
    const current = readAllGamepads(pads);
    newlyPressed(previous, current).forEach((action) => onAction(action));
    previous = current;
    requestFrame(tick);
  }

  return {
    start() {
      if (!running) {
        running = true;
        requestFrame(tick);
      }
    },
    isRunning: () => running,
  };
}
