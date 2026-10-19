import { createView } from '../../src/render/create-view.js';
import { renderFrame } from '../../src/render/render-frame.js';
import { digest } from './digest.js';
import { FakeImage } from './fake-image.js';
import { RecordingCanvas } from './recording-canvas.js';

function createCanvas(width, height) {
  const canvas = new RecordingCanvas();
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function createRecordedRenderer() {
  const screen = createCanvas(768, 432);
  const view = createView({
    context: screen.getContext('2d'),
    createCanvas,
    createImage: () => new FakeImage(),
    baseUrl: '',
  });
  const log = screen.recording.log;
  log.length = 0;
  return function recordFrame(game) {
    renderFrame(game, view);
    const frame = { calls: log.length, digest: digest(log) };
    log.length = 0;
    return frame;
  };
}
