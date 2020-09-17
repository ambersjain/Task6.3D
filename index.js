const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const validator = require('validator');
const port = 8080;
const base = `${__dirname}/views`;
// To connect to API
const https = require("https");
//To hash the password
const bcrypt = require('bcrypt');
// For Google Auth
const passport = require('passport');
const session = require('express-session');



// User Model
const User = require("./models/user");
const { EEXIST } = require('constants');

// Worker Model
const Worker = require("./models/worker");

//use Google auth in app
/*
 Set the session up for authentication, order is important
*/
app.use(session({
  cookie:{maxAge:12000},
  resave:false,
  saveUninitialized:false,
  secret:'secret'
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// //Database connection using mongoose
const mongoose = require("mongoose");
// This keeps away the warning
mongoose.set('useCreateIndex', true);
// This craetes and connects to the db
mongoose.connect("mongodb://localhost:27017/iCrowdTaskDB", { useNewUrlParser: true ,  useUnifiedTopology: true })
let db = mongoose.connection;

// Check for DB errors
db.on('error', function (err) {
  console.log(err);
})

// Check db connection
db.once('open', function () {
  console.log('Connected to MongoDB');
})


// Need to use this to be able to use views folder
app.use(express.static('views'));

// Home route
app.get('/', (req, res) => {
  res.send(`${base}/index.html`);
});

// Registration Successful route
app.get('/regSuccess', (req, res) => {
  res.sendFile(`${base}/regSuccess.html`);
});

// Sign In route
app.get('/signin', (req, res) => {
  res.sendFile(`${base}/reqsignup.html`);
});

// Registration Failed route
app.get('/regFailed', (req, res) => {
  res.sendFile(`${base}/regFailed.html`);
});

// Welcome route
app.get('/welcome', (req, res) => {
  res.sendFile(`${base}/welcome.html`);
});


// 404 route
// app.get('/*', (req, res) => {
//   res.sendFile(`${base}/404.html`);
// });

// Signup
app.post('/', (req, res) => {

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
app.post('/signin', (req, res) => {
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


/*
    WORKER ROUTES
*/


/* USE GET, POST and DELETE TO
  - Retrieve, add and remove workers respectively[URI: /workers]
*/


app.route('/workers')
  .get((req, res) => {
    Worker.find((err, workerList) => {
      if (err) { res.send(err) }
      else { res.send(workerList) }
    })

  })
  .post((req, res) => {
    const worker = new Worker({
      id: req.body.id,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      address: req.body.address,
      mobile_number: req.body.mobile_number,
    });

    worker.save((err) => {
      if (err) { res.send(err); console.log("Unable to add the worker"); }
      else { res.send("Worker Added Succesfully") }
    })
  })
  .delete((req, res) => {
    Worker.deleteMany((err) => {
      if (err) { res.send(err) }
      else { res.send("Successfully deleted all worker records!") }
    })
  });


/* USE GET, PUT and DELETE TO
  - Retrieve, update and remove a specific worker [URI: /workers/:id]
*/

/* USE PATCH TO
  - Update specific worker’s address and mobile phone [URI: /workers/:id]
  - Update a specific worker’s password [URI: /workers/:id]
*/
app.route('/workers/:id')
  .get((req, res) => {
    Worker.findOne({ id: req.params.id }, (err, foundWorker) => {
      if (foundWorker) { res.send(foundWorker) }
      else { res.send("Worker not found.") }
    })
  })
  .put((req, res) => {
    Worker.update(
      { id: req.params.id },
      {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        address: req.body.address,
        mobile_number: req.body.mobile_number
      },
      { overwrite: true },
      (err) => {
        if (err) { res.send(err) }
        else { res.send("Successfully Updated!") }
      }
    )
  })
  .delete((req, res) => {
    Worker.deleteOne({ id: req.params.id }, (err, foundWorker) => {
      if (foundWorker) { res.send(foundWorker) }
      else { res.send("Worker account not deleted") }
    })
  })
  .patch((req, res) => {
    Worker.update(
      { id: req.params.id },
      { $set: req.body },
      { overwrite: true },
      (err) => {
        if (err) { res.send(err) }
        else { res.send("Successfully Updated!") }
      }
    )
  })

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
