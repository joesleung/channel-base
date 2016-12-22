define("o2widgetLazyload",function(e,t,o){"use strict";return function(t){var o={cls:"o2data-lazyload",defCls:["lazy-fn","o2loading"],scrollEvent:"scroll.lazydata resize.lazydata"},n=window.pageConfig?window.pageConfig.o2JSConfig:{};n=n||{},window._o2ver={},$.extend(o,t),window.tplVersion=$.extend(window.o2tplVersion||{},window.tplVersion);var a=e("store"),i=!!window.ActiveXObject||navigator.userAgent.indexOf("Trident")>0,r="localStorage"in window&&null!==window.localStorage,l=i?1e3:500,d=o.defCls.concat(o.cls).join(" ");l=n.preloadOffset?n.preloadOffset:l;var s=!!n.ieStorage&&n.ieStorage,c=s&&r,f=function(){var e=null;_.eventCenter.trigger("channel:ready"),$(window).bind(o.scrollEvent,function(t){clearTimeout(e),e=setTimeout(function(){g()},200)}).trigger(o.scrollEvent.split(" ")[0])},g=function(){var e=$(document).scrollTop(),t=$(window).height()+l,r=o.cls,d=$("."+r);d.each(function(){var o=$(this),r=o.data("rel")||this,l=$(r),d=o.html(),s=o.data("tpl")||"",f=o.data("remotetpl")||"",g="boolean"==typeof o.data("async")&&o.data("async"),w="boolean"==typeof o.data("forcerender")&&o.data("forcerender"),v=null;if(""!==f&&(s=f),!o.hasClass("o2loading")&&(w||l.offset().top-(e+t)<0&&l.offset().top+l.outerHeight(!0)>=e))if(""!==s&&n.pathRule)if(/\.js/.test(s)?(v=s,s=v.match(/\/(\w*)(\.min)?\.js/)[1]||""):v=n.pathRule(s),!c&&i||!a.enabled)y(o,d,g,"",u(v,!1,o));else{var m=a.get(v);m&&window.tplVersion&&m.version===window.tplVersion[s]?(p(o,m),y(o,d,g,m)):y(o,d,g,"",u(v,!0,o))}else y(o,d,g,"")})},p=function(e,t){"object"==typeof t&&(window._o2ver[t.version]||(t.style&&$("head").append("<style>"+t.style+"</style>"),t.script&&$("head").append("<script>"+t.script+"</script>"),window._o2ver[t.version]=t.version,e.trigger("tplLoadDone",t),setTimeout(function(){g()},200)))},u=function(e,t,o){var n=$.Deferred();return seajs.use(e,function(i){i?(t&&a.set(e,i),p(o,i),n.resolve(i)):n.reject()}),n.promise()},w=function(e,t,o,n){"undefined"!=typeof n?$.when(n).done(function(o){e.html(t).removeClass(d).trigger("render",o)}).fail(function(){e.trigger("tplLoadFail")}):e.html(t).removeClass(d).trigger("render",o)},y=function(e,t,o,n,a){o?e.data("events")&&e.data("events").beforerender&&e.html(t).addClass("o2loading").trigger("beforerender",function(){w(e,t,n,a)}):e.addClass("o2loading")&&w(e,t,n,a)};f(),this.detectRender=g}}),define(function(e){"use strict";var t=pageConfig.o2AppName||"";""!==t&&$("html").addClass(t);var o=e("o2console");o.consoleConfigFunc(),e.async(["jdf/1.0.0/unit/globalInit/2.0.0/globalInit.js","jdf/1.0.0/unit/category/2.0.0/category.js","//static.360buyimg.com/mtd/pc/components/1.0.0/lazyload/lazyload.js"],function(t,o,n){t(),o({type:"mini",mainId:"#categorys-mini",el:"#categorys-mini-main"}),$("body").o2lazyload().bind("render",".o2data-lazyload",function(t,o){var n=$(t.target),a=n.find('[type="text/template"]'),i=n.data("script")||"",r="",l=window.data[n.data("id")]||{};r="object"==typeof o?o.dom:a.html();var d=e("o2tpl");try{var s=d(r,l);n.html(s),setTimeout(function(){n.trigger("done"),""!==i&&new Function(i).call(n),$(window).trigger("resize")},0)}catch(t){console.log(t)}});var a=e("o2widgetLazyload");window.o2widgetLazyload=new a})});