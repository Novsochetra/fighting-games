import { describe, expect, it } from 'vitest';
import { DEFAULT_PORT, readLiveConfig } from '../../src/config.js';

const voiceEnv = {
  LIVEKIT_URL: 'wss://voice.morodokangkor.com',
  LIVEKIT_API_KEY: 'APIkey',
  LIVEKIT_API_SECRET: 'the-secret',
};

describe('the live service settings', () => {
  it('fall back to the arcade games and their sites', () => {
    const config = readLiveConfig(voiceEnv);

    expect(config.port).toBe(DEFAULT_PORT);
    expect(config.host).toBe('127.0.0.1');
    expect(config.trustProxy).toBe(false);
    expect(config.games).toEqual(['morodok-angkor']);
    expect(config.origins).toContain('https://morodokangkor.com');
    expect(config.voice).toEqual({
      url: 'wss://voice.morodokangkor.com',
      apiKey: 'APIkey',
      apiSecret: 'the-secret',
      roomPrefix: '',
    });
  });

  it('read lists with spaces, and Railway defaults', () => {
    const config = readLiveConfig({
      ...voiceEnv,
      RAILWAY_ENVIRONMENT_ID: 'env',
      LIVE_GAMES: 'morodok-angkor, kit-luy',
      ALLOWED_ORIGINS: 'https://a.test , https://b.test',
      ROOM_PREFIX: 'test-',
    });

    expect(config.host).toBe('0.0.0.0');
    expect(config.trustProxy).toBe(true);
    expect(config.games).toEqual(['morodok-angkor', 'kit-luy']);
    expect(config.origins).toEqual(['https://a.test', 'https://b.test']);
    expect(config.voice.roomPrefix).toBe('test-');
  });

  it('name the missing voice settings without showing any value', () => {
    expect(() => readLiveConfig({ LIVEKIT_URL: 'wss://x' })).toThrow(
      'Set LIVEKIT_API_KEY, LIVEKIT_API_SECRET for the voice server',
    );
  });

  it('refuse a port that is not one', () => {
    expect(() => readLiveConfig({ ...voiceEnv, PORT: 'eighty' })).toThrow('PORT must be');
  });
});
