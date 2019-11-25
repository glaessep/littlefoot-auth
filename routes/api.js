const debug = require('debug')('littlefoot-server:api');
const express = require('express');
const passport = require('./passport');
const { createUser } = require('./utils');

const router = express.Router();

router.post('/signup', (req, res) => {
  const { email, password, salt } = req.body;
  createUser(email, password, salt).then(result => {
    res.send(result);
  });
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
