/**
 * @description fixable组件，具体查看类{@link Fixable},<a href="./demo/components/fixable/index.html">Demo预览</a>
 * @module fixable
 * @author wangcainuan
 * 
 * @example
 * <a href="javascript:;" class="fixable" id="fixable">固定</a>

 * @example
.fixable {
    display: block;
    position: fixed;
    left: 50%;
    bottom: 120px;
    z-index: 100;
    margin-left: 620px;
    cursor: pointer;

    width: 42px;
    height: 42px;
    text-align: center;
    line-height: 42px;
    color: #fff;
    background: #666;
}
.fixable.mini {
    left: auto;
    right: 0;
    margin-left: 0;
}


 * @example
var Fixable = seajs.require('fixable');
var fixable = new Fixable({
    fixableElement: '#fixable',
    hasFixedStyle: true,
    zIndex: 100,
    delay: 50,
    onResizeCallback: function(winWidth){
        if( winWidth < 1370 ){
            $('#fixable').addClass('mini'); 
        }else{
            $('#fixable').removeClass('mini');
        } 
    }
});
 */

define('fixable', function () {
    'use strict';

    var Fixable = _.Class.extend(/** @lends Fixable.prototype */{
    
        /**
         * @constructor
         * @alias Fixable
         * @param {Object} options - 组件配置
         * @param {String|HTMLElement} options.fixableElement - 必选，固定位置元素
         * @param {Boolean} [options.hasFixedStyle = false] - 可选，是否已经自定义了fixed样式，false添加样式，true不添加样式
         * @param {String} [options.x = 'left'] - 可选，值为'left'或'right'
         * @param {String} [options.y = 'top'] - 可选，值为'top'或'bottom'
         * @param {String} [options.xValue = 0] - 可选，左右偏移值如'20px',而'center'时为居中
         * @param {String} [options.yValue = 0] - 可选，上下偏移值如'center'为居中
         * @param {Number} [options.zIndex = null] - 可选，z-index
         * @param {Number} [options.delay = 50] - 可选，窗口发生变化触发的节流时间（目前只支持window大小变化）
         * @param {Function} [options.onResizeCallback = null] - 可选，窗口发生变化后触发的自定义函数，第一个参数是当前窗口的大小
         */
        construct: function(options){
            
            $.extend(this, {
                fixableElement: null,
                hasFixedStyle: false, 
                x: 'left',
                y: 'top',
                xValue: 0 ,
                yValue: 0,
                zIndex: null,
                delay: 50,
                onResizeCallback: null
            }, options);

            this.init();
        },
        
        /**
         * @description 组件初始化
         */
        init: function(){

            var self = this;
            self.$fixableElement = $(self.fixableElement);
            self.onResizeTimer = null;
            if ( self.zIndex != null ) {
                self.$fixableElement.css('z-index', self.zIndex);
            }
            self.initEvent();

        },


        /**
         * @description 页面滚动、返回顶部事件绑定
         * @private
         */
        initEvent: function(){

            var self = this;
            var $fixableElement = self.$fixableElement;
            var $window = $(window);

            if ( self.hasFixedStyle === false ) {
                // 调整坐标
                self.convertPosition();
            }

            if ( self.onResizeCallback !== null ) {
                self.onResizeCallback($window.width());
                // window 绑定window大小变化事件
                $window.bind('resize',$.proxy(self.onResize,self));
            }
            
 
        },

        /**
         * @description 页面大小变化时切换位置
         * @private
         */
        convertPosition: function(){

            var self = this;
            var $fixableElement = self.$fixableElement;
            var xValue = self.xValue;
            var yValue = self.yValue;
            var currentStyle = {};
            var w;
            var h;

            if(xValue == 'center') {
                w = $fixableElement.outerWidth()/2;
                currentStyle.marginLeft = -w;
                xValue = '50%';
            }

            if(yValue == 'center') {
                h = $fixableElement.outerHeight()/2;
                currentStyle.marginTop = -h;
                yValue = '50%';
            }

            currentStyle.position = 'fixed';
            currentStyle[self.x] = xValue;
            currentStyle[self.y] = yValue;
            
            $fixableElement.css(currentStyle);

        },


        /**
         * @description 页面大小变化监听
         * @private
         */
        onResize: function(){

            var self = this;
            var $fixableElement = self.$fixableElement;
            var $window = $(window);
            var winWidth;
            
            clearTimeout(self.onResizeTimer);
            self.onResizeTimer = setTimeout(function () {
                winWidth = $window.width();
                self.onResizeCallback(winWidth);
            }, self.delay);
        }

    
    });
    return Fixable;
});