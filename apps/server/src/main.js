import { describeServerUrl, readServerConfig } from './config.js';
import { createArcadeServer } from './create-server.js';
import { openStores } from './db/open-stores.js';
import { DIST_ROOT } from './paths.js';
import { withRailwayDefaults } from './railway.js';
import { createBuiltFiles, createDevFiles } from './routes/app-files.js';
import { openStorage } from './storage/open-storage.js';

const env = withRailwayDefaults(process.env);
const { port, host, databaseUrl, trustProxy } = readServerConfig(env);
const { stores, close, description } = openStores({ databaseUrl });
const files = openStorage(env);
// npm run dev passes --dev; npm start, on Railway too, serves the build
const isDev = process.argv.includes('--dev');
const serveFiles = isDev ? await createDevFiles() : await createBuiltFiles({ distRoot: DIST_ROOT });
const server = createArcadeServer({ ...stores, storage: files.storage, trustProxy, serveFiles });

server.listen(port, host, () => {
  console.log(`Arcade running at ${describeServerUrl(host, server.address().port)}`);
  console.log(description);
  console.log(files.description);
});

// Railway sends SIGTERM before it stops an old deploy: finish the requests under way, then let the
// database pool go.
function shutDown() {
  server.close(() => close());
  server.closeIdleConnections();
}

process.once('SIGTERM', shutDown);
process.once('SIGINT', shutDown);
