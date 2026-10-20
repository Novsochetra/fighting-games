import { HEROES } from '../../data/heroes.js';

// a url() inside a custom property resolves against the stylesheet, so the page's folder is added here
function pageFolder(baseUri) {
  return baseUri.replace(/[^/]*([?#].*)?$/, '');
}

function heroCardHtml(hero, { picked, folder }) {
  const strip = (name) => `url(${folder}${hero.directory}hero_${name}.png)`;
  return `<button class="mbtn hero-card${picked ? ' picked' : ''}" data-act="hero-${hero.id}"
    data-hero="${hero.id}" style="--idle: ${strip('idle')}; --win: ${strip('win')}">
    <span class="hero-art" aria-hidden="true"></span>
    <span class="hero-name">${hero.name}</span>
    <span class="hero-line">${hero.tagline}</span>
  </button>`;
}

// the four Shades, the last one played marked
export function createHeroPanel({ list, game }) {
  return {
    build() {
      const folder = pageFolder(list.ownerDocument.baseURI);
      list.innerHTML = HEROES.map((hero) =>
        heroCardHtml(hero, { picked: hero.id === game.settings.hero, folder }),
      ).join('');
    },
  };
}
