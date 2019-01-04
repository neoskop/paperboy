import * as fs from 'fs-extra';
import * as request from 'request';
import * as retry from 'retry';

import { MagnoliaSourceOptions } from './magnolia-source-options.interface';

export function fetchDamAssets(uuids: string[], options?: MagnoliaSourceOptions): Promise<any> {
  return new Promise(resolve => {
    const operation = retry.operation();
    const damUrl = options.magnolia.url + options.magnolia.damJsonEndpoint;

    request.get(
      damUrl,
      {
        json: true,
        headers: {
          Authorization: options.magnolia.auth.header,
          'User-Agent': 'Paperboy'
        }
      },
      async (err, res, body) => {
        if (operation.retry(err)) {
          console.error('Attempt to get asset information failed, will retry in some time...');
          return;
        }

        if (body && body.results && body.results.length > 0) {
          const sanitizedAssetJson = uuids
            .map(uuid => body.results.find((asset: any) => asset['jcr:uuid'] === uuid || asset['@id'] === uuid))
            .map(json => json ? sanitizeDamJson(json) : null);

          const assetsNeedingUpdate = sanitizedAssetJson.filter(asset => {
            if (asset) {
              const filePath = options.output.assets + asset.path;
              const fileExists = fs.existsSync(filePath);

              if (fileExists) {
                return (
                  new Date(fs.statSync(filePath).mtime).getTime() <
                  new Date(asset.lastModified).getTime()
                );
              }
            }

            return true;
          });

          await Promise.all(assetsNeedingUpdate.map(asset => downloadAsset(options, asset)));

          resolve(sanitizedAssetJson);
        }
      }
    );
  });
}

function sanitizeDamJson(damJson: any): any {
  const sanitized: any = {};

  Object.keys(damJson).forEach(async key => {
    const sanitizedKey = key
      .replace(/^@path/, 'path')
      .replace(/^@/, '')
      .replace(/^mgnl:/, '')
      .replace(/^jcr:uuid/, 'id')
      .replace(/^jcr:mimeType/, 'mimeType');

    if (!sanitizedKey.match(/^jcr:/)) {
      sanitized[sanitizedKey] = damJson[key];
    }
  });

  return sanitized;
}

function downloadAsset(options: MagnoliaSourceOptions, asset: any): Promise<void> {
  return new Promise(resolve => {
    if (asset) {
      const filePath = options.output.assets + asset.path;
      const directory = filePath
        .split('/')
        .slice(0, -1)
        .join('/');

      fs.mkdirpSync(directory);

      request
        .get(options.magnolia.url + '/dam/jcr:' + asset.id, {
          headers: {
            Authorization: options.magnolia.auth.header,
            'User-Agent': 'Paperboy'
          }
        })
        .on('response', res => {
          res.pipe(fs.createWriteStream(filePath));

          res.on('end', () => {
            resolve();
          });
        });
    } else {
      resolve();
    }
  });
}
