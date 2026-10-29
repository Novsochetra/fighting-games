// the name of the picked control picks the next one, for a control hidden under the toolbar and for
// keys and gamepads; Done also carries data-act="back": the editor's own click listener saves first,
// then the menus' listener further up closes the editor the same way Cancel does
export const EDITOR_HTML = `<div class="layout-preview" aria-hidden="true"></div>
  <div class="layout-bar" role="toolbar" aria-label="Button layout">
    <div class="layout-tools">
      <span class="layout-group">
        <button type="button" class="layout-name xbtn stone-btn" data-edit="next"></button>
        <button type="button" class="layout-step stone-btn" data-edit="smaller" aria-label="Smaller">-</button>
        <span class="layout-size"></span>
        <button type="button" class="layout-step stone-btn" data-edit="bigger" aria-label="Bigger">+</button>
      </span>
      <span class="layout-group">
        <button type="button" class="xbtn stone-btn" data-edit="reset">Reset</button>
        <button type="button" class="xbtn stone-btn" data-act="back">Cancel</button>
        <button type="button" class="xbtn stone-btn" data-edit="done" data-act="back">Done</button>
      </span>
    </div>
    <p class="layout-hint">Drag to move, tap to pick</p>
  </div>`;

// the preview draws the skin's controls as the touch layer does (LayoutView), so they look and size
// exactly like them; the pause button is copied, to show what they have to be placed around
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
