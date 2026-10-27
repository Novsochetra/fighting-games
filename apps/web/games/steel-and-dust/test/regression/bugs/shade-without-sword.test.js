import { describe, expect, it } from 'vitest';
import { useDurability } from '../../../src/sim/combat/durability.js';
import { setWeapon } from '../../../src/sim/fighters/loadout.js';
import {
  continueAs,
  enterNextMission,
  restartRun,
  selectMission,
  startPlay,
} from '../../../src/sim/stage/flow.js';
import { createTestGame } from '../../support/test-game.js';

// Bug: every Shade set out bare-handed, its weapon box reading Fists and its strips drawn from
// their fists row, though each is drawn as a swordsman; with the weapon crates off nothing ever
// handed it a sword. A Shade now fights with its own sword, which never breaks
const SHADES = ['moss', 'firefly', 'antler', 'blue', 'ember'];
// The Angkor Warrior set out with his fists the same way, though his card and his ultimate hold his
// gold dav: the dav is his own sword now
const SWORDSMEN = [...SHADES, 'angkor'];
const OWN_SWORD = { id: 'sword', durability: Infinity };

// the menu sets the road up first and the hero is picked after, as the hero list does it
function pickedOnTheTitle(heroId) {
  const game = createTestGame({ settings: { hero: 'bokator' } });
  selectMission(game, 0);
  game.settings.hero = heroId;
  startPlay(game);
  return game;
}

function fallen(game) {
  game.player.hp = 0;
  game.mode = 'over';
}

describe('a hero drawn with a sword', () => {
  it.each(SWORDSMEN)('%s sets out with its own sword in hand', (heroId) => {
    expect(pickedOnTheTitle(heroId).player.weapon).toEqual(OWN_SWORD);
  });

  it.each(SWORDSMEN)('%s keeps its sword however many blows it lands', (heroId) => {
    const game = pickedOnTheTitle(heroId);
    for (let i = 0; i < 500; i++) {
      useDurability(game, game.player);
    }
    expect(game.player.weapon).toEqual(OWN_SWORD);
  });

  it('starts the next mission and a restart with its sword', () => {
    const game = pickedOnTheTitle('blue');
    setWeapon(game, game.player, 'fists');
    enterNextMission(game);
    expect(game.player.weapon).toEqual(OWN_SWORD);
    setWeapon(game, game.player, 'fists');
    restartRun(game);
    expect(game.player.weapon).toEqual(OWN_SWORD);
  });

  it('draws its sword again when a weapon it picked up breaks', () => {
    const game = pickedOnTheTitle('ember');
    setWeapon(game, game.player, 'spear');
    game.player.weapon.durability = 1;
    useDurability(game, game.player);
    expect(game.player.weapon).toEqual(OWN_SWORD);
  });

  it('comes back after a fall with its sword, even where Bokator fell', () => {
    const game = pickedOnTheTitle('bokator');
    fallen(game);
    continueAs(game, 'antler');
    expect(game.player.weapon).toEqual(OWN_SWORD);
  });
});

describe('the Khmer fighters', () => {
  it('Bokator still sets out with his fists', () => {
    expect(pickedOnTheTitle('bokator').player.weapon).toEqual({
      id: 'fists',
      durability: Infinity,
    });
  });

  it('Bokator comes back after a Shade falls with his fists, not its sword', () => {
    const game = pickedOnTheTitle('moss');
    fallen(game);
    continueAs(game, 'bokator');
    expect(game.player.weapon.id).toBe('fists');
  });

  it('the Angkor Warrior comes back after Bokator falls with his dav, not bare-handed', () => {
    const game = pickedOnTheTitle('bokator');
    fallen(game);
    continueAs(game, 'angkor');
    expect(game.player.weapon).toEqual(OWN_SWORD);
  });
});
