export class Status {
  constructor(readonly success: boolean, readonly charge: number, readonly code: number, readonly error?: Error) {}
}
