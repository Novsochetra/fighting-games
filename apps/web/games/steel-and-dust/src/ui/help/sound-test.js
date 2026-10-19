import { SOUND_TAKES } from '../../audio/index.js';

function takes(key, label) {
  return Array.from({ length: SOUND_TAKES[key] }, (_, i) => [`${label} ${i + 1}`, key, i]);
}

function soundButton([label, key, take]) {
  const takeAttribute = take === undefined ? '' : ` data-take="${take}"`;
  return `<button type="button" data-snd="${key}"${takeAttribute}>${label}</button>`;
}

function row(title, buttons) {
  return `<div class="group">${title}</div><div class="tabs">${buttons.map(soundButton).join('')}</div>`;
}

const SWINGS = [
  ['Fists', 'swingFists'],
  ['Sword', 'swingSword'],
  ['Spear', 'swingSpear'],
  ['Axe', 'swingAxe'],
  ['Fists heavy', 'swingFistsBig'],
  ['Sword heavy', 'swingSwordBig'],
  ['Spear heavy', 'swingSpearBig'],
  ['Axe heavy', 'swingAxeBig'],
];
const HITS = [
  ['Fists', 'blunt'],
  ['Sword', 'blade'],
  ['Spear', 'pierce'],
  ['Axe', 'heavy'],
  ['Fists big', 'bluntBig'],
  ['Sword big', 'bladeBig'],
  ['Spear big', 'pierceBig'],
  ['Axe big', 'heavyBig'],
  ['Shield', 'armor'],
];
const OTHER = [
  ['Jump', 'jump'],
  ['Land', 'land'],
  ['KO', 'ko'],
  ['Shockwave', 'boom'],
  ['Crate', 'break'],
  ['Weapon breaks', 'shatter'],
];

// every take has its own number, so a player can say which one they mean
export function soundTestHtml() {
  return [
    '<p class="wmeta">Every sound is made by the game itself, no recordings. Tap one to hear it.</p>',
    row('Raider screams', takes('voiceDie', 'Scream')),
    row('Raider grunts', takes('voiceHurt', 'Grunt')),
    row('Boss', [...takes('voiceBoss', 'Growl'), ['Roar', 'voiceBossKo', 0]]),
    row('Hero', takes('voiceHero', 'Hurt')),
    row('Dash', [...takes('dash', 'Dash'), ...takes('dashAir', 'Air dash')]),
    row('Swings', SWINGS),
    row('Hits', HITS),
    row('Other', OTHER),
  ].join('');
}
