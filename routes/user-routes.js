const express = require('express');
const path = require('path');
const base = path.join(__dirname, '../views');
// To connect to API
const https = require("https");
//To hash the password
const bcrypt = require('bcrypt');

const router = require('express').Router();
const app = express();


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
  res.sendFile(`${base}/welcome.html`);
});


// 404 route
// app.get('/*', (req, res) => {
//   res.sendFile(`${base}/404.html`);
// });

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

  const data = {
    members: [
      {
        email_address: req.body.email,
        status: "subscribed",
        merge_fields: {
          FNAME: req.body.first_name,
          LNAME: req.body.last_name
        }
      }
    ]
  }
  //mailchimp only accepts JSON, need to convert it to JSON
  var jsonData = JSON.stringify(data);

  // MailChimp Stuff
  const url = "https://us17.api.mailchimp.com/3.0/lists/53ca52654e"
  const options = {
    method: "POST",
    auth: "jainamb:15fa9f9ee79b0f8ad5757bc003430bbd-us17"
  }

  //Saving info to database
  if (req.body.password === req.body.confirm_password) {
    user.save((err) => {
      if ((err)) {
        console.log(err);
        res.redirect(`/regFailed`);
      } else {

        console.log("Registration Successful!");
        res.redirect(`/regSuccess`);
        //Send email only after registration is successful

        const request = https.request(url, options, (response) => {
          response.on("data", (data) => {
            console.log(JSON.parse(data))
          })
        })
        request.write(jsonData);
        request.end();
      }
    })
  }
  else {
    res.redirect(`/regFailed`);
    throw new Error("Passwords do not match")
  }
});

//Login
router.post('/signin', (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(500).send();
    }
    if (!user) {
      console.log("Email do not match");
      res.redirect(`/*`);
      return res.status(404).send();
    }
    if (user) {
      if (bcrypt.compareSync(req.body.passwordlogin, user.password)) {
        console.log("Welcome!, you are logged in")
        res.redirect(`/welcome`);
        return res.status(200).send();
      } else {
        console.log("Wrong Password");
        // send them page not found error
        res.redirect(`/*`);
        return res.status(404).send();
      }
    }
    return res.status(200).send();
  })
})

//logout
router.get('/logout', (req, res) => {
  res.send(`loggin out`);
});

// Google auth
router.get('/google', (req, res) => {
  res.send(`Google login`);
});
module.exports = router;
