export const MAX_BODY_BYTES = 2048;

const JSON_TYPE = /^application\/json\s*(;|$)/i;

const refusal = (status, message) => ({ ok: false, status, message });

// Node's parser stops a body at its Content-Length, so a declared length that fits caps what is read.
// A chunked body has none, and the arcade's pages always send one.
function checkHeaders(headers, maxBytes) {
  if (!JSON_TYPE.test(headers['content-type'] ?? '')) {
    return refusal(415, 'Send the gift as JSON.');
  }
  if (headers['content-length'] === undefined) {
    return refusal(411, 'Send a Content-Length.');
  }
  if (Number(headers['content-length']) > maxBytes) {
    return refusal(413, 'That is too much text.');
  }
  return null;
}

async function readText(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export async function readJsonBody(request, maxBytes = MAX_BODY_BYTES) {
  const problem = checkHeaders(request.headers, maxBytes);
  if (problem) {
    return problem;
  }
  try {
    return { ok: true, value: JSON.parse(await readText(request)) };
  } catch {
    return refusal(400, 'The gift is not valid JSON.');
  }
}
