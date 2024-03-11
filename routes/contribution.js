var express = require('express');
var router = express.Router();
var ContributionModel = require('../models/ContributionModel');
var FacultyModel = require('../models/FacultyModel');
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


var multer = require('multer');

var prefix = Date.now();

const storage1 = multer.diskStorage(
   {
      destination: (req, file, cb) => {
         cb(null, './public/images/'); //set image upload location
      },
      filename: (req, file, cb) => {
         let fileName = prefix + file.originalname; //set final file name
         cb(null, fileName);
      }
   }
);

const storage2 = multer.diskStorage(
   {
      destination: (req, file, cb) => {
         cb(null, './public/docs/'); //set docs upload location
      },
      filename: (req, file, cb) => {
         let fileName = prefix + file.originalname; //set final file name
         cb(null, fileName);
      }
   }
);

const upload = multer({ 
   storage: multer.diskStorage({}) // This is just to initialize multer. We'll configure storage later.
});

const uploadFields = upload.fields([
   { name: 'image', maxCount: 5 }, // Allow up to 5 images
   { name: 'docs', maxCount: 1 }   // Allow only 1 document
]);

router.get('/', checkMultipleSession(['student', 'mktmanager', 'mktcoordinator']), async (req, res) => {
   var contributionList = await ContributionModel.find({}).populate('faculty');
   if (req.session.role == "mktmanager" || req.session.role == "mktcoordinator")
      res.render('contribution/index', { contributionList });
   else
      res.render('contribution/indexUser', { contributionList });
});

router.get('/add', async (req, res) => {
   var facultyList = await FacultyModel.find({});
   res.render('contribution/add', { facultyList });
})

router.post('/add', uploadFields, async (req, res) => {
   try {
      var contribution = req.body;
      if (req.files['image']) {
         contribution.images = req.files['image'].map(file => prefix + "_" + file.originalname);
      }
      if (req.files['docs']) {
         contribution.docs = req.files['docs'].map(file => prefix + "_" + file.originalname);
      }
      await ContributionModel.create(contribution);
      res.redirect('/contribution');
   }
   catch (err) {
      if (err.name === 'ValidationError') {
         let InputErrors = {};
         for (let field in err.errors) {
            InputErrors[field] = err.errors[field].message;
         }
         res.render('contribution/add', { InputErrors, contribution });
      }
   }
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