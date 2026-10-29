import http from 'node:http';
import { S3Client } from '@aws-sdk/client-s3';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createS3Storage } from '../../src/storage/s3-storage.js';

const PRECONDITION_FAILED = `<?xml version="1.0" encoding="UTF-8"?>
<Error><Code>PreconditionFailed</Code><Message>At least one of the pre-conditions you specified did not hold</Message><Condition>If-None-Match</Condition></Error>`;

// Stands in for S3: keeps each PUT, and answers 412 to a second PUT of a key with If-None-Match.
function startFakeS3() {
  const files = new Map();
  const requests = [];
  const server = http.createServer(async (request, response) => {
    const chunks = [];

    for await (const chunk of request) {
      chunks.push(chunk);
    }

    const path = new URL(request.url, 'http://fake-s3').pathname;

    requests.push({ method: request.method, path, headers: request.headers });

    if (files.has(path) && request.headers['if-none-match'] === '*') {
      response.writeHead(412, { 'Content-Type': 'application/xml' });
      response.end(PRECONDITION_FAILED);
      return;
    }

    files.set(path, Buffer.concat(chunks).toString());
    response.writeHead(200, { ETag: '"fake-etag"' });
    response.end();
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, files, requests }));
  });
}

describe('S3 storage through the AWS SDK', () => {
  let fakeS3;
  let storage;

  beforeEach(async () => {
    fakeS3 = await startFakeS3();
    const client = new S3Client({
      region: 'ap-southeast-1',
      endpoint: `http://127.0.0.1:${fakeS3.server.address().port}`,
      forcePathStyle: true,
      credentials: { accessKeyId: 'test-key', secretAccessKey: 'test-secret' },
    });
    const config = {
      bucket: 'arcade-files',
      region: 'ap-southeast-1',
      publicUrl: 'https://files.example.test',
    };
    storage = createS3Storage(config, client);
  });

  afterEach(() => new Promise((resolve) => fakeS3.server.close(resolve)));

  it('sends a signed PUT with the type, the year-long cache and If-None-Match', async () => {
    const file = { key: 'heroes/ember.png', body: 'pixels', contentType: 'image/png' };

    await expect(storage.putFile(file)).resolves.toEqual({
      key: 'heroes/ember.png',
      url: 'https://files.example.test/heroes/ember.png',
    });

    const [put] = fakeS3.requests;

    expect(put).toMatchObject({ method: 'PUT', path: '/arcade-files/heroes/ember.png' });
    expect(put.headers).toMatchObject({
      'content-type': 'image/png',
      'cache-control': 'public, max-age=31536000, immutable',
      'if-none-match': '*',
    });
    expect(put.headers.authorization).toMatch(/^AWS4-HMAC-SHA256 Credential=test-key\//);
    expect(fakeS3.files.get('/arcade-files/heroes/ember.png')).toBe('pixels');
  });

  it('refuses to write over a file already there, and keeps the first one', async () => {
    const first = { key: 'heroes/ember.png', body: 'first', contentType: 'image/png' };
    const second = { ...first, body: 'second' };

    await storage.putFile(first);

    await expect(storage.putFile(second)).rejects.toMatchObject({
      name: 'PreconditionFailed',
      $metadata: { httpStatusCode: 412 },
    });
    expect(fakeS3.files.get('/arcade-files/heroes/ember.png')).toBe('first');
  });
});
