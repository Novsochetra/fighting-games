export const TOP_BAR_HEIGHT = 28;
export const ROW_ONE = 7;
export const ROW_TWO = 16;

// the lives under the weapon and the wave under the clock hang below the bar in small boxes
export const LOWER_BOX = { y: TOP_BAR_HEIGHT + 2, height: 16 };
export const HUD_BOTTOM = LOWER_BOX.y + LOWER_BOX.height;

export const WEAPON_BOX = { x: 0, y: 0, width: 56, height: TOP_BAR_HEIGHT };
export const VITALS_BOX = { x: 58, y: 0, width: 104, height: TOP_BAR_HEIGHT };
export const LIVES_BOX = { x: 0, ...LOWER_BOX, width: WEAPON_BOX.width };
