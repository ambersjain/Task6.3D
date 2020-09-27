const express = require('express');
const path = require('path');
const base = path.join(__dirname, '../views');
// To connect to API
const https = require("https");
//To hash the password
const bcrypt = require('bcrypt');
const router = require('express').Router();
const app = express();
const passport = require('passport');

// User Model
const User = require("../models/user");

// Need to use this to be able to use views folder
app.use(express.static('views'));

// Home route
router.get('/', (req, res) => {
  res.send(`${base}/index.html`);
});

// Registration Successful route
router.get('/regSuccess', (req, res) => {
  res.sendFile(`${base}/regSuccess.html`);
});

// Sign In route
router.get('/signin', (req, res) => {
  res.sendFile(`${base}/reqsignup.html`);
});

// Registration Failed route
router.get('/regFailed', (req, res) => {
  res.sendFile(`${base}/regFailed.html`);
});

// Welcome route
router.get('/welcome', (req, res) => {
  //only show this if request is authenticated
  if (req.isAuthenticated()) {
    res.sendFile(`${base}/welcome.html`);
  } else {
    console.log("Please login again");
    res.redirect('/signin');
  }
});

// Signup
router.post('/', (req, res) => {

  //hashing password before storing in db
  const hashedPass = bcrypt.hashSync(req.body.password, 10);
  const user = new User(
    {
      country: req.body.country,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: hashedPass,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      mobile_number: req.body.mobile_number,
    }
  );

  //Saving info to database
  if (req.body.password === req.body.confirm_password) {

    user.save((err) => {
      if ((err)) {
        console.log(err);
        res.redirect(`/regFailed`);
      } else {
        console.log("Registration Successful!");
        res.redirect(`/regSuccess`);
      }
    })
  }
  else {
    res.redirect(`/regFailed`);
    throw new Error("Passwords do not match")
  }
});

// Login post request
router.post('/signin', passport.authenticate('local', {
	failureRedirect: '/signin',
	failureFlash: true
}), (req, res) => {

	// Set up the max age of cookie
	if ( req.body.rememberme ) {
		req.session.cookie.originalMaxAge = 24 * 60 * 60 * 1000 // Expires in 1 day
	} else {
		req.session.cookie.expires = false
	}
	res.redirect('/welcome')
})

//logout
router.get('/signout', (req, res) => {
  req.logout();
  req.session.destroy((err) => {
    res.redirect('/signin');
  });
});

// GET /google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve redirecting
//   the user to google.com.  After authorization, Google will redirect the user
//   back to this application at /auth/google/callback
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/signin' }),
  function (req, res) {
    res.redirect('/profile');
  });

module.exports = router;
