import * as HttpStatus from 'http-status-codes';

import { Jwt } from '../../utils/Jwt';
import { client, DatabaseId, ResourceTokenExpirySeconds, UsersContainer, AuthContainer } from '../../config/db';
import * as crypto from '../../utils/crypto';
import { AuthAccountDefinition } from './AuthAccountDefinition';
import { Status } from '../../common';
import { Users } from '../User';
import { AuthAccountLoginResult } from './AuthAccountLoginResult';
import { AuthAccountResult } from './AuthAccountResult';
import { User as DbUser, ErrorResponse, PermissionMode } from '@azure/cosmos';
import {
  DbPermission,
  DbPermissionDefinition,
  DbPermissionResult,
  DbPermissions,
  DbPermissionsResult,
} from '../DbPermission';

export class AuthAccount {
  private static verify(data: AuthAccountDefinition, verifySecret: string): boolean {
    if (verifySecret === data.verifySecret) {
      return true;
    }
    return false;
  }

  private static async setPermission(body: DbPermissionDefinition, dbUser: DbUser): Promise<DbPermissionResult> {
    try {
      const permissionResponse = await dbUser.permissions.upsert(body, {
        resourceTokenExpirySeconds: ResourceTokenExpirySeconds,
      });

      const { id, permissionMode, resource, resourcePartitionKey } = permissionResponse.resource;

      return new DbPermissionResult(
        new DbPermission(id, permissionMode, resource, resourcePartitionKey, permissionResponse.resource._token),
        new Status(true, permissionResponse.requestCharge, HttpStatus.OK),
      );
    } catch (e) {
      const err = e as ErrorResponse;
      return new DbPermissionResult(null, new Status(false, 0, err.code, err));
    }
  }

  private static async getPermissions(userId: string): Promise<DbPermissionsResult> {
    // get db user
    const dbUser = client.database(DatabaseId).user(userId);

    let permissions: DbPermissions;
    let charge = 0;

    try {
      // fetch all user permissions
      const response = await dbUser.permissions.readAll().fetchAll();
      charge += response.requestCharge;

      response.resources.forEach(async permission => {
        //read permission data (and thus new token)
        const { resource, requestCharge } = await dbUser.permission(permission.id).read();
        charge += requestCharge;

        permissions.push(
          new DbPermission(
            resource.id,
            resource.permissionMode,
            resource.resource,
            resource.resourcePartitionKey,
            resource._token,
          ),
        );
      });
    } catch (e) {
      const err = e as ErrorResponse;
      return new DbPermissionsResult(null, new Status(false, 0, err.code, err));
    }
    return new DbPermissionsResult(permissions, new Status(true, charge, HttpStatus.OK));
  }

  static async find(email: string): Promise<AuthAccountResult> {
    const query = {
      query: 'SELECT * FROM r WHERE r.email=@email',
      parameters: [{ name: '@email', value: `${email}` }],
    };

    const { resources, requestCharge } = await client
      .database(DatabaseId)
      .container(AuthContainer.id)
      .items.query(query)
      .fetchAll();

    if (resources.length === 0) {
      return new AuthAccountResult(
        null,
        new Status(false, requestCharge, HttpStatus.NOT_FOUND, Error('No auth account with given mail.')),
      );
    }

    return new AuthAccountResult(resources[0], new Status(true, requestCharge, HttpStatus.OK));
  }

