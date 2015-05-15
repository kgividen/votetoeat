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
    var MainController,
        scope;

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();
        MainController = $controller("MainController", {
            $scope: scope
        });
    }));

    it('should have scope variables set to defaults', function () {
        expect(scope.users).toEqual([]);
        expect(scope.places).toEqual([]);
        expect(scope.vote_max).toEqual(10);
        expect(scope.voted).toEqual(false);
        expect(scope.showMainApp).toEqual(false);
        expect(scope.groupName).toEqual("");
        expect(scope.voteBtnActive).toEqual(0);
        expect(scope.businessData).toEqual([]);
        expect(scope.location).toEqual("");
        expect(scope.suggestionTitle).toEqual("Suggestions");
        expect(scope.currentSuggestionGroup).toEqual("yelp");
        expect(scope.showSetUserName).toEqual(false);
        expect(scope.joinOrCreateBtn).toEqual("create");
        expect(scope.dealsOnly).toEqual(false);
        expect(scope.yelpOffset).toEqual(0);
        expect(scope.yelpSearchType).toEqual("cll");
        expect(scope.yelpSortType).toEqual(0);
        expect(scope.yelpNextDisabled).toEqual(false);
        expect(scope.googleSortType).toEqual(0);
        expect(scope.showLoading).toEqual(true);
    });

});

//********************NOTES***********************
    //skip me
    //xdescribe('Main Page', function() {
    //    xit('should skipme', inject(function($controller) {
    //    }));
    //});
//********************NOTES***********************
