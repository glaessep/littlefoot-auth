const jwt = require('jsonwebtoken');

async function sign(payload, secret, options) {
  const result = await new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, encoded) => {
      // if (err) {
      //   debug(`Error: jwt.sign(payload=${payload}, secret=${secret}, options=${options}) returns with message ${err.message}`);
      //   resolve(null);
      // }
      resolve(err, encoded);
    });
  });
  return result;
}

async function verify(token, secret, options) {
  const result = await new Promise((resolve, reject) => {
    jwt.verify(token, secret, options, (err, decoded) => {
      // if (err) {
      //   debug(`Error: jwt.sign(payload=${payload}, secret=${secret}, options=${options}) returns with message ${err.message}`);
      //   resolve(err, decoded);
      // }
      resolve(err, decoded);
    });
  });
  return result;
}

module.exports = {
  sign,
  verify,
  JsonWebTokenError: jwt.JsonWebTokenError,
  TokenExpiredError: jwt.TokenExpiredError,
  NotBeforeError: jwt.NotBeforeError
};
