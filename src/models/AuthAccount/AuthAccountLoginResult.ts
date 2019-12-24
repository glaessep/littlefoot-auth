import { AuthAccount } from './AuthAccount';
import { DbPermissions } from '../DbPermission';
import { Status, Result, Id } from '../../common';
import { AuthToken } from './AuthToken';
export class AuthAccountLoginResult extends Result<AuthAccount & Id> {
  readonly permission: {
    auth: AuthToken;
    db: DbPermissions;
  };
  constructor(
    definition: AuthAccount & { id: string },
    authToken: AuthToken,
    dbpermissions: DbPermissions,
    status: Status,
  ) {
    super(definition, status);
    this.permission.auth = authToken;
    this.permission.db = dbpermissions;
  }
}
