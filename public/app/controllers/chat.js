(function() {
    'use strict';
    angular.module('app.chat', ['ui.router'])
        .controller('ChatController', ChatController);

    ChatController.$inject = ['$scope', '$rootScope', '$state', 'socket'];

    function ChatController($scope, $rootScope, $state, socket) {
        var cc = this;
        cc.msg = "";

        cc.sendMsg = function(e) {
            if(!cc.msg){
                e.preventDefault();
                return;
            }
            //Send this to everyone else
            var msg = {
                "group": $scope.vc.groupName,
                "username": $scope.vc.userName,
                "text": cc.msg,
                "type" : "user"
            };
            //send it to everyone
            msg.timestamp = new Date();
            socket.emit('send:message', msg);
            //write it to ourselves
            $scope.vc.messages.push(msg);
            cc.msg="";
            angular.element('#chatMsgBox').focus();
            //keeps the enter key from happening after keypress
            e.preventDefault();
        };

        //SOCKET FUNCTIONS

        //When a new person comes from somewhere we need to add it to our list.
        socket.on('send:message', function (data) {
            // Notify everyone that a new person is here via a message to our messages model
            $scope.vc.messages.push({
                type: data.type,
                username: data.username,
                timestamp: new Date(),
                text: data.text
            });
        });

    }


}());