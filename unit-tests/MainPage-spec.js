'use strict';

describe('Main Page', function() {

    beforeEach(module('app'));

    describe('MainPage', function(){
        it('should ....', inject(function($controller) {
            //spec body
            var mainController = $controller('MainController');
            expect(mainController).toBeDefined();
        }));

    });
});

describe("Main Page ", function() {
    beforeEach(module("app"));
    var MainController,
        scope;

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();
        MainController = $controller("MainController", {
            $scope: scope
        });
    }));

    it('SuggestionTitle says Suggestions', function () {
        expect(scope.suggestionTitle).toEqual("Suggestions");
    });

});
