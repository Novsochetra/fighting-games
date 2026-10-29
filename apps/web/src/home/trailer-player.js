const playing = (video) => new Promise((resolve) => resolve(video.play()));

// AbortError, from a pause cutting play() short, refuses no sound and must not mute the trailer
const isSoundRefused = (error) => error?.name === 'NotAllowedError';

export function startTrailer(video, { src, withSound }) {
  if (video.getAttribute('src') !== src) {
    video.src = src;
  }

  video.muted = !withSound;

  return playing(video)
    .catch((refusal) => {
      if (video.muted || !isSoundRefused(refusal)) {
        throw refusal;
      }

      video.muted = true;

      return playing(video);
    })
    .then(
      () => true,
      () => false,
    );
}

export function tapTrailer(video) {
  if (video.paused) {
    return playing(video).then(
      () => 'playing',
      () => 'paused',
    );
  }

  if (video.muted) {
    video.muted = false;

    return Promise.resolve('sound');
  }

  video.pause();

  return Promise.resolve('paused');
}

// pause() alone leaves the video downloading; dropping its address and loading stops that.
export function stopTrailer(video) {
  video.pause();
  video.removeAttribute('src');
  video.load();
}

// sheet.css's phone breakpoint
export const PHONE_MEDIA = '(max-width: 40rem)';
const SLOW_NETWORKS = new Set(['slow-2g', '2g', '3g']);
// Chrome's estimate of the connection in Mbps tops out at 10; below this the full copy stalls
const FULL_COPY_MBPS = 5;

function isSparing({ navigator }) {
  const connection = navigator?.connection;

  if (!connection) {
    return false;
  }

  const slow = connection.downlink !== undefined && connection.downlink < FULL_COPY_MBPS;

  return connection.saveData === true || SLOW_NETWORKS.has(connection.effectiveType) || slow;
}

export function trailerFor(card, window) {
  if (!card.trailerSmallSrc) {
    return card.trailerSrc;
  }

  const phone = window.matchMedia?.(PHONE_MEDIA).matches ?? false;

  return phone || isSparing(window) ? card.trailerSmallSrc : card.trailerSrc;
}
