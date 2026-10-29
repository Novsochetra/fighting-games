export function isSecureUrl(value) {
  if (typeof value !== 'string' || /\s/.test(value)) {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.username === '' && url.password === '';
  } catch {
    return false;
  }
}
