const express = require('express');
const passport = require('./passport');

const router = express.Router();

/* GET home page. */
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.render('index', { user: req.user.email });
});

router.get('/signup', (req, res) => {
  res.render('signup', { message: 'Hit submit when ready.' });
});

module.exports = router;
