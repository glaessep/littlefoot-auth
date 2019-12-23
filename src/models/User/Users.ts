import * as HttpStatus from 'http-status-codes';
import { ItemResponse } from '@azure/cosmos';
import { client, DatabaseId, MaxAttemptsDbUser, UsersContainer } from '../../config/db';
import { User } from './User';
import { UserResult } from './UserResult';
import { Status } from '../../common';

export class Users {
  static async find(userId: string): Promise<UserResult> {
    const query = {
      query: 'SELECT * FROM r WHERE r.userId=@userId and r.type=@type',
      parameters: [
        { name: '@userId', value: `${userId}` },
        { name: '@type', value: User.type() },
      ],
    };

    const { resources, requestCharge } = await client
      .database(DatabaseId)
      .container(UsersContainer.id)
      .items.query<User>(query)
      .fetchAll();

    if (resources.length === 0) {
      return new UserResult(
        null,
        new Status(false, Number(requestCharge), HttpStatus.NOT_FOUND, Error('No user with given id.')),
      );
    }

    return new UserResult(resources[0], new Status(true, Number(requestCharge), HttpStatus.OK));
  }

  static async create(email: string, name: string, abo: string): Promise<UserResult> {
    let charge = 0.0;
    let response: ItemResponse<User>;
    let attempts = MaxAttemptsDbUser;

    do {
      // create user in db
      try {
        // generate data
        const data = new User(email, name, abo);

        response = await client
          .database(DatabaseId)
          .container(UsersContainer.id)
          .items.create<User>(data);

        charge = charge + Number(response.requestCharge);
      } catch (e) {
        /* do nothing */
      }

      // update counter
      attempts--;
    } while (response.statusCode != HttpStatus.CREATED && attempts > 0);

    // return user data if everything went well
    if (response.statusCode != HttpStatus.CREATED) {
      return new UserResult(null, new Status(false, charge, response.statusCode, Error('User not created.')));
    }

    // return null if don't find a new id
    return new UserResult(response.resource, new Status(true, charge, response.statusCode));
  }
}
