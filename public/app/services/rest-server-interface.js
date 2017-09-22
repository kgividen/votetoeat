(function() {
    'use strict';
    
    angular.module('app.$restServices', [])
        .factory('$restServices', apiFactory);

    apiFactory.$inject = ['$http', '$log'];

    function apiFactory($http, $log) {
        return {
            getCurrentUser: getCurrentUser,
            createGroup: createGroup,
            getGroup: getGroup
        };

        //Make sure to add the function into the return statement.

        function getCurrentUser() {
            // return $http.get("/api/authenticated-user")
            return $http.get("/api/ping")
                .then(function (response) {
                        return response.data;
                    },
                    function (reason) {
                        $log.debug(JSON.stringify(reason));
                    })
                .catch(function (err) {
                    $log.debug(JSON.stringify(err));
                });
        }

        function createGroup(group, next) {
            return $http.post('/api/group', group)
                .then(function(response) {
                        next && next(response.data);
                    },
                    function(reason) {
                        $log.debug(JSON.stringify(reason));
                    })
                .catch(function(err) {
                    $log.debug(JSON.stringify(err));
                });
        }

        function getGroup(groupName, next) {
            return $http.get('/api/group/' + groupName)
                .then(function(response) {
                        next && next(response.data);
                    },
                    function(reason) {
                        $log.debug(JSON.stringify(reason));
                    })
                .catch(function(err) {
                    $log.debug(JSON.stringify(err));
                });
        }
    }
}());