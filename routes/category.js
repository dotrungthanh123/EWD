var express = require('express');
var router = express.Router();
var CategoryModel = require('../models/CategoryModel');
var ContributionModel = require('../models/ContributionModel');
const { checkLoginSession, checkMktManagerSession, checkMktCoordinatorSession, checkAdminSession } = require('../middlewares/auth');

router.get('/', checkMktCoordinatorSession, checkMktManagerSession, checkAdminSession, async (req, res) => {
   var categoryList = await CategoryModel.find({});
   res.render('category/index', { categoryList });
});

router.get('/delete/:id', checkAdminSession, async (req, res) => {
   //req.params: get value by url
   var id = req.params.id;
   await CategoryModel.findByIdAndDelete(id);
   res.redirect('/category');
})

//render form for user to input
router.get('/add', checkAdminSession, (req, res) => {
   res.render('category/add');
})

//receive form data and insert it to database
router.post('/add', checkAdminSession, async (req, res) => {
   //req.body: get value by form
   var category = req.body;
   await CategoryModel.create(category);
   res.redirect('/category');
})

router.get('/detail/:id', checkMktCoordinatorSession, checkMktManagerSession, checkAdminSession, async (req, res) => {
   var id = req.params.id
   var contributionList = 
   await ContributionModel.find()
      .populate('category')
      .then(contributions => contributions.filter(contribution => contribution.category.map(c => c._id.valueOf()).includes(id.valueOf())))
   res.render('contribution/index', { contributionList })
})

module.exports = router;