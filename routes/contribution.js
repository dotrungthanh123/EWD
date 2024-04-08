const express = require('express');
const router = express.Router();
const ContributionModel = require('../models/ContributionModel');
const CategoryModel = require('../models/CategoryModel');
const FacultyModel = require('../models/FacultyModel')
const CommentModel = require('../models/CommentModel');
const { formidable } = require('formidable')
const AdmZip = require('adm-zip');

var contributionList = []

// const getContribution = async () => {
//    contributionList = await ContributionModel.find()
//       .populate('user')
//       .populate('category')
//       .then((contributions) =>
//          contributions
//          .filter((contribution) => {
//             // Display all when not login for testing, should be false on right side
//             return req.session.user ? contribution.user.faculty.equals(req.session.user.faculty) : true;
//          })
//       )
//       .catch((err) => {
//          console.log(err);
//       })
// }

// router.get('/', async (req, res) => {
//    // Suck because it has to retrieve all the contributions, then a call for each of them to get the faculty of the user
//    // Suck not because design suck, is mongodb that suck

//    // Might be better: https://stackoverflow.com/questions/11303294/querying-after-populate-in-mongoose

//    // Must login else undefine faculty in session
//    // Need code to prevent viewing without login
   
//    getContribution()

//    // if (req.session.role == "admin" || req.session.role == "mktcoordinator")
//    // res.render('contribution/index', { contributionList });
//    // else
//    //    res.render('contribution/indexUser', { contributionList });
//    res.render('contribution/index', { contributionList})
// });

router.get('/', async (req, res) => {
   try {
      const contributionList = await getContribution(req);
      res.render('contribution/index', { contributionList });
   } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching contributions');
   }
});

const getContribution = async (req) => {
   try {
      const contributions = await ContributionModel.find()
         .populate('user')
         .populate('category');
      
      const filteredContributions = contributions.filter(contribution => {
         return req.session.user ? contribution.user.faculty.equals(req.session.user.faculty) : true;
      });

      return filteredContributions;
   } catch (err) {
      throw err;
   }
}

router.get('/download/:id', async (req, res) => {
   var zip = new AdmZip()
   var id = req.params.id;
   var contribution = await ContributionModel.findById(id);

   // add local file
   var paths = contribution.path

   // If empty paths, redirect to contribution index
   if (paths.length == 0) {
      // if contributionList has not been filled, fill it
      if (contributionList.length == 0) {
         getContribution()
      }
      res.redirect("/contribution/index", {contributionList})
   }
   
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
   var categoryList = await CategoryModel.find();
   res.render('contribution/add', { categoryList });
})

const formMiddleWare = (req, res, next) => {
   fileTypes = ['image/jpeg', 'image/png', 'image/pdf', 'image/jpg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

   const form = formidable({
      uploadDir: './public/uploads',
      multiples: true,
      allowEmptyFiles: true,
      minFileSize: 0,
      maxFileSize: 15 * 1024 * 1024, // 15mb
      keepExtensions: true,
      filter: (part) => part.originalFilename !== "" && fileTypes.includes(part.mimetype)})

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
   // Currently choose only one category, should be multiple

   const contribution = {
      name: req.fields.name[0],
      description: req.fields.description[0],
      path: req.files.userfile ? req.files.userfile.map((userfile) => userfile.newFilename) : [],
      category: req.fields.category ? [req.fields.category[0]] : [],
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

router.get('/publish/:id', async (req, res) => {
   var id = req.params.id;
   var contribution = await ContributionModel.findById(id)
   contribution.publish = true
   contribution.save()
   res.redirect('/contribution')
})

router.get('/showPublish', async (req, res) => {
   var publishContributions = []
   
   for (index in contributionList) {
      if (contributionList[index].publish) publishContributions.push(contributionList[index])
   }

   res.render('contribution/index', {contributionList: publishContributions, publish: true})
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

router.get('/comment/:id', async (req, res) =>{
   var id = req.params.id;
   var contribution = await ContributionModel.findById(id);
   res.render('contribution/comment', { contribution });
})

// router.post('/comment/:id', async (req, res) => {
//    try {
//       const id = req.params.id;
//       const contribution = await ContributionModel.findById(id);

//       const { comment } = req.body;

//       const newComment = new CommentModel({
//          content: comment,
//          user: req.session.user._id, // Assuming user information is stored in req.session.user
//          date: new Date()
//       });

//       await newComment.save();

//       contribution.comment.push(newComment);
//       await contribution.save();

//       res.redirect(`/contribution`);
//    } catch (err) {
//       console.error("Error saving comment:", err);
//       res.status(500).send("Error saving comment");
//    }
// });

module.exports = router;