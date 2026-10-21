import { stepHero } from '../menus/menu-navigation.js';

// how far a finger or the mouse moves across the carousel to turn it
const SWIPE_DISTANCE = 32;

// how far a click turns the carousel: the arrows one place, a side card to the middle; null lets
// the click through, so the middle card picks its hero
function clickTurn(target) {
  const arrow = target.closest('[data-step]');
  if (arrow) {
    return Number(arrow.dataset.step);
  }
  const card = target.closest('.hero-card');
  return card && card.dataset.depth !== '0' ? Number(card.dataset.slot) : null;
}

// the arrows, a side card and a swipe turn the carousel; the click that ends a mouse swipe is
// swallowed so it does not pick the card it ends on
export function installCarouselEvents({ stage, menus, audio }) {
  let swipe = { x: 0, done: false };
  stage.addEventListener('pointerdown', (event) => {
    swipe = { x: event.clientX, done: false };
  });
  stage.addEventListener('pointerup', (event) => {
    const distance = event.clientX - swipe.x;
    if (Math.abs(distance) >= SWIPE_DISTANCE) {
      swipe.done = true;
      stepHero(menus, distance < 0 ? 1 : -1, audio);
    }
  });
  stage.addEventListener('click', (event) => {
    const turn = swipe.done ? 0 : clickTurn(event.target);
    swipe.done = false;
    if (turn === null) {
      return;
    }
    event.stopPropagation();
    if (turn !== 0) {
      stepHero(menus, turn, audio);
    }
  });
}
