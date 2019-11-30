const bcrypt = require('bcrypt');
const debug = require('debug')('littlefoot-server:crypto');

async function hash(password) {
  const saltRounds = 10;

  const hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, encrypted) => {
      if (err) {
        debug(`Error: bcrypt.hash(password=${password} ) returns with message ${err.message}`);
        resolve(null);
      }
      resolve(encrypted);
    });
  });

  return hashedPassword;
}

async function compare(password, encrypted) {
  const result = await new Promise((resolve, reject) => {
    bcrypt.compare(password, encrypted, (err, same) => {
      if (err) {
        debug(`Error: bcrypt.compare(password=${password} encrypted=${encrypted}) returns with message ${err.message}`);
        resolve(null);
      }
      resolve(same);
    });
  });

  return result;
}

module.exports = {
  hash,
  compare
};
