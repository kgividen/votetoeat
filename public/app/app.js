(function() {
    'use strict';

    // Declare app level module which depends on views, and components
    var app = angular.module('app', ['ui.router','app.$restServices', 'app.home', 'app.vote', 'app.chat', 'btford.socket-io', 'angular-growl', 'luegg.directives'])
        .config(['$urlRouterProvider', URLRouteProvider])
        .run(main);

    app.factory('socket', function (socketFactory) {
        return socketFactory({
            //ioSocket: io.connect('http://localhost:3000')
            ioSocket: io.connect('https://www.votetoeat.com', {secure: true})
        });
    });

    //This allows the user to share a link via sms
    app.config(['$compileProvider', function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto|sms):/);
    }]);


    URLRouteProvider.$inject = ['$urlRouterProvider'];
    main.$inject = ['$rootScope', '$state', '$stateParams', '$log', '$restServices'];

    function URLRouteProvider(urlRouterProvider) {
        urlRouterProvider.otherwise('/home');    // Sets default view to render
    }

    function main($rootScope, $state, $stateParams, $log) {
        $rootScope.title = 'Vote To Eat';
        $rootScope.$log = $log;
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }

}());