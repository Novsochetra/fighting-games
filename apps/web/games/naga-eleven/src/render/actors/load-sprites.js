// in a browser an image loads into an <img>; a test passes its own loader
function loadImageElement(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`no sprite sheet at ${source}`));
    image.src = source;
  });
}

// loads each sheet the manifest names, once even when animations share one; an animation whose
// sheet fails is left out, and the player falls back to running or standing for it
export async function loadSprites(manifest, { loadImage = loadImageElement } = {}) {
  if (!manifest) {
    return null;
  }

  const animations = Object.entries(manifest.animations);
  const sources = [...new Set(animations.map(([, animation]) => animation.image))];
  const results = await Promise.allSettled(sources.map((source) => loadImage(source)));
  const loaded = new Map(
    results.flatMap((result, i) =>
      result.status === 'fulfilled' ? [[sources[i], result.value]] : [],
    ),
  );
  const kept = animations.filter(([, animation]) => loaded.has(animation.image));

  if (!kept.some(([name]) => name === 'idle' || name === 'run')) {
    return null;
  }

  return {
    manifest: { ...manifest, animations: Object.fromEntries(kept) },
    images: Object.fromEntries(
      kept.map(([name, animation]) => [name, loaded.get(animation.image)]),
    ),
  };
}
