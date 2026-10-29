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
