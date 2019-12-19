// import errorHandler from "errorhandler";
import './utils/env';
import app from './app';
import http from 'http';

/**
 * Error Handler. Provides full stack - remove for production
 */
// app.use(errorHandler());

/**
 * Start Express server.
 */
const server = http.createServer(app);

server.listen(app.get('port'), () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  console.log(`Listening on ${bind}`);
});

export default server;
