const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { BasicStrategy } = require('passport-http');
const { Strategy: BearerStrategy } = require('passport-http-bearer');

passport.use(
  new LocalStrategy({ usernameField: 'email' }, (username, password, done) => {
    return done(null, {});
    // User.findOne({ username: username }, function(err, user) {
    //   if (err) {
    //     return done(err);
    //   }
    //   if (!user) {
    //     return done(null, false);
    //   }
    //   if (!user.verifyPassword(password)) {
    //     return done(null, false);
    //   }
    //   return done(null, user);
    // });
  })
);

passport.use(
  new BearerStrategy((token, done) => {
    // User.findOne({ token: token }, function(err, user) {
    //   if (err) {
    //     return done(err);
    //   }
    //   if (!user) {
    //     return done(null, false);
    //   }
    //   return done(null, user, { scope: 'all' });
    // });
  })
);

passport.use(
  new BasicStrategy((userid, password, done) => {
    /*
    User.findOne({ username: userid }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      if (!user.verifyPassword(password)) {
        return done(null, false);
      }
      return done(null, user);
    });
    */
  })
);

module.exports = passport;
