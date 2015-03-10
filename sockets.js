var users = [];

// export function for listening to the socket
module.exports = function (socket) {
    socket.on('join_group', function(data) {
        socket.join(data.group);
        socket.user_group = data.group;
        socket.in(data.group).emit('send:newUser', data);
        socket.user_name = data.user.name;
        users.push(data.user.name);
    });

    // broadcast a user's message to other users
    socket.on('send:message', function (data) {
        socket.in(data.group).emit('send:message', {
            user: name,
            text: data.message
        });
    });

    // broadcast a user has been added to other users
    //socket.on('send:newUser', function (data) {
    //    socket.in(data.group).emit('send:newUser', data);
    //    socket.user_name = data.name;
    //    users.push(data.name);
    //});

    // broadcast a place has been added to other users
    socket.on('send:newPlace', function (data) {
        socket.in(data.group).emit('send:newPlace', data);
    });

    // broadcast a place has been added to other users
    socket.on('send:vote', function (data) {
        socket.in(data.group).emit('send:vote', data);
    });

    // clean up when a user leaves, and broadcast it to other users
    socket.on('disconnect', function (data) {
        socket.in(socket.user_group).emit('user:left', {
            name: socket.user_name
        });
    });
};