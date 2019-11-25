const bcrypt = require('bcrypt');
const uuid = require('uuid/v4');
const config = require('../config');

const db = config.database;

function requestCharge(r) {
  return r.headers ? r.headers[config.CosmosConstants.HttpHeaders.RequestCharge] : 0;
}

function isError(r) {
  return r.code ? r.code >= config.CosmosStatusCodes.BadRequest : true;
}

function genError(err) {
  return {
    done: false,
    data: err.stack || err.body.message || '',
    charge: requestCharge(err),
    code: err.code || config.CosmosStatusCodes.BadRequest
  };
}

function genResponse(resp, done, charge = 0) {
  const data = resp.resource || resp.resources;
  return {
    done,
    data,
    charge: Number(charge) + Number(requestCharge(resp)),
    code: resp.statusCode || done ? config.CosmosStatusCodes.Ok : config.CosmosStatusCodes.BadRequest
  };
}

async function findUser(email) {
  const query = {
    query: 'SELECT * FROM r WHERE r.email=@email',
    parameters: [{ name: '@email', value: `${email}` }]
  };

  const result = await db
    .container(config.AccountsContainerId)
    .items.query(query)
    .fetchAll();

  return genResponse(result, true);
}

async function createUser(email, password, salt) {
  try {
    const user = await findUser(email);

    if (user.data.length > 0) {
      user.done = false;
      return user;
    }

    const account = {
      email,
      password,
      salt: salt || 'salt'
    };

    const newUser = await config.database.container(config.AccountsContainerId).items.upsert(account);
    return genResponse(newUser, true, user.charge);
  } catch (e) {
    return genError(e);
  }
}

function verifyPassword(userData, password) {
  return true;
}

module.exports = {
  requestCharge,
  isError,
  genError,
  genResponse,
  findUser,
  createUser,
  verifyPassword
};
