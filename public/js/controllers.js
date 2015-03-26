function vteController($scope, $filter, $http, socket, growl) {
    $scope.users = [];
    $scope.places = [];
    $scope.vote_max = 10;
    $scope.voted = false;
    $scope.showGroupBox = true;
    $scope.showMainApp = false;
    $scope.groupName = "";
    $scope.voteBtnActive = 0;
    $scope.yelpData = "";
    $scope.yelpCity = "";

    $scope.createGroup = function () {
        //todo: make sure name is unique?
        //var group_guid = vte_util.createGuid();
        //$scope.group_guid = group_guid;

        //Get groups and check for duplicate
        socket.emit('check_group_name', {
            group: $scope.groupName
        },function(duplicate){
            if(duplicate){
                growl.error("Duplicate name please try again.", {ttl: 2000, disableCountDown: true, referenceId:"generalMessages"});

            } else {
                $("#enterNameModal").modal('show');
            }
        });
    };

    $scope.joinGroup = function () {
        //We emit after entering the name so that's in $scope.addUser
        $("#enterNameModal").modal('show');
    };

    $scope.addUser = function() {
        var nUser = {
            //"id" : vte_util.createGuid(),
            "name" : $scope.userName
        };

        socket.emit('join_group', {
            group: $scope.groupName,
            user: nUser
        },function(data){
            $scope.users = data.members;
            $scope.places = data.places;

            //update the totals of the votes since we just joined.
            _.each($scope.places, function(place){
                updateVotesOnPlace(place);
            })
        });

        //Tell the user it happened.
        $scope.showGroupBox = false;
        $scope.showMainApp = true;

        growl.success("Welcome!  Let's Vote To Eat!");
    };

    $scope.addPlace = function() {
        if (!$scope.placeName) return;  //make sure they've entered a place name.

        _addPlace($scope.placeName);
        //clear input box
        $scope.placeName = "";

    };

    $scope.voteForPlace = function(place,n) {
        //update the button group
        place["voteBtnActive"] = n;

        var newPlace = {
            "name" : place.name,
            "group" : $scope.groupName,
            "voter" : $scope.userName,
            "vote" : n
        };

        updateVotesOnPlace(newPlace);

        //Send this to everyone else
        socket.emit('send:vote', newPlace);
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
        updateVotesOnPlace(place);
    });

    socket.on('user:left', function(user) {
        if (!user.name) return;
        growl.warning(user.name + " has left.");
        //remove the user from the array
        for (i = 0; i < $scope.users.length; i++) {
            if ($scope.users[i].name === user.name) {
                $scope.users.splice(i, 1);
                break;
            }
        }
    });


    //set default focuses
    $('#createGroupModal').on('shown.bs.modal', function () {
        $('#input_group_name').focus();
    });

    $('#joinGroupModal').on('shown.bs.modal', function () {
        $('#join_group_name').focus();
    });

    $('#enterNameModal').on('shown.bs.modal', function () {
        $('#input_userName').focus();
    });



    function updateVotesOnPlace(place){
        //get the correct place from the scope based on the name.
        var currentPlace = _.find($scope.places, function(p){
            return p.name == place.name;
        });
        var voter = _.findWhere(currentPlace.voters, {"name" : place.voter});
        //if the voter exists then update his vote.  Otherwise add the voter to the scope.
        if(voter){
            voter.vote = place.vote;
        } else {
            var obj = {
                "name" : place.voter,
                "vote" : place.vote
            };

            currentPlace.voters.push(obj);
        }

        //Update the total of votes for the current place
        var totalVotes = 0;
        _.each(currentPlace.voters, function(voter) {
            if(voter.vote) {
                totalVotes += voter.vote;
            }
        });

        console.log("Total votes for: " + currentPlace.name + " is: " + totalVotes);

        currentPlace.totalVotes = totalVotes;

        growl.info(currentPlace.name + " received " + place.vote + " votes by " + place.voter + "!");

    }

    $scope.addYelpBusiness = function(business) {
        _addPlace(business.name);
    };
    //YELP calls
    $scope.getYelpData = function (){
        $http.get("/yelp/" + $scope.yelpCity).success(function (doc) {
            console.log(doc);
            $scope.yelpData = doc;
        });
    };

//*******Internal functions*********
    function _addPlace(name) {
        //check for duplicates
        if(_.findWhere($scope.places,{"name": name})){
            growl.error("Cannot add a duplicate place!");
            return;
        }
        var place = {
            "name" : name,
            "voters" : []
        };

        //Update local UI
        $scope.places.push(place);

        //send place to the other clients
        var newPlace = {
            "group" : $scope.groupName,
            "place" : place
        };
        socket.emit('send:newPlace', newPlace);

        //growl.info(place.name + " was added as a place to eat by " + $scope.userName +"!", {ttl: 2000, disableCountDown: true});
        growl.info("<b>" + place.name + "</b> was added as a place to eat by <b>" + $scope.userName +"</b>");
    }

    //Utility functions
    // ================

    $scope.getNumber = function(num) {
        return new Array(num);
    };
}