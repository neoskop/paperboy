import { Paperboy } from './paperboy';

new Paperboy({
  command: 'echo "foobar"',
  queue: {
    uri: process.env.QUEUE_URI
  }
}).start();
