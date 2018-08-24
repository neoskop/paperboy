import { Source, SourceCallback } from '@neoskop/paperboy';

import { MagnoliaSourceOptions } from './magnolia-source-options.interface';
import { MagnoliaSource } from './magnolia-source.module';

export { MagnoliaSourceOptions } from './magnolia-source-options.interface';

export function buildSource(options: MagnoliaSourceOptions, callback: SourceCallback): Source {
  return new MagnoliaSource(options, callback);
}

// buildSource(
//   {
//     name: 'magnolia',
//     output: {
//       excludedProperties: [
//         'mgnl:created',
//         'mgnl:createdBy',
//         'mgnl:lastModified',
//         'mgnl:lastModifiedBy'
//       ],
//       json: 'src',
//       assets: 'src/static/assets'
//     },
//     magnolia: {
//       url: 'http://localhost:8080',
//       damJsonEndpoint: '/.rest/delivery/dam/v1',
//       pagesEndpoint: '/.rest/delivery/website/v1',
//       sitemapEndpoint: '/sitemap',
//       workspaces: ['subsidiaries'],
//       auth: {
//         header: 'Basic c3VwZXJ1c2VyOnN1cGVydXNlcg=='
//       }
//     },
//     queue: {
//       uri: 'amqp://admin:Boo4bah3ohcohthaeHa5ohter0iSeeS0@localhost:5672',
//       exchangeName: 'paperboy_preview'
//     }
//   },
//   () => Promise.resolve()
// ).start();
