(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.core = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global,setImmediate){
(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
   typeof define === 'function' && define.amd ? define(factory) :
   (global.Dexie = factory());
}(this, (function () { 'use strict';

/*
* Dexie.js - a minimalistic wrapper for IndexedDB
* ===============================================
*
* By David Fahlander, david.fahlander@gmail.com
*
* Version 1.5.1, Tue Nov 01 2016
* www.dexie.com
* Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
*/
var keys = Object.keys;
var isArray = Array.isArray;
var _global = typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : global;

function extend(obj, extension) {
    if (typeof extension !== 'object') return obj;
    keys(extension).forEach(function (key) {
        obj[key] = extension[key];
    });
    return obj;
}

var getProto = Object.getPrototypeOf;
var _hasOwn = {}.hasOwnProperty;
function hasOwn(obj, prop) {
    return _hasOwn.call(obj, prop);
}

function props(proto, extension) {
    if (typeof extension === 'function') extension = extension(getProto(proto));
    keys(extension).forEach(function (key) {
        setProp(proto, key, extension[key]);
    });
}

function setProp(obj, prop, functionOrGetSet, options) {
    Object.defineProperty(obj, prop, extend(functionOrGetSet && hasOwn(functionOrGetSet, "get") && typeof functionOrGetSet.get === 'function' ? { get: functionOrGetSet.get, set: functionOrGetSet.set, configurable: true } : { value: functionOrGetSet, configurable: true, writable: true }, options));
}

function derive(Child) {
    return {
        from: function (Parent) {
            Child.prototype = Object.create(Parent.prototype);
            setProp(Child.prototype, "constructor", Child);
            return {
                extend: props.bind(null, Child.prototype)
            };
        }
    };
}

var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

function getPropertyDescriptor(obj, prop) {
    var pd = getOwnPropertyDescriptor(obj, prop),
        proto;
    return pd || (proto = getProto(obj)) && getPropertyDescriptor(proto, prop);
}

var _slice = [].slice;
function slice(args, start, end) {
    return _slice.call(args, start, end);
}

function override(origFunc, overridedFactory) {
    return overridedFactory(origFunc);
}

function doFakeAutoComplete(fn) {
    var to = setTimeout(fn, 1000);
    clearTimeout(to);
}

function assert(b) {
    if (!b) throw new Error("Assertion Failed");
}

function asap(fn) {
    if (_global.setImmediate) setImmediate(fn);else setTimeout(fn, 0);
}



/** Generate an object (hash map) based on given array.
 * @param extractor Function taking an array item and its index and returning an array of 2 items ([key, value]) to
 *        instert on the resulting object for each item in the array. If this function returns a falsy value, the
 *        current item wont affect the resulting object.
 */
function arrayToObject(array, extractor) {
    return array.reduce(function (result, item, i) {
        var nameAndValue = extractor(item, i);
        if (nameAndValue) result[nameAndValue[0]] = nameAndValue[1];
        return result;
    }, {});
}

function trycatcher(fn, reject) {
    return function () {
        try {
            fn.apply(this, arguments);
        } catch (e) {
            reject(e);
        }
    };
}

function tryCatch(fn, onerror, args) {
    try {
        fn.apply(null, args);
    } catch (ex) {
        onerror && onerror(ex);
    }
}

function getByKeyPath(obj, keyPath) {
    // http://www.w3.org/TR/IndexedDB/#steps-for-extracting-a-key-from-a-value-using-a-key-path
    if (hasOwn(obj, keyPath)) return obj[keyPath]; // This line is moved from last to first for optimization purpose.
    if (!keyPath) return obj;
    if (typeof keyPath !== 'string') {
        var rv = [];
        for (var i = 0, l = keyPath.length; i < l; ++i) {
            var val = getByKeyPath(obj, keyPath[i]);
            rv.push(val);
        }
        return rv;
    }
    var period = keyPath.indexOf('.');
    if (period !== -1) {
        var innerObj = obj[keyPath.substr(0, period)];
        return innerObj === undefined ? undefined : getByKeyPath(innerObj, keyPath.substr(period + 1));
    }
    return undefined;
}

function setByKeyPath(obj, keyPath, value) {
    if (!obj || keyPath === undefined) return;
    if ('isFrozen' in Object && Object.isFrozen(obj)) return;
    if (typeof keyPath !== 'string' && 'length' in keyPath) {
        assert(typeof value !== 'string' && 'length' in value);
        for (var i = 0, l = keyPath.length; i < l; ++i) {
            setByKeyPath(obj, keyPath[i], value[i]);
        }
    } else {
        var period = keyPath.indexOf('.');
        if (period !== -1) {
            var currentKeyPath = keyPath.substr(0, period);
            var remainingKeyPath = keyPath.substr(period + 1);
            if (remainingKeyPath === "") {
                if (value === undefined) delete obj[currentKeyPath];else obj[currentKeyPath] = value;
            } else {
                var innerObj = obj[currentKeyPath];
                if (!innerObj) innerObj = obj[currentKeyPath] = {};
                setByKeyPath(innerObj, remainingKeyPath, value);
            }
        } else {
            if (value === undefined) delete obj[keyPath];else obj[keyPath] = value;
        }
    }
}

function delByKeyPath(obj, keyPath) {
    if (typeof keyPath === 'string') setByKeyPath(obj, keyPath, undefined);else if ('length' in keyPath) [].map.call(keyPath, function (kp) {
        setByKeyPath(obj, kp, undefined);
    });
}

function shallowClone(obj) {
    var rv = {};
    for (var m in obj) {
        if (hasOwn(obj, m)) rv[m] = obj[m];
    }
    return rv;
}

function deepClone(any) {
    if (!any || typeof any !== 'object') return any;
    var rv;
    if (isArray(any)) {
        rv = [];
        for (var i = 0, l = any.length; i < l; ++i) {
            rv.push(deepClone(any[i]));
        }
    } else if (any instanceof Date) {
        rv = new Date();
        rv.setTime(any.getTime());
    } else {
        rv = any.constructor ? Object.create(any.constructor.prototype) : {};
        for (var prop in any) {
            if (hasOwn(any, prop)) {
                rv[prop] = deepClone(any[prop]);
            }
        }
    }
    return rv;
}

function getObjectDiff(a, b, rv, prfx) {
    // Compares objects a and b and produces a diff object.
    rv = rv || {};
    prfx = prfx || '';
    keys(a).forEach(function (prop) {
        if (!hasOwn(b, prop)) rv[prfx + prop] = undefined; // Property removed
        else {
                var ap = a[prop],
                    bp = b[prop];
                if (typeof ap === 'object' && typeof bp === 'object' && ap && bp && ap.constructor === bp.constructor)
                    // Same type of object but its properties may have changed
                    getObjectDiff(ap, bp, rv, prfx + prop + ".");else if (ap !== bp) rv[prfx + prop] = b[prop]; // Primitive value changed
            }
    });
    keys(b).forEach(function (prop) {
        if (!hasOwn(a, prop)) {
            rv[prfx + prop] = b[prop]; // Property added
        }
    });
    return rv;
}

// If first argument is iterable or array-like, return it as an array
var iteratorSymbol = typeof Symbol !== 'undefined' && Symbol.iterator;
var getIteratorOf = iteratorSymbol ? function (x) {
    var i;
    return x != null && (i = x[iteratorSymbol]) && i.apply(x);
} : function () {
    return null;
};

var NO_CHAR_ARRAY = {};
// Takes one or several arguments and returns an array based on the following criteras:
// * If several arguments provided, return arguments converted to an array in a way that
//   still allows javascript engine to optimize the code.
// * If single argument is an array, return a clone of it.
// * If this-pointer equals NO_CHAR_ARRAY, don't accept strings as valid iterables as a special
//   case to the two bullets below.
// * If single argument is an iterable, convert it to an array and return the resulting array.
// * If single argument is array-like (has length of type number), convert it to an array.
function getArrayOf(arrayLike) {
    var i, a, x, it;
    if (arguments.length === 1) {
        if (isArray(arrayLike)) return arrayLike.slice();
        if (this === NO_CHAR_ARRAY && typeof arrayLike === 'string') return [arrayLike];
        if (it = getIteratorOf(arrayLike)) {
            a = [];
            while (x = it.next(), !x.done) {
                a.push(x.value);
            }return a;
        }
        if (arrayLike == null) return [arrayLike];
        i = arrayLike.length;
        if (typeof i === 'number') {
            a = new Array(i);
            while (i--) {
                a[i] = arrayLike[i];
            }return a;
        }
        return [arrayLike];
    }
    i = arguments.length;
    a = new Array(i);
    while (i--) {
        a[i] = arguments[i];
    }return a;
}

var concat = [].concat;
function flatten(a) {
    return concat.apply([], a);
}

function nop() {}
function mirror(val) {
    return val;
}
function pureFunctionChain(f1, f2) {
    // Enables chained events that takes ONE argument and returns it to the next function in chain.
    // This pattern is used in the hook("reading") event.
    if (f1 == null || f1 === mirror) return f2;
    return function (val) {
        return f2(f1(val));
    };
}

function callBoth(on1, on2) {
    return function () {
        on1.apply(this, arguments);
        on2.apply(this, arguments);
    };
}

function hookCreatingChain(f1, f2) {
    // Enables chained events that takes several arguments and may modify first argument by making a modification and then returning the same instance.
    // This pattern is used in the hook("creating") event.
    if (f1 === nop) return f2;
    return function () {
        var res = f1.apply(this, arguments);
        if (res !== undefined) arguments[0] = res;
        var onsuccess = this.onsuccess,
            // In case event listener has set this.onsuccess
        onerror = this.onerror; // In case event listener has set this.onerror
        this.onsuccess = null;
        this.onerror = null;
        var res2 = f2.apply(this, arguments);
        if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
        if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
        return res2 !== undefined ? res2 : res;
    };
}

function hookDeletingChain(f1, f2) {
    if (f1 === nop) return f2;
    return function () {
        f1.apply(this, arguments);
        var onsuccess = this.onsuccess,
            // In case event listener has set this.onsuccess
        onerror = this.onerror; // In case event listener has set this.onerror
        this.onsuccess = this.onerror = null;
        f2.apply(this, arguments);
        if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
        if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
    };
}

function hookUpdatingChain(f1, f2) {
    if (f1 === nop) return f2;
    return function (modifications) {
        var res = f1.apply(this, arguments);
        extend(modifications, res); // If f1 returns new modifications, extend caller's modifications with the result before calling next in chain.
        var onsuccess = this.onsuccess,
            // In case event listener has set this.onsuccess
        onerror = this.onerror; // In case event listener has set this.onerror
        this.onsuccess = null;
        this.onerror = null;
        var res2 = f2.apply(this, arguments);
        if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
        if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
        return res === undefined ? res2 === undefined ? undefined : res2 : extend(res, res2);
    };
}

function reverseStoppableEventChain(f1, f2) {
    if (f1 === nop) return f2;
    return function () {
        if (f2.apply(this, arguments) === false) return false;
        return f1.apply(this, arguments);
    };
}



function promisableChain(f1, f2) {
    if (f1 === nop) return f2;
    return function () {
        var res = f1.apply(this, arguments);
        if (res && typeof res.then === 'function') {
            var thiz = this,
                i = arguments.length,
                args = new Array(i);
            while (i--) {
                args[i] = arguments[i];
            }return res.then(function () {
                return f2.apply(thiz, args);
            });
        }
        return f2.apply(this, arguments);
    };
}

// By default, debug will be true only if platform is a web platform and its page is served from localhost.
// When debug = true, error's stacks will contain asyncronic long stacks.
var debug = typeof location !== 'undefined' &&
// By default, use debug mode if served from localhost.
/^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);

function setDebug(value, filter) {
    debug = value;
    libraryFilter = filter;
}

var libraryFilter = function () {
    return true;
};

var NEEDS_THROW_FOR_STACK = !new Error("").stack;

function getErrorWithStack() {
    "use strict";

    if (NEEDS_THROW_FOR_STACK) try {
        // Doing something naughty in strict mode here to trigger a specific error
        // that can be explicitely ignored in debugger's exception settings.
        // If we'd just throw new Error() here, IE's debugger's exception settings
        // will just consider it as "exception thrown by javascript code" which is
        // something you wouldn't want it to ignore.
        getErrorWithStack.arguments;
        throw new Error(); // Fallback if above line don't throw.
    } catch (e) {
        return e;
    }
    return new Error();
}

function prettyStack(exception, numIgnoredFrames) {
    var stack = exception.stack;
    if (!stack) return "";
    numIgnoredFrames = numIgnoredFrames || 0;
    if (stack.indexOf(exception.name) === 0) numIgnoredFrames += (exception.name + exception.message).split('\n').length;
    return stack.split('\n').slice(numIgnoredFrames).filter(libraryFilter).map(function (frame) {
        return "\n" + frame;
    }).join('');
}

function deprecated(what, fn) {
    return function () {
        console.warn(what + " is deprecated. See https://github.com/dfahlander/Dexie.js/wiki/Deprecations. " + prettyStack(getErrorWithStack(), 1));
        return fn.apply(this, arguments);
    };
}

var dexieErrorNames = ['Modify', 'Bulk', 'OpenFailed', 'VersionChange', 'Schema', 'Upgrade', 'InvalidTable', 'MissingAPI', 'NoSuchDatabase', 'InvalidArgument', 'SubTransaction', 'Unsupported', 'Internal', 'DatabaseClosed', 'IncompatiblePromise'];

var idbDomErrorNames = ['Unknown', 'Constraint', 'Data', 'TransactionInactive', 'ReadOnly', 'Version', 'NotFound', 'InvalidState', 'InvalidAccess', 'Abort', 'Timeout', 'QuotaExceeded', 'Syntax', 'DataClone'];

var errorList = dexieErrorNames.concat(idbDomErrorNames);

var defaultTexts = {
    VersionChanged: "Database version changed by other database connection",
    DatabaseClosed: "Database has been closed",
    Abort: "Transaction aborted",
    TransactionInactive: "Transaction has already completed or failed"
};

//
// DexieError - base class of all out exceptions.
//
function DexieError(name, msg) {
    // Reason we don't use ES6 classes is because:
    // 1. It bloats transpiled code and increases size of minified code.
    // 2. It doesn't give us much in this case.
    // 3. It would require sub classes to call super(), which
    //    is not needed when deriving from Error.
    this._e = getErrorWithStack();
    this.name = name;
    this.message = msg;
}

derive(DexieError).from(Error).extend({
    stack: {
        get: function () {
            return this._stack || (this._stack = this.name + ": " + this.message + prettyStack(this._e, 2));
        }
    },
    toString: function () {
        return this.name + ": " + this.message;
    }
});

function getMultiErrorMessage(msg, failures) {
    return msg + ". Errors: " + failures.map(function (f) {
        return f.toString();
    }).filter(function (v, i, s) {
        return s.indexOf(v) === i;
    }) // Only unique error strings
    .join('\n');
}

//
// ModifyError - thrown in WriteableCollection.modify()
// Specific constructor because it contains members failures and failedKeys.
//
function ModifyError(msg, failures, successCount, failedKeys) {
    this._e = getErrorWithStack();
    this.failures = failures;
    this.failedKeys = failedKeys;
    this.successCount = successCount;
}
derive(ModifyError).from(DexieError);

function BulkError(msg, failures) {
    this._e = getErrorWithStack();
    this.name = "BulkError";
    this.failures = failures;
    this.message = getMultiErrorMessage(msg, failures);
}
derive(BulkError).from(DexieError);

//
//
// Dynamically generate error names and exception classes based
// on the names in errorList.
//
//

// Map of {ErrorName -> ErrorName + "Error"}
var errnames = errorList.reduce(function (obj, name) {
    return obj[name] = name + "Error", obj;
}, {});

// Need an alias for DexieError because we're gonna create subclasses with the same name.
var BaseException = DexieError;
// Map of {ErrorName -> exception constructor}
var exceptions = errorList.reduce(function (obj, name) {
    // Let the name be "DexieError" because this name may
    // be shown in call stack and when debugging. DexieError is
    // the most true name because it derives from DexieError,
    // and we cannot change Function.name programatically without
    // dynamically create a Function object, which would be considered
    // 'eval-evil'.
    var fullName = name + "Error";
    function DexieError(msgOrInner, inner) {
        this._e = getErrorWithStack();
        this.name = fullName;
        if (!msgOrInner) {
            this.message = defaultTexts[name] || fullName;
            this.inner = null;
        } else if (typeof msgOrInner === 'string') {
            this.message = msgOrInner;
            this.inner = inner || null;
        } else if (typeof msgOrInner === 'object') {
            this.message = msgOrInner.name + ' ' + msgOrInner.message;
            this.inner = msgOrInner;
        }
    }
    derive(DexieError).from(BaseException);
    obj[name] = DexieError;
    return obj;
}, {});

// Use ECMASCRIPT standard exceptions where applicable:
exceptions.Syntax = SyntaxError;
exceptions.Type = TypeError;
exceptions.Range = RangeError;

var exceptionMap = idbDomErrorNames.reduce(function (obj, name) {
    obj[name + "Error"] = exceptions[name];
    return obj;
}, {});

function mapError(domError, message) {
    if (!domError || domError instanceof DexieError || domError instanceof TypeError || domError instanceof SyntaxError || !domError.name || !exceptionMap[domError.name]) return domError;
    var rv = new exceptionMap[domError.name](message || domError.message, domError);
    if ("stack" in domError) {
        // Derive stack from inner exception if it has a stack
        setProp(rv, "stack", { get: function () {
                return this.inner.stack;
            } });
    }
    return rv;
}

var fullNameExceptions = errorList.reduce(function (obj, name) {
    if (["Syntax", "Type", "Range"].indexOf(name) === -1) obj[name + "Error"] = exceptions[name];
    return obj;
}, {});

fullNameExceptions.ModifyError = ModifyError;
fullNameExceptions.DexieError = DexieError;
fullNameExceptions.BulkError = BulkError;

function Events(ctx) {
    var evs = {};
    var rv = function (eventName, subscriber) {
        if (subscriber) {
            // Subscribe. If additional arguments than just the subscriber was provided, forward them as well.
            var i = arguments.length,
                args = new Array(i - 1);
            while (--i) {
                args[i - 1] = arguments[i];
            }evs[eventName].subscribe.apply(null, args);
            return ctx;
        } else if (typeof eventName === 'string') {
            // Return interface allowing to fire or unsubscribe from event
            return evs[eventName];
        }
    };
    rv.addEventType = add;

    for (var i = 1, l = arguments.length; i < l; ++i) {
        add(arguments[i]);
    }

    return rv;

    function add(eventName, chainFunction, defaultFunction) {
        if (typeof eventName === 'object') return addConfiguredEvents(eventName);
        if (!chainFunction) chainFunction = reverseStoppableEventChain;
        if (!defaultFunction) defaultFunction = nop;

        var context = {
            subscribers: [],
            fire: defaultFunction,
            subscribe: function (cb) {
                if (context.subscribers.indexOf(cb) === -1) {
                    context.subscribers.push(cb);
                    context.fire = chainFunction(context.fire, cb);
                }
            },
            unsubscribe: function (cb) {
                context.subscribers = context.subscribers.filter(function (fn) {
                    return fn !== cb;
                });
                context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
            }
        };
        evs[eventName] = rv[eventName] = context;
        return context;
    }

    function addConfiguredEvents(cfg) {
        // events(this, {reading: [functionChain, nop]});
        keys(cfg).forEach(function (eventName) {
            var args = cfg[eventName];
            if (isArray(args)) {
                add(eventName, cfg[eventName][0], cfg[eventName][1]);
            } else if (args === 'asap') {
                // Rather than approaching event subscription using a functional approach, we here do it in a for-loop where subscriber is executed in its own stack
                // enabling that any exception that occur wont disturb the initiator and also not nescessary be catched and forgotten.
                var context = add(eventName, mirror, function fire() {
                    // Optimazation-safe cloning of arguments into args.
                    var i = arguments.length,
                        args = new Array(i);
                    while (i--) {
                        args[i] = arguments[i];
                    } // All each subscriber:
                    context.subscribers.forEach(function (fn) {
                        asap(function fireEvent() {
                            fn.apply(null, args);
                        });
                    });
                });
            } else throw new exceptions.InvalidArgument("Invalid event config");
        });
    }
}

//
// Promise Class for Dexie library
//
// I started out writing this Promise class by copying promise-light (https://github.com/taylorhakes/promise-light) by
// https://github.com/taylorhakes - an A+ and ECMASCRIPT 6 compliant Promise implementation.
//
// Modifications needed to be done to support indexedDB because it wont accept setTimeout()
// (See discussion: https://github.com/promises-aplus/promises-spec/issues/45) .
// This topic was also discussed in the following thread: https://github.com/promises-aplus/promises-spec/issues/45
//
// This implementation will not use setTimeout or setImmediate when it's not needed. The behavior is 100% Promise/A+ compliant since
// the caller of new Promise() can be certain that the promise wont be triggered the lines after constructing the promise.
//
// In previous versions this was fixed by not calling setTimeout when knowing that the resolve() or reject() came from another
// tick. In Dexie v1.4.0, I've rewritten the Promise class entirely. Just some fragments of promise-light is left. I use
// another strategy now that simplifies everything a lot: to always execute callbacks in a new tick, but have an own microTick
// engine that is used instead of setImmediate() or setTimeout().
// Promise class has also been optimized a lot with inspiration from bluebird - to avoid closures as much as possible.
// Also with inspiration from bluebird, asyncronic stacks in debug mode.
//
// Specific non-standard features of this Promise class:
// * Async static context support (Promise.PSD)
// * Promise.follow() method built upon PSD, that allows user to track all promises created from current stack frame
//   and below + all promises that those promises creates or awaits.
// * Detect any unhandled promise in a PSD-scope (PSD.onunhandled). 
//
// David Fahlander, https://github.com/dfahlander
//

// Just a pointer that only this module knows about.
// Used in Promise constructor to emulate a private constructor.
var INTERNAL = {};

// Async stacks (long stacks) must not grow infinitely.
var LONG_STACKS_CLIP_LIMIT = 100;
var MAX_LONG_STACKS = 20;
var stack_being_generated = false;

/* The default "nextTick" function used only for the very first promise in a promise chain.
   As soon as then promise is resolved or rejected, all next tasks will be executed in micro ticks
   emulated in this module. For indexedDB compatibility, this means that every method needs to 
   execute at least one promise before doing an indexedDB operation. Dexie will always call 
   db.ready().then() for every operation to make sure the indexedDB event is started in an
   emulated micro tick.
*/
var schedulePhysicalTick = _global.setImmediate ?
// setImmediate supported. Those modern platforms also supports Function.bind().
setImmediate.bind(null, physicalTick) : _global.MutationObserver ?
// MutationObserver supported
function () {
    var hiddenDiv = document.createElement("div");
    new MutationObserver(function () {
        physicalTick();
        hiddenDiv = null;
    }).observe(hiddenDiv, { attributes: true });
    hiddenDiv.setAttribute('i', '1');
} :
// No support for setImmediate or MutationObserver. No worry, setTimeout is only called
// once time. Every tick that follows will be our emulated micro tick.
// Could have uses setTimeout.bind(null, 0, physicalTick) if it wasnt for that FF13 and below has a bug 
function () {
    setTimeout(physicalTick, 0);
};

// Confifurable through Promise.scheduler.
// Don't export because it would be unsafe to let unknown
// code call it unless they do try..catch within their callback.
// This function can be retrieved through getter of Promise.scheduler though,
// but users must not do Promise.scheduler (myFuncThatThrows exception)!
var asap$1 = function (callback, args) {
    microtickQueue.push([callback, args]);
    if (needsNewPhysicalTick) {
        schedulePhysicalTick();
        needsNewPhysicalTick = false;
    }
};

var isOutsideMicroTick = true;
var needsNewPhysicalTick = true;
var unhandledErrors = [];
var rejectingErrors = [];
var currentFulfiller = null;
var rejectionMapper = mirror; // Remove in next major when removing error mapping of DOMErrors and DOMExceptions

var globalPSD = {
    global: true,
    ref: 0,
    unhandleds: [],
    onunhandled: globalError,
    //env: null, // Will be set whenever leaving a scope using wrappers.snapshot()
    finalize: function () {
        this.unhandleds.forEach(function (uh) {
            try {
                globalError(uh[0], uh[1]);
            } catch (e) {}
        });
    }
};

var PSD = globalPSD;

var microtickQueue = []; // Callbacks to call in this or next physical tick.
var numScheduledCalls = 0; // Number of listener-calls left to do in this physical tick.
var tickFinalizers = []; // Finalizers to call when there are no more async calls scheduled within current physical tick.

// Wrappers are not being used yet. Their framework is functioning and can be used
// to replace environment during a PSD scope (a.k.a. 'zone').
/* **KEEP** export var wrappers = (() => {
    var wrappers = [];

    return {
        snapshot: () => {
            var i = wrappers.length,
                result = new Array(i);
            while (i--) result[i] = wrappers[i].snapshot();
            return result;
        },
        restore: values => {
            var i = wrappers.length;
            while (i--) wrappers[i].restore(values[i]);
        },
        wrap: () => wrappers.map(w => w.wrap()),
        add: wrapper => {
            wrappers.push(wrapper);
        }
    };
})();
*/

function Promise(fn) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
    this._listeners = [];
    this.onuncatched = nop; // Deprecate in next major. Not needed. Better to use global error handler.

    // A library may set `promise._lib = true;` after promise is created to make resolve() or reject()
    // execute the microtask engine implicitely within the call to resolve() or reject().
    // To remain A+ compliant, a library must only set `_lib=true` if it can guarantee that the stack
    // only contains library code when calling resolve() or reject().
    // RULE OF THUMB: ONLY set _lib = true for promises explicitely resolving/rejecting directly from
    // global scope (event handler, timer etc)!
    this._lib = false;
    // Current async scope
    var psd = this._PSD = PSD;

    if (debug) {
        this._stackHolder = getErrorWithStack();
        this._prev = null;
        this._numPrev = 0; // Number of previous promises (for long stacks)
        linkToPreviousPromise(this, currentFulfiller);
    }

    if (typeof fn !== 'function') {
        if (fn !== INTERNAL) throw new TypeError('Not a function');
        // Private constructor (INTERNAL, state, value).
        // Used internally by Promise.resolve() and Promise.reject().
        this._state = arguments[1];
        this._value = arguments[2];
        if (this._state === false) handleRejection(this, this._value); // Map error, set stack and addPossiblyUnhandledError().
        return;
    }

    this._state = null; // null (=pending), false (=rejected) or true (=resolved)
    this._value = null; // error or result
    ++psd.ref; // Refcounting current scope
    executePromiseTask(this, fn);
}

props(Promise.prototype, {

    then: function (onFulfilled, onRejected) {
        var _this = this;

        var rv = new Promise(function (resolve, reject) {
            propagateToListener(_this, new Listener(onFulfilled, onRejected, resolve, reject));
        });
        debug && (!this._prev || this._state === null) && linkToPreviousPromise(rv, this);
        return rv;
    },

    _then: function (onFulfilled, onRejected) {
        // A little tinier version of then() that don't have to create a resulting promise.
        propagateToListener(this, new Listener(null, null, onFulfilled, onRejected));
    },

    catch: function (onRejected) {
        if (arguments.length === 1) return this.then(null, onRejected);
        // First argument is the Error type to catch
        var type = arguments[0],
            handler = arguments[1];
        return typeof type === 'function' ? this.then(null, function (err) {
            return (
                // Catching errors by its constructor type (similar to java / c++ / c#)
                // Sample: promise.catch(TypeError, function (e) { ... });
                err instanceof type ? handler(err) : PromiseReject(err)
            );
        }) : this.then(null, function (err) {
            return (
                // Catching errors by the error.name property. Makes sense for indexedDB where error type
                // is always DOMError but where e.name tells the actual error type.
                // Sample: promise.catch('ConstraintError', function (e) { ... });
                err && err.name === type ? handler(err) : PromiseReject(err)
            );
        });
    },

    finally: function (onFinally) {
        return this.then(function (value) {
            onFinally();
            return value;
        }, function (err) {
            onFinally();
            return PromiseReject(err);
        });
    },

    // Deprecate in next major. Needed only for db.on.error.
    uncaught: function (uncaughtHandler) {
        var _this2 = this;

        // Be backward compatible and use "onuncatched" as the event name on this.
        // Handle multiple subscribers through reverseStoppableEventChain(). If a handler returns `false`, bubbling stops.
        this.onuncatched = reverseStoppableEventChain(this.onuncatched, uncaughtHandler);
        // In case caller does this on an already rejected promise, assume caller wants to point out the error to this promise and not
        // a previous promise. Reason: the prevous promise may lack onuncatched handler. 
        if (this._state === false && unhandledErrors.indexOf(this) === -1) {
            // Replace unhandled error's destinaion promise with this one!
            unhandledErrors.some(function (p, i, l) {
                return p._value === _this2._value && (l[i] = _this2);
            });
            // Actually we do this shit because we need to support db.on.error() correctly during db.open(). If we deprecate db.on.error, we could
            // take away this piece of code as well as the onuncatched and uncaught() method.
        }
        return this;
    },

    stack: {
        get: function () {
            if (this._stack) return this._stack;
            try {
                stack_being_generated = true;
                var stacks = getStack(this, [], MAX_LONG_STACKS);
                var stack = stacks.join("\nFrom previous: ");
                if (this._state !== null) this._stack = stack; // Stack may be updated on reject.
                return stack;
            } finally {
                stack_being_generated = false;
            }
        }
    }
});

function Listener(onFulfilled, onRejected, resolve, reject) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.resolve = resolve;
    this.reject = reject;
    this.psd = PSD;
}

// Promise Static Properties
props(Promise, {
    all: function () {
        var values = getArrayOf.apply(null, arguments); // Supports iterables, implicit arguments and array-like.
        return new Promise(function (resolve, reject) {
            if (values.length === 0) resolve([]);
            var remaining = values.length;
            values.forEach(function (a, i) {
                return Promise.resolve(a).then(function (x) {
                    values[i] = x;
                    if (! --remaining) resolve(values);
                }, reject);
            });
        });
    },

    resolve: function (value) {
        if (value instanceof Promise) return value;
        if (value && typeof value.then === 'function') return new Promise(function (resolve, reject) {
            value.then(resolve, reject);
        });
        return new Promise(INTERNAL, true, value);
    },

    reject: PromiseReject,

    race: function () {
        var values = getArrayOf.apply(null, arguments);
        return new Promise(function (resolve, reject) {
            values.map(function (value) {
                return Promise.resolve(value).then(resolve, reject);
            });
        });
    },

    PSD: {
        get: function () {
            return PSD;
        },
        set: function (value) {
            return PSD = value;
        }
    },

    newPSD: newScope,

    usePSD: usePSD,

    scheduler: {
        get: function () {
            return asap$1;
        },
        set: function (value) {
            asap$1 = value;
        }
    },

    rejectionMapper: {
        get: function () {
            return rejectionMapper;
        },
        set: function (value) {
            rejectionMapper = value;
        } // Map reject failures
    },

    follow: function (fn) {
        return new Promise(function (resolve, reject) {
            return newScope(function (resolve, reject) {
                var psd = PSD;
                psd.unhandleds = []; // For unhandled standard- or 3rd party Promises. Checked at psd.finalize()
                psd.onunhandled = reject; // Triggered directly on unhandled promises of this library.
                psd.finalize = callBoth(function () {
                    var _this3 = this;

                    // Unhandled standard or 3rd part promises are put in PSD.unhandleds and
                    // examined upon scope completion while unhandled rejections in this Promise
                    // will trigger directly through psd.onunhandled
                    run_at_end_of_this_or_next_physical_tick(function () {
                        _this3.unhandleds.length === 0 ? resolve() : reject(_this3.unhandleds[0]);
                    });
                }, psd.finalize);
                fn();
            }, resolve, reject);
        });
    },

    on: Events(null, { "error": [reverseStoppableEventChain, defaultErrorHandler] // Default to defaultErrorHandler
    })

});

var PromiseOnError = Promise.on.error;
PromiseOnError.subscribe = deprecated("Promise.on('error')", PromiseOnError.subscribe);
PromiseOnError.unsubscribe = deprecated("Promise.on('error').unsubscribe", PromiseOnError.unsubscribe);

/**
* Take a potentially misbehaving resolver function and make sure
* onFulfilled and onRejected are only called once.
*
* Makes no guarantees about asynchrony.
*/
function executePromiseTask(promise, fn) {
    // Promise Resolution Procedure:
    // https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    try {
        fn(function (value) {
            if (promise._state !== null) return;
            if (value === promise) throw new TypeError('A promise cannot be resolved with itself.');
            var shouldExecuteTick = promise._lib && beginMicroTickScope();
            if (value && typeof value.then === 'function') {
                executePromiseTask(promise, function (resolve, reject) {
                    value instanceof Promise ? value._then(resolve, reject) : value.then(resolve, reject);
                });
            } else {
                promise._state = true;
                promise._value = value;
                propagateAllListeners(promise);
            }
            if (shouldExecuteTick) endMicroTickScope();
        }, handleRejection.bind(null, promise)); // If Function.bind is not supported. Exception is handled in catch below
    } catch (ex) {
        handleRejection(promise, ex);
    }
}

function handleRejection(promise, reason) {
    rejectingErrors.push(reason);
    if (promise._state !== null) return;
    var shouldExecuteTick = promise._lib && beginMicroTickScope();
    reason = rejectionMapper(reason);
    promise._state = false;
    promise._value = reason;
    debug && reason !== null && typeof reason === 'object' && !reason._promise && tryCatch(function () {
        var origProp = getPropertyDescriptor(reason, "stack");
        reason._promise = promise;
        setProp(reason, "stack", {
            get: function () {
                return stack_being_generated ? origProp && (origProp.get ? origProp.get.apply(reason) : origProp.value) : promise.stack;
            }
        });
    });
    // Add the failure to a list of possibly uncaught errors
    addPossiblyUnhandledError(promise);
    propagateAllListeners(promise);
    if (shouldExecuteTick) endMicroTickScope();
}

function propagateAllListeners(promise) {
    //debug && linkToPreviousPromise(promise);
    var listeners = promise._listeners;
    promise._listeners = [];
    for (var i = 0, len = listeners.length; i < len; ++i) {
        propagateToListener(promise, listeners[i]);
    }
    var psd = promise._PSD;
    --psd.ref || psd.finalize(); // if psd.ref reaches zero, call psd.finalize();
    if (numScheduledCalls === 0) {
        // If numScheduledCalls is 0, it means that our stack is not in a callback of a scheduled call,
        // and that no deferreds where listening to this rejection or success.
        // Since there is a risk that our stack can contain application code that may
        // do stuff after this code is finished that may generate new calls, we cannot
        // call finalizers here.
        ++numScheduledCalls;
        asap$1(function () {
            if (--numScheduledCalls === 0) finalizePhysicalTick(); // Will detect unhandled errors
        }, []);
    }
}

function propagateToListener(promise, listener) {
    if (promise._state === null) {
        promise._listeners.push(listener);
        return;
    }

    var cb = promise._state ? listener.onFulfilled : listener.onRejected;
    if (cb === null) {
        // This Listener doesnt have a listener for the event being triggered (onFulfilled or onReject) so lets forward the event to any eventual listeners on the Promise instance returned by then() or catch()
        return (promise._state ? listener.resolve : listener.reject)(promise._value);
    }
    var psd = listener.psd;
    ++psd.ref;
    ++numScheduledCalls;
    asap$1(callListener, [cb, promise, listener]);
}

function callListener(cb, promise, listener) {
    var outerScope = PSD;
    var psd = listener.psd;
    try {
        if (psd !== outerScope) {
            // **KEEP** outerScope.env = wrappers.snapshot(); // Snapshot outerScope's environment.
            PSD = psd;
            // **KEEP** wrappers.restore(psd.env); // Restore PSD's environment.
        }

        // Set static variable currentFulfiller to the promise that is being fullfilled,
        // so that we connect the chain of promises (for long stacks support)
        currentFulfiller = promise;

        // Call callback and resolve our listener with it's return value.
        var value = promise._value,
            ret;
        if (promise._state) {
            ret = cb(value);
        } else {
            if (rejectingErrors.length) rejectingErrors = [];
            ret = cb(value);
            if (rejectingErrors.indexOf(value) === -1) markErrorAsHandled(promise); // Callback didnt do Promise.reject(err) nor reject(err) onto another promise.
        }
        listener.resolve(ret);
    } catch (e) {
        // Exception thrown in callback. Reject our listener.
        listener.reject(e);
    } finally {
        // Restore PSD, env and currentFulfiller.
        if (psd !== outerScope) {
            PSD = outerScope;
            // **KEEP** wrappers.restore(outerScope.env); // Restore outerScope's environment
        }
        currentFulfiller = null;
        if (--numScheduledCalls === 0) finalizePhysicalTick();
        --psd.ref || psd.finalize();
    }
}

function getStack(promise, stacks, limit) {
    if (stacks.length === limit) return stacks;
    var stack = "";
    if (promise._state === false) {
        var failure = promise._value,
            errorName,
            message;

        if (failure != null) {
            errorName = failure.name || "Error";
            message = failure.message || failure;
            stack = prettyStack(failure, 0);
        } else {
            errorName = failure; // If error is undefined or null, show that.
            message = "";
        }
        stacks.push(errorName + (message ? ": " + message : "") + stack);
    }
    if (debug) {
        stack = prettyStack(promise._stackHolder, 2);
        if (stack && stacks.indexOf(stack) === -1) stacks.push(stack);
        if (promise._prev) getStack(promise._prev, stacks, limit);
    }
    return stacks;
}

function linkToPreviousPromise(promise, prev) {
    // Support long stacks by linking to previous completed promise.
    var numPrev = prev ? prev._numPrev + 1 : 0;
    if (numPrev < LONG_STACKS_CLIP_LIMIT) {
        // Prohibit infinite Promise loops to get an infinite long memory consuming "tail".
        promise._prev = prev;
        promise._numPrev = numPrev;
    }
}

/* The callback to schedule with setImmediate() or setTimeout().
   It runs a virtual microtick and executes any callback registered in microtickQueue.
 */
function physicalTick() {
    beginMicroTickScope() && endMicroTickScope();
}

function beginMicroTickScope() {
    var wasRootExec = isOutsideMicroTick;
    isOutsideMicroTick = false;
    needsNewPhysicalTick = false;
    return wasRootExec;
}

/* Executes micro-ticks without doing try..catch.
   This can be possible because we only use this internally and
   the registered functions are exception-safe (they do try..catch
   internally before calling any external method). If registering
   functions in the microtickQueue that are not exception-safe, this
   would destroy the framework and make it instable. So we don't export
   our asap method.
*/
function endMicroTickScope() {
    var callbacks, i, l;
    do {
        while (microtickQueue.length > 0) {
            callbacks = microtickQueue;
            microtickQueue = [];
            l = callbacks.length;
            for (i = 0; i < l; ++i) {
                var item = callbacks[i];
                item[0].apply(null, item[1]);
            }
        }
    } while (microtickQueue.length > 0);
    isOutsideMicroTick = true;
    needsNewPhysicalTick = true;
}

function finalizePhysicalTick() {
    var unhandledErrs = unhandledErrors;
    unhandledErrors = [];
    unhandledErrs.forEach(function (p) {
        p._PSD.onunhandled.call(null, p._value, p);
    });
    var finalizers = tickFinalizers.slice(0); // Clone first because finalizer may remove itself from list.
    var i = finalizers.length;
    while (i) {
        finalizers[--i]();
    }
}

function run_at_end_of_this_or_next_physical_tick(fn) {
    function finalizer() {
        fn();
        tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
    }
    tickFinalizers.push(finalizer);
    ++numScheduledCalls;
    asap$1(function () {
        if (--numScheduledCalls === 0) finalizePhysicalTick();
    }, []);
}

function addPossiblyUnhandledError(promise) {
    // Only add to unhandledErrors if not already there. The first one to add to this list
    // will be upon the first rejection so that the root cause (first promise in the
    // rejection chain) is the one listed.
    if (!unhandledErrors.some(function (p) {
        return p._value === promise._value;
    })) unhandledErrors.push(promise);
}

function markErrorAsHandled(promise) {
    // Called when a reject handled is actually being called.
    // Search in unhandledErrors for any promise whos _value is this promise_value (list
    // contains only rejected promises, and only one item per error)
    var i = unhandledErrors.length;
    while (i) {
        if (unhandledErrors[--i]._value === promise._value) {
            // Found a promise that failed with this same error object pointer,
            // Remove that since there is a listener that actually takes care of it.
            unhandledErrors.splice(i, 1);
            return;
        }
    }
}

// By default, log uncaught errors to the console
function defaultErrorHandler(e) {
    console.warn('Unhandled rejection: ' + (e.stack || e));
}

function PromiseReject(reason) {
    return new Promise(INTERNAL, false, reason);
}

function wrap(fn, errorCatcher) {
    var psd = PSD;
    return function () {
        var wasRootExec = beginMicroTickScope(),
            outerScope = PSD;

        try {
            if (outerScope !== psd) {
                // **KEEP** outerScope.env = wrappers.snapshot(); // Snapshot outerScope's environment
                PSD = psd;
                // **KEEP** wrappers.restore(psd.env); // Restore PSD's environment.
            }
            return fn.apply(this, arguments);
        } catch (e) {
            errorCatcher && errorCatcher(e);
        } finally {
            if (outerScope !== psd) {
                PSD = outerScope;
                // **KEEP** wrappers.restore(outerScope.env); // Restore outerScope's environment
            }
            if (wasRootExec) endMicroTickScope();
        }
    };
}

function newScope(fn, a1, a2, a3) {
    var parent = PSD,
        psd = Object.create(parent);
    psd.parent = parent;
    psd.ref = 0;
    psd.global = false;
    // **KEEP** psd.env = wrappers.wrap(psd);

    // unhandleds and onunhandled should not be specifically set here.
    // Leave them on parent prototype.
    // unhandleds.push(err) will push to parent's prototype
    // onunhandled() will call parents onunhandled (with this scope's this-pointer though!)
    ++parent.ref;
    psd.finalize = function () {
        --this.parent.ref || this.parent.finalize();
    };
    var rv = usePSD(psd, fn, a1, a2, a3);
    if (psd.ref === 0) psd.finalize();
    return rv;
}

function usePSD(psd, fn, a1, a2, a3) {
    var outerScope = PSD;
    try {
        if (psd !== outerScope) {
            // **KEEP** outerScope.env = wrappers.snapshot(); // snapshot outerScope's environment.
            PSD = psd;
            // **KEEP** wrappers.restore(psd.env); // Restore PSD's environment.
        }
        return fn(a1, a2, a3);
    } finally {
        if (psd !== outerScope) {
            PSD = outerScope;
            // **KEEP** wrappers.restore(outerScope.env); // Restore outerScope's environment.
        }
    }
}

var UNHANDLEDREJECTION = "unhandledrejection";

function globalError(err, promise) {
    var rv;
    try {
        rv = promise.onuncatched(err);
    } catch (e) {}
    if (rv !== false) try {
        var event,
            eventData = { promise: promise, reason: err };
        if (_global.document && document.createEvent) {
            event = document.createEvent('Event');
            event.initEvent(UNHANDLEDREJECTION, true, true);
            extend(event, eventData);
        } else if (_global.CustomEvent) {
            event = new CustomEvent(UNHANDLEDREJECTION, { detail: eventData });
            extend(event, eventData);
        }
        if (event && _global.dispatchEvent) {
            dispatchEvent(event);
            if (!_global.PromiseRejectionEvent && _global.onunhandledrejection)
                // No native support for PromiseRejectionEvent but user has set window.onunhandledrejection. Manually call it.
                try {
                    _global.onunhandledrejection(event);
                } catch (_) {}
        }
        if (!event.defaultPrevented) {
            // Backward compatibility: fire to events registered at Promise.on.error
            Promise.on.error.fire(err, promise);
        }
    } catch (e) {}
}

/* **KEEP** 

export function wrapPromise(PromiseClass) {
    var proto = PromiseClass.prototype;
    var origThen = proto.then;
    
    wrappers.add({
        snapshot: () => proto.then,
        restore: value => {proto.then = value;},
        wrap: () => patchedThen
    });

    function patchedThen (onFulfilled, onRejected) {
        var promise = this;
        var onFulfilledProxy = wrap(function(value){
            var rv = value;
            if (onFulfilled) {
                rv = onFulfilled(rv);
                if (rv && typeof rv.then === 'function') rv.then(); // Intercept that promise as well.
            }
            --PSD.ref || PSD.finalize();
            return rv;
        });
        var onRejectedProxy = wrap(function(err){
            promise._$err = err;
            var unhandleds = PSD.unhandleds;
            var idx = unhandleds.length,
                rv;
            while (idx--) if (unhandleds[idx]._$err === err) break;
            if (onRejected) {
                if (idx !== -1) unhandleds.splice(idx, 1); // Mark as handled.
                rv = onRejected(err);
                if (rv && typeof rv.then === 'function') rv.then(); // Intercept that promise as well.
            } else {
                if (idx === -1) unhandleds.push(promise);
                rv = PromiseClass.reject(err);
                rv._$nointercept = true; // Prohibit eternal loop.
            }
            --PSD.ref || PSD.finalize();
            return rv;
        });
        
        if (this._$nointercept) return origThen.apply(this, arguments);
        ++PSD.ref;
        return origThen.call(this, onFulfilledProxy, onRejectedProxy);
    }
}

// Global Promise wrapper
if (_global.Promise) wrapPromise(_global.Promise);

*/

doFakeAutoComplete(function () {
    // Simplify the job for VS Intellisense. This piece of code is one of the keys to the new marvellous intellisense support in Dexie.
    asap$1 = function (fn, args) {
        setTimeout(function () {
            fn.apply(null, args);
        }, 0);
    };
});

function rejection(err, uncaughtHandler) {
    // Get the call stack and return a rejected promise.
    var rv = Promise.reject(err);
    return uncaughtHandler ? rv.uncaught(uncaughtHandler) : rv;
}

/*
 * Dexie.js - a minimalistic wrapper for IndexedDB
 * ===============================================
 *
 * By David Fahlander, david.fahlander@gmail.com
 *
 * Version 1.5.1, Tue Nov 01 2016
 *
 * http://dexie.org
 *
 * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
 */

var DEXIE_VERSION = '1.5.1';
var maxString = String.fromCharCode(65535);
var maxKey = function () {
    try {
        IDBKeyRange.only([[]]);return [[]];
    } catch (e) {
        return maxString;
    }
}();
var INVALID_KEY_ARGUMENT = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
var STRING_EXPECTED = "String expected.";
var connections = [];
var isIEOrEdge = typeof navigator !== 'undefined' && /(MSIE|Trident|Edge)/.test(navigator.userAgent);
var hasIEDeleteObjectStoreBug = isIEOrEdge;
var hangsOnDeleteLargeKeyRange = isIEOrEdge;
var dexieStackFrameFilter = function (frame) {
    return !/(dexie\.js|dexie\.min\.js)/.test(frame);
};

setDebug(debug, dexieStackFrameFilter);

function Dexie(dbName, options) {
    /// <param name="options" type="Object" optional="true">Specify only if you wich to control which addons that should run on this instance</param>
    var deps = Dexie.dependencies;
    var opts = extend({
        // Default Options
        addons: Dexie.addons, // Pick statically registered addons by default
        autoOpen: true, // Don't require db.open() explicitely.
        indexedDB: deps.indexedDB, // Backend IndexedDB api. Default to IDBShim or browser env.
        IDBKeyRange: deps.IDBKeyRange // Backend IDBKeyRange api. Default to IDBShim or browser env.
    }, options);
    var addons = opts.addons,
        autoOpen = opts.autoOpen,
        indexedDB = opts.indexedDB,
        IDBKeyRange = opts.IDBKeyRange;

    var globalSchema = this._dbSchema = {};
    var versions = [];
    var dbStoreNames = [];
    var allTables = {};
    ///<var type="IDBDatabase" />
    var idbdb = null; // Instance of IDBDatabase
    var dbOpenError = null;
    var isBeingOpened = false;
    var openComplete = false;
    var READONLY = "readonly",
        READWRITE = "readwrite";
    var db = this;
    var dbReadyResolve,
        dbReadyPromise = new Promise(function (resolve) {
        dbReadyResolve = resolve;
    }),
        cancelOpen,
        openCanceller = new Promise(function (_, reject) {
        cancelOpen = reject;
    });
    var autoSchema = true;
    var hasNativeGetDatabaseNames = !!getNativeGetDatabaseNamesFn(indexedDB),
        hasGetAll;

    function init() {
        // Default subscribers to "versionchange" and "blocked".
        // Can be overridden by custom handlers. If custom handlers return false, these default
        // behaviours will be prevented.
        db.on("versionchange", function (ev) {
            // Default behavior for versionchange event is to close database connection.
            // Caller can override this behavior by doing db.on("versionchange", function(){ return false; });
            // Let's not block the other window from making it's delete() or open() call.
            // NOTE! This event is never fired in IE,Edge or Safari.
            if (ev.newVersion > 0) console.warn('Another connection wants to upgrade database \'' + db.name + '\'. Closing db now to resume the upgrade.');else console.warn('Another connection wants to delete database \'' + db.name + '\'. Closing db now to resume the delete request.');
            db.close();
            // In many web applications, it would be recommended to force window.reload()
            // when this event occurs. To do that, subscribe to the versionchange event
            // and call window.location.reload(true) if ev.newVersion > 0 (not a deletion)
            // The reason for this is that your current web app obviously has old schema code that needs
            // to be updated. Another window got a newer version of the app and needs to upgrade DB but
            // your window is blocking it unless we close it here.
        });
        db.on("blocked", function (ev) {
            if (!ev.newVersion || ev.newVersion < ev.oldVersion) console.warn('Dexie.delete(\'' + db.name + '\') was blocked');else console.warn('Upgrade \'' + db.name + '\' blocked by other connection holding version ' + ev.oldVersion / 10);
        });
    }

    //
    //
    //
    // ------------------------- Versioning Framework---------------------------
    //
    //
    //

    this.version = function (versionNumber) {
        /// <param name="versionNumber" type="Number"></param>
        /// <returns type="Version"></returns>
        if (idbdb || isBeingOpened) throw new exceptions.Schema("Cannot add version when database is open");
        this.verno = Math.max(this.verno, versionNumber);
        var versionInstance = versions.filter(function (v) {
            return v._cfg.version === versionNumber;
        })[0];
        if (versionInstance) return versionInstance;
        versionInstance = new Version(versionNumber);
        versions.push(versionInstance);
        versions.sort(lowerVersionFirst);
        return versionInstance;
    };

    function Version(versionNumber) {
        this._cfg = {
            version: versionNumber,
            storesSource: null,
            dbschema: {},
            tables: {},
            contentUpgrade: null
        };
        this.stores({}); // Derive earlier schemas by default.
    }

    extend(Version.prototype, {
        stores: function (stores) {
            /// <summary>
            ///   Defines the schema for a particular version
            /// </summary>
            /// <param name="stores" type="Object">
            /// Example: <br/>
            ///   {users: "id++,first,last,&amp;username,*email", <br/>
            ///   passwords: "id++,&amp;username"}<br/>
            /// <br/>
            /// Syntax: {Table: "[primaryKey][++],[&amp;][*]index1,[&amp;][*]index2,..."}<br/><br/>
            /// Special characters:<br/>
            ///  "&amp;"  means unique key, <br/>
            ///  "*"  means value is multiEntry, <br/>
            ///  "++" means auto-increment and only applicable for primary key <br/>
            /// </param>
            this._cfg.storesSource = this._cfg.storesSource ? extend(this._cfg.storesSource, stores) : stores;

            // Derive stores from earlier versions if they are not explicitely specified as null or a new syntax.
            var storesSpec = {};
            versions.forEach(function (version) {
                // 'versions' is always sorted by lowest version first.
                extend(storesSpec, version._cfg.storesSource);
            });

            var dbschema = this._cfg.dbschema = {};
            this._parseStoresSpec(storesSpec, dbschema);
            // Update the latest schema to this version
            // Update API
            globalSchema = db._dbSchema = dbschema;
            removeTablesApi([allTables, db, Transaction.prototype]);
            setApiOnPlace([allTables, db, Transaction.prototype, this._cfg.tables], keys(dbschema), READWRITE, dbschema);
            dbStoreNames = keys(dbschema);
            return this;
        },
        upgrade: function (upgradeFunction) {
            /// <param name="upgradeFunction" optional="true">Function that performs upgrading actions.</param>
            var self = this;
            fakeAutoComplete(function () {
                upgradeFunction(db._createTransaction(READWRITE, keys(self._cfg.dbschema), self._cfg.dbschema)); // BUGBUG: No code completion for prev version's tables wont appear.
            });
            this._cfg.contentUpgrade = upgradeFunction;
            return this;
        },
        _parseStoresSpec: function (stores, outSchema) {
            keys(stores).forEach(function (tableName) {
                if (stores[tableName] !== null) {
                    var instanceTemplate = {};
                    var indexes = parseIndexSyntax(stores[tableName]);
                    var primKey = indexes.shift();
                    if (primKey.multi) throw new exceptions.Schema("Primary key cannot be multi-valued");
                    if (primKey.keyPath) setByKeyPath(instanceTemplate, primKey.keyPath, primKey.auto ? 0 : primKey.keyPath);
                    indexes.forEach(function (idx) {
                        if (idx.auto) throw new exceptions.Schema("Only primary key can be marked as autoIncrement (++)");
                        if (!idx.keyPath) throw new exceptions.Schema("Index must have a name and cannot be an empty string");
                        setByKeyPath(instanceTemplate, idx.keyPath, idx.compound ? idx.keyPath.map(function () {
                            return "";
                        }) : "");
                    });
                    outSchema[tableName] = new TableSchema(tableName, primKey, indexes, instanceTemplate);
                }
            });
        }
    });

    function runUpgraders(oldVersion, idbtrans, reject) {
        var trans = db._createTransaction(READWRITE, dbStoreNames, globalSchema);
        trans.create(idbtrans);
        trans._completion.catch(reject);
        var rejectTransaction = trans._reject.bind(trans);
        newScope(function () {
            PSD.trans = trans;
            if (oldVersion === 0) {
                // Create tables:
                keys(globalSchema).forEach(function (tableName) {
                    createTable(idbtrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
                });
                Promise.follow(function () {
                    return db.on.populate.fire(trans);
                }).catch(rejectTransaction);
            } else updateTablesAndIndexes(oldVersion, trans, idbtrans).catch(rejectTransaction);
        });
    }

    function updateTablesAndIndexes(oldVersion, trans, idbtrans) {
        // Upgrade version to version, step-by-step from oldest to newest version.
        // Each transaction object will contain the table set that was current in that version (but also not-yet-deleted tables from its previous version)
        var queue = [];
        var oldVersionStruct = versions.filter(function (version) {
            return version._cfg.version === oldVersion;
        })[0];
        if (!oldVersionStruct) throw new exceptions.Upgrade("Dexie specification of currently installed DB version is missing");
        globalSchema = db._dbSchema = oldVersionStruct._cfg.dbschema;
        var anyContentUpgraderHasRun = false;

        var versToRun = versions.filter(function (v) {
            return v._cfg.version > oldVersion;
        });
        versToRun.forEach(function (version) {
            /// <param name="version" type="Version"></param>
            queue.push(function () {
                var oldSchema = globalSchema;
                var newSchema = version._cfg.dbschema;
                adjustToExistingIndexNames(oldSchema, idbtrans);
                adjustToExistingIndexNames(newSchema, idbtrans);
                globalSchema = db._dbSchema = newSchema;
                var diff = getSchemaDiff(oldSchema, newSchema);
                // Add tables           
                diff.add.forEach(function (tuple) {
                    createTable(idbtrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
                });
                // Change tables
                diff.change.forEach(function (change) {
                    if (change.recreate) {
                        throw new exceptions.Upgrade("Not yet support for changing primary key");
                    } else {
                        var store = idbtrans.objectStore(change.name);
                        // Add indexes
                        change.add.forEach(function (idx) {
                            addIndex(store, idx);
                        });
                        // Update indexes
                        change.change.forEach(function (idx) {
                            store.deleteIndex(idx.name);
                            addIndex(store, idx);
                        });
                        // Delete indexes
                        change.del.forEach(function (idxName) {
                            store.deleteIndex(idxName);
                        });
                    }
                });
                if (version._cfg.contentUpgrade) {
                    anyContentUpgraderHasRun = true;
                    return Promise.follow(function () {
                        version._cfg.contentUpgrade(trans);
                    });
                }
            });
            queue.push(function (idbtrans) {
                if (!anyContentUpgraderHasRun || !hasIEDeleteObjectStoreBug) {
                    // Dont delete old tables if ieBug is present and a content upgrader has run. Let tables be left in DB so far. This needs to be taken care of.
                    var newSchema = version._cfg.dbschema;
                    // Delete old tables
                    deleteRemovedTables(newSchema, idbtrans);
                }
            });
        });

        // Now, create a queue execution engine
        function runQueue() {
            return queue.length ? Promise.resolve(queue.shift()(trans.idbtrans)).then(runQueue) : Promise.resolve();
        }

        return runQueue().then(function () {
            createMissingTables(globalSchema, idbtrans); // At last, make sure to create any missing tables. (Needed by addons that add stores to DB without specifying version)
        });
    }

    function getSchemaDiff(oldSchema, newSchema) {
        var diff = {
            del: [], // Array of table names
            add: [], // Array of [tableName, newDefinition]
            change: [] // Array of {name: tableName, recreate: newDefinition, del: delIndexNames, add: newIndexDefs, change: changedIndexDefs}
        };
        for (var table in oldSchema) {
            if (!newSchema[table]) diff.del.push(table);
        }
        for (table in newSchema) {
            var oldDef = oldSchema[table],
                newDef = newSchema[table];
            if (!oldDef) {
                diff.add.push([table, newDef]);
            } else {
                var change = {
                    name: table,
                    def: newDef,
                    recreate: false,
                    del: [],
                    add: [],
                    change: []
                };
                if (oldDef.primKey.src !== newDef.primKey.src) {
                    // Primary key has changed. Remove and re-add table.
                    change.recreate = true;
                    diff.change.push(change);
                } else {
                    // Same primary key. Just find out what differs:
                    var oldIndexes = oldDef.idxByName;
                    var newIndexes = newDef.idxByName;
                    for (var idxName in oldIndexes) {
                        if (!newIndexes[idxName]) change.del.push(idxName);
                    }
                    for (idxName in newIndexes) {
                        var oldIdx = oldIndexes[idxName],
                            newIdx = newIndexes[idxName];
                        if (!oldIdx) change.add.push(newIdx);else if (oldIdx.src !== newIdx.src) change.change.push(newIdx);
                    }
                    if (change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
                        diff.change.push(change);
                    }
                }
            }
        }
        return diff;
    }

    function createTable(idbtrans, tableName, primKey, indexes) {
        /// <param name="idbtrans" type="IDBTransaction"></param>
        var store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ? { keyPath: primKey.keyPath, autoIncrement: primKey.auto } : { autoIncrement: primKey.auto });
        indexes.forEach(function (idx) {
            addIndex(store, idx);
        });
        return store;
    }

    function createMissingTables(newSchema, idbtrans) {
        keys(newSchema).forEach(function (tableName) {
            if (!idbtrans.db.objectStoreNames.contains(tableName)) {
                createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
            }
        });
    }

    function deleteRemovedTables(newSchema, idbtrans) {
        for (var i = 0; i < idbtrans.db.objectStoreNames.length; ++i) {
            var storeName = idbtrans.db.objectStoreNames[i];
            if (newSchema[storeName] == null) {
                idbtrans.db.deleteObjectStore(storeName);
            }
        }
    }

    function addIndex(store, idx) {
        store.createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multi });
    }

    function dbUncaught(err) {
        return db.on.error.fire(err);
    }

    //
    //
    //      Dexie Protected API
    //
    //

    this._allTables = allTables;

    this._tableFactory = function createTable(mode, tableSchema) {
        /// <param name="tableSchema" type="TableSchema"></param>
        if (mode === READONLY) return new Table(tableSchema.name, tableSchema, Collection);else return new WriteableTable(tableSchema.name, tableSchema);
    };

    this._createTransaction = function (mode, storeNames, dbschema, parentTransaction) {
        return new Transaction(mode, storeNames, dbschema, parentTransaction);
    };

    /* Generate a temporary transaction when db operations are done outside a transactino scope.
    */
    function tempTransaction(mode, storeNames, fn) {
        // Last argument is "writeLocked". But this doesnt apply to oneshot direct db operations, so we ignore it.
        if (!openComplete && !PSD.letThrough) {
            if (!isBeingOpened) {
                if (!autoOpen) return rejection(new exceptions.DatabaseClosed(), dbUncaught);
                db.open().catch(nop); // Open in background. If if fails, it will be catched by the final promise anyway.
            }
            return dbReadyPromise.then(function () {
                return tempTransaction(mode, storeNames, fn);
            });
        } else {
            var trans = db._createTransaction(mode, storeNames, globalSchema);
            return trans._promise(mode, function (resolve, reject) {
                newScope(function () {
                    // OPTIMIZATION POSSIBLE? newScope() not needed because it's already done in _promise.
                    PSD.trans = trans;
                    fn(resolve, reject, trans);
                });
            }).then(function (result) {
                // Instead of resolving value directly, wait with resolving it until transaction has completed.
                // Otherwise the data would not be in the DB if requesting it in the then() operation.
                // Specifically, to ensure that the following expression will work:
                //
                //   db.friends.put({name: "Arne"}).then(function () {
                //       db.friends.where("name").equals("Arne").count(function(count) {
                //           assert (count === 1);
                //       });
                //   });
                //
                return trans._completion.then(function () {
                    return result;
                });
            }); /*.catch(err => { // Don't do this as of now. If would affect bulk- and modify methods in a way that could be more intuitive. But wait! Maybe change in next major.
                 trans._reject(err);
                 return rejection(err);
                });*/
        }
    }

    this._whenReady = function (fn) {
        return new Promise(fake || openComplete || PSD.letThrough ? fn : function (resolve, reject) {
            if (!isBeingOpened) {
                if (!autoOpen) {
                    reject(new exceptions.DatabaseClosed());
                    return;
                }
                db.open().catch(nop); // Open in background. If if fails, it will be catched by the final promise anyway.
            }
            dbReadyPromise.then(function () {
                fn(resolve, reject);
            });
        }).uncaught(dbUncaught);
    };

    //
    //
    //
    //
    //      Dexie API
    //
    //
    //

    this.verno = 0;

    this.open = function () {
        if (isBeingOpened || idbdb) return dbReadyPromise.then(function () {
            return dbOpenError ? rejection(dbOpenError, dbUncaught) : db;
        });
        debug && (openCanceller._stackHolder = getErrorWithStack()); // Let stacks point to when open() was called rather than where new Dexie() was called.
        isBeingOpened = true;
        dbOpenError = null;
        openComplete = false;

        // Function pointers to call when the core opening process completes.
        var resolveDbReady = dbReadyResolve,

        // upgradeTransaction to abort on failure.
        upgradeTransaction = null;

        return Promise.race([openCanceller, new Promise(function (resolve, reject) {
            doFakeAutoComplete(function () {
                return resolve();
            });

            // Make sure caller has specified at least one version
            if (versions.length > 0) autoSchema = false;

            // Multiply db.verno with 10 will be needed to workaround upgrading bug in IE:
            // IE fails when deleting objectStore after reading from it.
            // A future version of Dexie.js will stopover an intermediate version to workaround this.
            // At that point, we want to be backward compatible. Could have been multiplied with 2, but by using 10, it is easier to map the number to the real version number.

            // If no API, throw!
            if (!indexedDB) throw new exceptions.MissingAPI("indexedDB API not found. If using IE10+, make sure to run your code on a server URL " + "(not locally). If using old Safari versions, make sure to include indexedDB polyfill.");

            var req = autoSchema ? indexedDB.open(dbName) : indexedDB.open(dbName, Math.round(db.verno * 10));
            if (!req) throw new exceptions.MissingAPI("IndexedDB API not available"); // May happen in Safari private mode, see https://github.com/dfahlander/Dexie.js/issues/134
            req.onerror = wrap(eventRejectHandler(reject));
            req.onblocked = wrap(fireOnBlocked);
            req.onupgradeneeded = wrap(function (e) {
                upgradeTransaction = req.transaction;
                if (autoSchema && !db._allowEmptyDB) {
                    // Unless an addon has specified db._allowEmptyDB, lets make the call fail.
                    // Caller did not specify a version or schema. Doing that is only acceptable for opening alread existing databases.
                    // If onupgradeneeded is called it means database did not exist. Reject the open() promise and make sure that we
                    // do not create a new database by accident here.
                    req.onerror = preventDefault; // Prohibit onabort error from firing before we're done!
                    upgradeTransaction.abort(); // Abort transaction (would hope that this would make DB disappear but it doesnt.)
                    // Close database and delete it.
                    req.result.close();
                    var delreq = indexedDB.deleteDatabase(dbName); // The upgrade transaction is atomic, and javascript is single threaded - meaning that there is no risk that we delete someone elses database here!
                    delreq.onsuccess = delreq.onerror = wrap(function () {
                        reject(new exceptions.NoSuchDatabase('Database ' + dbName + ' doesnt exist'));
                    });
                } else {
                    upgradeTransaction.onerror = wrap(eventRejectHandler(reject));
                    var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion; // Safari 8 fix.
                    runUpgraders(oldVer / 10, upgradeTransaction, reject, req);
                }
            }, reject);

            req.onsuccess = wrap(function () {
                // Core opening procedure complete. Now let's just record some stuff.
                upgradeTransaction = null;
                idbdb = req.result;
                connections.push(db); // Used for emulating versionchange event on IE/Edge/Safari.

                if (autoSchema) readGlobalSchema();else if (idbdb.objectStoreNames.length > 0) {
                    try {
                        adjustToExistingIndexNames(globalSchema, idbdb.transaction(safariMultiStoreFix(idbdb.objectStoreNames), READONLY));
                    } catch (e) {
                        // Safari may bail out if > 1 store names. However, this shouldnt be a showstopper. Issue #120.
                    }
                }

                idbdb.onversionchange = wrap(function (ev) {
                    db._vcFired = true; // detect implementations that not support versionchange (IE/Edge/Safari)
                    db.on("versionchange").fire(ev);
                });

                if (!hasNativeGetDatabaseNames) {
                    // Update localStorage with list of database names
                    globalDatabaseList(function (databaseNames) {
                        if (databaseNames.indexOf(dbName) === -1) return databaseNames.push(dbName);
                    });
                }

                resolve();
            }, reject);
        })]).then(function () {
            // Before finally resolving the dbReadyPromise and this promise,
            // call and await all on('ready') subscribers:
            // Dexie.vip() makes subscribers able to use the database while being opened.
            // This is a must since these subscribers take part of the opening procedure.
            return Dexie.vip(db.on.ready.fire);
        }).then(function () {
            // Resolve the db.open() with the db instance.
            isBeingOpened = false;
            return db;
        }).catch(function (err) {
            try {
                // Did we fail within onupgradeneeded? Make sure to abort the upgrade transaction so it doesnt commit.
                upgradeTransaction && upgradeTransaction.abort();
            } catch (e) {}
            isBeingOpened = false; // Set before calling db.close() so that it doesnt reject openCanceller again (leads to unhandled rejection event).
            db.close(); // Closes and resets idbdb, removes connections, resets dbReadyPromise and openCanceller so that a later db.open() is fresh.
            // A call to db.close() may have made on-ready subscribers fail. Use dbOpenError if set, since err could be a follow-up error on that.
            dbOpenError = err; // Record the error. It will be used to reject further promises of db operations.
            return rejection(dbOpenError, dbUncaught); // dbUncaught will make sure any error that happened in any operation before will now bubble to db.on.error() thanks to the special handling in Promise.uncaught().
        }).finally(function () {
            openComplete = true;
            resolveDbReady(); // dbReadyPromise is resolved no matter if open() rejects or resolved. It's just to wake up waiters.
        });
    };

    this.close = function () {
        var idx = connections.indexOf(db);
        if (idx >= 0) connections.splice(idx, 1);
        if (idbdb) {
            try {
                idbdb.close();
            } catch (e) {}
            idbdb = null;
        }
        autoOpen = false;
        dbOpenError = new exceptions.DatabaseClosed();
        if (isBeingOpened) cancelOpen(dbOpenError);
        // Reset dbReadyPromise promise:
        dbReadyPromise = new Promise(function (resolve) {
            dbReadyResolve = resolve;
        });
        openCanceller = new Promise(function (_, reject) {
            cancelOpen = reject;
        });
    };

    this.delete = function () {
        var hasArguments = arguments.length > 0;
        return new Promise(function (resolve, reject) {
            if (hasArguments) throw new exceptions.InvalidArgument("Arguments not allowed in db.delete()");
            if (isBeingOpened) {
                dbReadyPromise.then(doDelete);
            } else {
                doDelete();
            }
            function doDelete() {
                db.close();
                var req = indexedDB.deleteDatabase(dbName);
                req.onsuccess = wrap(function () {
                    if (!hasNativeGetDatabaseNames) {
                        globalDatabaseList(function (databaseNames) {
                            var pos = databaseNames.indexOf(dbName);
                            if (pos >= 0) return databaseNames.splice(pos, 1);
                        });
                    }
                    resolve();
                });
                req.onerror = wrap(eventRejectHandler(reject));
                req.onblocked = fireOnBlocked;
            }
        }).uncaught(dbUncaught);
    };

    this.backendDB = function () {
        return idbdb;
    };

    this.isOpen = function () {
        return idbdb !== null;
    };
    this.hasFailed = function () {
        return dbOpenError !== null;
    };
    this.dynamicallyOpened = function () {
        return autoSchema;
    };

    //
    // Properties
    //
    this.name = dbName;

    // db.tables - an array of all Table instances.
    setProp(this, "tables", {
        get: function () {
            /// <returns type="Array" elementType="WriteableTable" />
            return keys(allTables).map(function (name) {
                return allTables[name];
            });
        }
    });

    //
    // Events
    //
    this.on = Events(this, "error", "populate", "blocked", "versionchange", { ready: [promisableChain, nop] });
    this.on.error.subscribe = deprecated("Dexie.on.error", this.on.error.subscribe);
    this.on.error.unsubscribe = deprecated("Dexie.on.error.unsubscribe", this.on.error.unsubscribe);

    this.on.ready.subscribe = override(this.on.ready.subscribe, function (subscribe) {
        return function (subscriber, bSticky) {
            Dexie.vip(function () {
                if (openComplete) {
                    // Database already open. Call subscriber asap.
                    if (!dbOpenError) Promise.resolve().then(subscriber);
                    // bSticky: Also subscribe to future open sucesses (after close / reopen) 
                    if (bSticky) subscribe(subscriber);
                } else {
                    // Database not yet open. Subscribe to it.
                    subscribe(subscriber);
                    // If bSticky is falsy, make sure to unsubscribe subscriber when fired once.
                    if (!bSticky) subscribe(function unsubscribe() {
                        db.on.ready.unsubscribe(subscriber);
                        db.on.ready.unsubscribe(unsubscribe);
                    });
                }
            });
        };
    });

    fakeAutoComplete(function () {
        db.on("populate").fire(db._createTransaction(READWRITE, dbStoreNames, globalSchema));
        db.on("error").fire(new Error());
    });

    this.transaction = function (mode, tableInstances, scopeFunc) {
        /// <summary>
        ///
        /// </summary>
        /// <param name="mode" type="String">"r" for readonly, or "rw" for readwrite</param>
        /// <param name="tableInstances">Table instance, Array of Table instances, String or String Array of object stores to include in the transaction</param>
        /// <param name="scopeFunc" type="Function">Function to execute with transaction</param>

        // Let table arguments be all arguments between mode and last argument.
        var i = arguments.length;
        if (i < 2) throw new exceptions.InvalidArgument("Too few arguments");
        // Prevent optimzation killer (https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments)
        // and clone arguments except the first one into local var 'args'.
        var args = new Array(i - 1);
        while (--i) {
            args[i - 1] = arguments[i];
        } // Let scopeFunc be the last argument and pop it so that args now only contain the table arguments.
        scopeFunc = args.pop();
        var tables = flatten(args); // Support using array as middle argument, or a mix of arrays and non-arrays.
        var parentTransaction = PSD.trans;
        // Check if parent transactions is bound to this db instance, and if caller wants to reuse it
        if (!parentTransaction || parentTransaction.db !== db || mode.indexOf('!') !== -1) parentTransaction = null;
        var onlyIfCompatible = mode.indexOf('?') !== -1;
        mode = mode.replace('!', '').replace('?', ''); // Ok. Will change arguments[0] as well but we wont touch arguments henceforth.

        try {
            //
            // Get storeNames from arguments. Either through given table instances, or through given table names.
            //
            var storeNames = tables.map(function (table) {
                var storeName = table instanceof Table ? table.name : table;
                if (typeof storeName !== 'string') throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
                return storeName;
            });

            //
            // Resolve mode. Allow shortcuts "r" and "rw".
            //
            if (mode == "r" || mode == READONLY) mode = READONLY;else if (mode == "rw" || mode == READWRITE) mode = READWRITE;else throw new exceptions.InvalidArgument("Invalid transaction mode: " + mode);

            if (parentTransaction) {
                // Basic checks
                if (parentTransaction.mode === READONLY && mode === READWRITE) {
                    if (onlyIfCompatible) {
                        // Spawn new transaction instead.
                        parentTransaction = null;
                    } else throw new exceptions.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
                }
                if (parentTransaction) {
                    storeNames.forEach(function (storeName) {
                        if (parentTransaction && parentTransaction.storeNames.indexOf(storeName) === -1) {
                            if (onlyIfCompatible) {
                                // Spawn new transaction instead.
                                parentTransaction = null;
                            } else throw new exceptions.SubTransaction("Table " + storeName + " not included in parent transaction.");
                        }
                    });
                }
            }
        } catch (e) {
            return parentTransaction ? parentTransaction._promise(null, function (_, reject) {
                reject(e);
            }) : rejection(e, dbUncaught);
        }
        // If this is a sub-transaction, lock the parent and then launch the sub-transaction.
        return parentTransaction ? parentTransaction._promise(mode, enterTransactionScope, "lock") : db._whenReady(enterTransactionScope);

        function enterTransactionScope(resolve) {
            var parentPSD = PSD;
            resolve(Promise.resolve().then(function () {
                return newScope(function () {
                    // Keep a pointer to last non-transactional PSD to use if someone calls Dexie.ignoreTransaction().
                    PSD.transless = PSD.transless || parentPSD;
                    // Our transaction.
                    //return new Promise((resolve, reject) => {
                    var trans = db._createTransaction(mode, storeNames, globalSchema, parentTransaction);
                    // Let the transaction instance be part of a Promise-specific data (PSD) value.
                    PSD.trans = trans;

                    if (parentTransaction) {
                        // Emulate transaction commit awareness for inner transaction (must 'commit' when the inner transaction has no more operations ongoing)
                        trans.idbtrans = parentTransaction.idbtrans;
                    } else {
                        trans.create(); // Create the backend transaction so that complete() or error() will trigger even if no operation is made upon it.
                    }

                    // Provide arguments to the scope function (for backward compatibility)
                    var tableArgs = storeNames.map(function (name) {
                        return allTables[name];
                    });
                    tableArgs.push(trans);

                    var returnValue;
                    return Promise.follow(function () {
                        // Finally, call the scope function with our table and transaction arguments.
                        returnValue = scopeFunc.apply(trans, tableArgs); // NOTE: returnValue is used in trans.on.complete() not as a returnValue to this func.
                        if (returnValue) {
                            if (typeof returnValue.next === 'function' && typeof returnValue.throw === 'function') {
                                // scopeFunc returned an iterator with throw-support. Handle yield as await.
                                returnValue = awaitIterator(returnValue);
                            } else if (typeof returnValue.then === 'function' && !hasOwn(returnValue, '_PSD')) {
                                throw new exceptions.IncompatiblePromise("Incompatible Promise returned from transaction scope (read more at http://tinyurl.com/znyqjqc). Transaction scope: " + scopeFunc.toString());
                            }
                        }
                    }).uncaught(dbUncaught).then(function () {
                        if (parentTransaction) trans._resolve(); // sub transactions don't react to idbtrans.oncomplete. We must trigger a acompletion.
                        return trans._completion; // Even if WE believe everything is fine. Await IDBTransaction's oncomplete or onerror as well.
                    }).then(function () {
                        return returnValue;
                    }).catch(function (e) {
                        //reject(e);
                        trans._reject(e); // Yes, above then-handler were maybe not called because of an unhandled rejection in scopeFunc!
                        return rejection(e);
                    });
                    //});
                });
            }));
        }
    };

    this.table = function (tableName) {
        /// <returns type="WriteableTable"></returns>
        if (fake && autoSchema) return new WriteableTable(tableName);
        if (!hasOwn(allTables, tableName)) {
            throw new exceptions.InvalidTable('Table ' + tableName + ' does not exist');
        }
        return allTables[tableName];
    };

    //
    //
    //
    // Table Class
    //
    //
    //
    function Table(name, tableSchema, collClass) {
        /// <param name="name" type="String"></param>
        this.name = name;
        this.schema = tableSchema;
        this.hook = allTables[name] ? allTables[name].hook : Events(null, {
            "creating": [hookCreatingChain, nop],
            "reading": [pureFunctionChain, mirror],
            "updating": [hookUpdatingChain, nop],
            "deleting": [hookDeletingChain, nop]
        });
        this._collClass = collClass || Collection;
    }

    props(Table.prototype, {

        //
        // Table Protected Methods
        //

        _trans: function getTransaction(mode, fn, writeLocked) {
            var trans = PSD.trans;
            return trans && trans.db === db ? trans._promise(mode, fn, writeLocked) : tempTransaction(mode, [this.name], fn);
        },
        _idbstore: function getIDBObjectStore(mode, fn, writeLocked) {
            if (fake) return new Promise(fn); // Simplify the work for Intellisense/Code completion.
            var trans = PSD.trans,
                tableName = this.name;
            function supplyIdbStore(resolve, reject, trans) {
                fn(resolve, reject, trans.idbtrans.objectStore(tableName), trans);
            }
            return trans && trans.db === db ? trans._promise(mode, supplyIdbStore, writeLocked) : tempTransaction(mode, [this.name], supplyIdbStore);
        },

        //
        // Table Public Methods
        //
        get: function (key, cb) {
            var self = this;
            return this._idbstore(READONLY, function (resolve, reject, idbstore) {
                fake && resolve(self.schema.instanceTemplate);
                var req = idbstore.get(key);
                req.onerror = eventRejectHandler(reject);
                req.onsuccess = wrap(function () {
                    resolve(self.hook.reading.fire(req.result));
                }, reject);
            }).then(cb);
        },
        where: function (indexName) {
            return new WhereClause(this, indexName);
        },
        count: function (cb) {
            return this.toCollection().count(cb);
        },
        offset: function (offset) {
            return this.toCollection().offset(offset);
        },
        limit: function (numRows) {
            return this.toCollection().limit(numRows);
        },
        reverse: function () {
            return this.toCollection().reverse();
        },
        filter: function (filterFunction) {
            return this.toCollection().and(filterFunction);
        },
        each: function (fn) {
            return this.toCollection().each(fn);
        },
        toArray: function (cb) {
            return this.toCollection().toArray(cb);
        },
        orderBy: function (index) {
            return new this._collClass(new WhereClause(this, index));
        },

        toCollection: function () {
            return new this._collClass(new WhereClause(this));
        },

        mapToClass: function (constructor, structure) {
            /// <summary>
            ///     Map table to a javascript constructor function. Objects returned from the database will be instances of this class, making
            ///     it possible to the instanceOf operator as well as extending the class using constructor.prototype.method = function(){...}.
            /// </summary>
            /// <param name="constructor">Constructor function representing the class.</param>
            /// <param name="structure" optional="true">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
            /// know what type each member has. Example: {name: String, emailAddresses: [String], password}</param>
            this.schema.mappedClass = constructor;
            var instanceTemplate = Object.create(constructor.prototype);
            if (structure) {
                // structure and instanceTemplate is for IDE code competion only while constructor.prototype is for actual inheritance.
                applyStructure(instanceTemplate, structure);
            }
            this.schema.instanceTemplate = instanceTemplate;

            // Now, subscribe to the when("reading") event to make all objects that come out from this table inherit from given class
            // no matter which method to use for reading (Table.get() or Table.where(...)... )
            var readHook = function (obj) {
                if (!obj) return obj; // No valid object. (Value is null). Return as is.
                // Create a new object that derives from constructor:
                var res = Object.create(constructor.prototype);
                // Clone members:
                for (var m in obj) {
                    if (hasOwn(obj, m)) try {
                        res[m] = obj[m];
                    } catch (_) {}
                }return res;
            };

            if (this.schema.readHook) {
                this.hook.reading.unsubscribe(this.schema.readHook);
            }
            this.schema.readHook = readHook;
            this.hook("reading", readHook);
            return constructor;
        },
        defineClass: function (structure) {
            /// <summary>
            ///     Define all members of the class that represents the table. This will help code completion of when objects are read from the database
            ///     as well as making it possible to extend the prototype of the returned constructor function.
            /// </summary>
            /// <param name="structure">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
            /// know what type each member has. Example: {name: String, emailAddresses: [String], properties: {shoeSize: Number}}</param>
            return this.mapToClass(Dexie.defineClass(structure), structure);
        }
    });

    //
    //
    //
    // WriteableTable Class (extends Table)
    //
    //
    //
    function WriteableTable(name, tableSchema, collClass) {
        Table.call(this, name, tableSchema, collClass || WriteableCollection);
    }

    function BulkErrorHandlerCatchAll(errorList, done, supportHooks) {
        return (supportHooks ? hookedEventRejectHandler : eventRejectHandler)(function (e) {
            errorList.push(e);
            done && done();
        });
    }

    function bulkDelete(idbstore, trans, keysOrTuples, hasDeleteHook, deletingHook) {
        // If hasDeleteHook, keysOrTuples must be an array of tuples: [[key1, value2],[key2,value2],...],
        // else keysOrTuples must be just an array of keys: [key1, key2, ...].
        return new Promise(function (resolve, reject) {
            var len = keysOrTuples.length,
                lastItem = len - 1;
            if (len === 0) return resolve();
            if (!hasDeleteHook) {
                for (var i = 0; i < len; ++i) {
                    var req = idbstore.delete(keysOrTuples[i]);
                    req.onerror = wrap(eventRejectHandler(reject));
                    if (i === lastItem) req.onsuccess = wrap(function () {
                        return resolve();
                    });
                }
            } else {
                var hookCtx,
                    errorHandler = hookedEventRejectHandler(reject),
                    successHandler = hookedEventSuccessHandler(null);
                tryCatch(function () {
                    for (var i = 0; i < len; ++i) {
                        hookCtx = { onsuccess: null, onerror: null };
                        var tuple = keysOrTuples[i];
                        deletingHook.call(hookCtx, tuple[0], tuple[1], trans);
                        var req = idbstore.delete(tuple[0]);
                        req._hookCtx = hookCtx;
                        req.onerror = errorHandler;
                        if (i === lastItem) req.onsuccess = hookedEventSuccessHandler(resolve);else req.onsuccess = successHandler;
                    }
                }, function (err) {
                    hookCtx.onerror && hookCtx.onerror(err);
                    throw err;
                });
            }
        }).uncaught(dbUncaught);
    }

    derive(WriteableTable).from(Table).extend({
        bulkDelete: function (keys$$1) {
            if (this.hook.deleting.fire === nop) {
                return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
                    resolve(bulkDelete(idbstore, trans, keys$$1, false, nop));
                });
            } else {
                return this.where(':id').anyOf(keys$$1).delete().then(function () {}); // Resolve with undefined.
            }
        },
        bulkPut: function (objects, keys$$1) {
            var _this = this;

            return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                if (!idbstore.keyPath && !_this.schema.primKey.auto && !keys$$1) throw new exceptions.InvalidArgument("bulkPut() with non-inbound keys requires keys array in second argument");
                if (idbstore.keyPath && keys$$1) throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
                if (keys$$1 && keys$$1.length !== objects.length) throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
                if (objects.length === 0) return resolve(); // Caller provided empty list.
                var done = function (result) {
                    if (errorList.length === 0) resolve(result);else reject(new BulkError(_this.name + '.bulkPut(): ' + errorList.length + ' of ' + numObjs + ' operations failed', errorList));
                };
                var req,
                    errorList = [],
                    errorHandler,
                    numObjs = objects.length,
                    table = _this;
                if (_this.hook.creating.fire === nop && _this.hook.updating.fire === nop) {
                    //
                    // Standard Bulk (no 'creating' or 'updating' hooks to care about)
                    //
                    errorHandler = BulkErrorHandlerCatchAll(errorList);
                    for (var i = 0, l = objects.length; i < l; ++i) {
                        req = keys$$1 ? idbstore.put(objects[i], keys$$1[i]) : idbstore.put(objects[i]);
                        req.onerror = errorHandler;
                    }
                    // Only need to catch success or error on the last operation
                    // according to the IDB spec.
                    req.onerror = BulkErrorHandlerCatchAll(errorList, done);
                    req.onsuccess = eventSuccessHandler(done);
                } else {
                    var effectiveKeys = keys$$1 || idbstore.keyPath && objects.map(function (o) {
                        return getByKeyPath(o, idbstore.keyPath);
                    });
                    // Generate map of {[key]: object}
                    var objectLookup = effectiveKeys && arrayToObject(effectiveKeys, function (key, i) {
                        return key != null && [key, objects[i]];
                    });
                    var promise = !effectiveKeys ?

                    // Auto-incremented key-less objects only without any keys argument.
                    table.bulkAdd(objects) :

                    // Keys provided. Either as inbound in provided objects, or as a keys argument.
                    // Begin with updating those that exists in DB:
                    table.where(':id').anyOf(effectiveKeys.filter(function (key) {
                        return key != null;
                    })).modify(function () {
                        this.value = objectLookup[this.primKey];
                        objectLookup[this.primKey] = null; // Mark as "don't add this"
                    }).catch(ModifyError, function (e) {
                        errorList = e.failures; // No need to concat here. These are the first errors added.
                    }).then(function () {
                        // Now, let's examine which items didnt exist so we can add them:
                        var objsToAdd = [],
                            keysToAdd = keys$$1 && [];
                        // Iterate backwards. Why? Because if same key was used twice, just add the last one.
                        for (var i = effectiveKeys.length - 1; i >= 0; --i) {
                            var key = effectiveKeys[i];
                            if (key == null || objectLookup[key]) {
                                objsToAdd.push(objects[i]);
                                keys$$1 && keysToAdd.push(key);
                                if (key != null) objectLookup[key] = null; // Mark as "dont add again"
                            }
                        }
                        // The items are in reverse order so reverse them before adding.
                        // Could be important in order to get auto-incremented keys the way the caller
                        // would expect. Could have used unshift instead of push()/reverse(),
                        // but: http://jsperf.com/unshift-vs-reverse
                        objsToAdd.reverse();
                        keys$$1 && keysToAdd.reverse();
                        return table.bulkAdd(objsToAdd, keysToAdd);
                    }).then(function (lastAddedKey) {
                        // Resolve with key of the last object in given arguments to bulkPut():
                        var lastEffectiveKey = effectiveKeys[effectiveKeys.length - 1]; // Key was provided.
                        return lastEffectiveKey != null ? lastEffectiveKey : lastAddedKey;
                    });

                    promise.then(done).catch(BulkError, function (e) {
                        // Concat failure from ModifyError and reject using our 'done' method.
                        errorList = errorList.concat(e.failures);
                        done();
                    }).catch(reject);
                }
            }, "locked"); // If called from transaction scope, lock transaction til all steps are done.
        },
        bulkAdd: function (objects, keys$$1) {
            var self = this,
                creatingHook = this.hook.creating.fire;
            return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
                if (!idbstore.keyPath && !self.schema.primKey.auto && !keys$$1) throw new exceptions.InvalidArgument("bulkAdd() with non-inbound keys requires keys array in second argument");
                if (idbstore.keyPath && keys$$1) throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
                if (keys$$1 && keys$$1.length !== objects.length) throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
                if (objects.length === 0) return resolve(); // Caller provided empty list.
                function done(result) {
                    if (errorList.length === 0) resolve(result);else reject(new BulkError(self.name + '.bulkAdd(): ' + errorList.length + ' of ' + numObjs + ' operations failed', errorList));
                }
                var req,
                    errorList = [],
                    errorHandler,
                    successHandler,
                    numObjs = objects.length;
                if (creatingHook !== nop) {
                    //
                    // There are subscribers to hook('creating')
                    // Must behave as documented.
                    //
                    var keyPath = idbstore.keyPath,
                        hookCtx;
                    errorHandler = BulkErrorHandlerCatchAll(errorList, null, true);
                    successHandler = hookedEventSuccessHandler(null);

                    tryCatch(function () {
                        for (var i = 0, l = objects.length; i < l; ++i) {
                            hookCtx = { onerror: null, onsuccess: null };
                            var key = keys$$1 && keys$$1[i];
                            var obj = objects[i],
                                effectiveKey = keys$$1 ? key : keyPath ? getByKeyPath(obj, keyPath) : undefined,
                                keyToUse = creatingHook.call(hookCtx, effectiveKey, obj, trans);
                            if (effectiveKey == null && keyToUse != null) {
                                if (keyPath) {
                                    obj = deepClone(obj);
                                    setByKeyPath(obj, keyPath, keyToUse);
                                } else {
                                    key = keyToUse;
                                }
                            }
                            req = key != null ? idbstore.add(obj, key) : idbstore.add(obj);
                            req._hookCtx = hookCtx;
                            if (i < l - 1) {
                                req.onerror = errorHandler;
                                if (hookCtx.onsuccess) req.onsuccess = successHandler;
                            }
                        }
                    }, function (err) {
                        hookCtx.onerror && hookCtx.onerror(err);
                        throw err;
                    });

                    req.onerror = BulkErrorHandlerCatchAll(errorList, done, true);
                    req.onsuccess = hookedEventSuccessHandler(done);
                } else {
                    //
                    // Standard Bulk (no 'creating' hook to care about)
                    //
                    errorHandler = BulkErrorHandlerCatchAll(errorList);
                    for (var i = 0, l = objects.length; i < l; ++i) {
                        req = keys$$1 ? idbstore.add(objects[i], keys$$1[i]) : idbstore.add(objects[i]);
                        req.onerror = errorHandler;
                    }
                    // Only need to catch success or error on the last operation
                    // according to the IDB spec.
                    req.onerror = BulkErrorHandlerCatchAll(errorList, done);
                    req.onsuccess = eventSuccessHandler(done);
                }
            });
        },
        add: function (obj, key) {
            /// <summary>
            ///   Add an object to the database. In case an object with same primary key already exists, the object will not be added.
            /// </summary>
            /// <param name="obj" type="Object">A javascript object to insert</param>
            /// <param name="key" optional="true">Primary key</param>
            var creatingHook = this.hook.creating.fire;
            return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
                var hookCtx = { onsuccess: null, onerror: null };
                if (creatingHook !== nop) {
                    var effectiveKey = key != null ? key : idbstore.keyPath ? getByKeyPath(obj, idbstore.keyPath) : undefined;
                    var keyToUse = creatingHook.call(hookCtx, effectiveKey, obj, trans); // Allow subscribers to when("creating") to generate the key.
                    if (effectiveKey == null && keyToUse != null) {
                        // Using "==" and "!=" to check for either null or undefined!
                        if (idbstore.keyPath) setByKeyPath(obj, idbstore.keyPath, keyToUse);else key = keyToUse;
                    }
                }
                try {
                    var req = key != null ? idbstore.add(obj, key) : idbstore.add(obj);
                    req._hookCtx = hookCtx;
                    req.onerror = hookedEventRejectHandler(reject);
                    req.onsuccess = hookedEventSuccessHandler(function (result) {
                        // TODO: Remove these two lines in next major release (2.0?)
                        // It's no good practice to have side effects on provided parameters
                        var keyPath = idbstore.keyPath;
                        if (keyPath) setByKeyPath(obj, keyPath, result);
                        resolve(result);
                    });
                } catch (e) {
                    if (hookCtx.onerror) hookCtx.onerror(e);
                    throw e;
                }
            });
        },

        put: function (obj, key) {
            /// <summary>
            ///   Add an object to the database but in case an object with same primary key alread exists, the existing one will get updated.
            /// </summary>
            /// <param name="obj" type="Object">A javascript object to insert or update</param>
            /// <param name="key" optional="true">Primary key</param>
            var self = this,
                creatingHook = this.hook.creating.fire,
                updatingHook = this.hook.updating.fire;
            if (creatingHook !== nop || updatingHook !== nop) {
                //
                // People listens to when("creating") or when("updating") events!
                // We must know whether the put operation results in an CREATE or UPDATE.
                //
                return this._trans(READWRITE, function (resolve, reject, trans) {
                    // Since key is optional, make sure we get it from obj if not provided
                    var effectiveKey = key !== undefined ? key : self.schema.primKey.keyPath && getByKeyPath(obj, self.schema.primKey.keyPath);
                    if (effectiveKey == null) {
                        // "== null" means checking for either null or undefined.
                        // No primary key. Must use add().
                        self.add(obj).then(resolve, reject);
                    } else {
                        // Primary key exist. Lock transaction and try modifying existing. If nothing modified, call add().
                        trans._lock(); // Needed because operation is splitted into modify() and add().
                        // clone obj before this async call. If caller modifies obj the line after put(), the IDB spec requires that it should not affect operation.
                        obj = deepClone(obj);
                        self.where(":id").equals(effectiveKey).modify(function () {
                            // Replace extisting value with our object
                            // CRUD event firing handled in WriteableCollection.modify()
                            this.value = obj;
                        }).then(function (count) {
                            if (count === 0) {
                                // Object's key was not found. Add the object instead.
                                // CRUD event firing will be done in add()
                                return self.add(obj, key); // Resolving with another Promise. Returned Promise will then resolve with the new key.
                            } else {
                                return effectiveKey; // Resolve with the provided key.
                            }
                        }).finally(function () {
                            trans._unlock();
                        }).then(resolve, reject);
                    }
                });
            } else {
                // Use the standard IDB put() method.
                return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                    var req = key !== undefined ? idbstore.put(obj, key) : idbstore.put(obj);
                    req.onerror = eventRejectHandler(reject);
                    req.onsuccess = function (ev) {
                        var keyPath = idbstore.keyPath;
                        if (keyPath) setByKeyPath(obj, keyPath, ev.target.result);
                        resolve(req.result);
                    };
                });
            }
        },

        'delete': function (key) {
            /// <param name="key">Primary key of the object to delete</param>
            if (this.hook.deleting.subscribers.length) {
                // People listens to when("deleting") event. Must implement delete using WriteableCollection.delete() that will
                // call the CRUD event. Only WriteableCollection.delete() will know whether an object was actually deleted.
                return this.where(":id").equals(key).delete();
            } else {
                // No one listens. Use standard IDB delete() method.
                return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                    var req = idbstore.delete(key);
                    req.onerror = eventRejectHandler(reject);
                    req.onsuccess = function () {
                        resolve(req.result);
                    };
                });
            }
        },

        clear: function () {
            if (this.hook.deleting.subscribers.length) {
                // People listens to when("deleting") event. Must implement delete using WriteableCollection.delete() that will
                // call the CRUD event. Only WriteableCollection.delete() will knows which objects that are actually deleted.
                return this.toCollection().delete();
            } else {
                return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                    var req = idbstore.clear();
                    req.onerror = eventRejectHandler(reject);
                    req.onsuccess = function () {
                        resolve(req.result);
                    };
                });
            }
        },

        update: function (keyOrObject, modifications) {
            if (typeof modifications !== 'object' || isArray(modifications)) throw new exceptions.InvalidArgument("Modifications must be an object.");
            if (typeof keyOrObject === 'object' && !isArray(keyOrObject)) {
                // object to modify. Also modify given object with the modifications:
                keys(modifications).forEach(function (keyPath) {
                    setByKeyPath(keyOrObject, keyPath, modifications[keyPath]);
                });
                var key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
                if (key === undefined) return rejection(new exceptions.InvalidArgument("Given object does not contain its primary key"), dbUncaught);
                return this.where(":id").equals(key).modify(modifications);
            } else {
                // key to modify
                return this.where(":id").equals(keyOrObject).modify(modifications);
            }
        }
    });

    //
    //
    //
    // Transaction Class
    //
    //
    //
    function Transaction(mode, storeNames, dbschema, parent) {
        var _this2 = this;

        /// <summary>
        ///    Transaction class. Represents a database transaction. All operations on db goes through a Transaction.
        /// </summary>
        /// <param name="mode" type="String">Any of "readwrite" or "readonly"</param>
        /// <param name="storeNames" type="Array">Array of table names to operate on</param>
        this.db = db;
        this.mode = mode;
        this.storeNames = storeNames;
        this.idbtrans = null;
        this.on = Events(this, "complete", "error", "abort");
        this.parent = parent || null;
        this.active = true;
        this._tables = null;
        this._reculock = 0;
        this._blockedFuncs = [];
        this._psd = null;
        this._dbschema = dbschema;
        this._resolve = null;
        this._reject = null;
        this._completion = new Promise(function (resolve, reject) {
            _this2._resolve = resolve;
            _this2._reject = reject;
        }).uncaught(dbUncaught);

        this._completion.then(function () {
            _this2.on.complete.fire();
        }, function (e) {
            _this2.on.error.fire(e);
            _this2.parent ? _this2.parent._reject(e) : _this2.active && _this2.idbtrans && _this2.idbtrans.abort();
            _this2.active = false;
            return rejection(e); // Indicate we actually DO NOT catch this error.
        });
    }

    props(Transaction.prototype, {
        //
        // Transaction Protected Methods (not required by API users, but needed internally and eventually by dexie extensions)
        //
        _lock: function () {
            assert(!PSD.global); // Locking and unlocking reuires to be within a PSD scope.
            // Temporary set all requests into a pending queue if they are called before database is ready.
            ++this._reculock; // Recursive read/write lock pattern using PSD (Promise Specific Data) instead of TLS (Thread Local Storage)
            if (this._reculock === 1 && !PSD.global) PSD.lockOwnerFor = this;
            return this;
        },
        _unlock: function () {
            assert(!PSD.global); // Locking and unlocking reuires to be within a PSD scope.
            if (--this._reculock === 0) {
                if (!PSD.global) PSD.lockOwnerFor = null;
                while (this._blockedFuncs.length > 0 && !this._locked()) {
                    var fnAndPSD = this._blockedFuncs.shift();
                    try {
                        usePSD(fnAndPSD[1], fnAndPSD[0]);
                    } catch (e) {}
                }
            }
            return this;
        },
        _locked: function () {
            // Checks if any write-lock is applied on this transaction.
            // To simplify the Dexie API for extension implementations, we support recursive locks.
            // This is accomplished by using "Promise Specific Data" (PSD).
            // PSD data is bound to a Promise and any child Promise emitted through then() or resolve( new Promise() ).
            // PSD is local to code executing on top of the call stacks of any of any code executed by Promise():
            //         * callback given to the Promise() constructor  (function (resolve, reject){...})
            //         * callbacks given to then()/catch()/finally() methods (function (value){...})
            // If creating a new independant Promise instance from within a Promise call stack, the new Promise will derive the PSD from the call stack of the parent Promise.
            // Derivation is done so that the inner PSD __proto__ points to the outer PSD.
            // PSD.lockOwnerFor will point to current transaction object if the currently executing PSD scope owns the lock.
            return this._reculock && PSD.lockOwnerFor !== this;
        },
        create: function (idbtrans) {
            var _this3 = this;

            assert(!this.idbtrans);
            if (!idbtrans && !idbdb) {
                switch (dbOpenError && dbOpenError.name) {
                    case "DatabaseClosedError":
                        // Errors where it is no difference whether it was caused by the user operation or an earlier call to db.open()
                        throw new exceptions.DatabaseClosed(dbOpenError);
                    case "MissingAPIError":
                        // Errors where it is no difference whether it was caused by the user operation or an earlier call to db.open()
                        throw new exceptions.MissingAPI(dbOpenError.message, dbOpenError);
                    default:
                        // Make it clear that the user operation was not what caused the error - the error had occurred earlier on db.open()!
                        throw new exceptions.OpenFailed(dbOpenError);
                }
            }
            if (!this.active) throw new exceptions.TransactionInactive();
            assert(this._completion._state === null);

            idbtrans = this.idbtrans = idbtrans || idbdb.transaction(safariMultiStoreFix(this.storeNames), this.mode);
            idbtrans.onerror = wrap(function (ev) {
                preventDefault(ev); // Prohibit default bubbling to window.error
                _this3._reject(idbtrans.error);
            });
            idbtrans.onabort = wrap(function (ev) {
                preventDefault(ev);
                _this3.active && _this3._reject(new exceptions.Abort());
                _this3.active = false;
                _this3.on("abort").fire(ev);
            });
            idbtrans.oncomplete = wrap(function () {
                _this3.active = false;
                _this3._resolve();
            });
            return this;
        },
        _promise: function (mode, fn, bWriteLock) {
            var self = this;
            var p = self._locked() ?
            // Read lock always. Transaction is write-locked. Wait for mutex.
            new Promise(function (resolve, reject) {
                self._blockedFuncs.push([function () {
                    self._promise(mode, fn, bWriteLock).then(resolve, reject);
                }, PSD]);
            }) : newScope(function () {
                var p_ = self.active ? new Promise(function (resolve, reject) {
                    if (mode === READWRITE && self.mode !== READWRITE) throw new exceptions.ReadOnly("Transaction is readonly");
                    if (!self.idbtrans && mode) self.create();
                    if (bWriteLock) self._lock(); // Write lock if write operation is requested
                    fn(resolve, reject, self);
                }) : rejection(new exceptions.TransactionInactive());
                if (self.active && bWriteLock) p_.finally(function () {
                    self._unlock();
                });
                return p_;
            });

            p._lib = true;
            return p.uncaught(dbUncaught);
        },

        //
        // Transaction Public Properties and Methods
        //
        abort: function () {
            this.active && this._reject(new exceptions.Abort());
            this.active = false;
        },

        tables: {
            get: deprecated("Transaction.tables", function () {
                return arrayToObject(this.storeNames, function (name) {
                    return [name, allTables[name]];
                });
            }, "Use db.tables()")
        },

        complete: deprecated("Transaction.complete()", function (cb) {
            return this.on("complete", cb);
        }),

        error: deprecated("Transaction.error()", function (cb) {
            return this.on("error", cb);
        }),

        table: deprecated("Transaction.table()", function (name) {
            if (this.storeNames.indexOf(name) === -1) throw new exceptions.InvalidTable("Table " + name + " not in transaction");
            return allTables[name];
        })

    });

    //
    //
    //
    // WhereClause
    //
    //
    //
    function WhereClause(table, index, orCollection) {
        /// <param name="table" type="Table"></param>
        /// <param name="index" type="String" optional="true"></param>
        /// <param name="orCollection" type="Collection" optional="true"></param>
        this._ctx = {
            table: table,
            index: index === ":id" ? null : index,
            collClass: table._collClass,
            or: orCollection
        };
    }

    props(WhereClause.prototype, function () {

        // WhereClause private methods

        function fail(collectionOrWhereClause, err, T) {
            var collection = collectionOrWhereClause instanceof WhereClause ? new collectionOrWhereClause._ctx.collClass(collectionOrWhereClause) : collectionOrWhereClause;

            collection._ctx.error = T ? new T(err) : new TypeError(err);
            return collection;
        }

        function emptyCollection(whereClause) {
            return new whereClause._ctx.collClass(whereClause, function () {
                return IDBKeyRange.only("");
            }).limit(0);
        }

        function upperFactory(dir) {
            return dir === "next" ? function (s) {
                return s.toUpperCase();
            } : function (s) {
                return s.toLowerCase();
            };
        }
        function lowerFactory(dir) {
            return dir === "next" ? function (s) {
                return s.toLowerCase();
            } : function (s) {
                return s.toUpperCase();
            };
        }
        function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp, dir) {
            var length = Math.min(key.length, lowerNeedle.length);
            var llp = -1;
            for (var i = 0; i < length; ++i) {
                var lwrKeyChar = lowerKey[i];
                if (lwrKeyChar !== lowerNeedle[i]) {
                    if (cmp(key[i], upperNeedle[i]) < 0) return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
                    if (cmp(key[i], lowerNeedle[i]) < 0) return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
                    if (llp >= 0) return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
                    return null;
                }
                if (cmp(key[i], lwrKeyChar) < 0) llp = i;
            }
            if (length < lowerNeedle.length && dir === "next") return key + upperNeedle.substr(key.length);
            if (length < key.length && dir === "prev") return key.substr(0, upperNeedle.length);
            return llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1);
        }

        function addIgnoreCaseAlgorithm(whereClause, match, needles, suffix) {
            /// <param name="needles" type="Array" elementType="String"></param>
            var upper,
                lower,
                compare,
                upperNeedles,
                lowerNeedles,
                direction,
                nextKeySuffix,
                needlesLen = needles.length;
            if (!needles.every(function (s) {
                return typeof s === 'string';
            })) {
                return fail(whereClause, STRING_EXPECTED);
            }
            function initDirection(dir) {
                upper = upperFactory(dir);
                lower = lowerFactory(dir);
                compare = dir === "next" ? simpleCompare : simpleCompareReverse;
                var needleBounds = needles.map(function (needle) {
                    return { lower: lower(needle), upper: upper(needle) };
                }).sort(function (a, b) {
                    return compare(a.lower, b.lower);
                });
                upperNeedles = needleBounds.map(function (nb) {
                    return nb.upper;
                });
                lowerNeedles = needleBounds.map(function (nb) {
                    return nb.lower;
                });
                direction = dir;
                nextKeySuffix = dir === "next" ? "" : suffix;
            }
            initDirection("next");

            var c = new whereClause._ctx.collClass(whereClause, function () {
                return IDBKeyRange.bound(upperNeedles[0], lowerNeedles[needlesLen - 1] + suffix);
            });

            c._ondirectionchange = function (direction) {
                // This event onlys occur before filter is called the first time.
                initDirection(direction);
            };

            var firstPossibleNeedle = 0;

            c._addAlgorithm(function (cursor, advance, resolve) {
                /// <param name="cursor" type="IDBCursor"></param>
                /// <param name="advance" type="Function"></param>
                /// <param name="resolve" type="Function"></param>
                var key = cursor.key;
                if (typeof key !== 'string') return false;
                var lowerKey = lower(key);
                if (match(lowerKey, lowerNeedles, firstPossibleNeedle)) {
                    return true;
                } else {
                    var lowestPossibleCasing = null;
                    for (var i = firstPossibleNeedle; i < needlesLen; ++i) {
                        var casing = nextCasing(key, lowerKey, upperNeedles[i], lowerNeedles[i], compare, direction);
                        if (casing === null && lowestPossibleCasing === null) firstPossibleNeedle = i + 1;else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
                            lowestPossibleCasing = casing;
                        }
                    }
                    if (lowestPossibleCasing !== null) {
                        advance(function () {
                            cursor.continue(lowestPossibleCasing + nextKeySuffix);
                        });
                    } else {
                        advance(resolve);
                    }
                    return false;
                }
            });
            return c;
        }

        //
        // WhereClause public methods
        //
        return {
            between: function (lower, upper, includeLower, includeUpper) {
                /// <summary>
                ///     Filter out records whose where-field lays between given lower and upper values. Applies to Strings, Numbers and Dates.
                /// </summary>
                /// <param name="lower"></param>
                /// <param name="upper"></param>
                /// <param name="includeLower" optional="true">Whether items that equals lower should be included. Default true.</param>
                /// <param name="includeUpper" optional="true">Whether items that equals upper should be included. Default false.</param>
                /// <returns type="Collection"></returns>
                includeLower = includeLower !== false; // Default to true
                includeUpper = includeUpper === true; // Default to false
                try {
                    if (cmp(lower, upper) > 0 || cmp(lower, upper) === 0 && (includeLower || includeUpper) && !(includeLower && includeUpper)) return emptyCollection(this); // Workaround for idiotic W3C Specification that DataError must be thrown if lower > upper. The natural result would be to return an empty collection.
                    return new this._ctx.collClass(this, function () {
                        return IDBKeyRange.bound(lower, upper, !includeLower, !includeUpper);
                    });
                } catch (e) {
                    return fail(this, INVALID_KEY_ARGUMENT);
                }
            },
            equals: function (value) {
                return new this._ctx.collClass(this, function () {
                    return IDBKeyRange.only(value);
                });
            },
            above: function (value) {
                return new this._ctx.collClass(this, function () {
                    return IDBKeyRange.lowerBound(value, true);
                });
            },
            aboveOrEqual: function (value) {
                return new this._ctx.collClass(this, function () {
                    return IDBKeyRange.lowerBound(value);
                });
            },
            below: function (value) {
                return new this._ctx.collClass(this, function () {
                    return IDBKeyRange.upperBound(value, true);
                });
            },
            belowOrEqual: function (value) {
                return new this._ctx.collClass(this, function () {
                    return IDBKeyRange.upperBound(value);
                });
            },
            startsWith: function (str) {
                /// <param name="str" type="String"></param>
                if (typeof str !== 'string') return fail(this, STRING_EXPECTED);
                return this.between(str, str + maxString, true, true);
            },
            startsWithIgnoreCase: function (str) {
                /// <param name="str" type="String"></param>
                if (str === "") return this.startsWith(str);
                return addIgnoreCaseAlgorithm(this, function (x, a) {
                    return x.indexOf(a[0]) === 0;
                }, [str], maxString);
            },
            equalsIgnoreCase: function (str) {
                /// <param name="str" type="String"></param>
                return addIgnoreCaseAlgorithm(this, function (x, a) {
                    return x === a[0];
                }, [str], "");
            },
            anyOfIgnoreCase: function () {
                var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
                if (set.length === 0) return emptyCollection(this);
                return addIgnoreCaseAlgorithm(this, function (x, a) {
                    return a.indexOf(x) !== -1;
                }, set, "");
            },
            startsWithAnyOfIgnoreCase: function () {
                var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
                if (set.length === 0) return emptyCollection(this);
                return addIgnoreCaseAlgorithm(this, function (x, a) {
                    return a.some(function (n) {
                        return x.indexOf(n) === 0;
                    });
                }, set, maxString);
            },
            anyOf: function () {
                var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
                var compare = ascending;
                try {
                    set.sort(compare);
                } catch (e) {
                    return fail(this, INVALID_KEY_ARGUMENT);
                }
                if (set.length === 0) return emptyCollection(this);
                var c = new this._ctx.collClass(this, function () {
                    return IDBKeyRange.bound(set[0], set[set.length - 1]);
                });

                c._ondirectionchange = function (direction) {
                    compare = direction === "next" ? ascending : descending;
                    set.sort(compare);
                };
                var i = 0;
                c._addAlgorithm(function (cursor, advance, resolve) {
                    var key = cursor.key;
                    while (compare(key, set[i]) > 0) {
                        // The cursor has passed beyond this key. Check next.
                        ++i;
                        if (i === set.length) {
                            // There is no next. Stop searching.
                            advance(resolve);
                            return false;
                        }
                    }
                    if (compare(key, set[i]) === 0) {
                        // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
                        return true;
                    } else {
                        // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
                        advance(function () {
                            cursor.continue(set[i]);
                        });
                        return false;
                    }
                });
                return c;
            },

            notEqual: function (value) {
                return this.inAnyRange([[-Infinity, value], [value, maxKey]], { includeLowers: false, includeUppers: false });
            },

            noneOf: function () {
                var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
                if (set.length === 0) return new this._ctx.collClass(this); // Return entire collection.
                try {
                    set.sort(ascending);
                } catch (e) {
                    return fail(this, INVALID_KEY_ARGUMENT);
                }
                // Transform ["a","b","c"] to a set of ranges for between/above/below: [[-Infinity,"a"], ["a","b"], ["b","c"], ["c",maxKey]]
                var ranges = set.reduce(function (res, val) {
                    return res ? res.concat([[res[res.length - 1][1], val]]) : [[-Infinity, val]];
                }, null);
                ranges.push([set[set.length - 1], maxKey]);
                return this.inAnyRange(ranges, { includeLowers: false, includeUppers: false });
            },

            /** Filter out values withing given set of ranges.
            * Example, give children and elders a rebate of 50%:
            *
            *   db.friends.where('age').inAnyRange([[0,18],[65,Infinity]]).modify({Rebate: 1/2});
            *
            * @param {(string|number|Date|Array)[][]} ranges
            * @param {{includeLowers: boolean, includeUppers: boolean}} options
            */
            inAnyRange: function (ranges, options) {
                var ctx = this._ctx;
                if (ranges.length === 0) return emptyCollection(this);
                if (!ranges.every(function (range) {
                    return range[0] !== undefined && range[1] !== undefined && ascending(range[0], range[1]) <= 0;
                })) {
                    return fail(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", exceptions.InvalidArgument);
                }
                var includeLowers = !options || options.includeLowers !== false; // Default to true
                var includeUppers = options && options.includeUppers === true; // Default to false

                function addRange(ranges, newRange) {
                    for (var i = 0, l = ranges.length; i < l; ++i) {
                        var range = ranges[i];
                        if (cmp(newRange[0], range[1]) < 0 && cmp(newRange[1], range[0]) > 0) {
                            range[0] = min(range[0], newRange[0]);
                            range[1] = max(range[1], newRange[1]);
                            break;
                        }
                    }
                    if (i === l) ranges.push(newRange);
                    return ranges;
                }

                var sortDirection = ascending;
                function rangeSorter(a, b) {
                    return sortDirection(a[0], b[0]);
                }

                // Join overlapping ranges
                var set;
                try {
                    set = ranges.reduce(addRange, []);
                    set.sort(rangeSorter);
                } catch (ex) {
                    return fail(this, INVALID_KEY_ARGUMENT);
                }

                var i = 0;
                var keyIsBeyondCurrentEntry = includeUppers ? function (key) {
                    return ascending(key, set[i][1]) > 0;
                } : function (key) {
                    return ascending(key, set[i][1]) >= 0;
                };

                var keyIsBeforeCurrentEntry = includeLowers ? function (key) {
                    return descending(key, set[i][0]) > 0;
                } : function (key) {
                    return descending(key, set[i][0]) >= 0;
                };

                function keyWithinCurrentRange(key) {
                    return !keyIsBeyondCurrentEntry(key) && !keyIsBeforeCurrentEntry(key);
                }

                var checkKey = keyIsBeyondCurrentEntry;

                var c = new ctx.collClass(this, function () {
                    return IDBKeyRange.bound(set[0][0], set[set.length - 1][1], !includeLowers, !includeUppers);
                });

                c._ondirectionchange = function (direction) {
                    if (direction === "next") {
                        checkKey = keyIsBeyondCurrentEntry;
                        sortDirection = ascending;
                    } else {
                        checkKey = keyIsBeforeCurrentEntry;
                        sortDirection = descending;
                    }
                    set.sort(rangeSorter);
                };

                c._addAlgorithm(function (cursor, advance, resolve) {
                    var key = cursor.key;
                    while (checkKey(key)) {
                        // The cursor has passed beyond this key. Check next.
                        ++i;
                        if (i === set.length) {
                            // There is no next. Stop searching.
                            advance(resolve);
                            return false;
                        }
                    }
                    if (keyWithinCurrentRange(key)) {
                        // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
                        return true;
                    } else if (cmp(key, set[i][1]) === 0 || cmp(key, set[i][0]) === 0) {
                        // includeUpper or includeLower is false so keyWithinCurrentRange() returns false even though we are at range border.
                        // Continue to next key but don't include this one.
                        return false;
                    } else {
                        // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
                        advance(function () {
                            if (sortDirection === ascending) cursor.continue(set[i][0]);else cursor.continue(set[i][1]);
                        });
                        return false;
                    }
                });
                return c;
            },
            startsWithAnyOf: function () {
                var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);

                if (!set.every(function (s) {
                    return typeof s === 'string';
                })) {
                    return fail(this, "startsWithAnyOf() only works with strings");
                }
                if (set.length === 0) return emptyCollection(this);

                return this.inAnyRange(set.map(function (str) {
                    return [str, str + maxString];
                }));
            }
        };
    });

    //
    //
    //
    // Collection Class
    //
    //
    //
    function Collection(whereClause, keyRangeGenerator) {
        /// <summary>
        ///
        /// </summary>
        /// <param name="whereClause" type="WhereClause">Where clause instance</param>
        /// <param name="keyRangeGenerator" value="function(){ return IDBKeyRange.bound(0,1);}" optional="true"></param>
        var keyRange = null,
            error = null;
        if (keyRangeGenerator) try {
            keyRange = keyRangeGenerator();
        } catch (ex) {
            error = ex;
        }

        var whereCtx = whereClause._ctx,
            table = whereCtx.table;
        this._ctx = {
            table: table,
            index: whereCtx.index,
            isPrimKey: !whereCtx.index || table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name,
            range: keyRange,
            keysOnly: false,
            dir: "next",
            unique: "",
            algorithm: null,
            filter: null,
            replayFilter: null,
            justLimit: true, // True if a replayFilter is just a filter that performs a "limit" operation (or none at all)
            isMatch: null,
            offset: 0,
            limit: Infinity,
            error: error, // If set, any promise must be rejected with this error
            or: whereCtx.or,
            valueMapper: table.hook.reading.fire
        };
    }

    function isPlainKeyRange(ctx, ignoreLimitFilter) {
        return !(ctx.filter || ctx.algorithm || ctx.or) && (ignoreLimitFilter ? ctx.justLimit : !ctx.replayFilter);
    }

    props(Collection.prototype, function () {

        //
        // Collection Private Functions
        //

        function addFilter(ctx, fn) {
            ctx.filter = combine(ctx.filter, fn);
        }

        function addReplayFilter(ctx, factory, isLimitFilter) {
            var curr = ctx.replayFilter;
            ctx.replayFilter = curr ? function () {
                return combine(curr(), factory());
            } : factory;
            ctx.justLimit = isLimitFilter && !curr;
        }

        function addMatchFilter(ctx, fn) {
            ctx.isMatch = combine(ctx.isMatch, fn);
        }

        /** @param ctx {
         *      isPrimKey: boolean,
         *      table: Table,
         *      index: string
         * }
         * @param store IDBObjectStore
         **/
        function getIndexOrStore(ctx, store) {
            if (ctx.isPrimKey) return store;
            var indexSpec = ctx.table.schema.idxByName[ctx.index];
            if (!indexSpec) throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + store.name + " is not indexed");
            return store.index(indexSpec.name);
        }

        /** @param ctx {
         *      isPrimKey: boolean,
         *      table: Table,
         *      index: string,
         *      keysOnly: boolean,
         *      range?: IDBKeyRange,
         *      dir: "next" | "prev"
         * }
         */
        function openCursor(ctx, store) {
            var idxOrStore = getIndexOrStore(ctx, store);
            return ctx.keysOnly && 'openKeyCursor' in idxOrStore ? idxOrStore.openKeyCursor(ctx.range || null, ctx.dir + ctx.unique) : idxOrStore.openCursor(ctx.range || null, ctx.dir + ctx.unique);
        }

        function iter(ctx, fn, resolve, reject, idbstore) {
            var filter = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;
            if (!ctx.or) {
                iterate(openCursor(ctx, idbstore), combine(ctx.algorithm, filter), fn, resolve, reject, !ctx.keysOnly && ctx.valueMapper);
            } else (function () {
                var set = {};
                var resolved = 0;

                function resolveboth() {
                    if (++resolved === 2) resolve(); // Seems like we just support or btwn max 2 expressions, but there are no limit because we do recursion.
                }

                function union(item, cursor, advance) {
                    if (!filter || filter(cursor, advance, resolveboth, reject)) {
                        var key = cursor.primaryKey.toString(); // Converts any Date to String, String to String, Number to String and Array to comma-separated string
                        if (!hasOwn(set, key)) {
                            set[key] = true;
                            fn(item, cursor, advance);
                        }
                    }
                }

                ctx.or._iterate(union, resolveboth, reject, idbstore);
                iterate(openCursor(ctx, idbstore), ctx.algorithm, union, resolveboth, reject, !ctx.keysOnly && ctx.valueMapper);
            })();
        }
        function getInstanceTemplate(ctx) {
            return ctx.table.schema.instanceTemplate;
        }

        return {

            //
            // Collection Protected Functions
            //

            _read: function (fn, cb) {
                var ctx = this._ctx;
                if (ctx.error) return ctx.table._trans(null, function rejector(resolve, reject) {
                    reject(ctx.error);
                });else return ctx.table._idbstore(READONLY, fn).then(cb);
            },
            _write: function (fn) {
                var ctx = this._ctx;
                if (ctx.error) return ctx.table._trans(null, function rejector(resolve, reject) {
                    reject(ctx.error);
                });else return ctx.table._idbstore(READWRITE, fn, "locked"); // When doing write operations on collections, always lock the operation so that upcoming operations gets queued.
            },
            _addAlgorithm: function (fn) {
                var ctx = this._ctx;
                ctx.algorithm = combine(ctx.algorithm, fn);
            },

            _iterate: function (fn, resolve, reject, idbstore) {
                return iter(this._ctx, fn, resolve, reject, idbstore);
            },

            clone: function (props$$1) {
                var rv = Object.create(this.constructor.prototype),
                    ctx = Object.create(this._ctx);
                if (props$$1) extend(ctx, props$$1);
                rv._ctx = ctx;
                return rv;
            },

            raw: function () {
                this._ctx.valueMapper = null;
                return this;
            },

            //
            // Collection Public methods
            //

            each: function (fn) {
                var ctx = this._ctx;

                if (fake) {
                    var item = getInstanceTemplate(ctx),
                        primKeyPath = ctx.table.schema.primKey.keyPath,
                        key = getByKeyPath(item, ctx.index ? ctx.table.schema.idxByName[ctx.index].keyPath : primKeyPath),
                        primaryKey = getByKeyPath(item, primKeyPath);
                    fn(item, { key: key, primaryKey: primaryKey });
                }

                return this._read(function (resolve, reject, idbstore) {
                    iter(ctx, fn, resolve, reject, idbstore);
                });
            },

            count: function (cb) {
                if (fake) return Promise.resolve(0).then(cb);
                var ctx = this._ctx;

                if (isPlainKeyRange(ctx, true)) {
                    // This is a plain key range. We can use the count() method if the index.
                    return this._read(function (resolve, reject, idbstore) {
                        var idx = getIndexOrStore(ctx, idbstore);
                        var req = ctx.range ? idx.count(ctx.range) : idx.count();
                        req.onerror = eventRejectHandler(reject);
                        req.onsuccess = function (e) {
                            resolve(Math.min(e.target.result, ctx.limit));
                        };
                    }, cb);
                } else {
                    // Algorithms, filters or expressions are applied. Need to count manually.
                    var count = 0;
                    return this._read(function (resolve, reject, idbstore) {
                        iter(ctx, function () {
                            ++count;return false;
                        }, function () {
                            resolve(count);
                        }, reject, idbstore);
                    }, cb);
                }
            },

            sortBy: function (keyPath, cb) {
                /// <param name="keyPath" type="String"></param>
                var parts = keyPath.split('.').reverse(),
                    lastPart = parts[0],
                    lastIndex = parts.length - 1;
                function getval(obj, i) {
                    if (i) return getval(obj[parts[i]], i - 1);
                    return obj[lastPart];
                }
                var order = this._ctx.dir === "next" ? 1 : -1;

                function sorter(a, b) {
                    var aVal = getval(a, lastIndex),
                        bVal = getval(b, lastIndex);
                    return aVal < bVal ? -order : aVal > bVal ? order : 0;
                }
                return this.toArray(function (a) {
                    return a.sort(sorter);
                }).then(cb);
            },

            toArray: function (cb) {
                var ctx = this._ctx;
                return this._read(function (resolve, reject, idbstore) {
                    fake && resolve([getInstanceTemplate(ctx)]);
                    if (hasGetAll && ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
                        // Special optimation if we could use IDBObjectStore.getAll() or
                        // IDBKeyRange.getAll():
                        var readingHook = ctx.table.hook.reading.fire;
                        var idxOrStore = getIndexOrStore(ctx, idbstore);
                        var req = ctx.limit < Infinity ? idxOrStore.getAll(ctx.range, ctx.limit) : idxOrStore.getAll(ctx.range);
                        req.onerror = eventRejectHandler(reject);
                        req.onsuccess = readingHook === mirror ? eventSuccessHandler(resolve) : wrap(eventSuccessHandler(function (res) {
                            try {
                                resolve(res.map(readingHook));
                            } catch (e) {
                                reject(e);
                            }
                        }));
                    } else {
                        // Getting array through a cursor.
                        var a = [];
                        iter(ctx, function (item) {
                            a.push(item);
                        }, function arrayComplete() {
                            resolve(a);
                        }, reject, idbstore);
                    }
                }, cb);
            },

            offset: function (offset) {
                var ctx = this._ctx;
                if (offset <= 0) return this;
                ctx.offset += offset; // For count()
                if (isPlainKeyRange(ctx)) {
                    addReplayFilter(ctx, function () {
                        var offsetLeft = offset;
                        return function (cursor, advance) {
                            if (offsetLeft === 0) return true;
                            if (offsetLeft === 1) {
                                --offsetLeft;return false;
                            }
                            advance(function () {
                                cursor.advance(offsetLeft);
                                offsetLeft = 0;
                            });
                            return false;
                        };
                    });
                } else {
                    addReplayFilter(ctx, function () {
                        var offsetLeft = offset;
                        return function () {
                            return --offsetLeft < 0;
                        };
                    });
                }
                return this;
            },

            limit: function (numRows) {
                this._ctx.limit = Math.min(this._ctx.limit, numRows); // For count()
                addReplayFilter(this._ctx, function () {
                    var rowsLeft = numRows;
                    return function (cursor, advance, resolve) {
                        if (--rowsLeft <= 0) advance(resolve); // Stop after this item has been included
                        return rowsLeft >= 0; // If numRows is already below 0, return false because then 0 was passed to numRows initially. Otherwise we wouldnt come here.
                    };
                }, true);
                return this;
            },

            until: function (filterFunction, bIncludeStopEntry) {
                var ctx = this._ctx;
                fake && filterFunction(getInstanceTemplate(ctx));
                addFilter(this._ctx, function (cursor, advance, resolve) {
                    if (filterFunction(cursor.value)) {
                        advance(resolve);
                        return bIncludeStopEntry;
                    } else {
                        return true;
                    }
                });
                return this;
            },

            first: function (cb) {
                return this.limit(1).toArray(function (a) {
                    return a[0];
                }).then(cb);
            },

            last: function (cb) {
                return this.reverse().first(cb);
            },

            filter: function (filterFunction) {
                /// <param name="jsFunctionFilter" type="Function">function(val){return true/false}</param>
                fake && filterFunction(getInstanceTemplate(this._ctx));
                addFilter(this._ctx, function (cursor) {
                    return filterFunction(cursor.value);
                });
                // match filters not used in Dexie.js but can be used by 3rd part libraries to test a
                // collection for a match without querying DB. Used by Dexie.Observable.
                addMatchFilter(this._ctx, filterFunction);
                return this;
            },

            and: function (filterFunction) {
                return this.filter(filterFunction);
            },

            or: function (indexName) {
                return new WhereClause(this._ctx.table, indexName, this);
            },

            reverse: function () {
                this._ctx.dir = this._ctx.dir === "prev" ? "next" : "prev";
                if (this._ondirectionchange) this._ondirectionchange(this._ctx.dir);
                return this;
            },

            desc: function () {
                return this.reverse();
            },

            eachKey: function (cb) {
                var ctx = this._ctx;
                ctx.keysOnly = !ctx.isMatch;
                return this.each(function (val, cursor) {
                    cb(cursor.key, cursor);
                });
            },

            eachUniqueKey: function (cb) {
                this._ctx.unique = "unique";
                return this.eachKey(cb);
            },

            eachPrimaryKey: function (cb) {
                var ctx = this._ctx;
                ctx.keysOnly = !ctx.isMatch;
                return this.each(function (val, cursor) {
                    cb(cursor.primaryKey, cursor);
                });
            },

            keys: function (cb) {
                var ctx = this._ctx;
                ctx.keysOnly = !ctx.isMatch;
                var a = [];
                return this.each(function (item, cursor) {
                    a.push(cursor.key);
                }).then(function () {
                    return a;
                }).then(cb);
            },

            primaryKeys: function (cb) {
                var ctx = this._ctx;
                if (hasGetAll && ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
                    // Special optimation if we could use IDBObjectStore.getAllKeys() or
                    // IDBKeyRange.getAllKeys():
                    return this._read(function (resolve, reject, idbstore) {
                        var idxOrStore = getIndexOrStore(ctx, idbstore);
                        var req = ctx.limit < Infinity ? idxOrStore.getAllKeys(ctx.range, ctx.limit) : idxOrStore.getAllKeys(ctx.range);
                        req.onerror = eventRejectHandler(reject);
                        req.onsuccess = eventSuccessHandler(resolve);
                    }).then(cb);
                }
                ctx.keysOnly = !ctx.isMatch;
                var a = [];
                return this.each(function (item, cursor) {
                    a.push(cursor.primaryKey);
                }).then(function () {
                    return a;
                }).then(cb);
            },

            uniqueKeys: function (cb) {
                this._ctx.unique = "unique";
                return this.keys(cb);
            },

            firstKey: function (cb) {
                return this.limit(1).keys(function (a) {
                    return a[0];
                }).then(cb);
            },

            lastKey: function (cb) {
                return this.reverse().firstKey(cb);
            },

            distinct: function () {
                var ctx = this._ctx,
                    idx = ctx.index && ctx.table.schema.idxByName[ctx.index];
                if (!idx || !idx.multi) return this; // distinct() only makes differencies on multiEntry indexes.
                var set = {};
                addFilter(this._ctx, function (cursor) {
                    var strKey = cursor.primaryKey.toString(); // Converts any Date to String, String to String, Number to String and Array to comma-separated string
                    var found = hasOwn(set, strKey);
                    set[strKey] = true;
                    return !found;
                });
                return this;
            }
        };
    });

    //
    //
    // WriteableCollection Class
    //
    //
    function WriteableCollection() {
        Collection.apply(this, arguments);
    }

    derive(WriteableCollection).from(Collection).extend({

        //
        // WriteableCollection Public Methods
        //

        modify: function (changes) {
            var self = this,
                ctx = this._ctx,
                hook = ctx.table.hook,
                updatingHook = hook.updating.fire,
                deletingHook = hook.deleting.fire;

            fake && typeof changes === 'function' && changes.call({ value: ctx.table.schema.instanceTemplate }, ctx.table.schema.instanceTemplate);

            return this._write(function (resolve, reject, idbstore, trans) {
                var modifyer;
                if (typeof changes === 'function') {
                    // Changes is a function that may update, add or delete propterties or even require a deletion the object itself (delete this.item)
                    if (updatingHook === nop && deletingHook === nop) {
                        // Noone cares about what is being changed. Just let the modifier function be the given argument as is.
                        modifyer = changes;
                    } else {
                        // People want to know exactly what is being modified or deleted.
                        // Let modifyer be a proxy function that finds out what changes the caller is actually doing
                        // and call the hooks accordingly!
                        modifyer = function (item) {
                            var origItem = deepClone(item); // Clone the item first so we can compare laters.
                            if (changes.call(this, item, this) === false) return false; // Call the real modifyer function (If it returns false explicitely, it means it dont want to modify anyting on this object)
                            if (!hasOwn(this, "value")) {
                                // The real modifyer function requests a deletion of the object. Inform the deletingHook that a deletion is taking place.
                                deletingHook.call(this, this.primKey, item, trans);
                            } else {
                                // No deletion. Check what was changed
                                var objectDiff = getObjectDiff(origItem, this.value);
                                var additionalChanges = updatingHook.call(this, objectDiff, this.primKey, origItem, trans);
                                if (additionalChanges) {
                                    // Hook want to apply additional modifications. Make sure to fullfill the will of the hook.
                                    item = this.value;
                                    keys(additionalChanges).forEach(function (keyPath) {
                                        setByKeyPath(item, keyPath, additionalChanges[keyPath]); // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
                                    });
                                }
                            }
                        };
                    }
                } else if (updatingHook === nop) {
                    // changes is a set of {keyPath: value} and no one is listening to the updating hook.
                    var keyPaths = keys(changes);
                    var numKeys = keyPaths.length;
                    modifyer = function (item) {
                        var anythingModified = false;
                        for (var i = 0; i < numKeys; ++i) {
                            var keyPath = keyPaths[i],
                                val = changes[keyPath];
                            if (getByKeyPath(item, keyPath) !== val) {
                                setByKeyPath(item, keyPath, val); // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
                                anythingModified = true;
                            }
                        }
                        return anythingModified;
                    };
                } else {
                    // changes is a set of {keyPath: value} and people are listening to the updating hook so we need to call it and
                    // allow it to add additional modifications to make.
                    var origChanges = changes;
                    changes = shallowClone(origChanges); // Let's work with a clone of the changes keyPath/value set so that we can restore it in case a hook extends it.
                    modifyer = function (item) {
                        var anythingModified = false;
                        var additionalChanges = updatingHook.call(this, changes, this.primKey, deepClone(item), trans);
                        if (additionalChanges) extend(changes, additionalChanges);
                        keys(changes).forEach(function (keyPath) {
                            var val = changes[keyPath];
                            if (getByKeyPath(item, keyPath) !== val) {
                                setByKeyPath(item, keyPath, val);
                                anythingModified = true;
                            }
                        });
                        if (additionalChanges) changes = shallowClone(origChanges); // Restore original changes for next iteration
                        return anythingModified;
                    };
                }

                var count = 0;
                var successCount = 0;
                var iterationComplete = false;
                var failures = [];
                var failKeys = [];
                var currentKey = null;

                function modifyItem(item, cursor) {
                    currentKey = cursor.primaryKey;
                    var thisContext = {
                        primKey: cursor.primaryKey,
                        value: item,
                        onsuccess: null,
                        onerror: null
                    };

                    function onerror(e) {
                        failures.push(e);
                        failKeys.push(thisContext.primKey);
                        checkFinished();
                        return true; // Catch these errors and let a final rejection decide whether or not to abort entire transaction
                    }

                    if (modifyer.call(thisContext, item, thisContext) !== false) {
                        // If a callback explicitely returns false, do not perform the update!
                        var bDelete = !hasOwn(thisContext, "value");
                        ++count;
                        tryCatch(function () {
                            var req = bDelete ? cursor.delete() : cursor.update(thisContext.value);
                            req._hookCtx = thisContext;
                            req.onerror = hookedEventRejectHandler(onerror);
                            req.onsuccess = hookedEventSuccessHandler(function () {
                                ++successCount;
                                checkFinished();
                            });
                        }, onerror);
                    } else if (thisContext.onsuccess) {
                        // Hook will expect either onerror or onsuccess to always be called!
                        thisContext.onsuccess(thisContext.value);
                    }
                }

                function doReject(e) {
                    if (e) {
                        failures.push(e);
                        failKeys.push(currentKey);
                    }
                    return reject(new ModifyError("Error modifying one or more objects", failures, successCount, failKeys));
                }

                function checkFinished() {
                    if (iterationComplete && successCount + failures.length === count) {
                        if (failures.length > 0) doReject();else resolve(successCount);
                    }
                }
                self.clone().raw()._iterate(modifyItem, function () {
                    iterationComplete = true;
                    checkFinished();
                }, doReject, idbstore);
            });
        },

        'delete': function () {
            var _this4 = this;

            var ctx = this._ctx,
                range = ctx.range,
                deletingHook = ctx.table.hook.deleting.fire,
                hasDeleteHook = deletingHook !== nop;
            if (!hasDeleteHook && isPlainKeyRange(ctx) && (ctx.isPrimKey && !hangsOnDeleteLargeKeyRange || !range)) // if no range, we'll use clear().
                {
                    // May use IDBObjectStore.delete(IDBKeyRange) in this case (Issue #208)
                    // For chromium, this is the way most optimized version.
                    // For IE/Edge, this could hang the indexedDB engine and make operating system instable
                    // (https://gist.github.com/dfahlander/5a39328f029de18222cf2125d56c38f7)
                    return this._write(function (resolve, reject, idbstore) {
                        // Our API contract is to return a count of deleted items, so we have to count() before delete().
                        var onerror = eventRejectHandler(reject),
                            countReq = range ? idbstore.count(range) : idbstore.count();
                        countReq.onerror = onerror;
                        countReq.onsuccess = function () {
                            var count = countReq.result;
                            tryCatch(function () {
                                var delReq = range ? idbstore.delete(range) : idbstore.clear();
                                delReq.onerror = onerror;
                                delReq.onsuccess = function () {
                                    return resolve(count);
                                };
                            }, function (err) {
                                return reject(err);
                            });
                        };
                    });
                }

            // Default version to use when collection is not a vanilla IDBKeyRange on the primary key.
            // Divide into chunks to not starve RAM.
            // If has delete hook, we will have to collect not just keys but also objects, so it will use
            // more memory and need lower chunk size.
            var CHUNKSIZE = hasDeleteHook ? 2000 : 10000;

            return this._write(function (resolve, reject, idbstore, trans) {
                var totalCount = 0;
                // Clone collection and change its table and set a limit of CHUNKSIZE on the cloned Collection instance.
                var collection = _this4.clone({
                    keysOnly: !ctx.isMatch && !hasDeleteHook }) // load just keys (unless filter() or and() or deleteHook has subscribers)
                .distinct() // In case multiEntry is used, never delete same key twice because resulting count
                // would become larger than actual delete count.
                .limit(CHUNKSIZE).raw(); // Don't filter through reading-hooks (like mapped classes etc)

                var keysOrTuples = [];

                // We're gonna do things on as many chunks that are needed.
                // Use recursion of nextChunk function:
                var nextChunk = function () {
                    return collection.each(hasDeleteHook ? function (val, cursor) {
                        // Somebody subscribes to hook('deleting'). Collect all primary keys and their values,
                        // so that the hook can be called with its values in bulkDelete().
                        keysOrTuples.push([cursor.primaryKey, cursor.value]);
                    } : function (val, cursor) {
                        // No one subscribes to hook('deleting'). Collect only primary keys:
                        keysOrTuples.push(cursor.primaryKey);
                    }).then(function () {
                        // Chromium deletes faster when doing it in sort order.
                        hasDeleteHook ? keysOrTuples.sort(function (a, b) {
                            return ascending(a[0], b[0]);
                        }) : keysOrTuples.sort(ascending);
                        return bulkDelete(idbstore, trans, keysOrTuples, hasDeleteHook, deletingHook);
                    }).then(function () {
                        var count = keysOrTuples.length;
                        totalCount += count;
                        keysOrTuples = [];
                        return count < CHUNKSIZE ? totalCount : nextChunk();
                    });
                };

                resolve(nextChunk());
            });
        }
    });

    //
    //
    //
    // ------------------------- Help functions ---------------------------
    //
    //
    //

    function lowerVersionFirst(a, b) {
        return a._cfg.version - b._cfg.version;
    }

    function setApiOnPlace(objs, tableNames, mode, dbschema) {
        tableNames.forEach(function (tableName) {
            var tableInstance = db._tableFactory(mode, dbschema[tableName]);
            objs.forEach(function (obj) {
                tableName in obj || (obj[tableName] = tableInstance);
            });
        });
    }

    function removeTablesApi(objs) {
        objs.forEach(function (obj) {
            for (var key in obj) {
                if (obj[key] instanceof Table) delete obj[key];
            }
        });
    }

    function iterate(req, filter, fn, resolve, reject, valueMapper) {

        // Apply valueMapper (hook('reading') or mappped class)
        var mappedFn = valueMapper ? function (x, c, a) {
            return fn(valueMapper(x), c, a);
        } : fn;
        // Wrap fn with PSD and microtick stuff from Promise.
        var wrappedFn = wrap(mappedFn, reject);

        if (!req.onerror) req.onerror = eventRejectHandler(reject);
        if (filter) {
            req.onsuccess = trycatcher(function filter_record() {
                var cursor = req.result;
                if (cursor) {
                    var c = function () {
                        cursor.continue();
                    };
                    if (filter(cursor, function (advancer) {
                        c = advancer;
                    }, resolve, reject)) wrappedFn(cursor.value, cursor, function (advancer) {
                        c = advancer;
                    });
                    c();
                } else {
                    resolve();
                }
            }, reject);
        } else {
            req.onsuccess = trycatcher(function filter_record() {
                var cursor = req.result;
                if (cursor) {
                    var c = function () {
                        cursor.continue();
                    };
                    wrappedFn(cursor.value, cursor, function (advancer) {
                        c = advancer;
                    });
                    c();
                } else {
                    resolve();
                }
            }, reject);
        }
    }

    function parseIndexSyntax(indexes) {
        /// <param name="indexes" type="String"></param>
        /// <returns type="Array" elementType="IndexSpec"></returns>
        var rv = [];
        indexes.split(',').forEach(function (index) {
            index = index.trim();
            var name = index.replace(/([&*]|\+\+)/g, ""); // Remove "&", "++" and "*"
            // Let keyPath of "[a+b]" be ["a","b"]:
            var keyPath = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split('+') : name;

            rv.push(new IndexSpec(name, keyPath || null, /\&/.test(index), /\*/.test(index), /\+\+/.test(index), isArray(keyPath), /\./.test(index)));
        });
        return rv;
    }

    function cmp(key1, key2) {
        return indexedDB.cmp(key1, key2);
    }

    function min(a, b) {
        return cmp(a, b) < 0 ? a : b;
    }

    function max(a, b) {
        return cmp(a, b) > 0 ? a : b;
    }

    function ascending(a, b) {
        return indexedDB.cmp(a, b);
    }

    function descending(a, b) {
        return indexedDB.cmp(b, a);
    }

    function simpleCompare(a, b) {
        return a < b ? -1 : a === b ? 0 : 1;
    }

    function simpleCompareReverse(a, b) {
        return a > b ? -1 : a === b ? 0 : 1;
    }

    function combine(filter1, filter2) {
        return filter1 ? filter2 ? function () {
            return filter1.apply(this, arguments) && filter2.apply(this, arguments);
        } : filter1 : filter2;
    }

    function readGlobalSchema() {
        db.verno = idbdb.version / 10;
        db._dbSchema = globalSchema = {};
        dbStoreNames = slice(idbdb.objectStoreNames, 0);
        if (dbStoreNames.length === 0) return; // Database contains no stores.
        var trans = idbdb.transaction(safariMultiStoreFix(dbStoreNames), 'readonly');
        dbStoreNames.forEach(function (storeName) {
            var store = trans.objectStore(storeName),
                keyPath = store.keyPath,
                dotted = keyPath && typeof keyPath === 'string' && keyPath.indexOf('.') !== -1;
            var primKey = new IndexSpec(keyPath, keyPath || "", false, false, !!store.autoIncrement, keyPath && typeof keyPath !== 'string', dotted);
            var indexes = [];
            for (var j = 0; j < store.indexNames.length; ++j) {
                var idbindex = store.index(store.indexNames[j]);
                keyPath = idbindex.keyPath;
                dotted = keyPath && typeof keyPath === 'string' && keyPath.indexOf('.') !== -1;
                var index = new IndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== 'string', dotted);
                indexes.push(index);
            }
            globalSchema[storeName] = new TableSchema(storeName, primKey, indexes, {});
        });
        setApiOnPlace([allTables, Transaction.prototype], keys(globalSchema), READWRITE, globalSchema);
    }

    function adjustToExistingIndexNames(schema, idbtrans) {
        /// <summary>
        /// Issue #30 Problem with existing db - adjust to existing index names when migrating from non-dexie db
        /// </summary>
        /// <param name="schema" type="Object">Map between name and TableSchema</param>
        /// <param name="idbtrans" type="IDBTransaction"></param>
        var storeNames = idbtrans.db.objectStoreNames;
        for (var i = 0; i < storeNames.length; ++i) {
            var storeName = storeNames[i];
            var store = idbtrans.objectStore(storeName);
            hasGetAll = 'getAll' in store;
            for (var j = 0; j < store.indexNames.length; ++j) {
                var indexName = store.indexNames[j];
                var keyPath = store.index(indexName).keyPath;
                var dexieName = typeof keyPath === 'string' ? keyPath : "[" + slice(keyPath).join('+') + "]";
                if (schema[storeName]) {
                    var indexSpec = schema[storeName].idxByName[dexieName];
                    if (indexSpec) indexSpec.name = indexName;
                }
            }
        }
    }

    function fireOnBlocked(ev) {
        db.on("blocked").fire(ev);
        // Workaround (not fully*) for missing "versionchange" event in IE,Edge and Safari:
        connections.filter(function (c) {
            return c.name === db.name && c !== db && !c._vcFired;
        }).map(function (c) {
            return c.on("versionchange").fire(ev);
        });
    }

    extend(this, {
        Collection: Collection,
        Table: Table,
        Transaction: Transaction,
        Version: Version,
        WhereClause: WhereClause,
        WriteableCollection: WriteableCollection,
        WriteableTable: WriteableTable
    });

    init();

    addons.forEach(function (fn) {
        fn(db);
    });
}

var fakeAutoComplete = function () {}; // Will never be changed. We just fake for the IDE that we change it (see doFakeAutoComplete())
var fake = false; // Will never be changed. We just fake for the IDE that we change it (see doFakeAutoComplete())

function parseType(type) {
    if (typeof type === 'function') {
        return new type();
    } else if (isArray(type)) {
        return [parseType(type[0])];
    } else if (type && typeof type === 'object') {
        var rv = {};
        applyStructure(rv, type);
        return rv;
    } else {
        return type;
    }
}

function applyStructure(obj, structure) {
    keys(structure).forEach(function (member) {
        var value = parseType(structure[member]);
        obj[member] = value;
    });
    return obj;
}

function eventSuccessHandler(done) {
    return function (ev) {
        done(ev.target.result);
    };
}

function hookedEventSuccessHandler(resolve) {
    // wrap() is needed when calling hooks because the rare scenario of:
    //  * hook does a db operation that fails immediately (IDB throws exception)
    //    For calling db operations on correct transaction, wrap makes sure to set PSD correctly.
    //    wrap() will also execute in a virtual tick.
    //  * If not wrapped in a virtual tick, direct exception will launch a new physical tick.
    //  * If this was the last event in the bulk, the promise will resolve after a physical tick
    //    and the transaction will have committed already.
    // If no hook, the virtual tick will be executed in the reject()/resolve of the final promise,
    // because it is always marked with _lib = true when created using Transaction._promise().
    return wrap(function (event) {
        var req = event.target,
            result = req.result,
            ctx = req._hookCtx,
            // Contains the hook error handler. Put here instead of closure to boost performance.
        hookSuccessHandler = ctx && ctx.onsuccess;
        hookSuccessHandler && hookSuccessHandler(result);
        resolve && resolve(result);
    }, resolve);
}

function eventRejectHandler(reject) {
    return function (event) {
        preventDefault(event);
        reject(event.target.error);
        return false;
    };
}

function hookedEventRejectHandler(reject) {
    return wrap(function (event) {
        // See comment on hookedEventSuccessHandler() why wrap() is needed only when supporting hooks.

        var req = event.target,
            err = req.error,
            ctx = req._hookCtx,
            // Contains the hook error handler. Put here instead of closure to boost performance.
        hookErrorHandler = ctx && ctx.onerror;
        hookErrorHandler && hookErrorHandler(err);
        preventDefault(event);
        reject(err);
        return false;
    });
}

function preventDefault(event) {
    if (event.stopPropagation) // IndexedDBShim doesnt support this on Safari 8 and below.
        event.stopPropagation();
    if (event.preventDefault) // IndexedDBShim doesnt support this on Safari 8 and below.
        event.preventDefault();
}

function globalDatabaseList(cb) {
    var val,
        localStorage = Dexie.dependencies.localStorage;
    if (!localStorage) return cb([]); // Envs without localStorage support
    try {
        val = JSON.parse(localStorage.getItem('Dexie.DatabaseNames') || "[]");
    } catch (e) {
        val = [];
    }
    if (cb(val)) {
        localStorage.setItem('Dexie.DatabaseNames', JSON.stringify(val));
    }
}

function awaitIterator(iterator) {
    var callNext = function (result) {
        return iterator.next(result);
    },
        doThrow = function (error) {
        return iterator.throw(error);
    },
        onSuccess = step(callNext),
        onError = step(doThrow);

    function step(getNext) {
        return function (val) {
            var next = getNext(val),
                value = next.value;

            return next.done ? value : !value || typeof value.then !== 'function' ? isArray(value) ? Promise.all(value).then(onSuccess, onError) : onSuccess(value) : value.then(onSuccess, onError);
        };
    }

    return step(callNext)();
}

//
// IndexSpec struct
//
function IndexSpec(name, keyPath, unique, multi, auto, compound, dotted) {
    /// <param name="name" type="String"></param>
    /// <param name="keyPath" type="String"></param>
    /// <param name="unique" type="Boolean"></param>
    /// <param name="multi" type="Boolean"></param>
    /// <param name="auto" type="Boolean"></param>
    /// <param name="compound" type="Boolean"></param>
    /// <param name="dotted" type="Boolean"></param>
    this.name = name;
    this.keyPath = keyPath;
    this.unique = unique;
    this.multi = multi;
    this.auto = auto;
    this.compound = compound;
    this.dotted = dotted;
    var keyPathSrc = typeof keyPath === 'string' ? keyPath : keyPath && '[' + [].join.call(keyPath, '+') + ']';
    this.src = (unique ? '&' : '') + (multi ? '*' : '') + (auto ? "++" : "") + keyPathSrc;
}

//
// TableSchema struct
//
function TableSchema(name, primKey, indexes, instanceTemplate) {
    /// <param name="name" type="String"></param>
    /// <param name="primKey" type="IndexSpec"></param>
    /// <param name="indexes" type="Array" elementType="IndexSpec"></param>
    /// <param name="instanceTemplate" type="Object"></param>
    this.name = name;
    this.primKey = primKey || new IndexSpec();
    this.indexes = indexes || [new IndexSpec()];
    this.instanceTemplate = instanceTemplate;
    this.mappedClass = null;
    this.idxByName = arrayToObject(indexes, function (index) {
        return [index.name, index];
    });
}

// Used in when defining dependencies later...
// (If IndexedDBShim is loaded, prefer it before standard indexedDB)
var idbshim = _global.idbModules && _global.idbModules.shimIndexedDB ? _global.idbModules : {};

function safariMultiStoreFix(storeNames) {
    return storeNames.length === 1 ? storeNames[0] : storeNames;
}

function getNativeGetDatabaseNamesFn(indexedDB) {
    var fn = indexedDB && (indexedDB.getDatabaseNames || indexedDB.webkitGetDatabaseNames);
    return fn && fn.bind(indexedDB);
}

// Export Error classes
props(Dexie, fullNameExceptions); // Dexie.XXXError = class XXXError {...};

//
// Static methods and properties
// 
props(Dexie, {

    //
    // Static delete() method.
    //
    delete: function (databaseName) {
        var db = new Dexie(databaseName),
            promise = db.delete();
        promise.onblocked = function (fn) {
            db.on("blocked", fn);
            return this;
        };
        return promise;
    },

    //
    // Static exists() method.
    //
    exists: function (name) {
        return new Dexie(name).open().then(function (db) {
            db.close();
            return true;
        }).catch(Dexie.NoSuchDatabaseError, function () {
            return false;
        });
    },

    //
    // Static method for retrieving a list of all existing databases at current host.
    //
    getDatabaseNames: function (cb) {
        return new Promise(function (resolve, reject) {
            var getDatabaseNames = getNativeGetDatabaseNamesFn(indexedDB);
            if (getDatabaseNames) {
                // In case getDatabaseNames() becomes standard, let's prepare to support it:
                var req = getDatabaseNames();
                req.onsuccess = function (event) {
                    resolve(slice(event.target.result, 0)); // Converst DOMStringList to Array<String>
                };
                req.onerror = eventRejectHandler(reject);
            } else {
                globalDatabaseList(function (val) {
                    resolve(val);
                    return false;
                });
            }
        }).then(cb);
    },

    defineClass: function (structure) {
        /// <summary>
        ///     Create a javascript constructor based on given template for which properties to expect in the class.
        ///     Any property that is a constructor function will act as a type. So {name: String} will be equal to {name: new String()}.
        /// </summary>
        /// <param name="structure">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
        /// know what type each member has. Example: {name: String, emailAddresses: [String], properties: {shoeSize: Number}}</param>

        // Default constructor able to copy given properties into this object.
        function Class(properties) {
            /// <param name="properties" type="Object" optional="true">Properties to initialize object with.
            /// </param>
            properties ? extend(this, properties) : fake && applyStructure(this, structure);
        }
        return Class;
    },

    applyStructure: applyStructure,

    ignoreTransaction: function (scopeFunc) {
        // In case caller is within a transaction but needs to create a separate transaction.
        // Example of usage:
        //
        // Let's say we have a logger function in our app. Other application-logic should be unaware of the
        // logger function and not need to include the 'logentries' table in all transaction it performs.
        // The logging should always be done in a separate transaction and not be dependant on the current
        // running transaction context. Then you could use Dexie.ignoreTransaction() to run code that starts a new transaction.
        //
        //     Dexie.ignoreTransaction(function() {
        //         db.logentries.add(newLogEntry);
        //     });
        //
        // Unless using Dexie.ignoreTransaction(), the above example would try to reuse the current transaction
        // in current Promise-scope.
        //
        // An alternative to Dexie.ignoreTransaction() would be setImmediate() or setTimeout(). The reason we still provide an
        // API for this because
        //  1) The intention of writing the statement could be unclear if using setImmediate() or setTimeout().
        //  2) setTimeout() would wait unnescessary until firing. This is however not the case with setImmediate().
        //  3) setImmediate() is not supported in the ES standard.
        //  4) You might want to keep other PSD state that was set in a parent PSD, such as PSD.letThrough.
        return PSD.trans ? usePSD(PSD.transless, scopeFunc) : // Use the closest parent that was non-transactional.
        scopeFunc(); // No need to change scope because there is no ongoing transaction.
    },

    vip: function (fn) {
        // To be used by subscribers to the on('ready') event.
        // This will let caller through to access DB even when it is blocked while the db.ready() subscribers are firing.
        // This would have worked automatically if we were certain that the Provider was using Dexie.Promise for all asyncronic operations. The promise PSD
        // from the provider.connect() call would then be derived all the way to when provider would call localDatabase.applyChanges(). But since
        // the provider more likely is using non-promise async APIs or other thenable implementations, we cannot assume that.
        // Note that this method is only useful for on('ready') subscribers that is returning a Promise from the event. If not using vip()
        // the database could deadlock since it wont open until the returned Promise is resolved, and any non-VIPed operation started by
        // the caller will not resolve until database is opened.
        return newScope(function () {
            PSD.letThrough = true; // Make sure we are let through if still blocking db due to onready is firing.
            return fn();
        });
    },

    async: function (generatorFn) {
        return function () {
            try {
                var rv = awaitIterator(generatorFn.apply(this, arguments));
                if (!rv || typeof rv.then !== 'function') return Promise.resolve(rv);
                return rv;
            } catch (e) {
                return rejection(e);
            }
        };
    },

    spawn: function (generatorFn, args, thiz) {
        try {
            var rv = awaitIterator(generatorFn.apply(thiz, args || []));
            if (!rv || typeof rv.then !== 'function') return Promise.resolve(rv);
            return rv;
        } catch (e) {
            return rejection(e);
        }
    },

    // Dexie.currentTransaction property
    currentTransaction: {
        get: function () {
            return PSD.trans || null;
        }
    },

    // Export our Promise implementation since it can be handy as a standalone Promise implementation
    Promise: Promise,

    // Dexie.debug proptery:
    // Dexie.debug = false
    // Dexie.debug = true
    // Dexie.debug = "dexie" - don't hide dexie's stack frames.
    debug: {
        get: function () {
            return debug;
        },
        set: function (value) {
            setDebug(value, value === 'dexie' ? function () {
                return true;
            } : dexieStackFrameFilter);
        }
    },

    // Export our derive/extend/override methodology
    derive: derive,
    extend: extend,
    props: props,
    override: override,
    // Export our Events() function - can be handy as a toolkit
    Events: Events,
    events: { get: deprecated(function () {
            return Events;
        }) }, // Backward compatible lowercase version.
    // Utilities
    getByKeyPath: getByKeyPath,
    setByKeyPath: setByKeyPath,
    delByKeyPath: delByKeyPath,
    shallowClone: shallowClone,
    deepClone: deepClone,
    getObjectDiff: getObjectDiff,
    asap: asap,
    maxKey: maxKey,
    // Addon registry
    addons: [],
    // Global DB connection list
    connections: connections,

    MultiModifyError: exceptions.Modify, // Backward compatibility 0.9.8. Deprecate.
    errnames: errnames,

    // Export other static classes
    IndexSpec: IndexSpec,
    TableSchema: TableSchema,

    //
    // Dependencies
    //
    // These will automatically work in browsers with indexedDB support, or where an indexedDB polyfill has been included.
    //
    // In node.js, however, these properties must be set "manually" before instansiating a new Dexie().
    // For node.js, you need to require indexeddb-js or similar and then set these deps.
    //
    dependencies: {
        // Required:
        indexedDB: idbshim.shimIndexedDB || _global.indexedDB || _global.mozIndexedDB || _global.webkitIndexedDB || _global.msIndexedDB,
        IDBKeyRange: idbshim.IDBKeyRange || _global.IDBKeyRange || _global.webkitIDBKeyRange
    },

    // API Version Number: Type Number, make sure to always set a version number that can be comparable correctly. Example: 0.9, 0.91, 0.92, 1.0, 1.01, 1.1, 1.2, 1.21, etc.
    semVer: DEXIE_VERSION,
    version: DEXIE_VERSION.split('.').map(function (n) {
        return parseInt(n);
    }).reduce(function (p, c, i) {
        return p + c / Math.pow(10, i * 2);
    }),
    fakeAutoComplete: fakeAutoComplete,

    // https://github.com/dfahlander/Dexie.js/issues/186
    // typescript compiler tsc in mode ts-->es5 & commonJS, will expect require() to return
    // x.default. Workaround: Set Dexie.default = Dexie.
    default: Dexie
});

tryCatch(function () {
    // Optional dependencies
    // localStorage
    Dexie.dependencies.localStorage = (typeof chrome !== "undefined" && chrome !== null ? chrome.storage : void 0) != null ? null : _global.localStorage;
});

// Map DOMErrors and DOMExceptions to corresponding Dexie errors. May change in Dexie v2.0.
Promise.rejectionMapper = mapError;

// Fool IDE to improve autocomplete. Tested with Visual Studio 2013 and 2015.
doFakeAutoComplete(function () {
    Dexie.fakeAutoComplete = fakeAutoComplete = doFakeAutoComplete;
    Dexie.fake = fake = true;
});

return Dexie;

})));


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("timers").setImmediate)

},{"timers":7}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
// version: 0.13.0
// date: Fri Aug 31 2018 09:24:53 GMT+0100 (Western European Summer Time)
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


// version: 0.13.0
// date: Fri Aug 31 2018 09:24:53 GMT+0100 (Western European Summer Time)
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


!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("RuntimeCatalogue",[],t):"object"==typeof exports?exports.RuntimeCatalogue=t():e.RuntimeCatalogue=t()}("undefined"!=typeof self?self:this,function(){return function(e){function __webpack_require__(r){if(t[r])return t[r].exports;var n=t[r]={i:r,l:!1,exports:{}};return e[r].call(n.exports,n,n.exports,__webpack_require__),n.l=!0,n.exports}var t={};return __webpack_require__.m=e,__webpack_require__.c=t,__webpack_require__.d=function(e,t,r){__webpack_require__.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:r})},__webpack_require__.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return __webpack_require__.d(t,"a",t),t},__webpack_require__.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},__webpack_require__.p="",__webpack_require__(__webpack_require__.s=177)}([function(e,t){var r=e.exports={version:"2.5.7"};"number"==typeof __e&&(__e=r)},function(e,t){var r=e.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=r)},function(e,t,r){var n=r(30)("wks"),i=r(21),o=r(1).Symbol,a="function"==typeof o;(e.exports=function(e){return n[e]||(n[e]=a&&o[e]||(a?o:i)("Symbol."+e))}).store=n},function(e,t,r){"use strict";t.__esModule=!0,t.default=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}},function(e,t,r){"use strict";t.__esModule=!0;var n=r(60),i=function(e){return e&&e.__esModule?e:{default:e}}(n);t.default=function(){function defineProperties(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),(0,i.default)(e,n.key,n)}}return function(e,t,r){return t&&defineProperties(e.prototype,t),r&&defineProperties(e,r),e}}()},function(e,t,r){var n=r(1),i=r(0),o=r(18),a=r(11),u=r(10),s=function(e,t,r){var c,l,f,p=e&s.F,h=e&s.G,d=e&s.S,y=e&s.P,v=e&s.B,m=e&s.W,g=h?i:i[t]||(i[t]={}),_=g.prototype,b=h?n:d?n[t]:(n[t]||{}).prototype;h&&(r=t);for(c in r)(l=!p&&b&&void 0!==b[c])&&u(g,c)||(f=l?b[c]:r[c],g[c]=h&&"function"!=typeof b[c]?r[c]:v&&l?o(f,n):m&&b[c]==f?function(e){var t=function(t,r,n){if(this instanceof e){switch(arguments.length){case 0:return new e;case 1:return new e(t);case 2:return new e(t,r)}return new e(t,r,n)}return e.apply(this,arguments)};return t.prototype=e.prototype,t}(f):y&&"function"==typeof f?o(Function.call,f):f,y&&((g.virtual||(g.virtual={}))[c]=f,e&s.R&&_&&!_[c]&&a(_,c,f)))};s.F=1,s.G=2,s.S=4,s.P=8,s.B=16,s.W=32,s.U=64,s.R=128,e.exports=s},function(e,t,r){e.exports=!r(13)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},function(e,t,r){var n=r(9);e.exports=function(e){if(!n(e))throw TypeError(e+" is not an object!");return e}},function(e,t,r){var n=r(7),i=r(41),o=r(28),a=Object.defineProperty;t.f=r(6)?Object.defineProperty:function(e,t,r){if(n(e),t=o(t,!0),n(r),i)try{return a(e,t,r)}catch(e){}if("get"in r||"set"in r)throw TypeError("Accessors not supported!");return"value"in r&&(e[t]=r.value),e}},function(e,t){e.exports=function(e){return"object"==typeof e?null!==e:"function"==typeof e}},function(e,t){var r={}.hasOwnProperty;e.exports=function(e,t){return r.call(e,t)}},function(e,t,r){var n=r(8),i=r(20);e.exports=r(6)?function(e,t,r){return n.f(e,t,i(1,r))}:function(e,t,r){return e[t]=r,e}},function(e,t,r){var n=r(56),i=r(25);e.exports=function(e){return n(i(e))}},function(e,t){e.exports=function(e){try{return!!e()}catch(e){return!0}}},function(e,t){e.exports=!0},function(e,t){e.exports={}},function(e,t){var r={}.toString;e.exports=function(e){return r.call(e).slice(8,-1)}},function(e,t,r){e.exports={default:r(88),__esModule:!0}},function(e,t,r){var n=r(22);e.exports=function(e,t,r){if(n(e),void 0===t)return e;switch(r){case 1:return function(r){return e.call(t,r)};case 2:return function(r,n){return e.call(t,r,n)};case 3:return function(r,n,i){return e.call(t,r,n,i)}}return function(){return e.apply(t,arguments)}}},function(e,t,r){var n=r(42),i=r(31);e.exports=Object.keys||function(e){return n(e,i)}},function(e,t){e.exports=function(e,t){return{enumerable:!(1&e),configurable:!(2&e),writable:!(4&e),value:t}}},function(e,t){var r=0,n=Math.random();e.exports=function(e){return"Symbol(".concat(void 0===e?"":e,")_",(++r+n).toString(36))}},function(e,t){e.exports=function(e){if("function"!=typeof e)throw TypeError(e+" is not a function!");return e}},function(e,t,r){var n=r(8).f,i=r(10),o=r(2)("toStringTag");e.exports=function(e,t,r){e&&!i(e=r?e:e.prototype,o)&&n(e,o,{configurable:!0,value:t})}},function(e,t){var r=Math.ceil,n=Math.floor;e.exports=function(e){return isNaN(e=+e)?0:(e>0?n:r)(e)}},function(e,t){e.exports=function(e){if(void 0==e)throw TypeError("Can't call method on  "+e);return e}},function(e,t,r){e.exports={default:r(102),__esModule:!0}},function(e,t){t.f={}.propertyIsEnumerable},function(e,t,r){var n=r(9);e.exports=function(e,t){if(!n(e))return e;var r,i;if(t&&"function"==typeof(r=e.toString)&&!n(i=r.call(e)))return i;if("function"==typeof(r=e.valueOf)&&!n(i=r.call(e)))return i;if(!t&&"function"==typeof(r=e.toString)&&!n(i=r.call(e)))return i;throw TypeError("Can't convert object to primitive value")}},function(e,t,r){var n=r(30)("keys"),i=r(21);e.exports=function(e){return n[e]||(n[e]=i(e))}},function(e,t,r){var n=r(0),i=r(1),o=i["__core-js_shared__"]||(i["__core-js_shared__"]={});(e.exports=function(e,t){return o[e]||(o[e]=void 0!==t?t:{})})("versions",[]).push({version:n.version,mode:r(14)?"pure":"global",copyright:"© 2018 Denis Pushkarev (zloirock.ru)"})},function(e,t){e.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},function(e,t,r){var n=r(9),i=r(1).document,o=n(i)&&n(i.createElement);e.exports=function(e){return o?i.createElement(e):{}}},function(e,t,r){var n=r(25);e.exports=function(e){return Object(n(e))}},function(e,t,r){"use strict";t.__esModule=!0;var n=r(53),i=function(e){return e&&e.__esModule?e:{default:e}}(n);t.default=function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!==(void 0===t?"undefined":(0,i.default)(t))&&"function"!=typeof t?e:t}},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}t.__esModule=!0;var n=r(104),i=_interopRequireDefault(n),o=r(108),a=_interopRequireDefault(o),u=r(53),s=_interopRequireDefault(u);t.default=function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+(void 0===t?"undefined":(0,s.default)(t)));e.prototype=(0,a.default)(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(i.default?(0,i.default)(e,t):e.__proto__=t)}},function(e,t,r){var n,i;!function(o,a){"use strict";n=a,void 0!==(i="function"==typeof n?n.call(t,r,t,e):n)&&(e.exports=i)}(0,function(){"use strict";function bindMethod(e,t){var r=e[t];if("function"==typeof r.bind)return r.bind(e);try{return Function.prototype.bind.call(r,e)}catch(t){return function(){return Function.prototype.apply.apply(r,[e,arguments])}}}function realMethod(r){return"debug"===r&&(r="log"),typeof console!==t&&(void 0!==console[r]?bindMethod(console,r):void 0!==console.log?bindMethod(console,"log"):e)}function replaceLoggingMethods(t,n){for(var i=0;i<r.length;i++){var o=r[i];this[o]=i<t?e:this.methodFactory(o,t,n)}this.log=this.debug}function enableLoggingWhenConsoleArrives(e,r,n){return function(){typeof console!==t&&(replaceLoggingMethods.call(this,r,n),this[e].apply(this,arguments))}}function defaultMethodFactory(e,t,r){return realMethod(e)||enableLoggingWhenConsoleArrives.apply(this,arguments)}function Logger(e,n,i){function persistLevelIfPossible(e){var n=(r[e]||"silent").toUpperCase();if(typeof window!==t){try{return void(window.localStorage[u]=n)}catch(e){}try{window.document.cookie=encodeURIComponent(u)+"="+n+";"}catch(e){}}}function getPersistedLevel(){var e;if(typeof window!==t){try{e=window.localStorage[u]}catch(e){}if(typeof e===t)try{var r=window.document.cookie,n=r.indexOf(encodeURIComponent(u)+"=");-1!==n&&(e=/^([^;]+)/.exec(r.slice(n))[1])}catch(e){}return void 0===a.levels[e]&&(e=void 0),e}}var o,a=this,u="loglevel";e&&(u+=":"+e),a.name=e,a.levels={TRACE:0,DEBUG:1,INFO:2,WARN:3,ERROR:4,SILENT:5},a.methodFactory=i||defaultMethodFactory,a.getLevel=function(){return o},a.setLevel=function(r,n){if("string"==typeof r&&void 0!==a.levels[r.toUpperCase()]&&(r=a.levels[r.toUpperCase()]),!("number"==typeof r&&r>=0&&r<=a.levels.SILENT))throw"log.setLevel() called with invalid level: "+r;if(o=r,!1!==n&&persistLevelIfPossible(r),replaceLoggingMethods.call(a,r,e),typeof console===t&&r<a.levels.SILENT)return"No console available for logging"},a.setDefaultLevel=function(e){getPersistedLevel()||a.setLevel(e,!1)},a.enableAll=function(e){a.setLevel(a.levels.TRACE,e)},a.disableAll=function(e){a.setLevel(a.levels.SILENT,e)};var s=getPersistedLevel();null==s&&(s=null==n?"WARN":n),a.setLevel(s,!1)}var e=function(){},t="undefined",r=["trace","debug","info","warn","error"],n=new Logger,i={};n.getLogger=function(e){if("string"!=typeof e||""===e)throw new TypeError("You must supply a name when creating a logger.");var t=i[e];return t||(t=i[e]=new Logger(e,n.getLevel(),n.methodFactory)),t};var o=typeof window!==t?window.log:void 0;return n.noConflict=function(){return typeof window!==t&&window.log===n&&(window.log=o),n},n.getLoggers=function(){return i},n})},function(e,t,r){t.f=r(2)},function(e,t,r){var n=r(1),i=r(0),o=r(14),a=r(37),u=r(8).f;e.exports=function(e){var t=i.Symbol||(i.Symbol=o?{}:n.Symbol||{});"_"==e.charAt(0)||e in t||u(t,e,{value:a.f(e)})}},,function(e,t,r){var n=r(7),i=r(72),o=r(31),a=r(29)("IE_PROTO"),u=function(){},s=function(){var e,t=r(32)("iframe"),n=o.length;for(t.style.display="none",r(57).appendChild(t),t.src="javascript:",e=t.contentWindow.document,e.open(),e.write("<script>document.F=Object<\/script>"),e.close(),s=e.F;n--;)delete s.prototype[o[n]];return s()};e.exports=Object.create||function(e,t){var r;return null!==e?(u.prototype=n(e),r=new u,u.prototype=null,r[a]=e):r=s(),void 0===t?r:i(r,t)}},function(e,t,r){e.exports=!r(6)&&!r(13)(function(){return 7!=Object.defineProperty(r(32)("div"),"a",{get:function(){return 7}}).a})},function(e,t,r){var n=r(10),i=r(12),o=r(61)(!1),a=r(29)("IE_PROTO");e.exports=function(e,t){var r,u=i(e),s=0,c=[];for(r in u)r!=a&&n(u,r)&&c.push(r);for(;t.length>s;)n(u,r=t[s++])&&(~o(c,r)||c.push(r));return c}},function(e,t){t.f=Object.getOwnPropertySymbols},,function(e,t,r){"use strict";var n=r(70)(!0);r(51)(String,"String",function(e){this._t=String(e),this._i=0},function(){var e,t=this._t,r=this._i;return r>=t.length?{value:void 0,done:!0}:(e=n(t,r),this._i+=e.length,{value:e,done:!1})})},function(e,t,r){var n=r(24),i=Math.min;e.exports=function(e){return e>0?i(n(e),9007199254740991):0}},function(e,t,r){r(73);for(var n=r(1),i=r(11),o=r(15),a=r(2)("toStringTag"),u="CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,TextTrackList,TouchList".split(","),s=0;s<u.length;s++){var c=u[s],l=n[c],f=l&&l.prototype;f&&!f[a]&&i(f,a,c),o[c]=o.Array}},function(e,t,r){"use strict";function PromiseCapability(e){var t,r;this.promise=new e(function(e,n){if(void 0!==t||void 0!==r)throw TypeError("Bad Promise constructor");t=e,r=n}),this.resolve=n(t),this.reject=n(r)}var n=r(22);e.exports.f=function(e){return new PromiseCapability(e)}},function(e,t,r){var n=r(5),i=r(0),o=r(13);e.exports=function(e,t){var r=(i.Object||{})[e]||Object[e],a={};a[e]=t(r),n(n.S+n.F*o(function(){r(1)}),"Object",a)}},function(e,t,r){var n=r(27),i=r(20),o=r(12),a=r(28),u=r(10),s=r(41),c=Object.getOwnPropertyDescriptor;t.f=r(6)?c:function(e,t){if(e=o(e),t=a(t,!0),s)try{return c(e,t)}catch(e){}if(u(e,t))return i(!n.f.call(e,t),e[t])}},function(e,t,r){"use strict";var n=r(14),i=r(5),o=r(52),a=r(11),u=r(15),s=r(71),c=r(23),l=r(58),f=r(2)("iterator"),p=!([].keys&&"next"in[].keys()),h=function(){return this};e.exports=function(e,t,r,d,y,v,m){s(r,t,d);var g,_,b,O=function(e){if(!p&&e in P)return P[e];switch(e){case"keys":case"values":return function(){return new r(this,e)}}return function(){return new r(this,e)}},R=t+" Iterator",S="values"==y,E=!1,P=e.prototype,D=P[f]||P["@@iterator"]||y&&P[y],w=D||O(y),k=y?S?O("entries"):w:void 0,T="Array"==t?P.entries||D:D;if(T&&(b=l(T.call(new e)))!==Object.prototype&&b.next&&(c(b,R,!0),n||"function"==typeof b[f]||a(b,f,h)),S&&D&&"values"!==D.name&&(E=!0,w=function(){return D.call(this)}),n&&!m||!p&&!E&&P[f]||a(P,f,w),u[t]=w,u[R]=h,y)if(g={values:S?w:O("values"),keys:v?w:O("keys"),entries:k},m)for(_ in g)_ in P||o(P,_,g[_]);else i(i.P+i.F*(p||E),t,g);return g}},function(e,t,r){e.exports=r(11)},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}t.__esModule=!0;var n=r(76),i=_interopRequireDefault(n),o=r(78),a=_interopRequireDefault(o),u="function"==typeof a.default&&"symbol"==typeof i.default?function(e){return typeof e}:function(e){return e&&"function"==typeof a.default&&e.constructor===a.default&&e!==a.default.prototype?"symbol":typeof e};t.default="function"==typeof a.default&&"symbol"===u(i.default)?function(e){return void 0===e?"undefined":u(e)}:function(e){return e&&"function"==typeof a.default&&e.constructor===a.default&&e!==a.default.prototype?"symbol":void 0===e?"undefined":u(e)}},function(e,t,r){var n=r(42),i=r(31).concat("length","prototype");t.f=Object.getOwnPropertyNames||function(e){return n(e,i)}},function(e,t){},function(e,t,r){var n=r(16);e.exports=Object("z").propertyIsEnumerable(0)?Object:function(e){return"String"==n(e)?e.split(""):Object(e)}},function(e,t,r){var n=r(1).document;e.exports=n&&n.documentElement},function(e,t,r){var n=r(10),i=r(33),o=r(29)("IE_PROTO"),a=Object.prototype;e.exports=Object.getPrototypeOf||function(e){return e=i(e),n(e,o)?e[o]:"function"==typeof e.constructor&&e instanceof e.constructor?e.constructor.prototype:e instanceof Object?a:null}},function(e,t,r){var n=r(16),i=r(2)("toStringTag"),o="Arguments"==n(function(){return arguments}()),a=function(e,t){try{return e[t]}catch(e){}};e.exports=function(e){var t,r,u;return void 0===e?"Undefined":null===e?"Null":"string"==typeof(r=a(t=Object(e),i))?r:o?n(t):"Object"==(u=n(t))&&"function"==typeof t.callee?"Arguments":u}},function(e,t,r){e.exports={default:r(67),__esModule:!0}},function(e,t,r){var n=r(12),i=r(46),o=r(62);e.exports=function(e){return function(t,r,a){var u,s=n(t),c=i(s.length),l=o(a,c);if(e&&r!=r){for(;c>l;)if((u=s[l++])!=u)return!0}else for(;c>l;l++)if((e||l in s)&&s[l]===r)return e||l||0;return!e&&-1}}},function(e,t,r){var n=r(24),i=Math.max,o=Math.min;e.exports=function(e,t){return e=n(e),e<0?i(e+t,0):o(e,t)}},function(e,t,r){var n=r(7),i=r(22),o=r(2)("species");e.exports=function(e,t){var r,a=n(e).constructor;return void 0===a||void 0==(r=n(a)[o])?t:i(r)}},function(e,t,r){var n,i,o,a=r(18),u=r(94),s=r(57),c=r(32),l=r(1),f=l.process,p=l.setImmediate,h=l.clearImmediate,d=l.MessageChannel,y=l.Dispatch,v=0,m={},g=function(){var e=+this;if(m.hasOwnProperty(e)){var t=m[e];delete m[e],t()}},_=function(e){g.call(e.data)};p&&h||(p=function(e){for(var t=[],r=1;arguments.length>r;)t.push(arguments[r++]);return m[++v]=function(){u("function"==typeof e?e:Function(e),t)},n(v),v},h=function(e){delete m[e]},"process"==r(16)(f)?n=function(e){f.nextTick(a(g,e,1))}:y&&y.now?n=function(e){y.now(a(g,e,1))}:d?(i=new d,o=i.port2,i.port1.onmessage=_,n=a(o.postMessage,o,1)):l.addEventListener&&"function"==typeof postMessage&&!l.importScripts?(n=function(e){l.postMessage(e+"","*")},l.addEventListener("message",_,!1)):n="onreadystatechange"in c("script")?function(e){s.appendChild(c("script")).onreadystatechange=function(){s.removeChild(this),g.call(e)}}:function(e){setTimeout(a(g,e,1),0)}),e.exports={set:p,clear:h}},function(e,t){e.exports=function(e){try{return{e:!1,v:e()}}catch(e){return{e:!0,v:e}}}},function(e,t,r){var n=r(7),i=r(9),o=r(48);e.exports=function(e,t){if(n(e),i(t)&&t.constructor===e)return t;var r=o.f(e);return(0,r.resolve)(t),r.promise}},function(e,t,r){r(68);var n=r(0).Object;e.exports=function(e,t,r){return n.defineProperty(e,t,r)}},function(e,t,r){var n=r(5);n(n.S+n.F*!r(6),"Object",{defineProperty:r(8).f})},function(e,t,r){e.exports={default:r(111),__esModule:!0}},function(e,t,r){var n=r(24),i=r(25);e.exports=function(e){return function(t,r){var o,a,u=String(i(t)),s=n(r),c=u.length;return s<0||s>=c?e?"":void 0:(o=u.charCodeAt(s),o<55296||o>56319||s+1===c||(a=u.charCodeAt(s+1))<56320||a>57343?e?u.charAt(s):o:e?u.slice(s,s+2):a-56320+(o-55296<<10)+65536)}}},function(e,t,r){"use strict";var n=r(40),i=r(20),o=r(23),a={};r(11)(a,r(2)("iterator"),function(){return this}),e.exports=function(e,t,r){e.prototype=n(a,{next:i(1,r)}),o(e,t+" Iterator")}},function(e,t,r){var n=r(8),i=r(7),o=r(19);e.exports=r(6)?Object.defineProperties:function(e,t){i(e);for(var r,a=o(t),u=a.length,s=0;u>s;)n.f(e,r=a[s++],t[r]);return e}},function(e,t,r){"use strict";var n=r(74),i=r(75),o=r(15),a=r(12);e.exports=r(51)(Array,"Array",function(e,t){this._t=a(e),this._i=0,this._k=t},function(){var e=this._t,t=this._k,r=this._i++;return!e||r>=e.length?(this._t=void 0,i(1)):"keys"==t?i(0,r):"values"==t?i(0,e[r]):i(0,[r,e[r]])},"values"),o.Arguments=o.Array,n("keys"),n("values"),n("entries")},function(e,t){e.exports=function(){}},function(e,t){e.exports=function(e,t){return{value:t,done:!!e}}},function(e,t,r){e.exports={default:r(77),__esModule:!0}},function(e,t,r){r(45),r(47),e.exports=r(37).f("iterator")},function(e,t,r){e.exports={default:r(79),__esModule:!0}},function(e,t,r){r(80),r(55),r(85),r(86),e.exports=r(0).Symbol},function(e,t,r){"use strict";var n=r(1),i=r(10),o=r(6),a=r(5),u=r(52),s=r(81).KEY,c=r(13),l=r(30),f=r(23),p=r(21),h=r(2),d=r(37),y=r(38),v=r(82),m=r(83),g=r(7),_=r(9),b=r(12),O=r(28),R=r(20),S=r(40),E=r(84),P=r(50),D=r(8),w=r(19),k=P.f,T=D.f,j=E.f,M=n.Symbol,C=n.JSON,x=C&&C.stringify,A=h("_hidden"),I=h("toPrimitive"),N={}.propertyIsEnumerable,U=l("symbol-registry"),L=l("symbols"),q=l("op-symbols"),H=Object.prototype,F="function"==typeof M,Y=n.QObject,B=!Y||!Y.prototype||!Y.prototype.findChild,V=o&&c(function(){return 7!=S(T({},"a",{get:function(){return T(this,"a",{value:7}).a}})).a})?function(e,t,r){var n=k(H,t);n&&delete H[t],T(e,t,r),n&&e!==H&&T(H,t,n)}:T,K=function(e){var t=L[e]=S(M.prototype);return t._k=e,t},G=F&&"symbol"==typeof M.iterator?function(e){return"symbol"==typeof e}:function(e){return e instanceof M},W=function(e,t,r){return e===H&&W(q,t,r),g(e),t=O(t,!0),g(r),i(L,t)?(r.enumerable?(i(e,A)&&e[A][t]&&(e[A][t]=!1),r=S(r,{enumerable:R(0,!1)})):(i(e,A)||T(e,A,R(1,{})),e[A][t]=!0),V(e,t,r)):T(e,t,r)},J=function(e,t){g(e);for(var r,n=v(t=b(t)),i=0,o=n.length;o>i;)W(e,r=n[i++],t[r]);return e},z=function(e,t){return void 0===t?S(e):J(S(e),t)},X=function(e){var t=N.call(this,e=O(e,!0));return!(this===H&&i(L,e)&&!i(q,e))&&(!(t||!i(this,e)||!i(L,e)||i(this,A)&&this[A][e])||t)},$=function(e,t){if(e=b(e),t=O(t,!0),e!==H||!i(L,t)||i(q,t)){var r=k(e,t);return!r||!i(L,t)||i(e,A)&&e[A][t]||(r.enumerable=!0),r}},Q=function(e){for(var t,r=j(b(e)),n=[],o=0;r.length>o;)i(L,t=r[o++])||t==A||t==s||n.push(t);return n},Z=function(e){for(var t,r=e===H,n=j(r?q:b(e)),o=[],a=0;n.length>a;)!i(L,t=n[a++])||r&&!i(H,t)||o.push(L[t]);return o};F||(M=function(){if(this instanceof M)throw TypeError("Symbol is not a constructor!");var e=p(arguments.length>0?arguments[0]:void 0),t=function(r){this===H&&t.call(q,r),i(this,A)&&i(this[A],e)&&(this[A][e]=!1),V(this,e,R(1,r))};return o&&B&&V(H,e,{configurable:!0,set:t}),K(e)},u(M.prototype,"toString",function(){return this._k}),P.f=$,D.f=W,r(54).f=E.f=Q,r(27).f=X,r(43).f=Z,o&&!r(14)&&u(H,"propertyIsEnumerable",X,!0),d.f=function(e){return K(h(e))}),a(a.G+a.W+a.F*!F,{Symbol:M});for(var ee="hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),te=0;ee.length>te;)h(ee[te++]);for(var re=w(h.store),ne=0;re.length>ne;)y(re[ne++]);a(a.S+a.F*!F,"Symbol",{for:function(e){return i(U,e+="")?U[e]:U[e]=M(e)},keyFor:function(e){if(!G(e))throw TypeError(e+" is not a symbol!");for(var t in U)if(U[t]===e)return t},useSetter:function(){B=!0},useSimple:function(){B=!1}}),a(a.S+a.F*!F,"Object",{create:z,defineProperty:W,defineProperties:J,getOwnPropertyDescriptor:$,getOwnPropertyNames:Q,getOwnPropertySymbols:Z}),C&&a(a.S+a.F*(!F||c(function(){var e=M();return"[null]"!=x([e])||"{}"!=x({a:e})||"{}"!=x(Object(e))})),"JSON",{stringify:function(e){for(var t,r,n=[e],i=1;arguments.length>i;)n.push(arguments[i++]);if(r=t=n[1],(_(t)||void 0!==e)&&!G(e))return m(t)||(t=function(e,t){if("function"==typeof r&&(t=r.call(this,e,t)),!G(t))return t}),n[1]=t,x.apply(C,n)}}),M.prototype[I]||r(11)(M.prototype,I,M.prototype.valueOf),f(M,"Symbol"),f(Math,"Math",!0),f(n.JSON,"JSON",!0)},function(e,t,r){var n=r(21)("meta"),i=r(9),o=r(10),a=r(8).f,u=0,s=Object.isExtensible||function(){return!0},c=!r(13)(function(){return s(Object.preventExtensions({}))}),l=function(e){a(e,n,{value:{i:"O"+ ++u,w:{}}})},f=function(e,t){if(!i(e))return"symbol"==typeof e?e:("string"==typeof e?"S":"P")+e;if(!o(e,n)){if(!s(e))return"F";if(!t)return"E";l(e)}return e[n].i},p=function(e,t){if(!o(e,n)){if(!s(e))return!0;if(!t)return!1;l(e)}return e[n].w},h=function(e){return c&&d.NEED&&s(e)&&!o(e,n)&&l(e),e},d=e.exports={KEY:n,NEED:!1,fastKey:f,getWeak:p,onFreeze:h}},function(e,t,r){var n=r(19),i=r(43),o=r(27);e.exports=function(e){var t=n(e),r=i.f;if(r)for(var a,u=r(e),s=o.f,c=0;u.length>c;)s.call(e,a=u[c++])&&t.push(a);return t}},function(e,t,r){var n=r(16);e.exports=Array.isArray||function(e){return"Array"==n(e)}},function(e,t,r){var n=r(12),i=r(54).f,o={}.toString,a="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],u=function(e){try{return i(e)}catch(e){return a.slice()}};e.exports.f=function(e){return a&&"[object Window]"==o.call(e)?u(e):i(n(e))}},function(e,t,r){r(38)("asyncIterator")},function(e,t,r){r(38)("observable")},function(e,t,r){var n=r(59),i=r(2)("iterator"),o=r(15);e.exports=r(0).getIteratorMethod=function(e){if(void 0!=e)return e[i]||e["@@iterator"]||o[n(e)]}},function(e,t,r){r(55),r(45),r(47),r(89),r(100),r(101),e.exports=r(0).Promise},function(e,t,r){"use strict";var n,i,o,a,u=r(14),s=r(1),c=r(18),l=r(59),f=r(5),p=r(9),h=r(22),d=r(90),y=r(91),v=r(63),m=r(64).set,g=r(95)(),_=r(48),b=r(65),O=r(96),R=r(66),S=s.TypeError,E=s.process,P=E&&E.versions,D=P&&P.v8||"",w=s.Promise,k="process"==l(E),T=function(){},j=i=_.f,M=!!function(){try{var e=w.resolve(1),t=(e.constructor={})[r(2)("species")]=function(e){e(T,T)};return(k||"function"==typeof PromiseRejectionEvent)&&e.then(T)instanceof t&&0!==D.indexOf("6.6")&&-1===O.indexOf("Chrome/66")}catch(e){}}(),C=function(e){var t;return!(!p(e)||"function"!=typeof(t=e.then))&&t},x=function(e,t){if(!e._n){e._n=!0;var r=e._c;g(function(){for(var n=e._v,i=1==e._s,o=0;r.length>o;)!function(t){var r,o,a,u=i?t.ok:t.fail,s=t.resolve,c=t.reject,l=t.domain;try{u?(i||(2==e._h&&N(e),e._h=1),!0===u?r=n:(l&&l.enter(),r=u(n),l&&(l.exit(),a=!0)),r===t.promise?c(S("Promise-chain cycle")):(o=C(r))?o.call(r,s,c):s(r)):c(n)}catch(e){l&&!a&&l.exit(),c(e)}}(r[o++]);e._c=[],e._n=!1,t&&!e._h&&A(e)})}},A=function(e){m.call(s,function(){var t,r,n,i=e._v,o=I(e);if(o&&(t=b(function(){k?E.emit("unhandledRejection",i,e):(r=s.onunhandledrejection)?r({promise:e,reason:i}):(n=s.console)&&n.error&&n.error("Unhandled promise rejection",i)}),e._h=k||I(e)?2:1),e._a=void 0,o&&t.e)throw t.v})},I=function(e){return 1!==e._h&&0===(e._a||e._c).length},N=function(e){m.call(s,function(){var t;k?E.emit("rejectionHandled",e):(t=s.onrejectionhandled)&&t({promise:e,reason:e._v})})},U=function(e){var t=this;t._d||(t._d=!0,t=t._w||t,t._v=e,t._s=2,t._a||(t._a=t._c.slice()),x(t,!0))},L=function(e){var t,r=this;if(!r._d){r._d=!0,r=r._w||r;try{if(r===e)throw S("Promise can't be resolved itself");(t=C(e))?g(function(){var n={_w:r,_d:!1};try{t.call(e,c(L,n,1),c(U,n,1))}catch(e){U.call(n,e)}}):(r._v=e,r._s=1,x(r,!1))}catch(e){U.call({_w:r,_d:!1},e)}}};M||(w=function(e){d(this,w,"Promise","_h"),h(e),n.call(this);try{e(c(L,this,1),c(U,this,1))}catch(e){U.call(this,e)}},n=function(e){this._c=[],this._a=void 0,this._s=0,this._d=!1,this._v=void 0,this._h=0,this._n=!1},n.prototype=r(97)(w.prototype,{then:function(e,t){var r=j(v(this,w));return r.ok="function"!=typeof e||e,r.fail="function"==typeof t&&t,r.domain=k?E.domain:void 0,this._c.push(r),this._a&&this._a.push(r),this._s&&x(this,!1),r.promise},catch:function(e){return this.then(void 0,e)}}),o=function(){var e=new n;this.promise=e,this.resolve=c(L,e,1),this.reject=c(U,e,1)},_.f=j=function(e){return e===w||e===a?new o(e):i(e)}),f(f.G+f.W+f.F*!M,{Promise:w}),r(23)(w,"Promise"),r(98)("Promise"),a=r(0).Promise,f(f.S+f.F*!M,"Promise",{reject:function(e){var t=j(this);return(0,t.reject)(e),t.promise}}),f(f.S+f.F*(u||!M),"Promise",{resolve:function(e){return R(u&&this===a?w:this,e)}}),f(f.S+f.F*!(M&&r(99)(function(e){w.all(e).catch(T)})),"Promise",{all:function(e){var t=this,r=j(t),n=r.resolve,i=r.reject,o=b(function(){var r=[],o=0,a=1;y(e,!1,function(e){var u=o++,s=!1;r.push(void 0),a++,t.resolve(e).then(function(e){s||(s=!0,r[u]=e,--a||n(r))},i)}),--a||n(r)});return o.e&&i(o.v),r.promise},race:function(e){var t=this,r=j(t),n=r.reject,i=b(function(){y(e,!1,function(e){t.resolve(e).then(r.resolve,n)})});return i.e&&n(i.v),r.promise}})},function(e,t){e.exports=function(e,t,r,n){if(!(e instanceof t)||void 0!==n&&n in e)throw TypeError(r+": incorrect invocation!");return e}},function(e,t,r){var n=r(18),i=r(92),o=r(93),a=r(7),u=r(46),s=r(87),c={},l={},t=e.exports=function(e,t,r,f,p){var h,d,y,v,m=p?function(){return e}:s(e),g=n(r,f,t?2:1),_=0;if("function"!=typeof m)throw TypeError(e+" is not iterable!");if(o(m)){for(h=u(e.length);h>_;_++)if((v=t?g(a(d=e[_])[0],d[1]):g(e[_]))===c||v===l)return v}else for(y=m.call(e);!(d=y.next()).done;)if((v=i(y,g,d.value,t))===c||v===l)return v};t.BREAK=c,t.RETURN=l},function(e,t,r){var n=r(7);e.exports=function(e,t,r,i){try{return i?t(n(r)[0],r[1]):t(r)}catch(t){var o=e.return;throw void 0!==o&&n(o.call(e)),t}}},function(e,t,r){var n=r(15),i=r(2)("iterator"),o=Array.prototype;e.exports=function(e){return void 0!==e&&(n.Array===e||o[i]===e)}},function(e,t){e.exports=function(e,t,r){var n=void 0===r;switch(t.length){case 0:return n?e():e.call(r);case 1:return n?e(t[0]):e.call(r,t[0]);case 2:return n?e(t[0],t[1]):e.call(r,t[0],t[1]);case 3:return n?e(t[0],t[1],t[2]):e.call(r,t[0],t[1],t[2]);case 4:return n?e(t[0],t[1],t[2],t[3]):e.call(r,t[0],t[1],t[2],t[3])}return e.apply(r,t)}},function(e,t,r){var n=r(1),i=r(64).set,o=n.MutationObserver||n.WebKitMutationObserver,a=n.process,u=n.Promise,s="process"==r(16)(a);e.exports=function(){var e,t,r,c=function(){var n,i;for(s&&(n=a.domain)&&n.exit();e;){i=e.fn,e=e.next;try{i()}catch(n){throw e?r():t=void 0,n}}t=void 0,n&&n.enter()};if(s)r=function(){a.nextTick(c)};else if(!o||n.navigator&&n.navigator.standalone)if(u&&u.resolve){var l=u.resolve(void 0);r=function(){l.then(c)}}else r=function(){i.call(n,c)};else{var f=!0,p=document.createTextNode("");new o(c).observe(p,{characterData:!0}),r=function(){p.data=f=!f}}return function(n){var i={fn:n,next:void 0};t&&(t.next=i),e||(e=i,r()),t=i}}},function(e,t,r){var n=r(1),i=n.navigator;e.exports=i&&i.userAgent||""},function(e,t,r){var n=r(11);e.exports=function(e,t,r){for(var i in t)r&&e[i]?e[i]=t[i]:n(e,i,t[i]);return e}},function(e,t,r){"use strict";var n=r(1),i=r(0),o=r(8),a=r(6),u=r(2)("species");e.exports=function(e){var t="function"==typeof i[e]?i[e]:n[e];a&&t&&!t[u]&&o.f(t,u,{configurable:!0,get:function(){return this}})}},function(e,t,r){var n=r(2)("iterator"),i=!1;try{var o=[7][n]();o.return=function(){i=!0},Array.from(o,function(){throw 2})}catch(e){}e.exports=function(e,t){if(!t&&!i)return!1;var r=!1;try{var o=[7],a=o[n]();a.next=function(){return{done:r=!0}},o[n]=function(){return a},e(o)}catch(e){}return r}},function(e,t,r){"use strict";var n=r(5),i=r(0),o=r(1),a=r(63),u=r(66);n(n.P+n.R,"Promise",{finally:function(e){var t=a(this,i.Promise||o.Promise),r="function"==typeof e;return this.then(r?function(r){return u(t,e()).then(function(){return r})}:e,r?function(r){return u(t,e()).then(function(){throw r})}:e)}})},function(e,t,r){"use strict";var n=r(5),i=r(48),o=r(65);n(n.S,"Promise",{try:function(e){var t=i.f(this),r=o(e);return(r.e?t.reject:t.resolve)(r.v),t.promise}})},function(e,t,r){r(103),e.exports=r(0).Object.getPrototypeOf},function(e,t,r){var n=r(33),i=r(58);r(49)("getPrototypeOf",function(){return function(e){return i(n(e))}})},function(e,t,r){e.exports={default:r(105),__esModule:!0}},function(e,t,r){r(106),e.exports=r(0).Object.setPrototypeOf},function(e,t,r){var n=r(5);n(n.S,"Object",{setPrototypeOf:r(107).set})},function(e,t,r){var n=r(9),i=r(7),o=function(e,t){if(i(e),!n(t)&&null!==t)throw TypeError(t+": can't set as prototype!")};e.exports={set:Object.setPrototypeOf||("__proto__"in{}?function(e,t,n){try{n=r(18)(Function.call,r(50).f(Object.prototype,"__proto__").set,2),n(e,[]),t=!(e instanceof Array)}catch(e){t=!0}return function(e,r){return o(e,r),t?e.__proto__=r:n(e,r),e}}({},!1):void 0),check:o}},function(e,t,r){e.exports={default:r(109),__esModule:!0}},function(e,t,r){r(110);var n=r(0).Object;e.exports=function(e,t){return n.create(e,t)}},function(e,t,r){var n=r(5);n(n.S,"Object",{create:r(40)})},function(e,t,r){var n=r(0),i=n.JSON||(n.JSON={stringify:JSON.stringify});e.exports=function(e){return i.stringify.apply(i,arguments)}},,,,function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0}),t.DataObjectSourceLanguage=t.CatalogueObjectType=void 0;var n=r(26),i=_interopRequireDefault(n),o=r(3),a=_interopRequireDefault(o),u=r(4),s=_interopRequireDefault(u),c=r(34),l=_interopRequireDefault(c),f=r(35),p=_interopRequireDefault(f),h=r(186),d=_interopRequireDefault(h),y=function(e){function CatalogueDataObject(e,t,r,n,o,u,s){(0,a.default)(this,CatalogueDataObject);var c=(0,l.default)(this,(CatalogueDataObject.__proto__||(0,i.default)(CatalogueDataObject)).call(this));return c._guid=e,c._type=t,c._version=r,c._objectName=n,c._description=o,c._language=u,c._sourcePackageURL=s,c._signature=null,c._sourcePackage=null,c}return(0,p.default)(CatalogueDataObject,e),(0,s.default)(CatalogueDataObject,[{key:"guid",get:function(){return this._guid},set:function(e){e&&(this._guid=e)}},{key:"type",get:function(){return this._type},set:function(e){e&&(this._type=e)}},{key:"version",get:function(){return this._version},set:function(e){e&&(this._version=e)}},{key:"objectName",get:function(){return this._objectName},set:function(e){e&&(this._objectName=e)}},{key:"description",get:function(){return this._description},set:function(e){e&&(this._description=e)}},{key:"language",get:function(){return this._language},set:function(e){e&&(this._language=e)}},{key:"signature",get:function(){return this._signature},set:function(e){e&&(this._signature=e)}},{key:"sourcePackage",get:function(){return this._sourcePackage},set:function(e){e&&(this._sourcePackage=e)}},{key:"sourcePackageURL",get:function(){return this._sourcePackageURL},set:function(e){e&&(this._sourcePackageURL=e)}}]),CatalogueDataObject}(d.default);t.CatalogueObjectType={HYPERTY:"hyperty",PROTOSTUB:"protostub",HYPERTY_RUNTIME:"hyperty_runtime",HYPERTY_INTERCEPTOR:"hyperty_inspector",HYPERTY_DATA_OBJECT:"hyperty_data_object"},t.DataObjectSourceLanguage={JAVASCRIPT_ECMA6:"javascript_ecma6",JAVASCRIPT_ECMA5:"javascript_ecma5",JSON_SCHEMA_V4:"json_schema_v4",PYTHON:"python",TYPESCRIPT:"typescript"};t.default=y},,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(178),i=_interopRequireDefault(n),o=r(69),a=_interopRequireDefault(o),u=r(17),s=_interopRequireDefault(u),c=r(3),l=_interopRequireDefault(c),f=r(4),p=_interopRequireDefault(f),h=r(36),d=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(h),y=r(185),v=_interopRequireDefault(y),m=d.getLogger("RuntimeCatalogue"),g=function(){function RuntimeCatalogue(e,t,r){if((0,l.default)(this,RuntimeCatalogue),!e)throw Error("The catalogue needs the runtimeFactory");this._factory=new v.default,this.httpRequest=e.createHttpRequest(),this.atob=e.atob?e.atob:atob;var n=t||"runtimeCatalogue",i=r||"&cguid, accessControlPolicy, constraints, dataObjects, hypertyType, objectName, sourcePackage, version",o={};o[n]=i,this.storageManager=e.storageManager(n,o)}return(0,p.default)(RuntimeCatalogue,[{key:"getDescriptor",value:function(e,t){var r=this,n=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],o=arguments[3];m.info("[RuntimeCatalogue] - getting descriptor from: ",e," with constraints: ",o);var u=!1,c=!1,l=void 0;l=void 0!=o?s.default.all([this.httpRequest.post(e+"/version",{body:(0,a.default)(o)}),this.httpRequest.post(e+"/cguid",{body:(0,a.default)(o)})]):s.default.all([this.httpRequest.get(e+"/version"),this.httpRequest.get(e+"/cguid")]),l=l.then(function(t){var n=(0,i.default)(t,2),s=n[0],c=n[1];return m.info("[RuntimeCatalogue] - got version ("+s+") and cguid ("+c+") for descriptor "+e),r.storageManager.getVersion("cguid",c).then(function(t){return t>=s?(m.warn("storageManager contains saved version that is the same or newer than requested"),u=!0,r.storageManager.get("cguid",c)):(m.warn("storageManager does not contain saved version"),(void 0!=o?r.httpRequest.post(e,{body:(0,a.default)(o)}):r.httpRequest.get(e)).then(function(e){if(e=JSON.parse(e),e.ERROR)throw new Error(e);return e}))})}).catch(function(t){var r="Unable to get descriptor for "+e+(void 0!=o?" with constraints "+o:"")+": "+t;throw m.error(r),new Error(r)});var f=l;return n&&(m.log("adding promise to attach sourcePackage"),f=l.then(function(e){return e.sourcePackage?(c=!0,e):(c=!1,r.attachRawSourcePackage(e))})),f=f.then(function(e){return(!u||u&&!c&&n)&&r.storageManager.set(e.cguid,e.version,e),t.apply(r,[e,o])})}},{key:"attachRawSourcePackage",value:function(e,t){var r=this;return m.log("attaching raw sourcePackage from:",e.sourcePackageURL),new s.default(function(n,i){(void 0!=t?r.httpRequest.post(e.sourcePackageURL,{body:(0,a.default)(t)}):r.httpRequest.get(e.sourcePackageURL)).then(function(t){t=JSON.parse(t),e.sourcePackage=t,n(e)}).catch(function(e){i(e)})})}},{key:"getHypertyDescriptor",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],r=arguments[2];return this.getDescriptor(e,this.createHyperty,t,r)}},{key:"getStubDescriptor",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],r=arguments[2];return this.getDescriptor(e,this.createStub,t,r)}},{key:"getRuntimeDescriptor",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],r=arguments[2];return this.getDescriptor(e,this.createRuntimeDescriptor,t,r)}},{key:"getDataSchemaDescriptor",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],r=arguments[2];return this.getDescriptor(e,this.createDataSchema,t,r)}},{key:"getIdpProxyDescriptor",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],r=arguments[2];return this.getDescriptor(e,this.createIdpProxy,t,r)}},{key:"createHyperty",value:function(e){var t=this._factory.createHypertyDescriptorObject(e.cguid,e.version,e.objectName,e.description,e.language,e.sourcePackageURL,e.type||e.hypertyType,e.dataObjects);t.configuration=e.configuration,t.constraints=e.constraints,t.messageSchema=e.messageSchema,t.policies=e.policies,t.signature=e.signature;var r=e.sourcePackage;return r&&(t.sourcePackage=this.createSourcePackage(r)),t}},{key:"createStub",value:function(e){var t=this._factory.createProtoStubDescriptorObject(e.cguid,e.version,e.objectName,e.description,e.language,e.sourcePackageURL,e.messageSchemas,e.configuration,e.constraints,e.hypertyType,e.dataObjects,e.interworking,e.idpProxy,e.mutualAuthentication);t.signature=e.signature;var r=e.sourcePackage;return r&&(t.sourcePackage=this.createSourcePackage(r)),t}},{key:"createRuntimeDescriptor",value:function(e){try{e.hypertyCapabilities=JSON.parse(e.hypertyCapabilities),e.protocolCapabilities=JSON.parse(e.protocolCapabilities)}catch(e){}var t=this._factory.createHypertyRuntimeDescriptorObject(e.cguid,e.version,e.objectName,e.description,e.language,e.sourcePackageURL,e.type||e.runtimeType,e.hypertyCapabilities,e.protocolCapabilities,e.p2pHandlerStub,e.p2pRequesterStub);t.signature=e.signature;var r=e.sourcePackage;return r&&(t.sourcePackage=this.createSourcePackage(r)),t}},{key:"createDataSchema",value:function(e){var t=void 0;t=e.accessControlPolicy&&e.scheme?this._factory.createHypertyDataObjectSchema(e.cguid,e.version,e.objectName,e.description,e.language,e.sourcePackageURL,e.accessControlPolicy,e.scheme):this._factory.createMessageDataObjectSchema(e.cguid,e.version,e.objectName,e.description,e.language,e.sourcePackageURL),t.signature=e.signature;var r=e.sourcePackage;if(r){t.sourcePackage=this.createSourcePackage(r);try{t.sourcePackage.sourceCode=JSON.parse(t.sourcePackage.sourceCode)}catch(e){m.log("DataSchema Source code is already parsed")}return t}return t}},{key:"createIdpProxy",value:function(e){var t=this._factory.createProtoStubDescriptorObject(e.cguid,e.version,e.objectName,e.description,e.language,e.sourcePackageURL,e.messageSchemas,e.configuration,e.constraints,e.hypertyType,e.dataObjects,e.interworking,e.idpProxy,e.mutualAuthentication);t.signature=e.signature;var r=e.sourcePackage;return r&&(r=this.createSourcePackage(r),t.sourcePackage=r),t}},{key:"createSourcePackage",value:function(e){"base64"===e.encoding&&(e.sourceCode=this.atob(e.sourceCode),e.encoding="utf-8");var t=this._factory.createSourcePackage(e.sourceCodeClassname,e.sourceCode);return e.encoding&&(t.encoding=e.encoding),e.signature&&(t.signature=e.signature),t}},{key:"getSourcePackageFromURL",value:function(e){var t=this;return m.log("getting sourcePackage from:",e),new s.default(function(r,n){t.httpRequest.get(e).then(function(e){if(e.ERROR)n(e);else{e=JSON.parse(e);var i=t.createSourcePackage(e);r(i)}}).catch(function(e){n(e)})})}},{key:"getSourceCodeFromDescriptor",value:function(e){var t=this;return new s.default(function(r,n){e.sourcePackage?r(e.sourcePackage.sourceCode):t.storageManager.getVersion(e.sourcePackageURL+"/sourceCode").then(function(i){i>=e.version?(m.log("returning cached version from storageManager"),t.storageManager.get(e.sourcePackageURL+"/sourceCode").then(function(e){r(e)}).catch(function(e){n(e)})):t.httpRequest.get(e.sourcePackageURL+"/sourceCode").then(function(i){i.ERROR?n(i):(t.storageManager.set(e.sourcePackageURL+"/sourceCode",e.version,i),r(i))}).catch(function(e){n(e)})}).catch(function(e){n(e)})})}},{key:"getTypeList",value:function(e,t){var r=this;return new s.default(function(n,i){(void 0!=t?r.httpRequest.post(e,{body:(0,a.default)(t)}):r.httpRequest.get(e)).then(function(e){e=JSON.parse(e),n(e)}).catch(function(e){i(e)})})}},{key:"deleteFromPM",value:function(e){return this.storageManager.delete(e)}},{key:"runtimeURL",set:function(e){this._runtimeURL=e},get:function(){return this._runtimeURL}}]),RuntimeCatalogue}();t.default=g,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}t.__esModule=!0;var n=r(179),i=_interopRequireDefault(n),o=r(182),a=_interopRequireDefault(o);t.default=function(){function sliceIterator(e,t){var r=[],n=!0,i=!1,o=void 0;try{for(var u,s=(0,a.default)(e);!(n=(u=s.next()).done)&&(r.push(u.value),!t||r.length!==t);n=!0);}catch(e){i=!0,o=e}finally{try{!n&&s.return&&s.return()}finally{if(i)throw o}}return r}return function(e,t){if(Array.isArray(e))return e;if((0,i.default)(Object(e)))return sliceIterator(e,t);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}()},function(e,t,r){e.exports={default:r(180),__esModule:!0}},function(e,t,r){r(47),r(45),e.exports=r(181)},function(e,t,r){var n=r(59),i=r(2)("iterator"),o=r(15);e.exports=r(0).isIterable=function(e){var t=Object(e);return void 0!==t[i]||"@@iterator"in t||o.hasOwnProperty(n(t))}},function(e,t,r){e.exports={default:r(183),__esModule:!0}},function(e,t,r){r(47),r(45),e.exports=r(184)},function(e,t,r){var n=r(7),i=r(87);e.exports=r(0).getIterator=function(e){var t=i(e);if("function"!=typeof t)throw TypeError(e+" is not iterable!");return n(t.call(e))}},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(3),i=_interopRequireDefault(n),o=r(4),a=_interopRequireDefault(o),u=r(115),s=_interopRequireDefault(u),c=r(188),l=_interopRequireDefault(c),f=r(189),p=_interopRequireDefault(f),h=r(190),d=_interopRequireDefault(h),y=r(191),v=_interopRequireDefault(y),m=r(192),g=_interopRequireDefault(m),_=r(193),b=function(){function CatalogueDataObjectFactory(){(0,i.default)(this,CatalogueDataObjectFactory)}return(0,a.default)(CatalogueDataObjectFactory,[{key:"createCatalogueDataObject",value:function(e,t,r,n,i,o,a){if(void 0===e||void 0===t||void 0===r||void 0===n||void 0===i||void 0===o||void 0===a)throw new Error("Invalid parameters!");return new s.default(e,t,r,n,i,o,a)}},{key:"createHypertyDescriptorObject",value:function(e,t,r,n,i,o,a,s){if(void 0===e||void 0===t||void 0===r||void 0===n||void 0===i||void 0===o||void 0===a||void 0===s)throw new Error("Invalid parameters!");return new p.default(e,u.CatalogueObjectType.HYPERTY,t,r,n,i,o,a,s)}},{key:"createProtoStubDescriptorObject",value:function(e,t,r,n,i,o,a,s,c,l,f,p,h,y){if(void 0===e||void 0===t||void 0===r||void 0===n||void 0===i||void 0===o||void 0===a||void 0===s||void 0===c)throw new Error("Invalid parameters!");return new d.default(e,u.CatalogueObjectType.PROTOSTUB,t,r,n,i,o,a,s,c,l,f,p,h,y)}},{key:"createHypertyRuntimeDescriptorObject",value:function(e,t,r,n,i,o,a,s,c,l,f){if(void 0===e||void 0===t||void 0===r||void 0===n||void 0===i||void 0===o||void 0===a)throw new Error("Invalid parameters!");return new v.default(e,u.CatalogueObjectType.HYPERTY_RUNTIME,t,r,n,i,o,a,s,c,l,f)}},{key:"createHypertyInterceptorDescriptorObject",value:function(e,t,r,n,i,o,a,s){if(void 0===e||void 0===t||void 0===r||void 0===n||void 0===i||void 0===o)throw new Error("Invalid parameters!");return new g.default(e,u.CatalogueObjectType.HYPERTY_INTERCEPTOR,t,r,n,i,o,a,s)}},{key:"createDataObjectSchema",value:function(e,t,r,n,i,o){if(void 0===e||void 0===t||void 0===r||void 0===n||void 0===i||void 0===o)throw new Error("Invalid parameters!");return new _.DataObjectSchema(e,u.CatalogueObjectType.HYPERTY_DATA_OBJECT,t,r,n,i,o)}},{key:"createMessageDataObjectSchema",value:function(e,t,r,n,i,o){if(void 0===e||void 0===t||void 0===r||void 0===n||void 0===i||void 0===o)throw new Error("Invalid parameters!");return new _.DataObjectSchema(e,u.CatalogueObjectType.HYPERTY_DATA_OBJECT,t,r,n,i,o)}},{key:"createHypertyDataObjectSchema",value:function(e,t,r,n,i,o,a,s){if(void 0===e||void 0===t||void 0===r||void 0===n||void 0===i||void 0===o||void 0===s||void 0===a)throw new Error("Invalid parameters!");return s===_.DataUrlScheme.COMM?new _.CommunicationDataObjectSchema(e,u.CatalogueObjectType.HYPERTY_DATA_OBJECT,t,r,n,i,o,s,a):s===_.DataUrlScheme.CONNECTION?new _.ConnectionDataObjectSchema(e,u.CatalogueObjectType.HYPERTY_DATA_OBJECT,t,r,n,i,o,s,a):s===_.DataUrlScheme.CTXT?new _.ContextDataObjectSchema(e,u.CatalogueObjectType.HYPERTY_DATA_OBJECT,t,r,n,i,o,s,a):s===_.DataUrlScheme.IDENTITY?new _.IdentityDataObjectSchema(e,u.CatalogueObjectType.HYPERTY_DATA_OBJECT,t,r,n,i,o,s,a):void 0}},{key:"createSourcePackage",value:function(e,t){if(void 0===t||void 0===e)throw new Error("Invalid parameters!");return new l.default(e,t)}}]),CatalogueDataObjectFactory}();t.default=b,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0}),t.RethinkObject=void 0;var n=r(69),i=_interopRequireDefault(n),o=r(3),a=_interopRequireDefault(o),u=r(4),s=_interopRequireDefault(u),c=r(187),l=_interopRequireDefault(c),f=t.RethinkObject=function(){function RethinkObject(){(0,a.default)(this,RethinkObject)}return(0,s.default)(RethinkObject,[{key:"validate",value:function(e){l.default.addSchema(e.id,e);var t=l.default.validateMultiple(JSON.parse((0,i.default)(this)),e);return t.errors.forEach(function(e){delete e.stack}),!t.valid||t.missing.length,t.valid}}]),RethinkObject}();t.default=f},function(e,t,r){var n,i,o;!function(r,a){i=[],n=a,void 0!==(o="function"==typeof n?n.apply(t,i):n)&&(e.exports=o)}(0,function(){function notReallyPercentEncode(e){return encodeURI(e).replace(/%25[0-9][0-9]/g,function(e){return"%"+e.substring(3)})}function uriTemplateSubstitution(r){var n="";e[r.charAt(0)]&&(n=r.charAt(0),r=r.substring(1));var i="",o="",a=!0,u=!1,s=!1;"+"===n?a=!1:"."===n?(o=".",i="."):"/"===n?(o="/",i="/"):"#"===n?(o="#",a=!1):";"===n?(o=";",i=";",u=!0,s=!0):"?"===n?(o="?",i="&",u=!0):"&"===n&&(o="&",i="&",u=!0);for(var c=[],l=r.split(","),f=[],p={},h=0;h<l.length;h++){var d=l[h],y=null;if(-1!==d.indexOf(":")){var v=d.split(":");d=v[0],y=parseInt(v[1],10)}for(var m={};t[d.charAt(d.length-1)];)m[d.charAt(d.length-1)]=!0,d=d.substring(0,d.length-1);var g={truncate:y,name:d,suffices:m};f.push(g),p[d]=g,c.push(d)}var _=function(e){for(var t="",r=0,n=0;n<f.length;n++){var c=f[n],l=e(c.name);if(null===l||void 0===l||Array.isArray(l)&&0===l.length||"object"==typeof l&&0===Object.keys(l).length)r++;else if(t+=n===r?o:i||",",Array.isArray(l)){u&&(t+=c.name+"=");for(var p=0;p<l.length;p++)p>0&&(t+=c.suffices["*"]?i||",":",",c.suffices["*"]&&u&&(t+=c.name+"=")),t+=a?encodeURIComponent(l[p]).replace(/!/g,"%21"):notReallyPercentEncode(l[p])}else if("object"==typeof l){u&&!c.suffices["*"]&&(t+=c.name+"=");var h=!0;for(var d in l)h||(t+=c.suffices["*"]?i||",":","),h=!1,t+=a?encodeURIComponent(d).replace(/!/g,"%21"):notReallyPercentEncode(d),t+=c.suffices["*"]?"=":",",t+=a?encodeURIComponent(l[d]).replace(/!/g,"%21"):notReallyPercentEncode(l[d])}else u&&(t+=c.name,s&&""===l||(t+="=")),null!=c.truncate&&(l=l.substring(0,c.truncate)),t+=a?encodeURIComponent(l).replace(/!/g,"%21"):notReallyPercentEncode(l)}return t};return _.varNames=c,{prefix:o,substitution:_}}function UriTemplate(e){if(!(this instanceof UriTemplate))return new UriTemplate(e);for(var t=e.split("{"),r=[t.shift()],n=[],i=[],o=[];t.length>0;){var a=t.shift(),u=a.split("}")[0],s=a.substring(u.length+1),c=uriTemplateSubstitution(u);i.push(c.substitution),n.push(c.prefix),r.push(s),o=o.concat(c.substitution.varNames)}this.fill=function(e){for(var t=r[0],n=0;n<i.length;n++){t+=(0,i[n])(e),t+=r[n+1]}return t},this.varNames=o,this.template=e}function recursiveCompare(e,t){if(e===t)return!0;if(e&&t&&"object"==typeof e&&"object"==typeof t){if(Array.isArray(e)!==Array.isArray(t))return!1;if(Array.isArray(e)){if(e.length!==t.length)return!1;for(var r=0;r<e.length;r++)if(!recursiveCompare(e[r],t[r]))return!1}else{var n;for(n in e)if(void 0===t[n]&&void 0!==e[n])return!1;for(n in t)if(void 0===e[n]&&void 0!==t[n])return!1;for(n in e)if(!recursiveCompare(e[n],t[n]))return!1}return!0}return!1}function parseURI(e){var t=String(e).replace(/^\s+|\s+$/g,"").match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);return t?{href:t[0]||"",protocol:t[1]||"",authority:t[2]||"",host:t[3]||"",hostname:t[4]||"",port:t[5]||"",pathname:t[6]||"",search:t[7]||"",hash:t[8]||""}:null}function resolveUrl(e,t){return t=parseURI(t||""),e=parseURI(e||""),t&&e?(t.protocol||e.protocol)+(t.protocol||t.authority?t.authority:e.authority)+function(e){var t=[];return e.replace(/^(\.\.?(\/|$))+/,"").replace(/\/(\.(\/|$))+/g,"/").replace(/\/\.\.$/,"/../").replace(/\/?[^\/]*/g,function(e){"/.."===e?t.pop():t.push(e)}),t.join("").replace(/^\//,"/"===e.charAt(0)?"/":"")}(t.protocol||t.authority||"/"===t.pathname.charAt(0)?t.pathname:t.pathname?(e.authority&&!e.pathname?"/":"")+e.pathname.slice(0,e.pathname.lastIndexOf("/")+1)+t.pathname:e.pathname)+(t.protocol||t.authority||t.pathname?t.search:t.search||e.search)+t.hash:null}function getDocumentUri(e){return e.split("#")[0]}function normSchema(e,t){if(e&&"object"==typeof e)if(void 0===t?t=e.id:"string"==typeof e.id&&(t=resolveUrl(t,e.id),e.id=t),Array.isArray(e))for(var r=0;r<e.length;r++)normSchema(e[r],t);else{"string"==typeof e.$ref&&(e.$ref=resolveUrl(t,e.$ref));for(var n in e)"enum"!==n&&normSchema(e[n],t)}}function defaultErrorReporter(e){e=e||"en";var t=c[e];return function(e){var r=t[e.code]||s[e.code];if("string"!=typeof r)return"Unknown error code "+e.code+": "+JSON.stringify(e.messageParams);var n=e.params;return r.replace(/\{([^{}]*)\}/g,function(e,t){var r=n[t];return"string"==typeof r||"number"==typeof r?r:e})}}function ValidationError(e,t,r,n,i){if(Error.call(this),void 0===e)throw new Error("No error code supplied: "+n);this.message="",this.params=t,this.code=e,this.dataPath=r||"",this.schemaPath=n||"",this.subErrors=i||null;var o=new Error(this.message);if(this.stack=o.stack||o.stacktrace,!this.stack)try{throw o}catch(o){this.stack=o.stack||o.stacktrace}}function isTrustedUrl(e,t){if(t.substring(0,e.length)===e){var r=t.substring(e.length);if(t.length>0&&"/"===t.charAt(e.length-1)||"#"===r.charAt(0)||"?"===r.charAt(0))return!0}return!1}function createApi(e){var t,n,i=new r,u={setErrorReporter:function(e){return"string"==typeof e?this.language(e):(n=e,!0)},addFormat:function(){i.addFormat.apply(i,arguments)},language:function(e){return e?(c[e]||(e=e.split("-")[0]),!!c[e]&&(t=e,e)):t},addLanguage:function(e,t){var r;for(r in o)t[r]&&!t[o[r]]&&(t[o[r]]=t[r]);var n=e.split("-")[0];if(c[n]){c[e]=Object.create(c[n]);for(r in t)void 0===c[n][r]&&(c[n][r]=t[r]),c[e][r]=t[r]}else c[e]=t,c[n]=t;return this},freshApi:function(e){var t=createApi();return e&&t.language(e),t},validate:function(e,o,a,u){var s=defaultErrorReporter(t),c=n?function(e,t,r){return n(e,t,r)||s(e,t,r)}:s,l=new r(i,!1,c,a,u);"string"==typeof o&&(o={$ref:o}),l.addSchema("",o);var f=l.validateAll(e,o,null,null,"");return!f&&u&&(f=l.banUnknownProperties(e,o)),this.error=f,this.missing=l.missing,this.valid=null===f,this.valid},validateResult:function(){var e={toString:function(){return this.valid?"valid":this.error.message}};return this.validate.apply(e,arguments),e},validateMultiple:function(e,o,a,u){var s=defaultErrorReporter(t),c=n?function(e,t,r){return n(e,t,r)||s(e,t,r)}:s,l=new r(i,!0,c,a,u);"string"==typeof o&&(o={$ref:o}),l.addSchema("",o),l.validateAll(e,o,null,null,""),u&&l.banUnknownProperties(e,o);var f={toString:function(){return this.valid?"valid":this.error.message}};return f.errors=l.errors,f.missing=l.missing,f.valid=0===f.errors.length,f},addSchema:function(){return i.addSchema.apply(i,arguments)},getSchema:function(){return i.getSchema.apply(i,arguments)},getSchemaMap:function(){return i.getSchemaMap.apply(i,arguments)},getSchemaUris:function(){return i.getSchemaUris.apply(i,arguments)},getMissingUris:function(){return i.getMissingUris.apply(i,arguments)},dropSchemas:function(){i.dropSchemas.apply(i,arguments)},defineKeyword:function(){i.defineKeyword.apply(i,arguments)},defineError:function(e,t,r){if("string"!=typeof e||!/^[A-Z]+(_[A-Z]+)*$/.test(e))throw new Error("Code name must be a string in UPPER_CASE_WITH_UNDERSCORES");if("number"!=typeof t||t%1!=0||t<1e4)throw new Error("Code number must be an integer > 10000");if(void 0!==o[e])throw new Error("Error already defined: "+e+" as "+o[e]);if(void 0!==a[t])throw new Error("Error code already used: "+a[t]+" as "+t);o[e]=t,a[t]=e,s[e]=s[t]=r;for(var n in c){var i=c[n];i[e]&&(i[t]=i[t]||i[e])}},reset:function(){i.reset(),this.error=null,this.missing=[],this.valid=!0},missing:[],error:null,valid:!0,normSchema:normSchema,resolveUrl:resolveUrl,getDocumentUri:getDocumentUri,errorCodes:o};return u.language(e||"en"),u}Object.keys||(Object.keys=function(){var e=Object.prototype.hasOwnProperty,t=!{toString:null}.propertyIsEnumerable("toString"),r=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],n=r.length;return function(i){if("object"!=typeof i&&"function"!=typeof i||null===i)throw new TypeError("Object.keys called on non-object");var o=[];for(var a in i)e.call(i,a)&&o.push(a);if(t)for(var u=0;u<n;u++)e.call(i,r[u])&&o.push(r[u]);return o}}()),Object.create||(Object.create=function(){function F(){}return function(e){if(1!==arguments.length)throw new Error("Object.create implementation only accepts one parameter.");return F.prototype=e,new F}}()),Array.isArray||(Array.isArray=function(e){return"[object Array]"===Object.prototype.toString.call(e)}),Array.prototype.indexOf||(Array.prototype.indexOf=function(e){if(null===this)throw new TypeError;var t=Object(this),r=t.length>>>0;if(0===r)return-1;var n=0;if(arguments.length>1&&(n=Number(arguments[1]),n!==n?n=0:0!==n&&n!==1/0&&n!==-1/0&&(n=(n>0||-1)*Math.floor(Math.abs(n)))),n>=r)return-1;for(var i=n>=0?n:Math.max(r-Math.abs(n),0);i<r;i++)if(i in t&&t[i]===e)return i;return-1}),Object.isFrozen||(Object.isFrozen=function(e){for(var t="tv4_test_frozen_key";e.hasOwnProperty(t);)t+=Math.random();try{return e[t]=!0,delete e[t],!1}catch(e){return!0}});var e={"+":!0,"#":!0,".":!0,"/":!0,";":!0,"?":!0,"&":!0},t={"*":!0};UriTemplate.prototype={toString:function(){return this.template},fillFromObject:function(e){return this.fill(function(t){return e[t]})}};var r=function(e,t,r,n,i){if(this.missing=[],this.missingMap={},this.formatValidators=e?Object.create(e.formatValidators):{},this.schemas=e?Object.create(e.schemas):{},this.collectMultiple=t,this.errors=[],this.handleError=t?this.collectError:this.returnError,n&&(this.checkRecursive=!0,this.scanned=[],this.scannedFrozen=[],this.scannedFrozenSchemas=[],this.scannedFrozenValidationErrors=[],this.validatedSchemasKey="tv4_validation_id",this.validationErrorsKey="tv4_validation_errors_id"),i&&(this.trackUnknownProperties=!0,this.knownPropertyPaths={},this.unknownPropertyPaths={}),this.errorReporter=r||defaultErrorReporter("en"),"string"==typeof this.errorReporter)throw new Error("debug");if(this.definedKeywords={},e)for(var o in e.definedKeywords)this.definedKeywords[o]=e.definedKeywords[o].slice(0)};r.prototype.defineKeyword=function(e,t){this.definedKeywords[e]=this.definedKeywords[e]||[],this.definedKeywords[e].push(t)},r.prototype.createError=function(e,t,r,n,i,o,a){var u=new ValidationError(e,t,r,n,i);return u.message=this.errorReporter(u,o,a),u},r.prototype.returnError=function(e){return e},r.prototype.collectError=function(e){return e&&this.errors.push(e),null},r.prototype.prefixErrors=function(e,t,r){for(var n=e;n<this.errors.length;n++)this.errors[n]=this.errors[n].prefixWith(t,r);return this},r.prototype.banUnknownProperties=function(e,t){for(var r in this.unknownPropertyPaths){var n=this.createError(o.UNKNOWN_PROPERTY,{path:r},r,"",null,e,t),i=this.handleError(n);if(i)return i}return null},r.prototype.addFormat=function(e,t){if("object"==typeof e){for(var r in e)this.addFormat(r,e[r]);return this}this.formatValidators[e]=t},r.prototype.resolveRefs=function(e,t){if(void 0!==e.$ref){if(t=t||{},t[e.$ref])return this.createError(o.CIRCULAR_REFERENCE,{urls:Object.keys(t).join(", ")},"","",null,void 0,e);t[e.$ref]=!0,e=this.getSchema(e.$ref,t)}return e},r.prototype.getSchema=function(e,t){var r;if(void 0!==this.schemas[e])return r=this.schemas[e],this.resolveRefs(r,t);var n=e,i="";if(-1!==e.indexOf("#")&&(i=e.substring(e.indexOf("#")+1),n=e.substring(0,e.indexOf("#"))),"object"==typeof this.schemas[n]){r=this.schemas[n];var o=decodeURIComponent(i);if(""===o)return this.resolveRefs(r,t);if("/"!==o.charAt(0))return;for(var a=o.split("/").slice(1),u=0;u<a.length;u++){var s=a[u].replace(/~1/g,"/").replace(/~0/g,"~");if(void 0===r[s]){r=void 0;break}r=r[s]}if(void 0!==r)return this.resolveRefs(r,t)}void 0===this.missing[n]&&(this.missing.push(n),this.missing[n]=n,this.missingMap[n]=n)},r.prototype.searchSchemas=function(e,t){if(Array.isArray(e))for(var r=0;r<e.length;r++)this.searchSchemas(e[r],t);else if(e&&"object"==typeof e){"string"==typeof e.id&&isTrustedUrl(t,e.id)&&void 0===this.schemas[e.id]&&(this.schemas[e.id]=e);for(var n in e)if("enum"!==n)if("object"==typeof e[n])this.searchSchemas(e[n],t);else if("$ref"===n){var i=getDocumentUri(e[n]);i&&void 0===this.schemas[i]&&void 0===this.missingMap[i]&&(this.missingMap[i]=i)}}},r.prototype.addSchema=function(e,t){if("string"!=typeof e||void 0===t){if("object"!=typeof e||"string"!=typeof e.id)return;t=e,e=t.id}e===getDocumentUri(e)+"#"&&(e=getDocumentUri(e)),this.schemas[e]=t,delete this.missingMap[e],normSchema(t,e),this.searchSchemas(t,e)},r.prototype.getSchemaMap=function(){var e={};for(var t in this.schemas)e[t]=this.schemas[t];return e},r.prototype.getSchemaUris=function(e){var t=[];for(var r in this.schemas)e&&!e.test(r)||t.push(r);return t},r.prototype.getMissingUris=function(e){var t=[];for(var r in this.missingMap)e&&!e.test(r)||t.push(r);return t},r.prototype.dropSchemas=function(){this.schemas={},this.reset()},r.prototype.reset=function(){this.missing=[],this.missingMap={},this.errors=[]},r.prototype.validateAll=function(e,t,r,n,i){var o;if(!(t=this.resolveRefs(t)))return null;if(t instanceof ValidationError)return this.errors.push(t),t;var a,u=this.errors.length,s=null,c=null;if(this.checkRecursive&&e&&"object"==typeof e){if(o=!this.scanned.length,e[this.validatedSchemasKey]){var l=e[this.validatedSchemasKey].indexOf(t);if(-1!==l)return this.errors=this.errors.concat(e[this.validationErrorsKey][l]),null}if(Object.isFrozen(e)&&-1!==(a=this.scannedFrozen.indexOf(e))){var f=this.scannedFrozenSchemas[a].indexOf(t);if(-1!==f)return this.errors=this.errors.concat(this.scannedFrozenValidationErrors[a][f]),null}if(this.scanned.push(e),Object.isFrozen(e))-1===a&&(a=this.scannedFrozen.length,this.scannedFrozen.push(e),this.scannedFrozenSchemas.push([])),s=this.scannedFrozenSchemas[a].length,this.scannedFrozenSchemas[a][s]=t,this.scannedFrozenValidationErrors[a][s]=[];else{if(!e[this.validatedSchemasKey])try{Object.defineProperty(e,this.validatedSchemasKey,{value:[],configurable:!0}),Object.defineProperty(e,this.validationErrorsKey,{value:[],configurable:!0})}catch(t){e[this.validatedSchemasKey]=[],e[this.validationErrorsKey]=[]}c=e[this.validatedSchemasKey].length,e[this.validatedSchemasKey][c]=t,e[this.validationErrorsKey][c]=[]}}var p=this.errors.length,h=this.validateBasic(e,t,i)||this.validateNumeric(e,t,i)||this.validateString(e,t,i)||this.validateArray(e,t,i)||this.validateObject(e,t,i)||this.validateCombinations(e,t,i)||this.validateHypermedia(e,t,i)||this.validateFormat(e,t,i)||this.validateDefinedKeywords(e,t,i)||null;if(o){for(;this.scanned.length;){delete this.scanned.pop()[this.validatedSchemasKey]}this.scannedFrozen=[],this.scannedFrozenSchemas=[]}if(h||p!==this.errors.length)for(;r&&r.length||n&&n.length;){var d=r&&r.length?""+r.pop():null,y=n&&n.length?""+n.pop():null;h&&(h=h.prefixWith(d,y)),this.prefixErrors(p,d,y)}return null!==s?this.scannedFrozenValidationErrors[a][s]=this.errors.slice(u):null!==c&&(e[this.validationErrorsKey][c]=this.errors.slice(u)),this.handleError(h)},r.prototype.validateFormat=function(e,t){if("string"!=typeof t.format||!this.formatValidators[t.format])return null;var r=this.formatValidators[t.format].call(null,e,t);return"string"==typeof r||"number"==typeof r?this.createError(o.FORMAT_CUSTOM,{message:r},"","/format",null,e,t):r&&"object"==typeof r?this.createError(o.FORMAT_CUSTOM,{message:r.message||"?"},r.dataPath||"",r.schemaPath||"/format",null,e,t):null},r.prototype.validateDefinedKeywords=function(e,t,r){for(var n in this.definedKeywords)if(void 0!==t[n])for(var i=this.definedKeywords[n],a=0;a<i.length;a++){var u=i[a],s=u(e,t[n],t,r);if("string"==typeof s||"number"==typeof s)return this.createError(o.KEYWORD_CUSTOM,{key:n,message:s},"","",null,e,t).prefixWith(null,n);if(s&&"object"==typeof s){var c=s.code;if("string"==typeof c){if(!o[c])throw new Error("Undefined error code (use defineError): "+c);c=o[c]}else"number"!=typeof c&&(c=o.KEYWORD_CUSTOM);var l="object"==typeof s.message?s.message:{key:n,message:s.message||"?"},f=s.schemaPath||"/"+n.replace(/~/g,"~0").replace(/\//g,"~1");return this.createError(c,l,s.dataPath||null,f,null,e,t)}}return null},r.prototype.validateBasic=function(e,t,r){var n;return(n=this.validateType(e,t,r))?n.prefixWith(null,"type"):(n=this.validateEnum(e,t,r))?n.prefixWith(null,"type"):null},r.prototype.validateType=function(e,t){if(void 0===t.type)return null;var r=typeof e;null===e?r="null":Array.isArray(e)&&(r="array");var n=t.type;Array.isArray(n)||(n=[n]);for(var i=0;i<n.length;i++){var a=n[i];if(a===r||"integer"===a&&"number"===r&&e%1==0)return null}return this.createError(o.INVALID_TYPE,{type:r,expected:n.join("/")},"","",null,e,t)},r.prototype.validateEnum=function(e,t){if(void 0===t.enum)return null;for(var r=0;r<t.enum.length;r++){if(recursiveCompare(e,t.enum[r]))return null}return this.createError(o.ENUM_MISMATCH,{value:"undefined"!=typeof JSON?JSON.stringify(e):e},"","",null,e,t)},r.prototype.validateNumeric=function(e,t,r){return this.validateMultipleOf(e,t,r)||this.validateMinMax(e,t,r)||this.validateNaN(e,t,r)||null};var n=Math.pow(2,-51),i=1-n;r.prototype.validateMultipleOf=function(e,t){var r=t.multipleOf||t.divisibleBy;if(void 0===r)return null;if("number"==typeof e){var a=e/r%1;if(a>=n&&a<i)return this.createError(o.NUMBER_MULTIPLE_OF,{value:e,multipleOf:r},"","",null,e,t)}return null},r.prototype.validateMinMax=function(e,t){if("number"!=typeof e)return null;if(void 0!==t.minimum){if(e<t.minimum)return this.createError(o.NUMBER_MINIMUM,{value:e,minimum:t.minimum},"","/minimum",null,e,t);if(t.exclusiveMinimum&&e===t.minimum)return this.createError(o.NUMBER_MINIMUM_EXCLUSIVE,{value:e,minimum:t.minimum},"","/exclusiveMinimum",null,e,t)}if(void 0!==t.maximum){if(e>t.maximum)return this.createError(o.NUMBER_MAXIMUM,{value:e,maximum:t.maximum},"","/maximum",null,e,t);if(t.exclusiveMaximum&&e===t.maximum)return this.createError(o.NUMBER_MAXIMUM_EXCLUSIVE,{value:e,maximum:t.maximum},"","/exclusiveMaximum",null,e,t)}return null},r.prototype.validateNaN=function(e,t){return"number"!=typeof e?null:!0===isNaN(e)||e===1/0||e===-1/0?this.createError(o.NUMBER_NOT_A_NUMBER,{value:e},"","/type",null,e,t):null},r.prototype.validateString=function(e,t,r){return this.validateStringLength(e,t,r)||this.validateStringPattern(e,t,r)||null},r.prototype.validateStringLength=function(e,t){return"string"!=typeof e?null:void 0!==t.minLength&&e.length<t.minLength?this.createError(o.STRING_LENGTH_SHORT,{length:e.length,minimum:t.minLength},"","/minLength",null,e,t):void 0!==t.maxLength&&e.length>t.maxLength?this.createError(o.STRING_LENGTH_LONG,{length:e.length,maximum:t.maxLength},"","/maxLength",null,e,t):null},r.prototype.validateStringPattern=function(e,t){if("string"!=typeof e||"string"!=typeof t.pattern&&!(t.pattern instanceof RegExp))return null;var r;if(t.pattern instanceof RegExp)r=t.pattern;else{var n,i="",a=t.pattern.match(/^\/(.+)\/([img]*)$/);a?(n=a[1],i=a[2]):n=t.pattern,r=new RegExp(n,i)}return r.test(e)?null:this.createError(o.STRING_PATTERN,{pattern:t.pattern},"","/pattern",null,e,t)},r.prototype.validateArray=function(e,t,r){return Array.isArray(e)?this.validateArrayLength(e,t,r)||this.validateArrayUniqueItems(e,t,r)||this.validateArrayItems(e,t,r)||null:null},r.prototype.validateArrayLength=function(e,t){var r;return void 0!==t.minItems&&e.length<t.minItems&&(r=this.createError(o.ARRAY_LENGTH_SHORT,{length:e.length,minimum:t.minItems},"","/minItems",null,e,t),this.handleError(r))?r:void 0!==t.maxItems&&e.length>t.maxItems&&(r=this.createError(o.ARRAY_LENGTH_LONG,{length:e.length,maximum:t.maxItems},"","/maxItems",null,e,t),this.handleError(r))?r:null},r.prototype.validateArrayUniqueItems=function(e,t){if(t.uniqueItems)for(var r=0;r<e.length;r++)for(var n=r+1;n<e.length;n++)if(recursiveCompare(e[r],e[n])){var i=this.createError(o.ARRAY_UNIQUE,{match1:r,match2:n},"","/uniqueItems",null,e,t);if(this.handleError(i))return i}return null},r.prototype.validateArrayItems=function(e,t,r){if(void 0===t.items)return null;var n,i;if(Array.isArray(t.items)){for(i=0;i<e.length;i++)if(i<t.items.length){if(n=this.validateAll(e[i],t.items[i],[i],["items",i],r+"/"+i))return n}else if(void 0!==t.additionalItems)if("boolean"==typeof t.additionalItems){if(!t.additionalItems&&(n=this.createError(o.ARRAY_ADDITIONAL_ITEMS,{},"/"+i,"/additionalItems",null,e,t),this.handleError(n)))return n}else if(n=this.validateAll(e[i],t.additionalItems,[i],["additionalItems"],r+"/"+i))return n}else for(i=0;i<e.length;i++)if(n=this.validateAll(e[i],t.items,[i],["items"],r+"/"+i))return n;return null},r.prototype.validateObject=function(e,t,r){return"object"!=typeof e||null===e||Array.isArray(e)?null:this.validateObjectMinMaxProperties(e,t,r)||this.validateObjectRequiredProperties(e,t,r)||this.validateObjectProperties(e,t,r)||this.validateObjectDependencies(e,t,r)||null},r.prototype.validateObjectMinMaxProperties=function(e,t){var r,n=Object.keys(e);return void 0!==t.minProperties&&n.length<t.minProperties&&(r=this.createError(o.OBJECT_PROPERTIES_MINIMUM,{propertyCount:n.length,minimum:t.minProperties},"","/minProperties",null,e,t),this.handleError(r))?r:void 0!==t.maxProperties&&n.length>t.maxProperties&&(r=this.createError(o.OBJECT_PROPERTIES_MAXIMUM,{propertyCount:n.length,maximum:t.maxProperties},"","/maxProperties",null,e,t),this.handleError(r))?r:null},r.prototype.validateObjectRequiredProperties=function(e,t){if(void 0!==t.required)for(var r=0;r<t.required.length;r++){var n=t.required[r];if(void 0===e[n]){var i=this.createError(o.OBJECT_REQUIRED,{key:n},"","/required/"+r,null,e,t);if(this.handleError(i))return i}}return null},r.prototype.validateObjectProperties=function(e,t,r){var n;for(var i in e){var a=r+"/"+i.replace(/~/g,"~0").replace(/\//g,"~1"),u=!1;if(void 0!==t.properties&&void 0!==t.properties[i]&&(u=!0,n=this.validateAll(e[i],t.properties[i],[i],["properties",i],a)))return n;if(void 0!==t.patternProperties)for(var s in t.patternProperties){var c=new RegExp(s);if(c.test(i)&&(u=!0,n=this.validateAll(e[i],t.patternProperties[s],[i],["patternProperties",s],a)))return n}if(u)this.trackUnknownProperties&&(this.knownPropertyPaths[a]=!0,delete this.unknownPropertyPaths[a]);else if(void 0!==t.additionalProperties){if(this.trackUnknownProperties&&(this.knownPropertyPaths[a]=!0,delete this.unknownPropertyPaths[a]),"boolean"==typeof t.additionalProperties){if(!t.additionalProperties&&(n=this.createError(o.OBJECT_ADDITIONAL_PROPERTIES,{key:i},"","/additionalProperties",null,e,t).prefixWith(i,null),this.handleError(n)))return n}else if(n=this.validateAll(e[i],t.additionalProperties,[i],["additionalProperties"],a))return n}else this.trackUnknownProperties&&!this.knownPropertyPaths[a]&&(this.unknownPropertyPaths[a]=!0)}return null},r.prototype.validateObjectDependencies=function(e,t,r){var n;if(void 0!==t.dependencies)for(var i in t.dependencies)if(void 0!==e[i]){var a=t.dependencies[i];if("string"==typeof a){if(void 0===e[a]&&(n=this.createError(o.OBJECT_DEPENDENCY_KEY,{key:i,missing:a},"","",null,e,t).prefixWith(null,i).prefixWith(null,"dependencies"),this.handleError(n)))return n}else if(Array.isArray(a))for(var u=0;u<a.length;u++){var s=a[u];if(void 0===e[s]&&(n=this.createError(o.OBJECT_DEPENDENCY_KEY,{key:i,missing:s},"","/"+u,null,e,t).prefixWith(null,i).prefixWith(null,"dependencies"),this.handleError(n)))return n}else if(n=this.validateAll(e,a,[],["dependencies",i],r))return n}return null},r.prototype.validateCombinations=function(e,t,r){return this.validateAllOf(e,t,r)||this.validateAnyOf(e,t,r)||this.validateOneOf(e,t,r)||this.validateNot(e,t,r)||null},r.prototype.validateAllOf=function(e,t,r){if(void 0===t.allOf)return null;for(var n,i=0;i<t.allOf.length;i++){var o=t.allOf[i];if(n=this.validateAll(e,o,[],["allOf",i],r))return n}return null},r.prototype.validateAnyOf=function(e,t,r){if(void 0===t.anyOf)return null;var n,i,a=[],u=this.errors.length;this.trackUnknownProperties&&(n=this.unknownPropertyPaths,i=this.knownPropertyPaths);for(var s=!0,c=0;c<t.anyOf.length;c++){this.trackUnknownProperties&&(this.unknownPropertyPaths={},this.knownPropertyPaths={});var l=t.anyOf[c],f=this.errors.length,p=this.validateAll(e,l,[],["anyOf",c],r);if(null===p&&f===this.errors.length){if(this.errors=this.errors.slice(0,u),this.trackUnknownProperties){for(var h in this.knownPropertyPaths)i[h]=!0,delete n[h];for(var d in this.unknownPropertyPaths)i[d]||(n[d]=!0);s=!1;continue}return null}p&&a.push(p.prefixWith(null,""+c).prefixWith(null,"anyOf"))}return this.trackUnknownProperties&&(this.unknownPropertyPaths=n,this.knownPropertyPaths=i),s?(a=a.concat(this.errors.slice(u)),this.errors=this.errors.slice(0,u),this.createError(o.ANY_OF_MISSING,{},"","/anyOf",a,e,t)):void 0},r.prototype.validateOneOf=function(e,t,r){if(void 0===t.oneOf)return null;var n,i,a=null,u=[],s=this.errors.length;this.trackUnknownProperties&&(n=this.unknownPropertyPaths,i=this.knownPropertyPaths);for(var c=0;c<t.oneOf.length;c++){this.trackUnknownProperties&&(this.unknownPropertyPaths={},this.knownPropertyPaths={});var l=t.oneOf[c],f=this.errors.length,p=this.validateAll(e,l,[],["oneOf",c],r);if(null===p&&f===this.errors.length){if(null!==a)return this.errors=this.errors.slice(0,s),this.createError(o.ONE_OF_MULTIPLE,{index1:a,index2:c},"","/oneOf",null,e,t);if(a=c,this.trackUnknownProperties){for(var h in this.knownPropertyPaths)i[h]=!0,delete n[h];for(var d in this.unknownPropertyPaths)i[d]||(n[d]=!0)}}else p&&u.push(p)}return this.trackUnknownProperties&&(this.unknownPropertyPaths=n,this.knownPropertyPaths=i),null===a?(u=u.concat(this.errors.slice(s)),this.errors=this.errors.slice(0,s),this.createError(o.ONE_OF_MISSING,{},"","/oneOf",u,e,t)):(this.errors=this.errors.slice(0,s),null)},r.prototype.validateNot=function(e,t,r){if(void 0===t.not)return null;var n,i,a=this.errors.length;this.trackUnknownProperties&&(n=this.unknownPropertyPaths,i=this.knownPropertyPaths,this.unknownPropertyPaths={},this.knownPropertyPaths={});var u=this.validateAll(e,t.not,null,null,r),s=this.errors.slice(a);return this.errors=this.errors.slice(0,a),this.trackUnknownProperties&&(this.unknownPropertyPaths=n,this.knownPropertyPaths=i),null===u&&0===s.length?this.createError(o.NOT_PASSED,{},"","/not",null,e,t):null},r.prototype.validateHypermedia=function(e,t,r){if(!t.links)return null;for(var n,i=0;i<t.links.length;i++){var o=t.links[i];if("describedby"===o.rel){for(var a=new UriTemplate(o.href),u=!0,s=0;s<a.varNames.length;s++)if(!(a.varNames[s]in e)){u=!1;break}if(u){var c=a.fillFromObject(e),l={$ref:c};if(n=this.validateAll(e,l,[],["links",i],r))return n}}}};var o={INVALID_TYPE:0,ENUM_MISMATCH:1,ANY_OF_MISSING:10,ONE_OF_MISSING:11,ONE_OF_MULTIPLE:12,NOT_PASSED:13,NUMBER_MULTIPLE_OF:100,NUMBER_MINIMUM:101,NUMBER_MINIMUM_EXCLUSIVE:102,NUMBER_MAXIMUM:103,NUMBER_MAXIMUM_EXCLUSIVE:104,NUMBER_NOT_A_NUMBER:105,STRING_LENGTH_SHORT:200,STRING_LENGTH_LONG:201,STRING_PATTERN:202,OBJECT_PROPERTIES_MINIMUM:300,OBJECT_PROPERTIES_MAXIMUM:301,OBJECT_REQUIRED:302,OBJECT_ADDITIONAL_PROPERTIES:303,OBJECT_DEPENDENCY_KEY:304,ARRAY_LENGTH_SHORT:400,ARRAY_LENGTH_LONG:401,ARRAY_UNIQUE:402,ARRAY_ADDITIONAL_ITEMS:403,FORMAT_CUSTOM:500,KEYWORD_CUSTOM:501,CIRCULAR_REFERENCE:600,UNKNOWN_PROPERTY:1e3},a={};for(var u in o)a[o[u]]=u;var s={INVALID_TYPE:"Invalid type: {type} (expected {expected})",ENUM_MISMATCH:"No enum match for: {value}",ANY_OF_MISSING:'Data does not match any schemas from "anyOf"',ONE_OF_MISSING:'Data does not match any schemas from "oneOf"',ONE_OF_MULTIPLE:'Data is valid against more than one schema from "oneOf": indices {index1} and {index2}',NOT_PASSED:'Data matches schema from "not"',NUMBER_MULTIPLE_OF:"Value {value} is not a multiple of {multipleOf}",NUMBER_MINIMUM:"Value {value} is less than minimum {minimum}",NUMBER_MINIMUM_EXCLUSIVE:"Value {value} is equal to exclusive minimum {minimum}",NUMBER_MAXIMUM:"Value {value} is greater than maximum {maximum}",NUMBER_MAXIMUM_EXCLUSIVE:"Value {value} is equal to exclusive maximum {maximum}",NUMBER_NOT_A_NUMBER:"Value {value} is not a valid number",STRING_LENGTH_SHORT:"String is too short ({length} chars), minimum {minimum}",STRING_LENGTH_LONG:"String is too long ({length} chars), maximum {maximum}",STRING_PATTERN:"String does not match pattern: {pattern}",OBJECT_PROPERTIES_MINIMUM:"Too few properties defined ({propertyCount}), minimum {minimum}",OBJECT_PROPERTIES_MAXIMUM:"Too many properties defined ({propertyCount}), maximum {maximum}",OBJECT_REQUIRED:"Missing required property: {key}",OBJECT_ADDITIONAL_PROPERTIES:"Additional properties not allowed",OBJECT_DEPENDENCY_KEY:"Dependency failed - key must exist: {missing} (due to key: {key})",ARRAY_LENGTH_SHORT:"Array is too short ({length}), minimum {minimum}",ARRAY_LENGTH_LONG:"Array is too long ({length}), maximum {maximum}",ARRAY_UNIQUE:"Array items are not unique (indices {match1} and {match2})",ARRAY_ADDITIONAL_ITEMS:"Additional items not allowed",FORMAT_CUSTOM:"Format validation failed ({message})",KEYWORD_CUSTOM:"Keyword failed: {key} ({message})",CIRCULAR_REFERENCE:"Circular $refs: {urls}",UNKNOWN_PROPERTY:"Unknown property (not in schema)"};ValidationError.prototype=Object.create(Error.prototype),ValidationError.prototype.constructor=ValidationError,ValidationError.prototype.name="ValidationError",ValidationError.prototype.prefixWith=function(e,t){if(null!==e&&(e=e.replace(/~/g,"~0").replace(/\//g,"~1"),this.dataPath="/"+e+this.dataPath),null!==t&&(t=t.replace(/~/g,"~0").replace(/\//g,"~1"),this.schemaPath="/"+t+this.schemaPath),null!==this.subErrors)for(var r=0;r<this.subErrors.length;r++)this.subErrors[r].prefixWith(e,t);return this};var c={},l=createApi();return l.addLanguage("en-gb",s),l.tv4=l,l})},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(3),i=_interopRequireDefault(n),o=r(4),a=_interopRequireDefault(o),u=function(){function SourcePackage(e,t){(0,i.default)(this,SourcePackage),this._sourceCode=t,this._sourceCodeClassname=e,this._encoding=null,this._signature=null}return(0,a.default)(SourcePackage,[{key:"sourceCode",get:function(){return this._sourceCode},set:function(e){e&&(this._sourceCode=e)}},{key:"sourceCodeClassname",get:function(){return this._sourceCodeClassname},set:function(e){e&&(this._sourceCodeClassname=e)}},{key:"encoding",get:function(){return this._encoding},set:function(e){e&&(this._encoding=e)}},{key:"signature",get:function(){return this._signature},set:function(e){e&&(this._signature=e)}}]),SourcePackage}();t.default=u,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0}),t.HypertyResourceType=t.HypertyType=t.RuntimeHypertyCapabilityType=void 0;var n=r(26),i=_interopRequireDefault(n),o=r(3),a=_interopRequireDefault(o),u=r(4),s=_interopRequireDefault(u),c=r(34),l=_interopRequireDefault(c),f=r(35),p=_interopRequireDefault(f),h=r(115),d=_interopRequireDefault(h),y=function(e){function HypertyDescriptor(e,t,r,n,o,u,s,c,f){(0,a.default)(this,HypertyDescriptor);var p=(0,l.default)(this,(HypertyDescriptor.__proto__||(0,i.default)(HypertyDescriptor)).call(this,e,t,r,n,o,u,s));return p._configuration={},p._constraints={},p._policies={},p._messageSchema=null,p._hypertyType=c,p._dataObjects=f,p}return(0,p.default)(HypertyDescriptor,e),(0,s.default)(HypertyDescriptor,[{key:"hypertyType",get:function(){return this._hypertyType},set:function(e){e&&(this._hypertyType=e)}},{key:"dataObjects",get:function(){return this._dataObjects},set:function(e){e&&(this._dataObjects=e)}},{key:"configuration",get:function(){return this._configuration},set:function(e){e&&(this._configuration=e)}},{key:"constraints",get:function(){return this._constraints},set:function(e){e&&(this._constraints=e)}},{key:"messageSchema",get:function(){return this._messageSchema},set:function(e){e&&(this._messageSchema=e)}},{key:"policies",get:function(){return this._policies},set:function(e){e&&(this._policies=e)}}]),HypertyDescriptor}(d.default);t.RuntimeHypertyCapabilityType={},t.HypertyType={COMMUNICATOR:"communicator",IDENTITY:"identity",CONTEXT:"context"},t.HypertyResourceType={chat:"CHAT",audio:"Audio",video:"Video",av:"AV",screen:"SCREEN",file:"FILe",midi:"MIDI"};t.default=y},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(26),i=_interopRequireDefault(n),o=r(3),a=_interopRequireDefault(o),u=r(4),s=_interopRequireDefault(u),c=r(34),l=_interopRequireDefault(c),f=r(35),p=_interopRequireDefault(f),h=r(115),d=_interopRequireDefault(h),y=function(e){function ProtocolStubDescriptor(e,t,r,n,o,u,s,c,f,p,h,d,y,v,m){(0,a.default)(this,ProtocolStubDescriptor);var g=(0,l.default)(this,(ProtocolStubDescriptor.__proto__||(0,i.default)(ProtocolStubDescriptor)).call(this,e,t,r,n,o,u,s));return g._messageSchemas=c,g._configuration=f||{},g._constraints=p||{},g._hypertyType=h,g._dataObjects=d||[],g._interworking=y,g._idpProxy=v,g._mutualAuthentication=m,g}return(0,p.default)(ProtocolStubDescriptor,e),(0,s.default)(ProtocolStubDescriptor,[{key:"messageSchemas",get:function(){return this._messageSchemas},set:function(e){e&&(this._messageSchemas=e)}},{key:"constraints",get:function(){return this._constraints},set:function(e){e&&(this._constraints=e)}},{key:"configuration",get:function(){return this._configuration},set:function(e){e&&(this._configuration=e)}},{key:"hypertyType",get:function(){return this._hypertyType},set:function(e){this._hypertyType=e}},{key:"dataObjects",get:function(){return this._dataObjects},set:function(e){this._dataObjects=e}},{key:"interworking",get:function(){return this._interworking},set:function(e){this._interworking=e}},{key:"idpProxy",get:function(){return this._idpProxy},set:function(e){this._idpProxy=e}},{key:"mutualAuthentication",get:function(){return this._mutualAuthentication},set:function(e){this._mutualAuthentication=e}}]),ProtocolStubDescriptor}(d.default);t.default=y,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0}),t.RuntimeType=t.RuntimeProtocolCapability=t.RuntimeHypertyCapability=void 0;var n=r(69),i=_interopRequireDefault(n),o=r(26),a=_interopRequireDefault(o),u=r(3),s=_interopRequireDefault(u),c=r(4),l=_interopRequireDefault(c),f=r(34),p=_interopRequireDefault(f),h=r(35),d=_interopRequireDefault(h),y=r(115),v=_interopRequireDefault(y),m=function(e){function HypertyRuntimeDescriptor(e,t,r,n,i,o,u,c,l,f,h,d){(0,s.default)(this,HypertyRuntimeDescriptor);var y=(0,p.default)(this,(HypertyRuntimeDescriptor.__proto__||(0,a.default)(HypertyRuntimeDescriptor)).call(this,e,t,r,n,i,o,u));return y._runtimeType=c,y._hypertyCapabilities=l||new g(!0,!1,!1,!1,!1),y._protocolCapabilities=f||new _(!0,!1,!0,!1,!1,!1),y._p2pHandlerStub=h,y._p2pRequesterStub=d,y}return(0,d.default)(HypertyRuntimeDescriptor,e),(0,l.default)(HypertyRuntimeDescriptor,[{key:"runtimeType",get:function(){return this._runtimeType},set:function(e){e&&(this._runtimeType=e)}},{key:"hypertyCapabilities",get:function(){return this._hypertyCapabilities},set:function(e){e&&(this._hypertyCapabilities=e)}},{key:"protocolCapabilities",get:function(){return this._hypertyCapabilities},set:function(e){e&&(this._protocolCapabilities=e)}},{key:"p2pHandlerStub",get:function(){return this._p2pHandlerStub},set:function(e){this._p2pHandlerStub=e}},{key:"p2pRequesterStub",get:function(){return this._p2pRequesterStub},set:function(e){this._p2pRequesterStub=e}}]),HypertyRuntimeDescriptor}(v.default),g=t.RuntimeHypertyCapability=function(){function RuntimeHypertyCapability(e,t,r,n,i){(0,s.default)(this,RuntimeHypertyCapability),this._isWebRTC=e,this._isMic=t,this._isCamera=r,this._isSensor=n,this._isORTC=i}return(0,l.default)(RuntimeHypertyCapability,[{key:"getCapabilitySet",value:function(){return(0,i.default)(this)}},{key:"isMic",get:function(){return this._isMic}},{key:"isCamera",get:function(){return this._isCamera}},{key:"isSensor",get:function(){return this._isSensor}},{key:"isWebRTC",get:function(){return this._isWebRTC}},{key:"isORTCS",get:function(){return this._isORTC}}]),RuntimeHypertyCapability}(),_=t.RuntimeProtocolCapability=function(){function RuntimeProtocolCapability(e,t,r,n,i,o){(0,s.default)(this,RuntimeProtocolCapability),this._isHttp=e,this._isHttps=t,this._isWS=r,this._isWSS=n,this._isCoap=i,this._isDataChannel=o}return(0,l.default)(RuntimeProtocolCapability,[{key:"isHttp",value:function(){return this._isHttp}},{key:"isHttps",value:function(){return this._isHttps}},{key:"isWS",value:function(){return this._isWS}},{key:"isSensorSupported",value:function(){return this._isSensor}},{key:"isWSS",value:function(){return this._isWSS}},{key:"isCoap",value:function(){return this._isCoap}},{key:"isDataChannel",value:function(){return this._isDataChannel}},{key:"getCapabilitySet",value:function(){return(0,i.default)(this)}}]),RuntimeProtocolCapability}();t.RuntimeType={BROWSER:"browser",STANDALONE:"standalone",SERVER:"server",GATEWAY:"gateway"};t.default=m},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(26),i=_interopRequireDefault(n),o=r(3),a=_interopRequireDefault(o),u=r(4),s=_interopRequireDefault(u),c=r(34),l=_interopRequireDefault(c),f=r(35),p=_interopRequireDefault(f),h=r(115),d=_interopRequireDefault(h),y=function(e){function PolicyEnforcerDescriptor(e,t,r,n,o,u,s,c,f){(0,a.default)(this,PolicyEnforcerDescriptor);var p=(0,l.default)(this,(PolicyEnforcerDescriptor.__proto__||(0,i.default)(PolicyEnforcerDescriptor)).call(this,e,t,r,n,o,u,s));return p._configuration=c,p._policies=f,p}return(0,p.default)(PolicyEnforcerDescriptor,e),(0,s.default)(PolicyEnforcerDescriptor,[{key:"configuration",get:function(){return this._configuration},set:function(e){this._configuration=e}},{key:"policies",get:function(){return this._policies},set:function(e){this._policies=e}}]),PolicyEnforcerDescriptor}(d.default);t.default=y,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0}),t.DataUrlScheme=t.ContextDataObjectSchema=t.IdentityDataObjectSchema=t.ConnectionDataObjectSchema=t.CommunicationDataObjectSchema=t.HypertyDataObjectSchema=t.MessageDataObjectSchema=t.DataObjectSchema=void 0;var n=r(26),i=_interopRequireDefault(n),o=r(3),a=_interopRequireDefault(o),u=r(34),s=_interopRequireDefault(u),c=r(35),l=_interopRequireDefault(c),f=r(115),p=_interopRequireDefault(f),h=t.DataObjectSchema=function(e){function DataObjectSchema(e,t,r,n,o,u,c){return(0,a.default)(this,DataObjectSchema),(0,s.default)(this,(DataObjectSchema.__proto__||(0,i.default)(DataObjectSchema)).call(this,e,t,r,n,o,u,c))}return(0,l.default)(DataObjectSchema,e),DataObjectSchema}(p.default),d=(t.MessageDataObjectSchema=function(e){function MessageDataObjectSchema(e,t,r,n,o,u,c){return(0,a.default)(this,MessageDataObjectSchema),(0,s.default)(this,(MessageDataObjectSchema.__proto__||(0,i.default)(MessageDataObjectSchema)).call(this,e,t,r,n,o,u,c))}return(0,l.default)(MessageDataObjectSchema,e),MessageDataObjectSchema}(h),t.HypertyDataObjectSchema=function(e){function HypertyDataObjectSchema(e,t,r,n,o,u,c,l,f){(0,a.default)(this,HypertyDataObjectSchema);var p=(0,s.default)(this,(HypertyDataObjectSchema.__proto__||(0,i.default)(HypertyDataObjectSchema)).call(this,e,t,r,n,o,u,c));return p._accessControlPolicy=l,p._scheme=f,p}return(0,l.default)(HypertyDataObjectSchema,e),HypertyDataObjectSchema}(h));t.CommunicationDataObjectSchema=function(e){function CommunicationDataObjectSchema(e,t,r,n,o,u,c,l){return(0,a.default)(this,CommunicationDataObjectSchema),(0,s.default)(this,(CommunicationDataObjectSchema.__proto__||(0,i.default)(CommunicationDataObjectSchema)).call(this,e,t,r,n,o,u,c,l))}return(0,l.default)(CommunicationDataObjectSchema,e),CommunicationDataObjectSchema}(d),t.ConnectionDataObjectSchema=function(e){function ConnectionDataObjectSchema(e,t,r,n,o,u,c,l){return(0,a.default)(this,ConnectionDataObjectSchema),(0,s.default)(this,(ConnectionDataObjectSchema.__proto__||(0,i.default)(ConnectionDataObjectSchema)).call(this,e,t,r,n,o,u,c,l))}return(0,l.default)(ConnectionDataObjectSchema,e),ConnectionDataObjectSchema}(d),t.IdentityDataObjectSchema=function(e){function IdentityDataObjectSchema(e,t,r,n,o,u,c,l){return(0,a.default)(this,IdentityDataObjectSchema),(0,s.default)(this,(IdentityDataObjectSchema.__proto__||(0,i.default)(IdentityDataObjectSchema)).call(this,e,t,r,n,o,u,c,l))}return(0,l.default)(IdentityDataObjectSchema,e),IdentityDataObjectSchema}(d),t.ContextDataObjectSchema=function(e){function ContextDataObjectSchema(e,t,r,n,o,u,c,l){return(0,a.default)(this,ContextDataObjectSchema),(0,s.default)(this,(ContextDataObjectSchema.__proto__||(0,i.default)(ContextDataObjectSchema)).call(this,e,t,r,n,o,u,c,l))}return(0,l.default)(ContextDataObjectSchema,e),ContextDataObjectSchema}(d),t.DataUrlScheme={COMM:"COMM",CONNECTION:"CONNECTION",CTXT:"CTXT",IDENTITY:"IDENTITY"};t.default=h}])});
},{}],4:[function(require,module,exports){
// version: 0.13.0
// date: Fri Aug 31 2018 09:24:53 GMT+0100 (Western European Summer Time)
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


// version: 0.13.0
// date: Fri Aug 31 2018 09:24:53 GMT+0100 (Western European Summer Time)
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


!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define("StorageManager",[],e):"object"==typeof exports?exports.StorageManager=e():t.StorageManager=e()}("undefined"!=typeof self?self:this,function(){return function(t){function __webpack_require__(n){if(e[n])return e[n].exports;var r=e[n]={i:n,l:!1,exports:{}};return t[n].call(r.exports,r,r.exports,__webpack_require__),r.l=!0,r.exports}var e={};return __webpack_require__.m=t,__webpack_require__.c=e,__webpack_require__.d=function(t,e,n){__webpack_require__.o(t,e)||Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:n})},__webpack_require__.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return __webpack_require__.d(e,"a",e),e},__webpack_require__.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},__webpack_require__.p="",__webpack_require__(__webpack_require__.s=172)}([function(t,e){var n=t.exports={version:"2.5.7"};"number"==typeof __e&&(__e=n)},function(t,e){var n=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=n)},function(t,e,n){var r=n(30)("wks"),o=n(21),i=n(1).Symbol,u="function"==typeof i;(t.exports=function(t){return r[t]||(r[t]=u&&i[t]||(u?i:o)("Symbol."+t))}).store=r},function(t,e,n){"use strict";e.__esModule=!0,e.default=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}},function(t,e,n){"use strict";e.__esModule=!0;var r=n(60),o=function(t){return t&&t.__esModule?t:{default:t}}(r);e.default=function(){function defineProperties(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),(0,o.default)(t,r.key,r)}}return function(t,e,n){return e&&defineProperties(t.prototype,e),n&&defineProperties(t,n),t}}()},function(t,e,n){var r=n(1),o=n(0),i=n(18),u=n(11),a=n(10),f=function(t,e,n){var c,s,l,p=t&f.F,v=t&f.G,y=t&f.S,d=t&f.P,h=t&f.B,g=t&f.W,b=v?o:o[e]||(o[e]={}),_=b.prototype,w=v?r:y?r[e]:(r[e]||{}).prototype;v&&(n=e);for(c in n)(s=!p&&w&&void 0!==w[c])&&a(b,c)||(l=s?w[c]:n[c],b[c]=v&&"function"!=typeof w[c]?n[c]:h&&s?i(l,r):g&&w[c]==l?function(t){var e=function(e,n,r){if(this instanceof t){switch(arguments.length){case 0:return new t;case 1:return new t(e);case 2:return new t(e,n)}return new t(e,n,r)}return t.apply(this,arguments)};return e.prototype=t.prototype,e}(l):d&&"function"==typeof l?i(Function.call,l):l,d&&((b.virtual||(b.virtual={}))[c]=l,t&f.R&&_&&!_[c]&&u(_,c,l)))};f.F=1,f.G=2,f.S=4,f.P=8,f.B=16,f.W=32,f.U=64,f.R=128,t.exports=f},function(t,e,n){t.exports=!n(13)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},function(t,e,n){var r=n(9);t.exports=function(t){if(!r(t))throw TypeError(t+" is not an object!");return t}},function(t,e,n){var r=n(7),o=n(41),i=n(28),u=Object.defineProperty;e.f=n(6)?Object.defineProperty:function(t,e,n){if(r(t),e=i(e,!0),r(n),o)try{return u(t,e,n)}catch(t){}if("get"in n||"set"in n)throw TypeError("Accessors not supported!");return"value"in n&&(t[e]=n.value),t}},function(t,e){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},function(t,e){var n={}.hasOwnProperty;t.exports=function(t,e){return n.call(t,e)}},function(t,e,n){var r=n(8),o=n(20);t.exports=n(6)?function(t,e,n){return r.f(t,e,o(1,n))}:function(t,e,n){return t[e]=n,t}},function(t,e,n){var r=n(56),o=n(25);t.exports=function(t){return r(o(t))}},function(t,e){t.exports=function(t){try{return!!t()}catch(t){return!0}}},function(t,e){t.exports=!0},function(t,e){t.exports={}},function(t,e){var n={}.toString;t.exports=function(t){return n.call(t).slice(8,-1)}},,function(t,e,n){var r=n(22);t.exports=function(t,e,n){if(r(t),void 0===e)return t;switch(n){case 1:return function(n){return t.call(e,n)};case 2:return function(n,r){return t.call(e,n,r)};case 3:return function(n,r,o){return t.call(e,n,r,o)}}return function(){return t.apply(e,arguments)}}},function(t,e,n){var r=n(42),o=n(31);t.exports=Object.keys||function(t){return r(t,o)}},function(t,e){t.exports=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}}},function(t,e){var n=0,r=Math.random();t.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++n+r).toString(36))}},function(t,e){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},function(t,e,n){var r=n(8).f,o=n(10),i=n(2)("toStringTag");t.exports=function(t,e,n){t&&!o(t=n?t:t.prototype,i)&&r(t,i,{configurable:!0,value:e})}},function(t,e){var n=Math.ceil,r=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?r:n)(t)}},function(t,e){t.exports=function(t){if(void 0==t)throw TypeError("Can't call method on  "+t);return t}},,function(t,e){e.f={}.propertyIsEnumerable},function(t,e,n){var r=n(9);t.exports=function(t,e){if(!r(t))return t;var n,o;if(e&&"function"==typeof(n=t.toString)&&!r(o=n.call(t)))return o;if("function"==typeof(n=t.valueOf)&&!r(o=n.call(t)))return o;if(!e&&"function"==typeof(n=t.toString)&&!r(o=n.call(t)))return o;throw TypeError("Can't convert object to primitive value")}},function(t,e,n){var r=n(30)("keys"),o=n(21);t.exports=function(t){return r[t]||(r[t]=o(t))}},function(t,e,n){var r=n(0),o=n(1),i=o["__core-js_shared__"]||(o["__core-js_shared__"]={});(t.exports=function(t,e){return i[t]||(i[t]=void 0!==e?e:{})})("versions",[]).push({version:r.version,mode:n(14)?"pure":"global",copyright:"© 2018 Denis Pushkarev (zloirock.ru)"})},function(t,e){t.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},function(t,e,n){var r=n(9),o=n(1).document,i=r(o)&&r(o.createElement);t.exports=function(t){return i?o.createElement(t):{}}},function(t,e,n){var r=n(25);t.exports=function(t){return Object(r(t))}},,,function(t,e,n){var r,o;!function(i,u){"use strict";r=u,void 0!==(o="function"==typeof r?r.call(e,n,e,t):r)&&(t.exports=o)}(0,function(){"use strict";function bindMethod(t,e){var n=t[e];if("function"==typeof n.bind)return n.bind(t);try{return Function.prototype.bind.call(n,t)}catch(e){return function(){return Function.prototype.apply.apply(n,[t,arguments])}}}function realMethod(n){return"debug"===n&&(n="log"),typeof console!==e&&(void 0!==console[n]?bindMethod(console,n):void 0!==console.log?bindMethod(console,"log"):t)}function replaceLoggingMethods(e,r){for(var o=0;o<n.length;o++){var i=n[o];this[i]=o<e?t:this.methodFactory(i,e,r)}this.log=this.debug}function enableLoggingWhenConsoleArrives(t,n,r){return function(){typeof console!==e&&(replaceLoggingMethods.call(this,n,r),this[t].apply(this,arguments))}}function defaultMethodFactory(t,e,n){return realMethod(t)||enableLoggingWhenConsoleArrives.apply(this,arguments)}function Logger(t,r,o){function persistLevelIfPossible(t){var r=(n[t]||"silent").toUpperCase();if(typeof window!==e){try{return void(window.localStorage[a]=r)}catch(t){}try{window.document.cookie=encodeURIComponent(a)+"="+r+";"}catch(t){}}}function getPersistedLevel(){var t;if(typeof window!==e){try{t=window.localStorage[a]}catch(t){}if(typeof t===e)try{var n=window.document.cookie,r=n.indexOf(encodeURIComponent(a)+"=");-1!==r&&(t=/^([^;]+)/.exec(n.slice(r))[1])}catch(t){}return void 0===u.levels[t]&&(t=void 0),t}}var i,u=this,a="loglevel";t&&(a+=":"+t),u.name=t,u.levels={TRACE:0,DEBUG:1,INFO:2,WARN:3,ERROR:4,SILENT:5},u.methodFactory=o||defaultMethodFactory,u.getLevel=function(){return i},u.setLevel=function(n,r){if("string"==typeof n&&void 0!==u.levels[n.toUpperCase()]&&(n=u.levels[n.toUpperCase()]),!("number"==typeof n&&n>=0&&n<=u.levels.SILENT))throw"log.setLevel() called with invalid level: "+n;if(i=n,!1!==r&&persistLevelIfPossible(n),replaceLoggingMethods.call(u,n,t),typeof console===e&&n<u.levels.SILENT)return"No console available for logging"},u.setDefaultLevel=function(t){getPersistedLevel()||u.setLevel(t,!1)},u.enableAll=function(t){u.setLevel(u.levels.TRACE,t)},u.disableAll=function(t){u.setLevel(u.levels.SILENT,t)};var f=getPersistedLevel();null==f&&(f=null==r?"WARN":r),u.setLevel(f,!1)}var t=function(){},e="undefined",n=["trace","debug","info","warn","error"],r=new Logger,o={};r.getLogger=function(t){if("string"!=typeof t||""===t)throw new TypeError("You must supply a name when creating a logger.");var e=o[t];return e||(e=o[t]=new Logger(t,r.getLevel(),r.methodFactory)),e};var i=typeof window!==e?window.log:void 0;return r.noConflict=function(){return typeof window!==e&&window.log===r&&(window.log=i),r},r.getLoggers=function(){return o},r})},function(t,e,n){e.f=n(2)},function(t,e,n){var r=n(1),o=n(0),i=n(14),u=n(37),a=n(8).f;t.exports=function(t){var e=o.Symbol||(o.Symbol=i?{}:r.Symbol||{});"_"==t.charAt(0)||t in e||a(e,t,{value:u.f(t)})}},,function(t,e,n){var r=n(7),o=n(72),i=n(31),u=n(29)("IE_PROTO"),a=function(){},f=function(){var t,e=n(32)("iframe"),r=i.length;for(e.style.display="none",n(57).appendChild(e),e.src="javascript:",t=e.contentWindow.document,t.open(),t.write("<script>document.F=Object<\/script>"),t.close(),f=t.F;r--;)delete f.prototype[i[r]];return f()};t.exports=Object.create||function(t,e){var n;return null!==t?(a.prototype=r(t),n=new a,a.prototype=null,n[u]=t):n=f(),void 0===e?n:o(n,e)}},function(t,e,n){t.exports=!n(6)&&!n(13)(function(){return 7!=Object.defineProperty(n(32)("div"),"a",{get:function(){return 7}}).a})},function(t,e,n){var r=n(10),o=n(12),i=n(61)(!1),u=n(29)("IE_PROTO");t.exports=function(t,e){var n,a=o(t),f=0,c=[];for(n in a)n!=u&&r(a,n)&&c.push(n);for(;e.length>f;)r(a,n=e[f++])&&(~i(c,n)||c.push(n));return c}},function(t,e){e.f=Object.getOwnPropertySymbols},function(t,e,n){t.exports={default:n(112),__esModule:!0}},function(t,e,n){"use strict";var r=n(70)(!0);n(51)(String,"String",function(t){this._t=String(t),this._i=0},function(){var t,e=this._t,n=this._i;return n>=e.length?{value:void 0,done:!0}:(t=r(e,n),this._i+=t.length,{value:t,done:!1})})},function(t,e,n){var r=n(24),o=Math.min;t.exports=function(t){return t>0?o(r(t),9007199254740991):0}},function(t,e,n){n(73);for(var r=n(1),o=n(11),i=n(15),u=n(2)("toStringTag"),a="CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,TextTrackList,TouchList".split(","),f=0;f<a.length;f++){var c=a[f],s=r[c],l=s&&s.prototype;l&&!l[u]&&o(l,u,c),i[c]=i.Array}},,function(t,e,n){var r=n(5),o=n(0),i=n(13);t.exports=function(t,e){var n=(o.Object||{})[t]||Object[t],u={};u[t]=e(n),r(r.S+r.F*i(function(){n(1)}),"Object",u)}},function(t,e,n){var r=n(27),o=n(20),i=n(12),u=n(28),a=n(10),f=n(41),c=Object.getOwnPropertyDescriptor;e.f=n(6)?c:function(t,e){if(t=i(t),e=u(e,!0),f)try{return c(t,e)}catch(t){}if(a(t,e))return o(!r.f.call(t,e),t[e])}},function(t,e,n){"use strict";var r=n(14),o=n(5),i=n(52),u=n(11),a=n(15),f=n(71),c=n(23),s=n(58),l=n(2)("iterator"),p=!([].keys&&"next"in[].keys()),v=function(){return this};t.exports=function(t,e,n,y,d,h,g){f(n,e,y);var b,_,w,m=function(t){if(!p&&t in P)return P[t];switch(t){case"keys":case"values":return function(){return new n(this,t)}}return function(){return new n(this,t)}},S=e+" Iterator",x="values"==d,O=!1,P=t.prototype,M=P[l]||P["@@iterator"]||d&&P[d],j=M||m(d),L=d?x?m("entries"):j:void 0,k="Array"==e?P.entries||M:M;if(k&&(w=s(k.call(new t)))!==Object.prototype&&w.next&&(c(w,S,!0),r||"function"==typeof w[l]||u(w,l,v)),x&&M&&"values"!==M.name&&(O=!0,j=function(){return M.call(this)}),r&&!g||!p&&!O&&P[l]||u(P,l,j),a[e]=j,a[S]=v,d)if(b={values:x?j:m("values"),keys:h?j:m("keys"),entries:L},g)for(_ in b)_ in P||i(P,_,b[_]);else o(o.P+o.F*(p||O),e,b);return b}},function(t,e,n){t.exports=n(11)},function(t,e,n){"use strict";function _interopRequireDefault(t){return t&&t.__esModule?t:{default:t}}e.__esModule=!0;var r=n(76),o=_interopRequireDefault(r),i=n(78),u=_interopRequireDefault(i),a="function"==typeof u.default&&"symbol"==typeof o.default?function(t){return typeof t}:function(t){return t&&"function"==typeof u.default&&t.constructor===u.default&&t!==u.default.prototype?"symbol":typeof t};e.default="function"==typeof u.default&&"symbol"===a(o.default)?function(t){return void 0===t?"undefined":a(t)}:function(t){return t&&"function"==typeof u.default&&t.constructor===u.default&&t!==u.default.prototype?"symbol":void 0===t?"undefined":a(t)}},function(t,e,n){var r=n(42),o=n(31).concat("length","prototype");e.f=Object.getOwnPropertyNames||function(t){return r(t,o)}},function(t,e){},function(t,e,n){var r=n(16);t.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==r(t)?t.split(""):Object(t)}},function(t,e,n){var r=n(1).document;t.exports=r&&r.documentElement},function(t,e,n){var r=n(10),o=n(33),i=n(29)("IE_PROTO"),u=Object.prototype;t.exports=Object.getPrototypeOf||function(t){return t=o(t),r(t,i)?t[i]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?u:null}},,function(t,e,n){t.exports={default:n(67),__esModule:!0}},function(t,e,n){var r=n(12),o=n(46),i=n(62);t.exports=function(t){return function(e,n,u){var a,f=r(e),c=o(f.length),s=i(u,c);if(t&&n!=n){for(;c>s;)if((a=f[s++])!=a)return!0}else for(;c>s;s++)if((t||s in f)&&f[s]===n)return t||s||0;return!t&&-1}}},function(t,e,n){var r=n(24),o=Math.max,i=Math.min;t.exports=function(t,e){return t=r(t),t<0?o(t+e,0):i(t,e)}},,,,,function(t,e,n){n(68);var r=n(0).Object;t.exports=function(t,e,n){return r.defineProperty(t,e,n)}},function(t,e,n){var r=n(5);r(r.S+r.F*!n(6),"Object",{defineProperty:n(8).f})},,function(t,e,n){var r=n(24),o=n(25);t.exports=function(t){return function(e,n){var i,u,a=String(o(e)),f=r(n),c=a.length;return f<0||f>=c?t?"":void 0:(i=a.charCodeAt(f),i<55296||i>56319||f+1===c||(u=a.charCodeAt(f+1))<56320||u>57343?t?a.charAt(f):i:t?a.slice(f,f+2):u-56320+(i-55296<<10)+65536)}}},function(t,e,n){"use strict";var r=n(40),o=n(20),i=n(23),u={};n(11)(u,n(2)("iterator"),function(){return this}),t.exports=function(t,e,n){t.prototype=r(u,{next:o(1,n)}),i(t,e+" Iterator")}},function(t,e,n){var r=n(8),o=n(7),i=n(19);t.exports=n(6)?Object.defineProperties:function(t,e){o(t);for(var n,u=i(e),a=u.length,f=0;a>f;)r.f(t,n=u[f++],e[n]);return t}},function(t,e,n){"use strict";var r=n(74),o=n(75),i=n(15),u=n(12);t.exports=n(51)(Array,"Array",function(t,e){this._t=u(t),this._i=0,this._k=e},function(){var t=this._t,e=this._k,n=this._i++;return!t||n>=t.length?(this._t=void 0,o(1)):"keys"==e?o(0,n):"values"==e?o(0,t[n]):o(0,[n,t[n]])},"values"),i.Arguments=i.Array,r("keys"),r("values"),r("entries")},function(t,e){t.exports=function(){}},function(t,e){t.exports=function(t,e){return{value:e,done:!!t}}},function(t,e,n){t.exports={default:n(77),__esModule:!0}},function(t,e,n){n(45),n(47),t.exports=n(37).f("iterator")},function(t,e,n){t.exports={default:n(79),__esModule:!0}},function(t,e,n){n(80),n(55),n(85),n(86),t.exports=n(0).Symbol},function(t,e,n){"use strict";var r=n(1),o=n(10),i=n(6),u=n(5),a=n(52),f=n(81).KEY,c=n(13),s=n(30),l=n(23),p=n(21),v=n(2),y=n(37),d=n(38),h=n(82),g=n(83),b=n(7),_=n(9),w=n(12),m=n(28),S=n(20),x=n(40),O=n(84),P=n(50),M=n(8),j=n(19),L=P.f,k=M.f,T=O.f,E=r.Symbol,q=r.JSON,A=q&&q.stringify,F=v("_hidden"),R=v("toPrimitive"),N={}.propertyIsEnumerable,C=s("symbol-registry"),D=s("symbols"),I=s("op-symbols"),G=Object.prototype,K="function"==typeof E,W=r.QObject,V=!W||!W.prototype||!W.prototype.findChild,U=i&&c(function(){return 7!=x(k({},"a",{get:function(){return k(this,"a",{value:7}).a}})).a})?function(t,e,n){var r=L(G,e);r&&delete G[e],k(t,e,n),r&&t!==G&&k(G,e,r)}:k,B=function(t){var e=D[t]=x(E.prototype);return e._k=t,e},H=K&&"symbol"==typeof E.iterator?function(t){return"symbol"==typeof t}:function(t){return t instanceof E},J=function(t,e,n){return t===G&&J(I,e,n),b(t),e=m(e,!0),b(n),o(D,e)?(n.enumerable?(o(t,F)&&t[F][e]&&(t[F][e]=!1),n=x(n,{enumerable:S(0,!1)})):(o(t,F)||k(t,F,S(1,{})),t[F][e]=!0),U(t,e,n)):k(t,e,n)},z=function(t,e){b(t);for(var n,r=h(e=w(e)),o=0,i=r.length;i>o;)J(t,n=r[o++],e[n]);return t},Y=function(t,e){return void 0===e?x(t):z(x(t),e)},Q=function(t){var e=N.call(this,t=m(t,!0));return!(this===G&&o(D,t)&&!o(I,t))&&(!(e||!o(this,t)||!o(D,t)||o(this,F)&&this[F][t])||e)},X=function(t,e){if(t=w(t),e=m(e,!0),t!==G||!o(D,e)||o(I,e)){var n=L(t,e);return!n||!o(D,e)||o(t,F)&&t[F][e]||(n.enumerable=!0),n}},Z=function(t){for(var e,n=T(w(t)),r=[],i=0;n.length>i;)o(D,e=n[i++])||e==F||e==f||r.push(e);return r},$=function(t){for(var e,n=t===G,r=T(n?I:w(t)),i=[],u=0;r.length>u;)!o(D,e=r[u++])||n&&!o(G,e)||i.push(D[e]);return i};K||(E=function(){if(this instanceof E)throw TypeError("Symbol is not a constructor!");var t=p(arguments.length>0?arguments[0]:void 0),e=function(n){this===G&&e.call(I,n),o(this,F)&&o(this[F],t)&&(this[F][t]=!1),U(this,t,S(1,n))};return i&&V&&U(G,t,{configurable:!0,set:e}),B(t)},a(E.prototype,"toString",function(){return this._k}),P.f=X,M.f=J,n(54).f=O.f=Z,n(27).f=Q,n(43).f=$,i&&!n(14)&&a(G,"propertyIsEnumerable",Q,!0),y.f=function(t){return B(v(t))}),u(u.G+u.W+u.F*!K,{Symbol:E});for(var tt="hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),et=0;tt.length>et;)v(tt[et++]);for(var nt=j(v.store),rt=0;nt.length>rt;)d(nt[rt++]);u(u.S+u.F*!K,"Symbol",{for:function(t){return o(C,t+="")?C[t]:C[t]=E(t)},keyFor:function(t){if(!H(t))throw TypeError(t+" is not a symbol!");for(var e in C)if(C[e]===t)return e},useSetter:function(){V=!0},useSimple:function(){V=!1}}),u(u.S+u.F*!K,"Object",{create:Y,defineProperty:J,defineProperties:z,getOwnPropertyDescriptor:X,getOwnPropertyNames:Z,getOwnPropertySymbols:$}),q&&u(u.S+u.F*(!K||c(function(){var t=E();return"[null]"!=A([t])||"{}"!=A({a:t})||"{}"!=A(Object(t))})),"JSON",{stringify:function(t){for(var e,n,r=[t],o=1;arguments.length>o;)r.push(arguments[o++]);if(n=e=r[1],(_(e)||void 0!==t)&&!H(t))return g(e)||(e=function(t,e){if("function"==typeof n&&(e=n.call(this,t,e)),!H(e))return e}),r[1]=e,A.apply(q,r)}}),E.prototype[R]||n(11)(E.prototype,R,E.prototype.valueOf),l(E,"Symbol"),l(Math,"Math",!0),l(r.JSON,"JSON",!0)},function(t,e,n){var r=n(21)("meta"),o=n(9),i=n(10),u=n(8).f,a=0,f=Object.isExtensible||function(){return!0},c=!n(13)(function(){return f(Object.preventExtensions({}))}),s=function(t){u(t,r,{value:{i:"O"+ ++a,w:{}}})},l=function(t,e){if(!o(t))return"symbol"==typeof t?t:("string"==typeof t?"S":"P")+t;if(!i(t,r)){if(!f(t))return"F";if(!e)return"E";s(t)}return t[r].i},p=function(t,e){if(!i(t,r)){if(!f(t))return!0;if(!e)return!1;s(t)}return t[r].w},v=function(t){return c&&y.NEED&&f(t)&&!i(t,r)&&s(t),t},y=t.exports={KEY:r,NEED:!1,fastKey:l,getWeak:p,onFreeze:v}},function(t,e,n){var r=n(19),o=n(43),i=n(27);t.exports=function(t){var e=r(t),n=o.f;if(n)for(var u,a=n(t),f=i.f,c=0;a.length>c;)f.call(t,u=a[c++])&&e.push(u);return e}},function(t,e,n){var r=n(16);t.exports=Array.isArray||function(t){return"Array"==r(t)}},function(t,e,n){var r=n(12),o=n(54).f,i={}.toString,u="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],a=function(t){try{return o(t)}catch(t){return u.slice()}};t.exports.f=function(t){return u&&"[object Window]"==i.call(t)?a(t):o(r(t))}},function(t,e,n){n(38)("asyncIterator")},function(t,e,n){n(38)("observable")},,,,,,,,,,,,,,,,,,,,,,,,,,function(t,e,n){n(113),t.exports=n(0).Object.keys},function(t,e,n){var r=n(33),o=n(19);n(49)("keys",function(){return function(t){return o(r(t))}})},function(t,e,n){t.exports={default:n(122),__esModule:!0}},,,,,,,,function(t,e,n){n(123),t.exports=n(0).Object.assign},function(t,e,n){var r=n(5);r(r.S+r.F,"Object",{assign:n(124)})},function(t,e,n){"use strict";var r=n(19),o=n(43),i=n(27),u=n(33),a=n(56),f=Object.assign;t.exports=!f||n(13)(function(){var t={},e={},n=Symbol(),r="abcdefghijklmnopqrst";return t[n]=7,r.split("").forEach(function(t){e[t]=t}),7!=f({},t)[n]||Object.keys(f({},e)).join("")!=r})?function(t,e){for(var n=u(t),f=arguments.length,c=1,s=o.f,l=i.f;f>c;)for(var p,v=a(arguments[c++]),y=s?r(v).concat(s(v)):r(v),d=y.length,h=0;d>h;)l.call(v,p=y[h++])&&(n[p]=v[p]);return n}:f},,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,function(t,e,n){"use strict";function _interopRequireDefault(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(e,"__esModule",{value:!0});var r=n(173),o=_interopRequireDefault(r),i=n(44),u=_interopRequireDefault(i),a=n(53),f=_interopRequireDefault(a),c=n(114),s=_interopRequireDefault(c),l=n(3),p=_interopRequireDefault(l),v=n(4),y=_interopRequireDefault(v),d=n(36),h=function(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);return e.default=t,e}(d),g=h.getLogger("StorageManager"),b=function(){function StorageManager(t,e,n){var r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:1;if((0,p.default)(this,StorageManager),!t)throw Error("The Storage Manager needs the database instance");if(!e)throw Error("The Storage Manager needs the storage name");var o={};n?o=n:o[e]="key,version,value",t.version(r).stores(o),t.open().then(function(t){g.info("Found database name "+t.name+" with version no: "+t.verno)}).catch(g.error),this.db=t,this.storageName=e}return(0,y.default)(StorageManager,[{key:"_checkKey",value:function(t){return"string"!=typeof t?t.toString():t}},{key:"_getTable",value:function(t){var e=void 0;try{e=this.db.table(this.storageName).name}catch(n){e=this.db.table(t).name}return e}},{key:"_getPrimaryKey",value:function(t){return this.db.table(t).schema.primKey.name}},{key:"_isDefaultSchema",value:function(t){var e=this._getTable(t),n=this.db[e].schema.instanceTemplate;return n.hasOwnProperty("value")&&n.hasOwnProperty("version")&&n.hasOwnProperty("key")}},{key:"set",value:function(t,e,n,r){g.info("[StorageManager] - set ",t,n),r=r||t;var o=this._getTable(r),i=this._getPrimaryKey(o),u=n;if(this._isDefaultSchema(r))u={key:t,version:e,value:n};else{var a={};a[i]=t,(0,s.default)(u,a)}return this.db[o].put(u)}},{key:"get",value:function(t,e,n){var r=this;n=n||t;var i=this._getTable(n),a=this._getPrimaryKey(i);return this.db.transaction("rw!",this.db[i],function(){if(!t&&!e)return r.db[i].toArray().then(function(t){return t.reduce(function(t,e){return t[e[a]]=e,t},{})});if(!e)return r.db[i].where(a).equals(t).first().then(function(t){return t&&t.hasOwnProperty("value")?t.value:t});var n=void 0===e?"undefined":(0,f.default)(e);switch(Array.isArray(e)&&(n="array"),n){case"string":return r.db[i].where(t).equals(e).first().then(function(t){return t&&t.hasOwnProperty("value")?t.value:t});case"object":var c="value."+(0,u.default)(e).toString(),s=(0,o.default)(e);return r.db[i].where(c).anyOf(s).first().then(function(t){return t&&t.hasOwnProperty("value")?t.value:t});case"array":return r.db[i].where(e).then(function(t){return t&&t.hasOwnProperty("value")?t.value:t})}})}},{key:"getVersion",value:function(t,e,n){var r=this;g.info("[StorageManager] - getVersion for key ",t),n=n||t;var o=this._getTable(n),i=this._getPrimaryKey(o),u=e;return e||(u=t),this.db.transaction("rw!",this.db[o],function(){return r.db[o].where(i).equals(u).first().then(function(t){return t&&t.hasOwnProperty("version")?t.version:t}).catch(function(e){g.info("error getting the version for ",t," with error: ",e)})})}},{key:"delete",value:function(t,e,n){n=n||t;var r=this._getTable(n),o=this._getPrimaryKey(r),i=e;return e||(i=t),this.db[r].where(o).equals(i).delete()}}]),StorageManager}();e.default=b,t.exports=e.default},function(t,e,n){t.exports={default:n(174),__esModule:!0}},function(t,e,n){n(175),t.exports=n(0).Object.values},function(t,e,n){var r=n(5),o=n(176)(!1);r(r.S,"Object",{values:function(t){return o(t)}})},function(t,e,n){var r=n(19),o=n(12),i=n(27).f;t.exports=function(t){return function(e){for(var n,u=o(e),a=r(u),f=a.length,c=0,s=[];f>c;)i.call(u,n=a[c++])&&s.push(t?[n,u[n]]:u[n]);return s}}}])});
},{}],5:[function(require,module,exports){
// version: 0.13.0
// date: Fri Aug 31 2018 09:24:53 GMT+0100 (Western European Summer Time)
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


// version: 0.13.0
// date: Fri Aug 31 2018 09:24:53 GMT+0100 (Western European Summer Time)
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


!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define("minibus",[],e):"object"==typeof exports?exports.minibus=e():t.minibus=e()}("undefined"!=typeof self?self:this,function(){return function(t){function __webpack_require__(n){if(e[n])return e[n].exports;var r=e[n]={i:n,l:!1,exports:{}};return t[n].call(r.exports,r,r.exports,__webpack_require__),r.l=!0,r.exports}var e={};return __webpack_require__.m=t,__webpack_require__.c=e,__webpack_require__.d=function(t,e,n){__webpack_require__.o(t,e)||Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:n})},__webpack_require__.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return __webpack_require__.d(e,"a",e),e},__webpack_require__.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},__webpack_require__.p="",__webpack_require__(__webpack_require__.s=171)}([function(t,e){var n=t.exports={version:"2.5.7"};"number"==typeof __e&&(__e=n)},function(t,e){var n=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=n)},function(t,e,n){var r=n(30)("wks"),o=n(21),i=n(1).Symbol,u="function"==typeof i;(t.exports=function(t){return r[t]||(r[t]=u&&i[t]||(u?i:o)("Symbol."+t))}).store=r},function(t,e,n){"use strict";e.__esModule=!0,e.default=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}},function(t,e,n){"use strict";e.__esModule=!0;var r=n(60),o=function(t){return t&&t.__esModule?t:{default:t}}(r);e.default=function(){function defineProperties(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),(0,o.default)(t,r.key,r)}}return function(t,e,n){return e&&defineProperties(t.prototype,e),n&&defineProperties(t,n),t}}()},function(t,e,n){var r=n(1),o=n(0),i=n(18),u=n(11),s=n(10),c=function(t,e,n){var f,a,l,p=t&c.F,v=t&c.G,d=t&c.S,h=t&c.P,y=t&c.B,_=t&c.W,b=v?o:o[e]||(o[e]={}),g=b.prototype,m=v?r:d?r[e]:(r[e]||{}).prototype;v&&(n=e);for(f in n)(a=!p&&m&&void 0!==m[f])&&s(b,f)||(l=a?m[f]:n[f],b[f]=v&&"function"!=typeof m[f]?n[f]:y&&a?i(l,r):_&&m[f]==l?function(t){var e=function(e,n,r){if(this instanceof t){switch(arguments.length){case 0:return new t;case 1:return new t(e);case 2:return new t(e,n)}return new t(e,n,r)}return t.apply(this,arguments)};return e.prototype=t.prototype,e}(l):h&&"function"==typeof l?i(Function.call,l):l,h&&((b.virtual||(b.virtual={}))[f]=l,t&c.R&&g&&!g[f]&&u(g,f,l)))};c.F=1,c.G=2,c.S=4,c.P=8,c.B=16,c.W=32,c.U=64,c.R=128,t.exports=c},function(t,e,n){t.exports=!n(13)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},function(t,e,n){var r=n(9);t.exports=function(t){if(!r(t))throw TypeError(t+" is not an object!");return t}},function(t,e,n){var r=n(7),o=n(41),i=n(28),u=Object.defineProperty;e.f=n(6)?Object.defineProperty:function(t,e,n){if(r(t),e=i(e,!0),r(n),o)try{return u(t,e,n)}catch(t){}if("get"in n||"set"in n)throw TypeError("Accessors not supported!");return"value"in n&&(t[e]=n.value),t}},function(t,e){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},function(t,e){var n={}.hasOwnProperty;t.exports=function(t,e){return n.call(t,e)}},function(t,e,n){var r=n(8),o=n(20);t.exports=n(6)?function(t,e,n){return r.f(t,e,o(1,n))}:function(t,e,n){return t[e]=n,t}},function(t,e,n){var r=n(56),o=n(25);t.exports=function(t){return r(o(t))}},function(t,e){t.exports=function(t){try{return!!t()}catch(t){return!0}}},function(t,e){t.exports=!0},function(t,e){t.exports={}},function(t,e){var n={}.toString;t.exports=function(t){return n.call(t).slice(8,-1)}},function(t,e,n){t.exports={default:n(88),__esModule:!0}},function(t,e,n){var r=n(22);t.exports=function(t,e,n){if(r(t),void 0===e)return t;switch(n){case 1:return function(n){return t.call(e,n)};case 2:return function(n,r){return t.call(e,n,r)};case 3:return function(n,r,o){return t.call(e,n,r,o)}}return function(){return t.apply(e,arguments)}}},function(t,e,n){var r=n(42),o=n(31);t.exports=Object.keys||function(t){return r(t,o)}},function(t,e){t.exports=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}}},function(t,e){var n=0,r=Math.random();t.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++n+r).toString(36))}},function(t,e){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},function(t,e,n){var r=n(8).f,o=n(10),i=n(2)("toStringTag");t.exports=function(t,e,n){t&&!o(t=n?t:t.prototype,i)&&r(t,i,{configurable:!0,value:e})}},function(t,e){var n=Math.ceil,r=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?r:n)(t)}},function(t,e){t.exports=function(t){if(void 0==t)throw TypeError("Can't call method on  "+t);return t}},function(t,e,n){t.exports={default:n(102),__esModule:!0}},function(t,e){e.f={}.propertyIsEnumerable},function(t,e,n){var r=n(9);t.exports=function(t,e){if(!r(t))return t;var n,o;if(e&&"function"==typeof(n=t.toString)&&!r(o=n.call(t)))return o;if("function"==typeof(n=t.valueOf)&&!r(o=n.call(t)))return o;if(!e&&"function"==typeof(n=t.toString)&&!r(o=n.call(t)))return o;throw TypeError("Can't convert object to primitive value")}},function(t,e,n){var r=n(30)("keys"),o=n(21);t.exports=function(t){return r[t]||(r[t]=o(t))}},function(t,e,n){var r=n(0),o=n(1),i=o["__core-js_shared__"]||(o["__core-js_shared__"]={});(t.exports=function(t,e){return i[t]||(i[t]=void 0!==e?e:{})})("versions",[]).push({version:r.version,mode:n(14)?"pure":"global",copyright:"© 2018 Denis Pushkarev (zloirock.ru)"})},function(t,e){t.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},function(t,e,n){var r=n(9),o=n(1).document,i=r(o)&&r(o.createElement);t.exports=function(t){return i?o.createElement(t):{}}},function(t,e,n){var r=n(25);t.exports=function(t){return Object(r(t))}},function(t,e,n){"use strict";e.__esModule=!0;var r=n(53),o=function(t){return t&&t.__esModule?t:{default:t}}(r);e.default=function(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!==(void 0===e?"undefined":(0,o.default)(e))&&"function"!=typeof e?t:e}},function(t,e,n){"use strict";function _interopRequireDefault(t){return t&&t.__esModule?t:{default:t}}e.__esModule=!0;var r=n(104),o=_interopRequireDefault(r),i=n(108),u=_interopRequireDefault(i),s=n(53),c=_interopRequireDefault(s);e.default=function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+(void 0===e?"undefined":(0,c.default)(e)));t.prototype=(0,u.default)(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(o.default?(0,o.default)(t,e):t.__proto__=e)}},function(t,e,n){var r,o;!function(i,u){"use strict";r=u,void 0!==(o="function"==typeof r?r.call(e,n,e,t):r)&&(t.exports=o)}(0,function(){"use strict";function bindMethod(t,e){var n=t[e];if("function"==typeof n.bind)return n.bind(t);try{return Function.prototype.bind.call(n,t)}catch(e){return function(){return Function.prototype.apply.apply(n,[t,arguments])}}}function realMethod(n){return"debug"===n&&(n="log"),typeof console!==e&&(void 0!==console[n]?bindMethod(console,n):void 0!==console.log?bindMethod(console,"log"):t)}function replaceLoggingMethods(e,r){for(var o=0;o<n.length;o++){var i=n[o];this[i]=o<e?t:this.methodFactory(i,e,r)}this.log=this.debug}function enableLoggingWhenConsoleArrives(t,n,r){return function(){typeof console!==e&&(replaceLoggingMethods.call(this,n,r),this[t].apply(this,arguments))}}function defaultMethodFactory(t,e,n){return realMethod(t)||enableLoggingWhenConsoleArrives.apply(this,arguments)}function Logger(t,r,o){function persistLevelIfPossible(t){var r=(n[t]||"silent").toUpperCase();if(typeof window!==e){try{return void(window.localStorage[s]=r)}catch(t){}try{window.document.cookie=encodeURIComponent(s)+"="+r+";"}catch(t){}}}function getPersistedLevel(){var t;if(typeof window!==e){try{t=window.localStorage[s]}catch(t){}if(typeof t===e)try{var n=window.document.cookie,r=n.indexOf(encodeURIComponent(s)+"=");-1!==r&&(t=/^([^;]+)/.exec(n.slice(r))[1])}catch(t){}return void 0===u.levels[t]&&(t=void 0),t}}var i,u=this,s="loglevel";t&&(s+=":"+t),u.name=t,u.levels={TRACE:0,DEBUG:1,INFO:2,WARN:3,ERROR:4,SILENT:5},u.methodFactory=o||defaultMethodFactory,u.getLevel=function(){return i},u.setLevel=function(n,r){if("string"==typeof n&&void 0!==u.levels[n.toUpperCase()]&&(n=u.levels[n.toUpperCase()]),!("number"==typeof n&&n>=0&&n<=u.levels.SILENT))throw"log.setLevel() called with invalid level: "+n;if(i=n,!1!==r&&persistLevelIfPossible(n),replaceLoggingMethods.call(u,n,t),typeof console===e&&n<u.levels.SILENT)return"No console available for logging"},u.setDefaultLevel=function(t){getPersistedLevel()||u.setLevel(t,!1)},u.enableAll=function(t){u.setLevel(u.levels.TRACE,t)},u.disableAll=function(t){u.setLevel(u.levels.SILENT,t)};var c=getPersistedLevel();null==c&&(c=null==r?"WARN":r),u.setLevel(c,!1)}var t=function(){},e="undefined",n=["trace","debug","info","warn","error"],r=new Logger,o={};r.getLogger=function(t){if("string"!=typeof t||""===t)throw new TypeError("You must supply a name when creating a logger.");var e=o[t];return e||(e=o[t]=new Logger(t,r.getLevel(),r.methodFactory)),e};var i=typeof window!==e?window.log:void 0;return r.noConflict=function(){return typeof window!==e&&window.log===r&&(window.log=i),r},r.getLoggers=function(){return o},r})},function(t,e,n){e.f=n(2)},function(t,e,n){var r=n(1),o=n(0),i=n(14),u=n(37),s=n(8).f;t.exports=function(t){var e=o.Symbol||(o.Symbol=i?{}:r.Symbol||{});"_"==t.charAt(0)||t in e||s(e,t,{value:u.f(t)})}},,function(t,e,n){var r=n(7),o=n(72),i=n(31),u=n(29)("IE_PROTO"),s=function(){},c=function(){var t,e=n(32)("iframe"),r=i.length;for(e.style.display="none",n(57).appendChild(e),e.src="javascript:",t=e.contentWindow.document,t.open(),t.write("<script>document.F=Object<\/script>"),t.close(),c=t.F;r--;)delete c.prototype[i[r]];return c()};t.exports=Object.create||function(t,e){var n;return null!==t?(s.prototype=r(t),n=new s,s.prototype=null,n[u]=t):n=c(),void 0===e?n:o(n,e)}},function(t,e,n){t.exports=!n(6)&&!n(13)(function(){return 7!=Object.defineProperty(n(32)("div"),"a",{get:function(){return 7}}).a})},function(t,e,n){var r=n(10),o=n(12),i=n(61)(!1),u=n(29)("IE_PROTO");t.exports=function(t,e){var n,s=o(t),c=0,f=[];for(n in s)n!=u&&r(s,n)&&f.push(n);for(;e.length>c;)r(s,n=e[c++])&&(~i(f,n)||f.push(n));return f}},function(t,e){e.f=Object.getOwnPropertySymbols},,function(t,e,n){"use strict";var r=n(70)(!0);n(51)(String,"String",function(t){this._t=String(t),this._i=0},function(){var t,e=this._t,n=this._i;return n>=e.length?{value:void 0,done:!0}:(t=r(e,n),this._i+=t.length,{value:t,done:!1})})},function(t,e,n){var r=n(24),o=Math.min;t.exports=function(t){return t>0?o(r(t),9007199254740991):0}},function(t,e,n){n(73);for(var r=n(1),o=n(11),i=n(15),u=n(2)("toStringTag"),s="CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,TextTrackList,TouchList".split(","),c=0;c<s.length;c++){var f=s[c],a=r[f],l=a&&a.prototype;l&&!l[u]&&o(l,u,f),i[f]=i.Array}},function(t,e,n){"use strict";function PromiseCapability(t){var e,n;this.promise=new t(function(t,r){if(void 0!==e||void 0!==n)throw TypeError("Bad Promise constructor");e=t,n=r}),this.resolve=r(e),this.reject=r(n)}var r=n(22);t.exports.f=function(t){return new PromiseCapability(t)}},function(t,e,n){var r=n(5),o=n(0),i=n(13);t.exports=function(t,e){var n=(o.Object||{})[t]||Object[t],u={};u[t]=e(n),r(r.S+r.F*i(function(){n(1)}),"Object",u)}},function(t,e,n){var r=n(27),o=n(20),i=n(12),u=n(28),s=n(10),c=n(41),f=Object.getOwnPropertyDescriptor;e.f=n(6)?f:function(t,e){if(t=i(t),e=u(e,!0),c)try{return f(t,e)}catch(t){}if(s(t,e))return o(!r.f.call(t,e),t[e])}},function(t,e,n){"use strict";var r=n(14),o=n(5),i=n(52),u=n(11),s=n(15),c=n(71),f=n(23),a=n(58),l=n(2)("iterator"),p=!([].keys&&"next"in[].keys()),v=function(){return this};t.exports=function(t,e,n,d,h,y,_){c(n,e,d);var b,g,m,w=function(t){if(!p&&t in P)return P[t];switch(t){case"keys":case"values":return function(){return new n(this,t)}}return function(){return new n(this,t)}},x=e+" Iterator",O="values"==h,M=!1,P=t.prototype,S=P[l]||P["@@iterator"]||h&&P[h],L=S||w(h),j=h?O?w("entries"):L:void 0,k="Array"==e?P.entries||S:S;if(k&&(m=a(k.call(new t)))!==Object.prototype&&m.next&&(f(m,x,!0),r||"function"==typeof m[l]||u(m,l,v)),O&&S&&"values"!==S.name&&(M=!0,L=function(){return S.call(this)}),r&&!_||!p&&!M&&P[l]||u(P,l,L),s[e]=L,s[x]=v,h)if(b={values:O?L:w("values"),keys:y?L:w("keys"),entries:j},_)for(g in b)g in P||i(P,g,b[g]);else o(o.P+o.F*(p||M),e,b);return b}},function(t,e,n){t.exports=n(11)},function(t,e,n){"use strict";function _interopRequireDefault(t){return t&&t.__esModule?t:{default:t}}e.__esModule=!0;var r=n(76),o=_interopRequireDefault(r),i=n(78),u=_interopRequireDefault(i),s="function"==typeof u.default&&"symbol"==typeof o.default?function(t){return typeof t}:function(t){return t&&"function"==typeof u.default&&t.constructor===u.default&&t!==u.default.prototype?"symbol":typeof t};e.default="function"==typeof u.default&&"symbol"===s(o.default)?function(t){return void 0===t?"undefined":s(t)}:function(t){return t&&"function"==typeof u.default&&t.constructor===u.default&&t!==u.default.prototype?"symbol":void 0===t?"undefined":s(t)}},function(t,e,n){var r=n(42),o=n(31).concat("length","prototype");e.f=Object.getOwnPropertyNames||function(t){return r(t,o)}},function(t,e){},function(t,e,n){var r=n(16);t.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==r(t)?t.split(""):Object(t)}},function(t,e,n){var r=n(1).document;t.exports=r&&r.documentElement},function(t,e,n){var r=n(10),o=n(33),i=n(29)("IE_PROTO"),u=Object.prototype;t.exports=Object.getPrototypeOf||function(t){return t=o(t),r(t,i)?t[i]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?u:null}},function(t,e,n){var r=n(16),o=n(2)("toStringTag"),i="Arguments"==r(function(){return arguments}()),u=function(t,e){try{return t[e]}catch(t){}};t.exports=function(t){var e,n,s;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(n=u(e=Object(t),o))?n:i?r(e):"Object"==(s=r(e))&&"function"==typeof e.callee?"Arguments":s}},function(t,e,n){t.exports={default:n(67),__esModule:!0}},function(t,e,n){var r=n(12),o=n(46),i=n(62);t.exports=function(t){return function(e,n,u){var s,c=r(e),f=o(c.length),a=i(u,f);if(t&&n!=n){for(;f>a;)if((s=c[a++])!=s)return!0}else for(;f>a;a++)if((t||a in c)&&c[a]===n)return t||a||0;return!t&&-1}}},function(t,e,n){var r=n(24),o=Math.max,i=Math.min;t.exports=function(t,e){return t=r(t),t<0?o(t+e,0):i(t,e)}},function(t,e,n){var r=n(7),o=n(22),i=n(2)("species");t.exports=function(t,e){var n,u=r(t).constructor;return void 0===u||void 0==(n=r(u)[i])?e:o(n)}},function(t,e,n){var r,o,i,u=n(18),s=n(94),c=n(57),f=n(32),a=n(1),l=a.process,p=a.setImmediate,v=a.clearImmediate,d=a.MessageChannel,h=a.Dispatch,y=0,_={},b=function(){var t=+this;if(_.hasOwnProperty(t)){var e=_[t];delete _[t],e()}},g=function(t){b.call(t.data)};p&&v||(p=function(t){for(var e=[],n=1;arguments.length>n;)e.push(arguments[n++]);return _[++y]=function(){s("function"==typeof t?t:Function(t),e)},r(y),y},v=function(t){delete _[t]},"process"==n(16)(l)?r=function(t){l.nextTick(u(b,t,1))}:h&&h.now?r=function(t){h.now(u(b,t,1))}:d?(o=new d,i=o.port2,o.port1.onmessage=g,r=u(i.postMessage,i,1)):a.addEventListener&&"function"==typeof postMessage&&!a.importScripts?(r=function(t){a.postMessage(t+"","*")},a.addEventListener("message",g,!1)):r="onreadystatechange"in f("script")?function(t){c.appendChild(f("script")).onreadystatechange=function(){c.removeChild(this),b.call(t)}}:function(t){setTimeout(u(b,t,1),0)}),t.exports={set:p,clear:v}},function(t,e){t.exports=function(t){try{return{e:!1,v:t()}}catch(t){return{e:!0,v:t}}}},function(t,e,n){var r=n(7),o=n(9),i=n(48);t.exports=function(t,e){if(r(t),o(e)&&e.constructor===t)return e;var n=i.f(t);return(0,n.resolve)(e),n.promise}},function(t,e,n){n(68);var r=n(0).Object;t.exports=function(t,e,n){return r.defineProperty(t,e,n)}},function(t,e,n){var r=n(5);r(r.S+r.F*!n(6),"Object",{defineProperty:n(8).f})},,function(t,e,n){var r=n(24),o=n(25);t.exports=function(t){return function(e,n){var i,u,s=String(o(e)),c=r(n),f=s.length;return c<0||c>=f?t?"":void 0:(i=s.charCodeAt(c),i<55296||i>56319||c+1===f||(u=s.charCodeAt(c+1))<56320||u>57343?t?s.charAt(c):i:t?s.slice(c,c+2):u-56320+(i-55296<<10)+65536)}}},function(t,e,n){"use strict";var r=n(40),o=n(20),i=n(23),u={};n(11)(u,n(2)("iterator"),function(){return this}),t.exports=function(t,e,n){t.prototype=r(u,{next:o(1,n)}),i(t,e+" Iterator")}},function(t,e,n){var r=n(8),o=n(7),i=n(19);t.exports=n(6)?Object.defineProperties:function(t,e){o(t);for(var n,u=i(e),s=u.length,c=0;s>c;)r.f(t,n=u[c++],e[n]);return t}},function(t,e,n){"use strict";var r=n(74),o=n(75),i=n(15),u=n(12);t.exports=n(51)(Array,"Array",function(t,e){this._t=u(t),this._i=0,this._k=e},function(){var t=this._t,e=this._k,n=this._i++;return!t||n>=t.length?(this._t=void 0,o(1)):"keys"==e?o(0,n):"values"==e?o(0,t[n]):o(0,[n,t[n]])},"values"),i.Arguments=i.Array,r("keys"),r("values"),r("entries")},function(t,e){t.exports=function(){}},function(t,e){t.exports=function(t,e){return{value:e,done:!!t}}},function(t,e,n){t.exports={default:n(77),__esModule:!0}},function(t,e,n){n(45),n(47),t.exports=n(37).f("iterator")},function(t,e,n){t.exports={default:n(79),__esModule:!0}},function(t,e,n){n(80),n(55),n(85),n(86),t.exports=n(0).Symbol},function(t,e,n){"use strict";var r=n(1),o=n(10),i=n(6),u=n(5),s=n(52),c=n(81).KEY,f=n(13),a=n(30),l=n(23),p=n(21),v=n(2),d=n(37),h=n(38),y=n(82),_=n(83),b=n(7),g=n(9),m=n(12),w=n(28),x=n(20),O=n(40),M=n(84),P=n(50),S=n(8),L=n(19),j=P.f,k=S.f,E=M.f,R=r.Symbol,T=r.JSON,C=T&&T.stringify,A=v("_hidden"),D=v("toPrimitive"),F={}.propertyIsEnumerable,q=a("symbol-registry"),I=a("symbols"),N=a("op-symbols"),B=Object.prototype,W="function"==typeof R,G=r.QObject,U=!G||!G.prototype||!G.prototype.findChild,V=i&&f(function(){return 7!=O(k({},"a",{get:function(){return k(this,"a",{value:7}).a}})).a})?function(t,e,n){var r=j(B,e);r&&delete B[e],k(t,e,n),r&&t!==B&&k(B,e,r)}:k,H=function(t){var e=I[t]=O(R.prototype);return e._k=t,e},K=W&&"symbol"==typeof R.iterator?function(t){return"symbol"==typeof t}:function(t){return t instanceof R},J=function(t,e,n){return t===B&&J(N,e,n),b(t),e=w(e,!0),b(n),o(I,e)?(n.enumerable?(o(t,A)&&t[A][e]&&(t[A][e]=!1),n=O(n,{enumerable:x(0,!1)})):(o(t,A)||k(t,A,x(1,{})),t[A][e]=!0),V(t,e,n)):k(t,e,n)},z=function(t,e){b(t);for(var n,r=y(e=m(e)),o=0,i=r.length;i>o;)J(t,n=r[o++],e[n]);return t},Y=function(t,e){return void 0===e?O(t):z(O(t),e)},Q=function(t){var e=F.call(this,t=w(t,!0));return!(this===B&&o(I,t)&&!o(N,t))&&(!(e||!o(this,t)||!o(I,t)||o(this,A)&&this[A][t])||e)},X=function(t,e){if(t=m(t),e=w(e,!0),t!==B||!o(I,e)||o(N,e)){var n=j(t,e);return!n||!o(I,e)||o(t,A)&&t[A][e]||(n.enumerable=!0),n}},Z=function(t){for(var e,n=E(m(t)),r=[],i=0;n.length>i;)o(I,e=n[i++])||e==A||e==c||r.push(e);return r},$=function(t){for(var e,n=t===B,r=E(n?N:m(t)),i=[],u=0;r.length>u;)!o(I,e=r[u++])||n&&!o(B,e)||i.push(I[e]);return i};W||(R=function(){if(this instanceof R)throw TypeError("Symbol is not a constructor!");var t=p(arguments.length>0?arguments[0]:void 0),e=function(n){this===B&&e.call(N,n),o(this,A)&&o(this[A],t)&&(this[A][t]=!1),V(this,t,x(1,n))};return i&&U&&V(B,t,{configurable:!0,set:e}),H(t)},s(R.prototype,"toString",function(){return this._k}),P.f=X,S.f=J,n(54).f=M.f=Z,n(27).f=Q,n(43).f=$,i&&!n(14)&&s(B,"propertyIsEnumerable",Q,!0),d.f=function(t){return H(v(t))}),u(u.G+u.W+u.F*!W,{Symbol:R});for(var tt="hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),et=0;tt.length>et;)v(tt[et++]);for(var nt=L(v.store),rt=0;nt.length>rt;)h(nt[rt++]);u(u.S+u.F*!W,"Symbol",{for:function(t){return o(q,t+="")?q[t]:q[t]=R(t)},keyFor:function(t){if(!K(t))throw TypeError(t+" is not a symbol!");for(var e in q)if(q[e]===t)return e},useSetter:function(){U=!0},useSimple:function(){U=!1}}),u(u.S+u.F*!W,"Object",{create:Y,defineProperty:J,defineProperties:z,getOwnPropertyDescriptor:X,getOwnPropertyNames:Z,getOwnPropertySymbols:$}),T&&u(u.S+u.F*(!W||f(function(){var t=R();return"[null]"!=C([t])||"{}"!=C({a:t})||"{}"!=C(Object(t))})),"JSON",{stringify:function(t){for(var e,n,r=[t],o=1;arguments.length>o;)r.push(arguments[o++]);if(n=e=r[1],(g(e)||void 0!==t)&&!K(t))return _(e)||(e=function(t,e){if("function"==typeof n&&(e=n.call(this,t,e)),!K(e))return e}),r[1]=e,C.apply(T,r)}}),R.prototype[D]||n(11)(R.prototype,D,R.prototype.valueOf),l(R,"Symbol"),l(Math,"Math",!0),l(r.JSON,"JSON",!0)},function(t,e,n){var r=n(21)("meta"),o=n(9),i=n(10),u=n(8).f,s=0,c=Object.isExtensible||function(){return!0},f=!n(13)(function(){return c(Object.preventExtensions({}))}),a=function(t){u(t,r,{value:{i:"O"+ ++s,w:{}}})},l=function(t,e){if(!o(t))return"symbol"==typeof t?t:("string"==typeof t?"S":"P")+t;if(!i(t,r)){if(!c(t))return"F";if(!e)return"E";a(t)}return t[r].i},p=function(t,e){if(!i(t,r)){if(!c(t))return!0;if(!e)return!1;a(t)}return t[r].w},v=function(t){return f&&d.NEED&&c(t)&&!i(t,r)&&a(t),t},d=t.exports={KEY:r,NEED:!1,fastKey:l,getWeak:p,onFreeze:v}},function(t,e,n){var r=n(19),o=n(43),i=n(27);t.exports=function(t){var e=r(t),n=o.f;if(n)for(var u,s=n(t),c=i.f,f=0;s.length>f;)c.call(t,u=s[f++])&&e.push(u);return e}},function(t,e,n){var r=n(16);t.exports=Array.isArray||function(t){return"Array"==r(t)}},function(t,e,n){var r=n(12),o=n(54).f,i={}.toString,u="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],s=function(t){try{return o(t)}catch(t){return u.slice()}};t.exports.f=function(t){return u&&"[object Window]"==i.call(t)?s(t):o(r(t))}},function(t,e,n){n(38)("asyncIterator")},function(t,e,n){n(38)("observable")},function(t,e,n){var r=n(59),o=n(2)("iterator"),i=n(15);t.exports=n(0).getIteratorMethod=function(t){if(void 0!=t)return t[o]||t["@@iterator"]||i[r(t)]}},function(t,e,n){n(55),n(45),n(47),n(89),n(100),n(101),t.exports=n(0).Promise},function(t,e,n){"use strict";var r,o,i,u,s=n(14),c=n(1),f=n(18),a=n(59),l=n(5),p=n(9),v=n(22),d=n(90),h=n(91),y=n(63),_=n(64).set,b=n(95)(),g=n(48),m=n(65),w=n(96),x=n(66),O=c.TypeError,M=c.process,P=M&&M.versions,S=P&&P.v8||"",L=c.Promise,j="process"==a(M),k=function(){},E=o=g.f,R=!!function(){try{var t=L.resolve(1),e=(t.constructor={})[n(2)("species")]=function(t){t(k,k)};return(j||"function"==typeof PromiseRejectionEvent)&&t.then(k)instanceof e&&0!==S.indexOf("6.6")&&-1===w.indexOf("Chrome/66")}catch(t){}}(),T=function(t){var e;return!(!p(t)||"function"!=typeof(e=t.then))&&e},C=function(t,e){if(!t._n){t._n=!0;var n=t._c;b(function(){for(var r=t._v,o=1==t._s,i=0;n.length>i;)!function(e){var n,i,u,s=o?e.ok:e.fail,c=e.resolve,f=e.reject,a=e.domain;try{s?(o||(2==t._h&&F(t),t._h=1),!0===s?n=r:(a&&a.enter(),n=s(r),a&&(a.exit(),u=!0)),n===e.promise?f(O("Promise-chain cycle")):(i=T(n))?i.call(n,c,f):c(n)):f(r)}catch(t){a&&!u&&a.exit(),f(t)}}(n[i++]);t._c=[],t._n=!1,e&&!t._h&&A(t)})}},A=function(t){_.call(c,function(){var e,n,r,o=t._v,i=D(t);if(i&&(e=m(function(){j?M.emit("unhandledRejection",o,t):(n=c.onunhandledrejection)?n({promise:t,reason:o}):(r=c.console)&&r.error&&r.error("Unhandled promise rejection",o)}),t._h=j||D(t)?2:1),t._a=void 0,i&&e.e)throw e.v})},D=function(t){return 1!==t._h&&0===(t._a||t._c).length},F=function(t){_.call(c,function(){var e;j?M.emit("rejectionHandled",t):(e=c.onrejectionhandled)&&e({promise:t,reason:t._v})})},q=function(t){var e=this;e._d||(e._d=!0,e=e._w||e,e._v=t,e._s=2,e._a||(e._a=e._c.slice()),C(e,!0))},I=function(t){var e,n=this;if(!n._d){n._d=!0,n=n._w||n;try{if(n===t)throw O("Promise can't be resolved itself");(e=T(t))?b(function(){var r={_w:n,_d:!1};try{e.call(t,f(I,r,1),f(q,r,1))}catch(t){q.call(r,t)}}):(n._v=t,n._s=1,C(n,!1))}catch(t){q.call({_w:n,_d:!1},t)}}};R||(L=function(t){d(this,L,"Promise","_h"),v(t),r.call(this);try{t(f(I,this,1),f(q,this,1))}catch(t){q.call(this,t)}},r=function(t){this._c=[],this._a=void 0,this._s=0,this._d=!1,this._v=void 0,this._h=0,this._n=!1},r.prototype=n(97)(L.prototype,{then:function(t,e){var n=E(y(this,L));return n.ok="function"!=typeof t||t,n.fail="function"==typeof e&&e,n.domain=j?M.domain:void 0,this._c.push(n),this._a&&this._a.push(n),this._s&&C(this,!1),n.promise},catch:function(t){return this.then(void 0,t)}}),i=function(){var t=new r;this.promise=t,this.resolve=f(I,t,1),this.reject=f(q,t,1)},g.f=E=function(t){return t===L||t===u?new i(t):o(t)}),l(l.G+l.W+l.F*!R,{Promise:L}),n(23)(L,"Promise"),n(98)("Promise"),u=n(0).Promise,l(l.S+l.F*!R,"Promise",{reject:function(t){var e=E(this);return(0,e.reject)(t),e.promise}}),l(l.S+l.F*(s||!R),"Promise",{resolve:function(t){return x(s&&this===u?L:this,t)}}),l(l.S+l.F*!(R&&n(99)(function(t){L.all(t).catch(k)})),"Promise",{all:function(t){var e=this,n=E(e),r=n.resolve,o=n.reject,i=m(function(){var n=[],i=0,u=1;h(t,!1,function(t){var s=i++,c=!1;n.push(void 0),u++,e.resolve(t).then(function(t){c||(c=!0,n[s]=t,--u||r(n))},o)}),--u||r(n)});return i.e&&o(i.v),n.promise},race:function(t){var e=this,n=E(e),r=n.reject,o=m(function(){h(t,!1,function(t){e.resolve(t).then(n.resolve,r)})});return o.e&&r(o.v),n.promise}})},function(t,e){t.exports=function(t,e,n,r){if(!(t instanceof e)||void 0!==r&&r in t)throw TypeError(n+": incorrect invocation!");return t}},function(t,e,n){var r=n(18),o=n(92),i=n(93),u=n(7),s=n(46),c=n(87),f={},a={},e=t.exports=function(t,e,n,l,p){var v,d,h,y,_=p?function(){return t}:c(t),b=r(n,l,e?2:1),g=0;if("function"!=typeof _)throw TypeError(t+" is not iterable!");if(i(_)){for(v=s(t.length);v>g;g++)if((y=e?b(u(d=t[g])[0],d[1]):b(t[g]))===f||y===a)return y}else for(h=_.call(t);!(d=h.next()).done;)if((y=o(h,b,d.value,e))===f||y===a)return y};e.BREAK=f,e.RETURN=a},function(t,e,n){var r=n(7);t.exports=function(t,e,n,o){try{return o?e(r(n)[0],n[1]):e(n)}catch(e){var i=t.return;throw void 0!==i&&r(i.call(t)),e}}},function(t,e,n){var r=n(15),o=n(2)("iterator"),i=Array.prototype;t.exports=function(t){return void 0!==t&&(r.Array===t||i[o]===t)}},function(t,e){t.exports=function(t,e,n){var r=void 0===n;switch(e.length){case 0:return r?t():t.call(n);case 1:return r?t(e[0]):t.call(n,e[0]);case 2:return r?t(e[0],e[1]):t.call(n,e[0],e[1]);case 3:return r?t(e[0],e[1],e[2]):t.call(n,e[0],e[1],e[2]);case 4:return r?t(e[0],e[1],e[2],e[3]):t.call(n,e[0],e[1],e[2],e[3])}return t.apply(n,e)}},function(t,e,n){var r=n(1),o=n(64).set,i=r.MutationObserver||r.WebKitMutationObserver,u=r.process,s=r.Promise,c="process"==n(16)(u);t.exports=function(){var t,e,n,f=function(){var r,o;for(c&&(r=u.domain)&&r.exit();t;){o=t.fn,t=t.next;try{o()}catch(r){throw t?n():e=void 0,r}}e=void 0,r&&r.enter()};if(c)n=function(){u.nextTick(f)};else if(!i||r.navigator&&r.navigator.standalone)if(s&&s.resolve){var a=s.resolve(void 0);n=function(){a.then(f)}}else n=function(){o.call(r,f)};else{var l=!0,p=document.createTextNode("");new i(f).observe(p,{characterData:!0}),n=function(){p.data=l=!l}}return function(r){var o={fn:r,next:void 0};e&&(e.next=o),t||(t=o,n()),e=o}}},function(t,e,n){var r=n(1),o=r.navigator;t.exports=o&&o.userAgent||""},function(t,e,n){var r=n(11);t.exports=function(t,e,n){for(var o in e)n&&t[o]?t[o]=e[o]:r(t,o,e[o]);return t}},function(t,e,n){"use strict";var r=n(1),o=n(0),i=n(8),u=n(6),s=n(2)("species");t.exports=function(t){var e="function"==typeof o[t]?o[t]:r[t];u&&e&&!e[s]&&i.f(e,s,{configurable:!0,get:function(){return this}})}},function(t,e,n){var r=n(2)("iterator"),o=!1;try{var i=[7][r]();i.return=function(){o=!0},Array.from(i,function(){throw 2})}catch(t){}t.exports=function(t,e){if(!e&&!o)return!1;var n=!1;try{var i=[7],u=i[r]();u.next=function(){return{done:n=!0}},i[r]=function(){return u},t(i)}catch(t){}return n}},function(t,e,n){"use strict";var r=n(5),o=n(0),i=n(1),u=n(63),s=n(66);r(r.P+r.R,"Promise",{finally:function(t){var e=u(this,o.Promise||i.Promise),n="function"==typeof t;return this.then(n?function(n){return s(e,t()).then(function(){return n})}:t,n?function(n){return s(e,t()).then(function(){throw n})}:t)}})},function(t,e,n){"use strict";var r=n(5),o=n(48),i=n(65);r(r.S,"Promise",{try:function(t){var e=o.f(this),n=i(t);return(n.e?e.reject:e.resolve)(n.v),e.promise}})},function(t,e,n){n(103),t.exports=n(0).Object.getPrototypeOf},function(t,e,n){var r=n(33),o=n(58);n(49)("getPrototypeOf",function(){return function(t){return o(r(t))}})},function(t,e,n){t.exports={default:n(105),__esModule:!0}},function(t,e,n){n(106),t.exports=n(0).Object.setPrototypeOf},function(t,e,n){var r=n(5);r(r.S,"Object",{setPrototypeOf:n(107).set})},function(t,e,n){var r=n(9),o=n(7),i=function(t,e){if(o(t),!r(e)&&null!==e)throw TypeError(e+": can't set as prototype!")};t.exports={set:Object.setPrototypeOf||("__proto__"in{}?function(t,e,r){try{r=n(18)(Function.call,n(50).f(Object.prototype,"__proto__").set,2),r(t,[]),e=!(t instanceof Array)}catch(t){e=!0}return function(t,n){return i(t,n),e?t.__proto__=n:r(t,n),t}}({},!1):void 0),check:i}},function(t,e,n){t.exports={default:n(109),__esModule:!0}},function(t,e,n){n(110);var r=n(0).Object;t.exports=function(t,e){return r.create(t,e)}},function(t,e,n){var r=n(5);r(r.S,"Object",{create:n(40)})},,,,,,,,,,,,,,,,function(t,e,n){"use strict";function _interopRequireDefault(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(e,"__esModule",{value:!0});var r=n(26),o=_interopRequireDefault(r),i=n(3),u=_interopRequireDefault(i),s=n(4),c=_interopRequireDefault(s),f=n(34),a=_interopRequireDefault(f),l=n(35),p=_interopRequireDefault(l),v=n(127),d=_interopRequireDefault(v),h=function(t){function MiniBus(){return(0,u.default)(this,MiniBus),(0,a.default)(this,(MiniBus.__proto__||(0,o.default)(MiniBus)).call(this))}return(0,p.default)(MiniBus,t),(0,c.default)(MiniBus,[{key:"postMessage",value:function(t,e,n){var r=this;return r._genId(t),r._responseCallback(t,e,n),r._onPostMessage(t),t.id}},{key:"_onMessage",value:function(t){var e=this;if(!e._onResponse(t)){var n=e._subscriptions[t.to];n?(e._publishOn(n,t),t.to.startsWith("hyperty")||e._publishOnDefault(t)):e._publishOnDefault(t)}}}]),MiniBus}(d.default);e.default=h,t.exports=e.default},function(t,e,n){"use strict";function _interopRequireDefault(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(e,"__esModule",{value:!0});var r=n(17),o=_interopRequireDefault(r),i=n(3),u=_interopRequireDefault(i),s=n(4),c=_interopRequireDefault(s),f=n(36),a=function(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);return e.default=t,e}(f),l=a.getLogger("Bus"),p=function(){function Bus(){(0,u.default)(this,Bus);var t=this;t._msgId=0,t._subscriptions={},t._responseTimeOut=3e4,t._responseCallbacks={},t._registerExternalListener()}return(0,c.default)(Bus,[{key:"addListener",value:function(t,e){var n=this,r=new v(n._subscriptions,t,e),o=n._subscriptions[t];return o||(o=[],n._subscriptions[t]=o),o.push(r),r}},{key:"addResponseListener",value:function(t,e,n){this._responseCallbacks[t+e]=n}},{key:"removeResponseListener",value:function(t,e){delete this._responseCallbacks[t+e]}},{key:"removeAllListenersOf",value:function(t){delete this._subscriptions[t]}},{key:"bind",value:function(t,e,n){var r=this,o=this;return{thisListener:o.addListener(t,function(t){n.postMessage(t)}),targetListener:n.addListener(e,function(t){o.postMessage(t)}),unbind:function(){r.thisListener.remove(),r.targetListener.remove()}}}},{key:"_publishOnDefault",value:function(t){var e=this._subscriptions["*"];e&&this._publishOn(e,t)}},{key:"_publishOn",value:function(t,e){t.forEach(function(t){t._callback(e)})}},{key:"_responseCallback",value:function(t,e){var n=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],r=this;if(e){var o=t.from+t.id;r._responseCallbacks[o]=e,n&&setTimeout(function(){var e=r._responseCallbacks[o];if(delete r._responseCallbacks[o],e){e({id:t.id,type:"response",body:{code:408,desc:"Response timeout!",value:t}})}},r._responseTimeOut)}}},{key:"_onResponse",value:function(t){var e=this;if("response"===t.type){var n=t.to+t.id,r=e._responseCallbacks[n];if(t.body.code>=200&&delete e._responseCallbacks[n],r)return r(t),!0}return!1}},{key:"_onMessage",value:function(t){var e=this;if(!e._onResponse(t)){var n=e._subscriptions[t.to];n?e._publishOn(n,t):e._publishOnDefault(t)}}},{key:"_genId",value:function(t){t.id&&0!==t.id||(this._msgId++,t.id=this._msgId)}},{key:"postMessage",value:function(t,e){}},{key:"postMessageWithRetries",value:function(t,e,n){var r=this,i=0,u=function(){return new o.default(function(e,o){r.postMessage(t,function(r){408===r.body.code||500===r.body.code?o():(l.info("[Bus.postMessageWithRetries] msg delivered: ",t),n(r),e())})})};!function tryAgain(){u().then(function(){},function(){if(l.warn("[Bus.postMessageWithRetries] Message Bounced (retry "+i+"): '",t),!(i++<e)){var n="[Error] Message Bounced (delivery attempts "+e+"): '";throw new Error(n+t)}tryAgain()})}()}},{key:"_onPostMessage",value:function(t){}},{key:"_registerExternalListener",value:function(){}}]),Bus}(),v=function(){function MsgListener(t,e,n){(0,u.default)(this,MsgListener);var r=this;r._subscriptions=t,r._url=e,r._callback=n}return(0,c.default)(MsgListener,[{key:"remove",value:function(){var t=this,e=t._subscriptions[t._url];if(e){var n=e.indexOf(t);e.splice(n,1),0===e.length&&delete t._subscriptions[t._url]}}},{key:"url",get:function(){return this._url}}]),MsgListener}();e.default=p,t.exports=e.default},,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=n(126),o=function(t){return t&&t.__esModule?t:{default:t}}(r);e.default=o.default,t.exports=e.default}])});
},{}],6:[function(require,module,exports){
// version: 0.13.0
// date: Fri Aug 31 2018 09:24:53 GMT+0100 (Western European Summer Time)
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


// version: 0.13.0
// date: Fri Aug 31 2018 09:24:53 GMT+0100 (Western European Summer Time)
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


!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("sandbox",[],t):"object"==typeof exports?exports.sandbox=t():e.sandbox=t()}("undefined"!=typeof self?self:this,function(){return function(e){function __webpack_require__(r){if(t[r])return t[r].exports;var n=t[r]={i:r,l:!1,exports:{}};return e[r].call(n.exports,n,n.exports,__webpack_require__),n.l=!0,n.exports}var t={};return __webpack_require__.m=e,__webpack_require__.c=t,__webpack_require__.d=function(e,t,r){__webpack_require__.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:r})},__webpack_require__.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return __webpack_require__.d(t,"a",t),t},__webpack_require__.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},__webpack_require__.p="",__webpack_require__(__webpack_require__.s=151)}([function(e,t){var r=e.exports={version:"2.5.7"};"number"==typeof __e&&(__e=r)},function(e,t){var r=e.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=r)},function(e,t,r){var n=r(30)("wks"),o=r(21),i=r(1).Symbol,a="function"==typeof i;(e.exports=function(e){return n[e]||(n[e]=a&&i[e]||(a?i:o)("Symbol."+e))}).store=n},function(e,t,r){"use strict";t.__esModule=!0,t.default=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}},function(e,t,r){"use strict";t.__esModule=!0;var n=r(60),o=function(e){return e&&e.__esModule?e:{default:e}}(n);t.default=function(){function defineProperties(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),(0,o.default)(e,n.key,n)}}return function(e,t,r){return t&&defineProperties(e.prototype,t),r&&defineProperties(e,r),e}}()},function(e,t,r){var n=r(1),o=r(0),i=r(18),a=r(11),s=r(10),u=function(e,t,r){var c,l,d,f=e&u.F,p=e&u.G,y=e&u.S,v=e&u.P,h=e&u.B,_=e&u.W,b=p?o:o[t]||(o[t]={}),m=b.prototype,g=p?n:y?n[t]:(n[t]||{}).prototype;p&&(r=t);for(c in r)(l=!f&&g&&void 0!==g[c])&&s(b,c)||(d=l?g[c]:r[c],b[c]=p&&"function"!=typeof g[c]?r[c]:h&&l?i(d,n):_&&g[c]==d?function(e){var t=function(t,r,n){if(this instanceof e){switch(arguments.length){case 0:return new e;case 1:return new e(t);case 2:return new e(t,r)}return new e(t,r,n)}return e.apply(this,arguments)};return t.prototype=e.prototype,t}(d):v&&"function"==typeof d?i(Function.call,d):d,v&&((b.virtual||(b.virtual={}))[c]=d,e&u.R&&m&&!m[c]&&a(m,c,d)))};u.F=1,u.G=2,u.S=4,u.P=8,u.B=16,u.W=32,u.U=64,u.R=128,e.exports=u},function(e,t,r){e.exports=!r(13)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},function(e,t,r){var n=r(9);e.exports=function(e){if(!n(e))throw TypeError(e+" is not an object!");return e}},function(e,t,r){var n=r(7),o=r(41),i=r(28),a=Object.defineProperty;t.f=r(6)?Object.defineProperty:function(e,t,r){if(n(e),t=i(t,!0),n(r),o)try{return a(e,t,r)}catch(e){}if("get"in r||"set"in r)throw TypeError("Accessors not supported!");return"value"in r&&(e[t]=r.value),e}},function(e,t){e.exports=function(e){return"object"==typeof e?null!==e:"function"==typeof e}},function(e,t){var r={}.hasOwnProperty;e.exports=function(e,t){return r.call(e,t)}},function(e,t,r){var n=r(8),o=r(20);e.exports=r(6)?function(e,t,r){return n.f(e,t,o(1,r))}:function(e,t,r){return e[t]=r,e}},function(e,t,r){var n=r(56),o=r(25);e.exports=function(e){return n(o(e))}},function(e,t){e.exports=function(e){try{return!!e()}catch(e){return!0}}},function(e,t){e.exports=!0},function(e,t){e.exports={}},function(e,t){var r={}.toString;e.exports=function(e){return r.call(e).slice(8,-1)}},function(e,t,r){e.exports={default:r(88),__esModule:!0}},function(e,t,r){var n=r(22);e.exports=function(e,t,r){if(n(e),void 0===t)return e;switch(r){case 1:return function(r){return e.call(t,r)};case 2:return function(r,n){return e.call(t,r,n)};case 3:return function(r,n,o){return e.call(t,r,n,o)}}return function(){return e.apply(t,arguments)}}},function(e,t,r){var n=r(42),o=r(31);e.exports=Object.keys||function(e){return n(e,o)}},function(e,t){e.exports=function(e,t){return{enumerable:!(1&e),configurable:!(2&e),writable:!(4&e),value:t}}},function(e,t){var r=0,n=Math.random();e.exports=function(e){return"Symbol(".concat(void 0===e?"":e,")_",(++r+n).toString(36))}},function(e,t){e.exports=function(e){if("function"!=typeof e)throw TypeError(e+" is not a function!");return e}},function(e,t,r){var n=r(8).f,o=r(10),i=r(2)("toStringTag");e.exports=function(e,t,r){e&&!o(e=r?e:e.prototype,i)&&n(e,i,{configurable:!0,value:t})}},function(e,t){var r=Math.ceil,n=Math.floor;e.exports=function(e){return isNaN(e=+e)?0:(e>0?n:r)(e)}},function(e,t){e.exports=function(e){if(void 0==e)throw TypeError("Can't call method on  "+e);return e}},function(e,t,r){e.exports={default:r(102),__esModule:!0}},function(e,t){t.f={}.propertyIsEnumerable},function(e,t,r){var n=r(9);e.exports=function(e,t){if(!n(e))return e;var r,o;if(t&&"function"==typeof(r=e.toString)&&!n(o=r.call(e)))return o;if("function"==typeof(r=e.valueOf)&&!n(o=r.call(e)))return o;if(!t&&"function"==typeof(r=e.toString)&&!n(o=r.call(e)))return o;throw TypeError("Can't convert object to primitive value")}},function(e,t,r){var n=r(30)("keys"),o=r(21);e.exports=function(e){return n[e]||(n[e]=o(e))}},function(e,t,r){var n=r(0),o=r(1),i=o["__core-js_shared__"]||(o["__core-js_shared__"]={});(e.exports=function(e,t){return i[e]||(i[e]=void 0!==t?t:{})})("versions",[]).push({version:n.version,mode:r(14)?"pure":"global",copyright:"© 2018 Denis Pushkarev (zloirock.ru)"})},function(e,t){e.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},function(e,t,r){var n=r(9),o=r(1).document,i=n(o)&&n(o.createElement);e.exports=function(e){return i?o.createElement(e):{}}},function(e,t,r){var n=r(25);e.exports=function(e){return Object(n(e))}},function(e,t,r){"use strict";t.__esModule=!0;var n=r(53),o=function(e){return e&&e.__esModule?e:{default:e}}(n);t.default=function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!==(void 0===t?"undefined":(0,o.default)(t))&&"function"!=typeof t?e:t}},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}t.__esModule=!0;var n=r(104),o=_interopRequireDefault(n),i=r(108),a=_interopRequireDefault(i),s=r(53),u=_interopRequireDefault(s);t.default=function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+(void 0===t?"undefined":(0,u.default)(t)));e.prototype=(0,a.default)(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(o.default?(0,o.default)(e,t):e.__proto__=t)}},function(e,t,r){var n,o;!function(i,a){"use strict";n=a,void 0!==(o="function"==typeof n?n.call(t,r,t,e):n)&&(e.exports=o)}(0,function(){"use strict";function bindMethod(e,t){var r=e[t];if("function"==typeof r.bind)return r.bind(e);try{return Function.prototype.bind.call(r,e)}catch(t){return function(){return Function.prototype.apply.apply(r,[e,arguments])}}}function realMethod(r){return"debug"===r&&(r="log"),typeof console!==t&&(void 0!==console[r]?bindMethod(console,r):void 0!==console.log?bindMethod(console,"log"):e)}function replaceLoggingMethods(t,n){for(var o=0;o<r.length;o++){var i=r[o];this[i]=o<t?e:this.methodFactory(i,t,n)}this.log=this.debug}function enableLoggingWhenConsoleArrives(e,r,n){return function(){typeof console!==t&&(replaceLoggingMethods.call(this,r,n),this[e].apply(this,arguments))}}function defaultMethodFactory(e,t,r){return realMethod(e)||enableLoggingWhenConsoleArrives.apply(this,arguments)}function Logger(e,n,o){function persistLevelIfPossible(e){var n=(r[e]||"silent").toUpperCase();if(typeof window!==t){try{return void(window.localStorage[s]=n)}catch(e){}try{window.document.cookie=encodeURIComponent(s)+"="+n+";"}catch(e){}}}function getPersistedLevel(){var e;if(typeof window!==t){try{e=window.localStorage[s]}catch(e){}if(typeof e===t)try{var r=window.document.cookie,n=r.indexOf(encodeURIComponent(s)+"=");-1!==n&&(e=/^([^;]+)/.exec(r.slice(n))[1])}catch(e){}return void 0===a.levels[e]&&(e=void 0),e}}var i,a=this,s="loglevel";e&&(s+=":"+e),a.name=e,a.levels={TRACE:0,DEBUG:1,INFO:2,WARN:3,ERROR:4,SILENT:5},a.methodFactory=o||defaultMethodFactory,a.getLevel=function(){return i},a.setLevel=function(r,n){if("string"==typeof r&&void 0!==a.levels[r.toUpperCase()]&&(r=a.levels[r.toUpperCase()]),!("number"==typeof r&&r>=0&&r<=a.levels.SILENT))throw"log.setLevel() called with invalid level: "+r;if(i=r,!1!==n&&persistLevelIfPossible(r),replaceLoggingMethods.call(a,r,e),typeof console===t&&r<a.levels.SILENT)return"No console available for logging"},a.setDefaultLevel=function(e){getPersistedLevel()||a.setLevel(e,!1)},a.enableAll=function(e){a.setLevel(a.levels.TRACE,e)},a.disableAll=function(e){a.setLevel(a.levels.SILENT,e)};var u=getPersistedLevel();null==u&&(u=null==n?"WARN":n),a.setLevel(u,!1)}var e=function(){},t="undefined",r=["trace","debug","info","warn","error"],n=new Logger,o={};n.getLogger=function(e){if("string"!=typeof e||""===e)throw new TypeError("You must supply a name when creating a logger.");var t=o[e];return t||(t=o[e]=new Logger(e,n.getLevel(),n.methodFactory)),t};var i=typeof window!==t?window.log:void 0;return n.noConflict=function(){return typeof window!==t&&window.log===n&&(window.log=i),n},n.getLoggers=function(){return o},n})},function(e,t,r){t.f=r(2)},function(e,t,r){var n=r(1),o=r(0),i=r(14),a=r(37),s=r(8).f;e.exports=function(e){var t=o.Symbol||(o.Symbol=i?{}:n.Symbol||{});"_"==e.charAt(0)||e in t||s(t,e,{value:a.f(e)})}},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function divideURL(e){function recurse(e){var t=/([a-zA-Z-]*)(:\/\/(?:\.)?|:)([-a-zA-Z0-9@:%._+~#=]{2,256})([-a-zA-Z0-9@:%._+~#=\/]*)/gi;return e.replace(t,"$1,$3,$4").split(",")}var t=recurse(e);if(t[0]===e&&!t[0].includes("@")){return{type:"",domain:e,identity:""}}if(t[0]===e&&t[0].includes("@")){t=recurse((t[0]===e?"smtp":t[0])+"://"+t[0])}return t[1].includes("@")&&(t[2]=t[0]+"://"+t[1],t[1]=t[1].substr(t[1].indexOf("@")+1)),{type:t[0],domain:t[1],identity:t[2]}}function emptyObject(e){return!((0,a.default)(e).length>0)}function secondsSinceEpoch(){return Math.floor(Date.now()/1e3)}function deepClone(e){if(e)return JSON.parse((0,o.default)(e))}function removePathFromURL(e){var t=e.split("/");return t[0]+"//"+t[2]+"/"+t[3]}function getUserURLFromEmail(e){var t=e.indexOf("@");return"user://"+e.substring(t+1,e.length)+"/"+e.substring(0,t)}function getUserEmailFromURL(e){var t=divideURL(e);return t.identity.replace("/","")+"@"+t.domain}function convertToUserURL(e){if("user://"===e.substring(0,7)){var t=divideURL(e);if(t.domain&&t.identity)return e;throw"userURL with wrong format"}return getUserURLFromEmail(e)}function isDataObjectURL(e){var t=["domain-idp","runtime","domain","hyperty"],r=e.split("://"),n=r[0];return-1===t.indexOf(n)}function isLegacy(e){return e.split("@").length>1}function isURL(e){return e.split("/").length>=3}function isUserURL(e){return"user"===divideURL(e).type}function isHypertyURL(e){return"hyperty"===divideURL(e).type}function getConfigurationResources(e,t,r){return e[t][r]}function buildURL(e,t,r,n){var i=arguments.length>4&&void 0!==arguments[4]&&arguments[4],a=e[t],s=void 0;if(!a.hasOwnProperty(r))throw Error("The configuration "+(0,o.default)(a,"",2)+" don't have the "+r+" resource you are looking for");var u=a[r];return n?(s=u.prefix+e.domain+u.suffix+n,u.hasOwnProperty("fallback")&&i&&(s=u.fallback.indexOf("%domain%")?u.fallback.replace(/(%domain%)/g,e.domain)+n:u.fallback+n)):s=u.prefix+e.domain+u.suffix,s}function generateGUID(){function s4(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return s4()+s4()+"-"+s4()+"-"+s4()+"-"+s4()+"-"+s4()+s4()+s4()}function getUserIdentityDomain(e){var t=divideURL(e),r=t.domain.split("."),n=r.length;return 1==n?r[n-1]:r[n-2]+"."+r[n-1]}function isBackendServiceURL(e){var t=divideURL(e),r=t.domain.split("."),n=["domain","global","domain-idp"],o=["registry","msg-node"],i=void 0;return r.length>1&&(i=r.filter(function(e){return-1!==o.indexOf(e)})[0]),!(!i||-1===o.indexOf(i))||!!t.type&&-1!==n.indexOf(t.type)}function divideEmail(e){var t=e.indexOf("@");return{username:e.substring(0,t),domain:e.substring(t+1,e.length)}}function assign(e,t,r){e||(e={}),"string"==typeof t&&(t=parseAttributes(t));for(var n=t.length-1,o=0;o<n;++o){var i=t[o];i in e||(e[i]={}),e=e[i]}e[t[n]]=r}function splitObjectURL(e){var t=e.split("/"),r=t[0]+"//"+t[2]+"/"+t[3],n=t[5],o={url:r,resource:n};return o}function checkAttribute(e){var t=/((([a-zA-Z]+):\/\/([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})\/[a-zA-Z0-9.]+@[a-zA-Z0-9]+(-)?[a-zA-Z0-9]+(\.)?[a-zA-Z0-9]{2,10}?\.[a-zA-Z]{2,10})(.+(?=.identity))?/gm,r=[],n=[];if(null==e.match(t))n=e.split(".");else{for(var o=void 0;null!==(o=t.exec(e));)o.index===t.lastIndex&&t.lastIndex++,o.forEach(function(e,t){0===t&&r.push(e)});var i=void 0;r.forEach(function(t){i=e.replace(t,"*-*"),n=i.split(".").map(function(e){return"*-*"===e?t:e})})}return n}function parseAttributes(e){var t=/([0-9a-zA-Z][-\w]*):\/\//g;if(e.includes("://")){var r=e.split(t)[0],n=r.split("."),o=e.replace(r,"");if(e.includes("identity")){var i=o.split("identity.");o=i[0].slice(".",-1),i=i[1].split("."),n.push(o,"identity"),n=n.concat(i)}else n.push(o);return n.filter(Boolean)}return e.split(".")}function isEmpty(e){for(var t in e)if(e.hasOwnProperty(t))return!1;return(0,o.default)(e)===(0,o.default)({})}function chatkeysToStringCloner(e){var t={},r=(0,a.default)(e);if(r)try{for(var n=0;n<r.length;n++){var o=r[n];t[o]={},t[o].sessionKey=e[o].sessionKey.toString(),t[o].isToEncrypt=e[o].isToEncrypt}}catch(e){}return t}function chatkeysToArrayCloner(e){var t={},r=(0,a.default)(e);if(r)try{for(var n=0;n<r.length;n++){var o=r[n];t[o]={};var i=JSON.parse("["+e[o].sessionKey+"]");t[o].sessionKey=new Uint8Array(i),t[o].isToEncrypt=e[o].isToEncrypt}}catch(e){}return t}function parseMessageURL(e){var t=e.split("/");return t.length<=6?t[0]+"//"+t[2]+"/"+t[3]:t[0]+"//"+t[2]+"/"+t[3]+"/"+t[4]}function availableSpace(e,t){var r=(e/t).toFixed(2);return{quota:t,usage:e,percent:Number(r)}}function encode(e){try{var t=stringify(e);return btoa(t)}catch(e){throw e}}function decode(e){try{return JSON.parse(atob(e))}catch(e){throw e}}function decodeToUint8Array(e){try{return new Uint8Array(decode(e))}catch(e){throw e}}function stringify(e){try{return e.constructor===Uint8Array?"["+e.toString()+"]":(0,o.default)(e)}catch(e){throw e}}function parse(e){try{return JSON.parse(e)}catch(e){throw e}}function parseToUint8Array(e){try{return new Uint8Array(parse(e))}catch(e){throw e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(69),o=_interopRequireDefault(n),i=r(44),a=_interopRequireDefault(i);t.divideURL=divideURL,t.emptyObject=emptyObject,t.secondsSinceEpoch=secondsSinceEpoch,t.deepClone=deepClone,t.removePathFromURL=removePathFromURL,t.getUserURLFromEmail=getUserURLFromEmail,t.getUserEmailFromURL=getUserEmailFromURL,t.convertToUserURL=convertToUserURL,t.isDataObjectURL=isDataObjectURL,t.isLegacy=isLegacy,t.isURL=isURL,t.isUserURL=isUserURL,t.isHypertyURL=isHypertyURL,t.getConfigurationResources=getConfigurationResources,t.buildURL=buildURL,t.generateGUID=generateGUID,t.getUserIdentityDomain=getUserIdentityDomain,t.isBackendServiceURL=isBackendServiceURL,t.divideEmail=divideEmail,t.assign=assign,t.splitObjectURL=splitObjectURL,t.checkAttribute=checkAttribute,t.parseAttributes=parseAttributes,t.isEmpty=isEmpty,t.chatkeysToStringCloner=chatkeysToStringCloner,t.chatkeysToArrayCloner=chatkeysToArrayCloner,t.parseMessageURL=parseMessageURL,t.availableSpace=availableSpace,t.encode=encode,t.decode=decode,t.decodeToUint8Array=decodeToUint8Array,t.stringify=stringify,t.parse=parse,t.parseToUint8Array=parseToUint8Array},function(e,t,r){var n=r(7),o=r(72),i=r(31),a=r(29)("IE_PROTO"),s=function(){},u=function(){var e,t=r(32)("iframe"),n=i.length;for(t.style.display="none",r(57).appendChild(t),t.src="javascript:",e=t.contentWindow.document,e.open(),e.write("<script>document.F=Object<\/script>"),e.close(),u=e.F;n--;)delete u.prototype[i[n]];return u()};e.exports=Object.create||function(e,t){var r;return null!==e?(s.prototype=n(e),r=new s,s.prototype=null,r[a]=e):r=u(),void 0===t?r:o(r,t)}},function(e,t,r){e.exports=!r(6)&&!r(13)(function(){return 7!=Object.defineProperty(r(32)("div"),"a",{get:function(){return 7}}).a})},function(e,t,r){var n=r(10),o=r(12),i=r(61)(!1),a=r(29)("IE_PROTO");e.exports=function(e,t){var r,s=o(e),u=0,c=[];for(r in s)r!=a&&n(s,r)&&c.push(r);for(;t.length>u;)n(s,r=t[u++])&&(~i(c,r)||c.push(r));return c}},function(e,t){t.f=Object.getOwnPropertySymbols},function(e,t,r){e.exports={default:r(112),__esModule:!0}},function(e,t,r){"use strict";var n=r(70)(!0);r(51)(String,"String",function(e){this._t=String(e),this._i=0},function(){var e,t=this._t,r=this._i;return r>=t.length?{value:void 0,done:!0}:(e=n(t,r),this._i+=e.length,{value:e,done:!1})})},function(e,t,r){var n=r(24),o=Math.min;e.exports=function(e){return e>0?o(n(e),9007199254740991):0}},function(e,t,r){r(73);for(var n=r(1),o=r(11),i=r(15),a=r(2)("toStringTag"),s="CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,TextTrackList,TouchList".split(","),u=0;u<s.length;u++){var c=s[u],l=n[c],d=l&&l.prototype;d&&!d[a]&&o(d,a,c),i[c]=i.Array}},function(e,t,r){"use strict";function PromiseCapability(e){var t,r;this.promise=new e(function(e,n){if(void 0!==t||void 0!==r)throw TypeError("Bad Promise constructor");t=e,r=n}),this.resolve=n(t),this.reject=n(r)}var n=r(22);e.exports.f=function(e){return new PromiseCapability(e)}},function(e,t,r){var n=r(5),o=r(0),i=r(13);e.exports=function(e,t){var r=(o.Object||{})[e]||Object[e],a={};a[e]=t(r),n(n.S+n.F*i(function(){r(1)}),"Object",a)}},function(e,t,r){var n=r(27),o=r(20),i=r(12),a=r(28),s=r(10),u=r(41),c=Object.getOwnPropertyDescriptor;t.f=r(6)?c:function(e,t){if(e=i(e),t=a(t,!0),u)try{return c(e,t)}catch(e){}if(s(e,t))return o(!n.f.call(e,t),e[t])}},function(e,t,r){"use strict";var n=r(14),o=r(5),i=r(52),a=r(11),s=r(15),u=r(71),c=r(23),l=r(58),d=r(2)("iterator"),f=!([].keys&&"next"in[].keys()),p=function(){return this};e.exports=function(e,t,r,y,v,h,_){u(r,t,y);var b,m,g,R=function(e){if(!f&&e in j)return j[e];switch(e){case"keys":case"values":return function(){return new r(this,e)}}return function(){return new r(this,e)}},O=t+" Iterator",D="values"==v,w=!1,j=e.prototype,L=j[d]||j["@@iterator"]||v&&j[v],k=L||R(v),U=v?D?R("entries"):k:void 0,M="Array"==t?j.entries||L:L;if(M&&(g=l(M.call(new e)))!==Object.prototype&&g.next&&(c(g,O,!0),n||"function"==typeof g[d]||a(g,d,p)),D&&L&&"values"!==L.name&&(w=!0,k=function(){return L.call(this)}),n&&!_||!f&&!w&&j[d]||a(j,d,k),s[t]=k,s[O]=p,v)if(b={values:D?k:R("values"),keys:h?k:R("keys"),entries:U},_)for(m in b)m in j||i(j,m,b[m]);else o(o.P+o.F*(f||w),t,b);return b}},function(e,t,r){e.exports=r(11)},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}t.__esModule=!0;var n=r(76),o=_interopRequireDefault(n),i=r(78),a=_interopRequireDefault(i),s="function"==typeof a.default&&"symbol"==typeof o.default?function(e){return typeof e}:function(e){return e&&"function"==typeof a.default&&e.constructor===a.default&&e!==a.default.prototype?"symbol":typeof e};t.default="function"==typeof a.default&&"symbol"===s(o.default)?function(e){return void 0===e?"undefined":s(e)}:function(e){return e&&"function"==typeof a.default&&e.constructor===a.default&&e!==a.default.prototype?"symbol":void 0===e?"undefined":s(e)}},function(e,t,r){var n=r(42),o=r(31).concat("length","prototype");t.f=Object.getOwnPropertyNames||function(e){return n(e,o)}},function(e,t){},function(e,t,r){var n=r(16);e.exports=Object("z").propertyIsEnumerable(0)?Object:function(e){return"String"==n(e)?e.split(""):Object(e)}},function(e,t,r){var n=r(1).document;e.exports=n&&n.documentElement},function(e,t,r){var n=r(10),o=r(33),i=r(29)("IE_PROTO"),a=Object.prototype;e.exports=Object.getPrototypeOf||function(e){return e=o(e),n(e,i)?e[i]:"function"==typeof e.constructor&&e instanceof e.constructor?e.constructor.prototype:e instanceof Object?a:null}},function(e,t,r){var n=r(16),o=r(2)("toStringTag"),i="Arguments"==n(function(){return arguments}()),a=function(e,t){try{return e[t]}catch(e){}};e.exports=function(e){var t,r,s;return void 0===e?"Undefined":null===e?"Null":"string"==typeof(r=a(t=Object(e),o))?r:i?n(t):"Object"==(s=n(t))&&"function"==typeof t.callee?"Arguments":s}},function(e,t,r){e.exports={default:r(67),__esModule:!0}},function(e,t,r){var n=r(12),o=r(46),i=r(62);e.exports=function(e){return function(t,r,a){var s,u=n(t),c=o(u.length),l=i(a,c);if(e&&r!=r){for(;c>l;)if((s=u[l++])!=s)return!0}else for(;c>l;l++)if((e||l in u)&&u[l]===r)return e||l||0;return!e&&-1}}},function(e,t,r){var n=r(24),o=Math.max,i=Math.min;e.exports=function(e,t){return e=n(e),e<0?o(e+t,0):i(e,t)}},function(e,t,r){var n=r(7),o=r(22),i=r(2)("species");e.exports=function(e,t){var r,a=n(e).constructor;return void 0===a||void 0==(r=n(a)[i])?t:o(r)}},function(e,t,r){var n,o,i,a=r(18),s=r(94),u=r(57),c=r(32),l=r(1),d=l.process,f=l.setImmediate,p=l.clearImmediate,y=l.MessageChannel,v=l.Dispatch,h=0,_={},b=function(){var e=+this;if(_.hasOwnProperty(e)){var t=_[e];delete _[e],t()}},m=function(e){b.call(e.data)};f&&p||(f=function(e){for(var t=[],r=1;arguments.length>r;)t.push(arguments[r++]);return _[++h]=function(){s("function"==typeof e?e:Function(e),t)},n(h),h},p=function(e){delete _[e]},"process"==r(16)(d)?n=function(e){d.nextTick(a(b,e,1))}:v&&v.now?n=function(e){v.now(a(b,e,1))}:y?(o=new y,i=o.port2,o.port1.onmessage=m,n=a(i.postMessage,i,1)):l.addEventListener&&"function"==typeof postMessage&&!l.importScripts?(n=function(e){l.postMessage(e+"","*")},l.addEventListener("message",m,!1)):n="onreadystatechange"in c("script")?function(e){u.appendChild(c("script")).onreadystatechange=function(){u.removeChild(this),b.call(e)}}:function(e){setTimeout(a(b,e,1),0)}),e.exports={set:f,clear:p}},function(e,t){e.exports=function(e){try{return{e:!1,v:e()}}catch(e){return{e:!0,v:e}}}},function(e,t,r){var n=r(7),o=r(9),i=r(48);e.exports=function(e,t){if(n(e),o(t)&&t.constructor===e)return t;var r=i.f(e);return(0,r.resolve)(t),r.promise}},function(e,t,r){r(68);var n=r(0).Object;e.exports=function(e,t,r){return n.defineProperty(e,t,r)}},function(e,t,r){var n=r(5);n(n.S+n.F*!r(6),"Object",{defineProperty:r(8).f})},function(e,t,r){e.exports={default:r(111),__esModule:!0}},function(e,t,r){var n=r(24),o=r(25);e.exports=function(e){return function(t,r){var i,a,s=String(o(t)),u=n(r),c=s.length;return u<0||u>=c?e?"":void 0:(i=s.charCodeAt(u),i<55296||i>56319||u+1===c||(a=s.charCodeAt(u+1))<56320||a>57343?e?s.charAt(u):i:e?s.slice(u,u+2):a-56320+(i-55296<<10)+65536)}}},function(e,t,r){"use strict";var n=r(40),o=r(20),i=r(23),a={};r(11)(a,r(2)("iterator"),function(){return this}),e.exports=function(e,t,r){e.prototype=n(a,{next:o(1,r)}),i(e,t+" Iterator")}},function(e,t,r){var n=r(8),o=r(7),i=r(19);e.exports=r(6)?Object.defineProperties:function(e,t){o(e);for(var r,a=i(t),s=a.length,u=0;s>u;)n.f(e,r=a[u++],t[r]);return e}},function(e,t,r){"use strict";var n=r(74),o=r(75),i=r(15),a=r(12);e.exports=r(51)(Array,"Array",function(e,t){this._t=a(e),this._i=0,this._k=t},function(){var e=this._t,t=this._k,r=this._i++;return!e||r>=e.length?(this._t=void 0,o(1)):"keys"==t?o(0,r):"values"==t?o(0,e[r]):o(0,[r,e[r]])},"values"),i.Arguments=i.Array,n("keys"),n("values"),n("entries")},function(e,t){e.exports=function(){}},function(e,t){e.exports=function(e,t){return{value:t,done:!!e}}},function(e,t,r){e.exports={default:r(77),__esModule:!0}},function(e,t,r){r(45),r(47),e.exports=r(37).f("iterator")},function(e,t,r){e.exports={default:r(79),__esModule:!0}},function(e,t,r){r(80),r(55),r(85),r(86),e.exports=r(0).Symbol},function(e,t,r){"use strict";var n=r(1),o=r(10),i=r(6),a=r(5),s=r(52),u=r(81).KEY,c=r(13),l=r(30),d=r(23),f=r(21),p=r(2),y=r(37),v=r(38),h=r(82),_=r(83),b=r(7),m=r(9),g=r(12),R=r(28),O=r(20),D=r(40),w=r(84),j=r(50),L=r(8),k=r(19),U=j.f,M=L.f,x=w.f,C=n.Symbol,P=n.JSON,E=P&&P.stringify,S=p("_hidden"),q=p("toPrimitive"),I={}.propertyIsEnumerable,T=l("symbol-registry"),H=l("symbols"),A=l("op-symbols"),N=Object.prototype,F="function"==typeof C,B=n.QObject,V=!B||!B.prototype||!B.prototype.findChild,z=i&&c(function(){return 7!=D(M({},"a",{get:function(){return M(this,"a",{value:7}).a}})).a})?function(e,t,r){var n=U(N,t);n&&delete N[t],M(e,t,r),n&&e!==N&&M(N,t,n)}:M,G=function(e){var t=H[e]=D(C.prototype);return t._k=e,t},W=F&&"symbol"==typeof C.iterator?function(e){return"symbol"==typeof e}:function(e){return e instanceof C},J=function(e,t,r){return e===N&&J(A,t,r),b(e),t=R(t,!0),b(r),o(H,t)?(r.enumerable?(o(e,S)&&e[S][t]&&(e[S][t]=!1),r=D(r,{enumerable:O(0,!1)})):(o(e,S)||M(e,S,O(1,{})),e[S][t]=!0),z(e,t,r)):M(e,t,r)},Y=function(e,t){b(e);for(var r,n=h(t=g(t)),o=0,i=n.length;i>o;)J(e,r=n[o++],t[r]);return e},Z=function(e,t){return void 0===t?D(e):Y(D(e),t)},K=function(e){var t=I.call(this,e=R(e,!0));return!(this===N&&o(H,e)&&!o(A,e))&&(!(t||!o(this,e)||!o(H,e)||o(this,S)&&this[S][e])||t)},X=function(e,t){if(e=g(e),t=R(t,!0),e!==N||!o(H,t)||o(A,t)){var r=U(e,t);return!r||!o(H,t)||o(e,S)&&e[S][t]||(r.enumerable=!0),r}},$=function(e){for(var t,r=x(g(e)),n=[],i=0;r.length>i;)o(H,t=r[i++])||t==S||t==u||n.push(t);return n},Q=function(e){for(var t,r=e===N,n=x(r?A:g(e)),i=[],a=0;n.length>a;)!o(H,t=n[a++])||r&&!o(N,t)||i.push(H[t]);return i};F||(C=function(){if(this instanceof C)throw TypeError("Symbol is not a constructor!");var e=f(arguments.length>0?arguments[0]:void 0),t=function(r){this===N&&t.call(A,r),o(this,S)&&o(this[S],e)&&(this[S][e]=!1),z(this,e,O(1,r))};return i&&V&&z(N,e,{configurable:!0,set:t}),G(e)},s(C.prototype,"toString",function(){return this._k}),j.f=X,L.f=J,r(54).f=w.f=$,r(27).f=K,r(43).f=Q,i&&!r(14)&&s(N,"propertyIsEnumerable",K,!0),y.f=function(e){return G(p(e))}),a(a.G+a.W+a.F*!F,{Symbol:C});for(var ee="hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),te=0;ee.length>te;)p(ee[te++]);for(var re=k(p.store),ne=0;re.length>ne;)v(re[ne++]);a(a.S+a.F*!F,"Symbol",{for:function(e){return o(T,e+="")?T[e]:T[e]=C(e)},keyFor:function(e){if(!W(e))throw TypeError(e+" is not a symbol!");for(var t in T)if(T[t]===e)return t},useSetter:function(){V=!0},useSimple:function(){V=!1}}),a(a.S+a.F*!F,"Object",{create:Z,defineProperty:J,defineProperties:Y,getOwnPropertyDescriptor:X,getOwnPropertyNames:$,getOwnPropertySymbols:Q}),P&&a(a.S+a.F*(!F||c(function(){var e=C();return"[null]"!=E([e])||"{}"!=E({a:e})||"{}"!=E(Object(e))})),"JSON",{stringify:function(e){for(var t,r,n=[e],o=1;arguments.length>o;)n.push(arguments[o++]);if(r=t=n[1],(m(t)||void 0!==e)&&!W(e))return _(t)||(t=function(e,t){if("function"==typeof r&&(t=r.call(this,e,t)),!W(t))return t}),n[1]=t,E.apply(P,n)}}),C.prototype[q]||r(11)(C.prototype,q,C.prototype.valueOf),d(C,"Symbol"),d(Math,"Math",!0),d(n.JSON,"JSON",!0)},function(e,t,r){var n=r(21)("meta"),o=r(9),i=r(10),a=r(8).f,s=0,u=Object.isExtensible||function(){return!0},c=!r(13)(function(){return u(Object.preventExtensions({}))}),l=function(e){a(e,n,{value:{i:"O"+ ++s,w:{}}})},d=function(e,t){if(!o(e))return"symbol"==typeof e?e:("string"==typeof e?"S":"P")+e;if(!i(e,n)){if(!u(e))return"F";if(!t)return"E";l(e)}return e[n].i},f=function(e,t){if(!i(e,n)){if(!u(e))return!0;if(!t)return!1;l(e)}return e[n].w},p=function(e){return c&&y.NEED&&u(e)&&!i(e,n)&&l(e),e},y=e.exports={KEY:n,NEED:!1,fastKey:d,getWeak:f,onFreeze:p}},function(e,t,r){var n=r(19),o=r(43),i=r(27);e.exports=function(e){var t=n(e),r=o.f;if(r)for(var a,s=r(e),u=i.f,c=0;s.length>c;)u.call(e,a=s[c++])&&t.push(a);return t}},function(e,t,r){var n=r(16);e.exports=Array.isArray||function(e){return"Array"==n(e)}},function(e,t,r){var n=r(12),o=r(54).f,i={}.toString,a="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],s=function(e){try{return o(e)}catch(e){return a.slice()}};e.exports.f=function(e){return a&&"[object Window]"==i.call(e)?s(e):o(n(e))}},function(e,t,r){r(38)("asyncIterator")},function(e,t,r){r(38)("observable")},function(e,t,r){var n=r(59),o=r(2)("iterator"),i=r(15);e.exports=r(0).getIteratorMethod=function(e){if(void 0!=e)return e[o]||e["@@iterator"]||i[n(e)]}},function(e,t,r){r(55),r(45),r(47),r(89),r(100),r(101),e.exports=r(0).Promise},function(e,t,r){"use strict";var n,o,i,a,s=r(14),u=r(1),c=r(18),l=r(59),d=r(5),f=r(9),p=r(22),y=r(90),v=r(91),h=r(63),_=r(64).set,b=r(95)(),m=r(48),g=r(65),R=r(96),O=r(66),D=u.TypeError,w=u.process,j=w&&w.versions,L=j&&j.v8||"",k=u.Promise,U="process"==l(w),M=function(){},x=o=m.f,C=!!function(){try{var e=k.resolve(1),t=(e.constructor={})[r(2)("species")]=function(e){e(M,M)};return(U||"function"==typeof PromiseRejectionEvent)&&e.then(M)instanceof t&&0!==L.indexOf("6.6")&&-1===R.indexOf("Chrome/66")}catch(e){}}(),P=function(e){var t;return!(!f(e)||"function"!=typeof(t=e.then))&&t},E=function(e,t){if(!e._n){e._n=!0;var r=e._c;b(function(){for(var n=e._v,o=1==e._s,i=0;r.length>i;)!function(t){var r,i,a,s=o?t.ok:t.fail,u=t.resolve,c=t.reject,l=t.domain;try{s?(o||(2==e._h&&I(e),e._h=1),!0===s?r=n:(l&&l.enter(),r=s(n),l&&(l.exit(),a=!0)),r===t.promise?c(D("Promise-chain cycle")):(i=P(r))?i.call(r,u,c):u(r)):c(n)}catch(e){l&&!a&&l.exit(),c(e)}}(r[i++]);e._c=[],e._n=!1,t&&!e._h&&S(e)})}},S=function(e){_.call(u,function(){var t,r,n,o=e._v,i=q(e);if(i&&(t=g(function(){U?w.emit("unhandledRejection",o,e):(r=u.onunhandledrejection)?r({promise:e,reason:o}):(n=u.console)&&n.error&&n.error("Unhandled promise rejection",o)}),e._h=U||q(e)?2:1),e._a=void 0,i&&t.e)throw t.v})},q=function(e){return 1!==e._h&&0===(e._a||e._c).length},I=function(e){_.call(u,function(){var t;U?w.emit("rejectionHandled",e):(t=u.onrejectionhandled)&&t({promise:e,reason:e._v})})},T=function(e){var t=this;t._d||(t._d=!0,t=t._w||t,t._v=e,t._s=2,t._a||(t._a=t._c.slice()),E(t,!0))},H=function(e){var t,r=this;if(!r._d){r._d=!0,r=r._w||r;try{if(r===e)throw D("Promise can't be resolved itself");(t=P(e))?b(function(){var n={_w:r,_d:!1};try{t.call(e,c(H,n,1),c(T,n,1))}catch(e){T.call(n,e)}}):(r._v=e,r._s=1,E(r,!1))}catch(e){T.call({_w:r,_d:!1},e)}}};C||(k=function(e){y(this,k,"Promise","_h"),p(e),n.call(this);try{e(c(H,this,1),c(T,this,1))}catch(e){T.call(this,e)}},n=function(e){this._c=[],this._a=void 0,this._s=0,this._d=!1,this._v=void 0,this._h=0,this._n=!1},n.prototype=r(97)(k.prototype,{then:function(e,t){var r=x(h(this,k));return r.ok="function"!=typeof e||e,r.fail="function"==typeof t&&t,r.domain=U?w.domain:void 0,this._c.push(r),this._a&&this._a.push(r),this._s&&E(this,!1),r.promise},catch:function(e){return this.then(void 0,e)}}),i=function(){var e=new n;this.promise=e,this.resolve=c(H,e,1),this.reject=c(T,e,1)},m.f=x=function(e){return e===k||e===a?new i(e):o(e)}),d(d.G+d.W+d.F*!C,{Promise:k}),r(23)(k,"Promise"),r(98)("Promise"),a=r(0).Promise,d(d.S+d.F*!C,"Promise",{reject:function(e){var t=x(this);return(0,t.reject)(e),t.promise}}),d(d.S+d.F*(s||!C),"Promise",{resolve:function(e){return O(s&&this===a?k:this,e)}}),d(d.S+d.F*!(C&&r(99)(function(e){k.all(e).catch(M)})),"Promise",{all:function(e){var t=this,r=x(t),n=r.resolve,o=r.reject,i=g(function(){var r=[],i=0,a=1;v(e,!1,function(e){var s=i++,u=!1;r.push(void 0),a++,t.resolve(e).then(function(e){u||(u=!0,r[s]=e,--a||n(r))},o)}),--a||n(r)});return i.e&&o(i.v),r.promise},race:function(e){var t=this,r=x(t),n=r.reject,o=g(function(){v(e,!1,function(e){t.resolve(e).then(r.resolve,n)})});return o.e&&n(o.v),r.promise}})},function(e,t){e.exports=function(e,t,r,n){if(!(e instanceof t)||void 0!==n&&n in e)throw TypeError(r+": incorrect invocation!");return e}},function(e,t,r){var n=r(18),o=r(92),i=r(93),a=r(7),s=r(46),u=r(87),c={},l={},t=e.exports=function(e,t,r,d,f){var p,y,v,h,_=f?function(){return e}:u(e),b=n(r,d,t?2:1),m=0;if("function"!=typeof _)throw TypeError(e+" is not iterable!");if(i(_)){for(p=s(e.length);p>m;m++)if((h=t?b(a(y=e[m])[0],y[1]):b(e[m]))===c||h===l)return h}else for(v=_.call(e);!(y=v.next()).done;)if((h=o(v,b,y.value,t))===c||h===l)return h};t.BREAK=c,t.RETURN=l},function(e,t,r){var n=r(7);e.exports=function(e,t,r,o){try{return o?t(n(r)[0],r[1]):t(r)}catch(t){var i=e.return;throw void 0!==i&&n(i.call(e)),t}}},function(e,t,r){var n=r(15),o=r(2)("iterator"),i=Array.prototype;e.exports=function(e){return void 0!==e&&(n.Array===e||i[o]===e)}},function(e,t){e.exports=function(e,t,r){var n=void 0===r;switch(t.length){case 0:return n?e():e.call(r);case 1:return n?e(t[0]):e.call(r,t[0]);case 2:return n?e(t[0],t[1]):e.call(r,t[0],t[1]);case 3:return n?e(t[0],t[1],t[2]):e.call(r,t[0],t[1],t[2]);case 4:return n?e(t[0],t[1],t[2],t[3]):e.call(r,t[0],t[1],t[2],t[3])}return e.apply(r,t)}},function(e,t,r){var n=r(1),o=r(64).set,i=n.MutationObserver||n.WebKitMutationObserver,a=n.process,s=n.Promise,u="process"==r(16)(a);e.exports=function(){var e,t,r,c=function(){var n,o;for(u&&(n=a.domain)&&n.exit();e;){o=e.fn,e=e.next;try{o()}catch(n){throw e?r():t=void 0,n}}t=void 0,n&&n.enter()};if(u)r=function(){a.nextTick(c)};else if(!i||n.navigator&&n.navigator.standalone)if(s&&s.resolve){var l=s.resolve(void 0);r=function(){l.then(c)}}else r=function(){o.call(n,c)};else{var d=!0,f=document.createTextNode("");new i(c).observe(f,{characterData:!0}),r=function(){f.data=d=!d}}return function(n){var o={fn:n,next:void 0};t&&(t.next=o),e||(e=o,r()),t=o}}},function(e,t,r){var n=r(1),o=n.navigator;e.exports=o&&o.userAgent||""},function(e,t,r){var n=r(11);e.exports=function(e,t,r){for(var o in t)r&&e[o]?e[o]=t[o]:n(e,o,t[o]);return e}},function(e,t,r){"use strict";var n=r(1),o=r(0),i=r(8),a=r(6),s=r(2)("species");e.exports=function(e){var t="function"==typeof o[e]?o[e]:n[e];a&&t&&!t[s]&&i.f(t,s,{configurable:!0,get:function(){return this}})}},function(e,t,r){var n=r(2)("iterator"),o=!1;try{var i=[7][n]();i.return=function(){o=!0},Array.from(i,function(){throw 2})}catch(e){}e.exports=function(e,t){if(!t&&!o)return!1;var r=!1;try{var i=[7],a=i[n]();a.next=function(){return{done:r=!0}},i[n]=function(){return a},e(i)}catch(e){}return r}},function(e,t,r){"use strict";var n=r(5),o=r(0),i=r(1),a=r(63),s=r(66);n(n.P+n.R,"Promise",{finally:function(e){var t=a(this,o.Promise||i.Promise),r="function"==typeof e;return this.then(r?function(r){return s(t,e()).then(function(){return r})}:e,r?function(r){return s(t,e()).then(function(){throw r})}:e)}})},function(e,t,r){"use strict";var n=r(5),o=r(48),i=r(65);n(n.S,"Promise",{try:function(e){var t=o.f(this),r=i(e);return(r.e?t.reject:t.resolve)(r.v),t.promise}})},function(e,t,r){r(103),e.exports=r(0).Object.getPrototypeOf},function(e,t,r){var n=r(33),o=r(58);r(49)("getPrototypeOf",function(){return function(e){return o(n(e))}})},function(e,t,r){e.exports={default:r(105),__esModule:!0}},function(e,t,r){r(106),e.exports=r(0).Object.setPrototypeOf},function(e,t,r){var n=r(5);n(n.S,"Object",{setPrototypeOf:r(107).set})},function(e,t,r){var n=r(9),o=r(7),i=function(e,t){if(o(e),!n(t)&&null!==t)throw TypeError(t+": can't set as prototype!")};e.exports={set:Object.setPrototypeOf||("__proto__"in{}?function(e,t,n){try{n=r(18)(Function.call,r(50).f(Object.prototype,"__proto__").set,2),n(e,[]),t=!(e instanceof Array)}catch(e){t=!0}return function(e,r){return i(e,r),t?e.__proto__=r:n(e,r),e}}({},!1):void 0),check:i}},function(e,t,r){e.exports={default:r(109),__esModule:!0}},function(e,t,r){r(110);var n=r(0).Object;e.exports=function(e,t){return n.create(e,t)}},function(e,t,r){var n=r(5);n(n.S,"Object",{create:r(40)})},function(e,t,r){var n=r(0),o=n.JSON||(n.JSON={stringify:JSON.stringify});e.exports=function(e){return o.stringify.apply(o,arguments)}},function(e,t,r){r(113),e.exports=r(0).Object.keys},function(e,t,r){var n=r(33),o=r(19);r(49)("keys",function(){return function(e){return o(n(e))}})},function(e,t,r){e.exports={default:r(122),__esModule:!0}},,function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}t.__esModule=!0;var n=r(26),o=_interopRequireDefault(n),i=r(119),a=_interopRequireDefault(i);t.default=function get(e,t,r){null===e&&(e=Function.prototype);var n=(0,a.default)(e,t);if(void 0===n){var i=(0,o.default)(e);return null===i?void 0:get(i,t,r)}if("value"in n)return n.value;var s=n.get;if(void 0!==s)return s.call(r)}},,,function(e,t,r){e.exports={default:r(120),__esModule:!0}},function(e,t,r){r(121);var n=r(0).Object;e.exports=function(e,t){return n.getOwnPropertyDescriptor(e,t)}},function(e,t,r){var n=r(12),o=r(50).f;r(49)("getOwnPropertyDescriptor",function(){return function(e,t){return o(n(e),t)}})},function(e,t,r){r(123),e.exports=r(0).Object.assign},function(e,t,r){var n=r(5);n(n.S+n.F,"Object",{assign:r(124)})},function(e,t,r){"use strict";var n=r(19),o=r(43),i=r(27),a=r(33),s=r(56),u=Object.assign;e.exports=!u||r(13)(function(){var e={},t={},r=Symbol(),n="abcdefghijklmnopqrst";return e[r]=7,n.split("").forEach(function(e){t[e]=e}),7!=u({},e)[r]||Object.keys(u({},t)).join("")!=n})?function(e,t){for(var r=a(e),u=arguments.length,c=1,l=o.f,d=i.f;u>c;)for(var f,p=s(arguments[c++]),y=l?n(p).concat(l(p)):n(p),v=y.length,h=0;v>h;)d.call(p,f=y[h++])&&(r[f]=p[f]);return r}:u},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(44),o=_interopRequireDefault(n),i=r(17),a=_interopRequireDefault(i),s=r(3),u=_interopRequireDefault(s),c=r(4),l=_interopRequireDefault(c),d=r(36),f=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(d),p=r(39),y=f.getLogger("RegistrationStatus"),v=function(){function RegistrationStatus(e,t,r,n){(0,u.default)(this,RegistrationStatus),this._registryObjectURL=e,this._runtimeURL=t,this._domain=(0,p.divideURL)(t).domain,this._discoveredObjectURL=r,this._messageBus=n,this._subscriptionSet=!1,this._subscribers={live:{},disconnected:{}}}return(0,l.default)(RegistrationStatus,[{key:"onLive",value:function(e,t){var r=this;return new a.default(function(n,o){r._subscriptionSet?(r._subscribers.live[e]=t,n()):r._subscribe().then(function(){r._subscribers.live[e]=t,n()}).catch(function(e){return o(e)})})}},{key:"onDisconnected",value:function(e,t){var r=this;return new a.default(function(n,o){r._subscriptionSet?(r._subscribers.disconnected[e]=t,n()):r._subscribe().then(function(){r._subscribers.disconnected[e]=t,n()}).catch(function(e){return o(e)})})}},{key:"_subscribe",value:function(){var e=this,t={type:"subscribe",from:this._discoveredObjectURL,to:this._runtimeURL+"/subscriptions",body:{resources:[this._registryObjectURL+"/registration"]}};return new a.default(function(r,n){e._messageBus.postMessage(t,function(t){y.log("[DiscoveredObject.subscribe] "+e._registryObjectURL+" rcved reply ",t),200===t.body.code?(e._generateListener(e._registryObjectURL+"/registration"),e._subscriptionSet=!0,r()):(y.error("Error subscribing ",e._registryObjectURL),n("Error subscribing "+e._registryObjectURL))})})}},{key:"_generateListener",value:function(e){var t=this;this._messageBus.addListener(e,function(e){y.log("[DiscoveredObject.notification] "+t._registryObjectURL+": ",e),t._processNotification(e)})}},{key:"_processNotification",value:function(e){var t=this,r=e.body.value;setTimeout(function(){(0,o.default)(t._subscribers[r]).forEach(function(e){return t._subscribers[r][e]()})},5e3)}},{key:"_unsubscribe",value:function(){var e=this,t={type:"unsubscribe",from:this._discoveredObjectURL,to:this._runtimeURL+"/subscriptions",body:{resource:this._registryObjectURL+"/registration"}};return new a.default(function(r,n){e._messageBus.postMessage(t,function(t){y.log("[DiscoveredObject.unsubscribe] "+e._registryObjectURL+" rcved reply ",t),200===t.body.code?r():(y.error("Error unsubscribing ",e._registryObjectURL),n("Error unsubscribing "+e._registryObjectURL))})})}},{key:"unsubscribeLive",value:function(e){var t=this;return new a.default(function(r,n){e in t._subscribers.live&&delete t._subscribers.live[e],t._areSubscriptionsEmpty()?t._unsubscribe().then(function(){return r()}).catch(function(e){return n(e)}):r()})}},{key:"unsubscribeDisconnected",value:function(e){var t=this;return new a.default(function(r,n){e in t._subscribers.disconnected?(delete t._subscribers.disconnected[e],t._areSubscriptionsEmpty()?t._unsubscribe().then(function(){return r()}).catch(function(e){return n(e)}):r()):n(e+" doesn't subscribe onDisconnected for "+t._registryObjectURL)})}},{key:"_areSubscriptionsEmpty",value:function(){return 0===(0,o.default)(this._subscribers.live).length&&0===(0,o.default)(this._subscribers.disconnected).length}}]),RegistrationStatus}();t.default=v,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(26),o=_interopRequireDefault(n),i=r(3),a=_interopRequireDefault(i),s=r(4),u=_interopRequireDefault(s),c=r(34),l=_interopRequireDefault(c),d=r(35),f=_interopRequireDefault(d),p=r(127),y=_interopRequireDefault(p),v=function(e){function MiniBus(){return(0,a.default)(this,MiniBus),(0,l.default)(this,(MiniBus.__proto__||(0,o.default)(MiniBus)).call(this))}return(0,f.default)(MiniBus,e),(0,u.default)(MiniBus,[{key:"postMessage",value:function(e,t,r){var n=this;return n._genId(e),n._responseCallback(e,t,r),n._onPostMessage(e),e.id}},{key:"_onMessage",value:function(e){var t=this;if(!t._onResponse(e)){var r=t._subscriptions[e.to];r?(t._publishOn(r,e),e.to.startsWith("hyperty")||t._publishOnDefault(e)):t._publishOnDefault(e)}}}]),MiniBus}(y.default);t.default=v,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(17),o=_interopRequireDefault(n),i=r(3),a=_interopRequireDefault(i),s=r(4),u=_interopRequireDefault(s),c=r(36),l=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(c),d=l.getLogger("Bus"),f=function(){function Bus(){(0,a.default)(this,Bus);var e=this;e._msgId=0,e._subscriptions={},e._responseTimeOut=3e4,e._responseCallbacks={},e._registerExternalListener()}return(0,u.default)(Bus,[{key:"addListener",value:function(e,t){var r=this,n=new p(r._subscriptions,e,t),o=r._subscriptions[e];return o||(o=[],r._subscriptions[e]=o),o.push(n),n}},{key:"addResponseListener",value:function(e,t,r){this._responseCallbacks[e+t]=r}},{key:"removeResponseListener",value:function(e,t){delete this._responseCallbacks[e+t]}},{key:"removeAllListenersOf",value:function(e){delete this._subscriptions[e]}},{key:"bind",value:function(e,t,r){var n=this,o=this;return{thisListener:o.addListener(e,function(e){r.postMessage(e)}),targetListener:r.addListener(t,function(e){o.postMessage(e)}),unbind:function(){n.thisListener.remove(),n.targetListener.remove()}}}},{key:"_publishOnDefault",value:function(e){var t=this._subscriptions["*"];t&&this._publishOn(t,e)}},{key:"_publishOn",value:function(e,t){e.forEach(function(e){e._callback(t)})}},{key:"_responseCallback",value:function(e,t){var r=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],n=this;if(t){var o=e.from+e.id;n._responseCallbacks[o]=t,r&&setTimeout(function(){var t=n._responseCallbacks[o];if(delete n._responseCallbacks[o],t){t({id:e.id,type:"response",body:{code:408,desc:"Response timeout!",value:e}})}},n._responseTimeOut)}}},{key:"_onResponse",value:function(e){var t=this;if("response"===e.type){var r=e.to+e.id,n=t._responseCallbacks[r];if(e.body.code>=200&&delete t._responseCallbacks[r],n)return n(e),!0}return!1}},{key:"_onMessage",value:function(e){var t=this;if(!t._onResponse(e)){var r=t._subscriptions[e.to];r?t._publishOn(r,e):t._publishOnDefault(e)}}},{key:"_genId",value:function(e){e.id&&0!==e.id||(this._msgId++,e.id=this._msgId)}},{key:"postMessage",value:function(e,t){}},{key:"postMessageWithRetries",value:function(e,t,r){var n=this,i=0,a=function(){return new o.default(function(t,o){n.postMessage(e,function(n){408===n.body.code||500===n.body.code?o():(d.info("[Bus.postMessageWithRetries] msg delivered: ",e),r(n),t())})})};!function tryAgain(){a().then(function(){},function(){if(d.warn("[Bus.postMessageWithRetries] Message Bounced (retry "+i+"): '",e),!(i++<t)){var r="[Error] Message Bounced (delivery attempts "+t+"): '";throw new Error(r+e)}tryAgain()})}()}},{key:"_onPostMessage",value:function(e){}},{key:"_registerExternalListener",value:function(){}}]),Bus}(),p=function(){function MsgListener(e,t,r){(0,a.default)(this,MsgListener);var n=this;n._subscriptions=e,n._url=t,n._callback=r}return(0,u.default)(MsgListener,[{key:"remove",value:function(){var e=this,t=e._subscriptions[e._url];if(t){var r=t.indexOf(e);t.splice(r,1),0===t.length&&delete e._subscriptions[e._url]}}},{key:"url",get:function(){return this._url}}]),MsgListener}();t.default=f,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(3),o=_interopRequireDefault(n),i=r(4),a=_interopRequireDefault(i),s=r(129),u=_interopRequireDefault(s),c=function(){function SandboxRegistry(e){(0,o.default)(this,SandboxRegistry);var t=this;t._bus=e,t._factory=new u.default(e),t._components={},e.addListener(SandboxRegistry.InternalDeployAddress,function(e){switch(e.type){case"create":t._onDeploy(e);break;case"delete":t._onRemove(e)}})}return(0,a.default)(SandboxRegistry,[{key:"_responseMsg",value:function(e,t,r){var n={id:e.id,type:"response",from:SandboxRegistry.InternalDeployAddress,to:SandboxRegistry.ExternalDeployAddress},o={};return t&&(o.code=t),r&&(o.desc=r),n.body=o,n}},{key:"_onDeploy",value:function(e){var t=this,r=e.body.config,n=e.body.url,o=e.body.sourceCode,i=void 0,a=void 0;if(t._components.hasOwnProperty(n))i=500,a="Instance "+n+" already exist!";else try{t._components[n]=t._create(n,o,r,t._factory),i=200}catch(e){i=500,a=e}var s=t._responseMsg(e,i,a);t._bus.postMessage(s)}},{key:"_onRemove",value:function(e){var t=this,r=e.body.url,n=void 0,o=void 0;t._components.hasOwnProperty(r)?(delete t._components[r],t._bus.removeAllListenersOf(r),n=200):(n=500,o="Instance "+r+" doesn't exist!");var i=t._responseMsg(e,n,o);t._bus.postMessage(i)}},{key:"_create",value:function(e,t,r,n){}},{key:"components",get:function(){return this._components}}]),SandboxRegistry}();c.ExternalDeployAddress="hyperty-runtime://sandbox/external",c.InternalDeployAddress="hyperty-runtime://sandbox/internal",t.default=c,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(3),o=_interopRequireDefault(n),i=r(4),a=_interopRequireDefault(i),s=r(130),u=_interopRequireDefault(s),c=r(161),l=_interopRequireDefault(c),d=r(39),f=r(134),p=_interopRequireDefault(f),y=r(135),v=_interopRequireDefault(y),h=r(125),_=_interopRequireDefault(h),b=r(163),m=_interopRequireDefault(b),g=r(136),R=_interopRequireDefault(g),O=r(138),D=_interopRequireDefault(O),w=r(164),j=_interopRequireDefault(w),L=r(166),k=_interopRequireDefault(L),U=r(139),M=_interopRequireDefault(U),x=function(){function SandboxFactory(e){(0,o.default)(this,SandboxFactory);var t=this;t._bus=e,t._divideURL=d.divideURL}return(0,a.default)(SandboxFactory,[{key:"createSyncher",value:function(e,t,r){return new u.default(e,t,r)}},{key:"createIdentityManager",value:function(e,t,r){return new p.default(e,t,r)}},{key:"createDiscovery",value:function(e,t,r){return new v.default(e,t,r)}},{key:"createSearch",value:function(e,t){return new m.default(e,t)}},{key:"createContextObserver",value:function(e,t,r,n){return new R.default(e,t,r,n,this)}},{key:"createContextReporter",value:function(e,t,r){return new D.default(e,t,r,this)}},{key:"createNotificationHandler",value:function(e){return new l.default(e)}},{key:"createMessageBodyIdentity",value:function(e,t,r,n,o,i,a,s){return new j.default(e,t,r,n,o,i,a,s)}},{key:"createChatManager",value:function(e,t,r,n){return new k.default(e,t,r,n,this)}},{key:"createChatController",value:function(e,t,r,n,o,i){return new M.default(e,t,r,n,o,i)}},{key:"createRegistrationStatus",value:function(e,t,r,n){return new _.default(e,t,r,n)}},{key:"divideURL",get:function(){return this._divideURL}}]),SandboxFactory}();t.default=x,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(17),o=_interopRequireDefault(n),i=r(114),a=_interopRequireDefault(i),s=r(3),u=_interopRequireDefault(s),c=r(4),l=_interopRequireDefault(c),d=r(36),f=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(d),p=r(39),y=r(153),v=_interopRequireDefault(y),h=r(159),_=_interopRequireDefault(h),b=r(160),m=_interopRequireDefault(b),g=f.getLogger("Syncher"),R=function(){function Syncher(e,t,r){(0,u.default)(this,Syncher);var n=this;n._owner=e,n._bus=t,n._subURL=r.runtimeURL+"/sm",n._runtimeUrl=r.runtimeURL,n._p2pHandler=r.p2pHandler,n._p2pRequester=r.p2pRequester,n._reporters={},n._observers={},n._provisionals={},t.addListener(e,function(t){if(t.from!==e)switch(g.info("[Syncher] Syncher-RCV: ",t,n),t.type){case"forward":n._onForward(t);break;case"create":n._onRemoteCreate(t);break;case"delete":n._onRemoteDelete(t);break;case"execute":n._onExecute(t)}})}return(0,l.default)(Syncher,[{key:"create",value:function(e,t,r){var n=arguments.length>3&&void 0!==arguments[3]&&arguments[3],o=arguments.length>4&&void 0!==arguments[4]&&arguments[4],i=arguments.length>5&&void 0!==arguments[5]?arguments[5]:"no name",s=arguments[6],u=arguments[7];if(!e)throw Error("[Syncher - Create] - You need specify the data object schema");if(!t)throw Error("[Syncher - Create] -The observers should be defined");var c=this;u=u||{};var l=(0,a.default)({},u);return l.p2p=o,l.store=n,l.schema=e,l.authorise=t,l.p2pHandler=c._p2pHandler,l.p2pRequester=c._p2pRequester,l.data=r?(0,p.deepClone)(r):{},l.name=0===i.length?"no name":i,l.reporter=u.hasOwnProperty("reporter")&&"boolean"!=typeof u.reporter?u.reporter:c._owner,l.resume=!1,u?(l.mutual=!u.hasOwnProperty("mutual")||u.mutual,l.name=u.hasOwnProperty("name")?u.name:l.name):l.mutual=!0,u.hasOwnProperty("reuseURL")&&(l.resource=u.reuseURL),s&&(l.identity=s),g.log("[syncher - create] - create Reporter - createInput: ",l),c._create(l)}},{key:"resumeReporters",value:function(e){var t=this;return g.log("[syncher - create] - resume Reporter - criteria: ",e),(0,a.default)(e,{resume:!0}),t._resumeCreate(e)}},{key:"subscribe",value:function(e,t){var r=arguments.length>2&&void 0!==arguments[2]&&arguments[2],n=arguments.length>3&&void 0!==arguments[3]&&arguments[3],o=!(arguments.length>4&&void 0!==arguments[4])||arguments[4],i=!(arguments.length>5&&void 0!==arguments[5])||arguments[5],s=arguments[6],u=this,c={};return c.p2p=n,c.store=r,c.schema=e,c.domain_subscription=i,c.resource=t,s&&(c.identity=s),c.mutual=o,g.log("[syncher - subscribe] - subscribe criteria: ",c),(0,a.default)(c,{resume:!1}),u._subscribe(c)}},{key:"resumeObservers",value:function(e){var t=this,r=e||{};return(0,a.default)(r,{resume:!0}),t._resumeSubscribe(r)}},{key:"read",value:function(e){var t=this,r={type:"read",from:t._owner,to:e};return new o.default(function(e,n){var o=function(o){g.log("[Syncher.read] reply: ",o);var i={},s={},u=0;if(o.body.code<300)if(o.body.value.hasOwnProperty("responses"))if(0===u)s=o.body.value,++u;else{delete o.body.value.responses;var c=void 0;for(c in o.body.value)i.hasOwnProperty(c)||(i[c]={}),(0,a.default)(i[c],o.body.value[c]);++u,u===s.responses&&(s.childrenObjects=i,delete s.responses,t._bus.removeResponseListener(r.from,o.id),e(s))}else t._bus.removeResponseListener(r.from,o.id),e(o.body.value);else n(o.body.desc)};t._bus.postMessage(r,o,!1)})}},{key:"onNotification",value:function(e){this._onNotificationHandler=e}},{key:"onClose",value:function(e){this._onClose=e}},{key:"_create",value:function(e){var t=this;return new o.default(function(r,n){var o=(0,a.default)({},e),i=e.resume;o.created=(new Date).toISOString(),o.runtime=t._runtimeUrl;var s=(0,p.deepClone)(o);delete s.p2p,delete s.store,delete s.observers,delete s.identity;var u={type:"create",from:t._owner,to:t._subURL,body:{resume:i,value:s}};u.body.schema=o.schema,o.p2p&&(u.body.p2p=o.p2p),o.store&&(u.body.store=o.store),o.identity&&(u.body.identity=o.identity),g.log("[syncher._create]: ",o,u),t._bus.postMessage(u,function(i){if(g.log("[syncher - create] - create-response: ",i),200===i.body.code){o.url=i.body.resource,o.status="live",o.syncher=t,o.childrens=i.body.childrenResources;var a=t._reporters[o.url];a||(a=new v.default(o),t._reporters[o.url]=a),a.inviteObservers(e.authorise,e.p2p),r(a)}else n(i.body.desc)})})}},{key:"_resumeCreate",value:function(e){var t=this,r=this;return new o.default(function(n,o){var i=e.resume,a={type:"create",from:r._owner,to:r._subURL,body:{resume:i}};g.log("[syncher - create]: ",e,a),e&&(a.body.value=e,e.hasOwnProperty("reporter")?a.body.value.reporter=e.reporter:a.body.value.reporter=r._owner),e.p2p&&(a.body.p2p=e.p2p),e.store&&(a.body.store=e.store),e.observers&&(a.body.authorise=e.observers),e.identity&&(a.body.identity=e.identity),g.log("[syncher._resumeCreate] - resume message: ",a),r._bus.postMessage(a,function(e){if(g.log("[syncher._resumeCreate] - create-resumed-response: ",e),200===e.body.code){var i=e.body.value;for(var a in i){var s=i[a];s.data=(0,p.deepClone)(s.data)||{},s.childrenObjects&&(s.childrenObjects=(0,p.deepClone)(s.childrenObjects)),s.mutual=!1,s.resume=!0,s.status="live",s.syncher=r,g.log("[syncher._resumeCreate] - create-resumed-dataObjectReporter",s);var u=new v.default(s);s.childrenObjects&&u.resumeChildrens(s.childrenObjects),r._reporters[s.url]=u}n(r._reporters),t._onReportersResume&&t._onReportersResume(t._reporters)}else 404===e.body.code?n({}):o(e.body.desc)})})}},{key:"_subscribe",value:function(e){var t=this;return new o.default(function(r,n){var o={type:"subscribe",from:t._owner,to:t._subURL,body:{}};e&&(e.hasOwnProperty("p2p")&&(o.body.p2p=e.p2p),e.hasOwnProperty("store")&&(o.body.store=e.store),e.hasOwnProperty("schema")&&(o.body.schema=e.schema),e.hasOwnProperty("identity")&&(o.body.identity=e.identity),e.hasOwnProperty("resource")&&(o.body.resource=e.resource),e.hasOwnProperty("domain_subscription")&&(o.body.domain_subscription=e.domain_subscription)),o.body.resume=e.resume,e.hasOwnProperty("mutual")&&(o.body.mutual=e.mutual),g.log("[syncher_subscribe] - subscribe message: ",e,o),t._bus.postMessage(o,function(o){g.log("[syncher] - subscribe-response: ",o);var i=o.body.resource,a=t._provisionals[i];if(delete t._provisionals[i],a&&a._releaseListeners(),o.body.code<200)g.log("[syncher] - new DataProvisional: ",o.body.childrenResources,i),a=new m.default(t._owner,i,t._bus,o.body.childrenResources),t._provisionals[i]=a;else if(200===o.body.code){g.log("[syncher] - new Data Object Observer: ",o,t._provisionals);var s=o.body.value;s.syncher=t,s.p2p=e.p2p,s.store=e.store,s.identity=e.identity,s.resume=!1,s.mutual=e.mutual;var u=t._observers[i];u?u.sync():(u=new _.default(s),t._observers[i]=u),g.log("[syncher] - new Data Object Observer already exist: ",u),r(u),a&&a.apply(u)}else n(o.body.desc)})})}},{key:"_resumeSubscribe",value:function(e){var t=this,r=this;return new o.default(function(n,o){var i={type:"subscribe",from:r._owner,to:r._subURL,body:{}};e&&(e.hasOwnProperty("p2p")&&(i.body.p2p=e.p2p),e.hasOwnProperty("store")&&(i.body.store=e.store),e.hasOwnProperty("schema")&&(i.body.schema=e.schema),e.hasOwnProperty("identity")&&(i.body.identity=e.identity),e.hasOwnProperty("resource")&&(i.body.resource=e.url)),i.body.resume=e.resume;var a=e.mutual;e.hasOwnProperty("mutual")&&(i.body.mutual=a),g.log("[syncher] - subscribe message: ",e,i),r._bus.postMessage(i,function(e){g.log("[syncher] - subscribe-resumed-response: ",e);var i=e.body.resource,a=r._provisionals[i];if(delete r._provisionals[i],a&&a._releaseListeners(),e.body.code<200)g.log("[syncher] - resume new DataProvisional: ",e,i),a=new m.default(r._owner,i,r._bus,e.body.childrenResources),r._provisionals[i]=a;else if(200===e.body.code){var s=e.body.value;for(var u in s){var c=s[u];g.log("[syncher] - Resume Object Observer: ",e,c,r._provisionals),c.childrenObjects&&(c.childrenObjects=(0,p.deepClone)(c.childrenObjects)),c.data=(0,p.deepClone)(c.data)||{},c.resume=!0,c.syncher=r,g.log("[syncher._resumeSubscribe] - create new dataObject: ",c);var l=new _.default(c);c.childrenObjects&&l.resumeChildrens(c.childrenObjects),g.log("[syncher._resumeSubscribe] - new dataObject",l),r._observers[l.url]=l,r._provisionals[l.url]&&r._provisionals[l.url].apply(l)}n(r._observers),t._onObserversResume&&t._onObserversResume(r._observers)}else 404===e.body.code?n({}):o(e.body.desc)})})}},{key:"_onForward",value:function(e){this._reporters[e.body.to]._onForward(e)}},{key:"_onRemoteCreate",value:function(e){var t=this,r=e.from.slice(0,-13),n=(0,p.divideURL)(r),o=n.domain,i={type:e.type,from:e.body.source,url:r,domain:o,schema:e.body.schema,value:e.body.value,identity:e.body.identity,ack:function(r){var n=200;r&&(n=r),t._bus.postMessage({id:e.id,type:"response",from:e.to,to:e.from,body:{code:n}})}};t._onNotificationHandler&&(g.info("[Syncher] NOTIFICATION-EVENT: ",i),t._onNotificationHandler(i))}},{key:"_onRemoteDelete",value:function(e){var t=this,r=e.body.resource,n=t._observers[r],o={from:t.owner,to:t._subURL,id:e.id,type:"unsubscribe",body:{resource:e.body.resource}};if(t._bus.postMessage(o),delete t._observers[r],n){var i={type:e.type,url:r,identity:e.body.identity,ack:function(r){var o=200;r&&(o=r),200===o&&n.delete(),t._bus.postMessage({id:e.id,type:"response",from:e.to,to:e.from,body:{code:o,source:t._owner}})}};t._onNotificationHandler&&(g.log("NOTIFICATION-EVENT: ",i),t._onNotificationHandler(i))}else t._bus.postMessage({id:e.id,type:"response",from:e.to,to:e.from,body:{code:404,source:t._owner}})}},{key:"_onExecute",value:function(e){var t=this,r={id:e.id,type:"response",from:e.to,to:e.from,body:{code:200}};if((e.from===t._runtimeUrl+"/registry/"||e.from===t._runtimeUrl+"/registry")&&e.body&&e.body.method&&"close"===e.body.method&&t._onClose){var n={type:"close",ack:function(e){e&&(r.body.code=e),t._bus.postMessage(r)}};g.info("[Syncher] Close-EVENT: ",n),t._onClose(n)}else t._bus.postMessage(r)}},{key:"onReportersResume",value:function(e){this._onReportersResume=e}},{key:"onObserversResume",value:function(e){this._onObserversResume=e}},{key:"owner",get:function(){return this._owner}},{key:"reporters",get:function(){return this._reporters}},{key:"observers",get:function(){return this._observers}}]),Syncher}();t.default=R,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(53),o=_interopRequireDefault(n),i=r(17),a=_interopRequireDefault(i),s=r(44),u=_interopRequireDefault(s),c=r(114),l=_interopRequireDefault(c),d=r(3),f=_interopRequireDefault(d),p=r(4),y=_interopRequireDefault(p),v=r(36),h=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(v),_=r(132),b=_interopRequireDefault(_),m=r(133),g=_interopRequireDefault(m),R=r(39),O=r(155),D=_interopRequireDefault(O),w=h.getLogger("DataObject"),j=function(){function DataObject(e){function throwMandatoryParmMissingError(e){throw"[DataObject] "+e+" mandatory parameter is missing"}(0,f.default)(this,DataObject);var t=this;e.syncher?t._syncher=e.syncher:throwMandatoryParmMissingError("syncher"),e.url?t._url=e.url:throwMandatoryParmMissingError("url"),e.created?t._created=e.created:throwMandatoryParmMissingError("created"),e.reporter?t._reporter=e.reporter:throwMandatoryParmMissingError("reporter"),e.runtime?t._runtime=e.runtime:throwMandatoryParmMissingError("runtime"),e.schema?t._schema=e.schema:throwMandatoryParmMissingError("schema"),e.name?t._name=e.name:throwMandatoryParmMissingError("name"),t._status=e.status,e.data?t._syncObj=new b.default(e.data):t._syncObj=new b.default({}),t._childrens=e.childrens,t._mutual=e.mutual,t._version=0,t._childId=0,t._childrenListeners=[],t._onAddChildrenHandler,t._resumed=e.resume,e.resume&&(t._version=e.version),t._owner=e.syncher._owner,t._bus=e.syncher._bus,e.description&&(t._description=e.description),e.tags&&(t._tags=e.tags),e.resources&&(t._resources=e.resources),e.observerStorage&&(t._observerStorage=e.observerStorage),e.publicObservation&&(t._publicObservation=e.publicObservation),t._metadata=(0,l.default)(e),(!e.hasOwnProperty("resume")||e.hasOwnProperty("resume")&&!e.resume)&&(t._metadata.lastModified=t._metadata.created),delete t._metadata.data,delete t._metadata.syncher,delete t._metadata.authorise,t._hypertyResourceFactory=new D.default,t._childrenObjects={},t._sharedChilds=[]}return(0,y.default)(DataObject,[{key:"_getLastChildId",value:function(){var e=this,t=0,r=e._owner+"#"+t;return(0,u.default)(e._childrens).filter(function(t){e._childrens[t].childId>r&&(r=e._childrens[t].childId)}),t=Number(r.split("#")[1])}},{key:"_allocateListeners",value:function(){var e=this,t=this,r=t._url+"/children/";w.log("[Data Object - AllocateListeners] - ",t._childrens),t._childrens&&t._childrens.forEach(function(n){var o=r+n,i=t._bus.addListener(o,function(r){if(r.from!==e._owner)switch(w.log("DataObject-Children-RCV: ",r),r.type){case"create":t._onChildCreate(r);break;case"delete":w.log(r);break;default:t._changeChildren(r)}});t._childrenListeners.push(i)})}},{key:"_releaseListeners",value:function(){var e=this;e._childrenListeners.forEach(function(e){e.remove()}),(0,u.default)(e._childrenObjects).forEach(function(t){(0,u.default)(e._childrenObjects[t]).forEach(function(r){e._childrenObjects[t][r]._releaseListeners()})})}},{key:"resumeChildrens",value:function(e){var t=this,r=this,n=this._owner+"#"+this._childId;(0,u.default)(e).forEach(function(o){var i=e[o];(0,u.default)(i).forEach(function(e){var a=!1;r._childrenObjects.hasOwnProperty(o)||(r._childrenObjects[o]={}),i[e].value.resourceType&&!r._childrenObjects[o].hasOwnProperty(e)?(r._childrenObjects[o][e]=r._resumeHypertyResource(i[e]),a=!0):r._childrenObjects[o].hasOwnProperty(e)||(r._childrenObjects[o][e]=r._resumeChild(i[e]),w.log("[DataObject.resumeChildrens] new DataObjectChild: ",r._childrenObjects[o][e]),a=!0),a&&e>n&&(n=e,w.log("[DataObjectReporter.resumeChildrens] - resuming: ",t._childrenObjects[o][e]))})}),this._childId=Number(n.split("#")[1])}},{key:"_resumeChild",value:function(e){var t=this,r=e.value;r.parentObject=t,r.parent=t._url;var n=new g.default(r);n.identity=e.identity;var o={type:"create",from:n.reporter,url:n.parent,value:n.data,childId:n.url,identity:n.identity,child:n};return n.resourceType&&(o.resource=n),t._onAddChildrenHandler&&t._onAddChildrenHandler(o),n}},{key:"_resumeHypertyResource",value:function(e){var t=this,r=e.value;r.parentObject=t,r.parent=t._url;var n=t._hypertyResourceFactory.createHypertyResource(!1,r.resourceType,r);n.identity=e.identity;var o={type:"create",from:n.reporter,url:n.parent,value:n.data,childId:n.url,identity:n.identity,child:n};return n.resourceType&&(o.resource=n),t._onAddChildrenHandler&&t._onAddChildrenHandler(o),n}},{key:"pause",value:function(){throw"Not implemented"}},{key:"resume",value:function(){throw"Not implemented"}},{key:"stop",value:function(){throw"Not implemented"}},{key:"addChild",value:function(e,t,r,n){var o=this,i=void 0;return new a.default(function(a){var s=o._url+"/children/"+e,u=o._getChildInput(n);u.data=t,u.children=e,i=new g.default(u),r&&(i.identity=r),i.share(),w.log("[DataObject.addChild] added ",i),i.onChange(function(e){o._onChange(e,{path:s,childId:u.url})}),o._childrenObjects.hasOwnProperty(e)||(o._childrenObjects[e]={}),o._childrenObjects[e][u.url]=i,a(i)})}},{key:"_deleteChildrens",value:function(){var e=this,t=[];return new a.default(function(r){if(e.childrens){w.log("[DataObject.deleteChildrens]",e.childrens);var n=void 0;for(n in e.childrens){var o=void 0;for(o in e.childrens[n]){var i=e.childrens[n][o];w.log("[DataObject._deleteChildrens] child",i),i.metadata.hasOwnProperty("resourceType")&&t.push(e.childrens[n][o].delete())}}}w.log("[DataObject._deleteChildrens] promises ",t),t.length>0?a.default.all(t).then(function(){r("[DataObject._deleteChildrens] done")}):r("[DataObject._deleteChildrens] nothing to delete")})}},{key:"_getChildInput",value:function(e){var t=this,r=(0,l.default)({},e);return t._childId++,r.url=t._owner+"#"+t._childId,r.parentObject=t,r.reporter=t._owner,r.created=(new Date).toISOString(),r.runtime=t._syncher._runtimeUrl,r.p2pHandler=t._syncher._p2pHandler,r.p2pRequester=t._syncher._p2pRequester,r.schema=t._schema,r.parent=t.url,r}},{key:"addHypertyResource",value:function(e,t,r,n,o){var i=this;return new a.default(function(a){var s=void 0,u=i._url+"/children/"+e,c=i._getChildInput(o);c.children=e,i._hypertyResourceFactory.createHypertyResourceWithContent(!0,t,r,c).then(function(t){s=t,n&&(s.identity=n),s.share(),w.log("[DataObject.addHypertyResource] added ",s),s.onChange(function(e){i._onChange(e,{path:u,childId:s.childId})}),i._childrenObjects.hasOwnProperty(e)||(i._childrenObjects[e]={}),i._childrenObjects[e][s.childId]=s,a(s)})})}},{key:"onAddChild",value:function(e){this._onAddChildrenHandler=e}},{key:"_onChildCreate",value:function(e){var t=this;w.log("[DataObject._onChildCreate] receivedBy "+t._owner+" : ",e);var r={from:e.to,to:e.from,type:"response",id:e.id,body:{code:100}};t._bus.postMessage(r),e.body.value.resourceType?t._onHypertyResourceAdded(e):t._onChildAdded(e)}},{key:"_onChildAdded",value:function(e){var t=this,r=(0,R.deepClone)(e.body.value);r.parentObject=t;var n=r.children,o=new g.default(r);o.identity=e.body.identity,t._childrenObjects.hasOwnProperty(n)||(t._childrenObjects[n]={}),t._childrenObjects[n][r.url]=o,e.to===t.metadata.url&&o.store(),t._hypertyEvt(e,o)}},{key:"_onHypertyResourceAdded",value:function(e){var t=this,r=e.body.value,n=void 0,o=r.children;r.parentObject=t,n=t._hypertyResourceFactory.createHypertyResource(!1,r.resourceType,r),n.identity=e.body.identity,t._childrenObjects.hasOwnProperty(o)||(t._childrenObjects[o]={}),t._childrenObjects[o][n.childId]=n,t._hypertyEvt(e,n),e.to===t.metadata.url&&n.store()}},{key:"_hypertyEvt",value:function(e,t){var r=this,n={type:e.type,from:e.from,url:e.to,value:t.data,childId:t.url,identity:e.body.identity,child:t};t.resourceType&&(n.resource=t),r._onAddChildrenHandler&&r._onAddChildrenHandler(n)}},{key:"_onChange",value:function(e,t){var r=this;if(r._metadata.lastModified=(new Date).toISOString(),r._version++,"live"===r._status){var n={type:"update",from:r._url,to:r._url+"/changes",body:{version:r._version,source:r._owner,attribute:e.field,lastModified:r._metadata.lastModified}};w.log("[DataObject - _onChange] - ",e,t,n),e.oType===_.ObjectType.OBJECT?e.cType!==_.ChangeType.REMOVE&&(n.body.value=(0,R.deepClone)(e.data)):(n.body.attributeType=e.oType,n.body.value=e.data,e.cType!==_.ChangeType.UPDATE&&(n.body.operation=e.cType)),t&&(n.to=t.path,n.body.resource=t.childId),r.data._mutual||(n.body.mutual=r._mutual),r._bus.postMessage(n)}}},{key:"_changeObject",value:function(e,t){var r=this;if(r._version+1<=t.body.version){r._version=t.body.version;var n=t.body.attribute,i=void 0;i="object"===(0,o.default)(t.body.value)?(0,R.deepClone)(t.body.value):t.body.value;var a=e.findBefore(n);if(t.body.lastModified?r._metadata.lastModified=t.body.lastModified:r._metadata.lastModified=(new Date).toISOString(),t.body.attributeType===_.ObjectType.ARRAY)if(t.body.operation===_.ChangeType.ADD){var s=a.obj,u=a.last;Array.prototype.splice.apply(s,[u,0].concat(i))}else if(t.body.operation===_.ChangeType.REMOVE){var c=a.obj,l=a.last;c.splice(l,i)}else a.obj[a.last]=i;else t.body.hasOwnProperty("value")?a.obj[a.last]=i:delete a.obj[a.last]}else w.log("UNSYNCHRONIZED VERSION: (data => "+r._version+", msg => "+t.body.version+")")}},{key:"_changeChildren",value:function(e){var t=this,r=(0,R.divideURL)(e.to),n=r.identity,o=n?n.substring(n.lastIndexOf("/")+1):void 0,i=e.body.resource,a=t._childrenObjects[o][i];w.log("Change children: ",t._owner,e,o),a?t._changeObject(a._syncObj,e):w.warn("No children found for: ",i)}},{key:"metadata",get:function(){return this._metadata}},{key:"url",get:function(){return this._url}},{key:"schema",get:function(){return this._schema}},{key:"status",get:function(){return this._status}},{key:"data",get:function(){return this._syncObj.data}},{key:"childrens",get:function(){return this._childrenObjects}}]),DataObject}();t.default=j,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0}),t.ObjectType=t.ChangeType=void 0;var n=r(3),o=_interopRequireDefault(n),i=r(4),a=_interopRequireDefault(i);r(154);var s=r(39),u=function(){function SyncObject(e){(0,o.default)(this,SyncObject);var t=this;t._observers=[],t._filters={},this._data=e||{},this._internalObserve(this._data)}return(0,a.default)(SyncObject,[{key:"observe",value:function(e){this._observers.push(e)}},{key:"find",value:function(e){var t=(0,s.parseAttributes)(e);return this._findWithSplit(t)}},{key:"findBefore",value:function(e){var t={},r=(0,s.parseAttributes)(e);return t.last=r.pop(),t.obj=this._findWithSplit(r),t}},{key:"_findWithSplit",value:function(e){var t=this._data;return e.forEach(function(e){t=t[e]}),t}},{key:"_internalObserve",value:function(e){var t=this,r=function(e){e.every(function(e){t._onChanges(e)})};this._data=Object.deepObserve(e,r)}},{key:"_fireEvent",value:function(e){this._observers.forEach(function(t){t(e)})}},{key:"_onChanges",value:function(e){var t=e.object,r=void 0;t.constructor===Object&&(r=l.OBJECT),t.constructor===Array&&(r=l.ARRAY);var n=e.keypath,o=t[e.name];"update"!==e.type||n.includes(".length")||this._fireEvent({cType:c.UPDATE,oType:r,field:n,data:o}),"add"===e.type&&this._fireEvent({cType:c.ADD,oType:r,field:n,data:o}),"delete"===e.type&&this._fireEvent({cType:c.REMOVE,oType:r,field:n})}},{key:"data",get:function(){return this._data}}]),SyncObject}(),c=t.ChangeType={UPDATE:"update",ADD:"add",REMOVE:"remove"},l=t.ObjectType={OBJECT:"object",ARRAY:"array"};t.default=u},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(17),o=_interopRequireDefault(n),i=r(3),a=_interopRequireDefault(i),s=r(4),u=_interopRequireDefault(s),c=r(36),l=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(c),d=r(132),f=_interopRequireDefault(d),p=r(39),y=l.getLogger("DataObjectChild"),v=function(){function DataObjectChild(e){function throwMandatoryParmMissingError(e){throw"[DataObjectChild] "+e+" mandatory parameter is missing"}(0,a.default)(this,DataObjectChild);var t=this;e.parent?t._parent=e.parent:throwMandatoryParmMissingError("parent"),e.url?t._url=e.url:throwMandatoryParmMissingError("url"),e.created?t._created=e.created:throwMandatoryParmMissingError("created"),e.reporter?t._reporter=e.reporter:throwMandatoryParmMissingError("reporter"),e.runtime?t._runtime=e.runtime:throwMandatoryParmMissingError("runtime"),e.schema?t._schema=e.schema:throwMandatoryParmMissingError("schema"),e.parentObject?t._parentObject=e.parentObject:throwMandatoryParmMissingError("parentObject"),e.name&&(t._name=e.name),e.description&&(t._description=e.description),e.tags&&(t._tags=e.tags),e.resources&&(t._resources=e.resources),e.observerStorage&&(t._observerStorage=e.observerStorage),e.publicObservation&&(t._publicObservation=e.publicObservation),t._childId=e.url,e.data?t._syncObj=new f.default(e.data):t._syncObj=new f.default({}),y.log("[DataObjectChild -  Constructor] - ",t._syncObj),t._bus=t._parentObject._bus,t._owner=t._parentObject._owner,t._allocateListeners(),t._metadata=e,delete t._metadata.parentObject,t._sharingStatus=!1}return(0,u.default)(DataObjectChild,[{key:"share",value:function(e){var t=this;t._sharingStatus=new o.default(function(r,n){var o=void 0;o=e?t.metadata.parent:t.metadata.parent+"/children/"+t.metadata.children;var i=t.metadata;i.data=t.data;var a={type:"create",from:t.metadata.reporter,to:o,body:{resource:i.url,value:i}};if(t.identity&&(a.body.identity=t.identity),t._parentObject.data.hasOwnProperty("mutual")&&(a.body.mutual=t._parentObject.data.mutual),t._parentObject.metadata.reporter===t.metadata.reporter)return t._bus.postMessage((0,p.deepClone)(a)),r();var s=function(e){if(e.to===t._reporter){t._bus.removeResponseListener(a.from,e.id),y.log("[Syncher.DataObjectChild.share] Parent reporter reply ",e);var o={code:e.body&&e.body.code?e.body.code:500,desc:e.body&&e.body.desc?e.body.desc:"Unknown"};return e.body.code<300?r(o):n(o)}},u=t._bus.postMessage((0,p.deepClone)(a),s,!1);setTimeout(function(){return t._bus.removeResponseListener(a.from,u),n({code:408,desc:"timout"})},3e3)})}},{key:"store",value:function(){var e=this,t={},r=e.metadata.children+"."+e.metadata.url;t.value=e.metadata,t.identity=e.identity;var n={from:e.metadata.reporter,to:e._parentObject._syncher._subURL,type:"create",body:{resource:e.metadata.parent,attribute:r,value:t}};y.log("[DataObjectChild.store]:",n),e._bus.postMessage(n)}},{key:"_allocateListeners",value:function(){var e=this;e._reporter===e._owner&&(e._listener=e._bus.addListener(e._reporter,function(t){"response"===t.type&&t.id===e._msgId&&(y.log("DataObjectChild.onResponse:",t),e._onResponse(t))}))}},{key:"_releaseListeners",value:function(){var e=this;e._listener&&e._listener.remove()}},{key:"delete",value:function(){this._releaseListeners()}},{key:"onChange",value:function(e){this._syncObj.observe(function(t){y.log("[DataObjectChild - observer] - ",t),e(t)})}},{key:"onResponse",value:function(e){this._onResponseHandler=e}},{key:"_onResponse",value:function(e){var t=this,r={type:e.type,url:e.body.source,code:e.body.code};t._onResponseHandler&&t._onResponseHandler(r)}},{key:"shareable",get:function(){var e=this.metadata;return e.data=this.data,e}},{key:"metadata",get:function(){return this._metadata}},{key:"childId",get:function(){return this._childId}},{key:"sharingStatus",get:function(){return this._sharingStatus}},{key:"data",get:function(){return this._syncObj.data}},{key:"identity",set:function(e){this._identity=e},get:function(){return this._identity}}]),DataObjectChild}();t.default=v,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(17),o=_interopRequireDefault(n),i=r(3),a=_interopRequireDefault(i),s=r(4),u=_interopRequireDefault(s),c=r(39),l=function(){function IdentityManager(e,t,r){(0,a.default)(this,IdentityManager);var n=this;n.messageBus=r,n.domain=(0,c.divideURL)(e).domain,n.owner=e,n.runtimeURL=t}return(0,u.default)(IdentityManager,[{key:"discoverUserRegistered",value:function(e,t){var r=this;return new o.default(function(n,o){var i=void 0,a=e||".";i=t||r.owner;var s={type:"read",from:i,to:r.runtimeURL+"/registry/",body:{resource:a,criteria:i}};r.messageBus.postMessage(s,function(e){var t=e.body.resource;t&&200===e.body.code?n(t):o("code: "+e.body.code+" No user was found")})})}},{key:"discoverIdentityPerIdP",value:function(e){var t=this;return new o.default(function(r,n){var o={type:"read",from:this.owner,to:t.runtimeURL+"/idm",body:{resource:e,criteria:"idp"}};t.messageBus.postMessage(o,function(e){200===e.body.code?r(e.body.value):n(e.body.code+" "+e.body.desc)})})}}]),IdentityManager}();t.default=l,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(17),o=_interopRequireDefault(n),i=r(3),a=_interopRequireDefault(i),s=r(4),u=_interopRequireDefault(s),c=r(36),l=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(c),d=r(39),f=r(162),p=_interopRequireDefault(f),y=l.getLogger("Discovery"),v=function(){function Discovery(e,t,r){(0,a.default)(this,Discovery);var n=this;n.messageBus=r,n.runtimeURL=t,n.domain=(0,d.divideURL)(e).domain,n.discoveryURL=e}return(0,u.default)(Discovery,[{key:"_isLegacyUser",value:function(e){return!(!e.includes(":")||e.includes("user://"))}},{key:"discoverHypertiesPerUserProfileData",value:function(e,t,r){var n=this,i=[],a={type:"read",from:n.discoveryURL,to:n.runtimeURL+"/discovery/",body:{resource:"/hyperty/userprofile/"+e}};return(t||r)&&(a.body.criteria={resources:r,dataSchemes:t}),new o.default(function(t,r){n._isLegacyUser(e)?t([{hypertyID:e,status:"live"}]):n.messageBus.postMessage(a,function(r){200===r.body.code?(r.body.value.map(function(e){e.hypertyID!=n.discoveryURL&&i.push(e)}),0===i.length?t([]):(y.log("[Discovery.discoverHypertiesPerUserProfileData] Reply log: ",i),t(i))):(y.warn("[Discovery.discoverHypertiesPerUserProfileData] Error Reply for "+e+" Reason: ",r.body.description),t([]))})})}},{key:"discoverHypertiesPerUserProfileDataDO",value:function(e,t,r){var n=this,i=arguments;return new o.default(function(e,t){n.discoverHypertiesPerUserProfileData.apply(n,i).then(function(t){e(n._convertToDiscoveredObject(t))}).catch(function(e){return t(e)})})}},{key:"discoverDataObjectsPerUserProfileData",value:function(e,t,r){var n=this,i={type:"read",from:n.discoveryURL,to:n.runtimeURL+"/discovery/",body:{resource:"/dataObject/userprofile/"+e}};return(t||r)&&(i.body.criteria={resources:r,dataSchemes:t}),new o.default(function(t,r){n._isLegacyUser(e)?t([{hypertyID:e,status:"live"}]):n.messageBus.postMessage(i,function(r){200===r.body.code?(y.log("Reply log: ",r.body.value),t(r.body.value)):(y.warn("[Discovery.discoverDataObjectsPerUserProfileData] Error Reply for "+e+" Reason: ",r.body.description),t([]))})})}},{key:"discoverDataObjectsPerUserProfileDataDO",value:function(e,t,r){var n=this,i=arguments;return new o.default(function(e,t){n.discoverDataObjectsPerUserProfileData.apply(n,i).then(function(t){return e(n._convertToDiscoveredObject(t))}).catch(function(e){return t(e)})})}},{key:"discoverHypertiesPerGUID",value:function(e,t,r){var n=this,i=[],a={type:"read",from:n.discoveryURL,to:n.runtimeURL+"/discovery/",body:{resource:"/hyperty/guid/"+e}};return(t||r)&&(a.body.criteria={resources:r,dataSchemes:t}),new o.default(function(t,r){n.messageBus.postMessage(a,function(o){200===o.body.code?(o.body.value.map(function(e){e.hypertyID!=n.discoveryURL&&i.push(e)}),0===i.length?r("No Hyperty was found"):(y.log("Reply log: ",i),t(i))):(y.warn("[Discovery.discoverHypertiesPerGUID] Error Reply for "+e+" Reason: ",o.body.description),t([]))})})}},{key:"discoverHypertiesPerGUIDDO",value:function(e,t,r){var n=this,i=arguments;return new o.default(function(e,t){n.discoverHypertiesPerGUID.apply(n,i).then(function(t){e(n._convertToDiscoveredObject(t))}).catch(function(e){return t(e)})})}},{key:"discoverDataObjectsPerGUID",value:function(e,t,r){var n=this,i={type:"read",from:n.discoveryURL,to:n.runtimeURL+"/discovery/",body:{resource:"/dataObject/guid/"+e}};return(t||r)&&(i.body.criteria={resources:r,dataSchemes:t}),new o.default(function(t,r){n.messageBus.postMessage(i,function(r){200===r.body.code?(y.log("Reply log: ",r.body.value),t(r.body.value)):(y.warn("[Discovery.discoverDataObjectsPerGUID] Error Reply for "+e+" Reason: ",r.body.description),t([]))})})}},{key:"discoverDataObjectsPerGUIDDO",value:function(e,t,r){var n=this,i=arguments;return new o.default(function(e,t){n.discoverDataObjectsPerGUID.apply(n,i).then(function(t){return e(n._convertToDiscoveredObject(t))}).catch(function(e){return t(e)})})}},{key:"discoverHyperties",value:function(e,t,r,n){var i=this,a=void 0,s=[];a=n||i.domain;var u={type:"read",from:i.discoveryURL,to:i.runtimeURL+"/discovery/",body:{resource:"/hyperty/user/"+e}};return u.body.criteria=t||r?{resources:r,dataSchemes:t,domain:a}:{domain:a},new o.default(function(t,r){i._isLegacyUser(e)?t([{hypertyID:e,status:"live"}]):i.messageBus.postMessage(u,function(r){200===r.body.code||500===r.body.code?(r.body.value.map(function(e){e.hypertyID!=i.discoveryURL&&s.push(e)}),y.log("[Discovery.discoverHyperties] Reply : ",s),t(s)):(y.warn("[Discovery.discoverHyperties] Error Reply for "+e+" Reason: ",r.body.description),t(s))})})}},{key:"discoverHypertiesDO",value:function(e,t,r,n){var i=this,a=arguments;return new o.default(function(e,t){i.discoverHyperties.apply(i,a).then(function(t){e(i._convertToDiscoveredObject(t))}).catch(function(e){return t(e)})})}},{key:"discoverDataObjects",value:function(e,t,r,n){var i=this,a=void 0;a=n||i.domain;var s={type:"read",from:i.discoveryURL,to:i.runtimeURL+"/discovery/",body:{resource:"/dataObject/user/"+e}};return s.body.criteria=t||r?{resources:r,dataSchemes:t,domain:a}:{domain:a},new o.default(function(t,r){i.messageBus.postMessage(s,function(r){200===r.body.code?(y.log("Reply Value Log: ",r.body.value),t(r.body.value)):(y.warn("[Discovery.discoverDataObjects] Error Reply for "+e+" Reason: ",r.body.description),t([]))})})}},{key:"discoverDataObjectsDO",value:function(e,t,r,n){var i=this,a=arguments;return new o.default(function(e,t){i.discoverDataObjects.apply(i,a).then(function(t){return e(i._convertToDiscoveredObject(t))}).catch(function(e){return t(e)})})}},{key:"discoverHypertyPerURL",value:function(e,t){var r=this,n=void 0;n=t||r.domain;var i={type:"read",from:r.discoveryURL,to:r.runtimeURL+"/discovery/",body:{resource:"/hyperty/url/"+e,criteria:{domain:n}}};return new o.default(function(t,n){r.messageBus.postMessage(i,function(r){200===r.body.code?(y.log("Reply Value Log: ",r.body.value),t(r.body.value)):(y.warn("[Discovery.discoverHypertyPerURL] Error Reply for "+e+" Reason: ",r.body.description),t([]))})})}},{key:"discoverHypertyPerURLDO",value:function(e,t){var r=this,n=arguments;return new o.default(function(e,t){r.discoverHypertyPerURL.apply(r,n).then(function(t){return e(new p.default(t,r.runtimeURL,r.discoveryURL,r.messageBus,r))}).catch(function(e){return t(e)})})}},{key:"discoverDataObjectPerURL",value:function(e,t){var r=this,n=void 0;n=t||r.domain;var i={type:"read",from:r.discoveryURL,to:r.runtimeURL+"/discovery/",body:{resource:"/dataObject/url/"+e,criteria:{domain:n}}};return new o.default(function(t,n){r.messageBus.postMessage(i,function(r){200===r.body.code?(y.log("Reply Value Log: ",r.body.value),t(r.body.value)):(y.warn("[Discovery.discoverDataObjectPerURL] Error Reply for "+e+" Reason: ",r.body.description),t([]))})})}},{key:"discoverDataObjectPerURLDO",value:function(e,t){var r=this,n=arguments;return new o.default(function(e,t){r.discoverDataObjectPerURL.apply(r,n).then(function(t){return e(new p.default(t,r.runtimeURL,r.discoveryURL,r.messageBus,r))}).catch(function(e){return t(e)})})}},{key:"discoverDataObjectsPerName",value:function(e,t,r,n){var i=this,a=void 0;a=n||i.domain;var s={type:"read",from:i.discoveryURL,to:i.runtimeURL+"/discovery/",body:{resource:"/dataObject/name/"+e}};return s.body.criteria=t||r?{resources:r,dataSchemes:t,domain:a}:{domain:a},new o.default(function(t,r){i.messageBus.postMessage(s,function(r){200===r.body.code?(y.log("Reply Value Log: ",r.body.value),t(r.body.value)):(y.warn("[Discovery.discoverDataObjectsPerName] Error Reply for "+e+" Reason: ",r.body.description),t([]))})})}},{key:"discoverDataObjectsPerNameDO",value:function(e,t,r,n){var i=this,a=arguments;return new o.default(function(e,t){i.discoverDataObjectsPerName.apply(i,a).then(function(t){return e(i._convertToDiscoveredObject(t))}).catch(function(e){return t(e)})})}},{key:"discoverDataObjectsPerReporter",value:function(e,t,r,n){var i=this,a=void 0;a=n||i.domain;var s={type:"read",from:i.discoveryURL,to:i.runtimeURL+"/discovery/",body:{resource:"/dataObject/reporter/"+e}};return s.body.criteria=t||r?{resources:r,dataSchemes:t,domain:a}:{domain:a},new o.default(function(t,r){i.messageBus.postMessage(s,function(r){200===r.body.code?(y.log("Reply Value Log: ",r.body.value),t(r.body.value)):(y.warn("[Discovery.discoverDataObjectsPerName] Error Reply for "+e+" Reason: ",r.body.description),t([]))})})}},{key:"discoverDataObjectsPerReporterDO",value:function(e,t,r,n){var i=this,a=arguments;return new o.default(function(e,t){i.discoverDataObjectsPerReporter.apply(i,a).then(function(t){return e(i._convertToDiscoveredObject(t))}).catch(function(e){return t(e)})})}},{key:"_convertToDiscoveredObject",value:function(e){var t=this;return e.map(function(e){return new p.default(e,t.runtimeURL,t.discoveryURL,t.messageBus,t)})}},{key:"discoverDataObject",value:function(e,t,r,n){var i=this,a=void 0;a=n||i.domain;var s={type:"read",from:i.discoveryURL,to:"domain://registry."+a,body:{resource:e,criteria:{resources:r,dataSchemes:t}}};return new o.default(function(t,r){i.messageBus.postMessage(s,function(r){if(y.log("[Discovery]",r),r.body.code>299)return y.warn("[Discovery.discoverDataObject] Error Reply for "+e+" Reason: ",r.body.description),t([]);var n=r.body.value;t(n||[])})})}},{key:"discoverHyperty",value:function(e,t,r,n){var i=this,a=void 0,s=(0,d.convertToUserURL)(e);return a=n||i.domain,new o.default(function(o,u){if(y.log("[Discovery.discoverHyperty] ACTIVE DOMAIN -> ",a,"user->",e,"schema->",t,"resources->",r,"domain->",n),e.includes(":")&&!e.includes("user://")){y.log("[Discovery.discoverHyperty] "+e+" is legacy domain");return o({userID:e,hypertyID:e,schema:t,resources:r})}var c={type:"read",from:i.discoveryURL,to:"domain://registry."+a,body:{resource:s,criteria:{resources:r,dataSchemes:t}}};y.info("[Discovery] msg to send->",c),i.messageBus.postMessage(c,function(e){y.info("[Discovery] ON discoverHyperty->",e);var t=e.body.value;t?o(t):u("No Hyperty was found")})})}},{key:"discoverHypertyPerUser",value:function(e,t){var r=this,n=void 0;return new o.default(function(o,i){if(e.includes(":")&&!e.includes("user://")){y.log("[Discovery.discoverHyperty] "+e+"is legacy domain");return o({id:e,hypertyURL:e,descriptor:"unknown"})}n=t||r.domain;var a="user://"+e.substring(e.indexOf("@")+1,e.length)+"/"+e.substring(0,e.indexOf("@")),s={type:"read",from:r.discoveryURL,to:"domain://registry."+n,body:{resource:a}};y.info("[Discovery] Message: ",s,n,a),r.messageBus.postMessage(s,function(t){y.info("[Discovery] message reply",t);var r=void 0,n=void 0,a=void 0,s=t.body.value;for(r in s)if(void 0!==s[r].lastModified)if(void 0===n)n=new Date(s[r].lastModified),a=r;else{var u=new Date(s[r].lastModified);n.getTime()<u.getTime()&&(n=u,a=r)}y.info("[Discovery] Last Hyperty: ",a,n);var c=a;if(void 0===c)return i("User Hyperty not found");var l={id:e,descriptor:s[c].descriptor,hypertyURL:c};y.info("[Discovery] ===> hypertyDiscovery messageBundle: ",l),o(l)})})}},{key:"discoverHypertiesPerUser",value:function(e,t){var r=this,n=void 0;return y.log("on Function->",e),new o.default(function(o,i){if(e.includes(":")&&!e.includes("user://")){y.log("[Discovery.discoverHyperty] is legacy domain");var a={userID:e,hypertyID:e,schema:schema,resources:resources};return o(a)}n=t||r.domain;var s="user://"+e.substring(e.indexOf("@")+1,e.length)+"/"+e.substring(0,e.indexOf("@")),u={type:"read",from:r.discoveryURL,to:"domain://registry."+n,body:{resource:s}};y.log("[Discovery] Message discoverHypertiesPerUser: ",u,n,s),r.messageBus.postMessage(u,function(e){y.info("[Discovery] discoverHypertiesPerUser reply",e);var t=e.body.value;if(!t)return i("User Hyperty not found");o(t)})})}},{key:"resumeDiscoveries",value:function(){var e=this;return y.log("[Discovery] resumeDiscoveries"),new o.default(function(t,r){var n={type:"read",from:e.discoveryURL,to:e.runtimeURL+"/subscriptions",body:{resource:e.discoveryURL}};e.messageBus.postMessage(n,function(r){y.log("[Discovery.resumeDiscoveries] reply: ",r);var n=[];if(200===r.body.code){r.body.value.forEach(function(t){var r=t.split("/registration")[0];({}).url=r,y.log("[Discovery.resumeDiscoveries] adding listener to: ",r),r.includes("hyperty://")?n.push(e.discoverHypertyPerURLDO(r)):n.push(e.discoverDataObjectPerURLDO(r))}),o.default.all(n).then(function(e){t(e)})}else t([])})})}}]),Discovery}();t.default=v,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(44),o=_interopRequireDefault(n),i=r(17),a=_interopRequireDefault(i),s=r(26),u=_interopRequireDefault(s),c=r(3),l=_interopRequireDefault(c),d=r(4),f=_interopRequireDefault(d),p=r(34),y=_interopRequireDefault(p),v=r(35),h=_interopRequireDefault(v),_=r(137),b=_interopRequireDefault(_),m=function(e){function ContextObserver(e,t,r,n,o,i){if((0,l.default)(this,ContextObserver),!e)throw new Error("The hypertyURL is a needed parameter");if(!t)throw new Error("The MiniBus is a needed parameter");if(!r)throw new Error("The configuration is a needed parameter ");if(!o)throw new Error("The factory is a needed parameter ");var a=(0,y.default)(this,(ContextObserver.__proto__||(0,u.default)(ContextObserver)).call(this)),s=a;s._contextResourceTypes=n,s._url=e,s._discoverUsersPromises={},s._observePromises={},s._domain=o.divideURL(r.runtimeURL).domain,s._objectDescURL="hyperty-catalogue://catalogue."+s._domain+"/.well-known/dataschema/Context",s._users2observe=[],s._observers={},a._syncher=i||o.createSyncher(e,t,r);var c=o.createDiscovery(e,r.runtimeURL,t);return s._discovery=c,s._discoveries={},window.discovery=s._discovery,a}return(0,h.default)(ContextObserver,e),(0,f.default)(ContextObserver,[{key:"start",value:function(e,t){var r=this;return new a.default(function(n,i){r._syncher.resumeObservers({store:!0}).then(function(i){var a=(0,o.default)(i);a.length>0?(r._observers=i,n(i),a.forEach(function(r){var n=i[r];e&&(context.data.values=e),n.sync(),t&&n.onDisconnected(t)})):n(!1)}).catch(function(e){n(!1)})}).catch(function(e){reject("[ContextObserver] Start failed | ",e)})}},{key:"resumeDiscoveries",value:function(){var e=this;return new a.default(function(t,r){e._discovery.resumeDiscoveries().then(function(r){r.forEach(function(r){r.data.resources&&r.data.resources[0]===e._contextResourceTypes[0]&&("live"===r.data.status?(t([r.data]),r.unsubscribeLive(e._url)):r.onLive(e._url,function(){t([r.data]),r.unsubscribeLive(e._url)}))})})}).catch(function(e){reject("[ContextObserver] resumeDiscoveries failed | ",e)})}},{key:"onResumeObserver",value:function(e){this._onResumeObserver=e}},{key:"discoverUsers",value:function(e,t){var r=this,n=e+"@"+t;return r._discoverUsersPromises[n]||(r._discoverUsersPromises[n]=new a.default(function(n,o){r._discovery.discoverHypertiesDO(e,["context"],r._contextResourceTypes,t).then(function(e){var t=[],o=[];e.forEach(function(e){r._discoveries[e.data.hypertyID]=e,"live"===e.data.status?t.push(e.data):o.push(e)}),t.length>0?n(t):o.length>0&&o[0].onLive(r._url,function(){t.push(o[0].data),n(t),o[0].unsubscribeLive(r._url)})})})),r._discoverUsersPromises[n]}},{key:"observe",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],r=this;return r._observePromises[e.hypertyID]||(r._observePromises[e.hypertyID]=new a.default(function(n,o){r._users2observe.forEach(function(t){if(t._reporter===e.hypertyID)return n(t)}),r._discovery.discoverDataObjectsPerReporter(e.hypertyID,["context"],r._contextResourceTypes,r._domain).then(function(i){var a=0,s=void 0;i.forEach(function(e){e.hasOwnProperty("lastModified")&&e.hasOwnProperty("url")&&Date.parse(e.lastModified)>a&&(a=e.lastModified,s=e.url)}),0!=a&&s?n(r._subscribeContext(e,s,t)):o("[ContextObserver.observe] discovered DataObjecs are invalid",i)})})),r._observePromises[e.hypertyID]}},{key:"_subscribeContext",value:function(e,t){var r=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],n=this;return new a.default(function(e,o){n._users2observe.forEach(function(r){if(r.url===t)return e(r)}),n._syncher.subscribe(n._objectDescURL,t,null,null,null,r).then(function(t){n._users2observe.push(t),t.onDisconnected(function(){t.data.values[0].value="unavailable",t.sync()}),e(t)})})}},{key:"_discoverAndSubscribeLegacyUsers",value:function(e){var t=this;return new a.default(function(r,n){t._discovery.discoverDataObjectsPerName(e).then(function(e){e.forEach(function(e){"live"===e.status&&(e.hypertyID||(e.hypertyID=e.reporter),t._subscribeContext(e.schema,e.url).then(function(e){return r(e)}))})}).catch(function(e){})})}},{key:"unobserve",value:function(e){var t=this;t._users2observe.forEach(function(r,n){r.url===e&&(r.unsubscribe(),t._users2observe.splice(n,1))})}}]),ContextObserver}(b.default);t.default=m,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(3),o=_interopRequireDefault(n),i=r(4),a=_interopRequireDefault(i),s=function(){function EventEmitter(){(0,o.default)(this,EventEmitter)}return(0,a.default)(EventEmitter,[{key:"addEventListener",value:function(e,t){this[e]=t}},{key:"trigger",value:function(e,t){var r=this;r[e]&&r[e](t)}}]),EventEmitter}();t.default=s,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(44),o=_interopRequireDefault(n),i=r(17),a=_interopRequireDefault(i),s=r(26),u=_interopRequireDefault(s),c=r(3),l=_interopRequireDefault(c),d=r(4),f=_interopRequireDefault(d),p=r(34),y=_interopRequireDefault(p),v=r(35),h=_interopRequireDefault(v),_=r(137),b=_interopRequireDefault(_),m=function(e){function ContextReporter(e,t,r,n,o){if((0,l.default)(this,ContextReporter),!e)throw new Error("The hypertyURL is a needed parameter");if(!t)throw new Error("The MiniBus is a needed parameter");if(!r)throw new Error("The configuration is a needed parameter");var i=(0,y.default)(this,(ContextReporter.__proto__||(0,u.default)(ContextReporter)).call(this,e,t,r));return i.syncher=o||n.createSyncher(e,t,r),i.domain=n.divideURL(r.runtimeURL).domain,i.contexts={},i.contextDescURL="hyperty-catalogue://catalogue."+i.domain+"/.well-known/dataschema/Context",i.syncher.onNotification(function(e){i.onNotification(e)}),i.syncher.onClose(function(e){i.setStatus(e.id,"unavailable"),e.ack()}),i}return(0,h.default)(ContextReporter,e),(0,f.default)(ContextReporter,[{key:"start",value:function(){var e=this,t=this;return new a.default(function(r,n){e.syncher.resumeReporters({store:!0}).then(function(e){var n=(0,o.default)(e);n.length>0?(t.contexts=e,n.forEach(function(e){t._onSubscription(t.contexts[e])}),r(t.contexts)):r(!1)}).catch(function(e){})}).catch(function(e){reject("[ContextReporter] Start failed | ",e)})}},{key:"processNotification",value:function(e){e.ack()}},{key:"create",value:function(e,t,r){var n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"myContext",o=arguments.length>4&&void 0!==arguments[4]?arguments[4]:null,i=arguments.length>5&&void 0!==arguments[5]?arguments[5]:null,s=this,u=void 0;return new a.default(function(a,c){u=o||i?o&&!i?{resources:r,expires:30,reporter:o}:!o&&i?{resources:r,expires:30,reuseURL:i}:{resources:r,expires:30,reuseURL:i,reporter:o}:{resources:r,expires:30},s.syncher.create(s.contextDescURL,[],t,!0,!1,n,null,u).then(function(t){s.contexts[e]=t,s._onSubscription(t),a(t)}).catch(function(e){c(e)})})}},{key:"_onSubscription",value:function(e){e.onSubscription(function(e){e.accept()})}},{key:"setContext",value:function(e,t){var r=this;r.contexts[e].data.values=t,r.trigger(e+"-context-update",t)}}]),ContextReporter}(b.default);t.default=m,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(17),o=_interopRequireDefault(n),i=r(69),a=_interopRequireDefault(i),s=r(3),u=_interopRequireDefault(s),c=r(4),l=_interopRequireDefault(c),d=r(125),f=_interopRequireDefault(d),p=r(168),y=_interopRequireDefault(p),v=function(){function ChatController(e,t,r,n,o,i){if((0,u.default)(this,ChatController),!e)throw Error("Syncher is a necessary dependecy");if(!t)throw Error("Discover is a necessary dependecy");if(!r)throw Error("Domain is a necessary dependecy");if(!n)throw Error("Search is a necessary dependecy");var a=this;a._syncher=e,a.discovery=t,a.search=n,a.myIdentity=o,a.controllerMode="reporter",a.child_cseq=0,a.domain=r,a._manager=i;var s=e.owner;a._objectDescURL="hyperty-catalogue://catalogue."+r+"/.well-known/dataschema/Communication",a._invitationsHandler=new y.default(s)}return(0,l.default)(ChatController,[{key:"_setOnAddChildListener",value:function(e){var t=this;e.onAddChild(function(e){t.child_cseq+=1,t._onMessage&&t._onMessage(e)})}},{key:"_onSubscribe",value:function(e){var t=this._dataObjectReporter;e.accept();var r=JSON.parse((0,a.default)(e.identity));r.hasOwnProperty("assertion")&&delete r.assertion;var n={hypertyURL:e.url,domain:e.domain,identity:r},o=e.identity.userProfile.userURL;e.identity.legacy&&(n.legacy=e.identity.legacy),t.data.participants[o]=n,this._onUserAdded&&this._onUserAdded(n)}},{key:"_onUnsubscribe",value:function(e){var t=this._dataObjectReporter,r=e.identity.userProfile;e.identity.legacy&&(r.legacy=e.identity.legacy),delete t.data.participants[r.userURL],this._onUserRemoved&&this._onUserRemoved(r)}},{key:"sendFile",value:function(e){var t=this,r=t.controllerMode,n="reporter"===r?t.dataObjectReporter:t.dataObjectObserver;return new o.default(function(r,o){var i={userProfile:t.myIdentity};n.addHypertyResource("resources","file",e,i).then(function(e){var o={userProfile:t.myIdentity},i={value:e,identity:o,resource:e},a=new f.default(n.url,t._manager._runtimeURL,t._manager._hypertyURL,t._manager._bus);!function share2Reporter(e,t,n,o){var i=o;e.sharingStatus.then(r(n)).catch(function(r){i.onLive(t,function(){i.unsubscribeLive(t),e.share(!0),share2Reporter(e,t,n,i)})})}(e,t._manager._hypertyURL,i,a)})}).catch(function(e){reject(e)})}},{key:"send",value:function(e,t){var r=this,n=r.controllerMode,i="reporter"===n?r.dataObjectReporter:r.dataObjectObserver;return new o.default(function(n,o){r.child_cseq+=1;var a={type:"chat",content:e},s=t||{userProfile:r.myIdentity};i.addChild("resources",a,s).then(function(e){var t={childId:e._childId,from:e._owner,value:e.data,type:"create",identity:s},o=new f.default(i.url,r._manager._runtimeURL,r._manager._hypertyURL,r._manager._bus);!function share2Reporter(e,t,r,o){var i=o;e.sharingStatus.then(n(r)).catch(function(n){i.onLive(t,function(){i.unsubscribeLive(t),e.share(!0),share2Reporter(e,t,r,i)})})}(e,r._manager._hypertyURL,t,o)}).catch(function(e){o(e)})})}},{key:"onChange",value:function(e){this._onChange=e}},{key:"onMessage",value:function(e){this._onMessage=e}},{key:"onUserAdded",value:function(e){this._onUserAdded=e}},{key:"onUserRemoved",value:function(e){this._onUserRemoved=e}},{key:"onClose",value:function(e){this._onClose=e}},{key:"onResponse",value:function(e){this._onResponse=e}},{key:"addUser",value:function(e){var t=this,r=function(e){return 0!==e.length};return new o.default(function(n,i){if(0===e.filter(r).length)return i("Don't have users to invite");var a=[],s=[],u={};e.forEach(function(e){var r=t.discovery.discoverHypertiesDO(e.user,["comm"],["chat"],e.domain);a.push(r)}),o.default.all(a).then(function(e){var r=[];e.forEach(function(e){e.forEach(function(e){"live"===e.data.status?(r.push(e.data.hypertyID),u[e.data.hypertyID]=e):s.length<5&&s.push(e)})});var n="reporter"===t.controllerMode?t.dataObjectReporter:t.dataObjectObserver;s.length>0&&t._invitationsHandler.inviteDisconnectedHyperties(s,n),n.inviteObservers(r),n.invitations.length>0&&t._invitationsHandler.processInvitations(u,n)}).then(function(){n(!0)}).catch(function(e){i(e)})})}},{key:"addUserReq",value:function(e){var t=this,r=function(e){return 0!==e.length};return new o.default(function(n,o){if(0===e.filter(r).length)return o("[ChatManager.ChatController.addUserReq] Don't have users to add");if("observer"===!t.controllerMode){return o("[ChatManager.ChatController.addUserReq] only allowed to Chat Observer")}})}},{key:"onInvitationResponse",value:function(e){var t=this;t._onInvitationResponse=e,t._invitationsHandler.invitationResponse=e}},{key:"removeUser",value:function(e){}},{key:"close",value:function(){var e=this;return new o.default(function(t,r){if("reporter"===e.controllerMode)e._invitationsHandler.cleanInvitations(e.dataObjectReporter).then(function(){try{delete e._manager._reportersControllers[e.dataObjectReporter.url],e.dataObjectReporter.delete(),t(!0),e._onClose&&e._onClose({code:200,desc:"deleted",url:e.dataObjectReporter.url})}catch(e){r(!1)}});else try{delete e._manager._observersControllers[e.dataObjectObserver.url],e.dataObjectObserver.unsubscribe(),t(!0)}catch(e){r(!1)}})}},{key:"invitationsHandler",get:function(){return this._invitationsHandler}},{key:"url",get:function(){return"reporter"===this.controllerMode?this.dataObjectReporter.url:this.dataObjectObserver.url}},{key:"dataObjectReporter",set:function(e){if(!e)throw new Error("[ChatController] The data object reporter is necessary parameter ");var t=this;t.controllerMode="reporter",e.onSubscription(function(e){switch(e.type){case"subscribe":t._onSubscribe(e);break;case"unsubscribe":t._onUnsubscribe(e)}}),t._setOnAddChildListener(e),e.onRead(function(e){e.accept()}),e.onExecute(function(e){switch(e.method){case"addUser":t.addUser(e.params[0]).then(function(){e.accept()}).catch(function(t){e.reject(t)});break;case"removeUser":t.removeUser(e.params).then(function(){e.accept()}).catch(function(t){e.reject(t)});break;default:e.reject("[ChatController.onExecute] Chat method execution not accepted by Reporter")}}),t._dataObjectReporter=e},get:function(){return this._dataObjectReporter}},{key:"messages",get:function(){return"reporter"===this.controllerMode?this._dataObjectReporter._childrenObjects.resources:this._dataObjectObserver._childrenObjects.resources}},{key:"dataObjectObserver",set:function(e){var t=this;t.controllerMode="observer",t._dataObjectObserver=e,e.onChange("*",function(e){if(e.field.includes("participants"))switch(e.cType){case"add":t._onUserAdded&&t._onUserAdded(e);break;case"remove":t._onUserRemoved&&t._onUserRemoved(e)}t._onChange&&t._onChange(e)}),t._setOnAddChildListener(e)},get:function(){return this._dataObjectObserver}},{key:"dataObject",get:function(){return"reporter"===this.controllerMode?this.dataObjectReporter:this.dataObjectObserver}},{key:"closeEvent",set:function(e){var t=this;t._closeEvent=e,t._onClose&&t._onClose(e)},get:function(){return this._closeEvent}}]),ChatController}();t.default=v,e.exports=t.default},,,,,,,,,,,,function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0}),t.ContextReporter=t.ContextObserver=t.IdentityManager=t.Discovery=t.Syncher=t.SandboxFactory=t.SandboxRegistry=t.SandboxType=t.Sandbox=void 0;var n=r(152),o=_interopRequireDefault(n),i=r(128),a=_interopRequireDefault(i),s=r(129),u=_interopRequireDefault(s),c=r(130),l=_interopRequireDefault(c),d=r(135),f=_interopRequireDefault(d),p=r(134),y=_interopRequireDefault(p),v=r(136),h=_interopRequireDefault(v),_=r(138),b=_interopRequireDefault(_);t.Sandbox=o.default,t.SandboxType=n.SandboxType,t.SandboxRegistry=a.default,t.SandboxFactory=u.default,t.Syncher=l.default,t.Discovery=f.default,t.IdentityManager=y.default,t.ContextObserver=h.default,t.ContextReporter=b.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0}),t.SandboxType=void 0;var n=r(44),o=_interopRequireDefault(n),i=r(17),a=_interopRequireDefault(i),s=r(26),u=_interopRequireDefault(s),c=r(3),l=_interopRequireDefault(c),d=r(4),f=_interopRequireDefault(d),p=r(34),y=_interopRequireDefault(p),v=r(35),h=_interopRequireDefault(v),_=r(128),b=_interopRequireDefault(_),m=r(126),g=_interopRequireDefault(m),R=(t.SandboxType={APP:"app",NORMAL:"normal",WINDOW:"window"},function(e){function Sandbox(e){(0,l.default)(this,Sandbox);var t=(0,y.default)(this,(Sandbox.__proto__||(0,u.default)(Sandbox)).call(this)),r=t;return e&&(r.capabilities=e),t}return(0,h.default)(Sandbox,e),(0,f.default)(Sandbox,[{key:"deployComponent",value:function(e,t,r){var n=this;return new a.default(function(o,i){var a={type:"create",from:b.default.ExternalDeployAddress,to:b.default.InternalDeployAddress,body:{url:t,sourceCode:e,config:r}};n.postMessage(a,function(e){200===e.body.code?o("deployed"):i(e.body.desc)})})}},{key:"removeComponent",value:function(e){var t=this;return new a.default(function(r,n){var o={type:"delete",from:b.default.ExternalDeployAddress,to:b.default.InternalDeployAddress,body:{url:e}};t.postMessage(o,function(e){200===e.body.code?r("undeployed"):n(e.body.desc)})})}},{key:"matches",value:function(e){var t=this,r=(0,o.default)(e).filter(function(r){return!(t.capabilities[r]&&t.capabilities[r]===e[r])});return 0===r.length||!e[r]}}]),Sandbox}(g.default));t.default=R},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(44),o=_interopRequireDefault(n),i=r(69),a=_interopRequireDefault(i),s=r(17),u=_interopRequireDefault(s),c=r(26),l=_interopRequireDefault(c),d=r(3),f=_interopRequireDefault(d),p=r(4),y=_interopRequireDefault(p),v=r(34),h=_interopRequireDefault(v),_=r(116),b=_interopRequireDefault(_),m=r(35),g=_interopRequireDefault(m),R=r(36),O=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(R),D=r(131),w=_interopRequireDefault(D),j=r(39),L=O.getLogger("DataObjectReporter"),k=function(e){function DataObjectReporter(e){(0,f.default)(this,DataObjectReporter);var t=(0,h.default)(this,(DataObjectReporter.__proto__||(0,l.default)(DataObjectReporter)).call(this,e)),r=t;return r._subscriptions={},r._syncObj.observe(function(e){L.log("[Syncher.DataObjectReporter] "+r.url+" publish change: ",e),r._onChange(e)}),r._allocateListeners(),r.invitations=[],r._childrenSizeThreshold=5e4,t}return(0,g.default)(DataObjectReporter,e),(0,y.default)(DataObjectReporter,[{key:"_allocateListeners",value:function(){(0,b.default)(DataObjectReporter.prototype.__proto__||(0,l.default)(DataObjectReporter.prototype),"_allocateListeners",this).call(this);var e=this;e._objectListener=e._bus.addListener(e._url,function(t){switch(L.log("[Syncher.DataObjectReporter] listener "+e._url+" Received: ",t),t.type){case"response":e._onResponse(t);break;case"read":e._onRead(t);break;case"execute":e._onExecute(t);break;case"create":e._onChildCreate(t)}})}},{key:"_releaseListeners",value:function(){(0,b.default)(DataObjectReporter.prototype.__proto__||(0,l.default)(DataObjectReporter.prototype),"_releaseListeners",this).call(this),this._objectListener.remove()}},{key:"inviteObservers",value:function(e,t){var r=this,n=e;n.length>0&&(L.log("[Syncher.DataObjectReporter] InviteObservers ",n,r._metadata),n.forEach(function(e){var n=new u.default(function(n,o){var i={type:"create",from:r._syncher._owner,to:r._syncher._subURL,body:{resume:!1,resource:r._url,schema:r._schema,value:r._metadata,authorise:[e]}};t&&(i.body.p2p=t),r.data.mutual||(i.body.mutual=r.data.mutual),r._bus.postMessage(i,function(t){L.log("[Syncher.DataObjectReporter] Invitation reply ",t);var r={invited:e,code:t.body&&t.body.code?t.body.code:500,desc:t.body&&t.body.desc?t.body.desc:"Unknown"};r.code<300?n(r):r.code>=300&&o(r)})});r.invitations.push(n)}))}},{key:"delete",value:function(){var e=this;e._deleteChildrens().then(function(t){L.log(t);var r={type:"delete",from:e._owner,to:e._syncher._subURL,body:{resource:e._url}};e._bus.postMessage(r,function(t){L.log("DataObjectReporter-DELETE: ",t),200===t.body.code&&(e._releaseListeners(),delete e._syncher._reporters[e._url],e._syncObj={})})})}},{key:"onSubscription",value:function(e){this._onSubscriptionHandler=e}},{key:"onResponse",value:function(e){this._onResponseHandler=e}},{key:"onRead",value:function(e){this._onReadHandler=e}},{key:"onExecute",value:function(e){this._onExecuteHandler=e}},{key:"_onForward",value:function(e){var t=this;switch(L.log("DataObjectReporter-RCV: ",e),e.body.type){case"subscribe":t._onSubscribe(e);break;case"unsubscribe":t._onUnSubscribe(e)}}},{key:"_onSubscribe",value:function(e){var t=this,r=e.body.from,n=(0,j.divideURL)(r),o=n.domain,i=!0;e.body.hasOwnProperty("mutual")&&!e.body.mutual&&(i=!1),L.log("[DataObjectReporter._onSubscribe]",e,o,n);var a={type:e.body.type,url:r,domain:o,identity:e.body.identity,nutual:i,accept:function(){var n={url:r,status:"live"};t._subscriptions[r]=n,t.metadata.subscriptions&&t.metadata.subscriptions.push(n.url);var o=(0,j.deepClone)(t._metadata);o.data=(0,j.deepClone)(t.data),o.version=t._version;var i={id:e.id,type:"response",from:e.to,to:e.from,body:{code:200,schema:t._schema,value:o}};return e.body.hasOwnProperty("mutual")&&!e.body.mutual&&(i.body.mutual=e.body.mutual,t.data.mutual=!1),t._bus.postMessage(i),n},reject:function(r){t._bus.postMessage({id:e.id,type:"response",from:e.to,to:e.from,body:{code:403,desc:r}})}};t._onSubscriptionHandler&&(L.log("SUBSCRIPTION-EVENT: ",a),t._onSubscriptionHandler(a))}},{key:"_onUnSubscribe",value:function(e){var t=this,r=e.body.from,n=(0,j.divideURL)(r),o=n.domain;L.log("[DataObjectReporter._onUnSubscribe]",e,o,n),delete t._subscriptions[r],delete t.invitations[r];var i={type:e.body.type,url:r,domain:o,identity:e.body.identity};t._onSubscriptionHandler&&(L.log("UN-SUBSCRIPTION-EVENT: ",i),t._onSubscriptionHandler(i))}},{key:"_onResponse",value:function(e){var t=this,r={type:e.type,url:e.from,code:e.body.code};t._onResponseHandler&&(L.log("RESPONSE-EVENT: ",r),t._onResponseHandler(r))}},{key:"_onRead",value:function(e){var t=this,r=(0,a.default)(t.childrensJSON).length,n=r>t._childrenSizeThreshold,i={type:e.type,url:e.from,accept:function(){n?t._syncReplyForLargeData(e):t._syncReply(e)},reject:function(r){t._bus.postMessage({id:e.id,type:"response",from:e.to,to:e.from,body:{code:401,desc:r}})}},s=[];t.metadata.subscriptions?s=t.metadata.subscriptions:t._subscriptions&&(s=(0,o.default)(t._subscriptions).map(function(e){return t._subscriptions[e].url})),-1!=s.indexOf(e.from)?n?t._syncReplyForLargeData(e):t._syncReply(e):t._onReadHandler&&(L.log("READ-EVENT: ",i),t._onReadHandler(i))}},{key:"_syncReply",value:function(e){var t=this,r=(0,j.deepClone)(t.metadata);r.data=(0,j.deepClone)(t.data),r.childrenObjects=(0,j.deepClone)(t.childrensJSON),r.version=t._version;var n={id:e.id,type:"response",from:e.to,to:e.from,body:{code:200,value:r}};t._bus.postMessage(n)}},{key:"_syncReplyForLargeData",value:function(e){var t=this,r=(0,j.deepClone)(t.metadata);r.data=(0,j.deepClone)(t.data),r.version=t._version,delete r.childrenObjects;var n=void 0,o=[],i={};for(n in t._childrenObjects){var s=void 0;i[n]={};for(s in t._childrenObjects[n])(0,a.default)(i).length>t._childrenSizeThreshold&&(o.push(i),i={},i[n]={}),i[n][s]={},i[n][s].value=t._childrenObjects[n][s].metadata,i[n][s].identity=t._childrenObjects[n][s].identity}o.push(i),r.responses=o.length+1;var u={id:e.id,type:"response",from:e.to,to:e.from,body:{code:100,value:r}};t._bus.postMessage(u),o.forEach(function(e){var n=(0,j.deepClone)(u);n.body.value=e,n.body.value.responses=r.responses,setTimeout(function(){t._bus.postMessage(n)},50)})}},{key:"_onExecute",value:function(e){var t=this;if(!e.body.method)throw e;var r={id:e.id,type:"response",from:e.to,to:e.from,body:{code:200}},n={type:e.type,url:e.from,method:e.body.method,params:e.body.params,accept:function(){t._bus.postMessage(r)},reject:function(r){t._bus.postMessage({id:e.id,type:"response",from:e.to,to:e.from,body:{code:401,desc:r}})}};t._onExecuteHandler&&(L.log("[DataObjectReporter] EXECUTE-EVENT: ",n),t._onExecuteHandler(n))}},{key:"subscriptions",get:function(){return this._subscriptions}},{key:"childrensJSON",get:function(){var e=this,t={},r=void 0;for(r in e._childrenObjects){var n=void 0;t[r]={};for(n in e._childrenObjects[r])t[r][n]={},t[r][n].value=e._childrenObjects[r][n].metadata,t[r][n].identity=e._childrenObjects[r][n].identity}return t}}]),DataObjectReporter}(w.default);t.default=k,e.exports=t.default},function(e,t){!function(){"use strict";function Observer(e,t,r,n,o,i){function deliver(e,n){if(deliver.delay=n,!deliver.pause&&s.changeset.length>0){if(!e){var o=s.changeset.filter(function(e){return!r||r.indexOf(e.type)>=0});o.length>0&&t(o)}s.changeset=[]}}var a,s=this;return deliver.pause=o,deliver.delay=i,s.get=function(e,t){return"__observer__"===t?s:"unobserve"===t?function(){return Object.unobserve(e),e}:"deliver"===t?deliver:e[t]},s.target=e,s.changeset=[],s.target.__observerCallbacks__||(Object.defineProperty(e,"__observerCallbacks__",{enumerable:!1,configurable:!0,writable:!1,value:[]}),Object.defineProperty(e,"__observers__",{enumerable:!1,configurable:!0,writable:!1,value:[]})),s.target.__observerCallbacks__.push(t),s.target.__observers__.push(this),a=new Proxy(e,s),deliver(!1,i),a}Object.observe||"function"!=typeof Proxy||(Observer.prototype.deliver=function(){return this.get(null,"deliver")},Observer.prototype.set=function(e,t,r){var n=e[t],o=void 0===n?"add":"update";if(e[t]=r,e.__observers__.indexOf(this)>=0&&(!this.acceptlist||this.acceptlist.indexOf(o)>=0)){var i={object:e,name:t,type:o},a=0===this.changeset.length,s=this.deliver();"update"===o&&(i.oldValue=n),this.changeset.push(i),a&&s(!1,"number"==typeof s.delay?s.delay:10)}return!0},Observer.prototype.deleteProperty=function(e,t){var r=e[t];if(delete e[t],e.__observers__.indexOf(this)>=0&&!this.acceptlist||this.acceptlist.indexOf("delete")>=0){var n={object:e,name:t,type:"delete",oldValue:r},o=0===this.changeset.length,i=this.deliver();this.changeset.push(n),o&&i(!1,"number"==typeof i.delay?i.delay:10)}return!0},Observer.prototype.defineProperty=function(e,t,r){if(Object.defineProperty(e,t,r),e.__observers__.indexOf(this)>=0&&!this.acceptlist||this.acceptlist.indexOf("reconfigure")>=0){var n={object:e,name:t,type:"reconfigure"},o=0===this.changeset.length,i=this.deliver();this.changeset.push(n),o&&i(!1,"number"==typeof i.delay?i.delay:10)}return!0},Observer.prototype.setPrototypeOf=function(e,t){var r=Object.getPrototypeOf(e);if(Object.setPrototypeOf(e,t),e.__observers__.indexOf(this)>=0&&!this.acceptlist||this.acceptlist.indexOf("setPrototype")>=0){var n={object:e,name:"__proto__",type:"setPrototype",oldValue:r},o=0===this.changeset.length,i=this.deliver();this.changeset.push(n),o&&i(!1,"number"==typeof i.delay?i.delay:10)}return!0},Observer.prototype.preventExtensions=function(e){if(Object.preventExtensions(e),e.__observers__.indexOf(this)>=0&&!this.acceptlist||this.acceptlist.indexOf("preventExtensions")>=0){var t={object:e,type:"preventExtensions"},r=0===this.changeset.length,n=this.deliver();this.changeset.push(t),r&&n(!1,"number"==typeof n.delay?n.delay:10)}return!0},Object.observe=function(e,t,r,n,o,i){return new Observer(e,t,r,n,o,i)},Object.unobserve=function(e,t){if(e.__observerCallbacks__){if(!t)return e.__observerCallbacks__.splice(0,e.__observerCallbacks__.length),void e.__observers__.splice(0,e.__observers__.length);e.__observerCallbacks__.forEach(function(r,n){t===r&&(e.__observerCallbacks__.splice(n,1),delete e.__observers__[n].callback,e.__observers__.splice(n,1))})}},Array.observe=function(e,t,r,n,o,i){if(!(e instanceof Array||Array.isArray(e)))throw new TypeError("First argument to Array.observer is not an Array");r=r||["add","update","delete","splice"];var a=new Proxy(e,{get:function(t,n){return"unobserve"===n?function(e){return e?Object.unobserve(t,e):t.unobserve()}:"splice"===n?function(n,o){if("number"!=typeof n||"number"!=typeof o)throw new TypeError("First two arguments to Array splice are not number, number");var i=this.slice(n,n+o),a=arguments.length>1?arguments.length-2:0,u={object:e,type:"splice",index:n,removed:i,addedCount:a};if(t.splice.apply(t,arguments),r.indexOf("splice")>=0){var n=0===s.__observer__.changeset.length,c=s.__observer__.deliver();s.__observer__.changeset.push(u),n&&c(!1,"number"==typeof c.delay?c.delay:10)}}:"push"===n?function(e){return this.splice(this.length,0,e)}:"pop"===n?function(){return this.splice(this.length-1,1)}:"unshift"===n?function(e){return this.splice(0,0,e)}:"shift"===n?function(){return this.splice(0,1)}:t[n]}}),s=Object.observe(a,function(e){var n=e.filter(function(e){return"length"!==e.name&&"add"!==e.name&&(!r||r.indexOf(e.type)>=0)});n.length>0&&t(n)},r,n,o,i);return s},Array.unobserve=function(e,t){return e.unobserve(t)}),Object.deepObserve=function(e,t,r){function reobserve(e,r){Object.keys(e).forEach(function(o){if(("object"===n(e[o])||"array"===n(e[o]))&&!e[o].hasOwnProperty("__observers__")){var i=r.slice(0);i.push(o),e[o]=Object.deepObserve(e[o],t,i)}})}r=r||[];var n=function(e){return{}.toString.call(e).match(/\s([a-zA-Z]+)/)[1].toLowerCase()};return reobserve(e,r),Object.observe(e,function(e){function recurse(e,t,r,o,i){if(o instanceof Object){Object.keys(o).forEach(function(a){if(!r||r[a]!==o[a]){var s=r&&void 0!==r[a]?r[a]:void 0,u=void 0===s?"add":"update",c=i+"."+a;n.push({name:e,object:t,type:u,oldValue:s,newValue:o[a],keypath:c}),recurse(e,t,s,o[a],c)}})}else if(r instanceof Object){var a=Object.keys(r);a.forEach(function(a){var s=null===o?"update":"delete",u=i+"."+a;n.push({name:e,object:t,type:s,oldValue:r[a],newValue:o,keypath:u}),recurse(e,t,r[a],void 0,u)})}}var n=[];e.forEach(function(e){var t=(r.length>0?r.join(".")+".":"")+e.name;"update"!==e.type&&"add"!==e.type||reobserve(e.object,r),n.push({name:e.name,object:e.object,type:e.type,oldValue:e.oldValue,newValue:e.object[e.name],keypath:t}),recurse(e.name,e.object,e.oldValue,e.object[e.name],t)}),t(n)})}}()},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(17),o=_interopRequireDefault(n),i=r(3),a=_interopRequireDefault(i),s=r(4),u=_interopRequireDefault(s),c=r(156),l=_interopRequireDefault(c),d=function(){function HypertyResourceFactory(){(0,a.default)(this,HypertyResourceFactory)}return(0,u.default)(HypertyResourceFactory,[{key:"createHypertyResource",value:function(e,t,r){var n=void 0;switch(t){case"file":n=new l.default(e,r);break;default:throw new Error("[HypertyResourceFactory.createHypertyResource] not supported type: ",t)}return n}},{key:"createHypertyResourceWithContent",value:function(e,t,r,n){var i=void 0;return new o.default(function(o){switch(t){case"file":i=new l.default(e,n);break;default:reject()}i.init(r).then(function(){return i.save()}).then(function(){o(i)})})}}]),HypertyResourceFactory}();t.default=d,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(17),o=_interopRequireDefault(n),i=r(26),a=_interopRequireDefault(i),s=r(3),u=_interopRequireDefault(s),c=r(4),l=_interopRequireDefault(c),d=r(34),f=_interopRequireDefault(d),p=r(35),y=_interopRequireDefault(p),v=r(36),h=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(v),_=r(157),b=_interopRequireDefault(_),m=(r(39),r(158)),g=_interopRequireDefault(m),R=h.getLogger("FileHypertyResource"),O=function(e){function FileHypertyResource(e,t){(0,u.default)(this,FileHypertyResource);var r=(0,f.default)(this,(FileHypertyResource.__proto__||(0,a.default)(FileHypertyResource)).call(this,e,t));return r.metadata.resourceType="file",r}return(0,y.default)(FileHypertyResource,e),(0,l.default)(FileHypertyResource,[{key:"init",value:function(e){var t=this;if(!e)throw new Error("[FileHypertyResource.constructor] missing mandatory *file* input ");return new o.default(function(r,n){if(t._metadata.name=e.name,t._metadata.lastModified=e.lastModified,t._metadata.size=e.size,t._metadata.mimetype=e.type,R.log("[FileHypertyResource.init] file: ",e),t._isSender){switch(e.type.split("/")[0]){case"image":t._getImagePreview(e).then(function(n){t._metadata.preview=n,t._content=e,r()});break;default:t._content=e,r()}}else t._content=e.content,e.preview&&(t._metadata.preview=e.preview),r()})}},{key:"_getImagePreview",value:function(e){var t=new FileReader;return new o.default(function(r,n){g.default.resize(e,{width:100,height:100},function(e,n){n?(t.readAsDataURL(e),t.onload=function(e){r(e.target.result)}):(R.warn("[FileHypertyResource._getImagePreview] unable to create image preview from original image "),r(void 0))})})}},{key:"toMessage",value:function(){}},{key:"name",get:function(){return this._metadata.name}},{key:"preview",get:function(){return this._metadata.preview}}]),FileHypertyResource}(b.default);t.default=O,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(17),o=_interopRequireDefault(n),i=r(26),a=_interopRequireDefault(i),s=r(3),u=_interopRequireDefault(s),c=r(4),l=_interopRequireDefault(c),d=r(34),f=_interopRequireDefault(d),p=r(116),y=_interopRequireDefault(p),v=r(35),h=_interopRequireDefault(v),_=r(36),b=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(_),m=r(39),g=r(133),R=_interopRequireDefault(g),O=b.getLogger("HypertyResource"),D=function(e){function HypertyResource(e,t){(0,u.default)(this,HypertyResource);var r=(0,f.default)(this,(HypertyResource.__proto__||(0,a.default)(HypertyResource)).call(this,t)),n=r;return n.arraybufferSizeLimit=5242880,n._isSender=e,n._localStorageURL=n._parentObject._syncher._runtimeUrl+"/storage",r}return(0,h.default)(HypertyResource,e),(0,l.default)(HypertyResource,[{key:"save",value:function(){var e=this;return new o.default(function(t,r){var n={from:e._owner,to:e._localStorageURL,type:"create",body:{value:(0,m.deepClone)(e._metadata)}},o=function(n){O.info("[HypertyResource.save] reply: ",n),e._bus.removeResponseListener(e._owner,n.id),200===n.body.code?(n.body.value&&(e._metadata.contentURL||(e._metadata.contentURL=[]),e._metadata.contentURL.push(n.body.value)),t()):r(n.body.code+" "+n.body.desc)};n.body.value.content=e._content,e._bus.postMessage(n,o,!1)})}},{key:"read",value:function(e){var t=this;return O.info("[HypertyResource.read] ",this),new o.default(function(r,n){if(t.content)r(t);else{var o=t._getBestContentURL(t._metadata.contentURL);O.log("Storage:",o);var i={from:t._owner,to:o.url,type:"read",body:{resource:o.url+"/"+o.resource,p2p:!0}};t.metadata.p2pRequester&&t.metadata.p2pHandler&&(i.body.p2pRequester=t.metadata.p2pRequester,i.body.p2pHandler=t.metadata.p2pHandler),t._getBestResource(i,e).then(function(e){O.info("[HypertyResource] - get locally the resource:",e),r(t)}).catch(function(i){O.warn("[HypertyResource] - get locally the resource fail",i);var a={from:t._owner,to:o.remoteURL,type:"read",body:{resource:o.remoteURL+"/"+o.resource,p2p:!0}};t.metadata.p2pRequester&&t.metadata.p2pHandler&&(a.body.p2pRequester=t.metadata.p2pRequester,a.body.p2pHandler=t.metadata.p2pHandler),t._getBestResource(a,e).then(function(e){O.warn("[HypertyResource] - get remotely the resource",e),r(t)}).catch(function(e){O.warn("[HypertyResource] - get remotely the resource fail",e),n(e.body.code+" "+e.body.desc)})})}})}},{key:"_getBestResource",value:function(e,t){var r=this;return new o.default(function(n,o){var i=setTimeout(function(){return r._bus.removeResponseListener(r._owner,s),e.body.code=408,e.body.desc="Response timeout",o(e)},3e3),a=function(e){O.log("[HypertyResource.read] reply: ",e);var a=e.id;switch(clearTimeout(i),e.body.code){case 200:r._content=e.body.value.content,e.body.value.size<r.arraybufferSizeLimit&&r.save(),r._bus.removeResponseListener(r._owner,a),n(e);break;case 183:t(e.body.value);break;default:r._bus.removeResponseListener(r._owner,a),o(e)}},s=r._bus.postMessage(e,a,!1)})}},{key:"delete",value:function(){var e=this;O.info("[HypertyResource.delete]",e.metadata);var t={from:e._owner,to:e._localStorageURL,type:"delete",body:{resources:e.metadata.contentURL}};return new o.default(function(r){e._bus.postMessage(t,function(e){r(e.body.code<300?!0:!1)})})}},{key:"_getBestContentURL",value:function(e){var t=this,r=e[0],n=r.substr(r.lastIndexOf("/")+1);return{url:t._localStorageURL,resource:n,remoteURL:r.substr(0,r.lastIndexOf("/"))}}},{key:"resourceType",get:function(){return this.metadata.resourceType}},{key:"mimetype",get:function(){return this._metadata.type}},{key:"content",get:function(){return this._content}},{key:"contentURL",get:function(){return this._metadata.contentURL}},{key:"shareable",get:function(){var e=this,t=(0,y.default)(HypertyResource.prototype.__proto__||(0,a.default)(HypertyResource.prototype),"metadata",this);return t.resourceType=e.resourceType,t}}]),HypertyResource}(R.default);t.default=D,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(3),o=_interopRequireDefault(n),i=r(4),a=_interopRequireDefault(i),s="undefined"!=typeof Blob&&function(){try{return Boolean(new Blob)}catch(e){return!1}}(),u=s&&"undefined"!=typeof Uint8Array&&function(){try{return 100===new Blob([new Uint8Array(100)]).size}catch(e){return!1}}(),c="undefined"!=typeof HTMLCanvasElement&&HTMLCanvasElement.prototype.toBlob,l=c||"undefined"!=typeof Uint8Array&&"undefined"!=typeof ArrayBuffer&&"undefined"!=typeof atob,d="undefined"!=typeof FileReader||"undefined"!=typeof URL,f=function(){function ImageTools(){(0,o.default)(this,ImageTools)}return(0,a.default)(ImageTools,null,[{key:"resize",value:function(e,t,r){"function"==typeof t&&(r=t,t={width:640,height:480});t.width,t.height;if(!ImageTools.isSupported()||!e.type.match(/image.*/))return r(e,!1),!1;if(e.type.match(/image\/gif/))return r(e,!1),!1;var n=document.createElement("img");return n.onload=function(o){var i=n.width,a=n.height,s=!1;if(i>=a&&i>t.width?(a*=t.width/i,i=t.width,s=!0):a>t.height&&(i*=t.height/a,a=t.height,s=!0),!s)return void r(e,!1);var u=document.createElement("canvas");if(u.width=i,u.height=a,u.getContext("2d").drawImage(n,0,0,i,a),c)u.toBlob(function(e){r(e,!0)},e.type);else{var l=ImageTools._toBlob(u,e.type);r(l,!0)}},ImageTools._loadImage(n,e),!0}},{key:"_toBlob",value:function(e,t){var r=e.toDataURL(t),n=r.split(","),o=void 0;o=n[0].indexOf("base64")>=0?atob(n[1]):decodeURIComponent(n[1]);for(var i=new ArrayBuffer(o.length),a=new Uint8Array(i),c=0;c<o.length;c+=1)a[c]=o.charCodeAt(c);var l=n[0].split(":")[1].split(";")[0],d=null;if(s)d=new Blob([u?a:i],{type:l});else{var f=new BlobBuilder;f.append(i),d=f.getBlob(l)}return d}},{key:"_loadImage",value:function(e,t,r){if("undefined"==typeof URL){var n=new FileReader;n.onload=function(t){e.src=t.target.result,r&&r()},n.readAsDataURL(t)}else e.src=URL.createObjectURL(t),r&&r()}},{key:"isSupported",value:function(){return"undefined"!=typeof HTMLCanvasElement&&l&&d}}]),ImageTools}();t.default=f,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(44),o=_interopRequireDefault(n),i=r(114),a=_interopRequireDefault(i),s=r(17),u=_interopRequireDefault(s),c=r(26),l=_interopRequireDefault(c),d=r(3),f=_interopRequireDefault(d),p=r(4),y=_interopRequireDefault(p),v=r(34),h=_interopRequireDefault(v),_=r(116),b=_interopRequireDefault(_),m=r(35),g=_interopRequireDefault(m),R=r(36),O=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(R),D=r(39),w=r(131),j=_interopRequireDefault(w),L=O.getLogger("DataObjectObserver"),k={ANY:"any",START:"start",EXACT:"exact"},U=function(e){function DataObjectObserver(e){(0,f.default)(this,DataObjectObserver);var t=(0,h.default)(this,(DataObjectObserver.__proto__||(0,l.default)(DataObjectObserver)).call(this,e)),r=t;return r._version=e.version,r._filters={},r._syncObj.observe(function(e){r._onFilter(e)}),r._allocateListeners(),t}return(0,g.default)(DataObjectObserver,e),(0,y.default)(DataObjectObserver,[{key:"sync",value:function(){var e=this;return L.info("[DataObjectObserver_sync] synchronising "),new u.default(function(t,r){e._syncher.read(e._metadata.url).then(function(r){L.info("[DataObjectObserver_sync] value to sync: ",r),(0,a.default)(e.data,(0,D.deepClone)(r.data)),e._version=r.version,e._metadata.lastModified=r.lastModified,r.childrenObjects?(e.resumeChildrens(r.childrenObjects),e._storeChildrens(),t(!0)):t(!0)}).catch(function(e){L.info("[DataObjectObserver_sync] sync failed: ",e),t(!1)})})}},{key:"_storeChildrens",value:function(){var e=this,t={};(0,o.default)(e._childrenObjects).forEach(function(r){var n=e._childrenObjects[r];t[r]={},(0,o.default)(n).forEach(function(e){t[r][e]={},t[r][e].value=n[e].metadata,t[r][e].identity=n[e].identity})});var r={from:e._owner,to:e._syncher._subURL,type:"create",body:{resource:e._url,attribute:"childrenObjects",value:t}};e._bus.postMessage(r)}},{key:"_allocateListeners",value:function(){(0,b.default)(DataObjectObserver.prototype.__proto__||(0,l.default)(DataObjectObserver.prototype),"_allocateListeners",this).call(this);var e=this;e._changeListener=e._bus.addListener(e._url+"/changes",function(t){"update"===t.type&&(L.log("DataObjectObserver-"+e._url+"-RCV: ",t),e._changeObject(e._syncObj,t))})}},{key:"_releaseListeners",value:function(){(0,b.default)(DataObjectObserver.prototype.__proto__||(0,l.default)(DataObjectObserver.prototype),"_releaseListeners",this).call(this),this._changeListener.remove()}},{key:"delete",value:function(){var e=this;e._deleteChildrens().then(function(){e.unsubscribe(),e._releaseListeners(),delete e._syncher._observers[e._url]})}},{key:"unsubscribe",value:function(){var e=this,t={type:"unsubscribe",from:e._owner,to:e._syncher._subURL,body:{resource:e._url}};e._bus.postMessage(t,function(t){L.log("DataObjectObserver-UNSUBSCRIBE: ",t),200===t.body.code&&(e._releaseListeners(),delete e._syncher._observers[e._url])})}},{key:"onChange",value:function(e,t){var r=e,n={type:k.EXACT,callback:t},o=e.indexOf("*");o===e.length-1&&(0===o?n.type=k.ANY:(n.type=k.START,r=e.substr(0,e.length-1))),this._filters[r]=n}},{key:"_onFilter",value:function(e){var t=this;(0,o.default)(t._filters).forEach(function(r){var n=t._filters[r];n.type===k.ANY?n.callback(e):n.type===k.START?0===e.field.indexOf(r)&&n.callback(e):n.type===k.EXACT&&e.field===r&&n.callback(e)})}},{key:"onDisconnected",value:function(e){var t=this;return new u.default(function(r,n){t._subscribeRegistration().then(function(){t._onDisconnected=e,r()}).catch(function(e){return n(e)})})}},{key:"_subscribeRegistration",value:function(){var e=this,t={type:"subscribe",from:this._owner,to:this._syncher._runtimeUrl+"/subscriptions",body:{resources:[this._url+"/registration"]}};return new u.default(function(r,n){e._bus.postMessage(t,function(t){L.log("[DataObjectObserver._subscribeRegistration] "+e._url+" rcved reply ",t),200===t.body.code?(e._generateListener(e._url+"/registration"),r()):(L.error("Error subscribing registration status for ",e._url),n("Error subscribing registration status for "+e._url))})})}},{key:"_generateListener",value:function(e){var t=this;t._bus.addListener(e,function(e){L.log("[DataObjectObserver.registrationNotification] "+t._url+": ",e),e.body.value&&"disconnected"===e.body.value&&t._onDisconnected&&(L.log("[DataObjectObserver] "+t._url+": was disconnected ",e),t._onDisconnected())})}},{key:"execute",value:function(e,t){var r=this,n=this;return new u.default(function(o,i){var a={type:"execute",from:r._owner,to:n._url,body:{method:e,params:t}};n._bus.postMessage(a,function(t){L.log("[DataObjectObserver.execute] "+n._url+" rcved reply ",t),200===t.body.code?o():(L.warn("[DataObjectObserver.execute] execution of method "+e+" was reject by reporter"),i("[DataObjectObserver.execute] execution of method "+e+" was reject by reporter"))})})}}]),DataObjectObserver}(j.default);t.default=U,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(3),o=_interopRequireDefault(n),i=r(4),a=_interopRequireDefault(i),s=r(36),u=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t}(s),c=u.getLogger("DataProvisional"),l=function(){function DataProvisional(e,t,r,n){(0,o.default)(this,DataProvisional);var i=this;i._owner=e,i._url=t,i._bus=r,i._children=n,i._changes=[],i._allocateListeners()}return(0,a.default)(DataProvisional,[{key:"_allocateListeners",value:function(){var e=this;e._listener=e._bus.addListener(e._url,function(t){c.log("DataProvisional-"+e._url+"-RCV: ",t),e._changes.push(t)})}},{key:"_releaseListeners",value:function(){this._listener.remove()}},{key:"apply",value:function(e){this._changes.forEach(function(t){e._changeObject(e._syncObj,t)})}},{key:"children",get:function(){return this._children}}]),DataProvisional}();t.default=l,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(3),o=_interopRequireDefault(n),i=r(4),a=_interopRequireDefault(i),s=r(39),u=function(){function NotificationHandler(e){if((0,o.default)(this,NotificationHandler),!e)throw Error("[NotificationHandler Constructor] bus input is mandatory");this._bus=e,this._onNotificationHandler={}}return(0,a.default)(NotificationHandler,[{key:"onNotification",value:function(e,t){this._onNotificationHandler[e]=t}},{key:"onCreate",value:function(e){var t=this,r=e.body.hasOwnProperty("resource")?e.body.resource:e.from.slice(0,-13),n=(0,s.divideURL)(r),o=n.domain,i=r.split("://")[0],a=function(r){t._bus.postMessage({id:e.id,type:"response",from:e.to,to:e.from,body:{code:400,desc:"Bad Request: "+r}})};e.body.hasOwnProperty("source")||a("Missing source"),e.body.hasOwnProperty("schema")||a("Missing schema"),e.body.hasOwnProperty("value")||a("Missing value"),e.body.hasOwnProperty("identity")||a("Missing identity");var u={type:e.type,from:e.body.source,url:r,domain:o,schema:e.body.schema,value:e.body.value,identity:e.body.identity,to:e.to,via:e.body.via,ack:function(r){var n=200;r&&(n=r),t._bus.postMessage({id:e.id,type:"response",from:e.to,to:e.from,body:{code:n}})},error:function(e){a(e)}};t._onNotificationHandler[i]&&t._onNotificationHandler[i](u)}},{key:"onDelete",value:function(e){var t=this,r=e.body.resource,n=t._observers[r],o={from:t.owner,to:t._subURL,id:e.id,type:"unsubscribe",body:{resource:e.body.resource}};if(t._bus.postMessage(o),delete t._observers[r],n){var i={type:e.type,url:r,identity:e.body.identity,ack:function(r){var o=200;r&&(o=r),200===o&&n.delete(),t._bus.postMessage({id:e.id,type:"response",from:e.to,to:e.from,body:{code:o,source:t._owner}})}};t._onNotificationHandler&&(log.log("NOTIFICATION-EVENT: ",i),t._onNotificationHandler(i))}else t._bus.postMessage({id:e.id,type:"response",from:e.to,to:e.from,body:{code:404,source:t._owner}})}}]),NotificationHandler}();t.default=u,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(26),o=_interopRequireDefault(n),i=r(3),a=_interopRequireDefault(i),s=r(34),u=_interopRequireDefault(s),c=r(4),l=_interopRequireDefault(c),d=r(35),f=_interopRequireDefault(d),p=r(125),y=_interopRequireDefault(p),v=function(e){function DiscoveredObject(e,t,r,n,i){(0,a.default)(this,DiscoveredObject);var s=(0,u.default)(this,(DiscoveredObject.__proto__||(0,o.default)(DiscoveredObject)).call(this,e.hypertyID||e.url,t,r,n));return s._data=e,s._discovery=i,s}return(0,f.default)(DiscoveredObject,e),(0,l.default)(DiscoveredObject,[{key:"data",get:function(){return this._data}}]),(0,l.default)(DiscoveredObject,[{key:"check",value:function(){var e=this,t={body:{}};e._discoveredObjectURL.startsWith("hyperty://")?e._discovery.discoverHypertyPerURL(e._discoveredObjectURL).then(function(r){t.body.status=r.status,e._processNotification(t)}):e._discovery.discoverDataObjectsPerURL(e._discoveredObjectURL).then(function(r){t.body.status=r.status,e._processNotification(t)})}}]),DiscoveredObject}(y.default);t.default=v,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(44),o=_interopRequireDefault(n),i=r(17),a=_interopRequireDefault(i),s=r(3),u=_interopRequireDefault(s),c=r(4),l=_interopRequireDefault(c),d=function(){function Search(e,t){if((0,u.default)(this,Search),!e)throw new Error("The discovery component is a needed parameter");if(!t)throw new Error("The identityManager component is a needed parameter");var r=this;r.discovery=e,r.identityManager=t}return(0,l.default)(Search,[{key:"myIdentity",value:function(){var e=this;return new a.default(function(t,r){e.identityManager.discoverUserRegistered().then(function(e){t(e)}).catch(function(e){r(e)})})}},{key:"hyperties",value:function(e,t,r){arguments.length>3&&void 0!==arguments[3]&&arguments[3]}},{key:"users",value:function(e,t,r,n){var i=arguments.length>4&&void 0!==arguments[4]&&arguments[4];if(!e)throw new Error("You need to provide a list of users");if(!t)throw new Error("You need to provide a list of domains");if(!n)throw new Error("You need to provide a list of resources");if(!r)throw new Error("You need to provide a list of schemes");var s=this;return new a.default(function(u,c){if(0===e.length)u(e);else{var l=[];e.forEach(function(e,o){var a=t[o];i?l.push(s.discovery.discoverHypertiesPerUserProfileData(e,r,n)):l.push(s.discovery.discoverHyperties(e,r,n,a))}),a.default.all(l.map(function(e){return e.then(function(e){return e},function(e){return e})})).then(function(e){var t=e.map(function(e){if(e.hasOwnProperty("hypertyID"))return e;var t=(0,o.default)(e).reduceRight(function(t,r){var n=new Date(e[r].lastModified);return new Date(e[t].lastModified).getTime()<n.getTime()?r:t});return e[t]}),r=t.filter(function(e){return e.hasOwnProperty("hypertyID")});e.forEach(function(e){if("No Hyperty was found"!==e)return u(r)}),c("No Hyperty was found")}).catch(function(t){u(e)})}})}}]),Search}();t.default=d,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(3),o=_interopRequireDefault(n),i=r(165),a=_interopRequireDefault(i),s=function MessageBodyIdentity(e,t,r,n,i,s,u,c){if((0,o.default)(this,MessageBodyIdentity),!s)throw new Error("IDP should be a parameter");if(!e)throw new Error("username should be a parameter");this.idp=s,u&&(this.assertion=u),this.userProfile=new a.default(e,t,r,n,i,c)};t.default=s,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(114),o=_interopRequireDefault(n),i=r(3),a=_interopRequireDefault(i),s=function UserProfile(e,t,r,n,i,s){(0,a.default)(this,UserProfile),e&&(this.preferred_username=e),r&&(this.picture=r),n&&(this.name=n),i&&(this.locale=i),t&&(this.userURL=t),s&&(0,o.default)(this,s)};t.default=s,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(114),o=_interopRequireDefault(n),i=r(17),a=_interopRequireDefault(i),s=r(3),u=_interopRequireDefault(s),c=r(4),l=_interopRequireDefault(c),d=r(167),f=r(139),p=_interopRequireDefault(f),y=r(169),v=function(){function ChatManager(e,t,r,n,o){if((0,u.default)(this,ChatManager),!e)throw new Error("[ChatManager.constructor] The myUrl is a needed parameter");if(!t)throw new Error("[ChatManager.constructor] The MiniBus is a needed parameter");if(!r)throw new Error("[ChatManager.constructor] The configuration is a needed parameter");var i=this;n||(n=o.createSyncher(e,t,r)),i._runtimeURL=r.runtimeURL;var a=o.divideURL(i._runtimeURL).domain,s=o.createDiscovery(e,r.runtimeURL,t),c=o.createIdentityManager(e,r.runtimeURL,t);i._objectDescURL="hyperty-catalogue://catalogue."+a+"/.well-known/dataschema/Communication",i._reportersControllers={},i._observersControllers={},i._myUrl=e,i._bus=t,i._syncher=n,i._domain=a,i.discovery=s,i.identityManager=c,i.currentIdentity,i.search=o.createSearch(s,c),i.communicationObject=d.communicationObject,i.communicationChildren=d.communicationChildren}return(0,l.default)(ChatManager,[{key:"processNotification",value:function(e){var t=this;if("create"===e.type&&t._onInvitation&&t._onInvitation(e),"delete"===e.type){e.ack(200),t._observersControllers[e.url].closeEvent=e,delete t._observersControllers[e.url],t._observersControllers.closeEvent=e,t.communicationObject=d.communicationObject;for(var r in this._reportersControllers)this._reportersControllers[r].close(e);for(var n in this._observersControllers)this._observersControllers[n].close(e)}}},{key:"myIdentity",value:function(e){var t=this;return new a.default(function(r,n){if(e)return r(e);t._myUrl.includes("hyperty://")?t.identityManager.discoverUserRegistered().then(function(e){r(e)}).catch(function(e){n(e)}):t.identityManager.discoverIdentityPerIdP().then(function(e){r(e)}).catch(function(e){n(e)})})}},{key:"create",value:function(e,t){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},n=this,i=n._syncher;return new a.default(function(s,u){n.communicationObject=d.communicationObject,n.communicationObject.cseq=1,n.communicationObject.startingTime=(new Date).toJSON(),n.communicationObject.status=d.CommunicationStatus.OPEN;var c=void 0;n.myIdentity().then(function(l){c=l;var d=new y.UserInfo(n._myUrl,n._domain,l);n.communicationObject.participants[l.userURL]=d;var f=[],v=[],h={};t.forEach(function(e){var t=n.discovery.discoverHypertiesDO(e.user,["comm"],["chat"],e.domain);f.push(t)}),a.default.all(f).then(function(t){var a=[];t.forEach(function(e){e.forEach(function(e){"live"===e.data.status?(a.push(e.data.hypertyID),h[e.data.hypertyID]=e):v.length<5&&v.push(e)})});var s=(0,o.default)({resources:["chat"],mutual:!0},r);return delete s.name,i.create(n._objectDescURL,a,n.communicationObject,!0,!1,e,{},s)}).then(function(e){var t=new p.default(i,n.discovery,n._domain,n.search,c,n);t.dataObjectReporter=e,n._reportersControllers[e.url]=t,e.invitations.length>0&&t.invitationsHandler.processInvitations(h,e),v.length>0&&t.invitationsHandler.inviteDisconnectedHyperties(v,e),s(t)}).catch(function(e){u(e)})}).catch(function(e){return u(e)})})}},{key:"onInvitation",value:function(e){this._onInvitation=e}},{key:"join",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],r=arguments[2],n=this;return new a.default(function(o,i){var a=n._syncher,s=void 0;n.myIdentity(r).then(function(r){return s=r,a.subscribe(n._objectDescURL,e,!0,!1,t,!0,r)}).then(function(e){var t=new p.default(a,n.discovery,n._domain,n.search,s,n);o(t),t.dataObjectObserver=e,n._observersControllers[e.url]=t}).catch(function(e){i(e)})})}}]),ChatManager}();t.default=v,e.exports=t.default},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.CommunicationStatus={OPEN:"open",PENDING:"pending",CLOSED:"closed",PAUSED:"paused",FAILED:"failed"},t.communicationObject={startingTime:"",status:"",participants:{}},t.communicationChildren={parent:"communication",listener:"resources",type:"HypertyResource"}},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=r(44),o=_interopRequireDefault(n),i=r(17),a=_interopRequireDefault(i),s=r(3),u=_interopRequireDefault(s),c=r(4),l=_interopRequireDefault(c),d=function(){function InvitationsHandler(e){if((0,u.default)(this,InvitationsHandler),!e)throw Error("hypertyURL is a necessary dependecy");var t=this;t._hypertyURL=e,t._pending={}}return(0,l.default)(InvitationsHandler,[{key:"inviteDisconnectedHyperties",value:function(e,t){var r=this;e.forEach(function(e){r._pending[t]||(r._pending[t]={}),r._pending[t][e.data.hypertyID]=e,e.onLive(r._hypertyURL,function(){t.inviteObservers([e.data.hypertyID]),e.unsubscribeLive(r._hypertyURL),delete r._pending[t][e.data.hypertyID]})})}},{key:"processInvitations",value:function(e,t){var r=this,n=this,o=t.invitations||[];o.forEach(function(o){o.then(function(e){r._invitationsResponse&&r._invitationsResponse(e)}).catch(function(o){r._invitationsResponse&&r._invitationsResponse(o),n.inviteDisconnectedHyperties([e[o.invited]],t)})})}},{key:"resumeDiscoveries",value:function(e,t){var r=this;return new a.default(function(n,i){var s={},u=[],c=[],l=[];e.resumeDiscoveries().then(function(e){e.forEach(function(e){e.data.resources&&"chat"===e.data.resources[0]&&("live"===e.data.status?(s[e.data.hypertyID]=e,u.push(e.data.hypertyID),l.push(e.unsubscribeLive(r._hypertyURL))):c.push(e))}),c.length>0&&r.inviteDisconnectedHyperties(c,t),(0,o.default)(s).length>0?(t.inviteObservers(u),t.invitations.length>0&&r.processInvitations(s,t),a.default.all(l).then(function(){n()})):n()})}).catch(function(e){reject("[GroupChatManager.InvitationsHandler.resumeDiscoveries] failed | ",e)})}},{key:"cleanInvitations",value:function(e){var t=this,r=t._pending[e];return r?new a.default(function(e,n){var i=(0,o.default)(r),s=[];i.forEach(function(e){s.push(r[e].unsubscribeLive(t._hypertyURL))}),a.default.all(i).then(function(){e()})}):a.default.resolve()}},{key:"invitationResponse",set:function(e){this._invitationsResponse=e}}]),InvitationsHandler}();t.default=d,e.exports=t.default},function(e,t,r){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0}),t.UserInfo=void 0;var n=r(170),o=_interopRequireDefault(n),i=r(3),a=_interopRequireDefault(i),s=r(39);t.UserInfo=function UserInfo(e,t,r){var n;(0,a.default)(this,UserInfo);var i=(0,s.deepClone)(r);return r.hasOwnProperty("userProfile")||(i.userProfile=r),n={hypertyURL:e,domain:t},(0,o.default)(n,"domain",t),(0,o.default)(n,"identity",i),n}},function(e,t,r){"use strict";t.__esModule=!0;var n=r(60),o=function(e){return e&&e.__esModule?e:{default:e}}(n);t.default=function(e,t,r){return t in e?(0,o.default)(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}}])});
},{}],7:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)

},{"process/browser.js":2,"timers":7}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{"./IPv6":8,"./SecondLevelDomains":9,"./punycode":11}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
var methods = { GET: 'get', POST: 'post'
	/**
  * @typedef {Object} Request
  * @desc Bridge to make HTTP requests
  * @property {function(url:string, options:Object):string} get
  * @property {function(url:string, options:Object):string} post
  */

	/**
  * Bridge to make HTTP requests
  */
};
var Request = function () {
	function Request() {
		_classCallCheck(this, Request);

		var _this = this;

		Object.keys(methods).forEach(function (method) {
			_this[methods[method]] = function (url, options) {
				return new Promise(function (resolve, reject) {
					_this._makeLocalRequest(methods[method].toUpperCase(), url, options).then(function (result) {
						resolve(result);
					}).catch(function (reason) {
						reject(reason);
					});
				});
			};
		});
	}

	_createClass(Request, [{
		key: '_makeLocalRequest',
		value: function _makeLocalRequest(method, url, options) {
			var _this = this;

			return new Promise(function (resolve, reject) {
				url = _this._mapProtocol(url);
				var xhr = new XMLHttpRequest();

				xhr.open(method, url, true);

				xhr.onreadystatechange = function (event) {
					var xhr = event.currentTarget;
					if (xhr.readyState === 4) {
						if (xhr.status >= 200 || xhr.status <= 299) {
							resolve(xhr.responseText);
						} else {
							reject(xhr.responseText);
						}
					}
				};

				if (options && options.headers) {
					for (var prop in options.headers) {
						xhr.setRequestHeader(prop, options.headers[prop]);
					}
				}

				xhr.send(options ? options.body : null);
			});
		}
	}, {
		key: '_mapProtocol',
		value: function _mapProtocol(url) {
			var protocolmap = {
				'localhost://': 'https://',
				'undefined://': 'https://',
				'hyperty-catalogue://': 'https://',
				'https://': 'https://',
				'http://': 'http://'
			};

			var foundProtocol = false;
			for (var protocol in protocolmap) {
				if (url.slice(0, protocol.length) === protocol) {
					url = protocolmap[protocol] + url.slice(protocol.length, url.length);
					foundProtocol = true;
					break;
				}
			}

			if (!foundProtocol) {
				throw new Error('Invalid protocol of url: ' + url);
			}

			return url;
		}
	}]);

	return Request;
}();

exports.default = Request;

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// TODO: import and extend the class of the service-framework
// service-framework/dist/RuntimeCapabilities;

var RuntimeCapabilities = function () {
  function RuntimeCapabilities(storageManager) {
    _classCallCheck(this, RuntimeCapabilities);

    if (!storageManager) throw new Error('The Runtime Capabilities need the storageManager');

    this.storageManager = storageManager;
  }

  /**
   * Returns as a promise RuntimeCapabilities json object with all available capabilities of the runtime.
   * If it was not yet persisted in the Storage Manager it collects all required info from the platform and saves in the storage manager.
   * @returns {Promise<object>}
   */


  _createClass(RuntimeCapabilities, [{
    key: 'getRuntimeCapabilities',
    value: function getRuntimeCapabilities() {
      var _this = this;

      return new Promise(function (resolve, reject) {

        Promise.all([_this._getEnvironment(), _this._getMediaDevices()]).then(function (result) {
          var capabilities = {};
          result.forEach(function (capability) {
            _extends(capabilities, capability);
          });

          _this.storageManager.set('capabilities', '1', capabilities);

          resolve(capabilities);
        }).catch(function (error) {
          reject(error);
        });
      });
    }

    /**
     * returns as a promise a boolean according to available capabilities.
     * @returns {Promise<boolean>}
     */

  }, {
    key: 'isAvailable',
    value: function isAvailable(capability) {
      var _this2 = this;

      return new Promise(function (resolve) {

        _this2.storageManager.get('capabilities').then(function (capabilities) {

          console.log('Capability ' + capability + ' is available? ', capabilities.hasOwnProperty(capability) && capabilities[capability]);
          if (capabilities.hasOwnProperty(capability) && capabilities[capability]) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    }

    /**
     * it refreshes previously collected capabilities and updates the storage manager
     */

  }, {
    key: 'update',
    value: function update() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3.getRuntimeCapabilities().then(resolve).catch(reject);
      });
    }

    // TODO: organize the code in separated files

  }, {
    key: '_getEnvironment',
    value: function _getEnvironment() {

      // TODO: this should be more effective and check the environment
      return {
        browser: !!(window && navigator),
        node: !!!(window && navigator)
      };
    }

    // TODO: organize the code in separated files

  }, {
    key: '_getMediaDevices',
    value: function _getMediaDevices() {
      return new Promise(function (resolve) {

        var capability = {};

        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          console.log('enumerateDevices() not supported.');
          resolve(capability);
          return;
        }

        // List cameras and microphones.
        navigator.mediaDevices.enumerateDevices().then(function (devices) {
          devices.forEach(function (device) {
            // console.log('Devices:', device.kind, device.label, device.deviceId);
            if (device.kind === 'audioinput') {
              capability.mic = true;
            }

            if (device.kind === 'videoinput') {
              capability.camera = true;
              capability.windowSandbox = true;
            }
          });
          resolve(capability);
        }).catch(function (err) {
          resolve(capability);
          console.log(err.name + ': ' + err.message);
        });
      });
    }
  }]);

  return RuntimeCapabilities;
}();

exports.default = RuntimeCapabilities;

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Sandboxes = require('./Sandboxes');

var _SandboxApp = require('./SandboxApp');

var _SandboxApp2 = _interopRequireDefault(_SandboxApp);

var _Request = require('./Request');

var _Request2 = _interopRequireDefault(_Request);

var _RuntimeCapabilities = require('./RuntimeCapabilities');

var _RuntimeCapabilities2 = _interopRequireDefault(_RuntimeCapabilities);

var _StorageManager = require('runtime-core/dist/StorageManager');

var _StorageManager2 = _interopRequireDefault(_StorageManager);

var _dexie = require('dexie');

var _dexie2 = _interopRequireDefault(_dexie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import { RuntimeCatalogue } from 'service-framework/dist/RuntimeCatalogue';

/**
 * Is a bridge to isolate the runtime from the specific platform
 * @typedef {Object} RuntimeFactory
 * @property {function():Sandbox} createSandbox Creates a new Sandbox
 * @property {function():SandboxApp} createAppSandbox Creates a new SandboxApp
 * @property {function():Request} createHttpRequest Creates a new Request object
 * @property {function():RuntimeCatalogue} createRuntimeCatalogue Creates a new RuntimeCatalogue
 * @property {function(Encoded data: string):string} atob Returns the string decoded
 * @property {function():PersistenceManager} persistenceManager Returns a new PersistenceManager
 * @property {function():StorageManager} storageManager Returns a new StorageManager
 * @property {function():RuntimeCapabilities} runtimeCapabilities Returns a new RuntimeCapabilities
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
//import PersistenceManager from 'service-framework/dist/PersistenceManager';
exports.default = {
  createSandbox: function createSandbox(constraints) {
    return (0, _Sandboxes.createSandbox)(constraints);
  },
  createAppSandbox: function createAppSandbox() {
    return new _SandboxApp2.default();
  },
  createHttpRequest: function createHttpRequest() {
    var request = new _Request2.default();
    return request;
  },

  /*
    createRuntimeCatalogue() {
      if (!this.catalogue) { this.catalogue = new RuntimeCatalogue(this); }
  
      return this.catalogue;
    },*/

  atob: function (_atob) {
    function atob(_x) {
      return _atob.apply(this, arguments);
    }

    atob.toString = function () {
      return _atob.toString();
    };

    return atob;
  }(function (b64) {
    return atob(b64);
  }),

  /*
    persistenceManager() {
      let localStorage = window.localStorage;
      return new PersistenceManager(localStorage);
    },*/
  storageManager: function storageManager(name, schemas) {

    if (!this.databases) {
      this.databases = {};
    }
    if (!this.storeManager) {
      this.storeManager = {};
    }

    // To make the storage persitent and now allow the system clear the storage when is under pressure;
    if (navigator && navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then(function (persistent) {
        if (persistent) {
          console.log('Storage will not be cleared except by explicit user action');
        } else {
          console.log('Storage may be cleared by the UA under storage pressure.');
        }
      });
    }

    // Using the implementation of Service Framework
    // Dexie is the IndexDB Wrapper
    if (!this.databases.hasOwnProperty(name)) {
      this.databases[name] = new _dexie2.default(name);
    }

    if (!this.storeManager.hasOwnProperty(name)) {
      this.storeManager[name] = new _StorageManager2.default(this.databases[name], name, schemas);
    }

    return this.storeManager[name];
  },
  runtimeCapabilities: function runtimeCapabilities() {

    if (!this.capabilitiesManager) {
      var storageManager = this.storageManager('capabilities');
      this.capabilitiesManager = new _RuntimeCapabilities2.default(storageManager);
    }

    return this.capabilitiesManager;
  }
};

},{"./Request":12,"./RuntimeCapabilities":13,"./SandboxApp":15,"./Sandboxes":16,"dexie":1,"runtime-core/dist/StorageManager":4}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sandbox = require('runtime-core/dist/sandbox');

var _minibus = require('runtime-core/dist/minibus');

var _minibus2 = _interopRequireDefault(_minibus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
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
 * Proxy for the Application context
 * */
var SandboxApp = function (_Sandbox) {
  _inherits(SandboxApp, _Sandbox);

  function SandboxApp() {
    _classCallCheck(this, SandboxApp);

    /**
    * @type {runtime-core/dist/sandbox/SandboxType}
    */
    var _this = _possibleConstructorReturn(this, (SandboxApp.__proto__ || Object.getPrototypeOf(SandboxApp)).call(this));

    _this.type = _sandbox.SandboxType.NORMAL;
    window.addEventListener('message', function (e) {
      if (!this.origin) {
        /**
        * @type {Window}
        */
        this.origin = e.source;
      }

      if (typeof e.data === 'string') {
        return;
      }

      if (e.data.hasOwnProperty('to') && e.data.to.startsWith('core:')) {
        return;
      }

      // this._onMessage(JSON.parse(JSON.stringify(e.data)));
      this._onMessage(e.data);
    }.bind(_this));

    window.addEventListener('error', function (error) {
      console.error('[SANDBOX APP] - Error', error);
      throw error;
    }.bind(_this));

    return _this;
  }

  _createClass(SandboxApp, [{
    key: '_onPostMessage',
    value: function _onPostMessage(msg) {
      this.origin.postMessage(msg, '*');
    }
  }]);

  return SandboxApp;
}(_sandbox.Sandbox);

exports.default = SandboxApp;

},{"runtime-core/dist/minibus":5,"runtime-core/dist/sandbox":6}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SandboxWindow = exports.SandboxWorker = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.createSandbox = createSandbox;

var _sandbox = require('runtime-core/dist/sandbox');

var _minibus = require('runtime-core/dist/minibus');

var _minibus2 = _interopRequireDefault(_minibus);

var _RuntimeFactory = require('./RuntimeFactory');

var _RuntimeFactory2 = _interopRequireDefault(_RuntimeFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
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
 * Proxy for a WebWorker
 * */
var SandboxWorker = exports.SandboxWorker = function (_Sandbox) {
  _inherits(SandboxWorker, _Sandbox);

  _createClass(SandboxWorker, null, [{
    key: 'capabilities',
    value: function capabilities() {
      return _RuntimeFactory2.default.runtimeCapabilities().getRuntimeCapabilities().then(function (capabilities) {
        return _extends(capabilities, { mic: false, camera: false, windowSandbox: false });
      });
    }
  }, {
    key: 'new',
    value: function _new(capabilities) {
      return new SandboxWorker(capabilities, './context-service.js');
    }

    /**
    * @param {string} script - Script that will be loaded in the web worker
    */

  }]);

  function SandboxWorker(capabilities, script) {
    _classCallCheck(this, SandboxWorker);

    /**
    * @type {runtime-core/dist/sandbox/SandboxType}
    */
    var _this = _possibleConstructorReturn(this, (SandboxWorker.__proto__ || Object.getPrototypeOf(SandboxWorker)).call(this, capabilities));

    _this.type = _sandbox.SandboxType.NORMAL;
    if (Worker) {
      _this._worker = new Worker(script);
      _this._worker.addEventListener('message', function (e) {
        this._onMessage(e.data);
      }.bind(_this));

      _this._worker.addEventListener('error', function (error) {
        console.log('[Sandbox Worker] - Error: ', error);
        throw JSON.stringify(error);
      }.bind(_this));

      _this._worker.postMessage('');
    } else {
      throw new Error('Your environment does not support worker \n');
    }
    return _this;
  }

  _createClass(SandboxWorker, [{
    key: '_onPostMessage',
    value: function _onPostMessage(msg) {
      this._worker.postMessage(msg);
    }
  }]);

  return SandboxWorker;
}(_sandbox.Sandbox);

var SandboxWindow = exports.SandboxWindow = function (_Sandbox2) {
  _inherits(SandboxWindow, _Sandbox2);

  _createClass(SandboxWindow, null, [{
    key: 'capabilities',
    value: function capabilities() {
      return _RuntimeFactory2.default.runtimeCapabilities().getRuntimeCapabilities();
    }
  }, {
    key: 'new',
    value: function _new(capabilities) {
      return new SandboxWindow(capabilities);
    }
  }]);

  function SandboxWindow(capabilities) {
    _classCallCheck(this, SandboxWindow);

    var _this2 = _possibleConstructorReturn(this, (SandboxWindow.__proto__ || Object.getPrototypeOf(SandboxWindow)).call(this, capabilities));

    _this2.type = _sandbox.SandboxType.WINDOW;
    _this2.channel = new MessageChannel();

    _this2.channel.port1.onmessage = function (e) {
      this._onMessage(e.data);
    }.bind(_this2);

    parent.postMessage({ to: 'runtime:createSandboxWindow' }, '*', [_this2.channel.port2]);
    return _this2;
  }

  _createClass(SandboxWindow, [{
    key: '_onPostMessage',
    value: function _onPostMessage(msg) {
      this.channel.port1.postMessage(msg);
    }
  }]);

  return SandboxWindow;
}(_sandbox.Sandbox);

function createSandbox(constraints) {
  var sandboxes = [SandboxWorker, SandboxWindow];
  var diff = function diff(a, b) {
    return Object.keys(a).filter(function (x) {
      return a[x] !== b[x];
    });
  };

  return Promise.all(sandboxes.map(function (s) {
    return s.capabilities().then(function (c) {
      return { capabilities: c, sandbox: s };
    });
  })).then(function (sbs) {
    var i = 0;
    while (i < sbs.length) {
      if (diff(constraints, sbs[i].capabilities).length === 0) {
        var capabilities = sbs[i].capabilities;
        var sandbox = sbs[i].sandbox.new(capabilities);
        return sandbox;
      }

      i++;
    }
    throw new Error('None of supported sandboxes match your constraints');
  });
}

},{"./RuntimeFactory":14,"runtime-core/dist/minibus":5,"runtime-core/dist/sandbox":6}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// jshint browser:true, jquery: true

var IdentitiesGUI = function () {
  function IdentitiesGUI(guiURL, idmURL, messageBus) {
    var _this2 = this;

    _classCallCheck(this, IdentitiesGUI);

    console.log('IdentitiesGUI', this);
    //if (!identityModule) throw Error('Identity Module not set!');
    if (!messageBus) throw Error('Message Bus not set!');
    var _this = this;
    _this._guiURL = guiURL;
    _this._idmURL = idmURL;
    _this._messageBus = messageBus;
    _this._alreadyReLogin = false;
    _this._alreadyLogin = false;

    this.callIdentityModuleFunc('deployGUI', {}).then(function (result) {
      return _this2._buildDrawer();
    }).then(function (result) {
      console.log('READY:', result);
    });

    this.isLogged = false;

    var drawerEl = document.querySelector('.mdc-temporary-drawer');
    var MDCTemporaryDrawer = mdc.drawer.MDCTemporaryDrawer;
    var drawer = new MDCTemporaryDrawer(drawerEl);

    this._drawerEl = drawerEl;
    this._drawer = drawer;

    document.querySelector('.settings-btn').addEventListener('click', function () {
      drawer.open = true;
    });

    drawerEl.addEventListener('MDCTemporaryDrawer:open', function () {
      console.log('Received MDCTemporaryDrawer:open');
      _this2._isDrawerOpen = true;
      parent.postMessage({ body: { method: 'showAdminPage' }, to: 'runtime:gui-manager' }, '*');
    });

    drawerEl.addEventListener('MDCTemporaryDrawer:close', function () {
      console.log('Received MDCTemporaryDrawer:close');
      _this2._isDrawerOpen = false;
      parent.postMessage({ body: { method: 'hideAdminPage' }, to: 'runtime:gui-manager' }, '*');
    });
  }

  _createClass(IdentitiesGUI, [{
    key: 'logOut',
    value: function logOut() {
      var _this = this;
      console.log('IdentitiesGUI: logging out');
      return new Promise(function (resolve, reject) {

        console.log('Building drawer');
        _this._buildDrawer();

        resolve('Gui reset');
      });
    }
  }, {
    key: '_buildDrawer',
    value: function _buildDrawer() {
      var _this3 = this;

      var guiURL = this._guiURL;

      this._messageBus.addListener(guiURL, function (msg) {

        var funcName = msg.body.method;

        if (msg.type !== 'response') {

          if (!_this3.isLogged) {

            var clickClose = new MouseEvent('click');
            document.querySelector('.settings-btn').dispatchEvent(clickClose);
          }
        }

        if (funcName === 'openPopup') {

          _this3.openPopup().then(function () {

            var urlreceived = msg.body.params.urlreceived;
            _this3.openPopup(urlreceived).then(function (returnedValue) {
              var value = { type: 'execute', value: returnedValue, code: 200 };
              var replyMsg = { id: msg.id, type: 'response', to: msg.from, from: msg.to, body: value };
              _this3._messageBus.postMessage(replyMsg);
            });
          });

          return;
        }

        var callback = function callback(identityInfo) {

          _this3.isLogged = true;

          _this3._buildMessage(msg, identityInfo);
        };

        _this3.callback = callback;

        _this3._getIdentities(callback, true);
      });

      this._getIdentities();
    }
  }, {
    key: '_buildMessage',
    value: function _buildMessage(msg, identityInfo) {
      var replyMsg = void 0;
      var value = void 0;

      var from = msg ? msg.from : this._guiURL;
      var to = msg ? msg.to : this._idmURL;

      console.log('chosen identity: ', identityInfo);

      switch (identityInfo.type) {
        case 'idp':
          value = { type: 'idp', value: identityInfo.value, code: 200 };
          break;

        case 'identity':
          value = { type: 'identity', value: identityInfo.value, code: 200 };
          break;

        default:
          value = { type: 'error', value: 'Error on identity GUI', code: 400 };
      }

      replyMsg = { id: msg.id, type: 'response', to: from, from: to, body: value };

      this._messageBus.postMessage(replyMsg);
    }
  }, {
    key: '_getIdentities',
    value: function _getIdentities(callback, oPenDrawer) {
      var _this4 = this;

      return this.callIdentityModuleFunc('getIdentitiesToChoose', {}).then(function (resultObject) {
        if (callback) {
          return Promise.all([_this4.showIdps(resultObject.idps, callback), _this4.showDefaultIdentity(resultObject.defaultIdentity), _this4.showIdentities(resultObject, callback, oPenDrawer)]);
        } else {
          return new Promise(function (resolve) {
            resolve();
          });
          //       return Promise.all([this.showIdps(resultObject.idps), this.showDefaultIdentity(resultObject.defaultIdentity), this.showIdentities(resultObject)]);
        }
      });
    }

    // _openDrawer() {

    //   let _this = this;
    //   const guiURL = _this._guiURL;

    //   _this.resultURL  = undefined;

    //   _this._messageBus.addListener(guiURL, msg => {
    //     let identityInfo = msg.body.value;
    //     let funcName = msg.body.method;
    //     let value;
    //     console.log('[IdentitiesGUI] received msg: ', msg);

    //     _this.showIdentitiesGUI(msg.body.value).then((identityInfo) => {

    //       let replyMsg;
    //       console.log('[IdentitiesGUI] identityInfo from GUI: ', identityInfo);

    //       //hide config page with the identity GUI
    //       parent.postMessage({ body: { method: 'hideAdminPage' }, to: 'runtime:gui-manager' }, '*');
    //       $('.admin-page').addClass('hide');

    //       // document.getElementsByTagName('body')[0].style = 'background-color:transparent';
    //       $('.identities-section').addClass('hide');
    //       $('.policies-section').addClass('hide');

    //       switch (identityInfo.type) {
    //         case 'idp':
    //           value = { type: 'idp', value: identityInfo.value, code: 200 };
    //           replyMsg = { id: msg.id, type: 'response', to: msg.from, from: msg.to, body: value };
    //           _this._messageBus.postMessage(replyMsg);
    //           break;

    //         case 'identity':
    //           value = { type: 'identity', value: identityInfo.value, code: 200 };
    //           replyMsg = { id: msg.id, type: 'response', to: msg.from, from: msg.to, body: value };
    //           _this._messageBus.postMessage(replyMsg);
    //           break;

    //         default:
    //           value = { type: 'error', value: 'Error on identity GUI', code: 400 };
    //           replyMsg = { id: msg.id, type: 'response', to: msg.from, from: msg.to, body: value };
    //           _this._messageBus.postMessage(replyMsg);
    //       }
    //     });

    //     if (funcName === 'openPopup') {
    //       let urlreceived = msg.body.params.urlreceived;
    //       _this.openPopup(urlreceived).then((returnedValue) => {
    //         let value = {type: 'execute', value: returnedValue, code: 200};
    //         let replyMsg = {id: msg.id, type: 'response', to: msg.from, from: msg.to, body: value};
    //         _this._messageBus.postMessage(replyMsg);
    //       });
    //       return; // this avoids getting stuck in the identities page
    //     }

    //     // unhide the config page with the identity GUI
    //     // document.getElementsByTagName('body')[0].style = 'background-color:white;';
    //     parent.postMessage({ body: { method: 'showAdminPage' }, to: 'runtime:gui-manager' }, '*');

    //     const clickOpen = new MouseEvent('click');
    //     document.querySelector('.settings-btn').dispatchEvent(clickOpen);

    //     $('.admin-page').removeClass('hide');

    //   });
    // }

  }, {
    key: 'callIdentityModuleFunc',
    value: function callIdentityModuleFunc(methodName, parameters) {
      var _this5 = this;

      var _this = this;

      return new Promise(function (resolve, reject) {
        var message = { type: 'execute', to: _this._idmURL, from: _this._guiURL,
          body: { resource: 'identity', method: methodName, params: parameters } };

        _this5._messageBus.postMessage(message, function (res) {

          if (res.body.code < 299) {
            var result = res.body.value;
            resolve(result);
          } else {
            resolve(res.body);
          }
        });
      });
    }
  }, {
    key: 'openPopup',
    value: function openPopup(urlreceived) {
      var _this6 = this;

      return new Promise(function (resolve, reject) {

        function wait(ms) {
          var start = new Date().getTime();
          var end = start;
          while (end < start + ms) {
            end = new Date().getTime();
          }
        }

        var win = void 0;
        if (!urlreceived) {
          win = window.open('', 'openIDrequest', 'location=1,status=1');
          _this6.win = win;
          resolve();
        } else {
          wait(1000);
          win = _this6.win;
          win.location.href = urlreceived;
        }

        // let win = window.open(urlreceived, 'openIDrequest', 'location=1,status=1,scrollbars=1');
        if (window.cordova) {
          win.addEventListener('loadstart', function (e) {
            var url = e.url;
            var code = /\&code=(.+)$/.exec(url);
            var error = /\&error=(.+)$/.exec(url);

            if (code || error) {
              win.close();
              return resolve(url);
            } else {
              return reject('openPopup error 1 - should not happen');
            }
          });
        } else {

          var pollTimer = setInterval(function () {
            try {
              if (win.closed) {
                clearInterval(pollTimer);

                // return reject('Some error occured when trying to get identity.');
              }

              //            if ((win.document.URL.indexOf('access_token') !== -1 || win.document.URL.indexOf('code') !== -1) && win.document.URL.indexOf(location.origin) !== -1) {
              if (win.document.URL.indexOf(location.origin) !== -1) {
                window.clearInterval(pollTimer);
                var url = win.document.URL;

                resolve(url);
                return win.close();
              }
            } catch (e) {
              //return reject('openPopup error 2 - should not happen');
              // console.log(e);
            }
          }, 500);
        }
      });
    }

    // showIdentitiesGUI(receivedInfo) {
    //   let _this = this;

    //   return new Promise((resolve, reject) => {
    //     console.log('[IdentitiesGUI.showIdentitiesGUI] receivedInfo: ', receivedInfo);

    //     let identityInfo;
    //     let toRemoveID;

    //     let callback = (value) => {
    //       console.log('chosen identity: ', value);

    //       const clickClose = new MouseEvent('click');
    //       document.querySelector('.settings-btn').dispatchEvent(clickClose);

    //       resolve({type: 'identity', value: value});
    //     };

    //     _this._checkReceivedInfo(receivedInfo).then((resultObject) => {
    //       identityInfo = resultObject.identityInfo;
    //       toRemoveID = resultObject.toRemoveID;

    //       $('.policies-section').addClass('hide');
    //       $('.identities-section').removeClass('hide');

    //       _this.showIdps(receivedInfo.idps, callback);

    //       _this.showIdentities(identityInfo.identities, toRemoveID).then((identity) => {
    //         console.log('chosen identity: ', identity);
    //         resolve({type: 'identity', value: identity});
    //       });

    //       let idps = [];
    //       let idpsObjects = identityInfo.idps;

    //       idpsObjects.forEach(function(entry) {
    //         if(entry.type && entry.type == 'idToken') {
    //           idps.push(entry.domain);
    //         }
    //       });

    //       $('#idproviders').html(_this._getList(idps));
    //       $('#idproviders').off();
    //       // $('#idproviders').on('click', (event) => _this.obtainNewIdentity(event, callback, toRemoveID));
    //       //$('.back').on('click', (event) => _this.goHome());
    //       $('.identities-reset').off();
    //       // $('.identities-reset').on('click', (event) => _this._resetIdentities(callback));
    //     });
    //   });
    // }

  }, {
    key: '_checkReceivedInfo',
    value: function _checkReceivedInfo(receivedInfo) {
      var _this = this;
      return new Promise(function (resolve, reject) {

        var identityInfo = void 0;
        var toRemoveID = void 0;

        if (receivedInfo) {
          identityInfo = receivedInfo;
          toRemoveID = false;
          resolve({ identityInfo: identityInfo, toRemoveID: toRemoveID });
        } else {
          toRemoveID = true;
          _this.callIdentityModuleFunc('getIdentitiesToChoose', {}).then(function (result) {
            resolve({ identityInfo: result, toRemoveID: toRemoveID });
          });
        }
      });
    }
  }, {
    key: 'showIdps',
    value: function showIdps(idps) {
      var _this7 = this;

      console.log('[IdentitiesGUI.showIdps] : ', idps);

      var idpsListEl = document.getElementById('idps-list');

      var clickEvent = function clickEvent(event) {
        var el = event.currentTarget;
        var idp = el.getAttribute('data-idp');

        _this7.loginWithIDP(idp).then(function (result) {
          // console.log('value here: ', result.value);
          // result.value = result.value.userURL

          if (_this7.callback) {
            _this7.callback(result);
          }
        });
      };

      idps.forEach(function (key) {

        var linkEl = document.getElementById('link-' + key.domain);

        if (!linkEl) {
          linkEl = document.createElement('a');
          linkEl.setAttribute('id', 'link-' + key.domain);
          linkEl.setAttribute('data-idp', key.domain);
          linkEl.classList = 'mdc-list-item link-' + key.domain;
          linkEl.href = '#';

          var linkElText = document.createTextNode(key.domain);

          var name = key.domain;
          if (name.indexOf('.') !== -1) {
            name = name.substring(0, name.indexOf('.'));
          } else {
            name = 'question';
          }

          var imgEl = document.createElement('img');
          imgEl.classList = 'mdc-list-item__start-detail';
          imgEl.src = './assets/' + name + '.svg';
          imgEl.width = 30;
          imgEl.height = 30;

          imgEl.onerror = function (e) {
            e.srcElement.src = './assets/question.svg';
          };

          linkEl.appendChild(imgEl);
          linkEl.appendChild(linkElText);

          idpsListEl.appendChild(linkEl);
        } else {
          linkEl.removeEventListener('click', clickEvent);
        }

        linkEl.addEventListener('click', clickEvent);
      });
    }
  }, {
    key: 'showDefaultIdentity',
    value: function showDefaultIdentity(identity) {

      if (identity) {

        this.isLogged = true;

        var header = document.querySelector('.mdc-list--avatar-list');

        var itemEl = document.getElementById('item-' + identity.userProfile.userURL);

        if (!itemEl) {

          itemEl = document.createElement('li');
          itemEl.id = 'item-' + identity.userProfile.userURL;
          itemEl.classList = 'mdc-list-item item-' + identity.userProfile.userURL;
          itemEl.setAttribute('data-userURL', identity.userProfile.userURL);

          var profileImage = document.createElement('img');
          profileImage.classList = 'mdc-list-item__start-detail';
          profileImage.width = 56;
          profileImage.height = 56;
          profileImage.alt = identity.userProfile.name;
          profileImage.src = identity.userProfile.picture;
          itemEl.appendChild(profileImage);

          var text1 = document.createElement('span');
          text1.classList = 'name mdc-list-item__text';
          text1.textContent = identity.userProfile.name;

          var text2 = document.createElement('span');
          text2.classList = 'email mdc-list-item__secondary-text';
          text2.textContent = identity.userProfile.email;

          text1.appendChild(text2);
          itemEl.appendChild(text1);
          header.appendChild(itemEl);
        }
      }
    }
  }, {
    key: 'showIdentities',
    value: function showIdentities(iDs, callback) {
      var _this8 = this;

      var oPenDrawer = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;


      return new Promise(function (resolve, reject) {

        console.log('[IdentitiesGUI.showMyIdentities] : ', iDs.identities, iDs.defaultIdentity);

        var identities = iDs.identities;
        var current = iDs.defaultIdentity ? iDs.defaultIdentity.userURL : '';

        var activeIdentities = document.getElementById('active-identities');

        Object.keys(identities).forEach(function (key) {

          var exist = document.getElementById('link-' + key);
          if (exist) {
            return;
          }

          var linkEl = document.createElement('a');
          linkEl.href = '#';
          linkEl.id = 'link-' + key;
          linkEl.classList = 'mdc-list-item';
          linkEl.setAttribute('data-userURL', key);

          if (key === current) {
            linkEl.classList += ' mdc-temporary-drawer--selected';
          }

          linkEl.addEventListener('click', function (event) {

            event.preventDefault();

            var el = event.currentTarget;
            var userURL = el.getAttribute('data-userURL');

            console.log('userURL:', userURL, callback, el);

            if (callback) {
              callback(userURL);
            }
          });

          var profileImage = document.createElement('img');
          profileImage.classList = 'mdc-list-item__start-detail';
          profileImage.width = 40;
          profileImage.height = 40;
          profileImage.alt = identities[key].userProfile.name;
          profileImage.src = identities[key].userProfile.picture;
          profileImage.onerror = function (e) {
            e.srcElement.src = './assets/question.svg';
          };

          var text1 = document.createElement('span');
          text1.classList = 'name mdc-list-item__text';
          text1.textContent = identities[key].userProfile.name;

          var text2 = document.createElement('span');
          text2.classList = 'email mdc-list-item__secondary-text';
          text2.textContent = identities[key].userProfile.email;

          text1.appendChild(text2);

          linkEl.appendChild(profileImage);
          linkEl.appendChild(text1);

          activeIdentities.appendChild(linkEl);
        });

        if (oPenDrawer && !_this8._alreadyReLogin) {
          _this8._drawer.open = true;
        }

        if (oPenDrawer && !_this8._alreadyReLogin && !_this8._alreadyLogin) {
          _this8._alreadyReLogin = true;
          parent.postMessage({ body: { method: 'tokenExpired' }, to: 'runtime:gui-manager' }, '*');
        }

        /*
              if (Object.keys(identities).length === 1) {
        
                if (callback) {
                  callback({type: 'identity', value: current});
                }
        
                return resolve({type: 'identity', value: current});
              }*/

        // let callback = (identity) => {
        //   resolve(identity);
        // };

        // if (!toRemoveID) {
        //   $('.clickable-cell').on('click', (event) => _this.changeID(event, callback));
        // }

        // $('.remove-id').on('click', (event) => _this.removeID(iDs));
      });
    }
  }, {
    key: 'removeID',
    value: function removeID(event, emails) {
      var _this = this;
      var row = event.target.parentNode.parentNode;
      var idToRemove = row.children[0].textContent;
      var domain = row.children[1].textContent;

      _this.callIdentityModuleFunc('unregisterIdentity', { email: idToRemove }).then(function () {
        var numEmails = emails.length;
        for (var i = 0; i < numEmails; i++) {
          if (emails[i].email === idToRemove) {
            emails.splice(i, 1);
            break;
          }
        }

        // -------------------------------------------------------------------------//
        _this.showIdentities(emails, true);
      });

      //_this.identityModule.unregisterIdentity(idToRemove);
    }
  }, {
    key: 'authorise',
    value: function authorise(idp, resource) {
      var _this9 = this;

      return this.openPopup().then(function (res) {
        var data = { scope: resource, idpDomain: idp };
        return _this9.callIdentityModuleFunc('getAccessTokenAuthorisationEndpoint', data);
      }).then(function (value) {
        console.log('[IdentitiesGUI.authorise] receivedURL from idp Proxy: ' + value);

        return _this9.openPopup(value);
      }).then(function (result) {

        console.log('[IdentitiesGUI.authorise.openPopup.result]', result);

        // resource as array


        var data = { resources: [resource], idpDomain: idp, login: result };
        return _this9.callIdentityModuleFunc('getAccessToken', data);
      }).then(function (result) {

        if (result.hasOwnProperty('code') && result.code > 299) {
          console.error('[IdentitiesGUI.authorise.getAccessToken] error', result);
          return result;
        } else {
          console.log('[IdentitiesGUI.authorise.getAccessToken.result]', result);
          return _this9.callIdentityModuleFunc('addAccessToken', result);
        }
      }).then(function (value) {
        _this9._drawer.open = false;
        return value;
      });
    }
  }, {
    key: 'loginWithIDP',
    value: function loginWithIDP(idp) {
      var _this10 = this;

      var _publicKey = void 0;

      return this.openPopup().then(function (result) {
        return _this10.callIdentityModuleFunc('getMyPublicKey', {});
      }).then(function (publicKey) {
        _publicKey = publicKey;
        var data = { contents: publicKey, origin: 'origin', usernameHint: undefined, idpDomain: idp };
        return _this10.callIdentityModuleFunc('sendGenerateMessage', data);
      }).then(function (value) {

        console.log('[IdentitiesGUI.loginWithIDP] received reply to request for Login URL from idp Proxy: ' + value + '...');

        if (value.hasOwnProperty('description') && value.description.hasOwnProperty('loginUrl')) {
          var url = value.description.loginUrl;
          var finalURL = void 0;

          //check if the receivedURL contains the redirect field and replace it
          if (url.indexOf('redirect_uri') !== -1) {
            var firstPart = url.substring(0, url.indexOf('redirect_uri'));
            var secondAuxPart = url.substring(url.indexOf('redirect_uri'), url.length);

            var secondPart = secondAuxPart.substring(secondAuxPart.indexOf('&'), url.length);

            //check if the reddirect field is the last field of the URL
            if (secondPart.indexOf('&') !== -1) {
              finalURL = firstPart + 'redirect_uri=' + location.origin + secondPart;
            } else {
              finalURL = firstPart + 'redirect_uri=' + location.origin;
            }
          }

          _this10.resultURL = finalURL || url;

          console.log('[IdentitiesGUI.openPopup]', _this10.resultURL);
          return _this10.openPopup(_this10.resultURL);
        }
      }).then(function (identity) {

        console.log('[IdentitiesGUI.openPopup.result]', identity);

        var data = { contents: _publicKey, origin: 'origin', usernameHint: identity, idpDomain: idp };
        return _this10.callIdentityModuleFunc('sendGenerateMessage', data);
      }).then(function (result) {

        console.log('[IdentitiesGUI.sendGenerateMessage.result]', result);
        return _this10.callIdentityModuleFunc('addAssertion', result);
      }).then(function (value) {

        _this10._drawer.open = false;
        var userURL = { type: 'identity', value: value.userProfile.userURL };
        // const userIdentity = {type: 'identity', value: value.userProfile};

        console.log('[IdentitiesGUI.loginWithIDP final]', value);
        _this10._alreadyLogin = true;
        return userURL;
        // return userIdentity;
      });
    }

    // obtainNewIdentity(event, callback, toRemoveID) {
    //   let _this = this;
    //   let idProvider = event.target.textContent;
    //   let idProvider2 = event.target.text;

    //   _this.callIdentityModuleFunc('getMyPublicKey', {}).then((publicKey) => {
    //     // let publicKey = btoa(keyPair.public);

    //     _this.callIdentityModuleFunc('sendGenerateMessage',
    //       { contents: publicKey, origin: 'origin', usernameHint: undefined, idpDomain: idProvider, }).then((value) => {
    //       console.log('[IdentitiesGUI.obtainNewIdentity] receivedURL from idp Proxy: ' + value.loginUrl.substring(0, 20) + '...');

    //       let url = value.loginUrl;
    //       let finalURL;

    //       //check if the receivedURL contains the redirect field and replace it
    //       if (url.indexOf('redirect_uri') !== -1) {
    //         let firstPart = url.substring(0, url.indexOf('redirect_uri'));
    //         let secondAuxPart = url.substring(url.indexOf('redirect_uri'), url.length);

    //         let secondPart = secondAuxPart.substring(secondAuxPart.indexOf('&'), url.length);

    //         //check if the reddirect field is the last field of the URL
    //         if (secondPart.indexOf('&') !== -1) {
    //           finalURL = firstPart + 'redirect_uri=' + location.origin + secondPart;
    //         } else {
    //           finalURL = firstPart + 'redirect_uri=' + location.origin;
    //         }
    //       }

    //       _this.resultURL = finalURL || url;

    //       $('.login-idp').html('<p>Chosen IDP: ' + idProvider + '</p>');
    //       $('.login').removeClass('hide');
    //       $('.login-btn').off();
    //       $('.login-btn').on('click', (event) => {
    //         $('.login').addClass('hide');
    //         // _this._authenticateUser(publicKey, value, 'origin', idProvider).then((email) => {
    //         //   callback(email);
    //         //   _this.showIdentitiesGUI();
    //         // });
    //       });
    //     });
    //   }).catch(err => console.log('obtanin new identity', err));

    // }

  }, {
    key: '_getList',
    value: function _getList(items) {
      var list = '';
      var numItems = items.length;

      for (var i = 0; i < numItems; i++) {
        list += '<li class="divider"></li>';
        list += '<li><a class="center-align">' + items[i] + '</a></li>';
      }

      return list;
    }
  }, {
    key: '_authenticateUser',
    value: function _authenticateUser(publicKey, value, origin, idProvider) {
      var _this = this;
      var url = _this.resultURL;

      return new Promise(function (resolve, reject) {

        _this.openPopup(url).then(function (identity) {

          _this.callIdentityModuleFunc('sendGenerateMessage', { contents: publicKey, origin: origin, usernameHint: identity, idpDomain: idProvider }).then(function (result) {

            if (result) {

              //_this.identityModule.storeIdentity(result, keyPair).then((value) => {
              _this.callIdentityModuleFunc('addAssertion', result).then(function (value) {
                resolve(value.userProfile.userURL);
              }, function (err) {
                reject(err);
              });
            } else {
              reject('error on obtaining identity information');
            }
          });
        }, function (err) {
          reject(err);
        });
      });
    }
  }, {
    key: '_resetIdentities',
    value: function _resetIdentities() {
      console.log('_resetIdentities');
    }
  }]);

  return IdentitiesGUI;
}();

exports.default = IdentitiesGUI;

},{}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _PoliciesManager = require('./PoliciesManager');

var _PoliciesManager2 = _interopRequireDefault(_PoliciesManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PoliciesGUI = function () {
  function PoliciesGUI(pepGuiURL, pepURL, messageBus) {
    _classCallCheck(this, PoliciesGUI);

    var _this = this;
    _this.policiesManager = new _PoliciesManager2.default(pepGuiURL, pepURL, messageBus);
    // assume prepareAttributes is called after this
  }

  _createClass(PoliciesGUI, [{
    key: 'prepareAttributes',
    value: function prepareAttributes() {
      var _this = this;
      return new Promise(function (resolve, reject) {
        _this.policiesManager.prepareAttributes().then(function () {
          _this.elements = _this._setElements();
          _this._setListeners();
          resolve();
        });
      });
    }
  }, {
    key: '_addMember',
    value: function _addMember() {
      var _this = this;
      var group = event.target.id;
      $('.member-new-intro').html('<h5>Add a member to a group</h5><p>Insert a user email below to add to the "' + group + '" group.</p>');
      $('.member-new-modal').openModal();
      $('.member-new-ok').off();
      $('.member-new-ok').on('click', function (event) {
        var member = $('#member-new').val();
        $('#member-new').val('');
        _this.policiesManager.addToGroup(group, member).then(function () {
          $('.member-new-modal').closeModal();
          _this._manageGroups();
        });
      });
    }
  }, {
    key: '_createGroup',
    value: function _createGroup() {
      var _this = this;
      $('#group-new-name').val('');
      $('.group-new-modal').openModal();
      $('.group-new-ok').on('click', function (event) {
        var groupName = $('#group-new-name').val();
        _this.policiesManager.createGroup(groupName).then(function () {
          _this._manageGroups();
        });
      });
    }
  }, {
    key: '_addPolicy',
    value: function _addPolicy() {
      var _this = this;
      $('#policy-new-title').val('');
      $('.combining').html('');
      var algorithms = ['Block overrides', 'Allow overrides', 'First applicable'];
      $('.combining').append(this._getOptions('comb-algorithm', 'Choose a combining algorithm', algorithms));
      $('.policy-new').openModal();

      $('.policy-new-ok').off();
      $('.policy-new-ok').on('click', function (event) {
        var policyTitle = $('#policy-new-title').val();
        if (!policyTitle) {
          Materialize.toast('Invalid policy title', 4000);
        } else {
          var combiningAlgorithm = $('#comb-algorithm').val();
          _this.policiesManager.addPolicy(policyTitle, combiningAlgorithm).then(function () {
            $('.help-menu').addClass('hide');
            $('.policy-new').closeModal();
            _this._goHome();
          });
        }
      });
      $('.help-btn').off();
      $('.help-btn').on('click', function (event) {
        $('.help-menu').removeClass('hide');
      });
    }
  }, {
    key: '_decreaseRulePriority',
    value: function _decreaseRulePriority() {
      var _this = this;
      var id = event.target.closest('tr').id;
      var splitId = id.split(':');
      var thisPriority = parseInt(splitId[splitId.length - 1]);
      splitId.pop();
      var policyTitle = splitId.join(':');
      _this.policiesManager.getPolicy(policyTitle).then(function (policy) {
        var lastPriority = policy.getLastPriority();
        if (lastPriority != thisPriority) {
          var newPriority = parseInt(thisPriority + 1);
          _this.policiesManager.decreaseRulePriority(policyTitle, thisPriority, newPriority).then(function () {
            _this._goHome();
          });
        }
      });
    }
  }, {
    key: '_deleteMember',
    value: function _deleteMember() {
      var _this = this;
      var id = event.target.closest('tr').id;
      var splitId = id.split('::');
      var member = splitId[splitId.length - 1];
      splitId.pop();
      var group = splitId.join('::');
      _this.policiesManager.removeFromGroup(group, member).then(function () {
        _this._manageGroups();
      });
    }
  }, {
    key: '_deleteGroup',
    value: function _deleteGroup() {
      var _this = this;
      var groupName = event.target.closest('tr').children[0].id;
      _this.policiesManager.deleteGroup(groupName).then(function () {
        _this._manageGroups();
      });
    }
  }, {
    key: '_deletePolicy',
    value: function _deletePolicy() {
      var _this = this;
      var policyTitle = event.target.closest('tr').id;
      _this.policiesManager.deletePolicy(policyTitle).then(function () {
        _this._goHome();
      });
    }
  }, {
    key: '_deleteRule',
    value: function _deleteRule() {
      var _this = this;
      var id = event.target.closest('tr').id;
      var splitId = id.split(':');
      var priority = splitId[splitId.length - 1];
      splitId.pop();
      var policyTitle = splitId.join(':');
      var rule = _this.policiesManager.getRuleOfPolicy(policyTitle, priority);

      _this.policiesManager.deleteRule(policyTitle, rule).then(function () {
        _this._goHome();
      });
    }
  }, {
    key: '_getActivePolicy',
    value: function _getActivePolicy() {
      var _this = this;
      _this.policiesManager.getActivePolicy().then(function (activeUserPolicy) {
        $('.policy-active').html('');
        _this.policiesManager.getPoliciesTitles().then(function (policies) {
          policies.push('Deactivate all policies');

          $('.policy-active').append(_this._getOptions('policies-list', 'Click to activate a policy', policies, activeUserPolicy));

          $('#policies-list').on('click', function (event) {
            var policyTitle = $('#policies-list').find(":selected")[0].textContent;
            if (policyTitle === 'Deactivate all policies') {
              policyTitle = undefined;
            }
            _this.policiesManager.updateActivePolicy(policyTitle);
          });
        });
      });
    }
  }, {
    key: '_getGroupOptions',
    value: function _getGroupOptions(title, keys, scopes, lists) {
      var list = '<option disabled selected>' + title + '</option>';

      for (var i in keys) {
        list += '<optgroup label=' + keys[i] + '>';
        for (var j in lists[i]) {
          list += '<option id="' + scopes[i] + '">' + lists[i][j] + '</option>';
        }
      }

      return list;
    }
  }, {
    key: '_getInfo',
    value: function _getInfo(variable) {
      var info = void 0;

      switch (variable) {
        case 'Date':
          info = $('.config').find('input').val();
          if (info.indexOf(',') !== -1) {
            //20 July, 2016
            var splitInfo = info.split(' '); //['20', 'July,',' '2016']
            splitInfo[1] = splitInfo[1].substring(0, splitInfo[1].length - 1); //'July'
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            info = splitInfo[0] + '/' + (months.indexOf(splitInfo[1]) + 1) + '/' + splitInfo[2];
          } else {
            // 2016-07-20
            var _splitInfo = info.split('-');
            info = _splitInfo[2] + '/' + _splitInfo[1] + '/' + _splitInfo[0];
          }
          break;
        case 'Group of users':
          info = $('#group').find(":selected").text();
          break;
        case 'Subscription preferences':
          if (info = $("input[name='rule-new-subscription']:checked")[0] !== undefined) {
            info = $("input[name='rule-new-subscription']:checked")[0].id;
          }
          break;
        case 'Weekday':
          info = $('#weekday').find(":selected").text();
          break;
        default:
          info = $('.config').find('input').val();
          break;
      }

      return info;
    }
  }, {
    key: '_getList',
    value: function _getList(items) {
      var list = '';
      var numItems = items.length;

      for (var i = 0; i < numItems; i++) {
        list += '<li class="divider"></li>';
        list += '<li><a class="center-align">' + items[i] + '</a></li>';
      }

      return list;
    }
  }, {
    key: '_getOptions',
    value: function _getOptions(id, title, list, selected) {
      var options = '<select id="' + id + '" class="browser-default"><option disabled selected>' + title + '</option>';
      for (var i in list) {
        if (selected !== undefined & selected === list[i]) {
          options += '<option selected id="' + id + '">' + list[i] + '</option>';
        } else {
          options += '<option id="' + id + '">' + list[i] + '</option>';
        }
      }
      options += '</select>';

      return options;
    }
  }, {
    key: '_getPoliciesTable',
    value: function _getPoliciesTable() {
      var _this = this;

      _this.policiesManager.getFormattedPolicies().then(function (policies) {
        $('.policies-no').addClass('hide');
        $('.policies-current').html('');

        var policiesTitles = [];
        var rulesTitles = [];
        var ids = [];

        for (var i in policies) {
          policiesTitles.push(policies[i].title);
          rulesTitles.push(policies[i].rulesTitles);
          ids.push(policies[i].ids);
        }

        var table = '<table>';
        var isEmpty = policiesTitles.length === 0;

        for (var _i in policiesTitles) {
          table += '<thead><tr id="' + policiesTitles[_i] + '"><td></td><td></td><th class="center-align">' + policiesTitles[_i] + '</th><td><i class="material-icons clickable-cell policy-delete" style="cursor: pointer; vertical-align: middle">delete_forever</i></td></tr></thead><tbody>';

          for (var j in rulesTitles[_i]) {
            table += '<tr id="' + ids[_i][j] + '" ><td><i class="material-icons clickable-cell rule-priority-increase" style="cursor: pointer; vertical-align: middle">arrow_upward</i></td><td><i class="material-icons clickable-cell rule-priority-decrease" style="cursor: pointer; vertical-align: middle">arrow_downward</i></td><td class="rule-show clickable-cell" style="cursor: pointer">' + rulesTitles[_i][j] + '</td><td><i class="material-icons clickable-cell rule-delete" style="cursor: pointer; vertical-align: middle">clear</i></td></tr>';
          }
          table += '<tr id="' + policiesTitles[_i] + '"></td><td></td><td></td><td style="text-align:center"><i class="material-icons clickable-cell center-align rule-add" style="cursor: pointer">add_circle</i></td></tr>';
        }
        if (!isEmpty) {
          table += '</tbody></table>';
          $('.policies-current').append(table);
        } else {
          $('.policies-no').removeClass('hide');
        }
        $('.rule-add').on('click', function (event) {
          _this._showVariablesTypes();
        });
        $('.rule-delete').on('click', function (event) {
          _this._deleteRule();
        });
        $('.rule-show').on('click', function (event) {
          _this._showRule();
        });
        $('.rule-priority-increase').on('click', function (event) {
          _this._increaseRulePriority();
        });
        $('.rule-priority-decrease').on('click', function (event) {
          _this._decreaseRulePriority();
        });
        $('.policy-add').off();
        $('.policy-add').on('click', function (event) {
          _this._addPolicy();
        });
        $('.policy-delete').on('click', function (event) {
          _this._deletePolicy();
        });
      });
    }
  }, {
    key: '_goHome',
    value: function _goHome() {
      this._getActivePolicy();
      this._getPoliciesTable();
    }
  }, {
    key: '_increaseRulePriority',
    value: function _increaseRulePriority() {
      var _this = this;
      var id = event.target.closest('tr').id;
      var splitId = id.split(':');
      var thisPriority = parseInt(splitId[splitId.length - 1]);
      if (thisPriority !== 0) {
        splitId.pop();
        var policyTitle = splitId.join(':');
        var newPriority = thisPriority - 1;

        _this.policiesManager.increaseRulePriority(policyTitle, thisPriority, newPriority).then(function () {
          _this._goHome();
        });
      }
    }
  }, {
    key: '_manageGroups',
    value: function _manageGroups() {
      var _this = this;
      _this.policiesManager.getGroups().then(function (groupsPE) {
        $('.groups-current').html('');
        var groups = groupsPE.groupsNames;
        var members = groupsPE.members;
        var ids = groupsPE.ids;

        var table = '<table>';
        var isEmpty = groups.length === 0;

        for (var i in groups) {
          table += '<thead><tr><th id="' + groups[i] + '">' + groups[i] + '</th><td style="text-align:right"><i class="material-icons clickable-cell group-delete" style="cursor: pointer; vertical-align: middle">delete_forever</i></td></tr></thead><tbody>';
          for (var j in members[i]) {
            table += '<tr id="' + ids[i][j] + '" ><td style="cursor: pointer">' + members[i][j] + '</td><td style="text-align:right"><i class="material-icons clickable-cell member-delete" style="cursor: pointer; vertical-align: middle">clear</i></td></tr>';
          }

          table += '<tr id="' + groups[i] + '"><td><i class="material-icons clickable-cell member-add" id="' + groups[i] + '" style="cursor: pointer">add_circle</i></td></tr>';
        }

        if (!isEmpty) {
          table += '</tbody></table>';
          $('.groups-current').append(table);
        } else {
          $('.groups-current').append('<p>There are no groups set.</p>');
        }

        $('.member-add').off();
        $('.member-add').on('click', function (event) {
          _this._addMember();
        });
        $('.member-delete').on('click', function (event) {
          _this._deleteMember();
        });
        $('.group-add').off();
        $('.group-add').on('click', function (event) {
          _this._createGroup();
        });
        $('.group-delete').on('click', function (event) {
          _this._deleteGroup();
        });
      });
    }
  }, {
    key: '_parseFileContent',
    value: function _parseFileContent(content) {
      var parsedContent = JSON.parse(content);
      for (var i in parsedContent) {
        this.policiesManager.addPolicy(i, undefined, parsedContent[i]);
      }
      $('.policy-new').closeModal();
    }
  }, {
    key: '_setElements',
    value: function _setElements() {
      var _this2 = this;

      return {
        date: function date(params) {
          return '<input type="date" class="datepicker">';
        },
        select: function select(params) {
          return _this2._getOptions(params[0], params[1], params[2]);
        },
        form: function form(params) {
          return '<form><input type="text" placeholder="' + params + '"></input></form>';
        }
      };
    }
  }, {
    key: '_showNewConfigurationPanel',
    value: function _showNewConfigurationPanel(policyTitle) {
      var _this3 = this;

      var variable = event.target.text;
      $('.variable').html(this._getNewConfiguration(policyTitle, variable));
      $('.scopes').empty().html('');

      var keys = ['Email', 'Hyperty', 'All'];
      var scopes = ['identity', 'hyperty', 'global'];
      var lists = [];

      this.policiesManager.getMyEmails().then(function (emails) {
        lists.push(emails);
        _this3.policiesManager.getMyHyperties().then(function (hyperties) {
          lists.push(hyperties);
          lists.push(['All identities and hyperties']);
          $('.scopes').append(_this3._getGroupOptions('Apply this configuration to:', keys, scopes, lists));
          $('.variable').removeClass('hide');
        });
      });
    }
  }, {
    key: '_showVariablesTypes',
    value: function _showVariablesTypes(event) {
      var _this4 = this;

      var policyTitle = event.target.closest('tr').id;

      $('#variables-types').empty().html('');
      var variables = this.policiesManager.getVariables();
      $('#variables-types').append(this._getList(variables));
      $('.variable').addClass('hide');
      $('.rule-new').openModal();
      $('#variables-types').off();
      $('#variables-types').on('click', function (event) {
        _this4._showNewConfigurationPanel(policyTitle);
      });
    }
  }, {
    key: '_getNewConfiguration',
    value: function _getNewConfiguration(policyTitle, variable) {
      var _this = this;
      var info = _this.policiesManager.getVariableInfo(variable);
      $('.rule-new-title').html(info.title);
      $('.description').html(info.description);
      $('.config').html('');

      if (variable === 'Subscription preferences') {
        $('.subscription-type').removeClass('hide');
      } else {
        (function () {
          $('.subscription-type').addClass('hide');
          var tags = info.input;

          var _loop = function _loop(i) {
            _this.policiesManager.getGroupsNames().then(function (groupsNames) {
              if (variable === 'Group of users') {
                tags[i][1].push(groupsNames);
              }
              $('.config').append(_this.elements[tags[i][0]](tags[i][1]));
              if (variable === 'Group of users') {
                tags[i][1].pop();
              }
            });
          };

          for (var i in tags) {
            _loop(i);
          }
          if (variable === 'date') {
            $('.datepicker').pickadate({
              selectMonths: true,
              selectYears: 15
            });
          }
        })();
      }
      document.getElementById('allow').checked = false;
      document.getElementById('block').checked = false;
      $('.ok-btn').off();
      $('.ok-btn').on('click', function (event) {
        if ($("input[name='rule-new-decision']:checked")[0] !== undefined) {
          var _info = _this._getInfo(variable);
          var decision = $("input[name='rule-new-decision']:checked")[0].id;
          decision = decision === 'allow';
          var scope = $('.scopes').find(":selected")[0].id;
          var target = $('.scopes').find(":selected")[0].textContent;
          target = target === 'All identities and hyperties' ? 'global' : target;
          _this.policiesManager.setInfo(variable, policyTitle, _info, decision, scope, target).then(function () {
            $('.rule-new').closeModal();
            _this._goHome();
          });
        } else {
          throw Error('INFORMATION MISSING: please specify an authorisation decision.');
        }
      });
    }
  }, {
    key: '_deleteInfo',
    value: function _deleteInfo(resourceType) {
      var id = event.target.closest('tr').id;
      var splitId = id.split(':');
      var scope = splitId[0];
      splitId.shift();
      var target = splitId.join('');
      var condition = event.target.closest('tr').children[0].id;
      this.policiesManager.deleteInfo(resourceType, scope, target, condition);
      this._goHome();
    }
  }, {
    key: '_setListeners',
    value: function _setListeners() {
      var _this5 = this;

      $('.settings-btn').on('click', function (event) {
        parent.postMessage({ body: { method: 'showAdminPage' }, to: 'runtime:gui-manager' }, '*');
        $('.admin-page').removeClass('hide');
        // document.getElementsByTagName('body')[0].style = 'background-color:white;';
      });

      $('.policies-page-show').on('click', function (event) {
        $('.policies-section').removeClass('hide');
        $('.identities-section').addClass('hide');
        _this5._goHome();
        _this5._manageGroups();
      });

      $('.admin-page-exit').on('click', function (event) {
        parent.postMessage({ body: { method: 'hideAdminPage' }, to: 'runtime:gui-manager' }, '*');
        $('.admin-page').addClass('hide');
        // document.getElementsByTagName('body')[0].style = 'background-color:transparent;';
      });

      $('.exit-btn').on('click', function (event) {
        $('.subscription-type').addClass('hide');
        $('.help-menu').addClass('hide');
      });

      $('#policy-file').on('change', function (event) {
        var file = event.target.files[0];
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (event) {
          _this5._parseFileContent(event.target.result);
          _this5._goHome();
        };
        reader.onerror = function (event) {
          throw Error("Error reading the file");
        };
      });
    }
  }, {
    key: '_showRule',
    value: function _showRule(event) {
      var _this6 = this;

      var ruleTitle = event.target.textContent;
      var id = event.target.closest('tr').id;
      var splitId = id.split(':');
      var priority = splitId[splitId.length - 1];
      splitId.pop();
      var policyTitle = splitId.join(':');
      this.policiesManager.getRuleOfPolicy(policyTitle, priority).then(function (rule) {
        if (rule.condition.attribute === 'subscription' && rule.condition.params === 'preauthorised') {
          $('.authorise-btns').addClass('hide');
        } else {
          var element = void 0;
          if (rule.decision) {
            element = document.getElementById('btn-allow');
          } else {
            element = document.getElementById('btn-block');
          }
          element.checked = true;
          $('.authorise-btns').removeClass('hide');
        }
        $('.member-add').addClass('hide');
        $('.member-new-btn').addClass('hide');

        $('.rule-details').openModal();
        $('.rule-title').html('<h5><b>' + ruleTitle + '</b></h5>');
        if (rule.condition.attribute === 'subscription') {
          $('.subscription-type').removeClass('hide');
        }
        $('.subscription-decision').on('click', function (event) {
          _this6._updateRule('subscription', policyTitle, rule);
        });
        $('.decision').off();
        $('.decision').on('click', function (event) {
          _this6._updateRule('authorisation', policyTitle, rule);
        });
      });
    }
  }, {
    key: '_updateRule',
    value: function _updateRule(type, policyTitle, rule) {
      var _this = this;
      var title = $('.rule-title').text();
      var splitTitle = title.split(' ');
      var index = splitTitle.indexOf('is');
      if (index === -1) {
        index = splitTitle.indexOf('are');
      }
      switch (type) {
        case 'authorisation':
          var newDecision = $("input[name='rule-update-decision']:checked")[0].id;

          if (newDecision === 'btn-allow') {
            splitTitle[index + 1] = 'allowed';
            newDecision = true;
          } else {
            splitTitle[index + 1] = 'blocked';
            newDecision = false;
          }
          title = splitTitle.join(' ');
          $('.rule-title').html('<h5><b>' + title + '</b></h5>');
          _this.policiesManager.updatePolicy(policyTitle, rule, newDecision).then(function () {
            _this._goHome();
          });
          break;
        case 'subscription':
          var newSubscriptionType = event.target.labels[0].textContent;

          var decision = splitTitle[index + 1];
          splitTitle = title.split('hyperties are');
          if (newSubscriptionType === 'All subscribers') {
            $('.authorise-btns').removeClass('hide');
            newDecision = rule.decision;
            newSubscriptionType = '*';
            title = 'Subscriptions from all hyperties are' + splitTitle[1];
          } else {
            $('.authorise-btns').addClass('hide');
            newDecision = true;
            newSubscriptionType = 'preauthorised';
            title = 'Subscriptions from previously authorised hyperties are' + splitTitle[1];
          }

          $('.rule-title').html('<h5><b>' + title + '</b></h5>');
          _this.policiesManager.updatePolicy(policyTitle, rule, newDecision, newSubscriptionType).then(function () {
            _this._goHome();
          });
          break;
      }
    }
  }]);

  return PoliciesGUI;
}();

exports.default = PoliciesGUI;

},{"./PoliciesManager":19}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PoliciesManager = function () {
  function PoliciesManager(pepGuiURL, pepURL, messageBus) {
    _classCallCheck(this, PoliciesManager);

    var _this = this;
    _this._guiURL = pepGuiURL;
    _this._pepURL = pepURL;
    _this._messageBus = messageBus;

    // assume prepare attributes is called after this
  }

  _createClass(PoliciesManager, [{
    key: 'callPolicyEngineFunc',
    value: function callPolicyEngineFunc(methodName, parameters) {
      var _this = this;
      var message = void 0;

      return new Promise(function (resolve, reject) {
        message = { type: 'execute', to: _this._pepURL, from: _this._guiURL,
          body: { resource: 'policy', method: methodName, params: parameters } };
        _this._messageBus.postMessage(message, function (res) {
          var result = res.body.value;
          resolve(result);
        });
      });
    }
  }, {
    key: 'prepareAttributes',
    value: function prepareAttributes() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var _this = _this2;
        _this.callPolicyEngineFunc('userPolicies', {}).then(function (userPolicies) {
          _this.policies = userPolicies;
          _this.variables = _this.setVariables();
          _this.addition = _this.setAdditionMethods();
          _this.validation = _this.setValidationMethods();
          resolve();
        });
      });
    }
  }, {
    key: 'addToGroup',
    value: function addToGroup(groupName, user) {
      return this.callPolicyEngineFunc('addToGroup', { groupName: groupName, userEmail: user });
    }
  }, {
    key: 'createGroup',
    value: function createGroup(groupName) {
      return this.callPolicyEngineFunc('createGroup', { groupName: groupName });
    }
  }, {
    key: 'addPolicy',
    value: function addPolicy(title, combiningAlgorithm, policy) {
      if (policy === undefined) {
        switch (combiningAlgorithm) {
          case 'Block overrides':
            combiningAlgorithm = 'blockOverrides';
            break;
          case 'Allow overrides':
            combiningAlgorithm = 'allowOverrides';
            break;
          case 'First applicable':
            combiningAlgorithm = 'firstApplicable';
            break;
          default:
            combiningAlgorithm = undefined;
        }
      }

      return this.callPolicyEngineFunc('addPolicy', { source: 'USER', key: title, policy: policy, combiningAlgorithm: combiningAlgorithm });
    }
  }, {
    key: 'decreaseRulePriority',
    value: function decreaseRulePriority(policyTitle, thisPriority, newPriority) {
      this.getRuleOfPolicy(policyTitle, newPriority).priority = thisPriority;
      this.getRuleOfPolicy(policyTitle, thisPriority).priority = newPriority;
      return this.callPolicyEngineFunc('savePolicies', { source: 'USER' });
    }
  }, {
    key: 'deleteGroup',
    value: function deleteGroup(groupName) {
      return this.callPolicyEngineFunc('deleteGroup', { groupName: groupName });
    }
  }, {
    key: 'deletePolicy',
    value: function deletePolicy(title) {
      return this.callPolicyEngineFunc('removePolicy', { source: 'USER', key: title });
    }
  }, {
    key: 'deleteRule',
    value: function deleteRule(policyTitle, rule) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.callPolicyEngineFunc('userPolicies', {}).then(function (userPolicies) {
          userPolicies[policyTitle].deleteRule(rule);
          _this.callPolicyEngineFunc('savePolicies', { source: 'USER' }).then(function () {
            resolve();
          });
        });
      });
    }
  }, {
    key: 'getActivePolicy',
    value: function getActivePolicy() {
      return this.callPolicyEngineFunc('activeUserPolicy', {});
    }
  }, {
    key: 'getPolicy',
    value: function getPolicy(key) {
      return this.callPolicyEngineFunc('userPolicy', { key: key });
    }
  }, {
    key: 'getPoliciesTitles',
    value: function getPoliciesTitles() {
      var _this = this;
      return new Promise(function (resolve, reject) {
        _this.callPolicyEngineFunc('userPolicies', {}).then(function (policies) {
          var titles = [];

          for (var i in policies) {
            titles.push(i);
          }

          resolve(titles);
        });
      });
    }
  }, {
    key: 'getTargets',
    value: function getTargets(scope) {
      var targets = [];

      for (var i in this.policies[scope]) {
        if (targets.indexOf(i) === -1) {
          targets.push(i);
        }
      }

      return targets;
    }
  }, {
    key: 'increaseRulePriority',
    value: function increaseRulePriority(policyTitle, thisPriority, newPriority) {
      var _this = this;
      _this.getRuleOfPolicy(policyTitle, thisPriority).priority = newPriority;
      _this.getRuleOfPolicy(policyTitle, newPriority).priority = thisPriority;
      return _this.callPolicyEngineFunc('savePolicies', { source: 'USER' });
    }
  }, {
    key: 'setVariables',
    value: function setVariables() {
      return {
        'Date': {
          title: '<br><h5>Updating date related configurations</h5><p>Incoming communications in the introduced date will be allowed or blocked according to your configurations, which can be changed in the preferences page.</p><br>',
          description: '<p>Date:</p>',
          input: [['date', []]]
        },
        'Domain': {
          title: '<br><h5>Updating domain configurations</h5><p>Incoming communications from a user whose identity is from the introduced domain allowed or blocked according to your configurations, which can be changed in the preferences page.</p><br>',
          description: '<p>Domain:</p>',
          input: [['form', []]]
        },
        'Group of users': {
          title: '<br><h5>Updating groups configurations</h5><p>Incoming communications from a user whose identity is in the introduced group will be allowed or blocked according to your configurations, which can be changed in the preferences page.</p><br>',
          description: '<p>Group name:</p>',
          input: [['select', ['group', 'Select a group:']]]
        },
        'Subscription preferences': {
          title: '<br><h5>Updating subscriptions configurations</h5><p>The acceptance of subscriptions to your hyperties will be allowed or blocked according to your configurations, which can be changed in the preferences page.</p><br>',
          input: []
        },
        'Time of the day': {
          title: '<br><h5>Updating time configurations</h5><p>Incoming communications in the introduced timeslot will be blocked, but this can be changed in the preferences page.</p><p>Please introduce a new timeslot in the following format:</p><p class="center-align">&lt;START-HOUR&gt;:&lt;START-MINUTES&gt; to &lt;END-HOUR&gt;:&lt;END-MINUTES&gt;</p><br>',
          description: '<p>Timeslot:</p>',
          input: [['form', []]]
        },
        Weekday: {
          title: '<br><h5>Updating weekday configurations</h5><p>Incoming communications in the introduced weekday will be allowed or blocked according to your configurations, which can be changed in the preferences page.</p><br>',
          description: '<p>Weekday:</p>',
          input: [['select', ['weekday', 'Select a weekday:', ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']]]]
        }
      };
    }
  }, {
    key: 'setAdditionMethods',
    value: function setAdditionMethods() {
      var _this = this;
      return {
        Date: function Date(params) {
          return new Promise(function (resolve, reject) {
            var policyTitle = params[0];
            _this.callPolicyEngineFunc('userPolicies', {}).then(function (userPolicies) {
              userPolicies[policyTitle].createRule(params[4], { attribute: 'date', operator: 'equals', params: params[3] }, params[1], params[2]);
              _this.callPolicyEngineFunc('savePolicies', { source: 'USER' }).then(function () {
                resolve();
              });
            });
          });
        },
        Domain: function Domain(params) {
          return new Promise(function (resolve, reject) {
            var policyTitle = params[0];
            _this.callPolicyEngineFunc('userPolicies', {}).then(function (userPolicies) {
              userPolicies[policyTitle].createRule(params[4], { attribute: 'domain', operator: 'equals', params: params[3] }, params[1], params[2]);
              _this.callPolicyEngineFunc('savePolicies', { source: 'USER' }).then(function () {
                resolve();
              });
            });
          });
        },
        'Group of users': function GroupOfUsers(params) {
          return new Promise(function (resolve, reject) {
            var policyTitle = params[0];
            _this.callPolicyEngineFunc('userPolicies', {}).then(function (userPolicies) {
              userPolicies[policyTitle].createRule(params[4], { attribute: 'source', operator: 'in', params: params[3] }, params[1], params[2]);
              _this.callPolicyEngineFunc('savePolicies', { source: 'USER' }).then(function () {
                resolve();
              });
            });
          });
        },
        'Subscription preferences': function SubscriptionPreferences(params) {
          return new Promise(function (resolve, reject) {
            var policyTitle = params[0];
            _this.callPolicyEngineFunc('userPolicies', {}).then(function (userPolicies) {
              var operator = 'equals';
              if (params[3] === 'preauthorised') {
                operator = 'in';
              }

              // TIAGO: this is giving me an error...
              userPolicies[policyTitle].createRule(params[4], { attribute: 'subscription', operator: operator, params: params[3] }, params[1], params[2]);
              _this.callPolicyEngineFunc('savePolicies', { source: 'USER' }).then(function () {
                resolve();
              });
            });
          });
        },
        'Time of the day': function TimeOfTheDay(params) {
          return new Promise(function (resolve, reject) {
            var policyTitle = params[0];
            _this.callPolicyEngineFunc('userPolicies', {}).then(function (userPolicies) {
              params[3] = params[3].split(' to ');
              var start = params[3][0].split(':');
              start = start.join('');
              var end = params[3][1].split(':');
              end = end.join('');
              userPolicies[policyTitle].createRule(params[4], { attribute: 'time', operator: 'between', params: [start, end] }, params[1], params[2]);
              _this.callPolicyEngineFunc('savePolicies', { source: 'USER' }).then(function () {
                resolve();
              });
            });
          });
        },

        Weekday: function Weekday(params) {
          return new Promise(function (resolve, reject) {
            var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            params[3] = weekdays.indexOf(params[3]);
            var policyTitle = params[0];
            _this.callPolicyEngineFunc('userPolicies', {}).then(function (userPolicies) {
              userPolicies[policyTitle].createRule(params[4], { attribute: 'weekday', operator: 'equals', params: params[3] }, params[1], params[2]);
              _this.callPolicyEngineFunc('savePolicies', { source: 'USER' }).then(function () {
                resolve();
              });
            });
          });
        }
      };
    }
  }, {
    key: 'setValidationMethods',
    value: function setValidationMethods() {
      var _this3 = this;

      return {
        Date: function Date(scope, info) {
          return _this3.isValidDate(info) & _this3.isValidScope(scope);
        },
        'Group of users': function GroupOfUsers(scope, info) {
          return _this3.isValidString(info) & _this3.isValidScope(scope);
        },
        Domain: function Domain(scope, info) {
          return _this3.isValidDomain(info) & _this3.isValidScope(scope);
        },
        Weekday: function Weekday(scope, info) {
          return true & _this3.isValidScope(scope);
        },
        'Subscription preferences': function SubscriptionPreferences(scope, info) {
          return _this3.isValidSubscriptionType(info) & _this3.isValidScope(scope);
        },
        'Time of the day': function TimeOfTheDay(scope, info) {
          return _this3.isValidTimeslot(info) & _this3.isValidScope(scope);
        }
      };
    }
  }, {
    key: 'updateActivePolicy',
    value: function updateActivePolicy(title) {
      var _this = this;
      return new Promise(function (resolve, reject) {
        _this.callPolicyEngineFunc('activeUserPolicy', { userPolicy: title }).then(function () {
          _this.callPolicyEngineFunc('saveActivePolicy', {}).then(function () {
            resolve();
          });
        });
      });
    }
  }, {
    key: 'isValidEmail',
    value: function isValidEmail(info) {
      var pattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;
      return pattern.test(info);
    }
  }, {
    key: 'isValidDomain',
    value: function isValidDomain(info) {
      var pattern = /[a-z0-9.-]+\.[a-z]{2,3}$/;
      return pattern.test(info);
    }
  }, {
    key: 'isValidString',
    value: function isValidString(info) {
      var pattern = /[a-z0-9.-]$/;
      return pattern.test(info);
    }
  }, {
    key: 'isValidSubscriptionType',
    value: function isValidSubscriptionType(info) {
      return true;
    }
  }, {
    key: 'isValidDate',
    value: function isValidDate(info) {
      var infoSplit = info.split('/');
      var day = parseInt(infoSplit[0]);
      var month = parseInt(infoSplit[1]);
      var year = parseInt(infoSplit[2]);

      var date = new Date(year, month - 1, day);
      var isValidFormat = date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;
      var formattedDate = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
      var now = new Date();
      var today = now.getDate() + '/' + (now.getMonth() + 1) + '/' + now.getFullYear();

      var isFuture = false;
      if (date.getFullYear() > now.getFullYear()) {
        isFuture = true;
      } else {
        if (date.getFullYear() == now.getFullYear()) {
          if (date.getMonth() + 1 > now.getMonth() + 1) {
            isFuture = true;
          } else {
            if (date.getMonth() + 1 == now.getMonth() + 1) {
              if (date.getDate() >= now.getDate()) {
                isFuture = true;
              }
            }
          }
        }
      }

      return isValidFormat && isFuture;
    }
  }, {
    key: 'isValidScope',
    value: function isValidScope(scope) {
      return scope !== '';
    }
  }, {
    key: 'isValidTimeslot',
    value: function isValidTimeslot(info) {
      if (!info) {
        return false;
      }
      var splitInfo = info.split(' to '); // [12:00, 13:00]
      var twoTimes = splitInfo.length === 2;
      if (!twoTimes) {
        return false;
      }
      var splitStart = splitInfo[0].split(':'); // [12, 00]
      var splitEnd = splitInfo[1].split(':'); // [13, 00]
      if (splitStart.length !== 2 || splitEnd.length !== 2) {
        return false;
      }
      var okSize = splitStart[0].length === 2 && splitStart[1].length === 2 && splitEnd[0].length === 2 && splitEnd[1].length === 2;
      var areIntegers = splitStart[0] == parseInt(splitStart[0], 10) && splitStart[1] == parseInt(splitStart[1], 10) && splitEnd[0] == parseInt(splitEnd[0], 10) && splitEnd[1] == parseInt(splitEnd[1], 10);
      return twoTimes && okSize && areIntegers;
    }
  }, {
    key: 'getFormattedPolicies',
    value: function getFormattedPolicies() {
      var _this = this;
      return new Promise(function (resolve, reject) {
        _this.callPolicyEngineFunc('userPolicies', {}).then(function (policiesPE) {
          var policiesGUI = [];

          for (var i in policiesPE) {
            var policy = {
              title: policiesPE[i].key,
              rulesTitles: [],
              ids: []
            };

            if (policiesPE[i].rules.length !== 0) {
              policiesPE[i].rules = policiesPE[i].sortRules();
              for (var j in policiesPE[i].rules) {
                var title = _this._getTitle(policiesPE[i].rules[j]);
                policy.rulesTitles.push(title);
                policy.ids.push(policy.title + ':' + policiesPE[i].rules[j].priority);
              }
            }

            policiesGUI.push(policy);
          }

          resolve(policiesGUI);
        });
      });
    }
  }, {
    key: 'getRuleOfPolicy',
    value: function getRuleOfPolicy(title, priority) {
      var _this = this;
      return new Promise(function (resolve, reject) {
        _this.callPolicyEngineFunc('userPolicies', {}).then(function (policies) {
          var policy = policies[title];
          resolve(policy.getRuleByPriority(priority));
        });
      });
    }
  }, {
    key: '_getTitle',
    value: function _getTitle(rule) {
      var condition = rule.condition;
      var authorise = rule.decision ? 'allowed' : 'blocked';
      var target = rule.target === 'global' ? 'All identities and hyperties' : rule.target;
      var attribute = condition.attribute;
      switch (attribute) {
        case 'date':
          return 'Date ' + condition.params + ' is ' + authorise + ' (' + target + ')';
        case 'domain':
          return 'Domain \"' + condition.params + '\" is ' + authorise + ' (' + target + ')';
        case 'source':
          if (condition.operator === 'in') {
            return 'Group \"' + condition.params + '\" is ' + authorise + ' (' + target + ')';
          } else {
            if (condition.operator === 'equals') {
              return 'User ' + condition.params + ' is ' + authorise + ' (' + target + ')';
            }
          }
        case 'subscription':
          if (condition.params === '*') {
            return 'Subscriptions from all hyperties are ' + authorise + ' (' + target + ')';
          } else {
            if (condition.params === 'preauthorised') {
              return 'Subscriptions from previously authorised hyperties are allowed (' + target + ')';
            }
          }
        case 'time':
          var start = condition.params[0][0] + condition.params[0][1] + ':' + condition.params[0][2] + condition.params[0][3];
          var end = condition.params[1][0] + condition.params[1][1] + ':' + condition.params[1][2] + condition.params[1][3];
          return 'Timeslot from ' + start + ' to ' + end + ' is ' + authorise + ' (' + target + ')';
        case 'weekday':
          var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          var weekdayID = condition.params;
          return 'Weekday \"' + weekdays[weekdayID] + '\" is ' + authorise + ' (' + target + ')';
        default:
          return 'Rule ' + rule.priority + ' is ' + authorise + ' (' + target + ')';
      }
    }
  }, {
    key: 'getVariables',
    value: function getVariables() {
      var variablesTitles = [];
      for (var i in this.variables) {
        variablesTitles.push(i);
      }
      return variablesTitles;
    }
  }, {
    key: 'getVariableInfo',
    value: function getVariableInfo(variable) {
      return this.variables[variable];
    }
  }, {
    key: 'getMyEmails',
    value: function getMyEmails() {
      return this.callPolicyEngineFunc('getMyEmails', {});
    }
  }, {
    key: 'getMyHyperties',
    value: function getMyHyperties() {
      return this.callPolicyEngineFunc('getMyHyperties', {});
    }

    //TODO If there is a problem with the input, show it to the user

  }, {
    key: 'setInfo',
    value: function setInfo(variable, policyTitle, info, authorise, scope, target) {
      var _this = this;
      return new Promise(function (resolve, reject) {
        if (_this.validation[variable](scope, info)) {
          _this.addition[variable]([policyTitle, scope, target, info, authorise]).then(function () {
            resolve();
          });
        } else {
          reject('Invalid configuration');
        }
      });
    }
  }, {
    key: 'deleteInfo',
    value: function deleteInfo(variable, scope, target, info) {
      var params = [scope, target, info];
      if (variable === 'member') {
        var conditionSplit = info.split(' ');
        var groupName = conditionSplit[2];
        params = [scope, groupName, info];
      }
      this.deletion[variable](params);
    }
  }, {
    key: 'getGroups',
    value: function getGroups() {
      var _this = this;
      return new Promise(function (resolve, reject) {
        _this.callPolicyEngineFunc('groups', {}).then(function (groups) {
          var groupsGUI = {
            groupsNames: [],
            members: [],
            ids: []
          };

          for (var i in groups) {
            groupsGUI.groupsNames.push(i);
            groupsGUI.members.push(groups[i]);
            var ids = [];
            for (var j in groups[i]) {
              ids.push(i + '::' + groups[i][j]);
            }
            groupsGUI.ids.push(ids);
          }

          //console.log('TIAGO groups', groupsGUI)
          resolve(groupsGUI);
        });
      });
    }
  }, {
    key: 'getGroupsNames',
    value: function getGroupsNames() {
      return this.callPolicyEngineFunc('getGroupsNames', {});
    }
  }, {
    key: 'removeFromGroup',
    value: function removeFromGroup(groupName, user) {
      return this.callPolicyEngineFunc('removeFromGroup', { groupName: groupName, userEmail: user });
    }
  }, {
    key: 'updatePolicy',
    value: function updatePolicy(policyTitle, rule, newDecision, newSubscriptionType) {
      var _this = this;
      return new Promise(function (resolve, reject) {
        _this.callPolicyEngineFunc('userPolicies', {}).then(function (userPolicies) {
          userPolicies[policyTitle].deleteRule(rule);
          if (!newSubscriptionType) {
            userPolicies[policyTitle].createRule(newDecision, rule.condition, rule.scope, rule.target, rule.priority);
          } else {
            var operator = newSubscriptionType === '*' ? 'equals' : 'in';
            userPolicies[policyTitle].createRule(newDecision, [{ attribute: 'subscription', opeator: operator, params: newSubscriptionType }], rule.scope, rule.target, rule.priority);
          }

          _this.callPolicyEngineFunc('saveActivePolicy', {}).then(function () {
            resolve();
          });
        });
      });
    }
  }]);

  return PoliciesManager;
}();

exports.default = PoliciesManager;

},{}],20:[function(require,module,exports){
'use strict';

var _urijs = require('urijs');

var _urijs2 = _interopRequireDefault(_urijs);

var _IdentitiesGUI = require('./admin/IdentitiesGUI');

var _IdentitiesGUI2 = _interopRequireDefault(_IdentitiesGUI);

var _PoliciesGUI = require('./admin/PoliciesGUI');

var _PoliciesGUI2 = _interopRequireDefault(_PoliciesGUI);

var _RuntimeFactory = require('./RuntimeFactory');

var _RuntimeFactory2 = _interopRequireDefault(_RuntimeFactory);

var _RuntimeCatalogue = require('runtime-core/dist/RuntimeCatalogue');

var _RuntimeCatalogue2 = _interopRequireDefault(_RuntimeCatalogue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

try {
  window.cordova = parent.cordova !== undefined;
  if (window.cordova) {
    window.open = function (url) {
      return parent.cordova.InAppBrowser.open(url, '_blank', 'location=no,toolbar=no');
    };
  }
} catch (err) {
  console.log('cordova not supported');
} /**
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


function returnHyperty(source, hyperty) {
  source.postMessage({ to: 'runtime:loadedHyperty', body: hyperty }, '*');
}

function searchHyperty(runtime, descriptor) {
  var hyperty = undefined;
  var index = 0;
  while (!hyperty && index < runtime.registry.hypertiesList.length) {
    if (runtime.registry.hypertiesList[index].descriptor === descriptor) {
      hyperty = runtime.registry.hypertiesList[index];
    }

    index++;
  }

  return hyperty;
}

var parameters = new _urijs2.default(window.location).search(true);
var runtimeURL = parameters.runtime;
var domain = parameters.domain;
var development = parameters.development === 'true';
var catalogue = new _RuntimeCatalogue2.default(_RuntimeFactory2.default);
var runtimeDescriptor = void 0;
catalogue.getRuntimeDescriptor(runtimeURL).then(function (descriptor) {
  runtimeDescriptor = descriptor;
  var sourcePackageURL = descriptor.sourcePackageURL;
  if (sourcePackageURL === '/sourcePackage') {
    return descriptor.sourcePackage;
  }
  return catalogue.getSourcePackageFromURL(sourcePackageURL);
}).then(function (sourcePackage) {
  eval.apply(window, [sourcePackage.sourceCode]);

  //let runtime = new Runtime(RuntimeFactory, window.location.host);
  if (!domain) domain = window.location.host;
  var runtime = new Runtime(runtimeDescriptor, _RuntimeFactory2.default, domain);
  window.runtime = runtime;
  runtime.init().then(function (result) {

    // TIAGO
    if (!runtime.policyEngine) throw Error('Policy Engine is not set!');
    var pepGuiURL = runtime.policyEngine.context.guiURL;
    var pepURL = runtime.policyEngine.context.pepURL;
    var pepGUI = new _PoliciesGUI2.default(pepGuiURL, pepURL, runtime.policyEngine.messageBus, runtime.policyEngine);

    pepGUI.prepareAttributes().then(function () {
      var idmGuiURL = runtime.identityModule._runtimeURL + '/identity-gui';
      var idmURL = runtime.identityModule._runtimeURL + '/idm';
      var identitiesGUI = new _IdentitiesGUI2.default(idmGuiURL, idmURL, runtime.identityModule.messageBus);

      window.addEventListener('message', function (event) {
        if (event.data.to === 'core:loadHyperty') {
          var descriptor = event.data.body.descriptor;
          var reuseAddress = event.data.body.reuseAddress;
          var requireHypertyID = event.data.body.id;

          var hyperty = searchHyperty(runtime, descriptor);

          if (hyperty) {
            returnHyperty(event.source, { runtimeHypertyURL: hyperty.hypertyURL, id: requireHypertyID });
          } else {
            runtime.loadHyperty(descriptor, reuseAddress).then(function (hyperty) {
              hyperty.id = requireHypertyID;
              returnHyperty(event.source, hyperty);
            });
          }
        } else if (event.data.to === 'core:loadStub') {
          runtime.loadStub(event.data.body.domain).then(function (result) {
            console.log('Stub Loaded: ', result);
          }).catch(function (error) {
            console.error('Stub error:', error);
          });
        } else if (event.data.to === 'core:close') {
          runtime.close(event.data.body.logOut).then(function (result) {
            event.source.postMessage({ to: 'runtime:runtimeClosed', body: result }, '*');
          }).catch(function (result) {
            event.source.postMessage({ to: 'runtime:runtimeClosed', body: result }, '*');
          });

          //  send logout
          identitiesGUI.logOut().then(function (result) {
            console.log(result);
          });
        } else if (event.data.to === 'core:reset') {
          runtime.reset().then(function (result) {
            event.source.postMessage({ to: 'runtime:runtimeReset', body: result }, '*');
          });

          //  send logout
          identitiesGUI.logOut().then(function (result) {
            console.log(result);
          });
        } else if (event.data.to === 'core:login') {
          console.log('core: logging with ', event.data.body.idp);
          identitiesGUI.loginWithIDP(event.data.body.idp).then(function (result) {
            event.source.postMessage({ to: 'runtime:loggedIn', body: result }, '*');
          });
        } else if (event.data.to === 'core:authorise') {
          console.log('core:authorise ', event.data.body.idp, event.data.body.scope);
          identitiesGUI.authorise(event.data.body.idp, event.data.body.scope).then(function (result) {
            if (result.hasOwnProperty('code') && result.code > 299) {
              event.source.postMessage({ to: 'runtime:not-authorised', body: JSON.stringify(result) }, '*');
            } else {
              event.source.postMessage({ to: 'runtime:authorised', body: JSON.stringify(result) }, '*');
            }
          });
        }
      }, false);

      window.addEventListener('beforeunload', function (e) {
        runtime.close();
      });

      parent.postMessage({ to: 'runtime:installed', body: {} }, '*');
    });
  });
});

},{"./RuntimeFactory":14,"./admin/IdentitiesGUI":17,"./admin/PoliciesGUI":18,"runtime-core/dist/RuntimeCatalogue":3,"urijs":10}]},{},[20])(20)
});

//# sourceMappingURL=core.js.map
