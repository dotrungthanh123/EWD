var express = require('express');
var router = express.Router();
const UserModel = require('../models/UserModel')
const ContributionModel = require('../models/ContributionModel')
const { checkMktCoordinatorSession, checkAdminSession, checkMktManagerSession, checkStudentSession } = require('../middlewares/auth');

/* GET users listing. */
router.get('/', checkAdminSession, async (req, res) => {
  var UserList = await UserModel.find({});
  res.render('/', { UserList })
});

router.get('/detail', async (req, res) => {
  if (!req.session.user) res.redirect("/")
  else {
    const user = await UserModel.findById(req.session.user._id).populate('role')
    const contributions = await ContributionModel.find({user: user._id})
    res.render("account/detail", {contributions, numOfContributions: contributions.length, user})
  }
})

module.exports = router;
