// the hero select's art: the side cards' idle loop and the middle card's; a Shade's are the sword
// row of its own idle and win strips, cut out by tools/pack_hero_strips.py (`cutFrom`), so the menu
// loads one row of each, and the Khmer fighters' are drawn for their cards (tools/hero_cards)
const shadeCards = (folder) => ({
  side: `${folder}card_idle.png`,
  middle: `${folder}card_win.png`,
  cutFrom: { side: 'idle', middle: 'win' },
});
const drawnCards = (folder) => ({
  side: `${folder}card_idle.png`,
  middle: `${folder}card_pose.png`,
});

// the heroes the player can pick, five Shades and two Khmer fighters, Bokator and the Angkor Warrior;
// each has its own sprite set and effect colors, a fighting style (data/styles/) and an ultimate
// (data/ultimates/); the Moss, Firefly, Antler Spirit and Blue Shades' ultimate is dressed in their
// element by the same bake as their other strips, so it is drawn from their arsenal too; Bokator
// fights his bare-handed from his own strips, so he has no ultimate strip; `weapon` is the hero's
// own, in hand from the start and never broken: the Shades' sword, the Khmer fighters' fists
export const HEROES = [
  {
    id: 'moss',
    name: 'Moss Shade',
    tagline: 'Patient blade of the old grove',
    weapon: 'sword',
    directory: 'assets/sprites/hero/arsenal/',
    ultStrip: 'assets/sprites/hero/arsenal/hero_ult.png',
    cards: shadeCards('assets/sprites/hero/'),
  },
  {
    id: 'firefly',
    name: 'Firefly Shade',
    tagline: 'Fights in a swarm of sparks',
    weapon: 'sword',
    directory: 'assets/sprites/heroes/firefly/arsenal/',
    ultStrip: 'assets/sprites/heroes/firefly/arsenal/hero_ult.png',
    cards: shadeCards('assets/sprites/heroes/firefly/'),
  },
  {
    id: 'antler',
    name: 'Antler Spirit Shade',
    tagline: 'Horned ghost of the dunes',
    weapon: 'sword',
    directory: 'assets/sprites/heroes/antler/arsenal/',
    ultStrip: 'assets/sprites/heroes/antler/arsenal/hero_ult.png',
    cards: shadeCards('assets/sprites/heroes/antler/'),
  },
  {
    id: 'blue',
    name: 'Blue Shade',
    tagline: 'Cold steel, no shadow',
    weapon: 'sword',
    directory: 'assets/sprites/heroes/blue/arsenal/',
    ultStrip: 'assets/sprites/heroes/blue/arsenal/hero_ult.png',
    cards: shadeCards('assets/sprites/heroes/blue/'),
  },
  {
    id: 'ember',
    name: 'Ember Shade',
    tagline: 'Walked out of the burning woods',
    weapon: 'sword',
    directory: 'assets/sprites/heroes/ember/arsenal/',
    ultStrip: 'assets/sprites/heroes/ember/hero_ult.png',
    cards: shadeCards('assets/sprites/heroes/ember/'),
  },
  {
    id: 'bokator',
    name: 'Bokator',
    tagline: 'Pounds the lion, as Angkor taught',
    weapon: 'fists',
    directory: 'assets/sprites/heroes/bokator/arsenal/',
    ultStrip: null,
    cards: drawnCards('assets/sprites/heroes/bokator/'),
  },
  {
    id: 'angkor',
    name: 'Angkor Warrior',
    tagline: 'Steps out of the Bayon walls',
    weapon: 'fists',
    directory: 'assets/sprites/heroes/angkor/arsenal/',
    ultStrip: 'assets/sprites/heroes/angkor/hero_ult.png',
    cards: drawnCards('assets/sprites/heroes/angkor/'),
  },
];

export const DEFAULT_HERO = 'moss';

export function heroById(id) {
  return HEROES.find((hero) => hero.id === id) || HEROES[0];
}
