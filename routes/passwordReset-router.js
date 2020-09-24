const router = require('express').Router();
const path = require('path');
const base = path.join(__dirname, '../views');
//To hash the password
const bcrypt = require('bcrypt');

// User Model
const User = require("../models/user");

// Nodemailer
const nodemailer = require("nodemailer");
const async = require("async");
const crypto = require("crypto");

router.get('/forgot', (req, res) => {
    res.sendFile(`${base}/forgotPassword.html`);
});

/*
  Code Structure Inspired from: github.com/yelp-camp-refactored
  * Using async waterfall to use the error and done functions in series
*/

router.post('/forgot', function (req, res, next) {
    async.waterfall([
        function (done) {
            //Generates a random token
            crypto.randomBytes(20, function (err, buffer) {
                var token = buffer.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, user) {
                if (!user) {
                    console.log("Email not found");
                    return res.redirect('/forgot');
                }
                // Store them in db
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 1800000; // About 0.5 hours

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            //sending emails
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'nordonamb@gmail.com',
                    pass: "Nordon@1234"
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'icrowdapp@gmail.com',
                subject: 'iCrowd Application Password Reset',
                text: 'Hello there! A password request has been made for this email account on iCrowd Application\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, (err)=> {
                // Triggers when the mail is sent
                console.log('An email has been sent to you email account, please check the spam folder!');
                res.json({message:'An email has been sent to you email account, please check the spam folder!'})
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

router.get('/reset/:token', function (req, res) {
    // This link is sent in emails while resetting the password
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
            console.log("Password token has expired, please reset password again");
            return res.redirect('/forgot');
        }
        res.render('resetPassword', { token: req.params.token });
    });
});

//This makes the password changes in the database
router.post('/reset/:token', function (req, res) {
    async.waterfall([
        function (done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                if (!user) {
                    console.log('Password reset token is invalid or has expired.');
                    return res.redirect('back');
                } else {
                    if (req.body.password === req.body.confirmpassword) {
                        const hashedPass = bcrypt.hashSync(req.body.password, 10);
                        user.password = hashedPass;
                        // Resetting the tokens
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;
                        user.save().then((savedUser)=>{
                         res.json({message:"password update success!"})
                      })
                    } else {
                        console.log("Passwords do not match, try again");
                        return res.redirect('back');
                    }
                }
            });
        }
    ], (err) => {
        res.redirect('/signin');
    });
});

module.exports = router;
