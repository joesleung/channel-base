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
/**
 * @description 对console的封装支持开关，方便线上调试/避免上线后忘记去掉console信息
 * @author panxinwu
 */
(function (global) {
  'use strict';

  /** @namespace _ */
  var _ = global._ || (global._ = {});
  var o2Log = {};
  //fixed to IE
  var methods = ["assert", "cd", "clear", "count", "countReset",
    "debug", "dir", "dirxml", "error", "exception", "group", "groupCollapsed",
    "groupEnd", "info", "log", "markTimeline", "profile", "profileEnd",
    "select", "table", "time", "timeEnd", "timeStamp", "timeline",
    "timelineEnd", "trace", "warn"];
  var length = methods.length;
  var console = (window.console = window.console || {});
  var method;
  var noop = function () { };
  while (length--) {
    method = methods[length];
    // define undefined methods as noops to prevent errors
    if (!console[method])
      console[method] = noop;
  }
  //URL是否远程开启
  var urlDebug = getUrlParams(window.location.href);
  o2Log = function (arg) {
    this.debug = urlDebug;
  }
  o2Log.prototype = {
    log: function (obj) {
      if (this.debug) {
        console.log(obj);
      }
    },
    warn: function (obj) {
      if (this.debug) {
        console.warn(obj);
      }
    },
    error: function (obj) {
      if (this.debug) {
        console.error(obj);
      }
    },
    debug: function (obj) {
      if (this.debug) {
        console.debug(obj);
      }
    },
    info: function (obj) {
      if (this.debug) {
        console.debug(obj);
      }
    }
  };
  //错误上报
  o2Log.prototype.errorReport = function (api, message) {
    //Todo
  };
  /**
   * 过滤URL中debug参数
   * @param url
   * @returns {true|false}
   */
  function getUrlParams(url) {
    var result = false
      , params = url.split('?')[1];
    if (!params) {
      result = false;
    } else {
      params = params.split('#')[0];
      if (!params) {
        result = false;
      } else {
        params = params.split('&');
        for (var i = 0, j = params.length; i < j; i++) {
          var param = params[i].split('=');
          if (param.length !== 2) {
            result = false;
          } else if (param[0] === 'debug' && param[1] === 'true') {
            result = true;
          } else {
            result = false;
          }
        }
      }
    }
    return result;
  };

  /** @memberOf _
   @example
    var console = seajs.require('console');
    console.log('log');
    console.warn('warn');
    console.error('error');
    console.debug('debug');
    console.info('info');
    //@使用&远程开启 window.locaiton.href?debug=true
   */
  _.console = new o2Log();
})(window, undefined);
/**
 * @author wuwenwei
 * @date 2016-10-27
 * @desc 上报
 */
