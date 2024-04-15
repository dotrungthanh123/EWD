var express = require('express');
var router = express.Router();
var ContributionModel = require('../models/ContributionModel');
var UserModel = require('../models/UserModel')
const { checkMktCoordinatorSession, checkAdminSession, checkMktManagerSession, checkStudentSession } = require('../middlewares/auth');


router.get('/', checkAdminSession, checkMktCoordinatorSession, checkMktManagerSession, checkStudentSession, async (req, res) => {
   var studentList = await UserModel.find({});
   res.render('student/index', { studentList });
});

router.get('/detail/:id', checkAdminSession, checkMktCoordinatorSession, checkMktManagerSession, checkStudentSession, async (req, res) => {
   var id = req.params.id
   var contributionList = 
   await ContributionModel.find({user: id}).populate('category')
   res.render('contribution/index', { contributionList })
})

module.exports = router;