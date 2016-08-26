/**
 * @description 倒计时组件，具体查看类{@link Countdown},<a href="./demo/components/countdown/index.html">Demo预览</a>
 * @module countdown
 * @author wangbaohui
 * @example
 * var today = new Date();
 * var morning = today;
 * var CountDown = require('CountDown');
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

define('countdown', function(require) {
  'use strict';

  var Countdown = _.Class.extend( /** @lends Countdown.prototype */ {

    /**
     * countdown.
     * @constructor
     * @alias Countdown
     * @param {Object} options
     * @param {String} options.startTime - 开始时间 (必填)
     * @param {Number} options.endTime - 结束时间 (必填)
     * @param {Number} [options.state=1] - 默认状态 
     * @param {Number} [options.autoStart=true] - 是否自动运行
     * @param {Number} [options.stateMap] - 倒计时状态
     * @param {Function} [options.stateCallback] 倒计时回调
     */
    construct: function(options) {
      var def = {
        startTime: new Date(), //开始时间
        endTime: new Date(), //结束时间
        state: 1, //当前状态
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
    init: function() {
      this.start();
    },

     /**
      * @description 开始
      */
    start: function() {
      this.timer = setInterval($.proxy(this.update, this), 1000);
    },

     /**
      * @description 暂停
      */
    pause: function() {
      this.timer && clearInterval(this.timer);
    },

     /**
      * @description 更新
      */
    update: function() {
      var now = +new Date; //当前时间
      var st = new Date(this.startTime).getTime();
      var et = new Date(this.endTime).getTime();

      if (st > now) {
        //预告
        this.state = 1;
      }
      if (et < now) {
        //已结束
        this.state = 0;
        this.pause();
      }
      if (now > st && now < et) {
        //进行中
        this.state = 2;
      }

      var rt = this.state == 2 ? et - now : st - now;
      var hour = this.pad(Math.floor((rt / (1000 * 60 * 60)) % 24), 2);
      var minute = this.pad(Math.floor((rt / 1000 / 60) % 60), 2);
      var second = this.pad(Math.floor((rt / 1000) % 60), 2);
      var day = this.pad(Math.floor(rt / (1000 * 60 * 60 * 24)), 2);
      var data = {
        hour: hour,
        minute: minute,
        second: second,
        day: day,
        state: this.state,
        current: this.stateMap[this.state]
      }
      this.stateCallback && this.stateCallback(data);
    },
    pad: function(value, n) {
      return (Array(n).join(0) + value).slice(-n);
    }
  });

  return Countdown;
});