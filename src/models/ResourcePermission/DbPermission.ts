import { PermissionDefinition, PermissionMode as DbPermissionMode } from '@azure/cosmos';

export { DbPermissionMode };

export class DbPermission implements PermissionDefinition {
  constructor(
    readonly id: string,
    readonly permissionMode: DbPermissionMode,
    readonly resource: string,
    readonly resourcePartitionKey: string | any[], // eslint-disable-line @typescript-eslint/no-explicit-any
  ) {}
}
