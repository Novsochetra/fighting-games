import { describe, expect, it } from 'vitest';
import { BOWL_HAIR } from '../../../../../src/render/portraits/hair/bowl.js';
import { CURLS_HAIR } from '../../../../../src/render/portraits/hair/curls.js';
import { MOP_HAIR } from '../../../../../src/render/portraits/hair/mop.js';
import {
  SQUAD_STYLES,
  stylesFor,
} from '../../../../../src/render/portraits/cast/footballer-styles.js';

const AGES = ['child', 'teen', 'young', 'adult'];

describe('a side’s footballer styles', () => {
  it('offer a boy of every age at least three haircuts', () => {
    for (const kit of Object.keys(SQUAD_STYLES)) {
      for (const age of AGES) {
        expect(stylesFor(kit, age).hairs.length, `${kit} ${age}`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('keep a schoolboy’s bowl cut off grown men and a mop off small boys', () => {
    expect(stylesFor('default', 'child').hairs).toContain(BOWL_HAIR);
    expect(stylesFor('default', 'adult').hairs).not.toContain(BOWL_HAIR);
    expect(stylesFor('default', 'child').hairs).not.toContain(MOP_HAIR);
  });

  it('give Nigeria’s men their own short cuts and Cambodia’s sides theirs', () => {
    expect(stylesFor('nigeria', 'adult').hairs).toContain(CURLS_HAIR);
    expect(stylesFor('chrey-school', 'child')).toMatchObject({
      irises: SQUAD_STYLES.default.irises,
    });
  });
});
