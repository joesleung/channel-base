/**
 * @description ceilinglamp组件，吸顶灯，具体查看类{@link Ceilinglamp}，<a href="./demo/components/ceilinglamp/index.html">Demo预览</a>
 * @module ceilinglamp
 * @author wangcainuan
 * @example
 * var Ceilinglamp = seajs.require('ceilinglamp');
 * var ceilinglamp = new Ceilinglamp({
 *   container: '#ceilinglamp',
 *   zIndex: 100,
 *   top: 0,
 *   arrive: '#arrive',
 *   hasFixedStyle: true,
 *   fixedClassName: 'J_ceilinglamp_fixed'
 * });
 */

define('ceilinglamp', function () {
  'use strict';

  var Ceilinglamp = _.Class.extend(/** @lends Ceilinglamp.prototype */{
    /**
     * ceilinglamp.
     * @constructor
     * @alias Ceilinglamp
     * @param {Object} options
     * @param {String|HTMLElement} options.container - 容器
     * @param {Number} [options.zIndex] - 悬挂时样式的z-index
     * @param {Number} [options.top] - 悬挂时距页面最上面的高度值
     * @param {String|HTMLElement} [options.arrive] - 到达某元素停止悬挂
     * @param {Number} [options.arriveThreshold] - 到达某元素停止悬挂的阈值
     * @param {Boolean} [options.addWrap] - 是否有外层wrap结构,false:添加wrap结构，true：不添加wrap结构
     * @param {Boolean} [options.hasFixedStyle] - 是否已经自定义了fixed样式，false添加样式，true不添加样式
     * @param {String} [options.fixedClassName] - 挂起作用时的增加的样式名称
     * @param {Number} [options.threshold] - 显示或消失时阀值，默认'auto'等于操作节点的高度outerHeight(true)
     * @param {Number} [options.width] - 外层宽度，默认自动计算外层宽度
     * @param {String} [options.align] - 显示视角控制 支持 top、bottom，如页面滚动了底部bottom,元素才fixed
     * @param {Number} [options.scrollDelay] - 页面滚动时，节流延迟时间 毫秒
     * @param {Function} [options.onShow] - 显示时回调 this=ceilinglamp, args[0]=$当前节点
     * @param {Function} [options.onHide] - 隐藏时回调 this=ceilinglamp, args[0]=$当前节点
     */
    construct: function (options) {
      $.extend(this, {
        container: null,
        zIndex: 100,
        top: 0,
        arrive: null,
        arriveThreshold: 0,
        addWrap: false, 
        hasFixedStyle: false, 
        fixedClassName: 'J_ceilinglamp_fixed',
        threshold: 'auto', 
        width: 'auto', 
        align: null, 
        scrollDelay: 50, 
        onShow: null, 
        onHide: null
      }, options);

      this.$container = $(this.container);
      this.arrive = $(this.arrive);
      this.init();
    },

    /**
     * @description 一些初始化操作
     */
    init: function() {
        var self = this;
        self.offsetTop = this.$container.offset().top;

        self.insert();
        self.showInit();
        self.bind();
    },

    /**
     * @description 是否插入外层div元素；计算显示或消失时阀值；计算样式
     */
    insert: function() {
        var self = this;
        //如果dom.ready前后宽度有变化,值会取错,所以宽度交给css来控制
        //self.$container.css({
        //  width: self.$container.width(),
        //  height: self.$container.height()
        //});

        //  处理一：self.hasWarp为false则为self.$container添加一个外层div
        if (!self.addWrap) {
            var wrap = 'J_ceilinglamp_wrap';
            var widthStyle = '';
            if (self.width == 'auto') {
                self.width = self.$container.outerWidth();
            }
            if (self.width !== null && self.width >= 0) {
                widthStyle = 'width:' + self.width + 'px;';
            }
            self.$container.wrap('<div class="' + wrap + '" style="' + widthStyle + 'height:' + self.$container.outerHeight(true) + 'px;"></div>');
            self.eleWrap = $('.' + wrap);
        }

        // 处理二
        if (self.threshold == 'auto') {
            self.threshold = self.$container.outerHeight(true);
        } else
        if (isNaN(parseInt(self.threshold))) {
            self.threshold = 0;
        }

        // 处理三：
        self.currentClass = self.fixedClassName;
        // self.hasFixedStyle是否有样式，false添加样式，true不添加样式
        if (!self.hasFixedStyle) {
            var zIndex = self.zIndex;
            var top = self.top - parseInt(self.$container.css('marginTop'), 10);

            var styles = "." + self.currentClass + "{position:fixed;top:" + top + "px;z-index:" + zIndex + "}";

            // 调用insertStyles
            self.insertStyles(styles);
        }
    },

    /**
     * @description 向页面中插入样式
     */
    insertStyles: function(cssString) {
        var doc = document,
            heads = doc.getElementsByTagName("head"),
            style = doc.createElement("style");

        style.setAttribute("type", "text/css");
        if (style.styleSheet) {
            style.styleSheet.cssText = cssString;
        } else {
            var cssText = doc.createTextNode(cssString);
            style.appendChild(cssText);
        }

        if (heads.length) {
            heads[0].appendChild(style);
        }
    },

    /**
     * @description 开始悬挂，以及到达时某元素恢复原状
     */
    show: function() {
        var self = this;
        var hasShow = self.$container.hasClass(self.currentClass);

        if (!hasShow) {
            self.$container.addClass(self.currentClass);

            if ($.isFunction(self.onShow)) {
                self.onShow.call(self, self.$container);
            }

            self.isShow = true;
        }

        //到达时处理
        if (self.arrive) {
            var scrollTop = $(document).scrollTop();
            var arriveTop = self.arrive.offset().top;
            if (scrollTop >= (arriveTop + self.arriveThreshold)) {
                var top = arriveTop - self.offsetTop + self.arriveThreshold;
                self.$container.css({
                    position: 'absolute',
                    top: top
                });
            } else {
                self.$container[0].style.position = '';
                self.$container[0].style.top = '';
            }
        }

        //fix ie8- 在执行完onScroll后再执行onResize
        setTimeout(function() { self.isPlay = false; }, 10);
    },

    /**
     * @description 停止悬挂
     */
    hide: function() {
        var self = this;
        var hasShow = self.$container.hasClass(self.currentClass);

        if (hasShow) {
            self.isShow = false;
            self.$container.removeClass(self.currentClass);

            if ($.isFunction(self.onHide)) {
                self.onHide.call(self, self.$container);
            }
        }
    },

    /**
     * @description 悬挂初始化,，调用hide或show
     */
    showInit: function() {
        var self = this;
        var scrollTop = $(document).scrollTop();

        //当前元素上面如果有元素高度变化时offsetTop会有变化,需要初始化下
        if (!self.$container.hasClass(self.currentClass)) {
            self.offsetTop = self.$container.offset().top + self.threshold;
        }
        if (scrollTop > self.offsetTop) {  // 开始悬挂
            self.show();
        } else {   // 停止悬挂
            self.hide();
        }
    },

    /**
     * @description 页面滚动，判断是否悬挂
     */
    onScroll: function() {
        var self = this;

        if (self.align != null) {
            var scrollTop = $(document).scrollTop();
            var oldScrollTop = self.oldScrollTop;
            var align = oldScrollTop > scrollTop ? 'top' : 'bottom';
            if (self.align == align) {
                self.showInit();
            } else {
                self.hide();
            }
        } else {
            // 初始化悬挂
            self.showInit();
        }
    },

    /**
     * @description 窗口滚动和改变窗口大小事件，都判断是否触发onScroll
     */
    bind: function() {
        var self = this;
        var thread = -1;
        self.oldScrollTop = $(document).scrollTop();

        $(window).scroll(function() {
            if (!self.isShow) {
                clearTimeout(thread);
                thread = setTimeout(function() {
                    self.isPlay = true;
                    self.onScroll();
                }, self.scrollDelay);
            } else {
                self.isPlay = true;
                self.onScroll();
            }
        });

        $(window).resize(function() {
            if (!self.isPlay) {
                self.onScroll();
            }
        });
    }
  });
  
  return Ceilinglamp;
});

