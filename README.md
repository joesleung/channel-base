# O2频道页基础库

> 频道页基础库，依赖于 `jQuery` 以及 `SeaJs`

## 项目结构

### Namespace

基础库全局命名空间 `_`，所有通用方法挂载在全局命名空间下。

### base

#### 类生成器

``class.js``就是一个类生成器，挂载在全局命名空间 ``_`` 下，``_.Class`` 默认是所有类的基类，提供一个``extend``方法来生成需要的类，其他的类都是从它继承出来，目前提供的功能比较简单，但是能起到一定的约束作用.

#### 事件机制

``events.js`` 提供了模块间解耦的事件机制，挂载在全局命名空间 ``_`` 下，包括全局事件中心 ``_.eventCenter`` 和事件注册触发器类 ``_.Events``

### components

组件库

## 开发

需安装 ``Gulp``

```
$ npm i -g gulp
```

拷贝项目到本地并安装依赖

```
$ git clone git@github.com:o2team/channel-base.git
$ cd channel-base && npm i
```

生成文档

```
$ npm run doc
```

预览文档

```
$ npm run preview
```

编译

```
$ npm run build
```

自动编译刷新

```
$ npm run watch
```

## ChangeLog

请见[ChangeLog](CHANGELOG.md)