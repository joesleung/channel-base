/**
 * @description parallaxmouse组件，手风琴，具体查看类{@link Parallaxmouse}，<a href="./demo/components/parallaxmouse/index.html">Demo预览</a>
 * @module parallaxmouse
 * @author wangcainuan
 * @example
 * var Parallaxmouse = seajs.require('parallaxmouse');
 * var parallaxmouse = new Parallaxmouse({
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


define('parallaxmouse', function () {
  'use strict';

  var Parallaxmouse = _.Class.extend(/** @lends Parallaxmouse.prototype */{
    /**
     * parallaxmouse.
     * @constructor
     * @alias Parallaxmouse
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
        elementSelector: null,
        background: false,
        duration: 500,
        easing: 'linear',
        magnification: 0.02
      }, options);

      this.$container = $(this.container);
      this.$itemSelector = $(this.elementSelector);
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

      this.center = {
        x: Math.floor( this.$container.width() / 2 ),
        y: Math.floor( this.$container.height() / 2 )
      }
      console.log(this.center)
      return this;
    },
    
    /**
     * @description 初始化事件绑定
     */
    initEvent: function () {

      this.$container.delegate(this.elementSelector,'mousemove', $.proxy(this.mousemove, this));

      return this;
    },

    /**
     * @description mousemove
     */
    mousemove: function (event) {

      var pos = {
        x: event.pageX,
        y: event.pageY
      }
      var top  = 50 + Math.floor((this.center.y - pos.y) * this.magnification);
      var left = 50 + Math.floor((this.center.x - pos.x) * this.magnification);
      
      //console.log('top', top, 'left', left);
      
      this.render({top:top, left:left});

      return this;
    },

    /**
     * @description mousemove
     */
    render: function (pos) {

      if( this.background ) {
        this.$itemSelector.css({
          'background-position': pos.top + '% ' + pos.left + '%'
        });
      } else {
        this.$itemSelector.css({
          top: pos.top + '%',
          left: pos.left + '%'
        });
      }
      
      return this;
    },


    /**
     * @description 销毁组件
     */
    destroy: function () {
      this.unbind();
      this.$itemSelector.remove();
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
  
  return Parallaxmouse;
});