// S3_BUCKET alone turns file storage on, so a shell that sets AWS_REGION for other tools keeps it off.
export function readStorageConfig(env) {
  const bucket = env.S3_BUCKET?.trim();

  if (!bucket) {
    return null;
  }

  const region = env.AWS_REGION?.trim();

  if (!region) {
    throw new Error(
      'S3_BUCKET is set, so AWS_REGION must be too (the bucket region, ap-southeast-1)',
    );
  }

  return { bucket, region, publicUrl: readPublicUrl(env.CLOUDFRONT_URL?.trim() ?? '') };
}

function readPublicUrl(value) {
  const url = URL.canParse(value) ? new URL(value) : null;

  if (url?.protocol !== 'https:') {
    throw new Error(`CLOUDFRONT_URL must be an https:// address, got "${value}"`);
  }

  return url.href.replace(/\/+$/, '');
}
