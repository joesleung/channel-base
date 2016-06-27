/**
 * @description A class factory
 */

(function (global) {
  'use strict';

  var _ = global._ || (global._ = { });
  function type (arg) {
    var class2type = {};
    var toString = class2type.toString;
    var types = 'Boolean Number String Function Array Date RegExp Object Error'.split(' ');
    for (var i = 0; i < types.length; i++) {
      var typeItem = types[i];
      class2type['[object ' + typeItem + ']'] = typeItem.toLowerCase();
    }

    if (arg === null) {
      return arg + '';
    }

    return (typeof arg === 'object' || typeof arg === 'function') ?
      class2type[toString.call(arg)] || 'object' :
      typeof arg;
  }

  function isFunction (arg) {
    return type(arg) === 'function';
  }

  var initializing = false;
  // 目的是为了检测Function.prototype.toString能否打印出函数内部信息
  var fnTest = /xyz/.test(function() {var xyz;}) ? /\bsuper\b/ : /.*/;

  /** @memberOf _
   * @example
   * // 构建类
   * var People = _.Class.extend({
   * // 类静态成员
   * statics: {
   *
   * },
   * 
   * // 构造函数，若不需要可缺省
   * construct: function (name) {
	 *   this.name = name;
   * },
   * 
   * talk: function () {
   *   console.log('My name is ' + this.name + '!');
   * }
   * 
   * // 其他成员方法
   * ...
   * 
   * });
   * 
   * // 继承People
   * var Man = People.extend({
   * 
   * construct: function (name, age) {
   *   // 执行父类的方法
   *   this._super.call(this, arguments);
   * },
   * 
   * walk: function () {
   *   console.log('I am ' + this.age + ' years old, I can walk!');
   * }
   * 
   * // 其他成员方法
   * ...
   * });
   * 
   * // 使用
   * var luckyadam = new Man('luckyadam', 23);
   * luckyadam.talk();
   * luckyadam.walk();
   */
  _.Class = function () {};

  _.Class.extend = function class_extend (properties) {
    var _super = this.prototype;

    initializing = true;
    var subPrototype = new this();
    initializing = false;
    for (var prop in properties) {
      if (prop === 'statics') {
        var staticObj = properties[prop];
        for (var staticProp in staticObj) {
          Klass[staticProp] = staticObj[staticProp];
        }
      } else {
        if (isFunction(_super[prop]) &&
          isFunction(properties[prop]) &&
          fnTest.test(properties[prop])) {
          subPrototype[prop] = wrapper(_super, prop, properties[prop]);
        } else {
          subPrototype[prop] = properties[prop];
        }
      }
    }

    function wrapper (superObj, prop, fn) {
      return function () {
        this._super = superObj[prop];
        return fn.apply(this, arguments);
      };
    }

    function Klass () {
      if (!initializing && isFunction(this.construct)) {
        this.construct.apply(this, arguments);
      }
    }

    Klass.prototype = subPrototype;

    Klass.prototype.constructor = Klass;

    Klass.extend = class_extend;

    return Klass;

  };

})(window, undefined);
/*!
 * Custom events
 */

