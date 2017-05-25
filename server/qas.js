/* router module for QA pairs */
var express = require('express'); // express
var router = express.Router(); // router for QA paris
var mongoose = require ("mongoose"); // mongoose driver
mongoose.Promise = require('bluebird'); // update Promise library
var Config = require('./config'),
    conf = new Config(); // configuration

// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.
var db_url = conf.MONGO_URI ||
  'mongodb://localhost/chatbots';
// database is ready
var dbIsReady = false;
// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(db_url, function (err, res) {
  if (err) {
      dbIsReady = false;
      console.log ('ERROR connecting to: ' + db_url + '. ' + err);
  } else {
      dbIsReady = true;
      console.log ('Succeeded connected to: ' + db_url);
  }
});

/* define data schema */
var qaSchema = new mongoose.Schema({
      session_id : { type: String, trim: true, index: true },
      sequence: { type: Number, min: 0 },
      user_question: {
        content: String,
        act: { type: String, trim: true },
        refined_act: { type: String, trim: true },
      },
      robot_answer: {
        content: String,
        refined_content:String,
        act: { type: String, trim: true },
        refined_act: { type: String, trim: true },
      },
      date: { type: Date, default: Date.now }
    });
 // get data modle
 var QAPair = mongoose.model('QuestionAnswerPair', qaSchema);

