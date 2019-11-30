const debug = require('debug')('littlefoot-server:account');
const jwt = require('../utils/jwt');
const config = require('../utils/config');
const crypto = require('../utils/crypto');
const { genDBResult, genDBError, genDBResponse } = require('./common');

const db = config.database;

function createAccountData(email, encrypted) {
  return {
    email,
    emailVerified: false,
    encrypted,
    type: 'user',
    userID: ''
  };
}

async function findAccount(email) {
  const query = {
    query: 'SELECT * FROM r WHERE r.email=@email',
    parameters: [{ name: '@email', value: `${email}` }]
  };

  const result = await db
    .container(config.AccountsContainerId)
    .items.query(query)
    .fetchAll();

  return genDBResponse(true, result);
}

async function loginAccount(email, password, salt) {
  try {
    const user = await findAccount(email);

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

    const { err, token } = await jwt.sign({ email }, config.TokenSecret, {
      algorithm: 'HS256',
      expiresIn: '1h', // expires in 1 hours
      subject: user.data.userID
    });

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

async function createAccount(email, password, pwdSalt) {
  try {
    const user = await findAccount(email);

    if (user.data.length > 0) {
      return genDBResult(false, {}, user.charge, user.code);
    }

    const encrypted = await crypto.hash(password);
    if (!encrypted) {
      return genDBResult(false, 'hashing failed.', user.charge, config.StatusCodes.InternalServerError);
    }
    const account = createAccountData(email, encrypted);
    const newUser = await config.database.container(config.AccountsContainerId).items.upsert(account);
    return genDBResponse(true, newUser, user.charge);
  } catch (e) {
    return genDBError(e);
  }
}

async function activateAccount(email) {
  return null;
}

module.exports = {
  findAccount,
  createAccount,
  loginAccount,
  activateAccount
};
