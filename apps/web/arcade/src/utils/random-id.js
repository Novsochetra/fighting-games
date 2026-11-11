// A random version-4 UUID, from crypto.randomUUID where the browser has it (Safari from 15.4) and
// from getRandomValues, which every browser the arcade runs on has, where it does not.
export function randomId(crypto) {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
