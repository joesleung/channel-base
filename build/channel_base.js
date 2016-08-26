/**
 * @description A class factory
 */

(function (global) {
  'use strict';

  var _ = global._ || (global._ = { });
  function type (arg) {
    var class2type = {};
    var toString = class2type.toString;
    var types = 'Boolean Number String Function Array Date RegExp Object Error'.split(' ');
    for (var i = 0; i < types.length; i++) {
      var typeItem = types[i];
      class2type['[object ' + typeItem + ']'] = typeItem.toLowerCase();
    }

    if (arg === null) {
      return arg + '';
    }

    return (typeof arg === 'object' || typeof arg === 'function') ?
      class2type[toString.call(arg)] || 'object' :
      typeof arg;
  }

  function isFunction (arg) {
    return type(arg) === 'function';
  }

  var initializing = false;
  // 目的是为了检测Function.prototype.toString能否打印出函数内部信息
  var fnTest = /xyz/.test(function() {var xyz;}) ? /\bsuper\b/ : /.*/;

  /** @memberOf _
   * @example
   * // 构建类
   * var People = _.Class.extend({
   * // 类静态成员
   * statics: {
   *
   * },
   * 
   * // 构造函数，若不需要可缺省
   * construct: function (name) {
	 *   this.name = name;
   * },
   * 
   * talk: function () {
   *   console.log('My name is ' + this.name + '!');
   * }
   * 
   * // 其他成员方法
   * ...
   * 
   * });
   * 
   * // 继承People
   * var Man = People.extend({
   * 
   * construct: function (name, age) {
   *   // 执行父类的方法
   *   this._super.call(this, arguments);
   * },
   * 
   * walk: function () {
   *   console.log('I am ' + this.age + ' years old, I can walk!');
   * }
   * 
   * // 其他成员方法
   * ...
   * });
   * 
   * // 使用
   * var luckyadam = new Man('luckyadam', 23);
   * luckyadam.talk();
   * luckyadam.walk();
   */
  _.Class = function () {};

  _.Class.extend = function class_extend (properties) {
    var _super = this.prototype;

    initializing = true;
    var subPrototype = new this();
    initializing = false;
    for (var prop in properties) {
      if (prop === 'statics') {
        var staticObj = properties[prop];
        for (var staticProp in staticObj) {
          Klass[staticProp] = staticObj[staticProp];
        }
      } else {
        if (isFunction(_super[prop]) &&
          isFunction(properties[prop]) &&
          fnTest.test(properties[prop])) {
          subPrototype[prop] = wrapper(_super, prop, properties[prop]);
        } else {
          subPrototype[prop] = properties[prop];
        }
      }
    }

    function wrapper (superObj, prop, fn) {
      return function () {
        this._super = superObj[prop];
        return fn.apply(this, arguments);
      };
    }

    function Klass () {
      if (!initializing && isFunction(this.construct)) {
        this.construct.apply(this, arguments);
      }
    }

    Klass.prototype = subPrototype;

    Klass.prototype.constructor = Klass;

    Klass.extend = class_extend;

    return Klass;

  };

})(window, undefined);
/*!
 * Custom events
 */

(function (global) {
  'use strict';

  var eventSplitter = /\s+/;
  var slice = [].slice;

  /** @namespace _ */
  var _ = global._ || (global._ = { });  

  /**
   * @desc 函数继承
   * @param {Function} parent 父类
   * @param {Object} protoProps 子类的扩展属性和方法
   * @param {Object} staticProps 要子类添加的额外扩展方法或属性
   */
  function inherits (parent, protoProps, staticProps) {
    var child;
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function() {
        parent.apply(this, arguments);
      };
    }
    $.extend(child, parent);

    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    if (protoProps) $.extend(child.prototype, protoProps);
    if (staticProps) $.extend(child, staticProps);
    child.prototype.constructor = child;
    child.__super__ = parent.prototype;
    return child;
  }

  /**
   * @desc 继承的快捷写法
   * @param {Object} protoProps 子类的扩展属性和方法
   * @param {Object} classProps 要子类添加的额外扩展方法或属性
   */
  function extend (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  }

  var ctor = function() {};

  /**
   * @function Events
   * @memberOf _
   * @desc 自定义事件
   * @param {Object} opts
   * @param {Function} opts.callbacks
   * @constructor
   * @example
   * // 模块内部可以实例化一个新的事件触发器
   * var events = new _.Events();
   * // 注册一个事件module:message
   * events.on('module:message', function (msg) {
   *   console.log(msg);
   * });
   * // 触发事件
   * events.trigger('module:message', msg);
   */
  function Events(opts) {
    if (typeof opts != 'undefined' && opts.callbacks) {
      this.callbacks = opts.callbacks;
    } else {
      this.callbacks = {};
    }
  }
  Events.extend = extend;
  Events.prototype = {
    /**
     * @function on
     * @memberof Events
     * @desc 注册事件
     * @param {String} events 事件名称
     * @param {Function} callback 回调函数
     * @param {Object} context
     */
    on: function(events, callback, context) {
      var calls, event, node, tail, list;
      if (!callback) return this;
      events = events.split(eventSplitter);
      calls = this.callbacks;
      while (event = events.shift()) {
        list = calls[event];
        node = list ? list.tail : {};
        node.next = tail = {};
        node.context = context;
        node.callback = callback;
        calls[event] = {
          tail: tail,
          next: list ? list.next : node
        };
      }

      return this;
    },
    /**
     * @function off
     * @memberof Events
     * @desc 移除自定义事件
     * @param {String} events 事件名称
     * @param {Function} callback 回调函数
     * @param {Object} context 函数执行context
     */
    off: function(events, callback, context) {
      var event, calls, node, tail, cb, ctx;

      if (!(calls = this.callbacks)) return;
      if (!(events || callback || context)) {
        delete this.callbacks;
        return this;
      }
      events = events ? events.split(eventSplitter) : _.keys(calls);
      while (event = events.shift()) {
        node = calls[event];
        delete calls[event];
        if (!node || !(callback || context)) continue;
        tail = node.tail;
        while ((node = node.next) !== tail) {
          cb = node.callback;
          ctx = node.context;
          if ((callback && cb !== callback) || (context && ctx !== context)) {
            this.on(event, cb, ctx);
          }
        }
      }
      return this;
    },
    /**
     * @function trigger
     * @memberof Events
     * @desc 触发自定义事件
     * @param {String} events 事件名称
     */
    trigger: function(events) {
      var event, node, calls, tail, args, all, rest;
      if (!(calls = this.callbacks)) return this;
      all = calls.all;
      events = events.split(eventSplitter);
      rest = slice.call(arguments, 1);

      while (event = events.shift()) {
        if (node = calls[event]) {
          tail = node.tail;
          while ((node = node.next) !== tail) {
            node.callback.apply(node.context || this, rest);
          }
        }
        if (node = all) {
          tail = node.tail;
          args = [event].concat(rest);
          while ((node = node.next) !== tail) {
            node.callback.apply(node.context || this, args);
          }
        }
      }
      return this;
    }
  };

  _.Events = Events;
  /** @memberOf _
   * @example
   * // 使用全局的事件中心在模块间传递消息
   * _.eventCenter.on('module:message', function (msg) {
   *   console.log(msg);
   * });
   * _.eventCenter.trigger('module:message', msg);
   */
  _.eventCenter = new Events();
})(window, undefined);
/*
    json2.js
    2015-05-03
    Public Domain.
    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
    See http://www.JSON.org/js.html
    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html
    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
    This file creates a global JSON object containing two methods: stringify
    and parse. This file is provides the ES5 JSON capability to ES3 systems.
    If a project might run on IE8 or earlier, then this file should be included.
    This file does nothing on ES5 systems.
        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.
            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.
            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.
            This method produces a JSON text from a JavaScript value.
            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value
            For example, this would serialize Dates as ISO strings.
                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 
                            ? '0' + n 
                            : n;
                    }
                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };
            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.
            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.
            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.
            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.
            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.
            Example:
            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'
            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'
            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date 
                    ? 'Date(' + this[key] + ')' 
                    : value;
            });
            // text is '["Date(---current time---)"]'
        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.
            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.
            Example:
            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.
            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });
            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });
    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint 
    eval, for, this 
*/

