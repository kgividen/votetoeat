var express = require('express');
var router = express.Router();
var userService = require('../services/user-service');
var restrict = require('../auth/restrict');

//todo Needs Work if we need it.
//router.post('/user', function (req, res, next) {
//    userService.addUser(req.body, function(err) {
//        if (err) {
//            var vm = {
//                title: 'Create an account',
//                input: req.body,
//                error: err
//            };
//            delete vm.input.password;
//            return res.render('users/create', vm);
//        }
//        req.login(req.body, function(err) {
//            res.redirect('/main');
//        });
//    });
//});

//get currently logged in user
router.get('/user',  restrict, function (req, res, next) {
    var vm = {};
    if(req.user) {
        vm = {
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            created: req.user.created
        }
    }
    res.send(vm);
});

module.exports = router;