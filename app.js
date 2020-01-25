var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyparser = require('body-parser');
var session = require('express-session');
// var expressValidator = require('express-validator');
const { check, validationResult } = require('express-validator');
//connect to db
mongoose.connect(config.database);
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
app.get('/', function (req, res) {
    //res.send('working');
    res.render('index', {
        title: 'HOME'
    });
});

//body parser middelware
//parser application/x-www-form-urlencoded
app.use(bodyparser.urlencoded({ extended: false }));

//parse application/json
app.use(bodyparser.json());

//express sesssion middelware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

//express validator middelwave
// app.use(expressValidator({
//     errorFormatter: function(param, msg, value) {
//         var namespace = param.split('.')
//         , root    = namespace.shift()
//         , formParam = root;
  
//       while(namespace.length) {
//         formParam += '[' + namespace.shift() + ']';
//       }
//       return {
//         param : formParam,
//         msg   : msg,
//         value : value
//       };
//     }
//   }));

//express messages middelware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages'), (req, res);
    next();
});
//start the server
var port = 3000;
app.listen(port, function () {
    console.log('listening started' + port);
});

