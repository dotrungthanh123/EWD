var express = require('express');
var router = express.Router();
var UserModel = require('../models/UserModel');
var FacultyModel = require('../models/FacultyModel')
var RoleModel = require('../models/RoleModel')
const { checkLoginSession, checkAdminSession, checkNotLoggedIn } = require('../middlewares/auth');
var bcrypt = require('bcrypt');
var salt = 8;
const { validationResult } = require('express-validator');


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

// router.post('/register', checkAdminSession, checkLoginSession, async (req, res) => {
//     try {
//         var userRegistration = req.body;

//         const existingUser = await UserModel.findOne({ username: userRegistration.username });
//         if (existingUser) {
//             req.flash('error', 'Username already exists. Please choose a different username.');
//             return res.redirect('/auth/register');
//         }

//         var role = await RoleModel.findOne({ name: userRegistration.role });
//         var faculty = await FacultyModel.findOne({ name: userRegistration.faculty });
//         var hash = bcrypt.hashSync(userRegistration.psw, salt);
//         var user = {
//             username: userRegistration.username,
//             password: hash,
//             role: role._id,
//             faculty: faculty._id,
//             email: userRegistration.email,
//         }
//         await UserModel.create(user);
//         res.redirect('/auth/login');
//     } catch (err) {
//         if (err.code === 11000 && err.keyPattern && err.keyPattern.username === 1) {
//             req.flash('error', 'Username already exists. Please choose a different username.');
//             return res.redirect('/auth/register');
//         }
//         console.error(err);
//         req.flash('error', 'Error during registration');
//         res.redirect('/auth/register');
//     }
// });

router.post('/register', checkAdminSession, checkLoginSession, async (req, res) => {
    try {
        const { email, username, name, password, role, faculty } = req.body;

        // Retrieve roles and faculties for the dropdown
        const roles = await RoleModel.find();
        const faculties = await FacultyModel.find();

        // Check for existing user by username or email
        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
            return res.render('auth/register', {
                error: 'Username already exists. Please choose a different username.',
                roles,
                faculties,
                selectedRole: role,
                selectedFaculty: faculty,
            });
        }

        const existingEmail = await UserModel.findOne({ email });
        if (existingEmail) {
            return res.render('auth/register', {
                error: 'Email already in use. Please use a different email address.',
                roles,
                faculties,
                selectedRole: role,
                selectedFaculty: faculty,
            });
        }

        // Validate the role and faculty
        const roleDoc = await RoleModel.findOne({ name: role });
        const facultyDoc = await FacultyModel.findOne({ name: faculty });

        if (!roleDoc || !facultyDoc) {
            return res.render('auth/register', {
                error: 'Invalid role or faculty selection. Please choose a valid role and faculty.',
                roles,
                faculties,
                selectedRole: role,
                selectedFaculty: faculty,
            });
        }

        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

        const newUser = new UserModel({
            email,
            username,
            name,
            password: hashedPassword,
            role: roleDoc._id,
            faculty: facultyDoc._id,
        });

        await UserModel.create(newUser);

        // Successful registration, redirect to login
        return res.redirect('/auth/login');
    } catch (error) {
        console.error('Error during registration:', error);
        return res.render('auth/register', {
            error: 'An error occurred during registration. Please try again later.',
            roles: await RoleModel.find(),
            faculties: await FacultyModel.find(),
            selectedRole: role,
            selectedFaculty: faculty,
        });
    }
});

router.get('/login', checkNotLoggedIn, (req, res) => {
    res.render('auth/login', { layout: 'loginLayout' })
})

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).render('auth/login', {
                error: 'Username and password are required.'
            });
        }
        const user = await UserModel.findOne({ username }).populate('role', 'name');
        if (!user) {
            return res.status(401).render('auth/login', {
                error: 'Invalid username or password.'
            });
        }
        const isPasswordMatch = await bcrypt.compareSync(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).render('auth/login', {
                error: 'Invalid username or password.'
            });
        }
        const role = user.role.name;
        req.session.role = role;
        req.session.username = user.username;
        req.session.user = user;
        let redirectPath;
        switch (role) {
            case 'Admin':
            case 'Student':
            case 'MktCoor':
            case 'MktManager':
            case 'Guest':
                redirectPath = '/'; 
                break;
            default:
                redirectPath = '/'; 
        }
        return res.redirect(redirectPath);
    } catch (err) {
        console.error('Error during login:', err);
        return res.status(500).render('auth/login', {
            error: 'An error occurred during login. Please try again later.'
        });
    }
});

router.get('/', (req, res) => {
    // Retrieve username from session
    const username = req.session.username;
    res.render('index', { username: username });
    console.log('username: ', username);
});

router.get('/logout', checkLoginSession, (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
})

module.exports = router;