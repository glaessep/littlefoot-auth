import { Request, Response, NextFunction } from 'express';

export const redirectToWWW = function(req: Request, res: Response, next: NextFunction) {
  const hostHeader = req.header('host');
  const hostname = (hostHeader || '').split(':')[0];
  if (hostHeader.match(/^www\..*/i) || hostname === 'localhost' || hostname === '127.0.0.1') {
    next();
  } else {
    res.redirect(301, 'https://www.' + hostHeader + req.url);
  }
};

export const removeWww = function(req: Request, res: Response, next: NextFunction) {
  const host = req.header('host');
  const www = (host || '').split('.')[0];
  if (www.toLowerCase() !== 'www') {
    next();
  } else {
    res.redirect(301, 'https://' + host.replace('www.', '') + req.url);
  }
};
