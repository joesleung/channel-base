/**
 * @description util组件，辅助性
 * @module util
 * @author liweitao
 */

define('util', function() {
  'use strict';

  return {
    /**
     * 频率控制 返回函数连续调用时，func 执行频率限定为 次 / wait
     * 
     * @param {Function} func - 传入函数
     * @param {Number} wait - 表示时间窗口的间隔
     * @param {Object} options - 如果想忽略开始边界上的调用，传入{leading: false}
     *                           如果想忽略结尾边界上的调用，传入{trailing: false}
     * @return {Function} - 返回客户调用函数
     */
    throttle: function(func, wait, options) {
      var context, args, result;
      var timeout = null;
      // 上次执行时间点
      var previous = 0;
      if (!options) options = {};
      // 延迟执行函数
      var later = function() {
        // 若设定了开始边界不执行选项，上次执行时间始终为0
        previous = options.leading === false ? 0 : new Date().getTime();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      };
      return function() {
        var now = new Date().getTime();
        // 首次执行时，如果设定了开始边界不执行选项，将上次执行时间设定为当前时间。
        if (!previous && options.leading === false) previous = now;
        // 延迟执行时间间隔
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        // 延迟时间间隔remaining小于等于0，表示上次执行至此所间隔时间已经超过一个时间窗口
        // remaining大于时间窗口wait，表示客户端系统时间被调整过
        if (remaining <= 0 || remaining > wait) {
          clearTimeout(timeout);
          timeout = null;
          previous = now;
          result = func.apply(context, args);
          if (!timeout) context = args = null;
          //如果延迟执行不存在，且没有设定结尾边界不执行选项
        } else if (!timeout && options.trailing !== false) {
          timeout = setTimeout(later, remaining);
        }
        return result;
      };
    },

    /**
     * 空闲控制 返回函数连续调用时，空闲时间必须大于或等于 wait，func 才会执行
     *
     * @param {Function} func - 传入函数
     * @param {Number} wait - 表示时间窗口的间隔
     * @param {Boolean} immediate - 设置为ture时，调用触发于开始边界而不是结束边界
     * @return {Function} - 返回客户调用函数
     */
    debounce: function(func, wait, immediate) {
      var timeout, args, context, timestamp, result;

      var later = function() {
        // 据上一次触发时间间隔
        var last = new Date().getTime() - timestamp;

        // 上次被包装函数被调用时间间隔last小于设定时间间隔wait
        if (last < wait && last > 0) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
          if (!immediate) {
            result = func.apply(context, args);
            if (!timeout) context = args = null;
          }
        }
      };

      return function() {
        context = this;
        args = arguments;
        timestamp = new Date().getTime();
        var callNow = immediate && !timeout;
        // 如果延时不存在，重新设定延时
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
          result = func.apply(context, args);
          context = args = null;
        }

        return result;
      };
    },

    /**
     * 数组indexOf
     *
     * @param {Array} arr - 传入数组
     * @param {Number|String} el - 查找的元素
     * @return {Number} - 返回元素索引，没找到返回-1
     */
    indexOf: function(arr, el) {
      var len = arr.length;
      var fromIndex = Number(arguments[2]) || 0;
      if (fromIndex < 0) {
        fromIndex += len;
      }
      while (fromIndex < len) {
        if (fromIndex in arr && arr[fromIndex] === el) {
          return fromIndex;
        }
        fromIndex++;
      }
      return -1;
    },

    /**
     * @description 获取日期
     *
     * @param {Date} date - 日期
     * @param {Number} day - 天数 （0：今天 | -1：昨天 | 1：明天）
     * @return {String} - 日期字符串
     */
    getCalendar: function(date, day) {
      if(!date instanceof Date) return;
      var m = date.getMonth() + 1;
      var y = date.getFullYear();
      var d = date.getDate() + (day || 0);

      if (d === 0) {
        m = m - 1;
        if (m === 0) {
          m = 12;
          y = y - 1;
        }
      }

      switch (m) {
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12:
          d = d === 0 ? 31 : d;
          if (d > 31) {
            m = m + 1;
            d = 1;
          }
          break;
        case 4:
        case 6:
        case 9:
        case 11:
          d = d === 0 ? 30 : d;
          if (d > 30) {
            m = m + 1;
            d = 1;
          }
          break;
        case 2:

          if (y % 4 == 0) {
            d = d === 0 ? 29 : d;
            if (d > 29) {
              m = m + 1;
              d = 1;
            }
          } else {
            d = d === 0 ? 28 : d;
            if (d > 28) {
              m = m + 1
              d = 1;
            }
          }
          break;
      }

      if (m > 12) m = 1, y = y + 1;

      return y + '/' + m + '/' + d;
    }


  };
});