  static async create(email: string, password: string, name: string, abo: string): Promise<AuthAccountResult> {
    try {
      let charge = 0.0;

      // @todo: should be replaced by AuthAccount.create and try/catch if account already existent
      // try to find auth account by email
      const fooAuth = await AuthAccount.find(email);
      charge += fooAuth.status.charge;

      // if user with same email in db then new user can not be created
      if (fooAuth.status.success) {
        return new AuthAccountResult(
          null,
          new Status(false, charge, HttpStatus.CONFLICT, Error('Email is already in use.')),
        );
      }

      // has password and send error if hashing failed
      const encrypted = await crypto.hash(password);
      if (encrypted === null) {
        return new AuthAccountResult(
          null,
          new Status(false, charge, HttpStatus.INTERNAL_SERVER_ERROR, Error('Could not hash password.')),
        );
      }

      // create user
      const userResp = await Users.create(email, name, abo);
      charge += userResp.status.charge;

      // create cosmos db user
      const dbUserResp = await client.database(DatabaseId).users.create({ id: userResp.data.userId });
      charge += dbUserResp.requestCharge;

      // set write permission for user container
      const permissionUsersContainer = await AuthAccount.setPermission(
        new DbPermissionDefinition(UsersContainer.id, PermissionMode.All, UsersContainer.url, userResp.data.userId),
        dbUserResp.user,
      );
      charge += permissionUsersContainer.status.charge;

      /** finally, create auth account */
      const authData = new AuthAccountDefinition(email, encrypted, userResp.data.userId);
      const authResp = await client
        .database(DatabaseId)
        .container(AuthContainer.id)
        .items.create(authData);
      charge += authResp.requestCharge;

      // return auth data
      return new AuthAccountResult(authResp.resource, new Status(true, charge, HttpStatus.CREATED));
    } catch (e) {
      /** @todo tidy up before return error */
      return new AuthAccountResult(
        null,
        new Status(false, 0, HttpStatus.INTERNAL_SERVER_ERROR, Error('Internal server error. Account not created.')),
      );
    }
  }

  static async login(email: string, password: string): Promise<AuthAccountLoginResult> {
    try {
      let charge = 0;

      const authAccount = await AuthAccount.find(email);
      charge += authAccount.status.charge;

      if (!authAccount.status.success) {
        return new AuthAccountLoginResult(
          null,
          null,
          null,
          new Status(false, authAccount.status.charge, HttpStatus.FORBIDDEN, Error('Incorrect username or password.')),
        );
      }

      const same = await crypto.compare(password, authAccount.data.encrypted);
      if (!same) {
        return new AuthAccountLoginResult(
          null,
          null,
          null,
          new Status(false, authAccount.status.charge, HttpStatus.FORBIDDEN, Error('Incorrect username or password.')),
        );
      }

      const { err, encoded: token } = await Jwt.sign({ email }, { subject: authAccount.data.userId });

      // check if signing went wrong
      if (err !== null) {
        return new AuthAccountLoginResult(
          null,
          null,
          null,
          new Status(false, authAccount.status.charge, HttpStatus.FORBIDDEN, err),
        );
      }

      // get database permissions
      const permissions = await AuthAccount.getPermissions(authAccount.data.userId);
      charge += permissions.status.charge;

      return new AuthAccountLoginResult(
        authAccount.data,
        { token },
        permissions.data,
        new Status(true, charge, HttpStatus.OK),
      );
    } catch (e) {
      return new AuthAccountLoginResult(
        null,
        null,
        null,
        new Status(false, 0, HttpStatus.INTERNAL_SERVER_ERROR, Error('Login failed due to a internal error.')),
      );
    }
  }

  static async activate(email: string, verifySecret: string): Promise<AuthAccountResult> {
    try {
      let charge = 0.0;

      // find auth account by email
      const authAccount = await AuthAccount.find(email);
      charge += authAccount.status.charge;

      if (!authAccount.status.success) {
        return new AuthAccountResult(
          null,
          new Status(false, charge, HttpStatus.FORBIDDEN, Error('Wrong verification attributes.')),
        );
      }

      if (!AuthAccount.verify(authAccount.data, verifySecret)) {
        return new AuthAccountResult(
          null,
          new Status(false, charge, HttpStatus.FORBIDDEN, Error('Wrong verification attributes.')),
        );
      }

      const verifiedAuthAccount = authAccount.data;
      verifiedAuthAccount.emailVerified = true;

      const { requestCharge, resource } = await client
        .database(DatabaseId)
        .container(AuthContainer.id)
        .items.upsert<AuthAccountDefinition>(verifiedAuthAccount);
      charge += requestCharge;

      return new AuthAccountResult(resource, new Status(true, charge, HttpStatus.OK));
    } catch (e) {
      return new AuthAccountResult(
        null,
        new Status(
          false,
          0,
          HttpStatus.INTERNAL_SERVER_ERROR,
          Error('Internal server error. Could not verify account.'),
        ),
      );
    }
  }
}
