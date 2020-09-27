const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// Load User model
const User = require('../models/user');


passport.serializeUser(function(user, done) {
  // Put the user id from database on a cookie
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  // When the cookie comes, needs to check if the id exists in the db
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// Use the GoogleStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Google profile), and
//   invoke a callback with a user object.
passport.use(new GoogleStrategy({
  clientID: "963340836091-dna5cn6bfd8houn2qt2ohnehouc4q4vb.apps.googleusercontent.com",
  clientSecret: "lRqTBggyl61U4ImIiN41VqVL",
  //callbackURL: "http://127.0.0.1:8080/google/callback"
  callbackURL: "http://icrowdapp.herokuapp.com/google/callback"
},
function(token, tokenSecret, profile, done) {
    // passport callback function
  User.findOne({googleId:profile.id}).then((currentUser) => {
      if(currentUser) {
          //already have the user
          console.log("User already exists");
          // This done method is passed on to serialize
          done(null, currentUser);
      } else {
          new User({
              username: profile.displayName,
              googleId: profile.id,
              email: profile._json.email
          }).save().then((newUser) => {
              console.log('new user created:' + newUser)
              // This done method is passed on to deserialize
              done(null, newUser);
          });
      }
  });
}
));

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

module.exports = passport;