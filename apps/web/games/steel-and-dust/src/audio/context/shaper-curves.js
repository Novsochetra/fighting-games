// a soft clip that only touches peaks above 0.8: the music alone passes untouched
export function softClipCurve() {
  const length = 2049;
  const curve = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const x = (i / (length - 1)) * 2 - 1;
    const size = Math.abs(x);
    curve[i] = size < 0.8 ? x : Math.sign(x) * (0.8 + 0.2 * Math.tanh((size - 0.8) / 0.2));
  }
  return curve;
}

// the gritty saturation behind live crunch layers
export function crunchCurve() {
  const curve = new Float32Array(1024);
  for (let i = 0; i < 1024; i++) {
    const x = i / 511.5 - 1;
    curve[i] = Math.tanh(x * 3.2);
  }
  return curve;
}
