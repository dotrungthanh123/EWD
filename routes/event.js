const express = require('express');
const router = express.Router();
const EventModel = require('../models/EventModel');
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
    var eventList = await EventModel.find({});
    //if (req.session.role == "mktmanager" || req.session.role == "mktcoordinator")
    res.render('event/index', { eventList });
    // else
    //    res.render('contribution/indexUser', { contributionList });
});

router.get('/add', async (req, res) => {
    res.render('event/add');
})

router.post('/add', async (req, res) => {
    await EventModel.create({
        name: req.body.name,
        firstClosureDate: req.body.firstClosureDate.toString('yyyy-MM-dd'),
        finalClosureDate: req.body.finalClosureDate.toString('yyyy-MM-dd'),
        openDate: req.body.openDate.toString('yyyy-MM-dd')
        })
    res.redirect('/event')
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

router.get('/edit/:id', async (req, res) => {
    var id = req.params.id;
    var event = await EventModel.findById(id);
    res.render('event/edit', { event });
})

router.post('/edit/:id', async (req, res) => {
    var id = req.params.id;
    var data = req.body;
    await EventModel.findByIdAndUpdate(id, data);
    res.redirect('/event');
})

router.post('/search', async (req, res) => {
    var keyword = req.body.keyword;
    var eventList = await EventModel.find({ name: new RegExp(keyword, "i") });
    res.render('event/index', { eventList })
})

module.exports = router;