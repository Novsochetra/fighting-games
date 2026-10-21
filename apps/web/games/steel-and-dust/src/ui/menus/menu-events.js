import { isCenterCard, isHeroCard } from './menu-items.js';

// a side hero card turns the carousel only when clicked, or it would slide out from under the mouse
function hoverSelects(item) {
  return item && (!isHeroCard(item) || isCenterCard(item));
}

// clicks and mouse hover on the menus, and the panels' own buttons
export function installMenuEvents({ document, menus, act, ui, panels, audio }) {
  const root = document.getElementById('menus');
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-act]');
    if (button) {
      act(button.dataset.act);
    }
  });
  root.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') {
      return;
    }
    const items = menus.items();
    const index = items.findIndex((item) => item.contains(event.target));
    if (hoverSelects(items[index]) && index !== menus.state.selected) {
      menus.state.selected = index;
      ui.noteInput('mouse');
      menus.highlight(false);
      items[index].classList.add('sel');
    }
  });
  document.getElementById('settingsList').addEventListener('click', (event) => {
    const stepper = event.target.closest('button[data-d]');
    if (stepper) {
      const row = stepper.closest('.setrow');
      menus.state.selected = menus.items().indexOf(row);
      menus.changeSetting(row.dataset.k, Number(stepper.dataset.d), false);
    }
  });
  document
    .getElementById('m-help')
    .addEventListener('click', (event) => handleHelpClick(event, { menus, panels, audio }));
}

function rebuildHelp(menus, panels) {
  const keep = menus.state.selected;
  panels.help.build();
  menus.state.selected = keep;
  menus.highlight(false);
}

function handleHelpClick(event, { menus, panels, audio }) {
  const tab = event.target.closest('[data-tab]');
  const weapon = event.target.closest('[data-w]');
  const sound = event.target.closest('[data-snd]');
  if (tab) {
    panels.help.state.tab = tab.dataset.tab;
    rebuildHelp(menus, panels);
  } else if (weapon) {
    panels.help.state.weapon = weapon.dataset.w;
    rebuildHelp(menus, panels);
  } else if (sound) {
    audio.unlock();
    const take = sound.dataset.take === undefined ? undefined : Number(sound.dataset.take);
    audio.sfx(sound.dataset.snd, false, { take });
  }
}
