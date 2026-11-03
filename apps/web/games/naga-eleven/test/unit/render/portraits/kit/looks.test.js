import { describe, expect, it } from 'vitest';
import { kitLookOf } from '../../../../../src/render/portraits/kit/looks.js';

const plain = (variant, age = 'young') => kitLookOf({ character: 'footballer', age, variant });

const AGED_PLAYERS = ['cambodia', 'brazil', 'nigeria', 'germany', 'mexico', 'japan'].flatMap(
  (kit) =>
    ['young', 'adult', 'child'].flatMap((age) =>
      Array.from({ length: 11 }, (_, place) => ({ kit, age, place })),
    ),
);

describe('the look the kit gives a star', () => {
  it('is the hero’s face and spiky hair for Sochetra', () => {
    expect(kitLookOf({ character: 'sochetra', age: 'young' })).toEqual({
      face: 'hero',
      hair: 'spiky',
    });
  });

  it('is the child’s face for a star of eleven, his own hair kept', () => {
    expect(kitLookOf({ character: 'rithy', age: 'child' })).toEqual({
      face: 'child',
      hair: 'swept',
    });
  });

  it('puts Rafael’s white headband over his curls', () => {
    expect(kitLookOf({ character: 'rafael' })).toMatchObject({
      hair: 'curly',
      gear: 'headband',
      tone: 'white',
    });
  });

  it('gives Farhad his short beard', () => {
    expect(kitLookOf({ character: 'farhad' })).toMatchObject({ face: 'wall', facial: 'beard' });
  });

  it('has nothing for someone the kit does not draw', () => {
    expect(kitLookOf({ character: 'ta-sok' })).toBeNull();
  });
});

describe('the look the kit gives a plain player', () => {
  const places = Array.from({ length: 11 }, (_, place) => ({ team: 'japan', kit: 'japan', place }));

  it('is the same man every time he is drawn', () => {
    expect(plain(places[3])).toEqual(plain(places[3]));
  });

  it('is no mate’s twin', () => {
    const looks = places.map((variant) => JSON.stringify(plain(variant)));

    expect(new Set(looks).size).toBe(looks.length);
  });

  it('never wears Sochetra’s spikes or Rafael’s curls', () => {
    const kits = ['chrey-school', 'japan', 'brazil', 'nigeria', 'germany', 'mexico'];
    const hairs = kits.flatMap((kit) =>
      places.map(({ place }) => plain({ team: kit, kit, place }).hair),
    );

    expect(hairs).not.toContain('spiky');
    expect(hairs).not.toContain('curly');
  });

  it('wears no grown man’s hair as a boy of eleven', () => {
    const hairs = places.map((variant) => plain({ ...variant, kit: 'brazil' }, 'child').hair);

    expect(hairs).not.toContain('slicked');
    expect(hairs).not.toContain('long-back');
    expect(hairs.every((hair) => hair)).toBe(true);
  });

  it('leaves a keeper’s head bare', () => {
    const keepers = places.map((variant) => plain({ ...variant, wear: 'keeper' }));

    expect(keepers.every((look) => look.gear === null)).toBe(true);
  });

  it('grows facial hair only on the faces whose jaw it was painted for, and only on men', () => {
    const looks = AGED_PLAYERS.map(({ kit, age, place }) => ({
      age,
      ...plain({ team: kit, kit, place }, age),
    }));
    const whiskered = looks.filter((look) => look.facial);
    const bearded = whiskered.filter((look) => look.facial === 'beard');

    expect(whiskered.length).toBeGreaterThan(0);
    expect(whiskered.every((look) => ['wall', 'adult'].includes(look.face))).toBe(true);
    expect(whiskered.every((look) => look.age !== 'child')).toBe(true);
    expect(bearded.every((look) => look.age === 'adult')).toBe(true);
  });

  it('never gives a keeper a full beard, which would make him Farhad’s double', () => {
    const kits = ['brazil', 'nigeria', 'germany', 'mexico'];
    const keepers = kits.flatMap((kit) =>
      places.map(({ place }) => plain({ team: kit, kit, wear: 'keeper', place }, 'adult')),
    );

    expect(keepers.some((look) => look.facial === 'beard')).toBe(false);
  });

  it('ties a band round some heads, in the side’s colours', () => {
    const banded = places.map(plain).filter((look) => look.gear);

    expect(banded.length).toBeGreaterThan(0);
    expect(banded.every((look) => look.tone === 'kit')).toBe(true);
  });
});
