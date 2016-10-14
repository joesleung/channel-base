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