import { layoutOf, pillsOffered, SKIN_IDS, SKINS } from '../../data/skins/skins.js';
import { shownControls, sizeOf, slotOf } from '../layout/layout-draft.js';
import { controlName, fillPreview } from '../layout/layout-markup.js';
import { PreviewControls } from '../layout/preview-controls.js';
import { drawPreviewShell, restPreviewStick } from '../layout/preview-pad.js';
import { fitTouchLayer } from '../screen/touch-area.js';
import { SkinBar } from './skin-bar.js';
import { SKINS_HTML } from './skin-markup.js';

export class SkinView {
  constructor({ document, layout }) {
    this.layout = layout;
    this.app = document.getElementById('app');
    this.section = document.getElementById('m-skins');
    this.section.innerHTML = SKINS_HTML;
    this.preview = this.section.querySelector('.skin-preview');
    this.shell = this.section.querySelector('.skin-shell');
    fillPreview(this.preview, document.getElementById('touch'));
    this.bar = new SkinBar(this.section.querySelector('.layout-bar'));
    this.controls = new PreviewControls({ preview: this.preview, app: this.app });
  }

  isOpen() {
    return this.section.classList.contains('open');
  }

  slot(skinId) {
    return slotOf(skinId, this.controls.orientation());
  }

  skinTools() {
    return [...this.section.querySelectorAll('.skin-tools button')];
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

  render({ skinId, keyShapes, draft, picked }, settings, from = 0) {
    const orientation = this.controls.orientation();
    const padLayout = layoutOf(skinId, orientation, keyShapes);
    const slot = slotOf(skinId, orientation);

    fitTouchLayer(this.preview, this.layout.touchArea());
    drawPreviewShell(this.shell, padLayout, this.layout.stageRect());
    const places = this.controls.draw(padLayout, draft[slot]);
    restPreviewStick(this.preview, { places, layout: this.layout, app: this.app });
    this.controls.mark(shownControls(padLayout, settings.stick), picked);
    this.section.classList.toggle('editing', Boolean(picked));
    this.showBar({ skinId, keyShapes, draft, slot, picked });
    this.bar.place(this.controls.rects(), picked);

    if (from) {
      this.slideIn(from);
    }
  }

  showBar({ skinId, keyShapes, draft, slot, picked }) {
    const pills = pillsOffered(skinId, this.controls.orientation());

    this.bar.showSkin({
      skin: SKINS[skinId],
      index: SKIN_IDS.indexOf(skinId),
      custom: Boolean(draft[slot]),
      offersPills: pills.length > 0,
    });

    if (picked) {
      this.bar.showControl({
        name: controlName(this.controls.controlFor(picked)),
        size: sizeOf(draft, slot, picked),
        shape: pills.includes(picked) ? (keyShapes[picked] ?? 'round') : null,
      });
    }
  }
}
