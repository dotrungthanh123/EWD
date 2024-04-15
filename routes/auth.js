var express = require('express');
var router = express.Router();
var UserModel = require('../models/UserModel');
<<<<<<< Updated upstream
=======
var FacultyModel = require('../models/FacultyModel')
var RoleModel = require('../models/RoleModel')
const {checkLoginSession, checkAdminSession} = require('../middlewares/auth');
>>>>>>> Stashed changes

var bcrypt = require('bcryptjs');
const { hash } = require('bcrypt');
var salt = 8; 

router.get('/register', (req, res) => {
    res.render('auth/register', {layout: 'loginLayout' });
})

<<<<<<< Updated upstream
router.post('/register', async (req, res) =>{
=======
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

router.post('/register',checkAdminSession, async (req, res) => {
>>>>>>> Stashed changes
    try {
        var userRegistration = req.body;
        var hashPassword = bcrypt.hashSync(userRegistration.password, salt);
        var user = {
            username: userRegistration.username,
            password: hashPassword,
            role: userRegistration.role,
            faculty: userRegistration.faculty
        }
        await UserModel.create(user);
        res.redirect('/auth/login'); 
    } catch (err) {
        if (err.name === 'ValidationError') {
            let InputErrors ={};
            for (let field in err.errors) 
                {
                    InputErrors[field] = err.errors[field].message;
                }
                res.render('auth/register', { InputErrors, userRegistration, layout: 'loginLayout'});
            }
        }
});

router.get('/login', (req, res) => {
    res.render('auth/login', {layout: 'loginLayout' })
}); 

router.post('/login', async (req, res) => {
    try {
<<<<<<< Updated upstream
        var { username, password } = req.body;
        var user = await UserModel.findOne({ username });
        if (!user) {
            return res.render('auth/login', { 
                error: 'Invalid username or password',
            });
        }
        var isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.render('auth/login', { 
                error: 'Invalid username or password',
            });
        }
        req.session.username = user.username;
        req.session.role = user.role;
        switch (user.role) {
            case "mktManager":
                res.redirect('/mkt-manager-dashboard');
                break;
            case "mktCoordinatorIT":
                res.redirect('/mkt-coordinator-it-dashboard');
                break;
            case "mktCoordinatorDesign":
                res.redirect('/mkt-coordinator-design-dashboard');
                break;
            case "mktCoordinatorBusiness":
                res.redirect('/mkt-coordinator-business-dashboard');
                break;
            case "studentIT":
                res.redirect('/student-it-dashboard');
                break;
            case "studentDesign":
                res.redirect('/student-design-dashboard');
                break;
            case "studentBusiness":
                res.redirect('/student-business-dashboard');
                break;
            case "admin":
                res.redirect('/admin-dashboard');
                break;
            case "guestIT":
                res.redirect('/guest-it-dashboard');
                break;
            case "guestDesign":
                res.redirect('/guest-design-dashboard');
                break;
            case "guestBusiness":
                res.redirect('/guest-business-dashboard');
                break;
            default:
                res.redirect('/');
                break;
=======
        var userLogin = req.body;
        var user = await UserModel.findOne({ username: userLogin.username })
        if (user) {
            var hash = bcrypt.compareSync(userLogin.password, user.password)
            if (hash) {

                req.session.username = user.username;
                // req.session.role = user.role;
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
                }
            } else {
                res.redirect('/auth/login');
            }
>>>>>>> Stashed changes
        }
    } catch (err) {
        console.error('Login Error: ', err);
        res.status(500).send('Server error occurred during login');
    }
});

<<<<<<< Updated upstream
router.get('/logout', (req, res) =>{
=======
router.get('/logout', (req, res) => {
>>>>>>> Stashed changes
    req.session.destroy();
    res.redirect('/auth/login');
});

module.exports = router;
