// a tab left and come back to hands over one long frame; the run must not lose that time
const LONGEST_FRAME_MS = 100;

export function startLoop(window, step) {
  let last = null;

  function frame(now) {
    const ms = last === null ? 0 : Math.min(now - last, LONGEST_FRAME_MS);

    last = now;
    // asked for first, so a frame that throws costs that frame and not the game
    window.requestAnimationFrame(frame);
    step(ms);
  }

  window.requestAnimationFrame(frame);
}
