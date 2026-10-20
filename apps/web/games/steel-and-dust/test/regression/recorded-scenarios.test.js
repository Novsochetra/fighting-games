import { afterEach, describe, expect, it } from 'vitest';
import { createGameDriver, createScenarioGame } from '../support/game-driver.js';
import { createRecordedRenderer } from '../support/recorded-view.js';
import { runScenario } from '../support/run-scenario.js';
import { SCENARIOS } from '../support/scenarios.js';
import { seededRandom } from '../support/seeded-random.js';

// The fixtures were first captured from the single-file game this code was split out of, so a
// match proves the split kept every number, random draw and canvas call the same. Run
// `npm run test:regression -- -u` only when a behavior change is intended, and review the diff.
const originalRandom = Math.random;

function play(scenario) {
  Math.random = seededRandom(scenario.seed);
  const game = createScenarioGame(scenario.hero);
  const result = runScenario(createGameDriver(game, createRecordedRenderer()), scenario);
  return `${JSON.stringify(result, null, 1)}\n`;
}

describe('recorded scenarios', () => {
  afterEach(() => {
    Math.random = originalRandom;
  });

  for (const [name, scenario] of Object.entries(SCENARIOS)) {
    it(`replays the ${name} run tick for tick and frame for frame`, async () => {
      await expect(play(scenario)).toMatchFileSnapshot(`./fixtures/scenario-${name}.json`);
    });
  }
});
