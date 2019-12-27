import { Request, Response, NextFunction } from 'express';
import logger from './logger';

export const redirectToWWW = function(req: Request, res: Response, next: NextFunction) {
  const hostHeader = req.header('host');
  const hostname = (hostHeader || '').split(':')[0];
  if (hostHeader.match(/^www\..*/i) || hostname === 'localhost' || hostname === '127.0.0.1') {
    next();
  } else {
    res.redirect(301, 'https://www.' + hostHeader + req.url);
  }
};