(function () {
  'use strict';

  var Report = {
    getDownloadSpeed: function () {
      try {
        var timing = (window.performance || window.webkitPerformance || {}).timing;
        if (timing) {
          var pagebytes = $('html').html().length;
          var bytes = pagebytes / 1024;
          var duration = performance.timing.responseEnd - performance.timing.requestStart;

          return Math.round((bytes * 0.25) / (duration / 1000));
        }
      } catch (e) {}

      return 0;
    },

    getRank: function () {
      var speed = this.getDownloadSpeed();
      if (speed < 25) {
        return 31;
      } else if (speed < 50) {
        return 32;
      } else if (speed < 75) {
        return 33;
      } else if (speed < 100) {
        return 34;
      } else if (speed < 150) {
        return 35;
      } else if (speed < 200) {
        return 36;
      } else if (speed < 250) {
        return 37;
      } else if (speed < 300) {
        return 38;
      } else if (speed < 350) {
        return 39;
      } else if (speed < 400) {
        return 40;
      } else if (speed < 450) {
        return 41;
      } else if (speed < 500) {
        return 42;
      } else if (speed < 1000) {
        return 43;
      }

      return 44;
    },

    getSpeedInfo: function () {
      var rndNum = Math.floor(Math.random() * 100);
      var speed = this.getDownloadSpeed();
      var pageConfig = window.pageConfig || {};
      var ratio = pageConfig && pageConfig.O2_REPORT;

      if (ratio === void 0 || (typeof ratio !== 'number')) {
        ratio = 100;
      }

      if (ratio > 0 && rndNum >= 0 && rndNum <= ratio && speed > 0) { // 忽略速度为0
        return 's' + this.getRank() + '=' + speed;
      }

      return '';
    },

    // 获取屏幕分辨率
    getScreenRatio: function () {
      var width = window.screen.width;
      var height = window.screen.height;

      var data = {
        51: {
          width: 800,
          height: 600
        },
        52: {
          width: 960,
          height: 640
        },
        53: {
          width: 1024,
          height: 768
        },
        54: {
          width: 1136,
          height: 640
        },
        55: {
          width: 1152,
          height: 864
        },
        56: {
          width: 1280,
          height: 768
        },
        57: {
          width: 1280,
          height: 800
        },
        58: {
          width: 1280,
          height: 960
        },
        59: {
          width: 1280,
          height: 1024
        },
        60: {
          width: 1366,
          height: 768
        },
        61: {
          width: 1440,
          height: 900
        },
        62: {
          width: 1600,
          height: 1024
        },
        63: {
          width: 1600,
          height: 1200
        },
        64: {
          width: 1920,
          height: 1080
        },
        65: {
          width: 1920,
          height: 1200
        },
        66: {
          width: 2560,
          height: 1440
        },
        67: {
          width: 2560,
          height: 1600
        }
      }

      for (var key in data) {
        if (width === data[key].width && height === data[key].height) {
          return key;
        }
      }

      return 68;
    },

    // 获取浏览器型号
    getBrowser: function () {
      var Sys = {};
      var ua = navigator.userAgent.toLowerCase();
      var s;
      (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
      (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
      (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
      (s = ua.match(/metasr/)) ? Sys.sougou = true :
      (s = ua.match(/qqbrowser/)) ? Sys.qq = true :
      (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] :
      (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
      (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
      (s = ua.match(/ipad/)) ? Sys.ipad = true : 0;

      if (Sys.chrome) {
        return 11;
      }

      if (Sys.firefox) {
        return 12;
      }

      if (Sys.safari) {
        return 13;
      }

      if (Sys.opera) {
        return 14;
      }

      if (Sys.ie) {
        if (Sys.ie === '6.0') {
          return 15;
        }

        if (Sys.ie === '7.0') {
          return 16;
        }

        if (Sys.ie === '8.0') {
          return 17;
        }

        if (Sys.ie === '9.0') {
          return 18;
        }

        if (Sys.ie === '10.0') {
          return 19;
        }

        if (Sys.ie === '11.0') {
          return 20;
        }

        return 21;
      }

      if (Sys.sougou) {
        return 22;
      }

      if (Sys.qq) {
        return 23;
      }

      if (Sys.ipad) {
        return 24;
      }

      return 25;
    },

    // 获取基础数据：css加载完毕、首屏DOM加载、js加载完毕、dom加载完成
    getBaseData: function() {
      var data = window['_REPORT_'];
      var start = data && data['START'];
      var str = [];

      if (data && start) {
        var css = data['CSS'];
        var fs = data['FS'];
        var js = data['JS'];
        var dom = data['DOM'];

        if (css) {
          str.push('s72=' + (css.getTime() - start.getTime()));
        }

        if (fs) {
          str.push('s73=' + (fs.getTime() - start.getTime()));
        }

        if (js) {
          str.push('s74=' + (js.getTime() - start.getTime()));
        }

        if (dom) {
          str.push('s75=' + (dom.getTime() - start.getTime()));
        }
      }

      return str.join('&');
    },

    getRetina: function() {
      if (window.devicePixelRatio > 1 || window.matchMedia && window.matchMedia('(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), (-o-min-device-pixel-ratio: 3/2), (min-device-pixel-ratio: 1.5), (min-resolution: 144dpi), (min-resolution: 1.5dppx)').matches) {
        return 's71=1';
      }

      return '';
    },

    processRetina: function () {
      var retina = this.getRetina();
      if (retina) {
        this.processCore(retina);
      }
    },

    // 获取详细操作系统
    getSystem: function () {
      var ua = navigator.userAgent.toLowerCase();

      if (ua.indexOf("macintosh") !== -1 || ua.indexOf("mac os x") !== -1) { // Mac
        return 6;
      }

      if (ua.indexOf("linux") !== -1) {
        return 7;
      }

      // windows全家桶
      var data = {
        'nt 5.1': 1,
        'nt 5.2': 1,
        'nt 6.0': 2,
        'nt 6.1': 3,
        'nt 6.2': 4,
        'nt 6.3': 4,
        'nt 6.4': 5,
        'nt 10.0': 5
      };

      for (var key in data) {
        if (ua.indexOf(key) !== -1) {
          return data[key];
        }
      }

      return 8;
    },

    _getErrorInfo: function (id) {
      // 上报速度
      // 上报操作系统
      // 上报浏览器
      var strArr = [];

      strArr.push('s' + this.getSystem() + '=1');
      strArr.push('s' + this.getBrowser() + '=1');

      var speed = this.getDownloadSpeed();

      if (speed > 0) { // 忽略速度为0
        strArr.push('s' + this.getRank() + '=' + speed);
      }

      strArr.push('s' + (50 + id) + '=1');

      return strArr.join('&');
    },

    // 兜底数据
    processBackup: function (id) {
      if (this.pBackupId) {
        this.processCore(this._getErrorInfo(id), this.pBackupId);
      }
    },

    // 上报隐藏楼层
    processHidedFloor: function (id) {
      if (this.pFloorId) {
        this.processCore(this._getErrorInfo(id), this.pFloorId);
      }
    },

    processSpeed: function () {
      var speedInfo = this.getSpeedInfo();

      if (speedInfo) { // 忽略速度为0
        this.processCore(speedInfo);
      }
    },

    // 上报基础数据：包含css、js、dom、首屏加载
    processBaseData: function() {
      var data = this.getBaseData();

      if (data) {
        this.processCore(data);
      }
    },

    // 上报所有基准数据：基础数据、分辨率、浏览器、测速、retina
    // 只上报一次
    _firstReport: false,
    processAllData: function () {
      if (this._firstReport) {
        return;
      }

      this._firstReport = true;

      var speedInfo = this.getSpeedInfo();
      var retina = this.getRetina();

      if (retina || speedInfo) {
        var base = this.getBaseData();
        var browser = this.getBrowser();
        var ratio = this.getScreenRatio();
        var system = this.getSystem();
        var strArr = [];

        strArr.push('s' + system + '=1');
        strArr.push('s' + browser + '=1');
        if (speedInfo) {
          strArr.push(speedInfo);
        }
        strArr.push('s' + ratio + '=1');

        if (retina) {
          strArr.push(retina);
        }

        if (base) {
          strArr.push(base);
        }
        this.processCore(strArr.join('&'));
      }
    },

    image: null,
    processCore: function (str, pid) {
      var id = pid || this.pid;
      this.image = new Image();
      this.image.src = '//fd.3.cn/cesu/r?pid=' + id + '&' + str + '&_=' + (new Date()).getTime();
    },

    /**
     * debug显示调试信息
     */
    debug: function (str) {
      if (typeof console.log !== 'undefined') {
        console.log(str);
      }
    },

    pid: 0,
    pFloorId: 0,
    pBackupId: 0,

    /**
     * 初始化
     * @param {Number} pid 基础页面信息
     * @param {Number} pBackupId 兜底请求信息
     * @param {Number} pFloorId 楼层隐藏信息信息
     */
    init: function (pid, pBackupId, pFloorId) {
      var self = this;
      if (!pid) {
        self.debug('pageId must be provided!');
        return;
      }

      self.pid = pid;
      self.pFloorId = pFloorId;
      self.pBackupId = pBackupId;

      window.onload = function () {
        self.processAllData();
      };
    }
  };

  if (typeof define === 'function' && (define.amd || define.cmd)) {
    define('report', function () {
      return Report;
    });
  } else {
    window.o2Report = Report;
  }
}());

define('ajax_setup', function (require) {
  var store = require('store');
  (function setAjax () {
    $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
      var dfd = $.Deferred();
      jqXHR.done(function (data) {
        var dataCheck = options.dataCheck;
        if ($.isFunction(dataCheck) && !dataCheck(data)) {
          originalOptions.url = originalOptions.backup;
          originalOptions.dataCheck = null;
          originalOptions.forceBackup = true;
          dfd.rejectWith(originalOptions, arguments);
        } else {
          processStoreData(data);
          dfd.resolveWith(originalOptions, arguments);
        }
      });

      function processStoreData (data) {
        var needStore = options.needStore;
        var storeKey = options.storeKey;
        var storeCheck = options.storeCheck;
        needStore = needStore ? store.enabled : false;
        if (needStore) {
          var storeData = store.get(storeKey);
          if (!storeData || !storeCheck(storeData)) {
            if (typeof data === 'string') {
              try {
                data = JSON.parse(data);
              } catch (e) {
                data = {};
              }
            }
            store.set(storeKey, data);
          }
        }
      }
      
      jqXHR.retry = function (opts) {
        if (opts.timeout) {
          this.timeout = opts.timeout;
        }
        if (opts.statusCodes) {
          this.statusCodes = opts.statusCodes;
        }
        return this.pipe(null, pipeFailRetry(this, opts));
      };
      return dfd.promise(jqXHR);
    });

    $.ajaxTransport('+script', function (options) {
      var needStore = options.needStore;
      var storeKey = options.storeKey;
      var storeCheck = options.storeCheck;
      var dataType = options.dataType;
      var forceStore = options.forceStore;
      needStore = needStore ? store.enabled : false;
      if (needStore) {
        var storeData = store.get(storeKey);
        if (storeData && (storeCheck(storeData) || forceStore)) {
          return {
            send: function (headers, completeCallback) {
              var response = {};
              response[dataType] = options.jsonpCallback + '(' + JSON.stringify(storeData) + ')';
              completeCallback(200, 'success', response, '');
            },
            abort: function () {
              _.console.log('abort ajax transport for local cache');
            }
          };
        }
      }
    });

    function pipeFailRetry(jqXHR, opts) {
      var times = opts.times;
      var backup = opts.backup;
      var timeout = jqXHR.timeout;
      var timer = null;
      return function (input, status, msg) {
        var ajaxOptions = this;
        var output = new $.Deferred();
        var retryAfter = jqXHR.getResponseHeader('Retry-After');
        timer && clearTimeout(timer);
        function nextRequest(options) {
          if (options && options.url === opts.backup) {
            _.eventCenter.trigger(ajaxOptions.jsonpCallback + ':backup', opts.backup);
          }
          ajaxOptions.data = ajaxOptions.__data || { };
          $.extend(ajaxOptions, {
            url: ajaxOptions.originalUrl,
            forceStore: false
          }, options);
          $.ajax(ajaxOptions)
            .retry({
              times: times - 1,
              timeout: opts.timeout,
              statusCodes: opts.statusCodes,
              backup: backup
            })
            .pipe(output.resolve, output.reject);
        }

        function useStore() {
          var storeData = store.get(ajaxOptions.storeKey);
          if (storeData) {
            nextRequest({
              forceStore: true
            });
          } else {
            output.rejectWith(this, arguments);
          }
        }

        if (ajaxOptions.forceBackup) {
          times = 0;
        }

        if (times > 0 && (!jqXHR.statusCodes || $.inArray(input.status, jqXHR.statusCodes) > -1)) {
          if (retryAfter) {
            if (isNaN(retryAfter)) {
              timeout = new Date(retryAfter).getTime() - $.now();
            } else {
              timeout = parseInt(retryAfter, 10) * 1000;
            }
            if (isNaN(timeout) || timeout < 0) {
              timeout = jqXHR.timeout;
            }
          }

          if (timeout !== undefined && times !== opts.times) {
            timer = setTimeout(nextRequest, timeout);
          } else {
            nextRequest();
          }
        } else {
          if (times === 0) {
            if (typeof backup === 'string' && backup.length > 0) {
              nextRequest({
                url: backup
              });
            } else {
              useStore();
            }
          } else if (times === -1) {
            useStore();
          } else {
            output.rejectWith(this, arguments);
          }
        }
        return output;
      };
    }
  })();
});
define('load_async',['ajax_setup'], function (require) {
  require('ajax_setup');
  return function loadAsync (opts) {
    opts = $.extend({
      url: '',
      params: {},
      timeout: 3000,
      times: 2,
      backup: null,
      needStore: false,
      storeSign: null,
      dataCheck: null,
      dataType: 'jsonp',
      type: 'get',
      scriptCharset: 'UTF-8'
    }, opts);
    return $.ajax({
      type: opts.type,
      url: opts.url,
      scriptCharset: opts.scriptCharset,
      originalUrl: opts.url,
      data: opts.params,
      __data: opts.params,
      dataType: opts.dataType,
      jsonp: 'callback',
      jsonpCallback: opts.jsonpCallback,
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