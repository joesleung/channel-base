# ChangeLog

## 2016-12-06

### athena配置打包楼层CSS/JS

- 修改module-conf.js增加

 tplOut: {
    deleteSpace: false,
    outCSS: true,
    outJS: true
},

执行`ath b --release`打包，观察打包后的xxx_tpl.min.js文件，会发现，会把样式、脚本都打包进来了，如果要想做楼层复用，请保证楼层所用到的样式和脚本都在这个文件里。


### 使用例子

> 如果想直接使用一个外部楼层模板，可以通过以下方式加载模板。

```
<div class="o2data-lazyload food_category mod_region mod_w food_category_10" data-elevator="true" id="food_category_10" data-id="food_category_6" data-tpl="//static.360buyimg.com/mtd/pc/supermarket/2.0.0/home/food_category_tpl.min.js"></div>
```

这里的`data-tpl`属性填了一个绝对地址，程序会自动匹配加载逻辑去加载它。

为了兼容之前的规则，仍然可以照之前的方式使用：

```
<div class="o2data-lazyload food_category mod_region mod_w food_category_10" data-elevator="true" id="food_category_10" data-id="food_category_6" data-tpl="food_category_tpl"></div>
```

自动读取在页面配置的pathRule:

```
 window.pageConfig.o2JSConfig = {
        useTplInJs: true,
        pathRule: function (path) {
            return '//static.360buyimg.com/mtd/pc/supermarket/2.0.0' + '/home/' + path + '.min.js';
        }
    };
```


### 事件

#### tplLoadDone(result)
> 当模板加载完成时会触发此事件，并传入一个对象，包含版本号、DOM模板、CSS/JS等信息。

```
//参考对象
result = {
    version: "md5",
    dom: "<div></div>",
    style: "a{color:red}",
    script: "define(function(){return {}})"
}

$('dom').bind('tplLoadDone',function(result){
    console.log(result); //md5,<div></div>,a{color:red},define(function(){return {}})
});

```

#### tplLoadFail
> 当模板加载失败时触发。


### 方法

> 有一个名为`o2widgetLazyload`对象挂载在`window`对象下，可以调用程序内部暴露出来的一些方法。

#### detectRender

> 手动检测可视区域是否有需要渲染的dom并执行渲染逻辑

```
o2widgetLazyload.detectRender() //检测

```


### 开启IE本地存储功能

修改页面的配置参数

```
window.pageConfig = window.pageConfig || {};
window.pageConfig.o2JSConfig = {
    useTplInJs: true,
    ieStorage: true,//开启IE本地存储
    pathRule: function(path) {
       return __uri('domain_prefix') + '/index/' + path + '.min.js';
    }
};

```



