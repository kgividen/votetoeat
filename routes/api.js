var db = require('../db/mongo-dao');
//
// // Routes starting with "/api"
module.exports = function(app) {
    var express = require('express');
    var api_routes = express.Router();
    // var restrict = require('../auth/restrict');

   api_routes.get('/ping',
        function (req, res) {
            res.json("pong");
        }
    );

   api_routes.get('/group/:groupName',
        function (req, res) {
            db.findGroup(req.params.groupName, function(err, result) {
                if(err) {
                    console.log("error finding group:" + err.message);
                    return res.status(500).json({error: 'Error finding group in database: ' + (err.message || err)});
                }
                if(!result){
                    return res.status(204).json({error: 'Group not found'});
                }
                res.json(result);
            });
        }
    );

    // api_routes.put('/group/:groupId', restrict,
    api_routes.post('/group',
        function (req, res) {
            db.addGroup(req.body, function(err, result) {
                if (err) {
                    console.log("error adding group:" + err.message);
                    return res.status(500).json({error: 'Error adding group to database: ' + (err.message || err)});
                }

                res.json(result);
            });
        }
    );

    app.use('/api', api_routes);
};
