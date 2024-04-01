var express = require('express');
var router = express.Router();
var FacultyModel = require('../models/FacultyModel');
var ContributionModel = require('../models/ContributionModel');


router.get('/', async (req, res) => {
   //retrieve data from "faculties" collection
   var facultyList = await FacultyModel.find({});
   //render view and pass data
   res.render('faculty/index', { facultyList });
});

router.get('/delete/:id', async (req, res) => {
   //req.params: get value by url
   var id = req.params.id;
   await FacultyModel.findByIdAndDelete(id);
   res.redirect('/faculty');
})

//render form for user to input
router.get('/add', (req, res) => {
   res.render('faculty/add');
})

//receive form data and insert it to database
router.post('/add', async (req, res) => {
   //req.body: get value by form
   var faculty = req.body;
   await FacultyModel.create(faculty);
   res.redirect('/faculty');
})

router.get('/detail/:id', async (req, res) => {
   var id = req.params.id;
   var contributionList = await ContributionModel.find({ faculty: id }).populate('contribution');
   res.render('contribution/index', { contributionList })
})
module.exports = router;


