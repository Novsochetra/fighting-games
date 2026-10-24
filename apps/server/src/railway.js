// Railway sets RAILWAY_ENVIRONMENT_ID in every deployment (docs/deploy-railway.md).
export const onRailway = (env) => Boolean(env.RAILWAY_ENVIRONMENT_ID);

const POSTGRES_URL = /^postgres(ql)?:\/\//i;

// Without Postgres the server keeps gifts in memory, and a deploy replaces the memory, so on Railway
// it refuses to start instead. The value is never shown: it holds the password.
export function railwayProblem(env) {
  if (!onRailway(env) || POSTGRES_URL.test(env.DATABASE_URL?.trim() ?? '')) {
    return null;
  }
  return (
    'DATABASE_URL is not a postgres:// URL (its value is not shown). On Railway set it to ' +
    '${{Postgres.DATABASE_URL}}, without quotes, or every supporter is lost on the next deploy.'
  );
}

// Railway's edge proxy is the only way in: listen on every interface and trust its one hop for the
// visitor's address. A variable that is set still wins.
export function withRailwayDefaults(env) {
  if (!onRailway(env)) {
    return env;
  }
  const problem = railwayProblem(env);
  if (problem) {
    throw new Error(problem);
  }
  return { ...env, HOST: env.HOST || '0.0.0.0', TRUST_PROXY: env.TRUST_PROXY || '1' };
}
