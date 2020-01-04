import * as HttpStatus from 'http-status-codes';
import { User as DbUser, ErrorResponse } from '@azure/cosmos';
import {
  Status,
  // Id,
  AuthAccountDefinition,
  AuthAccountResult,
  AuthAccountPermissionResult,
  ResourcePermissionMode,
} from 'littlefoot-api';

import { Jwt } from '../../utils/Jwt';
import { client, DatabaseId, ResourceTokenExpirySeconds, UsersContainer, AuthContainer } from '../../config/db';
import * as crypto from '../../utils/crypto';
import { ContainerDefinition } from '../../common';
import { Users } from '../User';
import { AuthAccount } from './AuthAccount';
import { DbPermission, DbPermissionMode, ResourcePermissionResult } from '../ResourcePermission';
import { ResourcePermission, ResourcePermissionsResult } from '../ResourcePermission';
import { AuthAccountFindResult } from './AuthAccountFindResult';

export class AuthAccounts {
  private static verify(data: AuthAccount, verifySecret: string): boolean {
    if (verifySecret === data.verifySecret) {
      return true;
    }
    return false;
  }

  private static async setPermission(
    container: ContainerDefinition,
    mode: ResourcePermissionMode,
    partitionKeys: string[],
    dbUser: DbUser,
  ): Promise<ResourcePermissionResult> {
    try {
      // convert permission mode
      let dbMode = DbPermissionMode.None;
      if (mode === ResourcePermissionMode.All) {
        dbMode = DbPermissionMode.All;
      } else if (mode === ResourcePermissionMode.Read) {
        dbMode = DbPermissionMode.Read;
      } else {
        return new ResourcePermissionResult(
          null,
          new Status(false, 0, HttpStatus.BAD_REQUEST, new Error('Wrong permission mode.')),
        );
      }

      // set permission
      const permissionResponse = await dbUser.permissions.upsert(
        new DbPermission(container.id, dbMode, container.url, partitionKeys),
        {
          resourceTokenExpirySeconds: ResourceTokenExpirySeconds,
        },
      );

      const { id, permissionMode, resource, resourcePartitionKey } = permissionResponse.resource;

      // convert permission mode
      let outPermissionMode = ResourcePermissionMode.None;
      if (permissionMode === DbPermissionMode.All) {
        outPermissionMode = ResourcePermissionMode.All;
      } else if (permissionMode === DbPermissionMode.Read) {
        outPermissionMode = ResourcePermissionMode.Read;
      } else {
        return new ResourcePermissionResult(
          null,
          new Status(false, 0, HttpStatus.BAD_REQUEST, new Error('Wrong permission mode.')),
        );
      }

      return new ResourcePermissionResult(
        new ResourcePermission(
          id,
          outPermissionMode,
          resource,
          resourcePartitionKey,
          permissionResponse.resource._token,
        ),
        new Status(true, Number(permissionResponse.requestCharge), HttpStatus.OK),
      );
    } catch (e) {
      const err = e as ErrorResponse;
      return new ResourcePermissionResult(null, new Status(false, 0, err.code, err));
    }
  }

  private static async getPermissions(userId: string): Promise<ResourcePermissionsResult> {
    try {
      // get db user
      const dbUser = client.database(DatabaseId).user(userId);

      const permissions: ResourcePermission[] = [];
      let charge = 0;

      // fetch all user permissions
      const response = await dbUser.permissions.readAll().fetchAll();
      charge += Number(response.requestCharge);

      for (const permission of response.resources) {
        //read permission data (and thus new token)
        const permissionResponse = await dbUser.permission(permission.id).read();
        charge += Number(permissionResponse.requestCharge);

        permissions.push(ResourcePermission.fromCosmos(permissionResponse));
      }
      return new ResourcePermissionsResult(permissions, new Status(true, charge, HttpStatus.OK));
    } catch (e) {
      const err = e as ErrorResponse;
      return new ResourcePermissionsResult(null, new Status(false, 0, err.code, err));
    }
  }

