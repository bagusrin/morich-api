var express = require('express');

var logger = require('morgan');
var bodyParser = require('body-parser');
var admin = require('./app/routes/spiderman');
var user = require('./app/routes/user');
var auth = require('./app/routes/auth');
var member = require('./app/routes/member');
var video = require('./app/routes/video');
var videoadmin = require('./app/routes/videoadmin');
var general = require('./app/routes/general');
var chat = require('./app/routes/chat');
var connection = require('../config/db');
var jsonwebtoken = require("jsonwebtoken");
//var cors = require("cors");
var moment = require('moment-timezone');

moment().tz("Asia/Jakarta").format();

var app = express();

var publicDir = require('path').join(__dirname, '/../public');

connection.init();

app.use(logger('dev'));
//app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
    jsonwebtoken.verify(req.headers.authorization.split(' ')[1], 'RESTFULAPIs', function (err, decode) {

      if (err) req.user = undefined;

      req.user = decode;
      next();
    });
  } else {
    req.user = undefined;
    next();
  }
});

admin.configure(app);
user.configure(app);
auth.configure(app);
member.configure(app);
video.configure(app);
videoadmin.configure(app);
general.configure(app);
chat.configure(app);

app.use(express.static(publicDir));

//app.options('*', cors());


module.exports = app;
//# sourceMappingURL=app.js.map
