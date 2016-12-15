/**
 * @description 倒计时组件，具体查看类{@link Countdown},<a href="./demo/components/countdown/index.html">Demo预览</a>
 * @module countdown
 * @author wangbaohui
 * @example
 * var CountDown = require('countdown');
 * var util = require('util');
 * var today = new Date();
 * var td = util.getCalendar(today, 0);
 * var h = today.getHours();
 * var start = td + ' 10:00:00',
 * var end = td + ' 14:00:00',

 *   var cd = new CountDown({
 *     startTime: start,
 *     endTime: end,
 *     stateCallback: function(data) {
 *       //根据状态设置界面
 *       switch (data.state) {
 *         case 0:
 *           //结束
 *           break;
 *         case 1:
 *           //未开始，预告
 *           break;
 *         case 2:
 *           //进行中
 *           break;

 *         default:
 *           break;
 *       }
 *     }
 * })
 */

define('countdown', function (require) {
  'use strict';

  var Countdown = _.Class.extend( /** @lends Countdown.prototype */ {

    /**
     * countdown.
     * @constructor
     * @alias Countdown
     * @param {Object} options
     * @param {String|Array} options.startTime - 开始时间 (必填)
     * @param {String|Array} options.endTime - 结束时间 (必填)
     * @param {Number} [options.interval=1000] - 默认间隔
     * @param {Number} [options.state=1] - 默认状态
     * @param {Number} [options.autoStart=true] - 是否自动运行
     * @param {Number} [options.stateMap= "{0: {name: '已结束'},1: {name: '未开始'},2: {name: '进行中'}}"] - 倒计时状态
     * @param {Function} [options.stateCallback=null] 倒计时回调
     */
    construct: function (options) {
      var def = {
        startTime: new Date(), //开始时间
        endTime: new Date(), //结束时间
        state: 1, //当前状态
        interval: 1000,//时间间隔
        stateCallback: null, //状态回调
        autoStart: true,
        stateMap: {
          0: {
            name: '已结束'
          },
          1: {
            name: '未开始'
          },
          2: {
            name: '进行中'
          }
        },
        timer: null //定时器

      }

      $.extend(this, def, options || {});
      this.autoStart && this.init();
    },

    /**
     * @description 初始化
     */
    init: function () {
      this.start();
    },

    /**
     * @description 开始
     */
    start: function () {
      this.update(+new Date - this.interval);
    },

    /**
     * @description 暂停
     */
    pause: function () {
      this.timer && clearTimeout(this.timer);
    },

    /**
     * @description 更新
     */
    update: function (ptime) {
      var now = +new Date; //当前时间
      var offset = now - ptime;
      var datas = [];
      var _this = this;
      var cfgst = this.startTime;
      var cfget = this.endTime;
      var interval = this.interval;
      var ot = interval + (interval - offset);
      if ('[object Array]' !== Object.prototype.toString.call(cfgst)) {
        cfgst = [cfgst];
        cfget = [cfget];
      }
      for (var i = 0, len = cfgst.length; i < len; i++) {
        var st = new Date(cfgst[i]).getTime();
        var et = new Date(cfget[i]).getTime();
        var state;
        if (st > now) {
          //预告
          state = 1;
        }
        if (et < now) {
          //已结束
          state = 0;
          //this.pause();
        }
        if (now > st && now < et) {
          //进行中
          state = 2;
        }

        var rt = state == 2 ? et - now : st - now;
        var hour = this.pad(Math.floor((rt / (1000 * 60 * 60)) % 24), 2);
        var minute = this.pad(Math.floor((rt / 1000 / 60) % 60), 2);
        var second = this.pad(Math.floor((rt / 1000) % 60), 2);
        var millisecond = this.pad(Math.floor((rt / 100) % 10), 1);
        var day = this.pad(Math.floor(rt / (1000 * 60 * 60 * 24)), 2);
        var data = {
          hour: hour,
          minute: minute,
          second: second,
          millisecond: millisecond,
          day: day,
          state: state,
          current: _this.stateMap[state]
        }
        datas.push(data);
      }
      this.stateCallback && this.stateCallback(datas.length === 1 ? datas[0] : datas);
      this.timer = setTimeout($.proxy(this.update, this, now), ot < 0 ? 0 : ot);
    },
    pad: function (value, n) {
      return (Array(n).join(0) + value).slice(-n);
    }
  });

  return Countdown;
});
