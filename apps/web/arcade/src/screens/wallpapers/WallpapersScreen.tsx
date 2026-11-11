import { useMemo, useState } from 'react';
import { useArcade } from '@/services/arcade-context';
import { PageBar } from '@/components/page-bar/PageBar';
import { Segmented } from '@/components/segmented/Segmented';
import { useArriveDrawn } from '@/navigation/stack/use-arrive-drawn';
import { EVENTS } from '@/services/analytics/analytics-events.js';
import { byMood, wallpaperCards } from './wallpaper-list.js';
import { WallpaperGrid } from './WallpaperGrid';
import { WallpaperSheet } from './WallpaperSheet';
import type { Mood, WallpaperCard } from './wallpaper-types';
import { useWallpaperStats } from './use-wallpaper-stats';
import WALLPAPERS from './wallpapers.json';
import './wallpapers.css';

const MOODS = [
  { value: 'all', label: 'All' },
  { value: 'day', label: 'Day' },
  { value: 'night', label: 'Night' },
] as const;

// The tiles that rise in as the page loads (wallpapers.css).
export const WALLPAPERS_ENTRANCES = ['wallpaper-rise'];

// The card stays as the sheet closes, so the wallpaper does not vanish while it slides away.
function usePicked() {
  const [card, setCard] = useState<WallpaperCard | null>(null);
  const [isOpen, setOpen] = useState(false);

  return {
    card,
    isOpen,

    open(picked: WallpaperCard) {
      setCard(picked);
      setOpen(true);
    },

    close: () => setOpen(false),
  };
}

interface HeroProps {
  mood: Mood;
  onMood: (next: Mood) => void;
}

function WallpapersHero({ mood, onMood }: HeroProps) {
  return (
    <section className="wallpapers-hero" aria-labelledby="wallpapers-title">
      <h1 className="wallpapers-hero__title" id="wallpapers-title">
        Wallpapers
      </h1>
      <p className="wallpapers-hero__lead">
        Temples, hills and moonlit nights from the arcade, free for your phone and computer.
      </p>
      <Segmented
        id="wallpaper-mood"
        label="Time of day"
        options={MOODS}
        value={mood}
        onChange={onMood}
      />
    </section>
  );
}

// Wallpapers of the arcade's world for a phone or a computer, like a gallery in the App Store: a
// grid of small cuts, and a sheet with the big one, its likes and its download.
export function WallpapersScreen() {
  const { locale, sound, analytics } = useArcade();
  const [mood, setMood] = useState<Mood>('all');
  const picked = usePicked();
  const stats = useWallpaperStats();
  const screen = useArriveDrawn<HTMLDivElement>(WALLPAPERS_ENTRANCES);
  const cards = useMemo(() => wallpaperCards(WALLPAPERS, locale) as WallpaperCard[], [locale]);

  return (
    <div className="wallpapers-page" ref={screen}>
      <PageBar title="Wallpapers" titleId="wallpapers-bar-title" />
      <main className="wallpapers">
        <WallpapersHero
          mood={mood}
          onMood={(next) => {
            setMood(next);
            sound.play('switch');
          }}
        />
        <WallpaperGrid
          cards={byMood(cards, mood)}
          stats={stats}
          onOpen={(card) => {
            picked.open(card);
            analytics.track(EVENTS.wallpaper, { wallpaper: card.id });
          }}
        />
      </main>
      <WallpaperSheet
        card={picked.card}
        stats={stats}
        isOpen={picked.isOpen}
        onClose={picked.close}
      />
    </div>
  );
}
