const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 8080;
//const passport = require('passport');
//const localPassportConfig = require('./config/local-passport-config');
const googlePassportConfig = require('./config/google-passport-config');

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');

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


// atlas details
// amberjain1234
// 'mongodbcloudpass'
// Use this when not connected to Heroku
const MONGODB_URI = "mongodb+srv://amberjain1234:mongodbcloudpass@icrowdtaskdb.t8nty.mongodb.net/<dbname>?retryWrites=true&w=majority"

// //Database connection using mongoose
const mongoose = require("mongoose");
// This keeps away the warning
mongoose.set('useCreateIndex', true);
// This craetes and connects to the db
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/iCrowdTaskDB", { useNewUrlParser: true, useUnifiedTopology: true })

let db = mongoose.connection;

// Check for DB errors
db.on('error', function (err) {
  console.log(err);
})

// Check db connection
db.once('open', function () {
  console.log('Connected to MongoDB');
})

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

//use Google auth in app
/*
 Set the session up for authentication, order is important
*/
app.use(cookieParser())
app.use(session({
  name: 'randomsignincookie',
  resave: false,
  saveUninitialized: false,
  secret: 'randomcookiesecret',
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
// app.use(localPassportConfig.initialize());
// app.use(localPassportConfig.session());

app.use(googlePassportConfig.initialize());
app.use(googlePassportConfig.session());


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
