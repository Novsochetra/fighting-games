import { describeServerUrl, readServerConfig } from './config.js';
import { createArcadeServer } from './create-server.js';

const { port, host } = readServerConfig(process.env);
const server = createArcadeServer();

server.listen(port, host, () => {
  console.log(`Arcade running at ${describeServerUrl(host, server.address().port)}`);
});
