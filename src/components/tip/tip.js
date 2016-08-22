 /* @description tip组件，具体查看类{@link tip}，<a href="./demo/components/tip/index.html">Demo预览</a>
 * @module tip
 * @author YL
 * @example
 * var Tip = seajs.require('tip');
 *   var tip = new Tip({
 *     
 *   });
 */

 define("tip", function(){
    'use strict';

    var Tip = _.Class.extend(/** @lends Tip.prototype */{
    /**
     * @constructor
     * @alias Tip
     * @param {Object} opts - 组件配置
     * @param {Boolean} [opts.auto = true] - 可选，是否开启hover的
     * @param {String}  [opts.placement = "right"] - 可选，tip的方位
     * @param {String}  [opts.border = "red"] - 可选，tip边框颜色
     * @param {String}  [opts.bg = "red"] - 可选，tip背景色
     */
        construct: function (options) {
          $.extend(this, {
            auto: false,
            placement: "right",
            duration: 500,
            delay: 0,
          }, options);

          this.tipOption = {
            template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
            text: ""
          };

          this.tagList = []; //存放手动创建的tip标记

          this.init();
        },

        /**
         * @description 一些初始化操作
         */
        init: function () {
          this.initEvent();
        },

        /**
         * @description 页面tip元素初始化操作
        */
        initEvent: function () {
            var $tips = $("[o2-tip]")
            var _this = this;
            if(this.auto && $tips.length > 0){
                $("body").delegate("[o2-tip]", "mouseover", $.proxy(_this.enter, _this));
                $("body").delegate("[o2-tip]", "mouseout", $.proxy(_this.leave, _this));
            }
        },

        /**
         * @description mousehover
        */
        enter: function (event) {
            var $target = $(event.target);
            this.createTip({
                text: $target.attr("o2-tip"),
                $obj: $target,
                placement: $target.attr("o2-placement") || this.placement
            });
        },

        /**
         * @description mouseout
        */
        leave: function () {
            this.removeTip();
        },

        /**
         * @description 计算目标元素在文档中的位置
        */
        calculateTarget: function ($obj) {
            return {
                "left": $obj.offset().left,
                "right": $obj.width() + $obj.offset().left,
                "top": $obj.offset().top,
                "bottom": $obj.height() + $obj.offset().top
            }
        },

        /**
         * @description 提示框的样式
        */
        arrowStyle: function () {

        },

        /**
         * @description 创建一个tip
        */
        createTip: function (option) {
            var $tip = $(this.tipOption.template);
            $("body").append($tip);
            if(option.tag){//给手动创建的tip打上标签，方便指定清除
                $tip.attr("data-tag", option.tag);
                this.tagList.push(option.tag);
            }
            $tip.find(".tooltip-inner").text(option.text);
            $tip.css({"position": "absolute", "z-index": 9999, "opacity":1});
            switch (option.placement) {
                case "top": 
                    $tip.find(".tooltip-arrow").addClass("top");
                    $tip.css({
                        "left": (option.$obj.width()- $tip.width())/2 + this.calculateTarget(option.$obj).left,
                        "top": this.calculateTarget(option.$obj).top - $tip.height() - 5
                    });
                    break;
                case "bottom": 
                    $tip.find(".tooltip-arrow").addClass("bottom");
                    $tip.css({
                        "left": (option.$obj.width()- $tip.width())/2 + this.calculateTarget(option.$obj).left,
                        "top": this.calculateTarget(option.$obj).top + option.$obj.height() + 5
                    });
                    break;
                case "right":
                    $tip.find(".tooltip-arrow").addClass("right");
                    $tip.css({
                        "left": option.$obj.width() + this.calculateTarget(option.$obj).left + 5,
                        "top": this.calculateTarget(option.$obj).top + (option.$obj.height() - $tip.height())/2
                    });
                    break;
                case "left": 
                    $tip.find(".tooltip-arrow").addClass("left");
                    $tip.css({
                        "left": this.calculateTarget(option.$obj).left - $tip.width() - 5,
                        "top": this.calculateTarget(option.$obj).top + (option.$obj.height() - $tip.height())/2
                    });
                    break;
            }
        },

        /**
         * @description 销毁当前的tip
        */
        removeTip: function(){
            $("body").find(".tooltip").last().remove()
        },

        /**
         * @description 触发显示一个tip
        */
        show: function (option) {
            if(this.checkTip()){
                this.createTip({
                    $obj: option.$obj,
                    placement: option.placement,
                    text: option.text,
                    tag: option.tag
                });
            }
        },

        /**
         * @ description 检查是否存在已有标签的tip，防止重复创建
        */
        checkTip: function (tag) {
            if(this.inArray(this.tagList, tag)){
                throw new Error("Duplicate tip's \"tag\" attribute, tag attributes should be unique!");
                return false;
            }
            return true;
        },

        /**
         * @description 触发销毁一个tip
        */
        hide: function (tag) {
            if(tag && this.inArray(this.tagList, tag)){
                $("body").find(".tooltip[data-tag=" + tag + "]").remove();
            }
        },

        /**
         * @description indexOf实现
        */
        inArray: function (arr, tag) {
            var tagBool = false
            $.each(arr, function(index, item){
                if(item == tag) {
                    tagBool = true;
                }
            })
            return tagBool;
        }
    });

    return Tip;

 });