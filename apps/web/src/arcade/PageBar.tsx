import { useArcadeUrl } from './arcade-context';
import { useBackToArcade } from './use-back';

interface PageBarProps {
  // shown small in the bar as the large title scrolls under it (page-bar.css)
  title: string;
  titleId?: string;
  // the credits' bar floats over its cover photo
  over?: boolean;
}

// The bar of a screen pushed over the arcade: Back, named where a phone shows its chevron alone.
export function PageBar({ title, titleId, over = false }: PageBarProps) {
  const goBack = useBackToArcade();
  const url = useArcadeUrl();

  return (
    <header className={`page-bar${over ? ' page-bar--over' : ''} scroll-edge`}>
      <a
        className="glass-button glass-button--labeled"
        href={url('')}
        data-back
        aria-label="Arcade"
        onClick={goBack}
      >
        <svg className="icon icon--bold" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" />
        </svg>
        <span className="glass-button__label">Arcade</span>
      </a>
      <p className="page-bar__title" id={titleId} aria-hidden="true">
        {title}
      </p>
    </header>
  );
}
