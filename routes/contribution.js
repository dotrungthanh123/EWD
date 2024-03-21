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
      path: req.files.userfile.map((userfile) => userfile.newFilename)
   }
   await ContributionModel.create(contribution);

   const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
         user: 'ringotowntest@gmail.com',
         pass: 'akaj nngk lcyk ldnl',
      },
   });
   if (req.session.role == "studentIT") {
      const mailOptions = {
         from: 'ringotowntest@gmail.com',
         to: 'anhndgch210098@fpt.edu.vn',
         subject: 'New Submission IT',
         text: `You are receiving this because your student have submitted a new contribution,
               please check out within 14 days of receiving this email!`,
         };
      } else if (req.session.role == "studentDesign") {
         const mailOptions = {
            from: 'ringotowntest@gmail.com',
            to: 'itszombie2016@gmail.com',
            subject: 'New Submission Design',
            text: `You are receiving this because your student have submitted a new contribution,
                  please check out within 14 days of receiving this email!`,
         };
      } else if (req.session.role == "studentBusiness") {
         const mailOptions = {
            from: 'ringotowntest@gmail.com',
            to: 'itszombie2019@gmail.com',
            subject: 'New Submission Business',
            text: `You are receiving this because your student have submitted a new contribution,
                  please check out within 14 days of receiving this email!`,
         };
      }

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