  static async find(email: string): Promise<AuthAccountFindResult> {
    try {
      const query = {
        query: 'SELECT * FROM r WHERE r.email=@email',
        parameters: [{ name: '@email', value: `${email}` }],
      };
      // @TODO: Removed Id => check this
      const { resources, requestCharge } = await client
        .database(DatabaseId)
        .container(AuthContainer.id)
        .items.query<AuthAccount>(query)
        .fetchAll();

      if (resources.length === 0) {
        return new AuthAccountFindResult(
          null,
          new Status(false, Number(requestCharge), HttpStatus.NOT_FOUND, Error('No auth account with given mail.')),
        );
      }

      return new AuthAccountFindResult(resources[0], new Status(true, Number(requestCharge), HttpStatus.OK));
    } catch (e) {
      return new AuthAccountFindResult(null, new Status(false, 0, HttpStatus.NOT_FOUND, e));
    }
  }

  static async create(email: string, password: string, name: string, abo: string): Promise<AuthAccountResult> {
    try {
      let charge = 0.0;

      // @todo: should be replaced by AuthAccount.create and try/catch if account already existent
      // try to find auth account by email
      const fooAuth = await AuthAccounts.find(email);
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
      charge += Number(dbUserResp.requestCharge);

      // Set write permission for user container
      const permissionUsersContainer = await AuthAccounts.setPermission(
        UsersContainer,
        ResourcePermissionMode.All,
        [userResp.data.userId],
        dbUserResp.user,
      );
      charge += permissionUsersContainer.status.charge;

      /** Finally, create auth account */
      const authData = new AuthAccount(email, encrypted, userResp.data.userId);
      const authResp = await client
        .database(DatabaseId)
        .container(AuthContainer.id)
        .items.create<AuthAccount>(authData);
      charge += Number(authResp.requestCharge);

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

  static async delete(email: string, userId?: string): Promise<Status> {
    let charge = 0.0;

    const auth = await AuthAccounts.find(email);
    charge += auth.status.charge;

    if (auth.status.success) {
      userId = auth.data.userId;
    }

    /** Only execute if we have an userId. */
    if (userId) {
      /** Delete user. */
      const userStatus = await Users.delete(userId);
      charge += userStatus.charge;

      /** Delete db user. */
      try {
        const { requestCharge } = await client
          .database(DatabaseId)
          .user(userId)
          .delete()
          .catch();
        charge += Number(requestCharge);
      } catch (_e) {}

      /** Delete auth account */
      try {
        const { requestCharge } = await client
          .database(DatabaseId)
          .container(AuthContainer.id)
          .item(auth.data.id, auth.data.email)
          .delete();
        charge += Number(requestCharge);
      } catch (_e) {}
    }
    return new Status(true, charge, HttpStatus.NO_CONTENT);
  }

  static async login(email: string, password: string): Promise<AuthAccountPermissionResult> {
    try {
      let charge = 0;

      const authAccount = await AuthAccounts.find(email);
      charge += authAccount.status.charge;

      if (!authAccount.status.success) {
        return new AuthAccountPermissionResult(
          null,
          new Status(false, authAccount.status.charge, HttpStatus.FORBIDDEN, Error('Incorrect username or password.')),
        );
      }

      const same = await crypto.compare(password, authAccount.data.encrypted);
      if (!same) {
        return new AuthAccountPermissionResult(
          null,
          new Status(false, authAccount.status.charge, HttpStatus.FORBIDDEN, Error('Incorrect username or password.')),
        );
      }

      const { err, encoded: token } = await Jwt.sign({ email }, { subject: authAccount.data.userId });

      // check if signing went wrong
      if (err !== null) {
        return new AuthAccountPermissionResult(
          null,
          new Status(false, authAccount.status.charge, HttpStatus.FORBIDDEN, err),
        );
      }

      // get database permissions
      const permissions = await AuthAccounts.getPermissions(authAccount.data.userId);
      charge += permissions.status.charge;

      return new AuthAccountPermissionResult(
        { auth: { token }, database: permissions.data },
        new Status(true, charge, HttpStatus.OK),
      );
    } catch (e) {
      return new AuthAccountPermissionResult(
        null,
        new Status(false, 0, HttpStatus.INTERNAL_SERVER_ERROR, Error('Login failed due to a internal error.')),
      );
    }
  }

  static async activate(email: string, verifySecret: string): Promise<AuthAccountResult> {
    try {
      let charge = 0.0;

      // find auth account by email
      const authAccount = await AuthAccounts.find(email);
      charge += authAccount.status.charge;

      if (!authAccount.status.success) {
        return new AuthAccountResult(
          null,
          new Status(false, charge, HttpStatus.FORBIDDEN, Error('Wrong verification attributes.')),
        );
      }

      if (!AuthAccounts.verify(authAccount.data, verifySecret)) {
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
      charge += Number(requestCharge);

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
