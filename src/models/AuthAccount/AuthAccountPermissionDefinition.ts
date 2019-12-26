import { DbPermissions } from '../DbPermission';
import { AuthToken } from './AuthToken';
export interface AuthAccountPermissionDefinition {
  readonly auth: AuthToken;
  readonly database: DbPermissions;
}
