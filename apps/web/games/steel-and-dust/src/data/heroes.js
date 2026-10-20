// the four Shades the player can pick; each has its own PixelLab sprite set and effect colors,
// a fighting style (data/styles/) and an ultimate (data/ultimates/)
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
];

export const DEFAULT_HERO = 'moss';

export function heroById(id) {
  return HEROES.find((hero) => hero.id === id) || HEROES[0];
}
