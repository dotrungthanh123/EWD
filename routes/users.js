var express = require('express');
var router = express.Router();
const UserModel = require('../models/UserModel')
const RoleModel = require('../models/RoleModel')
const FacultyModel = require('../models/FacultyModel')
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

router.get('/detail/:id', checkAdminSession, async (req, res) => {
  const studentId = req.params.id

  const user = await UserModel.findById(studentId).populate('role')
  const contributions = await ContributionModel.find({user: user._id})
  res.render("account/detail", {contributions, numOfContributions: contributions.length, user})
})

router.get('/list', checkAdminSession, async (req,res) => {
  const studentRole = await RoleModel.findOne({name: 'Student'})
  const facultyList = await FacultyModel.find()
  const studentList = await UserModel.find({role: studentRole._id}).populate('role').populate('faculty')

  studentList.forEach(async student => {
    var contributions = await ContributionModel.find({user: student._id})
    student.numCons = contributions.length
  })

  res.render("student/list", {facultyList, studentList})
})

router.get('/faculty/:id', async (req, res) => {
  const facultyId = req.params.id
  const studentRole = await RoleModel.findOne({name: 'Student'})

  const studentList = await UserModel.find({faculty: facultyId, role: studentRole._id}).populate('role').populate('faculty')
  const facultyList = await FacultyModel.find()
  res.render("student/list", {facultyList, studentList})
})

module.exports = router;
