var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var flash = require('express-flash');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var facultyRouter = require('./routes/faculty');
var contributionRouter = require('./routes/contribution');
var eventRouter = require('./routes/event')
var categoryRouter = require('./routes/category')
var studentRouter = require('./routes/student')
var statisticRouter = require('./routes/statistics')
var bcrypt = require('bcrypt');

const UserModel = require('./models/UserModel')
const RoleModel = require('./models/RoleModel')

const {checkLoginSession, checkAdminSession} = require('./middlewares/auth');
// const allowedRolesForUserRoute = ['admin', 'user'];

var app = express();

var session = require('express-session');
//set session timeout 
const timeout = 1000 * 60 * 60 * 24;
//config session middleware
app.use(session({
    secret: "alien_is_existed_or_not_it_is_still_a_secret",
    saveUninitialized: false,
    cookie: { maxAge: timeout },
    resave: false,
}));

//Mongoose
var mongoose = require('mongoose');
var uri = "mongodb://0.0.0.0:27017/EnterpriseWebDev";
var con = mongoose.connect(uri) 
  .then(()=> console.log('connect to db succeed'))
  .catch((err) => console.log('Error: ' + err));

const Initiation = async () => {

  const roles = await RoleModel.find()
  if (roles.length == 0) {
    await RoleModel.create({
      name: "Student"
    })
    await RoleModel.create({
      name: "MktManager"
    })
    await RoleModel.create({
      name: "MktCoordinator"
    })
    await RoleModel.create({
      name: "Guest"
    })
    await RoleModel.create({
      name: "Admin"
    })
  }

  const faculties = await FacultyModel.find()
  if (faculties.length == 0) {
    await FacultyModel.create({
      name: "IT"
    })
    await FacultyModel.create({
      name: "Business"
    })
    await FacultyModel.create({
      name: "Design"
    })
  }

  const adminRole = await RoleModel.findOne({name: "Admin"})
  const admin = await UserModel.findOne({role: adminRole._id})
  
  if (!admin) {
    await UserModel.create({
      username: "a",
      password: bcrypt.hashSync('a', 8),
      role: adminRole._id
    })
  }
}

Initiation()

//Body parser
var bodyParser = require('body-parser');
const FacultyModel = require('./models/FacultyModel');
app.use(bodyParser.urlencoded({ extended: false }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

app.use('/contribution', checkLoginSession)

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/contribution', contributionRouter.router);
app.use('/faculty', facultyRouter);
app.use('/event', eventRouter);
app.use('/category', categoryRouter)
app.use('/student', studentRouter)
app.use('/statistics', statisticRouter)

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;