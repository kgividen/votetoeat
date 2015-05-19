var db = require('../db/mongo-dao.js');
var bcrypt = require('bcrypt');

exports.addUser = function(user, next) {
    if (user.pwd1 != user.pwd2) return "Passwords don't match";

    bcrypt.hash(user.pwd1, 10, function(err, hash) {
        if (err) {
            return next(err);
        }

        var newUser = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email.toLowerCase(),
            password: hash
        };


        db.addUser(newUser, function(err, user){
            next(err, user);
        });
    })

};

exports.findUser = function(email, next) {
    db.findUser({email: email.toLowerCase()}, function(err, user){
        next(err, user);
    });
};