import { bootArt } from '../ui/loading/boot-art.js';
import { loadFonts } from '../ui/loading/fonts.js';
import { createLoader } from '../ui/loading/loader.js';
import { waitForOffline } from '../ui/loading/offline-wait.js';
import { loadImage, settleWithin, trackProgress } from '../ui/loading/preload.js';

// the fighters' sprites wait for the menu art so the title comes up fast, but never longer than
// spritesAfterMs; a request that stalls can hold the loading screen no longer than giveUpMs, and
// the download for offline no longer than offlineStallMs without a file coming in
export const BOOT_TIMING = {
  fontLimitMs: 3000,
  spritesAfterMs: 4000,
  giveUpMs: 15000,
  offlineStallMs: 15000,
};

// the arcade's download of the whole game, so its first play ends with the game kept for offline;
// it is far the longer wait, so the bar shows whichever of the two is behind
function keepForOffline(window, timing, onProgress) {
  return waitForOffline({
    fetch: window.fetch && ((url, init) => window.fetch(url, init)),
    setTimer: (callback, ms) => window.setTimeout(callback, ms),
    now: () => window.performance.now(),
    onProgress,
    stallMs: timing.offlineStallMs,
  });
}

// the bar counts every menu image, the pixel font, the game's own start, which calls appReady, and
// the arcade keeping the game for offline
export function startLoading(window, timing = BOOT_TIMING) {
  const setTimer = (resolve, ms) => window.setTimeout(resolve, ms);
  const clock = () => window.performance.now();
  const loader = createLoader(window.document.getElementById('loader'), clock());
  const art = bootArt().map((url) => loadImage(url, () => new window.Image()));
  const fonts = settleWithin(loadFonts(window.document.fonts), timing.fontLimitMs, setTimer);
  fonts.then(loader.showWords);
  let appReady = null;
  const app = new Promise((resolve) => {
    appReady = resolve;
  });
  const shares = { boot: 0, offline: 0 };
  const showShares = () => loader.bootProgress(Math.min(shares.boot, shares.offline), clock());
  const everything = trackProgress([...art, fonts, app], (fraction) => {
    shares.boot = fraction;
    showShares();
  });
  const offline = keepForOffline(window, timing, (fraction) => {
    shares.offline = fraction;
    showShares();
  });
  Promise.all([settleWithin(everything, timing.giveUpMs, setTimer), offline]).then(() =>
    loader.bootDone(),
  );
  return {
    loader,
    // the images stay referenced, so the browser keeps them at hand for the menus
    art,
    spritesMayStart: settleWithin(Promise.all(art), timing.spritesAfterMs, setTimer),
    appReady,
  };
}
