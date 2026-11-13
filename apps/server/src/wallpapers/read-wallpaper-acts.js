// the id a browser makes with crypto.randomUUID(), the one thing a like knows of who sent it
const VISITOR = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SHAPES = ['phone', 'desktop'];

const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

function readWallpaper(body, ids) {
  return isObject(body) && ids.has(body.wallpaper) ? body.wallpaper : null;
}

export function readLike(body, ids) {
  const wallpaper = readWallpaper(body, ids);

  if (!wallpaper) {
    return { error: 'There is no such wallpaper.' };
  }

  if (typeof body.visitor !== 'string' || !VISITOR.test(body.visitor)) {
    return { error: 'A like needs the visitor id this browser made.' };
  }

  if (typeof body.liked !== 'boolean') {
    return { error: 'Say whether the wallpaper is liked.' };
  }

  return { like: { wallpaper, visitor: body.visitor, liked: body.liked } };
}

export function readDownload(body, ids) {
  const wallpaper = readWallpaper(body, ids);

  if (!wallpaper) {
    return { error: 'There is no such wallpaper.' };
  }

  if (!SHAPES.includes(body.shape)) {
    return { error: 'A download is for a phone or a desktop.' };
  }

  return { download: { wallpaper, shape: body.shape } };
}
