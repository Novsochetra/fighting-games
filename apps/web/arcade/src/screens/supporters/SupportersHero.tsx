import { HeartIcon } from '@/components/icons';
import type { SupportersView } from './SupportersLists';

interface HeroProps {
  page: SupportersView | null;
  onDonate: () => void;
}

export function SupportersHero({ page, onDonate }: HeroProps) {
  return (
    <section className="supporters-hero" aria-labelledby="supporters-title">
      <span className="heart-badge" aria-hidden="true">
        <HeartIcon />
      </span>
      <h1 className="supporters-hero__title" id="supporters-title">
        Supporters
      </h1>
      <p className="supporters-hero__lead">
        Every game in the arcade is free to play. These people help keep it that way.
      </p>
      <dl className="stats" id="stats" hidden={!page || page.isEmpty}>
        <div className="stats__item">
          <dt className="stats__label">Raised</dt>
          <dd className="stats__value" id="total">
            {page?.totalLabel}
          </dd>
        </div>
        <div className="stats__item">
          <dt className="stats__label">Supporters</dt>
          <dd className="stats__value" id="count">
            {page?.countLabel}
          </dd>
        </div>
      </dl>
      <button
        className="pill-button pill-button--primary supporters-hero__donate"
        id="donate"
        type="button"
        onClick={onDonate}
      >
        <HeartIcon />
        Become a supporter
      </button>
    </section>
  );
}
