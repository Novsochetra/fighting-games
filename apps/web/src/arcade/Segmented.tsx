import type { CSSProperties } from 'react';

export interface SegmentedOption<Value extends string> {
  value: Value;
  label: string;
}

interface SegmentedProps<Value extends string> {
  id: string;
  label: string;
  options: readonly SegmentedOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
}

// iOS's segmented control (segmented.css): the thumb slides under the chosen option, and the
// hairlines between three options hide beside it.
export function Segmented<Value extends string>(props: SegmentedProps<Value>) {
  const { id, label, options, value, onChange } = props;
  const segment = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const two = options.length === 2;

  return (
    <div
      className={`segmented${two ? ' segmented--two' : ''}`}
      id={id}
      role="group"
      aria-label={label}
      data-segment={segment}
      style={{ '--segment': segment } as CSSProperties}
    >
      <span className="segmented__thumb" aria-hidden="true" />
      {two ? null : options.slice(1).map((option) => <Separator key={option.value} />)}
      {options.map((option) => (
        <button
          className="segmented__option"
          type="button"
          key={option.value}
          data-value={option.value}
          aria-pressed={option.value === value}
          onClick={() => option.value !== value && onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

const Separator = () => <span className="segmented__separator" aria-hidden="true" />;
