/**
 * @description pager分页组件，具体查看类{@link Pager},<a href="./demo/components/pager/index.html">Demo预览</a>
 * @module pager
 * @author wangbaohui
 * @example
 * var Pager = seajs.require('pager');
 * var $mod_pager = $('.mod_pager');
 * var $goods = $('.goods');
 * var page = new Pager({
 *  el: $('.items',$mod_pager),
 *  count: $goods.children().length,
 *  pagesize: 5,
 *  onPage: function(o){
 *      $goods.children().hide();
 *      var start = (this.currentPage - 1) * this.pagesize;
 *      var end = this.currentPage * this.pagesize - 1;
 *      $goods.children().slice(start,end + 1).css('display','block');
 *  }
 * });
 */

define('pager', function(require) {
  'use strict';

  var Pager = _.Class.extend( /** @lends Pager.prototype */ {

    /**
     * pager.
     * @constructor
     * @alias Pager
     * @param {Object} options
     * @param {String} options.el - 分页容器 (必填)
     * @param {Number} options.count - 记录数 (必填)
     * @param {Number} [options.pagesize=10] - 分页大小 
     * @param {Number} [options.displayedPages=5] - 显示几个按钮
     * @param {String} [options.btnTpl=<li class="item" data-role="{num}"><a class="num" href="javascript:;">{num}</a></li>'] - 分页按钮模板
     * @param {String} [options.btnPrevTpl=<li class="item prev" data-role="prev"><a class="num" href="javascript:;" ><span class="mod_icon mod_icon_prev"></span><span>上一页</span></a></li>] - 分页上一页按钮模板
     * @param {String} [options.btnNextTpl=<li class="item next" data-role="next"><a class="num" href="javascript:;"><span>下一页</span><span class="mod_icon mod_icon_next"></span></a></li>] - 分页下一页按钮模板
     * @param {String} [options.dotTpl=<li class="item dot" data-role="dot">...</li>] - 点点点模板
     * @param {String} [options.role=role] - 与按钮模板data-role属性配合使用
     * @param {String} [options.delegateObj=.item] - 事件委托类名
     * @param {String} [options.activeClass=active] - 选中状态类名
     * @param {Function} [options.onPage=null] - 点击分页按钮后回调函数
     * @prop {number}  currentPage - 当前页
     * @prop {number}  pages - 总页数
     * @prop {number}  pagesize - 分页大小
     */
    construct: function(options) {
      var def = {
        el: null,
        pagesize: 10, //分页大小
        pages: 0, //总页数
        count: 1, //记录数
        displayedPages: 5, //显示几个按钮
        currentPage: 1,
        btnTpl: ' <li class="item" data-role="{num}"><a class="num" href="javascript:;">{num}</a></li>',
        btnPrevTpl: '<li class="item prev" data-role="prev"><a class="num" href="javascript:;" ><span class="mod_icon mod_icon_prev"></span><span>上一页</span></a></li>',
        btnNextTpl: '<li class="item next" data-role="next"><a class="num" href="javascript:;"><span>下一页</span><span class="mod_icon mod_icon_next"></span></a></li>',
        dotTpl: '<li class="item dot" data-role="dot">...</li>',
        onPage: null,
        halfDisplayed: 0,
        delegateObj: '.item',
        activeClass: 'active',
        role: 'role'

      }
      $.extend(this, def, options || {});
      this.init();
    },

    /**
     * @description 初始化分页
     */
    init: function() {
      this.pages = Math.ceil(this.count / this.pagesize);
      this.halfDisplayed = this.displayedPages / 2;
      this.drawUI();
      this.initEvent();
    },

    /**
     * @description 初始化事件
     */
    initEvent: function() {
      var self = this;
      self.el.delegate(self.delegateObj, 'click', function() {
        var role = $(this).data(self.role);
        var currentPage = self.currentPage;
        if (role === currentPage) return;
        switch (role) {
          case 'prev':
            self.prevPage();
            break;
          case 'next':
            self.nextPage();
            break;
          case 'dot':
            return;
            break;
          default:
            currentPage = role;
            self.goToPage(currentPage);
            break;
        }

      });
    },

    /**
     * @description 初始化界面
     */
    drawUI: function() {
      var self = this;
      var html = [];
      var showDot = self.pages > self.displayedPages;
      var interval = this._getInterval(this);
      var showPrev = false;
      var showNext = true;

      if (interval.end === 0) return;

      if (self.currentPage == this.pages) {
        showNext = false;
      }
      for (var i = interval.start; i <= interval.end; i++) {
        html.push(self.btnTpl.replace(/{num}/g, i));
      }

      //不是最后一页
      if (showDot && interval.end !== self.pages) {
        html.push(self.dotTpl);
        html.push(self.btnTpl.replace(/{num}/g, self.pages));
      }

      //显示下一页按钮
      if (showNext) {
        html.push(self.btnNextTpl);
      }

      //显示上一页按钮
      if (self.currentPage > 1) {
        html.unshift(self.btnPrevTpl);
      }

      //渲染
      self.el.html(html.join('')).find('[data-' + self.role + '="' + self.currentPage + '"]').addClass(self.activeClass).siblings().removeClass(self.activeClass);

      self.onPage && self.onPage.call(self);
    },

    /**
     * @description 获取分页间隔
     * @private 
     * @param {Object} o - this
     * @return {Object} {start,end} - 返回开始与结束间隔
     */
    _getInterval: function(o) {
      return {
        start: Math.ceil(o.currentPage > o.halfDisplayed ? Math.max(Math.min(o.currentPage - o.halfDisplayed, (o.pages - o.displayedPages)), 1) : 1),
        end: Math.ceil(o.currentPage > o.halfDisplayed ? Math.min(o.currentPage + o.halfDisplayed - 1, o.pages) : Math.min(o.displayedPages, o.pages))
      };
    },

    /**
     * @description 跳转页面
     * @param {Number} page - 当前页
     */
    goToPage: function(page) {
      var cur = page;
      if (cur > this.pages) cur = this.pages;
      if (cur < 1) cur = 1;
      this.currentPage = cur;
      this.drawUI();
    },

    /**
     * @description 下一页
     */
    nextPage: function() {
      var currentPage = this.currentPage;
      currentPage += 1;
      this.goToPage(currentPage);

    },

    /**
     * @description 上一页
     */
    prevPage: function() {
      var currentPage = this.currentPage;
      currentPage -= 1;
      this.goToPage(currentPage);
    }
  });

  return Pager;
});