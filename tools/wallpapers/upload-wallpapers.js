// Puts the files make_wallpapers.py cut into S3, where CloudFront sends them to the wallpapers screen:
//
//   S3_BUCKET=fighting-games-arcade-files AWS_REGION=ap-southeast-1 \
//   CLOUDFRONT_URL=https://dphwn49s8chpb.cloudfront.net node tools/wallpapers/upload-wallpapers.js OUT_DIR
//
// It signs in with the Mac's AWS key (~/.aws). A file already up is left as it is, so a second run
// puts only what the first did not.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createS3Storage } from '../../apps/server/src/storage/s3-storage.js';
import { readStorageConfig } from '../../apps/server/src/storage/storage-config.js';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LIST = path.join(REPO, 'apps/web/arcade/src/screens/wallpapers/wallpapers.json');
const TYPES = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png' };
const DOWNLOADS = ['phone', 'desktop'];
const AT_ONCE = 6;

function filesOf({ wallpapers }) {
  return wallpapers.flatMap(({ id, files }) =>
    Object.entries(files).map(([kind, name]) => ({
      key: `wallpapers/${id}/${name}`,
      contentType: TYPES[path.extname(name)],
      downloadAs: DOWNLOADS.includes(kind)
        ? `retro-arcade-${id}-${kind}${path.extname(name)}`
        : undefined,
    })),
  );
}

async function put(storage, outDir, file) {
  try {
    await storage.putFile({ ...file, body: await readFile(path.join(outDir, file.key)) });

    return 'put';
  } catch (error) {
    if (error.name === 'PreconditionFailed') {
      return 'already up';
    }

    throw error;
  }
}

async function putAll(storage, outDir, files) {
  const results = [];

  for (let start = 0; start < files.length; start += AT_ONCE) {
    const batch = files.slice(start, start + AT_ONCE);

    results.push(...(await Promise.all(batch.map((file) => put(storage, outDir, file)))));
    console.log(`${Math.min(start + AT_ONCE, files.length)} of ${files.length}`);
  }

  return results;
}

const [outDir] = process.argv.slice(2);
const config = readStorageConfig(process.env);

if (!outDir || !config) {
  console.error(
    'Usage: S3_BUCKET=… AWS_REGION=… CLOUDFRONT_URL=… node upload-wallpapers.js OUT_DIR',
  );
  process.exitCode = 1;
} else {
  const files = filesOf(JSON.parse(await readFile(LIST, 'utf8')));
  const results = await putAll(createS3Storage(config), outDir, files);
  const fresh = results.filter((result) => result === 'put').length;

  console.log(`${fresh} put, ${results.length - fresh} already up, to ${config.bucket}`);
}
