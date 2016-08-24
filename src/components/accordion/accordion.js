/**
 * @description accordion组件，手风琴，具体查看类{@link Accordion}，<a href="./demo/components/accordion/index.html">Demo预览</a>
 * @module accordion
 * @author wangcainuan
 * @example
 * var Accordion = seajs.require('accordion');
 * var accordion = new Accordion({
 *     container: '.shop',
 *     itemSelector: '.shop_item',
 *     itemOfFirstExpand: 1,
 *     isVertical: true,
 *     expandPx: 230,
 *     speed: 500,
 *     easing: 'linear',
 *     activeClass: 'shop_item_on'
 * });
 */


define('accordion', function () {
  'use strict';

  var Accordion = _.Class.extend(/** @lends Accordion.prototype */{
    /**
     * accordion.
     * @constructor
     * @alias Accordion
     * @param {Object} options
     * @param {String} options.container - 指定手风琴的容器选择器
     * @param {String} options.itemSelector - 手风琴项选择器
     * @param {Number} [options.itemOfFirstExpand=0] - 哪个项先展开
     * @param {String} [options.isVertical=true] - 高度变化或者宽度变化
     * @param {Number} [options.expandPx=230] - 宽度或高度变到多大
     * @param {boolean} [options.speed=500] - 手风琴的动画过渡时间
     * @param {Number} [options.easing='linear'] - 动画过渡函数linear|swing
     * @param {String} [options.activeClass='item_on'] - 给当前hover的元素添加的类以便做其他变化
     */
    construct: function (options) {
      $.extend(this, {
        container: null,
        itemSelector: null,
        itemOfFirstExpand: 0,
        isVertical: true,
        expandPx: 230,
        speed: 500,
        easing: 'linear',
        activeClass: 'item_on'
      }, options);

      this.$container = $(this.container);
      this.$itemSelector = $(this.itemSelector);
      this.itemSelectorPx = this.isVertical ? this.$itemSelector.height() : this.$itemSelector.width();
      this.init();
    },

    /**
     * @description 一些初始化操作
     */
    init: function () {
      this.initElements();
      this.initEvent();
    },

    /**
     * @description 获取元素，同时初始化元素的样式
     */
    initElements: function () {

      var $itemEq = this.$itemSelector.eq(this.itemOfFirstExpand);

      $itemEq.addClass(this.activeClass);

      if (this.isVertical) {
        $itemEq.animate({'height': this.expandPx},this.speed,this.timingFunc);
      } else {
        $itemEq.animate({'width': this.expandPx},this.speed,this.timingFunc);
      }
      return this;
    },
    
    /**
     * @description 初始化事件绑定
     */
    initEvent: function () {

      var that = this;
      this.$container.delegate(this.itemSelector,'mouseenter', function () {

        var $this =  $(this);
        $this.addClass(that.activeClass).siblings().removeClass(that.activeClass);

        if (that.isVertical) {
          $this.animate({'height': that.expandPx},that.speed,that.timingFunc)
          .siblings().animate({'height': that.itemSelectorPx},that.speed,that.timingFunc);
        } else {
          $this.animate({'width': that.expandPx},that.speed,that.timingFunc)
          .siblings().animate({'width': that.itemSelectorPx},that.speed,that.timingFunc);
        }
      
      });

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
  
  return Accordion;
});