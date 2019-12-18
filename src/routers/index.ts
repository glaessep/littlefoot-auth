import { Router } from 'express';
import passport from 'passport';

export const indexRouter = Router();

/* GET home page. */
indexRouter.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const user = req.user as { email: string; userId: string };
  res.render('index', { user: user.email });
});

indexRouter.get('/signup', (req, res) => {
  res.render('signup', { message: 'Hit submit when ready.' });
});
