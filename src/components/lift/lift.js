/**
 * @description lift组件，具体查看类{@link Lift},<a href="./demo/components/lift/index.html">Demo预览</a>
 * @module lift
 * @author mihan
 * @example
 * var Lift = seajs.require('lift');
 * var lift = new Lift({
 *     container: $('#hangNav'), 
 *     backTop: $('#backTop'), 
 *     itemSelectedClassName: 'index_mod_hang_item_on' 
 * });
 */

define('lift', function () {
    'use strict';

    var Lift = _.Class.extend(/** @lends Lift.prototype */{
    
        /**
         * @constructor
         * @alias Lift
         * @param {Object} opts - 组件配置
         * @param {Object} opts.container - 必选，JQ对象，电梯列表容器
         * @param {Object} [opts.backTop = null] - 可选，JQ对象，返回顶部按钮
         * @param {String} [opts.itemSelectedClassName = ''] - 可选，电梯列表项选中样式 ClassName
         * @param {Object} [opts.floorList = $('.JS_floor') ] - 可选，JQ对象，楼层列表
         * @param {Object} [opts.liftList = $('.JS_lift')] - 可选，JQ对象，电梯列表
         * @param {Number} [opts.speed = 800] - 可选，页面滚动动画时间
         */
        construct: function(opts){
            this.config = {
                container: null,
                backTop: null,
                itemSelectedClassName: '',
                floorList: $('.JS_floor'),
                liftList: $('.JS_lift'),
                speed: 800
            }
            
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
            this.config.liftList = this.config.container.find('.JS_lift'); // 精确找到电梯容器内的列表项勾子，以防冲突
            this.checkRun(); // 检查是否可以运行组件
        },


        /**
         * @description 检查组件是否可运行
         * @returns {Boolean} 如果电梯列表容器、楼层勾子『.JS_floor』和 电梯列表项勾子『.JS_lift』缺一项，返回 false，组件将终止运行
         */
        checkRun: function(){
            var config = this.config;
            if(config.container == null ||  config.floorList.length == 0 || config.liftList.length == 0 ){
                return; 
            }else{
                this.start();
            }
        },


        /**
         * @description 运行组件
         */
        start: function(){
            this.bindEvents();
        },


        /**
         * @description 获取楼层位置信息
         * @returns {Null | Array} 返回楼层位置信息
         */
        getFloorInfo: function(){
            var config = this.config,
                floorInfo = [];

            if(config.floorList.length > 0){
                config.floorList.each(function(){
                    floorInfo.push($(this).offset().top);
                });
                return floorInfo;
            }else{
                return null
            }
             
        },

        /**
         * @description 电梯滚动、电梯跳转、返回顶部事件绑定
         */
        bindEvents: function(){
            var config = this.config;
            var $BackTop = config.backTop;
            var _this = this;

            // window 绑定电梯滚动事件
            _this.$window.bind('scroll.lift',{thisObj:_this},_this.lift);

            // 绑定电梯跳转事件
            config.container.delegate('.JS_lift','click.lift',{thisObj: _this},_this.liftJump);

            // 绑定返回顶部事件
            if($BackTop !== null && $BackTop.length > 0){
                $BackTop.bind('click.backTop',{thisObj:_this},_this.backTop);
            }


        },


        /**
         * @description 返回顶部
         * @param {any} event - event对象
         * @param {Object} event.data - jQuery bind 方法 eventData 对象参数
         * @param {Object} event.data.thisObj - 传递本类 Lift 对象
         * @returns {Boolean} 防止事件冒泡
         */
        backTop: function(event){
            var _this = event.data.thisObj;
            var config = _this.config;
            _this.$window.unbind('scroll.lift');
            $('body,html').stop().animate({
                scrollTop: 0
            },config.speed,function(){
                _this.$window.bind('scroll.lift',{thisObj:_this},_this.lift);
                config.liftList.removeClass(config.itemSelectedClassName);
            });
            return false;
        },


        /**
         * @description 电梯滚动
         * @param {any} event - event对象
         * @param {Object} event.data - jQuery bind 方法 eventData 对象参数
         * @param {Object} event.data.thisObj - 传递本类 Lift 对象
         */
        lift: function(event){
            var _this = event.data.thisObj;
            var config = _this.config;
            var winScrollTop = _this.$window.scrollTop();
            var itemSelectedClass = config.itemSelectedClassName;
            clearTimeout(_this.timer);            
            $.each(_this.getFloorInfo(),function(index,value){
                if( winScrollTop >= (value - _this.WIN_H/2 + 5) ){
                    config.liftList.eq(index).addClass(itemSelectedClass).siblings('.JS_lift').removeClass(itemSelectedClass);
                }else{
                    if( winScrollTop >= _this.DOC_H -  _this.WIN_H/2 - 5){
                        config.liftList.eq(index).addClass(itemSelectedClass).siblings('.JS_lift').removeClass(itemSelectedClass);
                    } 
                }
                
                if(winScrollTop < (_this.getFloorInfo()[0] - _this.WIN_H/2) ){
                    config.liftList.removeClass(itemSelectedClass);
                }
            })
        },

        /**
         * @description 电梯跳转
         * @param {any} event - event对象
         * @param {Object} event.data - jQuery bind 方法 eventData 对象参数
         * @param {Object} event.data.thisObj - 传递本类 Lift 对象
         */
        liftJump: function(event){
            var _this = event.data.thisObj;
            var config = _this.config;
            clearTimeout(_this.timer);
            $(this).addClass(config.itemSelectedClassName).siblings('.JS_lift').removeClass(config.itemSelectedClassName);
            _this.$window.unbind('scroll.lift',_this.lift);
            $('body,html').stop().animate({
                scrollTop: _this.getFloorInfo()[$(this).index( config.container.selector  + ' .JS_lift')]
            },config.speed,function(){
                _this.timer = setTimeout(function(){
                    _this.$window.bind('scroll.lift',{thisObj:_this},_this.lift);
                },50);
            });
        }

    });

    return Lift;
    
});