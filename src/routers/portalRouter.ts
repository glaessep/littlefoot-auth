import { Router } from 'express';
import passport from 'passport';

export const portalRouter = Router();

/* GET home page. */
portalRouter.get('/', passport.authenticate('jwt', { session: false, failureRedirect: '/login' }), (req, res) => {
  const user = req.user as { email: string; userId: string };
  res.render('index', { email: user.email, userId: user.userId });
});

portalRouter.get('/signup', (req, res) => {
  res.render('signup', { message: '' });
});

portalRouter.get('/login', (req, res) => {
  res.render('login', { message: '' });
});
