import { readFile } from 'node:fs/promises';
import path from 'node:path';

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
// it names, found beside the page that holds it.
export async function claimedAndRealSize(img, pageFile) {
  const file = path.resolve(path.dirname(pageFile), img.getAttribute('src'));
  return {
    claimed: `${img.getAttribute('width')}x${img.getAttribute('height')}`,
    real: jpegSize(await readFile(file)),
  };
}
