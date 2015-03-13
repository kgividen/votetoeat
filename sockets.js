//TODO We need to hold votes in memory like the users so that when a third one comes in they get them on join_group.
//TODO whereiwanttoeat.com, votetoeat.com is available

var _ = require('underscore');

//[
//    {
//        "name": "group1",
//        "members":[{
//                      "name":"c1",
//                      "votesLeft": 10,
//                  },{
//                      "name":"f1",
//                      "votesLeft":10
//        }],
//        "places":[{
//            "name":"Cafe Rio",
//            "votes":10
//        }]
//    },
//    {
//        "name": "group2",
//        "members":[{
//                      "name":"c1",
//                      "votesLeft": 10,
//                  },{
//                      "name":"f1",
//                      "votesLeft":10
//        }],
//        "places":[{
//            "name":"Culvers",
//            "votes":10
//        }]
//    }
//]
var groups = [];

// export function for listening to the socket
module.exports = function (socket) {
    socket.on('join_group', function(data, callback) {
        socket.join(data.group);
        socket.user_group = data.group;
        socket.user_name = data.user.name;

        //Todo we probably want to move all this group array logic out to a database with some rest calls instead of handling it with socket.io and keeping it in memory

        //Find out if group exists add this user as a member then emit the new array.
        var groupInArray = _.findWhere(groups,{"name": data.group});
        if(groupInArray){
            groupInArray.members.push(data.user);
            //socket.in(data.group).emit('send:updateGroup', groupInArray);
            socket.in(data.group).emit('send:newUser', data);
            if (callback) {
                callback(groupInArray);
            }
        // If not then add it to groups array and then add user as a member.
        // We don't need to emit in this case cause it's a new group created by that user
        } else {
            //new group
            var group = {
                "name": data.group
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
        socket.in(data.group).emit('send:message', {
            user: name,
            text: data.message
        });
    });

    // broadcast a user has been added to other users
    socket.on('send:updateGroup', function (data) {
        socket.in(data.group).emit('send:updateGroup', data);
        socket.user_name = data.name;
    });

    socket.on('send:newUser', function (data) {
        socket.in(data.group).emit('send:newUser', data);
        socket.user_name = data.user.name;
    });

    socket.on('user:left', function (data) {
        socket.in(data.group).emit('user:left', data);
    });

    // broadcast a place has been added to other users
    socket.on('send:newPlace', function (data) {
        //add new place to group
        var group = _.findWhere(groups,{"name": data.group});
        if(group){
            group.places.push(data.place);
            //socket.in(data.group).emit('send:updateGroup', groupInArray);
            socket.in(data.group).emit('send:newPlace', data);
        }
    });

    // broadcast a place has been added to other users
    socket.on('send:vote', function (data) {
        socket.in(data.group).emit('send:vote', data);
        var groupArray = _.find(groups, function(group){
            return group.name == data.group;
        });

        //update the place with the votes
        var place = _.find(groupArray.places, function(place){
            return place.name == data.name;
        });
        place.votes = place.votes + data.newVote;

        //substract the votes from the user so it's tracked in the variables
        var voter = _.find(groupArray.members, function(member){
            return member.name == data.newVoter;
        });

        voter.votesLeft = voter.votesLeft - data.newVote;
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