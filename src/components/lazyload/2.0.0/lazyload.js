define('o2lazyload', function () {
  'use strict';
  (function (window, $) {
    var $window = $(window),
      _height = $window.height(),
      _scrollTop = $window.scrollTop(),
      _event = new _.Events();

    var _getWindowHeight = (function () {
      if (window.innerHeight)
        return function () {
          return window.innerHeight;
        };
      return function () {
        return $window.height();
      };
    })();

    _.eventCenter.on('lazyload:DOMUpdate', function ($el) {
      _height = _getWindowHeight();
      _event.trigger('lazyload:load', $el);
    });

    $window.bind('scroll.o2-lazyload', function (e) {
      _scrollTop = $window.scrollTop();
      _event.trigger('lazyload:load');
    });
    $window.bind('resize.o2-lazyload', function (e) {
      _height = _getWindowHeight();
      _scrollTop = $window.scrollTop();
      _event.trigger('lazyload:load');
    });

    var Util = {
      setCookie: function (name, value, expireMonth, domain) { //设置cookie
        if (!domain) {
          domain = location.hostname;
        }
        if (arguments.length > 2) {
          var expireTime = new Date(new Date().getTime() + parseInt(expireMonth * 60 * 60 * 24 * 30 * 1000));
          document.cookie = name + "=" + escape(value) + "; path=/; domain=" + domain + "; expires=" + expireTime.toGMTString();
        } else {
          document.cookie = name + "=" + escape(value) + "; path=/; domain=" + domain;
        }
      },
      getCookie: function (name) { //获取cookie
        try {
          return (document.cookie.match(new RegExp("(^" + name + "| " + name + ")=([^;]*)")) == null) ? "" : decodeURIComponent(RegExp.$2);
        } catch (e) {
          return (document.cookie.match(new RegExp("(^" + name + "| " + name + ")=([^;]*)")) == null) ? "" : RegExp.$2;
        }
      },
      getUrlParams: function (key) { //获取URL参数
        var query = location.search;
        var reg = "/^.*[\\?|\\&]" + key + "\\=([^\\&]*)/";
        reg = eval(reg);
        var ret = query.match(reg);
        if (ret != null) {
          return decodeURIComponent(ret[1]);
        } else {
          return "";
        }
      },
      inviewport: (function () {
        var belowthefold = function (imginfo, threshold) {
          return _height + _scrollTop <= imginfo.top - threshold;
        };
        var abovethetop = function (imginfo, threshold) {
          return _scrollTop >= imginfo.top + threshold + imginfo.height;
        };
        return function (imginfo, threshold) {
          return !belowthefold(imginfo, threshold) && !abovethetop(imginfo, threshold);
        };
      })()
    };

    var Lazyload = function (opts) {
      this.$self = opts.$self;
      this.webpSupported = false;
      this.forceOpenWebP = false;
      this._loadTimer = null;
      this._imgInfo = [];
      this._loaded = {};
      this.settings = opts.settings;
    };
    Lazyload.prototype._setImg = function (img, $img, src) {
      $img.attr('src', src);
      img.onload = null;
    };
    Lazyload.prototype._loadImg = function (imgInfo) {
      var $img = imgInfo.$el;
      var imgSrc = imgInfo.src;
      var imgLoadedSrc = imgSrc;
      var webpDisable = imgInfo.webpDisable;
      var that = this;
      if (imgInfo.loading) return;

      imgInfo.loading = true;
      var img = new Image(),
        processed = false;

      if (this.webpSupported && this.settings.webpReg.test(imgSrc) && (webpDisable !== this.settings.webpDisableValue) || this.forceOpenWebP) {
        imgLoadedSrc = imgSrc + '!q' + this.settings.webpQuality + this.settings.webpSuffix;
      }

      img.onload = function () {
        processed = true;
        imgInfo.loading = false;
        imgInfo.done = true;
        $img.attr(that.settings.source, 'done');
        that._setImg(img, $img, imgLoadedSrc);
      };
      img.onerror = function () {
        imgInfo.webpDisable = 'no';
        imgInfo.loading = false;
      };
      img.src = imgLoadedSrc;
      if (img.complete == true && !processed) {
        processed = true;
        imgInfo.loading = false;
        imgInfo.done = true;
        $img.attr(that.settings.source, 'done');
        this._setImg(img, $img, imgLoadedSrc);
      }
    };
    Lazyload.prototype._loadImgs = function () {
      var len = this._imgInfo.length,
        that = this;

      $.each(this._imgInfo, function (k, v, arr) {
        var $item = v.$el;
        if (v.done || !Util.inviewport(v, that.settings.threshold)) return;
        if (!v.src) {
          $item.attr('src', that.settings.placeholder);
        }
        that._loadImg(v);
      });
      while (len--) {
        if (this._imgInfo[len].done == true)
          this._imgInfo.splice(len, 1);
      }
    };
    Lazyload.prototype._update = function () {
      clearTimeout(this._loadTimer);
      this._loadTimer = setTimeout($.proxy(this._loadImgs, this), this.settings.delay);
    };
    Lazyload.prototype._refreshDOMEl = function ($el) {
      if ($el.attr('data-inlazyqueue') == true) return;
      $el.attr('data-inlazyqueue', true);
      var that = this;
      $('img', $el).each(function (k, v) {
        var $el = $(v),
          src = $el.attr(that.settings.source);
        if (!src || src == 'done') return;
        that._imgInfo.push({
          $el: $el,
          src: src,
          done: false,
          top: $el.offset().top,
          height: $el.height(),
          loading: false,
          webpDisable: $el.attr(that.settings.webpDisableKey)
        });
      });
    };
    Lazyload.prototype._refreshDOMPos = function ($el) {
      $.each(this._imgInfo, function (k, v, arr) {
        arr[k].top = $el.offset().top;
        arr[k].height = $el.height();
      });
    };
    Lazyload.prototype._initEvent = function () {
      $(document).ready($.proxy(this._update, this));
      // 刷新元素数组
      _.eventCenter.on('lazyload:DOMUpdate', $.proxy(this._refreshDOMEl, this));
      _event.on('lazyload:load', $.proxy(this._update, this));

    };
    Lazyload.prototype._isInit = function () { //防止同一元素重复初始化
      if (this.$self.attr(this.settings.source + '-install') === '1') {
        return true;
      }
      this.$self.attr(this.settings.source + '-install', '1');
      return false;
    };
    Lazyload.prototype.init = function (webpSupported) {
      if (!this._isInit()) {
        var forceOpenWebP = Util.getUrlParams(this.settings.forceOpenOrCloseWebP);
        this.webpSupported = webpSupported;
        if (forceOpenWebP === '1') {
          this.forceOpenWebP = true;
        }
        this._initEvent();
      }
    };

    $.fn.o2lazyload = function (options) {
      var self = this,
        $self = $(self),
        settings;

      settings = $.extend({
        threshold: 200, //视野距离，用于在视野多宽内加载图片
        delay: 100, //节流器定时
        source: 'data-lazy-img', //懒加载字段
        supportWebp: true, //是否开启webp，默认开启
        cacheSupportWebp: true, //是否用cookie存储webp支持情况，默认开启
        cacheSupportWebpKey: 'o2-webp', //开启cookie保存webp支持情况下使用的key
        webpReg: /\/\/img\d+.360buyimg.com\/.+\.(jpg|png)$/, // 需要替换成webp的图片正则
        webpSuffix: '.webp', //webp图片后缀
        webpQuality: 80, //webp图片质量
        webpDisableKey: 'data-webp', //图片开启开关
        webpDisableValue: 'no', // 关闭webp图片替换
        forceOpenOrCloseWebP: 'o2-webp', // 强制开启或关闭webp，忽略webpDisableKey，0为关闭webp，1为开启webp
        placeholder: '//misc.360buyimg.com/lib/img/e/blank.gif' //src为空时 默认占位图
      }, options);

      var lazyload = new Lazyload({
        $self: $self,
        settings: settings
      });

      /**
       * 判断是否支持webp
       * @param  {Function} callback
       */
      var checkWebp = function (callback) {
        if (Util.getUrlParams(settings.forceOpenOrCloseWebP) === '0') {
          callback(false);
          return;
        }
        if (!settings.supportWebp) {
          callback(false);
          return;
        }
        if (settings.cacheSupportWebp) {
          var isSupportWebp = Util.getCookie(settings.cacheSupportWebpKey);
          if (isSupportWebp !== '') {
            if (isSupportWebp === 'true' || isSupportWebp === true) {
              callback(true);
            } else {
              callback(false);
            }
            return;
          }
        };

        var img = new Image();
        img.onload = function () {
          var result = (img.width > 0) && (img.height > 0);
          callback(result);
          if (settings.cacheSupportWebp) {
            Util.setCookie(settings.cacheSupportWebpKey, result, 1);
          }
        };
        img.onerror = function () {
          callback(false);
          if (settings.cacheSupportWebp) {
            Util.setCookie(settings.cacheSupportWebpKey, false, 1);
          }
        };
        img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA';
      };

      checkWebp(function (webpSupported) {
        lazyload.init(webpSupported);
      });

      return this;
    };
  })(window, jQuery);
});