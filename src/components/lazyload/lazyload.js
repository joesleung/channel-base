define('o2lazyload', function () {
  'use strict';
	var $window = $(window);

	$.fn.o2lazyload = function(options) {
		var self = this;
		var $self = $(self);
		var settings = {
			threshold: 200, //视野距离，用于在视野多宽内加载图片
			delay: 100, //节流器定时
			container: window, //容器
			source: 'data-lazy-img', //懒加载字段
			supportWebp: true, //是否开启webp，默认开启
			cacheSupportWebp: true, //是否用cookie存储webp支持情况，默认开启
			cacheSupportWebpKey: 'o2-webp', //开启cookie保存webp支持情况下使用的key
			webpReg: /\/\/img\d+.360buyimg.com\/.+\.(jpg|png)$/,// 需要替换成webp的图片正则
			webpSuffix: '.webp', //webp图片后缀
			webpQuality: 80, //webp图片质量
			webpDisableKey: 'data-webp', //图片开启开关
			webpDisableValue: 'no', // 关闭webp图片替换
			forceOpenOrCloseWebP: 'o2-webp', // 强制开启或关闭webp，忽略webpDisableKey，0为关闭webp，1为开启webp
			placeholder: '//misc.360buyimg.com/lib/img/e/blank.gif' //src为空时 默认占位图
		};

		if (options) {
			$.extend(settings, options);
		}

		/**
		 * 判断是否在视野内
		 * @param  {string} dom
		 * @return {function}
		 */
		var inviewport = (function() {
		  var belowthefold = function(element) {
		    var fold;

		    if (settings.container === undefined || settings.container === window) {
		      fold = (window.innerHeight ? window.innerHeight : $window.height()) + $window.scrollTop();
		    } else {
		      fold = $(settings.container).offset().top + $(settings.container).height();
		    }

		    return fold <= $(element).offset().top - settings.threshold;
		  };

		  var rightoffold = function(element) {
		    var fold;

		  	if (settings.container === undefined || settings.container === window) {
		    	fold = $window.width() + $window.scrollLeft();
		  	} else {
		    	fold = $(settings.container).offset().left + $(settings.container).width();
		  	}

		    return fold <= $(element).offset().left - settings.threshold;
		  };

		  var abovethetop = function(element) {
		    var fold;

		    if (settings.container === undefined || settings.container === window) {
		      fold = $window.scrollTop();
		    } else {
		      fold = $(settings.container).offset().top;
		    }

		    return fold >= $(element).offset().top + settings.threshold  + $(element).height();
		  };

		  var leftofbegin = function(element) {
		    var fold;

		    if (settings.container === undefined || settings.container === window) {
		      fold = $window.scrollLeft();
		    } else {
		      fold = $(settings.container).offset().left;
		    }

		    return fold >= $(element).offset().left + settings.threshold + $(element).width();
		  };

		  return function(element) {
		    return !rightoffold(element) && !leftofbegin(element) && !belowthefold(element) && !abovethetop(element);
		  };

		}());

		var Lazyload = {
			$elements: [],
			webpSupported: false,
			forceOpenWebP: false,
			_setImg: function(img, $img, src) {
				$img.attr('src', src);
				img.onload = null;
			},
			_errorLoadImg: function(img, $img, imgSrc) {
				if (this.webpSupported && ($img.attr(settings.webpDisableKey) !== settings.webpDisableValue) || this.forceOpenWebP) {
					img.onload = $.proxy(function() {
						this._setImg(img, $img, imgSrc);
					}, this);
					img.src = imgSrc;
				}
				
				img.onerror = null;
			},
			_loadImg: function($img) {
				var imgSrc = $img.attr(settings.source);
				var webpDisable = $img.attr(settings.webpDisableKey);
				var imgLoadedSrc = imgSrc;

				if (this.webpSupported) {
					if (settings.webpReg.test(imgSrc) && (webpDisable !== settings.webpDisableValue) || this.forceOpenWebP) {
						imgLoadedSrc = imgSrc + '!q' + settings.webpQuality + settings.webpSuffix;
					}
				}

				var img = new Image();
				img.onload = $.proxy(function() {
					this._setImg(img, $img, imgLoadedSrc);
				}, this);
				img.onerror = $.proxy(function() {
					this._errorLoadImg(img, $img, imgSrc);
				}, this);

				img.src = imgLoadedSrc;
			},			
			_loadImgs: function() {
				this.$elements = $self.find('img[' + settings.source + '][' + settings.source + '!="done"]');

				this.$elements.each($.proxy(function(i, img) {
					var $img = $(img);

					if (inviewport(img) && $img.attr(settings.source) !== undefined) {
						if (!$img.attr('src')) {
							$img.attr('src', settings.placeholder);
						}

						this._loadImg($img);
						$img.attr(settings.source, 'done');
					}
				}, this));
			},
			_loadTimer: null,
			_update: function() {
				clearTimeout(this._loadTimer);
				this._loadTimer = setTimeout($.proxy(this._loadImgs, this), settings.delay);
			},
			_initEvent: function() {
				$(document).ready($.proxy(this._update, this));
				$window.bind('scroll.o2-lazyload', $.proxy(this._update, this));
				$window.bind('resize.o2-lazyload', $.proxy(this._update, this));
			},
			_isInit: function() { //防止同一元素重复初始化
				if ($self.attr(settings.source + '-install') === '1') {
					return true;
				}
				$self.attr(settings.source + '-install', '1');
				return false;
			},
			init: function(webpSupported) {
				if (!this._isInit()) {
					var forceOpenWebP = Util.getUrlParams(settings.forceOpenOrCloseWebP);
					this.webpSupported = webpSupported;
					if (forceOpenWebP === '1') {
						this.forceOpenWebP = true;
					}
					this._initEvent();					
				}
			}
		};

		var Util = {
			setCookie: function(name,value,expireMonth,domain) { //设置cookie
				if(!domain){
					domain = location.hostname;
				}
				if(arguments.length>2){
					var expireTime = new Date(new Date().getTime()+parseInt(expireMonth*60*60*24*30*1000));
					document.cookie = name+"="+escape(value)+"; path=/; domain="+domain+"; expires="+expireTime.toGMTString() ;
				}else{
					document.cookie = name + "=" + escape(value) + "; path=/; domain="+domain;
				}
			},
			getCookie: function (name){ //获取cookie
				try{
					return (document.cookie.match(new RegExp("(^"+name+"| "+name+")=([^;]*)"))==null)?"":decodeURIComponent(RegExp.$2);
				}
				catch(e){
					return (document.cookie.match(new RegExp("(^"+name+"| "+name+")=([^;]*)"))==null)?"":RegExp.$2;
				}
			},
			getUrlParams: function (key){ //获取URL参数
				var query = location.search;
				var reg = "/^.*[\\?|\\&]" + key + "\\=([^\\&]*)/";
				reg = eval(reg);
				var ret = query.match(reg);
				if (ret != null) {
					return decodeURIComponent(ret[1]);
				} else {
					return "";
				}
			}
		};

		/**
		 * 判断是否支持webp
		 * @param  {Function} callback
		 */
		var checkWebp = function(callback) {
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

		checkWebp(function(webpSupported) {
			Lazyload.init(webpSupported);
		});

    return this;
	};
});