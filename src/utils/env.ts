import logger from './logger';
import dotenv from 'dotenv';


if (process.env.NODE_ENV !== 'production') {
  logger.info('Using .env file to supply config environment variables');
  dotenv.config({ path: '.env' });
}