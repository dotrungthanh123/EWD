var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index', { username: req.session.username, role: req.session.role });
});

module.exports = router;
