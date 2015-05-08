var express = require('express');
var router = express.Router();

router.get('/main', function(req, res, next) {
    var vm = { title: 'Main' } ;
    res.render('main', vm);
});

module.exports = router;
