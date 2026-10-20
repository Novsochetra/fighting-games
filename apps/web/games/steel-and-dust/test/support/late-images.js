import { createView } from '../../src/render/create-view.js';
import { FakeImage } from './fake-image.js';
import { RecordingCanvas } from './recording-canvas.js';

function createCanvas(width, height) {
  return Object.assign(new RecordingCanvas(), { width, height });
}

// images that wait until the test lets them load or fail, like a slow network, so frames can be
// drawn while a road is still on its way
export function createLateImages() {
  const waiting = [];
  class LateImage extends FakeImage {
    set src(value) {
      waiting.push({ image: this, src: value, load: () => (super.src = value) });
    }
  }
  return {
    createImage: () => new LateImage(),
    waiting: () => waiting.map(({ src }) => src),
    loadAll() {
      waiting.splice(0).forEach(({ load }) => load());
    },
    failAll() {
      waiting.splice(0).forEach(({ image }) => image.onerror?.());
    },
  };
}

export function createLateView() {
  const images = createLateImages();
  const screen = createCanvas(768, 432);
  const view = createView({
    context: screen.getContext('2d'),
    createCanvas,
    createImage: images.createImage,
    baseUrl: '',
  });
  return { view, images, log: screen.recording.log };
}
