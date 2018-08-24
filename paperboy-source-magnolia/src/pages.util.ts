import * as fs from 'fs';
import * as request from 'request';
import * as retry from 'retry';

import { MagnoliaSourceOptions } from './magnolia-source-options.interface';

export function fetchSitemap(options: MagnoliaSourceOptions): Promise<string[]> {
  const operation = retry.operation({ forever: true });

  return new Promise((resolve, reject) => {
    operation.attempt(() => {
      request.get(
        options.magnolia.url + options.magnolia.sitemapEndpoint,
        {
          json: true,
          headers: {
            Authorization: options.magnolia.auth.header,
            'User-Agent': 'Paperboy'
          }
        },
        (err, res, body: string[]) => {
          if (operation.retry(err)) {
            console.error('Attempt to get the sitemap failed, will retry in some time...');
            console.error(err);
            return;
          }

          if (res && res.statusCode === 200) {
            resolve(body);
          } else {
            reject(res ? res.statusCode : '');
          }
        }
      );
    });
  });
}

export function fetchWorkspace(workspace: string, options: MagnoliaSourceOptions): Promise<any> {
  const operation = retry.operation();

  return new Promise((resolve, reject) => {
    operation.attempt(() => {
      request.get(
        options.magnolia.url + '/.rest/delivery/' + workspace + '/v1',
        {
          json: true,
          headers: {
            Authorization: options.magnolia.auth.header,
            'User-Agent': 'Paperboy'
          }
        },
        (err, res, body) => {
          if (operation.retry(err)) {
            console.error('Attempt to get pages failed, will retry in some time...');
            return;
          }

          if (res && res.statusCode === 200) {
            resolve(body.results);
          } else {
            reject(res ? res.statusCode : '');
          }
        }
      );
    });
  });
}

export function fetchPages(options: MagnoliaSourceOptions): Promise<any> {
  const operation = retry.operation();

  return new Promise((resolve, reject) => {
    operation.attempt(() => {
      request.get(
        options.magnolia.url + options.magnolia.pagesEndpoint,
        {
          json: true,
          headers: {
            Authorization: options.magnolia.auth.header,
            'User-Agent': 'Paperboy'
          }
        },
        (err, res, body) => {
          if (operation.retry(err)) {
            console.error('Attempt to get pages failed, will retry in some time...');
            return;
          }

          if (res && res.statusCode === 200) {
            resolve(body.results);
          } else {
            reject(res ? res.statusCode : '');
          }
        }
      );
    });
  });
}

export function writePagesFile(pages: any[], options?: MagnoliaSourceOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(options.output.json)) {
      fs.mkdirSync(options.output.json);
    }

    fs.writeFile(options.output.json + '/pages.json', JSON.stringify(pages), err => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
}

export function writeWorkspaceFile(
  workspace: string,
  workspaceData: any,
  options?: MagnoliaSourceOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(options.output.json)) {
      fs.mkdirSync(options.output.json);
    }

    fs.writeFile(
      options.output.json + '/' + workspace + '.json',
      JSON.stringify(workspaceData),
      err => {
        if (err) {
          reject(err);
        }

        resolve();
      }
    );
  });
}

export function sanitizeJson(
  json: any,
  damAssets: any[],
  pages: any,
  sourceOptions: MagnoliaSourceOptions
): any {
  const sanitized: any = {};

  if (json) {
    Object.keys(json).forEach(key => {
      const isKeyExcluded =
        sourceOptions &&
        sourceOptions.output.excludedProperties &&
        sourceOptions.output.excludedProperties.findIndex(prop => prop === key) > -1;

      if (!isKeyExcluded && key === '@nodes') {
        const contentOrder: string[] = json[key];

        if (contentOrder.length > 0) {
          sanitized[key.substr(1)] = contentOrder.map(contentKeyIndex =>
            sanitizeJson(json[contentKeyIndex], damAssets, pages, sourceOptions)
          );
        }
      } else if (!isKeyExcluded && key !== 'content' && !key.match(/^\d+$/)) {
        const originalKey = key;
        const sanitizedKey = key
          .replace(/^@/, '')
          .replace(/^mgnl:/, '')
          .replace(/^jcr:uuid/, 'id');

        if (!sanitizedKey.match(/^jcr:/)) {
          if (typeof json[key] === 'object') {
            sanitized[sanitizedKey] = sanitizeJson(json[key], damAssets, pages, sourceOptions);
          } else {
            if (
              json[key].match(
                /^jcr:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
              )
            ) {
              const uuid = json[key].replace('jcr:', '');
              sanitized[sanitizedKey] = damAssets.find(
                damAsset => damAsset && damAsset.id === uuid
              );
            } else if (
              !originalKey.match(/^@/) &&
              !originalKey.match(/^jcr:uuid/) &&
              json[key].match(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
              )
            ) {
              const node = getPopulatedNode(json[key], pages);
              let value: any;

              if (node) {
                value = Object.assign(getPopulatedNode(json[key], pages) || {}, {
                  workspace: 'website'
                });
              } else {
                value = Object.assign(getPopulatedNode(json[key], damAssets) || {}, {
                  workspace: 'dam'
                });
              }

              sanitized[sanitizedKey] = value;
            } else {
              sanitized[sanitizedKey] = json[key];
            }
          }
        }
      }
    });
  }

  return sanitized;
}

export function getPopulatedNode(id: string, source: any, populatedNode?: any): any {
  if (populatedNode || !source) {
    return populatedNode;
  } else {
    if (source['jcr:uuid'] === id || source.id === id) {
      populatedNode = {
        id,
        path: source['@path'] || source.path
      };
    } else {
      Object.keys(source).forEach(key => {
        if (source[key] && typeof source[key] === 'object') {
          populatedNode = getPopulatedNode(id, source[key], populatedNode);
        }
      });
    }

    return populatedNode;
  }
}
