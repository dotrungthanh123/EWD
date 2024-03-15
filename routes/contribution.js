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

const storage = multer.diskStorage(
   {
      destination: (req, file, cb) => {
         if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
            cb(null, './public/images/'); //set image upload location
         } else if (file.mimetype == 'application/msword' || file.mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, './public/docs/'); //set docs upload location
         } else {
            console.log(file.mimetype);
         }
      },
      filename: (req, file, cb) => {
         let fileName = prefix + file.originalname; //set final file name
         cb(null, fileName);
      }
   }
);


const upload = multer({ storage: storage });

const uploadFields = upload.fields([
   { name: 'image', maxCount: 1 }, // Allow up to 1 images
   { name: 'docs', maxCount: 1 }   // Allow only 1 document
]);

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

router.post('/add', uploadFields, async (req, res) => {
   try {
      var contribution = req.body;
      console.log('im here');
      contribution.image = prefix + req.files['image'][0].originalname; // Get the first image file name
         contribution.docs = prefix + req.files['docs'][0].originalname; // Get the first document file name
      console.log('not yet');
      await ContributionModel.create(contribution);
      console.log('now is the time');
      res.redirect('/contribution');
   }
   catch (err) {
      if (err.name === 'ValidationError') {
         let InputErrors = {};
         for (let field in err.errors) {
            InputErrors[field] = err.errors[field].message;
         }
         res.render('contribution/add', { InputErrors, contribution });
         console.log(err);
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