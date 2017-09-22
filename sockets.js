var _ = require('underscore');
var db = require('./db/mongo-dao');

// export function for listening to the socket
module.exports = function (socket) {
    socket.on('join_group', function(data, next) {
        if (!data.group) return;
        var groupName = data.group.toUpperCase();
        socket.join(groupName);
        //Todo we probably want to use socket.set and socket.get
        socket.user_group = groupName;  //We mainly need this for the disconnect
        socket.user_name = data.name;

        //Add user to the group then emit it so the others know
        var addMember = function (){
            db.addUpdateMember(data, function(){
                //emit user out to everyone user
                socket.in(groupName).emit('send:newUser', data);
                db.findGroupAndAllAttrs(data.group, function(err, found){
                    if(err) return;
                    next && next(found);
                });
            })
        };
        
        
        //Create group if it doesn't exist then add this member
        db.findGroup(groupName, function(err, group){
            if(err) return;

            //create group if it doesn't exist.
            if(!group) {
                var group = {
                    name: groupName
                };
                db.addGroup(group, function(){
                    addMember();
                })
            } else {
                addMember();
            }
        })
        
    });

    // broadcast a user's message to other users
    socket.on('send:message', function (data, next) {
        if (!data.group) return;
        var msg = {
            username: data.username,
            text: data.text,
            type: data.type,
            group: data.group,
            timestamp: data.timestamp
        };
        socket.in(data.group.toUpperCase()).emit('send:message', msg);
        db.addUpdateChat(msg, function(){
            next && next(msg);
        });
    });

    // broadcast a place has been added to other users
    socket.on('send:newPlace', function (place, next) {
        if (!place) return;
        db.addUpdatePlace(place, function(){
            socket.in(place.group).emit('send:newPlace', place);
            next && next();
        });
    });

    // broadcast a place has been added to other users
    socket.on('send:vote', function (data, next) {
        if (!data.group) return;
        var groupName = data.group.toUpperCase();
        socket.in(groupName).emit('send:vote', data);

        //find the places that's receiving the vote
        ///update the places for this group with the vote that just came in

        db.findPlace(data, function(err, place){
            if (err) return;

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
            db.addUpdatePlace(place, function(err){
                if (err) console.log("err updating vote on place");
                next && next();
            })
        });
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

        var msg = {
            type: "system",
            username: "",
            timestamp: new Date(),
            text: socket.user_name + " has left.",
            group:socket.user_group
        };
        socket.in(socket.user_group).emit('send:message', msg);

        //We have to update the chat manually because this is a system event and doesn't get saved on the send:message socket.on above.
        db.addUpdateChat(msg);

        //remove the existing person from mongo and see if he was the last one.  If so remove group from db.
        db.removeMember({name: socket.user_name, group:socket.user_group}, function(){
            db.findMembersByGroup(socket.user_group, function(err, members){
                if(!members || members.length <= 0){
                    db.removeGroupAndAllAttrs(socket.user_group, function(err, result){
                        if(err){
                            console.log("error removing group and attrs:" + err);
                        }
                    })
                }
            })
        });

    });
};