// an absolute context time; when one frame runs several ticks, each tick's sounds keep their spacing
export function startTime(audio, wait) {
  return audio.context.currentTime + audio.tickOffset + wait;
}

export function vary(amount) {
  return 1 + (Math.random() * 2 - 1) * amount;
}