(function (global) {
  'use strict';

  var eventSplitter = /\s+/;
  var slice = [].slice;

  /** @namespace _ */
  var _ = global._ || (global._ = { });  

  /**
   * @desc 函数继承
   * @param {Function} parent 父类
   * @param {Object} protoProps 子类的扩展属性和方法
   * @param {Object} staticProps 要子类添加的额外扩展方法或属性
   */
  function inherits (parent, protoProps, staticProps) {
    var child;
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function() {
        parent.apply(this, arguments);
      };
    }
    $.extend(child, parent);

    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    if (protoProps) $.extend(child.prototype, protoProps);
    if (staticProps) $.extend(child, staticProps);
    child.prototype.constructor = child;
    child.__super__ = parent.prototype;
    return child;
  }

  /**
   * @desc 继承的快捷写法
   * @param {Object} protoProps 子类的扩展属性和方法
   * @param {Object} classProps 要子类添加的额外扩展方法或属性
   */
  function extend (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  }

  var ctor = function() {};

  /**
   * @function Events
   * @memberOf _
   * @desc 自定义事件
   * @param {Object} opts
   * @param {Function} opts.callbacks
   * @constructor
   * @example
   * // 模块内部可以实例化一个新的事件触发器
   * var events = new _.Events();
   * // 注册一个事件module:message
   * events.on('module:message', function (msg) {
   *   console.log(msg);
   * });
   * // 触发事件
   * events.trigger('module:message', msg);
   */
  function Events(opts) {
    if (typeof opts != 'undefined' && opts.callbacks) {
      this.callbacks = opts.callbacks;
    } else {
      this.callbacks = {};
    }
  }
  Events.extend = extend;
  Events.prototype = {
    /**
     * @function on
     * @memberof Events
     * @desc 注册事件
     * @param {String} events 事件名称
     * @param {Function} callback 回调函数
     * @param {Object} context
     */
    on: function(events, callback, context) {
      var calls, event, node, tail, list;
      if (!callback) return this;
      events = events.split(eventSplitter);
      calls = this.callbacks;
      while (event = events.shift()) {
        list = calls[event];
        node = list ? list.tail : {};
        node.next = tail = {};
        node.context = context;
        node.callback = callback;
        calls[event] = {
          tail: tail,
          next: list ? list.next : node
        };
      }

      return this;
    },
    /**
     * @function off
     * @memberof Events
     * @desc 移除自定义事件
     * @param {String} events 事件名称
     * @param {Function} callback 回调函数
     * @param {Object} context 函数执行context
     */
    off: function(events, callback, context) {
      var event, calls, node, tail, cb, ctx;

      if (!(calls = this.callbacks)) return;
      if (!(events || callback || context)) {
        delete this.callbacks;
        return this;
      }
      events = events ? events.split(eventSplitter) : _.keys(calls);
      while (event = events.shift()) {
        node = calls[event];
        delete calls[event];
        if (!node || !(callback || context)) continue;
        tail = node.tail;
        while ((node = node.next) !== tail) {
          cb = node.callback;
          ctx = node.context;
          if ((callback && cb !== callback) || (context && ctx !== context)) {
            this.on(event, cb, ctx);
          }
        }
      }
      return this;
    },
    /**
     * @function trigger
     * @memberof Events
     * @desc 触发自定义事件
     * @param {String} events 事件名称
     */
    trigger: function(events) {
      var event, node, calls, tail, args, all, rest;
      if (!(calls = this.callbacks)) return this;
      all = calls.all;
      events = events.split(eventSplitter);
      rest = slice.call(arguments, 1);

      while (event = events.shift()) {
        if (node = calls[event]) {
          tail = node.tail;
          while ((node = node.next) !== tail) {
            node.callback.apply(node.context || this, rest);
          }
        }
        if (node = all) {
          tail = node.tail;
          args = [event].concat(rest);
          while ((node = node.next) !== tail) {
            node.callback.apply(node.context || this, args);
          }
        }
      }
      return this;
    }
  };

  _.Events = Events;
  /** @memberOf _
   * @example
   * // 使用全局的事件中心在模块间传递消息
   * _.eventCenter.on('module:message', function (msg) {
   *   console.log(msg);
   * });
   * _.eventCenter.trigger('module:message', msg);
   */
  _.eventCenter = new Events();
})(window, undefined);
/**
 * @description carousel组件，轮播，具体查看类{@link Carousel}
 * @module carousel
 * @author liweitao
 * @example
 * var Carousel = require('carousel');
 * var carousel = new Carousel({
 *   container: $('.carousel_main'),
 *   itemSelector: '.carousel_item',
 *   activeClass: 'active',
 *   startIndex: 0,
 *   duration: 300,
 *   delay: 3000,
 *   switchType: 'fade',
 *   onBeforeSwitch: function (current, next) {
 *     this.switchNav(next);
 *   }
 * });
 */

