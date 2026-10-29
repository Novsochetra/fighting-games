// the Skins screen's preview draws the skin's controls as the touch layer does, so they look and
// size exactly like them; the pause button is copied, to show what they have to be placed around
export function fillPreview(preview, touch) {
  const pause = touch.querySelector('.tb-pause').cloneNode(true);

  pause.removeAttribute('id');
  preview.append(pause);
}

const UNLABELLED = { stick: 'STICK', dpad: 'D-PAD' };

export function controlName(element) {
  return UNLABELLED[element.dataset.control] ?? element.textContent;
}

export function sizeLabel(size) {
  return `${Math.round(size * 100)}%`;
}
