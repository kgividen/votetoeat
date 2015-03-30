function vteController($scope, $filter, $http, socket, growl) {
    $scope.users = [];
    $scope.places = [];
    $scope.vote_max = 10;
    $scope.voted = false;
    $scope.showGroupBox = true;
    $scope.showMainApp = false;
    $scope.groupName = "";
    $scope.voteBtnActive = 0;
    $scope.businessData = [];
    $scope.location = "";
    $scope.suggestionTitle = "Suggestions";
    $scope.currentSuggestionGroup = "yelp";

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
                _updateVotesOnPlace(place);
            })
        });

        //Tell the user it happened.
        $scope.showGroupBox = false;
        $scope.showMainApp = true;

        growl.success("Welcome!  Let's Vote To Eat!");
    };

    $scope.addPlace = function() {
        if (!$scope.placeName) return;  //make sure they've entered a place name.

        _addPlace({
            "name":$scope.placeName
        });

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

        _updateVotesOnPlace(newPlace);

        //Send this to everyone else
        socket.emit('send:vote', newPlace);
    };

    $scope.setSuggestionsGroup = function(group) {
        $scope.businessData = [];
        $scope.currentSuggestionGroup = group;
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
        //TODO TEST THIS
        growl.info("<b>" + place.name + "</b> was added as a place to eat by <b>" + $scope.userName +"</b>");
    });

    //When someone votes we need to update the total.
    socket.on('send:vote', function (place) {
        _updateVotesOnPlace(place);
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

    $scope.addBusiness = function(business) {
        var address = "";
         var rating_img_url = "";

        if($scope.currentSuggestionGroup=="yelp") {
            address = business.location.display_address.toString();
            rating_img_url = business.rating_img_url;
        } else if(business.vicinity) {
            address = business.vicinity;
        }

        _addPlace({
            "name" : business.name,
            "url" : business.url,
            "fromType" : type,
            "address" : address,
            "rating" : business.rating,
            "rating_img_url" : rating_img_url
        });
        growl.info("Business Added", {ttl: 1000, disableCountDown: true, referenceId:"suggestionsMessages"});
    };

    //TODO is there are way to angularize these modals so we don't need apply?
    $('#suggestionsModal').on('shown.bs.modal', function () {
        if($scope.currentSuggestionGroup == "yelp") {
            $scope.$apply(function() {
                $scope.suggestionTitle = "Yelp Suggestions";
            });
        } else {
            $scope.$apply(function() {
                $scope.suggestionTitle = "Google Suggestions";
            });
            getGoogleLocalData();
        }
    });

    $scope.showModal = function() {
        alert("closed");
    };


    //YELP calls
    $scope.getYelpData = function (type){
        if (type == "city"){
            $http.get("/yelp/city/" + $scope.location).success(function (doc) {
                $scope.businessData = doc;
            });
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    $scope.$apply(function() {
                        var cll = position.coords.latitude + "," + position.coords.longitude;
                        $scope.location = cll;
                        $http.get("/yelp/ll/" + cll).success(function (doc) {
                            $scope.businessData = doc.businesses;
                        });
                    });
                });
            }
        }
    };


    //Google Local calls
    var getGoogleLocalData = function (){
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var pyrmont = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);

                map = new google.maps.Map(document.getElementById('map'), {
                    center: pyrmont,
                    zoom: 15
                });

                var request = {
                    location: pyrmont,
                    //radius: '5000',
                    types: ['restaurant'],
                    rankBy: google.maps.places.RankBy.DISTANCE
                };

                service = new google.maps.places.PlacesService(map);
                service.nearbySearch(request, function(results, status){
                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                        $scope.$apply(function() {
                            $scope.businessData = results;
                        });
                    }
                });
            });
        }
    };

//*******Internal functions*********
    function _addPlace(p) {
        //check for duplicates
        if(_.findWhere($scope.places,{"name": p.name})){
            growl.error("Cannot add a duplicate place!");
            return;
        }
        var place = {
            "name" : p.name,
            "url" : p.url,
            "address" : p.address,
            "fromType": p.fromType,
            "rating" : p.rating,
            "rating_img_url" : p.rating_img_url,
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

        growl.info("<b>" + place.name + "</b> was added as a place to eat by <b>" + $scope.userName +"</b>");
    }

    function _updateVotesOnPlace(place){
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

        //we check for votes because when coming in new we don't need to growl all the previous places
        if(place.vote) {
            growl.info(currentPlace.name + " received " + place.vote + " votes by " + place.voter + "!");
        }

    }

    //Utility functions
    // ================

    $scope.getNumber = function(num) {
        return new Array(num);
    };
}