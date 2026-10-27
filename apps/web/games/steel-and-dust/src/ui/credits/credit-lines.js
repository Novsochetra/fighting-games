import { heroById } from '../../data/heroes.js';
import { creditedSupporters } from './supporter-list.js';

const MAKER = 'Nov Sochetra';
// written out for the player to read and visit; nothing loads from it
const ARCADE_SITE = 'khmerarcade.games';
const KHMER = /[ក-៿᧠-᧿]/;

// how a player's name gets into these credits, in plain words: a gift on the arcade
function inviteLine(text) {
  return { kind: 'invite', text, sub: `Support the arcade at ${ARCADE_SITE}` };
}

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
      inviteLine('Want your name here?'),
    ];
  }

  if (!gifts.length) {
    return [{ kind: 'note', text: 'No supporters yet' }, inviteLine('Be the first name here')];
  }

  return [
    { kind: 'note', text: 'They keep every game free' },
    ...namedLines(creditedSupporters(gifts)),
    inviteLine('Want your name here?'),
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
