import { bootArt } from '../ui/loading/boot-art.js';
import { loadFonts } from '../ui/loading/fonts.js';
import { createLoader } from '../ui/loading/loader.js';
import { loadImage, settleWithin, trackProgress } from '../ui/loading/preload.js';

// the fighters' sprites wait for the menu art so the title comes up fast, but never longer than
// spritesAfterMs; a request that stalls can hold the loading screen no longer than giveUpMs
export const BOOT_TIMING = { fontLimitMs: 3000, spritesAfterMs: 4000, giveUpMs: 15000 };

// the bar counts every menu image, the pixel font and the game's own start, which calls appReady
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
  const everything = trackProgress([...art, fonts, app], (fraction) =>
    loader.bootProgress(fraction, clock()),
  );
  settleWithin(everything, timing.giveUpMs, setTimer).then(() => loader.bootDone());
  return {
    loader,
    // the images stay referenced, so the browser keeps them at hand for the menus
    art,
    spritesMayStart: settleWithin(Promise.all(art), timing.spritesAfterMs, setTimer),
    appReady,
  };
}
