import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router';
import type { CreditsLink } from './credits-links';

const OUT_ARROW = <path d="M7.5 16.5l9-9M9 7.5h7.5V15" />;
const IN_CHEVRON = <path d="M9 5.5l6.5 6.5L9 18.5" />;

function RowBody({ link, inside }: { link: CreditsLink; inside: boolean }) {
  return (
    <>
      <span className={`credits-tile credits-tile--${link.tile}`} aria-hidden="true">
        {link.icon}
      </span>
      <span className="credits-row__text">
        <span className="credits-row__title">{link.title}</span>
        <span className="credits-row__detail">{link.detail}</span>
      </span>
      <svg
        className={`icon icon--bold credits-row__go${inside ? ' credits-row__go--inside' : ''}`}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        {inside ? IN_CHEVRON : OUT_ARROW}
      </svg>
    </>
  );
}

// A row of an inset grouped list, as in iOS Settings: a link to another site opens in a tab, and one
// to a screen of the arcade pushes it, with a chevron.
export function CreditsRow({ link }: { link: CreditsLink }) {
  if (link.screen) {
    return (
      <Link className="credits-row" id={link.id} to={link.screen}>
        <RowBody link={link} inside />
      </Link>
    );
  }

  return (
    <a className="credits-row" href={link.href} target="_blank" rel="noopener noreferrer">
      <RowBody link={link} inside={false} />
    </a>
  );
}

interface GroupProps {
  title: string;
  titleId: string;
  order: number;
  links: CreditsLink[];
  listId?: string;
  children?: ReactNode;
}

export function CreditsGroup({ title, titleId, order, links, listId }: GroupProps) {
  return (
    <section
      className="credits-group"
      aria-labelledby={titleId}
      style={{ '--order': order } as CSSProperties}
    >
      <h2 className="credits-group__title" id={titleId}>
        {title}
      </h2>
      <ul className="credits-list" id={listId}>
        {links.map((link) => (
          <li key={link.title}>
            <CreditsRow link={link} />
          </li>
        ))}
      </ul>
    </section>
  );
}
