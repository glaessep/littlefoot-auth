const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index');
});

router.get('/signup', (req, res) => {
  res.render('signup', { message: 'Hit submit when ready.' });
});

router.post('/signup', (req, res) => {
  // res.render('signup', { message: 'registred.' });
  // res.redirect('/api/signup');
  // res.render('index', { title: 'Express!' });
});

module.exports = router;
