/* eslint-disable no-console */
const express = require('express');
const passport = require('passport');
const { BasicStrategy } = require('passport-http');
const {
  Strategy: ClientPasswordStrategy
} = require('passport-oauth2-client-password');

const config = require('../config');

const router = express.Router();

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

passport.use(
  new ClientPasswordStrategy((clientId, clientSecret, done) => {
    /*
    Clients.findOne({ clientId: clientId }, (err, client) => {
      if (err) {
        return done(err);
      }
      if (!client) {
        return done(null, false);
      }
      if (client.clientSecret != clientSecret) {
        return done(null, false);
      }
      return done(null, client);
    });
    */
  })
);

router.get('/signup', (req, res) => {
  res.send('Sign Up');
});

router.get('/signin', (req, res) => {
  console.log(`config.database.id: ${config.database.id}`);

  const container = config.database.container(config.UsersContainerID);
  console.log(`container.id: ${container.id}`);

  // query to return all children in a family
  const querySpec = {
    query: 'SELECT * FROM root r',
    parameters: [
      {
        name: '@type',
        value: 'user'
      }
    ]
  };

  console.log(`Starting query\n`);
  let result = '';
  config.database
    .container(config.UsersContainerID)
    .items.query(querySpec, { enableCrossPartitionQuery: true })
    .fetchAll()
    .then(r => {
      // console.log(`${JSON.stringify(r)}`);
      result = JSON.stringify(r.headers);
      if (r.resources) {
        for (var queryResult of r.resources) {
          var resultString = JSON.stringify(queryResult);
          console.log(`\tQuery returned ${resultString}\n`);
        }
      } else {
        console.log(`Error!\n`);
      }
    })
    .catch(error => {
      console.log(`${JSON.stringify(error)}`);
    });

  res.send({ result: `${result}` });
});

router.post(
  '/signin',
  passport.authenticate(['basic', 'oauth2-client-password'], {
    session: false
  }),
  (req, res) => {
    res.send('Sign In');
  }
);

module.exports = router;
