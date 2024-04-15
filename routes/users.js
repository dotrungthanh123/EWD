var express = require('express');
var router = express.Router();
const { checkMktCoordinatorSession, checkAdminSession, checkMktManagerSession, checkStudentSession } = require('../middlewares/auth');

/* GET users listing. */
<<<<<<< Updated upstream
router.get('/', async(req, res) {
=======
router.get('/', checkAdminSession, async (req, res) => {
>>>>>>> Stashed changes
  var UserList = await UserModel.find({});
    res.render('/', { UserList })
});

module.exports = router;
