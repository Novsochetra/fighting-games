const stampCanvases = (view) => [...view.painter.stamps.cache.values()];

// the calls that cut each stamp (text, HUD frames), which the screen's own log only lays down
export function stampCalls(view) {
  return stampCanvases(view).flatMap((canvas) => canvas.recording?.log ?? []);
}

// any image drawn on the screen but the painter's own stamps of text and frames
export function drawsArt(log, view) {
  const stamps = stampCanvases(view).map((canvas) => `drawImage(${canvas.recordingId()},`);
  return log.some(
    (call) => call.startsWith('drawImage(') && !stamps.some((stamp) => call.startsWith(stamp)),
  );
}
