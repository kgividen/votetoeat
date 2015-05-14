var express = require('express');
var router = express.Router();
var userService = require('../services/user-service');
var groupService = require('../services/group-service');
var restrict = require('../auth/restrict');

//Add a group
router.put('/group/:groupName', restrict, function (req, res, next) {
    var newGroup = {
        name: encodeURIComponent(req.params.groupName),
        members: [],
        places: []
    };

    groupService.addGroup(newGroup, function (data){
        res.send(data);
    });
});

//Add member to a group
router.post('/group/:groupName/:userName', restrict, function (req, res, next) {
    var group = {
        name: encodeURIComponent(req.params.groupName),
        member: encodeURIComponent(req.params.userName)
    };

    groupService.addMemberToGroup(group, function (data){
        res.send(data)
    });
});

//Get a group
router.get('/group/:groupName', restrict, function (req, res, next) {
    groupService.findGroup(encodeURIComponent(req.params.groupName), function(err, vm) {
        if (vm){
            res.send(vm);
        } else {
            res.send("Group not found.");
        }
    });
});


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