import { basename, join } from 'node:path';
import { pngSize } from './png-size.js';

// happy-dom swaps the global URL for one that ignores file: bases, so the path is joined by hand
const GAME_ROOT = join(import.meta.dirname, '../../');

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
