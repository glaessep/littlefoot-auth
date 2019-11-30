const debug = require('debug')('littlefoot-server:api');
const express = require('express');
const { createAccount, loginAccount } = require('../models/account');

const router = express.Router();

router.post('/signup', (req, res) => {
  const { email, password, salt } = req.body;
  createAccount(email, password, salt).then(result => {
    res.status(Number(result.code)).json(result);
  });
});

router.get('/signup', (req, res) => {});

router.get('/signin', (req, res) => {});

router.post('/signin', (req, res) => {
  const { email, password, salt } = req.body;
  loginAccount(email, password, salt).then(result => {
    res.status(Number(result.code)).json(result);
  });
});

module.exports = router;
