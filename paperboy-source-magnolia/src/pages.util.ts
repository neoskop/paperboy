import * as fs from "fs";
import * as request from "request";
import * as retry from "retry";

import { MagnoliaSourceOptions } from "./magnolia-source-options.interface";
import { MagnoliaLoadingParams } from "./magnolia-loading-params.interface";

export function fetchSitemap(
  options: MagnoliaSourceOptions
): Promise<string[]> {
  return loadDataFromMagnolia<string[]>({
    authHeader: options.magnolia.auth.header,
    url: options.magnolia.url + options.magnolia.sitemapEndpoint,
    errorMessage:
      "Attempt to get the sitemap failed, will retry in some time...",
    resolverHandler: body => body,
    retryOptions: { forever: true }
  });
}

export function fetchWorkspace(
  workspace: string,
  options: MagnoliaSourceOptions
): Promise<any> {
  return loadDataFromMagnolia<any>({
    authHeader: options.magnolia.auth.header,
    url: options.magnolia.url + "/.rest/delivery/" + workspace + "/v1",
    errorMessage: `Attempt to get workspace ${workspace} failed, will retry in some time...`,
    resolverHandler: body => body.results
  });
}

export function fetchPages(options: MagnoliaSourceOptions): Promise<any> {
  return loadDataFromMagnolia<any>({
    authHeader: options.magnolia.auth.header,
    url: options.magnolia.url + options.magnolia.pagesEndpoint,
    errorMessage: `Attempt to get pages failed, will retry in some time...`,
    resolverHandler: body => body.results
  });
}

function loadDataFromMagnolia<T>(params: MagnoliaLoadingParams<T>) {
  const operation = retry.operation(params.retryOptions);
  return new Promise<T>(resolve => {
    operation.attempt(() => {
      request.get(
        params.url,
        {
          json: true,
          headers: {
            Authorization: params.authHeader,
            "User-Agent": "Paperboy"
          }
        },
        (error, response, body: T) => {
          const operationError =
            error || (response && response.statusCode !== 200)
              ? new Error(`Return code was: ${response.statusCode}`)
              : undefined;

          if (operation.retry(operationError)) {
            console.error(params.errorMessage);

            if (error) {
              console.error(error);
            }

            return;
          }

          resolve(params.resolverHandler(body));
        }
      );
    });
  });
}

export function writePagesFile(
  pages: any[],
  options?: MagnoliaSourceOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(options.output.json)) {
      fs.mkdirSync(options.output.json);
    }

    fs.writeFile(
      options.output.json + "/pages.json",
      JSON.stringify(pages),
      err => {
        if (err) {
          reject(err);
        }

        resolve();
      }
    );
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
      options.output.json + "/" + workspace + ".json",
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
  sourceOptions: MagnoliaSourceOptions,
  workspaces: { [workspace: string]: any } = {}
): any {
  const sanitized: any = {};

  if (json) {
    Object.keys(json).forEach(key => {
      const isKeyExcluded =
        sourceOptions &&
        sourceOptions.output.excludedProperties &&
        sourceOptions.output.excludedProperties.findIndex(
          prop => prop === key
        ) > -1;

      if (!isKeyExcluded && key === "@nodes") {
        const contentOrder: string[] = json[key];

        if (contentOrder.length > 0) {
          sanitized[key.substr(1)] = contentOrder.map(contentKeyIndex =>
            sanitizeJson(
              json[contentKeyIndex],
              damAssets,
              pages,
              sourceOptions,
              workspaces
            )
          );
        }
      } else if (!isKeyExcluded && key !== "content" && !key.match(/^\d+$/)) {
        const originalKey = key;
        const sanitizedKey = key
          .replace(/^@/, "")
          .replace(/^mgnl:/, "")
          .replace(/^jcr:uuid/, "id");

        if (!sanitizedKey.match(/^jcr:/)) {
          if (typeof json[key] === "object" && !Array.isArray(json[key])) {
            sanitized[sanitizedKey] = sanitizeJson(
              json[key],
              damAssets,
              pages,
              sourceOptions,
              workspaces
            );
          } else {
            let items = Array.isArray(json[key]) ? json[key] : [json[key]];

            items = items.map((item: any) => {
              if (
                item.match(
                  /^jcr:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
                )
              ) {
                const uuid = item.replace("jcr:", "");
                return damAssets.find(
                  damAsset => damAsset && damAsset.id === uuid
                );
              } else if (
                !originalKey.match(/^@/) &&
                !originalKey.match(/^jcr:uuid/) &&
                item.match(
                  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
                )
              ) {
                const node = getPopulatedNode(item, pages);
                let value: any;

                if (node) {
                  value = Object.assign(node || {}, {
                    workspace: "website"
                  });
                } else {
                  const asset = getPopulatedNode(item, damAssets);

                  if (asset) {
                    value = Object.assign(asset || {}, {
                      workspace: "dam"
                    });
                  } else {
                    const workspaceNode = Object.keys(workspaces)
                      .map(key => workspaces[key])
                      .map(workspace =>
                        Object.assign({}, getPopulatedNode(item, workspace), {
                          workspace: key
                        })
                      )
                      .shift();

                    value = Object.assign(workspaceNode || {}, {
                      workspace: workspaceNode ? workspaceNode.workspace : null
                    });
                  }
                }

                return value;
              } else {
                return item;
              }
            });

            sanitized[sanitizedKey] = Array.isArray(json[key])
              ? items
              : items[0];
          }
        }
      }
    });
  }

  return sanitized;
}

export function getPopulatedNode(
  id: string,
  source: any,
  populatedNode?: any
): any {
  if (populatedNode || !source) {
    return populatedNode;
  } else {
    if (source["jcr:uuid"] === id || source.id === id) {
      populatedNode = {
        id,
        path: source["@path"] || source.path
      };
    } else {
      Object.keys(source).forEach(key => {
        if (source[key] && typeof source[key] === "object") {
          populatedNode = getPopulatedNode(id, source[key], populatedNode);
        }
      });
    }

    return populatedNode;
  }
}
