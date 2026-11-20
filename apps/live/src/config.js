export const DEFAULT_PORT = 8766;

const DEFAULT_ORIGINS =
  'https://morodokangkor.com,https://www.morodokangkor.com,https://khmerarcade.games';
const DEFAULT_GAMES = 'morodok-angkor';
const VOICE_VARIABLES = ['LIVEKIT_URL', 'LIVEKIT_API_KEY', 'LIVEKIT_API_SECRET'];

function listOf(value, fallback) {
  return (value || fallback)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function readPort(value) {
  const port = value === undefined || value === '' ? DEFAULT_PORT : Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`PORT must be a whole number from 0 to 65535, got "${value}"`);
  }

  return port;
}

// The secret is never printed: only the name of a variable that is missing.
function readVoice(env) {
  const missing = VOICE_VARIABLES.filter((name) => !env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`Set ${missing.join(', ')} for the voice server (docs/deploy-railway.md)`);
  }

  return {
    url: env.LIVEKIT_URL.trim(),
    apiKey: env.LIVEKIT_API_KEY.trim(),
    apiSecret: env.LIVEKIT_API_SECRET.trim(),
    roomPrefix: env.ROOM_PREFIX ?? '',
  };
}

// On Railway its edge proxy is the only way in: every interface, and one trusted hop.
export function readLiveConfig(env) {
  const onRailway = Boolean(env.RAILWAY_ENVIRONMENT_ID);

  return {
    port: readPort(env.PORT),
    host: env.HOST || (onRailway ? '0.0.0.0' : '127.0.0.1'),
    trustProxy: (env.TRUST_PROXY || (onRailway ? '1' : '')) === '1',
    origins: listOf(env.ALLOWED_ORIGINS, DEFAULT_ORIGINS),
    games: listOf(env.LIVE_GAMES, DEFAULT_GAMES),
    voice: readVoice(env),
  };
}
