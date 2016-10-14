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