(function() {
    'use strict';
    angular
        .module('app')
        .controller('MainController', MainController);

    //TODO Figure our vm or $rootScope should be injected.
    MainController.$inject = ['$rootScope','$filter', '$http', 'socket', 'growl'];

    function MainController($scope, $filter, $http, socket, growl) {

        var vm = this;
        vm.users = [];
        vm.userName = '';
        vm.places = [];
        vm.placeName = "";
        vm.vote_max = 10;
        vm.voted = false;
        vm.showMainApp = false;
        vm.groupName = "";
        vm.voteBtnActive = 0;
        vm.businessData = [];
        vm.location = "";
        vm.suggestionTitle = "Suggestions";
        vm.currentSuggestionGroup = "yelp";
        vm.showSetUserName = false;
        vm.dealsOnly = false;
        vm.yelpOffset = 0;
        vm.yelpSearchType = "cll";
        vm.yelpSortType = 0;
        vm.yelpNextDisabled = false;
        vm.googleSortType = 0;
        vm.showLoading = true;
        vm.user = {};


        //Get the logged in user from the server.
        // AUTHENTICATION REQUIRED
        vm.getAuthenticatedUser = function () {
            $http.get("/rest/user/").success(function (user) {
                vm.user = user;
                vm.userName = user.firstName;
            }).error(function () {
                growl.error("Something went wrong please try again.");
            });
        };

        //vm.runTest();

        vm.createGroup = function () {

            //Get the logged in user from the server.
            //AUTHENTICATION REQUIRED
            var groupName = encodeURIComponent(vm.groupName);
            $http.put("/rest/group/" + groupName).success(function (res) {
            }).error(function () {
                growl.error("Something went wrong please try again.");
            });



            //Get groups and check for duplicate
            socket.emit('check_group_name', {
                group: vm.groupName
            }, function (duplicate) {
                if (duplicate) {
                    growl.error("Duplicate name please try again.", {
                        ttl: 2000,
                        disableCountDown: true,
                        referenceId: "generalMessages"
                    });
                } else {
                    vm.joinGroup();
                }
            });
        };

        vm.joinGroup = function () {
            var nUser = {
                "name": vm.userName
            };

            socket.emit('join_group', {
                group: vm.groupName,
                user: nUser
            }, function (data) {
                vm.users = data.members;
                vm.places = data.places;

                //update the totals of the votes since we just joined.
                _.each(vm.places, function (place) {
                    _updateVotesOnPlace(place);
                })
            });

            //Tell the user it happened.
            vm.showMainApp = true;

            growl.success("Welcome! Vote To Eat!");
        };

        vm.addPlace = function () {

            if (!vm.placeName) return;  //make sure they've entered a place name.
            _addPlace({
                "name": vm.placeName
            });

            //clear input box
            //vm.placeName = "";
        };

        vm.voteForPlace = function (place, n) {
            //update the button group
            place["voteBtnActive"] = n;

            var newPlace = {
                "name": place.name,
                "group": vm.groupName,
                "voter": vm.userName,
                "vote": n
            };

            _updateVotesOnPlace(newPlace);

            //Send this to everyone else
            socket.emit('send:vote', newPlace);
        };

        vm.setSuggestionsGroup = function (group) {
            vm.businessData = [];
            vm.currentSuggestionGroup = group;
        };


        vm.logout = function () {
            socket.emit('disconnect', vm.userName);
        };

        // Socket listeners
        // ================
        //These are used if other people send out data.


        socket.on('init', function (data) {
//        vm.name = data.name;
//        vm.users = data.users;
        });

        socket.on('send:message', function (message) {
            growl.info(message);
        });

        //When a new person comes from somewhere we need to add it to our list.
        socket.on('send:newUser', function (data) {
            //Add them to the list of people
            vm.users.push(data.user);

            // Notify everyone that a new person is here via a message to our messages model
            growl.info(data.user.name + " is now here!");
        });

        //When a new place comes from somewhere we need to add it to our list.
        socket.on('send:newPlace', function (data) {
            //update the UI
            vm.places.push(data.place);

            // Notify everyone that a new person is here via a message to our messages model
            //TODO TEST THIS
            growl.info("<b>" + data.place.name + "</b> was added as a place to eat by <b>" + data.place.addedBy + "</b>");
        });

        //When someone votes we need to update the total.
        socket.on('send:vote', function (place) {
            _updateVotesOnPlace(place);
        });

        socket.on('user:left', function (user) {
            if (!user.name) return;
            growl.warning(user.name + " has left.");
            //remove the user from the array
            for (var i = 0; i < vm.users.length; i++) {
                if (vm.users[i].name === user.name) {
                    vm.users.splice(i, 1);
                    break;
                }
            }
        });

        //set default focuses
        $('#createGroupModal').on('shown.bs.modal', function () {
            $('#createGroupName').focus();
        });

        $('#joinGroupModal').on('shown.bs.modal', function () {
            $('#joinGroupName').focus();
        });

        vm.addBusiness = function (business, type) {
            var address = "";
            var rating_img_url = "";

            if (vm.currentSuggestionGroup == "yelp") {
                address = business.location.display_address.toString();
                rating_img_url = business.rating_img_url;
            } else if (business.vicinity) {
                address = business.vicinity;
            }

            var placeToAdd = {
                "name": business.name,
                "url": business.url,
                "fromType": type,
                "address": address,
                "rating": business.rating,
                "rating_img_url": rating_img_url
            };

            //If theres a deal lets add it.
            if (business.deals) {
                placeToAdd.deal = business.deals[0];
            }

            var added = _addPlace(placeToAdd);

            if (added == "added") {
                growl.info("Business Added", {ttl: 1000, disableCountDown: true, referenceId: "suggestionsMessages"});
            } else if (added == "duplicate") {
                growl.error("Cannot add a duplicate place!", {
                    ttl: 1000,
                    disableCountDown: true,
                    referenceId: "suggestionsMessages"
                });
            } else {
                growl.error("Error adding place!", {
                    ttl: 1000,
                    disableCountDown: true,
                    referenceId: "suggestionsMessages"
                });
            }
        };

        //TODO is there are way to angularize these modals so we don't need apply?
        $('#suggestionsModal').on('shown.bs.modal', function () {
            if (vm.currentSuggestionGroup == "yelp") {
                $scope.$apply(function () {
                    vm.suggestionTitle = "Yelp Suggestions";
                });
                vm.getYelpData(vm.yelpSearchType, vm.yelpSortType);
            } else {
                $scope.$apply(function () {
                    vm.suggestionTitle = "Google Suggestions";
                });
                _getGoogleData(0);
            }
        });

        vm.showModal = function () {
            alert("closed");
        };

        //YELP calls
        vm.getMoreYelpData = function () {
            vm.yelpOffset = vm.yelpOffset + 20;
            if (vm.yelpSortType != 0) vm.yelpNextDisabled = true;
            _getYelpData(vm.yelpSortType);
        };

        vm.updateYelpSortData = function (s) {
            vm.businessData = [];
            vm.yelpOffset = 0;
            _getYelpData(s);
        };


        vm.getYelpData = function (searchType, yelpSortType) {
            vm.businessData = [];
            vm.yelpSearchType = searchType;
            _getYelpData(yelpSortType);
        };

        vm.updateYelpSortDataWithDeals = function () {
            vm.businessData = [];
            vm.dealsOnly = !vm.dealsOnly;
            _getYelpData();
        };

        function _getYelpData(yelpSortType) {
            vm.showLoading = true;
            if (yelpSortType != null) {
                vm.yelpSortType = yelpSortType;
            }
            if (vm.yelpSearchType == 'city') {
                $http.get("/yelp/city/" + vm.location + "?deals=" + vm.dealsOnly + "&offset=" + vm.yelpOffset + "&yelpSortType=" + vm.yelpSortType).success(function (doc) {
                    vm.businessData = doc.businesses;
                    vm.showLoading = false;
                });
            } else {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        $scope.$apply(function () {
                            var cll = position.coords.latitude + "," + position.coords.longitude;
                            vm.location = cll;
                            $http.get("/yelp/ll/" + cll + "?deals=" + vm.dealsOnly + "&offset=" + vm.yelpOffset + "&yelpSortType=" + vm.yelpSortType).success(function (doc) {
                                vm.businessData.push.apply(vm.businessData, doc.businesses);
                                vm.showLoading = false;
                            });
                        });
                    });
                }
            }
        }


        //Google Local calls
        vm.updateGoogleSortData = function (googleSortType) {
            vm.showLoading = true;
            vm.googleSortType = googleSortType;
            _getGoogleData(googleSortType);
        };

        var _getGoogleData = function (googleSortType) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var pyrmont = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                    var map = new google.maps.Map(document.getElementById('map'), {
                        center: pyrmont,
                        zoom: 15
                    });

                    var request = {
                        location: pyrmont,
                        types: ['restaurant']
                    };

                    request.rankBy = (googleSortType === 1) ? google.maps.places.RankBy.DISTANCE : google.maps.places.RankBy.PROMINENCE;
                    //Rank by distance can't have a radius but by Prominence it needs one.
                    if (googleSortType === 0) request.radius = "5000";

                    var service = new google.maps.places.PlacesService(map);
                    service.nearbySearch(request, function (results, status, pagination) {
                        if (status == google.maps.places.PlacesServiceStatus.OK) {
                            $scope.$apply(function () {
                                vm.businessData = results;
                                vm.showLoading = false;
                            });
                            if (pagination.hasNextPage) {
                                var moreButton = document.getElementById('nextBtn');
                                moreButton.disabled = false;
                                google.maps.event.addDomListenerOnce(moreButton, 'click',
                                    function () {
                                        moreButton.disabled = true;
                                        pagination.nextPage();
                                    }
                                );
                            }
                        }
                    });
                });
            }
        };

