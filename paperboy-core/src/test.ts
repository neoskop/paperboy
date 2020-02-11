import { Paperboy } from './paperboy';

new Paperboy({
  command: 'echo "foobar"',
  initialCommand: 'echo "baz"',
  queue: {
    uri: process.env.QUEUE_URI
  }
}).start();
