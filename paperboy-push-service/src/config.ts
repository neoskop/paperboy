import convict from 'convict';

export const config = convict({
  env: {
    doc: 'The applicaton environment.',
    format: ['production', 'development', 'test'],
    env: 'NODE_ENV',
    default: 'development'
  },
  apiToken: {
      doc: 'The bearer token that authenticates a client',
      format: 'String',
      env: 'API_TOKEN',
      default: ''
  },
  queue: {
    uri: {
      doc: 'The AMQP URI',
      format: 'String',
      env: 'QUEUE_URI',
      default: ''
    },
    exchange: {
      doc: 'The name of the exchange to push to',
      format: 'String',
      env: 'QUEUE_EXCHANGE',
      default: 'paperboy'
    },
    source: {
      doc: 'The default source to include in messages to the queue',
      format: 'String',
      default: 'push-notifier'
    }
  }
});

config.validate({ allowed: 'strict' });
