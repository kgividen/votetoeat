var express = require('express');
var router = express.Router();
var yelpConfig = require('../yelp-config');
var restrict = require('../auth/restrict');

//YELP REST CALLS
var yelp = require("yelp").createClient(yelpConfig.yelpToken);

// return list of places by city
router.get('/city/:location',restrict, function(req, res, next) {
    yelp.search({term: "food", location: req.params.location, offset:req.query.offset, deals_filter:req.query.deals, sort:req.query.yelpSortType}, function(error, data) {
        console.log(error);
        res.send(data);
    });
});

// return list of places by geo location coords
router.get('/ll/:location',restrict, function(req, res, next) {
    yelp.search({term: "food", ll: req.params.location, offset:req.query.offset, deals_filter:req.query.deals, sort:req.query.yelpSortType}, function(error, data) {
        console.log(error);
        res.send(data);
    });
});

module.exports = router;