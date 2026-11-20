import { defineRailway, github, project, service } from 'railway/iac';

// Railway never reads this file during a deploy: `railway config apply` sends it, so run that after
// changing it (docs/deploy-railway.md).
export const partial = 'retro-arcade';

export default defineRailway(() => {
  // Railway named the service after the server's workspace package when it first saw the repo.
  const arcade = service('@arcade/server', {
    source: github('Novsochetra/fighting-games', { branch: 'main', checkSuites: false }),
    build: {
      // Vite builds the arcade into dist/, which the server sends; then the build and test tools go.
      // Railpack sets NPM_CONFIG_PRODUCTION=false, which would make npm keep them.
      buildCommand: 'npm run build && NPM_CONFIG_PRODUCTION= npm prune --omit=dev',
      // No watch list, so a change to any file deploys: the server also sends the pages and games.
      // Railway first watched only apps/server/; applying [] once cleared that, and Railway keeps an
      // empty list as null. '/**' still skipped a push that changed only apps/web/.
      watchPatterns: null,
    },
    preDeploy: 'node apps/server/src/db/migrate-cli.js',
    start: 'node apps/server/src/main.js',
    healthcheck: '/api/health',
    healthcheckTimeout: 120,
    replicas: { 'asia-southeast1-eqsg3a': 1 },
    // Restart on failure, up to 10 times, is Railway's default: it keeps that as null, so writing
    // it here would show as a change on every plan.
    deploy: { drainingSeconds: 15 },
  });

  // The live service (apps/live): parties and voice tickets. Its own deploys, so a push to the arcade
  // never restarts a party night; it watches the server files it reuses too.
  const live = service('@arcade/live', {
    source: github('Novsochetra/fighting-games', { branch: 'main', checkSuites: false }),
    build: {
      buildCommand: 'NPM_CONFIG_PRODUCTION= npm prune --omit=dev',
      watchPatterns: [
        'apps/live/**',
        'apps/server/src/http-responses.js',
        'apps/server/src/security/**',
        'package-lock.json',
      ],
    },
    start: 'node apps/live/src/main.js',
    healthcheck: '/api/health',
    healthcheckTimeout: 60,
    // One copy: the parties and the rate limit live in its memory.
    replicas: { 'asia-southeast1-eqsg3a': 1 },
    deploy: { drainingSeconds: 15 },
  });

  return project('Retro Arcade', {
    // The dashboard keeps the variables, the database password among them. The CLI reads this, but
    // the SDK's types don't list it yet.
    // @ts-expect-error -- variables is missing from ProjectDefinition in the railway SDK
    variables: { managed: false },
    resources: [arcade, live],
  });
});