define('carousel', function () {
  'use strict';

  var Carousel = _.Class.extend(/** @lends Carousel.prototype */{
    /**
     * carousel.
     * @constructor
     * @alias Carousel
     * @param {Object} options
     * @param {String|HTMLElement|Zepto} options.container - 指定轮播的容器
     * @param {String} [options.itemSelector] - 轮播项选择器
     * @param {Number} [options.itemWidth] - 每一个轮播项的宽度
     * @param {String} [options.activeClass] - 标注当前所处class
     * @param {Number} [options.startIndex] - 起始轮播项索引
     * @param {Number} [options.duration] - 每一个轮播项的动画过渡时间
     * @param {Number} [options.delay] - 轮播项之间切换的间隔时间
     * @param {String} [options.switchType] - 轮播动画形式 fade|slide
     * @param {Boolean} [options.isAuto] - 是否自动播放
     * @param {Function} [options.onBeforeSwitch] - 轮播切换前触发的操作
     * @param {Function} [options.onAfterSwitch] - 轮播切换后触发的操作
     */
    construct: function (options) {
      $.extend(this, {
        container: null,
        itemSelector: null,
        itemWidth: 0,
        activeClass: 'active',
        startIndex: 0,
        duration: 500,
        delay: 2000,
        switchType: 'fade',
        isAuto: true,
        onBeforeSwitch: function () {},
        onAfterSwitch: function () {}
      }, options);

      this.$container = $(this.container);
      this.init();
    },

    /**
     * @description 一些初始化操作
     */
    init: function () {
      this.initElements();
      this.initEvent();
      this.setCurrent(this.startIndex);
      if (this.isAuto) {
        this.start();
      }
    },
    
    /**
     * @description 获取元素，同时初始化元素的样式
     */
    initElements: function () {
      this.$items = this.$container.find(this.itemSelector);
      this.length = this.$items.length;
      switch (this.switchType) {
        case 'fade':
          this.$items.css({
            opacity: 0,
            zIndex: 0,
            position: 'absolute'
          });
          break;
        case 'slide':
          var $items = this.$items;
          var $firstClone = $($items.get(0)).clone();
          var $lastClone = $($items.get(this.length - 1)).clone();
          this.$container.append($firstClone).prepend($lastClone);
          this.$items = this.$container.find(this.itemSelector);
          this.$container.css({
            width: (this.length + 2) * this.itemWidth,
            position: 'absolute',
            top: 0,
            left: -this.itemWidth
          });
          break;
        default:
          break;
      }
      return this;
    },
    
    /**
     * @description 初始化事件绑定
     */
    initEvent: function () {
      this.$container.bind('mouseenter', $.proxy(this.stop, this))
        .bind('mouseleave', $.proxy(this.start, this));
      return this;
    },
    
    /**
     * @description 设置当前所处位置
     * @param {Number} index - 当前索引
     * @return {Object} this - 实例本身，方便链式调用
     */
    setCurrent: function (index) {
      this.currentIndex = index;
      var $items = this.$items;
      var $current = $($items.get(index));
      $items.removeClass(this.activeClass);
      $current.addClass(this.activeClass);
      return this;
    },
    
    /**
     * @description 切换到某一项
     * @param {Number} index - 需要切换到的索引
     * @return {Object} this - 实例本身，方便链式调用
     */
    switchTo: function (index) {
      switch (this.switchType) {
        case 'fade':
          var $items = this.$items;
          var $current = $($items.get(this.currentIndex));
          var $newCurrent = null;
          if (index >= this.length) {
            index = 0;
          } else if (index <= -1) {
            index = this.length - 1;
          }
          $newCurrent = $($items.get(index));
          if ($.isFunction(this.onBeforeSwitch)) {
            this.onBeforeSwitch.call(this, this.currentIndex, index);
          }
          $current.fadeTo(this.duration, 0, $.proxy(function () {
            $current.css('zIndex', '0');
          }, this));
          $newCurrent.fadeTo(this.duration, 1, $.proxy(function () {
            this.setCurrent(index);
            $newCurrent.css({
              opacity: 1,
              zIndex: 5
            });
            if ($.isFunction(this.onAfterSwitch)) {
              this.onAfterSwitch.call(this, this.currentIndex);
            }
          }, this));
          break;
        case 'slide':
          var $items = this.$items;
          var $current = $($items.get(this.currentIndex));
          if ($.isFunction(this.onBeforeSwitch)) {
            this.onBeforeSwitch.call(this, this.currentIndex, index);
          }
          this.$container.animate({'left': -(index + 1) * this.itemWidth}, this.duration, $.proxy(function () {
            if (index >= this.length) {
              index = 0;
              this.$container.css('left', -this.itemWidth * (index + 1));
            } else if (index <= -1) {
              index = this.length - 1;
              this.$container.css('left', -this.itemWidth * (index + 1));
            }
            this.setCurrent(index);
            if ($.isFunction(this.onAfterSwitch)) {
              this.onAfterSwitch.call(this, this.currentIndex);
            }
          }, this));
          break;
        default:
          break;
      }
      return this;
    },
    
    /**
     * @description 切换到前一项
     */
    switchToPrev: function () {
      var index = this.currentIndex - 1;
      this.switchTo(index);
      return this;
    },
    
    /**
     * @description 切换到下一项
     */
    switchToNext: function () {
      var index = this.currentIndex + 1;
      this.switchTo(index);
      return this;
    },
    
    /**
     * @description 开始自动播放
     */
    start: function () {
      clearTimeout(this.autoTimer);
      this.autoTimer = setTimeout($.proxy(function () {
        this.switchToNext().start();
      }, this), this.delay);
      return this;
    },
    
    /**
     * @description 停止自动播放
     */
    stop: function () {
      clearTimeout(this.autoTimer);
      return this;
    },

    /**
     * @description 销毁组件
     */
    destroy: function () {
      this.unbind();
      this.$container.remove();
    },

    /**
     * @description 解绑事件
     * @return {Object} this - 实例本身，方便链式调用
     */
    unbind: function () {
      this.$container.unbind();
      return this;
    }
  });
  
  return Carousel;
});
/**
 * @description lift组件，具体查看类{@link Lift},<a href="./demo/components/lift/index.html">Demo预览</a>
 * @module lift
 * @author mihan
 * @example
 * var Lift = seajs.require('lift');
 * var lift = new Lift({
 *     container: $('#hangPulg'), // 必选
 *     container: $('#hangNav'), // 必选
 *     backTop: $('#backTop'), // 可选
 *     itemSelectedClassName: 'index_mod_hang_item_on' // 可选
 * });
 */

