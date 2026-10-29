import { typedLetter } from '../../online/initials.js';

const isLetter = (item) => !!item?.classList.contains('initial');

function select(menus, index, audio) {
  const count = menus.items().length;

  menus.state.selected = Math.min(Math.max(index, 0), count - 1);
  menus.highlight(true);
  audio.sfx('ui');
}

function turnLetter(menus, { slot, step, audio }) {
  menus.panels.post.step(slot, step);
  menus.redraw('post');
  audio.sfx('ui');
}

// on a letter, up and down turn it, as on an arcade cabinet, and left, right and OK go from letter
// to letter and on to Post; anywhere else the menu moves as every menu does
export function navigatePost(menus, { kind, step, audio }) {
  const at = menus.state.selected;
  const current = menus.items()[at];

  if (menus.top() !== 'post' || !isLetter(current)) {
    return false;
  }

  const handlers = {
    move: () => turnLetter(menus, { slot: Number(current.dataset.slot), step: -step, audio }),
    adjust: () => select(menus, at + step, audio),
    ok: () => select(menus, at + 1, audio),
  };

  handlers[kind]?.();

  return kind in handlers;
}

// a keyboard can type the letters too, and Backspace steps back a letter
export function handlePostKey(event, { menus, audio, ui }) {
  const at = menus.state.selected;
  const current = menus.items()[at];
  const letter = typedLetter(event.code);
  const goesBack = event.code === 'Backspace' && at > 0;

  if (menus.top() !== 'post' || !isLetter(current) || (!letter && !goesBack)) {
    return false;
  }

  event.preventDefault();
  ui.noteInput('key');

  if (letter) {
    menus.panels.post.type(Number(current.dataset.slot), letter);
    menus.redraw('post');
  }

  select(menus, letter ? at + 1 : at - 1, audio);

  return true;
}
