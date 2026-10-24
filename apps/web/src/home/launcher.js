import { flyClose, flyOpen } from './launch-flight.js';
import { prefersReducedMotion, readLaunchTiming } from './motion-tokens.js';

// The page changes only once the card has filled the screen. Coming back, the browser restores this
// page from its back/forward cache with the screen still covered, and land() shrinks it into the card.
export function createLauncher({ document, home, findSource, navigate }) {
  let flight = null;

  async function launch({ index, card }) {
    if (flight) {
      return;
    }
    const source = findSource(index);
    if (source && !prefersReducedMotion(document.defaultView)) {
      flight = flyOpen({ document, source, home, timing: readLaunchTiming(document) });
    }
    if (flight) {
      await flight.done;
    }
    navigate(card.href);
  }

  function land() {
    if (!flight) {
      return Promise.resolve(false);
    }
    const current = flight;
    flight = null;
    return flyClose(current, { timing: readLaunchTiming(document) }).then(() => true);
  }

  return { launch, land, isFlying: () => flight !== null };
}