define('lift', function () {
    'use strict';

    var Lift = _.Class.extend(/** @lends Lift.prototype */{
    
        /**
         * @constructor
         * @alias Lift
         * @param {Object} opts - 组件配置
         * @param {Object} opts.container - 必选，JQ对象，电梯列表容器
         * @param {Object} [opts.backTop = null] - 可选，JQ对象，返回顶部按钮
         * @param {String} [opts.itemSelectedClassName = ''] - 可选，电梯列表项选中样式 ClassName
         * @param {Object} [opts.floorList = $('.JS_floor') ] - 可选，JQ对象，楼层列表
         * @param {Object} [opts.liftList = $('.JS_lift')] - 可选，JQ对象，电梯列表
         * @param {Number} [opts.speed = 800] - 可选，页面滚动动画时间
         */
        construct: function(opts){
            this.config = {
                container: null,
                backTop: null,
                itemSelectedClassName: '',
                floorList: $('.JS_floor'),
                liftList: $('.JS_lift'),
                speed: 800
            }
            
            if(opts){
                $.extend(this.config,opts);
            }
                
            this.init();
        },
        
        
        /**
         * @description 组件初始化
         */
        init: function(){
            this.$window = $(window); 
            this.WIN_W = this.$window.width();
            this.WIN_H = this.$window.height();
            this.DOC_H = $(document).height();
            this.timer = null;
            this.config.liftList = this.config.container.find('.JS_lift'); // 精确找到电梯容器内的列表项勾子，以防冲突
            this.checkRun(); // 检查是否可以运行组件
        },


        /**
         * @description 检查组件是否可运行
         * @returns {Boolean} 如果电梯容器、电梯列表容器、楼层勾子『.JS_floor』和 电梯列表项勾子『.JS_lift』缺一项，返回 false，组件将终止运行
         */
        checkRun: function(){
            var config = this.config;
            if(config.container == null || config.container == null || config.floorList.length == 0 || config.liftList.length == 0 ){
                return; 
            }else{
                this.start();
            }
        },


        /**
         * @description 运行组件
         */
        start: function(){
            this.bindEvents();
        },


        /**
         * @description 获取楼层位置信息
         * @returns {Null | Array} 返回楼层位置信息
         */
        getFloorInfo: function(){
            var config = this.config,
                floorInfo = [];

            if(config.floorList.length > 0){
                config.floorList.each(function(){
                    floorInfo.push($(this).offset().top);
                });
                return floorInfo;
            }else{
                return null
            }
             
        },

        /**
         * @description 电梯滚动、电梯跳转、返回顶部事件绑定
         */
        bindEvents: function(){
            var config = this.config;
            var $BackTop = config.backTop;
            var _this = this;

            // window 绑定电梯滚动事件
            _this.$window.bind('scroll.lift',{thisObj:_this},_this.lift);

            // 绑定电梯跳转事件
            config.container.delegate('.JS_lift','click.lift',{thisObj: _this},_this.liftJump);

            // 绑定返回顶部事件
            if($BackTop !== null && $BackTop.length > 0){
                $BackTop.bind('click.backTop',{thisObj:_this},_this.backTop);
            }


        },


        /**
         * @description 返回顶部
         * @param {any} event - event对象
         * @param {Object} event.data - jQuery bind 方法 eventData 对象参数
         * @param {Object} event.data.thisObj - 传递本类 Lift 对象
         * @returns {Boolean} 防止事件冒泡
         */
        backTop: function(event){
            var _this = event.data.thisObj;
            var config = _this.config;
            _this.$window.unbind('scroll.lift');
            $('body,html').stop().animate({
                scrollTop: 0
            },config.speed,function(){
                _this.$window.bind('scroll.lift',{thisObj:_this},_this.lift);
                config.liftList.removeClass(config.itemSelectedClassName);
            });
            return false;
        },


        /**
         * @description 电梯滚动
         * @param {any} event - event对象
         * @param {Object} event.data - jQuery bind 方法 eventData 对象参数
         * @param {Object} event.data.thisObj - 传递本类 Lift 对象
         */
        lift: function(event){
            var _this = event.data.thisObj;
            var config = _this.config;
            var winScrollTop = _this.$window.scrollTop();
            var itemSelectedClass = config.itemSelectedClassName;
            clearTimeout(_this.timer);            
            $.each(_this.getFloorInfo(),function(index,value){
                if( winScrollTop >= (value - _this.WIN_H/2 + 5) ){
                    config.liftList.eq(index).addClass(itemSelectedClass).siblings('.JS_lift').removeClass(itemSelectedClass);
                }else{
                    if( winScrollTop >= _this.DOC_H -  _this.WIN_H/2 - 5){
                        config.liftList.eq(index).addClass(itemSelectedClass).siblings('.JS_lift').removeClass(itemSelectedClass);
                    } 
                }
                
                if(winScrollTop < (_this.getFloorInfo()[0] - _this.WIN_H/2) ){
                    config.liftList.removeClass(itemSelectedClass);
                }
            })
        },

        /**
         * @description 电梯跳转
         * @param {any} event - event对象
         * @param {Object} event.data - jQuery bind 方法 eventData 对象参数
         * @param {Object} event.data.thisObj - 传递本类 Lift 对象
         */
        liftJump: function(event){
            var _this = event.data.thisObj;
            var config = _this.config;
            clearTimeout(_this.timer);
            $(this).addClass(config.itemSelectedClassName).siblings('.JS_lift').removeClass(config.itemSelectedClassName);
            _this.$window.unbind('scroll.lift',_this.lift);
            $('body,html').stop().animate({
                scrollTop: _this.getFloorInfo()[$(this).index( config.container.selector  + ' .JS_lift')]
            },config.speed,function(){
                _this.timer = setTimeout(function(){
                    _this.$window.bind('scroll.lift',{thisObj:_this},_this.lift);
                },50);
            });
        }

    });

    return Lift;
    
});
/**
 * @description masonry组件，简易瀑布流，具体查看类{@link Masonry}
 * @module masonry
 * @author liweitao
 * @example
 * var Masonry = require('masonry');
 * var masonry = new Masonry({
 *   container: $('.nav'),
 *   itemSelector: '.nav_sub_item',
 *   column: 3,
 *   itemWidth: 200,
 *   horizontalMargin: 30,
 *   verticalMargin: 30,
 *   onAfterRender: function () {
 *     console.log('rendered');
 *   }
 * });
 */

