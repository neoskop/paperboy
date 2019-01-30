import { OperationOptions } from "retry";
import { CoreOptions } from "request";

export interface MagnoliaLoadingParams<T> {
  authHeader: string;
  errorMessage: string;
  resolverHandler: (body: T) => T;
  retryOptions?: OperationOptions;
  url: string;
}
