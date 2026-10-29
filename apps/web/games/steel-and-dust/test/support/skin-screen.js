// happy-dom lays nothing out, so the Skins screen's copy of the touch layer and its controls get
// the rects of an 800x400 screen, where each original control stands at [centre x, centre y, size]
export const LAYER = { left: 0, top: 0, width: 800, height: 400 };
export const ORIGINAL = {
  light: [720, 320, 96],
  heavy: [620, 340, 78],
  jump: [740, 200, 76],
  dash: [640, 210, 62],
  ult: [560, 250, 56],
  stick: [90, 300, 128],
};

export function stubRect(element) {
  if (element.classList.contains('skin-preview')) {
    return LAYER;
  }
  const spot = element.closest('#m-skins') && ORIGINAL[element.dataset.control];
  if (!spot) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }
  const [x, y, size] = spot;
  return { left: x - size / 2, top: y - size / 2, width: size, height: size };
}

export const screen = () => document.getElementById('m-skins');
export const copy = (control) =>
  screen().querySelector(`.skin-preview [data-control="${control}"]`);
export const real = (control) => document.querySelector(`#touch [data-control="${control}"]`);
export const tool = (name) => screen().querySelector(`[data-edit="${name}"]`);
export const skinButton = (name) => screen().querySelector(`[data-skin="${name}"]`);
export const cancel = () => screen().querySelector('[data-act="back"]:not([data-skin])');
export const editing = () => screen().classList.contains('editing');
export const placed = (root) =>
  root.querySelector('.pad-controls').classList.contains('pad-placed');
export const toolbarText = () =>
  ['.layout-name', '.layout-size'].map((part) => screen().querySelector(part).textContent);

export function pointer(target, type, x, y) {
  target.dispatchEvent(
    new PointerEvent(type, { bubbles: true, pointerId: 7, clientX: x, clientY: y }),
  );
}

export function drag(action, to) {
  const [x, y] = ORIGINAL[action];
  pointer(copy(action), 'pointerdown', x, y);
  pointer(copy(action), 'pointermove', (x + to.x) / 2, (y + to.y) / 2);
  pointer(copy(action), 'pointermove', to.x, to.y);
  pointer(copy(action), 'pointerup', to.x, to.y);
}

export function press(action) {
  const [x, y] = ORIGINAL[action];
  pointer(copy(action), 'pointerdown', x, y);
  pointer(copy(action), 'pointerup', x, y);
}

export function tapBeside() {
  pointer(screen(), 'pointerdown', 400, 120);
  pointer(screen(), 'pointerup', 400, 120);
}

// the page reads which way the phone is held from the app's size
export function holdPhone(width, height) {
  const app = document.getElementById('app');
  Object.defineProperties(app, {
    clientWidth: { value: width, configurable: true },
    clientHeight: { value: height, configurable: true },
  });
  window.dispatchEvent(new Event('resize'));
}

// the real stick, which rests on every fit, as main.js has it
export const realStick = () => ({
  zone: document.querySelector('#touch .pad-zone'),
  base: real('stick'),
});
