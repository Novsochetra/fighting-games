import { useRef, useState } from 'react';
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useArcade, useArcadeUrl } from '@/services/arcade-context';
import { randomId } from '@/utils/random-id.js';
import { fetchWallpaperCounts, postDownload, postLike } from './wallpapers-client.js';

export const WALLPAPER_COUNTS_QUERY = ['wallpaper-counts'];

export interface WallpaperCount {
  likes: number;
  downloads: number;
}

type Counts = Record<string, WallpaperCount>;

const NONE: WallpaperCount = { likes: 0, downloads: 0 };

export function useWallpaperCounts() {
  const { fetch } = useArcade();
  const url = useArcadeUrl();
  const { data } = useQuery({
    queryKey: WALLPAPER_COUNTS_QUERY,
    queryFn: () => fetchWallpaperCounts(fetch, url('api/wallpapers')) as Promise<Counts>,
  });

  return { hasCounts: Boolean(data), countOf: (id: string) => data?.[id] ?? NONE };
}

// A tap shows at once; the server's own count takes its place as it answers.
function changeCount(
  client: QueryClient,
  id: string,
  change: (count: WallpaperCount) => WallpaperCount,
) {
  client.setQueryData<Counts>(
    WALLPAPER_COUNTS_QUERY,
    (counts) => counts && { ...counts, [id]: change(counts[id] ?? NONE) },
  );
}

// What this device liked is its own (preferences); a like that fails to send is taken back, and a
// second tap waits for the first to be answered.
export function useWallpaperLikes() {
  const { fetch, preferences, window } = useArcade();
  const url = useArcadeUrl();
  const client = useQueryClient();
  const [, redraw] = useState(0);
  const sending = useRef(new Set<string>());

  const mark = (id: string, liked: boolean) => {
    preferences.setLikedWallpaper(id, liked);
    changeCount(client, id, (count) => ({
      ...count,
      likes: Math.max(0, count.likes + (liked ? 1 : -1)),
    }));
    redraw((times) => times + 1);
  };

  async function send(id: string, liked: boolean) {
    const visitor = preferences.wallpaperVisitor(() => randomId(window.crypto));
    const likes = await postLike(fetch, url('api/wallpapers/likes'), {
      wallpaper: id,
      visitor,
      liked,
    });

    changeCount(client, id, (count) => ({ ...count, likes }));
  }

  async function toggle(id: string) {
    const liked = !preferences.isLikedWallpaper(id);

    if (sending.current.has(id)) {
      return;
    }

    sending.current.add(id);
    mark(id, liked);
    await send(id, liked).catch(() => mark(id, !liked));
    sending.current.delete(id);
  }

  return { isLiked: (id: string) => preferences.isLikedWallpaper(id), toggleLike: toggle };
}

// A count lost on the way costs the visitor nothing, so it fails quietly; the next read corrects it.
export function useCountDownload() {
  const { fetch } = useArcade();
  const url = useArcadeUrl();
  const client = useQueryClient();

  return (wallpaper: string, shape: string) => {
    changeCount(client, wallpaper, (count) => ({ ...count, downloads: count.downloads + 1 }));
    postDownload(fetch, url('api/wallpapers/downloads'), { wallpaper, shape })
      .then((downloads: number) =>
        changeCount(client, wallpaper, (count) => ({ ...count, downloads })),
      )
      .catch(() => {});
  };
}
