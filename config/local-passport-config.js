const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// Load User model
const User = require('../models/user');

passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
	User.findOne({email: email}, (err, user) => {
    // If any error
    if (err) { return done(err) }

    // If no user found
    if (!user) {
        console.log("No user found with this email");
      return done(null, false, {
        message: 'No user found.'
      })
    }
    //matching hashed passwords
    bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
            console.log("Password Matches");
            return done(null, user);
        } else {
            console.log("Password Incorrect");
            return done(null, false, { message: 'Password incorrect' });
        }
    });
  })
}));


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

module.exports = passport;