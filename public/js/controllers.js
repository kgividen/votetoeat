function wteController($scope, $filter, $http, socket) {
    $scope.users = [];
    $scope.places = [];
    $scope.messages = ["Welcome!  Let's find out Where To Eat!"];
    $scope.vote_max = 10;
    $scope.votes_left = 10;
    $scope.voted = false;
    $scope.showGroupBox = true;
    $scope.showMainApp = false;
    $scope.groupName = "";

    $scope.createGroup = function () {
        //todo: make sure name is unique?
        var group_guid = wte_util.createGuid();
        $scope.group_guid = group_guid;
        $("#enterNameModal").modal('show');
    };

    $scope.joinGroup = function () {
        //We emit after entering the name so that's in $scope.addUser
        $("#enterNameModal").modal('show');
    };

    $scope.addUser = function() {
        var nUser = {
            "id" : wte_util.createGuid(),
            "name" : $scope.userName,
            "points" : "10"
        };

        socket.emit('join_group', {
            group: $scope.groupName,
            user: nUser
        },function(data){
            $scope.users = data.members;
            $scope.places = data.places;
        });

        //Tell the user it happened.
        $scope.showGroupBox = false;
        $scope.showMainApp = true;
    };

    $scope.addPlace = function() {
        var place = {
            "name" : $scope.placeName,
            "num_votes" : "0"
        };

        //Update local UI
        $scope.places.push(place);

        //send place to the other clients
        var obj = {};
        obj.group = $scope.groupName;
        obj.place = place;
        socket.emit('send:newPlace', obj);

        $scope.messages.push(place.name + " was added as a place to eat by " + $scope.userName +"!");
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
            place.newVoter = $scope.userName;

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
    //socket.on('send:updateGroup', function (data) {
    //    //Add them to the list of people
    //    //$scope.users = $scope.users.concat(nUser);
    //    //$scope.newUser = data.user.name;
    //    $scope.users = data.members;
    //
    //    // Notify everyone that a new person is here via a message to our messages model
    //    $scope.messages.push(data.user.name + " is now here!");
    //});

    socket.on('send:newUser', function (data) {
        //Add them to the list of people
        $scope.users.push(data.user);

        // Notify everyone that a new person is here via a message to our messages model
        $scope.messages.push(data.user.name + " is now here!");
    });

    //When a new place comes from somewhere we need to add it to our list.
    socket.on('send:newPlace', function (data) {
        //update the UI
        $scope.places.push(data.place);

        // Notify everyone that a new person is here via a message to our messages model
        $scope.messages.push(data.place.name + " was added as a place to eat!");
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
        //remove the user from the array
        for (i = 0; i < $scope.users.length; i++) {
            if ($scope.users[i].name === user.name) {
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