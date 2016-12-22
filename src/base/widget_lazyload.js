define('o2widgetLazyload', function (require, exports, module) {
  'use strict';
  return function (options) {
    var conf = {
      cls: 'o2data-lazyload',
      defCls: ['lazy-fn', 'o2loading'],
      scrollEvent: 'scroll.lazydata resize.lazydata'
    };
    /**
     * @desc o2JSConfig 异步模板配置
     * @desc preloadOffset 可视区域阈值，用作提前渲染楼层
     *
     */
    var o2JSConfig = window.pageConfig ? window.pageConfig.o2JSConfig : {};
    o2JSConfig = o2JSConfig || {};
    window._o2ver = {}; //版本存储
    $.extend(conf, options);
    window.tplVersion = $.extend(window.o2tplVersion || {}, window.tplVersion);
    //本地存储库
    var store = require('store');
    var isIE = !!window.ActiveXObject || navigator.userAgent.indexOf("Trident") > 0;
    var isSupportLS = 'localStorage' in window && window['localStorage'] !== null;
    var preloadOffset = isIE ? 1000 : 500;
    var channelReady = false;
    var classes = conf.defCls.concat(conf.cls).join(' ');
    preloadOffset = o2JSConfig.preloadOffset ? o2JSConfig.preloadOffset : preloadOffset;
    var ieStorage = o2JSConfig.ieStorage ? o2JSConfig.ieStorage : false;
    var isStore = ieStorage && isSupportLS;
    var init = function () {
      var scrollTimer = null;
      _.eventCenter.trigger('channel:ready');
      $(window).bind(conf.scrollEvent, function (e) {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function () {
          detectRender();
        }, 200);
      }).trigger(conf.scrollEvent.split(' ')[0]);
    };
    var detectRender = function () {
        var st = $(document).scrollTop(),
          wh = $(window).height() + preloadOffset,
          cls = conf.cls,
          items = $('.' + cls);

        items.each(function () {
          var self = $(this),
            rel = self.data('rel') || this,
            item = $(rel),
            content = self.html(),
            tplId = self.data('tpl') || '',
            remoteTpl = self.data('remotetpl') || '',
            dataAsync = typeof self.data('async') === 'boolean' ? self.data('async') : false,
            forceRender = typeof self.data('forcerender') === 'boolean' ? self.data('forcerender') : false,
            tplPath = null;
          if(remoteTpl !== '') tplId = remoteTpl;
          if (self.hasClass('o2loading')) {
            return;
          }
          /**
           * @desc 可视区域渲染模板，根据tplVersion从localstorage读取模板，不支持本地存储的浏览器直接异步加载。
           * data-tpl {string} 模板ID
           * data-async {boolean} 是否同步渲染，即渲染模板前进行 beforerender 事件处理，回调后再渲染模板
           * data-forcerender {boolean} 强制渲染，用作某些需要直接渲染的楼层
           * data-rel {string|object} 参考渲染对象，默认是本身
           */

          //判断是否是在可视区域 || 是否强制渲染
          if (forceRender || (item.offset().top - (st + wh) < 0 && item.offset().top + item.outerHeight(true) >= st)) {
            if (tplId !== '' && o2JSConfig.pathRule) {
                if (/\.js/.test(tplId)) {
                  tplPath = tplId;
                  tplId = (tplPath.match(/\/(\w*)(\.min)?\.js/)[1] || '');
                } else {
                  tplPath = o2JSConfig.pathRule(tplId);
                }
              if ((!isStore && isIE) || !store.enabled) {
                triggerRender(self, content, dataAsync, '', loadTemplate(tplPath, false, self));
              } else {
                var tplStorage = store.get(tplPath);
                if (!tplStorage || !window.tplVersion || tplStorage.version !== window.tplVersion[tplId]) {
                  triggerRender(self, content, dataAsync, '', loadTemplate(tplPath, true, self));
                } else {
                  checkJsCss(self, tplStorage);
                  triggerRender(self, content, dataAsync, tplStorage);
                }
              }
            } else {
              triggerRender(self, content, dataAsync, '');
            }
          }
        });
      }
      /**
       * @desc 检查页面CSS,JS是否存在，不存在则动态添加
       * @param dom {object} DOM
       * @param result {object} 模板对象
       */
    var checkJsCss = function (dom, result) {
        if (typeof result === 'object') {
          if (!window._o2ver[result.version]) {
            result.style && $('head').append('<style>' + result.style + '</style>');
            result.script && $('head').append('<script>' + result.script + '</script>');
            window._o2ver[result.version] = result.version;
            dom.trigger('tplLoadDone', result);
            setTimeout(function () {
              detectRender();
            }, 200);
          }
        }
      }
      /**
       * @desc 加载模板方法
       * @param tplPath {string} 模板地址
       * @param isStore {boolean} 是否启用本地存储
       * @param dom {object} DOM
       * @return Deferred
       */
    var loadTemplate = function (tplPath, isStore, dom) {
        var dtd = $.Deferred();
        seajs.use(tplPath, function (result) {
          if (result) {
            isStore && store.set(tplPath, result);
            checkJsCss(dom, result);
            dtd.resolve(result);
          } else {
            dtd.reject();
          }
        });
        return dtd.promise();
      }
      /**
       * @desc 执行渲染逻辑
       * @param dom {Object} - jQuery对象
       * @param content {String} - html内容
       * @param tpl {Object|String} - 本地存储模板对象
       * @param dtd {Deferred}
       */
    var processRender = function (dom, content, tpl, dtd) {
        if (typeof dtd !== 'undefined') {
          $.when(dtd)
            .done(function (result) {
              dom.html(content).removeClass(classes).trigger('render', result);
            })
            .fail(function () {
              dom.trigger('tplLoadFail');
            });
        } else {
          dom.html(content).removeClass(classes).trigger('render', tpl);
        }
      }
      /**
       * @desc 触发渲染
       * @param dom {Object} - jQuery对象
       * @param content {String} - html内容
       * @param async {Boolean} - 是否异步渲染
       * @param tpl {Object|String} - 本地存储模板对象
       * @param dtd {Deferred}
       */
    var triggerRender = function (dom, content, async, tpl, dtd) {
      if (async) {
        if (dom.data('events') && dom.data('events')['beforerender']) {
          dom.html(content).addClass('o2loading').trigger('beforerender', function () {
            processRender(dom, content, tpl, dtd);
          });
        }
      } else {
        dom.addClass('o2loading') && processRender(dom, content, tpl, dtd);
      }
    }
    init();
    this.detectRender = detectRender
  };
});
