import { PermissionMode } from '@azure/cosmos';
import { DbPermissionDefinition } from './DbPermissionDefinition';

export class DbPermission extends DbPermissionDefinition {
  constructor(
    readonly id: string,
    readonly permissionMode: PermissionMode,
    readonly resource: string,
    readonly resourcePartitionKey: string | any[], // eslint-disable-line @typescript-eslint/no-explicit-any
    readonly token: string,
  ) {
    super(id, permissionMode, resource, resourcePartitionKey);
  }
}
