const uuid4 = require('uuid/v4');
const config = require('../utils/config');
const { genDBResponse } = require('./common');

const db = config.database;

// const container = {
//   name: 'users',
//   partitionKey: 'userId'
// };

// const layout = {
//   version: 1,
//   id: userId,
//   userId,
//   type: 'user',
//   name,
//   email,
//   abo,
//   following: [
//     {
//       childId,
//       permission
//     }
//   ]
// };

function genUserData(userId, email, name, abo) {
  return {
    version: 1,
    id: userId,
    userId,
    type: 'user',
    name,
    email,
    abo,
    following: []
  };
}

async function findUser(userId) {
  const query = {
    query: 'SELECT * FROM r WHERE r.userId=@userId and r.type=@type',
    parameters: [
      { name: '@userId', value: `${userId}` },
      { name: '@type', value: 'user' }
    ]
  };

  const result = await db
    .container(config.UsersContainerId)
    .items.query(query)
    .fetchAll();

  return genDBResponse(true, result);
}

async function createUser(email, name, abo, maxAttemps = 10) {
  // return null if don't find a new id
  if (maxAttemps <= 0) throw new Error('Can not find unique user id, thus user is not created!');

  // generate new id
  const userId = uuid4();

  // generate data
  const data = genUserData(userId, email, name, abo);

  // create user in db
  const response = await config.database.container(config.UsersContainerId).items.create(data);

  // check if everything went well
  if (response.statusCode === config.StatusCodes.Created) {
    return genDBResponse(true, response);
  }

  // recursive call
  const newData = await createUser(email, name, abo, maxAttemps - 1);
  newData.charge += response.requestCharge;
  return newData;
}

module.exports = {
  findUser,
  createUser
};
