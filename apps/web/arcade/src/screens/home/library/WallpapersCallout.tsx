import { useRef } from 'react';
import { Link } from 'react-router';
import { useArcade, useArcadeUrl } from '@/services/arcade-context';
import { EVENTS } from '@/services/analytics/analytics-events.js';
import { ChevronIcon } from '@/screens/home/home-icons';
import { bannerStates } from './banner-turn.js';
import { useBannerTurn } from './use-banner-turn';

// the wallpapers tools/wallpapers/make_wallpapers.py cuts banners from (BANNERS), in its order
export const BANNERS = [
  'worlds-edge-night',
  'highlands-moonrise',
  'entry-close-night',
  'entry-wide-night',
  'ta-prohm-hill-sunset',
  'highlands-night',
];
const SMALLEST_WIDTH = 960;
export const BANNER_WIDTHS = [SMALLEST_WIDTH, 1600, 2400];

// as wide as the library: the whole screen up to its widest (--layout-library-max-width)
const ART_SIZES = '(min-width: 80rem) 80rem, 100vw';

function BannerArt({ id, state }: { id: string; state: string }) {
  const url = useArcadeUrl();
  const art = (width: number) => url(`assets/wallpapers/banner-${id}-${width}.webp`);

  return (
    <img
      className="wallpapers-callout__art"
      data-banner={id}
      data-state={state}
      src={art(SMALLEST_WIDTH)}
      srcSet={BANNER_WIDTHS.map((width) => `${art(width)} ${width}w`).join(', ')}
      sizes={ART_SIZES}
      width="2400"
      height="1029"
      alt=""
      loading="lazy"
      decoding="async"
    />
  );
}

// The way to the wallpapers, a card under the library like a story in the App Store's Today tab,
// its picture fading from one wallpaper to the next: over the words on a phone, under them on a
// big screen (wallpapers-callout.css).
export function WallpapersCallout() {
  const { analytics } = useArcade();
  const card = useRef<HTMLAnchorElement>(null);
  const { turn, hold, release } = useBannerTurn(BANNERS.length, card);
  const states = bannerStates(turn, BANNERS.length);

  return (
    <Link
      className="wallpapers-callout"
      id="wallpapers-link"
      to="/wallpapers/"
      ref={card}
      onPointerEnter={hold}
      onPointerLeave={release}
      onFocus={hold}
      onBlur={release}
      onClick={() => analytics.track(EVENTS.wallpapers, { placement: 'library' })}
    >
      <span className="wallpapers-callout__frame">
        {BANNERS.map((id, index) =>
          states.has(index) ? <BannerArt key={id} id={id} state={states.get(index)!} /> : null,
        )}
      </span>
      <span className="wallpapers-callout__text">
        <span className="wallpapers-callout__eyebrow">Free downloads</span>
        <span className="wallpapers-callout__title">Wallpapers</span>
        <span className="wallpapers-callout__body">
          Temples, hills and moonlit nights for your phone and computer, up to 8K.
        </span>
        <span className="wallpapers-callout__more">
          See all
          <ChevronIcon />
        </span>
      </span>
    </Link>
  );
}
