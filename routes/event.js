const express = require('express');
const router = express.Router();
const EventModel = require('../models/EventModel');
const { checkMktManagerSession, checkAdminSession, checkLoginSession, } = require('../middlewares/auth');
const {formMiddleWare} = require('./contribution')
const moment = require('moment');

router.get('/', checkLoginSession, async (req, res) => {
    var eventList = await EventModel.find({});
    //if (req.session.role == "mktmanager" || req.session.role == "mktcoordinator")
    const formattedEvents = eventList.map(event => ({
        ...event.toObject(),
        formattedFirstClosureDate: moment(event.firstClosureDate).format('D/MM/YYYY'),
        formattedFinalClosureDate: moment(event.finalClosureDate).format('D/MM/YYYY')
    }));

    const role = req.session.role;

    res.render('event/index', { eventList: formattedEvents, role });
    // else
    //    res.render('contribution/indexUser', { contributionList });
});

router.get('/add', checkAdminSession, async (req, res) => {
    res.render('event/add');
})

router.post('/add', checkAdminSession, formMiddleWare, async (req, res) => {
    await EventModel.create({
        name: req.fields.name[0],
        description: req.fields.description[0],
        firstClosureDate: req.fields.firstClosureDate[0],
        finalClosureDate: req.fields.finalClosureDate[0],
        image: req.files.image ? req.files.image[0].newFilename : '',
        description: req.fields.description[0],
    }).then()
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

router.get('/eventData', async (req, res) => {
    try {
        var events = await EventModel.find({});
        var eventData = events.map(evt => ({
            title: evt.name,
            start: new Date(evt.firstClosureDate),
            end: new Date(evt.finalClosureDate)
        }));

        res.json(eventData);
    } catch (error) {
        console.error('Error fetching class data:', error);
        res.status(500).json({ message: 'Error fetching class data' });
    }
});

module.exports = router;