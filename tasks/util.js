var fs = require('fs');

var Util = {
  regexps: {
    // 空格
    blank: /(^\s+)|(\s+$)/g,
    // 注释
    comment: /(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm,
    // 图片
    images: /\.(jpeg|jpg|gif|png|webp)(\?[\s\S]*)?/,
    // url
    url: /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i,
    // media
    media: /\.(jpeg|jpg|gif|png|webp|ico|mp3|mp4|oog|wav|eot|svg|ttf|woff)/,
    tpl: /\.(html|php|vm)/,
    js: /\.(js)/,
    css: /\.(css)/,
    singleBraceInterpolate: /{([\s\S]+?)}/g,
    doubleBraceInterpolate: /{{([\s\S]+?)}}/g,
    htmlTag: /(<([^>]+)>)/ig
  },

  urlJoin: function () {
    function normalize(str) {
      return str
        .replace(/([\/]+)/g, '/')
        .replace(/\/\?(?!\?)/g, '?')
        .replace(/\/\#/g, '#')
        .replace(/\:\//g, '://');
    }

    var joined = [].slice.call(arguments, 0).join('/');
    return normalize(joined);
  },
  existsSync: function (fPath) {
    try {
      var stats = fs.statSync(fPath);
      return (stats.isFile() || stats.isDirectory());
    } catch (err) {
      return false;
    }
  },

  // 降版本号分割成可比较的数组
  splitVersion: function (version) {
    version = version.replace(/(\d+)([^\d\.]+)/, '$1.$2');
    version = version.replace(/([^\d\.]+)(\d+)/, '$1.$2');
    var parts = version.split('.');
    var rmap = {
      'rc': -1,
      'pre': -2,
      'beta': -3,
      'b': -3,
      'alpha': -4,
      'a': -4
    };
    var v, n;
    var splits = [];
    for (var i = 0; i < parts.length; ++i) {
      v = parts[i];
      n = parseInt(v, 10);
      if (isNaN(n)) {
        n = rmap[v] || -1;
      }
      splits.push(n);
    }
    return splits;
  },

  compareVersion: function (version1, version2) {
    version1 = this.splitVersion(version1);
    version2 = this.splitVersion(version2);
    var v1, v2;
    for (var i = 0; i < Math.max(version1.length, version2.length); ++i) {
      v1 = version1[i] || 0;
      v2 = version2[i] || 0;
      if (v2 > v1) {
        return 1;
      }
      if (v1 > v2) {
        return -1;
      }
    }
    return 0;
  }
};

module.exports = Util;