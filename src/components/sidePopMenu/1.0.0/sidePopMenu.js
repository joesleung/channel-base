/**
 * @description 导航菜单浮层组件，具体查看类{@link SidePopMenu},<a href="./demo/components/sidePopMenu/index.html">Demo预览</a>
 * @module SidePopMenu
 * @author mihan
 * 
 * @example
<div class="mod_side" id="sideBox">
    <div class="JS_navCtn mod_side_nav">
        <div class="mod_side_nav_item">...</div>
        ...
    </div>
    <div class="JS_popCtn mod_side_pop">
        <div class="mod_side_pop_item">...</div>
        ...
    </div>
</div>

@example
var SidePopMenu = seajs.require('SidePopMenu');
var popMenu = new SidePopMenu({
    $container: $('#sideBox'), 
    navItemHook: '.mod_side_nav_item',
    popItemHook: '.mod_side_pop_item'
    navItemOn: 'mod_side_nav_item_on'
});
 */

define('sidePopMenu', function () {
  'use strict';

  var SidePopMenu = _.Class.extend( /** @lends sidePopMenu.prototype */ {

    /**
     * @constructor
     * @alias SidePopMenu
     * @param {Object} opts - 组件配置
     * @param {Object} opts.$container - 必选，组件容器JQ对象，请使用ID选择器确保唯一
     * @param {String} opts.navItemHook - 必选，侧导航列表选择器
     * @param {String} opts.navItemHook - 必选，浮层菜单列表选选择器
     * @param {String} [opts.navCtnHook = '.JS_navCtn'] - 侧导航容器选择器
     * @param {String} [opts.popCtnHook = '.JS_popCtn'] - 浮屠菜单容器选择器
     * @param {String} [opts.navItemOn = ''] - 侧导航造中样式 className
     * @param {Number} [opts.moveDeg = 60] - 侧导航向浮屠菜单方向移动时不切换 Tab 的最大水平夹度
     * @param {Boolean} [opts.isAuto = false] - 菜单浮层是否自适应定位
     * @param {String} [opts.menuDirection = 'right'] - opts.moveDeg 的有效水平方向，默认导航右侧『right』，左侧为『left』
     * @param {Function} [opts.itemEnterCallBack = null] - 侧导航列表项『mouseenter』回调函数
     */
    construct: function (opts) {
      this.config = {
        $container: null,
        navItemHook: '',
        popItemHook: '',
        navCtnHook: '.JS_navCtn',
        popCtnHook: '.JS_popCtn',
        navItemOn: '',
        moveDeg: 70,
        isAuto: false,
        menuDirection: 'right',
        itemEnterCallBack: null,
      };

      if (opts) {
        $.extend(this.config, opts);
      }

      this.checkRun();
    },

    /**
     * @description 检查组件是否够条件执行
     * @private
     */
    checkRun: function () {
      var config = this.config;
      if (
        config.$container == null ||
        $(config.navCtnHook).length == 0 ||
        $(config.popCtnHook).length == 0 ||
        config.navItemHook == '' ||
        config.popItemHook == ''
      ) {
        return;
      } else {
        this.init();
      }

    },

    /**
     * @description 组件初始化
     */
    init: function () {
      var conf = this.config;
      this.$navCtn = conf.$container.find(conf.navCtnHook);
      this.$popCtn = conf.$container.find(conf.popCtnHook);
      this.$navItemList = this.$navCtn.find(conf.navItemHook);
      this.$popItemList = this.$popCtn.find(conf.popItemHook);
      this.potCollect = []; // 鼠标在导航Tab移动的时候轨迹坐标信息
      this.moveTimer = null; // 鼠标在导航Tab移动的时候暂停切换定时器
      this.enterTimer = null; // 鼠标进入导航Tab时候状态延迟切换定时器
      this.isBind = false; // 导航Tab暂时切换时是否绑定Tab『mouseenter』
      this.$window = $(window);
      this.callback = null;
      this.initEvents();
    },

    /**
     * @description 获收浮层菜单信息
     * @private
     */
    getNavItemInfo: function () {
      var conf = this.config;
      var info = [];

      conf.$container.find(conf.navItemHook).each(function () {
        var $this = $(this);
        var position = $this.position();
        info.push({
          thisHeight: $this.outerHeight(true).toFixed(0),
          thisWidth: $this.outerWidth().toFixed(0),
          thisPstX: position.left,
          thisPstY: position.top,
          thisPageY: $this.offset().top
        });
      });

      return info;
    },

    /**
     * @description 事件绑定初始化
     * @private
     */
    initEvents: function () {
      var _this = this;
      var conf = _this.config;


      conf.$container.bind('mouseleave', $.proxy(_this.ctnLeave, _this));

      _this.$navCtn.delegate(
        conf.navItemHook, {
          'mouseenter.itemEnter': _this.navItemEnter,
          'mousemove.itemMove': _this.navItemMove,
          'mouseleave.itemLeave': _this.navItemLeave
        }, {
          thisObj: _this,
          callback: conf.itemEnterCallBack
        }
      );
      _this.$navCtn.delegate(conf.navItemHook, 'mousemove.itemMove', util.throttle(_this.navItemMove, _this.moveTimer), {
        thisObj: _this,
        callback: conf.itemEnterCallBack
      });
      _this.isBind = true;

    },

    /**
     * @description 组件容器『mouseleave』事件
     * @private
     */
    ctnLeave: function () {
      var _this = this;
      var conf = _this.config;
      _this.$navItemList.removeClass(conf.navItemOn);
      _this.$popCtn.hide();
      _this.$popItemList.hide();
      _this.moveTimer = null;
      _this.enterTimer = null;
    },

    /**
     * @description 导航列表『mouseenter』事件重新绑定
     * @private
     */
    reBindNavItemEnter: function () {
      var _this = this;
      var conf = _this.config;
      _this.$navCtn
        .delegate(
        conf.navItemHook,
        'mouseenter.itemEnter', {
          thisObj: _this,
          callback: conf.itemEnterCallBack
        },
        _this.navItemEnter
        );
      _this.isBind = true;
    },

    /**
     * @description 导航列表『mouseenter』事件解绑
     * @private
     */
    unbindNavItemEnter: function () {
      var _this = this;
      var conf = _this.config;
      _this.$navCtn.undelegate('.itemEnter');
      _this.isBind = false;
    },

    /**
     * @description 导航列表『mouseenter』事件
     * @private
     * @param {Object} event - evnet对象
     * @param {Object} event.data - jQuery delegate 方法 eventData 对象参数
     * @param {Object} event.data.thisObj - 传递本类对象
     * @param {Object} event.data.callback - navItemEnter 回调函数
     */
    navItemEnter: function (event) {
      var _this = event.data.thisObj;
      var $this = $(this);
      var conf = _this.config;
      var thisCallback = event.data.callback;
      var thisIndex = $(this).index(conf.$container.selector + ' ' + conf.navItemHook);
      var time = null;
      var thisInfo = [];

      $this.addClass(conf.navItemOn).siblings(conf.$container.selector + ' ' + conf.navItemHook).removeClass(conf.navItemOn);
      _this.$popCtn.show();
      var $el = _this.$popItemList.eq(thisIndex);
      $el.show().siblings(conf.$container.selector + ' ' + conf.popItemHook).hide();

      // 是否使用自适应定位
      if (conf.isAuto) {
        _this.popAutoShow(thisIndex, $this);
      }

      //如果传入回调函数，侧执行
      if (typeof thisCallback === 'function') {
        thisCallback({
          $displayEl: $el
        });
      }

    },

    popAutoShow: function (thisIndex, $this) {
      var _this = this;
      var $this = $this;
      var conf = _this.config;
      var thisIndex = $this.index(conf.$container.selector + ' ' + conf.navItemHook);
      var thisInfo = [];
      var popView = 0;

      thisInfo = _this.getNavItemInfo();
      switch (conf.menuDirection) {
        case 'right':
          _this.$popCtn.css({
            'position': 'absolute',
            'left': thisInfo[thisIndex].thisWidth + 'px',
            'top': thisInfo[thisIndex].thisPstY - thisInfo[thisIndex].thisHeight + 'px',
            'right': 'auto',
            'bottom': 'auto'
          });

          popView = _this.$window.height().toFixed(0) - (thisInfo[thisIndex].thisPageY - _this.$window.scrollTop());

          if (thisInfo[thisIndex].thisPstY < thisInfo[thisIndex].thisHeight) {
            _this.$popCtn.css('top', '0px');
          } else if (popView < _this.$popCtn.height().toFixed(0)) {
            _this.$popCtn.css({
              'top': (thisInfo[thisIndex].thisPstY - (_this.$popCtn.height().toFixed(0) - popView)) + 'px'
            });
          }

          break;
        case 'left':
          _this.$popCtn.css({
            'position': 'absolute',
            'left': 'auto',
            'top': thisInfo[thisIndex].thisPstY - thisInfo[thisIndex].thisHeight + 'px',
            'right': thisInfo[thisIndex].thisWidth + 'px',
            'bottom': 'auto'
          });

          popView = _this.$window.height().toFixed(0) - (thisInfo[thisIndex].thisPageY - _this.$window.scrollTop());

          if (thisInfo[thisIndex].thisPstY < thisInfo[thisIndex].thisHeight) {
            _this.$popCtn.css('top', '0px');
          } else if (popView < _this.$popCtn.height().toFixed(0)) {
            _this.$popCtn.css({
              'top': (thisInfo[thisIndex].thisPstY - (_this.$popCtn.height().toFixed(0) - popView)) + 'px'
            });
          }

          break;
      }
    },


    /**
     * @description 侧导航列表『mousemove』事件
     * @param {Object} event - evnet对象
     * @param {Object} event.data - jQuery delegate 方法 eventData 对象参数
     * @param {Object} event.data.thisObj - 传递本类对象
     * @returns {Boolean} false - 防止冒泡
     */
    navItemMove: function (event) {
      var _this = event.data.thisObj;
      var $this = $(this);
      var conf = _this.config;
      var e = event;
      var deg = conf.moveDeg * (2 * Math.PI / 360); //弧度转换
      var tanSet = Math.tan(deg).toFixed(2); //配置角度的 tan 值
      var tanMove = 0; // 移动过程的 tan 值
      var moveX = 0; // 单位时间内鼠标移动的水平距离
      var moveY = 0; // 单位时间内鼠标移动的垂直距离
      var start = null; // 单位时间内鼠标坐标起点
      var end = null; // 单位时间内鼠标坐标终点

      // 鼠标在暂停区域内移动暂停切换
      function stopSwitch() {
        clearTimeout(_this.moveTimer);
        if (_this.isBind) {
          _this.unbindNavItemEnter();
        }

        _this.moveTimer = setTimeout(function () {
          _this.reBindNavItemEnter();
        }, 100);
      }

      // 鼠标在非暂停区域内重新激活导航Tab切换
      function startSwitch() {
        clearTimeout(_this.moveTimer);

        if (_this.isBind) {
          return;
        } else {
          _this.reBindNavItemEnter();
        }
      }

      // 出力 push 存入鼠标坐标点
      _this.potCollect.push({
        x: e.pageX,
        y: e.pageY
      });

      //存4个坐标点的时间作为单位时间，醉了。。。
      if (_this.potCollect.length > 4) {
        _this.potCollect.shift();
        start = _this.potCollect[0];
        end = _this.potCollect[_this.potCollect.length - 1];
        moveX = end.x - start.x;
        moveY = end.y - start.y;
        tanMove = Math.abs((moveY / moveX).toFixed(2));

        switch (conf.menuDirection) {
          case 'right':
            if (tanMove <= tanSet && moveX > 0) {
              stopSwitch();
            } else {
              startSwitch();
            }
            break;

          case 'left':
            if (tanMove <= tanSet && moveX < 0) {
              stopSwitch();
            } else {
              startSwitch();
            }
            break;
        }

      }

      // 防止在暂停区域移动过程中鼠标没移到浮层菜单而移到另一个Tab而没有切换
      clearTimeout(_this.enterTimer);
      _this.enterTimer = setTimeout(function () {
        $this.trigger('mouseenter', {
          thisObj: _this,
          callback: conf.itemEnterCallBack
        });
      }, 300);
      return false;
    },

    navItemLeave: function (event) {
      var _this = event.data.thisObj;
      var $this = $(this);
      var conf = _this.config;

      //暂停区域移动过程中鼠标移到浮层菜单后取消Tab切换
      clearTimeout(_this.enterTimer);
    },


  });

  return SidePopMenu;

});