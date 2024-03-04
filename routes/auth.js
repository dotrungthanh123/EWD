var express = require('express');
var router = express.Router();
var UserModel = require('../models/UserModel');

var bcrypt = require('bcryptjs');
const { hash } = require('bcrypt');
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
                //res.send("<h1>Login successful</h1>")
                req.session.username = user.username;
                req.session.role = user.role;
                if(req.session.role == "admin"){
                    res.redirect('/admin')
                } else if (req.session.role == "coach"){
                    res.redirect('/coach')
                }else{
                    res.redirect('/')
                }
            } else {
                //res.send("<h1>Login Failed</h1>")
                res.redirect('/auth/login');
            }   
        }
    } catch (err) {
        res.send(err)
    }
})

router.get('/logout', (req, res) =>{
    req.session.destroy();
    res.redirect('/auth/login');
})

module.exports = router;
