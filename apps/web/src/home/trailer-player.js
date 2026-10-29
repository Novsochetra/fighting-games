const playing = (video) => new Promise((resolve) => resolve(video.play()));

// what a browser says when it lets no sound play without a tap, unlike a play cut short by a pause
const isSoundRefused = (error) => error?.name === 'NotAllowedError';

// A trailer starts in the tap that asks for it, with sound, as a browser allows only then. A browser
// that still refuses sound, or a player who turned the arcade's sound off, gets it muted, which its
// controls undo; one that refuses even that leaves its play button to the player.
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

// Without its address the video neither plays on nor keeps downloading once the sheet lets it go.
export function stopTrailer(video) {
  video.pause();
  video.removeAttribute('src');
  video.load();
}

// the sheet's own breakpoint for a phone, where it rises from the bottom (sheet.css)
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

// The trailer's small copy, where it has one, on a phone, under a data saver or on a slow network,
// so a trailer never costs a player more data than its screen can show; the full one elsewhere.
export function trailerFor(card, window) {
  if (!card.trailerSmallSrc) {
    return card.trailerSrc;
  }

  const phone = window.matchMedia?.(PHONE_MEDIA).matches ?? false;

  return phone || isSparing(window) ? card.trailerSmallSrc : card.trailerSrc;
}
