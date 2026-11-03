// each pixel of a figure frame holds a code: 0 for nothing, else a material and one of its four
// shades, the outline or an eye
export const MATERIALS = ['shirt', 'shorts', 'socks', 'trim', 'skin', 'hair', 'boots'];
export const OUTLINE_CODE = 1 + MATERIALS.length * 4;
export const EYE_CODE = OUTLINE_CODE + 1;

export const codeOf = (material, shade) => 1 + MATERIALS.indexOf(material) * 4 + shade;
export const materialOfCode = (code) => MATERIALS[Math.floor((code - 1) / 4)];
export const shadeOfCode = (code) => (code - 1) % 4;
export const isPainted = (code) => code > 0 && code < OUTLINE_CODE;

export function createBuffer(width, height, anchor) {
  return {
    width,
    height,
    anchor,
    codes: new Uint8Array(width * height),
    parts: new Int16Array(width * height).fill(-1),
  };
}

export function setPixel(buffer, { x, y, code, part }) {
  if (x < 0 || y < 0 || x >= buffer.width || y >= buffer.height) {
    return;
  }

  buffer.codes[y * buffer.width + x] = code;
  buffer.parts[y * buffer.width + x] = part;
}

// visits every pixel whose centre may fall in a box given in figure units about the anchor
export function eachPixelIn(buffer, box, visit) {
  const { anchor } = buffer;

  for (let y = Math.floor(box.top + anchor.y); y <= Math.ceil(box.bottom + anchor.y); y += 1) {
    for (let x = Math.floor(box.left + anchor.x); x <= Math.ceil(box.right + anchor.x); x += 1) {
      visit(x, y, { x: x + 0.5 - anchor.x, y: y + 0.5 - anchor.y });
    }
  }
}
