const express = require('express');
const router = express.Router();
const ContributionModel = require('../models/ContributionModel');
const AdvCommentModel = require('../models/AdvCommentModel');
const CategoryModel = require('../models/CategoryModel');
const ReactionModel = require('../models/ReactionModel')
const FacultyModel = require('../models/FacultyModel')
const nodemailer = require('nodemailer');
const { formidable } = require('formidable')
const AdmZip = require('adm-zip');
const fs = require('fs');
const { ObjectId } = require('mongodb');
const { default: mongoose } = require('mongoose');
const stringify = require('csv-stringify').stringify
const {checkLoginSession, checkAdminSession, checkStudentSession, checkMktCoordinatorSession, checkMktManagerSession, checkStudentOrMktCoordinatorSession, checkRoles, checkMultipleSession} = require('../middlewares/auth');
const moment = require('moment');

var contributionList = []
var eventList = []

const formMiddleWare = (req, res, next) => {
   fileTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/jpg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

   const form = formidable({
      uploadDir: './public/uploads',
      multiples: true,
      allowEmptyFiles: true,
      minFileSize: 0,
      maxFileSize: 15 * 1024 * 1024, // 15mb
      keepExtensions: true,
      filter: (part) => part.originalFilename !== "" && fileTypes.includes(part.mimetype)
   })

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

const getContribution = async req => {
   contributionList = await ContributionModel.find()
      .populate('category') // Populate category details if required
      .populate({
         path: 'advcomment', // Populate the 'advcomment' field in ContributionModel
         populate: {
            path: 'userId', // Populate user information within 'advcomment'
            select: 'username', // Only fetch the username
         },
      })
      .populate({
         path: 'user', // Populate the user who made the contribution
         populate: {
         path: 'role', // Populate the user's role
         select: 'name' // Only fetch the role name
         }
      })
      .then(async contributions =>
         await contributions
               // Display all when not login for testing, should be false on right side
            // .filter(contribution => req.session.user ? contribution.user.faculty.equals(req.session.user.faculty) : true)
            .filter(contribution => {
               if (!req.session.user.faculty) return true
               else if (contribution.user.faculty.equals(req.session.user.faculty)) {
                  if (contribution.user._id.equals(req.session.user._id) || contribution.publish) return true
                  if (req.session.user.role.name === "MktCoor" || req.session.user.role.name === "Guest") return true
               }
               return false
            })
      )
      .catch((err) => {
         console.log(err);
      })

   contributionList.forEach(async contribution => {
      var userState = 0

      let reactionList = await ReactionModel.find().then(
         list => list.filter(react => {
            const flag = react._id.contribution.equals(contribution._id) && react.state != 0
            if (flag && react._id.user.equals(req.session.user._id)) userState = react.state
            return flag
         })
      )

      likeList = reactionList.filter(react => react.state == 1)
      dislikeList = reactionList.filter(react => react.state == 2)

      contribution.like = likeList.length
      contribution.dislike = dislikeList.length
      contribution.isLike = userState == 1
      contribution.isDislike = userState == 2
      
      contribution.view = contribution.viewer.length
   })
}

const getEvent = async () => {
   eventList = await eventList.find()
}

router.get('/', async (req, res) => {
   await getContribution(req)

   const role = req.session.role;
   const facultyList = await FacultyModel.find()
   
   contributionList.reverse()
   if (role == "Admin" || role == "MktCoor" || role == "MktManager"){
      res.render('contribution/index', { contributionList, role, facultyList});
   }
   else{
      res.render('contribution/indexUser', { contributionList, role});
   }
      
   // res.render('contribution/index', { contributionList })
});

router.get('/faculty/:id', async (req, res) => {
   const id = new mongoose.Types.ObjectId(req.params.id)
   const contributions = contributionList.filter(contribution => contribution.user.faculty.equals(id))
   const role = req.session.role
   if (role == "Admin" || role == "MktCoor" || role == "MktManager") {
      contributionList.reverse()
      res.render('contribution/index', { contributionList: contributions, role })
   } else {
      contributionList.reverse()
      res.render('contribution/indexUser', {contributionList, role})
   }
})

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
      res.redirect("/contribution/index", { contributionList })
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

router.get('/add/:id', checkStudentSession, async (req, res) => {
   var eventId = req.params.id
   var categoryList = await CategoryModel.find();
   res.render('contribution/add', { categoryList, eventId });
})

router.get('/statistics', async (req, res) => {
   var facultyContributionCount = []
   var facultyNames = await FacultyModel.find()
   var contributions = await ContributionModel.find().populate('user')
   var total = contributions.length
   for (i = 0; i < facultyNames.length; i++) {
      facultyContributionCount.push({
         key: facultyNames[i].name,
         value: contributions.filter(c => c.user.faculty.equals(facultyNames[i]._id)).length,
      })
   }
   res.render('contribution/statistics', {facultyContributionCount, total})
})

router.post('/add', checkStudentSession, formMiddleWare, async (req, res) => {
   const contribution = {
      name: req.fields.name[0],
      description: req.fields.description[0],
      path: req.files.userfile ? req.files.userfile.map((userfile) => userfile.newFilename) : [],
      user: req.session.user._id,
      date: Date.now(),
      anonymous: req.fields.anonymous ? true : false,
      viewer: [],
      event: req.fields.event[0],
      advcomment: []
   }  

   await ContributionModel.create(contribution);

   const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
         user: 'ringotowntest@gmail.com',
         pass: 'akaj nngk lcyk ldnl',
      },
   });
   var mailOptions = '';

   if(req.session.faculty == "IT"){
      mailOptions = {
         from: 'ringotowntest@gmail.com',
         to: 'itszombie2019@gmail.com',
         subject: 'New submission',
         text: `You are receiving this because a student of your faculty have submitted a nwe contribution, please check in before 
               14 days from the day you receive this email to response to students.`,
      };
   } else if (req.session.faculty == "Business") {
      mailOptions = {
         from: 'ringotowntest@gmail.com',
         to: 'itszombie2016@gmail.com',
         subject: 'New submission',
         text: `You are receiving this because a student of your faculty have submitted a nwe contribution, please check in before 
               14 days from the day you receive this email to response to students.`,
      };
   } else {
      mailOptions = {
         from: 'ringotowntest@gmail.com',
         to: 'anhndgch210098@fpt.edu.vn',
         subject: 'New submission',
         text: `You are receiving this because a student of your faculty have submitted a nwe contribution, please check in before 
               14 days from the day you receive this email to response to students.`,
      };
   }

   transporter.sendMail(mailOptions, (info) => {
      console.log('Email sent: ' + info.response);
      // res.redirect('/contribution')
   });

   res.redirect('/contribution')
})