/* get the qa pair */
router.get('/', function(req, res) {
  // get cookie
  var cookies = req.cookies;
  // get session id from cookie or request parameter
  var sessionID = cookies.sessionID == void 0 ? req.query.session_id : cookies.sessionID;
  // if session id is provided
  if (sessionID) {
    // if database is ready
    if (dbIsReady) {
      // get sequence id for chat log
      var sequence = req.query.sequence;
      // if sequence is provied, then find one
      if(sequence){
        QAPair.findOne({
            'sequence':sequence,
            'session_id':sessionID
          }).exec(function(err, result) {
          if (!err) {
            // handle result
            if(result){
              var data = [];
              data.push(result);
              res.json({
                  "status":"OK",
                  "result":result
              });
            }else {
              res.json({
                "status":"OK",
                "msg":"no question and answer pair is found."
              });
            }
          } else {
            res.status(500).send(err);
          };
        });
      }else {
        QAPair.find({
            'session_id':sessionID
          }).exec(function(err, result) {
          if (!err) {
            // handle result
            if(result){
              res.json({
                  "status":"OK",
                  "result":result
              });
            }else {
              res.json({
                "status":"OK",
                "msg":"no question and answer pair is found."
              });
            }
          } else {
            res.status(500).send(err);
          };
        });
      }
    } else {
      // database is not ready
      res.status(500).send('Chat log database is not ready for use.');
    }
  }else {
    // session id is required
    res.status(401).send('Session id is required, input with cookie "sessionID" or url parameter "session_id"');
  }
});
/* post to create QA pair */
router.post('/', function(req, res) {
  // get cookie
  var cookies = req.cookies;
  // get session id from cookie or request body value
  var sessionID = cookies.sessionID == void 0 ? req.body.session_id : cookies.sessionID;
  // get sequence id from request body
  var sequence = req.body.sequence;
  // both session id and sequence id are required
  if (sessionID && sequence) {
    QAPair.findOne({
      'sequence':sequence,
      'session_id':sessionID
    }).exec(function(err, result) {
      if (!err) {
        // handle result if data exists
        if(result){
          res.json({
              "status":"Fail",
              "msg":"sessionID:" + sessionID + " sequence:" + sequence + " already exists."
          });
        }else {
          var qaPair = new QAPair(req.body);
          qaPair.save(function (err, qaPair) {
            if (err) {
              res.status(500).send(err);
            }
            // This qaPair is the same one we saved, but after Mongo
            // added its additional properties like _id.
            res.json({
              "status":"OK",
              "result":qaPair
            });
          });
        }
      } else {
        // error occurs in finding QAPair
        res.status(500).send(err);
      };
    });
  }else {
      // session id and sequence id are required
      res.status(401).send('Session id and sequence are required, input with cookie "sessionID" or body "session_id" "sequence"');
  }
});
/* put to updat QA pair */
router.put("/",function(req, res) {
  // get cookie
  var cookies = req.cookies;
  // get session id from cookie or request body value
  var sessionID = cookies.sessionID == void 0 ? req.body.session_id : cookies.sessionID;
  // get sequence id from request body
  var sequence = req.body.sequence;
  // both session id and sequence id are required
  if (sessionID && sequence) {
    QAPair.findOne({
      'sequence':sequence,
      'session_id':sessionID
    }).exec(function(err, result) {
      if (!err) {
      // handle result
        if(result){
          console.log(req.body);
          result.user_question.refined_act = req.body.user_question.refined_act || result.user_question.refined_act;
          result.robot_answer.refined_content = req.body.robot_answer.refined_content || result.robot_answer.refined_content;
          result.robot_answer.refined_act = req.body.robot_answer.refined_act || result.robot_answer.refined_act;
          // Save the updated document back to the database
          result.save(function (err, result) {
            if (err) {
                res.status(500).send(err)
            }
            // update succeeded
            res.json({
              "status":"OK",
              "result":result
            });
          });
        }else {
          res.json({
            "status":"Fail",
            "msg":"no question and answer pair is found."
          });
        }
      } else {
        // error occurs in finding QAPair
        res.status(500).send(err);
      };
    });
  }else {
      // session id and sequence id are required
      res.status(401).send('Session id and sequence are required, input with cookie "sessionID" or body "session_id" "sequence"');
  }
});
/* delete to delete QA pair in session  */
router.delete('/', function(req, res) {
  // get cookie
  var cookies = req.cookies;
  // get session id from cookie or request body value
  var sessionID = cookies.sessionID == void 0 ? req.body.session_id : cookies.sessionID;
  // get sequence id from request body
  var sequence = req.body.sequence;
  // both session id and sequence id are required
  if (sessionID) {
    // if sequence is provied, remove only one
    if (sequence) {
      QAPair.findOneAndRemove({
        'sequence':sequence,
        'session_id':sessionID
      }).exec(function(err, result){
        if (err) {
          res.status(500).send(err);
        }
        // data is removed
        res.json({
          "status":"OK"
        });
      });
    } else {
      // remove all session
      QAPair.find({
          'session_id':sessionID
        }).exec(function(err, result) {
        if (!err) {
          // handle result
          if(result){
            result.remove(function(err, result){
              if (err) {
                res.status(500).send(err);
              }
              res.json({
                  "status":"OK",
                  "msg": result.length + " documents have been removed!"
              });
            });
          }else {
            res.json({
              "status":"OK",
              "msg":"Nothing to be removed."
            });
          }
        } else {
          res.status(500).send(err);
        };
      });
    }
  }else {
    // session id and sequence id are required
    res.status(401).send('Session id and sequence are required, input with cookie "sessionID" or body "session_id" "sequence"');
  }
});
/* get all qa pairs */
router.get('/all', function(req, res) {
    // get cookie
    var cookies = req.cookies;
    // get session id from cookie or request parameter
    var sessionID = cookies.sessionID == void 0 ? req.query.session_id : cookies.sessionID;
    // if session id is provided
    if (sessionID) {
      // if database is ready
      if (dbIsReady) {
          QAPair.find({
              'session_id':sessionID
            }).exec(function(err, result) {
            if (!err) {
              // handle result
              if(result){
                res.json({
                    "status":"OK",
                    "result":result
                });
              }else {
                res.json({
                  "status":"OK",
                  "msg":"no question and answer pair is found."
                });
              }
            } else {
              res.status(500).send(err);
            };
          });
      } else {
        // database is not ready
        res.status(500).send('Chat log database is not ready for use.');
      }
    }else {
      // session id is required
      res.status(401).send('Session id is required, input with cookie "sessionID" or url parameter "session_id"');
    }
});

module.exports = router;
