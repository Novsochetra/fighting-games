// a mark on the road turns red and blinks over its last ticks, like every boss danger
export const MARK_HURRY = 14;

export const isHurrying = (time) => -time < MARK_HURRY;

export const isBlinking = (time) => isHurrying(time) && Boolean((time >> 2) & 1);
