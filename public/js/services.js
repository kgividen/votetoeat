//var myModule = angular.module('myApp', ['myApp.filters', 'myApp.directives']);
var myModule = angular.module('myApp', ['angular-growl']);

myModule.config(['growlProvider', function(growlProvider) {
    growlProvider.globalPosition('bottom-left');
    growlProvider.globalReversedOrder(true);
}]);

myModule.factory('socket', function ($rootScope) {
    var socket = io.connect();
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
});