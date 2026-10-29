// the arrows over and under each letter turn it, for touch and the mouse; a tap on a letter picks it
export function installPostEvents({ root, menus, audio }) {
  root.addEventListener('click', (event) => {
    const stepper = event.target.closest('.initial-step');
    const letter = event.target.closest('.initial');

    if (!letter) {
      return;
    }

    menus.state.selected = Number(letter.dataset.slot);

    if (stepper) {
      menus.panels.post.step(Number(stepper.dataset.slot), Number(stepper.dataset.d));
    }

    menus.redraw('post');
    audio.sfx('ui');
  });
}
