var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var flash = require('express-flash');
var hbs = require('hbs');

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
const FacultyModel = require('./models/FacultyModel')
const CategoryModel = require('./models/CategoryModel')

const { checkLoginSession, checkAdminSession } = require('./middlewares/auth');
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
const mongoose = require('mongoose');
var uri = "mongodb://0.0.0.0:27017/EnterpriseWebDev";
var con = mongoose.connect(uri)
  .then(async () => {
    console.log('connect to db succeed')
    await Initiation()
  })
  .catch((err) => console.log('Error: ' + err));

const Initiation = async () => {

  if ((await RoleModel.find()).length != 0) return

  salt = 8

  const faculties = ['IT', 'Design', 'Business']
  const roles = ['MktCoor', 'Student', 'Guest']
  const categories = ['Fiction', 'Comedy', 'Science']

  const password = "123456"

  await RoleModel.create({
    name: "Admin"
  })

  await RoleModel.create({
    name: "MktManager"
  })

  await UserModel.create({
    username: "Admin",
    password: await bcrypt.hash(password, salt),
    name: 'Admin',
    role: (await RoleModel.findOne({name: 'Admin'}))._id,
  })

  await UserModel.create({
    username: "MktManager",
    password: await bcrypt.hash(password, salt),
    name: 'MktManager',
    role: (await RoleModel.findOne({name: 'MktManager'}))._id,
  })

  roles.forEach(async role => await RoleModel.create({ name: role }))
  categories.forEach(async category => await CategoryModel.create({ name: category }))

  faculties.forEach(async faculty => {
    await FacultyModel.create({ name: faculty })
    var facultyId = (await FacultyModel.findOne({ name: faculty }))._id
    for (const role of roles) {
      var roleId = (await RoleModel.findOne({ name: role }))._id
      await UserModel.create({
        username: role + faculty,
        email: "itszombie2016@gmail.com",
        password: await bcrypt.hash(password, salt),
        name: role + faculty,
        faculty: facultyId,
        role: roleId,
      })
    }
  })

}

//Body parser
var bodyParser = require('body-parser');
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