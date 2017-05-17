/* initialize modules */
var express = require('express'),// express
  path = require('path'),
  //mongoose = require('mongoose'), //mongo connection
  bodyParser = require('body-parser'), //parses information from POST
  cookieParser = require('cookie-parser'), //cookie parser
  moment = require('moment'),// date formatter
  app = express(); // app server

var shortid = require('shortid'); // short id generator

/* set body paser of POST */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
/* set static resources folder */
app.use(express.static(path.join(__dirname, 'public')));
/* set app cookie parser */
app.use(cookieParser());
/*
 * logger of request
 * @parm req request
 * @param res response
 * @param next next middleware function
 */
var logger = function (req, res, next) {
  var reqTime = moment().format("YYYY-MM-DD HH:mm:ss");
  // get cookies
  var cookies = req.cookies;
  // get session id
  var sessionID = cookies.sessionID == void 0 ? "unauth session " : cookies.sessionID;
  console.log('LOGGED-[' + reqTime + "]-[" + sessionID + "]-[" + req.method  + "]-"+ req.originalUrl);
  next();
};

/* use logger for APP */
app.use(logger);

/* router for session id */
app.get('/session', function (req, res) {
  var now = Date.now();
  var id = shortid.generate();
  // TODO assemble id of session by current time milliseconds and shortid
  res.json({
    "id" : id,
    "timestamp":now
  });
});

/* router for QA pairs */
var qa = require('./qas');
app.use('/qa', qa);

app.listen(8089);
