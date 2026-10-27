import { heroById } from '../../data/heroes.js';
import { creditedSupporters } from './supporter-list.js';

const MAKER = 'Nov Sochetra';
const INVITE = 'Chip in at the arcade and your name rolls here too';
const KHMER = /[\u1780-\u17ff\u19e0-\u19ff]/;

// a Khmer name is marked so, and the browser sets it in a Khmer font with the taller line it needs
function nameLine(text) {
  return KHMER.test(text) ? { kind: 'name', text, lang: 'km' } : { kind: 'name', text };
}

function anonymousLine(count, afterNames) {
  const supporters = count === 1 ? 'anonymous supporter' : 'anonymous supporters';

  return `${afterNames ? 'and ' : ''}${count} ${supporters}`;
}

function namedLines({ names, anonymous }) {
  const lines = names.map(nameLine);

  if (anonymous) {
    lines.push({ kind: 'note', text: anonymousLine(anonymous, names.length > 0) });
  }

  return lines;
}

// `gifts` is null when the list could not be read (offline, say), so the thanks go to everyone
function supporterLines(gifts) {
  if (!gifts) {
    return [
      { kind: 'note', text: 'Thank you to everyone who keeps the arcade free' },
      { kind: 'note', text: INVITE },
    ];
  }

  if (!gifts.length) {
    return [{ kind: 'note', text: 'Chip in at the arcade and yours is the first name here' }];
  }

  return [
    { kind: 'note', text: 'They keep every game free' },
    ...namedLines(creditedSupporters(gifts)),
    { kind: 'note', text: INVITE },
  ];
}

// what rolls up the screen once the last mission is clear, top to bottom; the finale stops in the
// middle of the screen
export function creditLines({ heroId, gifts }) {
  const hero = heroById(heroId);

  return [
    { kind: 'logo', text: 'Steel & Dust', sub: 'pixel brawler' },
    { kind: 'heading', text: 'Starring' },
    { kind: 'hero', text: hero.name, hero: hero.id },
    { kind: 'heading', text: 'Created by' },
    { kind: 'name', text: MAKER },
    { kind: 'heading', text: 'Supporters' },
    ...supporterLines(gifts),
    { kind: 'finale', text: 'Thank you for playing' },
  ];
}
