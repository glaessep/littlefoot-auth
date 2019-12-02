const uuid4 = require('uuid/v4');

const jwt = require('../utils/jwt');
const config = require('../utils/config');
const crypto = require('../utils/crypto');
const { genDBResult, genDBError, genDBResponse } = require('./common');
const { createUser } = require('./user');

const db = config.database;

// const container = {
//   name: 'auth',
//   partitionKey: 'email',
//   uniqueKey: 'email'
// };

// const layout = {
//   version: 1,
//   email,
//   emailVerified,
//   verifySecret,
//   encrypted,
//   userId
// };

function genAuthAccountData(email, encrypted, userId) {
  return {
    version: 1,
    email,
    emailVerified: false,
    verifySecret: uuid4(),
    encrypted,
    userId
  };
}

async function findAuthAccount(email) {
  const query = {
    query: 'SELECT * FROM r WHERE r.email=@email',
    parameters: [{ name: '@email', value: `${email}` }]
  };

  const result = await db
    .container(config.AuthContainerId)
    .items.query(query)
    .fetchAll();

  return genDBResponse(true, result);
}

async function loginAuthAccount(email, password) {
  try {
    const user = await findAuthAccount(email);

    if (user.data.length === 0) {
      return genDBResult(
        false,
        {
          success: false,
          message: 'Incorrect username or password'
        },
        user.charge,
        config.StatusCodes.Forbidden
      );
    }

    const same = await crypto.compare(password, user.data.encrypted);
    if (!same) {
      return genDBResult(
        false,
        {
          success: false,
          message: 'Incorrect username or password'
        },
        user.charge,
        config.StatusCodes.Forbidden
      );
    }

    const { err, token } = await jwt.sign({ email }, { subject: user.data.userId });

    if (err instanceof Error) {
      if (err.constructor === jwt.NotBeforeError) {
        return genDBResult(
          false,
          {
            success: false,
            message: 'JWT not before error!'
          },
          user.charge,
          config.StatusCodes.Unauthorized
        );
      }
      if (err.constructor === jwt.TokenExpiredError) {
        return genDBResult(
          false,
          {
            success: false,
            message: 'JWT token expired!'
          },
          user.charge,
          config.StatusCodes.Unauthorized
        );
      }

      return genDBResult(
        false,
        {
          success: false,
          message: 'JWT error!'
        },
        user.charge,
        config.StatusCodes.Unauthorized
      );
    }
    return genDBResult(
      true,
      {
        success: true,
        message: 'Authentication successful!',
        token
      },
      user.charge,
      config.StatusCodes.Ok
    );
  } catch (e) {
    return genDBError(e);
  }
}

async function createAuthAccount(email, password, name, abo) {
  try {
    let charge = 0.0;

    // try to find auth account by email
    const fooAuth = await findAuthAccount(email);
    charge += Number(fooAuth.charge);

    // if user with same email in db then new user can not be created
    if (fooAuth.data.length > 0) {
      return genDBResult(false, {}, charge, fooAuth.code);
    }

    // has password and send error if hashing failed
    const encrypted = await crypto.hash(password);
    if (!encrypted) {
      return genDBResult(false, 'hashing failed.', charge, config.StatusCodes.InternalServerError);
    }

    // create user
    const userResp = await createUser(email, name, abo);
    charge += Number(userResp.charge);

    // create auth account
    const authData = genAuthAccountData(email, encrypted, userResp.data.userId);
    const authResp = await config.database.container(config.AuthContainerId).items.create(authData);
    charge += Number(authResp.requestCharge);

    // return auth data
    return genDBResponse(true, authResp, charge);
  } catch (e) {
    return genDBError(e);
  }
}

async function activateAuthAccount(email, verifySecret) {
  try {
    let charge = 0.0;

    // find auth account by email
    const authAccount = await findAuthAccount(email);
    charge += Number(authAccount.charge);

    if (authAccount.data.length === 1 && verifySecret === authAccount.data[0].verifySecret) {
      authAccount.data[0].emailVerified = true;

      const resp = await config.database.container(config.AuthContainerId).items.upsert(authAccount.data[0]);
      charge += Number(resp.requestCharge);

      return genDBResult(true, {}, charge, resp.statusCode);
    }

    return genDBResult(false, {}, charge, config.StatusCodes.BadRequest);
  } catch (e) {
    return genDBError(e);
  }
}

module.exports = {
  findAuthAccount,
  createAuthAccount,
  loginAuthAccount,
  activateAuthAccount
};
