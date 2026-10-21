// the heroes the player can pick, five Shades and two Khmer fighters, Bokator and the Angkor Warrior;
// each has its own sprite set and effect colors, a fighting style (data/styles/) and an ultimate
// (data/ultimates/)
export const HEROES = [
  {
    id: 'moss',
    name: 'Moss Shade',
    tagline: 'Patient blade of the old grove',
    directory: 'assets/sprites/hero/arsenal/',
    ultStrip: 'assets/sprites/hero/hero_ult.png',
  },
  {
    id: 'firefly',
    name: 'Firefly Shade',
    tagline: 'Fights in a swarm of sparks',
    directory: 'assets/sprites/heroes/firefly/arsenal/',
    ultStrip: 'assets/sprites/heroes/firefly/hero_ult.png',
  },
  {
    id: 'antler',
    name: 'Antler Spirit Shade',
    tagline: 'Horned ghost of the dunes',
    directory: 'assets/sprites/heroes/antler/arsenal/',
    ultStrip: 'assets/sprites/heroes/antler/hero_ult.png',
  },
  {
    id: 'blue',
    name: 'Blue Shade',
    tagline: 'Cold steel, no shadow',
    directory: 'assets/sprites/heroes/blue/arsenal/',
    ultStrip: 'assets/sprites/heroes/blue/hero_ult.png',
  },
  {
    id: 'ember',
    name: 'Ember Shade',
    tagline: 'Walked out of the burning woods',
    directory: 'assets/sprites/heroes/ember/arsenal/',
    ultStrip: 'assets/sprites/heroes/ember/hero_ult.png',
  },
  {
    id: 'bokator',
    name: 'Bokator',
    tagline: 'Pounds the lion, as Angkor taught',
    directory: 'assets/sprites/heroes/bokator/arsenal/',
    ultStrip: 'assets/sprites/heroes/bokator/hero_ult.png',
  },
  {
    id: 'angkor',
    name: 'Angkor Warrior',
    tagline: 'Steps out of the Bayon walls',
    directory: 'assets/sprites/heroes/angkor/arsenal/',
    ultStrip: 'assets/sprites/heroes/angkor/hero_ult.png',
  },
];

export const DEFAULT_HERO = 'moss';

export function heroById(id) {
  return HEROES.find((hero) => hero.id === id) || HEROES[0];
}
