/**
 * @description tip组件，具体查看类{@link Tip},<a href="./demo/components/tip/index.html">Demo预览</a>
 * @module tip
 * @author YL
 * @example
 * var Tip = seajs.require('tip');
 * var tip = new Tip({
 *     auto: true, //识别有 "o2-tip"属性的元素，hover显示tip
 *     placement: "right",
 *     borderColor: "#000",
 *     bg: "#000",
 *     color: "#fff",
 *     fontSize: "12px",
 * });
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
     * @param {String}  [opts.borderColor = "#000"] - 可选，tip边框颜色
     * @param {String}  [opts.bg = "#000"] - 可选，tip背景色
     * @param {String}  [opts.color = "#fff"] - 可选，tip文字颜色
     * @param {String}  [opts.fontSize = "12px"] - 可选，tip文字大小
     * @param {Boolean} [opts.angleBool = true] - 可选，是否显示三角形，默认显示
     */
        construct: function (options) {
          $.extend(this, {
            auto: false,
            placement: "right",
            borderColor: "#000",
            bg: "#000",
            color: "#fff",
            fontSize: "12px",
            angleBool: true
          }, options);

          this.tipOption = {
            template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"><span></span></div><div class="tooltip-inner"></div></div>',
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
         * @description 创建一个tip
         * @param {Object} option
        */
        createTip: function (option) {
            var $tip = $(this.tipOption.template);
            $("body").append($tip);
            if(option.tag){//给手动创建的tip打上标签，方便指定清除
                $tip.attr("data-tag", option.tag);
                this.tagList.push(option.tag);
            }
            option.angleBool !== false ? option.angleBool = true : option.angleBool = false;
            //设置样式
            $tip.find(".tooltip-inner").text(option.text).css(this.tipStyle().tipInner);
            $tip.find(".tooltip-arrow").css(this.tipStyle().tipArrow);
            $tip.find(".tooltip-arrow span").css(this.tipStyle().tipArrow);
            $tip.css(this.tipStyle().tip);
            switch (option.placement) {
                case "top": 
                    $tip.find(".tooltip-arrow").css(this.tipStyle().tipArrowTop);
                    $tip.find(".tooltip-arrow span").css(this.tipStyle().tipArrowTopIn);
                    $tip.css({
                        "left": (option.$obj.width()- $tip.width())/2 + this.calculateTarget(option.$obj).left,
                        "top": this.calculateTarget(option.$obj).top - $tip.height() - 10
                    });
                    break;
                case "bottom": 
                    $tip.find(".tooltip-arrow").css(this.tipStyle().tipArrowBottom);
                    $tip.find(".tooltip-arrow span").css(this.tipStyle().tipArrowBottomIn);
                    $tip.css({
                        "left": (option.$obj.width()- $tip.width())/2 + this.calculateTarget(option.$obj).left,
                        "top": this.calculateTarget(option.$obj).top + option.$obj.height() + 10
                    });
                    break;
                case "right":
                    $tip.find(".tooltip-arrow").css(this.tipStyle().tipArrowRight);
                    $tip.find(".tooltip-arrow span").css(this.tipStyle().tipArrowRightIn);
                    $tip.css({
                        "left": option.$obj.width() + this.calculateTarget(option.$obj).left + 10,
                        "top": this.calculateTarget(option.$obj).top + (option.$obj.height() - $tip.height())/2
                    });
                    break;
                case "left": 
                    $tip.find(".tooltip-arrow").css(this.tipStyle().tipArrowLeft);
                    $tip.find(".tooltip-arrow span").css(this.tipStyle().tipArrowLeftIn);
                    $tip.css({
                        "left": this.calculateTarget(option.$obj).left - $tip.width() - 10,
                        "top": this.calculateTarget(option.$obj).top + (option.$obj.height() - $tip.height())/2
                    });
                    break;
            }
            //是否显示三角 手动创建的
            if(option.tag && !option.angleBool){
                $tip.find(".tooltip-arrow").hide();
            }
            //hover
            if(!this.angleBool && !option.tag){
                $tip.find(".tooltip-arrow").hide();
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
         * @param {Object} option
         * @param {String} tag - tip标记，必选
         * @param {String} placement - tip方位，必选
         * @param {String} text - tip内容，必选
         * @param {Object} $obj - jQuery对象，必选
         * @param {Boolean} angleBool - 是否显示三角形，可选，默认显示
        */
        show: function (option) {
            if(this.checkTip(option.tag)){
                this.createTip(option);
            }
        },

        /**
         * @ description 检查是否存在已有标签的tip，防止重复创建
         * @param {String} tag - 需要检测的tip标记
        */
        checkTip: function (tag) {
            if(!tag){
                throw new Error("required a \"tag\" attribute");
                return false;
            }
            if(this.inArray(this.tagList, tag) != -1){
                throw new Error("Duplicate tip's \"tag\" attribute, tag attributes should be unique!");
                return false;
            }
            return true;
        },

        /**
         * @description 触发销毁一个tip
         * @param {String} tag - 需要销毁的tip标记
        */
        hide: function (tag) {
            var index = this.inArray(this.tagList, tag);
            if(tag && index != -1){
                this.tagList.splice(index, 1) //从tagList中删除标记
                $("body").find(".tooltip[data-tag=" + tag + "]").remove();
            }
        },

        /**
         * @description 提示框的样式
        */
        tipStyle: function () {
            return {
                tip: {
                    "position": "absolute",
                    "zIndex": 1070,
                    "display": "block",
                    "fontSize": "12px",
                    "fontStyle": "normal",
                    "fontWeight": "400",
                    "lineHeight": 1.42857143,
                    "textAlign": "left",
                    "textDecoration": "none",
                    "textShadow": "none",
                    "textTransform": "none",
                    "letterSpacing": "normal",
                    "wordBreak": "normal",
                    "wordSpacing": "normal",
                    "wordWrap": "normal",
                    "whiteSpace": "normal",
                    "filter": "alpha(opacity=1)",
                    "opacity": 1,
                    "lineBreak": "auto"
                },
                tipInner: {
                    "maxWidth": "200px",
                    "padding": "3px 8px",
                    "color": this.color,
                    "textAlign": "center",
                    "backgroundColor": this.bg,
                    "border": "1px solid " + this.borderColor,
                    "borderRadius": "4px"
                },
                tipArrow: {
                    "position": "absolute",
                    "width": 0,
                    "height": 0,
                    "borderStyle": "solid"
                },
                tipArrowRight: {
                    "borderWidth": "5px 5px 5px 0",
                    "borderColor": "transparent " + this.borderColor + " transparent transparent",
                    "_borderStyle": "dashed solid dashed dashed", //ie6
                    "top": "50%",
                    "margin-top": "-5px",
                    "left": "-5px"
                },
                tipArrowRightIn: {
                    "borderWidth": "5px 5px 5px 0",
                    "borderColor": "transparent " + this.bg + " transparent transparent",
                    "_borderStyle": "dashed solid dashed dashed", //ie6
                    "left": "1px",
                    "top": "-5px"
                },
                tipArrowLeft: {
                    "borderWidth": "5px 0 5px 5px",
                    "borderColor": "transparent transparent transparent " + this.borderColor,
                    "_borderStyle": "dashed dashed dashed solid", //ie6
                    "top": "50%",
                    "margin-top": "-5px",
                    "right": "-5px"
                },
                tipArrowLeftIn: {
                    "borderWidth": "5px 0 5px 5px",
                    "borderColor": "transparent transparent transparent " + this.bg,
                    "_borderStyle": "dashed dashed dashed solid", //ie6
                    "right": "1px",
                    "top": "-5px"
                },
                tipArrowTop: {
                    "borderWidth": "5px 5px 0",
                    "borderColor": this.borderColor + " transparent transparent",
                    "_borderStyle": "solid dashed dashed", //ie6
                    "left": "50%",
                    "margin-left": "-5px",
                    "bottom": "-5px"
                },
                tipArrowTopIn: {
                    "borderWidth": "5px 5px 0",
                    "borderColor": this.bg + " transparent transparent",
                    "_borderStyle": "solid dashed dashed", //ie6
                    "bottom": "1px",
                    "left": "-5px"
                },
                tipArrowBottom: {
                    "borderWidth": "0 5px 5px",
                    "borderColor": "transparent transparent " + this.borderColor,
                    "_borderStyle": "dashed dashed solid", //ie6
                    "left": "50%",
                    "margin-left": "-5px",
                    "top": "-5px"
                },
                tipArrowBottomIn: {
                    "borderWidth": "0 5px 5px",
                    "borderColor": "transparent transparent " + this.bg,
                    "_borderStyle": "dashed dashed solid", //ie6
                    "top": "1px",
                    "left": "-5px"
                }
            }
        },

        /**
         * @description indexOf实现
        */
        inArray: function (arr, tag) {
            var tagIndex = -1
            $.each(arr, function(index, item){
                if(item == tag) {
                    tagIndex = index;
                }
            })
            return tagIndex;
        }
    });

    return Tip;

 });