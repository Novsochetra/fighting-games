import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ICON_LINK = /<link rel="(?:icon|apple-touch-icon)"[^>]*>/g;
const HREF = /href="([^"?]+)"/;

export const iconsOf = (page) =>
  [...page.matchAll(ICON_LINK)].map((link) => HREF.exec(link[0])?.[1]).filter(Boolean);

export const withIconVersions = (page, versions) =>
  page.replace(ICON_LINK, (link) =>
    link.replace(HREF, (attribute, href) => `href="${href}?v=${versions.get(href)}"`),
  );

const versionOf = async (file) =>
  createHash('sha256')
    .update(await readFile(file))
    .digest('hex')
    .slice(0, 8);

// Browsers keep a tab's icon by its address, apart from the files they cache, so an icon redrawn at
// the same address showed the old one first, or for days. Each icon's address names its content.
export async function versionIcons(pagePath) {
  const page = await readFile(pagePath, 'utf8');
  const icons = iconsOf(page);
  const versions = await Promise.all(
    icons.map((icon) => versionOf(path.join(path.dirname(pagePath), icon))),
  );

  await writeFile(
    pagePath,
    withIconVersions(page, new Map(icons.map((icon, i) => [icon, versions[i]]))),
  );
}
