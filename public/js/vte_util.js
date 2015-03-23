//exports.createGuid = function(){
//    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
//        return v.toString(16);
//    });
//};


(function(exports){

    // your code goes here

    exports.createGuid = function(){
        var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
        return guid;
    };

})(typeof exports === 'undefined'? this['vte_util']={}: exports);