function convertDateFormat(dateObj) {
   const month = dateObj.getUTCMonth() + 1;
   const day = dateObj.getUTCDate();
   const year = dateObj.getUTCFullYear();

   const pMonth = month.toString().padStart(2, "0");
   const pDay = day.toString().padStart(2, "0");
   return `${year}/${pMonth}/${pDay}`
}

router.get('/edit/:id', checkMultipleSession(['Student', 'MktCoor']),  async (req, res) => {
   var id = req.params.id;
   var contribution = await ContributionModel.findById(id)

   fileList = contribution.path

   res.render('contribution/edit', { contribution, fileList });
})

router.post('/edit/:id', checkStudentSession, formMiddleWare, async (req, res) => {
   var id = req.params.id;
   const contribution = {
      name: req.fields.name[0],
      description: req.fields.description[0],
      anonymous: req.fields.anonymous ? true : false,
      path: req.files.userfile ? req.files.userfile.map((userfile) => userfile.newFilename) : []
   }
   await ContributionModel.findByIdAndUpdate(id, contribution);
   res.redirect('/contribution');
})

router.get('/publish/:id', checkMktCoordinatorSession, async (req, res) => {
   var id = req.params.id;
   var contribution = await ContributionModel.findById(id)
   contribution.publish = true
   contribution.save()
   res.redirect('/contribution')
})

