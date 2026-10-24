// I sent it waits this long after the code shows, so a supporter opens their bank app and pays
// before they can say they did, instead of tapping straight through.
export const PAY_WAIT_SECONDS = 10;

export const SENT_LABEL = 'I sent it';

export const sentLabel = (secondsLeft) =>
  secondsLeft > 0 ? `${SENT_LABEL} (${secondsLeft})` : SENT_LABEL;

export function createPayWait({ button, seconds = PAY_WAIT_SECONDS }) {
  let timer = null;
  let left = 0;

  function show() {
    button.textContent = sentLabel(left);
    button.disabled = left > 0;
    button.classList.toggle('is-waiting', left > 0);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    left = 0;
    show();
  }

  function tick() {
    left -= 1;
    show();
    if (left <= 0) {
      stop();
    }
  }

  function start() {
    clearInterval(timer);
    left = seconds;
    show();
    timer = setInterval(tick, 1000);
  }

  return { start, stop, isWaiting: () => left > 0 };
}
