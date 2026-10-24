export const DEFAULT_PORT = 8765;
export const DEFAULT_HOST = '127.0.0.1';

const LOOPBACK_AND_ANY_HOSTS = new Set(['127.0.0.1', '0.0.0.0', '::', '::1']);

export function readServerConfig(env) {
  return {
    port: readPort(env.PORT),
    host: env.HOST || DEFAULT_HOST,
    databaseUrl: env.DATABASE_URL?.trim() ?? '',
    trustProxy: env.TRUST_PROXY === '1',
  };
}

function readPort(value) {
  if (value === undefined || value === '') {
    return DEFAULT_PORT;
  }
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`PORT must be a whole number from 0 to 65535, got "${value}"`);
  }
  return port;
}

export function describeServerUrl(host, port) {
  if (LOOPBACK_AND_ANY_HOSTS.has(host)) {
    return `http://localhost:${port}/`;
  }
  const shownHost = host.includes(':') ? `[${host}]` : host;
  return `http://${shownHost}:${port}/`;
}
