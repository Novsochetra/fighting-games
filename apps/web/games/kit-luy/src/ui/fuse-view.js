import { TUNING } from '../data/tuning.js';

const HURRY_SECONDS = 3;

// The fuse burns with the run's own patience, each frame. It answers with the second just reached
// when one of the last few is, so the page can tick it.
export function createFuseView({ fuse, fuseLeft, fuseSpark }) {
  let lastSecond = null;

  return {
    show({ left, total }) {
      const share = total > 0 && Number.isFinite(total) ? left / total : 1;
      const second = Math.ceil(left / 1000);
      const hurry = share < TUNING.speedShares.great;

      fuseLeft.style.transform = `scaleX(${share})`;
      fuseSpark.style.transform = `translateX(${share * fuse.clientWidth}px)`;
      fuse.classList.toggle('is-hurry', hurry);

      if (second === lastSecond) {
        return null;
      }

      lastSecond = second;

      return second > 0 && second <= HURRY_SECONDS ? second : null;
    },

    isHurry: () => fuse.classList.contains('is-hurry'),
  };
}
