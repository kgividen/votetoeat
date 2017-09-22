var tingo = require('tingodb')();
var db = new tingo.Db('mongoDBFiles', {});
var groupCollection = "groups";
var placesCollection = "places";
var membersCollection = "members";
var chatCollection = "chatSessions";
var _ = require('underscore');

//GROUPS
exports.addGroup = function(group, next) {
    group.name = group.name.toUpperCase();
    db.collection(groupCollection).findOne({name: group.name},function(err, foundGroup){
        if (err) {
            next && next(err, null);
        }
        if(foundGroup){
            var results = "GroupExists";
            next && next(err,results);
        } else {
            group.members=[];
            group.places=[];
            db.collection(groupCollection).insert(group, {}, function (err, results) {
                next && next(err, results);
            });
        }
    });
};

exports.updateGroup = function (group, next) {
    group.name = group.name.toUpperCase();
    db.collection(groupCollection).update({name: group.name}, group, {upsert: true},
        function (err, object) {
            if (err) {
                console.warn(err.message);
                next && next(err, null);
            }
            next && next(err, object);
        }
    );
};

exports.findGroup = function(name, next) {
    name = name.toUpperCase();
    db.collection(groupCollection).findOne({name: name},function(err, group){
        if (err) {
            next && next(err, null);
        }
        next && next(err, group);
    });
};

var _removeGroup = function(name, next) {
    name = name.toUpperCase();
    db.collection(groupCollection).remove({name: name}, function(err){
        next && next(err);
    });
};

exports.removeGroup = _removeGroup;

//PLACES
exports.addUpdatePlace = function (place, next) {
    db.collection(placesCollection).update({name: place.name, group:place.group}, place, {upsert: true},
        function (err, object) {
            if (err) {
                console.warn(err.message);
                next && next(err, null);
            }
            next && next(err, object);
        }
    );
};

exports.removePlace = function(name, next) {
    db.collection(placesCollection).remove({name: name}, function(err){
        next && next(err);
    });
};


var _removePlacesByGroup = function(groupName, next) {
    db.collection(placesCollection).remove({group:groupName}, function(err){
        next && next(err);
    });
};

exports.removePlacesByGroup = _removePlacesByGroup;

exports.findPlace = function(place, next) {
    db.collection(placesCollection).findOne({name: place.name, group:place.group},function(err, found){
        if (err) {
            next && next(err, null);
        }
        next && next(err, found);
    });
};


var _findPlacesByGroup = function (groupName, next) {
    db.collection(placesCollection).find({group: groupName}).toArray(function (err, places) {
        if (err) {
            console.warn(err.message);
            next && next(err, null);
        }
        next && next(err, places);
    });
};

exports.findPlacesByGroup = _findPlacesByGroup;

//Chat session
exports.addUpdateChat = function (msg, next) {
    db.collection(chatCollection).insert(msg, {},
        function (err, object) {
            if (err) {
                console.warn(err.message);
                next && next(err, null);
            }
            next && next(err, object);
        }
    );
};

var _removeChatByGroup = function(groupName, next) {
    db.collection(chatCollection).remove({group: groupName}, function(err){
        next && next(err);
    });
};

exports.removeChatByGroup = _removeChatByGroup;

var _findChatsByGroup = function(groupName, next) {
    db.collection(chatCollection).find({group:groupName}).toArray(function(err, found){
        if (err) {
            next && next(err, null);
        }
        next && next(err, found);
    });
};

exports.findChatsByGroup = _findChatsByGroup;

//Group Members
exports.addUpdateMember = function (member, next) {
    db.collection(membersCollection).update({name: member.name, group:member.group}, member, {upsert: true},
        function (err, object) {
            if (err) {
                console.warn(err.message);
                next && next(err, null);
            }
            next && next(err, object);
        }
    );
};

exports.removeMember = function(member, next) {
    db.collection(membersCollection).remove({name: member.name, group:member.group}, function(err){
        next && next(err);
    });
};

exports.findMember = function(member, next) {
    db.collection(membersCollection).findOne({name: member.name, group:member.group},function(err, found){
        if (err) {
            next && next(err, null);
        }
        next && next(err, found);
    });
};

var _removeMembersByGroup = function(groupName, next) {
    db.collection(membersCollection).remove({group: groupName}, function(err){
        next && next(err);
    });
};

exports.removeMembersByGroup = _removeMembersByGroup;


var _findMembersByGroup = function (groupName, next) {
    db.collection(membersCollection).find({group: groupName}).toArray(function (err, members) {
        if (err) {
            console.warn(err.message);
            next && next(err, null);
        }
        next && next(err, members);
    });
};

exports.findMembersByGroup = _findMembersByGroup;


//USERS
exports.findUser = function(name, next) {
    db.collection("users").findOne({name: name},function(err, user){
        if (err) {
            next && next(err, null);
        }
        if(user){
            next && next(err, user);
        } else {
            next && next({message:"User not found"});
        }
    });
};

exports.addUser = function(user, next) {
    db.collection("users").findOne({name: user.name},function(err, foundUser){
        if (err) {
            next && next(err, null);
        }
        //If user doesn't exist then add them
        if(foundUser){
            next && next({message:"Duplicate User Found"});
        } else {
            db.collection("users").insert(user, {}, function (err, results) {
                next && next(err, results);
            });
        }
    });
};

exports.removeUser = function(name, next) {
    db.collection("users").remove({name: name}, function(err){
        next && next(err);
    });
};

//COMBINED DATA FUNCTIONS
exports.findGroupAndAllAttrs  = function (groupName, next) {
    db.collection(groupCollection).findOne({name: groupName},function(err, group){
        if (err) {
            next && next(err, null);
        }
        _findPlacesByGroup(groupName, function(err, groupPlaces){
            if (err) {
                next && next(err, null);
            }
            _findMembersByGroup(groupName, function(err, groupMembers){
                if (err) {
                    next && next(err, null);
                }
                _findChatsByGroup(groupName, function(err, chatSession) {
                    if (err) {
                        next && next(err, null);
                    }
                    _.each(groupMembers, function (m) {
                        delete m.group
                    });  //remove them cause they're dups
                    _.each(groupPlaces, function (p) {
                        delete p.group
                    });
                    _.each(chatSession, function (c) {
                        delete c.group
                    });

                    //Combine places and members into one object
                    var groupCombined = {
                        name: groupName,
                        places: groupPlaces,
                        members: groupMembers,
                        chatSession: chatSession
                    };

                    next && next(err, groupCombined);
                });
            });
        })
    });
};

exports.removeGroupAndAllAttrs = function (groupName, next) {
    _removeGroup(groupName, function(err, result){
        if(err){
            console.log("error removing group:" + err);
        }
        _removePlacesByGroup(groupName, function(err){
            if(err){
                console.log("error removing placesByGroup:" + err);
            }
            _removeChatByGroup(groupName, function(err){
                if(err){
                    console.log("error removing chatsByGroup:" + err);
                }
                _removeMembersByGroup(groupName, function(err) {
                    if (err) {
                        console.log("error removing membersByGroup:" + err);
                    }
                    next && next(err);
                });
            })
        });
    })
}
