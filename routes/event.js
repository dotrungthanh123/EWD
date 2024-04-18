const express = require('express');
const router = express.Router();
const EventModel = require('../models/EventModel');
const { checkMktManagerSession, checkAdminSession, checkLoginSession, } = require('../middlewares/auth');
const {formMiddleWare} = require('./contribution')

router.get('/', checkLoginSession, async (req, res) => {
    var eventList = await EventModel.find({});
    //if (req.session.role == "mktmanager" || req.session.role == "mktcoordinator")
    res.render('event/index', { eventList });
    // else
    //    res.render('contribution/indexUser', { contributionList });
});

router.get('/add', checkAdminSession, async (req, res) => {
    res.render('event/add');
})

router.post('/add', checkAdminSession, formMiddleWare, async (req, res) => {
    console.log(req.files);
    await EventModel.create({
        name: req.fields.name[0],
        firstClosureDate: req.fields.firstClosureDate[0],
        finalClosureDate: req.fields.finalClosureDate[0],
        image: req.files.image[0].newFilename,
    })
    res.redirect('/event')
})

router.get('/edit/:id', checkAdminSession, async (req, res) => {
    var id = req.params.id;
    var event = await EventModel.findById(id);
    res.render('event/edit', { event });
})

router.post('/edit/:id', checkAdminSession, async (req, res) => {
    var id = req.params.id;
    var data = req.body;
    await EventModel.findByIdAndUpdate(id, data);
    res.redirect('/event');
})

router.post('/search', checkLoginSession, async (req, res) => {
    var keyword = req.body.keyword;
    var eventList = await EventModel.find({ name: new RegExp(keyword, "i") });
    res.render('event/index', { eventList })
})

module.exports = router;