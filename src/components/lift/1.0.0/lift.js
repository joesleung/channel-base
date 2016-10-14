/**
 * @description lift组件，具体查看类{@link Lift},<a href="./demo/components/lift/index.html">Demo预览</a>
 * @module Lift
 * @author mihan
 * 
 * @example
<div class="JS_floor floor">floor1</div>
<div class="JS_floor floor">floor2</div>
..
<div class="JS_floor floor">floorN</div>
<div id="contianer">
   <div class="JS_lift item"></div>
   <div class="JS_lift item item_on"></div>
   ...
   <div id="backTop"></div>
</div>

 * @example
var Lift = seajs.require('lift');
var lift = new Lift({
    $container: $('#contianer'), 
    $backTop: $('#backTop'), 
    itemSelectedClassName: 'item_on' 
});
 */

define('lift', function () {
    'use strict';

    var Lift = _.Class.extend(/** @lends Lift.prototype */{
    
        /**
         * @constructor
         * @alias Lift
         * @param {Object} opts - 组件配置
         * @param {Object} opts.$container - 必选，JQ对象，电梯列表容器
         * @param {Object} [opts.$backTop = null] - 可选，JQ对象，返回顶部按钮
         * @param {String} [opts.floorListHook = '.JS_floor'] - 可选，楼层列表项勾子
         * @param {String} [opts.liftListHook = '.JS_lift'] - 可选，电梯列表项勾子
         * @param {String} [opts.itemSelectedClassName = ''] - 可选，电梯列表项选中样式 ClassName
         * @param {Number} [opts.startShowPosition = 0] - 可选，电梯出现的起始位置
         * @param {Number} [opts.scrollDelay = 0] - 可选，电梯滚动节流时间
         * @param {Number} [opts.speed = 800] - 可选，页面滚动动画时间
         */
        construct: function(opts){
            this.config = {
                $container: null,
                $backTop: null,
                floorListHook: '.JS_floor',
                liftListHook: '.JS_lift',
                itemSelectedClassName: '',
                startShowPosition: 0,
                scrollDelay: 200,
                speed: 800
            };
            
            if(opts){
                $.extend(this.config,opts);
            }
                
            this.init();
        },
        
        /**
         * @description 组件初始化
         */
        init: function(){
            this.$window = $(window); 
            this.WIN_W = this.$window.width();
            this.WIN_H = this.$window.height();
            this.DOC_H = $(document).height();
            this.timer = null;
            this.scrollTimer = null;
            this.$floorList = $(this.config.floorListHook);
            this.$liftList = this.config.$container.find(this.config.liftListHook); // 精确找到电梯容器内的列表项勾子，以防冲突
            this.checkRun(); // 检查是否可以运行组件
        },

        /**
         * @description 检查组件是否可运行
         * @private
         * @returns {Boolean} 如果电梯列表容器『config.$container』、楼层勾子『this.$floorList』 电梯列表项勾子『this.$liftList』缺一项，返回 false，组件将终止运行
         */
        
        checkRun: function(){
            var config = this.config;
            if(config.$container == null ||  this.$floorList.length == 0 || this.$liftList.length == 0 ){
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
            this.bindEvents();
        },


        /**
         * @description 获取楼层位置信息
         * @returns {Null | Array} 返回楼层位置信息数组
         */
        getFloorInfo: function(){
            var floorInfo = [];

            if(this.$floorList.length > 0){
                this.$floorList.each(function(){
                    floorInfo.push($(this).offset().top);
                });
                return floorInfo;
            }else{
                return null;
            }
             
        },

        /**
         * @description 电梯滚动、电梯跳转、返回顶部事件绑定
         * @private
         */
        bindEvents: function(){
            var config = this.config;
            var $BackTop = config.$backTop;
            var _this = this;

            // window 绑定电梯滚动事件
            _this.$window.bind('scroll.lift',$.proxy(_this.lift,_this));

            // 绑定电梯跳转事件
            config.$container.delegate(config.liftListHook,'click.lift',{thisObj:_this},_this.liftJump);

            // 绑定返回顶部事件
            if($BackTop !== null && $BackTop.length > 0){
                $BackTop.bind('click.backTop',$.proxy(_this.backTop,_this));
            }
        },

        /**
         * @description 返回顶部
         * @private
         * @returns {Boolean} 防止事件冒泡
         */
        backTop: function(){
            var _this = this;
            var config = _this.config;
            _this.$window.unbind('scroll.lift');
            $('body,html').stop().animate({
                scrollTop: 0
            },config.speed,function(){
                _this.$window.bind('scroll.lift',$.proxy(_this.lift,_this));
                _this.$liftList.removeClass(config.itemSelectedClassName);
            });
            return false;
        },

        /**
         * @description 电梯滚动
         * @private
         */
        lift: function(){
            var _this = this;
            var config = _this.config;
            clearTimeout(_this.timer);
            clearTimeout(_this.scrollTimer);
            _this.scrollTimer = setTimeout(function () {
                var winScrollTop = _this.$window.scrollTop();
                var itemSelectedClass = config.itemSelectedClassName;
                if (winScrollTop >= config.startShowPosition) {
                    config.$container.fadeIn();
                    $.each(_this.getFloorInfo(),function (index, value) {
                        if( winScrollTop >= (value - _this.WIN_H/2 + 5) ){
                            _this.$liftList.eq(index).addClass(itemSelectedClass).siblings(config.liftListHook).removeClass(itemSelectedClass);
                        }else{
                            if( winScrollTop >= _this.DOC_H -  _this.WIN_H/2 - 5){
                                _this.$liftList.eq(index).addClass(itemSelectedClass).siblings(config.liftListHook).removeClass(itemSelectedClass);
                            } 
                        }
                        
                        if(winScrollTop < (_this.getFloorInfo()[0] - _this.WIN_H/2) ){
                            _this.$liftList.removeClass(itemSelectedClass);
                        }
                    });
                } else {
                    config.$container.fadeOut();
                }
            }, config.scrollDelay);
        },

        /**
         * @description 电梯跳转
         * @private
         * @param {any} event - event对象
         * @param {Object} event.data - jQuery bind 方法 eventData 对象参数
         * @param {Object} event.data.thisObj - 传递本类 Lift 对象
         */
        liftJump: function(event){
            var _this = event.data.thisObj;
            var config = _this.config;
            clearTimeout(_this.timer);
            $(this).addClass(config.itemSelectedClassName).siblings(config.liftListHook).removeClass(config.itemSelectedClassName);
            _this.$window.unbind('scroll.lift');
            $('body,html').stop().animate({
                scrollTop: _this.getFloorInfo()[$(this).index( config.$container.selector  + ' ' + config.liftListHook)]
            },config.speed,function(){
                _this.timer = setTimeout(function(){
                    _this.$window.bind('scroll.lift',$.proxy(_this.lift,_this));
                },50);
            });
        }
    });
    return Lift;
});