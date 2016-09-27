define("//static.360buyimg.com/mtd/pc/components/1.0.0/lift/lift.js",[],function(){"use strict";var t=_.Class.extend({construct:function(t){this.config={$container:null,$backTop:null,floorListHook:".JS_floor",liftListHook:".JS_lift",itemSelectedClassName:"",startShowPosition:0,speed:800},t&&$.extend(this.config,t),this.init()},init:function(){this.$window=$(window),this.WIN_W=this.$window.width(),this.WIN_H=this.$window.height(),this.DOC_H=$(document).height(),this.timer=null,this.$floorList=$(this.config.floorListHook),this.$liftList=this.config.$container.find(this.config.liftListHook),this.checkRun()},checkRun:function(){var t=this.config;null!=t.$container&&0!=this.$floorList.length&&0!=this.$liftList.length&&this.start()},start:function(){this.bindEvents()},getFloorInfo:function(){var t=[];return this.$floorList.length>0?(this.$floorList.each(function(){t.push($(this).offset().top)}),t):null},bindEvents:function(){var t=this.config,i=t.$backTop,o=this;o.$window.bind("scroll.lift",$.proxy(o.lift,o)),t.$container.delegate(t.liftListHook,"click.lift",{thisObj:o},o.liftJump),null!==i&&i.length>0&&i.bind("click.backTop",$.proxy(o.backTop,o))},backTop:function(){var t=this,i=t.config;return t.$window.unbind("scroll.lift"),$("body,html").stop().animate({scrollTop:0},i.speed,function(){t.$window.bind("scroll.lift",$.proxy(t.lift,t)),t.$liftList.removeClass(i.itemSelectedClassName)}),!1},lift:function(){var t=this,i=t.config,o=t.$window.scrollTop(),s=i.itemSelectedClassName;clearTimeout(t.timer),o>=i.startShowPosition?(i.$container.fadeIn(),$.each(t.getFloorInfo(),function(n,l){o>=l-t.WIN_H/2+5?t.$liftList.eq(n).addClass(s).siblings(i.liftListHook).removeClass(s):o>=t.DOC_H-t.WIN_H/2-5&&t.$liftList.eq(n).addClass(s).siblings(i.liftListHook).removeClass(s),o<t.getFloorInfo()[0]-t.WIN_H/2&&t.$liftList.removeClass(s)})):i.$container.fadeOut()},liftJump:function(t){var i=t.data.thisObj,o=i.config;clearTimeout(i.timer),$(this).addClass(o.itemSelectedClassName).siblings(o.liftListHook).removeClass(o.itemSelectedClassName),i.$window.unbind("scroll.lift"),$("body,html").stop().animate({scrollTop:i.getFloorInfo()[$(this).index(o.$container.selector+" "+o.liftListHook)]},o.speed,function(){i.timer=setTimeout(function(){i.$window.bind("scroll.lift",$.proxy(i.lift,i))},50)})}});return t});