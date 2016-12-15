define('load_async', ['ajax_setup'], function (require) {
  require('ajax_setup');
  return function loadAsync(opts) {
    opts = $.extend({
      url: '',
      params: {},
      timeout: 3000,
      times: 2,
      backup: null,
      needStore: false,
      storeSign: null,
      cache: false,
      dataCheck: null,
      dataType: 'jsonp',
      type: 'get',
      scriptCharset: 'UTF-8'
    }, opts);
    var getParams = function (params) {
      var _params = params;
      if (/forcebot/i.test(location.href)) {
        _params = $.extend({
          forceBot: 1
        }, _params);
      }
      return _params;
    }
    return $.ajax({
      type: opts.type,
      url: opts.url,
      scriptCharset: opts.scriptCharset,
      originalUrl: opts.url,
      data: getParams(opts.params),
      __data: getParams(opts.params),
      dataType: opts.dataType,
      jsonp: 'callback',
      jsonpCallback: opts.jsonpCallback,
      cache: opts.cache,
      timeout: opts.timeout,
      dataCheck: opts.dataCheck,
      storeKey: opts.url,
      needStore: opts.needStore,
      storeCheck: function (storeData) {
        return !!storeData && (storeData.version && storeData.version === opts.storeSign);
      }
    }).retry({
      timeout: opts.timeout,
      times: opts.times,
      backup: opts.backup
    }).then(function (data) {
      if (data) {
        data.__uri = opts.url;
      }
      if (opts.params && opts.params.__trigger) {
        var eventName = opts.jsonpCallback + ':end';
        _.eventCenter.trigger(eventName, data);
      }
    }, function (e) {
      _.console.log(opts.url);
      // 请求接口和兜底都失败了
      _.console.log('请求接口和兜底都失败了');
    });
  };
});
