var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyparser = require('body-parser');
var session = require('express-session');
const flash = require("connect-flash");
const { check, validationResult } = require('express-validator');

//connect to db
// Mongodb config
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect(config.database, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('connection to mongoDB')
});

//init app
var app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

//body parser middelware
//parser application/x-www-form-urlencoded
app.use(bodyparser.urlencoded({ extended: false }));

//parse application/json
app.use(bodyparser.json());

//express sesssion middelware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
}));

app.use(flash());
app.use(function (req, res, next) {
    res.locals.errors = req.flash();
    next();
});

// Admin routes
app.use('/admin/pages', require('./routes/admin_pages'))
// var adminCategories=require('./routes/admin_categories.js');
app.use('/admin/categories', require('./routes/admin_categories.js'))
// Routes
app.get('/', function (req, res) {    
    //if error
    req.flash("msg", "Error Occured");
    res.locals.messages = req.flash();

    res.render('index', {
        title: 'Main page'
    });
});

app.get('/reg', function (req, res) {    
    res.render('register', {
        title: 'Register'
    });
});

//define router
app.post('/register', [
    check('email', 'email is required').isEmail(),
    check('name', 'name is required').not().isEmpty(),
    check('password', 'password is required').not().isEmpty(),
], function (req, res, next) {
    //check validate data
    const result = validationResult(req);
    let errors = result.errors;  
    for (let key in errors) {
        console.log(errors[key].value);
    }
    if (!result.isEmpty()) {
        //response validate data to register.ejs
       
        res.render('register', {
            errors: errors,
            title: 'Register'
        })
    } else{
        res.json(req.body);
    }
});


//start the server
var port = 3000;
app.listen(port, function () {
    console.log('listening started' + port);
});

