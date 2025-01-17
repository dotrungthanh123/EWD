const express = require('express');
const router = express.Router();
const EventModel = require('../models/EventModel');
const { checkMktManagerSession, checkAdminSession, checkLoginSession, } = require('../middlewares/auth');
const {formMiddleWare} = require('./contribution')
const moment = require('moment');

router.get('/', checkLoginSession, async (req, res) => {
    var eventList = await EventModel.find({}).then(events => events.filter(event => {
        var startDate = new Date(event.firstClosureDate)
        startDate.setDate(startDate.getDate() + 1)

        return Date.now() < startDate
    }))
    //if (req.session.role == "mktmanager" || req.session.role == "mktcoordinator")
    const formattedEvents = eventList.map(event => ({
        ...event.toObject(),
        formattedFirstClosureDate: moment(event.firstClosureDate).format('D/MM/YYYY'),
        formattedFinalClosureDate: moment(event.finalClosureDate).format('D/MM/YYYY')
    }));

    const role = req.session.role;

    formattedEvents.reverse()

    res.render('event/index', { eventList: formattedEvents, role });
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
router.get('/schedule', checkLoginSession, async (req, res) => {
    try {
      const eventList = await EventModel.find({});
      const formattedEvents = eventList.map(event => ({
        ...event.toObject(),
        formattedFirstClosureDate: moment(event.firstClosureDate).format('YYYY-MM-DD'),
        formattedFinalClosureDate: moment(event.finalClosureDate).format('YYYY-MM-DD'),
      }));
    formattedEvents.reverse()
    res.render('event/schedule', { eventList: formattedEvents });
    } catch (error) {
      console.error('Error fetching event data:', error);
      res.status(500).json({ message: 'Error fetching event data' });
    }
  });

router.get('/edit/:id', checkAdminSession, async (req, res) => {
    var id = req.params.id;
    var event = await EventModel.findById(id);

    const formattedFirstClosureDate = moment(event.firstClosureDate).format('YYYY-MM-DD');
    const formattedFinalClosureDate = moment(event.finalClosureDate).format('YYYY-MM-DD');
    
    console.log(formattedFirstClosureDate);

    res.render('event/edit', { event, formattedFirstClosureDate, formattedFinalClosureDate });
})

router.post('/edit/:id', checkAdminSession, formMiddleWare, async (req, res) => {
    var id = req.params.id;
    const event = {
        name: req.fields.name[0],
        description: req.fields.description[0],
        firstClosureDate: req.fields.firstClosureDate[0],
        finalClosureDate: req.fields.finalClosureDate[0],
        image: req.files.image ? req.files.image[0].newFilename : '',
        description: req.fields.description[0],
    }
    await EventModel.findByIdAndUpdate(id, event);
    res.redirect('/event');
})

router.get('/detail/:id', checkLoginSession, async (req, res) => {
    const id = req.params.id;
    const event = await EventModel.findById(id);
    
    const formattedEvent = {
        ...event.toObject(),
        formattedFirstClosureDate: moment(event.firstClosureDate).format('D/MM/YYYY'),
        formattedFinalClosureDate: moment(event.finalClosureDate).format('D/MM/YYYY')
    };

    // Preprocess the data to include a boolean indicating if the role is "Admin"
    const isAdmin = req.session.role === "Admin";

    res.render("event/detail", { event: formattedEvent, isAdmin });
});

router.post('/search', checkLoginSession, async (req, res) => {
    var keyword = req.body.keyword;
    var eventList = await EventModel.find({ name: new RegExp(keyword, "i") });
    const formattedEvents = eventList.map(event => ({
        ...event.toObject(),
        formattedFirstClosureDate: moment(event.firstClosureDate).format('D/MM/YYYY'),
        formattedFinalClosureDate: moment(event.finalClosureDate).format('D/MM/YYYY')
    }));

    const role = req.session.role;
    
    res.render('event/index', { eventList: formattedEvents, role });
})

// router.get('/eventData', async (req, res) => {
//     try {
//         var events = await EventModel.find({});
//         var eventData = events.map(evt => ({
//             title: evt.name,
//             start: new Date(evt.firstClosureDate),
//             end: new Date(evt.finalClosureDate)
//         }));

//         res.json(eventData);
//     } catch (error) {
//         console.error('Error fetching class data:', error);
//         res.status(500).json({ message: 'Error fetching class data' });
//     }
// });

router.get('/eventData', async (req, res) => {
    try {
        var events = await EventModel.find({});
        
        var eventData = [];

        events.forEach(evt => {
            eventData.push({
                title: evt.name + ' (First)',
                start: new Date(evt.firstClosureDate),
                color: '#686bc4',
            });

            eventData.push({
                title: evt.name + ' (Final)',
                start: new Date(evt.finalClosureDate),
                color: '#bf58ff',
            });
        });

        res.json(eventData);
    } catch (error) {
        console.error('Error fetching event data:', error);
        res.status(500).json({ message: 'Error fetching event data' });
    }
});


module.exports = router;
