import { useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { useArcade } from '@/services/arcade-context';
import { LayoutSwap } from '@/components/layout-swap/LayoutSwap';
import { Notice } from '@/components/notice/Notice';
import { PageBar } from '@/components/page-bar/PageBar';
import { useArriveDrawn } from '@/navigation/stack/use-arrive-drawn';
import { DonateSheet } from './donate/DonateSheet';
import { SupportersHero } from './SupportersHero';
import { EmptyList, Podium, Roll, type SortOrder, type SupportersView } from './SupportersLists';
import { phaseOf, useGiven, useSupporters } from '@/api/supporters/use-supporters';
import { supportersPage } from './view-model.js';
import './podium.css';
import './roll.css';
import './supporters.css';

export const LOADING_MESSAGE = 'Loading supporters…';
export const ERROR_MESSAGE = 'The supporters did not load. Check your connection and try again.';

// the stats come in above Become a supporter, which would jump down as the list arrived
const SWAP_BLOCKS = ['supporters-notice', 'donate', 'stats', 'empty', 'podium-section', 'roll'];

// The places and rows that rise in as the list comes in (podium.css, roll.css).
export const SUPPORTERS_ENTRANCES = ['place-rise', 'row-rise'];

function useSupportersPage(order: SortOrder) {
  const { locale } = useArcade();
  const query = useSupporters();
  const { data } = query;
  const page = useMemo(
    () => (data ? (supportersPage(data, { order, locale }) as SupportersView) : null),
    [data, order, locale],
  );

  return { query, page, phase: phaseOf(query) };
}

// The home page's Support banner links here with #give, so the donate sheet opens at once.
export function SupportersScreen() {
  const { sound } = useArcade();
  const { hash } = useLocation();
  const [order, setOrder] = useState<SortOrder>('top');
  const [donating, setDonating] = useState(hash === '#give');
  const { query, page, phase } = useSupportersPage(order);
  const onGiven = useGiven();
  const main = useRef<HTMLElement>(null);
  const screen = useArriveDrawn<HTMLDivElement>(SUPPORTERS_ENTRANCES);
  const blocks = () => SWAP_BLOCKS.map((id) => main.current!.querySelector<HTMLElement>(`#${id}`)!);
  const donate = () => setDonating(true);

  return (
    <div className="supporters-page" ref={screen}>
      <PageBar title="Supporters" titleId="supporters-bar-title" />
      <LayoutSwap phase={phase} blocks={blocks}>
        <main className="supporters" ref={main}>
          <SupportersHero page={page} onDonate={donate} />
          <Notice
            idPrefix="supporters"
            tone={phase === 'error' ? 'error' : 'loading'}
            message={phase === 'error' ? ERROR_MESSAGE : LOADING_MESSAGE}
            hidden={page !== null}
            onRetry={() => query.refetch()}
          />
          <EmptyList shows={phase === 'empty'} onDonate={donate} />
          <Podium page={page} />
          <Roll
            page={page}
            onSort={(next) => {
              setOrder(next);
              sound.play('switch');
            }}
          />
        </main>
      </LayoutSwap>
      <DonateSheet isOpen={donating} onClose={() => setDonating(false)} onGiven={onGiven} />
    </div>
  );
}