router.get('/showPublish', checkLoginSession, async (req, res) => {
   var publishContributions = []

   for (index in contributionList) {
      if (contributionList[index].publish) publishContributions.push(contributionList[index])
   }

   publishContributions.reverse()

   res.render('contribution/index', { contributionList: publishContributions, publish: true })
})

router.post('/edit/:id', checkMultipleSession(['student', 'mktCoordinator']), formMiddleWare, async (req, res) => {
   var id = req.params.id;
   const contribution = {
      name: req.fields.name[0],
      description: req.fields.description[0],
      path: req.files.userfile.map((userfile) => userfile.newFilename)
   }
   await ContributionModel.findByIdAndUpdate(id, contribution);
   res.redirect('/contribution');
})

router.get('/delete/:id', checkMktCoordinatorSession, async (req, res) => {
   var id = req.params.id;
   await ContributionModel.findByIdAndDelete(id);
   res.redirect('/contribution');
})

router.post('/comment/:id', checkLoginSession, async (req, res) => {
   try {
      const id = req.params.id;
      const contribution = await ContributionModel.findById(id);

      contribution.comment = {
         content: req.body.comment,
         user: req.session.user._id,
         date: Date.now()
      };

      await contribution.save();

      res.redirect('/contribution');

   } catch (error) {
      console.error("Error saving comment: ", error)
      req.status(500).send("Error saving comment");
   }
})

router.post('/advcomments/:id', checkLoginSession, async (req, res) => {
   try {
      const content = req.body.content;
      const contributionId = req.params.id;
      const userId = req.session.user._id;

      const newAdvComment = await AdvCommentModel.create({
         content,
         date: Date.now(),
         userId,
         contributionId,
      });

      const contribution = await ContributionModel.findById(contributionId);
      if (contribution) {
         contribution.advcomment.push(newAdvComment._id);
         await contribution.save();
      } else {
         console.error('Post not found');
         return res.status(404).send('Post not found');
      }

      console.log(newAdvComment);
      console.log("Comment content:", content);
      console.log("Contribution ID:", contributionId);
      
      res.redirect('/contribution');
   } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
   }
});

router.post('/search', checkLoginSession, async (req, res) => {
   var keyword = req.body.keyword;
   var contributionList = await ContributionModel.find({ name: new RegExp(keyword, "i") })
      .populate('category')
      .populate({
         path: 'advcomment',
         populate: {
            path: 'userId',
            select: 'username',
         },
      })
      .populate({
         path: 'user',
         populate: {
         path: 'role',
         select: 'name'
         }
      });

   const role = req.session.role;

   contributionList.reverse()
   
   if (req.session.role == "Admin" || req.session.role == "MktCoor" || req.session.role == "MktManager"){
      res.render('contribution/index', { contributionList, role });
   }
   else{
      res.render('contribution/indexUser', { contributionList, role });
   }
})

router.get('/sort/asc', checkLoginSession, async (req, res) => {
   var contribtutions = await ContributionModel.find().sort({ name: 1 }).populate('faculty');
   res.render('contribution/index', { contributionList: contribtutions })
})

router.get('/sort/desc', checkLoginSession, async (req, res) => {
   var contributions = await ContributionModel.find().sort({ name: -1 }).populate('faculty');
   res.render('contribution/index', { contributionList: contributions })
})

router.get('/exportcsv', checkMktManagerSession, async (req, res, next) => {

   const contributions = await ContributionModel.find().lean()
      .populate({
         path: 'user',
      })
      .populate('category', "name")
      .then(contributions => contributions.map(contribution => ({
         'User Name': contribution.user.name,
         'Title': contribution.name,
         'Description': contribution.description,
         'Category': contribution.category.map(c => c.name).toString(),
         'Publish': contribution.publish ? 'True' : 'False',
         'Date': convertDateFormat(new Date(contribution.date))
      })))

   const directory = './public/files/'

   stringify(contributions, {
      header: true
   }, function (err, str) {
      const path = directory + 'contributions.csv'
      //create the files directory if it doesn't exist
      if (!fs.existsSync(directory)) {
         fs.mkdirSync(directory)
      }
      fs.writeFile(path, str, function (err) {
         if (err) {
            console.error(err)
            return res.status(400).json({ success: false, message: 'An error occurred' })
         }

         res.download(path, 'file.csv')
      })
   })
});

