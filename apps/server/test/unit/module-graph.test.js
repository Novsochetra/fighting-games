import { describe, expect, it } from 'vitest';
import { strongComponents } from '../../src/static-site/module-graph.js';

const graphOf = (edges) => new Map(Object.entries(edges));
const sorted = (components) => components.map((component) => [...component].sort());

describe('strongComponents', () => {
  it('lists modules dependencies first', () => {
    const order = strongComponents(
      graphOf({ main: ['a', 'b'], a: ['leaf'], b: [], leaf: [] }),
    ).flat();
    expect(order.indexOf('leaf')).toBeLessThan(order.indexOf('a'));
    expect(order.indexOf('a')).toBeLessThan(order.indexOf('main'));
    expect(order.indexOf('b')).toBeLessThan(order.indexOf('main'));
  });

  it('groups modules that import each other into one component, after what they import', () => {
    const components = strongComponents(
      graphOf({ main: ['x'], x: ['y'], y: ['z', 'x'], z: ['leaf'], leaf: [] }),
    );
    expect(sorted(components)).toEqual([['leaf'], ['z'], ['x', 'y'], ['main']]);
  });

  it('ignores imports of modules outside the graph', () => {
    expect(sorted(strongComponents(graphOf({ main: ['elsewhere'] })))).toEqual([['main']]);
  });
});
