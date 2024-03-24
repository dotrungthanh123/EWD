var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', async (req, res) => {
  var UserList = await UserModel.find({});
    res.render('/', { UserList })
});

module.exports = router;
