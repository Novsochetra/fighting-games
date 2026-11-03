export const isRecord = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isCount = (value) => Number.isInteger(value) && value >= 0;

export const countOf = (value) => (isCount(value) ? value : 0);
