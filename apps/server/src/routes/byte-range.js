const SINGLE_RANGE = /^bytes=(\d*)-(\d*)$/;

function suffixRange(suffix, size) {
  return suffix > 0 && size > 0 ? { start: Math.max(0, size - suffix), end: size - 1 } : 'none';
}

function boundedRange(start, end, size) {
  if (end !== null && end < start) {
    return null;
  }

  return start < size ? { start, end: Math.min(end ?? size - 1, size - 1) } : 'none';
}

// The one byte range a request asks for, as a video does (Safari plays none from a server that
// answers its first request, bytes=0-1, with the whole file): { start, end }, 'none' when the file
// has no such bytes (416), or null to send the whole file. Several ranges or a malformed header are
// answered with the whole file, as HTTP allows.
export function byteRangeOf(header, size) {
  const match = typeof header === 'string' ? SINGLE_RANGE.exec(header.trim()) : null;

  if (!match || (match[1] === '' && match[2] === '')) {
    return null;
  }

  const [first, last] = [match[1], match[2]].map((text) => (text === '' ? null : Number(text)));

  return first === null ? suffixRange(last, size) : boundedRange(first, last, size);
}
