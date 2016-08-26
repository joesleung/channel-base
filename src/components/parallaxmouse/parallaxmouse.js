/**
 * @description parallaxmouse组件，视觉差鼠标可交互，具体查看类{@link Parallaxmouse}，<a href="./demo/components/parallaxmouse/index.html">Demo预览</a>
 * @module parallaxmouse
 * @author wangcainuan
 * @example
 * var Parallaxmouse = seajs.require('parallaxmouse');
 * var parallaxmouse1 = new Parallaxmouse({
 *    container: '.parallmaxmouse',
 *    elementSelector: '.parallmaxmouse_section1',
 *    magnification: 0.06
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
     * @param {String} options.container - 指定视觉差的容器选择器
     * @param {String} options.elementSelector - 视觉差项选择器
     * @param {Boolean} [options.background=false] - 视觉差是否使用背景
     * @param {String} [options.magnification=0.1] - 视觉差比例
     */
    construct: function (options) {
      $.extend(this, {
        container: null,
        elementSelector: null,
        magnification: 0.1
      }, options);

      this.$container = $(this.container);
      this.$elementSelector = $(this.elementSelector);
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
      this.elemPosition = {
        left: parseInt(this.$elementSelector.css("left"),10),
        top: parseInt(this.$elementSelector.css("top"),10)
      }

      return this;
    },
    
    /**
     * @description 初始化事件绑定
     */
    initEvent: function () {

      $(window).delegate(this.container,'mousemove', $.proxy(this.mousemove, this));

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
      console.log(pos)
      var top  = this.elemPosition.top + Math.floor((this.center.y - pos.y) * this.magnification);
      var left = this.elemPosition.left + Math.floor((this.center.x - pos.x) * this.magnification);
      
      this.render({top:top, left:left});

      return this;
    },

    /**
     * @description render
     */
    render: function (pos) {

      this.$elementSelector.css({
        top: pos.top,
        left: pos.left
      });
      
      return this;
    }

  });
  
  return Parallaxmouse;
});