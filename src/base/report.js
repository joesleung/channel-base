/**
 * @author wuwenwei
 * @date 2016-10-27
 * @desc 上报
 */
(function () {
  'use strict';

  var Report = {
    getDownloadSpeed: function () {
      try {
        var timing = (window.performance || window.webkitPerformance || {}).timing;
        if (timing) {
          var pagebytes = $('html').html().length;
          var bytes = pagebytes / 1024;
          var duration = performance.timing.responseEnd - performance.timing.requestStart;

          return Math.round((bytes * 0.25) / (duration / 1000));
        }
      } catch (e) {}

      return 0;
    },

    getRank: function () {
      var speed = this.getDownloadSpeed();
      if (speed < 25) {
        return 31;
      } else if (speed < 50) {
        return 32;
      } else if (speed < 75) {
        return 33;
      } else if (speed < 100) {
        return 34;
      } else if (speed < 150) {
        return 35;
      } else if (speed < 200) {
        return 36;
      } else if (speed < 250) {
        return 37;
      } else if (speed < 300) {
        return 38;
      } else if (speed < 350) {
        return 39;
      } else if (speed < 400) {
        return 40;
      } else if (speed < 450) {
        return 41;
      } else if (speed < 500) {
        return 42;
      } else if (speed < 1000) {
        return 43;
      }

      return 44;
    },

    getSpeedInfo: function () {
      var rndNum = Math.floor(Math.random() * 100);
      var speed = this.getDownloadSpeed();
      var pageConfig = window.pageConfig || {};
      var ratio = pageConfig && pageConfig.O2_REPORT;

      if (ratio === void 0 || (typeof ratio !== 'number')) {
        ratio = 100;
      }

      if (ratio > 0 && rndNum >= 0 && rndNum <= ratio && speed > 0) { // 忽略速度为0
        return 's' + this.getRank() + '=' + speed;
      }

      return '';
    },

    // 获取屏幕分辨率
    getScreenRatio: function () {
      var width = window.screen.width;
      var height = window.screen.height;

      var data = {
        51: {
          width: 800,
          height: 600
        },
        52: {
          width: 960,
          height: 640
        },
        53: {
          width: 1024,
          height: 768
        },
        54: {
          width: 1136,
          height: 640
        },
        55: {
          width: 1152,
          height: 864
        },
        56: {
          width: 1280,
          height: 768
        },
        57: {
          width: 1280,
          height: 800
        },
        58: {
          width: 1280,
          height: 960
        },
        59: {
          width: 1280,
          height: 1024
        },
        60: {
          width: 1366,
          height: 768
        },
        61: {
          width: 1440,
          height: 900
        },
        62: {
          width: 1600,
          height: 1024
        },
        63: {
          width: 1600,
          height: 1200
        },
        64: {
          width: 1920,
          height: 1080
        },
        65: {
          width: 1920,
          height: 1200
        },
        66: {
          width: 2560,
          height: 1440
        },
        67: {
          width: 2560,
          height: 1600
        }
      }

      for (var key in data) {
        if (width === data[key].width && height === data[key].height) {
          return key;
        }
      }

      return 68;
    },

    // 获取浏览器型号
    getBrowser: function () {
      var Sys = {};
      var ua = navigator.userAgent.toLowerCase();
      var s;
      (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
      (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
      (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
      (s = ua.match(/metasr/)) ? Sys.sougou = true :
      (s = ua.match(/qqbrowser/)) ? Sys.qq = true :
      (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] :
      (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
      (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
      (s = ua.match(/ipad/)) ? Sys.ipad = true : 0;

      if (Sys.chrome) {
        return 11;
      }

      if (Sys.firefox) {
        return 12;
      }

      if (Sys.safari) {
        return 13;
      }

      if (Sys.opera) {
        return 14;
      }

      if (Sys.ie) {
        if (Sys.ie === '6.0') {
          return 15;
        }

        if (Sys.ie === '7.0') {
          return 16;
        }

        if (Sys.ie === '8.0') {
          return 17;
        }

        if (Sys.ie === '9.0') {
          return 18;
        }

        if (Sys.ie === '10.0') {
          return 19;
        }

        if (Sys.ie === '11.0') {
          return 20;
        }

        return 21;
      }

      if (Sys.sougou) {
        return 22;
      }

      if (Sys.qq) {
        return 23;
      }

      if (Sys.ipad) {
        return 24;
      }

      return 25;
    },

    // 获取基础数据：css加载完毕、首屏DOM加载、js加载完毕、dom加载完成
    getBaseData: function() {
      var data = window['_REPORT_'];
      var start = data && data['START'];
      var str = [];

      if (data && start) {
        var css = data['CSS'];
        var fs = data['FS'];
        var js = data['JS'];
        var dom = data['DOM'];

        if (css) {
          str.push('s72=' + (css.getTime() - start.getTime()));
        }

        if (fs) {
          str.push('s73=' + (fs.getTime() - start.getTime()));
        }

        if (js) {
          str.push('s74=' + (js.getTime() - start.getTime()));
        }

        if (dom) {
          str.push('s75=' + (dom.getTime() - start.getTime()));
        }
      }

      return str.join('&');
    },

    getRetina: function() {
      if (window.devicePixelRatio > 1 || window.matchMedia && window.matchMedia('(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), (-o-min-device-pixel-ratio: 3/2), (min-device-pixel-ratio: 1.5), (min-resolution: 144dpi), (min-resolution: 1.5dppx)').matches) {
        return 's71=1';
      }

      return '';
    },

    processRetina: function () {
      var retina = this.getRetina();
      if (retina) {
        this.processCore(retina);
      }
    },

    // 获取详细操作系统
    getSystem: function () {
      var ua = navigator.userAgent.toLowerCase();

      if (ua.indexOf("macintosh") !== -1 || ua.indexOf("mac os x") !== -1) { // Mac
        return 6;
      }

      if (ua.indexOf("linux") !== -1) {
        return 7;
      }

      // windows全家桶
      var data = {
        'nt 5.1': 1,
        'nt 5.2': 1,
        'nt 6.0': 2,
        'nt 6.1': 3,
        'nt 6.2': 4,
        'nt 6.3': 4,
        'nt 6.4': 5,
        'nt 10.0': 5
      };

      for (var key in data) {
        if (ua.indexOf(key) !== -1) {
          return data[key];
        }
      }

      return 8;
    },

    _getErrorInfo: function (id) {
      // 上报速度
      // 上报操作系统
      // 上报浏览器
      var strArr = [];

      strArr.push('s' + this.getSystem() + '=1');
      strArr.push('s' + this.getBrowser() + '=1');

      var speed = this.getDownloadSpeed();

      if (speed > 0) { // 忽略速度为0
        strArr.push('s' + this.getRank() + '=' + speed);
      }

      strArr.push('s' + (50 + id) + '=1');

      return strArr.join('&');
    },

    // 兜底数据
    processBackup: function (id) {
      if (this.pBackupId) {
        this.processCore(this._getErrorInfo(id), this.pBackupId);
      }
    },

    // 上报隐藏楼层
    processHidedFloor: function (id) {
      if (this.pFloorId) {
        this.processCore(this._getErrorInfo(id), this.pFloorId);
      }
    },

    processSpeed: function () {
      var speedInfo = this.getSpeedInfo();

      if (speedInfo) { // 忽略速度为0
        this.processCore(speedInfo);
      }
    },

    // 上报基础数据：包含css、js、dom、首屏加载
    processBaseData: function() {
      var data = this.getBaseData();

      if (data) {
        this.processCore(data);
      }
    },

    // 上报所有基准数据：基础数据、分辨率、浏览器、测速、retina
    // 只上报一次
    _firstReport: false,
    processAllData: function () {
      if (this._firstReport) {
        return;
      }

      this._firstReport = true;

      var speedInfo = this.getSpeedInfo();
      var retina = this.getRetina();

      if (retina || speedInfo) {
        var base = this.getBaseData();
        var browser = this.getBrowser();
        var ratio = this.getScreenRatio();
        var system = this.getSystem();
        var strArr = [];

        strArr.push('s' + system + '=1');
        strArr.push('s' + browser + '=1');
        if (speedInfo) {
          strArr.push(speedInfo);
        }
        strArr.push('s' + ratio + '=1');

        if (retina) {
          strArr.push(retina);
        }

        if (base) {
          strArr.push(base);
        }
        this.processCore(strArr.join('&'));
      }
    },

    image: null,
    processCore: function (str, pid) {
      var id = pid || this.pid;
      this.image = new Image();
      this.image.src = '//fd.3.cn/cesu/r?pid=' + id + '&' + str + '&_=' + (new Date()).getTime();
    },

    /**
     * debug显示调试信息
     */
    debug: function (str) {
      if (typeof console.log !== 'undefined') {
        console.log(str);
      }
    },

    pid: 0,
    pFloorId: 0,
    pBackupId: 0,

    /**
     * 初始化
     * @param {Number} pid 基础页面信息
     * @param {Number} pBackupId 兜底请求信息
     * @param {Number} pFloorId 楼层隐藏信息信息
     */
    init: function (pid, pBackupId, pFloorId) {
      var self = this;
      if (!pid) {
        self.debug('pageId must be provided!');
        return;
      }

      self.pid = pid;
      self.pFloorId = pFloorId;
      self.pBackupId = pBackupId;

      window.onload = function () {
        self.processAllData();
      };
    }
  };

  if (typeof define === 'function' && (define.amd || define.cmd)) {
    define('report', function () {
      return Report;
    });
  } else {
    window.o2Report = Report;
  }
}());
