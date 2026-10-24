import { describe, expect, it } from 'vitest';
import { stingsEach } from '../../../src/sim/ultimates/swarm-nova.js';

describe("Swarm Nova's stings", () => {
  it('gives each fly all three stings in a crowd of three or more', () => {
    expect(stingsEach(3)).toBe(3);
    expect(stingsEach(7)).toBe(3);
  });

  it('shares them out when fewer stand, so a lone raider takes no more than one in a crowd', () => {
    expect(stingsEach(2)).toBe(2);
    expect(stingsEach(1)).toBe(1);
  });

  it('still lets a fly sting once with no one to hunt yet', () => {
    expect(stingsEach(0)).toBe(1);
  });
});
