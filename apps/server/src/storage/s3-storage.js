import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { isFileKey } from './file-keys.js';

// CloudFront and browsers keep a file for a year, so a file never changes under its name: a put to
// a key already taken fails (IfNoneMatch), and a new version goes up under a new name.
const KEEP_A_YEAR = 'public, max-age=31536000, immutable';
const DOWNLOAD_NAME = /^[A-Za-z0-9][\w.-]*$/;

// A file sent as an attachment saves under its name, even from another site's page, where a link's
// download attribute is ignored.
function dispositionOf(downloadAs) {
  if (downloadAs === undefined) {
    return {};
  }

  if (!DOWNLOAD_NAME.test(downloadAs)) {
    throw new Error(`"${downloadAs}" is not a download name: letters, digits, . _ and - only`);
  }

  return { ContentDisposition: `attachment; filename="${downloadAs}"` };
}

export function createS3Storage({ bucket, region, publicUrl }, client = new S3Client({ region })) {
  const urlOf = (key) => `${publicUrl}/${key}`;

  return {
    urlOf,

    async putFile({ key, body, contentType, downloadAs }) {
      if (!isFileKey(key)) {
        throw new Error(`"${key}" is not a file key: letters, digits, . _ - and / only`);
      }

      const disposition = dispositionOf(downloadAs);

      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          CacheControl: KEEP_A_YEAR,
          IfNoneMatch: '*',
          ...disposition,
        }),
      );

      return { key, url: urlOf(key) };
    },
  };
}
