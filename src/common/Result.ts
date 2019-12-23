import { Status } from './Status';

export class Result<T> {
  constructor(readonly data: T, readonly status: Status) {}
}
