/**
 * @description 对话框组件，具体查看类{@link Dialog},<a href="./demo/components/dialog/index.html">Demo预览</a>
 * @module Dialog
 * @author mihan
 * 
 * @example
var Dialog = seajs.require('Dialog');
var dom = '';
var dialog = new Dialog({
    txtInfo: {
        title: 'text',
        description: 'text',
        confirm: 'text',
        cancel: 'text',
        ...
    },
    container: 'container'
});

dom = ['<div class="container" id="container">',
    '        <div class="box">',
    '            <h1>' + dialog.txtInfo.title + '</h1>',
    '            <p>' + dialog.txtInfo.desc + '</p>',
    '            <div class="btns"><a href="#" class="btns_a">' + dialog.txtInfo.confirm + '</a><a href="#" class="btns_b">' + dialog.txtInfo.cancel + '</a></div>',
    '            <div class="close">X</div>',
    '        </div>          ',
    '    </div>'].join("");

dialog.render({
    dom: dom
});

dialog.callBack({
    'selecter': function(){
        do something...
    },
    '.close': function(){
        dialog.$container.toggle();
    },
    ...
});
 */

define('Dialog', function () {
    'use strict';

    var Dialog = _.Class.extend(/** @lends Dialog.prototype */{
    
        /**
         * @constructor
         * @alias Dialog
         * @param {Object} opts - 组件配置
         * @param {String} opts.container - 必选，对话框容器
         * @param {Object} [opts.txtInfo] - 对话框文本信息
         */
        construct: function(opts){
            this.config = {
                txtInfo: null,
                container: ''
            }
            
            if(opts){
                $.extend(this.config,opts);
            }
                
            this.checkRun();
        },

        /**
         * @description 检查组件是否可执行
         * @private
         */
        checkRun: function(){
            var config = this.config;
            if( 
                config.container == '' 
            ){
                return; 
            }else{
                this.init();
            }
            
        },
        
        /**
         * @description 组件初始化
         * @private
         */
        init: function(){
            var conf = this.config;
            this.txtInfo = conf.txtInfo === null ? '' : conf.txtInfo;
            this.isRender = false;
        },

        
        /**
         * @description 对话框渲染
         * @param {Object} opts - 参数集
         * @param {String} opts.dom - 对话框 HTML 结构字符串
         */
        render: function(opts){
            var _this = this;
            var conf = this.config;
            var $container = null;
            $('body').append(opts.dom);
            $container = $('#' + conf.container);
            $container.toggle();
            this.$container = $container;
            this.isRender = true;
        },

        /**
         * @description 对话框按钮回调函数
         * @param {Object} opts - 按钮集合
         * @param {String} opts.key  - 按钮选择器名
         * @param {Function} opts.value - 按钮回调函数
         */
        callBack: function(opts){
            var _this = this;
            if(opts){
                $.each(opts,function(selecter,callback){
                    _this.$container.find(selecter).unbind('click.defined');
                    _this.$container.find(selecter).bind('click.defined',function(){
                        callback();
                    });
                })
            }                
                
        }

    });

    return Dialog;
    
});