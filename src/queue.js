import 'dotenv/config';

import Queue from './lib/Queue';

Queue.processQueues();

console.log('Queues server online');
