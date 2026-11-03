import { describe, expect, it } from 'vitest';

import { SAVE_CAM_ART } from '../../../../../src/art/save-cam.js';
import { VILLAGE_FIELD } from '../../../../../src/art/venues/village-field.js';
import { goalStyleOf } from '../../../../../src/render/save-cam/backdrop.js';
import { backdropOf, SAVE_CAM_VENUES } from '../../../../../src/render/save-cam/backdrops/index.js';
import { VENUES } from '../../../../../src/render/venues/catalog.js';

const HEX = /^#[0-9a-f]{6}$/;

describe('the save cam’s backdrop for a venue', () => {
  it('has one of its own for every venue a match is played at', () => {
    expect([...SAVE_CAM_VENUES].sort()).toEqual(Object.keys(VENUES).sort());

    for (const venue of Object.keys(VENUES)) {
      expect(backdropOf(venue).id).toBe(venue);
      expect(Boolean(backdropOf(venue).paint || backdropOf(venue).live)).toBe(true);
    }
  });

  it('gives each its own goal: four shades of post and three of net', () => {
    for (const venue of Object.keys(VENUES)) {
      const goal = goalStyleOf(venue);

      expect(goal.post).toHaveLength(4);
      expect(goal.net).toHaveLength(3);
      expect([...goal.post, ...goal.net].every((colour) => HEX.test(colour))).toBe(true);
    }
  });

  it('stands bamboo at the village field, in the venue’s own bamboo, and a frame elsewhere', () => {
    expect(goalStyleOf('village-field').bamboo).toBe(true);
    expect(goalStyleOf('village-field').post).toEqual(VILLAGE_FIELD.bamboo);

    for (const venue of Object.keys(VENUES).filter((id) => id !== 'village-field')) {
      expect(goalStyleOf(venue).bamboo).toBe(false);
    }
  });

  it('plays a match with no venue, or one it does not know, under the floodlights', () => {
    expect(backdropOf(null).id).toBe('world-stadium');
    expect(backdropOf('moon-base').id).toBe('world-stadium');
    expect(goalStyleOf(undefined).post).toEqual(SAVE_CAM_ART.post);
  });
});
