const express = require('express');
const router = express.Router();
const { checkLoginSession } = require('../middlewares/auth');


router.get('/', checkLoginSession, async (req, res) => {
    const user = req.session
    console.log(user);
    res.render('account/index', user);
});

module.exports = router;