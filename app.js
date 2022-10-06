var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const passport = require('passport');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// passport
app.use(passport.initialize());
require('./auth');

app.set('trust proxy', 1)
app.use(session({
  secret: '12345',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: true
 }
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const db = require('./models');
db.sequelize.sync()
    .then(()=> {
        console.log("async db");
    })
    .catch((err)=> {
        console.log("error: "+ err.message);
    })

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
