define("undefined/mtd/pc/components/tab/1.0.0/tab.js",[],function(){"use strict";var t=_.Class.extend({construct:function(t){this.conf=$.extend({container:null,head:null,headItems:null,content:null,contentItems:null,startAt:0,activeClass:"active",hash:!1,hoverToSwitch:!1,onBeforeSwitch:function(){},onAfterSwitch:function(){},onFirstShow:function(){}},t),this.index=void 0;var e=this.conf;this.$el=$(e.container),this.$head=e.head?$(e.head):this.$el.children(".mod_tab_head, .J_tab_head"),this.$headItems=e.headItems?"string"==typeof e.headItems?this.$head.children(e.headItems):$(e.headItems):this.$head.children(".mod_tab_head_item, .J_tab_head_item"),this.$content=e.content?$(e.content):this.$el.children(".mod_tab_content, .J_tab_content"),this.$contentItems=e.contentItems?"string"==typeof e.contentItems?this.$content.children(e.contentItems):$(e.contentItems):this.$content.children(".mod_tab_content_item, .J_tab_content_item"),this.tabLength=this.$headItems.length;for(var i=0,n=this.$headItems.length;i<n;i++)this.$headItems[i].hasShown=!1;this.init()},init:function(){var t=this.conf,e=-1,i=window.location.hash;t.hash&&i.length>1?this.switchTo(i):("string"==typeof t.startAt?(this.$active=this.$headItems.filter(t.startAt),e=this.$active.length?this.$active.index():0):e="number"==typeof t.startAt?t.startAt:0,this.switchTo(e)),this.initEvent()},initEvent:function(){var t=this,e=t.conf,i="click";e.hoverToSwitch&&(i="mouseenter"),this.$head.delegate(".mod_tab_head_item, .J_tab_head_item",i,function(e){e&&e.preventDefault();var i=$(this).index();t.switchTo(i)})},switchTo:function(t){var e=this.conf;if(e.hash){var i;if("string"==typeof t&&(i=t.replace("#",""),this.$active=this.$headItems.filter("[data-hash$="+i+"]"),t=this.$active.index()),"number"==typeof t&&(i=this.$headItems.eq(t).attr("data-hash")),t===-1)return-1;window.location.hash=i}if(t=parseInt(t,10),t!==this.index)return this.index=t,"function"==typeof e.onBeforeSwitch&&e.onBeforeSwitch.call(this,t,this),this.$headItems.removeClass(e.activeClass).eq(t).addClass(e.activeClass),this.$contentItems.hide().eq(t).show(),"function"==typeof e.onAfterSwitch&&e.onAfterSwitch.call(this,t,this),this.$headItems[t].hasShown||"function"!=typeof e.onFirstShow||(e.onFirstShow.call(this,t,this),this.$headItems[t].hasShown=!0),this},switchToNext:function(){var t=this.index+1;return t>=this.tabLength&&(t=0),this.switchTo(t),this},switchToPrev:function(){var t=this.index+1;return t<=0&&(t=0),this.switchTo(t),this},destroy:function(){this.unbind(),this.$el.remove()},unbind:function(){return this.$head.undelegate(),this},setOptions:function(t){return $.extend(this.conf,t),this}});return t});