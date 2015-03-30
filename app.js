var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser');

//We're just going to hardcode into this one js file for now.
//var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();

app.use(favicon(__dirname + '/public/icons/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));


//app.use('/', routes);
//app.use('/users', users);

// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//  var err = new Error('Not Found');
//  err.status = 404;
//  next(err);
//});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
//app.use(function(err, req, res, next) {
//  res.status(err.status || 500);
//  res.render('error', {
//    message: err.message,
//    error: {}
//  });
//});

var yelp = require("yelp").createClient({
    consumer_key: "p1Tm7719umX9iFlKkhujMw",
    consumer_secret: "helHs8hWlaGdsI9PA43PU3FHlRY",
    token: "YzBewOmbd4_vIYqOc1npMLOi_HCXP-BF",
    token_secret: "p99_WND7cyN79Tq4KKpJLHbOv9w"
});

// return list of places by city
app.get('/yelp/city/:location', function(req, res, next) {
    yelp.search({term: "food", location: req.params.location}, function(error, data) {
        console.log(error);
        res.send(data);
    });
});

// return list of places by geo location coords
app.get('/yelp/ll/:location', function(req, res, next) {
    yelp.search({term: "food", ll: req.params.location}, function(error, data) {
        console.log(error);
        res.send(data);
    });
});

module.exports = app;
