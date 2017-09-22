(function() {
    'use strict';
    angular.module('app.vote', ['ui.router', 'app.$restServices'])
        .config(['$stateProvider', StateProvider])
        .controller('VoteController', VoteController);

    StateProvider.$inject = ['$stateProvider'];
    VoteController.$inject = ['$scope', '$http', '$rootScope', '$state', '$stateParams', '$restServices', 'socket', 'growl'];

    function StateProvider(stateProvider) {
        stateProvider.state('vote', {
            url: '/vote/:groupName',
            data: {
                displayName: 'Vote'
            },
            params: {
                data: null
            },
            views: {
                '@': {
                    templateUrl: '/app/views/vote.html', controller: 'VoteController', controllerAs: 'vc'}
            }
        })
    }

    function VoteController($scope, $http, $rootScope, $state, $stateParams, $restServices, socket, growl) {
        var vc = this;
        vc.userName = null;
        vc.places = [];
        vc.placeName = "";
        vc.voteBtnActive = 0; //Used so people only get one vote
        vc.vote_max = 10; //How many votes each place gets
        vc.businessData = [];
        vc.location = "";
        vc.suggestionTitle = "Suggestions";
        vc.currentSuggestionGroup = "yelp";
        vc.showSetUserName = false;
        vc.dealsOnly = false;
        vc.yelpOffset = 0;
        vc.yelpSearchType = "cll";
        vc.yelpSortType = 0;
        vc.yelpNextDisabled = false;
        vc.googleSortType = 0;
        vc.showLoading = true;
        vc.messages = [];

        //Since we switch states before hiding completely we have to do this.  If we used angular modals this probably wouldn't be an issue.
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();

        $('#chooseNameModal').modal('show');
        vc.groupName = $stateParams.groupName;

        vc.chooseName = function() {
            $('#chooseNameModal').modal('hide');
            
            socket.emit('join_group', {
                group: $stateParams.groupName,
                name: vc.userName
            }, function (data) {
                vc.groupMembers = data.members;
                vc.places = data.places;
                vc.messages = data.chatSession;
                // Notify everyone that a new person is here via a message to our messages model
                var msg = {
                    type: "system",
                    username: "",
                    group:vc.groupName,
                    timestamp: new Date(),
                    text: vc.userName + " is now here!"
                };
                socket.emit('send:message', msg , function(){
                    vc.messages.push(msg); //updates messages locally
                });
                //update the totals of the votes since we just joined.
                _.each(vc.places, function (place) {
                    _updateVotesOnPlace(place);
                });
            });
        };
        //if they aren't logged in then send them to the login page.
        // $restServices.getCurrentUser().then(
        //     function (user) {
        //         if(!user) {
        //             $state.go('login');
        //         }
        //     }
        // );


        vc.addPlace = function () {

            if (!vc.placeName) return;  //make sure they've entered a place name.
            _addPlace({
                "name": vc.placeName
            });

            //clear input box
            vc.placeName = "";
        };

        vc.voteForPlace = function (place, n) {
            //update the button group
            place["voteBtnActive"] = n;

            var newPlace = {
                "name": place.name,
                "group": vc.groupName,
                "voter": vc.userName,
                "vote": n
            };

            _updateVotesOnPlace(newPlace);

            //Send this to everyone else
            socket.emit('send:vote', newPlace, function(){
                // Notify everyone that a new person is here via a message to our messages model
                var msg = {
                    type: "system",
                    username: "",
                    timestamp: new Date(),
                    group: vc.groupName,
                    text: newPlace.name + " received " + newPlace.vote + " votes by " + newPlace.voter + "!"
                };

                socket.emit('send:message', msg , function(){
                    vc.messages.push(msg); //updates messages locally
                });
            });
        };

        //*******Suggestions functions*********
        vc.setSuggestionsGroup = function (group) {
            vc.businessData = [];
            vc.currentSuggestionGroup = group;
        };

        vc.addBusiness = function (business, type) {
            var address = "";
            var rating_img_url = "";

            if (vc.currentSuggestionGroup === "yelp") {
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

            _addPlace(placeToAdd, function(err){
                if(err){
                    growl.error("Error adding place! " + err.message, {
                        ttl: 1000,
                        disableCountDown: true,
                        referenceId: "suggestionsMessages"
                    });
                    return;
                }

                growl.info("Business Added", {ttl: 1000, disableCountDown: true, referenceId: "suggestionsMessages"});

            });
        };

        //YELP calls
        vc.getMoreYelpData = function () {
            vc.yelpOffset = vc.yelpOffset + 20;
            if (vc.yelpSortType !== 0) vc.yelpNextDisabled = true;
            _getYelpData(vc.yelpSortType);
        };

        vc.updateYelpSortData = function (s) {
            vc.businessData = [];
            vc.yelpOffset = 0;
            _getYelpData(s);
        };


        vc.getYelpData = function (searchType, yelpSortType) {
            vc.businessData = [];
            vc.yelpSearchType = searchType;
            _getYelpData(yelpSortType);
        };

        vc.updateYelpSortDataWithDeals = function () {
            vc.businessData = [];
            vc.dealsOnly = !vc.dealsOnly;
            _getYelpData();
        };

        function _getYelpData(yelpSortType) {
            vc.showLoading = true;
            if (yelpSortType) {
                vc.yelpSortType = yelpSortType;
            }
            //TODO move this into a service?
            if (vc.yelpSearchType === 'city') {
                var yelpURL = "/yelp/city/" + vc.location + "?deals=" + vc.dealsOnly + "&offset=" + vc.yelpOffset + "&yelpSortType=" + vc.yelpSortType;
                $http.get(yelpURL)
                    .then(function (response) {
                            vc.businessData = response.data.businesses;
                            vc.showLoading = false;
                        },
                        function (reason) {
                            // $log.debug(JSON.stringify(reason));
                        })
                    .catch(function (err) {
                        // $log.debug(JSON.stringify(err));
                        console.log(err);
                    });
            } else {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        $scope.$apply(function () {
                            var cll = position.coords.latitude + "," + position.coords.longitude;
                            vc.location = cll;
                            var yelpURL = "/yelp/ll/" + cll + "?deals=" + vc.dealsOnly + "&offset=" + vc.yelpOffset + "&yelpSortType=" + vc.yelpSortType;
                            $http.get(yelpURL)
                                .then(function (response) {
                                        vc.businessData.push.apply(vc.businessData, response.data.businesses);
                                        vc.showLoading = false;
                                    },
                                    function (reason) {
                                        // $log.debug(JSON.stringify(reason));
                                    })
                                .catch(function (err) {
                                    console.log(err);
                                    // $log.debug(JSON.stringify(err));
                                });
                        });
                    });
                }
            }
        }


        //Google Local calls
        vc.updateGoogleSortData = function (googleSortType) {
            vc.showLoading = true;
            vc.googleSortType = googleSortType;
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
                                vc.businessData = results;
                                vc.showLoading = false;
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
        function _addPlace(p, next) {
            //check for duplicates
            if (_.findWhere(vc.places, {"name": p.name})) {
                next && next({message:"Duplicate Place"});
                return;
            }
            var place = {
                "name": p.name,
                "group":vc.groupName,
                "addedBy":vc.userName,
                "url": p.url,
                "address": p.address,
                "fromType": p.fromType,
                "rating": p.rating,
                "rating_img_url": p.rating_img_url,
                "deal": p.deal,
                "voters": []
            };

            //Update local UI
            vc.places.push(place);

            socket.emit('send:newPlace', place, function(){
                // Notify everyone that a new person is here via a message to our messages model
                var msg = {
                    type: "system",
                    username: "",
                    timestamp: new Date(),
                    group: vc.groupName,
                    text: place.name + " was added by " + place.addedBy
                };

                socket.emit('send:message', msg , function(){
                    vc.messages.push(msg); //updates messages locally
                });
            });

            next && next();
        }

        function _updateVotesOnPlace(place){
            //get the correct place from the scope based on the name.
            var currentPlace = _.find(vc.places, function(p){
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

            //remove all the winnings
            vc.places = _.map(vc.places, function(o) {
                return _.omit(o, 'winning');
            });

            //update the color for the winning place
            var winningPlace = _.max(vc.places, function(place){
                return place.totalVotes;
            });
            winningPlace.winning = true;

        }

        //SOCKET FUNCTIONS

        //When a new person comes from somewhere we need to add it to our list.
        socket.on('send:newUser', function (user) {
            //Add them to the list of people
            vc.groupMembers.push(user);
        });

        socket.on('user:left', function (user) {
            if (!user.name) return;
            //remove the user from the array
            vc.groupMembers = _.without(vc.groupMembers, _.findWhere(vc.groupMembers, {
                name: user.name
            }));
        });

        //When a new place comes from somewhere we need to add it to our list.
        socket.on('send:newPlace', function (place) {
            //update the UI
            vc.places.push(place);
        });

        //When someone votes we need to update the total.
        socket.on('send:vote', function (place) {
            _updateVotesOnPlace(place);
        });


        //Modal defaults
        $('#chooseNameModal').on('shown.bs.modal', function () {
            $('#userName').focus();
        });

        $('#suggestionsModal').on('shown.bs.modal', function () {
            if (vc.currentSuggestionGroup == "yelp") {
                $scope.$apply(function () {
                    vc.suggestionTitle = "Yelp Suggestions";
                });
                vc.getYelpData(vc.yelpSearchType, vc.yelpSortType);
            } else {
                $scope.$apply(function () {
                    vc.suggestionTitle = "Google Suggestions";
                });
                _getGoogleData(0);
            }
        });


        //Utility functions
        // ================

        vc.getNumber = function(num) {
            return new Array(num);
        };
    }
}());