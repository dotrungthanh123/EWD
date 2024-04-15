var express = require('express');
var router = express.Router();
var ContributionModel = require('../models/ContributionModel');
var UserModel = require('../models/UserModel')
var FacultyModel = require('../models/FacultyModel')

router.get('/', async (req, res) => {
    var facultyContributionCount = []
    var facultyNames = await FacultyModel.find()
    var contributions = await ContributionModel.find().populate('user')
    var total = contributions.length

    var students = await UserModel.find().populate('role')
    console.log(students);
    var studentCount = students.length

    for (i = 0; i < facultyNames.length; i++) {
        var facultyContribution = contributions.filter(c => c.user.faculty.equals(facultyNames[i]._id))
        var contributionCount = facultyContribution.length
        var publishedCount = facultyContribution.filter(c => c.publish)
        facultyContributionCount.push({
            key: facultyNames[i].name,
            value: contributionCount,
            percent: contributionCount == 0 ? 0 : publishedCount * 100 / contributionCount
        })
    }
    res.render('statistics/index', { facultyContributionCount, total, studentCount })
})

module.exports = router;