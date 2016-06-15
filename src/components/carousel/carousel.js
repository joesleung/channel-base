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