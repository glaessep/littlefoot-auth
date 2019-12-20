import { PermissionMode } from '@azure/cosmos';
import * as HttpStatus from 'http-status-codes';

import { sign } from '../utils/jwt';
import { client, DatabaseId, AuthContainerId } from '../config/db';
import DbResult from './dbResult';
import * as crypto from '../utils/crypto';
import User from './user';
import AuthAccountDefinition from './authAccountDefinition';

export interface PermissionDefinition {
  id: string;
  permissionMode: PermissionMode; // 'none', 'read', 'all'
  resource: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resourcePartitionKey?: string | any[];
  token: string;
}

export class AuthAccountCreation {
  readonly definition: AuthAccountDefinition;
  readonly permissions: {
    resourceId: string;
    permission: PermissionDefinition;
  }[];
}

export default class AuthAccount {
  static async find(email: string): Promise<DbResult<AuthAccountDefinition>> {
    const query = {
      query: 'SELECT * FROM r WHERE r.email=@email',
      parameters: [{ name: '@email', value: `${email}` }],
    };

    const { resources, requestCharge } = await client
      .database(DatabaseId)
      .container(AuthContainerId)
      .items.query(query)
      .fetchAll();
    if (resources.length === 0) {
      return new DbResult<AuthAccountDefinition>(false, null, requestCharge, HttpStatus.NOT_FOUND);
    }

    return new DbResult<AuthAccountDefinition>(true, resources[0], requestCharge, HttpStatus.OK);
  }

  static async login(email: string, password: string): Promise<DbResult<string | Error>> {
    try {
      const { success, data: authAccount, charge } = await AuthAccount.find(email);

      if (!success) {
        return new DbResult<Error>(false, Error('Incorrect username or password.'), charge, HttpStatus.FORBIDDEN);
      }

      const same = await crypto.compare(password, authAccount.encrypted);
      if (!same) {
        return new DbResult<Error>(false, Error('Incorrect username or password.'), charge, HttpStatus.FORBIDDEN);
      }

      const { err, encoded: token } = await sign({ email }, { subject: authAccount.userId });

      // check if signing went wrong
      if (err !== null) {
        // // check NotBeforeError
        // if (err.name === 'NotBeforeError') {
        //   return new DbResult<Error>(false, Error('JWT not before error.'), charge, HttpStatus.UNAUTHORIZED);
        // }

        // // check TokenExpiredError
        // if (err.name === 'TokenExpiredError') {
        //   return new DbResult<Error>(false, Error('JWT token expired.'), charge, HttpStatus.UNAUTHORIZED);
        // }

        // // check JsonWebTokenError
        // if (err.name === 'JsonWebTokenError') {
        //   return new DbResult<Error>(false, Error('JWT error.'), charge, HttpStatus.UNAUTHORIZED);
        // }

        return new DbResult<Error>(false, err, charge, HttpStatus.UNAUTHORIZED);
      }

      return new DbResult<string>(true, token, charge, HttpStatus.OK);
    } catch (e) {
      return new DbResult<Error>(
        false,
        Error('Login failed due to a internal error.'),
        0,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  static async create(
    email: string,
    password: string,
    name: string,
    abo: string,
  ): Promise<DbResult<AuthAccountDefinition | Error>> {
    try {
      let charge = 0.0;

      // try to find auth account by email
      const fooAuth = await AuthAccount.find(email);
      charge += fooAuth.charge;

      // if user with same email in db then new user can not be created
      if (fooAuth.success) {
        return new DbResult<Error>(false, Error('Email is already in use.'), charge, HttpStatus.CONFLICT);
      }

      // has password and send error if hashing failed
      const encrypted = await crypto.hash(password);
      if (encrypted === null) {
        return new DbResult<Error>(false, Error('Could not hash password.'), charge, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // create user
      const userResp = await User.create(email, name, abo);
      charge += Number(userResp.charge);

      // create auth account
      const authData = new AuthAccountDefinition(email, encrypted, userResp.data.userId);
      const authResp = await client
        .database(DatabaseId)
        .container(AuthContainerId)
        .items.create(authData);
      charge += Number(authResp.requestCharge);

      // return auth data
      return new DbResult<AuthAccountDefinition>(true, authResp.resource, charge, HttpStatus.CREATED);
    } catch (e) {
      return new DbResult<Error>(
        false,
        Error('Internal server error. Account not created.'),
        0,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  static async activate(email: string, verifySecret: string): Promise<DbResult<Error>> {
    try {
      let charge = 0.0;

      // find auth account by email
      const authAccount = await AuthAccount.find(email);
      charge += authAccount.charge;

      if (!authAccount.success) {
        return new DbResult<Error>(false, Error('Wrong verification attributes.'), charge, HttpStatus.FORBIDDEN);
      }

      const verifiedAuthAccount = authAccount.data.verify(verifySecret);
      if (verifiedAuthAccount === null) {
        return new DbResult<Error>(false, Error('Wrong verification attributes.'), charge, HttpStatus.FORBIDDEN);
      }

      const { requestCharge } = await client
        .database(DatabaseId)
        .container(AuthContainerId)
        .items.upsert(verifiedAuthAccount);
      charge += requestCharge;

      return new DbResult<Error>(true, null, charge, HttpStatus.OK);
    } catch (e) {
      return new DbResult<Error>(
        false,
        Error('Internal server error. Could not verify account.'),
        0,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

// async function setUserPermission(user, resourceId, permissionMode, expirySeconds, partitionKey = '') {
//   const dbUserPermResp = await user.permissions.create(
//     {
//       id: resourceId,
//       permissionMode,
//       resource: config.database.container(resourceId).url,
//       resourcePartitionKey: partitionKey,
//     },
//     { resourceTokenExpirySeconds: expirySeconds },
//   );
//   return {
//     // token: { resourceId: dbUserPermResp.resource._token }
//   };
// }
