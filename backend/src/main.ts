import {fromEnv} from './Config';
import Backend from './Backend';
require('heapdump');

const config = fromEnv();
const backend = new Backend(config);

(async function() {
  await backend.start();
})();