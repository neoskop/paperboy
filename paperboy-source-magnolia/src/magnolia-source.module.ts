import { connect, Message, Connection } from "amqplib";

import { Source, SourceCallback, SourceOptions } from "@neoskop/paperboy";

import { fetchDamAssets } from "./dam.util";
import { MagnoliaSourceOptions } from "./magnolia-source-options.interface";
import {
  fetchPages,
  fetchSitemap,
  fetchWorkspace,
  sanitizeJson,
  writePagesFile,
  writeWorkspaceFile
} from "./pages.util";
import * as retry from "retry";

import AsyncLock = require("async-lock");

export class MagnoliaSource implements Source {
  private readonly options: MagnoliaSourceOptions;
  private readonly callback: SourceCallback;
  private readonly generationLock: AsyncLock = new AsyncLock({ maxPending: 1 });

  constructor(options: SourceOptions, callback: SourceCallback) {
    this.options = <MagnoliaSourceOptions>options;
    this.callback = callback;
  }

  public generate(): Promise<void> {
    return new Promise(async resolve => {
      const sitemap = await fetchSitemap(this.options);
      const website = await fetchPages(this.options);
      const pages = sitemap
        .map(
          path => website && website.find((page: any) => page["@path"] === path)
        )
        .filter(page => typeof page !== "undefined");

      const workspaces: { [workspace: string]: any } = {};

      if (this.options.magnolia.workspaces) {
        for (const workspace of this.options.magnolia.workspaces) {
          workspaces[workspace] = await fetchWorkspace(workspace, this.options);
        }
      }

      // get dam jcr ids
      const nodes = pages.concat(
        Object.keys(workspaces).reduce(
          (prev, current) => prev.concat(workspaces[current]),
          []
        )
      );
      const match = JSON.stringify(nodes).match(
        /jcr:([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/g
      );

      let damUuids = match ? match.map(id => id.substring(4)) : [];
      damUuids = damUuids.filter((id, pos) => {
        return damUuids.indexOf(id) === pos;
      });

      const damAssets = await fetchDamAssets(damUuids, this.options);
      const pagesObj: any = pages.map((page: any) =>
        sanitizeJson(page, damAssets, pages, this.options, workspaces)
      );

      await writePagesFile(pagesObj, this.options);

      if (this.options.magnolia.workspaces) {
        for (const workspace of Object.keys(workspaces)) {
          const workspaceData = workspaces[workspace];

          if (workspaceData) {
            const sanitized: any[] = [];

            for (const item of workspaceData) {
              sanitized.push(
                sanitizeJson(
                  item,
                  damAssets,
                  workspaceData,
                  this.options,
                  workspaces
                )
              );
            }

            await writeWorkspaceFile(workspace, sanitized, this.options);
          }
        }
      }

      resolve();
    });
  }

  public async start(): Promise<void> {
    const operation = retry.operation({ forever: true });
    let conn: Connection;
    operation.attempt(
      async () => {
        try {
          conn = await connect(this.options.queue.uri);
          ["error", "close"].forEach($event =>
            conn.on($event, this.retryConnection.bind(this, this.options.queue))
          );
          const channel = await conn.createChannel();

          await channel.assertExchange(
            this.options.queue.exchangeName || "paperboy",
            "fanout",
            {
              durable: false
            }
          );

          const qok = await channel.assertQueue(null, {
            autoDelete: true
          });

          channel.bindQueue(
            qok.queue,
            this.options.queue.exchangeName || "paperboy",
            ""
          );

          channel.consume(qok.queue, this.consumeMessage.bind(this), {
            noAck: true
          });
        } catch (error) {
          if (operation.retry(error)) {
            console.error(`Could not establish connection to queue: ${error}`);
            return;
          }
        }
      },
      {
        timeout: 10 * 1000,
        callback: () => {
          if (conn) {
            conn.close();
          }
        }
      }
    );
  }

  private retryConnection() {
    console.info("Connection to queue dropped...");
    this.start();
  }

  private consumeMessage(message: Message | null) {
    console.info(
      "[x] from Magnolia: %s -> '%s'",
      message.fields.routingKey,
      message.content.toString()
    );

    this.generationLock.acquire(
      "generationLock",
      async done => {
        try {
          await this.generate();
          await this.callback();
        } catch (err) {
          console.error("Generation failed.", err);
        }

        done();
      },
      err => {
        if (err) {
          console.info("Already another pending message. Message discarded!");
        }
      }
    );
  }
}
