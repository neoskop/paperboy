import { OperationOptions } from "retry";

export interface MagnoliaLoadingParams<T> {
  authHeader: string;
  errorMessage: string;
  resolverHandler: (body: T) => T;
  retryOptions?: OperationOptions;
  url: string;
}
