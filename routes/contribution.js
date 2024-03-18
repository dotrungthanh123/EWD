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

const formMiddleWare = (req, res, next) => {
   const form = formidable({
      uploadDir: './uploads',
      multiples: true,
      allowEmptyFiles: true,
      minFileSize: 0,
      filter: (part) => {
         // TEMPORARY TO PASS EMPTY FILE
         return part.originalFilename !== ""
      }
   });

   form.parse(req, (err, fields, files) => {
      if (err) {
         next(err);
         return;
      }
      req.fields = fields;
      req.files = files;
      res.writeHead(200, {
         "Content-Type": "application/json",
       });
       res.end(JSON.stringify({fields,files,}));
      // next();
   });
};

router.post('/add', formMiddleWare, async (req, res) => {
   await ContributionModel.create({
      name: req.fields.name[0],
      description: req.fields.description[0],
      path: req.files.userfile.map((userfile) => userfile.filepath)
   });
   res.redirect('/contribution')
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