const express = require('express');
const router = express.Router();
const ContributionModel = require('../models/ContributionModel');
const FacultyModel = require('../models/FacultyModel');
const { formidable } = require('formidable')
const { checkMktManagerSession,
   checkMktCoordinatorITSession,
   checkMktCoordinatorDesignSession,
   checkMktCoordinatorBusinessSession,
   checkStudentITSession,
   checkStudentDesignSession,
   checkStudentBusinessSession,
   checkGuestITSession,
   checkGuestDesignSession,
   checkGuestBusinessSession,
   checkMultipleSession } = require('../middlewares/auth');

router.get('/', async (req, res) => {
   var contributionList = await ContributionModel.find({}).populate('faculty');
   //if (req.session.role == "mktmanager" || req.session.role == "mktcoordinator")
   res.render('contribution/index', { contributionList });
   // else
   //    res.render('contribution/indexUser', { contributionList });
});

router.get('/add', async (req, res) => {
   var facultyList = await FacultyModel.find({});
   res.render('contribution/add', { facultyList });
})

router.post('/add', async (req, res) => {
   const form = formidable({
      uploadDir: './uploads',
      multiples: true,
   })

   // Shit only runs when there is file uploaded and a res.end() inside it
   form.parse(req, async (err, fields, files) => {
      if (err) return err;
      await ContributionModel.create({
         name: fields.name[0],
         description: fields.description[0],
         path: files.userfile.map((userfile) => userfile.filepath)
      });

      // need to put this here dont know why
      res.redirect('/contribution');
   });

})

router.get('/edit/:id', async (req, res) => {
   var id = req.params.id;
   var contribution = await ContributionModel.findById(id);
   res.render('contribution/edit', { contribution });
})

router.post('/edit/:id', async (req, res) => {
   var id = req.params.id;
   var data = req.body;
   await ContributionModel.findByIdAndUpdate(id, data);
   res.redirect('/contribution');
})

router.get('/delete/:id', async (req, res) => {
   var id = req.params.id;
   await ContributionModel.findByIdAndDelete(id);
   res.redirect('/contribution');
})

router.post('/search', async (req, res) => {
   var keyword = req.body.keyword;
   var contributionList = await ContributionModel.find({ name: new RegExp(keyword, "i") }).populate('faculty');
   res.render('contribution/index', { contributionList })
})

router.get('/sort/asc', async (req, res) => {
   var contributionList = await ContributionModel.find().sort({ name: 1 }).populate('faculty');
   res.render('contribution/index', { contributionList })
})

router.get('/sort/desc', async (req, res) => {
   var contributionList = await ContributionModel.find().sort({ name: -1 }).populate('faculty');
   res.render('contribution/index', { contributionList })
})

module.exports = router;