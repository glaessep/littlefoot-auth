import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtSecret } from '../utils/secrets';

passport.use(
  new Strategy(
    { secretOrKey: JwtSecret, jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() },
    (payload, done) => {
      return done(null, { email: payload.email, userId: payload.sub });
    },
  ),
);

export default passport;
