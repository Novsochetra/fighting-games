import { Segmented } from '@/components/segmented/Segmented';
import { PodiumPlace, RollRow, type Supporter } from './SupporterParts';

export type SortOrder = 'top' | 'recent';

// The supporters screen as view-model.js puts it together.
export interface SupportersView {
  order: SortOrder;
  isEmpty: boolean;
  totalLabel: string;
  countLabel: string;
  podium: Supporter[];
  rows: Supporter[];
}

const SORT_OPTIONS = [
  { value: 'top', label: 'Top' },
  { value: 'recent', label: 'Recent' },
] as const;

export function EmptyList({ shows, onDonate }: { shows: boolean; onDonate: () => void }) {
  return (
    <section className="empty" id="empty" aria-labelledby="empty-title" hidden={!shows}>
      <h2 className="empty__title" id="empty-title">
        No supporters yet
      </h2>
      <p className="empty__body">Be the first to help keep every game free.</p>
      <button
        className="pill-button pill-button--surface empty__donate"
        id="donate-first"
        type="button"
        onClick={onDonate}
      >
        Be the first supporter
      </button>
    </section>
  );
}

export function Podium({ page }: { page: SupportersView | null }) {
  return (
    <section
      className="podium-section"
      id="podium-section"
      aria-labelledby="podium-title"
      hidden={!page || page.isEmpty}
    >
      <h2 className="section-title" id="podium-title">
        Top supporters
      </h2>
      <ol className="podium" id="podium">
        {page?.podium.map((supporter, place) => (
          <PodiumPlace key={place} supporter={supporter} />
        ))}
      </ol>
    </section>
  );
}

interface RollProps {
  page: SupportersView | null;
  onSort: (order: SortOrder) => void;
}

export function Roll({ page, onSort }: RollProps) {
  return (
    <section
      className="roll"
      id="roll"
      aria-labelledby="roll-title"
      data-order={page?.order}
      hidden={!page || page.isEmpty}
    >
      <header className="roll__header">
        <h2 className="section-title" id="roll-title">
          Everyone
        </h2>
        <Segmented
          id="sort"
          label="Sort supporters"
          options={SORT_OPTIONS}
          value={page?.order ?? 'top'}
          onChange={onSort}
        />
      </header>
      <ol className="roll__list" id="roll-list" aria-labelledby="roll-title">
        {page?.rows.map((supporter, order) => (
          <RollRow key={`${page.order}-${order}`} supporter={supporter} order={order} />
        ))}
      </ol>
    </section>
  );
}
