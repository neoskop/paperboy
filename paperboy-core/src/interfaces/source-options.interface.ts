export interface SourceOptions {
  name?: string;
  sourceFactory?: any;
  output: {
    assets: string;
    excludedProperties?: string[];
    json: string;
  };
}
