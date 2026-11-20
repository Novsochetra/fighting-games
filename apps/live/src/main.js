import { RoomServiceClient } from 'livekit-server-sdk';
import { readLiveConfig } from './config.js';
import { createLiveServer } from './create-live-server.js';

const config = readLiveConfig(process.env);
const voiceApi = config.voice.url.replace(/^ws/, 'http');
const roomService = new RoomServiceClient(voiceApi, config.voice.apiKey, config.voice.apiSecret);
const server = createLiveServer({ config, roomService });

server.listen(config.port, config.host, () => {
  console.log(`Live service on port ${server.address().port}, voice at ${config.voice.url}`);
  console.log(`Games: ${config.games.join(', ')}; pages from: ${config.origins.join(', ')}`);
});

// Railway sends SIGTERM before it stops an old deploy: finish the requests under way.
function shutDown() {
  server.close();
  server.closeIdleConnections();
}

process.once('SIGTERM', shutDown);
process.once('SIGINT', shutDown);
