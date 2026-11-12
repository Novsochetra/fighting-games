import { describe, expect, it } from 'vitest';
import { KIND_OF } from '../../../src/data/customers.js';
import { STAGES } from '../../../src/data/stages.js';
import { nextCustomer } from '../../../src/sim/customers.js';
import { fewestPieces } from '../../../src/sim/pieces.js';
import { createRun } from '../../../src/sim/run.js';
import { ALL } from './serving.js';

const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function customersOf(run, count) {
  const customers = [run.queue[0], run.arriving.customer];

  while (customers.length < count) {
    customers.push(nextCustomer(run));
  }

  return customers;
}

const firstOf = (seed, ops) => createRun({ seed, ops }).queue[0];

const sumsOf = (customers) => customers.map((customer) => customer.question.op);

function bagsOf(customers, size) {
  const bags = [];

  for (let i = 0; i + size <= customers.length; i += size) {
    bags.push(sumsOf(customers.slice(i, i + size)).sort());
  }

  return bags;
}

describe('the first customer', () => {
  it.each([[ALL], [['add']], [['add', 'div']], [['sub', 'add', 'mul']]])(
    'asks 500 + 500 when the mix %j has additions',
    (ops) => {
      for (const seed of SEEDS) {
        expect(firstOf(seed, ops)).toEqual({
          id: 1,
          kind: 'shopper',
          question: { op: 'add', left: 500, right: 500, answer: 1000 },
        });
      }
    },
  );

  it('asks a sum from the mix when it has no additions', () => {
    const sums = SEEDS.map((seed) => firstOf(seed, ['sub', 'mul', 'div']).question.op);

    expect(sums).not.toContain('add');
    expect(new Set(sums).size).toBeGreaterThan(1);
    expect(firstOf(4, ['div']).question.op).toBe('div');
  });
});

describe('customers', () => {
  it('count up from 1 through the run', () => {
    const ids = customersOf(createRun({ seed: 5, ops: ALL }), 40).map((customer) => customer.id);

    expect(ids).toEqual(Array.from({ length: 40 }, (_, i) => i + 1));
  });

  it('are who asks their kind of sum', () => {
    expect(KIND_OF).toEqual({ add: 'shopper', sub: 'driver', mul: 'cook', div: 'students' });

    for (const { kind, question } of customersOf(createRun({ seed: 6, ops: ALL }), 80)) {
      expect(kind).toBe(KIND_OF[question.op]);
    }
  });

  it.each([[ALL], [['sub', 'mul']], [['add', 'mul', 'div']], [['div']]])(
    'hold one of each sum of the mix %j in every bag',
    (ops) => {
      for (const seed of SEEDS) {
        const customers = customersOf(createRun({ seed, ops }), ops.length * 25);

        for (const bag of bagsOf(customers, ops.length)) {
          expect(bag).toEqual([...ops].sort());
        }
      }
    },
  );

  it('come in a new order from bag to bag', () => {
    const customers = customersOf(createRun({ seed: 8, ops: ALL }), 80);
    const orders = new Set();

    for (let i = 0; i < customers.length; i += 4) {
      orders.add(sumsOf(customers.slice(i, i + 4)).join());
    }

    expect(orders.size).toBeGreaterThan(5);
  });

  it.each([[ALL], [['add']], [['sub']]])(
    'never ask the same sum twice running in the mix %j',
    (ops) => {
      const customers = customersOf(createRun({ seed: 9, ops }), 300);

      for (let i = 1; i < customers.length; i++) {
        const { op, left, right } = customers[i - 1].question;

        expect(customers[i].question).not.toMatchObject({ op, left, right });
      }
    },
  );

  it('ask sums of the stage the run has reached', () => {
    const run = createRun({ seed: 10, ops: ALL });

    run.served = STAGES[3].from;

    const answers = customersOf(run, 200)
      .slice(2)
      .map((customer) => customer.question.answer);

    expect(Math.max(...answers)).toBeGreaterThan(STAGES[2].most);

    for (const answer of answers) {
      expect(answer).toBeLessThanOrEqual(STAGES[3].most);
      expect(fewestPieces(answer, STAGES[3].pieces)).toBeLessThanOrEqual(STAGES[3].mostPieces);
    }
  });
});
