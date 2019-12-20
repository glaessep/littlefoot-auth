import logger from './logger';
import dotenv from 'dotenv';

export const IsProductionEnvironment = process.env.NODE_ENV === 'production';

if (!IsProductionEnvironment) {
  logger.info('Using .env file to supply config environment variables');
  dotenv.config({ path: '.env' });
}
