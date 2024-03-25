const express = require('express');
const router = express.Router();
const ContributionModel = require('../models/ContributionModel');
const FacultyModel = require('../models/FacultyModel');
const { formidable } = require('formidable')
const AdmZip = require('adm-zip');

router.get('/', async (req, res) => {
   // Suck because it has to retrieve all the contributions, then a call for each of them to get the faculty of the user
   // Suck not because design suck, is mongodb that suck

   // Might be better: https://stackoverflow.com/questions/11303294/querying-after-populate-in-mongoose


   var contributionList = await ContributionModel.find()
      .populate('user')
      .then((contributions) =>
         contributions
         .filter((contribution) => {
            return contribution.user.faculty.equals(req.session.user.faculty);
         })
      )
      .catch((err) => {
         console.log(err);
      })

   console.log(contributionList)

   // if (req.session.role == "admin" || req.session.role == "mktcoordinator")
   // res.render('contribution/index', { contributionList });
   // else
   //    res.render('contribution/indexUser', { contributionList });

   res.render('contribution/index', { contributionList })
});

router.get('/download/:id', async (req, res) => {
   var zip = new AdmZip()
   var id = req.params.id;
   var contribution = await ContributionModel.findById(id);

   // add local file
   var paths = contribution.path
   for (index in paths) {
      zip.addLocalFile('./public/uploads/' + paths[index])
   }

   // get everything as a buffer
   var zipFileContents = zip.toBuffer();
   const fileName = 'contribution.zip';
   const fileType = 'application/zip';
   res.writeHead(200, {
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Type': fileType,
   })
   return res.end(zipFileContents);
})

router.get('/add', async (req, res) => {
   var facultyList = await FacultyModel.find({});
   res.render('contribution/add', { facultyList });
})

const formMiddleWare = (req, res, next) => {
   const form = formidable({
      uploadDir: './public/uploads',
      multiples: true,
      allowEmptyFiles: true,
      minFileSize: 0,
      maxFileSize: 15 * 1024 * 1024, // 15mb
      keepExtensions: true,
      filter: (part) => part.originalFilename !== ""
   });

   form.parse(req, (err, fields, files) => {
      if (err) {
         next(err);
         return;
      }
      req.fields = fields;
      req.files = files;
      next();
   });
};

router.post('/add', formMiddleWare, async (req, res) => {
   const contribution = {
      name: req.fields.name[0],
      description: req.fields.description[0],
      path: req.files.userfile.map((userfile) => userfile.newFilename),
      user: req.session.user._id,
   }
   await ContributionModel.create(contribution);
   res.redirect('/contribution')
})

router.get('/edit/:id', async (req, res) => {
   var id = req.params.id;
   var contribution = await ContributionModel.findById(id);
   res.render('contribution/edit', { contribution });
})

router.post('/edit/:id', formMiddleWare, async (req, res) => {
   var id = req.params.id;
   const contribution = {
      name: req.fields.name[0],
      description: req.fields.description[0],
      path: req.files.userfile.map((userfile) => userfile.newFilename)
   }
   await ContributionModel.findByIdAndUpdate(id, contribution);
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