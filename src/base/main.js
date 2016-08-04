define(function (require) {
  'use strict';
  var o2AppName = pageConfig.o2AppName || '';
  if(o2AppName.length === 0) {
    $('html').addClass(o2AppName);
  }
  var o2console = require('o2console');
  o2console.consoleConfigFunc();
	require.async(['jdf/1.0.0/unit/globalInit/2.0.0/globalInit.js', 'jdf/1.0.0/unit/category/2.0.0/category.js'], function(globalInit, category) {
    globalInit();
    category({
      type: 'mini',
      mainId: '#categorys-mini',
      el: '#categorys-mini-main'
    });
    require('o2lazyload');
    $('body').o2lazyload().bind('render', '.o2data-lazyload', function(e, result) {
      var self = $(e.target);
      var template = self.find('[type="text/template"]');
      var script = self.data('script') || '';
      var content = '';
      if (typeof result === 'object') {
        content = result.dom;
      } else {
        content = template.html();
      }
      var o2tpl = require('o2tpl');
      try {
        var html = o2tpl(content, data[self.data('id')]);
        template.remove();
        self.append($(html));
        setTimeout(function(){
          self.trigger('done');
          '' !== script && (new Function(script))();
          $(window).trigger('resize');
        },0);
        
      } catch (e) {
        console.log(e);
      }
    });
    var o2widgetLazyload = require('o2widgetLazyload');
    o2widgetLazyload();
  });
});