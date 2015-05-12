//var myModule = angular.module('myApp', ['myApp.filters', 'myApp.directives']);

angular
    .module('app', ['ngRoute', 'angular-growl', 'ngAnimate', 'ui.bootstrap'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            otherwise({redirectTo: '/main'})
    }])
    .config(['growlProvider', function(growlProvider) {
        growlProvider.globalPosition('bottom-left');
        growlProvider.globalReversedOrder(true);
    }])
    .directive('focusOn',function($timeout) {
        return {
            restrict : 'A',
            link : function($scope, $element, $attr) {
                $scope.$watch($attr.focusOn, function(_focusVal) {
                    $timeout(function() {
                        _focusVal ? $element[0].focus() :
                            $element[0].blur();
                    });
                });
            }
        }
    })
    .factory('socket', function ($rootScope) {
    //var socket = io.connect();
        var socket = io.connect("http://votetoeat-netsmartcompany.rhcloud.com:8000");
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