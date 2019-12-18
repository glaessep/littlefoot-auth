import uuid4 from 'uuid/v4';
import * as HttpStatus from 'http-status-codes';
import { database as db, UsersContainerId, DbResult } from '../utils/dbConfig';
import UserDefinition from './userDefinition';
import { ItemResponse } from '@azure/cosmos';


export default class User {
  static async find(userId: string): Promise<DbResult<UserDefinition>> {
    const query = {
      query: 'SELECT * FROM r WHERE r.userId=@userId and r.type=@type',
      parameters: [
        { name: '@userId', value: `${userId}` },
        { name: '@type', value: UserDefinition.type() },
      ],
    };

    const { resources, requestCharge } = await db.container(UsersContainerId).items.query(query).fetchAll();
    if (resources.length === 0) {
      return new DbResult<UserDefinition>(false, null, requestCharge, HttpStatus.NOT_FOUND);
    }

    return new DbResult<UserDefinition>(true, resources[0], requestCharge, HttpStatus.OK);
  }

  static async create(email: string, name: string, abo: string, maxAttempts: number = 10): Promise<DbResult<UserDefinition>> {
    // generate new id
    const userId = uuid4();
  
    // generate data
    const data = new UserDefinition(userId, email, name, abo);
  
    let charge = 0.0;
    let response: ItemResponse<UserDefinition>;

    async () => {
      let attempts = maxAttempts;

      do {
        // create user in db
        try {
          response = await db.container(UsersContainerId).items.create(data);
          charge = charge + response.requestCharge;
        } catch (e) {/* do nothing */}

        // update counter 
        attempts--;
      } while ((response.statusCode != HttpStatus.CREATED) && attempts > 0);
    };
  
    // return user data if everything went well
    if (response.statusCode === HttpStatus.CREATED) {
      return new DbResult<UserDefinition>(true, response.resource, charge, response.statusCode);
    }

    // return null if don't find a new id
    return new DbResult<UserDefinition>(false, null, charge, response.statusCode);
  }
}

