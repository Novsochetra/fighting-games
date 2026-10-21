// decode() also waits until the pixels are ready to paint, but older browsers lack it and some reject
// it for a file that still loads, so a rejection falls back to the load events; a file that fails
// settles all the same, so a broken image can never hold the loading screen up
export function loadImage(url, createImage) {
  const image = createImage();
  const loaded = new Promise((resolve) => {
    image.onload = resolve;
    image.onerror = resolve;
  });
  image.src = url;
  const decoded = typeof image.decode === 'function' ? image.decode().catch(() => loaded) : loaded;
  return decoded.then(() => image);
}

export function delay(ms, setTimer) {
  return new Promise((resolve) => setTimer(resolve, ms));
}

// resolves true once the promise settles either way, or false if the time runs out first
export function settleWithin(promise, ms, setTimer) {
  const settled = Promise.resolve(promise).then(
    () => true,
    () => true,
  );
  return Promise.race([settled, delay(ms, setTimer).then(() => false)]);
}

export function progressFraction(settled, total) {
  return total === 0 ? 1 : Math.min(1, settled / total);
}

// reports the share settled, failures included, each time one more settles
export function trackProgress(promises, onProgress) {
  let settled = 0;
  const count = () => {
    settled += 1;
    onProgress(progressFraction(settled, promises.length));
  };
  onProgress(progressFraction(0, promises.length));
  return Promise.all(promises.map((promise) => Promise.resolve(promise).then(count, count)));
}
