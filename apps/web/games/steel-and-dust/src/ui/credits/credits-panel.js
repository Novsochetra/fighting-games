import { creditLines } from './credit-lines.js';
import { rollPath } from './roll-path.js';

// the logo line wears the title's logo art
const CLASS_FOR_KIND = { logo: 'logo credits-logo' };

// a line's second part, and the link it ends on (the supporters page)
function subElement(document, { sub, link }) {
  const element = document.createElement('span');
  element.textContent = sub;

  if (link) {
    const anchor = document.createElement('a');
    anchor.href = link.href;
    anchor.textContent = link.text;
    element.append(' ', anchor);
  }

  return element;
}

// supporters type their own names, so every line goes in as text, never as markup
function lineElement(document, line) {
  const element = document.createElement(line.kind === 'heading' ? 'h3' : 'p');
  element.className = CLASS_FOR_KIND[line.kind] ?? `credits-${line.kind}`;
  element.textContent = line.text;

  if (line.sub) {
    element.append(subElement(document, line));
  }

  if (line.tier) {
    element.dataset.tier = line.tier;
  }

  if (line.hero) {
    element.style.setProperty('--hero-color', `var(--color-hero-${line.hero})`);
  }

  if (line.lang) {
    element.lang = line.lang;
  }

  return element;
}

function rollElement(document, lines) {
  const roll = document.createElement('div');
  roll.className = 'credits-roll';
  roll.append(...lines.map((line) => lineElement(document, line)));

  return roll;
}

// a new roll starts its animation from the top, once it knows how far its finale lies
function startRoll(rollWindow, roll) {
  const finale = roll.querySelector('.credits-finale');
  const path = rollPath({
    windowHeight: rollWindow.clientHeight,
    finaleCenter: finale.offsetTop + finale.offsetHeight / 2,
  });

  roll.style.setProperty('--roll-from', `${path.from}px`);
  roll.style.setProperty('--roll-to', `${path.to}px`);
  roll.style.setProperty('--duration-roll', `${path.seconds}s`);
  roll.classList.add('rolling');
}

// the credits roll up over the last road, the supporters' names among them, each time they open
export function createCreditsPanel({ root, game, feed }) {
  const rollWindow = root.querySelector('.credits-window');

  return {
    build() {
      const lines = creditLines({ heroId: game.settings.hero, gifts: feed.gifts });
      const roll = rollElement(root.ownerDocument, lines);

      rollWindow.replaceChildren(roll);
      rollWindow.scrollTop = 0;
      startRoll(rollWindow, roll);
    },
  };
}

// the finale holds in the middle a moment, then the clear menu comes; a roll skipped meanwhile, or
// one ending under a panel opened since, leaves the menus as they are
export function installCreditsEnd({ root, menus }) {
  root.addEventListener('animationend', (event) => {
    if (event.target.classList.contains('credits-finale') && menus.top() === 'credits') {
      menus.back();
    }
  });
}
