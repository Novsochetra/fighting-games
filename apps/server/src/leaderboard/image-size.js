const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_START = 0xd8;
const JPEG_SCAN = 0xda;
const JPEG_END = 0xd9;
// the start-of-frame markers, which carry the size; C4, C8 and CC share the range but are not frames
const isFrameMarker = (marker) =>
  marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);

// a PNG's size is in its first chunk, which must be IHDR
export function pngSize(bytes) {
  const isPng =
    bytes.length >= 24 &&
    bytes.subarray(0, 8).equals(PNG_SIGNATURE) &&
    bytes.toString('latin1', 12, 16) === 'IHDR';

  return isPng ? { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) } : null;
}

function jpegFrameSize(bytes, at) {
  return at + 9 <= bytes.length
    ? { width: bytes.readUInt16BE(at + 7), height: bytes.readUInt16BE(at + 5) }
    : null;
}

export function jpegSize(bytes) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== JPEG_START) {
    return null;
  }

  let at = 2;

  while (at + 4 <= bytes.length && bytes[at] === 0xff) {
    const marker = bytes[at + 1];

    if (isFrameMarker(marker)) {
      return jpegFrameSize(bytes, at);
    }

    if (marker === JPEG_SCAN || marker === JPEG_END) {
      return null;
    }

    at += 2 + bytes.readUInt16BE(at + 2);
  }

  return null;
}
