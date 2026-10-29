import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { isFileKey } from './file-keys.js';

// CloudFront and browsers keep a file for a year, so a file never changes under its name: a put to
// a key already taken fails (IfNoneMatch), and a new version goes up under a new name.
const KEEP_A_YEAR = 'public, max-age=31536000, immutable';

export function createS3Storage({ bucket, region, publicUrl }, client = new S3Client({ region })) {
  const urlOf = (key) => `${publicUrl}/${key}`;

  return {
    urlOf,

    async putFile({ key, body, contentType }) {
      if (!isFileKey(key)) {
        throw new Error(`"${key}" is not a file key: letters, digits, . _ - and / only`);
      }

      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          CacheControl: KEEP_A_YEAR,
          IfNoneMatch: '*',
        }),
      );

      return { key, url: urlOf(key) };
    },
  };
}
