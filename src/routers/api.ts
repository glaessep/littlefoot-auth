import { Router } from 'express';

import { AuthAccount } from '../models/AuthAccount';

export const apiRouter = Router();

apiRouter.post('/signup', (req, res) => {
  const { email, password, name, abo } = req.body;
  AuthAccount.create(email, password, name, abo)
    .then(result => {
      res.status(result.status.code).json(result);
    })
    .catch(e => {
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

// apiRouter.get('/signup', (req, res) => {
//   const i = 0;
// });

// apiRouter.get('/signin', (req, res) => {
//   const i = 0;
// });

apiRouter.post('/signin', (req, res) => {
  const { email, password } = req.body;
  AuthAccount.login(email, password).then(result => {
    res.status(result.status.code).json(result);
  });
});
