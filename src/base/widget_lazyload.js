define('o2widgetLazyload', function(require, exports, module) {
	'use strict';
	return function(options) {
		var conf = {
			cls: 'o2data-lazyload',
			scrollEvent: 'scroll.lazydata resize.lazydata'
		};
		/**
		 * @desc o2JSConfig 异步模板配置
		 *
		 */
		var o2JSConfig = window.pageConfig ? window.pageConfig.o2JSConfig : {};
		o2JSConfig = o2JSConfig || {};
		$.extend(conf, options);
		var isIE = !!window.ActiveXObject || navigator.userAgent.indexOf("Trident") > 0;
		//本地存储库
		var store = require('store');
    var renderFloorCount = 0;
    var preloadOffset = isIE ? 1000 : 500;
		var init = function() {
			var scrollTimer = null;
			$(window).bind(conf.scrollEvent, function(e) {
				clearTimeout(scrollTimer);
				scrollTimer = setTimeout(function() {
					/**
					 * @desc preloadOffset 可视区域阈值，用作提前渲染楼层
					 *
					 */
					var st = $(document).scrollTop(),
						wh = $(window).height() + preloadOffset,
						cls = conf.cls,
						$items = $('.' + cls);

					$items.each(function() {
						var self = $(this),
							rel = self.data('rel') || this,
							item = $(rel),
							forceRender = typeof self.data('forcerender') === 'boolean' ? self.data('forcerender') : false;
						/**
						 * @desc 可视区域渲染模板，根据tplVersion从localstorage读取模板，IE浏览器直接异步加载。
						 * data-tpl {string} 模板ID
						 * data-async {boolean} 是否同步渲染，即渲染模板前进行 beforerender 事件处理，回调后再渲染模板
						 * data-forcerender {boolean} 强制渲染，用作某些需要直接渲染的楼层
						 * data-rel {string|object} 参考渲染对象，默认是本身
						 */

						//判断是否是在可视区域 || 是否强制渲染
						if (forceRender
              || (item.offset().top - (st + wh) < 0 
              && item.offset().top + item.outerHeight(true) >= st)) {
							  renderFloorCore(self);
                renderFloorCount++;
                if (renderFloorCount === 1) {
                  setTimeout(function () {
                    renderFloorListForce();
                  }, 2000);
                }
						}
					});

					if (0 === $items.length) {
						$(window).unbind(conf.scrollEvent);
					}
				}, 200);
			}).trigger(conf.scrollEvent.split(' ')[0]);
		};

    /**
		 * @desc 渲染单个楼层逻辑
     * @param dom {Object} - jQuery对象
		 */
    var renderFloorCore = function ($floorItem) {
      var tplId = $floorItem.data('tpl');
      var content = $floorItem.html();
      var dataAsync = typeof $floorItem.data('async') === 'boolean' ? $floorItem.data('async') : false;

      if (tplId && o2JSConfig.pathRule) {
        var tplPath = o2JSConfig.pathRule(tplId);
        if (isIE || !store.enabled) {
          seajs.use(tplPath, function(result) {
            triggerRender($floorItem, content, dataAsync, result);
          });
        } else {
          var tplStorage = store.get(tplPath);
          if (!tplStorage || tplStorage.version !== window.tplVersion[tplId]) {
            seajs.use(tplPath, function(result) {
              store.set(tplPath, result);
              triggerRender($floorItem, content, dataAsync, result);
            });
          } else {
            triggerRender($floorItem, content, dataAsync, tplStorage);
          }
        }
      } else {
        triggerRender($floorItem, content, dataAsync, '');
      }
    };

    /**
		 * @desc 强制加载剩余楼层
		 */
    var renderFloorListForce = function () {
      var cls = conf.cls;
		  var $items = $('.' + cls);
      $items.each(function() {
        var self = $(this);
        var st = $(document).scrollTop();
				var wh = $(window).height() + preloadOffset;
        var rel = self.data('rel') || this;
			  var item = $(rel);
        var forceRender = typeof self.data('forcerender') === 'boolean' ? self.data('forcerender') : false;
        if (!forceRender 
            && ((item.offset().top - (st + wh) >= 0 
            || item.offset().top + item.outerHeight(true) < st))) {
          setTimeout($.proxy(renderFloorCore, this, self), 100);
          self.bind('done', function () {
            self.trigger('renderImage', self.attr('id'));
          });
        }
      });
    };

		/**
		 * @desc 触发渲染
		 * @param dom {Object} - jQuery对象
		 * @param content {String} - html内容
		 * @param async {Boolean} - 是否异步渲染
		 * @param tpl {Object|String} - 本地存储模板对象
		 */
		var triggerRender = function(dom, content, async, tpl) {
			if (async) {
				dom.html(content).removeClass(conf.cls).trigger('beforerender', function() {
					dom.removeClass('lazy-fn').trigger('render', tpl);
				});
			} else {
				dom.html(content).removeClass(conf.cls).removeClass('lazy-fn').trigger('render', tpl);
			}
		};

		init();
	};
});