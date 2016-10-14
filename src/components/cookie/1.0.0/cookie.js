define('cookie', function () {
  'use strict';

  /**
   * @description cookie的存操作
   * @param {String} key - cookie的key
   * @param {String} value - cookie中key对应的值
   * @param {Number} [expires] - 过期时间
   * @param {String} [path] - 设置cookie的path
   * @param {String} [domain] - 设置cookie的domain
   * @param {Boolean} [secure] - 设置cookie是否只在安全连接https下起作用
   */
  function setCookie (key, value, expires, path, domain, secure) {
    if (arguments.length <= 1) {
      throw new Error('Parameters can not be less than 1');
    }
    if (expires) {
      var date = null;
      if (typeof expires === 'number') {
        date = new Date();
        date.setTime(date.getTime() + expires);
      } else if (expires.toUTCString) {
        date = expires;
      }
      if (typeof expires === 'string') {
        secure = domain;
        domain = path;
        path = expires;
      } else {
        expires = '; expires=' + date.toUTCString();
      }
    }

    if (!expires) {
      expires = undefined;
    }
    path = path ? '; path=' + path : '; path=/';
    domain = domain ? '; domain=' + domain : '';
    secure = secure ? '; secure' : '';
    /** 使用数组join方法可以避开undefined或null的情况 */
    document.cookie = [key, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
  }

  /**
   * @description cookie的取操作
   * @param {String} key - cookie的key
   * @return {String} cookie
   */
  function getCookie (key) {
    if (typeof key === 'string') {
      var arr = document.cookie.match(new RegExp('(^| )' + key + '=([^;]*)(;|$)'));
      if (arr) {
        return decodeURIComponent(arr[2]);
      }
    }
    return false;
  }

  /**
   * @description 删除某一cookie
   * @param {String} key - cookie的key
   * @return {Boolean} 是否成功
   */
  function deleteCookie (key) {
    if (getCookie(key) !== null) {
      setCookie(key, null, -1);
      return true;
    }
    return false;
  }

  return {
    get: getCookie,
    set: setCookie,
    delete: deleteCookie
  };
});