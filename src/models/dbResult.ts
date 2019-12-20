export default class DbResult<TData> {
  constructor(readonly success: boolean, readonly data: TData, readonly charge: number, readonly code: number) {}
}
