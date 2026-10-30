// A run's poster, as view-model.js presents it.
export interface PosterImage {
  src: string;
  srcSet: string;
}

interface PosterButtonProps {
  poster: PosterImage;
  name: string;
  // how wide it shows (the img's sizes), so the browser picks the smallest size sharp there
  sizes: string;
  onOpen: () => void;
}

// A thumbnail of a run's poster, which opens the whole poster
export function PosterButton({ poster, name, sizes, onOpen }: PosterButtonProps) {
  return (
    <button
      className="board-poster"
      type="button"
      aria-label={`View ${name}'s poster`}
      onClick={onOpen}
    >
      <img
        className="board-poster__image"
        src={poster.src}
        srcSet={poster.srcSet}
        sizes={sizes}
        alt=""
        width="320"
        height="168"
        loading="lazy"
        decoding="async"
      />
    </button>
  );
}
