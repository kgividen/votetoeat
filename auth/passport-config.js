module.exports = function() {
    var passport = require('passport');
    var passportLocal = require('passport-local');
    var userService = require('../services/user-service');

    passport.use(new passportLocal.Strategy({usernameField: 'email'}, function(email, password, next) {
        userService.findUser(email, function(err, user) {
            if (err) {
                return next(err);
            }
            if (!user || user.password != password) {
                return next(null, null);
            }
            next(null, user);
        });
    }));

    passport.serializeUser(function(user, next) {
        next(null, user.email);
    });

    passport.deserializeUser(function(email, next) {
        userService.findUser(email, function(err, user) {
            next(err, user);
        });
    });
};