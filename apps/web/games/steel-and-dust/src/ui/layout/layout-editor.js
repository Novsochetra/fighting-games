import {
  customised,
  moveControl,
  nextControl,
  resetLayout,
  resizeControl,
  sizeOf,
} from './layout-draft.js';

const withShape = (keyShapes, control, shape) => {
  const others = Object.fromEntries(Object.entries(keyShapes).filter(([id]) => id !== control));

  return shape === 'pill' ? { ...others, [control]: 'pill' } : others;
};

export class LayoutEditor {
  constructor({ screen, audio }) {
    Object.assign(this, { screen, audio });
    this.controls = screen.view.controls;
  }

  get state() {
    return this.screen.state;
  }

  // the highlight moves onto the bar only as editing starts, so Enter on the name keeps on
  // stepping through the controls
  pick(control) {
    const starting = !this.state.picked;

    if (this.state.picked === control) {
      return;
    }

    this.state.picked = control;
    this.audio.sfx('ui');
    this.screen.render();

    if (starting) {
      this.screen.select(this.screen.view.bar.doneButton());
    }
  }

  pickNext() {
    this.pick(nextControl(this.state.picked, this.controls.shown));
  }

  unpick() {
    const control = this.state.picked;

    this.state.picked = null;
    this.screen.render();
    this.screen.select(this.controls.controlFor(control));
  }

  finish() {
    this.audio.sfx('uiBack');
    this.unpick();
  }

  // the first move or resize turns the skin's layout into a custom one, where the controls stand
  customise() {
    const slot = this.screen.slot();

    if (!this.state.draft[slot]) {
      this.state.draft = customised(this.state.draft, slot, this.controls.measureCentres());
    }

    return slot;
  }

  halfOf(slot, control) {
    return this.controls.halfOf(control, sizeOf(this.state.draft, slot, control));
  }

  moveTo(control, point) {
    const slot = this.customise();
    const half = this.halfOf(slot, control);
    const centre = this.controls.pointAt(point);

    this.state.draft = moveControl(this.state.draft, { slot, control, centre, half });
    this.screen.render();
  }

  resize(step) {
    const slot = this.customise();
    const control = this.state.picked;
    const half = this.halfOf(slot, control);

    this.state.draft = resizeControl(this.state.draft, { slot, control, step, half });
    this.audio.sfx('ui');
    this.screen.render();
  }

  shape(shape) {
    this.state.keyShapes = withShape(this.state.keyShapes, this.state.picked, shape);
    this.audio.sfx('ui');
    this.screen.render();
  }

  reset() {
    this.state.draft = resetLayout(this.state.draft, this.screen.slot());
    this.audio.sfx('ui');
    this.screen.render();
  }
}
