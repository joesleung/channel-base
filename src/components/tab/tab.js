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
     * @param {String|HTMLElement|Zepto} [options.headItems] - tab的头部项
     * @param {String|HTMLElement|Zepto} [options.content] - tab的内容
     * @param {String|HTMLElement|Zepto} [options.contentItems] - tab的内容项
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
        headItems: null,
        content: null,
        contentItems: null,
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
      this.$head = conf.head ? $(conf.head) : this.$el.children('.mod_tab_head, .J_tab_head');
      this.$headItems = conf.headItems ? (typeof conf.headItems === 'string') ? this.$head.children(conf.headItems) : $(conf.headItems) : this.$head.children('.mod_tab_head_item, .J_tab_head_item');
      this.$content = conf.content ? $(conf.content) : this.$el.children('.mod_tab_content, .J_tab_content');
      this.$contentItems = conf.contentItems ? (typeof conf.contentItems === 'string') ? this.$content.children(conf.contentItems) : $(conf.contentItems) : this.$content.children('.mod_tab_content_item, .J_tab_content_item');

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
      this.$head.delegate('.mod_tab_head_item, .J_tab_head_item', eventType, function () {
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