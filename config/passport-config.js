const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const keys = require("./keys");
const googleUser = require('../models/googleUser');

passport.serializeUser(function(user, done) {
    // Put the user id from database on a cookie
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    // When the cookie comes, needs to check if the id exists in the db
    googleUser.findById(id, function(err, user) {
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
    callbackURL: "http://127.0.0.1:8080/google/callback"
  },
  function(token, tokenSecret, profile, done) {
      // passport callback function
    googleUser.findOne({googleId:profile.id}).then((currentUser) => {
        if(currentUser) {
            //already have the user
            console.log("User already exists");
            // This done method is passed on to serialize
            done(null, currentUser);
        } else {
            new googleUser({
                username: profile.displayName,
                googleId: profile.id
            }).save().then((newUser) => {
                console.log('new user created:' + newUser)
                // This done method is passed on to deserialize
                done(null, newUser);
            });
        }
    });
  }
));