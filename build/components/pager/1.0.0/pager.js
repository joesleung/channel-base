define("undefined/mtd/pc/components/pager/1.0.0/pager.js",[],function(e){"use strict";var a=_.Class.extend({construct:function(e){var a={el:null,pagesize:10,pages:0,count:1,displayedPages:5,currentPage:1,btnTpl:' <li class="item" data-role="{num}"><a class="num" href="javascript:;">{num}</a></li>',btnPrevTpl:'<li class="item prev" data-role="prev"><a class="num" href="javascript:;" ><span class="mod_icon mod_icon_prev"></span><span>上一页</span></a></li>',btnNextTpl:'<li class="item next" data-role="next"><a class="num" href="javascript:;"><span>下一页</span><span class="mod_icon mod_icon_next"></span></a></li>',dotTpl:'<li class="item dot" data-role="dot">...</li>',onPage:null,halfDisplayed:0,delegateObj:".item",activeClass:"active",role:"role"};$.extend(this,a,e||{}),this.init()},init:function(){this.pages=Math.ceil(this.count/this.pagesize),this.halfDisplayed=this.displayedPages/2,this.drawUI(),this.initEvent()},initEvent:function(){var e=this;e.el.delegate(e.delegateObj,"click",function(){var a=$(this).data(e.role),t=e.currentPage;if(a!==t)switch(a){case"prev":e.prevPage();break;case"next":e.nextPage();break;case"dot":return;default:t=a,e.goToPage(t)}})},drawUI:function(){var e=this,a=[],t=e.pages>e.displayedPages,s=this._getInterval(this),n=!0;if(0!==s.end){e.currentPage==this.pages&&(n=!1);for(var i=s.start;i<=s.end;i++)a.push(e.btnTpl.replace(/{num}/g,i));t&&s.end!==e.pages&&(a.push(e.dotTpl),a.push(e.btnTpl.replace(/{num}/g,e.pages))),n&&a.push(e.btnNextTpl),e.currentPage>1&&a.unshift(e.btnPrevTpl),e.el.html(a.join("")).find("[data-"+e.role+'="'+e.currentPage+'"]').addClass(e.activeClass).siblings().removeClass(e.activeClass),e.onPage&&e.onPage.call(e)}},_getInterval:function(e){return{start:Math.ceil(e.currentPage>e.halfDisplayed?Math.max(Math.min(e.currentPage-e.halfDisplayed,e.pages-e.displayedPages),1):1),end:Math.ceil(e.currentPage>e.halfDisplayed?Math.min(e.currentPage+e.halfDisplayed-1,e.pages):Math.min(e.displayedPages,e.pages))}},goToPage:function(e){var a=e;a>this.pages&&(a=this.pages),a<1&&(a=1),this.currentPage=a,this.drawUI()},nextPage:function(){var e=this.currentPage;e+=1,this.goToPage(e)},prevPage:function(){var e=this.currentPage;e-=1,this.goToPage(e)}});return a});