// plain data copied out of the live match: numbers, strings and the small objects and lists that
// hold them, `depth` levels down; anything deeper (a duel's rounds, say) is left behind
export function plainCopy(value, depth = 3) {
  if (value === null || typeof value !== 'object') {
    return typeof value === 'function' ? undefined : value;
  }

  if (depth <= 0) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.map((item) => plainCopy(item, depth - 1)).filter((item) => item !== undefined);
  }

  const copy = {};

  for (const [key, item] of Object.entries(value)) {
    const copied = plainCopy(item, depth - 1);

    if (copied !== undefined) {
      copy[key] = copied;
    }
  }

  return copy;
}

export function copyFields(target, source, fields) {
  for (const field of fields) {
    target[field] = source[field] ?? null;
  }

  return target;
}