/*property
    JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';
    
    var rx_one = /^[\],:{}\s]*$/,
        rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
        rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
        rx_four = /(?:^|:|,)(?:\s*\[)+/g,
        rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 
            ? '0' + n 
            : n;
    }
    
    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + '-' +
                        f(this.getUTCMonth() + 1) + '-' +
                        f(this.getUTCDate()) + 'T' +
                        f(this.getUTCHours()) + ':' +
                        f(this.getUTCMinutes()) + ':' +
                        f(this.getUTCSeconds()) + 'Z'
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap,
        indent,
        meta,
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string) 
            ? '"' + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string'
                    ? c
                    : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' 
            : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) 
                ? String(value) 
                : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                        ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                        : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap 
                                    ? ': ' 
                                    : ':'
                            ) + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap 
                                    ? ': ' 
                                    : ':'
                            ) + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                    ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                    : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return '\\u' +
                            ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (
                rx_one.test(
                    text
                        .replace(rx_two, '@')
                        .replace(rx_three, ']')
                        .replace(rx_four, '')
                )
            ) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
define(function (require) {
  'use strict';
  //给html标签打上频道类名，主要用作重置头部样式
  var o2AppName = pageConfig.o2AppName || '';
  if(o2AppName !== '') {
    $('html').addClass(o2AppName);
  }
  //console 输出
  var o2console = require('o2console');
  o2console.consoleConfigFunc();
  //加载主站头部公共脚本
	require.async(['jdf/1.0.0/unit/globalInit/2.0.0/globalInit.js', 'jdf/1.0.0/unit/category/2.0.0/category.js'], function(globalInit, category) {
    globalInit();
    category({
      type: 'mini',
      mainId: '#categorys-mini',
      el: '#categorys-mini-main'
    });

    //图片懒加载
    require('o2lazyload');

    //绑定渲染事件
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

      //加载模板引擎
      var o2tpl = require('o2tpl');
      try {
        var html = o2tpl(content, data[self.data('id')]);
        template.remove();
        self.append($(html));
        setTimeout(function(){
          //触发脚本
          self.trigger('done');
          '' !== script && (new Function(script))();
          $(window).trigger('resize');
        },0);
        
      } catch (e) {
        console.log(e);
      }
    });
    //楼层懒加载逻辑
    var o2widgetLazyload = require('o2widgetLazyload');
    o2widgetLazyload();
  });
});
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
define('store', function () {
  'use strict';
  var store = {},
		win = (typeof window != 'undefined' ? window : global),
		doc = win.document,
		localStorageName = 'localStorage',
		scriptTag = 'script',
		storage;

	store.disabled = false;
	store.version = '1.3.20';
	store.set = function(key, value) {};
	store.get = function(key, defaultVal) {};
	store.has = function(key) { return store.get(key) !== undefined; };
	store.remove = function(key) {};
	store.clear = function() {};
	store.transact = function(key, defaultVal, transactionFn) {
		if (transactionFn == null) {
			transactionFn = defaultVal;
			defaultVal = null;
		}
		if (defaultVal == null) {
			defaultVal = {};
		}
		var val = store.get(key, defaultVal);
		transactionFn(val);
		store.set(key, val);
	};
	store.getAll = function() {
		var ret = {};
		store.forEach(function(key, val) {
			ret[key] = val;
		});
		return ret;
	};
	store.forEach = function() {};
	store.serialize = function(value) {
		return JSON.stringify(value);
	};
	store.deserialize = function(value) {
		if (typeof value != 'string') { return undefined; }
		try { return JSON.parse(value); }
		catch(e) { return value || undefined; }
	};

	// Functions to encapsulate questionable FireFox 3.6.13 behavior
	// when about.config::dom.storage.enabled === false
	// See https://github.com/marcuswestin/store.js/issues#issue/13
	function isLocalStorageNameSupported() {
		try { return (localStorageName in win && win[localStorageName]); }
		catch(err) { return false; }
	}

	if (isLocalStorageNameSupported()) {
		storage = win[localStorageName];
		store.set = function(key, val) {
			if (val === undefined) { return store.remove(key); }
			storage.setItem(key, store.serialize(val));
			return val;
		};
		store.get = function(key, defaultVal) {
			var val = store.deserialize(storage.getItem(key));
			return (val === undefined ? defaultVal : val);
		};
		store.remove = function(key) { storage.removeItem(key); };
		store.clear = function() { storage.clear(); };
		store.forEach = function(callback) {
			for (var i=0; i<storage.length; i++) {
				var key = storage.key(i);
				callback(key, store.get(key));
			}
		};
	} else if (doc && doc.documentElement.addBehavior) {
		var storageOwner,
			storageContainer;
		// Since #userData storage applies only to specific paths, we need to
		// somehow link our data to a specific path.  We choose /favicon.ico
		// as a pretty safe option, since all browsers already make a request to
		// this URL anyway and being a 404 will not hurt us here.  We wrap an
		// iframe pointing to the favicon in an ActiveXObject(htmlfile) object
		// (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
		// since the iframe access rules appear to allow direct access and
		// manipulation of the document element, even for a 404 page.  This
		// document can be used instead of the current document (which would
		// have been limited to the current path) to perform #userData storage.
		try {
			storageContainer = new ActiveXObject('htmlfile');
			storageContainer.open();
			storageContainer.write('<'+scriptTag+'>document.w=window</'+scriptTag+'><iframe src="/favicon.ico"></iframe>');
			storageContainer.close();
			storageOwner = storageContainer.w.frames[0].document;
			storage = storageOwner.createElement('div');
		} catch(e) {
			// somehow ActiveXObject instantiation failed (perhaps some special
			// security settings or otherwse), fall back to per-path storage
			storage = doc.createElement('div');
			storageOwner = doc.body;
		}
		var withIEStorage = function(storeFunction) {
			return function() {
				var args = Array.prototype.slice.call(arguments, 0);
				args.unshift(storage);
				// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
				// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
				storageOwner.appendChild(storage);
				storage.addBehavior('#default#userData');
				storage.load(localStorageName);
				var result = storeFunction.apply(store, args);
				storageOwner.removeChild(storage);
				return result;
			};
		};

		// In IE7, keys cannot start with a digit or contain certain chars.
		// See https://github.com/marcuswestin/store.js/issues/40
		// See https://github.com/marcuswestin/store.js/issues/83
		var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g");
		var ieKeyFix = function(key) {
			return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___');
		};
		store.set = withIEStorage(function(storage, key, val) {
			key = ieKeyFix(key);
			if (val === undefined) { return store.remove(key); }
			storage.setAttribute(key, store.serialize(val));
			storage.save(localStorageName);
			return val;
		});
		store.get = withIEStorage(function(storage, key, defaultVal) {
			key = ieKeyFix(key);
			var val = store.deserialize(storage.getAttribute(key));
			return (val === undefined ? defaultVal : val);
		});
		store.remove = withIEStorage(function(storage, key) {
			key = ieKeyFix(key);
			storage.removeAttribute(key);
			storage.save(localStorageName);
		});
		store.clear = withIEStorage(function(storage) {
			var attributes = storage.XMLDocument.documentElement.attributes;
			storage.load(localStorageName);
			for (var i=attributes.length-1; i>=0; i--) {
				storage.removeAttribute(attributes[i].name);
			}
			storage.save(localStorageName);
		});
		store.forEach = withIEStorage(function(storage, callback) {
			var attributes = storage.XMLDocument.documentElement.attributes;
			for (var i=0, attr; attr=attributes[i]; ++i) {
				callback(attr.name, store.deserialize(storage.getAttribute(attr.name)));
			}
		});
	}

	try {
		var testKey = '__storejs__';
		store.set(testKey, testKey);
		if (store.get(testKey) != testKey) { store.disabled = true; }
		store.remove(testKey);
	} catch(e) {
		store.disabled = true;
	}
	store.enabled = !store.disabled;
	
	return store;
});
define('o2tpl', function () {
  'use strict';
  var tmpl = function (str, data) {
    var f = !/[^\w\-\.:]/.test(str)
      ? tmpl.cache[str] = tmpl.cache[str] || tmpl(tmpl.load(str))
      : new Function(// eslint-disable-line no-new-func
        tmpl.arg + ',tmpl',
        'var _e=tmpl.encode' + tmpl.helper + ",_s='" +
          str.replace(tmpl.regexp, tmpl.func) + "';return _s;"
      );
    return data ? f(data, tmpl) : function (data) {
      return f(data, tmpl);
    };
  };
  tmpl.cache = {};
  tmpl.load = function (id) {
    return document.getElementById(id).innerHTML;
  };
  tmpl.regexp = /([\s'\\])(?!(?:[^{]|\{(?!%))*%\})|(?:\{%(=|#)([\s\S]+?)%\})|(\{%)|(%\})/g;
  tmpl.func = function (s, p1, p2, p3, p4, p5) {
    if (p1) { // whitespace, quote and backspace in HTML context
      return {
        '\n': '\\n',
        '\r': '\\r',
        '\t': '\\t',
        ' ': ' '
      }[p1] || '\\' + p1;
    }
    if (p2) { // interpolation: {%=prop%}, or unescaped: {%#prop%}
      if (p2 === '=') {
        return "'+_e(" + p3 + ")+'";
      }
      return "'+(" + p3 + "==null?'':" + p3 + ")+'";
    }
    if (p4) { // evaluation start tag: {%
      return "';";
    }
    if (p5) { // evaluation end tag: %}
      return "_s+='";
    }
  };
  tmpl.encReg = /[<>&"'\x00]/g;
  tmpl.encMap = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#39;'
  };
  tmpl.encode = function (s) {
    return (s == null ? '' : '' + s).replace(
      tmpl.encReg,
      function (c) {
        return tmpl.encMap[c] || '';
      }
    );
  };
  tmpl.arg = 'o';
  tmpl.helper = ",print=function(s,e){_s+=e?(s==null?'':s):_e(s);}" +
                  ',include=function(s,d){_s+=tmpl(s,d);}';
  return tmpl;
});
define('o2widgetLazyload', function(require, exports, module) {
	'use strict';
	return function(options) {
		var conf = {
			cls: 'o2data-lazyload',
			scrollEvent: 'scroll.lazydata resize.lazydata'
		};
		/**
		 * @desc o2JSConfig 异步模板配置
		 *
		 */
		var o2JSConfig = window.pageConfig ? window.pageConfig.o2JSConfig : {};
		o2JSConfig = o2JSConfig || {};
		$.extend(conf, options);
		var isIE = !!window.ActiveXObject || navigator.userAgent.indexOf("Trident") > 0;
		//本地存储库
		var store = require('store');
    var renderFloorCount = 0;
    var preloadOffset = isIE ? 1000 : 500;
    var loadLeftFloorInterval = null;
		var init = function() {
			var scrollTimer = null;
			$(window).bind(conf.scrollEvent, function(e) {
				clearTimeout(scrollTimer);
				scrollTimer = setTimeout(function() {
					/**
					 * @desc preloadOffset 可视区域阈值，用作提前渲染楼层
					 *
					 */
					var st = $(document).scrollTop(),
						wh = $(window).height() + preloadOffset,
						cls = conf.cls,
						$items = $('.' + cls);

					$items.each(function() {
						var self = $(this),
							rel = self.data('rel') || this,
							item = $(rel),
							forceRender = typeof self.data('forcerender') === 'boolean' ? self.data('forcerender') : false,
							tplPath = null;
						/**
						 * @desc 可视区域渲染模板，根据tplVersion从localstorage读取模板，IE浏览器直接异步加载。
						 * data-tpl {string} 模板ID
						 * data-async {boolean} 是否同步渲染，即渲染模板前进行 beforerender 事件处理，回调后再渲染模板
						 * data-forcerender {boolean} 强制渲染，用作某些需要直接渲染的楼层
						 * data-rel {string|object} 参考渲染对象，默认是本身
						 */

						//判断是否是在可视区域 || 是否强制渲染
						if (forceRender
              || (item.offset().top - (st + wh) < 0 
              && item.offset().top + item.outerHeight(true) >= st)) {
							  renderFloorCore(self);
                renderFloorCount++;
                if (renderFloorCount === 1) {
                  loadLeftFloorInterval = setInterval(function () {
                    var $images = item.find('img[data-lazy-img][data-lazy-img!="done"]');
                    if ($images.length === 0) {
                      renderFloorListForce();
                      clearInterval(loadLeftFloorInterval);
                    }
                  }, 1000);
                }
						}
					});

					if (0 === $items.length) {
						$(window).unbind(conf.scrollEvent);
					}
				}, 200);
			}).trigger(conf.scrollEvent.split(' ')[0]);
		};

    /**
		 * @desc 渲染单个楼层逻辑
     * @param dom {Object} - jQuery对象
		 */
    var renderFloorCore = function ($floorItem) {
      var tplId = $floorItem.data('tpl');
      var content = $floorItem.html();
      var dataAsync = typeof $floorItem.data('async') === 'boolean' ? $floorItem.data('async') : false;

      if (tplId && o2JSConfig.pathRule) {
        var tplPath = o2JSConfig.pathRule(tplId);
        if (isIE || !store.enabled) {
          seajs.use(tplPath, function(result) {
            triggerRender($floorItem, content, dataAsync, result);
          });
        } else {
          var tplStorage = store.get(tplPath);
          if (!tplStorage || tplStorage.version !== window.tplVersion[tplId]) {
            seajs.use(tplPath, function(result) {
              store.set(tplPath, result);
              triggerRender($floorItem, content, dataAsync, result);
            });
          } else {
            triggerRender($floorItem, content, dataAsync, tplStorage);
          }
        }
      } else {
        triggerRender($floorItem, content, dataAsync, '');
      }
    };

    /**
		 * @desc 强制加载剩余楼层
		 */
    var renderFloorListForce = function () {
      var cls = conf.cls;
		  var $items = $('.' + cls);
      $items.each(function() {
        var self = $(this);
        var st = $(document).scrollTop();
				var wh = $(window).height() + preloadOffset;
        var rel = self.data('rel') || this;
			  var item = $(rel);
        var forceRender = typeof self.data('forcerender') === 'boolean' ? self.data('forcerender') : false;
        if (!forceRender 
            && ((item.offset().top - (st + wh) >= 0 
            || item.offset().top + item.outerHeight(true) < st))) {
          setTimeout($.proxy(renderFloorCore, this, self), 100);
          self.bind('done', function () {
            self.trigger('renderImage', self.attr('id'));
          });
        }
      });
    };

		/**
		 * @desc 触发渲染
		 * @param dom {Object} - jQuery对象
		 * @param content {String} - html内容
		 * @param async {Boolean} - 是否异步渲染
		 * @param tpl {Object|String} - 本地存储模板对象
		 */
		var triggerRender = function(dom, content, async, tpl) {
			if (async) {
				dom.html(content).removeClass(conf.cls).trigger('beforerender', function() {
					dom.removeClass('lazy-fn').trigger('render', tpl);
				});
			} else {
				dom.html(content).removeClass(conf.cls).removeClass('lazy-fn').trigger('render', tpl);
			}
		};

		init();
	};
});
/**
 * @description accordion组件，手风琴，具体查看类{@link Accordion}，<a href="./demo/components/accordion/index.html">Demo预览</a>
 * @module accordion
 * @author wangcainuan
 * @example
 * var Accordion = seajs.require('accordion');
 * var accordion = new Accordion({
 *     container: '.shop',
 *     itemSelector: '.shop_item',
 *     itemOfFirstExpand: 1,
 *     isVertical: true,
 *     expandPx: 230,
 *     speed: 500,
 *     easing: 'linear',
 *     activeClass: 'shop_item_on'
 * });
 */


define('accordion', function () {
  'use strict';

  var Accordion = _.Class.extend(/** @lends Accordion.prototype */{
    /**
     * accordion.
     * @constructor
     * @alias Accordion
     * @param {Object} options
     * @param {String} options.container - 指定手风琴的容器选择器
     * @param {String} options.itemSelector - 手风琴项选择器
     * @param {Number} [options.itemOfFirstExpand=0] - 哪个项先展开
     * @param {String} [options.isVertical=true] - 高度变化或者宽度变化
     * @param {Number} [options.expandPx=230] - 宽度或高度变到多大
     * @param {boolean} [options.speed=500] - 手风琴的动画过渡时间
     * @param {Number} [options.easing='linear'] - 动画过渡函数linear|swing
     * @param {String} [options.activeClass='item_on'] - 给当前hover的元素添加的类以便做其他变化
     */
    construct: function (options) {
      $.extend(this, {
        container: null,
        itemSelector: null,
        itemOfFirstExpand: 0,
        isVertical: true,
        expandPx: 230,
        speed: 500,
        easing: 'linear',
        activeClass: 'item_on'
      }, options);

      this.$container = $(this.container);
      this.$itemSelector = $(this.itemSelector);
      this.itemSelectorPx = this.isVertical ? this.$itemSelector.height() : this.$itemSelector.width();
      this.init();
    },

    /**
     * @description 一些初始化操作
     */
    init: function () {
      this.initElements();
      this.initEvent();
    },

    /**
     * @description 获取元素，同时初始化元素的样式
     */
    initElements: function () {

      var $itemEq = this.$itemSelector.eq(this.itemOfFirstExpand);

      $itemEq.addClass(this.activeClass);

      if (this.isVertical) {
        $itemEq.animate({'height': this.expandPx},this.speed,this.timingFunc);
      } else {
        $itemEq.animate({'width': this.expandPx},this.speed,this.timingFunc);
      }
      return this;
    },
    
    /**
     * @description 初始化事件绑定
     */
    initEvent: function () {

      var that = this;
      this.$container.delegate(this.itemSelector,'mouseenter', function () {

        var $this =  $(this);
        $this.addClass(that.activeClass).siblings().removeClass(that.activeClass);

        if (that.isVertical) {
          $this.stop(true,true).animate({'height': that.expandPx},that.speed,that.timingFunc)
          .siblings().animate({'height': that.itemSelectorPx},that.speed,that.timingFunc);
        } else {
          $this.stop(true,true).animate({'width': that.expandPx},that.speed,that.timingFunc)
          .siblings().animate({'width': that.itemSelectorPx},that.speed,that.timingFunc);
        }
      
      });

      return this;
    },

    /**
     * @description 销毁组件
     */
    destroy: function () {
      this.unbind();
      this.$container.remove();
    },

    /**
     * @description 解绑事件
     * @return {Object} this - 实例本身，方便链式调用
     */
    unbind: function () {
      this.$container.undelegate();
      return this;
    }
  });
  
  return Accordion;
});
/**
 * @description carousel组件，轮播，具体查看类{@link Carousel}
 * @module carousel
 * @author liweitao
 * @example
 * var Carousel = require('carousel');
 * var carousel = new Carousel({
 *   container: $('.carousel_main'),
 *   itemSelector: '.carousel_item',
 *   activeClass: 'active',
 *   startIndex: 0,
 *   duration: 300,
 *   delay: 3000,
 *   switchType: 'fade',
 *   onBeforeSwitch: function (current, next) {
 *     this.switchNav(next);
 *   }
 * });
 */

