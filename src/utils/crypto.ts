import * as bcrypt from 'bcryptjs';
import logger from './logger';

export async function hash(password: string): Promise<string> {
  const saltRounds = 10;

  const hashedPassword: string = await new Promise((resolve, _reject) => {
    bcrypt.hash(password, saltRounds, (err, encrypted) => {
      if (err) {
        logger.error(`bcrypt.hash(password=${password} ) returns with message ${err.message}`);
        resolve(null);
      }
      resolve(encrypted);
    });
  });
  return hashedPassword;
}

export async function compare(password: string, encrypted: string): Promise<boolean> {
  const result: boolean = await new Promise((resolve, _reject) => {
    bcrypt.compare(password, encrypted, (err, same) => {
      if (err) {
        logger.error(` bcrypt.compare(password=${password} encrypted=${encrypted}) returns with message ${err.message}`);
        resolve(null);
      }
      resolve(same);
    });
  });
  return result;
}


