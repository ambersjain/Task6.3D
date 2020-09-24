const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 8080;
const session = require('express-session');

//getting the passwordReset routes
const passwordResetRoutes = require('./routes/passwordReset-router.js');

//Using EJS engine to pass data from server to html
app.set('view engine', 'ejs');

//getting the worker routes
const workerRoutes = require('./routes/worker-routes');

//getting the user routes
const userRoutes = require('./routes/user-routes');

//getting the profile routes
const profileRoutes = require('./routes/profile-routes');

const { EEXIST } = require('constants');
const passport = require('passport');


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

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// //Database connection using mongoose
const mongoose = require("mongoose");
// This keeps away the warning
mongoose.set('useCreateIndex', true);
// This craetes and connects to the db
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/iCrowdTaskDB", { useNewUrlParser: true ,  useUnifiedTopology: true })
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

// Use the worker routes
app.use(workerRoutes);

// Use the passwordReset routes
app.use(passwordResetRoutes);

// Use the user routes
app.use(userRoutes);

// Use the profile routes
app.use('/profile', profileRoutes);

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
