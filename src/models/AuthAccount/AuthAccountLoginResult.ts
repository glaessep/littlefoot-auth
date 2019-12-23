import { AuthAccountDefinition } from './AuthAccountDefinition';
import { DbPermissions } from '../DbPermission';
import { Status, Result } from '../../common';
import { AuthToken } from './AuthToken';
export class AuthAccountLoginResult extends Result<AuthAccountDefinition> {
  readonly permission: {
    auth: AuthToken;
    db: DbPermissions;
  };
  constructor(definition: AuthAccountDefinition, authToken: AuthToken, dbpermissions: DbPermissions, status: Status) {
    super(definition, status);
    this.permission.auth = authToken;
    this.permission.db = dbpermissions;
  }
}
