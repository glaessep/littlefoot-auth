import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtSecret } from '../utils/secrets';

passport.use(
  new Strategy(
    {
      secretOrKey: JwtSecret,
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromBodyField('auth_token'),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('auth_token'),
      ]),
    },
    (payload, done) => {
      return done(null, { email: payload.email, userId: payload.sub });
    },
  ),
);

export default passport;
