import { PermissionResponse } from '@azure/cosmos';
import { ResourcePermissionDefinition, ResourcePermissionMode } from 'littlefoot-api';
import { DbPermissionMode } from './DbPermission';

export class ResourcePermission implements ResourcePermissionDefinition {
  constructor(
    readonly id: string,
    readonly permissionMode: ResourcePermissionMode,
    readonly resource: string,
    readonly resourcePartitionKey: string | any[], // eslint-disable-line @typescript-eslint/no-explicit-any
    readonly token: string,
  ) {}

  public static fromCosmos(response: PermissionResponse): ResourcePermission {
    // get resource
    const resource = response.resource;

    //convert permission mode
    let mode: ResourcePermissionMode;
    switch (resource.permissionMode) {
      case DbPermissionMode.All:
        mode = ResourcePermissionMode.All;
        break;
      case DbPermissionMode.Read:
        mode = ResourcePermissionMode.Read;
        break;
      case DbPermissionMode.None:
        mode = ResourcePermissionMode.None;
        break;
      default:
        mode = ResourcePermissionMode.None;
        break;
    }

    // create result
    return new ResourcePermission(resource.id, mode, resource.resource, resource.resourcePartitionKey, resource._token);
  }
}
