/**
* @fileoverview 处理seajs
* @author  liweitao
*/

'use strict';

var through2 = require('through2');
var path = require('path');
var _ = require('lodash');
var Util = require('./util');

function process (opts) {
  var config = _.assign({
    cdn: ''
  }, opts);

  var stream = through2.obj(function (file, encoding, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }
    if (file.isBuffer()) {
      var content = file.contents.toString();
      var cdn = config.cdn;
      var baseDir = config.baseDir;
      var dependenceArray = [];
      content = content.replace(/\/\*([\S\s]*?)\*\//gm, '');
      var arr = content.match(/require\s*\(\s*("|')(.*?)("|')\s*\)/gmi);
      if (arr) {
        for (var i = 0; i < arr.length; i++) {
          var temp = arr[i].match(/require\((.*?)\)/);
          if (temp) {
            temp[1] = temp[1].replace(/'|"/g, '');
            var match = temp[1];
            //无.js缀和不含有.css的url加.js
            if (!(/\.js$/i.test(match)) && !/\.css/i.test(match)) {
              match += '.js';
            }

            if (cdn && !Util.regexps.url.test(match)) {
              match = cdn + Util.urlJoin(baseDir, path.basename(match, path.extname(match)), match);
            }
            
            content = content.replace(arr[i], 'require("' + match + '")');
            dependenceArray.push('"' + match + '"');
          }
        }
      }
      dependenceArray = dependenceArray.join(',');

      if (/define\((.*)function/gm.exec(content)) {
        var fPath = file.path;
        var filename = path.basename(fPath);
        var cname = fPath.replace(config.prefixDir, '');
        
        filename = cdn + Util.urlJoin(baseDir, cname);
        if (dependenceArray.length == 0) {
          dependenceArray = '';
        }
        content = content.replace(/define\((.*)function/gm, 'define("' + filename + '",[' + dependenceArray + '],function');
      }

      var hasSeajs = content.match(/seajs\.use\((.*?),\s*function/gim);
      if (hasSeajs) {
        var tempObj = {};
        for (var i = 0, j = hasSeajs.length; i < j; i++) {
          var t = hasSeajs[i].replace(/seajs.use\(|\[|\]|,function/gim, '');
          var t1 = t.split(',');
          if (t1) {
            for (var m = 0; m < t1.length; m++) {
              var t2 = t1[m].replace(/[\"\'\s]/g, '');
              var t3 = t2.replace(baseDir, '');
              if (!Util.regexps.url.test(t2)) {
                if (/^\//.test(t2)) {
                  if (cdn) {
                    tempObj[t2] = cdn + '/' + '' + t3;
                  } else {
                    tempObj[t2] = '' + t3;
                  }

                } else if (!/^\.\//.test(t2) && !/^\.\.\//.test(t2)) {
                  if (cdn) {
                    tempObj[t2] = cdn + '/' + t3;
                  } else {
                    tempObj[t2] = t3;
                  }
                }
              }
            }
          }
        }
        for (var i in tempObj) {
          var reg = new RegExp('["\']' + i + '["\']', 'gim');
          content = content.replace(reg, '"' + tempObj[i] + '"');
        }
      }
      file.contents = new Buffer(content);
      this.push(file);
      callback();
    } else if (file.isStream()){
      return callback(null, file);
    }
  });
  return stream;
}

module.exports = process;