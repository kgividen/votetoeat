var express = require('express');
var router = express.Router();
var userService = require('../services/user-service');
var passport = require('passport');
var config = require('../config');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/create', function (req, res, next) {
    var vm = {title: 'Create an account'};
    res.render('users/create', vm);
});

router.post('/create', function (req, res, next) {
    userService.addUser(req.body, function(err) {
        if (err) {
            var vm = {
                title: 'Create an account',
                input: req.body,
                error: err
            };
            delete vm.input.password;
            return res.render('users/create', vm);
        }
        req.login(req.body, function(err) {
            res.redirect('/main');
        });
    });
});

router.post('/login',
    function(req, res, next) {
        if (req.body.rememberMe) {
            req.session.cookie.maxAge = config.cookieMaxAge;
        }
        next();
    },
    passport.authenticate('local', {
            failureRedirect: '/',
            successRedirect: '/main',
            failureFlash: 'Invalid credentials'
    }));

router.get('/logout', function(req, res, next) {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;