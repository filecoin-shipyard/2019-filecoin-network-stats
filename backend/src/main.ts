import {fromEnv} from './Config';
import Backend from './Backend';

const config = fromEnv();
const backend = new Backend(config);

(async function() {
  await backend.start();
})();