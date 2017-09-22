(function() {
    'use strict';
    angular.module('app.home', ['ui.router', 'app.$restServices'])
        .config(['$stateProvider', StateProvider])
        .controller('HomeController', HomeController);

    StateProvider.$inject = ['$stateProvider'];
    HomeController.$inject = ['$scope', '$rootScope', '$state', '$restServices', 'growl'];

    function StateProvider(stateProvider) {
        stateProvider.state('home', {
            url: '/home',
            data: {
                displayName: 'Home'
            },
            views: {
                '@': {
                    templateUrl: '/app/views/home.html', controller: 'HomeController', controllerAs: 'hc'}
            }
        })
    }

    function HomeController($scope, $rootScope, $state, $restServices, growl) {
        var hc = this;

        hc.createGroup = function(){
            if(!hc.groupName){
                return;
            }
            var group = {
                name:encodeURIComponent(hc.groupName.toUpperCase())
            };
            $restServices.createGroup(group, function(response){
                if(response && response !=="GroupExists"){
                    $('#createGroupModal').modal('hide');
                    $state.go('vote', {groupName:group.name});
                } else {
                    growl.error("Group already exists. Please try again.", {
                        referenceId: "groupCreateMessages"
                    });
                }
            });
        };

        hc.checkGroup = function() {
            if(!hc.groupName){
                return;
            }
            var group = {
                name: encodeURIComponent(hc.groupName.toUpperCase())
            };
            $restServices.getGroup(group.name, function (response) {
                if (response && response.name === group.name) {
                    $('#joinGroupModal').modal('hide');
                    $state.go('vote', {groupName:group.name});
                } else {
                    growl.error("Group doesn't exist.  Please try again.", {
                        referenceId: "groupJoinMessages"
                    });
                }
            });
        };
        
        $('#createGroupModal').on('shown.bs.modal', function () {
            hc.groupName = null;
            $('#createGroupName').focus();
            $scope.$apply();
        });

        $('#joinGroupModal').on('shown.bs.modal', function () {
            hc.groupName = null;
            $('#joinGroupName').focus();
            $scope.$apply();
        });
    }


}());