/**
 * @description marquee组件，跑马灯，具体查看类{@link Marquee}，<a href="./demo/components/marquee/index.html">Demo预览</a>
 * @module marquee
 * @author wangcainuan
 * @example
 * var Marquee = seajs.require('marquee');
 *   var marquee = new Marquee({
 *     container: '.goods_wrapper',
 *     itemSelector: '.goods_list',
 *     duration: 5000,
 *     delay: 0,
 *     gap: 20,
 *     direction: 'up',
 *     pauseOnHover: true
 *   });
 */


define('marquee', function () {
  'use strict';

  var Marquee = _.Class.extend(/** @lends Marquee.prototype */{
    /**
     * marquee.
     * @constructor
     * @alias Marquee
     * @param {Object} options
     * @param {String} options.container - 指定跑马灯的容器选择器
     * @param {String} options.itemSelector - 跑马灯项选择器
     * @param {Number} [options.duration=5000] - 每一个跑马灯项的动画过渡时间
     * @param {boolean} [options.delay=0] - 跑马灯项的动画延迟时间
     * @param {Number} [options.gap=0] - 每一个跑马灯项的间隔像素
     * @param {String} [options.direction=left] - 轮播动画形式 left|up
     * @param {boolean} [options.pauseOnHover=true] - hover时暂停跑马灯  
     */
    construct: function (options) {
      $.extend(this, {
        container: null,
        itemSelector: null,
        duration: 5000,
        delay: 0,
        gap: 0,
        direction: 'left',
        pauseOnHover: true
      }, options);

      this.$container = $(this.container);
      this.$itemSelector = $(this.itemSelector);
      this.init();
    },

    /**
     * @description 一些初始化操作
     */
    init: function () {
      this.initElements();
      this.initEvent();
      this.start();
    },
    
    /**
     * @description 获取元素，同时初始化元素的样式
     */
    initElements: function () {

      this.$itemSelector = $(this.itemSelector);
      
      var cloneNum;

      this.$container.parent().css({
        position: 'relative'
      });
      
      switch (this.direction) {
        case 'left':
          this.itemSelectorWidth = this.$itemSelector.width();
          this.containerWidth = this.itemSelectorWidth+this.gap;
          cloneNum = Math.ceil(this.$container.parent().width() / this.containerWidth); // 计算该复制几个
          this.containerWidth = this.containerWidth*(cloneNum+1);
          // 插入页面中
          for (var i=0;i<cloneNum;i++) {
            this.$container.append(this.$itemSelector.clone());
          }

          // 获取最新的列表
          this.$itemSelector = $(this.itemSelector);

          this.$container.css({
            position: 'absolute',
            top: 0,
            left: 0,
            width: this.containerWidth,  
            overflow: 'hidden'
          });
          this.$itemSelector.css({
            float: 'left',
            display: 'block',
            marginRight: this.gap
          });
          break;
        case 'up':
          this.itemSelectorHeight = this.$itemSelector.height();
          this.containerHeight = this.itemSelectorHeight+this.gap;
          cloneNum = Math.round(this.$container.parent().height() / this.containerHeight); // 计算该复制几个
          this.containerHeight = this.containerHeight*(cloneNum+1);
          // 插入页面中
          for (var i=0;i<cloneNum;i++) {
            this.$container.append(this.$itemSelector.clone());
          }

          // 获取最新的列表
          this.$itemSelector = $(this.itemSelector);

          this.$container.css({
            position: 'absolute',
            top: 0,
            left: 0,
            height: this.containerHeight,  
            overflow: 'hidden'
          });
          this.$itemSelector.css({
            float: 'left',
            display: 'block',
            marginBottom: this.gap
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
      
      if (this.pauseOnHover) {
        this.$container.delegate(this.itemSelector,'mouseenter', $.proxy(this.stop, this))
        .delegate(this.itemSelector,'mouseleave', $.proxy(this.start, this));
      }
      return this;
    },

    /**
     * @description 开始动画
     */
    startAnimate: function () {

      this.$container = $(this.container);

      var $nowItem = this.$container.find(this.itemSelector).eq(0);

      switch (this.direction) {
        case 'left':
          this.$container.animate({'left': -(this.itemSelectorWidth+this.gap)}, this.duration, "linear",$.proxy(function () {
            this.$container.css({left : 0});  // 实现无缝
            $nowItem.appendTo(this.$container); //直接移动到最后一位；
          }, this));
          break;
        case 'up':
          this.$container.animate({'top': -(this.itemSelectorHeight+this.gap)}, this.duration, "linear",$.proxy(function () {
            this.$container.css({top : 0});  // 实现无缝
            $nowItem.appendTo(this.$container); //直接移动到最后一位；
          }, this));
        default:
          break;
      }
      return this;
    },

    /**
     * @description 停止动画
     */
    stopAnimate: function () {
      this.$container.stop(true); 
      return this;
    },
    
    /**
     * @description 开始自动播放
     */
    start: function () {
      clearTimeout(this.autoTimer);
      this.autoTimer = setTimeout($.proxy(function () {
        this.startAnimate().start();
      }, this), this.delay);
      return this;
    },
    
    /**
     * @description 停止自动播放
     */
    stop: function () {
      clearTimeout(this.autoTimer);
      this.stopAnimate();
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
      this.$container.undelegate();
      return this;
    }
  });
  
  return Marquee;
});