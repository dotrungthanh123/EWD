var express = require('express');
var router = express.Router();
var UserModel = require('../models/UserModel');
var FacultyModel = require('../models/FacultyModel')
var RoleModel = require('../models/RoleModel')
const { checkLoginSession, checkAdminSession, checkNotLoggedIn } = require('../middlewares/auth');
var bcrypt = require('bcrypt');
var ContributionModel = require('../models/ContributionModel');
var salt = 8;


router.get('/', (req, res) => {
    // Retrieve username from session
    const username = req.session.username;
    res.render('/index', { username: username });
    console.log('username: ', username);
});

router.get('/register', checkAdminSession, checkLoginSession, async (req, res) => {
    try {
        var roleList = await RoleModel.find({});
        var facultyList = await FacultyModel.find({});

        res.render('auth/register', { roleList, facultyList });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading registration form");
    }
});

router.post('/register', checkAdminSession, checkLoginSession, async (req, res) => {
    try {
        var userRegistration = req.body;

        const existingUser = await UserModel.findOne({ username: userRegistration.username });
        if (existingUser) {
            req.flash('error', 'Username already exists. Please choose a different username.');
            return res.redirect('/auth/register');
        }

        var role = await RoleModel.findOne({ name: userRegistration.role });
        var faculty = await FacultyModel.findOne({ name: userRegistration.faculty });
        var hash = bcrypt.hashSync(userRegistration.psw, salt);
        var user = {
            username: userRegistration.username,
            password: hash,
            role: role._id,
            faculty: faculty._id,
            email: userRegistration.email,
        }
        await UserModel.create(user);
        res.redirect('/auth/login');
    } catch (err) {
        if (err.code === 11000 && err.keyPattern && err.keyPattern.username === 1) {
            req.flash('error', 'Username already exists. Please choose a different username.');
            return res.redirect('/auth/register');
        }
        console.error(err);
        req.flash('error', 'Error during registration');
        res.redirect('/auth/register');
    }
});

router.get('/login', (req, res) => {
    res.render('auth/login', { layout: 'loginLayout' })
})

router.post('/login', async (req, res) => {
    try {
        var userLogin = req.body;
        var user = await UserModel.findOne({ username: userLogin.username }).populate('role', 'name');
        if (user) {
            var hash = bcrypt.compareSync(userLogin.password, user.password);
            if (hash) {
                var role = user.role.name
                req.session.role = role
                req.session.username = user.username;
                req.session.user = user;
                // Redirect based on the role name
                if (role === "Admin") {
                    res.redirect('/');
                } else if (role === "Student") {
                    res.redirect(`/`);
                } else if (role === "MktCoor") {
                    res.redirect('/');
                } else if (role === "MktManager") {
                    res.redirect('/');
                } else if (role === "Guest") {
                    res.redirect('/');
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/auth/login');
            }
        }
    } catch (err) {
        res.send(err);
    }
});

router.get('/', (req, res) => {
    // Retrieve username from session
    const username = req.session.username;
    res.render('index', { username: username });
    console.log('username: ', username);
});

router.get('/logout', checkNotLoggedIn, (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
})

module.exports = router;