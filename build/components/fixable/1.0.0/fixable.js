define("undefined/mtd/pc/components/fixable/1.0.0/fixable.js",[],function(){"use strict";var e=_.Class.extend({construct:function(e){$.extend(this,{fixableElement:null,hasFixedStyle:!1,x:"left",y:"top",xValue:0,yValue:0,zIndex:null,delay:50,onResizeCallback:null},e),this.init()},init:function(){var e=this;e.$fixableElement=$(e.fixableElement),e.onResizeTimer=null,null!=e.zIndex&&e.$fixableElement.css("z-index",e.zIndex),e.initEvent()},initEvent:function(){var e=this,i=(e.$fixableElement,$(window));e.hasFixedStyle===!1&&e.convertPosition(),null!==e.onResizeCallback&&(e.onResizeCallback(i.width()),i.bind("resize",$.proxy(e.onResize,e)))},convertPosition:function(){var e,i,n=this,t=n.$fixableElement,l=n.xValue,o=n.yValue,a={};"center"==l&&(e=t.outerWidth()/2,a.marginLeft=-e,l="50%"),"center"==o&&(i=t.outerHeight()/2,a.marginTop=-i,o="50%"),a.position="fixed",a[n.x]=l,a[n.y]=o,t.css(a)},onResize:function(){var e,i=this,n=(i.$fixableElement,$(window));clearTimeout(i.onResizeTimer),i.onResizeTimer=setTimeout(function(){e=n.width(),i.onResizeCallback(e)},i.delay)}});return e});