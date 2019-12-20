import { Router } from 'express';

import AuthAccount from '../models/authAccount';

export const apiRouter = Router();

apiRouter.post('/signup', (req, res) => {
  const { email, password, name, abo } = req.body;
  AuthAccount.create(email, password, name, abo).then(result => {
    res.status(result.code).json(result);
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
    res.status(result.code).json(result);
  });
});
