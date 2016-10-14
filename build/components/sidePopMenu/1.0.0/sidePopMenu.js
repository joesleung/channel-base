define("//misc.360buyimg.com/mtd/pc/components/sidePopMenu/1.0.0/sidePopMenu.js",[],function(){"use strict";var t=_.Class.extend({construct:function(t){this.config={$container:null,navItemHook:"",popItemHook:"",navCtnHook:".JS_navCtn",popCtnHook:".JS_popCtn",navItemOn:"",moveDeg:70,isAuto:!1,menuDirection:"right",itemEnterCallBack:null},t&&$.extend(this.config,t),this.checkRun()},checkRun:function(){var t=this.config;null!=t.$container&&0!=$(t.navCtnHook).length&&0!=$(t.popCtnHook).length&&""!=t.navItemHook&&""!=t.popItemHook&&this.init()},init:function(){var t=this.config;this.$navCtn=t.$container.find(t.navCtnHook),this.$popCtn=t.$container.find(t.popCtnHook),this.$navItemList=this.$navCtn.find(t.navItemHook),this.$popItemList=this.$popCtn.find(t.popItemHook),this.potCollect=[],this.moveTimer=null,this.enterTimer=null,this.isBind=!1,this.$window=$(window),this.callback=null,this.initEvents()},getNavItemInfo:function(){var t=this.config,e=[];return t.$container.find(t.navItemHook).each(function(){var t=$(this),n=t.position();e.push({thisHeight:t.outerHeight(!0).toFixed(0),thisWidth:t.outerWidth().toFixed(0),thisPstX:n.left,thisPstY:n.top,thisPageY:t.offset().top})}),e},initEvents:function(){var t=this,e=t.config;e.$container.bind("mouseleave",$.proxy(t.ctnLeave,t)),t.$navCtn.delegate(e.navItemHook,{"mouseenter.itemEnter":t.navItemEnter,"mousemove.itemMove":t.navItemMove,"mouseleave.itemLeave":t.navItemLeave},{thisObj:t,callback:e.itemEnterCallBack}),t.$navCtn.delegate(e.navItemHook,"mousemove.itemMove",util.throttle(t.navItemMove,t.moveTimer),{thisObj:t,callback:e.itemEnterCallBack}),t.isBind=!0},ctnLeave:function(){var t=this,e=t.config;t.$navItemList.removeClass(e.navItemOn),t.$popCtn.hide(),t.$popItemList.hide(),t.moveTimer=null,t.enterTimer=null},reBindNavItemEnter:function(){var t=this,e=t.config;t.$navCtn.delegate(e.navItemHook,"mouseenter.itemEnter",{thisObj:t,callback:e.itemEnterCallBack},t.navItemEnter),t.isBind=!0},unbindNavItemEnter:function(){var t=this;t.config;t.$navCtn.undelegate(".itemEnter"),t.isBind=!1},navItemEnter:function(t){var e=t.data.thisObj,n=$(this),i=e.config,o=t.data.callback,s=$(this).index(i.$container.selector+" "+i.navItemHook);n.addClass(i.navItemOn).siblings(i.$container.selector+" "+i.navItemHook).removeClass(i.navItemOn),e.$popCtn.show();var a=e.$popItemList.eq(s);a.show().siblings(i.$container.selector+" "+i.popItemHook).hide(),i.isAuto&&e.popAutoShow(s,n),"function"==typeof o&&o({$displayEl:a})},popAutoShow:function(t,e){var n=this,e=e,i=n.config,t=e.index(i.$container.selector+" "+i.navItemHook),o=[],s=0;switch(o=n.getNavItemInfo(),i.menuDirection){case"right":n.$popCtn.css({position:"absolute",left:o[t].thisWidth+"px",top:o[t].thisPstY-o[t].thisHeight+"px",right:"auto",bottom:"auto"}),s=n.$window.height().toFixed(0)-(o[t].thisPageY-n.$window.scrollTop()),o[t].thisPstY<o[t].thisHeight?n.$popCtn.css("top","0px"):s<n.$popCtn.height().toFixed(0)&&n.$popCtn.css({top:o[t].thisPstY-(n.$popCtn.height().toFixed(0)-s)+"px"});break;case"left":n.$popCtn.css({position:"absolute",left:"auto",top:o[t].thisPstY-o[t].thisHeight+"px",right:o[t].thisWidth+"px",bottom:"auto"}),s=n.$window.height().toFixed(0)-(o[t].thisPageY-n.$window.scrollTop()),o[t].thisPstY<o[t].thisHeight?n.$popCtn.css("top","0px"):s<n.$popCtn.height().toFixed(0)&&n.$popCtn.css({top:o[t].thisPstY-(n.$popCtn.height().toFixed(0)-s)+"px"})}},navItemMove:function(t){function e(){clearTimeout(i.moveTimer),i.isBind&&i.unbindNavItemEnter(),i.moveTimer=setTimeout(function(){i.reBindNavItemEnter()},100)}function n(){clearTimeout(i.moveTimer),i.isBind||i.reBindNavItemEnter()}var i=t.data.thisObj,o=$(this),s=i.config,a=t,h=s.moveDeg*(2*Math.PI/360),c=Math.tan(h).toFixed(2),r=0,l=0,m=0,p=null,v=null;if(i.potCollect.push({x:a.pageX,y:a.pageY}),i.potCollect.length>4)switch(i.potCollect.shift(),p=i.potCollect[0],v=i.potCollect[i.potCollect.length-1],l=v.x-p.x,m=v.y-p.y,r=Math.abs((m/l).toFixed(2)),s.menuDirection){case"right":r<=c&&l>0?e():n();break;case"left":r<=c&&l<0?e():n()}return clearTimeout(i.enterTimer),i.enterTimer=setTimeout(function(){o.trigger("mouseenter",{thisObj:i,callback:s.itemEnterCallBack})},300),!1},navItemLeave:function(t){var e=t.data.thisObj;$(this),e.config;clearTimeout(e.enterTimer)}});return t});