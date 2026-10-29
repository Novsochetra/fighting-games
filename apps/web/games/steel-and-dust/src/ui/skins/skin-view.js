import { layoutOf, offersKeyShapes, SKIN_IDS, SKINS } from '../../data/skins/skins.js';
import { orientationOf, savedEntries, slotOf } from '../layout/layout-draft.js';
import { fillPreview } from '../layout/layout-markup.js';
import { drawPreviewPad, drawPreviewShell, restPreviewStick } from '../layout/preview-pad.js';
import { fitTouchLayer } from '../screen/touch-area.js';

// Use also carries data-act="back": the picker's own click listener picks the skin first, then the
// menus' listener further up closes the screen the way Cancel does
const SKINS_HTML = `<div class="skin-shell" aria-hidden="true"></div>
  <div class="skin-preview" aria-hidden="true"></div>
  <div class="layout-bar" role="toolbar" aria-label="Skins">
    <div class="layout-tools">
      <span class="layout-group">
        <button type="button" class="layout-step stone-btn" data-skin-step="-1" aria-label="Previous skin">‹</button>
        <span class="skin-title">
          <span class="skin-name"></span>
          <span class="skin-dots" aria-hidden="true">${SKIN_IDS.map(() => '<i></i>').join('')}</span>
        </span>
        <button type="button" class="layout-step stone-btn" data-skin-step="1" aria-label="Next skin">›</button>
      </span>
      <span class="layout-group">
        <button type="button" class="xbtn stone-btn" data-act="back">Cancel</button>
        <button type="button" class="xbtn stone-btn" data-skin="use" data-act="back">Use</button>
      </span>
    </div>
    <p class="layout-hint skin-about"></p>
    <p class="skin-shape" hidden>
      <button type="button" class="xbtn stone-btn" data-skin-shape></button>
    </p>
  </div>`;

const SHAPE_LABELS = { round: 'Round keys', pill: 'Pill keys' };
const SHAPE_NAMES = {
  round: 'DASH and ULT are round keys; switch to pills',
  pill: 'DASH and ULT are pills; switch to round keys',
};

// the skins screen: a copy of the touch layer with the skin looked at standing as it will, and the
// bar to step through the skins
export class SkinView {
  constructor({ document, layout }) {
    this.layout = layout;
    this.app = document.getElementById('app');
    this.section = document.getElementById('m-skins');
    this.section.innerHTML = SKINS_HTML;
    this.preview = this.section.querySelector('.skin-preview');
    this.shell = this.section.querySelector('.skin-shell');
    fillPreview(this.preview, document.getElementById('touch'));
    this.bar = this.section.querySelector('.layout-bar');
  }

  isOpen() {
    return this.section.classList.contains('open');
  }

  // the controls come in from the side the skin came from: `from` is 1 for the next skin, -1 for
  // the one before. Two classes take turns, so a quick second step plays it afresh
  slideIn(from) {
    const pad = this.preview.querySelector('.pad');
    const slide = pad.classList.contains('slide-a') ? 'slide-b' : 'slide-a';

    pad.classList.remove('slide-a', 'slide-b');
    pad.style.setProperty('--skin-slide-from', `${from * 32}px`);
    pad.classList.add(slide);
  }

  // a skin that offers its shoulder keys as pills shows which they are, and switches them
  renderShape(skinId, keyShape) {
    const row = this.bar.querySelector('.skin-shape');
    const button = row.querySelector('button');

    row.hidden = !offersKeyShapes(skinId);
    button.textContent = SHAPE_LABELS[keyShape];
    button.setAttribute('aria-label', SHAPE_NAMES[keyShape]);
  }

  // held the way the phone is, at the player's Button size and opacity, and where the player put
  // the controls of this skin, if they did
  render({ skinId, keyShape }, settings, from = 0) {
    const skin = SKINS[skinId];
    const orientation = orientationOf(this.app.clientWidth, this.app.clientHeight);
    const custom = savedEntries(settings.buttonLayout, slotOf(skinId, orientation));
    const padLayout = layoutOf(skinId, orientation, keyShape);

    fitTouchLayer(this.preview, this.layout.touchArea());
    drawPreviewShell(this.shell, padLayout, this.layout.stageRect());
    const places = drawPreviewPad(this.preview, padLayout, custom);
    restPreviewStick(this.preview, { places, layout: this.layout, app: this.app, settings });
    this.renderShape(skinId, keyShape);
    this.bar.querySelector('.skin-name').textContent = skin.name;
    this.bar.querySelector('.skin-about').textContent = skin.about;
    this.bar.querySelectorAll('.skin-dots i').forEach((dot, i) => {
      dot.classList.toggle('on', SKIN_IDS[i] === skinId);
    });

    if (from) {
      this.slideIn(from);
    }
  }
}
