(function() {
    'use strict';

    angular
        .module('app')
        .config(config);

    config.$inject = ['$routeProvider'];

    function config($routeProvider) {
        $routeProvider
            .when('/main', {
                templateUrl: '/js/main/main.html',
                controller: 'MainController',
                controllerAs: 'vm'
            });
    }
}());