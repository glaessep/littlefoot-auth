const debug = require('debug')('littlefoot-server:api');
const bcrypt = require('bcrypt');
const uuid = require('uuid/v4');
const express = require('express');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { BasicStrategy } = require('passport-http');
const { Strategy: BearerStrategy } = require('passport-http-bearer');

const config = require('../config');
const { genError, isError, genResponse, requestCharge } = require('./utils');

const db = config.database;
const router = express.Router();

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
      pwd: password,
      salt
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

passport.use(
  new LocalStrategy({ usernameField: 'email' }, (username, password, done) => {
    return done(null, {});
    // User.findOne({ username: username }, function(err, user) {
    //   if (err) {
    //     return done(err);
    //   }
    //   if (!user) {
    //     return done(null, false);
    //   }
    //   if (!user.verifyPassword(password)) {
    //     return done(null, false);
    //   }
    //   return done(null, user);
    // });
  })
);

passport.use(
  new BearerStrategy((token, done) => {
    // User.findOne({ token: token }, function(err, user) {
    //   if (err) {
    //     return done(err);
    //   }
    //   if (!user) {
    //     return done(null, false);
    //   }
    //   return done(null, user, { scope: 'all' });
    // });
  })
);

passport.use(
  new BasicStrategy((userid, password, done) => {
    /*
    User.findOne({ username: userid }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      if (!user.verifyPassword(password)) {
        return done(null, false);
      }
      return done(null, user);
    });
    */
  })
);

router.post('/signup', (req, res) => {
  const { email, password, salt } = req.body;
  (async () => {
    const result = await createUser(email, password, salt);
    res.send(result);
  })();
});

router.get('/signup', (req, res) => {});

router.get('/signin', (req, res) => {});

router.post(
  '/signin',
  passport.authenticate(['local'], {
    session: false
  }),
  (req, res) => {
    res.send('Sign In');
  }
);

module.exports = router;
