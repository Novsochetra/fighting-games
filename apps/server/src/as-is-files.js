// What the arcade serves as it is, in the build (apps/web/vite.config.ts copies it to dist/) and on
// the dev server: the games, each an app of its own that Vite never touches, the arcade's art, the
// files a crawler asks for by name, and the classic script that sets light or dark before the first
// paint, which Vite would not bundle. The service worker is built (src/offline/sw.js).
export const AS_IS = [
  'games',
  'assets',
  'robots.txt',
  'sitemap.xml',
  'src/home/appearance-early.js',
];

export const isServedAsIs = (pathname) =>
  AS_IS.some((entry) => pathname === `/${entry}` || pathname.startsWith(`/${entry}/`));

// Where Vite puts the modules and stylesheets it builds, each named by its content.
export const BUILD_FOLDER = 'build';
