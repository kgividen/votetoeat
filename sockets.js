var _ = require('underscore');

//[
//    {
//        "name": "group1",
//        "members":[{
//            "name":"c1"
//        },{
//            "name":"f1"
//        }],
//        "places":[{
//            "name":"Cafe Rio",
//            "voters": [
//                {
//                    "name" : "c1",
//                    "vote" : 10
//                },
//                {
//                    "name" : "f1",
//                    "vote" : 5
//                }
//            ]
//        }]
//    },
//    {
//        "name": "group2",
//        "members":[{
//            "name":"c1"
//        },{
//            "name":"f1"
//        }],
//        "places":[{
//            "name":"Culvers",
//            "voters": [
//                {
//                    "name" : "c1",
//                    "vote" : 2
//                },
//                {
//                    "name" : "f1",
//                    "vote" : 10
//                }
//            ]
//        }]
//    }
//]
var groups = [];

// export function for listening to the socket
module.exports = function (socket) {
    socket.on('join_group', function(data, callback) {
        var groupName = data.group.toUpperCase();
        socket.join(groupName);
        socket.user_group = groupName;
        socket.user_name = data.user.name;

        //Todo we probably want to move all this group array logic out to a database with some rest calls instead of handling it with socket.io and keeping it in memory

        //Find out if group exists add this user as a member then emit the new array.
        var groupInArray = _.findWhere(groups,{"name": groupName});
        if(groupInArray){
            groupInArray.members.push(data.user);
            //socket.in(groupName).emit('send:updateGroup', groupInArray);
            socket.in(groupName).emit('send:newUser', data);
            if (callback) {
                callback(groupInArray);
            }
        // If not then add it to groups array and then add user as a member.
        // We don't need to emit in this case cause it's a new group created by that user
        } else {
            //new group
            var group = {
                "name": groupName
            };
            group.members = [];
            group.places = [];
            group.members.push(data.user);
            groups.push(group);
            if (callback) {
                callback(group);
            }
        }
    });

    // broadcast a user's message to other users
    socket.on('send:message', function (data) {
        socket.in(data.group.toUpperCase()).emit('send:message', {
            user: name,
            text: data.message
        });
    });

    // broadcast a user has been added to other users
    socket.on('send:updateGroup', function (data) {
        socket.in(data.group.toUpperCase()).emit('send:updateGroup', data);
        socket.user_name = data.name;
    });

    socket.on('send:newUser', function (data) {
        socket.in(data.group.toUpperCase()).emit('send:newUser', data);
        socket.user_name = data.user.name;
    });

    socket.on('user:left', function (data) {
        socket.in(data.group.toUpperCase()).emit('user:left', data);
    });

    // broadcast a place has been added to other users
    socket.on('send:newPlace', function (data) {
        var groupName = data.group.toUpperCase();
        //add new place to group
        var group = _.findWhere(groups,{"name": groupName});
        if(group){
            group.places.push(data.place);
            socket.in(groupName).emit('send:newPlace', data);
        }
    });

    // broadcast a place has been added to other users
    socket.on('send:vote', function (data) {
        var groupName = data.group.toUpperCase();
        socket.in(groupName).emit('send:vote', data);
        var groupArray = _.find(groups, function(group){
            return group.name == groupName;
        });

        //update the place with the votes
        var place = _.find(groupArray.places, function(place){
            return place.name == data.name;
        });

        //Modify the vote but if we're the first voter we need to add them
        var voter = _.findWhere(place.voters, {"name":data.voter});
        if(voter) {
            //modify voters votes
            voter.vote = data.vote;
        } else {
            //add voters votes
            var obj = {
                "name" : data.voter,
                "vote" : data.vote
            };
            place.voters.push(obj);
        }
    });

    socket.on('check_group_name', function(data, callback) {
        //Find out if group exists add this user as a member then emit the new array.
        if (callback) {
            callback(_.findWhere(groups,{"name": data.group.toUpperCase()}));
        }
    });


    // clean up when a user leaves, and broadcast it to other users
    socket.on('disconnect', function (data) {
        if(_.isUndefined(socket.user_name)){
            return;
        }

        //let everyone else know the user left.
        socket.in(socket.user_group).emit('user:left', {
            name: socket.user_name
        });

        //remove the exiting person from the group list.
        var groupArray = _.find(groups, function(group){
            return group.name == socket.user_group;
        });
        var idx = _.findIndex(groupArray.members, {name: socket.user_name})
        groupArray.members.splice(idx, 1); //remove member from array

        //If Group members is 0 remove the group from memory
        if(groupArray.members.length == 0){
            var gIdx = _.findIndex(groups, {name: socket.user_group});
            groups.splice(gIdx,1); //remove group from array
        }

    });
};