define('carousel', function () {
  'use strict';

  var Carousel = _.Class.extend(/** @lends Carousel.prototype */{
    /**
     * carousel.
     * @constructor
     * @alias Carousel
     * @param {Object} options
     * @param {String|HTMLElement|Zepto} options.container - 指定轮播的容器
     * @param {String} [options.itemSelector] - 轮播项选择器
     * @param {Number} [options.itemWidth] - 每一个轮播项的宽度
     * @param {String} [options.activeClass] - 标注当前所处class
     * @param {Number} [options.startIndex] - 起始轮播项索引
     * @param {Number} [options.duration] - 每一个轮播项的动画过渡时间
     * @param {Number} [options.delay] - 轮播项之间切换的间隔时间
     * @param {String} [options.switchType] - 轮播动画形式 fade|slide
     * @param {Boolean} [options.isAuto] - 是否自动播放
     * @param {Function} [options.onBeforeSwitch] - 轮播切换前触发的操作
     * @param {Function} [options.onAfterSwitch] - 轮播切换后触发的操作
     */
    construct: function (options) {
      $.extend(this, {
        container: null,
        itemSelector: null,
        itemWidth: 0,
        activeClass: 'active',
        startIndex: 0,
        duration: 500,
        delay: 2000,
        switchType: 'fade',
        isAuto: true,
        onBeforeSwitch: function () {},
        onAfterSwitch: function () {}
      }, options);

      this.$container = $(this.container);
      this.init();
    },

    /**
     * @description 一些初始化操作
     */
    init: function () {
      this.initElements();
      this.initEvent();
      this.setCurrent(this.startIndex);
      if (this.isAuto) {
        this.start();
      }
    },
    
    /**
     * @description 获取元素，同时初始化元素的样式
     */
    initElements: function () {
      this.$items = this.$container.find(this.itemSelector);
      this.length = this.$items.length;
      switch (this.switchType) {
        case 'fade':
          this.$items.css({
            opacity: 0,
            zIndex: 0,
            position: 'absolute'
          });
          break;
        case 'slide':
          var $items = this.$items;
          var $firstClone = $($items.get(0)).clone();
          var $lastClone = $($items.get(this.length - 1)).clone();
          this.$container.append($firstClone).prepend($lastClone);
          this.$items = this.$container.find(this.itemSelector);
          this.$container.css({
            width: (this.length + 2) * this.itemWidth,
            position: 'absolute',
            top: 0,
            left: -this.itemWidth
          });
          break;
        default:
          break;
      }
      return this;
    },
    
    /**
     * @description 初始化事件绑定
     */
    initEvent: function () {
      this.$container.bind('mouseenter', $.proxy(this.stop, this))
        .bind('mouseleave', $.proxy(this.start, this));
      return this;
    },
    
    /**
     * @description 设置当前所处位置
     * @param {Number} index - 当前索引
     * @return {Object} this - 实例本身，方便链式调用
     */
    setCurrent: function (index) {
      this.currentIndex = index;
      var $items = this.$items;
      var $current = $($items.get(index));
      $items.removeClass(this.activeClass);
      $current.addClass(this.activeClass);
      switch (this.switchType) {
        case 'fade':
          $($items.get(index)).css({
            opacity: 1,
            zIndex: 5
          });
          break;
        default:
          break;
      }
      return this;
    },

    /**
     * @description 获取当前索引
     * @return {Number} index - 当前索引
     */
    getCurrent: function () {
      return this.currentIndex;
    },
    
    /**
     * @description 切换到某一项
     * @param {Number} index - 需要切换到的索引
     * @return {Object} this - 实例本身，方便链式调用
     */
    switchTo: function (index) {
      switch (this.switchType) {
        case 'fade':
          var $items = this.$items;
          var $current = $($items.get(this.currentIndex));
          var $newCurrent = null;
          if (index >= this.length) {
            index = 0;
          } else if (index <= -1) {
            index = this.length - 1;
          }
          $newCurrent = $($items.get(index));
          if ($.isFunction(this.onBeforeSwitch)) {
            this.onBeforeSwitch.call(this, this.currentIndex, index);
          }
          var currentIndex = this.currentIndex;
          $items.each(function (i) {
            var $item = $(this);
            if (parseInt($item.css('zIndex'), 10) === 5 && i !== currentIndex) {
              $item.fadeTo(0, 0).css('zIndex', '0');
            }
          });
          $current.stop().fadeTo(this.duration, 0, $.proxy(function () {
            $current.css('zIndex', '0');
          }, this));
          $newCurrent.stop().fadeTo(this.duration, 1, $.proxy(function () {
            this.setCurrent(index);
            $newCurrent.css({
              opacity: 1,
              zIndex: 5
            });
            if ($.isFunction(this.onAfterSwitch)) {
              this.onAfterSwitch.call(this, this.currentIndex);
            }
          }, this));
          break;
        case 'slide':
          var $items = this.$items;
          var $current = $($items.get(this.currentIndex));
          if ($.isFunction(this.onBeforeSwitch)) {
            this.onBeforeSwitch.call(this, this.currentIndex, index);
          }
          this.$container.animate({'left': -(index + 1) * this.itemWidth}, this.duration, $.proxy(function () {
            if (index >= this.length) {
              index = 0;
              this.$container.css('left', -this.itemWidth * (index + 1));
            } else if (index <= -1) {
              index = this.length - 1;
              this.$container.css('left', -this.itemWidth * (index + 1));
            }
            this.setCurrent(index);
            if ($.isFunction(this.onAfterSwitch)) {
              this.onAfterSwitch.call(this, this.currentIndex);
            }
          }, this));
          break;
        default:
          break;
      }
      return this;
    },
    
    /**
     * @description 切换到前一项
     */
    switchToPrev: function () {
      var index = this.currentIndex - 1;
      this.switchTo(index);
      return this;
    },
    
    /**
     * @description 切换到下一项
     */
    switchToNext: function () {
      var index = this.currentIndex + 1;
      this.switchTo(index);
      return this;
    },
    
    /**
     * @description 开始自动播放
     */
    start: function () {
      clearTimeout(this.autoTimer);
      this.autoTimer = setTimeout($.proxy(function () {
        this.switchToNext().start();
      }, this), this.delay);
      return this;
    },
    
    /**
     * @description 停止自动播放
     */
    stop: function () {
      clearTimeout(this.autoTimer);
      return this;
    },

    /**
     * @description 销毁组件
     */
    destroy: function () {
      this.unbind();
      this.$container.remove();
    },

    /**
     * @description 解绑事件
     * @return {Object} this - 实例本身，方便链式调用
     */
    unbind: function () {
      this.$container.unbind();
      return this;
    }
  });
  
  return Carousel;
});
define('cookie', function () {
  'use strict';

  /**
   * @description cookie的存操作
   * @param {String} key - cookie的key
   * @param {String} value - cookie中key对应的值
   * @param {Number} [expires] - 过期时间
   * @param {String} [path] - 设置cookie的path
   * @param {String} [domain] - 设置cookie的domain
   * @param {Boolean} [secure] - 设置cookie是否只在安全连接https下起作用
   */
  function setCookie (key, value, expires, path, domain, secure) {
    if (arguments.length <= 1) {
      throw new Error('Parameters can not be less than 1');
    }
    if (expires) {
      var date = null;
      if (typeof expires === 'number') {
        date = new Date();
        date.setTime(date.getTime() + expires);
      } else if (expires.toUTCString) {
        date = expires;
      }
      if (typeof expires === 'string') {
        secure = domain;
        domain = path;
        path = expires;
      } else {
        expires = '; expires=' + date.toUTCString();
      }
    }

    if (!expires) {
      expires = undefined;
    }
    path = path ? '; path=' + path : '; path=/';
    domain = domain ? '; domain=' + domain : '';
    secure = secure ? '; secure' : '';
    /** 使用数组join方法可以避开undefined或null的情况 */
    document.cookie = [key, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
  }

  /**
   * @description cookie的取操作
   * @param {String} key - cookie的key
   * @return {String} cookie
   */
  function getCookie (key) {
    if (typeof key === 'string') {
      var arr = document.cookie.match(new RegExp('(^| )' + key + '=([^;]*)(;|$)'));
      if (arr) {
        return decodeURIComponent(arr[2]);
      }
    }
    return false;
  }

  /**
   * @description 删除某一cookie
   * @param {String} key - cookie的key
   * @return {Boolean} 是否成功
   */
  function deleteCookie (key) {
    if (getCookie(key) !== null) {
      setCookie(key, null, -1);
      return true;
    }
    return false;
  }

  return {
    get: getCookie,
    set: setCookie,
    delete: deleteCookie
  };
});
/**
 * @description 倒计时组件，具体查看类{@link Countdown},<a href="./demo/components/countdown/index.html">Demo预览</a>
 * @module countdown
 * @author wangbaohui
 * @example
 * var CountDown = require('countdown');
 * var util = require('util');
 * var today = new Date();
 * var td = util.getCalendar(today, 0);
 * var h = today.getHours();
 * var start = td + ' 10:00:00',
 * var end = td + ' 14:00:00',

 *   var cd = new CountDown({
 *     startTime: start,
 *     endTime: end,
 *     stateCallback: function(data) {
 *       //根据状态设置界面
 *       switch (data.state) {
 *         case 0:
 *           //结束
 *           break;
 *         case 1:
 *           //未开始，预告
 *           break;
 *         case 2:
 *           //进行中
 *           break; 
 
 *         default:
 *           break;
 *       }
 *     }
 * })
 */

define('countdown', function(require) {
  'use strict';

  var Countdown = _.Class.extend( /** @lends Countdown.prototype */ {

    /**
     * countdown.
     * @constructor
     * @alias Countdown
     * @param {Object} options
     * @param {String} options.startTime - 开始时间 (必填)
     * @param {Number} options.endTime - 结束时间 (必填)
     * @param {Number} [options.state=1] - 默认状态 
     * @param {Number} [options.autoStart=true] - 是否自动运行
     * @param {Number} [options.stateMap= "{0: {name: '已结束'},1: {name: '未开始'},2: {name: '进行中'}}"] - 倒计时状态
     * @param {Function} [options.stateCallback=null] 倒计时回调
     */
    construct: function(options) {
      var def = {
        startTime: new Date(), //开始时间
        endTime: new Date(), //结束时间
        state: 1, //当前状态
        stateCallback: null, //状态回调
        autoStart: true,
        stateMap: {
          0: {
            name: '已结束'
          },
          1: {
            name: '未开始'
          },
          2: {
            name: '进行中'
          }
        },
        timer: null //定时器

      }

      $.extend(this, def, options || {});
      this.autoStart && this.init();
    },

    /**
     * @description 初始化
     */
    init: function() {
      this.start();
    },

     /**
      * @description 开始
      */
    start: function() {
      this.timer = setInterval($.proxy(this.update, this), 1000);
    },

     /**
      * @description 暂停
      */
    pause: function() {
      this.timer && clearInterval(this.timer);
    },

     /**
      * @description 更新
      */
    update: function() {
      var now = +new Date; //当前时间
      var st = new Date(this.startTime).getTime();
      var et = new Date(this.endTime).getTime();

      if (st > now) {
        //预告
        this.state = 1;
      }
      if (et < now) {
        //已结束
        this.state = 0;
        this.pause();
      }
      if (now > st && now < et) {
        //进行中
        this.state = 2;
      }

      var rt = this.state == 2 ? et - now : st - now;
      var hour = this.pad(Math.floor((rt / (1000 * 60 * 60)) % 24), 2);
      var minute = this.pad(Math.floor((rt / 1000 / 60) % 60), 2);
      var second = this.pad(Math.floor((rt / 1000) % 60), 2);
      var day = this.pad(Math.floor(rt / (1000 * 60 * 60 * 24)), 2);
      var data = {
        hour: hour,
        minute: minute,
        second: second,
        day: day,
        state: this.state,
        current: this.stateMap[this.state]
      }
      this.stateCallback && this.stateCallback(data);
    },
    pad: function(value, n) {
      return (Array(n).join(0) + value).slice(-n);
    }
  });

  return Countdown;
});
/**
 * @description 对话框组件，具体查看类{@link Dialog},<a href="./demo/components/dialog/index.html">Demo预览</a>
 * @module Dialog
 * @author mihan
 * 
 * @example
var Dialog = seajs.require('Dialog');
var dom = '';
var dialog = new Dialog({
    txtInfo: {
        title: 'text',
        description: 'text',
        confirm: 'text',
        cancel: 'text',
        ...
    },
    container: 'container'
});

dom = ['<div class="container" id="container">',
    '        <div class="box">',
    '            <h1>' + dialog.txtInfo.title + '</h1>',
    '            <p>' + dialog.txtInfo.desc + '</p>',
    '            <div class="btns"><a href="#" class="btns_a">' + dialog.txtInfo.confirm + '</a><a href="#" class="btns_b">' + dialog.txtInfo.cancel + '</a></div>',
    '            <div class="close">X</div>',
    '        </div>          ',
    '    </div>'].join("");

dialog.render({
    dom: dom
});

dialog.callBack({
    'selecter': function(){
        do something...
    },
    '.close': function(){
        dialog.$container.toggle();
    },
    ...
});
 */

define('Dialog', function () {
    'use strict';

    var Dialog = _.Class.extend(/** @lends Dialog.prototype */{
    
        /**
         * @constructor
         * @alias Dialog
         * @param {Object} opts - 组件配置
         * @param {String} opts.container - 必选，对话框容器
         * @param {Object} [opts.txtInfo] - 对话框文本信息
         */
        construct: function(opts){
            this.config = {
                txtInfo: null,
                container: ''
            }
            
            if(opts){
                $.extend(this.config,opts);
            }
                
            this.checkRun();
        },

        /**
         * @description 检查组件是否可执行
         * @private
         */
        checkRun: function(){
            var config = this.config;
            if( 
                config.container == '' 
            ){
                return; 
            }else{
                this.init();
            }
            
        },
        
        /**
         * @description 组件初始化
         * @private
         */
        init: function(){
            var conf = this.config;
            this.txtInfo = conf.txtInfo === null ? '' : conf.txtInfo;
            this.isRender = false;
        },

        
        /**
         * @description 对话框渲染
         * @param {Object} opts - 参数集
         * @param {String} opts.dom - 对话框 HTML 结构字符串
         */
        render: function(opts){
            var _this = this;
            var conf = this.config;
            var $container = null;
            $('body').append(opts.dom);
            $container = $('#' + conf.container);
            $container.toggle();
            this.$container = $container;
            this.isRender = true;
        },

        /**
         * @description 对话框按钮回调函数
         * @param {Object} opts - 按钮集合
         * @param {String} opts.key  - 按钮选择器名
         * @param {Function} opts.value - 按钮回调函数
         */
        callBack: function(opts){
            var _this = this;
            if(opts){
                $.each(opts,function(selecter,callback){
                    _this.$container.find(selecter).unbind('click.defined');
                    _this.$container.find(selecter).bind('click.defined',function(){
                        callback();
                    });
                })
            }                
                
        }

    });

    return Dialog;
    
});
define('o2lazyload', function () {
  'use strict';
	var $window = $(window);

	$.fn.o2lazyload = function(options) {
		var self = this;
		var $self = $(self);
		var settings = {
			threshold: 200, //视野距离，用于在视野多宽内加载图片
			delay: 100, //节流器定时
			container: window, //容器
			source: 'data-lazy-img', //懒加载字段
			supportWebp: true, //是否开启webp，默认开启
			cacheSupportWebp: true, //是否用cookie存储webp支持情况，默认开启
			cacheSupportWebpKey: 'o2-webp', //开启cookie保存webp支持情况下使用的key
			webpReg: /\/\/img\d+.360buyimg.com\/.+\.(jpg|png)$/,// 需要替换成webp的图片正则
			webpSuffix: '.webp', //webp图片后缀
			webpQuality: 80, //webp图片质量
			webpDisableKey: 'data-webp', //图片开启开关
			webpDisableValue: 'no', // 关闭webp图片替换
			forceOpenOrCloseWebP: 'o2-webp', // 强制开启或关闭webp，忽略webpDisableKey，0为关闭webp，1为开启webp
			placeholder: '//misc.360buyimg.com/lib/img/e/blank.gif' //src为空时 默认占位图
		};

		if (options) {
			$.extend(settings, options);
		}

		/**
		 * 判断是否在视野内
		 * @param  {string} dom
		 * @return {function}
		 */
		var inviewport = (function() {
		  var belowthefold = function(element) {
		    var fold;

		    if (settings.container === undefined || settings.container === window) {
		      fold = (window.innerHeight ? window.innerHeight : $window.height()) + $window.scrollTop();
		    } else {
		      fold = $(settings.container).offset().top + $(settings.container).height();
		    }

		    return fold <= $(element).offset().top - settings.threshold;
		  };

		  var rightoffold = function(element) {
		    var fold;

		  	if (settings.container === undefined || settings.container === window) {
		    	fold = $window.width() + $window.scrollLeft();
		  	} else {
		    	fold = $(settings.container).offset().left + $(settings.container).width();
		  	}

		    return fold <= $(element).offset().left - settings.threshold;
		  };

		  var abovethetop = function(element) {
		    var fold;

		    if (settings.container === undefined || settings.container === window) {
		      fold = $window.scrollTop();
		    } else {
		      fold = $(settings.container).offset().top;
		    }

		    return fold >= $(element).offset().top + settings.threshold  + $(element).height();
		  };

		  var leftofbegin = function(element) {
		    var fold;

		    if (settings.container === undefined || settings.container === window) {
		      fold = $window.scrollLeft();
		    } else {
		      fold = $(settings.container).offset().left;
		    }

		    return fold >= $(element).offset().left + settings.threshold + $(element).width();
		  };

		  return function(element) {
		    return !rightoffold(element) && !leftofbegin(element) && !belowthefold(element) && !abovethetop(element);
		  };

		}());

		var Lazyload = {
			$elements: [],
			webpSupported: false,
			forceOpenWebP: false,
			_setImg: function(img, $img, src) {
				$img.attr('src', src);
				img.onload = null;
			},
			_errorLoadImg: function(img, $img, imgSrc) {
				if (this.webpSupported && ($img.attr(settings.webpDisableKey) !== settings.webpDisableValue) || this.forceOpenWebP) {
					img.onload = $.proxy(function() {
						this._setImg(img, $img, imgSrc);
					}, this);
					img.src = imgSrc;
				}
				
				img.onerror = null;
			},
			_loadImg: function($img) {
				var imgSrc = $img.attr(settings.source);
				var webpDisable = $img.attr(settings.webpDisableKey);
				var imgLoadedSrc = imgSrc;

				if (this.webpSupported) {
					if (settings.webpReg.test(imgSrc) && (webpDisable !== settings.webpDisableValue) || this.forceOpenWebP) {
						imgLoadedSrc = imgSrc + '!q' + settings.webpQuality + settings.webpSuffix;
					}
				}

				var img = new Image();
				img.onload = $.proxy(function() {
					this._setImg(img, $img, imgLoadedSrc);
				}, this);
				img.onerror = $.proxy(function() {
					this._errorLoadImg(img, $img, imgSrc);
				}, this);

				img.src = imgLoadedSrc;
			},			
			_loadImgs: function() {
				this.$elements = $self.find('img[' + settings.source + '][' + settings.source + '!="done"]');

				this.$elements.each($.proxy(function(i, img) {
					var $img = $(img);

					if (inviewport(img) && $img.attr(settings.source) !== undefined) {
						if (!$img.attr('src')) {
							$img.attr('src', settings.placeholder);
						}

						this._loadImg($img);
						$img.attr(settings.source, 'done');
					}
				}, this));
			},
			_loadTimer: null,
			_update: function() {
				clearTimeout(this._loadTimer);
				this._loadTimer = setTimeout($.proxy(this._loadImgs, this), settings.delay);
			},
      _forceUpdateArea: function (e, id) {
				setTimeout($.proxy(this._forceLoadImgs, this, id), settings.delay);
      },
      _forceLoadImgs: function (id) {
        this.$elements = $self.find('#' + id).find('img[' + settings.source + '][' + settings.source + '!="done"]');
        this.$elements.each($.proxy(function(i, img) {
					var $img = $(img);

					if ($img.attr(settings.source) !== undefined) {
						if (!$img.attr('src')) {
							$img.attr('src', settings.placeholder);
						}

						this._loadImg($img);
						$img.attr(settings.source, 'done');
					}
				}, this));
      },
			_initEvent: function() {
				$(document).ready($.proxy(this._update, this));
				$window.bind('scroll.o2-lazyload', $.proxy(this._update, this));
				$window.bind('resize.o2-lazyload', $.proxy(this._update, this));
        $self.bind('renderImage', $.proxy(this._forceUpdateArea, this));
			},
			_isInit: function() { //防止同一元素重复初始化
				if ($self.attr(settings.source + '-install') === '1') {
					return true;
				}
				$self.attr(settings.source + '-install', '1');
				return false;
			},
			init: function(webpSupported) {
				if (!this._isInit()) {
					var forceOpenWebP = Util.getUrlParams(settings.forceOpenOrCloseWebP);
					this.webpSupported = webpSupported;
					if (forceOpenWebP === '1') {
						this.forceOpenWebP = true;
					}
					this._initEvent();					
				}
			}
		};

		var Util = {
			setCookie: function(name,value,expireMonth,domain) { //设置cookie
				if(!domain){
					domain = location.hostname;
				}
				if(arguments.length>2){
					var expireTime = new Date(new Date().getTime()+parseInt(expireMonth*60*60*24*30*1000));
					document.cookie = name+"="+escape(value)+"; path=/; domain="+domain+"; expires="+expireTime.toGMTString() ;
				}else{
					document.cookie = name + "=" + escape(value) + "; path=/; domain="+domain;
				}
			},
			getCookie: function (name){ //获取cookie
				try{
					return (document.cookie.match(new RegExp("(^"+name+"| "+name+")=([^;]*)"))==null)?"":decodeURIComponent(RegExp.$2);
				}
				catch(e){
					return (document.cookie.match(new RegExp("(^"+name+"| "+name+")=([^;]*)"))==null)?"":RegExp.$2;
				}
			},
			getUrlParams: function (key){ //获取URL参数
				var query = location.search;
				var reg = "/^.*[\\?|\\&]" + key + "\\=([^\\&]*)/";
				reg = eval(reg);
				var ret = query.match(reg);
				if (ret != null) {
					return decodeURIComponent(ret[1]);
				} else {
					return "";
				}
			}
		};

		/**
		 * 判断是否支持webp
		 * @param  {Function} callback
		 */
		var checkWebp = function(callback) {
			if (Util.getUrlParams(settings.forceOpenOrCloseWebP) === '0') {
				callback(false);
				return;
			}
			if (!settings.supportWebp) {
				callback(false);
				return;
			}
			if (settings.cacheSupportWebp) {
				var isSupportWebp = Util.getCookie(settings.cacheSupportWebpKey);
				if (isSupportWebp !== '') {
					if (isSupportWebp === 'true' || isSupportWebp === true) {
						callback(true);
					} else {
						callback(false);						
					}
					return;
				}
			};

	    var img = new Image();
	    img.onload = function () {
	        var result = (img.width > 0) && (img.height > 0);
	        callback(result);
					if (settings.cacheSupportWebp) {
	        	Util.setCookie(settings.cacheSupportWebpKey, result, 1);
	      	}
	    };
	    img.onerror = function () {
	        callback(false);
					if (settings.cacheSupportWebp) {	        
	        	Util.setCookie(settings.cacheSupportWebpKey, false, 1);
	        }
	    };
	    img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA';
		};

		checkWebp(function(webpSupported) {
			Lazyload.init(webpSupported);
		});

    return this;
	};
});
/**
 * @description lift组件，具体查看类{@link Lift},<a href="./demo/components/lift/index.html">Demo预览</a>
 * @module Lift
 * @author mihan
 * 
 * @example
<div class="JS_floor floor">floor1</div>
<div class="JS_floor floor">floor2</div>
..
<div class="JS_floor floor">floorN</div>
<div id="contianer">
   <div class="JS_lift item"></div>
   <div class="JS_lift item item_on"></div>
   ...
   <div id="backTop"></div>
</div>

 * @example
var Lift = seajs.require('lift');
var lift = new Lift({
    $container: $('#contianer'), 
    $backTop: $('#backTop'), 
    itemSelectedClassName: 'item_on' 
});
 */

define('lift', function () {
    'use strict';

    var Lift = _.Class.extend(/** @lends Lift.prototype */{
    
        /**
         * @constructor
         * @alias Lift
         * @param {Object} opts - 组件配置
         * @param {Object} opts.$container - 必选，JQ对象，电梯列表容器
         * @param {Object} [opts.$backTop = null] - 可选，JQ对象，返回顶部按钮
         * @param {String} [opts.floorListHook = '.JS_floor'] - 可选，楼层列表项勾子
         * @param {String} [opts.liftListHook = '.JS_lift'] - 可选，电梯列表项勾子
         * @param {String} [opts.itemSelectedClassName = ''] - 可选，电梯列表项选中样式 ClassName
         * @param {Number} [opts.speed = 800] - 可选，页面滚动动画时间
         */
        construct: function(opts){
            this.config = {
                $container: null,
                $backTop: null,
                floorListHook: '.JS_floor',
                liftListHook: '.JS_lift',
                itemSelectedClassName: '',
                speed: 800
            }
            
            if(opts){
                $.extend(this.config,opts);
            }
                
            this.init();
        },
        
        
        /**
         * @description 组件初始化
         */
        init: function(){
            this.$window = $(window); 
            this.WIN_W = this.$window.width();
            this.WIN_H = this.$window.height();
            this.DOC_H = $(document).height();
            this.timer = null;
            this.$floorList = $(this.config.floorListHook);
            this.$liftList = this.config.$container.find(this.config.liftListHook); // 精确找到电梯容器内的列表项勾子，以防冲突
            this.checkRun(); // 检查是否可以运行组件
        },


        /**
         * @description 检查组件是否可运行
         * @private
         * @returns {Boolean} 如果电梯列表容器『config.$container』、楼层勾子『this.$floorList』 电梯列表项勾子『this.$liftList』缺一项，返回 false，组件将终止运行
         */
        
        checkRun: function(){
            var config = this.config;
            if(config.$container == null ||  this.$floorList.length == 0 || this.$liftList.length == 0 ){
                return; 
            }else{
                this.start();
            }
        },


        /**
         * @description 运行组件
         * @private
         */
        start: function(){
            this.bindEvents();
        },


        /**
         * @description 获取楼层位置信息
         * @returns {Null | Array} 返回楼层位置信息数组
         */
        getFloorInfo: function(){
            var floorInfo = [];

            if(this.$floorList.length > 0){
                this.$floorList.each(function(){
                    floorInfo.push($(this).offset().top);
                });
                return floorInfo;
            }else{
                return null;
            }
             
        },

        /**
         * @description 电梯滚动、电梯跳转、返回顶部事件绑定
         * @private
         */
        bindEvents: function(){
            var config = this.config;
            var $BackTop = config.$backTop;
            var _this = this;

            // window 绑定电梯滚动事件
            _this.$window.bind('scroll.lift',$.proxy(_this.lift,_this));

            // 绑定电梯跳转事件
            config.$container.delegate(config.liftListHook,'click.lift',{thisObj:_this},_this.liftJump);

            // 绑定返回顶部事件
            if($BackTop !== null && $BackTop.length > 0){
                $BackTop.bind('click.backTop',$.proxy(_this.backTop,_this));
            }


        },


        /**
         * @description 返回顶部
         * @private
         * @returns {Boolean} 防止事件冒泡
         */
        backTop: function(){
            var _this = this;
            var config = _this.config;
            _this.$window.unbind('scroll.lift');
            $('body,html').stop().animate({
                scrollTop: 0
            },config.speed,function(){
                _this.$window.bind('scroll.lift',$.proxy(_this.lift,_this));
                _this.$liftList.removeClass(config.itemSelectedClassName);
            });
            return false;
        },


        /**
         * @description 电梯滚动
         * @private
         */
        lift: function(){
            var _this = this;
            var config = _this.config;
            var winScrollTop = _this.$window.scrollTop();
            var itemSelectedClass = config.itemSelectedClassName;
            clearTimeout(_this.timer);            
            $.each(_this.getFloorInfo(),function(index,value){
                if( winScrollTop >= (value - _this.WIN_H/2 + 5) ){
                    _this.$liftList.eq(index).addClass(itemSelectedClass).siblings(config.liftListHook).removeClass(itemSelectedClass);
                }else{
                    if( winScrollTop >= _this.DOC_H -  _this.WIN_H/2 - 5){
                        _this.$liftList.eq(index).addClass(itemSelectedClass).siblings(config.liftListHook).removeClass(itemSelectedClass);
                    } 
                }
                
                if(winScrollTop < (_this.getFloorInfo()[0] - _this.WIN_H/2) ){
                    _this.$liftList.removeClass(itemSelectedClass);
                }
            })
        },

        /**
         * @description 电梯跳转
         * @private
         * @param {any} event - event对象
         * @param {Object} event.data - jQuery bind 方法 eventData 对象参数
         * @param {Object} event.data.thisObj - 传递本类 Lift 对象
         */
        liftJump: function(event){
            var _this = event.data.thisObj;
            var config = _this.config;
            clearTimeout(_this.timer);
            $(this).addClass(config.itemSelectedClassName).siblings(config.liftListHook).removeClass(config.itemSelectedClassName);
            _this.$window.unbind('scroll.lift');
            $('body,html').stop().animate({
                scrollTop: _this.getFloorInfo()[$(this).index( config.$container.selector  + ' ' + config.liftListHook)]
            },config.speed,function(){
                _this.timer = setTimeout(function(){
                    _this.$window.bind('scroll.lift',$.proxy(_this.lift,_this));
                },50);
            });
        }

    });

    return Lift;
    
});
/**
 * @description login组件，具体查看类{@link Login},<a href="./demo/components/login/index.html">Demo预览</a>
 * @module login
 * @author YL
 * @example
 * 请修改host为 xxx.jd.com，然后进行测试
 * var Login = require('login');
 *
 * //只验证用户是否登陆
 * Login(function(data){
 *	   //data为true则用户已登陆，false则未登陆
 *})
 *
 * //验证用户是否登陆，如未登陆，则让用户登陆
 * Login({
 *     modal: false //弹框登陆(true)或者打开登陆界面登陆(false)
 *     complete: function(data){ //登陆成功后的回调
 *	       //data为用户登陆成功的信息
 *     }	 
 * });
 */

define("login", ["//misc.360buyimg.com/jdf/1.0.0/unit/login/1.0.0/login.js", "//misc.360buyimg.com/jdf/1.0.0/ui/dialog/1.0.0/dialog.js"], function(require){
	'use strict';

	var jdLogin = require("//misc.360buyimg.com/jdf/1.0.0/unit/login/1.0.0/login.js");

	var Login = _.Class.extend(/** @lends Login.prototype */{
		/**
         * @constructor
         * @alias Login
         * @param {Object} opts - 组件配置
         */
        construct: function (options) {
          $.extend(this, {}, options);
        },

        /**
         * @description 用户是否登陆及是否需要登陆
         * @param {Object} option
         * @param {function} function(){} 只验证登陆的回调
         * @param {Boolean} modal 弹框登陆(true)或者打开登陆界面登陆(false)
         * @param {function} complete 登陆成功后的回调
         */
        isLogin: function (option) {
        	if(typeof option === "function"){
				jdLogin.isLogin(option) //只验证用户是否登陆
			}else{
				jdLogin(option) //验证用户是否登陆，如未登陆，则让用户登陆
			}
        }
	});
	
	var checkLogin = new Login().isLogin;

	return checkLogin;
})
/**
 * @description marquee组件，跑马灯，具体查看类{@link Marquee}，<a href="./demo/components/marquee/index.html">Demo预览</a>
 * @module marquee
 * @author wangcainuan
 * @example
 * var Marquee = seajs.require('marquee');
 *   var marquee = new Marquee({
 *     container: '.goods_wrapper',
 *     itemSelector: '.goods_list',
 *     duration: 5000,
 *     delay: 0,
 *     gap: 20,
 *     direction: 'up',
 *     pauseOnHover: true
 *   });
 */


define('marquee', function () {
  'use strict';

  var Marquee = _.Class.extend(/** @lends Marquee.prototype */{
    /**
     * marquee.
     * @constructor
     * @alias Marquee
     * @param {Object} options
     * @param {String} options.container - 指定跑马灯的容器选择器
     * @param {String} options.itemSelector - 跑马灯项选择器
     * @param {Number} [options.duration=5000] - 每一个跑马灯项的动画过渡时间
     * @param {boolean} [options.delay=0] - 跑马灯项的动画延迟时间
     * @param {Number} [options.gap=0] - 每一个跑马灯项的间隔像素
     * @param {String} [options.direction=left] - 轮播动画形式 left|up
     * @param {boolean} [options.pauseOnHover=true] - hover时暂停跑马灯  
     */
    construct: function (options) {
      $.extend(this, {
        container: null,
        itemSelector: null,
        duration: 5000,
        delay: 0,
        gap: 0,
        direction: 'left',
        pauseOnHover: true
      }, options);

      this.$container = $(this.container);
      this.$itemSelector = $(this.itemSelector);
      this.init();
    },

    /**
     * @description 一些初始化操作
     */
    init: function () {
      this.initElements();
      this.initEvent();
      this.start();
    },
    
    /**
     * @description 获取元素，同时初始化元素的样式
     */
    initElements: function () {

      this.$itemSelector = $(this.itemSelector);
      
      var cloneNum;

      this.$container.parent().css({
        position: 'relative'
      });
      
      switch (this.direction) {
        case 'left':
          this.itemSelectorWidth = this.$itemSelector.outerWidth();
          this.containerWidth = this.itemSelectorWidth+this.gap;
          cloneNum = Math.ceil(this.$container.parent().outerWidth() / this.containerWidth); // 计算该复制几个
          this.containerWidth = this.containerWidth*(cloneNum+1);
          // 插入页面中
          for (var i=0;i<cloneNum;i++) {
            this.$container.append(this.$itemSelector.clone());
          }

          // 获取最新的列表
          this.$itemSelector = $(this.itemSelector);

          this.$container.css({
            position: 'absolute',
            top: 0,
            left: 0,
            width: this.containerWidth,  
            overflow: 'hidden'
          });
          this.$itemSelector.css({
            float: 'left',
            display: 'block',
            marginRight: this.gap,
            marginLeft: 0
          });
          break;
        case 'up':
          this.itemSelectorHeight = this.$itemSelector.outerHeight();
          this.containerHeight = this.itemSelectorHeight+this.gap;
          cloneNum = Math.round(this.$container.parent().outerHeight() / this.containerHeight); // 计算该复制几个
          this.containerHeight = this.containerHeight*(cloneNum+1);
          // 插入页面中
          for (var i=0;i<cloneNum;i++) {
            this.$container.append(this.$itemSelector.clone());
          }

          // 获取最新的列表
          this.$itemSelector = $(this.itemSelector);

          this.$container.css({
            position: 'absolute',
            top: 0,
            left: 0,
            height: this.containerHeight,  
            overflow: 'hidden'
          });
          this.$itemSelector.css({
            float: 'left',
            display: 'block',
            marginTop: 0,
            marginBottom: this.gap
          });
          break;
        default:
          break;
      }
      return this;
    },
    
    /**
     * @description 初始化事件绑定
     */
    initEvent: function () {
      
      if (this.pauseOnHover) {
        this.$container.delegate(this.itemSelector,'mouseenter', $.proxy(this.stop, this))
        .delegate(this.itemSelector,'mouseleave', $.proxy(this.start, this));
      }
      return this;
    },

    /**
     * @description 开始动画
     */
    startAnimate: function () {

      this.$container = $(this.container);

      var $nowItem = this.$container.find(this.itemSelector).eq(0);

      switch (this.direction) {
        case 'left':
          this.$container.animate({'left': -(this.itemSelectorWidth+this.gap)}, this.duration, "linear",$.proxy(function () {
            this.$container.css({left : 0});  // 实现无缝
            $nowItem.appendTo(this.$container); //直接移动到最后一位；
          }, this));
          break;
        case 'up':
          this.$container.animate({'top': -(this.itemSelectorHeight+this.gap)}, this.duration, "linear",$.proxy(function () {
            this.$container.css({top : 0});  // 实现无缝
            $nowItem.appendTo(this.$container); //直接移动到最后一位；
          }, this));
        default:
          break;
      }
      return this;
    },

    /**
     * @description 停止动画
     */
    stopAnimate: function () {
      this.$container.stop(true); 
      return this;
    },
    
    /**
     * @description 开始自动播放
     */
    start: function () {
      clearTimeout(this.autoTimer);
      this.autoTimer = setTimeout($.proxy(function () {
        this.startAnimate().start();
      }, this), this.delay);
      return this;
    },
    
    /**
     * @description 停止自动播放
     */
    stop: function () {
      clearTimeout(this.autoTimer);
      this.stopAnimate();
      return this;
    },

    /**
     * @description 销毁组件
     */
    destroy: function () {
      this.unbind();
      this.$container.remove();
    },

    /**
     * @description 解绑事件
     * @return {Object} this - 实例本身，方便链式调用
     */
    unbind: function () {
      this.$container.undelegate();
      return this;
    }
  });
  
  return Marquee;
});
/**
 * @description masonry组件，简易瀑布流，具体查看类{@link Masonry}
 * @module masonry
 * @author liweitao
 * @example
 * var Masonry = require('masonry');
 * var masonry = new Masonry({
 *   container: $('.nav'),
 *   itemSelector: '.nav_sub_item',
 *   column: 3,
 *   itemWidth: 200,
 *   horizontalMargin: 30,
 *   verticalMargin: 30,
 *   onAfterRender: function () {
 *     console.log('rendered');
 *   }
 * });
 */

define('masonry', function (require) {
  'use strict';
  
  var util = require('util');

  var Masonry = _.Class.extend(/** @lends Masonry.prototype */{
    /**
     * masonry.
     * @constructor
     * @alias Masonry
     * @param {Object} options
     * @param {String|HTMLElement|Zepto} options.container - 指定瀑布流的容器
     * @param {String} options.itemSelector - 瀑布流项选择器
     * @param {Number} options.itemWidth - 每一项的宽度
     * @param {Number} options.column - 列数
     * @param {Number} [options.horizontalMargin] - 项与项之间水平方向间距
     * @param {Number} [options.verticalMargin] -项与项之间垂直方向间距
     * @param {Function} [options.onAfterRender] - 瀑布流计算渲染完后的回调
     */
    construct: function (options) {
      $.extend(this, {
        container: null,
        itemSelector: '',
        itemWidth: 0,
        column: 1,
        horizontalMargin: 15,
        verticalMargin: 15,
        onAfterRender: function () {}
      }, options);
      
      this.$container = $(this.container);
      this.init();
    },

    /**
     * @description 初始化瀑布流
     */
    init: function () {
      var columns = new Array(this.column);
      this.$items = this.$container.find(this.itemSelector);
      this.column = Math.min(this.$items.length, this.column);
      
      for (var k = 0; k < this.column; k++) {
        columns[k] = this.$items[k].offsetTop + this.$items[k].offsetHeight;
      }
      
      for (var i = 0, len = this.$items.length; i < len; i++) {
        var $item = $(this.$items.get(i));
        if (this.itemWidth) {
          $item.width(this.itemWidth);
        }
        
        if (i >= this.column) {
          var minHeight = Math.min.apply(null, columns);
          var minHeightColumn = 0;
          if (Array.prototype.indexOf) {
            minHeightColumn = columns.indexOf(minHeight);
          } else {
            minHeightColumn = util.indexOf(columns, minHeight);
          }
          $item.css({
            left: minHeightColumn * (this.itemWidth + this.horizontalMargin) + 'px',
            top: minHeight + this.verticalMargin + 'px'
          });
          columns[minHeightColumn] += $item.get(0).offsetHeight + this.verticalMargin;
        } else {
          $item.css({
            top: 0,
            left: (i % this.column) * (this.itemWidth + this.horizontalMargin) + 'px'
          });
        }
      }
      this.$container.css({
        height: Math.max.apply(null, columns)
      });
      if ($.isFunction(this.onAfterRender)) {
        this.onAfterRender.call(this);
      }
    }
  });

  return Masonry;
});
/**
 * @description pager分页组件，具体查看类{@link Pager},<a href="./demo/components/pager/index.html">Demo预览</a>
 * @module pager
 * @author wangbaohui
 * @example
 * var Pager = seajs.require('pager');
 * var $mod_pager = $('.mod_pager');
 * var $goods = $('.goods');
 * var page = new Pager({
 *  el: $('.items',$mod_pager),
 *  count: $goods.children().length,
 *  pagesize: 5,
 *  onPage: function(o){
 *      $goods.children().hide();
 *      var start = (this.currentPage - 1) * this.pagesize;
 *      var end = this.currentPage * this.pagesize - 1;
 *      $goods.children().slice(start,end + 1).css('display','block');
 *  }
 * });
 */

define('pager', function(require) {
  'use strict';

  var Pager = _.Class.extend( /** @lends Pager.prototype */ {

    /**
     * pager.
     * @constructor
     * @alias Pager
     * @param {Object} options
     * @param {String} options.el - 分页容器 (必填)
     * @param {Number} options.count - 记录数 (必填)
     * @param {Number} [options.pagesize=10] - 分页大小 
     * @param {Number} [options.displayedPages=5] - 显示几个按钮
     * @param {String} [options.btnTpl=<li class="item" data-role="{num}"><a class="num" href="javascript:;">{num}</a></li>'] - 分页按钮模板
     * @param {String} [options.btnPrevTpl=<li class="item prev" data-role="prev"><a class="num" href="javascript:;" ><span class="mod_icon mod_icon_prev"></span><span>上一页</span></a></li>] - 分页上一页按钮模板
     * @param {String} [options.btnNextTpl=<li class="item next" data-role="next"><a class="num" href="javascript:;"><span>下一页</span><span class="mod_icon mod_icon_next"></span></a></li>] - 分页下一页按钮模板
     * @param {String} [options.dotTpl=<li class="item dot" data-role="dot">...</li>] - 点点点模板
     * @param {String} [options.role=role] - 与按钮模板data-role属性配合使用
     * @param {String} [options.delegateObj=.item] - 事件委托类名
     * @param {String} [options.activeClass=active] - 选中状态类名
     * @param {Function} [options.onPage=null] - 点击分页按钮后回调函数
     * @prop {number}  currentPage - 当前页
     * @prop {number}  pages - 总页数
     * @prop {number}  pagesize - 分页大小
     */
    construct: function(options) {
      var def = {
        el: null,
        pagesize: 10, //分页大小
        pages: 0, //总页数
        count: 1, //记录数
        displayedPages: 5, //显示几个按钮
        currentPage: 1,
        btnTpl: ' <li class="item" data-role="{num}"><a class="num" href="javascript:;">{num}</a></li>',
        btnPrevTpl: '<li class="item prev" data-role="prev"><a class="num" href="javascript:;" ><span class="mod_icon mod_icon_prev"></span><span>上一页</span></a></li>',
        btnNextTpl: '<li class="item next" data-role="next"><a class="num" href="javascript:;"><span>下一页</span><span class="mod_icon mod_icon_next"></span></a></li>',
        dotTpl: '<li class="item dot" data-role="dot">...</li>',
        onPage: null,
        halfDisplayed: 0,
        delegateObj: '.item',
        activeClass: 'active',
        role: 'role'

      }
      $.extend(this, def, options || {});
      this.init();
    },

    /**
     * @description 初始化分页
     */
    init: function() {
      this.pages = Math.ceil(this.count / this.pagesize);
      this.halfDisplayed = this.displayedPages / 2;
      this.drawUI();
      this.initEvent();
    },

    /**
     * @description 初始化事件
     */
    initEvent: function() {
      var self = this;
      self.el.delegate(self.delegateObj, 'click', function() {
        var role = $(this).data(self.role);
        var currentPage = self.currentPage;
        if (role === currentPage) return;
        switch (role) {
          case 'prev':
            self.prevPage();
            break;
          case 'next':
            self.nextPage();
            break;
          case 'dot':
            return;
            break;
          default:
            currentPage = role;
            self.goToPage(currentPage);
            break;
        }

      });
    },

    /**
     * @description 初始化界面
     */
    drawUI: function() {
      var self = this;
      var html = [];
      var showDot = self.pages > self.displayedPages;
      var interval = this._getInterval(this);
      var showPrev = false;
      var showNext = true;

      if (interval.end === 0) return;

      if (self.currentPage == this.pages) {
        showNext = false;
      }
      for (var i = interval.start; i <= interval.end; i++) {
        html.push(self.btnTpl.replace(/{num}/g, i));
      }

      //不是最后一页
      if (showDot && interval.end !== self.pages) {
        html.push(self.dotTpl);
        html.push(self.btnTpl.replace(/{num}/g, self.pages));
      }

      //显示下一页按钮
      if (showNext) {
        html.push(self.btnNextTpl);
      }

      //显示上一页按钮
      if (self.currentPage > 1) {
        html.unshift(self.btnPrevTpl);
      }

      //渲染
      self.el.html(html.join('')).find('[data-' + self.role + '="' + self.currentPage + '"]').addClass(self.activeClass).siblings().removeClass(self.activeClass);

      self.onPage && self.onPage.call(self);
    },

    /**
     * @description 获取分页间隔
     * @private 
     * @param {Object} o - this
     * @return {Object} {start,end} - 返回开始与结束间隔
     */
    _getInterval: function(o) {
      return {
        start: Math.ceil(o.currentPage > o.halfDisplayed ? Math.max(Math.min(o.currentPage - o.halfDisplayed, (o.pages - o.displayedPages)), 1) : 1),
        end: Math.ceil(o.currentPage > o.halfDisplayed ? Math.min(o.currentPage + o.halfDisplayed - 1, o.pages) : Math.min(o.displayedPages, o.pages))
      };
    },

    /**
     * @description 跳转页面
     * @param {Number} page - 当前页
     */
    goToPage: function(page) {
      var cur = page;
      if (cur > this.pages) cur = this.pages;
      if (cur < 1) cur = 1;
      this.currentPage = cur;
      this.drawUI();
    },

    /**
     * @description 下一页
     */
    nextPage: function() {
      var currentPage = this.currentPage;
      currentPage += 1;
      this.goToPage(currentPage);

    },

    /**
     * @description 上一页
     */
    prevPage: function() {
      var currentPage = this.currentPage;
      currentPage -= 1;
      this.goToPage(currentPage);
    }
  });

  return Pager;
});
/**
 * @description parallaxmouse组件，视觉差鼠标可交互，具体查看类{@link Parallaxmouse}，<a href="./demo/components/parallaxmouse/index.html">Demo预览</a>
 * @module parallaxmouse
 * @author wangcainuan
 * @example
 * var Parallaxmouse = seajs.require('parallaxmouse');
 * var parallaxmouse1 = new Parallaxmouse({
 *    container: '.parallmaxmouse',
 *    elementSelector: '.parallmaxmouse_section1',
 *    magnification: 0.06
 * });
 */


define('parallaxmouse', function () {
  'use strict';

  var Parallaxmouse = _.Class.extend(/** @lends Parallaxmouse.prototype */{
    /**
     * parallaxmouse.
     * @constructor
     * @alias Parallaxmouse
     * @param {Object} options
     * @param {String} options.container - 指定视觉差的容器选择器
     * @param {String} options.elementSelector - 视觉差项选择器
     * @param {String} [options.magnification=0.1] - 视觉差比例
     */
    construct: function (options) {
      $.extend(this, {
        container: null,
        elementSelector: null,
        magnification: 0.1
      }, options);

      this.$container = $(this.container);
      this.$elementSelector = $(this.elementSelector);
      this.init();
    },

    /**
     * @description 一些初始化操作
     */
    init: function () {
      this.initElements();
      this.initEvent();
    },

    /**
     * @description 获取元素，同时初始化元素的样式
     */
    initElements: function () {

      this.center = {
        x: Math.floor( this.$container.width() / 2 ),
        y: Math.floor( this.$container.height() / 2 )
      }
      this.elemPosition = {
        left: parseInt(this.$elementSelector.css("left"),10),
        top: parseInt(this.$elementSelector.css("top"),10)
      }

      return this;
    },
    
    /**
     * @description 初始化事件绑定
     */
    initEvent: function () {

      $(window).delegate(this.container,'mousemove', $.proxy(this.mousemove, this));

      return this;
    },

    /**
     * @description mousemove
     */
    mousemove: function (event) {

      var pos = {
        x: event.pageX,
        y: event.pageY
      }
      console.log(pos)
      var top  = this.elemPosition.top + Math.floor((this.center.y - pos.y) * this.magnification);
      var left = this.elemPosition.left + Math.floor((this.center.x - pos.x) * this.magnification);
      
      this.render({top:top, left:left});

      return this;
    },

    /**
     * @description render
     */
    render: function (pos) {

      this.$elementSelector.css({
        top: pos.top,
        left: pos.left
      });
      
      return this;
    },

    /**
     * @description 销毁组件
     */
    destroy: function () {
      this.unbind();
      this.$container.remove();
    },

    /**
     * @description 解绑事件
     * @return {Object} this - 实例本身，方便链式调用
     */
    unbind: function () {
      $(window).undelegate(this.container,'mousemove');
      return this;
    }

  });
  
  return Parallaxmouse;
});
/**
 * @description select组件，具体查看类{@link Select},<a href="./demo/components/select/index.html">Demo预览</a>
 * @module select
 * @author YL
 * @example
 * var Select = seajs.require('select');
 * new Select({
       $container: $("#select")
 * });
 *
 */

 define("select", function(){
    "use strict";

    var Select = _.Class.extend(/** @lends Select.prototype */{
        /**
         * @constructor
         * @alias Select
         * @param {Object} opts - 组件配置
         * @param {Object} $container - 必选，jQuery对象
         */

         construct: function (options) {
          $.extend(this, {
            $container: null,
            
          }, options);

          this.init();

          this.$container.hide();
        },

        /**
         * @description 一些初始化操作
         */
        init: function () {
            this.createSelect();
            this.initEvent();
            this.keyboard();
        },

        /**
         * @description 创建下拉框
         */
        createSelect: function () {
            var select = this.$container;
            if(this.checkCreate()){
                select.after($("<div></div>")
                    .addClass("o2-select")
                    .addClass(select.attr("class") || "")
                    .addClass(select.attr("disabled") ? "disabled" : "")
                    .html('<span class="current"></span><ul class="list"></ul>')
                );

                var dropdown = select.next();
                var options = select.find("option");
                var selected = select.find("option:selected");

                dropdown.find(".current").html(selected.text());

                options.each(function(){
                    var $option = $(this);
                    dropdown.find("ul").append($("<li></li>")
                        .attr("data-value", $option.val())
                        .addClass("option" +
                            ($option.is(":selected") ? " selected" : "") +
                            ($option.is(":disabled") ? " disabled" : ""))
                        .html($option.text())
                    );
                });
            }
        },

        /**
         * @description 检查是否重复创建
         */
        checkCreate: function () {
            return !this.$container.next().hasClass("o2-select");
        },

        /**
         * @description 事件初始化
         */
        initEvent: function () {
            var _this = this;
            var o2Select = this.$container.next(".o2-select");
            this.$container.bind("o2Select:setValue", $.proxy(this.selectEvent, this));
            o2Select.bind("click.o2_select", this.openOrClose);
            $(document).bind("click.o2_select", this.close);
            o2Select.find(".option:not(.disabled)").bind("click.o2_select", this.selectOption);
            $(document).unbind("keydown");
            // $(document).bind("keydown.o2_select", $.proxy(_this.keyboard, _this));
        },

        /**
         * @description 自定义事件
         */
        selectEvent: function () {
            var value = this.$container.val();
            var dropdown = this.$container.next();
            var options = dropdown.find("li");
            options.each(function(){
                if($(this).data("value") == value){
                    dropdown.find('.selected').removeClass('selected');
                    $(this).addClass('selected');
                    var text = $(this).text();
                    dropdown.find('.current').text(text);
                }
            });
            return false;
        },

        /**
         * @description open/close 下拉框
         */
        openOrClose: function (event) {
            var dropdown = $(this);
            if(!dropdown.hasClass("o2-select")){
                dropdown = dropdown.parent();
            }
            $('.o2-select').not(dropdown).removeClass('open');
            dropdown.toggleClass('open');
              
            if (dropdown.hasClass('open')) {
                dropdown.find('.focus').removeClass('focus');
                dropdown.find('.selected').addClass('focus');
            } else {
                dropdown.focus();
            }
            return false;
        },

        /**
         * @description 点击外面的时候，close下拉框 
         */
        close: function (event) {
            event.stopPropagation();
            if($(event.target).closest(".o2-select").length == 0){
                $(".o2-select").removeClass("open");
            }
            return false;
        },

        /**
         * @description 下拉选项点击
         */
        selectOption: function (event) {
            event.stopPropagation();
            var option = $(event.target);
            if(option.get(0).tagName == "LI"){
                var dropdown = option.closest(".o2-select").removeClass("open");
                dropdown.find(".selected").removeClass("selected");
                option.addClass("selected");
                var text = option.text();
                dropdown.find(".current").text(text);
                dropdown.prev("select").val(option.data("value")).trigger("change");
            }
            return false;
        },

        /**
         * @description 设置选中
         * @param {Object} option
         * @param {String} value 需要选中的option的value，二选一
         * @param {String} text 需要选中的option的text，二选一
         * @param {Object} cb 设置选中后的回调，可选
         */
        setSelect: function (option) {
            var str = option.val || option.text;
            if(str){
                var dropdown = this.$container.next(".o2-select");
                var options = dropdown.find(".option");
                dropdown.find(".selected").removeClass("selected");
                if(option.val){
                    options.each(function(){
                        if($(this).data("value") == str){
                            select($(this), dropdown);
                        }
                    });
                }else{
                    options.each(function(){
                        if($(this).text() == str){
                            select($(this), dropdown);
                        }
                    });
                }
                if(option.cb){
                    option.cb();
                }
            }
            function select(_this, dropdown){
                _this.addClass("selected");
                var text = _this.text();
                dropdown.find(".current").text(text);
                dropdown.prev("select").val(_this.data("value")).trigger("change");
            }
        },

        /**
         * @description update 更新当前下拉框
         * @param {Object} $container jquery对象，必选 
         */
         update: function () {
            var dropdown = this.$container.next(".o2-select");
            var open = dropdown.hasClass("open");
            if(dropdown.length){
                dropdown.remove();
                this.init();
                if (open) {
                    this.$container.next().trigger('click');
                }
            }
         },

         /**
          * @description destroy 销毁当前下拉框
          */
        destroy: function () {
            var dropdown = this.$container.next(".o2-select");
            if(dropdown.length){
                dropdown.remove();
            }
        },

        /**
         * @description 键盘事件
         */
        keyboard: function (event) {
            var _this = this
            $(document).bind("keydown", function (event) {
                var dropdown = $(".o2-select.open");
                var focused_option = $(dropdown.find(".focus") || dropdown.find(".list .option.selected"));
                switch (event.keyCode) {
                    case 32:
                    case 13:
                        _this.spaceEnterKey(dropdown, focused_option); break;
                    case 40:
                        _this.downKey(dropdown, focused_option); break;
                    case 38:
                        _this.upKey(dropdown, focused_option); break;
                    case 27:
                        _this.escKey(dropdown); break;
                    case 9:
                        _this.tabKey(dropdown); break;
                }
            })
            
            
        },

        /**
         * @description space enter key
         */
        spaceEnterKey: function (dropdown, focused_option) {
            if(dropdown.hasClass("open")){
                focused_option.trigger("click");
            }else{
                dropdown.trigger("click");
            }
            return false;
        },

        /**
         * @description down key
         */
        downKey: function (dropdown, focused_option) {
            if(!dropdown.hasClass("open")){
                dropdown.trigger("click");
            }else{
                if(focused_option.next().length > 0){
                    dropdown.find(".focus").removeClass("focus");
                    focused_option.next().addClass("focus");
                }
            }
            return false;
        },

        /**
         * @description up key
         */
        upKey: function (dropdown, focused_option) {
            if (!dropdown.hasClass('open')) {
                dropdown.trigger('click');
            } else {
                if (focused_option.prev().length > 0) {
                    dropdown.find('.focus').removeClass('focus');
                    focused_option.prev().addClass('focus');
                }
            }
            return false;
        },

        /**
         * @description esc key
         */
         escKey: function (dropdown) {
            if (dropdown.hasClass('open')) {
                dropdown.trigger('click');
            }
         },

        /**
         * @description tab key
         */
        tabKey: function (dropdown) {
            if (dropdown.hasClass('open')) {
                return false;
            }
        }
    });
    return Select;
 });
/**
 * @description 导航菜单浮层组件，具体查看类{@link SidePopMenu},<a href="./demo/components/sidePopMenu/index.html">Demo预览</a>
 * @module SidePopMenu
 * @author mihan
 * 
 * @example
<div class="mod_side" id="sideBox">
    <div class="JS_navCtn mod_side_nav">
        <div class="mod_side_nav_item">...</div>
        ...
    </div>
    <div class="JS_popCtn mod_side_pop">
        <div class="mod_side_pop_item">...</div>
        ...
    </div>
</div>

@example
var SidePopMenu = seajs.require('SidePopMenu');
var popMenu = new SidePopMenu({
    $container: $('#sideBox'), 
    navItemHook: '.mod_side_nav_item',
    popItemHook: '.mod_side_pop_item'
    navItemOn: 'mod_side_nav_item_on'
});
 */

define('SidePopMenu', function () {
    'use strict';

    var SidePopMenu = _.Class.extend(/** @lends sidePopMenu.prototype */{
    
        /**
         * @constructor
         * @alias SidePopMenu
         * @param {Object} opts - 组件配置
         * @param {Object} opts.$container - 必选，组件容器JQ对象，请使用ID选择器确保唯一
         * @param {String} opts.navItemHook - 必选，侧导航列表选择器
         * @param {String} opts.navItemHook - 必选，浮层菜单列表选选择器
         * @param {String} [opts.navCtnHook = '.JS_navCtn'] - 侧导航容器选择器
         * @param {String} [opts.popCtnHook = '.JS_popCtn'] - 浮屠菜单容器选择器
         * @param {String} [opts.navItemOn = ''] - 侧导航造中样式 className
         * @param {Number} [opts.moveDeg = 60] - 侧导航向浮屠菜单方向移动时不切换 Tab 的最大水平夹度
         * @param {Boolean} [opts.isAuto = false] - 菜单浮层是否自适应定位
         * @param {String} [opts.menuDirection = 'right'] - opts.moveDeg 的有效水平方向，默认导航右侧『right』，左侧为『left』
         * @param {Function} [opts.itemEnterCallBack = null] - 侧导航列表项『mouseenter』回调函数
         */
        construct: function(opts){
            this.config = {
                $container: null,
                navItemHook: '',
                popItemHook: '',
                navCtnHook: '.JS_navCtn',
                popCtnHook: '.JS_popCtn',
                navItemOn: '',
                moveDeg: 70,
                isAuto: false,
                menuDirection: 'right',
                itemEnterCallBack: null,
            }
            
            if(opts){
                $.extend(this.config,opts);
            }
                
            this.checkRun();
        },

        /**
         * @description 检查组件是否够条件执行
         * @private
         */
        checkRun: function(){
            var config = this.config;
            if( 
                config.$container == null ||
                $(config.navCtnHook).length == 0 ||
                $(config.popCtnHook).length == 0 ||
                config.navItemHook == ''   ||
                config.popItemHook == '' 
            ){
                return; 
            }else{
                this.init();
            }
            
        },
        
        /**
         * @description 组件初始化
         */
        init: function(){
            var conf = this.config;
            this.$navCtn = conf.$container.find(conf.navCtnHook); 
            this.$popCtn = conf.$container.find(conf.popCtnHook); 
            this.$navItemList = this.$navCtn.find(conf.navItemHook); 
            this.$popItemList = this.$popCtn.find(conf.popItemHook);
            this.potCollect = []; // 鼠标在导航Tab移动的时候轨迹坐标信息
            this.moveTimer = null; // 鼠标在导航Tab移动的时候暂停切换定时器
            this.enterTimer = null; // 鼠标进入导航Tab时候状态延迟切换定时器
            this.isBind = false; // 导航Tab暂时切换时是否绑定Tab『mouseenter』
            this.$window = $(window);
            this.callback = null;
            this.initEvents(); 
        },

        /**
         * @description 获收浮层菜单信息
         * @private
         */
        getNavItemInfo: function(){
            var conf = this.config;
            var info = [];

            conf.$container.find(conf.navItemHook).each(function(){
                info.push({
                    thisHeight: $(this).outerHeight(true).toFixed(0),
                    thisWidth: $(this).outerWidth().toFixed(0),
                    thisPstX: $(this).position().left,
                    thisPstY: $(this).position().top,
                    thisPageY: $(this).offset().top
                })
            });

            return info;
        },

        /**
         * @description 事件绑定初始化
         * @private
         */
        initEvents: function(){
            var _this = this;
            var conf = _this.config;

            
            conf.$container.bind('mouseleave',$.proxy(_this.ctnLeave,_this));

            _this.$navCtn.delegate(
                conf.navItemHook,
                {
                    'mouseenter.itemEnter': _this.navItemEnter,
                    'mousemove.itemMove': _this.navItemMove,
                    'mouseleave.itemLeave': _this.navItemLeave
                },
                {
                    thisObj: _this,
                    callback: conf.itemEnterCallBack
                }
            );
            _this.isBind = true;
            
        },

        /**
         * @description 组件容器『mouseleave』事件
         * @private
         */
        ctnLeave: function(){
            var _this = this;
            var conf = _this.config;
            _this.$navItemList.removeClass(conf.navItemOn);
            _this.$popCtn.hide();
            _this.$popItemList.hide();
            _this.moveTimer = null;
            _this.enterTimer = null;
        },

        /**
         * @description 导航列表『mouseenter』事件重新绑定
         * @private
         */
        reBindNavItemEnter: function(){
            var _this = this;
            var conf = _this.config;
            _this.$navCtn
            .delegate(
                conf.navItemHook,
                'mouseenter.itemEnter',
                {
                    thisObj: _this,
                    callback: conf.itemEnterCallBack
                },
                _this.navItemEnter
            );
            _this.isBind = true;
        },

        /**
         * @description 导航列表『mouseenter』事件解绑
         * @private
         */
        unbindNavItemEnter: function(){
            var _this = this;
            var conf = _this.config;
            _this.$navCtn.undelegate('.itemEnter');
            _this.isBind = false;
        },

        /**
         * @description 导航列表『mouseenter』事件
         * @private
         * @param {Object} event - evnet对象
         * @param {Object} event.data - jQuery delegate 方法 eventData 对象参数
         * @param {Object} event.data.thisObj - 传递本类对象
         * @param {Object} event.data.callback - navItemEnter 回调函数
         */
        navItemEnter: function(event){
            var _this = event.data.thisObj;
            var $this = $(this);
            var conf = _this.config;
            var thisCallback = event.data.callback;
            var thisIndex = $(this).index(conf.$container.selector + ' ' + conf.navItemHook);
            var time = null;
            var thisInfo = [];

            $this.addClass(conf.navItemOn).siblings(conf.$container.selector + ' ' + conf.navItemHook).removeClass(conf.navItemOn);
            _this.$popCtn.show();
            _this.$popItemList.eq(thisIndex).show().siblings(conf.$container.selector + ' ' + conf.popItemHook).hide();

            // 是否使用自适应定位
            if(conf.isAuto){
                _this.popAutoShow(thisIndex,$this);
            }

            //如果传入回调函数，侧执行
            if(typeof thisCallback === 'function'){
                thisCallback();
            }

        },

        popAutoShow: function(thisIndex,$this){
            var _this = this;
            var $this = $this;
            var conf = _this.config;
            var thisIndex = $this.index(conf.$container.selector + ' ' + conf.navItemHook);
            var thisInfo = [];
            var popView = 0;

            thisInfo = _this.getNavItemInfo();
            switch(conf.menuDirection){
                case 'right':
                    _this.$popCtn.css({
                        'position': 'absolute',
                        'left': thisInfo[thisIndex].thisWidth + 'px',
                        'top': thisInfo[thisIndex].thisPstY - thisInfo[thisIndex].thisHeight + 'px',
                        'right': 'auto',
                        'bottom': 'auto'
                    });
                    
                    popView =  _this.$window.height().toFixed(0) - (thisInfo[thisIndex].thisPageY  - _this.$window.scrollTop());

                    if(thisInfo[thisIndex].thisPstY < thisInfo[thisIndex].thisHeight){
                        _this.$popCtn.css('top','0px');
                    }else if( popView < _this.$popCtn.height().toFixed(0) ){
                         _this.$popCtn.css({
                             'top': ( thisInfo[thisIndex].thisPstY - (_this.$popCtn.height().toFixed(0) - popView) ) + 'px'
                         });
                    }

                    break;
                case 'left':
                    _this.$popCtn.css({
                        'position': 'absolute',
                        'left': 'auto',
                        'top': thisInfo[thisIndex].thisPstY - thisInfo[thisIndex].thisHeight + 'px',
                        'right': thisInfo[thisIndex].thisWidth + 'px',
                        'bottom': 'auto'
                    });

                    popView =  _this.$window.height().toFixed(0) - (thisInfo[thisIndex].thisPageY  - _this.$window.scrollTop());

                    if(thisInfo[thisIndex].thisPstY < thisInfo[thisIndex].thisHeight){
                        _this.$popCtn.css('top','0px');
                    }else if( popView < _this.$popCtn.height().toFixed(0) ){
                         _this.$popCtn.css({
                             'top': ( thisInfo[thisIndex].thisPstY - (_this.$popCtn.height().toFixed(0) - popView) ) + 'px'
                         });
                    }

                    break;
            }
        },


        /**
         * @description 侧导航列表『mousemove』事件
         * @param {Object} event - evnet对象
         * @param {Object} event.data - jQuery delegate 方法 eventData 对象参数
         * @param {Object} event.data.thisObj - 传递本类对象
         * @returns {Boolean} false - 防止冒泡
         */
        navItemMove: function(event){
            var _this = event.data.thisObj;
            var $this = $(this);
            var conf = _this.config;
            var e = event;
            var deg = conf.moveDeg * (2 * Math.PI / 360); //弧度转换
            var tanSet = Math.tan(deg).toFixed(2); //配置角度的 tan 值
            var tanMove = 0; // 移动过程的 tan 值
            var moveX = 0; // 单位时间内鼠标移动的水平距离
            var moveY = 0; // 单位时间内鼠标移动的垂直距离
            var start = null; // 单位时间内鼠标坐标起点
            var end = null; // 单位时间内鼠标坐标终点

            // 鼠标在暂停区域内移动暂停切换
            function stopSwitch(){
                clearTimeout(_this.moveTimer);
                if(_this.isBind){
                    _this.unbindNavItemEnter();
                }
                
                _this.moveTimer = setTimeout(function(){
                    _this.reBindNavItemEnter(); 
                },100);
            }

            // 鼠标在非暂停区域内重新激活导航Tab切换
            function startSwitch(){
                clearTimeout(_this.moveTimer);

                if(_this.isBind){
                    return
                }else{
                    _this.reBindNavItemEnter(); 
                }
            }

            // 出力 push 存入鼠标坐标点
            _this.potCollect.push({
                x: e.pageX,
                y: e.pageY
            });
            
            //存4个坐标点的时间作为单位时间，醉了。。。
            if(_this.potCollect.length > 4){
                _this.potCollect.shift();
                start =  _this.potCollect[0];
                end = _this.potCollect[_this.potCollect.length - 1];
                moveX = end.x - start.x;
                moveY = end.y - start.y;
                tanMove = Math.abs( (moveY / moveX).toFixed(2) );

                switch(conf.menuDirection){
                    case 'right':
                        if(tanMove <= tanSet && moveX > 0){
                            stopSwitch();
                        }else{
                            startSwitch();               
                        }
                        break;
                        
                    case 'left':
                        if(tanMove <= tanSet && moveX < 0){
                            stopSwitch();
                        }else{
                            startSwitch();                
                        }
                        break; 
                }

            }

            // 防止在暂停区域移动过程中鼠标没移到浮层菜单而移到另一个Tab而没有切换
            clearTimeout(_this.enterTimer);
            _this.enterTimer = setTimeout(function(){
                $this.trigger('mouseenter',
                    {
                        thisObj: _this,
                        callback: conf.itemEnterCallBack
                    }
                );
            },300);
            return false;
        },

        navItemLeave: function(event){
            var _this = event.data.thisObj;
            var $this = $(this);
            var conf = _this.config;
            
            //暂停区域移动过程中鼠标移到浮层菜单后取消Tab切换
            clearTimeout(_this.enterTimer);
        },


    });

    return SidePopMenu;
    
});
/**
 * @description tab组件，具体查看类{@link Tab}，<a href="./demo/components/tab/index.html">Demo预览</a>
 * @module tab
 * @author liweitao
 * @example
 * var Tab = require('tab');
 * var tab = new Tab({
 *   container: $('.info_tab'),
 *   head: $('.info_tab_head'),
 *   content: $('.info_tab_content'),
 *   startAt: 0,
 *   hash: false,
 *   activeClass: 'active',
 *   hoverToSwitch: true,
 *   onBeforeSwitch: function () {},
 *   onAfterSwitch: function (index) {
 *     var $infoTabActive = $html.find('.info_tab_active');
 *     $infoTabActive.animate({'left': 80 * index + 'px'}, 200);
 *   },
 *   onFirstShow: function () {}
 * });
 */

define('tab', function () {
  'use strict';

  var Tab = _.Class.extend(/** @lends Tab.prototype */{
    /**
     * tab.
     * @constructor
     * @alias Tab
     * @param {Object} options
     * @param {String|HTMLElement|Zepto} options.container - 指定tab容器
     * @param {String|HTMLElement|Zepto} [options.head] - tab的头部
     * @param {String|HTMLElement|Zepto} [options.content] - tab的内容
     * @param {Number|String} [options.startAt] - 起始Tab页
     * @param {String} [options.activeClass] - 标注当前所处class
     * @param {Boolean} [options.hash] - 是否启用hash标记tab
     * @param {Boolean} [options.hoverToSwitch] - 是否鼠标移上去切换tab
     * @param {Function} [options.onBeforeSwitch] - Tab切换前触发的操作
     * @param {Function} [options.onAfterSwitch] - Tab切换后触发的操作
     * @param {Function} [options.onFirstShow] - Tab首次show出来的时候触发的操作
     */
    construct: function (options) {
      this.conf = $.extend({
        container: null,
        head: null,
        content: null,
        startAt: 0,
        activeClass: 'active',
        hash: false,
        hoverToSwitch: false,
        onBeforeSwitch: function () {},
        onAfterSwitch: function () {},
        onFirstShow: function () {}
      }, options);

      this.index = undefined;
      var conf = this.conf;
      this.$el = $(conf.container);
      this.$head = conf.head ? $(conf.head) : this.$el.children('.mod_tab_head, .j_tab_head');
      this.$headItems = this.$head.children('.mod_tab_head_item, .j_tab_head_item');
      this.$content = conf.content ? $(conf.content) : this.$el.children('.mod_tab_content, .j_tab_content');
      this.$contentItems = this.$content.children('.mod_tab_content_item, .j_tab_content_item');

      this.tabLength = this.$headItems.length;

      for (var i = 0, l = this.$headItems.length; i < l; i++) {
        this.$headItems[i].hasShown = false;
      }

      this.init();
    },

    /**
     * @description 一些初始化操作
     */
    init: function () {
      var conf = this.conf;
      var index = -1;
      var hash = window.location.hash;
      // 优先通过hash来定位Tab
      if (conf.hash && hash.length > 1) {
        this.switchTo(hash);
      } else {
        // 如果为string则认为是个选择器
        if (typeof conf.startAt === 'string') {
          this.$active = this.$headItems.filter(conf.startAt);
          if (this.$active.length) {
            index = this.$active.index();
          } else {
            index = 0;
          }
        } else if (typeof conf.startAt === 'number') {
          index = conf.startAt;
        } else {
          index = 0;
        }
        this.switchTo(index);
      }
      this.initEvent();

    },

    /**
     * @description 初始化事件绑定
     */
    initEvent: function () {
      var _this = this;
      var conf = _this.conf;
      var eventType = 'click';
      if (conf.hoverToSwitch) {
        eventType = 'mouseenter';
      }
      this.$head.delegate('.mod_tab_head_item, .j_tab_head_item', eventType, function () {
        var index = $(this).index();
        _this.switchTo(index);
        return false;
      });
    },

    /**
     * @description 切换tab
     * @param {Number|String} index - 可为tab的索引或是hash
     * @return {Object} this - 实例本身，方便链式调用
     */
    switchTo: function (index) {
      var conf = this.conf;
      if (conf.hash) {
        var hash;
        if (typeof index === 'string') {
          hash = index.replace('#', '');
          this.$active = this.$headItems.filter('[data-hash$=' + hash + ']');
          index = this.$active.index();
        }
        if (typeof index === 'number'){
          hash = this.$headItems.eq(index).attr('data-hash');
        }

        if (index === -1) {
          return -1;
        }
        window.location.hash = hash;
      }
      index = parseInt(index, 10);
      if (index === this.index) {
        return;
      }

      this.index = index;

      if (typeof conf.onBeforeSwitch === 'function') {
        conf.onBeforeSwitch.call(this, index, this);
      }
      this.$headItems.removeClass(conf.activeClass).eq(index).addClass(conf.activeClass);
      this.$contentItems.hide().eq(index).show();

      if (typeof conf.onAfterSwitch === 'function') {
        conf.onAfterSwitch.call(this, index, this);
      }

      if (! this.$headItems[index].hasShown && typeof conf.onFirstShow === 'function') {
        conf.onFirstShow.call(this, index, this);
        this.$headItems[index].hasShown = true;
      }
      return this;
    },

    /**
     * @description 切换到下一tab
     * @return {Object} this - 实例本身，方便链式调用
     */
    switchToNext: function () {
      var index = this.index + 1;
      if (index >= this.tabLength) {
        index = 0;
      }
      this.switchTo(index);
      return this;
    },

    /**
     * @description 切换到上一tab
     * @return {Object} this - 实例本身，方便链式调用
     */
    switchToPrev: function () {
      var index = this.index + 1;
      if (index <= 0) {
        index = 0;
      }
      this.switchTo(index);
      return this;
    },

    /**
     * @description 销毁组件
     */
    destroy: function () {
      this.unbind();
      this.$el.remove();
    },

    /**
     * @description 解绑事件
     * @return {Object} this - 实例本身，方便链式调用
     */
    unbind: function () {
      this.$head.undelegate();
      return this;
    },

    /**
     * @description 设置参数
     * @return {Object} this - 实例本身，方便链式调用
     */
    setOptions: function (options) {
      $.extend(this.conf, options);
      return this;
    }
  });
  
  return Tab;
});
/**
 * @description tip组件，具体查看类{@link Tip},<a href="./demo/components/tip/index.html">Demo预览</a>
 * @module tip
 * @author YL
 * @example
 * var Tip = seajs.require('tip');
 * var tip = new Tip({
 *     auto: true, //识别有 "o2-tip"属性的元素，hover显示tip
 *     placement: "right",
 *     borderColor: "#000",
 *     bg: "#000",
 *     color: "#fff",
 *     fontSize: "12px",
 * });
 */
 define("tip", function(){
    'use strict';

    var Tip = _.Class.extend(/** @lends Tip.prototype */{
    /**
     * @constructor
     * @alias Tip
     * @param {Object} opts - 组件配置
     * @param {Boolean} [opts.auto = true] - 可选，是否开启hover的
     * @param {String}  [opts.placement = "right"] - 可选，tip的方位
     * @param {String}  [opts.borderColor = "#000"] - 可选，tip边框颜色
     * @param {String}  [opts.bg = "#000"] - 可选，tip背景色
     * @param {String}  [opts.color = "#fff"] - 可选，tip文字颜色
     * @param {String}  [opts.fontSize = "12px"] - 可选，tip文字大小
     * @param {Boolean} [opts.angleBool = true] - 可选，是否显示三角形，默认显示
     */
        construct: function (options) {
          $.extend(this, {
            auto: false,
            placement: "right",
            borderColor: "#000",
            bg: "#000",
            color: "#fff",
            fontSize: "12px",
            angleBool: true
          }, options);

          this.tipOption = {
            template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"><span></span></div><div class="tooltip-inner"></div></div>',
            text: ""
          };

          this.tagList = []; //存放手动创建的tip标记

          this.init();
        },

        /**
         * @description 一些初始化操作
         */
        init: function () {
          this.initEvent();
        },

        /**
         * @description 页面tip元素初始化操作
        */
        initEvent: function () {
            var $tips = $("[o2-tip]")
            var _this = this;
            if(this.auto && $tips.length > 0){
                $("body").delegate("[o2-tip]", "mouseover", $.proxy(_this.enter, _this));
                $("body").delegate("[o2-tip]", "mouseout", $.proxy(_this.leave, _this));
            }
        },

        /**
         * @description mousehover
        */
        enter: function (event) {
            var $target = $(event.target);
            this.createTip({
                text: $target.attr("o2-tip"),
                $obj: $target,
                placement: $target.attr("o2-placement") || this.placement
            });
        },

        /**
         * @description mouseout
        */
        leave: function () {
            this.removeTip();
        },

        /**
         * @description 计算目标元素在文档中的位置
        */
        calculateTarget: function ($obj) {
            return {
                "left": $obj.offset().left,
                "right": $obj.width() + $obj.offset().left,
                "top": $obj.offset().top,
                "bottom": $obj.height() + $obj.offset().top
            }
        },

        /**
         * @description 创建一个tip
         * @param {Object} option
        */
        createTip: function (option) {
            var $tip = $(this.tipOption.template);
            $("body").append($tip);
            if(option.tag){//给手动创建的tip打上标签，方便指定清除
                $tip.attr("data-tag", option.tag);
                this.tagList.push(option.tag);
            }
            option.angleBool !== false ? option.angleBool = true : option.angleBool = false;
            //设置样式
            $tip.find(".tooltip-inner").text(option.text).css(this.tipStyle().tipInner);
            $tip.find(".tooltip-arrow").css(this.tipStyle().tipArrow);
            $tip.find(".tooltip-arrow span").css(this.tipStyle().tipArrow);
            $tip.css(this.tipStyle().tip);
            switch (option.placement) {
                case "top": 
                    $tip.find(".tooltip-arrow").css(this.tipStyle().tipArrowTop);
                    $tip.find(".tooltip-arrow span").css(this.tipStyle().tipArrowTopIn);
                    $tip.css({
                        "left": (option.$obj.width()- $tip.width())/2 + this.calculateTarget(option.$obj).left,
                        "top": this.calculateTarget(option.$obj).top - $tip.height() - 10
                    });
                    break;
                case "bottom": 
                    $tip.find(".tooltip-arrow").css(this.tipStyle().tipArrowBottom);
                    $tip.find(".tooltip-arrow span").css(this.tipStyle().tipArrowBottomIn);
                    $tip.css({
                        "left": (option.$obj.width()- $tip.width())/2 + this.calculateTarget(option.$obj).left,
                        "top": this.calculateTarget(option.$obj).top + option.$obj.height() + 10
                    });
                    break;
                case "right":
                    $tip.find(".tooltip-arrow").css(this.tipStyle().tipArrowRight);
                    $tip.find(".tooltip-arrow span").css(this.tipStyle().tipArrowRightIn);
                    $tip.css({
                        "left": option.$obj.width() + this.calculateTarget(option.$obj).left + 10,
                        "top": this.calculateTarget(option.$obj).top + (option.$obj.height() - $tip.height())/2
                    });
                    break;
                case "left": 
                    $tip.find(".tooltip-arrow").css(this.tipStyle().tipArrowLeft);
                    $tip.find(".tooltip-arrow span").css(this.tipStyle().tipArrowLeftIn);
                    $tip.css({
                        "left": this.calculateTarget(option.$obj).left - $tip.width() - 10,
                        "top": this.calculateTarget(option.$obj).top + (option.$obj.height() - $tip.height())/2
                    });
                    break;
            }
            //是否显示三角 手动创建的
            if(option.tag && !option.angleBool){
                $tip.find(".tooltip-arrow").hide();
            }
            //hover
            if(!this.angleBool && !option.tag){
                $tip.find(".tooltip-arrow").hide();
            }
        },

        /**
         * @description 销毁当前的tip
        */
        removeTip: function(){
            $("body").find(".tooltip").last().remove()
        },

        /**
         * @description 触发显示一个tip
         * @param {Object} option
         * @param {String} tag - tip标记，必选
         * @param {String} placement - tip方位，必选
         * @param {String} text - tip内容，必选
         * @param {Object} $obj - jQuery对象，必选
         * @param {Boolean} angleBool - 是否显示三角形，可选，默认显示
        */
        show: function (option) {
            if(this.checkTip(option.tag)){
                this.createTip(option);
            }
        },

        /**
         * @ description 检查是否存在已有标签的tip，防止重复创建
         * @param {String} tag - 需要检测的tip标记
        */
        checkTip: function (tag) {
            if(!tag){
                throw new Error("required a \"tag\" attribute");
                return false;
            }
            if(this.inArray(this.tagList, tag) != -1){
                throw new Error("Duplicate tip's \"tag\" attribute, tag attributes should be unique!");
                return false;
            }
            return true;
        },

        /**
         * @description 触发销毁一个tip
         * @param {String} tag - 需要销毁的tip标记
        */
        hide: function (tag) {
            var index = this.inArray(this.tagList, tag);
            if(tag && index != -1){
                this.tagList.splice(index, 1) //从tagList中删除标记
                $("body").find(".tooltip[data-tag=" + tag + "]").remove();
            }
        },

        /**
         * @description 提示框的样式
        */
        tipStyle: function () {
            return {
                tip: {
                    "position": "absolute",
                    "zIndex": 1070,
                    "display": "block",
                    "fontSize": "12px",
                    "fontStyle": "normal",
                    "fontWeight": "400",
                    "lineHeight": 1.42857143,
                    "textAlign": "left",
                    "textAlign": "start",
                    "textDecoration": "none",
                    "textShadow": "none",
                    "textTransform": "none",
                    "letterSpacing": "normal",
                    "wordBreak": "normal",
                    "wordSpacing": "normal",
                    "wordWrap": "normal",
                    "whiteSpace": "normal",
                    "filter": "alpha(opacity=1)",
                    "opacity": 1,
                    "lineBreak": "auto"
                },
                tipInner: {
                    "maxWidth": "200px",
                    "padding": "3px 8px",
                    "color": this.color,
                    "textAlign": "center",
                    "backgroundColor": this.bg,
                    "border": "1px solid " + this.borderColor,
                    "borderRadius": "4px"
                },
                tipArrow: {
                    "position": "absolute",
                    "width": 0,
                    "height": 0,
                    "borderStyle": "solid"
                },
                tipArrowRight: {
                    "borderWidth": "5px 5px 5px 0",
                    "borderColor": "transparent " + this.borderColor + " transparent transparent",
                    "_borderStyle": "dashed solid dashed dashed", //ie6
                    "top": "50%",
                    "margin-top": "-5px",
                    "left": "-5px"
                },
                tipArrowRightIn: {
                    "borderWidth": "5px 5px 5px 0",
                    "borderColor": "transparent " + this.bg + " transparent transparent",
                    "_borderStyle": "dashed solid dashed dashed", //ie6
                    "left": "1px",
                    "top": "-5px"
                },
                tipArrowLeft: {
                    "borderWidth": "5px 0 5px 5px",
                    "borderColor": "transparent transparent transparent " + this.borderColor,
                    "_borderStyle": "dashed dashed dashed solid", //ie6
                    "top": "50%",
                    "margin-top": "-5px",
                    "right": "-5px"
                },
                tipArrowLeftIn: {
                    "borderWidth": "5px 0 5px 5px",
                    "borderColor": "transparent transparent transparent " + this.bg,
                    "_borderStyle": "dashed dashed dashed solid", //ie6
                    "right": "1px",
                    "top": "-5px"
                },
                tipArrowTop: {
                    "borderWidth": "5px 5px 0",
                    "borderColor": this.borderColor + " transparent transparent",
                    "_borderStyle": "solid dashed dashed", //ie6
                    "left": "50%",
                    "margin-left": "-5px",
                    "bottom": "-5px"
                },
                tipArrowTopIn: {
                    "borderWidth": "5px 5px 0",
                    "borderColor": this.bg + " transparent transparent",
                    "_borderStyle": "solid dashed dashed", //ie6
                    "bottom": "1px",
                    "left": "-5px"
                },
                tipArrowBottom: {
                    "borderWidth": "0 5px 5px",
                    "borderColor": "transparent transparent " + this.borderColor,
                    "_borderStyle": "dashed dashed solid", //ie6
                    "left": "50%",
                    "margin-left": "-5px",
                    "top": "-5px"
                },
                tipArrowBottomIn: {
                    "borderWidth": "0 5px 5px",
                    "borderColor": "transparent transparent " + this.bg,
                    "_borderStyle": "dashed dashed solid", //ie6
                    "top": "1px",
                    "left": "-5px"
                }
            }
        },

        /**
         * @description indexOf实现
        */
        inArray: function (arr, tag) {
            var tagIndex = -1
            $.each(arr, function(index, item){
                if(item == tag) {
                    tagIndex = index;
                }
            })
            return tagIndex;
        }
    });

    return Tip;

 });
/**
 * @description util组件，辅助性
 * @module util
 * @author liweitao
 */

define('util', function() {
  'use strict';

  return {
    /**
     * 频率控制 返回函数连续调用时，func 执行频率限定为 次 / wait
     * 
     * @param {Function} func - 传入函数
     * @param {Number} wait - 表示时间窗口的间隔
     * @param {Object} options - 如果想忽略开始边界上的调用，传入{leading: false}
     *                           如果想忽略结尾边界上的调用，传入{trailing: false}
     * @return {Function} - 返回客户调用函数
     */
    throttle: function(func, wait, options) {
      var context, args, result;
      var timeout = null;
      // 上次执行时间点
      var previous = 0;
      if (!options) options = {};
      // 延迟执行函数
      var later = function() {
        // 若设定了开始边界不执行选项，上次执行时间始终为0
        previous = options.leading === false ? 0 : new Date().getTime();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      };
      return function() {
        var now = new Date().getTime();
        // 首次执行时，如果设定了开始边界不执行选项，将上次执行时间设定为当前时间。
        if (!previous && options.leading === false) previous = now;
        // 延迟执行时间间隔
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        // 延迟时间间隔remaining小于等于0，表示上次执行至此所间隔时间已经超过一个时间窗口
        // remaining大于时间窗口wait，表示客户端系统时间被调整过
        if (remaining <= 0 || remaining > wait) {
          clearTimeout(timeout);
          timeout = null;
          previous = now;
          result = func.apply(context, args);
          if (!timeout) context = args = null;
          //如果延迟执行不存在，且没有设定结尾边界不执行选项
        } else if (!timeout && options.trailing !== false) {
          timeout = setTimeout(later, remaining);
        }
        return result;
      };
    },

    /**
     * 空闲控制 返回函数连续调用时，空闲时间必须大于或等于 wait，func 才会执行
     *
     * @param {Function} func - 传入函数
     * @param {Number} wait - 表示时间窗口的间隔
     * @param {Boolean} immediate - 设置为ture时，调用触发于开始边界而不是结束边界
     * @return {Function} - 返回客户调用函数
     */
    debounce: function(func, wait, immediate) {
      var timeout, args, context, timestamp, result;

      var later = function() {
        // 据上一次触发时间间隔
        var last = new Date().getTime() - timestamp;

        // 上次被包装函数被调用时间间隔last小于设定时间间隔wait
        if (last < wait && last > 0) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
          if (!immediate) {
            result = func.apply(context, args);
            if (!timeout) context = args = null;
          }
        }
      };

      return function() {
        context = this;
        args = arguments;
        timestamp = new Date().getTime();
        var callNow = immediate && !timeout;
        // 如果延时不存在，重新设定延时
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
          result = func.apply(context, args);
          context = args = null;
        }

        return result;
      };
    },

    /**
     * 数组indexOf
     *
     * @param {Array} arr - 传入数组
     * @param {Number|String} el - 查找的元素
     * @return {Number} - 返回元素索引，没找到返回-1
     */
    indexOf: function(arr, el) {
      var len = arr.length;
      var fromIndex = Number(arguments[2]) || 0;
      if (fromIndex < 0) {
        fromIndex += len;
      }
      while (fromIndex < len) {
        if (fromIndex in arr && arr[fromIndex] === el) {
          return fromIndex;
        }
        fromIndex++;
      }
      return -1;
    },

    /**
     * @description 获取日期
     *
     * @param {Date} date - 日期
     * @param {Number} day - 天数 （0：今天 | -1：昨天 | 1：明天）
     * @return {String} - 日期字符串
     */
    getCalendar: function(date, day) {
      if(!date instanceof Date) return;
      var m = date.getMonth() + 1;
      var y = date.getFullYear();
      var d = date.getDate() + (day || 0);

      if (d === 0) {
        m = m - 1;
        if (m === 0) {
          m = 12;
          y = y - 1;
        }
      }

      switch (m) {
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12:
          d = d === 0 ? 31 : d;
          if (d > 31) {
            m = m + 1;
            d = 1;
          }
          break;
        case 4:
        case 6:
        case 9:
        case 11:
          d = d === 0 ? 30 : d;
          if (d > 30) {
            m = m + 1;
            d = 1;
          }
          break;
        case 2:

          if (y % 4 == 0) {
            d = d === 0 ? 29 : d;
            if (d > 29) {
              m = m + 1;
              d = 1;
            }
          } else {
            d = d === 0 ? 28 : d;
            if (d > 28) {
              m = m + 1
              d = 1;
            }
          }
          break;
      }

      if (m > 12) m = 1, y = y + 1;

      return y + '/' + m + '/' + d;
    }


  };
});