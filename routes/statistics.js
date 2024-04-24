var express = require('express');
var router = express.Router();
var ContributionModel = require('../models/ContributionModel');
var UserModel = require('../models/UserModel')
var FacultyModel = require('../models/FacultyModel')
var EventModel = require('../models/EventModel')


router.get('/stats', async (req, res) => {
    try {
        const facultyContributionCount = [];
        const facultyNames = await FacultyModel.find();
        const contributions = await ContributionModel.find().populate('user');
        const total = contributions.length;

        const students = await UserModel.find().populate('role');
        const studentCount = students.length;

        for (let i = 0; i < facultyNames.length; i++) {
            const facultyContribution = contributions.filter(c => c.user.faculty.equals(facultyNames[i]._id));
            const contributionCount = facultyContribution.length;
            const publishedCount = facultyContribution.filter(c => c.publish).length;

            facultyContributionCount.push({
                name: facultyNames[i].name,
                contributions: contributionCount,
                publishedPercent: contributionCount === 0 ? 0 : (publishedCount * 100) / contributionCount
            });
        }

        const numFaculties = facultyNames.length; // Number of faculties
        const numEvents = await EventModel.countDocuments({}); // Number of events
        const numUsers = await UserModel.countDocuments({}); // Number of events
        const numContribution = await ContributionModel.countDocuments({});

        res.render('statistics/index', {
            facultyContributionCount,
            total,
            studentCount,
            numFaculties,
            numEvents,
            numUsers,
            numContribution
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;