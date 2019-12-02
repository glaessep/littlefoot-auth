const express = require('express');
const { createAuthAccount, loginAuthAccount } = require('../models/auth');

const router = express.Router();

router.post('/signup', (req, res) => {
  const { email, password, name, abo } = req.body;
  createAuthAccount(email, password, name, abo).then(result => {
    res.status(result.code).json(result);
  });
});

router.get('/signup', (req, res) => {});

router.get('/signin', (req, res) => {});

router.post('/signin', (req, res) => {
  const { email, password } = req.body;
  loginAuthAccount(email, password).then(result => {
    res.status(result.code).json(result);
  });
});

module.exports = router;
