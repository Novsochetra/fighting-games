import { createS3Storage } from './s3-storage.js';
import { readStorageConfig } from './storage-config.js';

export function openStorage(env) {
  const config = readStorageConfig(env);

  return config
    ? {
        storage: createS3Storage(config),
        description: `Run posters kept in S3 (${config.bucket}), sent from ${config.publicUrl}`,
      }
    : { storage: null, description: 'Run posters off (set S3_BUCKET to keep them)' };
}
