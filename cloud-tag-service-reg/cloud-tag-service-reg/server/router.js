(function() {
  var express = require('express');
  var router = express.Router();
  var cloud_tag = require('./cloud-tag');
  var moment = require('moment');
  var md5 = require('md5');
  var request = require('superagent');
  const fs = require('fs');
  var exec = require('child_process').exec;

  router.use(function timeLog(req, res, next) {
    next();
  });

  router.get('/', (req, res) => {
    return res.send({'RetCode': -1, 'RetMsg': 'please use post and send form: data: [...], output: ...svg'});
  });

  router.post('/', (req, res) => {
    // console.log(req.query);
    console.log(req.body);


    if (!req.body.hasOwnProperty('data') || req.body.data === '') {
      return res.send({'RetCode': -1, 'RetMsg': ''});
    }
    if (!req.body.hasOwnProperty('output') || req.body.data === '') {
      return res.send({});
    }

    cloud_tag(req.body, (fname, src_path) => {
      sendFile(fname, src_path, (data) => {
        return res.send({data});
      })
    });
  });

  module.exports = router;

  function sendFile(filename, src_path, cb) {
    var date = new Date();
    var time = getCurTimeBySpecialFormat(date);
    var chk = getChk(date);
    var dest = `memory/musictag/`;
    var url = `http://192.168.1.127/UploadFile.php?time=${time}&chk=${chk}&path=${dest}`;
    console.log('sending files');

    var cmd = `curl -X POST -F "file=@${src_path}" '${url}'`;
    console.log(cmd);
    exec(cmd, function(error, stdout, stderr) {
      console.log(error, stdout);
      cb(stdout);
    });
    // console.log('/Users/yuhsianglin/Function/ask_shadow/cloud-tag-service/'+src_path+'/'+filename);
    // request
    //  .post(url)
    //  .attach('file', src_path+'/'+filename, {name:filename})
    //  .end((e, res) => {
    //    console.log(res);
    //  });

  }

  function getCurTimeBySpecialFormat(date) {
    return moment(date).format('YYYYMMDDHHmmss');
  }

  function getChk(date) {

    var formattedDate = moment(date).format('YYYYHHssMMDDmm');
    var hash = md5(formattedDate);
    var chk = hash[2] + hash[9] + hash[15] + hash[17];
    return chk;
  }

})()
