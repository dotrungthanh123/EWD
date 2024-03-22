var express = require('express');
var router = express.Router();
var UserModel = require('../models/UserModel');

var bcrypt = require('bcryptjs');
var salt = 8; 

router.get('/register', (req, res) => {
    res.render('auth/register', {layout: 'loginLayout' });
})

router.post('/register', async (req, res) =>{
    try {
        var userRegistration = req.body;
        var hashPassword = bcrypt.hashSync(userRegistration.password, salt);
        var user = {
            username: userRegistration.username,
            password: hashPassword,
            role: userRegistration.role,
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
})

router.get('/login', (req, res) => {
    res.render('auth/login', {layout: 'loginLayout' })
})

router.post('/login', async (req, res) =>{
    try{ 
        var userLogin = req.body;
        var user = await UserModel.findOne({ username : userLogin.username})
        if (user){
            var hash = bcrypt.compareSync(userLogin.password, user.password)
            if(hash) {
                
                req.session.username = user.username;
                req.session.role = user.role;
                req.session.user = user
                if(req.session.role == "admin"){
                    // res.redirect('/contribution/add')
                // } else if (req.session.role == "studentIT"){
                //     res.redirect('/')
                // } else if (req.session.role == "studentDesign"){
                //     res.redirect('/')
                // } else if (req.session.role == "studentBusiness"){
                //     res.redirect('/')
                // } else if (req.session.role == "mktCoordinatorIT"){
                //     res.redirect('/')
                // } else if (req.session.role == "mktcoordinatorDesign"){
                //     res.redirect('/')
                // } else if (req.session.role == "mktcoordinatorBusiness"){
                //     res.redirect('/')
                // } else if (req.session.role == "mktmanager"){
                //     res.redirect('/')
                // } else if (req.session.role == "guestIT"){
                //     res.redirect('/')
                // } else if (req.session.role == "guestDesign"){
                //     res.redirect('/')
                // } else if (req.session.role == "guestBusiness"){
                //     res.redirect('/')
                    res.redirect('/contribution/add')
                } else if (req.session.role == "studentIT"){
                    res.redirect('/')
                } else if (req.session.role == "studentDesign"){
                    res.redirect('/')
                } else if (req.session.role == "studentBusiness"){
                    res.redirect('/')
                } else if (req.session.role == "mktCoordinatorIT"){
                    res.redirect('/')
                } else if (req.session.role == "mktcoordinatorDesign"){
                    res.redirect('/')
                } else if (req.session.role == "mktcoordinatorBusiness"){
                    res.redirect('/')
                } else if (req.session.role == "mktmanager"){
                    res.redirect('/')
                } else if (req.session.role == "guestIT"){
                    res.redirect('/')
                } else if (req.session.role == "guestDesign"){
                    res.redirect('/')
                } else if (req.session.role == "guestBusiness"){
                    res.redirect('/')
                }else{
                    res.redirect('/')
                }
            } else {
                // res.redirect('/auth/login');
                res.send("nigga");
            }   
        }
    } catch (err) {
        res.send(err)
    }
})

router.get('/logout', (req, res) =>{
    // req.session.destroy();
    res.redirect('/auth/login');
})

module.exports = router;