router.get('/detail/:id', checkLoginSession, async (req, res) => {
   const id = req.params.id
   let contribution = await ContributionModel.findById(id)
    .populate('user')
    .populate('event');

   const canEdit = contribution.user._id.toString() === req.session.user._id

   if (!contribution.viewer.includes(req.session.user._id)) {
      contribution.viewer.push(req.session.user._id)
   }

   contribution.formattedDate = moment(contribution.date).format('D/MM/YYYY');

   await ContributionModel.findByIdAndUpdate(id, contribution)

   const fileList = contribution.path

   res.render("contribution/detail", { contribution, canEdit, fileList })
})

router.post('/filterDate', checkLoginSession, async (req, res) => {
   var startDate = new Date(req.body.startDate)
   startDate.setDate(startDate.getDate() - 1)
   var endDate = new Date(req.body.endDate)
   endDate.setDate(endDate.getDate() + 1)
   let contributionList = await ContributionModel.find().then(contributions => contributions
      .filter(contribution => {
         return new Date(contribution.date) > startDate && new Date(contribution.date) < endDate
      }))

   contributionList.reverse()

   res.render('contribution/index', { contributionList })
})

router.post('/like/:id', checkLoginSession, async (req, res) => {
   const id = req.params.id

   let reactId = {
      user: new mongoose.Types.ObjectId(req.session.user._id),
      contribution: new mongoose.Types.ObjectId(id),
   }

   let react = await ReactionModel.findById(reactId)

   if (!react) {
      ReactionModel.create({
         _id: reactId,
         state: 1 
      })
   } else {
      react.state = (react.state == 1) ? 0 : 1
      await ReactionModel.findByIdAndUpdate(reactId, {
         _id: reactId,
         state: react.state,
      })
   }
})

router.post('/dislike/:id', checkLoginSession, async (req, res) => {
   const id = req.params.id

   let reactId = {
      user: new mongoose.Types.ObjectId(req.session.user._id),
      contribution: new mongoose.Types.ObjectId(id),
   }

   let react = await ReactionModel.findById(reactId)
   
   if (!react) {
      ReactionModel.create({
         _id: reactId,
         state: 2 
      })
   } else {
      react.state = (react.state == 2) ? 0 : 2
      await ReactionModel.findByIdAndUpdate(reactId, {
         _id: reactId,
         state: react.state,
      })
   }
})

router.post('/feedback/:id', async (req,res) => {
   var id = req.params.id;
   var contribution = await ContributionModel.findById(id).populate('user');
   var email = contribution.user.email;
   var emailContent = req.body.emailContent;
   console.log('contribution: ',contribution);
   console.log('contribution.email: ', email);
   const currentDate = new Date();
   var daysDifference = Math.floor((currentDate-contribution.date) / (1000 * 60 * 60 * 24));
   console.log(daysDifference);
   if (daysDifference > 14) {
      res.redirect('/contribution');
   } else {
      console.log('email', email);
      const transporter = nodemailer.createTransport({
         service: 'gmail',
         auth: {
            user: 'ringotowntest@gmail.com',
            pass: 'akaj nngk lcyk ldnl',
         },
      });
      
      const mailOptions = {
         from: 'ringotowntest@gmail.com',
         to: email,
         subject: 'Marketing Coordinator replied',
         text: emailContent,
      };
      console.log('Email content: ', emailContent);
      transporter.sendMail(mailOptions, (info) => {
         console.log('Email sent: ' + info.response);
      });
      res.redirect('/contribution');
   }
});

module.exports = { 
   router: router,
   formMiddleWare: formMiddleWare
}
