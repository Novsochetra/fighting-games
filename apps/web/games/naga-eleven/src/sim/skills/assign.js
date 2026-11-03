import { CAST_SKILLS, ROLE_SKILLS, SKILL_RULES, WORLD_KITS } from '../../data/skills.js';

const MIDDLE = 0.5;

// a midfielder or forward out wide plays the wing (README "Who has which skill")
export function skillPostOf(slot) {
  const wide = Math.abs(slot.across - MIDDLE) >= SKILL_RULES.wingFromMiddle;

  return wide && (slot.role === 'midfielder' || slot.role === 'forward') ? 'wing' : slot.role;
}

export const skillStyleOf = (kit) => (WORLD_KITS.includes(kit) ? 'world' : 'khmer');

// a star with moves plays them and no skill; a star with none his own skill, if he has one; anyone
// else his side's skill for his post
export function skillOf(spec, { slot, kit }) {
  if (spec.star && (spec.moves?.length ?? 0) > 0) {
    return null;
  }

  return CAST_SKILLS[spec.star] ?? ROLE_SKILLS[skillStyleOf(kit)][skillPostOf(slot)];
}
