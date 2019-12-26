import { Router } from 'express';
import passport from 'passport';

export const indexRouter = Router();

/* GET home page. */
indexRouter.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const user = req.user as { email: string; userId: string };
  res.render('index', { email: user.email, userId: user.userId });
});

indexRouter.get('/signup', (req, res) => {
  res.render('signup', { message: '' });
});

indexRouter.get('/login', (req, res) => {
  res.render('login', { message: '' });
});
