var express = require('express');
var router = express.Router();
var RoleModel = require('../models/RoleModel');


router.get('/', async (req, res) => {
   var roleList = await RoleModel.find({});
   res.render('role/index', { roleList });
});