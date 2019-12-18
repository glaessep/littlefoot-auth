import logger from './logger';
// import dotenv from 'dotenv';


export const IsProductionEnvironment = process.env.NODE_ENV === 'production'; 

export const JwtSecret = process.env.TOKEN_SECRET; // generated at https://mkjwk.org/

if (IsProductionEnvironment) {
  logger.info('Using .env.dev file to supply config environment variables');
  // dotenv.config({ path: '.env.dev' });
} 