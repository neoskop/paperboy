import { SourceOptions } from '@neoskop/paperboy';

export interface MagnoliaSourceOptions extends SourceOptions {
  magnolia: {
    url: string;
    damJsonEndpoint: string;
    pagesEndpoint: string;
    sitemapEndpoint: string;
    workspaces?: string[];
    auth: {
      header: string;
    };
  };
  queue: {
    uri: string;
    exchangeName?: string;
  };
}
