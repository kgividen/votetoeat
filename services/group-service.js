var db = require('../db/mongo-dao.js');

exports.addGroup = function(group, next) {
    var newGroup = {
        name: group.name.toLowerCase(),
        members: group.members,
        places: group.places
    };

    db.addGroup(newGroup, function(err, group){
        next(err, group);
    });
};

exports.findGroup = function(name, next) {
    _findGroup(name, next);
};
//
//exports.addMemberToGroup = function(group, next) {
//    var query = {name: group.name};
//
//    Group.findOne(query, function (err, doc) {
//        if (err) next(err);
//        //TODO make sure this member doesn't already exist.
//        //TODO get firstName
//        doc.members.push(
//            {
//                firstName:"blah",
//                userName: group.member
//            }
//        );
//        doc.save(function(err) {
//            if (err) return next(err);
//            next(null);
//        });
//    })
//};
//
//function _findGroup (name, next) {
//    Group.findOne({name: name.toLowerCase()}, function(err, group){
//        next(err, group);
//    });
//}