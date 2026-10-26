import type { CSSProperties } from 'react';
import { useArcadeUrl } from '../arcade/arcade-context';
import { PageBar } from '../arcade/PageBar';
import { useArriveDrawn } from '../arcade/use-arrive-drawn';
import { CreditsGroup } from './CreditsRow';
import { FIND_ME, MADE_WITH, THANKS_TO } from './credits-links';
import './cover.css';
import './credits.css';
import './maker.css';
import './rows.css';
import './tiles.css';

const order = (value: number) => ({ '--order': value }) as CSSProperties;

// The maker's photo as a child heads the screen, as an artist's photo heads their page in Apple
// Music (cover.css), with the maker's own photo set on its edge in a slowly turning glow.
function Cover() {
  const url = useArcadeUrl();

  return (
    <figure className="cover">
      <img
        className="cover__photo"
        src={url('assets/credits/childhood.jpg')}
        width="624"
        height="640"
        alt="Nov Sochetra and their brother as children, smiling at night before a lit pavilion"
        fetchPriority="high"
      />
      <figcaption className="cover__caption">Me and my brother</figcaption>
    </figure>
  );
}

function Maker() {
  const url = useArcadeUrl();

  return (
    <section className="maker" aria-labelledby="maker-name">
      <div className="maker__portrait" aria-hidden="true">
        <span className="maker__halo" />
        <span className="maker__avatar">
          NS
          <img
            className="maker__photo"
            src={url('assets/credits/portrait.jpg')}
            width="360"
            height="360"
            alt=""
          />
        </span>
      </div>
      <p className="maker__eyebrow" style={order(1)}>
        Made by
      </p>
      <h1 className="maker__name" id="maker-name" style={order(2)}>
        Nov Sochetra
      </h1>
      <p className="maker__lead" style={order(3)}>
        I build Retro Arcade and keep every game in it free to play.
      </p>
    </section>
  );
}

// The parts that rise in as the page loads (credits.css, cover.css, maker.css).
export const CREDITS_ENTRANCES = ['credits-rise', 'portrait-in'];

// Who makes the arcade, like the profile card at the top of an iOS contact.
export function CreditsScreen() {
  const screen = useArriveDrawn<HTMLDivElement>(CREDITS_ENTRANCES);

  return (
    <div className="credits-page" ref={screen}>
      <PageBar title="Nov Sochetra" titleId="credits-bar-title" over />
      <Cover />
      <main className="credits">
        <Maker />
        <CreditsGroup
          title="Find me"
          titleId="find-title"
          order={4}
          links={FIND_ME}
          listId="social-links"
        />
        <CreditsGroup title="Thanks to" titleId="thanks-title" order={5} links={THANKS_TO} />
        <CreditsGroup title="Made with" titleId="tools-title" order={6} links={MADE_WITH} />
        <footer className="credits__footer" style={order(7)}>
          <p className="credits__thanks">And you, for playing.</p>
          <p>© 2026 Nov Sochetra</p>
        </footer>
      </main>
    </div>
  );
}
