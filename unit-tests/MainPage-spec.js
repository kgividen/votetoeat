'use strict';

describe('Main Page', function() {
    beforeEach(module('app'));

    describe('MainPage', function(){
        it('should have a MainController defined', inject(function($controller) {
            //spec body
            var mainController = $controller('MainController');
            expect(mainController).toBeDefined();
        }));

    });
});

describe("Main Page Controller", function() {
    beforeEach(module("app"));
    var createController,
        $scope,
        $rootScope;

    beforeEach(inject(function ($injector) {
        $rootScope = $injector.get('$rootScope');
        $scope = $rootScope.$new();
        var $controller = $injector.get('$controller');

        createController = function() {
            return $controller('MainController', {
                '$scope': $scope,
                '$rootScope': $rootScope
            });
        };
        createController();
    }));
    it('should have scope variables set to defaults', function () {
        expect($scope.users).toEqual([]);
        expect($scope.places).toEqual([]);
        expect($scope.vote_max).toEqual(10);
        expect($scope.voted).toEqual(false);
        expect($scope.showMainApp).toEqual(false);
        expect($scope.groupName).toEqual("");
        expect($scope.voteBtnActive).toEqual(0);
        expect($scope.businessData).toEqual([]);
        expect($scope.location).toEqual("");
        expect($scope.suggestionTitle).toEqual("Suggestions");
        expect($scope.currentSuggestionGroup).toEqual("yelp");
        expect($scope.showSetUserName).toEqual(false);
        expect($scope.joinOrCreateBtn).toEqual("create");
        expect($scope.dealsOnly).toEqual(false);
        expect($scope.yelpOffset).toEqual(0);
        expect($scope.yelpSearchType).toEqual("cll");
        expect($scope.yelpSortType).toEqual(0);
        expect($scope.yelpNextDisabled).toEqual(false);
        expect($scope.googleSortType).toEqual(0);
        expect($scope.showLoading).toEqual(true);
    });

    it('should be able to add a place to places', function () {
        $rootScope.placeName = "CoolPlace";
        $scope.addPlace();
        expect($scope.places).toContain({ name: 'CoolPlace', url: undefined, address: undefined, fromType: undefined, rating: undefined, rating_img_url: undefined, deal: undefined, voters: [  ] });
    });

    it('should be able to vote for a place and add to TotalVotes then change your vote', function () {
        $rootScope.placeName = "CoolPlace";
        var numVotes = 5;

        $scope.addPlace();
        var p = {name:"CoolPlace"};
        $scope.voteForPlace(p, numVotes);
        var currentPlace = $scope.places[0];
        expect(currentPlace.totalVotes).toEqual(numVotes);

        var changeVote = 2;
        $scope.voteForPlace(p, changeVote);
        expect(currentPlace.totalVotes).toEqual(changeVote);
    });

    it('should set the suggestionGroup', function () {
        $scope.setSuggestionsGroup("blah");
        expect($scope.currentSuggestionGroup).toEqual("blah");
    });

    xit('should be able to add a business of type yelp', function () {
        var business = "";
        var type = "yelp";

        $scope.addBusiness(business, type);
        expect($scope.places).toContain({ name: 'CoolPlace', url: undefined, address: undefined, fromType: undefined, rating: undefined, rating_img_url: undefined, deal: undefined, voters: [  ] });
    });

    xit('should be able to add a business of type google', function () {
    });

});

describe("Main Page Controller Server Calls", function() {
    beforeEach(module("app"));
    var createController,
        $scope,
        $rootScope,
        $httpBackend;

    beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $rootScope = $injector.get('$rootScope');
        $scope = $rootScope.$new();
        var $controller = $injector.get('$controller');

        createController = function() {
            return $controller('MainController', {
                '$scope': $scope,
                '$rootScope': $rootScope
            });
        };
        createController();
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should get the userName from the server and assign it.', function() {
        createController();
        $httpBackend.expect('GET', '/rest/user/')
            .respond({
                firstName: "Kent",
                lastName: "Blah"
            });

        // have to use $apply to trigger the $digest which will
        // take care of the HTTP request
        $scope.$apply(function() {
            $scope.getAuthenticatedUser();
        });
        $httpBackend.flush(); //This is when it actually makes the call.

        expect($scope.userName).toEqual('Kent');
    });

    //xit('should put the group into the DB', function() {
    //    $httpBackend.expect('PUT', '/rest/group/')
    //        .respond({
    //        });
    //
    //    scope.$apply(function() {
    //        scope.createGroup();
    //    });
    //
    //    $httpBackend.flush();
    //    //TODO make sure it was created in the DB
    //    //expect(scope.groupName).toEqual();
    //});
    //
    it('should get Yelp business data from the passed in city.', function() {
        $rootScope.location = "orem";
        $httpBackend.expect('GET', '/yelp/city/orem?deals=false&offset=0&yelpSortType=0')
            .respond({
                businesses: ['Business1']
            });

        $scope.$apply(function() {
            $scope.getYelpData('city', 0);
        });

        $httpBackend.flush();

        expect($scope.businessData).toEqual(['Business1']);
    });


});

//********************NOTES***********************
//skip me
//xdescribe('Main Page', function() {
//    xit('should skipme', inject(function($controller) {
//    }));
//});
//********************NOTES***********************
