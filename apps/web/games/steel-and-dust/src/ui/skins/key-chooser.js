const CHOOSER_HTML = `<span class="key-chooser-name"></span>
  <span class="key-chooser-shapes">
    <button type="button" class="xbtn stone-btn" data-key-shape="round">Round</button>
    <button type="button" class="xbtn stone-btn" data-key-shape="pill">Pill</button>
  </span>`;

// how far the chooser stands off the key it is for, and in from the screen's edges, in px
const GAP = 8;

// where the chooser stands, in px of the screen: over the key where there is room under the bar
// (`ceiling`, its bottom), as on an upright phone, else under it, and never past an edge
export function chooserPlace({ key, size, screen, ceiling = 0 }) {
  const above = key.top - GAP - size.height;
  const below = Math.min(key.bottom + GAP, screen.height - GAP - size.height);
  const left = (key.left + key.right) / 2 - size.width / 2;

  return {
    left: Math.max(GAP, Math.min(left, screen.width - GAP - size.width)),
    top: above >= ceiling + GAP ? above : Math.max(GAP, below),
  };
}

// the chooser a key of the Skins screen's preview opens: Round or Pill for that key, the shape it
// has lit, beside it
export class KeyChooser {
  constructor({ document, section }) {
    this.section = section;
    this.root = document.createElement('div');
    this.root.className = 'key-chooser';
    this.root.hidden = true;
    this.root.setAttribute('role', 'group');
    this.root.innerHTML = CHOOSER_HTML;
    section.append(this.root);
    this.control = null;
  }

  isOpen() {
    return !this.root.hidden;
  }

  buttons() {
    return [...this.root.querySelectorAll('button')];
  }

  buttonFor(shape) {
    return this.buttons().find((button) => button.dataset.keyShape === shape);
  }

  open({ key, shape }) {
    const label = key.textContent.trim();

    this.control = key.dataset.control;
    this.root.querySelector('.key-chooser-name').textContent = label;
    this.root.setAttribute('aria-label', `The shape of ${label}`);

    for (const button of this.buttons()) {
      const lit = button.dataset.keyShape === shape;

      button.classList.toggle('on', lit);
      button.setAttribute('aria-pressed', String(lit));
    }

    this.root.hidden = false;
    this.place(key);
  }

  place(key) {
    const screen = this.section.getBoundingClientRect();
    const box = key.getBoundingClientRect();
    const bar = this.section.querySelector('.layout-bar').getBoundingClientRect();
    const { left, top } = chooserPlace({
      key: {
        left: box.left - screen.left,
        right: box.right - screen.left,
        top: box.top - screen.top,
        bottom: box.bottom - screen.top,
      },
      size: this.root.getBoundingClientRect(),
      screen,
      ceiling: bar.bottom - screen.top,
    });

    Object.assign(this.root.style, { left: `${left}px`, top: `${top}px` });
  }

  close() {
    this.root.hidden = true;
    this.control = null;
  }
}
