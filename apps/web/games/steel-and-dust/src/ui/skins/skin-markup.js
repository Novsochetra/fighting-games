import { SKIN_IDS } from '../../data/skins/skins.js';

// Use also carries data-act="back": the picker's own click listener saves first, then the menus'
// listener further up closes the screen the way Cancel does. The bar holds the skins' tools and,
// while a control is edited (`#m-skins.editing`), that control's instead
export const SKINS_HTML = `<div class="skin-shell" aria-hidden="true"></div>
  <div class="skin-preview" aria-hidden="true"></div>
  <div class="layout-bar" role="toolbar" aria-label="Skins">
    <div class="layout-tools skin-tools">
      <span class="layout-group">
        <button type="button" class="layout-step stone-btn" data-skin-step="-1" aria-label="Previous skin">‹</button>
        <span class="skin-title">
          <span class="skin-name"></span>
          <span class="skin-dots" aria-hidden="true">${SKIN_IDS.map(() => '<i></i>').join('')}</span>
        </span>
        <button type="button" class="layout-step stone-btn" data-skin-step="1" aria-label="Next skin">›</button>
      </span>
      <span class="layout-group">
        <button type="button" class="xbtn stone-btn" data-skin="reset" aria-label="Reset this skin’s layout">Reset</button>
        <button type="button" class="xbtn stone-btn" data-act="back">Cancel</button>
        <button type="button" class="xbtn stone-btn" data-skin="use" data-act="back">Use</button>
      </span>
    </div>
    <div class="layout-tools edit-tools">
      <span class="layout-group">
        <button type="button" class="layout-name xbtn stone-btn" data-edit="next"></button>
        <button type="button" class="layout-step stone-btn" data-edit="smaller" aria-label="Smaller">-</button>
        <span class="layout-size"></span>
        <button type="button" class="layout-step stone-btn" data-edit="bigger" aria-label="Bigger">+</button>
      </span>
      <span class="layout-group edit-shape">
        <button type="button" class="xbtn stone-btn" data-key-shape="round">Round</button>
        <button type="button" class="xbtn stone-btn" data-key-shape="pill">Pill</button>
      </span>
      <span class="layout-group">
        <button type="button" class="xbtn stone-btn" data-edit="done">Done</button>
      </span>
    </div>
    <p class="layout-hint skin-about"></p>
    <p class="layout-hint skin-help"></p>
  </div>`;

// a skin that offers pills says so, its Round and Pill only showing once a key is picked
export const browseHint = (offersPills) =>
  offersPills
    ? 'Tap a control to move, resize or reshape it'
    : 'Tap a control to move or resize it';

export const EDIT_HINT = 'Drag it to move it, and tap beside the controls when done';
