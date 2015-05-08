var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    var vm = { title: 'Home' } ;
    res.render('index', vm);
});

router.get('/main', function(req, res, next) {
    var vm = { title: 'Main' } ;
    res.render('main', vm);
});

module.exports = router;
