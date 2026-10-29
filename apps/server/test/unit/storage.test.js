import { describe, expect, it } from 'vitest';
import { checkStorage } from '../../src/storage/check-storage.js';
import { isFileKey } from '../../src/storage/file-keys.js';
import { createS3Storage } from '../../src/storage/s3-storage.js';
import { readStorageConfig } from '../../src/storage/storage-config.js';

const CONFIG = {
  bucket: 'arcade-files',
  region: 'ap-southeast-1',
  publicUrl: 'https://files.example.test',
};

function fakeClient() {
  const sent = [];
  return { sent, send: async (command) => sent.push(command.input) };
}

describe('readStorageConfig', () => {
  it('is off without S3_BUCKET, even with AWS_REGION set', () => {
    expect(readStorageConfig({})).toBeNull();
    expect(readStorageConfig({ S3_BUCKET: ' ', AWS_REGION: 'ap-southeast-1' })).toBeNull();
  });

  it('reads the bucket, its region and the CloudFront address without a trailing slash', () => {
    const env = {
      S3_BUCKET: ' arcade-files ',
      AWS_REGION: 'ap-southeast-1',
      CLOUDFRONT_URL: 'https://files.example.test/',
    };
    expect(readStorageConfig(env)).toEqual(CONFIG);
  });

  it('needs a region once a bucket is set', () => {
    expect(() => readStorageConfig({ S3_BUCKET: 'arcade-files' })).toThrow(/AWS_REGION/);
  });

  it.each(['', 'files.example.test', 'http://files.example.test', 'ftp://files.example.test'])(
    'refuses CLOUDFRONT_URL=%s',
    (value) => {
      const env = {
        S3_BUCKET: 'arcade-files',
        AWS_REGION: 'ap-southeast-1',
        CLOUDFRONT_URL: value,
      };
      expect(() => readStorageConfig(env)).toThrow(/CLOUDFRONT_URL must be an https/);
    },
  );
});

describe('isFileKey', () => {
  it.each(['ember.png', 'heroes/ember-v2.png', 'cards/2026/run_48210.webp', 'A1/b.c.d'])(
    'takes %s',
    (key) => {
      expect(isFileKey(key)).toBe(true);
    },
  );

  it.each([
    '',
    '/ember.png',
    'heroes/',
    'heroes//ember.png',
    '../secrets.txt',
    'heroes/../ember.png',
    '.env',
    'heroes/.hidden',
    'hero ember.png',
    'ផ្កា.png',
    'heroes?x=1',
    'a'.repeat(301),
    null,
  ])('refuses %s', (key) => {
    expect(isFileKey(key)).toBe(false);
  });
});

describe('createS3Storage', () => {
  it('puts a file that is never overwritten and kept a year, and answers its address', async () => {
    const client = fakeClient();
    const storage = createS3Storage(CONFIG, client);
    const file = { key: 'heroes/ember.png', body: 'png', contentType: 'image/png' };

    await expect(storage.putFile(file)).resolves.toEqual({
      key: 'heroes/ember.png',
      url: 'https://files.example.test/heroes/ember.png',
    });
    expect(client.sent).toEqual([
      {
        Bucket: 'arcade-files',
        Key: 'heroes/ember.png',
        Body: 'png',
        ContentType: 'image/png',
        CacheControl: 'public, max-age=31536000, immutable',
        IfNoneMatch: '*',
      },
    ]);
  });

  it('refuses a key that is not a file key before sending anything', async () => {
    const client = fakeClient();
    const storage = createS3Storage(CONFIG, client);
    const file = { key: '../ember.png', body: 'png', contentType: 'image/png' };

    await expect(storage.putFile(file)).rejects.toThrow(/not a file key/);
    expect(client.sent).toEqual([]);
  });
});

describe('checkStorage', () => {
  const now = () => Date.UTC(2026, 9, 29, 7, 0, 0);
  const expectedBody = 'Arcade storage check at 2026-10-29T07:00:00.000Z\n';

  function storageKeeping(files) {
    return {
      putFile: async ({ key, body }) => {
        files.set(key, body);
        return { key, url: `https://files.example.test/${key}` };
      },
    };
  }

  it('puts a new file and reads the same words back through its address', async () => {
    const files = new Map();
    const fetchFile = async (url) => new Response(files.get(url.split('.test/')[1]));

    await expect(checkStorage({ storage: storageKeeping(files), fetchFile, now })).resolves.toEqual(
      {
        key: 'checks/storage-check-1793257200000.txt',
        url: 'https://files.example.test/checks/storage-check-1793257200000.txt',
        status: 200,
        readBack: true,
      },
    );
    expect([...files.values()]).toEqual([expectedBody]);
  });

  it('reports the status when CloudFront does not send the file', async () => {
    const fetchFile = async () => new Response('denied', { status: 403 });
    const result = await checkStorage({ storage: storageKeeping(new Map()), fetchFile, now });

    expect(result).toMatchObject({ status: 403, readBack: false });
  });
});
