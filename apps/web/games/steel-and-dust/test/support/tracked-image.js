import { FakeImage } from './fake-image.js';

// a FakeImage that keeps the path it was given, for tests of what a loader asks for
export class TrackedImage extends FakeImage {
  set src(value) {
    this.path = value;
    super.src = value;
  }
}
