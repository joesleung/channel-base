define("undefined/mtd/pc/components/dialog/1.0.0/dialog.js",[],function(){"use strict";var n=_.Class.extend({construct:function(n){this.config={txtInfo:null,container:""},n&&$.extend(this.config,n),this.init()},init:function(){var n=this.config;this.$container=null,this.txtInfo=null===n.txtInfo?"":n.txtInfo},checkRun:function(){return null!=this.$container},render:function(n){var t=this.$container;n.container&&($("body").append(n.dom),t=$(n.container),t.toggle(),this.$container=t)},callBack:function(n){var t=this;t.checkRun()&&n&&$.each(n,function(n,i){t.$container.find(n).unbind("click.defined"),t.$container.find(n).bind("click.defined",function(){i()})})}});return n});