function wteController($scope, $filter, $http, socket) {
    $scope.users = [];
    $scope.newUser = "";
    $scope.places = [];
    $scope.messages = ["Welcome!  Let's find out Where To Eat!"];
    $scope.vote_max = 10;
    $scope.votes_left = 10;
    $scope.voted = false;
    $scope.showGroupBox = true;
    $scope.showMainApp = false;

    $scope.createGroup = function () {
        //todo: make sure name is unique?
        var group_guid = wte_util.createGuid();
        $scope.group_guid = group_guid;
        //var group = {
        //    "id" : group_guid,
        //    "password": "blah",
        //    "name" : $scope.group_name,
        //    "type" : "group"
        //};
        //socket.emit('join_group', {
        //    group: $scope.group_name
        //});

        $("#enterNameModal").modal('show');
    };

    $scope.joinGroup = function () {
    //    socket.emit('join_group', {
    //        group: $scope.group_name
    //    });
    //
        $("#enterNameModal").modal('show');
    };

    $scope.addPlace = function() {
        console.log($scope.places);

        var nPlace = {
            "id" : wte_util.createGuid(),
            "name" : $scope.place_name,
            "type" : "place",
            "group" : $scope.group_guid,
            "num_votes" : "0"
        };
        console.log("In add place" + nPlace);

        //Update local UI
        $scope.places = $scope.places.concat(nPlace);

        nPlace.group = $scope.group_name;
        //send it to the other clients
        socket.emit('send:newPlace', nPlace);

        $scope.messages.push(nPlace.name + " was added as a place to eat by " + $scope.user_name +"!");
    };

    $scope.addUser = function() {
        var nUser = {
            "id" : wte_util.createGuid(),
            "name" : $scope.user_name,
            "points" : "10",
            "group" : $scope.group_guid,
            "type" : "user"
        };

        //Disable the Add button so you can only add one user
//        $("#input_name").prop('disabled',true);

        socket.emit('join_group', {
            group: $scope.group_name,
            user: nUser
        });



        //Send this to everyone else
        //nUser.group = $scope.group_name;
        //socket.emit('send:newUser', nUser);

        //Tell the user it happened.
        $scope.showGroupBox = false;
        $scope.showMainApp = true;
    };

    $scope.voteForPlace = function(place,n) {


        if($scope.votes_left > 0 && $scope.votes_left - n >= 0){
            //todo: disable that buttonbar so they can't revote on that item.

            $scope.votes_left = $scope.votes_left - n;
            if(!place.num_votes){
                place.num_votes = 0;
            }
            place.num_votes = place.num_votes + n;

            //Send this to everyone else
            place.newVote = n;
            place.newVoter = $scope.user_name;

            socket.emit('send:vote', place);

            //Tell the user it happened
            $scope.messages.push(place.name + " had " + n + " votes added by " + place.newVoter + "!");
        }else{
            $scope.messages.push("Sorry not enough votes left!");
        }
    };

    // Socket listeners
    // ================
    //These are used if other people send out data.


    socket.on('init', function (data) {
//        $scope.name = data.name;
//        $scope.users = data.users;
    });

    socket.on('send:message', function (message) {
        $scope.messages.push(message);
    });

    //When a new person comes from somewhere we need to add it to our list.
    socket.on('send:newUser', function (data) {
        //Add them to the list of people
        //$scope.users = $scope.users.concat(nUser);
        $scope.newUser = data.user.name;
        $scope.users = data.users;

        // Notify everyone that a new person is here via a message to our messages model
        $scope.messages.push(data.user.name + " is now here!");
    });

    //When a new place comes from somewhere we need to add it to our list.
    socket.on('send:newPlace', function (nPlace) {
        //update the UI
        $scope.places = $scope.places.concat(nPlace);

        // Notify everyone that a new person is here via a message to our messages model
        $scope.messages.push(nPlace.name + " was added as a place to eat!");
    });

    //When someone votes we need to update the total.
    socket.on('send:vote', function (place) {
        var n = place.newVote;

        //get the correct place from the scope based on the ID.
        var currentPlace = $filter('getByProperty')('id', place.id, $scope.places);
        if(!currentPlace.num_votes){
            currentPlace.num_votes = 0;
        }
        currentPlace.num_votes = currentPlace.num_votes + n;

        // Notify everyone that a new vote happened a message to our messages model
        $scope.messages.push(currentPlace.name + " had " + n + " votes added by " + place.newVoter + "!");
    });

    socket.on('user:left', function(user) {
        $scope.messages.push(user.name + " has left.");
        for (i = 0; i < $scope.users.length; i++) {
            if ($scope.users[i] === user.name) {
                $scope.users.splice(i, 1);
                break;
            }
        }
    });


    //Utility methods
    // ================

    $scope.getNumber = function(num) {
        return new Array(num);
    };
}