function wteController($scope, $filter, $http, socket, growl) {
    $scope.users = [];
    $scope.places = [];
    $scope.vote_max = 10;
    $scope.votesLeft = 10;
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
            //"id" : wte_util.createGuid(),
            "name" : $scope.userName,
            "votesLeft" : "10"
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

        growl.success("Welcome!  Let's find out Where To Eat!");
    };

    $scope.addPlace = function() {
        var place = {
            "name" : $scope.placeName,
            "votes" : 0
        };

        //Update local UI
        $scope.places.push(place);

        //send place to the other clients
        var obj = {};
        obj.group = $scope.groupName;
        obj.place = place;
        socket.emit('send:newPlace', obj);

        //growl.info(place.name + " was added as a place to eat by " + $scope.userName +"!", {ttl: 2000, disableCountDown: true});
        growl.info(place.name + " was added as a place to eat by " + $scope.userName +"!");
    };

    $scope.voteForPlace = function(place,n) {
        if($scope.votesLeft > 0 && $scope.votesLeft - n >= 0){
            //todo: disable that buttonbar so they can't revote on that item.
            $scope.votesLeft = $scope.votesLeft - n;
            if(!place.votes){
                place.votes = 0;
            }
            place.votes = parseInt(place.votes) + n;

            //Subtract votes from this user
            var user = _.find($scope.users, function(user){
                return user.name == $scope.userName;
            });

            user.votesLeft = $scope.votesLeft;

            //Send this to everyone else
            place.newVote = n;
            place.newVoter = $scope.userName;
            place.group = $scope.groupName;

            socket.emit('send:vote', place);

            //Tell the user it happened
            growl.info(place.name + " had " + n + " votes added by " + place.newVoter + "!");
        }else{
            growl.error("Sorry not enough votes left!");
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
        growl.info(message);
    });

    //When a new person comes from somewhere we need to add it to our list.
    socket.on('send:newUser', function (data) {
        //Add them to the list of people
        $scope.users.push(data.user);

        // Notify everyone that a new person is here via a message to our messages model
        growl.info(data.user.name + " is now here!");
    });

    //When a new place comes from somewhere we need to add it to our list.
    socket.on('send:newPlace', function (data) {
        //update the UI
        $scope.places.push(data.place);

        // Notify everyone that a new person is here via a message to our messages model
        growl.info(data.place.name + " was added as a place to eat!");
    });

    //When someone votes we need to update the total.
    socket.on('send:vote', function (place) {
        //get the correct place from the scope based on the ID.
        var currentPlace = _.find($scope.places, function(p){
            return p.name == place.name;
        });
        if(!currentPlace.votes){
            currentPlace.votes = 0;
        }
        currentPlace.votes = currentPlace.votes + place.newVote;

        //TODO Take vote away from correct user
        var voter = _.find($scope.users, function(user){
            return user.name == place.newVoter;
        });

        voter.votesLeft = voter.votesLeft - place.newVote;
        // Notify everyone that a new vote happened a message to our messages model
        growl.info(currentPlace.name + " had " + place.newVote + " votes added by " + place.newVoter + "!");
    });

    socket.on('user:left', function(user) {
        growl.warn(user.name + " has left.");
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