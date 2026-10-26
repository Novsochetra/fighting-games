import { newlyPressed, readAllGamepads } from './gamepad.js';

// Polls only while a pad is connected, so phones without one do not run a frame loop.
export function createGamepadPoller({ getGamepads, requestFrame, onAction }) {
  let previous = new Set();
  let running = false;
  let stopped = false;

  function tick() {
    if (stopped) {
      running = false;
      return;
    }
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
      stopped = false;
      if (!running) {
        running = true;
        requestFrame(tick);
      }
    },
    // the arcade's screen going away stops the loop at its next frame
    stop() {
      stopped = true;
    },
    isRunning: () => running,
  };
}
