import { PermissionMode } from '@azure/cosmos';

export class DbPermissionDefinition {
  constructor(
    readonly id: string,
    readonly permissionMode: PermissionMode,
    readonly resource: string,
    readonly resourcePartitionKey: string | any[], // eslint-disable-line @typescript-eslint/no-explicit-any
  ) {}
}
