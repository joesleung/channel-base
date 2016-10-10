define('load_async', function (require) {
  return function loadAsync (opts) {
    opts = $.extend({
      url: '',
      params: {},
      timeout: 3000,
      times: 2,
      backup: null,
      needStore: false,
      storeSign: null
    }, opts);
    return $.ajax({
      type: 'get',
      url: opts.url,
      originalUrl: opts.url,
      data: opts.params,
      dataType: 'jsonp',
      jsonp: 'callback',
      jsonpCallback: opts.jsonpCallback,
      timeout: opts.timeout,
      storeKey: opts.url,
      needStore: opts.needStore,
      storeCheck: function (storeData) {
        return !!storeData && (storeData.version && storeData.version === opts.storeSign);
      }
    }).retry({
      timeout: opts.timeout,
      times: opts.retry,
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
      console.log(opts.url);
      // 请求接口和兜底都失败了
      console.log('请求接口和兜底都失败了');
    });
  };
});