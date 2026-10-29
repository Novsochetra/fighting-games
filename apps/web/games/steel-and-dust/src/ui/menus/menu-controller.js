import { clamp } from '../../lib/math.js';
import { menuBackdrop } from './menu-backdrop.js';
import { navigableItems } from './menu-items.js';
import { createMenuRefreshers } from './menu-refresh.js';

// the credits roll over the clear menu as the last mission ends, and leave it to be read after
const MENUS_FOR_MODE = {
  title: ['title'],
  pause: ['pause'],
  over: ['over'],
  clear: ['clear', 'credits'],
};

// one base menu per mode; Settings and How to play stack on top of it
export class MenuController {
  constructor({ document, game, audio, ui, context, panels }) {
    Object.assign(this, { document, game, audio, ui, panels });
    this.state = { stack: [], selected: 0, mode: null, unseen: new Set() };
    this.refreshers = createMenuRefreshers({ document, game, context });
  }

  top() {
    return this.state.stack[this.state.stack.length - 1];
  }

  items() {
    return navigableItems(this.document, this.top());
  }

  isOpen() {
    return this.state.stack.length > 0;
  }

  // touch and mouse players get no keyboard highlight unless the list scrolls, but the hero
  // carousel turns to what is selected for every player
  highlight(scroll) {
    const items = this.items();
    this.state.selected = clamp(this.state.selected, 0, Math.max(0, items.length - 1));
    this.panels[this.top()]?.focus?.(this.state.selected);
    for (const node of this.document.querySelectorAll('#menus .sel')) {
      node.classList.remove('sel');
    }
    const { lastInput } = this.ui;
    if (lastInput === 'touch' || (lastInput === 'mouse' && !scroll)) {
      return;
    }
    const current = items[this.state.selected];
    current?.classList.add('sel');
    if (scroll) {
      current?.scrollIntoView({ block: 'nearest' });
    }
  }

  refresh() {
    this.refreshers[this.top()]?.();
  }

  // `entering` plays the menu's way in (the logo dropping in); coming back from a panel stacked on
  // it only fades it up again, or the title would bounce every time Settings closes. A base menu
  // that waited unseen under another (the clear menu under the credits) comes in the first time
  show(entering = false) {
    const arriving = this.state.unseen.delete(this.top()) || entering;

    for (const menu of this.document.querySelectorAll('#menus .menu')) {
      const open = menu.id === `m-${this.top()}`;
      menu.classList.toggle('open', open);
      menu.classList.toggle('enter', open && arriving);
    }

    Object.assign(this.document.getElementById('menus').dataset, menuBackdrop(this.state.stack));
    this.refresh();
    this.state.selected = this.panels[this.top()]?.firstSelected?.() ?? 0;
    this.highlight(false);
  }

  open(id) {
    this.panels[id].build();
    this.state.stack.push(id);
    this.show();
    this.audio.sfx('uiOk');
  }

  back() {
    if (this.state.stack.length > 1) {
      this.panels[this.top()]?.leave?.();
      this.state.stack.pop();
      this.show();
      this.audio.sfx('uiBack');
    } else if (this.state.stack[0] === 'pause') {
      this.game.mode = 'play';
      this.audio.sfx('uiBack');
    }
  }

  changeSetting(key, step, wrap) {
    if (!this.panels.settings.change(key, step, wrap)) {
      return;
    }
    const keep = this.state.selected;
    this.panels.settings.build();
    this.state.selected = keep;
    this.highlight(this.ui.usesButtons());
    if (!this.ui.usesButtons()) {
      this.items()[keep]?.classList.add('sel');
    }
  }

  // returns true when the mode changed, so the caller can show or hide the touch controls
  sync() {
    if (this.game.mode === this.state.mode) {
      return false;
    }
    this.state.mode = this.game.mode;
    this.state.stack = [...(MENUS_FOR_MODE[this.game.mode] ?? [])];
    this.state.unseen = new Set(this.state.stack.slice(0, -1));

    for (const id of this.state.stack) {
      this.panels[id]?.build();
    }

    this.show(true);
    return true;
  }
}
