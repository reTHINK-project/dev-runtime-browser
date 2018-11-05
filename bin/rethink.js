(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.rethink = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// version: 0.14.0
// date: Mon Nov 05 2018 09:55:51 GMT+0000 (Western European Standard Time)
// licence: 
/**
* Copyright 2016 PT Inovação e Sistemas SA
* Copyright 2016 INESC-ID
* Copyright 2016 QUOBIS NETWORKS SL
* Copyright 2016 FRAUNHOFER-GESELLSCHAFT ZUR FOERDERUNG DER ANGEWANDTEN FORSCHUNG E.V
* Copyright 2016 ORANGE SA
* Copyright 2016 Deutsche Telekom AG
* Copyright 2016 Apizee
* Copyright 2016 TECHNISCHE UNIVERSITAT BERLIN
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**/


// version: 0.14.0
// date: Mon Nov 05 2018 09:55:51 GMT+0000 (Western European Standard Time)
// licence: 
/**
* Copyright 2016 PT Inovação e Sistemas SA
* Copyright 2016 INESC-ID
* Copyright 2016 QUOBIS NETWORKS SL
* Copyright 2016 FRAUNHOFER-GESELLSCHAFT ZUR FOERDERUNG DER ANGEWANDTEN FORSCHUNG E.V
* Copyright 2016 ORANGE SA
* Copyright 2016 Deutsche Telekom AG
* Copyright 2016 Apizee
* Copyright 2016 TECHNISCHE UNIVERSITAT BERLIN
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**/


!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define("minibus",[],e):"object"==typeof exports?exports.minibus=e():t.minibus=e()}("undefined"!=typeof self?self:this,function(){return function(t){function __webpack_require__(n){if(e[n])return e[n].exports;var r=e[n]={i:n,l:!1,exports:{}};return t[n].call(r.exports,r,r.exports,__webpack_require__),r.l=!0,r.exports}var e={};return __webpack_require__.m=t,__webpack_require__.c=e,__webpack_require__.d=function(t,e,n){__webpack_require__.o(t,e)||Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:n})},__webpack_require__.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return __webpack_require__.d(e,"a",e),e},__webpack_require__.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},__webpack_require__.p="",__webpack_require__(__webpack_require__.s=174)}([function(t,e){var n=t.exports={version:"2.5.7"};"number"==typeof __e&&(__e=n)},function(t,e){var n=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=n)},function(t,e,n){var r=n(31)("wks"),o=n(22),i=n(1).Symbol,u="function"==typeof i;(t.exports=function(t){return r[t]||(r[t]=u&&i[t]||(u?i:o)("Symbol."+t))}).store=r},function(t,e,n){"use strict";e.__esModule=!0,e.default=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}},function(t,e,n){"use strict";e.__esModule=!0;var r=n(64),o=function(t){return t&&t.__esModule?t:{default:t}}(r);e.default=function(){function defineProperties(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),(0,o.default)(t,r.key,r)}}return function(t,e,n){return e&&defineProperties(t.prototype,e),n&&defineProperties(t,n),t}}()},function(t,e,n){var r=n(1),o=n(0),i=n(17),u=n(11),s=n(10),c=function(t,e,n){var f,a,l,p=t&c.F,v=t&c.G,d=t&c.S,h=t&c.P,y=t&c.B,_=t&c.W,b=v?o:o[e]||(o[e]={}),g=b.prototype,m=v?r:d?r[e]:(r[e]||{}).prototype;v&&(n=e);for(f in n)(a=!p&&m&&void 0!==m[f])&&s(b,f)||(l=a?m[f]:n[f],b[f]=v&&"function"!=typeof m[f]?n[f]:y&&a?i(l,r):_&&m[f]==l?function(t){var e=function(e,n,r){if(this instanceof t){switch(arguments.length){case 0:return new t;case 1:return new t(e);case 2:return new t(e,n)}return new t(e,n,r)}return t.apply(this,arguments)};return e.prototype=t.prototype,e}(l):h&&"function"==typeof l?i(Function.call,l):l,h&&((b.virtual||(b.virtual={}))[f]=l,t&c.R&&g&&!g[f]&&u(g,f,l)))};c.F=1,c.G=2,c.S=4,c.P=8,c.B=16,c.W=32,c.U=64,c.R=128,t.exports=c},function(t,e,n){var r=n(9);t.exports=function(t){if(!r(t))throw TypeError(t+" is not an object!");return t}},function(t,e,n){t.exports=!n(13)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},function(t,e,n){var r=n(6),o=n(43),i=n(29),u=Object.defineProperty;e.f=n(7)?Object.defineProperty:function(t,e,n){if(r(t),e=i(e,!0),r(n),o)try{return u(t,e,n)}catch(t){}if("get"in n||"set"in n)throw TypeError("Accessors not supported!");return"value"in n&&(t[e]=n.value),t}},function(t,e){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},function(t,e){var n={}.hasOwnProperty;t.exports=function(t,e){return n.call(t,e)}},function(t,e,n){var r=n(8),o=n(21);t.exports=n(7)?function(t,e,n){return r.f(t,e,o(1,n))}:function(t,e,n){return t[e]=n,t}},function(t,e,n){var r=n(62),o=n(25);t.exports=function(t){return r(o(t))}},function(t,e){t.exports=function(t){try{return!!t()}catch(t){return!0}}},function(t,e,n){t.exports={default:n(71),__esModule:!0}},function(t,e){t.exports=!0},function(t,e){var n={}.toString;t.exports=function(t){return n.call(t).slice(8,-1)}},function(t,e,n){var r=n(20);t.exports=function(t,e,n){if(r(t),void 0===e)return t;switch(n){case 1:return function(n){return t.call(e,n)};case 2:return function(n,r){return t.call(e,n,r)};case 3:return function(n,r,o){return t.call(e,n,r,o)}}return function(){return t.apply(e,arguments)}}},function(t,e){t.exports={}},function(t,e,n){var r=n(44),o=n(32);t.exports=Object.keys||function(t){return r(t,o)}},function(t,e){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},function(t,e){t.exports=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}}},function(t,e){var n=0,r=Math.random();t.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++n+r).toString(36))}},function(t,e,n){var r=n(8).f,o=n(10),i=n(2)("toStringTag");t.exports=function(t,e,n){t&&!o(t=n?t:t.prototype,i)&&r(t,i,{configurable:!0,value:e})}},function(t,e){var n=Math.ceil,r=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?r:n)(t)}},function(t,e){t.exports=function(t){if(void 0==t)throw TypeError("Can't call method on  "+t);return t}},function(t,e,n){t.exports={default:n(103),__esModule:!0}},function(t,e){e.f={}.propertyIsEnumerable},function(t,e,n){var r=n(9),o=n(1).document,i=r(o)&&r(o.createElement);t.exports=function(t){return i?o.createElement(t):{}}},function(t,e,n){var r=n(9);t.exports=function(t,e){if(!r(t))return t;var n,o;if(e&&"function"==typeof(n=t.toString)&&!r(o=n.call(t)))return o;if("function"==typeof(n=t.valueOf)&&!r(o=n.call(t)))return o;if(!e&&"function"==typeof(n=t.toString)&&!r(o=n.call(t)))return o;throw TypeError("Can't convert object to primitive value")}},function(t,e,n){var r=n(31)("keys"),o=n(22);t.exports=function(t){return r[t]||(r[t]=o(t))}},function(t,e,n){var r=n(0),o=n(1),i=o["__core-js_shared__"]||(o["__core-js_shared__"]={});(t.exports=function(t,e){return i[t]||(i[t]=void 0!==e?e:{})})("versions",[]).push({version:r.version,mode:n(15)?"pure":"global",copyright:"© 2018 Denis Pushkarev (zloirock.ru)"})},function(t,e){t.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},function(t,e,n){var r=n(25);t.exports=function(t){return Object(r(t))}},function(t,e,n){"use strict";e.__esModule=!0;var r=n(60),o=function(t){return t&&t.__esModule?t:{default:t}}(r);e.default=function(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!==(void 0===e?"undefined":(0,o.default)(e))&&"function"!=typeof e?t:e}},function(t,e,n){"use strict";function _interopRequireDefault(t){return t&&t.__esModule?t:{default:t}}e.__esModule=!0;var r=n(105),o=_interopRequireDefault(r),i=n(109),u=_interopRequireDefault(i),s=n(60),c=_interopRequireDefault(s);e.default=function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+(void 0===e?"undefined":(0,c.default)(e)));t.prototype=(0,u.default)(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(o.default?(0,o.default)(t,e):t.__proto__=e)}},,function(t,e,n){"use strict";function PromiseCapability(t){var e,n;this.promise=new t(function(t,r){if(void 0!==e||void 0!==n)throw TypeError("Bad Promise constructor");e=t,n=r}),this.resolve=r(e),this.reject=r(n)}var r=n(20);t.exports.f=function(t){return new PromiseCapability(t)}},function(t,e,n){var r,o;!function(i,u){"use strict";r=u,void 0!==(o="function"==typeof r?r.call(e,n,e,t):r)&&(t.exports=o)}(0,function(){"use strict";function bindMethod(t,e){var n=t[e];if("function"==typeof n.bind)return n.bind(t);try{return Function.prototype.bind.call(n,t)}catch(e){return function(){return Function.prototype.apply.apply(n,[t,arguments])}}}function realMethod(n){return"debug"===n&&(n="log"),typeof console!==e&&(void 0!==console[n]?bindMethod(console,n):void 0!==console.log?bindMethod(console,"log"):t)}function replaceLoggingMethods(e,r){for(var o=0;o<n.length;o++){var i=n[o];this[i]=o<e?t:this.methodFactory(i,e,r)}this.log=this.debug}function enableLoggingWhenConsoleArrives(t,n,r){return function(){typeof console!==e&&(replaceLoggingMethods.call(this,n,r),this[t].apply(this,arguments))}}function defaultMethodFactory(t,e,n){return realMethod(t)||enableLoggingWhenConsoleArrives.apply(this,arguments)}function Logger(t,r,o){function persistLevelIfPossible(t){var r=(n[t]||"silent").toUpperCase();if(typeof window!==e){try{return void(window.localStorage[s]=r)}catch(t){}try{window.document.cookie=encodeURIComponent(s)+"="+r+";"}catch(t){}}}function getPersistedLevel(){var t;if(typeof window!==e){try{t=window.localStorage[s]}catch(t){}if(typeof t===e)try{var n=window.document.cookie,r=n.indexOf(encodeURIComponent(s)+"=");-1!==r&&(t=/^([^;]+)/.exec(n.slice(r))[1])}catch(t){}return void 0===u.levels[t]&&(t=void 0),t}}var i,u=this,s="loglevel";t&&(s+=":"+t),u.name=t,u.levels={TRACE:0,DEBUG:1,INFO:2,WARN:3,ERROR:4,SILENT:5},u.methodFactory=o||defaultMethodFactory,u.getLevel=function(){return i},u.setLevel=function(n,r){if("string"==typeof n&&void 0!==u.levels[n.toUpperCase()]&&(n=u.levels[n.toUpperCase()]),!("number"==typeof n&&n>=0&&n<=u.levels.SILENT))throw"log.setLevel() called with invalid level: "+n;if(i=n,!1!==r&&persistLevelIfPossible(n),replaceLoggingMethods.call(u,n,t),typeof console===e&&n<u.levels.SILENT)return"No console available for logging"},u.setDefaultLevel=function(t){getPersistedLevel()||u.setLevel(t,!1)},u.enableAll=function(t){u.setLevel(u.levels.TRACE,t)},u.disableAll=function(t){u.setLevel(u.levels.SILENT,t)};var c=getPersistedLevel();null==c&&(c=null==r?"WARN":r),u.setLevel(c,!1)}var t=function(){},e="undefined",n=["trace","debug","info","warn","error"],r=new Logger,o={};r.getLogger=function(t){if("string"!=typeof t||""===t)throw new TypeError("You must supply a name when creating a logger.");var e=o[t];return e||(e=o[t]=new Logger(t,r.getLevel(),r.methodFactory)),e};var i=typeof window!==e?window.log:void 0;return r.noConflict=function(){return typeof window!==e&&window.log===r&&(window.log=i),r},r.getLoggers=function(){return o},r})},function(t,e,n){e.f=n(2)},function(t,e,n){var r=n(1),o=n(0),i=n(15),u=n(39),s=n(8).f;t.exports=function(t){var e=o.Symbol||(o.Symbol=i?{}:r.Symbol||{});"_"==t.charAt(0)||t in e||s(e,t,{value:u.f(t)})}},function(t,e,n){var r=n(6),o=n(74),i=n(32),u=n(30)("IE_PROTO"),s=function(){},c=function(){var t,e=n(28)("iframe"),r=i.length;for(e.style.display="none",n(55).appendChild(e),e.src="javascript:",t=e.contentWindow.document,t.open(),t.write("<script>document.F=Object<\/script>"),t.close(),c=t.F;r--;)delete c.prototype[i[r]];return c()};t.exports=Object.create||function(t,e){var n;return null!==t?(s.prototype=r(t),n=new s,s.prototype=null,n[u]=t):n=c(),void 0===e?n:o(n,e)}},function(t,e,n){"use strict";var r=n(72)(!0);n(53)(String,"String",function(t){this._t=String(t),this._i=0},function(){var t,e=this._t,n=this._i;return n>=e.length?{value:void 0,done:!0}:(t=r(e,n),this._i+=t.length,{value:t,done:!1})})},function(t,e,n){t.exports=!n(7)&&!n(13)(function(){return 7!=Object.defineProperty(n(28)("div"),"a",{get:function(){return 7}}).a})},function(t,e,n){var r=n(10),o=n(12),i=n(66)(!1),u=n(30)("IE_PROTO");t.exports=function(t,e){var n,s=o(t),c=0,f=[];for(n in s)n!=u&&r(s,n)&&f.push(n);for(;e.length>c;)r(s,n=e[c++])&&(~i(f,n)||f.push(n));return f}},function(t,e,n){var r=n(24),o=Math.min;t.exports=function(t){return t>0?o(r(t),9007199254740991):0}},function(t,e,n){n(75);for(var r=n(1),o=n(11),i=n(18),u=n(2)("toStringTag"),s="CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,TextTrackList,TouchList".split(","),c=0;c<s.length;c++){var f=s[c],a=r[f],l=a&&a.prototype;l&&!l[u]&&o(l,u,f),i[f]=i.Array}},function(t,e){e.f=Object.getOwnPropertySymbols},,function(t,e,n){var r=n(16),o=n(2)("toStringTag"),i="Arguments"==r(function(){return arguments}()),u=function(t,e){try{return t[e]}catch(t){}};t.exports=function(t){var e,n,s;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(n=u(e=Object(t),o))?n:i?r(e):"Object"==(s=r(e))&&"function"==typeof e.callee?"Arguments":s}},function(t,e,n){var r=n(5),o=n(0),i=n(13);t.exports=function(t,e){var n=(o.Object||{})[t]||Object[t],u={};u[t]=e(n),r(r.S+r.F*i(function(){n(1)}),"Object",u)}},function(t,e,n){var r=n(27),o=n(21),i=n(12),u=n(29),s=n(10),c=n(43),f=Object.getOwnPropertyDescriptor;e.f=n(7)?f:function(t,e){if(t=i(t),e=u(e,!0),c)try{return f(t,e)}catch(t){}if(s(t,e))return o(!r.f.call(t,e),t[e])}},function(t,e){},function(t,e,n){"use strict";var r=n(15),o=n(5),i=n(54),u=n(11),s=n(18),c=n(73),f=n(23),a=n(63),l=n(2)("iterator"),p=!([].keys&&"next"in[].keys()),v=function(){return this};t.exports=function(t,e,n,d,h,y,_){c(n,e,d);var b,g,m,w=function(t){if(!p&&t in P)return P[t];switch(t){case"keys":case"values":return function(){return new n(this,t)}}return function(){return new n(this,t)}},x=e+" Iterator",O="values"==h,M=!1,P=t.prototype,S=P[l]||P["@@iterator"]||h&&P[h],L=S||w(h),j=h?O?w("entries"):L:void 0,k="Array"==e?P.entries||S:S;if(k&&(m=a(k.call(new t)))!==Object.prototype&&m.next&&(f(m,x,!0),r||"function"==typeof m[l]||u(m,l,v)),O&&S&&"values"!==S.name&&(M=!0,L=function(){return S.call(this)}),r&&!_||!p&&!M&&P[l]||u(P,l,L),s[e]=L,s[x]=v,h)if(b={values:O?L:w("values"),keys:y?L:w("keys"),entries:j},_)for(g in b)g in P||i(P,g,b[g]);else o(o.P+o.F*(p||M),e,b);return b}},function(t,e,n){t.exports=n(11)},function(t,e,n){var r=n(1).document;t.exports=r&&r.documentElement},function(t,e,n){var r=n(6),o=n(20),i=n(2)("species");t.exports=function(t,e){var n,u=r(t).constructor;return void 0===u||void 0==(n=r(u)[i])?e:o(n)}},function(t,e,n){var r,o,i,u=n(17),s=n(83),c=n(55),f=n(28),a=n(1),l=a.process,p=a.setImmediate,v=a.clearImmediate,d=a.MessageChannel,h=a.Dispatch,y=0,_={},b=function(){var t=+this;if(_.hasOwnProperty(t)){var e=_[t];delete _[t],e()}},g=function(t){b.call(t.data)};p&&v||(p=function(t){for(var e=[],n=1;arguments.length>n;)e.push(arguments[n++]);return _[++y]=function(){s("function"==typeof t?t:Function(t),e)},r(y),y},v=function(t){delete _[t]},"process"==n(16)(l)?r=function(t){l.nextTick(u(b,t,1))}:h&&h.now?r=function(t){h.now(u(b,t,1))}:d?(o=new d,i=o.port2,o.port1.onmessage=g,r=u(i.postMessage,i,1)):a.addEventListener&&"function"==typeof postMessage&&!a.importScripts?(r=function(t){a.postMessage(t+"","*")},a.addEventListener("message",g,!1)):r="onreadystatechange"in f("script")?function(t){c.appendChild(f("script")).onreadystatechange=function(){c.removeChild(this),b.call(t)}}:function(t){setTimeout(u(b,t,1),0)}),t.exports={set:p,clear:v}},function(t,e){t.exports=function(t){try{return{e:!1,v:t()}}catch(t){return{e:!0,v:t}}}},function(t,e,n){var r=n(6),o=n(9),i=n(37);t.exports=function(t,e){if(r(t),o(e)&&e.constructor===t)return e;var n=i.f(t);return(0,n.resolve)(e),n.promise}},function(t,e,n){"use strict";function _interopRequireDefault(t){return t&&t.__esModule?t:{default:t}}e.__esModule=!0;var r=n(91),o=_interopRequireDefault(r),i=n(93),u=_interopRequireDefault(i),s="function"==typeof u.default&&"symbol"==typeof o.default?function(t){return typeof t}:function(t){return t&&"function"==typeof u.default&&t.constructor===u.default&&t!==u.default.prototype?"symbol":typeof t};e.default="function"==typeof u.default&&"symbol"===s(o.default)?function(t){return void 0===t?"undefined":s(t)}:function(t){return t&&"function"==typeof u.default&&t.constructor===u.default&&t!==u.default.prototype?"symbol":void 0===t?"undefined":s(t)}},function(t,e,n){var r=n(44),o=n(32).concat("length","prototype");e.f=Object.getOwnPropertyNames||function(t){return r(t,o)}},function(t,e,n){var r=n(16);t.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==r(t)?t.split(""):Object(t)}},function(t,e,n){var r=n(10),o=n(33),i=n(30)("IE_PROTO"),u=Object.prototype;t.exports=Object.getPrototypeOf||function(t){return t=o(t),r(t,i)?t[i]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?u:null}},function(t,e,n){t.exports={default:n(68),__esModule:!0}},,function(t,e,n){var r=n(12),o=n(45),i=n(67);t.exports=function(t){return function(e,n,u){var s,c=r(e),f=o(c.length),a=i(u,f);if(t&&n!=n){for(;f>a;)if((s=c[a++])!=s)return!0}else for(;f>a;a++)if((t||a in c)&&c[a]===n)return t||a||0;return!t&&-1}}},function(t,e,n){var r=n(24),o=Math.max,i=Math.min;t.exports=function(t,e){return t=r(t),t<0?o(t+e,0):i(t,e)}},function(t,e,n){n(69);var r=n(0).Object;t.exports=function(t,e,n){return r.defineProperty(t,e,n)}},function(t,e,n){var r=n(5);r(r.S+r.F*!n(7),"Object",{defineProperty:n(8).f})},function(t,e,n){var r=n(49),o=n(2)("iterator"),i=n(18);t.exports=n(0).getIteratorMethod=function(t){if(void 0!=t)return t[o]||t["@@iterator"]||i[r(t)]}},function(t,e,n){n(52),n(42),n(46),n(78),n(89),n(90),t.exports=n(0).Promise},function(t,e,n){var r=n(24),o=n(25);t.exports=function(t){return function(e,n){var i,u,s=String(o(e)),c=r(n),f=s.length;return c<0||c>=f?t?"":void 0:(i=s.charCodeAt(c),i<55296||i>56319||c+1===f||(u=s.charCodeAt(c+1))<56320||u>57343?t?s.charAt(c):i:t?s.slice(c,c+2):u-56320+(i-55296<<10)+65536)}}},function(t,e,n){"use strict";var r=n(41),o=n(21),i=n(23),u={};n(11)(u,n(2)("iterator"),function(){return this}),t.exports=function(t,e,n){t.prototype=r(u,{next:o(1,n)}),i(t,e+" Iterator")}},function(t,e,n){var r=n(8),o=n(6),i=n(19);t.exports=n(7)?Object.defineProperties:function(t,e){o(t);for(var n,u=i(e),s=u.length,c=0;s>c;)r.f(t,n=u[c++],e[n]);return t}},function(t,e,n){"use strict";var r=n(76),o=n(77),i=n(18),u=n(12);t.exports=n(53)(Array,"Array",function(t,e){this._t=u(t),this._i=0,this._k=e},function(){var t=this._t,e=this._k,n=this._i++;return!t||n>=t.length?(this._t=void 0,o(1)):"keys"==e?o(0,n):"values"==e?o(0,t[n]):o(0,[n,t[n]])},"values"),i.Arguments=i.Array,r("keys"),r("values"),r("entries")},function(t,e){t.exports=function(){}},function(t,e){t.exports=function(t,e){return{value:e,done:!!t}}},function(t,e,n){"use strict";var r,o,i,u,s=n(15),c=n(1),f=n(17),a=n(49),l=n(5),p=n(9),v=n(20),d=n(79),h=n(80),y=n(56),_=n(57).set,b=n(84)(),g=n(37),m=n(58),w=n(85),x=n(59),O=c.TypeError,M=c.process,P=M&&M.versions,S=P&&P.v8||"",L=c.Promise,j="process"==a(M),k=function(){},E=o=g.f,R=!!function(){try{var t=L.resolve(1),e=(t.constructor={})[n(2)("species")]=function(t){t(k,k)};return(j||"function"==typeof PromiseRejectionEvent)&&t.then(k)instanceof e&&0!==S.indexOf("6.6")&&-1===w.indexOf("Chrome/66")}catch(t){}}(),T=function(t){var e;return!(!p(t)||"function"!=typeof(e=t.then))&&e},C=function(t,e){if(!t._n){t._n=!0;var n=t._c;b(function(){for(var r=t._v,o=1==t._s,i=0;n.length>i;)!function(e){var n,i,u,s=o?e.ok:e.fail,c=e.resolve,f=e.reject,a=e.domain;try{s?(o||(2==t._h&&F(t),t._h=1),!0===s?n=r:(a&&a.enter(),n=s(r),a&&(a.exit(),u=!0)),n===e.promise?f(O("Promise-chain cycle")):(i=T(n))?i.call(n,c,f):c(n)):f(r)}catch(t){a&&!u&&a.exit(),f(t)}}(n[i++]);t._c=[],t._n=!1,e&&!t._h&&A(t)})}},A=function(t){_.call(c,function(){var e,n,r,o=t._v,i=D(t);if(i&&(e=m(function(){j?M.emit("unhandledRejection",o,t):(n=c.onunhandledrejection)?n({promise:t,reason:o}):(r=c.console)&&r.error&&r.error("Unhandled promise rejection",o)}),t._h=j||D(t)?2:1),t._a=void 0,i&&e.e)throw e.v})},D=function(t){return 1!==t._h&&0===(t._a||t._c).length},F=function(t){_.call(c,function(){var e;j?M.emit("rejectionHandled",t):(e=c.onrejectionhandled)&&e({promise:t,reason:t._v})})},q=function(t){var e=this;e._d||(e._d=!0,e=e._w||e,e._v=t,e._s=2,e._a||(e._a=e._c.slice()),C(e,!0))},I=function(t){var e,n=this;if(!n._d){n._d=!0,n=n._w||n;try{if(n===t)throw O("Promise can't be resolved itself");(e=T(t))?b(function(){var r={_w:n,_d:!1};try{e.call(t,f(I,r,1),f(q,r,1))}catch(t){q.call(r,t)}}):(n._v=t,n._s=1,C(n,!1))}catch(t){q.call({_w:n,_d:!1},t)}}};R||(L=function(t){d(this,L,"Promise","_h"),v(t),r.call(this);try{t(f(I,this,1),f(q,this,1))}catch(t){q.call(this,t)}},r=function(t){this._c=[],this._a=void 0,this._s=0,this._d=!1,this._v=void 0,this._h=0,this._n=!1},r.prototype=n(86)(L.prototype,{then:function(t,e){var n=E(y(this,L));return n.ok="function"!=typeof t||t,n.fail="function"==typeof e&&e,n.domain=j?M.domain:void 0,this._c.push(n),this._a&&this._a.push(n),this._s&&C(this,!1),n.promise},catch:function(t){return this.then(void 0,t)}}),i=function(){var t=new r;this.promise=t,this.resolve=f(I,t,1),this.reject=f(q,t,1)},g.f=E=function(t){return t===L||t===u?new i(t):o(t)}),l(l.G+l.W+l.F*!R,{Promise:L}),n(23)(L,"Promise"),n(87)("Promise"),u=n(0).Promise,l(l.S+l.F*!R,"Promise",{reject:function(t){var e=E(this);return(0,e.reject)(t),e.promise}}),l(l.S+l.F*(s||!R),"Promise",{resolve:function(t){return x(s&&this===u?L:this,t)}}),l(l.S+l.F*!(R&&n(88)(function(t){L.all(t).catch(k)})),"Promise",{all:function(t){var e=this,n=E(e),r=n.resolve,o=n.reject,i=m(function(){var n=[],i=0,u=1;h(t,!1,function(t){var s=i++,c=!1;n.push(void 0),u++,e.resolve(t).then(function(t){c||(c=!0,n[s]=t,--u||r(n))},o)}),--u||r(n)});return i.e&&o(i.v),n.promise},race:function(t){var e=this,n=E(e),r=n.reject,o=m(function(){h(t,!1,function(t){e.resolve(t).then(n.resolve,r)})});return o.e&&r(o.v),n.promise}})},function(t,e){t.exports=function(t,e,n,r){if(!(t instanceof e)||void 0!==r&&r in t)throw TypeError(n+": incorrect invocation!");return t}},function(t,e,n){var r=n(17),o=n(81),i=n(82),u=n(6),s=n(45),c=n(70),f={},a={},e=t.exports=function(t,e,n,l,p){var v,d,h,y,_=p?function(){return t}:c(t),b=r(n,l,e?2:1),g=0;if("function"!=typeof _)throw TypeError(t+" is not iterable!");if(i(_)){for(v=s(t.length);v>g;g++)if((y=e?b(u(d=t[g])[0],d[1]):b(t[g]))===f||y===a)return y}else for(h=_.call(t);!(d=h.next()).done;)if((y=o(h,b,d.value,e))===f||y===a)return y};e.BREAK=f,e.RETURN=a},function(t,e,n){var r=n(6);t.exports=function(t,e,n,o){try{return o?e(r(n)[0],n[1]):e(n)}catch(e){var i=t.return;throw void 0!==i&&r(i.call(t)),e}}},function(t,e,n){var r=n(18),o=n(2)("iterator"),i=Array.prototype;t.exports=function(t){return void 0!==t&&(r.Array===t||i[o]===t)}},function(t,e){t.exports=function(t,e,n){var r=void 0===n;switch(e.length){case 0:return r?t():t.call(n);case 1:return r?t(e[0]):t.call(n,e[0]);case 2:return r?t(e[0],e[1]):t.call(n,e[0],e[1]);case 3:return r?t(e[0],e[1],e[2]):t.call(n,e[0],e[1],e[2]);case 4:return r?t(e[0],e[1],e[2],e[3]):t.call(n,e[0],e[1],e[2],e[3])}return t.apply(n,e)}},function(t,e,n){var r=n(1),o=n(57).set,i=r.MutationObserver||r.WebKitMutationObserver,u=r.process,s=r.Promise,c="process"==n(16)(u);t.exports=function(){var t,e,n,f=function(){var r,o;for(c&&(r=u.domain)&&r.exit();t;){o=t.fn,t=t.next;try{o()}catch(r){throw t?n():e=void 0,r}}e=void 0,r&&r.enter()};if(c)n=function(){u.nextTick(f)};else if(!i||r.navigator&&r.navigator.standalone)if(s&&s.resolve){var a=s.resolve(void 0);n=function(){a.then(f)}}else n=function(){o.call(r,f)};else{var l=!0,p=document.createTextNode("");new i(f).observe(p,{characterData:!0}),n=function(){p.data=l=!l}}return function(r){var o={fn:r,next:void 0};e&&(e.next=o),t||(t=o,n()),e=o}}},function(t,e,n){var r=n(1),o=r.navigator;t.exports=o&&o.userAgent||""},function(t,e,n){var r=n(11);t.exports=function(t,e,n){for(var o in e)n&&t[o]?t[o]=e[o]:r(t,o,e[o]);return t}},function(t,e,n){"use strict";var r=n(1),o=n(0),i=n(8),u=n(7),s=n(2)("species");t.exports=function(t){var e="function"==typeof o[t]?o[t]:r[t];u&&e&&!e[s]&&i.f(e,s,{configurable:!0,get:function(){return this}})}},function(t,e,n){var r=n(2)("iterator"),o=!1;try{var i=[7][r]();i.return=function(){o=!0},Array.from(i,function(){throw 2})}catch(t){}t.exports=function(t,e){if(!e&&!o)return!1;var n=!1;try{var i=[7],u=i[r]();u.next=function(){return{done:n=!0}},i[r]=function(){return u},t(i)}catch(t){}return n}},function(t,e,n){"use strict";var r=n(5),o=n(0),i=n(1),u=n(56),s=n(59);r(r.P+r.R,"Promise",{finally:function(t){var e=u(this,o.Promise||i.Promise),n="function"==typeof t;return this.then(n?function(n){return s(e,t()).then(function(){return n})}:t,n?function(n){return s(e,t()).then(function(){throw n})}:t)}})},function(t,e,n){"use strict";var r=n(5),o=n(37),i=n(58);r(r.S,"Promise",{try:function(t){var e=o.f(this),n=i(t);return(n.e?e.reject:e.resolve)(n.v),e.promise}})},function(t,e,n){t.exports={default:n(92),__esModule:!0}},function(t,e,n){n(42),n(46),t.exports=n(39).f("iterator")},function(t,e,n){t.exports={default:n(94),__esModule:!0}},function(t,e,n){n(95),n(52),n(100),n(101),t.exports=n(0).Symbol},function(t,e,n){"use strict";var r=n(1),o=n(10),i=n(7),u=n(5),s=n(54),c=n(96).KEY,f=n(13),a=n(31),l=n(23),p=n(22),v=n(2),d=n(39),h=n(40),y=n(97),_=n(98),b=n(6),g=n(9),m=n(12),w=n(29),x=n(21),O=n(41),M=n(99),P=n(51),S=n(8),L=n(19),j=P.f,k=S.f,E=M.f,R=r.Symbol,T=r.JSON,C=T&&T.stringify,A=v("_hidden"),D=v("toPrimitive"),F={}.propertyIsEnumerable,q=a("symbol-registry"),I=a("symbols"),N=a("op-symbols"),B=Object.prototype,W="function"==typeof R,G=r.QObject,U=!G||!G.prototype||!G.prototype.findChild,V=i&&f(function(){return 7!=O(k({},"a",{get:function(){return k(this,"a",{value:7}).a}})).a})?function(t,e,n){var r=j(B,e);r&&delete B[e],k(t,e,n),r&&t!==B&&k(B,e,r)}:k,H=function(t){var e=I[t]=O(R.prototype);return e._k=t,e},K=W&&"symbol"==typeof R.iterator?function(t){return"symbol"==typeof t}:function(t){return t instanceof R},J=function(t,e,n){return t===B&&J(N,e,n),b(t),e=w(e,!0),b(n),o(I,e)?(n.enumerable?(o(t,A)&&t[A][e]&&(t[A][e]=!1),n=O(n,{enumerable:x(0,!1)})):(o(t,A)||k(t,A,x(1,{})),t[A][e]=!0),V(t,e,n)):k(t,e,n)},z=function(t,e){b(t);for(var n,r=y(e=m(e)),o=0,i=r.length;i>o;)J(t,n=r[o++],e[n]);return t},Y=function(t,e){return void 0===e?O(t):z(O(t),e)},Q=function(t){var e=F.call(this,t=w(t,!0));return!(this===B&&o(I,t)&&!o(N,t))&&(!(e||!o(this,t)||!o(I,t)||o(this,A)&&this[A][t])||e)},X=function(t,e){if(t=m(t),e=w(e,!0),t!==B||!o(I,e)||o(N,e)){var n=j(t,e);return!n||!o(I,e)||o(t,A)&&t[A][e]||(n.enumerable=!0),n}},Z=function(t){for(var e,n=E(m(t)),r=[],i=0;n.length>i;)o(I,e=n[i++])||e==A||e==c||r.push(e);return r},$=function(t){for(var e,n=t===B,r=E(n?N:m(t)),i=[],u=0;r.length>u;)!o(I,e=r[u++])||n&&!o(B,e)||i.push(I[e]);return i};W||(R=function(){if(this instanceof R)throw TypeError("Symbol is not a constructor!");var t=p(arguments.length>0?arguments[0]:void 0),e=function(n){this===B&&e.call(N,n),o(this,A)&&o(this[A],t)&&(this[A][t]=!1),V(this,t,x(1,n))};return i&&U&&V(B,t,{configurable:!0,set:e}),H(t)},s(R.prototype,"toString",function(){return this._k}),P.f=X,S.f=J,n(61).f=M.f=Z,n(27).f=Q,n(47).f=$,i&&!n(15)&&s(B,"propertyIsEnumerable",Q,!0),d.f=function(t){return H(v(t))}),u(u.G+u.W+u.F*!W,{Symbol:R});for(var tt="hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),et=0;tt.length>et;)v(tt[et++]);for(var nt=L(v.store),rt=0;nt.length>rt;)h(nt[rt++]);u(u.S+u.F*!W,"Symbol",{for:function(t){return o(q,t+="")?q[t]:q[t]=R(t)},keyFor:function(t){if(!K(t))throw TypeError(t+" is not a symbol!");for(var e in q)if(q[e]===t)return e},useSetter:function(){U=!0},useSimple:function(){U=!1}}),u(u.S+u.F*!W,"Object",{create:Y,defineProperty:J,defineProperties:z,getOwnPropertyDescriptor:X,getOwnPropertyNames:Z,getOwnPropertySymbols:$}),T&&u(u.S+u.F*(!W||f(function(){var t=R();return"[null]"!=C([t])||"{}"!=C({a:t})||"{}"!=C(Object(t))})),"JSON",{stringify:function(t){for(var e,n,r=[t],o=1;arguments.length>o;)r.push(arguments[o++]);if(n=e=r[1],(g(e)||void 0!==t)&&!K(t))return _(e)||(e=function(t,e){if("function"==typeof n&&(e=n.call(this,t,e)),!K(e))return e}),r[1]=e,C.apply(T,r)}}),R.prototype[D]||n(11)(R.prototype,D,R.prototype.valueOf),l(R,"Symbol"),l(Math,"Math",!0),l(r.JSON,"JSON",!0)},function(t,e,n){var r=n(22)("meta"),o=n(9),i=n(10),u=n(8).f,s=0,c=Object.isExtensible||function(){return!0},f=!n(13)(function(){return c(Object.preventExtensions({}))}),a=function(t){u(t,r,{value:{i:"O"+ ++s,w:{}}})},l=function(t,e){if(!o(t))return"symbol"==typeof t?t:("string"==typeof t?"S":"P")+t;if(!i(t,r)){if(!c(t))return"F";if(!e)return"E";a(t)}return t[r].i},p=function(t,e){if(!i(t,r)){if(!c(t))return!0;if(!e)return!1;a(t)}return t[r].w},v=function(t){return f&&d.NEED&&c(t)&&!i(t,r)&&a(t),t},d=t.exports={KEY:r,NEED:!1,fastKey:l,getWeak:p,onFreeze:v}},function(t,e,n){var r=n(19),o=n(47),i=n(27);t.exports=function(t){var e=r(t),n=o.f;if(n)for(var u,s=n(t),c=i.f,f=0;s.length>f;)c.call(t,u=s[f++])&&e.push(u);return e}},function(t,e,n){var r=n(16);t.exports=Array.isArray||function(t){return"Array"==r(t)}},function(t,e,n){var r=n(12),o=n(61).f,i={}.toString,u="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],s=function(t){try{return o(t)}catch(t){return u.slice()}};t.exports.f=function(t){return u&&"[object Window]"==i.call(t)?s(t):o(r(t))}},function(t,e,n){n(40)("asyncIterator")},function(t,e,n){n(40)("observable")},,function(t,e,n){n(104),t.exports=n(0).Object.getPrototypeOf},function(t,e,n){var r=n(33),o=n(63);n(50)("getPrototypeOf",function(){return function(t){return o(r(t))}})},function(t,e,n){t.exports={default:n(106),__esModule:!0}},function(t,e,n){n(107),t.exports=n(0).Object.setPrototypeOf},function(t,e,n){var r=n(5);r(r.S,"Object",{setPrototypeOf:n(108).set})},function(t,e,n){var r=n(9),o=n(6),i=function(t,e){if(o(t),!r(e)&&null!==e)throw TypeError(e+": can't set as prototype!")};t.exports={set:Object.setPrototypeOf||("__proto__"in{}?function(t,e,r){try{r=n(17)(Function.call,n(51).f(Object.prototype,"__proto__").set,2),r(t,[]),e=!(t instanceof Array)}catch(t){e=!0}return function(t,n){return i(t,n),e?t.__proto__=n:r(t,n),t}}({},!1):void 0),check:i}},function(t,e,n){t.exports={default:n(110),__esModule:!0}},function(t,e,n){n(111);var r=n(0).Object;t.exports=function(t,e){return r.create(t,e)}},function(t,e,n){var r=n(5);r(r.S,"Object",{create:n(41)})},,,,,,,,,,,,,,,function(t,e,n){"use strict";function _interopRequireDefault(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(e,"__esModule",{value:!0});var r=n(26),o=_interopRequireDefault(r),i=n(3),u=_interopRequireDefault(i),s=n(4),c=_interopRequireDefault(s),f=n(34),a=_interopRequireDefault(f),l=n(35),p=_interopRequireDefault(l),v=n(127),d=_interopRequireDefault(v),h=function(t){function MiniBus(){return(0,u.default)(this,MiniBus),(0,a.default)(this,(MiniBus.__proto__||(0,o.default)(MiniBus)).call(this))}return(0,p.default)(MiniBus,t),(0,c.default)(MiniBus,[{key:"postMessage",value:function(t,e,n){var r=this;return r._genId(t),r._responseCallback(t,e,n),r._onPostMessage(t),t.id}},{key:"_onMessage",value:function(t){var e=this;if(!e._onResponse(t)){var n=e._subscriptions[t.to];n?(e._publishOn(n,t),t.to.startsWith("hyperty")||e._publishOnDefault(t)):e._publishOnDefault(t)}}}]),MiniBus}(d.default);e.default=h,t.exports=e.default},function(t,e,n){"use strict";function _interopRequireDefault(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(e,"__esModule",{value:!0});var r=n(14),o=_interopRequireDefault(r),i=n(3),u=_interopRequireDefault(i),s=n(4),c=_interopRequireDefault(s),f=n(38),a=function(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);return e.default=t,e}(f),l=a.getLogger("Bus"),p=function(){function Bus(){(0,u.default)(this,Bus);var t=this;t._msgId=0,t._subscriptions={},t._responseTimeOut=15e3,t._responseCallbacks={},t._registerExternalListener()}return(0,c.default)(Bus,[{key:"addListener",value:function(t,e){var n=this,r=new v(n._subscriptions,t,e),o=n._subscriptions[t];return o||(o=[],n._subscriptions[t]=o),o.push(r),r}},{key:"addResponseListener",value:function(t,e,n){this._responseCallbacks[t+e]=n}},{key:"removeResponseListener",value:function(t,e){delete this._responseCallbacks[t+e]}},{key:"removeAllListenersOf",value:function(t){delete this._subscriptions[t]}},{key:"bind",value:function(t,e,n){var r=this,o=this;return{thisListener:o.addListener(t,function(t){n.postMessage(t)}),targetListener:n.addListener(e,function(t){o.postMessage(t)}),unbind:function(){r.thisListener.remove(),r.targetListener.remove()}}}},{key:"_publishOnDefault",value:function(t){var e=this._subscriptions["*"];e&&this._publishOn(e,t)}},{key:"_publishOn",value:function(t,e){t.forEach(function(t){t._callback(e)})}},{key:"_responseCallback",value:function(t,e){var n=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],r=this;if(e){var o=t.from+t.id;r._responseCallbacks[o]=e,n&&setTimeout(function(){var e=r._responseCallbacks[o];if(delete r._responseCallbacks[o],e){e({id:t.id,type:"response",body:{code:408,desc:"Response timeout!",value:t}})}},r._responseTimeOut)}}},{key:"_onResponse",value:function(t){var e=this;if("response"===t.type){var n=t.to+t.id,r=e._responseCallbacks[n];if(t.body.code>=200&&delete e._responseCallbacks[n],r)return r(t),!0}return!1}},{key:"_onMessage",value:function(t){var e=this;if(!e._onResponse(t)){var n=e._subscriptions[t.to];n?e._publishOn(n,t):e._publishOnDefault(t)}}},{key:"_genId",value:function(t){t.id&&0!==t.id||(this._msgId++,t.id=this._msgId)}},{key:"postMessage",value:function(t,e){}},{key:"postMessageWithRetries",value:function(t,e,n){var r=this,i=0,u=function(){return new o.default(function(e,o){r.postMessage(t,function(r){408===r.body.code||500===r.body.code?o():(l.info("[Bus.postMessageWithRetries] msg delivered: ",t),n(r),e())})})};!function tryAgain(){u().then(function(){},function(){if(l.warn("[Bus.postMessageWithRetries] Message Bounced (retry "+i+"): '",t),!(i++<e)){var n="[Error] Message Bounced (delivery attempts "+e+"): '";throw new Error(n+t)}tryAgain()})}()}},{key:"_onPostMessage",value:function(t){}},{key:"_registerExternalListener",value:function(){}}]),Bus}(),v=function(){function MsgListener(t,e,n){(0,u.default)(this,MsgListener);var r=this;r._subscriptions=t,r._url=e,r._callback=n}return(0,c.default)(MsgListener,[{key:"remove",value:function(){var t=this,e=t._subscriptions[t._url];if(e){var n=e.indexOf(t);e.splice(n,1),0===e.length&&delete t._subscriptions[t._url]}}},{key:"url",get:function(){return this._url}}]),MsgListener}();e.default=p,t.exports=e.default},,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=n(126),o=function(t){return t&&t.__esModule?t:{default:t}}(r);e.default=o.default,t.exports=e.default}])});
},{}],2:[function(require,module,exports){
// version: 0.14.0
// date: Mon Nov 05 2018 09:55:51 GMT+0000 (Western European Standard Time)
// licence: 
/**
* Copyright 2016 PT Inovação e Sistemas SA
* Copyright 2016 INESC-ID
* Copyright 2016 QUOBIS NETWORKS SL
* Copyright 2016 FRAUNHOFER-GESELLSCHAFT ZUR FOERDERUNG DER ANGEWANDTEN FORSCHUNG E.V
* Copyright 2016 ORANGE SA
* Copyright 2016 Deutsche Telekom AG
* Copyright 2016 Apizee
* Copyright 2016 TECHNISCHE UNIVERSITAT BERLIN
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**/


// version: 0.14.0
// date: Mon Nov 05 2018 09:55:51 GMT+0000 (Western European Standard Time)
// licence: 
/**
* Copyright 2016 PT Inovação e Sistemas SA
* Copyright 2016 INESC-ID
* Copyright 2016 QUOBIS NETWORKS SL
* Copyright 2016 FRAUNHOFER-GESELLSCHAFT ZUR FOERDERUNG DER ANGEWANDTEN FORSCHUNG E.V
* Copyright 2016 ORANGE SA
* Copyright 2016 Deutsche Telekom AG
* Copyright 2016 Apizee
* Copyright 2016 TECHNISCHE UNIVERSITAT BERLIN
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**/


!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("sandbox",[],t):"object"==typeof exports?exports.sandbox=t():e.sandbox=t()}("undefined"!=typeof self?self:this,function(){return function(e){function __webpack_require__(r){if(t[r])return t[r].exports;var n=t[r]={i:r,l:!1,exports:{}};return e[r].call(n.exports,n,n.exports,__webpack_require__),n.l=!0,n.exports}var t={};return __webpack_require__.m=e,__webpack_require__.c=t,__webpack_require__.d=function(e,t,r){__webpack_require__.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:r})},__webpack_require__.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return __webpack_require__.d(t,"a",t),t},__webpack_require__.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},__webpack_require__.p="",__webpack_require__(__webpack_require__.s=154)}([function(e,t){var r=e.exports={version:"2.5.7"};"number"==typeof __e&&(__e=r)},function(e,t){var r=e.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=r)},function(e,t,r){var n=r(31)("wks"),o=r(22),i=r(1).Symbol,a="function"==typeof i;(e.exports=function(e){return n[e]||(n[e]=a&&i[e]||(a?i:o)("Symbol."+e))}).store=n},function(e,t,r){"use strict";t.__esModule=!0,t.default=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}},function(e,t,r){"use strict";t.__esModule=!0;var n=r(64),o=function(e){return e&&e.__esModule?e:{default:e}}(n);t.default=function(){function defineProperties(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),(0,o.default)(e,n.key,n)}}return function(e,t,r){return t&&defineProperties(e.prototype,t),r&&defineProperties(e,r),e}}()},function(e,t,r){var n=r(1),o=r(0),i=r(17),a=r(11),s=r(10),u=function(e,t,r){var c,l,d,f=e&u.F,p=e&u.G,y=e&u.S,v=e&u.P,h=e&u.B,_=e&u.W,b=p?o:o[t]||(o[t]={}),m=b.prototype,g=p?n:y?n[t]:(n[t]||{}).prototype;p&&(r=t);for(c in r)(l=!f&&g&&void 0!==g[c])&&s(b,c)||(d=l?g[c]:r[c],b[c]=p&&"function"!=typeof g[c]?r[c]:h&&l?i(d,n):_&&g[c]==d?function(e){var t=function(t,r,n){if(this instanceof e){switch(arguments.length){case 0:return new e;case 1:return new e(t);case 2:return new e(t,r)}return new e(t,r,n)}return e.apply(this,arguments)};return t.prototype=e.prototype,t}(d):v&&"function"==typeof d?i(Function.call,d):d,v&&((b.virtual||(b.virtual={}))[c]=d,e&u.R&&m&&!m[c]&&a(m,c,d)))};u.F=1,u.G=2,u.S=4,u.P=8,u.B=16,u.W=32,u.U=64,u.R=128,e.exports=u},function(e,t,r){var n=r(9);e.exports=function(e){if(!n(e))throw TypeError(e+" is not an object!");return e}},function(e,t,r){e.exports=!r(13)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},function(e,t,r){var n=r(6),o=r(43),i=r(29),a=Object.defineProperty;t.f=r(7)?Object.defineProperty:function(e,t,r){if(n(e),t=i(t,!0),n(r),o)try{return a(e,t,r)}catch(e){}if("get"in r||"set"in r)throw TypeError("Accessors not supported!");return"value"in r&&(e[t]=r.value),e}},function(e,t){e.exports=function(e){return"object"==typeof e?null!==e:"function"==typeof e}},function(e,t){var r={}.hasOwnProperty;e.exports=function(e,t){return r.call(e,t)}},function(e,t,r){var n=r(8),o=r(21);e.exports=r(7)?function(e,t,r){return n.f(e,t,o(1,r))}:function(e,t,r){return e[t]=r,e}},function(e,t,r){var n=r(62),o=r(25);e.exports=function(e){return n(o(e))}},function(e,t){e.exports=function(e){try{return!!e()}catch(e){return!0}}},function(e,t,r){e.exports={default:r(71),__esModule:!0}},function(e,t){e.exports=!0},function(e,t){var r={}.toString;e.exports=function(e){return r.call(e).slice(8,-1)}},function(e,t,r){var n=r(20);e.exports=function(e,t,r){if(n(e),void 0===t)return e;switch(r){case 1:return function(r){return e.call(t,r)};case 2:return function(r,n){return e.call(t,r,n)};case 3:return function(r,n,o){return e.call(t,r,n,o)}}return function(){return e.apply(t,arguments)}}},function(e,t){e.exports={}},function(e,t,r){var n=r(44),o=r(32);e.exports=Object.keys||function(e){return n(e,o)}},function(e,t){e.exports=function(e){if("function"!=typeof e)throw TypeError(e+" is not a function!");return e}},function(e,t){e.exports=function(e,t){return{enumerable:!(1&e),configurable:!(2&e),writable:!(4&e),value:t}}},function(e,t){var r=0,n=Math.random();e.exports=function(e){return"Symbol(".concat(void 0===e?"":e,")_",(++r+n).toString(36))}},function(e,t,r){var n=r(8).f,o=r(10),i=r(2)("toStringTag");e.exports=function(e,t,r){e&&!o(e=r?e:e.prototype,i)&&n(e,i,{configurable:!0,value:t})}},function(e,t){var r=Math.ceil,n=Math.floor;e.exports=function(e){return isNaN(e=+e)?0:(e>0?n:r)(e)}},function(e,t){e.exports=function(e){if(void 0==e)throw TypeError("Can't call method on  "+e);return e}},function(e,t,r){e.exports={default:r(103),__esModule:!0}},function(e,t){t.f={}.propertyIsEnumerable},function(e,t,r){var n=r(9),o=r(1).document,i=n(o)&&n(o.createElement);e.exports=function(e){return i?o.createElement(e):{}}},function(e,t,r){var n=r(9);e.exports=function(e,t){if(!n(e))return e;var r,o;if(t&&"function"==typeof(r=e.toString)&&!n(o=r.call(e)))return o;if("function"==typeof(r=e.valueOf)&&!n(o=r.call(e)))return o;if(!t&&"function"==typeof(r=e.toString)&&!n(o=r.call(e)))return o;throw TypeError("Can't convert object to primitive value")}},function(e,t,r){var n=r(31)("keys"),o=r(22);e.exports=function(e){return n[e]||(n[e]=o(e))}},function(e,t,r){var n=r(0),o=r(1),i=o["__core-js_shared__"]||(o["__core-js_shared__"]={});(e.exports=function(e,t){return i[e]||(i[e]=void 0!==t?t:{})})("versions",[]).push({version:n.version,mode:r(15)?"pure":"global",copyright:"© 2018 Denis Pushkarev (zloirock.ru)"})},function(e,t){e.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},function(e,t,r){var n=r(25);e.exports=function(e){return Object(n(e))}},function(e,t,r){"use strict";t.__esModule=!0;var n=r(60),o=function(e){return e&&e.__esModule?e:{default:e}}(n);t.default=function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!==(void 0===t?"undefined":(0,o.default)(t))&&"function"!=typeof t?e:t}},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}t.__esModule=!0;var n=r(105),o=_interopRequireDefault(n),i=r(109),a=_interopRequireDefault(i),s=r(60),u=_interopRequireDefault(s);t.default=function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+(void 0===t?"undefined":(0,u.default)(t)));e.prototype=(0,a.default)(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(o.default?(0,o.default)(e,t):e.__proto__=t)}},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function divideURL(e){function recurse(e){var t=/([a-zA-Z-]*)(:\/\/(?:\.)?|:)([-a-zA-Z0-9@:%._+~#=]{2,256})([-a-zA-Z0-9@:%._+~#=\/]*)/gi;return e.replace(t,"$1,$3,$4").split(",")}var t=recurse(e);if(t[0]===e&&!t[0].includes("@")){return{type:"",domain:e,identity:""}}if(t[0]===e&&t[0].includes("@")){t=recurse((t[0]===e?"smtp":t[0])+"://"+t[0])}return t[1].includes("@")&&(t[2]=t[0]+"://"+t[1],t[1]=t[1].substr(t[1].indexOf("@")+1)),{type:t[0],domain:t[1],identity:t[2]}}function emptyObject(e){return!((0,a.default)(e).length>0)}function secondsSinceEpoch(){return Math.floor(Date.now()/1e3)}function deepClone(e){if(e)return JSON.parse((0,o.default)(e))}function removePathFromURL(e){var t=e.split("/");return t[0]+"//"+t[2]+"/"+t[3]}function getUserURLFromEmail(e){var t=e.indexOf("@");return"user://"+e.substring(t+1,e.length)+"/"+e.substring(0,t)}function getUserEmailFromURL(e){var t=divideURL(e);return t.identity.replace("/","")+"@"+t.domain}function convertToUserURL(e){if("user://"===e.substring(0,7)){var t=divideURL(e);if(t.domain&&t.identity)return e;throw"userURL with wrong format"}return getUserURLFromEmail(e)}function isDataObjectURL(e){var t=["domain-idp","runtime","domain","hyperty"],r=e.split("://"),n=r[0];return-1===t.indexOf(n)}function isLegacy(e){return e.split("@").length>1}function isURL(e){return e.split("/").length>=3}function isUserURL(e){return"user"===divideURL(e).type}function isHypertyURL(e){return"hyperty"===divideURL(e).type}function getConfigurationResources(e,t,r){return e[t][r]}function buildURL(e,t,r,n){var i=arguments.length>4&&void 0!==arguments[4]&&arguments[4],a=e[t],s=void 0;if(!a.hasOwnProperty(r))throw Error("The configuration "+(0,o.default)(a,"",2)+" don't have the "+r+" resource you are looking for");var u=a[r];return n?(s=u.prefix+e.domain+u.suffix+n,u.hasOwnProperty("fallback")&&i&&(s=u.fallback.indexOf("%domain%")?u.fallback.replace(/(%domain%)/g,e.domain)+n:u.fallback+n)):s=u.prefix+e.domain+u.suffix,s}function generateGUID(){function s4(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return s4()+s4()+"-"+s4()+"-"+s4()+"-"+s4()+"-"+s4()+s4()+s4()}function getUserIdentityDomain(e){var t=divideURL(e),r=t.domain.split("."),n=r.length;return 1==n?r[n-1]:r[n-2]+"."+r[n-1]}function isBackendServiceURL(e){var t=divideURL(e),r=t.domain.split("."),n=["domain","global","domain-idp"],o=["registry","msg-node"],i=void 0;return r.length>1&&(i=r.filter(function(e){return-1!==o.indexOf(e)})[0]),!(!i||-1===o.indexOf(i))||!!t.type&&-1!==n.indexOf(t.type)}function divideEmail(e){var t=e.indexOf("@");return{username:e.substring(0,t),domain:e.substring(t+1,e.length)}}function assign(e,t,r){e||(e={}),"string"==typeof t&&(t=parseAttributes(t));for(var n=t.length-1,o=0;o<n;++o){var i=t[o];i in e||(e[i]={}),e=e[i]}e[t[n]]=r}function splitObjectURL(e){var t=e.split("/"),r=t[0]+"//"+t[2]+"/"+t[3],n=t[5],o={url:r,resource:n};return o}function checkAttribute(e){var t=/((([a-zA-Z]+):\/\/([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})\/[a-zA-Z0-9.]+@[a-zA-Z0-9]+(-)?[a-zA-Z0-9]+(\.)?[a-zA-Z0-9]{2,10}?\.[a-zA-Z]{2,10})(.+(?=.identity))?/gm,r=[],n=[];if(null==e.match(t))n=e.split(".");else{for(var o=void 0;null!==(o=t.exec(e));)o.index===t.lastIndex&&t.lastIndex++,o.forEach(function(e,t){0===t&&r.push(e)});var i=void 0;r.forEach(function(t){i=e.replace(t,"*-*"),n=i.split(".").map(function(e){return"*-*"===e?t:e})})}return n}function parseAttributes(e){var t=/([0-9a-zA-Z][-\w]*):\/\//g;if(e.includes("://")){var r=e.split(t)[0],n=r.split("."),o=e.replace(r,"");if(e.includes("identity")){var i=o.split("identity.");o=i[0].slice(".",-1),i=i[1].split("."),n.push(o,"identity"),n=n.concat(i)}else n.push(o);return n.filter(Boolean)}return e.split(".")}function isEmpty(e){for(var t in e)if(e.hasOwnProperty(t))return!1;return(0,o.default)(e)===(0,o.default)({})}function chatkeysToStringCloner(e){var t={},r=(0,a.default)(e);if(r)try{for(var n=0;n<r.length;n++){var o=r[n];t[o]={},t[o].sessionKey=e[o].sessionKey.toString(),t[o].isToEncrypt=e[o].isToEncrypt}}catch(e){}return t}function chatkeysToArrayCloner(e){var t={},r=(0,a.default)(e);if(r)try{for(var n=0;n<r.length;n++){var o=r[n];t[o]={};var i=JSON.parse("["+e[o].sessionKey+"]");t[o].sessionKey=new Uint8Array(i),t[o].isToEncrypt=e[o].isToEncrypt}}catch(e){}return t}function parseMessageURL(e){var t=e.split("/");return t.length<=6?t[0]+"//"+t[2]+"/"+t[3]:t[0]+"//"+t[2]+"/"+t[3]+"/"+t[4]}function availableSpace(e,t){var r=(e/t).toFixed(2);return{quota:t,usage:e,percent:Number(r)}}function encode(e){try{var t=stringify(e);return btoa(t)}catch(e){throw e}}function decode(e){try{return JSON.parse(atob(e))}catch(e){throw e}}function decodeToUint8Array(e){try{return new Uint8Array(decode(e))}catch(e){throw e}}function stringify(e){try{return e.constructor===Uint8Array?"["+e.toString()+"]":(0,o.default)(e)}catch(e){throw e}}function parse(e){try{return JSON.parse(e)}catch(e){throw e}}function parseToUint8Array(e){try{return new Uint8Array(parse(e))}catch(e){throw e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(65),o=_interopRequireDefault(n),i=r(48),a=_interopRequireDefault(i);t.divideURL=divideURL,t.emptyObject=emptyObject,t.secondsSinceEpoch=secondsSinceEpoch,t.deepClone=deepClone,t.removePathFromURL=removePathFromURL,t.getUserURLFromEmail=getUserURLFromEmail,t.getUserEmailFromURL=getUserEmailFromURL,t.convertToUserURL=convertToUserURL,t.isDataObjectURL=isDataObjectURL,t.isLegacy=isLegacy,t.isURL=isURL,t.isUserURL=isUserURL,t.isHypertyURL=isHypertyURL,t.getConfigurationResources=getConfigurationResources,t.buildURL=buildURL,t.generateGUID=generateGUID,t.getUserIdentityDomain=getUserIdentityDomain,t.isBackendServiceURL=isBackendServiceURL,t.divideEmail=divideEmail,t.assign=assign,t.splitObjectURL=splitObjectURL,t.checkAttribute=checkAttribute,t.parseAttributes=parseAttributes,t.isEmpty=isEmpty,t.chatkeysToStringCloner=chatkeysToStringCloner,t.chatkeysToArrayCloner=chatkeysToArrayCloner,t.parseMessageURL=parseMessageURL,t.availableSpace=availableSpace,t.encode=encode,t.decode=decode,t.decodeToUint8Array=decodeToUint8Array,t.stringify=stringify,t.parse=parse,t.parseToUint8Array=parseToUint8Array},function(e,t,r){"use strict";function PromiseCapability(e){var t,r;this.promise=new e(function(e,n){if(void 0!==t||void 0!==r)throw TypeError("Bad Promise constructor");t=e,r=n}),this.resolve=n(t),this.reject=n(r)}var n=r(20);e.exports.f=function(e){return new PromiseCapability(e)}},function(e,t,r){var n,o;!function(i,a){"use strict";n=a,void 0!==(o="function"==typeof n?n.call(t,r,t,e):n)&&(e.exports=o)}(0,function(){"use strict";function bindMethod(e,t){var r=e[t];if("function"==typeof r.bind)return r.bind(e);try{return Function.prototype.bind.call(r,e)}catch(t){return function(){return Function.prototype.apply.apply(r,[e,arguments])}}}function realMethod(r){return"debug"===r&&(r="log"),typeof console!==t&&(void 0!==console[r]?bindMethod(console,r):void 0!==console.log?bindMethod(console,"log"):e)}function replaceLoggingMethods(t,n){for(var o=0;o<r.length;o++){var i=r[o];this[i]=o<t?e:this.methodFactory(i,t,n)}this.log=this.debug}function enableLoggingWhenConsoleArrives(e,r,n){return function(){typeof console!==t&&(replaceLoggingMethods.call(this,r,n),this[e].apply(this,arguments))}}function defaultMethodFactory(e,t,r){return realMethod(e)||enableLoggingWhenConsoleArrives.apply(this,arguments)}function Logger(e,n,o){function persistLevelIfPossible(e){var n=(r[e]||"silent").toUpperCase();if(typeof window!==t){try{return void(window.localStorage[s]=n)}catch(e){}try{window.document.cookie=encodeURIComponent(s)+"="+n+";"}catch(e){}}}function getPersistedLevel(){var e;if(typeof window!==t){try{e=window.localStorage[s]}catch(e){}if(typeof e===t)try{var r=window.document.cookie,n=r.indexOf(encodeURIComponent(s)+"=");-1!==n&&(e=/^([^;]+)/.exec(r.slice(n))[1])}catch(e){}return void 0===a.levels[e]&&(e=void 0),e}}var i,a=this,s="loglevel";e&&(s+=":"+e),a.name=e,a.levels={TRACE:0,DEBUG:1,INFO:2,WARN:3,ERROR:4,SILENT:5},a.methodFactory=o||defaultMethodFactory,a.getLevel=function(){return i},a.setLevel=function(r,n){if("string"==typeof r&&void 0!==a.levels[r.toUpperCase()]&&(r=a.levels[r.toUpperCase()]),!("number"==typeof r&&r>=0&&r<=a.levels.SILENT))throw"log.setLevel() called with invalid level: "+r;if(i=r,!1!==n&&persistLevelIfPossible(r),replaceLoggingMethods.call(a,r,e),typeof console===t&&r<a.levels.SILENT)return"No console available for logging"},a.setDefaultLevel=function(e){getPersistedLevel()||a.setLevel(e,!1)},a.enableAll=function(e){a.setLevel(a.levels.TRACE,e)},a.disableAll=function(e){a.setLevel(a.levels.SILENT,e)};var u=getPersistedLevel();null==u&&(u=null==n?"WARN":n),a.setLevel(u,!1)}var e=function(){},t="undefined",r=["trace","debug","info","warn","error"],n=new Logger,o={};n.getLogger=function(e){if("string"!=typeof e||""===e)throw new TypeError("You must supply a name when creating a logger.");var t=o[e];return t||(t=o[e]=new Logger(e,n.getLevel(),n.methodFactory)),t};var i=typeof window!==t?window.log:void 0;return n.noConflict=function(){return typeof window!==t&&window.log===n&&(window.log=i),n},n.getLoggers=function(){return o},n})},function(e,t,r){t.f=r(2)},function(e,t,r){var n=r(1),o=r(0),i=r(15),a=r(39),s=r(8).f;e.exports=function(e){var t=o.Symbol||(o.Symbol=i?{}:n.Symbol||{});"_"==e.charAt(0)||e in t||s(t,e,{value:a.f(e)})}},function(e,t,r){var n=r(6),o=r(74),i=r(32),a=r(30)("IE_PROTO"),s=function(){},u=function(){var e,t=r(28)("iframe"),n=i.length;for(t.style.display="none",r(55).appendChild(t),t.src="javascript:",e=t.contentWindow.document,e.open(),e.write("<script>document.F=Object<\/script>"),e.close(),u=e.F;n--;)delete u.prototype[i[n]];return u()};e.exports=Object.create||function(e,t){var r;return null!==e?(s.prototype=n(e),r=new s,s.prototype=null,r[a]=e):r=u(),void 0===t?r:o(r,t)}},function(e,t,r){"use strict";var n=r(72)(!0);r(53)(String,"String",function(e){this._t=String(e),this._i=0},function(){var e,t=this._t,r=this._i;return r>=t.length?{value:void 0,done:!0}:(e=n(t,r),this._i+=e.length,{value:e,done:!1})})},function(e,t,r){e.exports=!r(7)&&!r(13)(function(){return 7!=Object.defineProperty(r(28)("div"),"a",{get:function(){return 7}}).a})},function(e,t,r){var n=r(10),o=r(12),i=r(66)(!1),a=r(30)("IE_PROTO");e.exports=function(e,t){var r,s=o(e),u=0,c=[];for(r in s)r!=a&&n(s,r)&&c.push(r);for(;t.length>u;)n(s,r=t[u++])&&(~i(c,r)||c.push(r));return c}},function(e,t,r){var n=r(24),o=Math.min;e.exports=function(e){return e>0?o(n(e),9007199254740991):0}},function(e,t,r){r(75);for(var n=r(1),o=r(11),i=r(18),a=r(2)("toStringTag"),s="CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,TextTrackList,TouchList".split(","),u=0;u<s.length;u++){var c=s[u],l=n[c],d=l&&l.prototype;d&&!d[a]&&o(d,a,c),i[c]=i.Array}},function(e,t){t.f=Object.getOwnPropertySymbols},function(e,t,r){e.exports={default:r(113),__esModule:!0}},function(e,t,r){var n=r(16),o=r(2)("toStringTag"),i="Arguments"==n(function(){return arguments}()),a=function(e,t){try{return e[t]}catch(e){}};e.exports=function(e){var t,r,s;return void 0===e?"Undefined":null===e?"Null":"string"==typeof(r=a(t=Object(e),o))?r:i?n(t):"Object"==(s=n(t))&&"function"==typeof t.callee?"Arguments":s}},function(e,t,r){var n=r(5),o=r(0),i=r(13);e.exports=function(e,t){var r=(o.Object||{})[e]||Object[e],a={};a[e]=t(r),n(n.S+n.F*i(function(){r(1)}),"Object",a)}},function(e,t,r){var n=r(27),o=r(21),i=r(12),a=r(29),s=r(10),u=r(43),c=Object.getOwnPropertyDescriptor;t.f=r(7)?c:function(e,t){if(e=i(e),t=a(t,!0),u)try{return c(e,t)}catch(e){}if(s(e,t))return o(!n.f.call(e,t),e[t])}},function(e,t){},function(e,t,r){"use strict";var n=r(15),o=r(5),i=r(54),a=r(11),s=r(18),u=r(73),c=r(23),l=r(63),d=r(2)("iterator"),f=!([].keys&&"next"in[].keys()),p=function(){return this};e.exports=function(e,t,r,y,v,h,_){u(r,t,y);var b,m,g,R=function(e){if(!f&&e in j)return j[e];switch(e){case"keys":case"values":return function(){return new r(this,e)}}return function(){return new r(this,e)}},O=t+" Iterator",w="values"==v,D=!1,j=e.prototype,k=j[d]||j["@@iterator"]||v&&j[v],L=k||R(v),M=v?w?R("entries"):L:void 0,U="Array"==t?j.entries||k:k;if(U&&(g=l(U.call(new e)))!==Object.prototype&&g.next&&(c(g,O,!0),n||"function"==typeof g[d]||a(g,d,p)),w&&k&&"values"!==k.name&&(D=!0,L=function(){return k.call(this)}),n&&!_||!f&&!D&&j[d]||a(j,d,L),s[t]=L,s[O]=p,v)if(b={values:w?L:R("values"),keys:h?L:R("keys"),entries:M},_)for(m in b)m in j||i(j,m,b[m]);else o(o.P+o.F*(f||D),t,b);return b}},function(e,t,r){e.exports=r(11)},function(e,t,r){var n=r(1).document;e.exports=n&&n.documentElement},function(e,t,r){var n=r(6),o=r(20),i=r(2)("species");e.exports=function(e,t){var r,a=n(e).constructor;return void 0===a||void 0==(r=n(a)[i])?t:o(r)}},function(e,t,r){var n,o,i,a=r(17),s=r(83),u=r(55),c=r(28),l=r(1),d=l.process,f=l.setImmediate,p=l.clearImmediate,y=l.MessageChannel,v=l.Dispatch,h=0,_={},b=function(){var e=+this;if(_.hasOwnProperty(e)){var t=_[e];delete _[e],t()}},m=function(e){b.call(e.data)};f&&p||(f=function(e){for(var t=[],r=1;arguments.length>r;)t.push(arguments[r++]);return _[++h]=function(){s("function"==typeof e?e:Function(e),t)},n(h),h},p=function(e){delete _[e]},"process"==r(16)(d)?n=function(e){d.nextTick(a(b,e,1))}:v&&v.now?n=function(e){v.now(a(b,e,1))}:y?(o=new y,i=o.port2,o.port1.onmessage=m,n=a(i.postMessage,i,1)):l.addEventListener&&"function"==typeof postMessage&&!l.importScripts?(n=function(e){l.postMessage(e+"","*")},l.addEventListener("message",m,!1)):n="onreadystatechange"in c("script")?function(e){u.appendChild(c("script")).onreadystatechange=function(){u.removeChild(this),b.call(e)}}:function(e){setTimeout(a(b,e,1),0)}),e.exports={set:f,clear:p}},function(e,t){e.exports=function(e){try{return{e:!1,v:e()}}catch(e){return{e:!0,v:e}}}},function(e,t,r){var n=r(6),o=r(9),i=r(37);e.exports=function(e,t){if(n(e),o(t)&&t.constructor===e)return t;var r=i.f(e);return(0,r.resolve)(t),r.promise}},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}t.__esModule=!0;var n=r(91),o=_interopRequireDefault(n),i=r(93),a=_interopRequireDefault(i),s="function"==typeof a.default&&"symbol"==typeof o.default?function(e){return typeof e}:function(e){return e&&"function"==typeof a.default&&e.constructor===a.default&&e!==a.default.prototype?"symbol":typeof e};t.default="function"==typeof a.default&&"symbol"===s(o.default)?function(e){return void 0===e?"undefined":s(e)}:function(e){return e&&"function"==typeof a.default&&e.constructor===a.default&&e!==a.default.prototype?"symbol":void 0===e?"undefined":s(e)}},function(e,t,r){var n=r(44),o=r(32).concat("length","prototype");t.f=Object.getOwnPropertyNames||function(e){return n(e,o)}},function(e,t,r){var n=r(16);e.exports=Object("z").propertyIsEnumerable(0)?Object:function(e){return"String"==n(e)?e.split(""):Object(e)}},function(e,t,r){var n=r(10),o=r(33),i=r(30)("IE_PROTO"),a=Object.prototype;e.exports=Object.getPrototypeOf||function(e){return e=o(e),n(e,i)?e[i]:"function"==typeof e.constructor&&e instanceof e.constructor?e.constructor.prototype:e instanceof Object?a:null}},function(e,t,r){e.exports={default:r(68),__esModule:!0}},function(e,t,r){e.exports={default:r(112),__esModule:!0}},function(e,t,r){var n=r(12),o=r(45),i=r(67);e.exports=function(e){return function(t,r,a){var s,u=n(t),c=o(u.length),l=i(a,c);if(e&&r!=r){for(;c>l;)if((s=u[l++])!=s)return!0}else for(;c>l;l++)if((e||l in u)&&u[l]===r)return e||l||0;return!e&&-1}}},function(e,t,r){var n=r(24),o=Math.max,i=Math.min;e.exports=function(e,t){return e=n(e),e<0?o(e+t,0):i(e,t)}},function(e,t,r){r(69);var n=r(0).Object;e.exports=function(e,t,r){return n.defineProperty(e,t,r)}},function(e,t,r){var n=r(5);n(n.S+n.F*!r(7),"Object",{defineProperty:r(8).f})},function(e,t,r){var n=r(49),o=r(2)("iterator"),i=r(18);e.exports=r(0).getIteratorMethod=function(e){if(void 0!=e)return e[o]||e["@@iterator"]||i[n(e)]}},function(e,t,r){r(52),r(42),r(46),r(78),r(89),r(90),e.exports=r(0).Promise},function(e,t,r){var n=r(24),o=r(25);e.exports=function(e){return function(t,r){var i,a,s=String(o(t)),u=n(r),c=s.length;return u<0||u>=c?e?"":void 0:(i=s.charCodeAt(u),i<55296||i>56319||u+1===c||(a=s.charCodeAt(u+1))<56320||a>57343?e?s.charAt(u):i:e?s.slice(u,u+2):a-56320+(i-55296<<10)+65536)}}},function(e,t,r){"use strict";var n=r(41),o=r(21),i=r(23),a={};r(11)(a,r(2)("iterator"),function(){return this}),e.exports=function(e,t,r){e.prototype=n(a,{next:o(1,r)}),i(e,t+" Iterator")}},function(e,t,r){var n=r(8),o=r(6),i=r(19);e.exports=r(7)?Object.defineProperties:function(e,t){o(e);for(var r,a=i(t),s=a.length,u=0;s>u;)n.f(e,r=a[u++],t[r]);return e}},function(e,t,r){"use strict";var n=r(76),o=r(77),i=r(18),a=r(12);e.exports=r(53)(Array,"Array",function(e,t){this._t=a(e),this._i=0,this._k=t},function(){var e=this._t,t=this._k,r=this._i++;return!e||r>=e.length?(this._t=void 0,o(1)):"keys"==t?o(0,r):"values"==t?o(0,e[r]):o(0,[r,e[r]])},"values"),i.Arguments=i.Array,n("keys"),n("values"),n("entries")},function(e,t){e.exports=function(){}},function(e,t){e.exports=function(e,t){return{value:t,done:!!e}}},function(e,t,r){"use strict";var n,o,i,a,s=r(15),u=r(1),c=r(17),l=r(49),d=r(5),f=r(9),p=r(20),y=r(79),v=r(80),h=r(56),_=r(57).set,b=r(84)(),m=r(37),g=r(58),R=r(85),O=r(59),w=u.TypeError,D=u.process,j=D&&D.versions,k=j&&j.v8||"",L=u.Promise,M="process"==l(D),U=function(){},C=o=m.f,x=!!function(){try{var e=L.resolve(1),t=(e.constructor={})[r(2)("species")]=function(e){e(U,U)};return(M||"function"==typeof PromiseRejectionEvent)&&e.then(U)instanceof t&&0!==k.indexOf("6.6")&&-1===R.indexOf("Chrome/66")}catch(e){}}(),P=function(e){var t;return!(!f(e)||"function"!=typeof(t=e.then))&&t},E=function(e,t){if(!e._n){e._n=!0;var r=e._c;b(function(){for(var n=e._v,o=1==e._s,i=0;r.length>i;)!function(t){var r,i,a,s=o?t.ok:t.fail,u=t.resolve,c=t.reject,l=t.domain;try{s?(o||(2==e._h&&I(e),e._h=1),!0===s?r=n:(l&&l.enter(),r=s(n),l&&(l.exit(),a=!0)),r===t.promise?c(w("Promise-chain cycle")):(i=P(r))?i.call(r,u,c):u(r)):c(n)}catch(e){l&&!a&&l.exit(),c(e)}}(r[i++]);e._c=[],e._n=!1,t&&!e._h&&S(e)})}},S=function(e){_.call(u,function(){var t,r,n,o=e._v,i=q(e);if(i&&(t=g(function(){M?D.emit("unhandledRejection",o,e):(r=u.onunhandledrejection)?r({promise:e,reason:o}):(n=u.console)&&n.error&&n.error("Unhandled promise rejection",o)}),e._h=M||q(e)?2:1),e._a=void 0,i&&t.e)throw t.v})},q=function(e){return 1!==e._h&&0===(e._a||e._c).length},I=function(e){_.call(u,function(){var t;M?D.emit("rejectionHandled",e):(t=u.onrejectionhandled)&&t({promise:e,reason:e._v})})},T=function(e){var t=this;t._d||(t._d=!0,t=t._w||t,t._v=e,t._s=2,t._a||(t._a=t._c.slice()),E(t,!0))},H=function(e){var t,r=this;if(!r._d){r._d=!0,r=r._w||r;try{if(r===e)throw w("Promise can't be resolved itself");(t=P(e))?b(function(){var n={_w:r,_d:!1};try{t.call(e,c(H,n,1),c(T,n,1))}catch(e){T.call(n,e)}}):(r._v=e,r._s=1,E(r,!1))}catch(e){T.call({_w:r,_d:!1},e)}}};x||(L=function(e){y(this,L,"Promise","_h"),p(e),n.call(this);try{e(c(H,this,1),c(T,this,1))}catch(e){T.call(this,e)}},n=function(e){this._c=[],this._a=void 0,this._s=0,this._d=!1,this._v=void 0,this._h=0,this._n=!1},n.prototype=r(86)(L.prototype,{then:function(e,t){var r=C(h(this,L));return r.ok="function"!=typeof e||e,r.fail="function"==typeof t&&t,r.domain=M?D.domain:void 0,this._c.push(r),this._a&&this._a.push(r),this._s&&E(this,!1),r.promise},catch:function(e){return this.then(void 0,e)}}),i=function(){var e=new n;this.promise=e,this.resolve=c(H,e,1),this.reject=c(T,e,1)},m.f=C=function(e){return e===L||e===a?new i(e):o(e)}),d(d.G+d.W+d.F*!x,{Promise:L}),r(23)(L,"Promise"),r(87)("Promise"),a=r(0).Promise,d(d.S+d.F*!x,"Promise",{reject:function(e){var t=C(this);return(0,t.reject)(e),t.promise}}),d(d.S+d.F*(s||!x),"Promise",{resolve:function(e){return O(s&&this===a?L:this,e)}}),d(d.S+d.F*!(x&&r(88)(function(e){L.all(e).catch(U)})),"Promise",{all:function(e){var t=this,r=C(t),n=r.resolve,o=r.reject,i=g(function(){var r=[],i=0,a=1;v(e,!1,function(e){var s=i++,u=!1;r.push(void 0),a++,t.resolve(e).then(function(e){u||(u=!0,r[s]=e,--a||n(r))},o)}),--a||n(r)});return i.e&&o(i.v),r.promise},race:function(e){var t=this,r=C(t),n=r.reject,o=g(function(){v(e,!1,function(e){t.resolve(e).then(r.resolve,n)})});return o.e&&n(o.v),r.promise}})},function(e,t){e.exports=function(e,t,r,n){if(!(e instanceof t)||void 0!==n&&n in e)throw TypeError(r+": incorrect invocation!");return e}},function(e,t,r){var n=r(17),o=r(81),i=r(82),a=r(6),s=r(45),u=r(70),c={},l={},t=e.exports=function(e,t,r,d,f){var p,y,v,h,_=f?function(){return e}:u(e),b=n(r,d,t?2:1),m=0;if("function"!=typeof _)throw TypeError(e+" is not iterable!");if(i(_)){for(p=s(e.length);p>m;m++)if((h=t?b(a(y=e[m])[0],y[1]):b(e[m]))===c||h===l)return h}else for(v=_.call(e);!(y=v.next()).done;)if((h=o(v,b,y.value,t))===c||h===l)return h};t.BREAK=c,t.RETURN=l},function(e,t,r){var n=r(6);e.exports=function(e,t,r,o){try{return o?t(n(r)[0],r[1]):t(r)}catch(t){var i=e.return;throw void 0!==i&&n(i.call(e)),t}}},function(e,t,r){var n=r(18),o=r(2)("iterator"),i=Array.prototype;e.exports=function(e){return void 0!==e&&(n.Array===e||i[o]===e)}},function(e,t){e.exports=function(e,t,r){var n=void 0===r;switch(t.length){case 0:return n?e():e.call(r);case 1:return n?e(t[0]):e.call(r,t[0]);case 2:return n?e(t[0],t[1]):e.call(r,t[0],t[1]);case 3:return n?e(t[0],t[1],t[2]):e.call(r,t[0],t[1],t[2]);case 4:return n?e(t[0],t[1],t[2],t[3]):e.call(r,t[0],t[1],t[2],t[3])}return e.apply(r,t)}},function(e,t,r){var n=r(1),o=r(57).set,i=n.MutationObserver||n.WebKitMutationObserver,a=n.process,s=n.Promise,u="process"==r(16)(a);e.exports=function(){var e,t,r,c=function(){var n,o;for(u&&(n=a.domain)&&n.exit();e;){o=e.fn,e=e.next;try{o()}catch(n){throw e?r():t=void 0,n}}t=void 0,n&&n.enter()};if(u)r=function(){a.nextTick(c)};else if(!i||n.navigator&&n.navigator.standalone)if(s&&s.resolve){var l=s.resolve(void 0);r=function(){l.then(c)}}else r=function(){o.call(n,c)};else{var d=!0,f=document.createTextNode("");new i(c).observe(f,{characterData:!0}),r=function(){f.data=d=!d}}return function(n){var o={fn:n,next:void 0};t&&(t.next=o),e||(e=o,r()),t=o}}},function(e,t,r){var n=r(1),o=n.navigator;e.exports=o&&o.userAgent||""},function(e,t,r){var n=r(11);e.exports=function(e,t,r){for(var o in t)r&&e[o]?e[o]=t[o]:n(e,o,t[o]);return e}},function(e,t,r){"use strict";var n=r(1),o=r(0),i=r(8),a=r(7),s=r(2)("species");e.exports=function(e){var t="function"==typeof o[e]?o[e]:n[e];a&&t&&!t[s]&&i.f(t,s,{configurable:!0,get:function(){return this}})}},function(e,t,r){var n=r(2)("iterator"),o=!1;try{var i=[7][n]();i.return=function(){o=!0},Array.from(i,function(){throw 2})}catch(e){}e.exports=function(e,t){if(!t&&!o)return!1;var r=!1;try{var i=[7],a=i[n]();a.next=function(){return{done:r=!0}},i[n]=function(){return a},e(i)}catch(e){}return r}},function(e,t,r){"use strict";var n=r(5),o=r(0),i=r(1),a=r(56),s=r(59);n(n.P+n.R,"Promise",{finally:function(e){var t=a(this,o.Promise||i.Promise),r="function"==typeof e;return this.then(r?function(r){return s(t,e()).then(function(){return r})}:e,r?function(r){return s(t,e()).then(function(){throw r})}:e)}})},function(e,t,r){"use strict";var n=r(5),o=r(37),i=r(58);n(n.S,"Promise",{try:function(e){var t=o.f(this),r=i(e);return(r.e?t.reject:t.resolve)(r.v),t.promise}})},function(e,t,r){e.exports={default:r(92),__esModule:!0}},function(e,t,r){r(42),r(46),e.exports=r(39).f("iterator")},function(e,t,r){e.exports={default:r(94),__esModule:!0}},function(e,t,r){r(95),r(52),r(100),r(101),e.exports=r(0).Symbol},function(e,t,r){"use strict";var n=r(1),o=r(10),i=r(7),a=r(5),s=r(54),u=r(96).KEY,c=r(13),l=r(31),d=r(23),f=r(22),p=r(2),y=r(39),v=r(40),h=r(97),_=r(98),b=r(6),m=r(9),g=r(12),R=r(29),O=r(21),w=r(41),D=r(99),j=r(51),k=r(8),L=r(19),M=j.f,U=k.f,C=D.f,x=n.Symbol,P=n.JSON,E=P&&P.stringify,S=p("_hidden"),q=p("toPrimitive"),I={}.propertyIsEnumerable,T=l("symbol-registry"),H=l("symbols"),A=l("op-symbols"),B=Object.prototype,N="function"==typeof x,F=n.QObject,V=!F||!F.prototype||!F.prototype.findChild,z=i&&c(function(){return 7!=w(U({},"a",{get:function(){return U(this,"a",{value:7}).a}})).a})?function(e,t,r){var n=M(B,t);n&&delete B[t],U(e,t,r),n&&e!==B&&U(B,t,n)}:U,G=function(e){var t=H[e]=w(x.prototype);return t._k=e,t},W=N&&"symbol"==typeof x.iterator?function(e){return"symbol"==typeof e}:function(e){return e instanceof x},J=function(e,t,r){return e===B&&J(A,t,r),b(e),t=R(t,!0),b(r),o(H,t)?(r.enumerable?(o(e,S)&&e[S][t]&&(e[S][t]=!1),r=w(r,{enumerable:O(0,!1)})):(o(e,S)||U(e,S,O(1,{})),e[S][t]=!0),z(e,t,r)):U(e,t,r)},Y=function(e,t){b(e);for(var r,n=h(t=g(t)),o=0,i=n.length;i>o;)J(e,r=n[o++],t[r]);return e},Z=function(e,t){return void 0===t?w(e):Y(w(e),t)},K=function(e){var t=I.call(this,e=R(e,!0));return!(this===B&&o(H,e)&&!o(A,e))&&(!(t||!o(this,e)||!o(H,e)||o(this,S)&&this[S][e])||t)},X=function(e,t){if(e=g(e),t=R(t,!0),e!==B||!o(H,t)||o(A,t)){var r=M(e,t);return!r||!o(H,t)||o(e,S)&&e[S][t]||(r.enumerable=!0),r}},$=function(e){for(var t,r=C(g(e)),n=[],i=0;r.length>i;)o(H,t=r[i++])||t==S||t==u||n.push(t);return n},Q=function(e){for(var t,r=e===B,n=C(r?A:g(e)),i=[],a=0;n.length>a;)!o(H,t=n[a++])||r&&!o(B,t)||i.push(H[t]);return i};N||(x=function(){if(this instanceof x)throw TypeError("Symbol is not a constructor!");var e=f(arguments.length>0?arguments[0]:void 0),t=function(r){this===B&&t.call(A,r),o(this,S)&&o(this[S],e)&&(this[S][e]=!1),z(this,e,O(1,r))};return i&&V&&z(B,e,{configurable:!0,set:t}),G(e)},s(x.prototype,"toString",function(){return this._k}),j.f=X,k.f=J,r(61).f=D.f=$,r(27).f=K,r(47).f=Q,i&&!r(15)&&s(B,"propertyIsEnumerable",K,!0),y.f=function(e){return G(p(e))}),a(a.G+a.W+a.F*!N,{Symbol:x});for(var ee="hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),te=0;ee.length>te;)p(ee[te++]);for(var re=L(p.store),ne=0;re.length>ne;)v(re[ne++]);a(a.S+a.F*!N,"Symbol",{for:function(e){return o(T,e+="")?T[e]:T[e]=x(e)},keyFor:function(e){if(!W(e))throw TypeError(e+" is not a symbol!");for(var t in T)if(T[t]===e)return t},useSetter:function(){V=!0},useSimple:function(){V=!1}}),a(a.S+a.F*!N,"Object",{create:Z,defineProperty:J,defineProperties:Y,getOwnPropertyDescriptor:X,getOwnPropertyNames:$,getOwnPropertySymbols:Q}),P&&a(a.S+a.F*(!N||c(function(){var e=x();return"[null]"!=E([e])||"{}"!=E({a:e})||"{}"!=E(Object(e))})),"JSON",{stringify:function(e){for(var t,r,n=[e],o=1;arguments.length>o;)n.push(arguments[o++]);if(r=t=n[1],(m(t)||void 0!==e)&&!W(e))return _(t)||(t=function(e,t){if("function"==typeof r&&(t=r.call(this,e,t)),!W(t))return t}),n[1]=t,E.apply(P,n)}}),x.prototype[q]||r(11)(x.prototype,q,x.prototype.valueOf),d(x,"Symbol"),d(Math,"Math",!0),d(n.JSON,"JSON",!0)},function(e,t,r){var n=r(22)("meta"),o=r(9),i=r(10),a=r(8).f,s=0,u=Object.isExtensible||function(){return!0},c=!r(13)(function(){return u(Object.preventExtensions({}))}),l=function(e){a(e,n,{value:{i:"O"+ ++s,w:{}}})},d=function(e,t){if(!o(e))return"symbol"==typeof e?e:("string"==typeof e?"S":"P")+e;if(!i(e,n)){if(!u(e))return"F";if(!t)return"E";l(e)}return e[n].i},f=function(e,t){if(!i(e,n)){if(!u(e))return!0;if(!t)return!1;l(e)}return e[n].w},p=function(e){return c&&y.NEED&&u(e)&&!i(e,n)&&l(e),e},y=e.exports={KEY:n,NEED:!1,fastKey:d,getWeak:f,onFreeze:p}},function(e,t,r){var n=r(19),o=r(47),i=r(27);e.exports=function(e){var t=n(e),r=o.f;if(r)for(var a,s=r(e),u=i.f,c=0;s.length>c;)u.call(e,a=s[c++])&&t.push(a);return t}},function(e,t,r){var n=r(16);e.exports=Array.isArray||function(e){return"Array"==n(e)}},function(e,t,r){var n=r(12),o=r(61).f,i={}.toString,a="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],s=function(e){try{return o(e)}catch(e){return a.slice()}};e.exports.f=function(e){return a&&"[object Window]"==i.call(e)?s(e):o(n(e))}},function(e,t,r){r(40)("asyncIterator")},function(e,t,r){r(40)("observable")},function(e,t,r){e.exports={default:r(122),__esModule:!0}},function(e,t,r){r(104),e.exports=r(0).Object.getPrototypeOf},function(e,t,r){var n=r(33),o=r(63);r(50)("getPrototypeOf",function(){return function(e){return o(n(e))}})},function(e,t,r){e.exports={default:r(106),__esModule:!0}},function(e,t,r){r(107),e.exports=r(0).Object.setPrototypeOf},function(e,t,r){var n=r(5);n(n.S,"Object",{setPrototypeOf:r(108).set})},function(e,t,r){var n=r(9),o=r(6),i=function(e,t){if(o(e),!n(t)&&null!==t)throw TypeError(t+": can't set as prototype!")};e.exports={set:Object.setPrototypeOf||("__proto__"in{}?function(e,t,n){try{n=r(17)(Function.call,r(51).f(Object.prototype,"__proto__").set,2),n(e,[]),t=!(e instanceof Array)}catch(e){t=!0}return function(e,r){return i(e,r),t?e.__proto__=r:n(e,r),e}}({},!1):void 0),check:i}},function(e,t,r){e.exports={default:r(110),__esModule:!0}},function(e,t,r){r(111);var n=r(0).Object;e.exports=function(e,t){return n.create(e,t)}},function(e,t,r){var n=r(5);n(n.S,"Object",{create:r(41)})},function(e,t,r){var n=r(0),o=n.JSON||(n.JSON={stringify:JSON.stringify});e.exports=function(e){return o.stringify.apply(o,arguments)}},function(e,t,r){r(114),e.exports=r(0).Object.keys},function(e,t,r){var n=r(33),o=r(19);r(50)("keys",function(){return function(e){return o(n(e))}})},,function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}t.__esModule=!0;var n=r(26),o=_interopRequireDefault(n),i=r(119),a=_interopRequireDefault(i);t.default=function get(e,t,r){null===e&&(e=Function.prototype);var n=(0,a.default)(e,t);if(void 0===n){var i=(0,o.default)(e);return null===i?void 0:get(i,t,r)}if("value"in n)return n.value;var s=n.get;if(void 0!==s)return s.call(r)}},,,function(e,t,r){e.exports={default:r(120),__esModule:!0}},function(e,t,r){r(121);var n=r(0).Object;e.exports=function(e,t){return n.getOwnPropertyDescriptor(e,t)}},function(e,t,r){var n=r(12),o=r(51).f;r(50)("getOwnPropertyDescriptor",function(){return function(e,t){return o(n(e),t)}})},function(e,t,r){r(123),e.exports=r(0).Object.assign},function(e,t,r){var n=r(5);n(n.S+n.F,"Object",{assign:r(124)})},function(e,t,r){"use strict";var n=r(19),o=r(47),i=r(27),a=r(33),s=r(62),u=Object.assign;e.exports=!u||r(13)(function(){var e={},t={},r=Symbol(),n="abcdefghijklmnopqrst";return e[r]=7,n.split("").forEach(function(e){t[e]=e}),7!=u({},e)[r]||Object.keys(u({},t)).join("")!=n})?function(e,t){for(var r=a(e),u=arguments.length,c=1,l=o.f,d=i.f;u>c;)for(var f,p=s(arguments[c++]),y=l?n(p).concat(l(p)):n(p),v=y.length,h=0;v>h;)d.call(p,f=y[h++])&&(r[f]=p[f]);return r}:u},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(48),o=_interopRequireDefault(n),i=r(14),a=_interopRequireDefault(i),s=r(3),u=_interopRequireDefault(s),c=r(4),l=_interopRequireDefault(c),d=r(38),f=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(d),p=r(36),y=f.getLogger("RegistrationStatus"),v=function(){function RegistrationStatus(e,t,r,n){(0,u.default)(this,RegistrationStatus),this._registryObjectURL=e,this._runtimeURL=t,this._domain=(0,p.divideURL)(t).domain,this._discoveredObjectURL=r,this._messageBus=n,this._subscriptionSet=!1,this._subscribers={live:{},disconnected:{}}}return(0,l.default)(RegistrationStatus,[{key:"onLive",value:function(e,t){var r=this;return new a.default(function(n,o){r._subscriptionSet?(r._subscribers.live[e]=t,n()):r._subscribe().then(function(){r._subscribers.live[e]=t,n()}).catch(function(e){return o(e)})})}},{key:"onDisconnected",value:function(e,t){var r=this;return new a.default(function(n,o){r._subscriptionSet?(r._subscribers.disconnected[e]=t,n()):r._subscribe().then(function(){r._subscribers.disconnected[e]=t,n()}).catch(function(e){return o(e)})})}},{key:"_subscribe",value:function(){var e=this,t={type:"subscribe",from:this._discoveredObjectURL,to:this._runtimeURL+"/subscriptions",body:{resources:[this._registryObjectURL+"/registration"]}};return new a.default(function(r,n){e._messageBus.postMessage(t,function(t){y.log("[DiscoveredObject.subscribe] "+e._registryObjectURL+" rcved reply ",t),200===t.body.code?(e._generateListener(e._registryObjectURL+"/registration"),e._subscriptionSet=!0,r()):(y.error("Error subscribing ",e._registryObjectURL),n("Error subscribing "+e._registryObjectURL))})})}},{key:"_generateListener",value:function(e){var t=this;this._messageBus.addListener(e,function(e){y.log("[DiscoveredObject.notification] "+t._registryObjectURL+": ",e),t._processNotification(e)})}},{key:"_processNotification",value:function(e){var t=this,r=e.body.value;setTimeout(function(){(0,o.default)(t._subscribers[r]).forEach(function(e){return t._subscribers[r][e]()})},5e3)}},{key:"_unsubscribe",value:function(){var e=this,t={type:"unsubscribe",from:this._discoveredObjectURL,to:this._runtimeURL+"/subscriptions",body:{resource:this._registryObjectURL+"/registration"}};return new a.default(function(r,n){e._messageBus.postMessage(t,function(t){y.log("[DiscoveredObject.unsubscribe] "+e._registryObjectURL+" rcved reply ",t),200===t.body.code?r():(y.error("Error unsubscribing ",e._registryObjectURL),n("Error unsubscribing "+e._registryObjectURL))})})}},{key:"unsubscribeLive",value:function(e){var t=this;return new a.default(function(r,n){e in t._subscribers.live&&delete t._subscribers.live[e],t._areSubscriptionsEmpty()?t._unsubscribe().then(function(){return r()}).catch(function(e){return n(e)}):r()})}},{key:"unsubscribeDisconnected",value:function(e){var t=this;return new a.default(function(r,n){e in t._subscribers.disconnected?(delete t._subscribers.disconnected[e],t._areSubscriptionsEmpty()?t._unsubscribe().then(function(){return r()}).catch(function(e){return n(e)}):r()):n(e+" doesn't subscribe onDisconnected for "+t._registryObjectURL)})}},{key:"_areSubscriptionsEmpty",value:function(){return 0===(0,o.default)(this._subscribers.live).length&&0===(0,o.default)(this._subscribers.disconnected).length}}]),RegistrationStatus}();t.default=v,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(26),o=_interopRequireDefault(n),i=r(3),a=_interopRequireDefault(i),s=r(4),u=_interopRequireDefault(s),c=r(34),l=_interopRequireDefault(c),d=r(35),f=_interopRequireDefault(d),p=r(127),y=_interopRequireDefault(p),v=function(e){function MiniBus(){return(0,a.default)(this,MiniBus),(0,l.default)(this,(MiniBus.__proto__||(0,o.default)(MiniBus)).call(this))}return(0,f.default)(MiniBus,e),(0,u.default)(MiniBus,[{key:"postMessage",value:function(e,t,r){var n=this;return n._genId(e),n._responseCallback(e,t,r),n._onPostMessage(e),e.id}},{key:"_onMessage",value:function(e){var t=this;if(!t._onResponse(e)){var r=t._subscriptions[e.to];r?(t._publishOn(r,e),e.to.startsWith("hyperty")||t._publishOnDefault(e)):t._publishOnDefault(e)}}}]),MiniBus}(y.default);t.default=v,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(14),o=_interopRequireDefault(n),i=r(3),a=_interopRequireDefault(i),s=r(4),u=_interopRequireDefault(s),c=r(38),l=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(c),d=l.getLogger("Bus"),f=function(){function Bus(){(0,a.default)(this,Bus);var e=this;e._msgId=0,e._subscriptions={},e._responseTimeOut=15e3,e._responseCallbacks={},e._registerExternalListener()}return(0,u.default)(Bus,[{key:"addListener",value:function(e,t){var r=this,n=new p(r._subscriptions,e,t),o=r._subscriptions[e];return o||(o=[],r._subscriptions[e]=o),o.push(n),n}},{key:"addResponseListener",value:function(e,t,r){this._responseCallbacks[e+t]=r}},{key:"removeResponseListener",value:function(e,t){delete this._responseCallbacks[e+t]}},{key:"removeAllListenersOf",value:function(e){delete this._subscriptions[e]}},{key:"bind",value:function(e,t,r){var n=this,o=this;return{thisListener:o.addListener(e,function(e){r.postMessage(e)}),targetListener:r.addListener(t,function(e){o.postMessage(e)}),unbind:function(){n.thisListener.remove(),n.targetListener.remove()}}}},{key:"_publishOnDefault",value:function(e){var t=this._subscriptions["*"];t&&this._publishOn(t,e)}},{key:"_publishOn",value:function(e,t){e.forEach(function(e){e._callback(t)})}},{key:"_responseCallback",value:function(e,t){var r=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],n=this;if(t){var o=e.from+e.id;n._responseCallbacks[o]=t,r&&setTimeout(function(){var t=n._responseCallbacks[o];if(delete n._responseCallbacks[o],t){t({id:e.id,type:"response",body:{code:408,desc:"Response timeout!",value:e}})}},n._responseTimeOut)}}},{key:"_onResponse",value:function(e){var t=this;if("response"===e.type){var r=e.to+e.id,n=t._responseCallbacks[r];if(e.body.code>=200&&delete t._responseCallbacks[r],n)return n(e),!0}return!1}},{key:"_onMessage",value:function(e){var t=this;if(!t._onResponse(e)){var r=t._subscriptions[e.to];r?t._publishOn(r,e):t._publishOnDefault(e)}}},{key:"_genId",value:function(e){e.id&&0!==e.id||(this._msgId++,e.id=this._msgId)}},{key:"postMessage",value:function(e,t){}},{key:"postMessageWithRetries",value:function(e,t,r){var n=this,i=0,a=function(){return new o.default(function(t,o){n.postMessage(e,function(n){408===n.body.code||500===n.body.code?o():(d.info("[Bus.postMessageWithRetries] msg delivered: ",e),r(n),t())})})};!function tryAgain(){a().then(function(){},function(){if(d.warn("[Bus.postMessageWithRetries] Message Bounced (retry "+i+"): '",e),!(i++<t)){var r="[Error] Message Bounced (delivery attempts "+t+"): '";throw new Error(r+e)}tryAgain()})}()}},{key:"_onPostMessage",value:function(e){}},{key:"_registerExternalListener",value:function(){}}]),Bus}(),p=function(){function MsgListener(e,t,r){(0,a.default)(this,MsgListener);var n=this;n._subscriptions=e,n._url=t,n._callback=r}return(0,u.default)(MsgListener,[{key:"remove",value:function(){var e=this,t=e._subscriptions[e._url];if(t){var r=t.indexOf(e);t.splice(r,1),0===t.length&&delete e._subscriptions[e._url]}}},{key:"url",get:function(){return this._url}}]),MsgListener}();t.default=f,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(3),o=_interopRequireDefault(n),i=r(4),a=_interopRequireDefault(i),s=r(129),u=_interopRequireDefault(s),c=function(){function SandboxRegistry(e){(0,o.default)(this,SandboxRegistry);var t=this;t._bus=e,t._factory=new u.default(e),t._components={},e.addListener(SandboxRegistry.InternalDeployAddress,function(e){switch(e.type){case"create":t._onDeploy(e);break;case"delete":t._onRemove(e)}})}return(0,a.default)(SandboxRegistry,[{key:"_responseMsg",value:function(e,t,r){var n={id:e.id,type:"response",from:SandboxRegistry.InternalDeployAddress,to:SandboxRegistry.ExternalDeployAddress},o={};return t&&(o.code=t),r&&(o.desc=r),n.body=o,n}},{key:"_onDeploy",value:function(e){var t=this,r=e.body.config,n=e.body.url,o=e.body.sourceCode,i=void 0,a=void 0;if(t._components.hasOwnProperty(n))i=500,a="Instance "+n+" already exist!";else try{t._components[n]=t._create(n,o,r,t._factory),i=200}catch(e){i=500,a=e}var s=t._responseMsg(e,i,a);t._bus.postMessage(s)}},{key:"_onRemove",value:function(e){var t=this,r=e.body.url,n=void 0,o=void 0;t._components.hasOwnProperty(r)?(delete t._components[r],t._bus.removeAllListenersOf(r),n=200):(n=500,o="Instance "+r+" doesn't exist!");var i=t._responseMsg(e,n,o);t._bus.postMessage(i)}},{key:"_create",value:function(e,t,r,n){}},{key:"components",get:function(){return this._components}}]),SandboxRegistry}();c.ExternalDeployAddress="hyperty-runtime://sandbox/external",c.InternalDeployAddress="hyperty-runtime://sandbox/internal",t.default=c,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(3),o=_interopRequireDefault(n),i=r(4),a=_interopRequireDefault(i),s=r(130),u=_interopRequireDefault(s),c=r(165),l=_interopRequireDefault(c),d=r(36),f=r(134),p=_interopRequireDefault(f),y=r(135),v=_interopRequireDefault(y),h=r(125),_=_interopRequireDefault(h),b=r(167),m=_interopRequireDefault(b),g=r(136),R=_interopRequireDefault(g),O=r(138),w=_interopRequireDefault(O),D=r(168),j=_interopRequireDefault(D),k=r(170),L=_interopRequireDefault(k),M=r(140),U=_interopRequireDefault(M),C=r(173),x=_interopRequireDefault(C),P=r(142),E=_interopRequireDefault(P),S=function(){function SandboxFactory(e){(0,o.default)(this,SandboxFactory);var t=this;t._bus=e,t._divideURL=d.divideURL}return(0,a.default)(SandboxFactory,[{key:"createSyncher",value:function(e,t,r){return new u.default(e,t,r)}},{key:"createIdentityManager",value:function(e,t,r){return new p.default(e,t,r)}},{key:"createDiscovery",value:function(e,t,r){return new v.default(e,t,r)}},{key:"createSearch",value:function(e,t){return new m.default(e,t)}},{key:"createContextObserver",value:function(e,t,r,n){return new R.default(e,t,r,n,this)}},{key:"createContextReporter",value:function(e,t,r){return new w.default(e,t,r,this)}},{key:"createNotificationHandler",value:function(e){return new l.default(e)}},{key:"createMessageBodyIdentity",value:function(e,t,r,n,o,i,a,s){return new j.default(e,t,r,n,o,i,a,s)}},{key:"createChatManager",value:function(e,t,r,n){return new L.default(e,t,r,n,this)}},{key:"createChatController",value:function(e,t,r,n,o,i){return new U.default(e,t,r,n,o,i)}},{key:"createSimpleChatManager",value:function(e,t,r,n){return new x.default(e,t,r,n,this)}},{key:"createChat",value:function(e,t,r,n){return new E.default(e,t,r,n)}},{key:"createRegistrationStatus",value:function(e,t,r,n){return new _.default(e,t,r,n)}},{key:"divideURL",get:function(){return this._divideURL}}]),SandboxFactory}();t.default=S,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(14),o=_interopRequireDefault(n),i=r(102),a=_interopRequireDefault(i),s=r(3),u=_interopRequireDefault(s),c=r(4),l=_interopRequireDefault(c),d=r(38),f=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(d),p=r(36),y=r(156),v=_interopRequireDefault(y),h=r(163),_=_interopRequireDefault(h),b=r(164),m=_interopRequireDefault(b),g=f.getLogger("Syncher"),R=function(){function Syncher(e,t,r){(0,u.default)(this,Syncher);var n=this;n._owner=e,n._bus=t,n._subURL=r.runtimeURL+"/sm",n._runtimeUrl=r.runtimeURL,n._p2pHandler=r.p2pHandler,n._p2pRequester=r.p2pRequester,n._reporters={},n._observers={},n._provisionals={},t.addListener(e,function(t){if(t.from!==e)switch(g.info("[Syncher] Syncher-RCV: ",t,n),t.type){case"forward":n._onForward(t);break;case"create":n._onRemoteCreate(t);break;case"delete":n._onRemoteDelete(t);break;case"execute":n._onExecute(t)}})}return(0,l.default)(Syncher,[{key:"create",value:function(e,t,r){var n=arguments.length>3&&void 0!==arguments[3]&&arguments[3],o=arguments.length>4&&void 0!==arguments[4]&&arguments[4],i=arguments.length>5&&void 0!==arguments[5]?arguments[5]:"no name",s=arguments[6],u=arguments[7];if(!e)throw Error("[Syncher - Create] - You need specify the data object schema");if(!t)throw Error("[Syncher - Create] -The observers should be defined");var c=this;u=u||{};var l=(0,a.default)({},u);return l.p2p=o,l.store=n,l.schema=e,l.authorise=t,l.p2pHandler=c._p2pHandler,l.p2pRequester=c._p2pRequester,l.data=r?(0,p.deepClone)(r):{},l.name=0===i.length?"no name":i,l.reporter=u.hasOwnProperty("reporter")&&"boolean"!=typeof u.reporter?u.reporter:c._owner,l.resume=!1,u?(l.mutual=!u.hasOwnProperty("mutual")||u.mutual,l.name=u.hasOwnProperty("name")?u.name:l.name):l.mutual=!0,u.hasOwnProperty("reuseURL")&&(l.resource=u.reuseURL),s&&(l.identity=s),c._create(l)}},{key:"resumeReporters",value:function(e){var t=this;return g.log("[syncher - create] - resume Reporter - criteria: ",e),(0,a.default)(e,{resume:!0}),t._resumeCreate(e)}},{key:"subscribe",value:function(e){return this._subscribe(e)}},{key:"resumeObservers",value:function(e){var t=this,r=e||{};return(0,a.default)(r,{resume:!0}),t._resumeSubscribe(r)}},{key:"read",value:function(e,t){var r=this;return new o.default(function(t,n){r._readReporter(e).then(function(e){t(e)})})}},{key:"_readCallBack",value:function(e,t,r){var n=this,o={},i={},s=0;if(e.body.code<300)if(e.body.value.hasOwnProperty("responses"))if(0===s)i=e.body.value,++s;else{delete e.body.value.responses;var u=void 0;for(u in e.body.value)o.hasOwnProperty(u)||(o[u]={}),(0,a.default)(o[u],e.body.value[u]);++s,s===i.responses&&(i.childrenObjects=o,delete i.responses,n._bus.removeResponseListener(e.from,e.id),t(i))}else n._bus.removeResponseListener(e.from,e.id),t(e.body.value);else r(e.body.desc)}},{key:"_readReporter",value:function(e){var t=this,r={type:"read",from:t._owner,to:e};return new o.default(function(e,n){t._bus.postMessage(r,function(r){return t._readCallBack(r,e,n)},!1)})}},{key:"onNotification",value:function(e){this._onNotificationHandler=e}},{key:"onClose",value:function(e){this._onClose=e}},{key:"_create",value:function(e){var t=this;return new o.default(function(r,n){var o=(0,a.default)({},e),i=e.resume;o.created=(new Date).toISOString(),o.runtime=t._runtimeUrl;var s=(0,p.deepClone)(o);delete s.p2p,delete s.store,delete s.observers,delete s.identity;var u={type:"create",from:t._owner,to:t._subURL,body:{resume:i,value:s}};u.body.schema=o.schema,o.p2p&&(u.body.p2p=o.p2p),o.store&&(u.body.store=o.store),o.identity&&(u.body.identity=o.identity),t._bus.postMessage(u,function(i){if(g.log("[syncher - create] - create-response: ",i),200===i.body.code){o.url=i.body.resource,o.status="live",o.syncher=t,o.childrens=i.body.childrenResources;var a=t._reporters[o.url];a||(a=new v.default(o),t._reporters[o.url]=a),a.inviteObservers(e.authorise,e.p2p),r(a)}else n(i.body.desc)})})}},{key:"_resumeCreate",value:function(e){var t=this,r=this;return new o.default(function(n,o){var i=e.resume,a={type:"create",from:r._owner,to:r._subURL,body:{resume:i}};g.log("[syncher - create]: ",e,a),e&&(a.body.value=e,e.hasOwnProperty("reporter")?a.body.value.reporter=e.reporter:a.body.value.reporter=r._owner),e.p2p&&(a.body.p2p=e.p2p),e.store&&(a.body.store=e.store),e.observers&&(a.body.authorise=e.observers),e.identity&&(a.body.identity=e.identity),g.log("[syncher._resumeCreate] - resume message: ",a),r._bus.postMessage(a,function(e){if(g.log("[syncher._resumeCreate] - create-resumed-response: ",e),200===e.body.code){var i=e.body.value;for(var a in i){var s=i[a];s.data=(0,p.deepClone)(s.data)||{},s.childrenObjects&&(s.childrenObjects=(0,p.deepClone)(s.childrenObjects)),s.mutual=!1,s.resume=!0,s.status="live",s.syncher=r,g.log("[syncher._resumeCreate] - create-resumed-dataObjectReporter",s);var u=new v.default(s);s.childrenObjects&&u.resumeChildrens(s.childrenObjects),r._reporters[s.url]=u}n(r._reporters),t._onReportersResume&&t._onReportersResume(t._reporters)}else 404===e.body.code?n({}):o(e.body.desc)})})}},{key:"_subscribe",value:function(e){var t=this;return new o.default(function(r,n){var o={type:"subscribe",from:t._owner,to:t._subURL,body:e};g.log("[syncher_subscribe] - subscribe message: ",e,o),t._bus.postMessage(o,function(o){g.log("[syncher] - subscribe-response: ",o);var i=o.body.resource,a=t._provisionals[i];if(delete t._provisionals[i],a&&a._releaseListeners(),o.body.code<200)g.log("[syncher] - new DataProvisional: ",o.body.childrenResources,i),a=new m.default(t._owner,i,t._bus,o.body.childrenResources),t._provisionals[i]=a;else if(200===o.body.code){g.log("[syncher] - new Data Object Observer: ",o,t._provisionals);var s=o.body.value;s.syncher=t,s.p2p=e.p2p,s.store=e.store,s.identity=e.identity,s.resume=!1,s.mutual=e.mutual;var u=t._observers[i];u?u.sync():(u=new _.default(s),t._observers[i]=u),g.log("[syncher] - new Data Object Observer already exist: ",u),r(u),a&&a.apply(u)}else n(o.body.desc)})})}},{key:"_resumeSubscribe",value:function(e){var t=this,r=this;return new o.default(function(n,o){var i={type:"subscribe",from:r._owner,to:r._subURL,body:{}};e&&(e.hasOwnProperty("p2p")&&(i.body.p2p=e.p2p),e.hasOwnProperty("store")&&(i.body.store=e.store),e.hasOwnProperty("schema")&&(i.body.schema=e.schema),e.hasOwnProperty("identity")&&(i.body.identity=e.identity),e.hasOwnProperty("resource")&&(i.body.resource=e.resource)),i.body.resume=e.resume;var a=e.mutual;e.hasOwnProperty("mutual")&&(i.body.mutual=a),r._bus.postMessage(i,function(e){var i=e.body.resource,a=r._provisionals[i];if(delete r._provisionals[i],a&&a._releaseListeners(),e.body.code<200)g.log("[syncher] - resume new DataProvisional: ",e,i),a=new m.default(r._owner,i,r._bus,e.body.childrenResources),r._provisionals[i]=a;else if(200===e.body.code){var s=e.body.value;for(var u in s){var c=s[u];c.childrenObjects&&(c.childrenObjects=(0,p.deepClone)(c.childrenObjects)),c.data=(0,p.deepClone)(c.data)||{},c.resume=!0,c.syncher=r;var l=new _.default(c);c.childrenObjects&&l.resumeChildrens(c.childrenObjects),g.log("[syncher._resumeSubscribe] - new dataObject",l),r._observers[l.url]=l,r._provisionals[l.url]&&r._provisionals[l.url].apply(l)}n(r._observers),t._onObserversResume&&t._onObserversResume(r._observers)}else 404===e.body.code?n({}):o(e.body.desc)})})}},{key:"_onForward",value:function(e){this._reporters[e.body.to]._onForward(e)}},{key:"_onRemoteCreate",value:function(e){var t=this,r=e.from.slice(0,-13),n=(0,p.divideURL)(r),o=n.domain,i={type:e.type,from:e.body.source,url:r,domain:o,schema:e.body.schema,value:e.body.value,identity:e.body.identity,ack:function(r){var n=200;r&&(n=r),t._bus.postMessage({id:e.id,type:"response",from:e.to,to:e.from,body:{code:n}})}};t._onNotificationHandler&&(g.info("[Syncher] NOTIFICATION-EVENT: ",i),t._onNotificationHandler(i))}},{key:"_onRemoteDelete",value:function(e){var t=this,r=e.body.resource,n=t._observers[r],o={from:t.owner,to:t._subURL,id:e.id,type:"unsubscribe",body:{resource:e.body.resource}};if(t._bus.postMessage(o),delete t._observers[r],n){var i={type:e.type,url:r,identity:e.body.identity,ack:function(r){var o=200;r&&(o=r),200===o&&n.delete(),t._bus.postMessage({id:e.id,type:"response",from:e.to,to:e.from,body:{code:o,source:t._owner}})}};t._onNotificationHandler&&(g.log("NOTIFICATION-EVENT: ",i),t._onNotificationHandler(i))}else t._bus.postMessage({id:e.id,type:"response",from:e.to,to:e.from,body:{code:404,source:t._owner}})}},{key:"_onExecute",value:function(e){var t=this,r={id:e.id,type:"response",from:e.to,to:e.from,body:{code:200}};if((e.from===t._runtimeUrl+"/registry/"||e.from===t._runtimeUrl+"/registry")&&e.body&&e.body.method&&"close"===e.body.method&&t._onClose){var n={type:"close",ack:function(e){e&&(r.body.code=e),t._bus.postMessage(r)}};g.info("[Syncher] Close-EVENT: ",n),t._onClose(n)}else t._bus.postMessage(r)}},{key:"onReportersResume",value:function(e){this._onReportersResume=e}},{key:"onObserversResume",value:function(e){this._onObserversResume=e}},{key:"owner",get:function(){return this._owner}},{key:"reporters",get:function(){return this._reporters}},{key:"observers",get:function(){return this._observers}}]),Syncher}();t.default=R,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(60),o=_interopRequireDefault(n),i=r(14),a=_interopRequireDefault(i),s=r(48),u=_interopRequireDefault(s),c=r(102),l=_interopRequireDefault(c),d=r(3),f=_interopRequireDefault(d),p=r(4),y=_interopRequireDefault(p),v=r(38),h=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(v),_=r(132),b=_interopRequireDefault(_),m=r(133),g=_interopRequireDefault(m),R=r(158),O=_interopRequireDefault(R),w=r(36),D=r(159),j=_interopRequireDefault(D),k=h.getLogger("DataObject"),L=function(){function DataObject(e){function throwMandatoryParmMissingError(e){throw"[DataObject] "+e+" mandatory parameter is missing"}(0,f.default)(this,DataObject);var t=this;if(e.syncher?t._syncher=e.syncher:throwMandatoryParmMissingError("syncher"),e.url?t._url=e.url:throwMandatoryParmMissingError("url"),e.created?t._created=e.created:throwMandatoryParmMissingError("created"),e.reporter?t._reporter=e.reporter:throwMandatoryParmMissingError("reporter"),e.runtime?t._runtime=e.runtime:throwMandatoryParmMissingError("runtime"),e.schema?t._schema=e.schema:throwMandatoryParmMissingError("schema"),e.name?t._name=e.name:throwMandatoryParmMissingError("name"),t._status=e.status,e.data?t._syncObj=new b.default(e.data):t._syncObj=new b.default({}),t._childrens=e.childrens,t._mutual=e.mutual,t._version=0,t._childId=1,t._childrenListener,t._onAddChildrenHandler,t._resumed=e.resume,e.resume&&(t._version=e.version),t._owner=e.syncher._owner,t._bus=e.syncher._bus,e.description&&(t._description=e.description),e.tags&&(t._tags=e.tags),e.resources&&(t._resources=e.resources),e.observerStorage&&(t._observerStorage=e.observerStorage),e.publicObservation&&(t._publicObservation=e.publicObservation),t._metadata=(0,l.default)(e),(!e.hasOwnProperty("resume")||e.hasOwnProperty("resume")&&!e.resume)&&(t._metadata.lastModified=t._metadata.created),delete t._metadata.data,delete t._metadata.syncher,delete t._metadata.authorise,t._hypertyResourceFactory=new j.default,t._childrenObjects={},t._sharedChilds=[],e.backup&&t._childrens){var r=e.hasOwnProperty("childrenObjects")&&e.childrenObjects.hasOwnProperty("heartbeat")?e.childrenObjects.heartbeat:0;t._heartBeat=new O.default(t._bus,t._owner,t._syncher._runtimeUrl,this,15,r),t._resumed||t._heartBeat.start(r)}}return(0,y.default)(DataObject,[{key:"_getLastChildId",value:function(){var e=this,t=0,r=e._owner+"#"+t;return(0,u.default)(e._childrens).filter(function(t){e._childrens[t].childId>r&&(r=e._childrens[t].childId)}),t=Number(r.split("#")[1])}},{key:"_allocateListeners",value:function(){var e=this,t=this,r=t._url+"/children/";if(k.log("[Data Object - AllocateListeners] - ",t._childrens),t._childrens)var n=r,o=t._bus.addListener(n,function(r){if(r.from!==e._owner)switch(k.log("DataObject-Children-RCV: ",r),r.type){case"create":t._onChildCreate(r);break;case"delete":k.log(r);break;default:t._changeChildren(r)}t._childrenListener=o})}},{key:"_releaseListeners",value:function(){var e=this;e._childrenListener&&(e._childrenListener.remove(),(0,u.default)(e._childrenObjects).forEach(function(t){e._childrenObjects[t]._releaseListeners()}))}},{key:"sync",value:function(){var e=this,t=this;return k.info("[DataObject.sync] synchronising "),new a.default(function(r,n){var o={};e.metadata.backupRevision&&(o.backupRevision=e.metadata.backupRevision),t._syncher.read(t._metadata.url,o).then(function(e){k.info("[DataObject.sync] value to sync: ",e),(0,l.default)(t.data,(0,w.deepClone)(e.data)),t._version=e.version,t._metadata.lastModified=e.lastModified,e.childrenObjects?(t.resumeChildrens(e.childrenObjects),t._storeChildrens(),r(!0)):r(!0)}).catch(function(e){k.info("[DataObject.sync] sync failed: ",e),r(!1)})})}},{key:"resumeChildrens",value:function(e){var t=this,r=this,n=this._owner.split("/")[3]+"#"+this._childId,o=e;(0,u.default)(o).forEach(function(e){var i=!1;"heartbeat"===e?r._heartBeat.start(o[e]):o[e].value.resourceType&&!r._childrenObjects.hasOwnProperty(e)?(r._childrenObjects[e]=r._resumeHypertyResource(o[e]),i=!0):r._childrenObjects.hasOwnProperty(e)||(r._childrenObjects[e]=r._resumeChild(o[e]),k.log("[DataObject.resumeChildrens] new DataObjectChild: ",r._childrenObjects[e]),i=!0),i&&e>n&&(n=e,k.log("[DataObjectReporter.resumeChildrens] - resuming: ",t._childrenObjects[e]))}),this._childId=Number(n.split("#")[1])}},{key:"_resumeChild",value:function(e){var t=this,r=e.value;r.parentObject=t,r.parent=t._url;var n=new g.default(r);n.identity=e.identity;var o={type:"create",from:n.reporter,url:n.parent,value:n.data,childId:n.url,identity:n.identity,child:n};return n.resourceType&&(o.resource=n),t._onAddChildrenHandler&&t._onAddChildrenHandler(o),n}},{key:"_resumeHypertyResource",value:function(e){var t=this,r=e.value;r.parentObject=t,r.parent=t._url;var n=t._hypertyResourceFactory.createHypertyResource(!1,r.resourceType,r);n.identity=e.identity;var o={type:"create",from:n.reporter,url:n.parent,value:n.data,childId:n.url,identity:n.identity,child:n};return n.resourceType&&(o.resource=n),t._onAddChildrenHandler&&t._onAddChildrenHandler(o),n}},{key:"pause",value:function(){throw"Not implemented"}},{key:"resume",value:function(){throw"Not implemented"}},{key:"stop",value:function(){throw"Not implemented"}},{key:"addChild",value:function(e,t,r){var n=this,o=void 0;return new a.default(function(i){var a=n._url+"/children/",s=n._getChildInput(r);s.data=e,o=new g.default(s),t&&(o.identity=t),o.share(),o.onChange(function(e){n._onChange(e,{path:a,childId:s.url})}),n._childrenObjects[s.url]=o,i(o)})}},{key:"_deleteChildrens",value:function(){var e=this,t=[];return new a.default(function(r){if(e.childrens){k.log("[DataObject.deleteChildrens]",e.childrens);var n=void 0;for(n in e.childrens){var o=e.childrens[n];k.log("[DataObject._deleteChildrens] child",o),o.metadata.hasOwnProperty("resourceType")&&t.push(e.childrens[n].delete())}k.log("[DataObject._deleteChildrens] promises ",t),t.length>0?a.default.all(t).then(function(){r("[DataObject._deleteChildrens] done")}):r("[DataObject._deleteChildrens] nothing to delete")}})}},{key:"_getChildInput",value:function(e){var t=this,r=(0,l.default)({},e);return t._childId++,r.url=t._owner.split("/")[3]+"#"+t._childId,r.parentObject=t,r.reporter=t._owner,r.created=(new Date).toISOString(),r.runtime=t._syncher._runtimeUrl,r.p2pHandler=t._syncher._p2pHandler,r.p2pRequester=t._syncher._p2pRequester,r.schema=t._schema,r.parent=t.url,r.mutual=t.metadata.mutual,r}},{key:"addHypertyResource",value:function(e,t,r,n){var o=this;return new a.default(function(i){var a=void 0,s=o._url+"/children/",u=o._getChildInput(n);o._hypertyResourceFactory.createHypertyResourceWithContent(!0,e,t,u).then(function(e){a=e,r&&(a.identity=r),a.share(),k.log("[DataObject.addHypertyResource] added ",a),a.onChange(function(e){o._onChange(e,{path:s,childId:a.childId})}),o._childrenObjects[a.childId]=a,i(a)})})}},{key:"onAddChild",value:function(e){this._onAddChildrenHandler=e}},{key:"_onChildCreate",value:function(e){var t=this;if("heartbeat"===e.body.resource)this._heartBeat.onNewHeartbeat(e.body.value);else{var r={from:e.to,to:e.from,type:"response",id:e.id,body:{code:100}};t._bus.postMessage(r),e.body.value.resourceType?t._onHypertyResourceAdded(e):t._onChildAdded(e)}}},{key:"_onChildAdded",value:function(e){var t=this,r=(0,w.deepClone)(e.body.value);r.parentObject=t;var n=new g.default(r);n.identity=e.body.identity,t._childrenObjects[r.url]=n,e.to===t.metadata.url&&n.store(),t._hypertyEvt(e,n)}},{key:"_onHypertyResourceAdded",value:function(e){var t=this,r=e.body.value,n=void 0;r.parentObject=t,n=t._hypertyResourceFactory.createHypertyResource(!1,r.resourceType,r),n.identity=e.body.identity,t._childrenObjects[n.childId]=n,t._hypertyEvt(e,n),e.to===t.metadata.url&&n.store()}},{key:"_hypertyEvt",value:function(e,t){var r=this,n={type:e.type,from:e.from,url:e.to,value:t.data,childId:t.url,identity:e.body.identity,child:t};t.resourceType&&(n.resource=t),r._onAddChildrenHandler&&r._onAddChildrenHandler(n)}},{key:"_onChange",value:function(e,t){var r=this;if(r._metadata.lastModified=(new Date).toISOString(),r._version++,"live"===r._status){var n={type:"update",from:r._url,to:r._url+"/changes",body:{version:r._version,source:r._owner,attribute:e.field,lastModified:r._metadata.lastModified}};k.log("[DataObject - _onChange] - ",e,t,n),e.oType===_.ObjectType.OBJECT?e.cType!==_.ChangeType.REMOVE&&(n.body.value=(0,w.deepClone)(e.data)):(n.body.attributeType=e.oType,n.body.value=e.data,e.cType!==_.ChangeType.UPDATE&&(n.body.operation=e.cType)),t&&(n.to=t.path,n.body.resource=t.childId),r.data._mutual||(n.body.mutual=r._mutual),r._bus.postMessage(n)}}},{key:"_changeObject",value:function(e,t){var r=this;if(r._version+1<=t.body.version){r._version=t.body.version;var n=t.body.attribute,i=void 0;i="object"===(0,o.default)(t.body.value)?(0,w.deepClone)(t.body.value):t.body.value;var a=e.findBefore(n);if(t.body.lastModified?r._metadata.lastModified=t.body.lastModified:r._metadata.lastModified=(new Date).toISOString(),t.body.attributeType===_.ObjectType.ARRAY)if(t.body.operation===_.ChangeType.ADD){var s=a.obj,u=a.last;Array.prototype.splice.apply(s,[u,0].concat(i))}else if(t.body.operation===_.ChangeType.REMOVE){var c=a.obj,l=a.last;c.splice(l,i)}else a.obj[a.last]=i;else t.body.hasOwnProperty("value")?a.obj[a.last]=i:delete a.obj[a.last]}else k.log("UNSYNCHRONIZED VERSION: (data => "+r._version+", msg => "+t.body.version+")")}},{key:"_changeChildren",value:function(e){var t=this,r=(0,w.divideURL)(e.to),n=(r.identity,e.body.resource),o=t._childrenObjects[n];k.log("Change children: ",t._owner,e,resource),o?t._changeObject(o._syncObj,e):k.warn("No children found for: ",n)}},{key:"metadata",get:function(){return this._metadata}},{key:"url",get:function(){return this._url}},{key:"schema",get:function(){return this._schema}},{key:"status",get:function(){return this._status}},{key:"data",get:function(){return this._syncObj.data}},{key:"childrens",get:function(){return this._childrenObjects}}]),DataObject}();t.default=L,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0}),t.ObjectType=t.ChangeType=void 0;var n=r(3),o=_interopRequireDefault(n),i=r(4),a=_interopRequireDefault(i);r(157);var s=r(36),u=function(){function SyncObject(e){(0,o.default)(this,SyncObject);var t=this;t._observers=[],t._filters={},this._data=e||{},this._internalObserve(this._data)}return(0,a.default)(SyncObject,[{key:"observe",value:function(e){this._observers.push(e)}},{key:"find",value:function(e){var t=(0,s.parseAttributes)(e);return this._findWithSplit(t)}},{key:"findBefore",value:function(e){var t={},r=(0,s.parseAttributes)(e);return t.last=r.pop(),t.obj=this._findWithSplit(r),t}},{key:"_findWithSplit",value:function(e){var t=this._data;return e.forEach(function(e){t=t[e]}),t}},{key:"_internalObserve",value:function(e){var t=this,r=function(e){e.every(function(e){t._onChanges(e)})};this._data=Object.deepObserve(e,r)}},{key:"_fireEvent",value:function(e){this._observers.forEach(function(t){t(e)})}},{key:"_onChanges",value:function(e){var t=e.object,r=void 0;t.constructor===Object&&(r=l.OBJECT),t.constructor===Array&&(r=l.ARRAY);var n=e.keypath,o=t[e.name];"update"!==e.type||n.includes(".length")||this._fireEvent({cType:c.UPDATE,oType:r,field:n,data:o}),"add"===e.type&&this._fireEvent({cType:c.ADD,oType:r,field:n,data:o}),"delete"===e.type&&this._fireEvent({cType:c.REMOVE,oType:r,field:n})}},{key:"data",get:function(){return this._data}}]),SyncObject}(),c=t.ChangeType={UPDATE:"update",ADD:"add",REMOVE:"remove"},l=t.ObjectType={OBJECT:"object",ARRAY:"array"};t.default=u},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(14),o=_interopRequireDefault(n),i=r(3),a=_interopRequireDefault(i),s=r(4),u=_interopRequireDefault(s),c=r(38),l=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(c),d=r(132),f=_interopRequireDefault(d),p=r(36),y=l.getLogger("DataObjectChild"),v=function(){function DataObjectChild(e){function throwMandatoryParmMissingError(e){throw"[DataObjectChild] "+e+" mandatory parameter is missing"}(0,a.default)(this,DataObjectChild);var t=this;e.parent?t._parent=e.parent:throwMandatoryParmMissingError("parent"),e.url?t._url=e.url:throwMandatoryParmMissingError("url"),e.created?t._created=e.created:throwMandatoryParmMissingError("created"),e.reporter?t._reporter=e.reporter:throwMandatoryParmMissingError("reporter"),e.runtime?t._runtime=e.runtime:throwMandatoryParmMissingError("runtime"),e.schema?t._schema=e.schema:throwMandatoryParmMissingError("schema"),e.parentObject?t._parentObject=e.parentObject:throwMandatoryParmMissingError("parentObject"),e.name&&(t._name=e.name),e.description&&(t._description=e.description),e.tags&&(t._tags=e.tags),e.resources&&(t._resources=e.resources),e.observerStorage&&(t._observerStorage=e.observerStorage),e.publicObservation&&(t._publicObservation=e.publicObservation),t._childId=e.url,e.data?t._syncObj=new f.default(e.data):t._syncObj=new f.default({}),y.log("[DataObjectChild -  Constructor] - ",t._syncObj),t._bus=t._parentObject._bus,t._owner=t._parentObject._owner,t._allocateListeners(),t._metadata=e,delete t._metadata.parentObject,t._sharingStatus=!1}return(0,u.default)(DataObjectChild,[{key:"share",value:function(e){var t=this;t._sharingStatus=new o.default(function(r,n){var o=void 0;o=e?t.metadata.parent:t.metadata.parent+"/children/";var i=t.metadata;i.data=t.data;var a={type:"create",from:t.metadata.reporter,to:o,body:{resource:i.url,value:i}};if(t.identity&&(a.body.identity=t.identity),t._parentObject.data.hasOwnProperty("mutual")&&(a.body.mutual=t._parentObject.data.mutual),t._parentObject.metadata.reporter===t.metadata.reporter)return t._bus.postMessage((0,p.deepClone)(a)),r();var s=function(e){if(e.to===t._reporter){t._bus.removeResponseListener(a.from,e.id),y.log("[Syncher.DataObjectChild.share] Parent reporter reply ",e);var o={code:e.body&&e.body.code?e.body.code:500,desc:e.body&&e.body.desc?e.body.desc:"Unknown"};return e.body.code<300?r(o):n(o)}},u=t._bus.postMessage((0,p.deepClone)(a),s,!1);setTimeout(function(){return t._bus.removeResponseListener(a.from,u),n({code:408,desc:"timout"})},3e3)})}},{key:"store",value:function(){var e=this,t={},r=e.metadata.children+"."+e.metadata.url;t.value=e.metadata,t.identity=e.identity;var n={from:e.metadata.reporter,to:e._parentObject._syncher._subURL,type:"create",body:{resource:e.metadata.parent,attribute:r,value:t}};y.log("[DataObjectChild.store]:",n),e._bus.postMessage(n)}},{key:"_allocateListeners",value:function(){var e=this;e._reporter===e._owner&&(e._listener=e._bus.addListener(e._reporter,function(t){"response"===t.type&&t.id===e._msgId&&(y.log("DataObjectChild.onResponse:",t),e._onResponse(t))}))}},{key:"_releaseListeners",value:function(){var e=this;e._listener&&e._listener.remove()}},{key:"delete",value:function(){this._releaseListeners()}},{key:"onChange",value:function(e){this._syncObj.observe(function(t){y.log("[DataObjectChild - observer] - ",t),e(t)})}},{key:"onResponse",value:function(e){this._onResponseHandler=e}},{key:"_onResponse",value:function(e){var t=this,r={type:e.type,url:e.body.source,code:e.body.code};t._onResponseHandler&&t._onResponseHandler(r)}},{key:"shareable",get:function(){var e=this.metadata;return e.data=this.data,e}},{key:"metadata",get:function(){return this._metadata}},{key:"childId",get:function(){return this._childId}},{key:"sharingStatus",get:function(){return this._sharingStatus}},{key:"data",get:function(){return this._syncObj.data}},{key:"identity",set:function(e){this._identity=e},get:function(){return this._identity}}]),DataObjectChild}();t.default=v,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(14),o=_interopRequireDefault(n),i=r(3),a=_interopRequireDefault(i),s=r(4),u=_interopRequireDefault(s),c=r(36),l=function(){function IdentityManager(e,t,r){(0,a.default)(this,IdentityManager);var n=this;n.messageBus=r,n.domain=(0,c.divideURL)(e).domain,n.owner=e,n.runtimeURL=t}return(0,u.default)(IdentityManager,[{key:"discoverUserRegistered",value:function(e,t){var r=this;return new o.default(function(n,o){var i=void 0,a=e||".";i=t||r.owner;var s={type:"read",from:i,to:r.runtimeURL+"/registry/",body:{resource:a,criteria:i}};r.messageBus.postMessage(s,function(e){var t=e.body.resource;t&&200===e.body.code?n(t):o("code: "+e.body.code+" No user was found")})})}},{key:"discoverIdentityPerIdP",value:function(e){var t=this;return new o.default(function(r,n){var o={type:"read",from:this.owner,to:t.runtimeURL+"/idm",body:{resource:e,criteria:"idp"}};t.messageBus.postMessage(o,function(e){200===e.body.code?r(e.body.value):n(e.body.code+" "+e.body.desc)})})}}]),IdentityManager}();t.default=l,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(14),o=_interopRequireDefault(n),i=r(3),a=_interopRequireDefault(i),s=r(4),u=_interopRequireDefault(s),c=r(38),l=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(c),d=r(36),f=r(166),p=_interopRequireDefault(f),y=l.getLogger("Discovery"),v=function(){function Discovery(e,t,r){(0,a.default)(this,Discovery);var n=this;n.messageBus=r,n.runtimeURL=t,n.domain=(0,d.divideURL)(e).domain,n.discoveryURL=e}return(0,u.default)(Discovery,[{key:"_isLegacyUser",value:function(e){return!(!e.includes(":")||e.includes("user://"))}},{key:"discoverHypertiesPerUserProfileData",value:function(e,t,r){var n=this,i=[],a={type:"read",from:n.discoveryURL,to:n.runtimeURL+"/discovery/",body:{resource:"/hyperty/userprofile/"+e}};return(t||r)&&(a.body.criteria={resources:r,dataSchemes:t}),new o.default(function(t,r){n._isLegacyUser(e)?t([{hypertyID:e,status:"live"}]):n.messageBus.postMessage(a,function(r){200===r.body.code?(r.body.value.map(function(e){e.hypertyID!=n.discoveryURL&&i.push(e)}),0===i.length?t([]):(y.log("[Discovery.discoverHypertiesPerUserProfileData] Reply log: ",i),t(i))):(y.warn("[Discovery.discoverHypertiesPerUserProfileData] Error Reply for "+e+" Reason: ",r.body.description),t([]))})})}},{key:"discoverHypertiesPerUserProfileDataDO",value:function(e,t,r){var n=this,i=arguments;return new o.default(function(e,t){n.discoverHypertiesPerUserProfileData.apply(n,i).then(function(t){e(n._convertToDiscoveredObject(t))}).catch(function(e){return t(e)})})}},{key:"discoverDataObjectsPerUserProfileData",value:function(e,t,r){var n=this,i={type:"read",from:n.discoveryURL,to:n.runtimeURL+"/discovery/",body:{resource:"/dataObject/userprofile/"+e}};return(t||r)&&(i.body.criteria={resources:r,dataSchemes:t}),new o.default(function(t,r){n._isLegacyUser(e)?t([{hypertyID:e,status:"live"}]):n.messageBus.postMessage(i,function(r){200===r.body.code?(y.log("Reply log: ",r.body.value),t(r.body.value)):(y.warn("[Discovery.discoverDataObjectsPerUserProfileData] Error Reply for "+e+" Reason: ",r.body.description),t([]))})})}},{key:"discoverDataObjectsPerUserProfileDataDO",value:function(e,t,r){var n=this,i=arguments;return new o.default(function(e,t){n.discoverDataObjectsPerUserProfileData.apply(n,i).then(function(t){return e(n._convertToDiscoveredObject(t))}).catch(function(e){return t(e)})})}},{key:"discoverHypertiesPerGUID",value:function(e,t,r){var n=this,i=[],a={type:"read",from:n.discoveryURL,to:n.runtimeURL+"/discovery/",body:{resource:"/hyperty/guid/"+e}};return(t||r)&&(a.body.criteria={resources:r,dataSchemes:t}),new o.default(function(t,r){n.messageBus.postMessage(a,function(o){200===o.body.code?(o.body.value.map(function(e){e.hypertyID!=n.discoveryURL&&i.push(e)}),0===i.length?r("No Hyperty was found"):(y.log("Reply log: ",i),t(i))):(y.warn("[Discovery.discoverHypertiesPerGUID] Error Reply for "+e+" Reason: ",o.body.description),t([]))})})}},{key:"discoverHypertiesPerGUIDDO",value:function(e,t,r){var n=this,i=arguments;return new o.default(function(e,t){n.discoverHypertiesPerGUID.apply(n,i).then(function(t){e(n._convertToDiscoveredObject(t))}).catch(function(e){return t(e)})})}},{key:"discoverDataObjectsPerGUID",value:function(e,t,r){var n=this,i={type:"read",from:n.discoveryURL,to:n.runtimeURL+"/discovery/",body:{resource:"/dataObject/guid/"+e}};return(t||r)&&(i.body.criteria={resources:r,dataSchemes:t}),new o.default(function(t,r){n.messageBus.postMessage(i,function(r){200===r.body.code?(y.log("Reply log: ",r.body.value),t(r.body.value)):(y.warn("[Discovery.discoverDataObjectsPerGUID] Error Reply for "+e+" Reason: ",r.body.description),t([]))})})}},{key:"discoverDataObjectsPerGUIDDO",value:function(e,t,r){var n=this,i=arguments;return new o.default(function(e,t){n.discoverDataObjectsPerGUID.apply(n,i).then(function(t){return e(n._convertToDiscoveredObject(t))}).catch(function(e){return t(e)})})}},{key:"discoverHyperties",value:function(e,t,r,n){var i=this,a=void 0,s=[];a=n||i.domain;var u={type:"read",from:i.discoveryURL,to:i.runtimeURL+"/discovery/",body:{resource:"/hyperty/user/"+e}};return u.body.criteria=t||r?{resources:r,dataSchemes:t,domain:a}:{domain:a},new o.default(function(t,r){i._isLegacyUser(e)?t([{hypertyID:e,status:"live"}]):i.messageBus.postMessage(u,function(r){200===r.body.code||500===r.body.code?(r.body.value.map(function(e){e.hypertyID!=i.discoveryURL&&s.push(e)}),y.log("[Discovery.discoverHyperties] Reply : ",s),t(s)):(y.warn("[Discovery.discoverHyperties] Error Reply for "+e+" Reason: ",r.body.description),t(s))})})}},{key:"discoverHypertiesDO",value:function(e,t,r,n){var i=this,a=arguments;return new o.default(function(e,t){i.discoverHyperties.apply(i,a).then(function(t){e(i._convertToDiscoveredObject(t))}).catch(function(e){return t(e)})})}},{key:"discoverDataObjects",value:function(e,t,r,n){var i=this,a=void 0;a=n||i.domain;var s={type:"read",from:i.discoveryURL,to:i.runtimeURL+"/discovery/",body:{resource:"/dataObject/user/"+e}};return s.body.criteria=t||r?{resources:r,dataSchemes:t,domain:a}:{domain:a},new o.default(function(t,r){i.messageBus.postMessage(s,function(r){200===r.body.code?(y.log("Reply Value Log: ",r.body.value),t(r.body.value)):(y.warn("[Discovery.discoverDataObjects] Error Reply for "+e+" Reason: ",r.body.description),t([]))})})}},{key:"discoverDataObjectsDO",value:function(e,t,r,n){var i=this,a=arguments;return new o.default(function(e,t){i.discoverDataObjects.apply(i,a).then(function(t){return e(i._convertToDiscoveredObject(t))}).catch(function(e){return t(e)})})}},{key:"discoverHypertyPerURL",value:function(e,t){var r=this,n=void 0;n=t||r.domain;var i={type:"read",from:r.discoveryURL,to:r.runtimeURL+"/discovery/",body:{resource:"/hyperty/url/"+e,criteria:{domain:n}}};return new o.default(function(t,n){r.messageBus.postMessage(i,function(r){200===r.body.code?(y.log("Reply Value Log: ",r.body.value),t(r.body.value)):(y.warn("[Discovery.discoverHypertyPerURL] Error Reply for "+e+" Reason: ",r.body.description),t([]))})})}},{key:"discoverHypertyPerURLDO",value:function(e,t){var r=this,n=arguments;return new o.default(function(e,t){r.discoverHypertyPerURL.apply(r,n).then(function(t){return e(new p.default(t,r.runtimeURL,r.discoveryURL,r.messageBus,r))}).catch(function(e){return t(e)})})}},{key:"discoverDataObjectPerURL",value:function(e,t){var r=this,n=void 0;n=t||r.domain;var i={type:"read",from:r.discoveryURL,to:r.runtimeURL+"/discovery/",body:{resource:"/dataObject/url/"+e,criteria:{domain:n}}};return new o.default(function(t,n){r.messageBus.postMessage(i,function(r){200===r.body.code?(y.log("Reply Value Log: ",r.body.value),t(r.body.value)):(y.warn("[Discovery.discoverDataObjectPerURL] Error Reply for "+e+" Reason: ",r.body.description),t([]))})})}},{key:"discoverDataObjectPerURLDO",value:function(e,t){var r=this,n=arguments;return new o.default(function(e,t){r.discoverDataObjectPerURL.apply(r,n).then(function(t){return e(new p.default(t,r.runtimeURL,r.discoveryURL,r.messageBus,r))}).catch(function(e){return t(e)})})}},{key:"discoverDataObjectsPerName",value:function(e,t,r,n){var i=this,a=void 0;a=n||i.domain;var s={type:"read",from:i.discoveryURL,to:i.runtimeURL+"/discovery/",body:{resource:"/dataObject/name/"+e}};return s.body.criteria=t||r?{resources:r,dataSchemes:t,domain:a}:{domain:a},new o.default(function(t,r){i.messageBus.postMessage(s,function(r){200===r.body.code?(y.log("Reply Value Log: ",r.body.value),t(r.body.value)):(y.warn("[Discovery.discoverDataObjectsPerName] Error Reply for "+e+" Reason: ",r.body.description),t([]))})})}},{key:"discoverDataObjectsPerNameDO",value:function(e,t,r,n){var i=this,a=arguments;return new o.default(function(e,t){i.discoverDataObjectsPerName.apply(i,a).then(function(t){return e(i._convertToDiscoveredObject(t))}).catch(function(e){return t(e)})})}},{key:"discoverDataObjectsPerReporter",value:function(e,t,r,n){var i=this,a=void 0;a=n||i.domain;var s={type:"read",from:i.discoveryURL,to:i.runtimeURL+"/discovery/",body:{resource:"/dataObject/reporter/"+e}};return s.body.criteria=t||r?{resources:r,dataSchemes:t,domain:a}:{domain:a},new o.default(function(t,r){i.messageBus.postMessage(s,function(r){200===r.body.code?(y.log("Reply Value Log: ",r.body.value),t(r.body.value)):(y.warn("[Discovery.discoverDataObjectsPerName] Error Reply for "+e+" Reason: ",r.body.description),t([]))})})}},{key:"discoverDataObjectsPerReporterDO",value:function(e,t,r,n){var i=this,a=arguments;return new o.default(function(e,t){i.discoverDataObjectsPerReporter.apply(i,a).then(function(t){return e(i._convertToDiscoveredObject(t))}).catch(function(e){return t(e)})})}},{key:"_convertToDiscoveredObject",value:function(e){var t=this;return e.map(function(e){return new p.default(e,t.runtimeURL,t.discoveryURL,t.messageBus,t)})}},{key:"discoverDataObject",value:function(e,t,r,n){var i=this,a=void 0;a=n||i.domain;var s={type:"read",from:i.discoveryURL,to:"domain://registry."+a,body:{resource:e,criteria:{resources:r,dataSchemes:t}}};return new o.default(function(t,r){i.messageBus.postMessage(s,function(r){if(y.log("[Discovery]",r),r.body.code>299)return y.warn("[Discovery.discoverDataObject] Error Reply for "+e+" Reason: ",r.body.description),t([]);var n=r.body.value;t(n||[])})})}},{key:"discoverHyperty",value:function(e,t,r,n){var i=this,a=void 0,s=(0,d.convertToUserURL)(e);return a=n||i.domain,new o.default(function(o,u){if(y.log("[Discovery.discoverHyperty] ACTIVE DOMAIN -> ",a,"user->",e,"schema->",t,"resources->",r,"domain->",n),e.includes(":")&&!e.includes("user://")){y.log("[Discovery.discoverHyperty] "+e+" is legacy domain");return o({userID:e,hypertyID:e,schema:t,resources:r})}var c={type:"read",from:i.discoveryURL,to:"domain://registry."+a,body:{resource:s,criteria:{resources:r,dataSchemes:t}}};y.info("[Discovery] msg to send->",c),i.messageBus.postMessage(c,function(e){y.info("[Discovery] ON discoverHyperty->",e);var t=e.body.value;t?o(t):u("No Hyperty was found")})})}},{key:"discoverHypertyPerUser",value:function(e,t){var r=this,n=void 0;return new o.default(function(o,i){if(e.includes(":")&&!e.includes("user://")){y.log("[Discovery.discoverHyperty] "+e+"is legacy domain");return o({id:e,hypertyURL:e,descriptor:"unknown"})}n=t||r.domain;var a="user://"+e.substring(e.indexOf("@")+1,e.length)+"/"+e.substring(0,e.indexOf("@")),s={type:"read",from:r.discoveryURL,to:"domain://registry."+n,body:{resource:a}};y.info("[Discovery] Message: ",s,n,a),r.messageBus.postMessage(s,function(t){y.info("[Discovery] message reply",t);var r=void 0,n=void 0,a=void 0,s=t.body.value;for(r in s)if(void 0!==s[r].lastModified)if(void 0===n)n=new Date(s[r].lastModified),a=r;else{var u=new Date(s[r].lastModified);n.getTime()<u.getTime()&&(n=u,a=r)}y.info("[Discovery] Last Hyperty: ",a,n);var c=a;if(void 0===c)return i("User Hyperty not found");var l={id:e,descriptor:s[c].descriptor,hypertyURL:c};y.info("[Discovery] ===> hypertyDiscovery messageBundle: ",l),o(l)})})}},{key:"discoverHypertiesPerUser",value:function(e,t){var r=this,n=void 0;return y.log("on Function->",e),new o.default(function(o,i){if(e.includes(":")&&!e.includes("user://")){y.log("[Discovery.discoverHyperty] is legacy domain");var a={userID:e,hypertyID:e,schema:schema,resources:resources};return o(a)}n=t||r.domain;var s="user://"+e.substring(e.indexOf("@")+1,e.length)+"/"+e.substring(0,e.indexOf("@")),u={type:"read",from:r.discoveryURL,to:"domain://registry."+n,body:{resource:s}};y.log("[Discovery] Message discoverHypertiesPerUser: ",u,n,s),r.messageBus.postMessage(u,function(e){y.info("[Discovery] discoverHypertiesPerUser reply",e);var t=e.body.value;if(!t)return i("User Hyperty not found");o(t)})})}},{key:"resumeDiscoveries",value:function(){var e=this;return y.log("[Discovery] resumeDiscoveries"),new o.default(function(t,r){var n={type:"read",from:e.discoveryURL,to:e.runtimeURL+"/subscriptions",body:{resource:e.discoveryURL}};e.messageBus.postMessage(n,function(r){y.log("[Discovery.resumeDiscoveries] reply: ",r);var n=[];if(200===r.body.code){r.body.value.forEach(function(t){var r=t.split("/registration")[0];({}).url=r,y.log("[Discovery.resumeDiscoveries] adding listener to: ",r),r.includes("hyperty://")?n.push(e.discoverHypertyPerURLDO(r)):n.push(e.discoverDataObjectPerURLDO(r))}),o.default.all(n).then(function(e){t(e)})}else t([])})})}}]),Discovery}();t.default=v,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(48),o=_interopRequireDefault(n),i=r(14),a=_interopRequireDefault(i),s=r(26),u=_interopRequireDefault(s),c=r(3),l=_interopRequireDefault(c),d=r(4),f=_interopRequireDefault(d),p=r(34),y=_interopRequireDefault(p),v=r(35),h=_interopRequireDefault(v),_=r(137),b=_interopRequireDefault(_),m=function(e){function ContextObserver(e,t,r,n,o,i){if((0,l.default)(this,ContextObserver),!e)throw new Error("The hypertyURL is a needed parameter");if(!t)throw new Error("The MiniBus is a needed parameter");if(!r)throw new Error("The configuration is a needed parameter ");if(!o)throw new Error("The factory is a needed parameter ");var a=(0,y.default)(this,(ContextObserver.__proto__||(0,u.default)(ContextObserver)).call(this)),s=a;s._contextResourceTypes=n,s._url=e,s._discoverUsersPromises={},s._observePromises={},s._domain=o.divideURL(r.runtimeURL).domain,s._objectDescURL="hyperty-catalogue://catalogue."+s._domain+"/.well-known/dataschema/Context",s._users2observe=[],s._observers={},a._syncher=i||o.createSyncher(e,t,r);var c=o.createDiscovery(e,r.runtimeURL,t);return s._discovery=c,s._discoveries={},window.discovery=s._discovery,a}return(0,h.default)(ContextObserver,e),(0,f.default)(ContextObserver,[{key:"start",value:function(e,t){var r=this;return new a.default(function(n,i){r._syncher.resumeObservers({store:!0}).then(function(i){var a=(0,o.default)(i);a.length>0?(r._observers=i,n(i),a.forEach(function(r){var n=i[r];e&&(context.data.values=e),n.sync(),t&&n.onDisconnected(t)})):n(!1)}).catch(function(e){n(!1)})}).catch(function(e){reject("[ContextObserver] Start failed | ",e)})}},{key:"resumeDiscoveries",value:function(){var e=this;return new a.default(function(t,r){e._discovery.resumeDiscoveries().then(function(r){r.forEach(function(r){r.data.resources&&r.data.resources[0]===e._contextResourceTypes[0]&&("live"===r.data.status?(t([r.data]),r.unsubscribeLive(e._url)):r.onLive(e._url,function(){t([r.data]),r.unsubscribeLive(e._url)}))})})}).catch(function(e){reject("[ContextObserver] resumeDiscoveries failed | ",e)})}},{key:"onResumeObserver",value:function(e){this._onResumeObserver=e}},{key:"discoverUsers",value:function(e,t){var r=this,n=e+"@"+t;return r._discoverUsersPromises[n]||(r._discoverUsersPromises[n]=new a.default(function(n,o){r._discovery.discoverHypertiesDO(e,["context"],r._contextResourceTypes,t).then(function(e){var t=[],o=[];e.forEach(function(e){r._discoveries[e.data.hypertyID]=e,"live"===e.data.status?t.push(e.data):o.push(e)}),t.length>0?n(t):o.length>0&&o[0].onLive(r._url,function(){t.push(o[0].data),n(t),o[0].unsubscribeLive(r._url)})})})),r._discoverUsersPromises[n]}},{key:"observe",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],r=this;return r._observePromises[e.hypertyID]||(r._observePromises[e.hypertyID]=new a.default(function(n,o){r._users2observe.forEach(function(t){if(t._reporter===e.hypertyID)return n(t)}),r._discovery.discoverDataObjectsPerReporter(e.hypertyID,["context"],r._contextResourceTypes,r._domain).then(function(i){var a=0,s=void 0;i.forEach(function(e){e.hasOwnProperty("lastModified")&&e.hasOwnProperty("url")&&Date.parse(e.lastModified)>a&&(a=e.lastModified,s=e.url)}),0!=a&&s?n(r._subscribeContext(e,s,t)):o("[ContextObserver.observe] discovered DataObjecs are invalid",i)})})),r._observePromises[e.hypertyID]}},{key:"_subscribeContext",value:function(e,t){var r=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],n=this;return new a.default(function(e,o){n._users2observe.forEach(function(r){if(r.url===t)return e(r)});var i={schema:n._objectDescURL,resource:t,store:null,p2p:null,mutual:null,domain_subscription:r};n._syncher.subscribe(i).then(function(t){n._users2observe.push(t),t.onDisconnected(function(){t.data.values[0].value="unavailable",t.sync()}),e(t)})})}},{key:"_discoverAndSubscribeLegacyUsers",value:function(e){var t=this;return new a.default(function(r,n){t._discovery.discoverDataObjectsPerName(e).then(function(e){e.forEach(function(e){"live"===e.status&&(e.hypertyID||(e.hypertyID=e.reporter),t._subscribeContext(e.schema,e.url).then(function(e){return r(e)}))})}).catch(function(e){})})}},{key:"unobserve",value:function(e){var t=this;t._users2observe.forEach(function(r,n){r.url===e&&(r.unsubscribe(),t._users2observe.splice(n,1))})}}]),ContextObserver}(b.default);t.default=m,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(3),o=_interopRequireDefault(n),i=r(4),a=_interopRequireDefault(i),s=function(){function EventEmitter(){(0,o.default)(this,EventEmitter)}return(0,a.default)(EventEmitter,[{key:"addEventListener",value:function(e,t){this[e]=t}},{key:"trigger",value:function(e,t){var r=this;r[e]&&r[e](t)}}]),EventEmitter}();t.default=s,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(48),o=_interopRequireDefault(n),i=r(14),a=_interopRequireDefault(i),s=r(26),u=_interopRequireDefault(s),c=r(3),l=_interopRequireDefault(c),d=r(4),f=_interopRequireDefault(d),p=r(34),y=_interopRequireDefault(p),v=r(35),h=_interopRequireDefault(v),_=r(137),b=_interopRequireDefault(_),m=function(e){function ContextReporter(e,t,r,n,o){if((0,l.default)(this,ContextReporter),!e)throw new Error("The hypertyURL is a needed parameter");if(!t)throw new Error("The MiniBus is a needed parameter");if(!r)throw new Error("The configuration is a needed parameter");var i=(0,y.default)(this,(ContextReporter.__proto__||(0,u.default)(ContextReporter)).call(this,e,t,r));return i.syncher=o||n.createSyncher(e,t,r),i.domain=n.divideURL(r.runtimeURL).domain,i.contexts={},i.contextDescURL="hyperty-catalogue://catalogue."+i.domain+"/.well-known/dataschema/Context",i.syncher.onNotification(function(e){i.onNotification(e)}),i.syncher.onClose(function(e){i.setStatus(e.id,"unavailable"),e.ack()}),i}return(0,h.default)(ContextReporter,e),(0,f.default)(ContextReporter,[{key:"start",value:function(){var e=this,t=this;return new a.default(function(r,n){e.syncher.resumeReporters({store:!0}).then(function(e){var n=(0,o.default)(e);n.length>0?(t.contexts=e,n.forEach(function(e){t._onSubscription(t.contexts[e])}),r(t.contexts)):r(!1)}).catch(function(e){})}).catch(function(e){reject("[ContextReporter] Start failed | ",e)})}},{key:"processNotification",value:function(e){e.ack()}},{key:"create",value:function(e,t,r){var n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"myContext",o=arguments.length>4&&void 0!==arguments[4]?arguments[4]:null,i=arguments.length>5&&void 0!==arguments[5]?arguments[5]:null,s=this,u=void 0;return new a.default(function(a,c){u=o||i?o&&!i?{resources:r,expires:30,reporter:o}:!o&&i?{resources:r,expires:30,reuseURL:i}:{resources:r,expires:30,reuseURL:i,reporter:o}:{resources:r,expires:30},s.syncher.create(s.contextDescURL,[],t,!0,!1,n,null,u).then(function(t){s.contexts[e]=t,s._onSubscription(t),a(t)}).catch(function(e){c(e)})})}},{key:"_onSubscription",value:function(e){e.onSubscription(function(e){e.accept()})}},{key:"setContext",value:function(e,t){var r=this;r.contexts[e].data.values=t,r.trigger(e+"-context-update",t)}}]),ContextReporter}(b.default);t.default=m,e.exports=t.default},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.CommunicationStatus={OPEN:"open",PENDING:"pending",CLOSED:"closed",PAUSED:"paused",FAILED:"failed"},t.communicationObject={startingTime:"",status:"",participants:{}},t.communicationChildren={parent:"communication",listener:"resources",type:"HypertyResource"}},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(14),o=_interopRequireDefault(n),i=r(65),a=_interopRequireDefault(i),s=r(3),u=_interopRequireDefault(s),c=r(4),l=_interopRequireDefault(c),d=r(125),f=_interopRequireDefault(d),p=r(171),y=_interopRequireDefault(p),v=function(){function ChatController(e,t,r,n,o,i){if((0,u.default)(this,ChatController),!e)throw Error("Syncher is a necessary dependecy");if(!t)throw Error("Discover is a necessary dependecy");if(!r)throw Error("Domain is a necessary dependecy");if(!n)throw Error("Search is a necessary dependecy");var a=this;a._syncher=e,a.discovery=t,a.search=n,a.myIdentity=o,a.controllerMode="reporter",a.child_cseq=0,a.domain=r,a._manager=i;var s=e.owner;a._objectDescURL="hyperty-catalogue://catalogue."+r+"/.well-known/dataschema/Communication",a._invitationsHandler=new y.default(s)}return(0,l.default)(ChatController,[{key:"_setOnAddChildListener",value:function(e){var t=this;e.onAddChild(function(e){t.child_cseq+=1,t._onMessage&&t._onMessage(e)})}},{key:"_onSubscribe",value:function(e){var t=this._dataObjectReporter;e.accept();var r=JSON.parse((0,a.default)(e.identity));r.hasOwnProperty("assertion")&&delete r.assertion;var n={hypertyURL:e.url,domain:e.domain,identity:r},o=e.identity.userProfile.guid;e.identity.legacy&&(n.legacy=e.identity.legacy),t.data.participants[o]=n,this._onUserAdded&&this._onUserAdded(n)}},{key:"_onUnsubscribe",value:function(e){var t=this._dataObjectReporter,r=e.identity.userProfile;e.identity.legacy&&(r.legacy=e.identity.legacy),delete t.data.participants[r.userURL],this._onUserRemoved&&this._onUserRemoved(r)}},{key:"sendFile",value:function(e){var t=this,r=t.controllerMode,n="reporter"===r?t.dataObjectReporter:t.dataObjectObserver;return new o.default(function(r,o){var i={userProfile:t.myIdentity};n.addHypertyResource("resources","file",e,i).then(function(e){var o={userProfile:t.myIdentity},i={value:e,identity:o,resource:e},a=new f.default(n.url,t._manager._runtimeURL,t._manager._hypertyURL,t._manager._bus);!function share2Reporter(e,t,n,o){var i=o;e.sharingStatus.then(r(n)).catch(function(r){i.onLive(t,function(){i.unsubscribeLive(t),e.share(!0),share2Reporter(e,t,n,i)})})}(e,t._manager._hypertyURL,i,a)})}).catch(function(e){reject(e)})}},{key:"send",value:function(e,t){var r=this,n=r.controllerMode,i="reporter"===n?r.dataObjectReporter:r.dataObjectObserver;return new o.default(function(n,o){r.child_cseq+=1;var a={type:"chat",content:e},s=t||{userProfile:r.myIdentity};i.addChild(a,s).then(function(e){var t={childId:e._childId,from:e._owner,value:e.data,type:"create",identity:s},o=new f.default(i.url,r._manager._runtimeURL,r._manager._hypertyURL,r._manager._bus);!function share2Reporter(e,t,r,o){var i=o;e.sharingStatus.then(n(r)).catch(function(n){i.onLive(t,function(){i.unsubscribeLive(t),e.share(!0),share2Reporter(e,t,r,i)})})}(e,r._manager._hypertyURL,t,o)}).catch(function(e){o(e)})})}},{key:"onChange",value:function(e){this._onChange=e}},{key:"onMessage",value:function(e){this._onMessage=e}},{key:"onUserAdded",value:function(e){this._onUserAdded=e}},{key:"onUserRemoved",value:function(e){this._onUserRemoved=e}},{key:"onClose",value:function(e){this._onClose=e}},{key:"onResponse",value:function(e){this._onResponse=e}},{key:"addUser",value:function(e){var t=this,r=function(e){return 0!==e.length};return new o.default(function(n,i){if(0===e.filter(r).length)return i("Don't have users to invite");var a=[],s=[],u={};e.forEach(function(e){var r=t.discovery.discoverHypertiesDO(e.user,["comm"],["chat"],e.domain);a.push(r)}),o.default.all(a).then(function(e){var r=[];e.forEach(function(e){e.forEach(function(e){"live"===e.data.status?(r.push(e.data.hypertyID),u[e.data.hypertyID]=e):s.length<5&&s.push(e)})});var n="reporter"===t.controllerMode?t.dataObjectReporter:t.dataObjectObserver;s.length>0&&t._invitationsHandler.inviteDisconnectedHyperties(s,n),n.inviteObservers(r),n.invitations.length>0&&t._invitationsHandler.processInvitations(u,n)}).then(function(){n(!0)}).catch(function(e){i(e)})})}},{key:"addUserReq",value:function(e){var t=this,r=function(e){return 0!==e.length};return new o.default(function(n,o){if(0===e.filter(r).length)return o("[ChatManager.ChatController.addUserReq] Don't have users to add");if("observer"===!t.controllerMode){return o("[ChatManager.ChatController.addUserReq] only allowed to Chat Observer")}})}},{key:"onInvitationResponse",value:function(e){var t=this;t._onInvitationResponse=e,t._invitationsHandler.invitationResponse=e}},{key:"removeUser",value:function(e){}},{key:"close",value:function(){var e=!(arguments.length>0&&void 0!==arguments[0])||arguments[0],t=this;return new o.default(function(r,n){if("reporter"===t.controllerMode)t._invitationsHandler.cleanInvitations(t.dataObjectReporter).then(function(){if(e)try{delete t._manager._reportersControllers[t.dataObjectReporter.url],t.dataObjectReporter.delete(),r(!0),t._onClose&&t._onClose({code:200,desc:"deleted",url:t.dataObjectReporter.url})}catch(e){n(!1)}else t._manager.communicationObject.status="closed",r(!0)});else if(e)try{delete t._manager._observersControllers[t.dataObjectObserver.url],t.dataObjectObserver.unsubscribe(),r(!0)}catch(e){n(!1)}else r(!0)})}},{key:"invitationsHandler",get:function(){return this._invitationsHandler}},{key:"url",get:function(){return"reporter"===this.controllerMode?this.dataObjectReporter.url:this.dataObjectObserver.url}},{key:"dataObjectReporter",set:function(e){if(!e)throw new Error("[ChatController] The data object reporter is necessary parameter ");var t=this;t.controllerMode="reporter",e.onSubscription(function(e){switch(e.type){case"subscribe":t._onSubscribe(e);break;case"unsubscribe":t._onUnsubscribe(e)}}),t._setOnAddChildListener(e),e.onRead(function(e){e.accept()}),e.onExecute(function(e){switch(e.method){case"addUser":t.addUser(e.params[0]).then(function(){e.accept()}).catch(function(t){e.reject(t)});break;case"removeUser":t.removeUser(e.params).then(function(){e.accept()}).catch(function(t){e.reject(t)});break;default:e.reject("[ChatController.onExecute] Chat method execution not accepted by Reporter")}}),t._dataObjectReporter=e},get:function(){return this._dataObjectReporter}},{key:"messages",get:function(){return"reporter"===this.controllerMode?this._dataObjectReporter._childrenObjects:this._dataObjectObserver._childrenObjects}},{key:"dataObjectObserver",set:function(e){var t=this;t.controllerMode="observer",t._dataObjectObserver=e,e.onChange("*",function(e){if(e.field.includes("participants"))switch(e.cType){case"add":t._onUserAdded&&t._onUserAdded(e);break;case"remove":t._onUserRemoved&&t._onUserRemoved(e)}t._onChange&&t._onChange(e)}),t._setOnAddChildListener(e)},get:function(){return this._dataObjectObserver}},{key:"dataObject",get:function(){return"reporter"===this.controllerMode?this.dataObjectReporter:this.dataObjectObserver}},{key:"closeEvent",set:function(e){var t=this;t._closeEvent=e,t._onClose&&t._onClose(e)},get:function(){return this._closeEvent}}]),ChatController}();t.default=v,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0}),t.UserInfo=void 0;var n=r(172),o=_interopRequireDefault(n),i=r(3),a=_interopRequireDefault(i),s=r(36);t.UserInfo=function UserInfo(e,t,r){var n;(0,a.default)(this,UserInfo);var i=(0,s.deepClone)(r);return r.hasOwnProperty("userProfile")||(i.userProfile=r),n={hypertyURL:e,domain:t},(0,o.default)(n,"domain",t),(0,o.default)(n,"identity",i),n}},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(14),o=_interopRequireDefault(n),i=r(65),a=_interopRequireDefault(i),s=r(3),u=_interopRequireDefault(s),c=r(4),l=_interopRequireDefault(c),d=function(){function Chat(e,t,r,n){if((0,u.default)(this,Chat),!e)throw Error("Syncher is a necessary dependecy");if(!t)throw Error("Domain is a necessary dependecy");var o=this;o._syncher=e,o.myIdentity=r,o.controllerMode="reporter",o.child_cseq=0,o.domain=t,o._manager=n;e.owner;o._objectDescURL="hyperty-catalogue://catalogue."+t+"/.well-known/dataschema/Communication"}return(0,l.default)(Chat,[{key:"_setOnAddChildListener",value:function(e){var t=this;e.onAddChild(function(e){t.child_cseq+=1,t._onMessage&&t._onMessage(e)})}},{key:"_onSubscribe",value:function(e){var t=this._dataObjectReporter;e.accept();var r=JSON.parse((0,a.default)(e.identity));r.hasOwnProperty("assertion")&&delete r.assertion;var n={hypertyURL:e.url,domain:e.domain,identity:r},o=e.identity.userProfile.guid;e.identity.legacy&&(n.legacy=e.identity.legacy),t.data.participants[o]=n,this._onUserAdded&&this._onUserAdded(n)}},{key:"_onUnsubscribe",value:function(e){var t=this._dataObjectReporter,r=e.identity.userProfile;e.identity.legacy&&(r.legacy=e.identity.legacy),delete t.data.participants[r.userURL],this._onUserRemoved&&this._onUserRemoved(r)}},{key:"sendFile",value:function(e){var t=this,r=t.controllerMode,n="reporter"===r?t.dataObjectReporter:t.dataObjectObserver;return new o.default(function(r,o){var i={userProfile:t.myIdentity};n.addHypertyResource("resources","file",e,i).then(function(e){var n={userProfile:t.myIdentity};r({value:e,identity:n,resource:e})})}).catch(function(e){reject(e)})}},{key:"send",value:function(e,t){var r=this,n=r.controllerMode,i="reporter"===n?r.dataObjectReporter:r.dataObjectObserver;return new o.default(function(n,o){r.child_cseq+=1;var a={type:"chat",content:e},s=t||{userProfile:r.myIdentity};i.addChild(a,s).then(function(e){var t={childId:e._childId,from:e._owner,value:e.data,type:"create",identity:s};n(t)}).catch(function(e){o(e)})})}},{key:"onChange",value:function(e){this._onChange=e}},{key:"onMessage",value:function(e){this._onMessage=e}},{key:"onUserAdded",value:function(e){this._onUserAdded=e}},{key:"onUserRemoved",value:function(e){this._onUserRemoved=e}},{key:"onClose",value:function(e){this._onClose=e}},{key:"onResponse",value:function(e){this._onResponse=e}},{key:"onInvitationResponse",value:function(e){this._onInvitationResponse=e}},{key:"removeUser",value:function(e){}},{key:"close",value:function(){var e=!(arguments.length>0&&void 0!==arguments[0])||arguments[0],t=this;return new o.default(function(r,n){if("reporter"===t.controllerMode)if(e)try{delete t._manager._reportersControllers[t.dataObjectReporter.url],t.dataObjectReporter.delete(),r(!0),t._onClose&&t._onClose({code:200,desc:"deleted",url:t.dataObjectReporter.url})}catch(e){n(!1)}else t._manager.communicationObject.status="closed",r(!0);else if(e)try{delete t._manager._observersControllers[t.dataObjectObserver.url],t.dataObjectObserver.unsubscribe(),r(!0)}catch(e){n(!1)}else r(!0)})}},{key:"url",get:function(){return"reporter"===this.controllerMode?this.dataObjectReporter.url:this.dataObjectObserver.url}},{key:"dataObjectReporter",set:function(e){if(!e)throw new Error("[ChatController] The data object reporter is necessary parameter ");var t=this;t.controllerMode="reporter",e.onSubscription(function(e){switch(e.type){case"subscribe":t._onSubscribe(e);break;case"unsubscribe":t._onUnsubscribe(e)}}),t._setOnAddChildListener(e),e.onRead(function(e){e.accept()}),e.onExecute(function(e){switch(e.method){case"addUser":t.addUser(e.params[0]).then(function(){e.accept()}).catch(function(t){e.reject(t)});break;case"removeUser":t.removeUser(e.params).then(function(){e.accept()}).catch(function(t){e.reject(t)});break;default:e.reject("[ChatController.onExecute] Chat method execution not accepted by Reporter")}}),t._dataObjectReporter=e},get:function(){return this._dataObjectReporter}},{key:"messages",get:function(){return"reporter"===this.controllerMode?this._dataObjectReporter._childrenObjects:this._dataObjectObserver._childrenObjects}},{key:"dataObjectObserver",set:function(e){var t=this;t.controllerMode="observer",t._dataObjectObserver=e,e.onChange("*",function(e){if(e.field.includes("participants"))switch(e.cType){case"add":t._onUserAdded&&t._onUserAdded(e);break;case"remove":t._onUserRemoved&&t._onUserRemoved(e)}t._onChange&&t._onChange(e)}),t._setOnAddChildListener(e)},get:function(){return this._dataObjectObserver}},{key:"dataObject",get:function(){return"reporter"===this.controllerMode?this.dataObjectReporter:this.dataObjectObserver}},{key:"closeEvent",set:function(e){var t=this;t._closeEvent=e,t._onClose&&t._onClose(e)},get:function(){return this._closeEvent}}]),Chat}();t.default=d,e.exports=t.default},,,,,,,,,,,,function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0}),t.ContextReporter=t.ContextObserver=t.IdentityManager=t.Discovery=t.Syncher=t.SandboxFactory=t.SandboxRegistry=t.SandboxType=t.Sandbox=void 0;var n=r(155),o=_interopRequireDefault(n),i=r(128),a=_interopRequireDefault(i),s=r(129),u=_interopRequireDefault(s),c=r(130),l=_interopRequireDefault(c),d=r(135),f=_interopRequireDefault(d),p=r(134),y=_interopRequireDefault(p),v=r(136),h=_interopRequireDefault(v),_=r(138),b=_interopRequireDefault(_);t.Sandbox=o.default,t.SandboxType=n.SandboxType,t.SandboxRegistry=a.default,t.SandboxFactory=u.default,t.Syncher=l.default,t.Discovery=f.default,t.IdentityManager=y.default,t.ContextObserver=h.default,t.ContextReporter=b.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0}),t.SandboxType=void 0;var n=r(48),o=_interopRequireDefault(n),i=r(14),a=_interopRequireDefault(i),s=r(26),u=_interopRequireDefault(s),c=r(3),l=_interopRequireDefault(c),d=r(4),f=_interopRequireDefault(d),p=r(34),y=_interopRequireDefault(p),v=r(35),h=_interopRequireDefault(v),_=r(128),b=_interopRequireDefault(_),m=r(126),g=_interopRequireDefault(m),R=(t.SandboxType={APP:"app",NORMAL:"normal",WINDOW:"window"},function(e){function Sandbox(e){(0,l.default)(this,Sandbox);var t=(0,y.default)(this,(Sandbox.__proto__||(0,u.default)(Sandbox)).call(this)),r=t;return e&&(r.capabilities=e),t}return(0,h.default)(Sandbox,e),(0,f.default)(Sandbox,[{key:"deployComponent",value:function(e,t,r){var n=this;return new a.default(function(o,i){var a={type:"create",from:b.default.ExternalDeployAddress,to:b.default.InternalDeployAddress,body:{url:t,sourceCode:e,config:r}};n.postMessage(a,function(e){200===e.body.code?o("deployed"):i(e.body.desc)})})}},{key:"removeComponent",value:function(e){var t=this;return new a.default(function(r,n){var o={type:"delete",from:b.default.ExternalDeployAddress,to:b.default.InternalDeployAddress,body:{url:e}};t.postMessage(o,function(e){200===e.body.code?r("undeployed"):n(e.body.desc)})})}},{key:"matches",value:function(e){var t=this,r=(0,o.default)(e).filter(function(r){return!(t.capabilities[r]&&t.capabilities[r]===e[r])});return 0===r.length||!e[r]}}]),Sandbox}(g.default));t.default=R},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(48),o=_interopRequireDefault(n),i=r(65),a=_interopRequireDefault(i),s=r(14),u=_interopRequireDefault(s),c=r(26),l=_interopRequireDefault(c),d=r(3),f=_interopRequireDefault(d),p=r(4),y=_interopRequireDefault(p),v=r(34),h=_interopRequireDefault(v),_=r(116),b=_interopRequireDefault(_),m=r(35),g=_interopRequireDefault(m),R=r(38),O=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(R),w=r(131),D=_interopRequireDefault(w),j=r(36),k=O.getLogger("DataObjectReporter"),L=function(e){function DataObjectReporter(e){(0,f.default)(this,DataObjectReporter);var t=(0,h.default)(this,(DataObjectReporter.__proto__||(0,l.default)(DataObjectReporter)).call(this,e)),r=t;return r._subscriptions={},r._syncObj.observe(function(e){k.log("[Syncher.DataObjectReporter] "+r.url+" publish change: ",e),r._onChange(e)}),r._allocateListeners(),r.invitations=[],r._childrenSizeThreshold=5e4,t}return(0,g.default)(DataObjectReporter,e),(0,y.default)(DataObjectReporter,[{key:"_allocateListeners",value:function(){(0,b.default)(DataObjectReporter.prototype.__proto__||(0,l.default)(DataObjectReporter.prototype),"_allocateListeners",this).call(this);var e=this;e._objectListener=e._bus.addListener(e._url,function(t){switch(k.log("[Syncher.DataObjectReporter] listener "+e._url+" Received: ",t),t.type){case"response":e._onResponse(t);break;case"read":e._onRead(t);break;case"execute":e._onExecute(t);break;case"create":e._onChildCreate(t)}}),e._runtimeStatusListener=e._bus.addListener(e._syncher._runtimeUrl+"/status",function(t){t.body&&t.body.resource&&t.body.resource===e._url&&t.body.value&&t.body.value.backupRevision&&(e.data.backupRevision=t.body.value.backupRevision)})}},{key:"_releaseListeners",value:function(){(0,b.default)(DataObjectReporter.prototype.__proto__||(0,l.default)(DataObjectReporter.prototype),"_releaseListeners",this).call(this),this._objectListener.remove()}},{key:"inviteObservers",value:function(e,t){var r=this,n=e;n.length>0&&(k.log("[Syncher.DataObjectReporter] InviteObservers ",n,r._metadata),n.forEach(function(e){var n=new u.default(function(n,o){var i={type:"create",from:r._syncher._owner,to:r._syncher._subURL,body:{resume:!1,resource:r._url,schema:r._schema,value:r._metadata,authorise:[e]}};t&&(i.body.p2p=t),r.data.mutual||(i.body.mutual=r.data.mutual),r._bus.postMessage(i,function(t){k.log("[Syncher.DataObjectReporter] Invitation reply ",t);var r={invited:e,code:t.body&&t.body.code?t.body.code:500,desc:t.body&&t.body.desc?t.body.desc:"Unknown"};r.code<300?n(r):o(r)})});r.invitations.push(n)}))}},{key:"delete",value:function(){var e=this;e._heartBeat&&e._heartBeat.stop(),e._deleteChildrens().then(function(t){k.log(t);var r={type:"delete",from:e._owner,to:e._syncher._subURL,body:{resource:e._url}};e._bus.postMessage(r,function(t){k.log("DataObjectReporter-DELETE: ",t),200===t.body.code&&(e._releaseListeners(),delete e._syncher._reporters[e._url],e._syncObj={})})})}},{key:"onSubscription",value:function(e){this._onSubscriptionHandler=e}},{key:"onResponse",value:function(e){this._onResponseHandler=e}},{key:"onRead",value:function(e){this._onReadHandler=e}},{key:"onExecute",value:function(e){this._onExecuteHandler=e}},{key:"_onForward",value:function(e){var t=this;switch(k.log("DataObjectReporter-RCV: ",e),e.body.type){case"subscribe":t._onSubscribe(e);break;case"unsubscribe":t._onUnSubscribe(e)}}},{key:"_onSubscribe",value:function(e){var t=this,r=e.body.from,n=(0,j.divideURL)(r),o=n.domain,i=!0;e.body.hasOwnProperty("mutual")&&!e.body.mutual&&(i=!1);var a={type:e.body.type,url:r,domain:o,identity:e.body.identity,nutual:i,accept:function(){var n={url:r,status:"live"};t._subscriptions[r]=n,t.metadata.subscriptions&&t.metadata.subscriptions.push(n.url);var o=(0,j.deepClone)(t._metadata);o.data=(0,j.deepClone)(t.data),o.version=t._version;var i={id:e.id,type:"response",from:e.to,to:e.from,body:{code:200,schema:t._schema,value:o}};return e.body.hasOwnProperty("mutual")&&!e.body.mutual&&(i.body.mutual=e.body.mutual,t.data.mutual=!1),t._heartBeat&&(i.body.value.childrenObjects={},i.body.value.childrenObjects.heartbeat=t._heartBeat.heartbeat),t._bus.postMessage(i),n},reject:function(r){t._bus.postMessage({id:e.id,type:"response",from:e.to,to:e.from,body:{code:403,desc:r}})}};t._onSubscriptionHandler&&(k.log("SUBSCRIPTION-EVENT: ",a),t._onSubscriptionHandler(a))}},{key:"_onUnSubscribe",value:function(e){var t=this,r=e.body.from,n=(0,j.divideURL)(r),o=n.domain;k.log("[DataObjectReporter._onUnSubscribe]",e,o,n),delete t._subscriptions[r],delete t.invitations[r];var i={type:e.body.type,url:r,domain:o,identity:e.body.identity};t._onSubscriptionHandler&&(k.log("UN-SUBSCRIPTION-EVENT: ",i),t._onSubscriptionHandler(i))}},{key:"_onResponse",value:function(e){var t=this,r={type:e.type,url:e.from,code:e.body.code};t._onResponseHandler&&(k.log("RESPONSE-EVENT: ",r),t._onResponseHandler(r))}},{key:"_onRead",value:function(e){var t=this,r=(0,a.default)(t.childrensJSON).length,n=r>t._childrenSizeThreshold,i={type:e.type,url:e.from,accept:function(){n?t._syncReplyForLargeData(e):t._syncReply(e)},reject:function(r){t._bus.postMessage({id:e.id,type:"response",from:e.to,to:e.from,body:{code:401,desc:r}})}},s=[];t.metadata.subscriptions?s=t.metadata.subscriptions:t._subscriptions&&(s=(0,o.default)(t._subscriptions).map(function(e){return t._subscriptions[e].url})),-1!=s.indexOf(e.from)?n?t._syncReplyForLargeData(e):t._syncReply(e):t._onReadHandler&&(k.log("READ-EVENT: ",i),t._onReadHandler(i))}},{key:"_syncReply",value:function(e){var t=this,r=(0,j.deepClone)(t.metadata);r.data=(0,j.deepClone)(t.data),r.childrenObjects=(0,j.deepClone)(t.childrensJSON),r.version=t._version;var n={id:e.id,type:"response",from:e.to,to:e.from,body:{code:200,value:r}};t._bus.postMessage(n)}},{key:"_syncReplyForLargeData",value:function(e){var t=this,r=(0,j.deepClone)(t.metadata);r.data=(0,j.deepClone)(t.data),r.version=t._version,delete r.childrenObjects;var n=[],o={};for(child in t._childrenObjects)o[child]={},(0,a.default)(o).length>t._childrenSizeThreshold&&n.push(o),o[child]={},o[child].value=t._childrenObjects[child].metadata,o[child].identity=t._childrenObjects[child].identity;n.push(o),r.responses=n.length+1;var i={id:e.id,type:"response",from:e.to,to:e.from,body:{code:100,value:r}};t._bus.postMessage(i),n.forEach(function(e){var n=(0,j.deepClone)(i);n.body.value=e,n.body.value.responses=r.responses,setTimeout(function(){t._bus.postMessage(n)},50)})}},{key:"_onExecute",value:function(e){var t=this;if(!e.body.method)throw e;var r={id:e.id,type:"response",from:e.to,to:e.from,body:{code:200}},n={type:e.type,url:e.from,method:e.body.method,params:e.body.params,accept:function(){t._bus.postMessage(r)},reject:function(r){t._bus.postMessage({id:e.id,type:"response",from:e.to,to:e.from,body:{code:401,desc:r}})}};t._onExecuteHandler&&(k.log("[DataObjectReporter] EXECUTE-EVENT: ",n),t._onExecuteHandler(n))}},{key:"subscriptions",get:function(){return this._subscriptions}},{key:"childrensJSON",get:function(){var e=this,t={},r=void 0;for(r in e._childrenObjects)t[r]={},t[r].value=e._childrenObjects[r].metadata,t[r].identity=e._childrenObjects[r].identity;return t}}]),DataObjectReporter}(D.default);t.default=L,e.exports=t.default},function(e,t){!function(){"use strict";function Observer(e,t,r,n,o,i){function deliver(e,n){if(deliver.delay=n,!deliver.pause&&s.changeset.length>0){if(!e){var o=s.changeset.filter(function(e){return!r||r.indexOf(e.type)>=0});o.length>0&&t(o)}s.changeset=[]}}var a,s=this;return deliver.pause=o,deliver.delay=i,s.get=function(e,t){return"__observer__"===t?s:"unobserve"===t?function(){return Object.unobserve(e),e}:"deliver"===t?deliver:e[t]},s.target=e,s.changeset=[],s.target.__observerCallbacks__||(Object.defineProperty(e,"__observerCallbacks__",{enumerable:!1,configurable:!0,writable:!1,value:[]}),Object.defineProperty(e,"__observers__",{enumerable:!1,configurable:!0,writable:!1,value:[]})),s.target.__observerCallbacks__.push(t),s.target.__observers__.push(this),a=new Proxy(e,s),deliver(!1,i),a}Object.observe||"function"!=typeof Proxy||(Observer.prototype.deliver=function(){return this.get(null,"deliver")},Observer.prototype.set=function(e,t,r){var n=e[t],o=void 0===n?"add":"update";if(e[t]=r,e.__observers__.indexOf(this)>=0&&(!this.acceptlist||this.acceptlist.indexOf(o)>=0)){var i={object:e,name:t,type:o},a=0===this.changeset.length,s=this.deliver();"update"===o&&(i.oldValue=n),this.changeset.push(i),a&&s(!1,"number"==typeof s.delay?s.delay:10)}return!0},Observer.prototype.deleteProperty=function(e,t){var r=e[t];if(delete e[t],e.__observers__.indexOf(this)>=0&&!this.acceptlist||this.acceptlist.indexOf("delete")>=0){var n={object:e,name:t,type:"delete",oldValue:r},o=0===this.changeset.length,i=this.deliver();this.changeset.push(n),o&&i(!1,"number"==typeof i.delay?i.delay:10)}return!0},Observer.prototype.defineProperty=function(e,t,r){if(Object.defineProperty(e,t,r),e.__observers__.indexOf(this)>=0&&!this.acceptlist||this.acceptlist.indexOf("reconfigure")>=0){var n={object:e,name:t,type:"reconfigure"},o=0===this.changeset.length,i=this.deliver();this.changeset.push(n),o&&i(!1,"number"==typeof i.delay?i.delay:10)}return!0},Observer.prototype.setPrototypeOf=function(e,t){var r=Object.getPrototypeOf(e);if(Object.setPrototypeOf(e,t),e.__observers__.indexOf(this)>=0&&!this.acceptlist||this.acceptlist.indexOf("setPrototype")>=0){var n={object:e,name:"__proto__",type:"setPrototype",oldValue:r},o=0===this.changeset.length,i=this.deliver();this.changeset.push(n),o&&i(!1,"number"==typeof i.delay?i.delay:10)}return!0},Observer.prototype.preventExtensions=function(e){if(Object.preventExtensions(e),e.__observers__.indexOf(this)>=0&&!this.acceptlist||this.acceptlist.indexOf("preventExtensions")>=0){var t={object:e,type:"preventExtensions"},r=0===this.changeset.length,n=this.deliver();this.changeset.push(t),r&&n(!1,"number"==typeof n.delay?n.delay:10)}return!0},Object.observe=function(e,t,r,n,o,i){return new Observer(e,t,r,n,o,i)},Object.unobserve=function(e,t){if(e.__observerCallbacks__){if(!t)return e.__observerCallbacks__.splice(0,e.__observerCallbacks__.length),void e.__observers__.splice(0,e.__observers__.length);e.__observerCallbacks__.forEach(function(r,n){t===r&&(e.__observerCallbacks__.splice(n,1),delete e.__observers__[n].callback,e.__observers__.splice(n,1))})}},Array.observe=function(e,t,r,n,o,i){if(!(e instanceof Array||Array.isArray(e)))throw new TypeError("First argument to Array.observer is not an Array");r=r||["add","update","delete","splice"];var a=new Proxy(e,{get:function(t,n){return"unobserve"===n?function(e){return e?Object.unobserve(t,e):t.unobserve()}:"splice"===n?function(n,o){if("number"!=typeof n||"number"!=typeof o)throw new TypeError("First two arguments to Array splice are not number, number");var i=this.slice(n,n+o),a=arguments.length>1?arguments.length-2:0,u={object:e,type:"splice",index:n,removed:i,addedCount:a};if(t.splice.apply(t,arguments),r.indexOf("splice")>=0){var n=0===s.__observer__.changeset.length,c=s.__observer__.deliver();s.__observer__.changeset.push(u),n&&c(!1,"number"==typeof c.delay?c.delay:10)}}:"push"===n?function(e){return this.splice(this.length,0,e)}:"pop"===n?function(){return this.splice(this.length-1,1)}:"unshift"===n?function(e){return this.splice(0,0,e)}:"shift"===n?function(){return this.splice(0,1)}:t[n]}}),s=Object.observe(a,function(e){var n=e.filter(function(e){return"length"!==e.name&&"add"!==e.name&&(!r||r.indexOf(e.type)>=0)});n.length>0&&t(n)},r,n,o,i);return s},Array.unobserve=function(e,t){return e.unobserve(t)}),Object.deepObserve=function(e,t,r){function reobserve(e,r){Object.keys(e).forEach(function(o){if(("object"===n(e[o])||"array"===n(e[o]))&&!e[o].hasOwnProperty("__observers__")){var i=r.slice(0);i.push(o),e[o]=Object.deepObserve(e[o],t,i)}})}r=r||[];var n=function(e){return{}.toString.call(e).match(/\s([a-zA-Z]+)/)[1].toLowerCase()};return reobserve(e,r),Object.observe(e,function(e){function recurse(e,t,r,o,i){if(o instanceof Object){Object.keys(o).forEach(function(a){if(!r||r[a]!==o[a]){var s=r&&void 0!==r[a]?r[a]:void 0,u=void 0===s?"add":"update",c=i+"."+a;n.push({name:e,object:t,type:u,oldValue:s,newValue:o[a],keypath:c}),recurse(e,t,s,o[a],c)}})}else if(r instanceof Object){var a=Object.keys(r);a.forEach(function(a){var s=null===o?"update":"delete",u=i+"."+a;n.push({name:e,object:t,type:s,oldValue:r[a],newValue:o,keypath:u}),recurse(e,t,r[a],void 0,u)})}}var n=[];e.forEach(function(e){var t=(r.length>0?r.join(".")+".":"")+e.name;"update"!==e.type&&"add"!==e.type||reobserve(e.object,r),n.push({name:e.name,object:e.object,type:e.type,oldValue:e.oldValue,newValue:e.object[e.name],keypath:t}),recurse(e.name,e.object,e.oldValue,e.object[e.name],t)}),t(n)})}}()},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(3),o=_interopRequireDefault(n),i=r(4),a=_interopRequireDefault(i),s=r(36),u=function(){function HeartBeat(e,t,r,n){function throwMandatoryParmMissingError(e){throw"[HeartBeat] "+e+" mandatory parameter is missing"}var i=arguments.length>4&&void 0!==arguments[4]?arguments[4]:60;(0,o.default)(this,HeartBeat);var a=this;e?a._bus=e:throwMandatoryParmMissingError("bus"),n?a._dataObject=n:throwMandatoryParmMissingError("dataObject"),i?a._heartBeatRate=i:throwMandatoryParmMissingError("heartBeatRate"),r?a._runtimeUrl=r:throwMandatoryParmMissingError("runtimeUrl"),t?a._hypertyUrl=t:throwMandatoryParmMissingError("hypertyUrl"),a._stop={heartBeat:!1,sync:function(e){var o={from:t,to:r+"/sm",type:"execute",body:{method:"stopSync",params:[n.url]}};e.postMessage(o)}}}return(0,a.default)(HeartBeat,[{key:"start",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;this.heartbeat=e,this._isHeartBeatActive(this.heartBeat,2*this._heartBeatRate)?this._watchHeartBeat(this._heartBeatRate,!0,this._onHertbeatStopped):(this._stop.heartBeat=this._startHeartBeat(this._heartBeatRate),this._startSync())}},{key:"stop",value:function(){this._stop.heartBeat&&this._stop.heartBeat(),this._stop.sync(this._bus)}},{key:"onNewHeartbeat",value:function(e){this.heartbeat=e}},{key:"_isHeartBeatActive",value:function(e,t){var r=(0,s.secondsSinceEpoch)()-e;return!(r>2*t)}},{key:"_startHeartBeat",value:function(e){var t=this,r={from:t._hypertyUrl,to:t._dataObject.url+"/children/",type:"create",body:{resource:"heartbeat",mutual:!1,value:(0,s.secondsSinceEpoch)()}};this._bus.postMessage(r),this.heartbeat=(0,s.secondsSinceEpoch)();var n=setInterval(function(){var e={from:t._hypertyUrl,to:t._dataObject.url+"/children/",type:"create",body:{resource:"heartbeat",mutual:!1,value:(0,s.secondsSinceEpoch)()}};t._bus.postMessage(e),this.heartbeat=(0,s.secondsSinceEpoch)()},1e3*e);return function(){clearInterval(n)}}},{key:"_startSync",value:function(){var e=this._dataObject.data.backupRevision,t={from:this._hypertyUrl,to:this._runtimeUrl+"/sm",type:"execute",body:{method:"sync",params:[this._dataObject.url,e]}};this._bus.postMessage(t)}},{key:"_watchHeartBeat",value:function(e,t,r){var n=this,o=r,i=setInterval(function(){t&&!n._isHeartBeatActive(n.heartBeat,n._heartBeatRate)?(clearInterval(i),o(n)):!t&&this._isHeartBeatActive(n.heartBeat,n._heartBeatRate)&&(clearInterval(i),o())},1e3*e*2)}},{key:"_onHertbeatStopped",value:function(e){e._startHeartBeat(e._heartBeatRate),e._startSync()}},{key:"heartBeat",get:function(){return this.heartbeat?this.heartbeat:0}}]),HeartBeat}();t.default=u,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(14),o=_interopRequireDefault(n),i=r(3),a=_interopRequireDefault(i),s=r(4),u=_interopRequireDefault(s),c=r(160),l=_interopRequireDefault(c),d=function(){function HypertyResourceFactory(){(0,a.default)(this,HypertyResourceFactory)}return(0,u.default)(HypertyResourceFactory,[{key:"createHypertyResource",value:function(e,t,r){var n=void 0;switch(t){case"file":n=new l.default(e,r);break;default:throw new Error("[HypertyResourceFactory.createHypertyResource] not supported type: ",t)}return n}},{key:"createHypertyResourceWithContent",value:function(e,t,r,n){var i=void 0;return new o.default(function(o){switch(t){case"file":i=new l.default(e,n);break;default:reject()}i.init(r).then(function(){return i.save()}).then(function(){o(i)})})}}]),HypertyResourceFactory}();t.default=d,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(14),o=_interopRequireDefault(n),i=r(26),a=_interopRequireDefault(i),s=r(3),u=_interopRequireDefault(s),c=r(4),l=_interopRequireDefault(c),d=r(34),f=_interopRequireDefault(d),p=r(35),y=_interopRequireDefault(p),v=r(38),h=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(v),_=r(161),b=_interopRequireDefault(_),m=(r(36),r(162)),g=_interopRequireDefault(m),R=h.getLogger("FileHypertyResource"),O=function(e){function FileHypertyResource(e,t){(0,u.default)(this,FileHypertyResource);var r=(0,f.default)(this,(FileHypertyResource.__proto__||(0,a.default)(FileHypertyResource)).call(this,e,t));return r.metadata.resourceType="file",r}return(0,y.default)(FileHypertyResource,e),(0,l.default)(FileHypertyResource,[{key:"init",value:function(e){var t=this;if(!e)throw new Error("[FileHypertyResource.constructor] missing mandatory *file* input ");return new o.default(function(r,n){if(t._metadata.name=e.name,t._metadata.lastModified=e.lastModified,t._metadata.size=e.size,t._metadata.mimetype=e.type,R.log("[FileHypertyResource.init] file: ",e),t._isSender){switch(e.type.split("/")[0]){case"image":t._getImagePreview(e).then(function(n){t._metadata.preview=n,t._content=e,r()});break;default:t._content=e,r()}}else t._content=e.content,e.preview&&(t._metadata.preview=e.preview),r()})}},{key:"_getImagePreview",value:function(e){var t=new FileReader;return new o.default(function(r,n){g.default.resize(e,{width:100,height:100},function(e,n){n?(t.readAsDataURL(e),t.onload=function(e){r(e.target.result)}):(R.warn("[FileHypertyResource._getImagePreview] unable to create image preview from original image "),r(void 0))})})}},{key:"toMessage",value:function(){}},{key:"name",get:function(){return this._metadata.name}},{key:"preview",get:function(){return this._metadata.preview}}]),FileHypertyResource}(b.default);t.default=O,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(14),o=_interopRequireDefault(n),i=r(26),a=_interopRequireDefault(i),s=r(3),u=_interopRequireDefault(s),c=r(4),l=_interopRequireDefault(c),d=r(34),f=_interopRequireDefault(d),p=r(116),y=_interopRequireDefault(p),v=r(35),h=_interopRequireDefault(v),_=r(38),b=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(_),m=r(36),g=r(133),R=_interopRequireDefault(g),O=b.getLogger("HypertyResource"),w=function(e){function HypertyResource(e,t){(0,u.default)(this,HypertyResource);var r=(0,f.default)(this,(HypertyResource.__proto__||(0,a.default)(HypertyResource)).call(this,t)),n=r;return n.arraybufferSizeLimit=5242880,n._isSender=e,n._localStorageURL=n._parentObject._syncher._runtimeUrl+"/storage",r}return(0,h.default)(HypertyResource,e),(0,l.default)(HypertyResource,[{key:"save",value:function(){var e=this;return new o.default(function(t,r){var n={from:e._owner,to:e._localStorageURL,type:"create",body:{value:(0,m.deepClone)(e._metadata)}},o=function(n){O.info("[HypertyResource.save] reply: ",n),e._bus.removeResponseListener(e._owner,n.id),200===n.body.code?(n.body.value&&(e._metadata.contentURL||(e._metadata.contentURL=[]),e._metadata.contentURL.push(n.body.value)),t()):r(n.body.code+" "+n.body.desc)};n.body.value.content=e._content,e._bus.postMessage(n,o,!1)})}},{key:"read",value:function(e){var t=this;return O.info("[HypertyResource.read] ",this),new o.default(function(r,n){if(t.content)r(t);else{var o=t._getBestContentURL(t._metadata.contentURL);O.log("Storage:",o);var i={from:t._owner,to:o.url,type:"read",body:{resource:o.url+"/"+o.resource,p2p:!0}};t.metadata.p2pRequester&&t.metadata.p2pHandler&&(i.body.p2pRequester=t.metadata.p2pRequester,i.body.p2pHandler=t.metadata.p2pHandler),t._getBestResource(i,e).then(function(e){O.info("[HypertyResource] - get locally the resource:",e),r(t)}).catch(function(i){O.warn("[HypertyResource] - get locally the resource fail",i);var a={from:t._owner,to:o.remoteURL,type:"read",body:{resource:o.remoteURL+"/"+o.resource,p2p:!0}};t.metadata.p2pRequester&&t.metadata.p2pHandler&&(a.body.p2pRequester=t.metadata.p2pRequester,a.body.p2pHandler=t.metadata.p2pHandler),t._getBestResource(a,e).then(function(e){O.warn("[HypertyResource] - get remotely the resource",e),r(t)}).catch(function(e){O.warn("[HypertyResource] - get remotely the resource fail",e),n(e.body.code+" "+e.body.desc)})})}})}},{key:"_getBestResource",value:function(e,t){var r=this;return new o.default(function(n,o){var i=setTimeout(function(){return r._bus.removeResponseListener(r._owner,s),e.body.code=408,e.body.desc="Response timeout",o(e)},3e3),a=function(e){O.log("[HypertyResource.read] reply: ",e);var a=e.id;switch(clearTimeout(i),e.body.code){case 200:r._content=e.body.value.content,e.body.value.size<r.arraybufferSizeLimit&&r.save(),r._bus.removeResponseListener(r._owner,a),n(e);break;case 183:t(e.body.value);break;default:r._bus.removeResponseListener(r._owner,a),o(e)}},s=r._bus.postMessage(e,a,!1)})}},{key:"delete",value:function(){var e=this;O.info("[HypertyResource.delete]",e.metadata);var t={from:e._owner,to:e._localStorageURL,type:"delete",body:{resources:e.metadata.contentURL}};return new o.default(function(r){e._bus.postMessage(t,function(e){r(e.body.code<300?!0:!1)})})}},{key:"_getBestContentURL",value:function(e){var t=this,r=e[0],n=r.substr(r.lastIndexOf("/")+1);return{url:t._localStorageURL,resource:n,remoteURL:r.substr(0,r.lastIndexOf("/"))}}},{key:"resourceType",get:function(){return this.metadata.resourceType}},{key:"mimetype",get:function(){return this._metadata.type}},{key:"content",get:function(){return this._content}},{key:"contentURL",get:function(){return this._metadata.contentURL}},{key:"shareable",get:function(){var e=this,t=(0,y.default)(HypertyResource.prototype.__proto__||(0,a.default)(HypertyResource.prototype),"metadata",this);return t.resourceType=e.resourceType,t}}]),HypertyResource}(R.default);t.default=w,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(3),o=_interopRequireDefault(n),i=r(4),a=_interopRequireDefault(i),s="undefined"!=typeof Blob&&function(){try{return Boolean(new Blob)}catch(e){return!1}}(),u=s&&"undefined"!=typeof Uint8Array&&function(){try{return 100===new Blob([new Uint8Array(100)]).size}catch(e){return!1}}(),c="undefined"!=typeof HTMLCanvasElement&&HTMLCanvasElement.prototype.toBlob,l=c||"undefined"!=typeof Uint8Array&&"undefined"!=typeof ArrayBuffer&&"undefined"!=typeof atob,d="undefined"!=typeof FileReader||"undefined"!=typeof URL,f=function(){function ImageTools(){(0,o.default)(this,ImageTools)}return(0,a.default)(ImageTools,null,[{key:"resize",value:function(e,t,r){"function"==typeof t&&(r=t,t={width:640,height:480});t.width,t.height;if(!ImageTools.isSupported()||!e.type.match(/image.*/))return r(e,!1),!1;if(e.type.match(/image\/gif/))return r(e,!1),!1;var n=document.createElement("img");return n.onload=function(o){var i=n.width,a=n.height,s=!1;if(i>=a&&i>t.width?(a*=t.width/i,i=t.width,s=!0):a>t.height&&(i*=t.height/a,a=t.height,s=!0),!s)return void r(e,!1);var u=document.createElement("canvas");if(u.width=i,u.height=a,u.getContext("2d").drawImage(n,0,0,i,a),c)u.toBlob(function(e){r(e,!0)},e.type);else{var l=ImageTools._toBlob(u,e.type);r(l,!0)}},ImageTools._loadImage(n,e),!0}},{key:"_toBlob",value:function(e,t){var r=e.toDataURL(t),n=r.split(","),o=void 0;o=n[0].indexOf("base64")>=0?atob(n[1]):decodeURIComponent(n[1]);for(var i=new ArrayBuffer(o.length),a=new Uint8Array(i),c=0;c<o.length;c+=1)a[c]=o.charCodeAt(c);var l=n[0].split(":")[1].split(";")[0],d=null;if(s)d=new Blob([u?a:i],{type:l});else{var f=new BlobBuilder;f.append(i),d=f.getBlob(l)}return d}},{key:"_loadImage",value:function(e,t,r){if("undefined"==typeof URL){var n=new FileReader;n.onload=function(t){e.src=t.target.result,r&&r()},n.readAsDataURL(t)}else e.src=URL.createObjectURL(t),r&&r()}},{key:"isSupported",value:function(){return"undefined"!=typeof HTMLCanvasElement&&l&&d}}]),ImageTools}();t.default=f,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(48),o=_interopRequireDefault(n),i=r(102),a=_interopRequireDefault(i),s=r(14),u=_interopRequireDefault(s),c=r(26),l=_interopRequireDefault(c),d=r(3),f=_interopRequireDefault(d),p=r(4),y=_interopRequireDefault(p),v=r(34),h=_interopRequireDefault(v),_=r(116),b=_interopRequireDefault(_),m=r(35),g=_interopRequireDefault(m),R=r(38),O=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(R),w=r(36),D=r(131),j=_interopRequireDefault(D),k=O.getLogger("DataObjectObserver"),L={ANY:"any",START:"start",EXACT:"exact"},M=function(e){function DataObjectObserver(e){(0,f.default)(this,DataObjectObserver);var t=(0,h.default)(this,(DataObjectObserver.__proto__||(0,l.default)(DataObjectObserver)).call(this,e)),r=t;return r._version=e.version,r._filters={},r._syncObj.observe(function(e){r._onFilter(e)}),r._allocateListeners(),t}return(0,g.default)(DataObjectObserver,e),(0,y.default)(DataObjectObserver,[{key:"sync",value:function(){var e=this;return k.info("[DataObjectObserver_sync] synchronising "),new u.default(function(t,r){var n={};e._syncher.read(e._metadata.url,n).then(function(r){k.info("[DataObjectObserver_sync] value to sync: ",r),(0,a.default)(e.data,(0,w.deepClone)(r.data)),e._version=r.version,e._metadata.lastModified=r.lastModified,r.childrenObjects?(e.resumeChildrens(r.childrenObjects),e._storeChildrens(),t(!0)):t(!0)}).catch(function(e){k.info("[DataObjectObserver_sync] sync failed: ",e),t(!1)})})}},{key:"_storeChildrens",value:function(){var e=this,t={};(0,o.default)(e._childrenObjects).forEach(function(r){var n=e._childrenObjects;t[r]={},t[r].value=n[r].metadata,t[r].identity=n[r].identity});var r={from:e._owner,to:e._syncher._subURL,type:"create",body:{resource:e._url,attribute:"childrenObjects",value:t}};e._bus.postMessage(r)}},{key:"_allocateListeners",value:function(){(0,b.default)(DataObjectObserver.prototype.__proto__||(0,l.default)(DataObjectObserver.prototype),"_allocateListeners",this).call(this);var e=this;e._changeListener=e._bus.addListener(e._url+"/changes",function(t){"update"===t.type&&(k.log("DataObjectObserver-"+e._url+"-RCV: ",t),e._changeObject(e._syncObj,t))})}},{key:"_releaseListeners",value:function(){(0,b.default)(DataObjectObserver.prototype.__proto__||(0,l.default)(DataObjectObserver.prototype),"_releaseListeners",this).call(this),this._changeListener.remove()}},{key:"delete",value:function(){var e=this;e._heartBeat&&e._heartBeat.stop(),e._deleteChildrens().then(function(){e.unsubscribe(),e._releaseListeners(),delete e._syncher._observers[e._url]})}},{key:"unsubscribe",value:function(){var e=this,t={type:"unsubscribe",from:e._owner,to:e._syncher._subURL,body:{resource:e._url}};e._bus.postMessage(t,function(t){k.log("DataObjectObserver-UNSUBSCRIBE: ",t),200===t.body.code&&(e._releaseListeners(),delete e._syncher._observers[e._url])})}},{key:"onChange",value:function(e,t){var r=e,n={type:L.EXACT,callback:t},o=e.indexOf("*");o===e.length-1&&(0===o?n.type=L.ANY:(n.type=L.START,r=e.substr(0,e.length-1))),this._filters[r]=n}},{key:"_onFilter",value:function(e){var t=this;(0,o.default)(t._filters).forEach(function(r){var n=t._filters[r];n.type===L.ANY?n.callback(e):n.type===L.START?0===e.field.indexOf(r)&&n.callback(e):n.type===L.EXACT&&e.field===r&&n.callback(e)})}},{key:"onDisconnected",value:function(e){var t=this;return new u.default(function(r,n){t._subscribeRegistration().then(function(){t._onDisconnected=e,r()}).catch(function(e){return n(e)})})}},{key:"_subscribeRegistration",value:function(){var e=this,t={type:"subscribe",from:this._owner,to:this._syncher._runtimeUrl+"/subscriptions",body:{resources:[this._url+"/registration"]}};return new u.default(function(r,n){e._bus.postMessage(t,function(t){k.log("[DataObjectObserver._subscribeRegistration] "+e._url+" rcved reply ",t),200===t.body.code?(e._generateListener(e._url+"/registration"),r()):(k.error("Error subscribing registration status for ",e._url),n("Error subscribing registration status for "+e._url))})})}},{key:"_generateListener",value:function(e){var t=this;t._bus.addListener(e,function(e){k.log("[DataObjectObserver.registrationNotification] "+t._url+": ",e),e.body.value&&"disconnected"===e.body.value&&t._onDisconnected&&(k.log("[DataObjectObserver] "+t._url+": was disconnected ",e),t._onDisconnected())})}},{key:"execute",value:function(e,t){var r=this,n=this;return new u.default(function(o,i){var a={type:"execute",from:r._owner,to:n._url,body:{method:e,params:t}};n._bus.postMessage(a,function(t){k.log("[DataObjectObserver.execute] "+n._url+" rcved reply ",t),200===t.body.code?o():(k.warn("[DataObjectObserver.execute] execution of method "+e+" was reject by reporter"),i("[DataObjectObserver.execute] execution of method "+e+" was reject by reporter"))})})}}]),DataObjectObserver}(j.default);t.default=M,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(3),o=_interopRequireDefault(n),i=r(4),a=_interopRequireDefault(i),s=r(38),u=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(s),c=u.getLogger("DataProvisional"),l=function(){function DataProvisional(e,t,r,n){(0,o.default)(this,DataProvisional);var i=this;i._owner=e,i._url=t,i._bus=r,i._children=n,i._changes=[],i._allocateListeners()}return(0,a.default)(DataProvisional,[{key:"_allocateListeners",value:function(){var e=this;e._listener=e._bus.addListener(e._url,function(t){c.log("DataProvisional-"+e._url+"-RCV: ",t),e._changes.push(t)})}},{key:"_releaseListeners",value:function(){this._listener.remove()}},{key:"apply",value:function(e){this._changes.forEach(function(t){e._changeObject(e._syncObj,t)})}},{key:"children",get:function(){return this._children}}]),DataProvisional}();t.default=l,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(3),o=_interopRequireDefault(n),i=r(4),a=_interopRequireDefault(i),s=r(36),u=function(){function NotificationHandler(e){if((0,o.default)(this,NotificationHandler),!e)throw Error("[NotificationHandler Constructor] bus input is mandatory");this._bus=e,this._onNotificationHandler={}}return(0,a.default)(NotificationHandler,[{key:"onNotification",value:function(e,t){this._onNotificationHandler[e]=t}},{key:"onCreate",value:function(e){var t=this,r=e.body.hasOwnProperty("resource")?e.body.resource:e.from.slice(0,-13),n=(0,s.divideURL)(r),o=n.domain,i=r.split("://")[0],a=function(r){t._bus.postMessage({id:e.id,type:"response",from:e.to,to:e.from,body:{code:400,desc:"Bad Request: "+r}})};e.body.hasOwnProperty("source")||a("Missing source"),e.body.hasOwnProperty("schema")||a("Missing schema"),e.body.hasOwnProperty("value")||a("Missing value"),e.body.hasOwnProperty("identity")||a("Missing identity");var u={type:e.type,from:e.body.source,url:r,domain:o,schema:e.body.schema,value:e.body.value,identity:e.body.identity,to:e.to,via:e.body.via,ack:function(r){var n=200;r&&(n=r),t._bus.postMessage({id:e.id,type:"response",from:e.to,to:e.from,body:{code:n}})},error:function(e){a(e)}};t._onNotificationHandler[i]&&t._onNotificationHandler[i](u)}},{key:"onDelete",value:function(e){var t=this,r=e.body.resource,n=t._observers[r],o={from:t.owner,to:t._subURL,id:e.id,type:"unsubscribe",body:{resource:e.body.resource}};if(t._bus.postMessage(o),delete t._observers[r],n){var i={type:e.type,url:r,identity:e.body.identity,ack:function(r){var o=200;r&&(o=r),200===o&&n.delete(),t._bus.postMessage({id:e.id,type:"response",from:e.to,to:e.from,body:{code:o,source:t._owner}})}};t._onNotificationHandler&&(log.log("NOTIFICATION-EVENT: ",i),t._onNotificationHandler(i))}else t._bus.postMessage({id:e.id,type:"response",from:e.to,to:e.from,body:{code:404,source:t._owner}})}}]),NotificationHandler}();t.default=u,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(26),o=_interopRequireDefault(n),i=r(3),a=_interopRequireDefault(i),s=r(34),u=_interopRequireDefault(s),c=r(4),l=_interopRequireDefault(c),d=r(35),f=_interopRequireDefault(d),p=r(125),y=_interopRequireDefault(p),v=function(e){function DiscoveredObject(e,t,r,n,i){(0,a.default)(this,DiscoveredObject);var s=(0,u.default)(this,(DiscoveredObject.__proto__||(0,o.default)(DiscoveredObject)).call(this,e.hypertyID||e.url,t,r,n));return s._data=e,s._discovery=i,s}return(0,f.default)(DiscoveredObject,e),(0,l.default)(DiscoveredObject,[{key:"data",get:function(){return this._data}}]),(0,l.default)(DiscoveredObject,[{key:"check",value:function(){var e=this,t={body:{}};e._discoveredObjectURL.startsWith("hyperty://")?e._discovery.discoverHypertyPerURL(e._discoveredObjectURL).then(function(r){t.body.status=r.status,e._processNotification(t)}):e._discovery.discoverDataObjectsPerURL(e._discoveredObjectURL).then(function(r){t.body.status=r.status,e._processNotification(t)})}}]),DiscoveredObject}(y.default);t.default=v,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(48),o=_interopRequireDefault(n),i=r(14),a=_interopRequireDefault(i),s=r(3),u=_interopRequireDefault(s),c=r(4),l=_interopRequireDefault(c),d=function(){function Search(e,t){if((0,u.default)(this,Search),!e)throw new Error("The discovery component is a needed parameter");if(!t)throw new Error("The identityManager component is a needed parameter");var r=this;r.discovery=e,r.identityManager=t}return(0,l.default)(Search,[{key:"myIdentity",value:function(){var e=this;return new a.default(function(t,r){e.identityManager.discoverUserRegistered().then(function(e){t(e)}).catch(function(e){r(e)})})}},{key:"hyperties",value:function(e,t,r){arguments.length>3&&void 0!==arguments[3]&&arguments[3]}},{key:"users",value:function(e,t,r,n){var i=arguments.length>4&&void 0!==arguments[4]&&arguments[4];if(!e)throw new Error("You need to provide a list of users");if(!t)throw new Error("You need to provide a list of domains");if(!n)throw new Error("You need to provide a list of resources");if(!r)throw new Error("You need to provide a list of schemes");var s=this;return new a.default(function(u,c){if(0===e.length)u(e);else{var l=[];e.forEach(function(e,o){var a=t[o];i?l.push(s.discovery.discoverHypertiesPerUserProfileData(e,r,n)):l.push(s.discovery.discoverHyperties(e,r,n,a))}),a.default.all(l.map(function(e){return e.then(function(e){return e},function(e){return e})})).then(function(e){var t=e.map(function(e){if(e.hasOwnProperty("hypertyID"))return e;var t=(0,o.default)(e).reduceRight(function(t,r){var n=new Date(e[r].lastModified);return new Date(e[t].lastModified).getTime()<n.getTime()?r:t});return e[t]}),r=t.filter(function(e){return e.hasOwnProperty("hypertyID")});e.forEach(function(e){if("No Hyperty was found"!==e)return u(r)}),c("No Hyperty was found")}).catch(function(t){u(e)})}})}}]),Search}();t.default=d,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(3),o=_interopRequireDefault(n),i=r(169),a=_interopRequireDefault(i),s=function MessageBodyIdentity(e,t,r,n,i,s,u,c){if((0,o.default)(this,MessageBodyIdentity),!s)throw new Error("IDP should be a parameter");if(!e)throw new Error("username should be a parameter");this.idp=s,u&&(this.assertion=u),this.userProfile=new a.default(e,t,r,n,i,c)};t.default=s,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(102),o=_interopRequireDefault(n),i=r(3),a=_interopRequireDefault(i),s=function UserProfile(e,t,r,n,i,s){(0,a.default)(this,UserProfile),e&&(this.preferred_username=e),r&&(this.picture=r),n&&(this.name=n),i&&(this.locale=i),t&&(this.userURL=t),s&&(0,o.default)(this,s)};t.default=s,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(102),o=_interopRequireDefault(n),i=r(14),a=_interopRequireDefault(i),s=r(3),u=_interopRequireDefault(s),c=r(4),l=_interopRequireDefault(c),d=r(139),f=r(140),p=_interopRequireDefault(f),y=r(141),v=function(){function ChatManager(e,t,r,n,o){if((0,u.default)(this,ChatManager),!e)throw new Error("[ChatManager.constructor] The myUrl is a needed parameter");if(!t)throw new Error("[ChatManager.constructor] The MiniBus is a needed parameter");if(!r)throw new Error("[ChatManager.constructor] The configuration is a needed parameter");var i=this;n||(n=o.createSyncher(e,t,r)),i._runtimeURL=r.runtimeURL;var a=o.divideURL(i._runtimeURL).domain,s=o.createDiscovery(e,r.runtimeURL,t),c=o.createIdentityManager(e,r.runtimeURL,t);i._objectDescURL="hyperty-catalogue://catalogue."+a+"/.well-known/dataschema/Communication",i._reportersControllers={},i._observersControllers={},i._myUrl=e,i._bus=t,i._syncher=n,i._domain=a,i.discovery=s,i.identityManager=c,i.currentIdentity,i.search=o.createSearch(s,c),i.communicationObject=d.communicationObject,i.communicationChildren=d.communicationChildren}return(0,l.default)(ChatManager,[{key:"processNotification",value:function(e){var t=this;if("create"===e.type&&t._onInvitation&&t._onInvitation(e),"delete"===e.type){e.ack(200),t._observersControllers[e.url].closeEvent=e,delete t._observersControllers[e.url],t._observersControllers.closeEvent=e,t.communicationObject=d.communicationObject;for(var r in this._reportersControllers)this._reportersControllers[r].close(e);for(var n in this._observersControllers)this._observersControllers[n].close(e)}}},{key:"myIdentity",value:function(e){var t=this;return new a.default(function(r,n){if(e)return r(e);t._myUrl.includes("hyperty://")?t.identityManager.discoverUserRegistered().then(function(e){r(e)}).catch(function(e){n(e)}):t.identityManager.discoverIdentityPerIdP().then(function(e){r(e)}).catch(function(e){n(e)})})}},{key:"create",value:function(e,t){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},n=this,i=n._syncher;return new a.default(function(s,u){n.communicationObject=d.communicationObject,n.communicationObject.cseq=1,n.communicationObject.startingTime=(new Date).toJSON(),n.communicationObject.status=d.CommunicationStatus.OPEN;var c=void 0;n.myIdentity().then(function(l){c=l;var d=new y.UserInfo(n._myUrl,n._domain,l);n.communicationObject.participants[l.guid]=d;var f=[],v=[],h={};t.forEach(function(e){var t=n.discovery.discoverHypertiesDO(e.user,["comm"],["chat"],e.domain);f.push(t)}),a.default.all(f).then(function(t){var a=[];t.forEach(function(e){e.forEach(function(e){"live"===e.data.status?(a.push(e.data.hypertyID),h[e.data.hypertyID]=e):v.length<5&&v.push(e)})});var s=!r.mutual||r.mutual,u=(0,o.default)({resources:["chat"],mutual:s},r);return delete u.name,n.offline&&(u.offline=n.offline),i.create(n._objectDescURL,a,n.communicationObject,!0,!1,e,{},u)}).then(function(e){var t=new p.default(i,n.discovery,n._domain,n.search,c,n);t.dataObjectReporter=e,n._reportersControllers[e.url]=t,e.invitations.length>0&&t.invitationsHandler.processInvitations(h,e),v.length>0&&t.invitationsHandler.inviteDisconnectedHyperties(v,e),s(t)}).catch(function(e){u(e)})}).catch(function(e){return u(e)})})}},{key:"onInvitation",value:function(e){this._onInvitation=e}},{key:"join",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],r=arguments[2],n=this;return new a.default(function(o,i){var a=n._syncher,s=void 0;n.myIdentity(r).then(function(r){s=r;var o={schema:n._objectDescURL,resource:e,store:!0,p2p:!1,mutual:t,domain_subscription:!0,identity:r};return n.offline&&(o.offline=n.offline),a.subscribe(o)}).then(function(e){var t=new p.default(a,n.discovery,n._domain,n.search,s,n);o(t),t.dataObjectObserver=e,n._observersControllers[e.url]=t}).catch(function(e){i(e)})})}},{key:"offline",set:function(e){this._offline=e},get:function(){return!!this._offline&&this._offline}}]),ChatManager}();t.default=v,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(48),o=_interopRequireDefault(n),i=r(14),a=_interopRequireDefault(i),s=r(3),u=_interopRequireDefault(s),c=r(4),l=_interopRequireDefault(c),d=function(){function InvitationsHandler(e){if((0,u.default)(this,InvitationsHandler),!e)throw Error("hypertyURL is a necessary dependecy");var t=this;t._hypertyURL=e,t._pending={}}return(0,l.default)(InvitationsHandler,[{key:"inviteDisconnectedHyperties",value:function(e,t){var r=this;e.forEach(function(e){r._pending[t]||(r._pending[t]={}),r._pending[t][e.data.hypertyID]=e,e.onLive(r._hypertyURL,function(){t.inviteObservers([e.data.hypertyID]),e.unsubscribeLive(r._hypertyURL),delete r._pending[t][e.data.hypertyID]})})}},{key:"processInvitations",value:function(e,t){var r=this,n=this,o=t.invitations||[];o.forEach(function(o){o.then(function(e){r._invitationsResponse&&r._invitationsResponse(e)}).catch(function(o){r._invitationsResponse&&r._invitationsResponse(o),n.inviteDisconnectedHyperties([e[o.invited]],t)})})}},{key:"resumeDiscoveries",value:function(e,t){var r=this;return new a.default(function(n,i){var s={},u=[],c=[],l=[];e.resumeDiscoveries().then(function(e){e.forEach(function(e){e.data.resources&&"chat"===e.data.resources[0]&&("live"===e.data.status?(s[e.data.hypertyID]=e,u.push(e.data.hypertyID),l.push(e.unsubscribeLive(r._hypertyURL))):c.push(e))}),c.length>0&&r.inviteDisconnectedHyperties(c,t),(0,o.default)(s).length>0?(t.inviteObservers(u),t.invitations.length>0&&r.processInvitations(s,t),a.default.all(l).then(function(){n()})):n()})}).catch(function(e){reject("[GroupChatManager.InvitationsHandler.resumeDiscoveries] failed | ",e)})}},{key:"cleanInvitations",value:function(e){var t=this,r=t._pending[e];return r?new a.default(function(e,n){var i=(0,o.default)(r),s=[];i.forEach(function(e){s.push(r[e].unsubscribeLive(t._hypertyURL))}),a.default.all(i).then(function(){e()})}):a.default.resolve()}},{key:"invitationResponse",set:function(e){this._invitationsResponse=e}}]),InvitationsHandler}();t.default=d,e.exports=t.default},function(e,t,r){"use strict";t.__esModule=!0;var n=r(64),o=function(e){return e&&e.__esModule?e:{default:e}}(n);t.default=function(e,t,r){return t in e?(0,o.default)(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(102),o=_interopRequireDefault(n),i=r(14),a=_interopRequireDefault(i),s=r(3),u=_interopRequireDefault(s),c=r(4),l=_interopRequireDefault(c),d=r(139),f=r(142),p=_interopRequireDefault(f),y=r(141),v=function(){function SimpleChatManager(e,t,r,n,o){if((0,u.default)(this,SimpleChatManager),!e)throw new Error("[ChatManager.constructor] The myUrl is a needed parameter");if(!t)throw new Error("[ChatManager.constructor] The MiniBus is a needed parameter");if(!r)throw new Error("[ChatManager.constructor] The configuration is a needed parameter");var i=this;n||(n=o.createSyncher(e,t,r)),i._runtimeURL=r.runtimeURL;var a=o.divideURL(i._runtimeURL).domain,s=o.createIdentityManager(e,r.runtimeURL,t);i._objectDescURL="hyperty-catalogue://catalogue."+a+"/.well-known/dataschema/Communication",i._reportersControllers={},i._observersControllers={},i._myUrl=e,i._bus=t,i._syncher=n,i._domain=a,i.identityManager=s,i.currentIdentity,i.communicationObject=d.communicationObject,i.communicationChildren=d.communicationChildren}return(0,l.default)(SimpleChatManager,[{key:"processNotification",value:function(e){var t=this;if("create"===e.type&&t._onInvitation&&t._onInvitation(e),"delete"===e.type){e.ack(200),t._observersControllers[e.url].closeEvent=e,delete t._observersControllers[e.url],t._observersControllers.closeEvent=e,t.communicationObject=d.communicationObject;for(var r in this._reportersControllers)this._reportersControllers[r].close(e);for(var n in this._observersControllers)this._observersControllers[n].close(e)}}},{key:"myIdentity",value:function(e){var t=this;return new a.default(function(r,n){if(e)return r(e);t._myUrl.includes("hyperty://")?t.identityManager.discoverUserRegistered().then(function(e){t.currentIdentity=e,r(e)}).catch(function(e){n(e)}):t.identityManager.discoverIdentityPerIdP().then(function(e){t.currentIdentity=e,r(e)}).catch(function(e){n(e)})})}},{key:"create",value:function(e,t){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},n=this,i=n._syncher;return new a.default(function(a,s){n.communicationObject=d.communicationObject,n.communicationObject.cseq=1,n.communicationObject.startingTime=(new Date).toJSON(),n.communicationObject.status=d.CommunicationStatus.OPEN;var u=void 0;n.myIdentity().then(function(a){u=a;var s=new y.UserInfo(n._myUrl,n._domain,a);n.communicationObject.participants[a.guid]=s;var c=!r.mutual||r.mutual,l=(0,o.default)({resources:["chat"],mutual:c},r);return delete l.name,n.offline&&(l.offline=n.offline),i.create(n._objectDescURL,t,n.communicationObject,!0,!1,e,{},l)}).then(function(e){var t=new p.default(i,n._domain,u,n);t.dataObjectReporter=e,n._reportersControllers[e.url]=t,a(t)}).catch(function(e){s(e)})}).catch(function(e){return reject(e)})}},{key:"onInvitation",value:function(e){this._onInvitation=e}},{key:"join",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],r=arguments[2],n=this;return new a.default(function(o,i){var a=n._syncher,s=void 0;n.myIdentity(r).then(function(r){s=r;var o={schema:n._objectDescURL,resource:e,store:!0,p2p:!1,mutual:t,domain_subscription:!0,identity:r};return n.offline&&(o.offline=n.offline),a.subscribe(o)}).then(function(e){var t=new p.default(a,n._domain,s,n);o(t),t.dataObjectObserver=e,n._observersControllers[e.url]=t}).catch(function(e){i(e)})})}},{key:"offline",set:function(e){this._offline=e},get:function(){return!!this._offline&&this._offline}}]),SimpleChatManager}();t.default=v,e.exports=t.default}])});
},{}],3:[function(require,module,exports){
/*!
 * URI.js - Mutating URLs
 * IPv6 Support
 *
 * Version: 1.19.1
 *
 * Author: Rodney Rehm
 * Web: http://medialize.github.io/URI.js/
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *
 */

(function (root, factory) {
  'use strict';
  // https://github.com/umdjs/umd/blob/master/returnExports.js
  if (typeof module === 'object' && module.exports) {
    // Node
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else {
    // Browser globals (root is window)
    root.IPv6 = factory(root);
  }
}(this, function (root) {
  'use strict';

  /*
  var _in = "fe80:0000:0000:0000:0204:61ff:fe9d:f156";
  var _out = IPv6.best(_in);
  var _expected = "fe80::204:61ff:fe9d:f156";

  console.log(_in, _out, _expected, _out === _expected);
  */

  // save current IPv6 variable, if any
  var _IPv6 = root && root.IPv6;

  function bestPresentation(address) {
    // based on:
    // Javascript to test an IPv6 address for proper format, and to
    // present the "best text representation" according to IETF Draft RFC at
    // http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04
    // 8 Feb 2010 Rich Brown, Dartware, LLC
    // Please feel free to use this code as long as you provide a link to
    // http://www.intermapper.com
    // http://intermapper.com/support/tools/IPV6-Validator.aspx
    // http://download.dartware.com/thirdparty/ipv6validator.js

    var _address = address.toLowerCase();
    var segments = _address.split(':');
    var length = segments.length;
    var total = 8;

    // trim colons (:: or ::a:b:c… or …a:b:c::)
    if (segments[0] === '' && segments[1] === '' && segments[2] === '') {
      // must have been ::
      // remove first two items
      segments.shift();
      segments.shift();
    } else if (segments[0] === '' && segments[1] === '') {
      // must have been ::xxxx
      // remove the first item
      segments.shift();
    } else if (segments[length - 1] === '' && segments[length - 2] === '') {
      // must have been xxxx::
      segments.pop();
    }

    length = segments.length;

    // adjust total segments for IPv4 trailer
    if (segments[length - 1].indexOf('.') !== -1) {
      // found a "." which means IPv4
      total = 7;
    }

    // fill empty segments them with "0000"
    var pos;
    for (pos = 0; pos < length; pos++) {
      if (segments[pos] === '') {
        break;
      }
    }

    if (pos < total) {
      segments.splice(pos, 1, '0000');
      while (segments.length < total) {
        segments.splice(pos, 0, '0000');
      }
    }

    // strip leading zeros
    var _segments;
    for (var i = 0; i < total; i++) {
      _segments = segments[i].split('');
      for (var j = 0; j < 3 ; j++) {
        if (_segments[0] === '0' && _segments.length > 1) {
          _segments.splice(0,1);
        } else {
          break;
        }
      }

      segments[i] = _segments.join('');
    }

    // find longest sequence of zeroes and coalesce them into one segment
    var best = -1;
    var _best = 0;
    var _current = 0;
    var current = -1;
    var inzeroes = false;
    // i; already declared

    for (i = 0; i < total; i++) {
      if (inzeroes) {
        if (segments[i] === '0') {
          _current += 1;
        } else {
          inzeroes = false;
          if (_current > _best) {
            best = current;
            _best = _current;
          }
        }
      } else {
        if (segments[i] === '0') {
          inzeroes = true;
          current = i;
          _current = 1;
        }
      }
    }

    if (_current > _best) {
      best = current;
      _best = _current;
    }

    if (_best > 1) {
      segments.splice(best, _best, '');
    }

    length = segments.length;

    // assemble remaining segments
    var result = '';
    if (segments[0] === '')  {
      result = ':';
    }

    for (i = 0; i < length; i++) {
      result += segments[i];
      if (i === length - 1) {
        break;
      }

      result += ':';
    }

    if (segments[length - 1] === '') {
      result += ':';
    }

    return result;
  }

  function noConflict() {
    /*jshint validthis: true */
    if (root.IPv6 === this) {
      root.IPv6 = _IPv6;
    }

    return this;
  }

  return {
    best: bestPresentation,
    noConflict: noConflict
  };
}));

},{}],4:[function(require,module,exports){
/*!
 * URI.js - Mutating URLs
 * Second Level Domain (SLD) Support
 *
 * Version: 1.19.1
 *
 * Author: Rodney Rehm
 * Web: http://medialize.github.io/URI.js/
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *
 */

(function (root, factory) {
  'use strict';
  // https://github.com/umdjs/umd/blob/master/returnExports.js
  if (typeof module === 'object' && module.exports) {
    // Node
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else {
    // Browser globals (root is window)
    root.SecondLevelDomains = factory(root);
  }
}(this, function (root) {
  'use strict';

  // save current SecondLevelDomains variable, if any
  var _SecondLevelDomains = root && root.SecondLevelDomains;

  var SLD = {
    // list of known Second Level Domains
    // converted list of SLDs from https://github.com/gavingmiller/second-level-domains
    // ----
    // publicsuffix.org is more current and actually used by a couple of browsers internally.
    // downside is it also contains domains like "dyndns.org" - which is fine for the security
    // issues browser have to deal with (SOP for cookies, etc) - but is way overboard for URI.js
    // ----
    list: {
      'ac':' com gov mil net org ',
      'ae':' ac co gov mil name net org pro sch ',
      'af':' com edu gov net org ',
      'al':' com edu gov mil net org ',
      'ao':' co ed gv it og pb ',
      'ar':' com edu gob gov int mil net org tur ',
      'at':' ac co gv or ',
      'au':' asn com csiro edu gov id net org ',
      'ba':' co com edu gov mil net org rs unbi unmo unsa untz unze ',
      'bb':' biz co com edu gov info net org store tv ',
      'bh':' biz cc com edu gov info net org ',
      'bn':' com edu gov net org ',
      'bo':' com edu gob gov int mil net org tv ',
      'br':' adm adv agr am arq art ato b bio blog bmd cim cng cnt com coop ecn edu eng esp etc eti far flog fm fnd fot fst g12 ggf gov imb ind inf jor jus lel mat med mil mus net nom not ntr odo org ppg pro psc psi qsl rec slg srv tmp trd tur tv vet vlog wiki zlg ',
      'bs':' com edu gov net org ',
      'bz':' du et om ov rg ',
      'ca':' ab bc mb nb nf nl ns nt nu on pe qc sk yk ',
      'ck':' biz co edu gen gov info net org ',
      'cn':' ac ah bj com cq edu fj gd gov gs gx gz ha hb he hi hl hn jl js jx ln mil net nm nx org qh sc sd sh sn sx tj tw xj xz yn zj ',
      'co':' com edu gov mil net nom org ',
      'cr':' ac c co ed fi go or sa ',
      'cy':' ac biz com ekloges gov ltd name net org parliament press pro tm ',
      'do':' art com edu gob gov mil net org sld web ',
      'dz':' art asso com edu gov net org pol ',
      'ec':' com edu fin gov info med mil net org pro ',
      'eg':' com edu eun gov mil name net org sci ',
      'er':' com edu gov ind mil net org rochest w ',
      'es':' com edu gob nom org ',
      'et':' biz com edu gov info name net org ',
      'fj':' ac biz com info mil name net org pro ',
      'fk':' ac co gov net nom org ',
      'fr':' asso com f gouv nom prd presse tm ',
      'gg':' co net org ',
      'gh':' com edu gov mil org ',
      'gn':' ac com gov net org ',
      'gr':' com edu gov mil net org ',
      'gt':' com edu gob ind mil net org ',
      'gu':' com edu gov net org ',
      'hk':' com edu gov idv net org ',
      'hu':' 2000 agrar bolt casino city co erotica erotika film forum games hotel info ingatlan jogasz konyvelo lakas media news org priv reklam sex shop sport suli szex tm tozsde utazas video ',
      'id':' ac co go mil net or sch web ',
      'il':' ac co gov idf k12 muni net org ',
      'in':' ac co edu ernet firm gen gov i ind mil net nic org res ',
      'iq':' com edu gov i mil net org ',
      'ir':' ac co dnssec gov i id net org sch ',
      'it':' edu gov ',
      'je':' co net org ',
      'jo':' com edu gov mil name net org sch ',
      'jp':' ac ad co ed go gr lg ne or ',
      'ke':' ac co go info me mobi ne or sc ',
      'kh':' com edu gov mil net org per ',
      'ki':' biz com de edu gov info mob net org tel ',
      'km':' asso com coop edu gouv k medecin mil nom notaires pharmaciens presse tm veterinaire ',
      'kn':' edu gov net org ',
      'kr':' ac busan chungbuk chungnam co daegu daejeon es gangwon go gwangju gyeongbuk gyeonggi gyeongnam hs incheon jeju jeonbuk jeonnam k kg mil ms ne or pe re sc seoul ulsan ',
      'kw':' com edu gov net org ',
      'ky':' com edu gov net org ',
      'kz':' com edu gov mil net org ',
      'lb':' com edu gov net org ',
      'lk':' assn com edu gov grp hotel int ltd net ngo org sch soc web ',
      'lr':' com edu gov net org ',
      'lv':' asn com conf edu gov id mil net org ',
      'ly':' com edu gov id med net org plc sch ',
      'ma':' ac co gov m net org press ',
      'mc':' asso tm ',
      'me':' ac co edu gov its net org priv ',
      'mg':' com edu gov mil nom org prd tm ',
      'mk':' com edu gov inf name net org pro ',
      'ml':' com edu gov net org presse ',
      'mn':' edu gov org ',
      'mo':' com edu gov net org ',
      'mt':' com edu gov net org ',
      'mv':' aero biz com coop edu gov info int mil museum name net org pro ',
      'mw':' ac co com coop edu gov int museum net org ',
      'mx':' com edu gob net org ',
      'my':' com edu gov mil name net org sch ',
      'nf':' arts com firm info net other per rec store web ',
      'ng':' biz com edu gov mil mobi name net org sch ',
      'ni':' ac co com edu gob mil net nom org ',
      'np':' com edu gov mil net org ',
      'nr':' biz com edu gov info net org ',
      'om':' ac biz co com edu gov med mil museum net org pro sch ',
      'pe':' com edu gob mil net nom org sld ',
      'ph':' com edu gov i mil net ngo org ',
      'pk':' biz com edu fam gob gok gon gop gos gov net org web ',
      'pl':' art bialystok biz com edu gda gdansk gorzow gov info katowice krakow lodz lublin mil net ngo olsztyn org poznan pwr radom slupsk szczecin torun warszawa waw wroc wroclaw zgora ',
      'pr':' ac biz com edu est gov info isla name net org pro prof ',
      'ps':' com edu gov net org plo sec ',
      'pw':' belau co ed go ne or ',
      'ro':' arts com firm info nom nt org rec store tm www ',
      'rs':' ac co edu gov in org ',
      'sb':' com edu gov net org ',
      'sc':' com edu gov net org ',
      'sh':' co com edu gov net nom org ',
      'sl':' com edu gov net org ',
      'st':' co com consulado edu embaixada gov mil net org principe saotome store ',
      'sv':' com edu gob org red ',
      'sz':' ac co org ',
      'tr':' av bbs bel biz com dr edu gen gov info k12 name net org pol tel tsk tv web ',
      'tt':' aero biz cat co com coop edu gov info int jobs mil mobi museum name net org pro tel travel ',
      'tw':' club com ebiz edu game gov idv mil net org ',
      'mu':' ac co com gov net or org ',
      'mz':' ac co edu gov org ',
      'na':' co com ',
      'nz':' ac co cri geek gen govt health iwi maori mil net org parliament school ',
      'pa':' abo ac com edu gob ing med net nom org sld ',
      'pt':' com edu gov int net nome org publ ',
      'py':' com edu gov mil net org ',
      'qa':' com edu gov mil net org ',
      're':' asso com nom ',
      'ru':' ac adygeya altai amur arkhangelsk astrakhan bashkiria belgorod bir bryansk buryatia cbg chel chelyabinsk chita chukotka chuvashia com dagestan e-burg edu gov grozny int irkutsk ivanovo izhevsk jar joshkar-ola kalmykia kaluga kamchatka karelia kazan kchr kemerovo khabarovsk khakassia khv kirov koenig komi kostroma kranoyarsk kuban kurgan kursk lipetsk magadan mari mari-el marine mil mordovia mosreg msk murmansk nalchik net nnov nov novosibirsk nsk omsk orenburg org oryol penza perm pp pskov ptz rnd ryazan sakhalin samara saratov simbirsk smolensk spb stavropol stv surgut tambov tatarstan tom tomsk tsaritsyn tsk tula tuva tver tyumen udm udmurtia ulan-ude vladikavkaz vladimir vladivostok volgograd vologda voronezh vrn vyatka yakutia yamal yekaterinburg yuzhno-sakhalinsk ',
      'rw':' ac co com edu gouv gov int mil net ',
      'sa':' com edu gov med net org pub sch ',
      'sd':' com edu gov info med net org tv ',
      'se':' a ac b bd c d e f g h i k l m n o org p parti pp press r s t tm u w x y z ',
      'sg':' com edu gov idn net org per ',
      'sn':' art com edu gouv org perso univ ',
      'sy':' com edu gov mil net news org ',
      'th':' ac co go in mi net or ',
      'tj':' ac biz co com edu go gov info int mil name net nic org test web ',
      'tn':' agrinet com defense edunet ens fin gov ind info intl mincom nat net org perso rnrt rns rnu tourism ',
      'tz':' ac co go ne or ',
      'ua':' biz cherkassy chernigov chernovtsy ck cn co com crimea cv dn dnepropetrovsk donetsk dp edu gov if in ivano-frankivsk kh kharkov kherson khmelnitskiy kiev kirovograd km kr ks kv lg lugansk lutsk lviv me mk net nikolaev od odessa org pl poltava pp rovno rv sebastopol sumy te ternopil uzhgorod vinnica vn zaporizhzhe zhitomir zp zt ',
      'ug':' ac co go ne or org sc ',
      'uk':' ac bl british-library co cym gov govt icnet jet lea ltd me mil mod national-library-scotland nel net nhs nic nls org orgn parliament plc police sch scot soc ',
      'us':' dni fed isa kids nsn ',
      'uy':' com edu gub mil net org ',
      've':' co com edu gob info mil net org web ',
      'vi':' co com k12 net org ',
      'vn':' ac biz com edu gov health info int name net org pro ',
      'ye':' co com gov ltd me net org plc ',
      'yu':' ac co edu gov org ',
      'za':' ac agric alt bourse city co cybernet db edu gov grondar iaccess imt inca landesign law mil net ngo nis nom olivetti org pix school tm web ',
      'zm':' ac co com edu gov net org sch ',
      // https://en.wikipedia.org/wiki/CentralNic#Second-level_domains
      'com': 'ar br cn de eu gb gr hu jpn kr no qc ru sa se uk us uy za ',
      'net': 'gb jp se uk ',
      'org': 'ae',
      'de': 'com '
    },
    // gorhill 2013-10-25: Using indexOf() instead Regexp(). Significant boost
    // in both performance and memory footprint. No initialization required.
    // http://jsperf.com/uri-js-sld-regex-vs-binary-search/4
    // Following methods use lastIndexOf() rather than array.split() in order
    // to avoid any memory allocations.
    has: function(domain) {
      var tldOffset = domain.lastIndexOf('.');
      if (tldOffset <= 0 || tldOffset >= (domain.length-1)) {
        return false;
      }
      var sldOffset = domain.lastIndexOf('.', tldOffset-1);
      if (sldOffset <= 0 || sldOffset >= (tldOffset-1)) {
        return false;
      }
      var sldList = SLD.list[domain.slice(tldOffset+1)];
      if (!sldList) {
        return false;
      }
      return sldList.indexOf(' ' + domain.slice(sldOffset+1, tldOffset) + ' ') >= 0;
    },
    is: function(domain) {
      var tldOffset = domain.lastIndexOf('.');
      if (tldOffset <= 0 || tldOffset >= (domain.length-1)) {
        return false;
      }
      var sldOffset = domain.lastIndexOf('.', tldOffset-1);
      if (sldOffset >= 0) {
        return false;
      }
      var sldList = SLD.list[domain.slice(tldOffset+1)];
      if (!sldList) {
        return false;
      }
      return sldList.indexOf(' ' + domain.slice(0, tldOffset) + ' ') >= 0;
    },
    get: function(domain) {
      var tldOffset = domain.lastIndexOf('.');
      if (tldOffset <= 0 || tldOffset >= (domain.length-1)) {
        return null;
      }
      var sldOffset = domain.lastIndexOf('.', tldOffset-1);
      if (sldOffset <= 0 || sldOffset >= (tldOffset-1)) {
        return null;
      }
      var sldList = SLD.list[domain.slice(tldOffset+1)];
      if (!sldList) {
        return null;
      }
      if (sldList.indexOf(' ' + domain.slice(sldOffset+1, tldOffset) + ' ') < 0) {
        return null;
      }
      return domain.slice(sldOffset+1);
    },
    noConflict: function(){
      if (root.SecondLevelDomains === this) {
        root.SecondLevelDomains = _SecondLevelDomains;
      }
      return this;
    }
  };

  return SLD;
}));

},{}],5:[function(require,module,exports){
/*!
 * URI.js - Mutating URLs
 *
 * Version: 1.19.1
 *
 * Author: Rodney Rehm
 * Web: http://medialize.github.io/URI.js/
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *
 */
(function (root, factory) {
  'use strict';
  // https://github.com/umdjs/umd/blob/master/returnExports.js
  if (typeof module === 'object' && module.exports) {
    // Node
    module.exports = factory(require('./punycode'), require('./IPv6'), require('./SecondLevelDomains'));
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['./punycode', './IPv6', './SecondLevelDomains'], factory);
  } else {
    // Browser globals (root is window)
    root.URI = factory(root.punycode, root.IPv6, root.SecondLevelDomains, root);
  }
}(this, function (punycode, IPv6, SLD, root) {
  'use strict';
  /*global location, escape, unescape */
  // FIXME: v2.0.0 renamce non-camelCase properties to uppercase
  /*jshint camelcase: false */

  // save current URI variable, if any
  var _URI = root && root.URI;

  function URI(url, base) {
    var _urlSupplied = arguments.length >= 1;
    var _baseSupplied = arguments.length >= 2;

    // Allow instantiation without the 'new' keyword
    if (!(this instanceof URI)) {
      if (_urlSupplied) {
        if (_baseSupplied) {
          return new URI(url, base);
        }

        return new URI(url);
      }

      return new URI();
    }

    if (url === undefined) {
      if (_urlSupplied) {
        throw new TypeError('undefined is not a valid argument for URI');
      }

      if (typeof location !== 'undefined') {
        url = location.href + '';
      } else {
        url = '';
      }
    }

    if (url === null) {
      if (_urlSupplied) {
        throw new TypeError('null is not a valid argument for URI');
      }
    }

    this.href(url);

    // resolve to base according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#constructor
    if (base !== undefined) {
      return this.absoluteTo(base);
    }

    return this;
  }

  function isInteger(value) {
    return /^[0-9]+$/.test(value);
  }

  URI.version = '1.19.1';

  var p = URI.prototype;
  var hasOwn = Object.prototype.hasOwnProperty;

  function escapeRegEx(string) {
    // https://github.com/medialize/URI.js/commit/85ac21783c11f8ccab06106dba9735a31a86924d#commitcomment-821963
    return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  }

  function getType(value) {
    // IE8 doesn't return [Object Undefined] but [Object Object] for undefined value
    if (value === undefined) {
      return 'Undefined';
    }

    return String(Object.prototype.toString.call(value)).slice(8, -1);
  }

  function isArray(obj) {
    return getType(obj) === 'Array';
  }

  function filterArrayValues(data, value) {
    var lookup = {};
    var i, length;

    if (getType(value) === 'RegExp') {
      lookup = null;
    } else if (isArray(value)) {
      for (i = 0, length = value.length; i < length; i++) {
        lookup[value[i]] = true;
      }
    } else {
      lookup[value] = true;
    }

    for (i = 0, length = data.length; i < length; i++) {
      /*jshint laxbreak: true */
      var _match = lookup && lookup[data[i]] !== undefined
        || !lookup && value.test(data[i]);
      /*jshint laxbreak: false */
      if (_match) {
        data.splice(i, 1);
        length--;
        i--;
      }
    }

    return data;
  }

  function arrayContains(list, value) {
    var i, length;

    // value may be string, number, array, regexp
    if (isArray(value)) {
      // Note: this can be optimized to O(n) (instead of current O(m * n))
      for (i = 0, length = value.length; i < length; i++) {
        if (!arrayContains(list, value[i])) {
          return false;
        }
      }

      return true;
    }

    var _type = getType(value);
    for (i = 0, length = list.length; i < length; i++) {
      if (_type === 'RegExp') {
        if (typeof list[i] === 'string' && list[i].match(value)) {
          return true;
        }
      } else if (list[i] === value) {
        return true;
      }
    }

    return false;
  }

  function arraysEqual(one, two) {
    if (!isArray(one) || !isArray(two)) {
      return false;
    }

    // arrays can't be equal if they have different amount of content
    if (one.length !== two.length) {
      return false;
    }

    one.sort();
    two.sort();

    for (var i = 0, l = one.length; i < l; i++) {
      if (one[i] !== two[i]) {
        return false;
      }
    }

    return true;
  }

  function trimSlashes(text) {
    var trim_expression = /^\/+|\/+$/g;
    return text.replace(trim_expression, '');
  }

  URI._parts = function() {
    return {
      protocol: null,
      username: null,
      password: null,
      hostname: null,
      urn: null,
      port: null,
      path: null,
      query: null,
      fragment: null,
      // state
      preventInvalidHostname: URI.preventInvalidHostname,
      duplicateQueryParameters: URI.duplicateQueryParameters,
      escapeQuerySpace: URI.escapeQuerySpace
    };
  };
  // state: throw on invalid hostname
  // see https://github.com/medialize/URI.js/pull/345
  // and https://github.com/medialize/URI.js/issues/354
  URI.preventInvalidHostname = false;
  // state: allow duplicate query parameters (a=1&a=1)
  URI.duplicateQueryParameters = false;
  // state: replaces + with %20 (space in query strings)
  URI.escapeQuerySpace = true;
  // static properties
  URI.protocol_expression = /^[a-z][a-z0-9.+-]*$/i;
  URI.idn_expression = /[^a-z0-9\._-]/i;
  URI.punycode_expression = /(xn--)/i;
  // well, 333.444.555.666 matches, but it sure ain't no IPv4 - do we care?
  URI.ip4_expression = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  // credits to Rich Brown
  // source: http://forums.intermapper.com/viewtopic.php?p=1096#1096
  // specification: http://www.ietf.org/rfc/rfc4291.txt
  URI.ip6_expression = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
  // expression used is "gruber revised" (@gruber v2) determined to be the
  // best solution in a regex-golf we did a couple of ages ago at
  // * http://mathiasbynens.be/demo/url-regex
  // * http://rodneyrehm.de/t/url-regex.html
  URI.find_uri_expression = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;
  URI.findUri = {
    // valid "scheme://" or "www."
    start: /\b(?:([a-z][a-z0-9.+-]*:\/\/)|www\.)/gi,
    // everything up to the next whitespace
    end: /[\s\r\n]|$/,
    // trim trailing punctuation captured by end RegExp
    trim: /[`!()\[\]{};:'".,<>?«»“”„‘’]+$/,
    // balanced parens inclusion (), [], {}, <>
    parens: /(\([^\)]*\)|\[[^\]]*\]|\{[^}]*\}|<[^>]*>)/g,
  };
  // http://www.iana.org/assignments/uri-schemes.html
  // http://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers#Well-known_ports
  URI.defaultPorts = {
    http: '80',
    https: '443',
    ftp: '21',
    gopher: '70',
    ws: '80',
    wss: '443'
  };
  // list of protocols which always require a hostname
  URI.hostProtocols = [
    'http',
    'https'
  ];

  // allowed hostname characters according to RFC 3986
  // ALPHA DIGIT "-" "." "_" "~" "!" "$" "&" "'" "(" ")" "*" "+" "," ";" "=" %encoded
  // I've never seen a (non-IDN) hostname other than: ALPHA DIGIT . - _
  URI.invalid_hostname_characters = /[^a-zA-Z0-9\.\-:_]/;
  // map DOM Elements to their URI attribute
  URI.domAttributes = {
    'a': 'href',
    'blockquote': 'cite',
    'link': 'href',
    'base': 'href',
    'script': 'src',
    'form': 'action',
    'img': 'src',
    'area': 'href',
    'iframe': 'src',
    'embed': 'src',
    'source': 'src',
    'track': 'src',
    'input': 'src', // but only if type="image"
    'audio': 'src',
    'video': 'src'
  };
  URI.getDomAttribute = function(node) {
    if (!node || !node.nodeName) {
      return undefined;
    }

    var nodeName = node.nodeName.toLowerCase();
    // <input> should only expose src for type="image"
    if (nodeName === 'input' && node.type !== 'image') {
      return undefined;
    }

    return URI.domAttributes[nodeName];
  };

  function escapeForDumbFirefox36(value) {
    // https://github.com/medialize/URI.js/issues/91
    return escape(value);
  }

  // encoding / decoding according to RFC3986
  function strictEncodeURIComponent(string) {
    // see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/encodeURIComponent
    return encodeURIComponent(string)
      .replace(/[!'()*]/g, escapeForDumbFirefox36)
      .replace(/\*/g, '%2A');
  }
  URI.encode = strictEncodeURIComponent;
  URI.decode = decodeURIComponent;
  URI.iso8859 = function() {
    URI.encode = escape;
    URI.decode = unescape;
  };
  URI.unicode = function() {
    URI.encode = strictEncodeURIComponent;
    URI.decode = decodeURIComponent;
  };
  URI.characters = {
    pathname: {
      encode: {
        // RFC3986 2.1: For consistency, URI producers and normalizers should
        // use uppercase hexadecimal digits for all percent-encodings.
        expression: /%(24|26|2B|2C|3B|3D|3A|40)/ig,
        map: {
          // -._~!'()*
          '%24': '$',
          '%26': '&',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '=',
          '%3A': ':',
          '%40': '@'
        }
      },
      decode: {
        expression: /[\/\?#]/g,
        map: {
          '/': '%2F',
          '?': '%3F',
          '#': '%23'
        }
      }
    },
    reserved: {
      encode: {
        // RFC3986 2.1: For consistency, URI producers and normalizers should
        // use uppercase hexadecimal digits for all percent-encodings.
        expression: /%(21|23|24|26|27|28|29|2A|2B|2C|2F|3A|3B|3D|3F|40|5B|5D)/ig,
        map: {
          // gen-delims
          '%3A': ':',
          '%2F': '/',
          '%3F': '?',
          '%23': '#',
          '%5B': '[',
          '%5D': ']',
          '%40': '@',
          // sub-delims
          '%21': '!',
          '%24': '$',
          '%26': '&',
          '%27': '\'',
          '%28': '(',
          '%29': ')',
          '%2A': '*',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '='
        }
      }
    },
    urnpath: {
      // The characters under `encode` are the characters called out by RFC 2141 as being acceptable
      // for usage in a URN. RFC2141 also calls out "-", ".", and "_" as acceptable characters, but
      // these aren't encoded by encodeURIComponent, so we don't have to call them out here. Also
      // note that the colon character is not featured in the encoding map; this is because URI.js
      // gives the colons in URNs semantic meaning as the delimiters of path segements, and so it
      // should not appear unencoded in a segment itself.
      // See also the note above about RFC3986 and capitalalized hex digits.
      encode: {
        expression: /%(21|24|27|28|29|2A|2B|2C|3B|3D|40)/ig,
        map: {
          '%21': '!',
          '%24': '$',
          '%27': '\'',
          '%28': '(',
          '%29': ')',
          '%2A': '*',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '=',
          '%40': '@'
        }
      },
      // These characters are the characters called out by RFC2141 as "reserved" characters that
      // should never appear in a URN, plus the colon character (see note above).
      decode: {
        expression: /[\/\?#:]/g,
        map: {
          '/': '%2F',
          '?': '%3F',
          '#': '%23',
          ':': '%3A'
        }
      }
    }
  };
  URI.encodeQuery = function(string, escapeQuerySpace) {
    var escaped = URI.encode(string + '');
    if (escapeQuerySpace === undefined) {
      escapeQuerySpace = URI.escapeQuerySpace;
    }

    return escapeQuerySpace ? escaped.replace(/%20/g, '+') : escaped;
  };
  URI.decodeQuery = function(string, escapeQuerySpace) {
    string += '';
    if (escapeQuerySpace === undefined) {
      escapeQuerySpace = URI.escapeQuerySpace;
    }

    try {
      return URI.decode(escapeQuerySpace ? string.replace(/\+/g, '%20') : string);
    } catch(e) {
      // we're not going to mess with weird encodings,
      // give up and return the undecoded original string
      // see https://github.com/medialize/URI.js/issues/87
      // see https://github.com/medialize/URI.js/issues/92
      return string;
    }
  };
  // generate encode/decode path functions
  var _parts = {'encode':'encode', 'decode':'decode'};
  var _part;
  var generateAccessor = function(_group, _part) {
    return function(string) {
      try {
        return URI[_part](string + '').replace(URI.characters[_group][_part].expression, function(c) {
          return URI.characters[_group][_part].map[c];
        });
      } catch (e) {
        // we're not going to mess with weird encodings,
        // give up and return the undecoded original string
        // see https://github.com/medialize/URI.js/issues/87
        // see https://github.com/medialize/URI.js/issues/92
        return string;
      }
    };
  };

  for (_part in _parts) {
    URI[_part + 'PathSegment'] = generateAccessor('pathname', _parts[_part]);
    URI[_part + 'UrnPathSegment'] = generateAccessor('urnpath', _parts[_part]);
  }

  var generateSegmentedPathFunction = function(_sep, _codingFuncName, _innerCodingFuncName) {
    return function(string) {
      // Why pass in names of functions, rather than the function objects themselves? The
      // definitions of some functions (but in particular, URI.decode) will occasionally change due
      // to URI.js having ISO8859 and Unicode modes. Passing in the name and getting it will ensure
      // that the functions we use here are "fresh".
      var actualCodingFunc;
      if (!_innerCodingFuncName) {
        actualCodingFunc = URI[_codingFuncName];
      } else {
        actualCodingFunc = function(string) {
          return URI[_codingFuncName](URI[_innerCodingFuncName](string));
        };
      }

      var segments = (string + '').split(_sep);

      for (var i = 0, length = segments.length; i < length; i++) {
        segments[i] = actualCodingFunc(segments[i]);
      }

      return segments.join(_sep);
    };
  };

  // This takes place outside the above loop because we don't want, e.g., encodeUrnPath functions.
  URI.decodePath = generateSegmentedPathFunction('/', 'decodePathSegment');
  URI.decodeUrnPath = generateSegmentedPathFunction(':', 'decodeUrnPathSegment');
  URI.recodePath = generateSegmentedPathFunction('/', 'encodePathSegment', 'decode');
  URI.recodeUrnPath = generateSegmentedPathFunction(':', 'encodeUrnPathSegment', 'decode');

  URI.encodeReserved = generateAccessor('reserved', 'encode');

  URI.parse = function(string, parts) {
    var pos;
    if (!parts) {
      parts = {
        preventInvalidHostname: URI.preventInvalidHostname
      };
    }
    // [protocol"://"[username[":"password]"@"]hostname[":"port]"/"?][path]["?"querystring]["#"fragment]

    // extract fragment
    pos = string.indexOf('#');
    if (pos > -1) {
      // escaping?
      parts.fragment = string.substring(pos + 1) || null;
      string = string.substring(0, pos);
    }

    // extract query
    pos = string.indexOf('?');
    if (pos > -1) {
      // escaping?
      parts.query = string.substring(pos + 1) || null;
      string = string.substring(0, pos);
    }

    // extract protocol
    if (string.substring(0, 2) === '//') {
      // relative-scheme
      parts.protocol = null;
      string = string.substring(2);
      // extract "user:pass@host:port"
      string = URI.parseAuthority(string, parts);
    } else {
      pos = string.indexOf(':');
      if (pos > -1) {
        parts.protocol = string.substring(0, pos) || null;
        if (parts.protocol && !parts.protocol.match(URI.protocol_expression)) {
          // : may be within the path
          parts.protocol = undefined;
        } else if (string.substring(pos + 1, pos + 3) === '//') {
          string = string.substring(pos + 3);

          // extract "user:pass@host:port"
          string = URI.parseAuthority(string, parts);
        } else {
          string = string.substring(pos + 1);
          parts.urn = true;
        }
      }
    }

    // what's left must be the path
    parts.path = string;

    // and we're done
    return parts;
  };
  URI.parseHost = function(string, parts) {
    if (!string) {
      string = '';
    }

    // Copy chrome, IE, opera backslash-handling behavior.
    // Back slashes before the query string get converted to forward slashes
    // See: https://github.com/joyent/node/blob/386fd24f49b0e9d1a8a076592a404168faeecc34/lib/url.js#L115-L124
    // See: https://code.google.com/p/chromium/issues/detail?id=25916
    // https://github.com/medialize/URI.js/pull/233
    string = string.replace(/\\/g, '/');

    // extract host:port
    var pos = string.indexOf('/');
    var bracketPos;
    var t;

    if (pos === -1) {
      pos = string.length;
    }

    if (string.charAt(0) === '[') {
      // IPv6 host - http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04#section-6
      // I claim most client software breaks on IPv6 anyways. To simplify things, URI only accepts
      // IPv6+port in the format [2001:db8::1]:80 (for the time being)
      bracketPos = string.indexOf(']');
      parts.hostname = string.substring(1, bracketPos) || null;
      parts.port = string.substring(bracketPos + 2, pos) || null;
      if (parts.port === '/') {
        parts.port = null;
      }
    } else {
      var firstColon = string.indexOf(':');
      var firstSlash = string.indexOf('/');
      var nextColon = string.indexOf(':', firstColon + 1);
      if (nextColon !== -1 && (firstSlash === -1 || nextColon < firstSlash)) {
        // IPv6 host contains multiple colons - but no port
        // this notation is actually not allowed by RFC 3986, but we're a liberal parser
        parts.hostname = string.substring(0, pos) || null;
        parts.port = null;
      } else {
        t = string.substring(0, pos).split(':');
        parts.hostname = t[0] || null;
        parts.port = t[1] || null;
      }
    }

    if (parts.hostname && string.substring(pos).charAt(0) !== '/') {
      pos++;
      string = '/' + string;
    }

    if (parts.preventInvalidHostname) {
      URI.ensureValidHostname(parts.hostname, parts.protocol);
    }

    if (parts.port) {
      URI.ensureValidPort(parts.port);
    }

    return string.substring(pos) || '/';
  };
  URI.parseAuthority = function(string, parts) {
    string = URI.parseUserinfo(string, parts);
    return URI.parseHost(string, parts);
  };
  URI.parseUserinfo = function(string, parts) {
    // extract username:password
    var firstSlash = string.indexOf('/');
    var pos = string.lastIndexOf('@', firstSlash > -1 ? firstSlash : string.length - 1);
    var t;

    // authority@ must come before /path
    if (pos > -1 && (firstSlash === -1 || pos < firstSlash)) {
      t = string.substring(0, pos).split(':');
      parts.username = t[0] ? URI.decode(t[0]) : null;
      t.shift();
      parts.password = t[0] ? URI.decode(t.join(':')) : null;
      string = string.substring(pos + 1);
    } else {
      parts.username = null;
      parts.password = null;
    }

    return string;
  };
  URI.parseQuery = function(string, escapeQuerySpace) {
    if (!string) {
      return {};
    }

    // throw out the funky business - "?"[name"="value"&"]+
    string = string.replace(/&+/g, '&').replace(/^\?*&*|&+$/g, '');

    if (!string) {
      return {};
    }

    var items = {};
    var splits = string.split('&');
    var length = splits.length;
    var v, name, value;

    for (var i = 0; i < length; i++) {
      v = splits[i].split('=');
      name = URI.decodeQuery(v.shift(), escapeQuerySpace);
      // no "=" is null according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#collect-url-parameters
      value = v.length ? URI.decodeQuery(v.join('='), escapeQuerySpace) : null;

      if (hasOwn.call(items, name)) {
        if (typeof items[name] === 'string' || items[name] === null) {
          items[name] = [items[name]];
        }

        items[name].push(value);
      } else {
        items[name] = value;
      }
    }

    return items;
  };

  URI.build = function(parts) {
    var t = '';

    if (parts.protocol) {
      t += parts.protocol + ':';
    }

    if (!parts.urn && (t || parts.hostname)) {
      t += '//';
    }

    t += (URI.buildAuthority(parts) || '');

    if (typeof parts.path === 'string') {
      if (parts.path.charAt(0) !== '/' && typeof parts.hostname === 'string') {
        t += '/';
      }

      t += parts.path;
    }

    if (typeof parts.query === 'string' && parts.query) {
      t += '?' + parts.query;
    }

    if (typeof parts.fragment === 'string' && parts.fragment) {
      t += '#' + parts.fragment;
    }
    return t;
  };
  URI.buildHost = function(parts) {
    var t = '';

    if (!parts.hostname) {
      return '';
    } else if (URI.ip6_expression.test(parts.hostname)) {
      t += '[' + parts.hostname + ']';
    } else {
      t += parts.hostname;
    }

    if (parts.port) {
      t += ':' + parts.port;
    }

    return t;
  };
  URI.buildAuthority = function(parts) {
    return URI.buildUserinfo(parts) + URI.buildHost(parts);
  };
  URI.buildUserinfo = function(parts) {
    var t = '';

    if (parts.username) {
      t += URI.encode(parts.username);
    }

    if (parts.password) {
      t += ':' + URI.encode(parts.password);
    }

    if (t) {
      t += '@';
    }

    return t;
  };
  URI.buildQuery = function(data, duplicateQueryParameters, escapeQuerySpace) {
    // according to http://tools.ietf.org/html/rfc3986 or http://labs.apache.org/webarch/uri/rfc/rfc3986.html
    // being »-._~!$&'()*+,;=:@/?« %HEX and alnum are allowed
    // the RFC explicitly states ?/foo being a valid use case, no mention of parameter syntax!
    // URI.js treats the query string as being application/x-www-form-urlencoded
    // see http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type

    var t = '';
    var unique, key, i, length;
    for (key in data) {
      if (hasOwn.call(data, key) && key) {
        if (isArray(data[key])) {
          unique = {};
          for (i = 0, length = data[key].length; i < length; i++) {
            if (data[key][i] !== undefined && unique[data[key][i] + ''] === undefined) {
              t += '&' + URI.buildQueryParameter(key, data[key][i], escapeQuerySpace);
              if (duplicateQueryParameters !== true) {
                unique[data[key][i] + ''] = true;
              }
            }
          }
        } else if (data[key] !== undefined) {
          t += '&' + URI.buildQueryParameter(key, data[key], escapeQuerySpace);
        }
      }
    }

    return t.substring(1);
  };
  URI.buildQueryParameter = function(name, value, escapeQuerySpace) {
    // http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type -- application/x-www-form-urlencoded
    // don't append "=" for null values, according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#url-parameter-serialization
    return URI.encodeQuery(name, escapeQuerySpace) + (value !== null ? '=' + URI.encodeQuery(value, escapeQuerySpace) : '');
  };

  URI.addQuery = function(data, name, value) {
    if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          URI.addQuery(data, key, name[key]);
        }
      }
    } else if (typeof name === 'string') {
      if (data[name] === undefined) {
        data[name] = value;
        return;
      } else if (typeof data[name] === 'string') {
        data[name] = [data[name]];
      }

      if (!isArray(value)) {
        value = [value];
      }

      data[name] = (data[name] || []).concat(value);
    } else {
      throw new TypeError('URI.addQuery() accepts an object, string as the name parameter');
    }
  };

  URI.setQuery = function(data, name, value) {
    if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          URI.setQuery(data, key, name[key]);
        }
      }
    } else if (typeof name === 'string') {
      data[name] = value === undefined ? null : value;
    } else {
      throw new TypeError('URI.setQuery() accepts an object, string as the name parameter');
    }
  };

  URI.removeQuery = function(data, name, value) {
    var i, length, key;

    if (isArray(name)) {
      for (i = 0, length = name.length; i < length; i++) {
        data[name[i]] = undefined;
      }
    } else if (getType(name) === 'RegExp') {
      for (key in data) {
        if (name.test(key)) {
          data[key] = undefined;
        }
      }
    } else if (typeof name === 'object') {
      for (key in name) {
        if (hasOwn.call(name, key)) {
          URI.removeQuery(data, key, name[key]);
        }
      }
    } else if (typeof name === 'string') {
      if (value !== undefined) {
        if (getType(value) === 'RegExp') {
          if (!isArray(data[name]) && value.test(data[name])) {
            data[name] = undefined;
          } else {
            data[name] = filterArrayValues(data[name], value);
          }
        } else if (data[name] === String(value) && (!isArray(value) || value.length === 1)) {
          data[name] = undefined;
        } else if (isArray(data[name])) {
          data[name] = filterArrayValues(data[name], value);
        }
      } else {
        data[name] = undefined;
      }
    } else {
      throw new TypeError('URI.removeQuery() accepts an object, string, RegExp as the first parameter');
    }
  };
  URI.hasQuery = function(data, name, value, withinArray) {
    switch (getType(name)) {
      case 'String':
        // Nothing to do here
        break;

      case 'RegExp':
        for (var key in data) {
          if (hasOwn.call(data, key)) {
            if (name.test(key) && (value === undefined || URI.hasQuery(data, key, value))) {
              return true;
            }
          }
        }

        return false;

      case 'Object':
        for (var _key in name) {
          if (hasOwn.call(name, _key)) {
            if (!URI.hasQuery(data, _key, name[_key])) {
              return false;
            }
          }
        }

        return true;

      default:
        throw new TypeError('URI.hasQuery() accepts a string, regular expression or object as the name parameter');
    }

    switch (getType(value)) {
      case 'Undefined':
        // true if exists (but may be empty)
        return name in data; // data[name] !== undefined;

      case 'Boolean':
        // true if exists and non-empty
        var _booly = Boolean(isArray(data[name]) ? data[name].length : data[name]);
        return value === _booly;

      case 'Function':
        // allow complex comparison
        return !!value(data[name], name, data);

      case 'Array':
        if (!isArray(data[name])) {
          return false;
        }

        var op = withinArray ? arrayContains : arraysEqual;
        return op(data[name], value);

      case 'RegExp':
        if (!isArray(data[name])) {
          return Boolean(data[name] && data[name].match(value));
        }

        if (!withinArray) {
          return false;
        }

        return arrayContains(data[name], value);

      case 'Number':
        value = String(value);
        /* falls through */
      case 'String':
        if (!isArray(data[name])) {
          return data[name] === value;
        }

        if (!withinArray) {
          return false;
        }

        return arrayContains(data[name], value);

      default:
        throw new TypeError('URI.hasQuery() accepts undefined, boolean, string, number, RegExp, Function as the value parameter');
    }
  };


  URI.joinPaths = function() {
    var input = [];
    var segments = [];
    var nonEmptySegments = 0;

    for (var i = 0; i < arguments.length; i++) {
      var url = new URI(arguments[i]);
      input.push(url);
      var _segments = url.segment();
      for (var s = 0; s < _segments.length; s++) {
        if (typeof _segments[s] === 'string') {
          segments.push(_segments[s]);
        }

        if (_segments[s]) {
          nonEmptySegments++;
        }
      }
    }

    if (!segments.length || !nonEmptySegments) {
      return new URI('');
    }

    var uri = new URI('').segment(segments);

    if (input[0].path() === '' || input[0].path().slice(0, 1) === '/') {
      uri.path('/' + uri.path());
    }

    return uri.normalize();
  };

  URI.commonPath = function(one, two) {
    var length = Math.min(one.length, two.length);
    var pos;

    // find first non-matching character
    for (pos = 0; pos < length; pos++) {
      if (one.charAt(pos) !== two.charAt(pos)) {
        pos--;
        break;
      }
    }

    if (pos < 1) {
      return one.charAt(0) === two.charAt(0) && one.charAt(0) === '/' ? '/' : '';
    }

    // revert to last /
    if (one.charAt(pos) !== '/' || two.charAt(pos) !== '/') {
      pos = one.substring(0, pos).lastIndexOf('/');
    }

    return one.substring(0, pos + 1);
  };

  URI.withinString = function(string, callback, options) {
    options || (options = {});
    var _start = options.start || URI.findUri.start;
    var _end = options.end || URI.findUri.end;
    var _trim = options.trim || URI.findUri.trim;
    var _parens = options.parens || URI.findUri.parens;
    var _attributeOpen = /[a-z0-9-]=["']?$/i;

    _start.lastIndex = 0;
    while (true) {
      var match = _start.exec(string);
      if (!match) {
        break;
      }

      var start = match.index;
      if (options.ignoreHtml) {
        // attribut(e=["']?$)
        var attributeOpen = string.slice(Math.max(start - 3, 0), start);
        if (attributeOpen && _attributeOpen.test(attributeOpen)) {
          continue;
        }
      }

      var end = start + string.slice(start).search(_end);
      var slice = string.slice(start, end);
      // make sure we include well balanced parens
      var parensEnd = -1;
      while (true) {
        var parensMatch = _parens.exec(slice);
        if (!parensMatch) {
          break;
        }

        var parensMatchEnd = parensMatch.index + parensMatch[0].length;
        parensEnd = Math.max(parensEnd, parensMatchEnd);
      }

      if (parensEnd > -1) {
        slice = slice.slice(0, parensEnd) + slice.slice(parensEnd).replace(_trim, '');
      } else {
        slice = slice.replace(_trim, '');
      }

      if (slice.length <= match[0].length) {
        // the extract only contains the starting marker of a URI,
        // e.g. "www" or "http://"
        continue;
      }

      if (options.ignore && options.ignore.test(slice)) {
        continue;
      }

      end = start + slice.length;
      var result = callback(slice, start, end, string);
      if (result === undefined) {
        _start.lastIndex = end;
        continue;
      }

      result = String(result);
      string = string.slice(0, start) + result + string.slice(end);
      _start.lastIndex = start + result.length;
    }

    _start.lastIndex = 0;
    return string;
  };

  URI.ensureValidHostname = function(v, protocol) {
    // Theoretically URIs allow percent-encoding in Hostnames (according to RFC 3986)
    // they are not part of DNS and therefore ignored by URI.js

    var hasHostname = !!v; // not null and not an empty string
    var hasProtocol = !!protocol;
    var rejectEmptyHostname = false;

    if (hasProtocol) {
      rejectEmptyHostname = arrayContains(URI.hostProtocols, protocol);
    }

    if (rejectEmptyHostname && !hasHostname) {
      throw new TypeError('Hostname cannot be empty, if protocol is ' + protocol);
    } else if (v && v.match(URI.invalid_hostname_characters)) {
      // test punycode
      if (!punycode) {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-:_] and Punycode.js is not available');
      }
      if (punycode.toASCII(v).match(URI.invalid_hostname_characters)) {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-:_]');
      }
    }
  };

  URI.ensureValidPort = function (v) {
    if (!v) {
      return;
    }

    var port = Number(v);
    if (isInteger(port) && (port > 0) && (port < 65536)) {
      return;
    }

    throw new TypeError('Port "' + v + '" is not a valid port');
  };

  // noConflict
  URI.noConflict = function(removeAll) {
    if (removeAll) {
      var unconflicted = {
        URI: this.noConflict()
      };

      if (root.URITemplate && typeof root.URITemplate.noConflict === 'function') {
        unconflicted.URITemplate = root.URITemplate.noConflict();
      }

      if (root.IPv6 && typeof root.IPv6.noConflict === 'function') {
        unconflicted.IPv6 = root.IPv6.noConflict();
      }

      if (root.SecondLevelDomains && typeof root.SecondLevelDomains.noConflict === 'function') {
        unconflicted.SecondLevelDomains = root.SecondLevelDomains.noConflict();
      }

      return unconflicted;
    } else if (root.URI === this) {
      root.URI = _URI;
    }

    return this;
  };

  p.build = function(deferBuild) {
    if (deferBuild === true) {
      this._deferred_build = true;
    } else if (deferBuild === undefined || this._deferred_build) {
      this._string = URI.build(this._parts);
      this._deferred_build = false;
    }

    return this;
  };

  p.clone = function() {
    return new URI(this);
  };

  p.valueOf = p.toString = function() {
    return this.build(false)._string;
  };


  function generateSimpleAccessor(_part){
    return function(v, build) {
      if (v === undefined) {
        return this._parts[_part] || '';
      } else {
        this._parts[_part] = v || null;
        this.build(!build);
        return this;
      }
    };
  }

  function generatePrefixAccessor(_part, _key){
    return function(v, build) {
      if (v === undefined) {
        return this._parts[_part] || '';
      } else {
        if (v !== null) {
          v = v + '';
          if (v.charAt(0) === _key) {
            v = v.substring(1);
          }
        }

        this._parts[_part] = v;
        this.build(!build);
        return this;
      }
    };
  }

  p.protocol = generateSimpleAccessor('protocol');
  p.username = generateSimpleAccessor('username');
  p.password = generateSimpleAccessor('password');
  p.hostname = generateSimpleAccessor('hostname');
  p.port = generateSimpleAccessor('port');
  p.query = generatePrefixAccessor('query', '?');
  p.fragment = generatePrefixAccessor('fragment', '#');

  p.search = function(v, build) {
    var t = this.query(v, build);
    return typeof t === 'string' && t.length ? ('?' + t) : t;
  };
  p.hash = function(v, build) {
    var t = this.fragment(v, build);
    return typeof t === 'string' && t.length ? ('#' + t) : t;
  };

  p.pathname = function(v, build) {
    if (v === undefined || v === true) {
      var res = this._parts.path || (this._parts.hostname ? '/' : '');
      return v ? (this._parts.urn ? URI.decodeUrnPath : URI.decodePath)(res) : res;
    } else {
      if (this._parts.urn) {
        this._parts.path = v ? URI.recodeUrnPath(v) : '';
      } else {
        this._parts.path = v ? URI.recodePath(v) : '/';
      }
      this.build(!build);
      return this;
    }
  };
  p.path = p.pathname;
  p.href = function(href, build) {
    var key;

    if (href === undefined) {
      return this.toString();
    }

    this._string = '';
    this._parts = URI._parts();

    var _URI = href instanceof URI;
    var _object = typeof href === 'object' && (href.hostname || href.path || href.pathname);
    if (href.nodeName) {
      var attribute = URI.getDomAttribute(href);
      href = href[attribute] || '';
      _object = false;
    }

    // window.location is reported to be an object, but it's not the sort
    // of object we're looking for:
    // * location.protocol ends with a colon
    // * location.query != object.search
    // * location.hash != object.fragment
    // simply serializing the unknown object should do the trick
    // (for location, not for everything...)
    if (!_URI && _object && href.pathname !== undefined) {
      href = href.toString();
    }

    if (typeof href === 'string' || href instanceof String) {
      this._parts = URI.parse(String(href), this._parts);
    } else if (_URI || _object) {
      var src = _URI ? href._parts : href;
      for (key in src) {
        if (key === 'query') { continue; }
        if (hasOwn.call(this._parts, key)) {
          this._parts[key] = src[key];
        }
      }
      if (src.query) {
        this.query(src.query, false);
      }
    } else {
      throw new TypeError('invalid input');
    }

    this.build(!build);
    return this;
  };

  // identification accessors
  p.is = function(what) {
    var ip = false;
    var ip4 = false;
    var ip6 = false;
    var name = false;
    var sld = false;
    var idn = false;
    var punycode = false;
    var relative = !this._parts.urn;

    if (this._parts.hostname) {
      relative = false;
      ip4 = URI.ip4_expression.test(this._parts.hostname);
      ip6 = URI.ip6_expression.test(this._parts.hostname);
      ip = ip4 || ip6;
      name = !ip;
      sld = name && SLD && SLD.has(this._parts.hostname);
      idn = name && URI.idn_expression.test(this._parts.hostname);
      punycode = name && URI.punycode_expression.test(this._parts.hostname);
    }

    switch (what.toLowerCase()) {
      case 'relative':
        return relative;

      case 'absolute':
        return !relative;

      // hostname identification
      case 'domain':
      case 'name':
        return name;

      case 'sld':
        return sld;

      case 'ip':
        return ip;

      case 'ip4':
      case 'ipv4':
      case 'inet4':
        return ip4;

      case 'ip6':
      case 'ipv6':
      case 'inet6':
        return ip6;

      case 'idn':
        return idn;

      case 'url':
        return !this._parts.urn;

      case 'urn':
        return !!this._parts.urn;

      case 'punycode':
        return punycode;
    }

    return null;
  };

  // component specific input validation
  var _protocol = p.protocol;
  var _port = p.port;
  var _hostname = p.hostname;

  p.protocol = function(v, build) {
    if (v) {
      // accept trailing ://
      v = v.replace(/:(\/\/)?$/, '');

      if (!v.match(URI.protocol_expression)) {
        throw new TypeError('Protocol "' + v + '" contains characters other than [A-Z0-9.+-] or doesn\'t start with [A-Z]');
      }
    }

    return _protocol.call(this, v, build);
  };
  p.scheme = p.protocol;
  p.port = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v !== undefined) {
      if (v === 0) {
        v = null;
      }

      if (v) {
        v += '';
        if (v.charAt(0) === ':') {
          v = v.substring(1);
        }

        URI.ensureValidPort(v);
      }
    }
    return _port.call(this, v, build);
  };
  p.hostname = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v !== undefined) {
      var x = { preventInvalidHostname: this._parts.preventInvalidHostname };
      var res = URI.parseHost(v, x);
      if (res !== '/') {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }

      v = x.hostname;
      if (this._parts.preventInvalidHostname) {
        URI.ensureValidHostname(v, this._parts.protocol);
      }
    }

    return _hostname.call(this, v, build);
  };

  // compound accessors
  p.origin = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      var protocol = this.protocol();
      var authority = this.authority();
      if (!authority) {
        return '';
      }

      return (protocol ? protocol + '://' : '') + this.authority();
    } else {
      var origin = URI(v);
      this
        .protocol(origin.protocol())
        .authority(origin.authority())
        .build(!build);
      return this;
    }
  };
  p.host = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      return this._parts.hostname ? URI.buildHost(this._parts) : '';
    } else {
      var res = URI.parseHost(v, this._parts);
      if (res !== '/') {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }

      this.build(!build);
      return this;
    }
  };
  p.authority = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      return this._parts.hostname ? URI.buildAuthority(this._parts) : '';
    } else {
      var res = URI.parseAuthority(v, this._parts);
      if (res !== '/') {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }

      this.build(!build);
      return this;
    }
  };
  p.userinfo = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      var t = URI.buildUserinfo(this._parts);
      return t ? t.substring(0, t.length -1) : t;
    } else {
      if (v[v.length-1] !== '@') {
        v += '@';
      }

      URI.parseUserinfo(v, this._parts);
      this.build(!build);
      return this;
    }
  };
  p.resource = function(v, build) {
    var parts;

    if (v === undefined) {
      return this.path() + this.search() + this.hash();
    }

    parts = URI.parse(v);
    this._parts.path = parts.path;
    this._parts.query = parts.query;
    this._parts.fragment = parts.fragment;
    this.build(!build);
    return this;
  };

  // fraction accessors
  p.subdomain = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    // convenience, return "www" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      // grab domain and add another segment
      var end = this._parts.hostname.length - this.domain().length - 1;
      return this._parts.hostname.substring(0, end) || '';
    } else {
      var e = this._parts.hostname.length - this.domain().length;
      var sub = this._parts.hostname.substring(0, e);
      var replace = new RegExp('^' + escapeRegEx(sub));

      if (v && v.charAt(v.length - 1) !== '.') {
        v += '.';
      }

      if (v.indexOf(':') !== -1) {
        throw new TypeError('Domains cannot contain colons');
      }

      if (v) {
        URI.ensureValidHostname(v, this._parts.protocol);
      }

      this._parts.hostname = this._parts.hostname.replace(replace, v);
      this.build(!build);
      return this;
    }
  };
  p.domain = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (typeof v === 'boolean') {
      build = v;
      v = undefined;
    }

    // convenience, return "example.org" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      // if hostname consists of 1 or 2 segments, it must be the domain
      var t = this._parts.hostname.match(/\./g);
      if (t && t.length < 2) {
        return this._parts.hostname;
      }

      // grab tld and add another segment
      var end = this._parts.hostname.length - this.tld(build).length - 1;
      end = this._parts.hostname.lastIndexOf('.', end -1) + 1;
      return this._parts.hostname.substring(end) || '';
    } else {
      if (!v) {
        throw new TypeError('cannot set domain empty');
      }

      if (v.indexOf(':') !== -1) {
        throw new TypeError('Domains cannot contain colons');
      }

      URI.ensureValidHostname(v, this._parts.protocol);

      if (!this._parts.hostname || this.is('IP')) {
        this._parts.hostname = v;
      } else {
        var replace = new RegExp(escapeRegEx(this.domain()) + '$');
        this._parts.hostname = this._parts.hostname.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.tld = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (typeof v === 'boolean') {
      build = v;
      v = undefined;
    }

    // return "org" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      var pos = this._parts.hostname.lastIndexOf('.');
      var tld = this._parts.hostname.substring(pos + 1);

      if (build !== true && SLD && SLD.list[tld.toLowerCase()]) {
        return SLD.get(this._parts.hostname) || tld;
      }

      return tld;
    } else {
      var replace;

      if (!v) {
        throw new TypeError('cannot set TLD empty');
      } else if (v.match(/[^a-zA-Z0-9-]/)) {
        if (SLD && SLD.is(v)) {
          replace = new RegExp(escapeRegEx(this.tld()) + '$');
          this._parts.hostname = this._parts.hostname.replace(replace, v);
        } else {
          throw new TypeError('TLD "' + v + '" contains characters other than [A-Z0-9]');
        }
      } else if (!this._parts.hostname || this.is('IP')) {
        throw new ReferenceError('cannot set TLD on non-domain host');
      } else {
        replace = new RegExp(escapeRegEx(this.tld()) + '$');
        this._parts.hostname = this._parts.hostname.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.directory = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined || v === true) {
      if (!this._parts.path && !this._parts.hostname) {
        return '';
      }

      if (this._parts.path === '/') {
        return '/';
      }

      var end = this._parts.path.length - this.filename().length - 1;
      var res = this._parts.path.substring(0, end) || (this._parts.hostname ? '/' : '');

      return v ? URI.decodePath(res) : res;

    } else {
      var e = this._parts.path.length - this.filename().length;
      var directory = this._parts.path.substring(0, e);
      var replace = new RegExp('^' + escapeRegEx(directory));

      // fully qualifier directories begin with a slash
      if (!this.is('relative')) {
        if (!v) {
          v = '/';
        }

        if (v.charAt(0) !== '/') {
          v = '/' + v;
        }
      }

      // directories always end with a slash
      if (v && v.charAt(v.length - 1) !== '/') {
        v += '/';
      }

      v = URI.recodePath(v);
      this._parts.path = this._parts.path.replace(replace, v);
      this.build(!build);
      return this;
    }
  };
  p.filename = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (typeof v !== 'string') {
      if (!this._parts.path || this._parts.path === '/') {
        return '';
      }

      var pos = this._parts.path.lastIndexOf('/');
      var res = this._parts.path.substring(pos+1);

      return v ? URI.decodePathSegment(res) : res;
    } else {
      var mutatedDirectory = false;

      if (v.charAt(0) === '/') {
        v = v.substring(1);
      }

      if (v.match(/\.?\//)) {
        mutatedDirectory = true;
      }

      var replace = new RegExp(escapeRegEx(this.filename()) + '$');
      v = URI.recodePath(v);
      this._parts.path = this._parts.path.replace(replace, v);

      if (mutatedDirectory) {
        this.normalizePath(build);
      } else {
        this.build(!build);
      }

      return this;
    }
  };
  p.suffix = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined || v === true) {
      if (!this._parts.path || this._parts.path === '/') {
        return '';
      }

      var filename = this.filename();
      var pos = filename.lastIndexOf('.');
      var s, res;

      if (pos === -1) {
        return '';
      }

      // suffix may only contain alnum characters (yup, I made this up.)
      s = filename.substring(pos+1);
      res = (/^[a-z0-9%]+$/i).test(s) ? s : '';
      return v ? URI.decodePathSegment(res) : res;
    } else {
      if (v.charAt(0) === '.') {
        v = v.substring(1);
      }

      var suffix = this.suffix();
      var replace;

      if (!suffix) {
        if (!v) {
          return this;
        }

        this._parts.path += '.' + URI.recodePath(v);
      } else if (!v) {
        replace = new RegExp(escapeRegEx('.' + suffix) + '$');
      } else {
        replace = new RegExp(escapeRegEx(suffix) + '$');
      }

      if (replace) {
        v = URI.recodePath(v);
        this._parts.path = this._parts.path.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.segment = function(segment, v, build) {
    var separator = this._parts.urn ? ':' : '/';
    var path = this.path();
    var absolute = path.substring(0, 1) === '/';
    var segments = path.split(separator);

    if (segment !== undefined && typeof segment !== 'number') {
      build = v;
      v = segment;
      segment = undefined;
    }

    if (segment !== undefined && typeof segment !== 'number') {
      throw new Error('Bad segment "' + segment + '", must be 0-based integer');
    }

    if (absolute) {
      segments.shift();
    }

    if (segment < 0) {
      // allow negative indexes to address from the end
      segment = Math.max(segments.length + segment, 0);
    }

    if (v === undefined) {
      /*jshint laxbreak: true */
      return segment === undefined
        ? segments
        : segments[segment];
      /*jshint laxbreak: false */
    } else if (segment === null || segments[segment] === undefined) {
      if (isArray(v)) {
        segments = [];
        // collapse empty elements within array
        for (var i=0, l=v.length; i < l; i++) {
          if (!v[i].length && (!segments.length || !segments[segments.length -1].length)) {
            continue;
          }

          if (segments.length && !segments[segments.length -1].length) {
            segments.pop();
          }

          segments.push(trimSlashes(v[i]));
        }
      } else if (v || typeof v === 'string') {
        v = trimSlashes(v);
        if (segments[segments.length -1] === '') {
          // empty trailing elements have to be overwritten
          // to prevent results such as /foo//bar
          segments[segments.length -1] = v;
        } else {
          segments.push(v);
        }
      }
    } else {
      if (v) {
        segments[segment] = trimSlashes(v);
      } else {
        segments.splice(segment, 1);
      }
    }

    if (absolute) {
      segments.unshift('');
    }

    return this.path(segments.join(separator), build);
  };
  p.segmentCoded = function(segment, v, build) {
    var segments, i, l;

    if (typeof segment !== 'number') {
      build = v;
      v = segment;
      segment = undefined;
    }

    if (v === undefined) {
      segments = this.segment(segment, v, build);
      if (!isArray(segments)) {
        segments = segments !== undefined ? URI.decode(segments) : undefined;
      } else {
        for (i = 0, l = segments.length; i < l; i++) {
          segments[i] = URI.decode(segments[i]);
        }
      }

      return segments;
    }

    if (!isArray(v)) {
      v = (typeof v === 'string' || v instanceof String) ? URI.encode(v) : v;
    } else {
      for (i = 0, l = v.length; i < l; i++) {
        v[i] = URI.encode(v[i]);
      }
    }

    return this.segment(segment, v, build);
  };

  // mutating query string
  var q = p.query;
  p.query = function(v, build) {
    if (v === true) {
      return URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    } else if (typeof v === 'function') {
      var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
      var result = v.call(this, data);
      this._parts.query = URI.buildQuery(result || data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
      this.build(!build);
      return this;
    } else if (v !== undefined && typeof v !== 'string') {
      this._parts.query = URI.buildQuery(v, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
      this.build(!build);
      return this;
    } else {
      return q.call(this, v, build);
    }
  };
  p.setQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);

    if (typeof name === 'string' || name instanceof String) {
      data[name] = value !== undefined ? value : null;
    } else if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          data[key] = name[key];
        }
      }
    } else {
      throw new TypeError('URI.addQuery() accepts an object, string as the name parameter');
    }

    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.addQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    URI.addQuery(data, name, value === undefined ? null : value);
    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.removeQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    URI.removeQuery(data, name, value);
    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.hasQuery = function(name, value, withinArray) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    return URI.hasQuery(data, name, value, withinArray);
  };
  p.setSearch = p.setQuery;
  p.addSearch = p.addQuery;
  p.removeSearch = p.removeQuery;
  p.hasSearch = p.hasQuery;

  // sanitizing URLs
  p.normalize = function() {
    if (this._parts.urn) {
      return this
        .normalizeProtocol(false)
        .normalizePath(false)
        .normalizeQuery(false)
        .normalizeFragment(false)
        .build();
    }

    return this
      .normalizeProtocol(false)
      .normalizeHostname(false)
      .normalizePort(false)
      .normalizePath(false)
      .normalizeQuery(false)
      .normalizeFragment(false)
      .build();
  };
  p.normalizeProtocol = function(build) {
    if (typeof this._parts.protocol === 'string') {
      this._parts.protocol = this._parts.protocol.toLowerCase();
      this.build(!build);
    }

    return this;
  };
  p.normalizeHostname = function(build) {
    if (this._parts.hostname) {
      if (this.is('IDN') && punycode) {
        this._parts.hostname = punycode.toASCII(this._parts.hostname);
      } else if (this.is('IPv6') && IPv6) {
        this._parts.hostname = IPv6.best(this._parts.hostname);
      }

      this._parts.hostname = this._parts.hostname.toLowerCase();
      this.build(!build);
    }

    return this;
  };
  p.normalizePort = function(build) {
    // remove port of it's the protocol's default
    if (typeof this._parts.protocol === 'string' && this._parts.port === URI.defaultPorts[this._parts.protocol]) {
      this._parts.port = null;
      this.build(!build);
    }

    return this;
  };
  p.normalizePath = function(build) {
    var _path = this._parts.path;
    if (!_path) {
      return this;
    }

    if (this._parts.urn) {
      this._parts.path = URI.recodeUrnPath(this._parts.path);
      this.build(!build);
      return this;
    }

    if (this._parts.path === '/') {
      return this;
    }

    _path = URI.recodePath(_path);

    var _was_relative;
    var _leadingParents = '';
    var _parent, _pos;

    // handle relative paths
    if (_path.charAt(0) !== '/') {
      _was_relative = true;
      _path = '/' + _path;
    }

    // handle relative files (as opposed to directories)
    if (_path.slice(-3) === '/..' || _path.slice(-2) === '/.') {
      _path += '/';
    }

    // resolve simples
    _path = _path
      .replace(/(\/(\.\/)+)|(\/\.$)/g, '/')
      .replace(/\/{2,}/g, '/');

    // remember leading parents
    if (_was_relative) {
      _leadingParents = _path.substring(1).match(/^(\.\.\/)+/) || '';
      if (_leadingParents) {
        _leadingParents = _leadingParents[0];
      }
    }

    // resolve parents
    while (true) {
      _parent = _path.search(/\/\.\.(\/|$)/);
      if (_parent === -1) {
        // no more ../ to resolve
        break;
      } else if (_parent === 0) {
        // top level cannot be relative, skip it
        _path = _path.substring(3);
        continue;
      }

      _pos = _path.substring(0, _parent).lastIndexOf('/');
      if (_pos === -1) {
        _pos = _parent;
      }
      _path = _path.substring(0, _pos) + _path.substring(_parent + 3);
    }

    // revert to relative
    if (_was_relative && this.is('relative')) {
      _path = _leadingParents + _path.substring(1);
    }

    this._parts.path = _path;
    this.build(!build);
    return this;
  };
  p.normalizePathname = p.normalizePath;
  p.normalizeQuery = function(build) {
    if (typeof this._parts.query === 'string') {
      if (!this._parts.query.length) {
        this._parts.query = null;
      } else {
        this.query(URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace));
      }

      this.build(!build);
    }

    return this;
  };
  p.normalizeFragment = function(build) {
    if (!this._parts.fragment) {
      this._parts.fragment = null;
      this.build(!build);
    }

    return this;
  };
  p.normalizeSearch = p.normalizeQuery;
  p.normalizeHash = p.normalizeFragment;

  p.iso8859 = function() {
    // expect unicode input, iso8859 output
    var e = URI.encode;
    var d = URI.decode;

    URI.encode = escape;
    URI.decode = decodeURIComponent;
    try {
      this.normalize();
    } finally {
      URI.encode = e;
      URI.decode = d;
    }
    return this;
  };

  p.unicode = function() {
    // expect iso8859 input, unicode output
    var e = URI.encode;
    var d = URI.decode;

    URI.encode = strictEncodeURIComponent;
    URI.decode = unescape;
    try {
      this.normalize();
    } finally {
      URI.encode = e;
      URI.decode = d;
    }
    return this;
  };

  p.readable = function() {
    var uri = this.clone();
    // removing username, password, because they shouldn't be displayed according to RFC 3986
    uri.username('').password('').normalize();
    var t = '';
    if (uri._parts.protocol) {
      t += uri._parts.protocol + '://';
    }

    if (uri._parts.hostname) {
      if (uri.is('punycode') && punycode) {
        t += punycode.toUnicode(uri._parts.hostname);
        if (uri._parts.port) {
          t += ':' + uri._parts.port;
        }
      } else {
        t += uri.host();
      }
    }

    if (uri._parts.hostname && uri._parts.path && uri._parts.path.charAt(0) !== '/') {
      t += '/';
    }

    t += uri.path(true);
    if (uri._parts.query) {
      var q = '';
      for (var i = 0, qp = uri._parts.query.split('&'), l = qp.length; i < l; i++) {
        var kv = (qp[i] || '').split('=');
        q += '&' + URI.decodeQuery(kv[0], this._parts.escapeQuerySpace)
          .replace(/&/g, '%26');

        if (kv[1] !== undefined) {
          q += '=' + URI.decodeQuery(kv[1], this._parts.escapeQuerySpace)
            .replace(/&/g, '%26');
        }
      }
      t += '?' + q.substring(1);
    }

    t += URI.decodeQuery(uri.hash(), true);
    return t;
  };

  // resolving relative and absolute URLs
  p.absoluteTo = function(base) {
    var resolved = this.clone();
    var properties = ['protocol', 'username', 'password', 'hostname', 'port'];
    var basedir, i, p;

    if (this._parts.urn) {
      throw new Error('URNs do not have any generally defined hierarchical components');
    }

    if (!(base instanceof URI)) {
      base = new URI(base);
    }

    if (resolved._parts.protocol) {
      // Directly returns even if this._parts.hostname is empty.
      return resolved;
    } else {
      resolved._parts.protocol = base._parts.protocol;
    }

    if (this._parts.hostname) {
      return resolved;
    }

    for (i = 0; (p = properties[i]); i++) {
      resolved._parts[p] = base._parts[p];
    }

    if (!resolved._parts.path) {
      resolved._parts.path = base._parts.path;
      if (!resolved._parts.query) {
        resolved._parts.query = base._parts.query;
      }
    } else {
      if (resolved._parts.path.substring(-2) === '..') {
        resolved._parts.path += '/';
      }

      if (resolved.path().charAt(0) !== '/') {
        basedir = base.directory();
        basedir = basedir ? basedir : base.path().indexOf('/') === 0 ? '/' : '';
        resolved._parts.path = (basedir ? (basedir + '/') : '') + resolved._parts.path;
        resolved.normalizePath();
      }
    }

    resolved.build();
    return resolved;
  };
  p.relativeTo = function(base) {
    var relative = this.clone().normalize();
    var relativeParts, baseParts, common, relativePath, basePath;

    if (relative._parts.urn) {
      throw new Error('URNs do not have any generally defined hierarchical components');
    }

    base = new URI(base).normalize();
    relativeParts = relative._parts;
    baseParts = base._parts;
    relativePath = relative.path();
    basePath = base.path();

    if (relativePath.charAt(0) !== '/') {
      throw new Error('URI is already relative');
    }

    if (basePath.charAt(0) !== '/') {
      throw new Error('Cannot calculate a URI relative to another relative URI');
    }

    if (relativeParts.protocol === baseParts.protocol) {
      relativeParts.protocol = null;
    }

    if (relativeParts.username !== baseParts.username || relativeParts.password !== baseParts.password) {
      return relative.build();
    }

    if (relativeParts.protocol !== null || relativeParts.username !== null || relativeParts.password !== null) {
      return relative.build();
    }

    if (relativeParts.hostname === baseParts.hostname && relativeParts.port === baseParts.port) {
      relativeParts.hostname = null;
      relativeParts.port = null;
    } else {
      return relative.build();
    }

    if (relativePath === basePath) {
      relativeParts.path = '';
      return relative.build();
    }

    // determine common sub path
    common = URI.commonPath(relativePath, basePath);

    // If the paths have nothing in common, return a relative URL with the absolute path.
    if (!common) {
      return relative.build();
    }

    var parents = baseParts.path
      .substring(common.length)
      .replace(/[^\/]*$/, '')
      .replace(/.*?\//g, '../');

    relativeParts.path = (parents + relativeParts.path.substring(common.length)) || './';

    return relative.build();
  };

  // comparing URIs
  p.equals = function(uri) {
    var one = this.clone();
    var two = new URI(uri);
    var one_map = {};
    var two_map = {};
    var checked = {};
    var one_query, two_query, key;

    one.normalize();
    two.normalize();

    // exact match
    if (one.toString() === two.toString()) {
      return true;
    }

    // extract query string
    one_query = one.query();
    two_query = two.query();
    one.query('');
    two.query('');

    // definitely not equal if not even non-query parts match
    if (one.toString() !== two.toString()) {
      return false;
    }

    // query parameters have the same length, even if they're permuted
    if (one_query.length !== two_query.length) {
      return false;
    }

    one_map = URI.parseQuery(one_query, this._parts.escapeQuerySpace);
    two_map = URI.parseQuery(two_query, this._parts.escapeQuerySpace);

    for (key in one_map) {
      if (hasOwn.call(one_map, key)) {
        if (!isArray(one_map[key])) {
          if (one_map[key] !== two_map[key]) {
            return false;
          }
        } else if (!arraysEqual(one_map[key], two_map[key])) {
          return false;
        }

        checked[key] = true;
      }
    }

    for (key in two_map) {
      if (hasOwn.call(two_map, key)) {
        if (!checked[key]) {
          // two contains a parameter not present in one
          return false;
        }
      }
    }

    return true;
  };

  // state
  p.preventInvalidHostname = function(v) {
    this._parts.preventInvalidHostname = !!v;
    return this;
  };

  p.duplicateQueryParameters = function(v) {
    this._parts.duplicateQueryParameters = !!v;
    return this;
  };

  p.escapeQuerySpace = function(v) {
    this._parts.escapeQuerySpace = !!v;
    return this;
  };

  return URI;
}));

},{"./IPv6":3,"./SecondLevelDomains":4,"./punycode":6}],6:[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.4.0 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.3.2',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _sandbox = require('runtime-core/dist/sandbox');

var _minibus = require('runtime-core/dist/minibus');

var _minibus2 = _interopRequireDefault(_minibus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
* Copyright 2016 PT Inovação e Sistemas SA
* Copyright 2016 INESC-ID
* Copyright 2016 QUOBIS NETWORKS SL
* Copyright 2016 FRAUNHOFER-GESELLSCHAFT ZUR FOERDERUNG DER ANGEWANDTEN FORSCHUNG E.V
* Copyright 2016 ORANGE SA
* Copyright 2016 Deutsche Telekom AG
* Copyright 2016 Apizee
* Copyright 2016 TECHNISCHE UNIVERSITAT BERLIN
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**/
function create(iframe) {
  window._miniBus = new _minibus2.default();
  window._miniBus._onPostMessage = function (msg) {
    iframe.contentWindow.postMessage(msg, '*');
  };
  window.addEventListener('message', function (event) {
    if (event.data.to && (event.data.to.startsWith('runtime:loadedHyperty') || event.data.to.endsWith('gui-manager'))) {
      return;
    }

    window._miniBus._onMessage(event.data);
  }, false);

  window._registry = new _sandbox.SandboxRegistry(window._miniBus);
  window._registry._create = function (url, sourceCode, config, factory) {
    try {
      eval.apply(window, [sourceCode]);

      if (typeof activate === 'function') {
        return activate(url, window._miniBus, config, factory);
      }

      if (typeof activate.default === 'function') {
        return activate.default(url, window._miniBus, config, factory);
      }
    } catch (error) {
      console.error('[Context APP Create] - Error: ', error);
      throw JSON.stringify(error.message);
    }
  };
}

function getHyperty(hypertyDescriptor) {
  return window._registry.components[hypertyDescriptor];
}

/**
 * SandboxContext for application
 * @typedef ContextApp
 * @property {function(iFrame: iframe)} create Creates the context for the sandbox hosted in the iframe
 * @property {function(Hyperty descriptor: string):Hyperty} getHyperty Returns the hyperty for the given descriptor
 * */
exports.default = { create: create, getHyperty: getHyperty };

},{"runtime-core/dist/minibus":1,"runtime-core/dist/sandbox":2}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /**
                                                                                                                                                                                                                                                                              * Copyright 2016 PT Inovação e Sistemas SA
                                                                                                                                                                                                                                                                              * Copyright 2016 INESC-ID
                                                                                                                                                                                                                                                                              * Copyright 2016 QUOBIS NETWORKS SL
                                                                                                                                                                                                                                                                              * Copyright 2016 FRAUNHOFER-GESELLSCHAFT ZUR FOERDERUNG DER ANGEWANDTEN FORSCHUNG E.V
                                                                                                                                                                                                                                                                              * Copyright 2016 ORANGE SA
                                                                                                                                                                                                                                                                              * Copyright 2016 Deutsche Telekom AG
                                                                                                                                                                                                                                                                              * Copyright 2016 Apizee
                                                                                                                                                                                                                                                                              * Copyright 2016 TECHNISCHE UNIVERSITAT BERLIN
                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                              * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                              * you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                              * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                              *   http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                              * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                              * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                              * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                              * See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                              * limitations under the License.
                                                                                                                                                                                                                                                                              **/


var _RuntimeUAStub = require('./RuntimeUAStub');

var _RuntimeUAStub2 = _interopRequireDefault(_RuntimeUAStub);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rethink = void 0;

if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) != undefined && window != null) {
    rethink = _RuntimeUAStub2.default;
} else {
    rethink = undefined;
}

exports.default = rethink;

},{"./RuntimeUAStub":9}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ContextApp = require('./ContextApp');

var _ContextApp2 = _interopRequireDefault(_ContextApp);

var _urijs = require('urijs');

var _urijs2 = _interopRequireDefault(_urijs);

var _iframe = require('./iframe');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var iframe = undefined;

/**
 * @typedef {Object} Hyperty
 * @property {string} runtimeHypertyURL - Hyperty address
 * @property {MSG_STATUS} status - Hyperty status
 * @property {Object} instance - Hyperty object
 * @property {string} name - Hyperty name
 */
/**
* Copyright 2016 PT Inovação e Sistemas SA
* Copyright 2016 INESC-ID
* Copyright 2016 QUOBIS NETWORKS SL
* Copyright 2016 FRAUNHOFER-GESELLSCHAFT ZUR FOERDERUNG DER ANGEWANDTEN FORSCHUNG E.V
* Copyright 2016 ORANGE SA
* Copyright 2016 Deutsche Telekom AG
* Copyright 2016 Apizee
* Copyright 2016 TECHNISCHE UNIVERSITAT BERLIN
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**/

/**
 * @external {MSG_STATUS} https://github.com/reTHINK-project/core-framework/tree/master/docs/specs/service-framework
 */

var buildMsg = function buildMsg(hypertyComponent, msg) {
  return {
    runtimeHypertyURL: msg.body.runtimeHypertyURL,
    status: msg.body.status,
    instance: hypertyComponent.instance,
    name: hypertyComponent.name
  };
};

var requireHypertyID = 0;

/**
 * @typedef {Object} RuntimeAdapter
 * @property {function(Hyperty descriptor: string, Hyperty addresses to be reused or empty in other case: string): Promise<Hyperty>} requireHyperty - Loads and returns a Hyperty
 * @property {function(Domain: string)} requireProtostub - Loads a protostub from the given domain
 * @property {function(): Promise} close - Unloads and closes the installed runtime
 */
var runtimeAdapter = {

  requireHyperty: function requireHyperty(hypertyDescriptor) {
    var reuseAddress = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    return new Promise(function (resolve, reject) {
      // keep current requireHypertyID
      var callbackID = requireHypertyID;
      requireHypertyID += 1;
      var loaded = function loaded(e) {
        if (e.data.to === 'runtime:loadedHyperty') {
          if (e.data.body.id === callbackID) {
            window.removeEventListener('message', loaded);
            resolve(buildMsg(_ContextApp2.default.getHyperty(e.data.body.runtimeHypertyURL), e.data));
          }
        }
      };
      window.addEventListener('message', loaded);
      iframe.contentWindow.postMessage({ to: 'core:loadHyperty', body: { descriptor: hypertyDescriptor, reuseAddress: reuseAddress, id: callbackID } }, '*');
    });
  },

  authorise: function authorise(idp, scope) {

    return new Promise(function (resolve, reject) {
      var loaded = function loaded(e) {
        console.log('[RuntimeBrowser.RuntimeUAStub.Authorise] reply:', e.data);
        if (e.data.to === 'runtime:authorised') {
          window.removeEventListener('message', loaded);

          resolve(e.data.body);
        } else if (e.data.to === 'runtime:not-authorised') {
          window.removeEventListener('message', loaded);

          console.error('[RuntimeBrowser.RuntimeUAStub.Authorise] Error:', e.data);
          reject(e.data.body);
        }
      };
      window.addEventListener('message', loaded);
      console.log('Authorising IDP ', idp, ' with scope ', scope);
      iframe.contentWindow.postMessage({ to: 'core:authorise', body: { idp: idp, scope: scope } }, '*');
    });
  },

  reset: function reset() {
    console.log('Runtime Browser - reset ');
    return new Promise(function (resolve, reject) {
      var resetEvt = function resetEvt(e) {
        if (e.data.to === 'runtime:runtimeReset') {
          window.removeEventListener('message', resetEvt);
          resolve(e.data.body);
        }
      };
      window.addEventListener('message', resetEvt);
      iframe.contentWindow.postMessage({ to: 'core:reset', body: {} }, '*');
    });
  },

  login: function login(idp) {

    return new Promise(function (resolve, reject) {
      var loaded = function loaded(e) {
        if (e.data.to === 'runtime:loggedIn') {
          window.removeEventListener('message', loaded);
          resolve(e.data.body);
        }
      };
      window.addEventListener('message', loaded);
      console.log('Logging with IDP: ', idp);
      iframe.contentWindow.postMessage({ to: 'core:login', body: { idp: idp } }, '*');
    });
  },

  listenShowAdmin: function listenShowAdmin() {
    return new Promise(function (resolve, reject) {
      var loaded = function loaded(e) {
        if (e.data.to === 'runtime:gui-manager') {
          if (e.data.body.method === 'tokenExpired') {
            window.removeEventListener('message', loaded);
            resolve(true);
          }
        }
      };
      window.addEventListener('message', loaded);
    });
  },

  requireProtostub: function requireProtostub(domain) {
    iframe.contentWindow.postMessage({ to: 'core:loadStub', body: { domain: domain } }, '*');
  },

  close: function close() {
    var logOut = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    console.log('Stub - logging out: ', logOut);
    return new Promise(function (resolve, reject) {
      var loaded = function loaded(e) {
        if (e.data.to === 'runtime:runtimeClosed') {
          window.removeEventListener('message', loaded);
          resolve(resolve(e.data.body));
        }
      };
      window.addEventListener('message', loaded);
      iframe.contentWindow.postMessage({ to: 'core:close', body: { logOut: logOut } }, '*');
    });
  }
};

var GuiManager = function GuiManager() {
  window.addEventListener('message', function (e) {
    if (e.data.to === 'runtime:gui-manager') {

      if (e.data.body.method === 'showAdminPage') {
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.zIndex = 99999;
      } else {
        if (e.data.body.method === 'hideAdminPage') {
          iframe.style.width = '48px';
          iframe.style.height = '48px';
          iframe.style.zIndex = 1;
        }
      }
    }
  });
};

/**
 * @typedef {Object} RuntimeUA
 * @property {function(Runtime domain: string, Runtime url: string, Development mode: boolean): Promise<RuntimeAdapter>} install - Installs a runtime locally
 */
var RethinkBrowser = {
  install: function install() {
    var _this = this;

    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        domain = _ref.domain,
        runtimeURL = _ref.runtimeURL,
        development = _ref.development,
        indexURL = _ref.indexURL,
        sandboxURL = _ref.sandboxURL,
        hideAdmin = _ref.hideAdmin;

    console.info('Install: ', domain, runtimeURL, development, indexURL, sandboxURL, hideAdmin);
    return new Promise(function (resolve, reject) {
      var runtime = _this._getRuntime(runtimeURL, domain, development, indexURL, sandboxURL, hideAdmin);
      iframe = (0, _iframe.create)(runtime.indexURL + '?domain=' + runtime.domain + '&runtime=' + runtime.url + '&development=' + development, 99999, hideAdmin);
      var installed = function installed(e) {
        if (e.data.to === 'runtime:installed') {
          window.removeEventListener('message', installed);
          resolve(runtimeAdapter);
        }
      };
      window.addEventListener('message', installed);
      window.addEventListener('message', function (e) {
        if (e.data.to && e.data.to === 'runtime:createSandboxWindow') {
          var ifr = (0, _iframe.create)(runtime.sandboxURL, undefined, hideAdmin);
          ifr.addEventListener('load', function () {
            ifr.contentWindow.postMessage(e.data, '*', e.ports);
          }, false);
        }
      });
      _ContextApp2.default.create(iframe);
      GuiManager();
    });
  },

  _getRuntime: function _getRuntime(runtimeURL, domain, development, indexURL, sandboxURL) {
    if (development) {
      runtimeURL = runtimeURL || 'hyperty-catalogue://catalogue.' + domain + '/.well-known/runtime/Runtime';
      domain = domain || new _urijs2.default(runtimeURL).host();
      indexURL = indexURL || 'https://' + domain + '/.well-known/runtime/index.html';
      sandboxURL = sandboxURL || 'https://' + domain + '/.well-known/runtime/sandbox.html';
    } else {
      runtimeURL = runtimeURL || 'https://catalogue.' + domain + '/.well-known/runtime/default';
      domain = domain || new _urijs2.default(runtimeURL).host().replace('catalogue.', '');
      indexURL = indexURL || 'https://' + domain + '/.well-known/runtime/index.html';
      sandboxURL = sandboxURL || 'https://' + domain + '/.well-known/runtime/sandbox.html';
    }

    console.info('get Runtime: ', runtimeURL, domain, indexURL, sandboxURL);

    return {
      url: runtimeURL,
      domain: domain,
      indexURL: indexURL,
      sandboxURL: sandboxURL
    };
  }
};

exports.default = RethinkBrowser;

},{"./ContextApp":7,"./iframe":10,"urijs":5}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
/**
* Copyright 2016 PT Inovação e Sistemas SA
* Copyright 2016 INESC-ID
* Copyright 2016 QUOBIS NETWORKS SL
* Copyright 2016 FRAUNHOFER-GESELLSCHAFT ZUR FOERDERUNG DER ANGEWANDTEN FORSCHUNG E.V
* Copyright 2016 ORANGE SA
* Copyright 2016 Deutsche Telekom AG
* Copyright 2016 Apizee
* Copyright 2016 TECHNISCHE UNIVERSITAT BERLIN
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**/

/**
 * @external {iframe} https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
 */

/**
 * Creates an iframe
 * @param {string} src - Url to load into the iframe
 * @return {iframe} - iFrame element
 */
function create(src) {
  var zIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -10;
  var hideAdmin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var iframe = document.createElement('iframe');
  iframe.setAttribute('id', 'rethink');
  iframe.style.position = 'absolute';
  iframe.style.top = '0';
  iframe.style.right = '0';
  iframe.style.border = '0';
  iframe.style.zIndex = zIndex;
  iframe.width = '48px';
  iframe.height = '48px';
  iframe.title = 'reTHINK-project';
  iframe.setAttribute('seamless', '');
  iframe.setAttribute('src', src);
  iframe.setAttribute('sandbox', 'allow-forms allow-scripts allow-popups-to-escape-sandbox allow-popups allow-same-origin allow-top-navigation');
  iframe.style.display = 'block';
  if (hideAdmin == true) {
    iframe.style.display = 'none';
  }
  document.querySelector('body').appendChild(iframe);

  return iframe;
}

},{}]},{},[8])(8)
});

//# sourceMappingURL=rethink.js.map
