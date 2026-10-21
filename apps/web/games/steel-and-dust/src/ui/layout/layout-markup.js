// the name of the picked button picks the next one, for a button hidden under the toolbar and for
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

// the preview copies the real stick, buttons and pause button, so it looks and sizes exactly like them
export function fillPreview(preview, touch) {
  for (const selector of ['.stick-base', '.btns', '.tb-pause']) {
    const copy = touch.querySelector(selector).cloneNode(true);
    for (const node of [copy, ...copy.querySelectorAll('[id]')]) {
      node.removeAttribute('id');
    }
    preview.append(copy);
  }
}

export function sizeLabel(size) {
  return `${Math.round(size * 100)}%`;
}