//*******Internal functions*********
        function _addPlace(p) {
            //check for duplicates
            if (_.findWhere(vm.places, {"name": p.name})) {
                growl.error("Cannot add a duplicate place!");
                return "duplicate";
            }
            var place = {
                "name": p.name,
                "addedBy":vm.userName,
                "url": p.url,
                "address": p.address,
                "fromType": p.fromType,
                "rating": p.rating,
                "rating_img_url": p.rating_img_url,
                "deal": p.deal,
                "voters": []
            };

            //Update local UI
            vm.places.push(place);

            //send place to the other clients
            var newPlace = {
                "group": vm.groupName,
                "place": place
            };
            socket.emit('send:newPlace', newPlace);

            growl.info("<b>" + place.name + "</b> was added as a place to eat by <b>" + place.addedBy + "</b>");

            return "added";
        }

        function _updateVotesOnPlace(place){
            //get the correct place from the scope based on the name.
            var currentPlace = _.find(vm.places, function(p){
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

            currentPlace.totalVotes = totalVotes;

            //we check for votes because when coming in new we don't need to growl all the previous places
            if(place.vote) {
                growl.info(currentPlace.name + " received " + place.vote + " votes by " + place.voter + "!");
            }
            //remove all the winnings
            vm.places = _.map(vm.places, function(o) {
                return _.omit(o, 'winning');
            });

            //update the color for the winning place
            var winningPlace = _.max(vm.places, function(place){
                return place.totalVotes;
            });
            winningPlace.winning = true;

        }

        //Utility functions
        // ================

        vm.getNumber = function(num) {
            return new Array(num);
        };
    }
}());