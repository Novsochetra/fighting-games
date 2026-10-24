const ARCADE_ADDRESS = '../../';

function isArcadePage(referrer, arcade) {
  try {
    const from = new URL(referrer);
    const pages = [arcade.pathname, `${arcade.pathname}index.html`];
    return from.origin === arcade.origin && pages.includes(from.pathname);
  } catch {
    return false;
  }
}

// The arcade opens the game in the same tab, so the arcade is one step back in its history. Going
// back lets the browser restore the arcade as it was left, its card shrinking back in; loading it
// again started it over behind a loading notice and grew the history a step.
export function createArcadeExit({ location, history, referrer }) {
  const arcade = new URL(ARCADE_ADDRESS, location.href);
  return function leaveForArcade() {
    if (history.length > 1 && isArcadePage(referrer, arcade)) {
      history.back();
    } else {
      location.assign(ARCADE_ADDRESS);
    }
  };
}
