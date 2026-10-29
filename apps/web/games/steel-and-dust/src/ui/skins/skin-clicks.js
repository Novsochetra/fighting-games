const EDIT_TOOLS = {
  next: (editor) => editor.pickNext(),
  smaller: (editor) => editor.resize(-1),
  bigger: (editor) => editor.resize(1),
  done: (editor) => editor.finish(),
};

// a press already picked the control a finger or the mouse is on (layout-drag.js); a click picks
// the one the keyboard or gamepad is on
const CLICKS = [
  ['[data-skin-step]', (picker, button) => picker.step(Number(button.dataset.skinStep))],
  ['[data-edit]', (picker, button) => EDIT_TOOLS[button.dataset.edit](picker.editor)],
  ['[data-key-shape]', (picker, button) => picker.editor.shape(button.dataset.keyShape)],
  ['.skin-preview [data-control]', (picker, key) => picker.editor.pick(key.dataset.control)],
  ['[data-skin="reset"]', (picker) => picker.editor.reset()],
  ['[data-skin="use"]', (picker) => picker.use()],
];

export function installSkinClicks(section, picker) {
  section.addEventListener('click', (event) => {
    for (const [selector, click] of CLICKS) {
      const target = event.target.closest(selector);

      if (target) {
        click(picker, target);
        return;
      }
    }
  });
}
