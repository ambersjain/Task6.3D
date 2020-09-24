const router = require('express').Router();
const path = require('path');
const base = path.join(__dirname, '../views');

// Need to use this to be able to use views folder


//Check if user is logged in
const authCheck = (req, res, next) => {
    if (!req.user) {
        // if the user is not logged in?
        res.redirect('/signin');
    } else {
        next();
    }
};

// So theere are 3 values in get
// authCheck is called middleware
// if authCheck returns next(), then only req, res function will fire
router.get('/', authCheck, (req, res) => {
    //res.render(`${base}/profile.html`, {user:req.user});
    res.send('You are logged in. Welcome to iCrowd ' + req.user.username + '<br><br><a href="/signout">Logout</a>');
});

module.exports = router;