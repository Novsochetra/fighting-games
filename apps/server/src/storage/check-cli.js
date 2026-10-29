import { checkStorage } from './check-storage.js';
import { createS3Storage } from './s3-storage.js';
import { readStorageConfig } from './storage-config.js';

const config = readStorageConfig(process.env);

if (config) {
  const { key, url, status, readBack } = await checkStorage({ storage: createS3Storage(config) });

  console.log(`Uploaded ${key} to ${config.bucket}`);
  console.log(
    readBack ? `CloudFront sends it: ${url}` : `CloudFront answered ${status} for ${url}`,
  );
  process.exitCode = readBack ? 0 : 1;
} else {
  console.error('S3_BUCKET is not set, so there is no file storage to check.');
  process.exitCode = 1;
}
