import { afterEach, describe, expect, it } from 'vitest';
import { createGameDriver, createScenarioGame } from '../support/game-driver.js';
import { portableCos, portableSin } from '../support/portable-trig.js';
import { createRecordedRenderer } from '../support/recorded-view.js';
import { runScenario } from '../support/run-scenario.js';
import { SCENARIOS } from '../support/scenarios.js';
import { seededRandom } from '../support/seeded-random.js';

// The fixtures were first captured from the single-file game this code was split out of, so a
// match proves the split kept every number, random draw and canvas call the same. Run
// `npm run test:regression -- -u` only when a behavior change is intended, and review the diff.
// The native sine and cosine round some last bits differently on Apple Silicon than on x64, so the
// runs use a port that gives x64's bits everywhere (regression/bugs/arm64-sine-rounding.test.js).
const originalMath = { random: Math.random, sin: Math.sin, cos: Math.cos };

function play(scenario) {
  Object.assign(Math, { random: seededRandom(scenario.seed), sin: portableSin, cos: portableCos });
  const game = createScenarioGame(scenario.hero, scenario.mission);
  const result = runScenario(createGameDriver(game, createRecordedRenderer()), scenario);
  return `${JSON.stringify(result, null, 1)}\n`;
}

describe('recorded scenarios', () => {
  afterEach(() => {
    Object.assign(Math, originalMath);
  });

  for (const [name, scenario] of Object.entries(SCENARIOS)) {
    it(`replays the ${name} run tick for tick and frame for frame`, async () => {
      await expect(play(scenario)).toMatchFileSnapshot(`./fixtures/scenario-${name}.json`);
    });
  }
});
