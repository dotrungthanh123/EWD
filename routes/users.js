var express = require('express');
var router = express.Router();
const { checkMktCoordinatorSession, checkAdminSession, checkMktManagerSession, checkStudentSession } = require('../middlewares/auth');

/* GET users listing. */
router.get('/', checkAdminSession, async (req, res) => {
  var UserList = await UserModel.find({});
    res.render('/', { UserList })
});

module.exports = router;
