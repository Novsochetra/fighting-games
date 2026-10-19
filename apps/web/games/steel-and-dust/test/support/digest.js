import { createHash } from 'node:crypto';

export function digest(parts) {
  const hash = createHash('sha1');
  for (const part of parts) {
    hash.update(String(part));
    hash.update('|');
  }
  return hash.digest('hex').slice(0, 16);
}
