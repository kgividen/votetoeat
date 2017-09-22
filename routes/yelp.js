// var restrict = require('../auth/restrict');

module.exports = function(app) {
    var express = require('express');
    var router = express.Router();
//YELP REST CALLS
    var Yelp = require('yelp');
    // var yelp = new Yelp({
    //     consumer_key: yelpConfig.consumer_key,
    //     consumer_secret: yelpConfig.consumer_secret,
    //     token: yelpConfig.token,
    //     token_secret: yelpConfig.token_secret,
    // });

    var yelp = new Yelp({
        consumer_key: process.env.yelpConfigConsumer_key,
        consumer_secret: process.env.yelpConfigConsumer_secret,
        token: process.env.yelpConfigToken,
        token_secret: process.env.yelpConfigToken_secret
    });

// return list of places by city
//     router.get('/city/:location', restrict, function (req, res, next) {
    router.get('/city/:location', function (req, res, next) {
        yelp.search({
            term: "food",
            location: req.params.location,
            offset: req.query.offset,
            deals_filter: req.query.deals,
            sort: req.query.yelpSortType
        }, function (error, data) {
            console.log(error);
            res.send(data);
        });
    });

// return list of places by geo location coords
//     router.get('/ll/:location', restrict, function (req, res, next) {
    router.get('/ll/:location', function (req, res, next) {
        yelp.search({
            term: "food",
            ll: req.params.location,
            offset: req.query.offset,
            deals_filter: req.query.deals,
            sort: req.query.yelpSortType
        }, function (error, data) {
            console.log(error);
            res.send(data);
        });
    });

    app.use('/yelp', router);

};