define('masonry', function (require) {
  'use strict';
  
  var util = require('util');

  var Masonry = _.Class.extend(/** @lends Masonry.prototype */{
    /**
     * masonry.
     * @constructor
     * @alias Masonry
     * @param {Object} options
     * @param {String|HTMLElement|Zepto} options.container - 指定瀑布流的容器
     * @param {String} options.itemSelector - 瀑布流项选择器
     * @param {Number} options.itemWidth - 每一项的宽度
     * @param {Number} options.column - 列数
     * @param {Number} [options.horizontalMargin] - 项与项之间水平方向间距
     * @param {Number} [options.verticalMargin] -项与项之间垂直方向间距
     * @param {Function} [options.onAfterRender] - 瀑布流计算渲染完后的回调
     */
    construct: function (options) {
      $.extend(this, {
        container: null,
        itemSelector: '',
        itemWidth: 0,
        column: 1,
        horizontalMargin: 15,
        verticalMargin: 15,
        onAfterRender: function () {}
      }, options);
      
      this.$container = $(this.container);
      this.init();
    },

    /**
     * @description 初始化瀑布流
     */
    init: function () {
      var columns = new Array(this.column);
      this.$items = this.$container.find(this.itemSelector);
      this.column = Math.min(this.$items.length, this.column);
      
      for (var k = 0; k < this.column; k++) {
        columns[k] = this.$items[k].offsetTop + this.$items[k].offsetHeight;
      }
      
      for (var i = 0, len = this.$items.length; i < len; i++) {
        var $item = $(this.$items.get(i));
        if (this.itemWidth) {
          $item.width(this.itemWidth);
        }
        
        if (i >= this.column) {
          var minHeight = Math.min.apply(null, columns);
          var minHeightColumn = 0;
          if (Array.prototype.indexOf) {
            minHeightColumn = columns.indexOf(minHeight);
          } else {
            minHeightColumn = util.indexOf(columns, minHeight);
          }
          $item.css({
            left: minHeightColumn * (this.itemWidth + this.horizontalMargin) + 'px',
            top: minHeight + this.verticalMargin + 'px'
          });
          columns[minHeightColumn] += $item.get(0).offsetHeight + this.verticalMargin;
        } else {
          $item.css({
            top: 0,
            left: (i % this.column) * (this.itemWidth + this.horizontalMargin) + 'px'
          });
        }
      }
      this.$container.css({
        height: Math.max.apply(null, columns)
      });
      if ($.isFunction(this.onAfterRender)) {
        this.onAfterRender.call(this);
      }
    }
  });

  return Masonry;
});
/**
 * @description tab组件，具体查看类{@link Tab}，<a href="./demo/components/tab/index.html">Demo预览</a>
 * @module tab
 * @author liweitao
 * @example
 * var Tab = require('tab');
 * var tab = new Tab({
 *   container: $('.info_tab'),
 *   head: $('.info_tab_head'),
 *   content: $('.info_tab_content'),
 *   startAt: 0,
 *   hash: false,
 *   activeClass: 'active',
 *   hoverToSwitch: true,
 *   onBeforeSwitch: function () {},
 *   onAfterSwitch: function (index) {
 *     var $infoTabActive = $html.find('.info_tab_active');
 *     $infoTabActive.animate({'left': 80 * index + 'px'}, 200);
 *   },
 *   onFirstShow: function () {}
 * });
 */

