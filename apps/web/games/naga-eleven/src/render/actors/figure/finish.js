import { codeOf, isPainted, materialOfCode, OUTLINE_CODE, shadeOfCode } from './buffer.js';

function neighboursOf({ width, height }, at) {
  const x = at % width;
  const y = Math.floor(at / width);

  return [
    x > 0 ? at - 1 : -1,
    x < width - 1 ? at + 1 : -1,
    y > 0 ? at - width : -1,
    y < height - 1 ? at + width : -1,
  ].filter((index) => index >= 0);
}

// where a nearer part crosses a further one (an arm over the shirt, a leg over the other), the
// further one darkens along the edge, as in its shadow, so the two read apart: deepest where the
// two are the same cloth and would otherwise run together
function edgeDarkening(buffer, at) {
  const { codes, parts } = buffer;
  const material = materialOfCode(codes[at]);
  const over = neighboursOf(buffer, at).filter(
    (next) => isPainted(codes[next]) && parts[next] > parts[at],
  );

  if (over.length === 0) {
    return 0;
  }

  return over.some((next) => materialOfCode(codes[next]) === material) ? 3 : 1;
}

function darkenEdges(buffer) {
  const shaded = buffer.codes.slice();

  buffer.codes.forEach((code, at) => {
    const darker = isPainted(code) ? edgeDarkening(buffer, at) : 0;

    if (darker > 0) {
      shaded[at] = codeOf(materialOfCode(code), Math.max(0, shadeOfCode(code) - darker));
    }
  });
  buffer.codes.set(shaded);
}

function outline(buffer) {
  const outlined = buffer.codes.slice();

  buffer.codes.forEach((code, at) => {
    if (code === 0 && neighboursOf(buffer, at).some((next) => buffer.codes[next] > 0)) {
      outlined[at] = OUTLINE_CODE;
    }
  });
  buffer.codes.set(outlined);
}

export function finishBuffer(buffer) {
  darkenEdges(buffer);
  outline(buffer);

  return buffer;
}
