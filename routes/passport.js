const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

const config = require('../utils/config');

passport.use(
  new JwtStrategy(
    { secretOrKey: config.TokenSecret, jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() },
    (payload, done) => {
      return done(null, { email: payload.email, userID: payload.sub });
    }
  )
);

module.exports = passport;
