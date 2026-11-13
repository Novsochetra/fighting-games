const MEGABYTE = 1_000_000;

export const megabytes = (bytes, locale) =>
  `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(bytes / MEGABYTE)} MB`;

// The computer's download is the PNG as it was made, the phone's a JPEG cut from it.
const FORMATS = {
  png: { label: 'Original PNG', type: 'image/png' },
  jpg: { label: 'JPEG', type: 'image/jpeg' },
};

function downloadOf(wallpaper, shape, url, locale) {
  const file = wallpaper.files[shape];
  const extension = file.split('.').pop();
  const { label, type } = FORMATS[extension];
  const [width, height, bytes] = wallpaper[shape];

  return {
    url: url(file),
    name: `retro-arcade-${wallpaper.id}-${shape}.${extension}`,
    type,
    width,
    height,
    sizeLabel: `${label} · ${width} × ${height} · ${megabytes(bytes, locale)}`,
  };
}

// Each wallpaper as the screen shows it, from the list make_wallpapers.py writes: every file is
// <base>/<id>/<name>, and each size is in a srcset, so a phone loads the small one.
function cardOf(wallpaper, base, locale) {
  const { id, place, time, mood, files } = wallpaper;
  const url = (name) => `${base}/${id}/${name}`;

  return {
    id,
    place,
    time,
    mood,
    thumb: { src: url(files.thumb), srcSet: `${url(files.thumb)} 640w, ${url(files.view)} 1280w` },
    preview: {
      desktop: {
        src: url(files.view),
        srcSet: `${url(files.view)} 1280w, ${url(files.large)} 2560w`,
      },
      phone: { src: url(files.phoneView), srcSet: `${url(files.phoneView)} 720w` },
    },
    downloads: {
      phone: downloadOf(wallpaper, 'phone', url, locale),
      desktop: downloadOf(wallpaper, 'desktop', url, locale),
    },
  };
}

export function wallpaperCards({ base, wallpapers }, locale) {
  return wallpapers.map((wallpaper) => cardOf(wallpaper, base, locale));
}

export const downloadsLabel = (count, locale) =>
  `${new Intl.NumberFormat(locale).format(count)} ${count === 1 ? 'download' : 'downloads'}`;

export const byMood = (cards, mood) =>
  mood === 'all' ? cards : cards.filter((card) => card.mood === mood);

// A phone is held upright, so its wallpaper shows first there; a mouse's screen is a computer's.
export const firstShape = (window) =>
  window.matchMedia('(pointer: coarse)').matches ? 'phone' : 'desktop';
