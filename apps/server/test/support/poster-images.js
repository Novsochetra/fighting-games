// The smallest files that read as a PNG or a JPEG of a given size: their headers, and filler.
export function fakePng(width, height, filler = 64) {
  const header = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(header);
  header.writeUInt32BE(13, 8);
  header.write('IHDR', 12, 'latin1');
  header.writeUInt32BE(width, 16);
  header.writeUInt32BE(height, 20);
  return Buffer.concat([header, Buffer.alloc(filler)]);
}

export function fakeJpeg(width, height, filler = 64) {
  const app0 = Buffer.from([
    0xff,
    0xe0,
    0x00,
    0x10,
    ...Buffer.from('JFIF\0'),
    1,
    1,
    0,
    0,
    1,
    0,
    1,
    0,
    0,
  ]);
  const frame = Buffer.from([
    0xff, 0xc0, 0x00, 0x11, 8, 0, 0, 0, 0, 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1,
  ]);
  frame.writeUInt16BE(height, 5);
  frame.writeUInt16BE(width, 7);
  return Buffer.concat([Buffer.from([0xff, 0xd8]), app0, frame, Buffer.alloc(filler)]);
}

// a poster in every size the board keeps, as the game sends it
export const posterImages = (overrides = {}) => ({
  avatar: fakeJpeg(192, 192).toString('base64'),
  medium: fakeJpeg(640, 336).toString('base64'),
  large: fakePng(1200, 630).toString('base64'),
  ...overrides,
});
