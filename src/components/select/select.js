/**
 * @description select组件，具体查看类{@link Select},<a href="./demo/components/select/index.html">Demo预览</a>
 * @module select
 * @author YL
 * @example
 * var Select = seajs.require('select');
 * new Select({
       $container: $("#select")
 * });
 *
 */

 define("select", function(){
    "use strict";

    var Select = _.Class.extend(/** @lends Select.prototype */{
        /**
         * @constructor
         * @alias Select
         * @param {Object} opts - 组件配置
         * @param {Object} $container - 必选，jQuery对象
         */

         construct: function (options) {
          $.extend(this, {
            $container: null,
            
          }, options);

          this.init();

          this.$container.hide();
        },

        /**
         * @description 一些初始化操作
         */
        init: function () {
            this.createSelect();
            this.initEvent();
            this.keyboard();
        },

        /**
         * @description 创建下拉框
         */
        createSelect: function () {
            var select = this.$container;
            if(this.checkCreate()){
                select.after($("<div></div>")
                    .addClass("o2-select")
                    .addClass(select.attr("class") || "")
                    .addClass(select.attr("disabled") ? "disabled" : "")
                    .html('<span class="current"></span><ul class="list"></ul>')
                );

                var dropdown = select.next();
                var options = select.find("option");
                var selected = select.find("option:selected");

                dropdown.find(".current").html(selected.text());

                options.each(function(){
                    var $option = $(this);
                    dropdown.find("ul").append($("<li></li>")
                        .attr("data-value", $option.val())
                        .addClass("option" +
                            ($option.is(":selected") ? " selected" : "") +
                            ($option.is(":disabled") ? " disabled" : ""))
                        .html($option.text())
                    );
                });
            }
        },

        /**
         * @description 检查是否重复创建
         */
        checkCreate: function () {
            return !this.$container.next().hasClass("o2-select");
        },

        /**
         * @description 事件初始化
         */
        initEvent: function () {
            var _this = this;
            var o2Select = this.$container.next(".o2-select");
            this.$container.bind("o2Select:setValue", $.proxy(this.selectEvent, this));
            o2Select.bind("click.o2_select", this.openOrClose);
            $(document).bind("click.o2_select", this.close);
            o2Select.find(".option:not(.disabled)").bind("click.o2_select", this.selectOption);
            $(document).unbind("keydown");
            // $(document).bind("keydown.o2_select", $.proxy(_this.keyboard, _this));
        },

        /**
         * @description 自定义事件
         */
        selectEvent: function () {
            var value = this.$container.val();
            var dropdown = this.$container.next();
            var options = dropdown.find("li");
            options.each(function(){
                if($(this).data("value") == value){
                    dropdown.find('.selected').removeClass('selected');
                    $(this).addClass('selected');
                    var text = $(this).text();
                    dropdown.find('.current').text(text);
                }
            });
            return false;
        },

        /**
         * @description open/close 下拉框
         */
        openOrClose: function (event) {
            var dropdown = $(this);
            if(!dropdown.hasClass("o2-select")){
                dropdown = dropdown.parent();
            }
            $('.o2-select').not(dropdown).removeClass('open');
            dropdown.toggleClass('open');
              
            if (dropdown.hasClass('open')) {
                dropdown.find('.focus').removeClass('focus');
                dropdown.find('.selected').addClass('focus');
            } else {
                dropdown.focus();
            }
            return false;
        },

        /**
         * @description 点击外面的时候，close下拉框 
         */
        close: function (event) {
            event.stopPropagation();
            if($(event.target).closest(".o2-select").length == 0){
                $(".o2-select").removeClass("open");
            }
            return false;
        },

        /**
         * @description 下拉选项点击
         */
        selectOption: function (event) {
            event.stopPropagation();
            var option = $(event.target);
            if(option.get(0).tagName == "LI"){
                var dropdown = option.closest(".o2-select").removeClass("open");
                dropdown.find(".selected").removeClass("selected");
                option.addClass("selected");
                var text = option.text();
                dropdown.find(".current").text(text);
                dropdown.prev("select").val(option.data("value")).trigger("change");
            }
            return false;
        },

        /**
         * @description 设置选中
         * @param {Object} option
         * @param {String} value 需要选中的option的value，二选一
         * @param {String} text 需要选中的option的text，二选一
         * @param {Object} cb 设置选中后的回调，可选
         */
        setSelect: function (option) {
            var str = option.val || option.text;
            if(str){
                var dropdown = this.$container.next(".o2-select");
                var options = dropdown.find(".option");
                dropdown.find(".selected").removeClass("selected");
                if(option.val){
                    options.each(function(){
                        if($(this).data("value") == str){
                            select($(this), dropdown);
                        }
                    });
                }else{
                    options.each(function(){
                        if($(this).text() == str){
                            select($(this), dropdown);
                        }
                    });
                }
                if(option.cb){
                    option.cb();
                }
            }
            function select(_this, dropdown){
                _this.addClass("selected");
                var text = _this.text();
                dropdown.find(".current").text(text);
                dropdown.prev("select").val(_this.data("value")).trigger("change");
            }
        },

        /**
         * @description update 更新当前下拉框
         * @param {Object} $container jquery对象，必选 
         */
         update: function () {
            var dropdown = this.$container.next(".o2-select");
            var open = dropdown.hasClass("open");
            if(dropdown.length){
                dropdown.remove();
                this.init();
                if (open) {
                    this.$container.next().trigger('click');
                }
            }
         },

         /**
          * @description destroy 销毁当前下拉框
          */
        destroy: function () {
            var dropdown = this.$container.next(".o2-select");
            if(dropdown.length){
                dropdown.remove();
            }
        },

        /**
         * @description 键盘事件
         */
        keyboard: function (event) {
            var _this = this
            $(document).bind("keydown", function (event) {
                var dropdown = $(".o2-select.open");
                var focused_option = $(dropdown.find(".focus") || dropdown.find(".list .option.selected"));
                switch (event.keyCode) {
                    case 32:
                    case 13:
                        _this.spaceEnterKey(dropdown, focused_option); break;
                    case 40:
                        _this.downKey(dropdown, focused_option); break;
                    case 38:
                        _this.upKey(dropdown, focused_option); break;
                    case 27:
                        _this.escKey(dropdown); break;
                    case 9:
                        _this.tabKey(dropdown); break;
                }
            })
            
            
        },

        /**
         * @description space enter key
         */
        spaceEnterKey: function (dropdown, focused_option) {
            if(dropdown.hasClass("open")){
                focused_option.trigger("click");
            }else{
                dropdown.trigger("click");
            }
            return false;
        },

        /**
         * @description down key
         */
        downKey: function (dropdown, focused_option) {
            if(!dropdown.hasClass("open")){
                dropdown.trigger("click");
            }else{
                if(focused_option.next().length > 0){
                    dropdown.find(".focus").removeClass("focus");
                    focused_option.next().addClass("focus");
                }
            }
            return false;
        },

        /**
         * @description up key
         */
        upKey: function (dropdown, focused_option) {
            if (!dropdown.hasClass('open')) {
                dropdown.trigger('click');
            } else {
                if (focused_option.prev().length > 0) {
                    dropdown.find('.focus').removeClass('focus');
                    focused_option.prev().addClass('focus');
                }
            }
            return false;
        },

        /**
         * @description esc key
         */
         escKey: function (dropdown) {
            if (dropdown.hasClass('open')) {
                dropdown.trigger('click');
            }
         },

        /**
         * @description tab key
         */
        tabKey: function (dropdown) {
            if (dropdown.hasClass('open')) {
                return false;
            }
        }
    });
    return Select;
 });