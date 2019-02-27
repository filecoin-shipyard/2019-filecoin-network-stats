import {fromEnv} from './Config';
import Backend from './Backend';
import heapdump = require('heapdump');

heapdump.writeSnapshot((err, filename) => {
  console.log('Heap dump written to:', filename)
});

const config = fromEnv();
const backend = new Backend(config);

(async function() {
  await backend.start();
})();