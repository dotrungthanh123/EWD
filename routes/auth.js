var express = require('express');
var router = express.Router();
var UserModel = require('../models/UserModel');
var FacultyModel = require('../models/FacultyModel')
var RoleModel = require('../models/RoleModel')


var bcrypt = require('bcrypt');
var ContributionModel = require('../models/ContributionModel');
var salt = 8;

router.get('/register', async (req, res) => {
    try {
        var roleList = await RoleModel.find({});
        var facultyList = await FacultyModel.find({});
        
        res.render('auth/register', { roleList, facultyList });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading registration form");
    }
});

router.post('/register', async (req, res) => {
    try {
        var userRegistration = req.body;
        var role = await RoleModel.findOne({ name: userRegistration.role });
        var faculty = await FacultyModel.findOne({ name: userRegistration.faculty });
        var hash = bcrypt.hashSync(userRegistration.psw, salt);
        var user = {
            username: userRegistration.username,
            password: hash,
            role: role._id,
            faculty: faculty._id
        }
        await UserModel.create(user);
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error during registration');
    }
});

router.get('/login', (req, res) => {
    res.render('auth/login', { layout: 'loginLayout' })
})

router.post('/login', async (req, res) => {
    try {
        var userLogin = req.body;
        var user = await UserModel.findOne({ username: userLogin.username })
        if (user) {
            var hash = bcrypt.compareSync(userLogin.password, user.password)
            if (hash) {

                req.session.username = user.username;
                req.session.role = user.role;
                req.session.user = user
                if (req.session.role == "admin") {
                    res.redirect('/contribution/add')
                } else if (req.session.role == "student") {
                    res.redirect('/')
                } else if (req.session.role == "mktCoordinator") {
                    res.redirect('/')
                } else if (req.session.role == "mktmanager") {
                    res.redirect('/')
                } else if (req.session.role == "guest") {
                    res.redirect('/')
                } else {
                    res.redirect('/')
                }
            } else {
                res.redirect('/auth/login');
            }
        }
    } catch (err) {
        res.send(err)
    }
})

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
})

module.exports = router;