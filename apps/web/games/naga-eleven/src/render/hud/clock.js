export const minuteText = (match) => `${Math.max(0, Math.floor(match.minute ?? 0))}'`;

export const halfOf = (match) => (match.half === 2 ? 2 : 1);
