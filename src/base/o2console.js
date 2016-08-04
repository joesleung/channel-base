define('o2console', function () {
  'use strict';
  return {
    // console配置内容,内容为空请填写 如：freshTec: "%c%c",
    consoleConfig: {
      // 招聘信息：统一固定的输出
      staff: '%c本页面由%c 凹凸实验室（JDC-多终端研发部） %c负责开发，你可以通过 https://aotu.io 了解我们。\n\n如果你对我们在做的事情也有兴趣，欢迎加入 %caotu@jd.com%c（注明来自console）\n\n',
      // 页面用到的技术：在这个页面，我们用了%cXXX，YYY，%c你发现了吗？\n\n
      freshTec: '%c%c',
      // 趣味体验：另外，尝试%cXXX，%c会有惊喜哦~\n\n
      funExp: '%c%c'
    },

    // 定义console样式
    consoleConfigFunc: function(){
      // 只展示chrome
      if(window.console && console.log && navigator.userAgent.toLowerCase().match(/chrome\/([\d.]+)/)) {
        var consoleConfig = (typeof o2ConsoleConfig !== 'undefined') ? o2ConsoleConfig : this.consoleConfig;
        var styleBold = 'font-weight: bold;color: #6190e8;';
        var styleNormal = 'font-size: 12px;color: #6190e8;';
        console.log(consoleConfig.staff + consoleConfig.freshTec + consoleConfig.funExp, 'color: #6190e8;', styleBold, styleNormal, styleBold, styleNormal, styleBold, styleNormal, styleBold, styleNormal);
      }
    }
  };
});