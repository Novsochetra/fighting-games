import { flyClose, flyOpen } from './launch-flight.js';
import { prefersReducedMotion, readLaunchTiming } from './motion-tokens.js';

// The page changes only once the icon has filled the screen. Coming back, the browser restores this
// page from its back/forward cache with the screen still covered, and land() shrinks it into the icon.
export function createLauncher({ document, home, findLink, navigate }) {
  let flight = null;

  async function launch({ index, card }) {
    if (flight) {
      return;
    }
    const link = findLink(index);
    if (link && !prefersReducedMotion(document.defaultView)) {
      flight = flyOpen({ document, link, home, timing: readLaunchTiming(document) });
    }
    if (flight) {
      await flight.done;
    }
    navigate(card.href);
  }

  function land() {
    if (!flight) {
      return Promise.resolve();
    }
    const current = flight;
    flight = null;
    return flyClose(current, { timing: readLaunchTiming(document) });
  }

  return { launch, land, isFlying: () => flight !== null };
}
