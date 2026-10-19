import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pngSize } from './png-size.js';

const GAME_ROOT = fileURLToPath(new URL('../../', import.meta.url));

// loads at once when its source is set, so tests can draw sprites without a browser
export class FakeImage {
  constructor() {
    this.onload = null;
    this.width = 0;
    this.height = 0;
    this.name = '';
  }

  set src(value) {
    this.name = basename(value);
    Object.assign(this, pngSize(join(GAME_ROOT, value)));
    if (this.onload) {
      this.onload();
    }
  }

  recordingId() {
    return `img(${this.name})`;
  }
}
