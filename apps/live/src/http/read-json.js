import { PartyError } from '../parties/party-error.js';

const BODY_LIMIT_BYTES = 2048;

export function readJson(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > BODY_LIMIT_BYTES) {
        reject(new PartyError(413, 'too-big'));
        request.destroy();
      } else {
        chunks.push(chunk);
      }
    });
    request.on('end', () => {
      try {
        resolve(parseBody(chunks));
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', reject);
  });
}

function parseBody(chunks) {
  if (chunks.length === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new PartyError(400, 'bad-json');
  }
}
