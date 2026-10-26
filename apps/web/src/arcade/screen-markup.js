const URL_ATTRIBUTES = ['src', 'href', 'poster', 'action'];
// a scheme (https:, data:, mailto:), a fragment or a protocol-relative address needs nothing
const IS_RELATIVE = /^(?![a-z][a-z\d+.-]*:|#|\/\/)/i;

function wholeSrcset(srcset, base) {
  return srcset
    .split(',')
    .map((candidate) => {
      const [url, ...descriptors] = candidate.trim().split(/\s+/);

      return [new URL(url, base).href, ...descriptors].join(' ');
    })
    .join(', ');
}

function makeWhole(element, base) {
  for (const name of URL_ATTRIBUTES) {
    const value = element.getAttribute(name);

    if (value && IS_RELATIVE.test(value)) {
      element.setAttribute(name, new URL(value, base).href);
    }
  }

  const srcset = element.getAttribute('srcset');

  if (srcset) {
    element.setAttribute('srcset', wholeSrcset(srcset, base));
  }
}

// A screen's markup is written for its own page's address, and the arcade shows it under another
// one (an image in it would load from the folder of whichever screen came first), so every address
// in it is made whole against the page it came from.
export function makeUrlsWhole(root, base) {
  for (const element of [root, ...root.querySelectorAll('*')]) {
    makeWhole(element, base);
  }
}

export function headOf(page) {
  return {
    title: page.title,
    description: page.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
    canonical: page.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
  };
}

export const stylesheetsOf = (page, base) =>
  [...page.querySelectorAll('link[rel="stylesheet"]')].map(
    (link) => new URL(link.getAttribute('href'), base).href,
  );

// The page of another screen, as the arcade takes it in: its screen, its stylesheets and its head.
export async function fetchScreen({ document, fetch, url, id }) {
  const response = await fetch(url.href, { credentials: 'same-origin' });

  if (!response.ok) {
    throw new Error(`${url.href} answered ${response.status}`);
  }

  const parser = new document.defaultView.DOMParser();
  const page = parser.parseFromString(await response.text(), 'text/html');
  const screen = page.querySelector(`[data-screen="${id}"]`);

  if (!screen) {
    throw new Error(`${url.href} holds no ${id} screen`);
  }

  makeUrlsWhole(screen, url);

  return {
    root: document.importNode(screen, true),
    stylesheets: stylesheetsOf(page, url),
    head: headOf(page),
  };
}

function loaded(link) {
  return new Promise((resolve) => {
    link.addEventListener('load', resolve, { once: true });
    link.addEventListener('error', resolve, { once: true });
  });
}

// Each stylesheet the document lacks goes in after the rest, in the page's order; a screen shows
// only once they are in, so it never shows unstyled.
export function addStylesheets(document, hrefs) {
  const links = [...document.querySelectorAll('link[rel="stylesheet"]')];
  const present = new Set(links.map((link) => link.href));
  const added = hrefs
    .filter((href) => !present.has(href))
    .map((href) => {
      const link = document.createElement('link');
      // listened for before the link goes in, as a stylesheet already at hand can load at once
      const done = loaded(link);

      link.rel = 'stylesheet';
      link.href = href;
      document.head.append(link);

      return done;
    });

  return Promise.all(added);
}
