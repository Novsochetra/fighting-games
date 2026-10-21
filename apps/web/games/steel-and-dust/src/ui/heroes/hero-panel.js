import { HEROES } from '../../data/heroes.js';
import { styleOf } from '../../data/styles/index.js';
import { ultimateOf } from '../../data/ultimates/index.js';
import { turnCarousel } from './hero-carousel.js';

// a url() inside a custom property resolves against the stylesheet, so the page's folder is added here
function pageFolder(baseUri) {
  return baseUri.replace(/[^/]*([?#].*)?$/, '');
}

function heroCardHtml(hero, { picked, folder }) {
  const strip = (name) => `url(${folder}${hero.directory}hero_${name}.png)`;
  return `<button class="hero-card${picked ? ' picked' : ''}" data-act="hero-${hero.id}"
    data-hero="${hero.id}" style="--idle: ${strip('idle')}; --win: ${strip('win')}">
    <span class="hero-art" aria-hidden="true"></span>
    <span class="hero-info">
      <span class="hero-name">${hero.name}</span>
      <span class="hero-line">${hero.tagline}</span>
      <span class="hero-kit"><b>Style</b> ${styleOf(hero.id).name}</span>
      <span class="hero-kit"><b>Ult</b> ${ultimateOf(hero.id).name}</span>
    </span>
  </button>`;
}

// the heroes in a looping carousel, opening on the last one played; after a fall the same list asks
// which hero fights on
export function createHeroPanel({ list, game }) {
  let slots = null;
  return {
    build() {
      const folder = pageFolder(list.ownerDocument.baseURI);
      list.closest('.box').querySelector('h2').textContent =
        game.mode === 'over' ? 'Continue as' : 'Choose your hero';
      list.innerHTML = HEROES.map((hero) =>
        heroCardHtml(hero, { picked: hero.id === game.settings.hero, folder }),
      ).join('');
      slots = null;
    },
    firstSelected: () =>
      Math.max(
        0,
        HEROES.findIndex((hero) => hero.id === game.settings.hero),
      ),
    // Back is selected past the last card, and the carousel stays where it is
    focus(index) {
      if (index < HEROES.length) {
        slots = turnCarousel([...list.children], index, slots);
      }
    },
  };
}
