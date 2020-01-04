import { Router } from 'express';
import passport from 'passport';

import { AuthAccounts } from '../models/AuthAccount';
import { Result } from 'littlefoot-api';

export const apiRouter = Router();

apiRouter.post('/signup', (req, res) => {
  const { email, password, name, abo } = req.body;
  AuthAccounts.create(email, password, name, abo)
    .then(result => {
      res.status(result.status.code).json(result);
    })
    .catch(_e => {
      // // check NotBeforeError
      // if (err.name === 'NotBeforeError') {
      //   return new DbResult<Error>(false, Error('JWT not before error.'), charge, HttpStatus.UNAUTHORIZED);
      // }
      // // check TokenExpiredError
      // if (err.name === 'TokenExpiredError') {
      //   return new DbResult<Error>(false, Error('JWT token expired.'), charge, HttpStatus.UNAUTHORIZED);
      // }
      // // check JsonWebTokenError
      // if (err.name === 'JsonWebTokenError') {
      //   return new DbResult<Error>(false, Error('JWT error.'), charge, HttpStatus.UNAUTHORIZED);
      // }
    });
});

apiRouter.post('/login', (req, res) => {
  const { email, password } = req.body;
  AuthAccounts.login(email, password).then(result => {
    res.status(result.status.code).json(result);
  });
});

apiRouter.post('/delete', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { email, userId } = req.user as { email: string; userId: string };

  AuthAccounts.delete(email, userId).then(result => {
    res.status(result.code).json(new Result({}, result));
  });
});
