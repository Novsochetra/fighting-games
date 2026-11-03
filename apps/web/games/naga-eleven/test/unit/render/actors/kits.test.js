import { describe, expect, it } from 'vitest';
import { KEEPER_SPARES, KITS } from '../../../../src/art/kits.js';
import { colourGap, looksAlike, matchKits } from '../../../../src/render/actors/kit-clash.js';

// every kit the README names (a youth team wears its country's kit)
const KIT_IDS = [
  'chrey-school',
  'neighbor-village',
  'riverside-school',
  'royal-kids',
  'kampong-cham-high',
  'siem-reap-high',
  'battambang-high',
  'kampot-high',
  'phnom-penh-elite',
  'cambodia',
  'japan',
  'thailand',
  'korea',
  'iran',
  'brazil',
  'nigeria',
  'mexico',
  'germany',
];

const PARTS = ['shirt', 'shorts', 'socks', 'trim'];
const HEX = /^#[0-9a-f]{6}$/;

const matchOf = (first, second) => ({
  teams: [
    { id: first, kit: first },
    { id: second, kit: second },
  ],
});

describe('the kits', () => {
  it('dresses every team the story meets, home, away and in goal, in ramps of four', () => {
    for (const id of KIT_IDS) {
      for (const choice of ['home', 'away', 'keeper']) {
        for (const part of PARTS) {
          expect(KITS[id][choice][part], `${id} ${choice} ${part}`).toHaveLength(4);
          expect(KITS[id][choice][part].every((shade) => HEX.test(shade))).toBe(true);
        }
      }
    }
  });

  it('shades each ramp from deep to light', () => {
    const lightness = (hex) => colourGap(hex, '#000000');

    for (const id of KIT_IDS) {
      const ramp = KITS[id].home.shirt;

      expect(lightness(ramp[0])).toBeLessThan(lightness(ramp[3]));
    }
  });

  it('keeps each keeper apart from both outfield kits of the side', () => {
    for (const id of KIT_IDS) {
      expect(looksAlike(KITS[id].keeper, KITS[id].home), id).toBe(false);
    }
  });
});

describe('a kit clash', () => {
  it('sends the second side out in its away kit when both home shirts look alike', () => {
    const [cambodia, korea] = matchKits(matchOf('cambodia', 'korea'));

    expect(cambodia.choice).toBe('home');
    expect(korea.choice).toBe('away');
    expect(looksAlike(cambodia.outfield, korea.outfield)).toBe(false);
  });

  it('keeps both home kits when they stand apart', () => {
    expect(matchKits(matchOf('cambodia', 'japan')).map((kit) => kit.choice)).toEqual([
      'home',
      'home',
    ]);
  });

  it('dresses two plain sides apart when the teams name no kit', () => {
    const [first, second] = matchKits({});

    expect(looksAlike(first.outfield, second.outfield)).toBe(false);
  });

  it('sends Riverside out in its away kit against Chrey, whose blue its teal looked like', () => {
    expect(matchKits(matchOf('chrey-school', 'riverside-school')).map((kit) => kit.choice)).toEqual(
      ['home', 'away'],
    );
  });

  // Cambodia's green keeper stood among Nigeria's green shirts, Kampong Cham High's orange
  // outfield among Battambang's orange keeper, and Cambodia's and Germany's keepers matched
  it('changes a keeper who looks like a shirt already on the pitch into a spare', () => {
    for (const first of KIT_IDS) {
      for (const second of KIT_IDS.filter((id) => id !== first)) {
        const kits = matchKits(matchOf(first, second));
        const shirts = kits.map((kit) => kit.outfield);

        for (const [side, kit] of kits.entries()) {
          const others = [...shirts, kits[1 - side].keeper];
          const clash = others.some((other) => looksAlike(kit.keeper, other));

          expect(clash, `${first} v ${second}, keeper ${side}`).toBe(false);
        }
      }
    }
  });

  it("keeps a keeper's own kit when it stands apart, naming the spare when not", () => {
    const [cambodia, nigeria] = matchKits(matchOf('cambodia', 'nigeria'));

    expect(nigeria.keeperChoice).toBe('keeper');
    expect(nigeria.keeper).toBe(KITS.nigeria.keeper);
    expect(cambodia.keeperChoice).toMatch(/^keeper-\d$/);
    expect(cambodia.keeper).toBe(KEEPER_SPARES[Number(cambodia.keeperChoice.slice(7))]);
  });

  it('never leaves two sides of any pairing looking alike', () => {
    for (const first of KIT_IDS) {
      for (const second of KIT_IDS.filter((id) => id !== first)) {
        const [one, two] = matchKits(matchOf(first, second));

        expect(looksAlike(one.outfield, two.outfield), `${first} v ${second}`).toBe(false);
      }
    }
  });
});