define('tab', function () {
  'use strict';

  var Tab = _.Class.extend(/** @lends Tab.prototype */{
    /**
     * tab.
     * @constructor
     * @alias Tab
     * @param {Object} options
     * @param {String|HTMLElement|Zepto} options.container - 指定tab容器
     * @param {String|HTMLElement|Zepto} [options.head] - tab的头部
     * @param {String|HTMLElement|Zepto} [options.content] - tab的内容
     * @param {Number|String} [options.startAt] - 起始Tab页
     * @param {String} [options.activeClass] - 标注当前所处class
     * @param {Boolean} [options.hash] - 是否启用hash标记tab
     * @param {Boolean} [options.hoverToSwitch] - 是否鼠标移上去切换tab
     * @param {Function} [options.onBeforeSwitch] - Tab切换前触发的操作
     * @param {Function} [options.onAfterSwitch] - Tab切换后触发的操作
     * @param {Function} [options.onFirstShow] - Tab首次show出来的时候触发的操作
     */
    construct: function (options) {
      this.conf = $.extend({
        container: null,
        head: null,
        content: null,
        startAt: 0,
        activeClass: 'active',
        hash: false,
        hoverToSwitch: false,
        onBeforeSwitch: function () {},
        onAfterSwitch: function () {},
        onFirstShow: function () {}
      }, options);

      this.index = undefined;
      var conf = this.conf;
      this.$el = $(conf.container);
      this.$head = conf.head ? $(conf.head) : this.$el.children('.mod_tab_head, .j_tab_head');
      this.$headItems = this.$head.children('.mod_tab_head_item, .j_tab_head_item');
      this.$content = conf.content ? $(conf.content) : this.$el.children('.mod_tab_content, .j_tab_content');
      this.$contentItems = this.$content.children('.mod_tab_content_item, .j_tab_content_item');

      this.tabLength = this.$headItems.length;

      for (var i = 0, l = this.$headItems.length; i < l; i++) {
        this.$headItems[i].hasShown = false;
      }

      this.init();
    },

    /**
     * @description 一些初始化操作
     */
    init: function () {
      var conf = this.conf;
      var index = -1;
      var hash = window.location.hash;
      // 优先通过hash来定位Tab
      if (conf.hash && hash.length > 1) {
        this.switchTo(hash);
      } else {
        // 如果为string则认为是个选择器
        if (typeof conf.startAt === 'string') {
          this.$active = this.$headItems.filter(conf.startAt);
          if (this.$active.length) {
            index = this.$active.index();
          } else {
            index = 0;
          }
        } else if (typeof conf.startAt === 'number') {
          index = conf.startAt;
        } else {
          index = 0;
        }
        this.switchTo(index);
      }
      this.initEvent();

    },

    /**
     * @description 初始化事件绑定
     */
    initEvent: function () {
      var _this = this;
      var conf = _this.conf;
      var eventType = 'click';
      if (conf.hoverToSwitch) {
        eventType = 'mouseenter';
      }
      this.$head.delegate('.mod_tab_head_item, .j_tab_head_item', eventType, function () {
        var index = $(this).index();
        _this.switchTo(index);
        return false;
      });
    },

    /**
     * @description 切换tab
     * @param {Number|String} index - 可为tab的索引或是hash
     * @return {Object} this - 实例本身，方便链式调用
     */
    switchTo: function (index) {
      var conf = this.conf;
      if (conf.hash) {
        var hash;
        if (typeof index === 'string') {
          hash = index.replace('#', '');
          this.$active = this.$headItems.filter('[data-hash$=' + hash + ']');
          index = this.$active.index();
        }
        if (typeof index === 'number'){
          hash = this.$headItems.eq(index).attr('data-hash');
        }

        if (index === -1) {
          return -1;
        }
        window.location.hash = hash;
      }
      index = parseInt(index, 10);
      if (index === this.index) {
        return;
      }

      this.index = index;

      if (typeof conf.onBeforeSwitch === 'function') {
        conf.onBeforeSwitch.call(this, index, this);
      }
      this.$headItems.removeClass(conf.activeClass).eq(index).addClass(conf.activeClass);
      this.$contentItems.hide().eq(index).show();

      if (typeof conf.onAfterSwitch === 'function') {
        conf.onAfterSwitch.call(this, index, this);
      }

      if (! this.$headItems[index].hasShown && typeof conf.onFirstShow === 'function') {
        conf.onFirstShow.call(this, index, this);
        this.$headItems[index].hasShown = true;
      }
      return this;
    },

    /**
     * @description 切换到下一tab
     * @return {Object} this - 实例本身，方便链式调用
     */
    switchToNext: function () {
      var index = this.index + 1;
      if (index >= this.tabLength) {
        index = 0;
      }
      this.switchTo(index);
      return this;
    },

    /**
     * @description 切换到上一tab
     * @return {Object} this - 实例本身，方便链式调用
     */
    switchToPrev: function () {
      var index = this.index + 1;
      if (index <= 0) {
        index = 0;
      }
      this.switchTo(index);
      return this;
    },

    /**
     * @description 销毁组件
     */
    destroy: function () {
      this.unbind();
      this.$el.remove();
    },

    /**
     * @description 解绑事件
     * @return {Object} this - 实例本身，方便链式调用
     */
    unbind: function () {
      this.$head.undelegate();
      return this;
    },

    /**
     * @description 设置参数
     * @return {Object} this - 实例本身，方便链式调用
     */
    setOptions: function (options) {
      $.extend(this.conf, options);
      return this;
    }
  });
  
  return Tab;
});
/**
 * @description util组件，辅助性
 * @module util
 * @author liweitao
 */

define('util', function () {
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
    throttle: function (func, wait, options) {
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
    debounce: function (func, wait, immediate) {
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
    indexOf: function (arr, el) {
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
    }
  };
});