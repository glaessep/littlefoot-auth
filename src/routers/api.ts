import { Router } from 'express';

import { AuthAccounts } from '../models/AuthAccount';

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

// apiRouter.get('/signup', (req, res) => {
//   const i = 0;
// });

// apiRouter.get('/signin', (req, res) => {
//   const i = 0;
// });

apiRouter.post('/login', (req, res) => {
  const { email, password } = req.body;
  AuthAccounts.login(email, password).then(result => {
    res.status(result.status.code).json(result);
  });
});

apiRouter.post('/delete', (req, res) => {
  const { email, userId } = req.body;
  AuthAccounts.delete(email, userId).then(result => {
    res.status(result.code).json(result);
  });
});
