const jwt = require('jsonwebtoken');
const { TokenSecret } = require('./config');

async function sign(payload, options) {
  const o = options;
  o.algorithm = 'HS256';
  o.expiresIn = '1h';
  const result = await new Promise((resolve, reject) => {
    jwt.sign(payload, TokenSecret, o, (err, encoded) => {
      resolve(err, encoded);
    });
  });
  return result;
}

async function verify(token, options) {
  const result = await new Promise((resolve, reject) => {
    jwt.verify(token, TokenSecret, options, (err, decoded) => {
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
