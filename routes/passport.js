const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

const config = require('../utils/config');
const crypto = require('../utils/crypto');
const { findAccount } = require('../models/account');

passport.use(
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    findAccount(email)
      .then(user => {
        if (user.data.length === 0) {
          return done(null, false);
        }
        const same = crypto.compare(password, user.encrypted);
        if (same) {
          return done(null, user);
        }
        return done(null, false);
      })
      .catch(e => {
        return done(e);
      });
  })
);

passport.use(
  new JwtStrategy(
    { secretOrKey: config.TokenSecret, jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() },
    (payload, done) => {
      return done(null, { email: payload.email, userID: payload.sub });
    }
  )
);

module.exports = passport;
