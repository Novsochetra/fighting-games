import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { WEB_ROOT } from '../../../server/src/paths.js';

// A JPEG keeps its size in its start-of-frame segment (SOF0 to SOF3), height before width.
export function jpegSize(bytes) {
  let offset = 2;
  while (offset + 8 < bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];
    if (marker >= 0xc0 && marker <= 0xc3) {
      return `${bytes.readUInt16BE(offset + 7)}x${bytes.readUInt16BE(offset + 5)}`;
    }
    offset += 2 + bytes.readUInt16BE(offset + 2);
  }
  return null;
}

// The size an <img> claims, so the page saves its place before it loads, and the size of the JPEG
// it names: an address under the arcade, as a screen gives it, or a path beside the page.
export async function claimedAndRealSize(img, pageFile) {
  const src = img.getAttribute('src');
  const file = URL.canParse(src)
    ? path.join(WEB_ROOT, decodeURIComponent(new URL(src).pathname))
    : path.resolve(path.dirname(pageFile), src);
  return {
    claimed: `${img.getAttribute('width')}x${img.getAttribute('height')}`,
    real: jpegSize(await readFile(file)),
  };
}
