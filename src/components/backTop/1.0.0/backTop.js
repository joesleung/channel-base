/**
 * @description backTop组件，具体查看类{@link BackTop},<a href="./demo/components/backTop/index.html">Demo预览</a>
 * @module backTop
 * @author wangcainuan
 * 
 * @example
 * <a href="javascript:;" id="backTop">Top</a>

 * @example
 var BackTop = seajs.require('backTop');
 var backTop = new BackTop({
     backTop: '#backTop',
     startShowPosition: 400,
     delay: 50,
     speed: 300
 });
 */

define('backTop', function () {
    'use strict';

    var BackTop = _.Class.extend(/** @lends BackTop.prototype */{
    
        /**
         * @constructor
         * @alias BackTop
         * @param {Object} options - 组件配置
         * @param {String|HTMLElement} options.backTop - 必选，返回顶部按钮
         * @param {Number} [options.startShowPosition = 0] - 可选，电梯出现的起始位置
         * @param {Number} [options.delay = 50] - 可选，页面滚动节流时间
         * @param {Number} [options.speed = 800] - 可选，页面滚动动画时间
         */
        construct: function(options){
            
            $.extend(this, {
                backTopElement: null,
                startShowPosition: 0,
                delay: 50,
                speed: 500
            }, options);

            this.init();
        },
        
        /**
         * @description 组件初始化
         */
        init: function(){

            this.$backTop = $(this.backTopElement);
            this.$window = $(window);
            this.scrollTimer = null;
            
            this.checkRun(); // 检查是否可以运行组件
        },


        /**
         * @description 检查组件是否可运行
         * @private
         * @returns {Boolean} 如果回到顶部按钮『this.$backTop』不存在，返回 false，组件将终止运行
         */
        
        checkRun: function(){
            
            if(this.$backTop == null ||  this.$backTop.length == 0 ){
                return; 
            }else{
                this.start();
            }
        },

        /**
         * @description 运行组件
         * @private
         */
        start: function(){
            this.initEvent();
        },

        /**
         * @description 页面滚动、返回顶部事件绑定
         * @private
         */
        initEvent: function(){

            var self = this;
            var $backTop = self.$backTop;

            // window 绑定页面滚动事件
            self.$window.bind('scroll.winScroll',$.proxy(self.winScroll,self));

            // 绑定返回顶部事件
            $backTop.bind('click.backTop', $.proxy(self.backToTop, self));  
        },

        /**
         * @description 判断是否显示
         * @private
         */
        ifShow: function(){

            var self = this;
            var winScrollTop = self.$window.scrollTop();
            
            if (winScrollTop >= self.startShowPosition) {
                self.$backTop.fadeIn();
            } else {
                self.$backTop.fadeOut();
            }
        },

        /**
         * @description 返回顶部
         * @private
         * @returns {Boolean} 防止事件冒泡
         */
        backToTop: function(){

            var self = this;

            // 不触发scroll.winScroll滚动事件
            self.$window.unbind('scroll.winScroll');

            $('body,html').stop().animate({
                scrollTop: 0
            },self.speed,function(){
                self.ifShow();
                self.$window.bind('scroll.winScroll',$.proxy(self.winScroll,self));
            });

            return false;
        },

        /**
         * @description 页面滚动
         * @private
         */
        winScroll: function(){

            var self = this;
            var $backTop = self.$backTop;
            
            clearTimeout(self.scrollTimer);
            self.scrollTimer = setTimeout(function () {
                    self.ifShow();
            }, self.delay);
        }

    
    });
    return BackTop;
});