import { describeServerUrl, readServerConfig } from './config.js';
import { createArcadeServer } from './create-server.js';
import { withRailwayDefaults } from './railway.js';
import { openSupportersStore } from './supporters/open-store.js';

const { port, host, databaseUrl, trustProxy } = readServerConfig(withRailwayDefaults(process.env));
const { supporters, close, description } = openSupportersStore({ databaseUrl });
const server = createArcadeServer({ supporters, trustProxy });

server.listen(port, host, () => {
  console.log(`Arcade running at ${describeServerUrl(host, server.address().port)}`);
  console.log(description);
});

// Railway sends SIGTERM before it stops an old deploy: finish the requests under way, then let the
// database pool go.
function shutDown() {
  server.close(() => close());
  server.closeIdleConnections();
}

process.once('SIGTERM', shutDown);
process.once('SIGINT', shutDown);
