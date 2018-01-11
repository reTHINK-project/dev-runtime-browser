(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.core = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
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


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
// version: 0.11.0
// date: Wed Jan 10 2018 16:54:02 GMT+0000 (WET)
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


// version: 0.11.0
// date: Wed Jan 10 2018 16:54:02 GMT+0000 (WET)
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


!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define("minibus",[],e):"object"==typeof exports?exports.minibus=e():t.minibus=e()}("undefined"!=typeof self?self:this,function(){/******/
return function(t){/******/
/******/
// The require function
/******/
function __webpack_require__(n){/******/
/******/
// Check if module is in cache
/******/
if(e[n])/******/
return e[n].exports;/******/
// Create a new module (and put it into the cache)
/******/
var r=e[n]={/******/
i:n,/******/
l:!1,/******/
exports:{}};/******/
/******/
// Return the exports of the module
/******/
/******/
/******/
// Execute the module function
/******/
/******/
/******/
// Flag the module as loaded
/******/
return t[n].call(r.exports,r,r.exports,__webpack_require__),r.l=!0,r.exports}// webpackBootstrap
/******/
// The module cache
/******/
var e={};/******/
/******/
// Load entry module and return exports
/******/
/******/
/******/
/******/
// expose the modules object (__webpack_modules__)
/******/
/******/
/******/
// expose the module cache
/******/
/******/
/******/
// define getter function for harmony exports
/******/
/******/
/******/
// getDefaultExport function for compatibility with non-harmony modules
/******/
/******/
/******/
// Object.prototype.hasOwnProperty.call
/******/
/******/
/******/
// __webpack_public_path__
/******/
return __webpack_require__.m=t,__webpack_require__.c=e,__webpack_require__.d=function(t,e,n){/******/
__webpack_require__.o(t,e)||/******/
Object.defineProperty(t,e,{/******/
configurable:!1,/******/
enumerable:!0,/******/
get:n})},__webpack_require__.n=function(t){/******/
var e=t&&t.__esModule?/******/
function(){return t.default}:/******/
function(){return t};/******/
/******/
return __webpack_require__.d(e,"a",e),e},__webpack_require__.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},__webpack_require__.p="",__webpack_require__(__webpack_require__.s=135)}([/* 0 */
/***/
function(t,e){var n=t.exports={version:"2.5.3"};"number"==typeof __e&&(__e=n)},/* 1 */
/***/
function(t,e){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var n=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=n)},/* 2 */
/***/
function(t,e,n){var r=n(28)("wks"),o=n(19),i=n(1).Symbol,u="function"==typeof i;(t.exports=function(t){return r[t]||(r[t]=u&&i[t]||(u?i:o)("Symbol."+t))}).store=r},/* 3 */
/***/
function(t,e,n){var r=n(1),o=n(0),i=n(14),u=n(8),c=function(t,e,n){var s,f,a,l=t&c.F,p=t&c.G,v=t&c.S,d=t&c.P,h=t&c.B,_=t&c.W,y=p?o:o[e]||(o[e]={}),b=y.prototype,g=p?r:v?r[e]:(r[e]||{}).prototype;p&&(n=e);for(s in n)
// contains in native
(f=!l&&g&&void 0!==g[s])&&s in y||(
// export native or passed
a=f?g[s]:n[s],
// prevent global pollution for namespaces
y[s]=p&&"function"!=typeof g[s]?n[s]:h&&f?i(a,r):_&&g[s]==a?function(t){var e=function(e,n,r){if(this instanceof t){switch(arguments.length){case 0:return new t;case 1:return new t(e);case 2:return new t(e,n)}return new t(e,n,r)}return t.apply(this,arguments)};return e.prototype=t.prototype,e}(a):d&&"function"==typeof a?i(Function.call,a):a,
// export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
d&&((y.virtual||(y.virtual={}))[s]=a,
// export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
t&c.R&&b&&!b[s]&&u(b,s,a)))};
// type bitmap
c.F=1,// forced
c.G=2,// global
c.S=4,// static
c.P=8,// proto
c.B=16,// bind
c.W=32,// wrap
c.U=64,// safe
c.R=128,// real proto method for `library`
t.exports=c},/* 4 */
/***/
function(t,e,n){var r=n(6);t.exports=function(t){if(!r(t))throw TypeError(t+" is not an object!");return t}},/* 5 */
/***/
function(t,e,n){
// Thank's IE8 for his funny defineProperty
t.exports=!n(13)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},/* 6 */
/***/
function(t,e){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},/* 7 */
/***/
function(t,e,n){var r=n(4),o=n(36),i=n(26),u=Object.defineProperty;e.f=n(5)?Object.defineProperty:function(t,e,n){if(r(t),e=i(e,!0),r(n),o)try{return u(t,e,n)}catch(t){}if("get"in n||"set"in n)throw TypeError("Accessors not supported!");return"value"in n&&(t[e]=n.value),t}},/* 8 */
/***/
function(t,e,n){var r=n(7),o=n(18);t.exports=n(5)?function(t,e,n){return r.f(t,e,o(1,n))}:function(t,e,n){return t[e]=n,t}},/* 9 */
/***/
function(t,e){var n={}.hasOwnProperty;t.exports=function(t,e){return n.call(t,e)}},/* 10 */
/***/
function(t,e,n){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var r=n(57),o=n(22);t.exports=function(t){return r(o(t))}},/* 11 */
/***/
function(t,e,n){"use strict";e.__esModule=!0,e.default=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}},/* 12 */
/***/
function(t,e,n){"use strict";e.__esModule=!0;var r=n(60),o=function(t){return t&&t.__esModule?t:{default:t}}(r);e.default=function(){function defineProperties(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),(0,o.default)(t,r.key,r)}}return function(t,e,n){return e&&defineProperties(t.prototype,e),n&&defineProperties(t,n),t}}()},/* 13 */
/***/
function(t,e){t.exports=function(t){try{return!!t()}catch(t){return!0}}},/* 14 */
/***/
function(t,e,n){
// optional / simple context binding
var r=n(17);t.exports=function(t,e,n){if(r(t),void 0===e)return t;switch(n){case 1:return function(n){return t.call(e,n)};case 2:return function(n,r){return t.call(e,n,r)};case 3:return function(n,r,o){return t.call(e,n,r,o)}}return function(){return t.apply(e,arguments)}}},/* 15 */
/***/
function(t,e){var n={}.toString;t.exports=function(t){return n.call(t).slice(8,-1)}},/* 16 */
/***/
function(t,e){t.exports={}},/* 17 */
/***/
function(t,e){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},/* 18 */
/***/
function(t,e){t.exports=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}}},/* 19 */
/***/
function(t,e){var n=0,r=Math.random();t.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++n+r).toString(36))}},/* 20 */
/***/
function(t,e,n){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var r=n(37),o=n(29);t.exports=Object.keys||function(t){return r(t,o)}},/* 21 */
/***/
function(t,e){
// 7.1.4 ToInteger
var n=Math.ceil,r=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?r:n)(t)}},/* 22 */
/***/
function(t,e){
// 7.2.1 RequireObjectCoercible(argument)
t.exports=function(t){if(void 0==t)throw TypeError("Can't call method on  "+t);return t}},/* 23 */
/***/
function(t,e){t.exports=!0},/* 24 */
/***/
function(t,e,n){var r=n(7).f,o=n(9),i=n(2)("toStringTag");t.exports=function(t,e,n){t&&!o(t=n?t:t.prototype,i)&&r(t,i,{configurable:!0,value:e})}},/* 25 */
/***/
function(t,e,n){var r=n(6),o=n(1).document,i=r(o)&&r(o.createElement);t.exports=function(t){return i?o.createElement(t):{}}},/* 26 */
/***/
function(t,e,n){
// 7.1.1 ToPrimitive(input [, PreferredType])
var r=n(6);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
t.exports=function(t,e){if(!r(t))return t;var n,o;if(e&&"function"==typeof(n=t.toString)&&!r(o=n.call(t)))return o;if("function"==typeof(n=t.valueOf)&&!r(o=n.call(t)))return o;if(!e&&"function"==typeof(n=t.toString)&&!r(o=n.call(t)))return o;throw TypeError("Can't convert object to primitive value")}},/* 27 */
/***/
function(t,e,n){var r=n(28)("keys"),o=n(19);t.exports=function(t){return r[t]||(r[t]=o(t))}},/* 28 */
/***/
function(t,e,n){var r=n(1),o=r["__core-js_shared__"]||(r["__core-js_shared__"]={});t.exports=function(t){return o[t]||(o[t]={})}},/* 29 */
/***/
function(t,e){
// IE 8- don't enum bug keys
t.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},/* 30 */
/***/
function(t,e,n){
// 7.1.13 ToObject(argument)
var r=n(22);t.exports=function(t){return Object(r(t))}},/* 31 */
/***/
function(t,e,n){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var r=n(4),o=n(69),i=n(29),u=n(27)("IE_PROTO"),c=function(){},s=function(){
// Thrash, waste and sodomy: IE GC bug
var t,e=n(25)("iframe"),r=i.length;for(e.style.display="none",n(46).appendChild(e),e.src="javascript:",// eslint-disable-line no-script-url
// createDict = iframe.contentWindow.Object;
// html.removeChild(iframe);
t=e.contentWindow.document,t.open(),t.write("<script>document.F=Object<\/script>"),t.close(),s=t.F;r--;)delete s.prototype[i[r]];return s()};t.exports=Object.create||function(t,e){var n;
// add "__proto__" for Object.getPrototypeOf polyfill
return null!==t?(c.prototype=r(t),n=new c,c.prototype=null,n[u]=t):n=s(),void 0===e?n:o(n,e)}},/* 32 */
/***/
function(t,e,n){"use strict";function PromiseCapability(t){var e,n;this.promise=new t(function(t,r){if(void 0!==e||void 0!==n)throw TypeError("Bad Promise constructor");e=t,n=r}),this.resolve=r(e),this.reject=r(n)}
// 25.4.1.5 NewPromiseCapability(C)
var r=n(17);t.exports.f=function(t){return new PromiseCapability(t)}},/* 33 */
/***/
function(t,e,n){e.f=n(2)},/* 34 */
/***/
function(t,e,n){var r=n(1),o=n(0),i=n(23),u=n(33),c=n(7).f;t.exports=function(t){var e=o.Symbol||(o.Symbol=i?{}:r.Symbol||{});"_"==t.charAt(0)||t in e||c(e,t,{value:u.f(t)})}},/* 35 */
/***/
function(t,e){e.f={}.propertyIsEnumerable},/* 36 */
/***/
function(t,e,n){t.exports=!n(5)&&!n(13)(function(){return 7!=Object.defineProperty(n(25)("div"),"a",{get:function(){return 7}}).a})},/* 37 */
/***/
function(t,e,n){var r=n(9),o=n(10),i=n(58)(!1),u=n(27)("IE_PROTO");t.exports=function(t,e){var n,c=o(t),s=0,f=[];for(n in c)n!=u&&r(c,n)&&f.push(n);
// Don't enum bug & hidden keys
for(;e.length>s;)r(c,n=e[s++])&&(~i(f,n)||f.push(n));return f}},/* 38 */
/***/
function(t,e,n){
// 7.1.15 ToLength
var r=n(21),o=Math.min;t.exports=function(t){return t>0?o(r(t),9007199254740991):0}},/* 39 */
/***/
function(t,e,n){
// most Object methods by ES6 should accept primitives
var r=n(3),o=n(0),i=n(13);t.exports=function(t,e){var n=(o.Object||{})[t]||Object[t],u={};u[t]=e(n),r(r.S+r.F*i(function(){n(1)}),"Object",u)}},/* 40 */
/***/
function(t,e,n){var r=n(35),o=n(18),i=n(10),u=n(26),c=n(9),s=n(36),f=Object.getOwnPropertyDescriptor;e.f=n(5)?f:function(t,e){if(t=i(t),e=u(e,!0),s)try{return f(t,e)}catch(t){}if(c(t,e))return o(!r.f.call(t,e),t[e])}},/* 41 */
/***/
function(t,e,n){t.exports={default:n(66),__esModule:!0}},/* 42 */
/***/
function(t,e){},/* 43 */
/***/
function(t,e,n){"use strict";var r=n(67)(!0);
// 21.1.3.27 String.prototype[@@iterator]()
n(44)(String,"String",function(t){this._t=String(t),// target
this._i=0},function(){var t,e=this._t,n=this._i;return n>=e.length?{value:void 0,done:!0}:(t=r(e,n),this._i+=t.length,{value:t,done:!1})})},/* 44 */
/***/
function(t,e,n){"use strict";var r=n(23),o=n(3),i=n(45),u=n(8),c=n(9),s=n(16),f=n(68),a=n(24),l=n(47),p=n(2)("iterator"),v=!([].keys&&"next"in[].keys()),d=function(){return this};t.exports=function(t,e,n,h,_,y,b){f(n,e,h);var g,m,w,x=function(t){if(!v&&t in P)return P[t];switch(t){case"keys":case"values":return function(){return new n(this,t)}}return function(){return new n(this,t)}},O=e+" Iterator",M="values"==_,S=!1,P=t.prototype,L=P[p]||P["@@iterator"]||_&&P[_],j=!v&&L||x(_),k=_?M?x("entries"):j:void 0,E="Array"==e?P.entries||L:L;if(
// Fix native
E&&(w=l(E.call(new t)))!==Object.prototype&&w.next&&(
// Set @@toStringTag to native iterators
a(w,O,!0),
// fix for some old engines
r||c(w,p)||u(w,p,d)),
// fix Array#{values, @@iterator}.name in V8 / FF
M&&L&&"values"!==L.name&&(S=!0,j=function(){return L.call(this)}),
// Define iterator
r&&!b||!v&&!S&&P[p]||u(P,p,j),
// Plug for library
s[e]=j,s[O]=d,_)if(g={values:M?j:x("values"),keys:y?j:x("keys"),entries:k},b)for(m in g)m in P||i(P,m,g[m]);else o(o.P+o.F*(v||S),e,g);return g}},/* 45 */
/***/
function(t,e,n){t.exports=n(8)},/* 46 */
/***/
function(t,e,n){var r=n(1).document;t.exports=r&&r.documentElement},/* 47 */
/***/
function(t,e,n){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var r=n(9),o=n(30),i=n(27)("IE_PROTO"),u=Object.prototype;t.exports=Object.getPrototypeOf||function(t){return t=o(t),r(t,i)?t[i]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?u:null}},/* 48 */
/***/
function(t,e,n){n(70);for(var r=n(1),o=n(8),i=n(16),u=n(2)("toStringTag"),c="CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,TextTrackList,TouchList".split(","),s=0;s<c.length;s++){var f=c[s],a=r[f],l=a&&a.prototype;l&&!l[u]&&o(l,u,f),i[f]=i.Array}},/* 49 */
/***/
function(t,e,n){
// getting tag from 19.1.3.6 Object.prototype.toString()
var r=n(15),o=n(2)("toStringTag"),i="Arguments"==r(function(){return arguments}()),u=function(t,e){try{return t[e]}catch(t){}};t.exports=function(t){var e,n,c;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(n=u(e=Object(t),o))?n:i?r(e):"Object"==(c=r(e))&&"function"==typeof e.callee?"Arguments":c}},/* 50 */
/***/
function(t,e,n){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var r=n(4),o=n(17),i=n(2)("species");t.exports=function(t,e){var n,u=r(t).constructor;return void 0===u||void 0==(n=r(u)[i])?e:o(n)}},/* 51 */
/***/
function(t,e,n){var r,o,i,u=n(14),c=n(79),s=n(46),f=n(25),a=n(1),l=a.process,p=a.setImmediate,v=a.clearImmediate,d=a.MessageChannel,h=a.Dispatch,_=0,y={},b=function(){var t=+this;
// eslint-disable-next-line no-prototype-builtins
if(y.hasOwnProperty(t)){var e=y[t];delete y[t],e()}},g=function(t){b.call(t.data)};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
p&&v||(p=function(t){for(var e=[],n=1;arguments.length>n;)e.push(arguments[n++]);return y[++_]=function(){
// eslint-disable-next-line no-new-func
c("function"==typeof t?t:Function(t),e)},r(_),_},v=function(t){delete y[t]},
// Node.js 0.8-
"process"==n(15)(l)?r=function(t){l.nextTick(u(b,t,1))}:h&&h.now?r=function(t){h.now(u(b,t,1))}:d?(o=new d,i=o.port2,o.port1.onmessage=g,r=u(i.postMessage,i,1)):a.addEventListener&&"function"==typeof postMessage&&!a.importScripts?(r=function(t){a.postMessage(t+"","*")},a.addEventListener("message",g,!1)):r="onreadystatechange"in f("script")?function(t){s.appendChild(f("script")).onreadystatechange=function(){s.removeChild(this),b.call(t)}}:function(t){setTimeout(u(b,t,1),0)}),t.exports={set:p,clear:v}},/* 52 */
/***/
function(t,e){t.exports=function(t){try{return{e:!1,v:t()}}catch(t){return{e:!0,v:t}}}},/* 53 */
/***/
function(t,e,n){var r=n(4),o=n(6),i=n(32);t.exports=function(t,e){if(r(t),o(e)&&e.constructor===t)return e;var n=i.f(t);return(0,n.resolve)(e),n.promise}},/* 54 */
/***/
function(t,e,n){"use strict";function _interopRequireDefault(t){return t&&t.__esModule?t:{default:t}}e.__esModule=!0;var r=n(89),o=_interopRequireDefault(r),i=n(91),u=_interopRequireDefault(i),c="function"==typeof u.default&&"symbol"==typeof o.default?function(t){return typeof t}:function(t){return t&&"function"==typeof u.default&&t.constructor===u.default&&t!==u.default.prototype?"symbol":typeof t};e.default="function"==typeof u.default&&"symbol"===c(o.default)?function(t){return void 0===t?"undefined":c(t)}:function(t){return t&&"function"==typeof u.default&&t.constructor===u.default&&t!==u.default.prototype?"symbol":void 0===t?"undefined":c(t)}},/* 55 */
/***/
function(t,e){e.f=Object.getOwnPropertySymbols},/* 56 */
/***/
function(t,e,n){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var r=n(37),o=n(29).concat("length","prototype");e.f=Object.getOwnPropertyNames||function(t){return r(t,o)}},/* 57 */
/***/
function(t,e,n){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var r=n(15);
// eslint-disable-next-line no-prototype-builtins
t.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==r(t)?t.split(""):Object(t)}},/* 58 */
/***/
function(t,e,n){
// false -> Array#indexOf
// true  -> Array#includes
var r=n(10),o=n(38),i=n(59);t.exports=function(t){return function(e,n,u){var c,s=r(e),f=o(s.length),a=i(u,f);
// Array#includes uses SameValueZero equality algorithm
// eslint-disable-next-line no-self-compare
if(t&&n!=n){for(;f>a;)
// eslint-disable-next-line no-self-compare
if((c=s[a++])!=c)return!0}else for(;f>a;a++)if((t||a in s)&&s[a]===n)return t||a||0;return!t&&-1}}},/* 59 */
/***/
function(t,e,n){var r=n(21),o=Math.max,i=Math.min;t.exports=function(t,e){return t=r(t),t<0?o(t+e,0):i(t,e)}},/* 60 */
/***/
function(t,e,n){t.exports={default:n(61),__esModule:!0}},/* 61 */
/***/
function(t,e,n){n(62);var r=n(0).Object;t.exports=function(t,e,n){return r.defineProperty(t,e,n)}},/* 62 */
/***/
function(t,e,n){var r=n(3);
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
r(r.S+r.F*!n(5),"Object",{defineProperty:n(7).f})},/* 63 */
/***/
function(t,e,n){t.exports={default:n(87),__esModule:!0}},/* 64 */
/***/
function(t,e,n){"use strict";e.__esModule=!0;var r=n(54),o=function(t){return t&&t.__esModule?t:{default:t}}(r);e.default=function(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!==(void 0===e?"undefined":(0,o.default)(e))&&"function"!=typeof e?t:e}},/* 65 */
/***/
function(t,e,n){"use strict";function _interopRequireDefault(t){return t&&t.__esModule?t:{default:t}}e.__esModule=!0;var r=n(100),o=_interopRequireDefault(r),i=n(104),u=_interopRequireDefault(i),c=n(54),s=_interopRequireDefault(c);e.default=function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+(void 0===e?"undefined":(0,s.default)(e)));t.prototype=(0,u.default)(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(o.default?(0,o.default)(t,e):t.__proto__=e)}},/* 66 */
/***/
function(t,e,n){n(42),n(43),n(48),n(73),n(84),n(85),t.exports=n(0).Promise},/* 67 */
/***/
function(t,e,n){var r=n(21),o=n(22);
// true  -> String#at
// false -> String#codePointAt
t.exports=function(t){return function(e,n){var i,u,c=String(o(e)),s=r(n),f=c.length;return s<0||s>=f?t?"":void 0:(i=c.charCodeAt(s),i<55296||i>56319||s+1===f||(u=c.charCodeAt(s+1))<56320||u>57343?t?c.charAt(s):i:t?c.slice(s,s+2):u-56320+(i-55296<<10)+65536)}}},/* 68 */
/***/
function(t,e,n){"use strict";var r=n(31),o=n(18),i=n(24),u={};
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
n(8)(u,n(2)("iterator"),function(){return this}),t.exports=function(t,e,n){t.prototype=r(u,{next:o(1,n)}),i(t,e+" Iterator")}},/* 69 */
/***/
function(t,e,n){var r=n(7),o=n(4),i=n(20);t.exports=n(5)?Object.defineProperties:function(t,e){o(t);for(var n,u=i(e),c=u.length,s=0;c>s;)r.f(t,n=u[s++],e[n]);return t}},/* 70 */
/***/
function(t,e,n){"use strict";var r=n(71),o=n(72),i=n(16),u=n(10);
// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
t.exports=n(44)(Array,"Array",function(t,e){this._t=u(t),// target
this._i=0,// next index
this._k=e},function(){var t=this._t,e=this._k,n=this._i++;return!t||n>=t.length?(this._t=void 0,o(1)):"keys"==e?o(0,n):"values"==e?o(0,t[n]):o(0,[n,t[n]])},"values"),
// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
i.Arguments=i.Array,r("keys"),r("values"),r("entries")},/* 71 */
/***/
function(t,e){t.exports=function(){}},/* 72 */
/***/
function(t,e){t.exports=function(t,e){return{value:e,done:!!t}}},/* 73 */
/***/
function(t,e,n){"use strict";var r,o,i,u,c=n(23),s=n(1),f=n(14),a=n(49),l=n(3),p=n(6),v=n(17),d=n(74),h=n(75),_=n(50),y=n(51).set,b=n(80)(),g=n(32),m=n(52),w=n(53),x=s.TypeError,O=s.process,M=s.Promise,S="process"==a(O),P=function(){},L=o=g.f,j=!!function(){try{
// correct subclassing with @@species support
var t=M.resolve(1),e=(t.constructor={})[n(2)("species")]=function(t){t(P,P)};
// unhandled rejections tracking support, NodeJS Promise without it fails @@species test
return(S||"function"==typeof PromiseRejectionEvent)&&t.then(P)instanceof e}catch(t){}}(),k=function(t){var e;return!(!p(t)||"function"!=typeof(e=t.then))&&e},E=function(t,e){if(!t._n){t._n=!0;var n=t._c;b(function(){for(var r=t._v,o=1==t._s,i=0;n.length>i;)!function(e){var n,i,u=o?e.ok:e.fail,c=e.resolve,s=e.reject,f=e.domain;try{u?(o||(2==t._h&&C(t),t._h=1),!0===u?n=r:(f&&f.enter(),n=u(r),f&&f.exit()),n===e.promise?s(x("Promise-chain cycle")):(i=k(n))?i.call(n,c,s):c(n)):s(r)}catch(t){s(t)}}(n[i++]);// variable length - can't use forEach
t._c=[],t._n=!1,e&&!t._h&&R(t)})}},R=function(t){y.call(s,function(){var e,n,r,o=t._v,i=T(t);if(i&&(e=m(function(){S?O.emit("unhandledRejection",o,t):(n=s.onunhandledrejection)?n({promise:t,reason:o}):(r=s.console)&&r.error&&r.error("Unhandled promise rejection",o)}),
// Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
t._h=S||T(t)?2:1),t._a=void 0,i&&e.e)throw e.v})},T=function(t){return 1!==t._h&&0===(t._a||t._c).length},C=function(t){y.call(s,function(){var e;S?O.emit("rejectionHandled",t):(e=s.onrejectionhandled)&&e({promise:t,reason:t._v})})},A=function(t){var e=this;e._d||(e._d=!0,e=e._w||e,// unwrap
e._v=t,e._s=2,e._a||(e._a=e._c.slice()),E(e,!0))},D=function(t){var e,n=this;if(!n._d){n._d=!0,n=n._w||n;// unwrap
try{if(n===t)throw x("Promise can't be resolved itself");(e=k(t))?b(function(){var r={_w:n,_d:!1};// wrap
try{e.call(t,f(D,r,1),f(A,r,1))}catch(t){A.call(r,t)}}):(n._v=t,n._s=1,E(n,!1))}catch(t){A.call({_w:n,_d:!1},t)}}};
// constructor polyfill
j||(
// 25.4.3.1 Promise(executor)
M=function(t){d(this,M,"Promise","_h"),v(t),r.call(this);try{t(f(D,this,1),f(A,this,1))}catch(t){A.call(this,t)}},
// eslint-disable-next-line no-unused-vars
r=function(t){this._c=[],// <- awaiting reactions
this._a=void 0,// <- checked in isUnhandled reactions
this._s=0,// <- state
this._d=!1,// <- done
this._v=void 0,// <- value
this._h=0,// <- rejection state, 0 - default, 1 - handled, 2 - unhandled
this._n=!1},r.prototype=n(81)(M.prototype,{
// 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
then:function(t,e){var n=L(_(this,M));return n.ok="function"!=typeof t||t,n.fail="function"==typeof e&&e,n.domain=S?O.domain:void 0,this._c.push(n),this._a&&this._a.push(n),this._s&&E(this,!1),n.promise},
// 25.4.5.1 Promise.prototype.catch(onRejected)
catch:function(t){return this.then(void 0,t)}}),i=function(){var t=new r;this.promise=t,this.resolve=f(D,t,1),this.reject=f(A,t,1)},g.f=L=function(t){return t===M||t===u?new i(t):o(t)}),l(l.G+l.W+l.F*!j,{Promise:M}),n(24)(M,"Promise"),n(82)("Promise"),u=n(0).Promise,
// statics
l(l.S+l.F*!j,"Promise",{
// 25.4.4.5 Promise.reject(r)
reject:function(t){var e=L(this);return(0,e.reject)(t),e.promise}}),l(l.S+l.F*(c||!j),"Promise",{
// 25.4.4.6 Promise.resolve(x)
resolve:function(t){return w(c&&this===u?M:this,t)}}),l(l.S+l.F*!(j&&n(83)(function(t){M.all(t).catch(P)})),"Promise",{
// 25.4.4.1 Promise.all(iterable)
all:function(t){var e=this,n=L(e),r=n.resolve,o=n.reject,i=m(function(){var n=[],i=0,u=1;h(t,!1,function(t){var c=i++,s=!1;n.push(void 0),u++,e.resolve(t).then(function(t){s||(s=!0,n[c]=t,--u||r(n))},o)}),--u||r(n)});return i.e&&o(i.v),n.promise},
// 25.4.4.4 Promise.race(iterable)
race:function(t){var e=this,n=L(e),r=n.reject,o=m(function(){h(t,!1,function(t){e.resolve(t).then(n.resolve,r)})});return o.e&&r(o.v),n.promise}})},/* 74 */
/***/
function(t,e){t.exports=function(t,e,n,r){if(!(t instanceof e)||void 0!==r&&r in t)throw TypeError(n+": incorrect invocation!");return t}},/* 75 */
/***/
function(t,e,n){var r=n(14),o=n(76),i=n(77),u=n(4),c=n(38),s=n(78),f={},a={},e=t.exports=function(t,e,n,l,p){var v,d,h,_,y=p?function(){return t}:s(t),b=r(n,l,e?2:1),g=0;if("function"!=typeof y)throw TypeError(t+" is not iterable!");
// fast case for arrays with default iterator
if(i(y)){for(v=c(t.length);v>g;g++)if((_=e?b(u(d=t[g])[0],d[1]):b(t[g]))===f||_===a)return _}else for(h=y.call(t);!(d=h.next()).done;)if((_=o(h,b,d.value,e))===f||_===a)return _};e.BREAK=f,e.RETURN=a},/* 76 */
/***/
function(t,e,n){
// call something on iterator step with safe closing on error
var r=n(4);t.exports=function(t,e,n,o){try{return o?e(r(n)[0],n[1]):e(n)}catch(e){var i=t.return;throw void 0!==i&&r(i.call(t)),e}}},/* 77 */
/***/
function(t,e,n){
// check on default Array iterator
var r=n(16),o=n(2)("iterator"),i=Array.prototype;t.exports=function(t){return void 0!==t&&(r.Array===t||i[o]===t)}},/* 78 */
/***/
function(t,e,n){var r=n(49),o=n(2)("iterator"),i=n(16);t.exports=n(0).getIteratorMethod=function(t){if(void 0!=t)return t[o]||t["@@iterator"]||i[r(t)]}},/* 79 */
/***/
function(t,e){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
t.exports=function(t,e,n){var r=void 0===n;switch(e.length){case 0:return r?t():t.call(n);case 1:return r?t(e[0]):t.call(n,e[0]);case 2:return r?t(e[0],e[1]):t.call(n,e[0],e[1]);case 3:return r?t(e[0],e[1],e[2]):t.call(n,e[0],e[1],e[2]);case 4:return r?t(e[0],e[1],e[2],e[3]):t.call(n,e[0],e[1],e[2],e[3])}return t.apply(n,e)}},/* 80 */
/***/
function(t,e,n){var r=n(1),o=n(51).set,i=r.MutationObserver||r.WebKitMutationObserver,u=r.process,c=r.Promise,s="process"==n(15)(u);t.exports=function(){var t,e,n,f=function(){var r,o;for(s&&(r=u.domain)&&r.exit();t;){o=t.fn,t=t.next;try{o()}catch(r){throw t?n():e=void 0,r}}e=void 0,r&&r.enter()};
// Node.js
if(s)n=function(){u.nextTick(f)};else if(!i||r.navigator&&r.navigator.standalone)if(c&&c.resolve){var a=c.resolve();n=function(){a.then(f)}}else n=function(){
// strange IE + webpack dev server bug - use .call(global)
o.call(r,f)};else{var l=!0,p=document.createTextNode("");new i(f).observe(p,{characterData:!0}),// eslint-disable-line no-new
n=function(){p.data=l=!l}}return function(r){var o={fn:r,next:void 0};e&&(e.next=o),t||(t=o,n()),e=o}}},/* 81 */
/***/
function(t,e,n){var r=n(8);t.exports=function(t,e,n){for(var o in e)n&&t[o]?t[o]=e[o]:r(t,o,e[o]);return t}},/* 82 */
/***/
function(t,e,n){"use strict";var r=n(1),o=n(0),i=n(7),u=n(5),c=n(2)("species");t.exports=function(t){var e="function"==typeof o[t]?o[t]:r[t];u&&e&&!e[c]&&i.f(e,c,{configurable:!0,get:function(){return this}})}},/* 83 */
/***/
function(t,e,n){var r=n(2)("iterator"),o=!1;try{var i=[7][r]();i.return=function(){o=!0},
// eslint-disable-next-line no-throw-literal
Array.from(i,function(){throw 2})}catch(t){}t.exports=function(t,e){if(!e&&!o)return!1;var n=!1;try{var i=[7],u=i[r]();u.next=function(){return{done:n=!0}},i[r]=function(){return u},t(i)}catch(t){}return n}},/* 84 */
/***/
function(t,e,n){"use strict";
// https://github.com/tc39/proposal-promise-finally
var r=n(3),o=n(0),i=n(1),u=n(50),c=n(53);r(r.P+r.R,"Promise",{finally:function(t){var e=u(this,o.Promise||i.Promise),n="function"==typeof t;return this.then(n?function(n){return c(e,t()).then(function(){return n})}:t,n?function(n){return c(e,t()).then(function(){throw n})}:t)}})},/* 85 */
/***/
function(t,e,n){"use strict";
// https://github.com/tc39/proposal-promise-try
var r=n(3),o=n(32),i=n(52);r(r.S,"Promise",{try:function(t){var e=o.f(this),n=i(t);return(n.e?e.reject:e.resolve)(n.v),e.promise}})},/* 86 */
/***/
function(t,e,n){var r,o;/*
* loglevel - https://github.com/pimterry/loglevel
*
* Copyright (c) 2013 Tim Perry
* Licensed under the MIT license.
*/
!function(i,u){"use strict";r=u,void 0!==(o="function"==typeof r?r.call(e,n,e,t):r)&&(t.exports=o)}(0,function(){"use strict";
// Cross-browser bind equivalent that works at least back to IE6
function bindMethod(t,e){var n=t[e];if("function"==typeof n.bind)return n.bind(t);try{return Function.prototype.bind.call(n,t)}catch(e){
// Missing bind shim or IE8 + Modernizr, fallback to wrapping
return function(){return Function.prototype.apply.apply(n,[t,arguments])}}}
// Build the best logging method possible for this env
// Wherever possible we want to bind, not wrap, to preserve stack traces
function realMethod(n){return"debug"===n&&(n="log"),typeof console!==e&&(void 0!==console[n]?bindMethod(console,n):void 0!==console.log?bindMethod(console,"log"):t)}
// These private functions always need `this` to be set properly
function replaceLoggingMethods(e,r){/*jshint validthis:true */
for(var o=0;o<n.length;o++){var i=n[o];this[i]=o<e?t:this.methodFactory(i,e,r)}
// Define log.log as an alias for log.debug
this.log=this.debug}
// In old IE versions, the console isn't present until you first open it.
// We build realMethod() replacements here that regenerate logging methods
function enableLoggingWhenConsoleArrives(t,n,r){return function(){typeof console!==e&&(replaceLoggingMethods.call(this,n,r),this[t].apply(this,arguments))}}
// By default, we use closely bound real methods wherever possible, and
// otherwise we wait for a console to appear, and then try again.
function defaultMethodFactory(t,e,n){/*jshint validthis:true */
return realMethod(t)||enableLoggingWhenConsoleArrives.apply(this,arguments)}function Logger(t,r,o){function persistLevelIfPossible(t){var r=(n[t]||"silent").toUpperCase();if(typeof window!==e){
// Use localStorage if available
try{return void(window.localStorage[c]=r)}catch(t){}
// Use session cookie as fallback
try{window.document.cookie=encodeURIComponent(c)+"="+r+";"}catch(t){}}}function getPersistedLevel(){var t;if(typeof window!==e){try{t=window.localStorage[c]}catch(t){}
// Fallback to cookies if local storage gives us nothing
if(typeof t===e)try{var n=window.document.cookie,r=n.indexOf(encodeURIComponent(c)+"=");-1!==r&&(t=/^([^;]+)/.exec(n.slice(r))[1])}catch(t){}
// If the stored level is not valid, treat it as if nothing was stored.
return void 0===u.levels[t]&&(t=void 0),t}}var i,u=this,c="loglevel";t&&(c+=":"+t),/*
       *
       * Public logger API - see https://github.com/pimterry/loglevel for details
       *
       */
u.name=t,u.levels={TRACE:0,DEBUG:1,INFO:2,WARN:3,ERROR:4,SILENT:5},u.methodFactory=o||defaultMethodFactory,u.getLevel=function(){return i},u.setLevel=function(n,r){if("string"==typeof n&&void 0!==u.levels[n.toUpperCase()]&&(n=u.levels[n.toUpperCase()]),!("number"==typeof n&&n>=0&&n<=u.levels.SILENT))throw"log.setLevel() called with invalid level: "+n;if(i=n,!1!==r&&// defaults to true
persistLevelIfPossible(n),replaceLoggingMethods.call(u,n,t),typeof console===e&&n<u.levels.SILENT)return"No console available for logging"},u.setDefaultLevel=function(t){getPersistedLevel()||u.setLevel(t,!1)},u.enableAll=function(t){u.setLevel(u.levels.TRACE,t)},u.disableAll=function(t){u.setLevel(u.levels.SILENT,t)};
// Initialize with the right level
var s=getPersistedLevel();null==s&&(s=null==r?"WARN":r),u.setLevel(s,!1)}
// Slightly dubious tricks to cut down minimized file size
var t=function(){},e="undefined",n=["trace","debug","info","warn","error"],r=new Logger,o={};r.getLogger=function(t){if("string"!=typeof t||""===t)throw new TypeError("You must supply a name when creating a logger.");var e=o[t];return e||(e=o[t]=new Logger(t,r.getLevel(),r.methodFactory)),e};
// Grab the current global log variable in case of overwrite
var i=typeof window!==e?window.log:void 0;return r.noConflict=function(){return typeof window!==e&&window.log===r&&(window.log=i),r},r.getLoggers=function(){return o},r})},/* 87 */
/***/
function(t,e,n){n(88),t.exports=n(0).Object.getPrototypeOf},/* 88 */
/***/
function(t,e,n){
// 19.1.2.9 Object.getPrototypeOf(O)
var r=n(30),o=n(47);n(39)("getPrototypeOf",function(){return function(t){return o(r(t))}})},/* 89 */
/***/
function(t,e,n){t.exports={default:n(90),__esModule:!0}},/* 90 */
/***/
function(t,e,n){n(43),n(48),t.exports=n(33).f("iterator")},/* 91 */
/***/
function(t,e,n){t.exports={default:n(92),__esModule:!0}},/* 92 */
/***/
function(t,e,n){n(93),n(42),n(98),n(99),t.exports=n(0).Symbol},/* 93 */
/***/
function(t,e,n){"use strict";
// ECMAScript 6 symbols shim
var r=n(1),o=n(9),i=n(5),u=n(3),c=n(45),s=n(94).KEY,f=n(13),a=n(28),l=n(24),p=n(19),v=n(2),d=n(33),h=n(34),_=n(95),y=n(96),b=n(4),g=n(6),m=n(10),w=n(26),x=n(18),O=n(31),M=n(97),S=n(40),P=n(7),L=n(20),j=S.f,k=P.f,E=M.f,R=r.Symbol,T=r.JSON,C=T&&T.stringify,A=v("_hidden"),D=v("toPrimitive"),F={}.propertyIsEnumerable,q=a("symbol-registry"),I=a("symbols"),N=a("op-symbols"),B=Object.prototype,W="function"==typeof R,G=r.QObject,U=!G||!G.prototype||!G.prototype.findChild,V=i&&f(function(){return 7!=O(k({},"a",{get:function(){return k(this,"a",{value:7}).a}})).a})?function(t,e,n){var r=j(B,e);r&&delete B[e],k(t,e,n),r&&t!==B&&k(B,e,r)}:k,H=function(t){var e=I[t]=O(R.prototype);return e._k=t,e},K=W&&"symbol"==typeof R.iterator?function(t){return"symbol"==typeof t}:function(t){return t instanceof R},J=function(t,e,n){return t===B&&J(N,e,n),b(t),e=w(e,!0),b(n),o(I,e)?(n.enumerable?(o(t,A)&&t[A][e]&&(t[A][e]=!1),n=O(n,{enumerable:x(0,!1)})):(o(t,A)||k(t,A,x(1,{})),t[A][e]=!0),V(t,e,n)):k(t,e,n)},Y=function(t,e){b(t);for(var n,r=_(e=m(e)),o=0,i=r.length;i>o;)J(t,n=r[o++],e[n]);return t},z=function(t,e){return void 0===e?O(t):Y(O(t),e)},Q=function(t){var e=F.call(this,t=w(t,!0));return!(this===B&&o(I,t)&&!o(N,t))&&(!(e||!o(this,t)||!o(I,t)||o(this,A)&&this[A][t])||e)},X=function(t,e){if(t=m(t),e=w(e,!0),t!==B||!o(I,e)||o(N,e)){var n=j(t,e);return!n||!o(I,e)||o(t,A)&&t[A][e]||(n.enumerable=!0),n}},Z=function(t){for(var e,n=E(m(t)),r=[],i=0;n.length>i;)o(I,e=n[i++])||e==A||e==s||r.push(e);return r},$=function(t){for(var e,n=t===B,r=E(n?N:m(t)),i=[],u=0;r.length>u;)!o(I,e=r[u++])||n&&!o(B,e)||i.push(I[e]);return i};
// 19.4.1.1 Symbol([description])
W||(R=function(){if(this instanceof R)throw TypeError("Symbol is not a constructor!");var t=p(arguments.length>0?arguments[0]:void 0),e=function(n){this===B&&e.call(N,n),o(this,A)&&o(this[A],t)&&(this[A][t]=!1),V(this,t,x(1,n))};return i&&U&&V(B,t,{configurable:!0,set:e}),H(t)},c(R.prototype,"toString",function(){return this._k}),S.f=X,P.f=J,n(56).f=M.f=Z,n(35).f=Q,n(55).f=$,i&&!n(23)&&c(B,"propertyIsEnumerable",Q,!0),d.f=function(t){return H(v(t))}),u(u.G+u.W+u.F*!W,{Symbol:R});for(var tt="hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),et=0;tt.length>et;)v(tt[et++]);for(var nt=L(v.store),rt=0;nt.length>rt;)h(nt[rt++]);u(u.S+u.F*!W,"Symbol",{
// 19.4.2.1 Symbol.for(key)
for:function(t){return o(q,t+="")?q[t]:q[t]=R(t)},
// 19.4.2.5 Symbol.keyFor(sym)
keyFor:function(t){if(!K(t))throw TypeError(t+" is not a symbol!");for(var e in q)if(q[e]===t)return e},useSetter:function(){U=!0},useSimple:function(){U=!1}}),u(u.S+u.F*!W,"Object",{
// 19.1.2.2 Object.create(O [, Properties])
create:z,
// 19.1.2.4 Object.defineProperty(O, P, Attributes)
defineProperty:J,
// 19.1.2.3 Object.defineProperties(O, Properties)
defineProperties:Y,
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
getOwnPropertyDescriptor:X,
// 19.1.2.7 Object.getOwnPropertyNames(O)
getOwnPropertyNames:Z,
// 19.1.2.8 Object.getOwnPropertySymbols(O)
getOwnPropertySymbols:$}),
// 24.3.2 JSON.stringify(value [, replacer [, space]])
T&&u(u.S+u.F*(!W||f(function(){var t=R();
// MS Edge converts symbol values to JSON as {}
// WebKit converts symbol values to JSON as null
// V8 throws on boxed symbols
return"[null]"!=C([t])||"{}"!=C({a:t})||"{}"!=C(Object(t))})),"JSON",{stringify:function(t){for(var e,n,r=[t],o=1;arguments.length>o;)r.push(arguments[o++]);if(n=e=r[1],(g(e)||void 0!==t)&&!K(t))// IE8 returns string on undefined
return y(e)||(e=function(t,e){if("function"==typeof n&&(e=n.call(this,t,e)),!K(e))return e}),r[1]=e,C.apply(T,r)}}),
// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
R.prototype[D]||n(8)(R.prototype,D,R.prototype.valueOf),
// 19.4.3.5 Symbol.prototype[@@toStringTag]
l(R,"Symbol"),
// 20.2.1.9 Math[@@toStringTag]
l(Math,"Math",!0),
// 24.3.3 JSON[@@toStringTag]
l(r.JSON,"JSON",!0)},/* 94 */
/***/
function(t,e,n){var r=n(19)("meta"),o=n(6),i=n(9),u=n(7).f,c=0,s=Object.isExtensible||function(){return!0},f=!n(13)(function(){return s(Object.preventExtensions({}))}),a=function(t){u(t,r,{value:{i:"O"+ ++c,// object ID
w:{}}})},l=function(t,e){
// return primitive with prefix
if(!o(t))return"symbol"==typeof t?t:("string"==typeof t?"S":"P")+t;if(!i(t,r)){
// can't set metadata to uncaught frozen object
if(!s(t))return"F";
// not necessary to add metadata
if(!e)return"E";
// add missing metadata
a(t)}return t[r].i},p=function(t,e){if(!i(t,r)){
// can't set metadata to uncaught frozen object
if(!s(t))return!0;
// not necessary to add metadata
if(!e)return!1;
// add missing metadata
a(t)}return t[r].w},v=function(t){return f&&d.NEED&&s(t)&&!i(t,r)&&a(t),t},d=t.exports={KEY:r,NEED:!1,fastKey:l,getWeak:p,onFreeze:v}},/* 95 */
/***/
function(t,e,n){
// all enumerable object keys, includes symbols
var r=n(20),o=n(55),i=n(35);t.exports=function(t){var e=r(t),n=o.f;if(n)for(var u,c=n(t),s=i.f,f=0;c.length>f;)s.call(t,u=c[f++])&&e.push(u);return e}},/* 96 */
/***/
function(t,e,n){
// 7.2.2 IsArray(argument)
var r=n(15);t.exports=Array.isArray||function(t){return"Array"==r(t)}},/* 97 */
/***/
function(t,e,n){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var r=n(10),o=n(56).f,i={}.toString,u="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],c=function(t){try{return o(t)}catch(t){return u.slice()}};t.exports.f=function(t){return u&&"[object Window]"==i.call(t)?c(t):o(r(t))}},/* 98 */
/***/
function(t,e,n){n(34)("asyncIterator")},/* 99 */
/***/
function(t,e,n){n(34)("observable")},/* 100 */
/***/
function(t,e,n){t.exports={default:n(101),__esModule:!0}},/* 101 */
/***/
function(t,e,n){n(102),t.exports=n(0).Object.setPrototypeOf},/* 102 */
/***/
function(t,e,n){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var r=n(3);r(r.S,"Object",{setPrototypeOf:n(103).set})},/* 103 */
/***/
function(t,e,n){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var r=n(6),o=n(4),i=function(t,e){if(o(t),!r(e)&&null!==e)throw TypeError(e+": can't set as prototype!")};t.exports={set:Object.setPrototypeOf||("__proto__"in{}?// eslint-disable-line
function(t,e,r){try{r=n(14)(Function.call,n(40).f(Object.prototype,"__proto__").set,2),r(t,[]),e=!(t instanceof Array)}catch(t){e=!0}return function(t,n){return i(t,n),e?t.__proto__=n:r(t,n),t}}({},!1):void 0),check:i}},/* 104 */
/***/
function(t,e,n){t.exports={default:n(105),__esModule:!0}},/* 105 */
/***/
function(t,e,n){n(106);var r=n(0).Object;t.exports=function(t,e){return r.create(t,e)}},/* 106 */
/***/
function(t,e,n){var r=n(3);
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
r(r.S,"Object",{create:n(31)})},/* 107 */
,/* 108 */
,/* 109 */
,/* 110 */
,/* 111 */
,/* 112 */
,/* 113 */
,/* 114 */
,/* 115 */
/***/
function(t,e,n){"use strict";function _interopRequireDefault(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(e,"__esModule",{value:!0});var r=n(63),o=_interopRequireDefault(r),i=n(11),u=_interopRequireDefault(i),c=n(12),s=_interopRequireDefault(c),f=n(64),a=_interopRequireDefault(f),l=n(65),p=_interopRequireDefault(l),v=n(116),d=_interopRequireDefault(v),h=function(t){function MiniBus(){return(0,u.default)(this,MiniBus),(0,a.default)(this,(MiniBus.__proto__||(0,o.default)(MiniBus)).call(this))}/**
   * Post a message for routing. Message is routed directly to the external routing _onPostMessage.
   * @param  {Message} inMsg            JSON with mandatory Message structure {id, type, from, to}
   * @param  {Callback} responseCallback Optional callback if a response is expected from the request. A response will be always sent, even if it is a "Timeout".
   * @return {number}                  the Message id
   */
return(0,p.default)(MiniBus,t),(0,s.default)(MiniBus,[{key:"postMessage",value:function(t,e,n){var r=this;
//always send to external (to core MessageBus)
return r._genId(t),r._responseCallback(t,e,n),r._onPostMessage(t),t.id}},{key:"_onMessage",value:function(t){var e=this;if(!e._onResponse(t)){var n=e._subscriptions[t.to];n?(e._publishOn(n,t),t.to.startsWith("hyperty")||e._publishOnDefault(t)):e._publishOnDefault(t)}}}]),MiniBus}(d.default);/**
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
e.default=h,t.exports=e.default},/* 116 */
/***/
function(t,e,n){"use strict";function _interopRequireDefault(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(e,"__esModule",{value:!0});var r=n(41),o=_interopRequireDefault(r),i=n(11),u=_interopRequireDefault(i),c=n(12),s=_interopRequireDefault(c),f=n(86),a=function(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);return e.default=t,e}(f),l=a.getLogger("Bus"),p=function(){/* private
  _msgId: number;
  _subscriptions: <url: MsgListener[]>
   _responseTimeOut: number
  _responseCallbacks: <url+id: (msg) => void>
   */
function Bus(){(0,u.default)(this,Bus);var t=this;t._msgId=0,t._subscriptions={},t._responseTimeOut=15e3,//default to 3s
t._responseCallbacks={},t._registerExternalListener()}/**
  * Register listener to receive message when "msg.to === url".
  * Special url "*" for default listener is accepted to intercept all messages.
  * @param {URL} url Address to intercept, tha is in the message "to"
  * @param {Listener} listener listener
  * @return {MsgListener} instance of MsgListener
  */
return(0,s.default)(Bus,[{key:"addListener",value:function(t,e){var n=this,r=new v(n._subscriptions,t,e),o=n._subscriptions[t];return o||(o=[],n._subscriptions[t]=o),o.push(r),r}},{key:"addResponseListener",value:function(t,e,n){this._responseCallbacks[t+e]=n}},{key:"removeResponseListener",value:function(t,e){delete this._responseCallbacks[t+e]}},{key:"removeAllListenersOf",value:function(t){delete this._subscriptions[t]}},{key:"bind",value:function(t,e,n){var r=this,o=this;return{thisListener:o.addListener(t,function(t){n.postMessage(t)}),targetListener:n.addListener(e,function(t){o.postMessage(t)}),unbind:function(){r.thisListener.remove(),r.targetListener.remove()}}}},{key:"_publishOnDefault",value:function(t){
//is there any "*" (default) listeners?
var e=this._subscriptions["*"];e&&this._publishOn(e,t)}},{key:"_publishOn",value:function(t,e){t.forEach(function(t){t._callback(e)})}},{key:"_responseCallback",value:function(t,e){var n=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],r=this;
//automatic management of response handlers
if(e){var o=t.from+t.id;r._responseCallbacks[o]=e,n&&setTimeout(function(){var e=r._responseCallbacks[o];if(delete r._responseCallbacks[o],e){e({id:t.id,type:"response",body:{code:408,desc:"Response timeout!",value:t}})}},r._responseTimeOut)}}},{key:"_onResponse",value:function(t){var e=this;if("response"===t.type){var n=t.to+t.id,r=e._responseCallbacks[n];if(t.body.code>=200&&
//if it's a provisional response, don't delete response listener
delete e._responseCallbacks[n],r)return r(t),!0}return!1}},{key:"_onMessage",value:function(t){var e=this;if(!e._onResponse(t)){var n=e._subscriptions[t.to];n?e._publishOn(n,t):e._publishOnDefault(t)}}},{key:"_genId",value:function(t){
//TODO: how do we manage message ID's? Should it be a global runtime counter, or per URL address?
//Global counter will not work, because there will be multiple MiniBus instances!
//Per URL, can be a lot of data to maintain!
//Maybe a counter per MiniBus instance. This is the assumed solution for now.
t.id&&0!==t.id||(this._msgId++,t.id=this._msgId)}},{key:"postMessage",value:function(t,e){}},{key:"postMessageWithRetries",value:function(t,e,n){var r=this,i=0,u=function(){return new o.default(function(e,o){r.postMessage(t,function(r){408===r.body.code||500===r.body.code?o():(l.info("[Bus.postMessageWithRetries] msg delivered: ",t),n(r),e())})})};!function tryAgain(){u().then(function(){},function(){if(l.warn("[Bus.postMessageWithRetries] Message Bounced (retry "+i+"): '",t),!(i++<e)){var n="[Error] Message Bounced (delivery attempts "+e+"): '";throw new Error(n+t)}tryAgain()})}()}},{key:"_onPostMessage",value:function(t){}},{key:"_registerExternalListener",value:function(){}}]),Bus}(),v=function(){/* private
  _subscriptions: <string: MsgListener[]>;
  _url: string;
  _callback: (msg) => void;
  */
function MsgListener(t,e,n){(0,u.default)(this,MsgListener);var r=this;r._subscriptions=t,r._url=e,r._callback=n}return(0,s.default)(MsgListener,[{key:"remove",/**
     * Remove this listener from the Bus
     */
value:function(){var t=this,e=t._subscriptions[t._url];if(e){var n=e.indexOf(t);e.splice(n,1),
//if there are no listeners, remove the subscription entirely.
0===e.length&&delete t._subscriptions[t._url]}}},{key:"url",get:function(){return this._url}}]),MsgListener}();e.default=p,t.exports=e.default},/* 117 */
,/* 118 */
,/* 119 */
,/* 120 */
,/* 121 */
,/* 122 */
,/* 123 */
,/* 124 */
,/* 125 */
,/* 126 */
,/* 127 */
,/* 128 */
,/* 129 */
,/* 130 */
,/* 131 */
,/* 132 */
,/* 133 */
,/* 134 */
,/* 135 */
/***/
function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=n(115),o=function(t){return t&&t.__esModule?t:{default:t}}(r);e.default=o.default,/**
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
t.exports=e.default}])});
},{}],3:[function(require,module,exports){
// version: 0.11.0
// date: Wed Jan 10 2018 16:54:02 GMT+0000 (WET)
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


// version: 0.11.0
// date: Wed Jan 10 2018 16:54:02 GMT+0000 (WET)
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


!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("sandbox",[],t):"object"==typeof exports?exports.sandbox=t():e.sandbox=t()}("undefined"!=typeof self?self:this,function(){/******/
return function(e){/******/
/******/
// The require function
/******/
function __webpack_require__(n){/******/
/******/
// Check if module is in cache
/******/
if(t[n])/******/
return t[n].exports;/******/
// Create a new module (and put it into the cache)
/******/
var r=t[n]={/******/
i:n,/******/
l:!1,/******/
exports:{}};/******/
/******/
// Return the exports of the module
/******/
/******/
/******/
// Execute the module function
/******/
/******/
/******/
// Flag the module as loaded
/******/
return e[n].call(r.exports,r,r.exports,__webpack_require__),r.l=!0,r.exports}// webpackBootstrap
/******/
// The module cache
/******/
var t={};/******/
/******/
// Load entry module and return exports
/******/
/******/
/******/
/******/
// expose the modules object (__webpack_modules__)
/******/
/******/
/******/
// expose the module cache
/******/
/******/
/******/
// define getter function for harmony exports
/******/
/******/
/******/
// getDefaultExport function for compatibility with non-harmony modules
/******/
/******/
/******/
// Object.prototype.hasOwnProperty.call
/******/
/******/
/******/
// __webpack_public_path__
/******/
return __webpack_require__.m=e,__webpack_require__.c=t,__webpack_require__.d=function(e,t,n){/******/
__webpack_require__.o(e,t)||/******/
Object.defineProperty(e,t,{/******/
configurable:!1,/******/
enumerable:!0,/******/
get:n})},__webpack_require__.n=function(e){/******/
var t=e&&e.__esModule?/******/
function(){return e.default}:/******/
function(){return e};/******/
/******/
return __webpack_require__.d(t,"a",t),t},__webpack_require__.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},__webpack_require__.p="",__webpack_require__(__webpack_require__.s=133)}([/* 0 */
/***/
function(e,t){var n=e.exports={version:"2.5.3"};"number"==typeof __e&&(__e=n)},/* 1 */
/***/
function(e,t){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var n=e.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=n)},/* 2 */
/***/
function(e,t,n){var r=n(28)("wks"),o=n(19),i=n(1).Symbol,u="function"==typeof i;(e.exports=function(e){return r[e]||(r[e]=u&&i[e]||(u?i:o)("Symbol."+e))}).store=r},/* 3 */
/***/
function(e,t,n){var r=n(1),o=n(0),i=n(14),u=n(8),s=function(e,t,n){var c,a,f,l=e&s.F,p=e&s.G,d=e&s.S,v=e&s.P,y=e&s.B,_=e&s.W,h=p?o:o[t]||(o[t]={}),b=h.prototype,g=p?r:d?r[t]:(r[t]||{}).prototype;p&&(n=t);for(c in n)
// contains in native
(a=!l&&g&&void 0!==g[c])&&c in h||(
// export native or passed
f=a?g[c]:n[c],
// prevent global pollution for namespaces
h[c]=p&&"function"!=typeof g[c]?n[c]:y&&a?i(f,r):_&&g[c]==f?function(e){var t=function(t,n,r){if(this instanceof e){switch(arguments.length){case 0:return new e;case 1:return new e(t);case 2:return new e(t,n)}return new e(t,n,r)}return e.apply(this,arguments)};return t.prototype=e.prototype,t}(f):v&&"function"==typeof f?i(Function.call,f):f,
// export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
v&&((h.virtual||(h.virtual={}))[c]=f,
// export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
e&s.R&&b&&!b[c]&&u(b,c,f)))};
// type bitmap
s.F=1,// forced
s.G=2,// global
s.S=4,// static
s.P=8,// proto
s.B=16,// bind
s.W=32,// wrap
s.U=64,// safe
s.R=128,// real proto method for `library`
e.exports=s},/* 4 */
/***/
function(e,t,n){var r=n(6);e.exports=function(e){if(!r(e))throw TypeError(e+" is not an object!");return e}},/* 5 */
/***/
function(e,t,n){
// Thank's IE8 for his funny defineProperty
e.exports=!n(13)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},/* 6 */
/***/
function(e,t){e.exports=function(e){return"object"==typeof e?null!==e:"function"==typeof e}},/* 7 */
/***/
function(e,t,n){var r=n(4),o=n(36),i=n(26),u=Object.defineProperty;t.f=n(5)?Object.defineProperty:function(e,t,n){if(r(e),t=i(t,!0),r(n),o)try{return u(e,t,n)}catch(e){}if("get"in n||"set"in n)throw TypeError("Accessors not supported!");return"value"in n&&(e[t]=n.value),e}},/* 8 */
/***/
function(e,t,n){var r=n(7),o=n(18);e.exports=n(5)?function(e,t,n){return r.f(e,t,o(1,n))}:function(e,t,n){return e[t]=n,e}},/* 9 */
/***/
function(e,t){var n={}.hasOwnProperty;e.exports=function(e,t){return n.call(e,t)}},/* 10 */
/***/
function(e,t,n){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var r=n(57),o=n(22);e.exports=function(e){return r(o(e))}},/* 11 */
/***/
function(e,t,n){"use strict";t.__esModule=!0,t.default=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}},/* 12 */
/***/
function(e,t,n){"use strict";t.__esModule=!0;var r=n(60),o=function(e){return e&&e.__esModule?e:{default:e}}(r);t.default=function(){function defineProperties(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),(0,o.default)(e,r.key,r)}}return function(e,t,n){return t&&defineProperties(e.prototype,t),n&&defineProperties(e,n),e}}()},/* 13 */
/***/
function(e,t){e.exports=function(e){try{return!!e()}catch(e){return!0}}},/* 14 */
/***/
function(e,t,n){
// optional / simple context binding
var r=n(17);e.exports=function(e,t,n){if(r(e),void 0===t)return e;switch(n){case 1:return function(n){return e.call(t,n)};case 2:return function(n,r){return e.call(t,n,r)};case 3:return function(n,r,o){return e.call(t,n,r,o)}}return function(){return e.apply(t,arguments)}}},/* 15 */
/***/
function(e,t){var n={}.toString;e.exports=function(e){return n.call(e).slice(8,-1)}},/* 16 */
/***/
function(e,t){e.exports={}},/* 17 */
/***/
function(e,t){e.exports=function(e){if("function"!=typeof e)throw TypeError(e+" is not a function!");return e}},/* 18 */
/***/
function(e,t){e.exports=function(e,t){return{enumerable:!(1&e),configurable:!(2&e),writable:!(4&e),value:t}}},/* 19 */
/***/
function(e,t){var n=0,r=Math.random();e.exports=function(e){return"Symbol(".concat(void 0===e?"":e,")_",(++n+r).toString(36))}},/* 20 */
/***/
function(e,t,n){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var r=n(37),o=n(29);e.exports=Object.keys||function(e){return r(e,o)}},/* 21 */
/***/
function(e,t){
// 7.1.4 ToInteger
var n=Math.ceil,r=Math.floor;e.exports=function(e){return isNaN(e=+e)?0:(e>0?r:n)(e)}},/* 22 */
/***/
function(e,t){
// 7.2.1 RequireObjectCoercible(argument)
e.exports=function(e){if(void 0==e)throw TypeError("Can't call method on  "+e);return e}},/* 23 */
/***/
function(e,t){e.exports=!0},/* 24 */
/***/
function(e,t,n){var r=n(7).f,o=n(9),i=n(2)("toStringTag");e.exports=function(e,t,n){e&&!o(e=n?e:e.prototype,i)&&r(e,i,{configurable:!0,value:t})}},/* 25 */
/***/
function(e,t,n){var r=n(6),o=n(1).document,i=r(o)&&r(o.createElement);e.exports=function(e){return i?o.createElement(e):{}}},/* 26 */
/***/
function(e,t,n){
// 7.1.1 ToPrimitive(input [, PreferredType])
var r=n(6);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
e.exports=function(e,t){if(!r(e))return e;var n,o;if(t&&"function"==typeof(n=e.toString)&&!r(o=n.call(e)))return o;if("function"==typeof(n=e.valueOf)&&!r(o=n.call(e)))return o;if(!t&&"function"==typeof(n=e.toString)&&!r(o=n.call(e)))return o;throw TypeError("Can't convert object to primitive value")}},/* 27 */
/***/
function(e,t,n){var r=n(28)("keys"),o=n(19);e.exports=function(e){return r[e]||(r[e]=o(e))}},/* 28 */
/***/
function(e,t,n){var r=n(1),o=r["__core-js_shared__"]||(r["__core-js_shared__"]={});e.exports=function(e){return o[e]||(o[e]={})}},/* 29 */
/***/
function(e,t){
// IE 8- don't enum bug keys
e.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},/* 30 */
/***/
function(e,t,n){
// 7.1.13 ToObject(argument)
var r=n(22);e.exports=function(e){return Object(r(e))}},/* 31 */
/***/
function(e,t,n){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var r=n(4),o=n(69),i=n(29),u=n(27)("IE_PROTO"),s=function(){},c=function(){
// Thrash, waste and sodomy: IE GC bug
var e,t=n(25)("iframe"),r=i.length;for(t.style.display="none",n(46).appendChild(t),t.src="javascript:",// eslint-disable-line no-script-url
// createDict = iframe.contentWindow.Object;
// html.removeChild(iframe);
e=t.contentWindow.document,e.open(),e.write("<script>document.F=Object<\/script>"),e.close(),c=e.F;r--;)delete c.prototype[i[r]];return c()};e.exports=Object.create||function(e,t){var n;
// add "__proto__" for Object.getPrototypeOf polyfill
return null!==e?(s.prototype=r(e),n=new s,s.prototype=null,n[u]=e):n=c(),void 0===t?n:o(n,t)}},/* 32 */
/***/
function(e,t,n){"use strict";function PromiseCapability(e){var t,n;this.promise=new e(function(e,r){if(void 0!==t||void 0!==n)throw TypeError("Bad Promise constructor");t=e,n=r}),this.resolve=r(t),this.reject=r(n)}
// 25.4.1.5 NewPromiseCapability(C)
var r=n(17);e.exports.f=function(e){return new PromiseCapability(e)}},/* 33 */
/***/
function(e,t,n){t.f=n(2)},/* 34 */
/***/
function(e,t,n){var r=n(1),o=n(0),i=n(23),u=n(33),s=n(7).f;e.exports=function(e){var t=o.Symbol||(o.Symbol=i?{}:r.Symbol||{});"_"==e.charAt(0)||e in t||s(t,e,{value:u.f(e)})}},/* 35 */
/***/
function(e,t){t.f={}.propertyIsEnumerable},/* 36 */
/***/
function(e,t,n){e.exports=!n(5)&&!n(13)(function(){return 7!=Object.defineProperty(n(25)("div"),"a",{get:function(){return 7}}).a})},/* 37 */
/***/
function(e,t,n){var r=n(9),o=n(10),i=n(58)(!1),u=n(27)("IE_PROTO");e.exports=function(e,t){var n,s=o(e),c=0,a=[];for(n in s)n!=u&&r(s,n)&&a.push(n);
// Don't enum bug & hidden keys
for(;t.length>c;)r(s,n=t[c++])&&(~i(a,n)||a.push(n));return a}},/* 38 */
/***/
function(e,t,n){
// 7.1.15 ToLength
var r=n(21),o=Math.min;e.exports=function(e){return e>0?o(r(e),9007199254740991):0}},/* 39 */
/***/
function(e,t,n){
// most Object methods by ES6 should accept primitives
var r=n(3),o=n(0),i=n(13);e.exports=function(e,t){var n=(o.Object||{})[e]||Object[e],u={};u[e]=t(n),r(r.S+r.F*i(function(){n(1)}),"Object",u)}},/* 40 */
/***/
function(e,t,n){var r=n(35),o=n(18),i=n(10),u=n(26),s=n(9),c=n(36),a=Object.getOwnPropertyDescriptor;t.f=n(5)?a:function(e,t){if(e=i(e),t=u(t,!0),c)try{return a(e,t)}catch(e){}if(s(e,t))return o(!r.f.call(e,t),e[t])}},/* 41 */
/***/
function(e,t,n){e.exports={default:n(66),__esModule:!0}},/* 42 */
/***/
function(e,t){},/* 43 */
/***/
function(e,t,n){"use strict";var r=n(67)(!0);
// 21.1.3.27 String.prototype[@@iterator]()
n(44)(String,"String",function(e){this._t=String(e),// target
this._i=0},function(){var e,t=this._t,n=this._i;return n>=t.length?{value:void 0,done:!0}:(e=r(t,n),this._i+=e.length,{value:e,done:!1})})},/* 44 */
/***/
function(e,t,n){"use strict";var r=n(23),o=n(3),i=n(45),u=n(8),s=n(9),c=n(16),a=n(68),f=n(24),l=n(47),p=n(2)("iterator"),d=!([].keys&&"next"in[].keys()),v=function(){return this};e.exports=function(e,t,n,y,_,h,b){a(n,t,y);var g,m,x,w=function(e){if(!d&&e in P)return P[e];switch(e){case"keys":case"values":return function(){return new n(this,e)}}return function(){return new n(this,e)}},O=t+" Iterator",S="values"==_,M=!1,P=e.prototype,k=P[p]||P["@@iterator"]||_&&P[_],R=!d&&k||w(_),L=_?S?w("entries"):R:void 0,j="Array"==t?P.entries||k:k;if(
// Fix native
j&&(x=l(j.call(new e)))!==Object.prototype&&x.next&&(
// Set @@toStringTag to native iterators
f(x,O,!0),
// fix for some old engines
r||s(x,p)||u(x,p,v)),
// fix Array#{values, @@iterator}.name in V8 / FF
S&&k&&"values"!==k.name&&(M=!0,R=function(){return k.call(this)}),
// Define iterator
r&&!b||!d&&!M&&P[p]||u(P,p,R),
// Plug for library
c[t]=R,c[O]=v,_)if(g={values:S?R:w("values"),keys:h?R:w("keys"),entries:L},b)for(m in g)m in P||i(P,m,g[m]);else o(o.P+o.F*(d||M),t,g);return g}},/* 45 */
/***/
function(e,t,n){e.exports=n(8)},/* 46 */
/***/
function(e,t,n){var r=n(1).document;e.exports=r&&r.documentElement},/* 47 */
/***/
function(e,t,n){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var r=n(9),o=n(30),i=n(27)("IE_PROTO"),u=Object.prototype;e.exports=Object.getPrototypeOf||function(e){return e=o(e),r(e,i)?e[i]:"function"==typeof e.constructor&&e instanceof e.constructor?e.constructor.prototype:e instanceof Object?u:null}},/* 48 */
/***/
function(e,t,n){n(70);for(var r=n(1),o=n(8),i=n(16),u=n(2)("toStringTag"),s="CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,TextTrackList,TouchList".split(","),c=0;c<s.length;c++){var a=s[c],f=r[a],l=f&&f.prototype;l&&!l[u]&&o(l,u,a),i[a]=i.Array}},/* 49 */
/***/
function(e,t,n){
// getting tag from 19.1.3.6 Object.prototype.toString()
var r=n(15),o=n(2)("toStringTag"),i="Arguments"==r(function(){return arguments}()),u=function(e,t){try{return e[t]}catch(e){}};e.exports=function(e){var t,n,s;return void 0===e?"Undefined":null===e?"Null":"string"==typeof(n=u(t=Object(e),o))?n:i?r(t):"Object"==(s=r(t))&&"function"==typeof t.callee?"Arguments":s}},/* 50 */
/***/
function(e,t,n){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var r=n(4),o=n(17),i=n(2)("species");e.exports=function(e,t){var n,u=r(e).constructor;return void 0===u||void 0==(n=r(u)[i])?t:o(n)}},/* 51 */
/***/
function(e,t,n){var r,o,i,u=n(14),s=n(79),c=n(46),a=n(25),f=n(1),l=f.process,p=f.setImmediate,d=f.clearImmediate,v=f.MessageChannel,y=f.Dispatch,_=0,h={},b=function(){var e=+this;
// eslint-disable-next-line no-prototype-builtins
if(h.hasOwnProperty(e)){var t=h[e];delete h[e],t()}},g=function(e){b.call(e.data)};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
p&&d||(p=function(e){for(var t=[],n=1;arguments.length>n;)t.push(arguments[n++]);return h[++_]=function(){
// eslint-disable-next-line no-new-func
s("function"==typeof e?e:Function(e),t)},r(_),_},d=function(e){delete h[e]},
// Node.js 0.8-
"process"==n(15)(l)?r=function(e){l.nextTick(u(b,e,1))}:y&&y.now?r=function(e){y.now(u(b,e,1))}:v?(o=new v,i=o.port2,o.port1.onmessage=g,r=u(i.postMessage,i,1)):f.addEventListener&&"function"==typeof postMessage&&!f.importScripts?(r=function(e){f.postMessage(e+"","*")},f.addEventListener("message",g,!1)):r="onreadystatechange"in a("script")?function(e){c.appendChild(a("script")).onreadystatechange=function(){c.removeChild(this),b.call(e)}}:function(e){setTimeout(u(b,e,1),0)}),e.exports={set:p,clear:d}},/* 52 */
/***/
function(e,t){e.exports=function(e){try{return{e:!1,v:e()}}catch(e){return{e:!0,v:e}}}},/* 53 */
/***/
function(e,t,n){var r=n(4),o=n(6),i=n(32);e.exports=function(e,t){if(r(e),o(t)&&t.constructor===e)return t;var n=i.f(e);return(0,n.resolve)(t),n.promise}},/* 54 */
/***/
function(e,t,n){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}t.__esModule=!0;var r=n(89),o=_interopRequireDefault(r),i=n(91),u=_interopRequireDefault(i),s="function"==typeof u.default&&"symbol"==typeof o.default?function(e){return typeof e}:function(e){return e&&"function"==typeof u.default&&e.constructor===u.default&&e!==u.default.prototype?"symbol":typeof e};t.default="function"==typeof u.default&&"symbol"===s(o.default)?function(e){return void 0===e?"undefined":s(e)}:function(e){return e&&"function"==typeof u.default&&e.constructor===u.default&&e!==u.default.prototype?"symbol":void 0===e?"undefined":s(e)}},/* 55 */
/***/
function(e,t){t.f=Object.getOwnPropertySymbols},/* 56 */
/***/
function(e,t,n){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var r=n(37),o=n(29).concat("length","prototype");t.f=Object.getOwnPropertyNames||function(e){return r(e,o)}},/* 57 */
/***/
function(e,t,n){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var r=n(15);
// eslint-disable-next-line no-prototype-builtins
e.exports=Object("z").propertyIsEnumerable(0)?Object:function(e){return"String"==r(e)?e.split(""):Object(e)}},/* 58 */
/***/
function(e,t,n){
// false -> Array#indexOf
// true  -> Array#includes
var r=n(10),o=n(38),i=n(59);e.exports=function(e){return function(t,n,u){var s,c=r(t),a=o(c.length),f=i(u,a);
// Array#includes uses SameValueZero equality algorithm
// eslint-disable-next-line no-self-compare
if(e&&n!=n){for(;a>f;)
// eslint-disable-next-line no-self-compare
if((s=c[f++])!=s)return!0}else for(;a>f;f++)if((e||f in c)&&c[f]===n)return e||f||0;return!e&&-1}}},/* 59 */
/***/
function(e,t,n){var r=n(21),o=Math.max,i=Math.min;e.exports=function(e,t){return e=r(e),e<0?o(e+t,0):i(e,t)}},/* 60 */
/***/
function(e,t,n){e.exports={default:n(61),__esModule:!0}},/* 61 */
/***/
function(e,t,n){n(62);var r=n(0).Object;e.exports=function(e,t,n){return r.defineProperty(e,t,n)}},/* 62 */
/***/
function(e,t,n){var r=n(3);
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
r(r.S+r.F*!n(5),"Object",{defineProperty:n(7).f})},/* 63 */
/***/
function(e,t,n){e.exports={default:n(87),__esModule:!0}},/* 64 */
/***/
function(e,t,n){"use strict";t.__esModule=!0;var r=n(54),o=function(e){return e&&e.__esModule?e:{default:e}}(r);t.default=function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!==(void 0===t?"undefined":(0,o.default)(t))&&"function"!=typeof t?e:t}},/* 65 */
/***/
function(e,t,n){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}t.__esModule=!0;var r=n(100),o=_interopRequireDefault(r),i=n(104),u=_interopRequireDefault(i),s=n(54),c=_interopRequireDefault(s);t.default=function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+(void 0===t?"undefined":(0,c.default)(t)));e.prototype=(0,u.default)(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(o.default?(0,o.default)(e,t):e.__proto__=t)}},/* 66 */
/***/
function(e,t,n){n(42),n(43),n(48),n(73),n(84),n(85),e.exports=n(0).Promise},/* 67 */
/***/
function(e,t,n){var r=n(21),o=n(22);
// true  -> String#at
// false -> String#codePointAt
e.exports=function(e){return function(t,n){var i,u,s=String(o(t)),c=r(n),a=s.length;return c<0||c>=a?e?"":void 0:(i=s.charCodeAt(c),i<55296||i>56319||c+1===a||(u=s.charCodeAt(c+1))<56320||u>57343?e?s.charAt(c):i:e?s.slice(c,c+2):u-56320+(i-55296<<10)+65536)}}},/* 68 */
/***/
function(e,t,n){"use strict";var r=n(31),o=n(18),i=n(24),u={};
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
n(8)(u,n(2)("iterator"),function(){return this}),e.exports=function(e,t,n){e.prototype=r(u,{next:o(1,n)}),i(e,t+" Iterator")}},/* 69 */
/***/
function(e,t,n){var r=n(7),o=n(4),i=n(20);e.exports=n(5)?Object.defineProperties:function(e,t){o(e);for(var n,u=i(t),s=u.length,c=0;s>c;)r.f(e,n=u[c++],t[n]);return e}},/* 70 */
/***/
function(e,t,n){"use strict";var r=n(71),o=n(72),i=n(16),u=n(10);
// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
e.exports=n(44)(Array,"Array",function(e,t){this._t=u(e),// target
this._i=0,// next index
this._k=t},function(){var e=this._t,t=this._k,n=this._i++;return!e||n>=e.length?(this._t=void 0,o(1)):"keys"==t?o(0,n):"values"==t?o(0,e[n]):o(0,[n,e[n]])},"values"),
// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
i.Arguments=i.Array,r("keys"),r("values"),r("entries")},/* 71 */
/***/
function(e,t){e.exports=function(){}},/* 72 */
/***/
function(e,t){e.exports=function(e,t){return{value:t,done:!!e}}},/* 73 */
/***/
function(e,t,n){"use strict";var r,o,i,u,s=n(23),c=n(1),a=n(14),f=n(49),l=n(3),p=n(6),d=n(17),v=n(74),y=n(75),_=n(50),h=n(51).set,b=n(80)(),g=n(32),m=n(52),x=n(53),w=c.TypeError,O=c.process,S=c.Promise,M="process"==f(O),P=function(){},k=o=g.f,R=!!function(){try{
// correct subclassing with @@species support
var e=S.resolve(1),t=(e.constructor={})[n(2)("species")]=function(e){e(P,P)};
// unhandled rejections tracking support, NodeJS Promise without it fails @@species test
return(M||"function"==typeof PromiseRejectionEvent)&&e.then(P)instanceof t}catch(e){}}(),L=function(e){var t;return!(!p(e)||"function"!=typeof(t=e.then))&&t},j=function(e,t){if(!e._n){e._n=!0;var n=e._c;b(function(){for(var r=e._v,o=1==e._s,i=0;n.length>i;)!function(t){var n,i,u=o?t.ok:t.fail,s=t.resolve,c=t.reject,a=t.domain;try{u?(o||(2==e._h&&T(e),e._h=1),!0===u?n=r:(a&&a.enter(),n=u(r),a&&a.exit()),n===t.promise?c(w("Promise-chain cycle")):(i=L(n))?i.call(n,s,c):s(n)):c(r)}catch(e){c(e)}}(n[i++]);// variable length - can't use forEach
e._c=[],e._n=!1,t&&!e._h&&D(e)})}},D=function(e){h.call(c,function(){var t,n,r,o=e._v,i=E(e);if(i&&(t=m(function(){M?O.emit("unhandledRejection",o,e):(n=c.onunhandledrejection)?n({promise:e,reason:o}):(r=c.console)&&r.error&&r.error("Unhandled promise rejection",o)}),
// Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
e._h=M||E(e)?2:1),e._a=void 0,i&&t.e)throw t.v})},E=function(e){return 1!==e._h&&0===(e._a||e._c).length},T=function(e){h.call(c,function(){var t;M?O.emit("rejectionHandled",e):(t=c.onrejectionhandled)&&t({promise:e,reason:e._v})})},q=function(e){var t=this;t._d||(t._d=!0,t=t._w||t,// unwrap
t._v=e,t._s=2,t._a||(t._a=t._c.slice()),j(t,!0))},A=function(e){var t,n=this;if(!n._d){n._d=!0,n=n._w||n;// unwrap
try{if(n===e)throw w("Promise can't be resolved itself");(t=L(e))?b(function(){var r={_w:n,_d:!1};// wrap
try{t.call(e,a(A,r,1),a(q,r,1))}catch(e){q.call(r,e)}}):(n._v=e,n._s=1,j(n,!1))}catch(e){q.call({_w:n,_d:!1},e)}}};
// constructor polyfill
R||(
// 25.4.3.1 Promise(executor)
S=function(e){v(this,S,"Promise","_h"),d(e),r.call(this);try{e(a(A,this,1),a(q,this,1))}catch(e){q.call(this,e)}},
// eslint-disable-next-line no-unused-vars
r=function(e){this._c=[],// <- awaiting reactions
this._a=void 0,// <- checked in isUnhandled reactions
this._s=0,// <- state
this._d=!1,// <- done
this._v=void 0,// <- value
this._h=0,// <- rejection state, 0 - default, 1 - handled, 2 - unhandled
this._n=!1},r.prototype=n(81)(S.prototype,{
// 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
then:function(e,t){var n=k(_(this,S));return n.ok="function"!=typeof e||e,n.fail="function"==typeof t&&t,n.domain=M?O.domain:void 0,this._c.push(n),this._a&&this._a.push(n),this._s&&j(this,!1),n.promise},
// 25.4.5.1 Promise.prototype.catch(onRejected)
catch:function(e){return this.then(void 0,e)}}),i=function(){var e=new r;this.promise=e,this.resolve=a(A,e,1),this.reject=a(q,e,1)},g.f=k=function(e){return e===S||e===u?new i(e):o(e)}),l(l.G+l.W+l.F*!R,{Promise:S}),n(24)(S,"Promise"),n(82)("Promise"),u=n(0).Promise,
// statics
l(l.S+l.F*!R,"Promise",{
// 25.4.4.5 Promise.reject(r)
reject:function(e){var t=k(this);return(0,t.reject)(e),t.promise}}),l(l.S+l.F*(s||!R),"Promise",{
// 25.4.4.6 Promise.resolve(x)
resolve:function(e){return x(s&&this===u?S:this,e)}}),l(l.S+l.F*!(R&&n(83)(function(e){S.all(e).catch(P)})),"Promise",{
// 25.4.4.1 Promise.all(iterable)
all:function(e){var t=this,n=k(t),r=n.resolve,o=n.reject,i=m(function(){var n=[],i=0,u=1;y(e,!1,function(e){var s=i++,c=!1;n.push(void 0),u++,t.resolve(e).then(function(e){c||(c=!0,n[s]=e,--u||r(n))},o)}),--u||r(n)});return i.e&&o(i.v),n.promise},
// 25.4.4.4 Promise.race(iterable)
race:function(e){var t=this,n=k(t),r=n.reject,o=m(function(){y(e,!1,function(e){t.resolve(e).then(n.resolve,r)})});return o.e&&r(o.v),n.promise}})},/* 74 */
/***/
function(e,t){e.exports=function(e,t,n,r){if(!(e instanceof t)||void 0!==r&&r in e)throw TypeError(n+": incorrect invocation!");return e}},/* 75 */
/***/
function(e,t,n){var r=n(14),o=n(76),i=n(77),u=n(4),s=n(38),c=n(78),a={},f={},t=e.exports=function(e,t,n,l,p){var d,v,y,_,h=p?function(){return e}:c(e),b=r(n,l,t?2:1),g=0;if("function"!=typeof h)throw TypeError(e+" is not iterable!");
// fast case for arrays with default iterator
if(i(h)){for(d=s(e.length);d>g;g++)if((_=t?b(u(v=e[g])[0],v[1]):b(e[g]))===a||_===f)return _}else for(y=h.call(e);!(v=y.next()).done;)if((_=o(y,b,v.value,t))===a||_===f)return _};t.BREAK=a,t.RETURN=f},/* 76 */
/***/
function(e,t,n){
// call something on iterator step with safe closing on error
var r=n(4);e.exports=function(e,t,n,o){try{return o?t(r(n)[0],n[1]):t(n)}catch(t){var i=e.return;throw void 0!==i&&r(i.call(e)),t}}},/* 77 */
/***/
function(e,t,n){
// check on default Array iterator
var r=n(16),o=n(2)("iterator"),i=Array.prototype;e.exports=function(e){return void 0!==e&&(r.Array===e||i[o]===e)}},/* 78 */
/***/
function(e,t,n){var r=n(49),o=n(2)("iterator"),i=n(16);e.exports=n(0).getIteratorMethod=function(e){if(void 0!=e)return e[o]||e["@@iterator"]||i[r(e)]}},/* 79 */
/***/
function(e,t){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
e.exports=function(e,t,n){var r=void 0===n;switch(t.length){case 0:return r?e():e.call(n);case 1:return r?e(t[0]):e.call(n,t[0]);case 2:return r?e(t[0],t[1]):e.call(n,t[0],t[1]);case 3:return r?e(t[0],t[1],t[2]):e.call(n,t[0],t[1],t[2]);case 4:return r?e(t[0],t[1],t[2],t[3]):e.call(n,t[0],t[1],t[2],t[3])}return e.apply(n,t)}},/* 80 */
/***/
function(e,t,n){var r=n(1),o=n(51).set,i=r.MutationObserver||r.WebKitMutationObserver,u=r.process,s=r.Promise,c="process"==n(15)(u);e.exports=function(){var e,t,n,a=function(){var r,o;for(c&&(r=u.domain)&&r.exit();e;){o=e.fn,e=e.next;try{o()}catch(r){throw e?n():t=void 0,r}}t=void 0,r&&r.enter()};
// Node.js
if(c)n=function(){u.nextTick(a)};else if(!i||r.navigator&&r.navigator.standalone)if(s&&s.resolve){var f=s.resolve();n=function(){f.then(a)}}else n=function(){
// strange IE + webpack dev server bug - use .call(global)
o.call(r,a)};else{var l=!0,p=document.createTextNode("");new i(a).observe(p,{characterData:!0}),// eslint-disable-line no-new
n=function(){p.data=l=!l}}return function(r){var o={fn:r,next:void 0};t&&(t.next=o),e||(e=o,n()),t=o}}},/* 81 */
/***/
function(e,t,n){var r=n(8);e.exports=function(e,t,n){for(var o in t)n&&e[o]?e[o]=t[o]:r(e,o,t[o]);return e}},/* 82 */
/***/
function(e,t,n){"use strict";var r=n(1),o=n(0),i=n(7),u=n(5),s=n(2)("species");e.exports=function(e){var t="function"==typeof o[e]?o[e]:r[e];u&&t&&!t[s]&&i.f(t,s,{configurable:!0,get:function(){return this}})}},/* 83 */
/***/
function(e,t,n){var r=n(2)("iterator"),o=!1;try{var i=[7][r]();i.return=function(){o=!0},
// eslint-disable-next-line no-throw-literal
Array.from(i,function(){throw 2})}catch(e){}e.exports=function(e,t){if(!t&&!o)return!1;var n=!1;try{var i=[7],u=i[r]();u.next=function(){return{done:n=!0}},i[r]=function(){return u},e(i)}catch(e){}return n}},/* 84 */
/***/
function(e,t,n){"use strict";
// https://github.com/tc39/proposal-promise-finally
var r=n(3),o=n(0),i=n(1),u=n(50),s=n(53);r(r.P+r.R,"Promise",{finally:function(e){var t=u(this,o.Promise||i.Promise),n="function"==typeof e;return this.then(n?function(n){return s(t,e()).then(function(){return n})}:e,n?function(n){return s(t,e()).then(function(){throw n})}:e)}})},/* 85 */
/***/
function(e,t,n){"use strict";
// https://github.com/tc39/proposal-promise-try
var r=n(3),o=n(32),i=n(52);r(r.S,"Promise",{try:function(e){var t=o.f(this),n=i(e);return(n.e?t.reject:t.resolve)(n.v),t.promise}})},/* 86 */
/***/
function(e,t,n){var r,o;/*
* loglevel - https://github.com/pimterry/loglevel
*
* Copyright (c) 2013 Tim Perry
* Licensed under the MIT license.
*/
!function(i,u){"use strict";r=u,void 0!==(o="function"==typeof r?r.call(t,n,t,e):r)&&(e.exports=o)}(0,function(){"use strict";
// Cross-browser bind equivalent that works at least back to IE6
function bindMethod(e,t){var n=e[t];if("function"==typeof n.bind)return n.bind(e);try{return Function.prototype.bind.call(n,e)}catch(t){
// Missing bind shim or IE8 + Modernizr, fallback to wrapping
return function(){return Function.prototype.apply.apply(n,[e,arguments])}}}
// Build the best logging method possible for this env
// Wherever possible we want to bind, not wrap, to preserve stack traces
function realMethod(n){return"debug"===n&&(n="log"),typeof console!==t&&(void 0!==console[n]?bindMethod(console,n):void 0!==console.log?bindMethod(console,"log"):e)}
// These private functions always need `this` to be set properly
function replaceLoggingMethods(t,r){/*jshint validthis:true */
for(var o=0;o<n.length;o++){var i=n[o];this[i]=o<t?e:this.methodFactory(i,t,r)}
// Define log.log as an alias for log.debug
this.log=this.debug}
// In old IE versions, the console isn't present until you first open it.
// We build realMethod() replacements here that regenerate logging methods
function enableLoggingWhenConsoleArrives(e,n,r){return function(){typeof console!==t&&(replaceLoggingMethods.call(this,n,r),this[e].apply(this,arguments))}}
// By default, we use closely bound real methods wherever possible, and
// otherwise we wait for a console to appear, and then try again.
function defaultMethodFactory(e,t,n){/*jshint validthis:true */
return realMethod(e)||enableLoggingWhenConsoleArrives.apply(this,arguments)}function Logger(e,r,o){function persistLevelIfPossible(e){var r=(n[e]||"silent").toUpperCase();if(typeof window!==t){
// Use localStorage if available
try{return void(window.localStorage[s]=r)}catch(e){}
// Use session cookie as fallback
try{window.document.cookie=encodeURIComponent(s)+"="+r+";"}catch(e){}}}function getPersistedLevel(){var e;if(typeof window!==t){try{e=window.localStorage[s]}catch(e){}
// Fallback to cookies if local storage gives us nothing
if(typeof e===t)try{var n=window.document.cookie,r=n.indexOf(encodeURIComponent(s)+"=");-1!==r&&(e=/^([^;]+)/.exec(n.slice(r))[1])}catch(e){}
// If the stored level is not valid, treat it as if nothing was stored.
return void 0===u.levels[e]&&(e=void 0),e}}var i,u=this,s="loglevel";e&&(s+=":"+e),/*
       *
       * Public logger API - see https://github.com/pimterry/loglevel for details
       *
       */
u.name=e,u.levels={TRACE:0,DEBUG:1,INFO:2,WARN:3,ERROR:4,SILENT:5},u.methodFactory=o||defaultMethodFactory,u.getLevel=function(){return i},u.setLevel=function(n,r){if("string"==typeof n&&void 0!==u.levels[n.toUpperCase()]&&(n=u.levels[n.toUpperCase()]),!("number"==typeof n&&n>=0&&n<=u.levels.SILENT))throw"log.setLevel() called with invalid level: "+n;if(i=n,!1!==r&&// defaults to true
persistLevelIfPossible(n),replaceLoggingMethods.call(u,n,e),typeof console===t&&n<u.levels.SILENT)return"No console available for logging"},u.setDefaultLevel=function(e){getPersistedLevel()||u.setLevel(e,!1)},u.enableAll=function(e){u.setLevel(u.levels.TRACE,e)},u.disableAll=function(e){u.setLevel(u.levels.SILENT,e)};
// Initialize with the right level
var c=getPersistedLevel();null==c&&(c=null==r?"WARN":r),u.setLevel(c,!1)}
// Slightly dubious tricks to cut down minimized file size
var e=function(){},t="undefined",n=["trace","debug","info","warn","error"],r=new Logger,o={};r.getLogger=function(e){if("string"!=typeof e||""===e)throw new TypeError("You must supply a name when creating a logger.");var t=o[e];return t||(t=o[e]=new Logger(e,r.getLevel(),r.methodFactory)),t};
// Grab the current global log variable in case of overwrite
var i=typeof window!==t?window.log:void 0;return r.noConflict=function(){return typeof window!==t&&window.log===r&&(window.log=i),r},r.getLoggers=function(){return o},r})},/* 87 */
/***/
function(e,t,n){n(88),e.exports=n(0).Object.getPrototypeOf},/* 88 */
/***/
function(e,t,n){
// 19.1.2.9 Object.getPrototypeOf(O)
var r=n(30),o=n(47);n(39)("getPrototypeOf",function(){return function(e){return o(r(e))}})},/* 89 */
/***/
function(e,t,n){e.exports={default:n(90),__esModule:!0}},/* 90 */
/***/
function(e,t,n){n(43),n(48),e.exports=n(33).f("iterator")},/* 91 */
/***/
function(e,t,n){e.exports={default:n(92),__esModule:!0}},/* 92 */
/***/
function(e,t,n){n(93),n(42),n(98),n(99),e.exports=n(0).Symbol},/* 93 */
/***/
function(e,t,n){"use strict";
// ECMAScript 6 symbols shim
var r=n(1),o=n(9),i=n(5),u=n(3),s=n(45),c=n(94).KEY,a=n(13),f=n(28),l=n(24),p=n(19),d=n(2),v=n(33),y=n(34),_=n(95),h=n(96),b=n(4),g=n(6),m=n(10),x=n(26),w=n(18),O=n(31),S=n(97),M=n(40),P=n(7),k=n(20),R=M.f,L=P.f,j=S.f,D=r.Symbol,E=r.JSON,T=E&&E.stringify,q=d("_hidden"),A=d("toPrimitive"),C={}.propertyIsEnumerable,I=f("symbol-registry"),F=f("symbols"),N=f("op-symbols"),B=Object.prototype,W="function"==typeof D,G=r.QObject,U=!G||!G.prototype||!G.prototype.findChild,V=i&&a(function(){return 7!=O(L({},"a",{get:function(){return L(this,"a",{value:7}).a}})).a})?function(e,t,n){var r=R(B,t);r&&delete B[t],L(e,t,n),r&&e!==B&&L(B,t,r)}:L,H=function(e){var t=F[e]=O(D.prototype);return t._k=e,t},K=W&&"symbol"==typeof D.iterator?function(e){return"symbol"==typeof e}:function(e){return e instanceof D},J=function(e,t,n){return e===B&&J(N,t,n),b(e),t=x(t,!0),b(n),o(F,t)?(n.enumerable?(o(e,q)&&e[q][t]&&(e[q][t]=!1),n=O(n,{enumerable:w(0,!1)})):(o(e,q)||L(e,q,w(1,{})),e[q][t]=!0),V(e,t,n)):L(e,t,n)},Y=function(e,t){b(e);for(var n,r=_(t=m(t)),o=0,i=r.length;i>o;)J(e,n=r[o++],t[n]);return e},z=function(e,t){return void 0===t?O(e):Y(O(e),t)},Q=function(e){var t=C.call(this,e=x(e,!0));return!(this===B&&o(F,e)&&!o(N,e))&&(!(t||!o(this,e)||!o(F,e)||o(this,q)&&this[q][e])||t)},X=function(e,t){if(e=m(e),t=x(t,!0),e!==B||!o(F,t)||o(N,t)){var n=R(e,t);return!n||!o(F,t)||o(e,q)&&e[q][t]||(n.enumerable=!0),n}},Z=function(e){for(var t,n=j(m(e)),r=[],i=0;n.length>i;)o(F,t=n[i++])||t==q||t==c||r.push(t);return r},$=function(e){for(var t,n=e===B,r=j(n?N:m(e)),i=[],u=0;r.length>u;)!o(F,t=r[u++])||n&&!o(B,t)||i.push(F[t]);return i};
// 19.4.1.1 Symbol([description])
W||(D=function(){if(this instanceof D)throw TypeError("Symbol is not a constructor!");var e=p(arguments.length>0?arguments[0]:void 0),t=function(n){this===B&&t.call(N,n),o(this,q)&&o(this[q],e)&&(this[q][e]=!1),V(this,e,w(1,n))};return i&&U&&V(B,e,{configurable:!0,set:t}),H(e)},s(D.prototype,"toString",function(){return this._k}),M.f=X,P.f=J,n(56).f=S.f=Z,n(35).f=Q,n(55).f=$,i&&!n(23)&&s(B,"propertyIsEnumerable",Q,!0),v.f=function(e){return H(d(e))}),u(u.G+u.W+u.F*!W,{Symbol:D});for(var ee="hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),te=0;ee.length>te;)d(ee[te++]);for(var ne=k(d.store),re=0;ne.length>re;)y(ne[re++]);u(u.S+u.F*!W,"Symbol",{
// 19.4.2.1 Symbol.for(key)
for:function(e){return o(I,e+="")?I[e]:I[e]=D(e)},
// 19.4.2.5 Symbol.keyFor(sym)
keyFor:function(e){if(!K(e))throw TypeError(e+" is not a symbol!");for(var t in I)if(I[t]===e)return t},useSetter:function(){U=!0},useSimple:function(){U=!1}}),u(u.S+u.F*!W,"Object",{
// 19.1.2.2 Object.create(O [, Properties])
create:z,
// 19.1.2.4 Object.defineProperty(O, P, Attributes)
defineProperty:J,
// 19.1.2.3 Object.defineProperties(O, Properties)
defineProperties:Y,
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
getOwnPropertyDescriptor:X,
// 19.1.2.7 Object.getOwnPropertyNames(O)
getOwnPropertyNames:Z,
// 19.1.2.8 Object.getOwnPropertySymbols(O)
getOwnPropertySymbols:$}),
// 24.3.2 JSON.stringify(value [, replacer [, space]])
E&&u(u.S+u.F*(!W||a(function(){var e=D();
// MS Edge converts symbol values to JSON as {}
// WebKit converts symbol values to JSON as null
// V8 throws on boxed symbols
return"[null]"!=T([e])||"{}"!=T({a:e})||"{}"!=T(Object(e))})),"JSON",{stringify:function(e){for(var t,n,r=[e],o=1;arguments.length>o;)r.push(arguments[o++]);if(n=t=r[1],(g(t)||void 0!==e)&&!K(e))// IE8 returns string on undefined
return h(t)||(t=function(e,t){if("function"==typeof n&&(t=n.call(this,e,t)),!K(t))return t}),r[1]=t,T.apply(E,r)}}),
// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
D.prototype[A]||n(8)(D.prototype,A,D.prototype.valueOf),
// 19.4.3.5 Symbol.prototype[@@toStringTag]
l(D,"Symbol"),
// 20.2.1.9 Math[@@toStringTag]
l(Math,"Math",!0),
// 24.3.3 JSON[@@toStringTag]
l(r.JSON,"JSON",!0)},/* 94 */
/***/
function(e,t,n){var r=n(19)("meta"),o=n(6),i=n(9),u=n(7).f,s=0,c=Object.isExtensible||function(){return!0},a=!n(13)(function(){return c(Object.preventExtensions({}))}),f=function(e){u(e,r,{value:{i:"O"+ ++s,// object ID
w:{}}})},l=function(e,t){
// return primitive with prefix
if(!o(e))return"symbol"==typeof e?e:("string"==typeof e?"S":"P")+e;if(!i(e,r)){
// can't set metadata to uncaught frozen object
if(!c(e))return"F";
// not necessary to add metadata
if(!t)return"E";
// add missing metadata
f(e)}return e[r].i},p=function(e,t){if(!i(e,r)){
// can't set metadata to uncaught frozen object
if(!c(e))return!0;
// not necessary to add metadata
if(!t)return!1;
// add missing metadata
f(e)}return e[r].w},d=function(e){return a&&v.NEED&&c(e)&&!i(e,r)&&f(e),e},v=e.exports={KEY:r,NEED:!1,fastKey:l,getWeak:p,onFreeze:d}},/* 95 */
/***/
function(e,t,n){
// all enumerable object keys, includes symbols
var r=n(20),o=n(55),i=n(35);e.exports=function(e){var t=r(e),n=o.f;if(n)for(var u,s=n(e),c=i.f,a=0;s.length>a;)c.call(e,u=s[a++])&&t.push(u);return t}},/* 96 */
/***/
function(e,t,n){
// 7.2.2 IsArray(argument)
var r=n(15);e.exports=Array.isArray||function(e){return"Array"==r(e)}},/* 97 */
/***/
function(e,t,n){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var r=n(10),o=n(56).f,i={}.toString,u="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],s=function(e){try{return o(e)}catch(e){return u.slice()}};e.exports.f=function(e){return u&&"[object Window]"==i.call(e)?s(e):o(r(e))}},/* 98 */
/***/
function(e,t,n){n(34)("asyncIterator")},/* 99 */
/***/
function(e,t,n){n(34)("observable")},/* 100 */
/***/
function(e,t,n){e.exports={default:n(101),__esModule:!0}},/* 101 */
/***/
function(e,t,n){n(102),e.exports=n(0).Object.setPrototypeOf},/* 102 */
/***/
function(e,t,n){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var r=n(3);r(r.S,"Object",{setPrototypeOf:n(103).set})},/* 103 */
/***/
function(e,t,n){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var r=n(6),o=n(4),i=function(e,t){if(o(e),!r(t)&&null!==t)throw TypeError(t+": can't set as prototype!")};e.exports={set:Object.setPrototypeOf||("__proto__"in{}?// eslint-disable-line
function(e,t,r){try{r=n(14)(Function.call,n(40).f(Object.prototype,"__proto__").set,2),r(e,[]),t=!(e instanceof Array)}catch(e){t=!0}return function(e,n){return i(e,n),t?e.__proto__=n:r(e,n),e}}({},!1):void 0),check:i}},/* 104 */
/***/
function(e,t,n){e.exports={default:n(105),__esModule:!0}},/* 105 */
/***/
function(e,t,n){n(106);var r=n(0).Object;e.exports=function(e,t){return r.create(e,t)}},/* 106 */
/***/
function(e,t,n){var r=n(3);
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
r(r.S,"Object",{create:n(31)})},/* 107 */
/***/
function(e,t,n){e.exports={default:n(108),__esModule:!0}},/* 108 */
/***/
function(e,t,n){n(109),e.exports=n(0).Object.keys},/* 109 */
/***/
function(e,t,n){
// 19.1.2.14 Object.keys(O)
var r=n(30),o=n(20);n(39)("keys",function(){return function(e){return o(r(e))}})},/* 110 */
,/* 111 */
,/* 112 */
,/* 113 */
,/* 114 */
,/* 115 */
/***/
function(e,t,n){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var r=n(63),o=_interopRequireDefault(r),i=n(11),u=_interopRequireDefault(i),s=n(12),c=_interopRequireDefault(s),a=n(64),f=_interopRequireDefault(a),l=n(65),p=_interopRequireDefault(l),d=n(116),v=_interopRequireDefault(d),y=function(e){function MiniBus(){return(0,u.default)(this,MiniBus),(0,f.default)(this,(MiniBus.__proto__||(0,o.default)(MiniBus)).call(this))}/**
   * Post a message for routing. Message is routed directly to the external routing _onPostMessage.
   * @param  {Message} inMsg            JSON with mandatory Message structure {id, type, from, to}
   * @param  {Callback} responseCallback Optional callback if a response is expected from the request. A response will be always sent, even if it is a "Timeout".
   * @return {number}                  the Message id
   */
return(0,p.default)(MiniBus,e),(0,c.default)(MiniBus,[{key:"postMessage",value:function(e,t,n){var r=this;
//always send to external (to core MessageBus)
return r._genId(e),r._responseCallback(e,t,n),r._onPostMessage(e),e.id}},{key:"_onMessage",value:function(e){var t=this;if(!t._onResponse(e)){var n=t._subscriptions[e.to];n?(t._publishOn(n,e),e.to.startsWith("hyperty")||t._publishOnDefault(e)):t._publishOnDefault(e)}}}]),MiniBus}(v.default);/**
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
t.default=y,e.exports=t.default},/* 116 */
/***/
function(e,t,n){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var r=n(41),o=_interopRequireDefault(r),i=n(11),u=_interopRequireDefault(i),s=n(12),c=_interopRequireDefault(s),a=n(86),f=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t}(a),l=f.getLogger("Bus"),p=function(){/* private
  _msgId: number;
  _subscriptions: <url: MsgListener[]>
   _responseTimeOut: number
  _responseCallbacks: <url+id: (msg) => void>
   */
function Bus(){(0,u.default)(this,Bus);var e=this;e._msgId=0,e._subscriptions={},e._responseTimeOut=15e3,//default to 3s
e._responseCallbacks={},e._registerExternalListener()}/**
  * Register listener to receive message when "msg.to === url".
  * Special url "*" for default listener is accepted to intercept all messages.
  * @param {URL} url Address to intercept, tha is in the message "to"
  * @param {Listener} listener listener
  * @return {MsgListener} instance of MsgListener
  */
return(0,c.default)(Bus,[{key:"addListener",value:function(e,t){var n=this,r=new d(n._subscriptions,e,t),o=n._subscriptions[e];return o||(o=[],n._subscriptions[e]=o),o.push(r),r}},{key:"addResponseListener",value:function(e,t,n){this._responseCallbacks[e+t]=n}},{key:"removeResponseListener",value:function(e,t){delete this._responseCallbacks[e+t]}},{key:"removeAllListenersOf",value:function(e){delete this._subscriptions[e]}},{key:"bind",value:function(e,t,n){var r=this,o=this;return{thisListener:o.addListener(e,function(e){n.postMessage(e)}),targetListener:n.addListener(t,function(e){o.postMessage(e)}),unbind:function(){r.thisListener.remove(),r.targetListener.remove()}}}},{key:"_publishOnDefault",value:function(e){
//is there any "*" (default) listeners?
var t=this._subscriptions["*"];t&&this._publishOn(t,e)}},{key:"_publishOn",value:function(e,t){e.forEach(function(e){e._callback(t)})}},{key:"_responseCallback",value:function(e,t){var n=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],r=this;
//automatic management of response handlers
if(t){var o=e.from+e.id;r._responseCallbacks[o]=t,n&&setTimeout(function(){var t=r._responseCallbacks[o];if(delete r._responseCallbacks[o],t){t({id:e.id,type:"response",body:{code:408,desc:"Response timeout!",value:e}})}},r._responseTimeOut)}}},{key:"_onResponse",value:function(e){var t=this;if("response"===e.type){var n=e.to+e.id,r=t._responseCallbacks[n];if(e.body.code>=200&&
//if it's a provisional response, don't delete response listener
delete t._responseCallbacks[n],r)return r(e),!0}return!1}},{key:"_onMessage",value:function(e){var t=this;if(!t._onResponse(e)){var n=t._subscriptions[e.to];n?t._publishOn(n,e):t._publishOnDefault(e)}}},{key:"_genId",value:function(e){
//TODO: how do we manage message ID's? Should it be a global runtime counter, or per URL address?
//Global counter will not work, because there will be multiple MiniBus instances!
//Per URL, can be a lot of data to maintain!
//Maybe a counter per MiniBus instance. This is the assumed solution for now.
e.id&&0!==e.id||(this._msgId++,e.id=this._msgId)}},{key:"postMessage",value:function(e,t){}},{key:"postMessageWithRetries",value:function(e,t,n){var r=this,i=0,u=function(){return new o.default(function(t,o){r.postMessage(e,function(r){408===r.body.code||500===r.body.code?o():(l.info("[Bus.postMessageWithRetries] msg delivered: ",e),n(r),t())})})};!function tryAgain(){u().then(function(){},function(){if(l.warn("[Bus.postMessageWithRetries] Message Bounced (retry "+i+"): '",e),!(i++<t)){var n="[Error] Message Bounced (delivery attempts "+t+"): '";throw new Error(n+e)}tryAgain()})}()}},{key:"_onPostMessage",value:function(e){}},{key:"_registerExternalListener",value:function(){}}]),Bus}(),d=function(){/* private
  _subscriptions: <string: MsgListener[]>;
  _url: string;
  _callback: (msg) => void;
  */
function MsgListener(e,t,n){(0,u.default)(this,MsgListener);var r=this;r._subscriptions=e,r._url=t,r._callback=n}return(0,c.default)(MsgListener,[{key:"remove",/**
     * Remove this listener from the Bus
     */
value:function(){var e=this,t=e._subscriptions[e._url];if(t){var n=t.indexOf(e);t.splice(n,1),
//if there are no listeners, remove the subscription entirely.
0===t.length&&delete e._subscriptions[e._url]}}},{key:"url",get:function(){return this._url}}]),MsgListener}();t.default=p,e.exports=t.default},/* 117 */
/***/
function(e,t,n){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var r=n(11),o=_interopRequireDefault(r),i=n(12),u=_interopRequireDefault(i),s=function(){/* private
  _components: <url: instance>
  */
function SandboxRegistry(e){(0,o.default)(this,SandboxRegistry);var t=this;t._bus=e,t._components={},e.addListener(SandboxRegistry.InternalDeployAddress,function(e){
//console.log('SandboxRegistry-RCV: ', msg);
// let responseMsg = {
//   id: msg.id, type: 'response', from: SandboxRegistry.InternalDeployAddress, to: SandboxRegistry.ExternalDeployAddress
// };
switch(e.type){case"create":t._onDeploy(e);break;case"delete":t._onRemove(e)}})}return(0,u.default)(SandboxRegistry,[{key:"_responseMsg",value:function(e,t,n){var r={id:e.id,type:"response",from:SandboxRegistry.InternalDeployAddress,to:SandboxRegistry.ExternalDeployAddress},o={};
// return messageFactory.createResponse(msg, code, value);
return t&&(o.code=t),n&&(o.desc=n),r.body=o,r}},{key:"_onDeploy",value:function(e){var t=this,n=e.body.config,r=e.body.url,o=e.body.sourceCode,i=void 0,u=void 0;if(t._components.hasOwnProperty(r))i=500,u="Instance "+r+" already exist!";else try{t._components[r]=t._create(r,o,n),i=200}catch(e){i=500,u=e}var s=t._responseMsg(e,i,u);t._bus.postMessage(s)}},{key:"_onRemove",value:function(e){var t=this,n=e.body.url,r=void 0,o=void 0;t._components.hasOwnProperty(n)?(
//remove component from the pool and all listeners
delete t._components[n],t._bus.removeAllListenersOf(n),r=200):(r=500,o="Instance "+n+" doesn't exist!");var i=t._responseMsg(e,r,o);t._bus.postMessage(i)}},{key:"_create",value:function(e,t,n){}},{key:"components",get:function(){return this._components}}]),SandboxRegistry}();s.ExternalDeployAddress="hyperty-runtime://sandbox/external",s.InternalDeployAddress="hyperty-runtime://sandbox/internal",t.default=s,e.exports=t.default},/* 118 */
,/* 119 */
,/* 120 */
,/* 121 */
,/* 122 */
,/* 123 */
,/* 124 */
,/* 125 */
,/* 126 */
,/* 127 */
,/* 128 */
,/* 129 */
,/* 130 */
,/* 131 */
,/* 132 */
,/* 133 */
/***/
function(e,t,n){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0}),t.SandboxRegistry=t.SandboxType=t.Sandbox=void 0;var r=n(134),o=_interopRequireDefault(r),i=n(117),u=_interopRequireDefault(i);t.Sandbox=o.default,t.SandboxType=r.SandboxType,t.SandboxRegistry=u.default},/* 134 */
/***/
function(e,t,n){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0}),t.SandboxType=void 0;var r=n(107),o=_interopRequireDefault(r),i=n(41),u=_interopRequireDefault(i),s=n(63),c=_interopRequireDefault(s),a=n(11),f=_interopRequireDefault(a),l=n(12),p=_interopRequireDefault(l),d=n(64),v=_interopRequireDefault(d),y=n(65),_=_interopRequireDefault(y),h=n(117),b=_interopRequireDefault(h),g=n(115),m=_interopRequireDefault(g),x=(t.SandboxType={APP:"app",NORMAL:"normal",WINDOW:"window"},function(e){function Sandbox(e){(0,f.default)(this,Sandbox);var t=(0,v.default)(this,(Sandbox.__proto__||(0,c.default)(Sandbox)).call(this)),n=t;return e&&(n.capabilities=e),t}/**
   * Deploy an instance of the component into the sandbox.
   * @param  {string} componentSourceCode Component source code (Hyperty, ProtoStub, etc)
   * @param  {URL} componentURL Hyperty, ProtoStub, or any other component address.
   * @param  {Config} configuration Config parameters of the component
   * @return {Promise<string>} return deployed if successful, or any other string with an error
   */
return(0,_.default)(Sandbox,e),(0,p.default)(Sandbox,[{key:"deployComponent",value:function(e,t,n){var r=this;
// let messageFactory = _this.messageFactory;
return new u.default(function(o,i){
//FLOW-OUT: deploy message for the internal SandboxRegistry -> _onDeploy
var u={type:"create",from:b.default.ExternalDeployAddress,to:b.default.InternalDeployAddress,body:{url:t,sourceCode:e,config:n}};
//send message into the sandbox internals and wait for reply
r.postMessage(u,function(e){200===e.body.code?
//is this response complaint with the spec?
o("deployed"):i(e.body.desc)})})}},{key:"removeComponent",value:function(e){var t=this;return new u.default(function(n,r){
//FLOW-OUT: un-deploy message for the internal SandboxRegistry -> _onRemove
var o={type:"delete",from:b.default.ExternalDeployAddress,to:b.default.InternalDeployAddress,body:{url:e}};
//send message into the sandbox internals and wait for reply
t.postMessage(o,function(e){200===e.body.code?
//is this response complaint with the spec?
n("undeployed"):r(e.body.desc)})})}},{key:"matches",value:function(e){var t=this,n=(0,o.default)(e).filter(function(n){return!(t.capabilities[n]&&t.capabilities[n]===e[n])});return 0===n.length||!e[n]}}]),Sandbox}(m.default));t.default=x}])});
},{}],4:[function(require,module,exports){
// version: 0.8.0
// date: Tue Jan 09 2018 17:01:37 GMT+0000 (WET)
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


!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("PersistenceManager",[],t):"object"==typeof exports?exports.PersistenceManager=t():(e[""]=e[""]||{},e[""].PersistenceManager=t())}("undefined"!=typeof self?self:this,function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:r})},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=180)}({0:function(e,t){var n=e.exports={version:"2.5.3"};"number"==typeof __e&&(__e=n)},1:function(e,t){var n=e.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=n)},10:function(e,t,n){var r=n(8),o=n(15);e.exports=n(3)?function(e,t,n){return r.f(e,t,o(1,n))}:function(e,t,n){return e[t]=n,e}},12:function(e,t){e.exports=function(e){try{return!!e()}catch(e){return!0}}},14:function(e,t,n){var r=n(22);e.exports=function(e,t,n){if(r(e),void 0===t)return e;switch(n){case 1:return function(n){return e.call(t,n)};case 2:return function(n,r){return e.call(t,n,r)};case 3:return function(n,r,o){return e.call(t,n,r,o)}}return function(){return e.apply(t,arguments)}}},15:function(e,t){e.exports=function(e,t){return{enumerable:!(1&e),configurable:!(2&e),writable:!(4&e),value:t}}},180:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r,o=n(181),u=(r=o)&&r.__esModule?r:{default:r};t.default=u.default,e.exports=t.default},181:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=i(n(59)),o=i(n(4)),u=i(n(7));function i(e){return e&&e.__esModule?e:{default:e}}var f=function(){function e(t){if((0,o.default)(this,e),!t)throw Error("The Persistence Manager needs the localStorage");this.localStorage=t}return(0,u.default)(e,[{key:"set",value:function(e,t,n){this.localStorage.setItem(e,(0,r.default)({version:t,value:n}))}},{key:"get",value:function(e){try{return JSON.parse(this.localStorage.getItem(e)).value}catch(e){}}},{key:"getVersion",value:function(e){try{return JSON.parse(this.localStorage.getItem(e)).version}catch(e){}}},{key:"delete",value:function(e){this.localStorage.removeItem(e)}}]),e}();t.default=f,e.exports=t.default},22:function(e,t){e.exports=function(e){if("function"!=typeof e)throw TypeError(e+" is not a function!");return e}},24:function(e,t,n){var r=n(6);e.exports=function(e,t){if(!r(e))return e;var n,o;if(t&&"function"==typeof(n=e.toString)&&!r(o=n.call(e)))return o;if("function"==typeof(n=e.valueOf)&&!r(o=n.call(e)))return o;if(!t&&"function"==typeof(n=e.toString)&&!r(o=n.call(e)))return o;throw TypeError("Can't convert object to primitive value")}},26:function(e,t,n){var r=n(6),o=n(1).document,u=r(o)&&r(o.createElement);e.exports=function(e){return u?o.createElement(e):{}}},3:function(e,t,n){e.exports=!n(12)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},38:function(e,t,n){e.exports=!n(3)&&!n(12)(function(){return 7!=Object.defineProperty(n(26)("div"),"a",{get:function(){return 7}}).a})},4:function(e,t,n){"use strict";t.__esModule=!0,t.default=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}},5:function(e,t,n){var r=n(1),o=n(0),u=n(14),i=n(10),f="prototype",c=function(e,t,n){var a,l,s,p=e&c.F,d=e&c.G,y=e&c.S,v=e&c.P,h=e&c.B,g=e&c.W,x=d?o:o[t]||(o[t]={}),_=x[f],b=d?r:y?r[t]:(r[t]||{})[f];d&&(n=t);for(a in n)(l=!p&&b&&void 0!==b[a])&&a in x||(s=l?b[a]:n[a],x[a]=d&&"function"!=typeof b[a]?n[a]:h&&l?u(s,r):g&&b[a]==s?function(e){var t=function(t,n,r){if(this instanceof e){switch(arguments.length){case 0:return new e;case 1:return new e(t);case 2:return new e(t,n)}return new e(t,n,r)}return e.apply(this,arguments)};return t[f]=e[f],t}(s):v&&"function"==typeof s?u(Function.call,s):s,v&&((x.virtual||(x.virtual={}))[a]=s,e&c.R&&_&&!_[a]&&i(_,a,s)))};c.F=1,c.G=2,c.S=4,c.P=8,c.B=16,c.W=32,c.U=64,c.R=128,e.exports=c},55:function(e,t,n){e.exports={default:n(60),__esModule:!0}},59:function(e,t,n){e.exports={default:n(76),__esModule:!0}},6:function(e,t){e.exports=function(e){return"object"==typeof e?null!==e:"function"==typeof e}},60:function(e,t,n){n(61);var r=n(0).Object;e.exports=function(e,t,n){return r.defineProperty(e,t,n)}},61:function(e,t,n){var r=n(5);r(r.S+r.F*!n(3),"Object",{defineProperty:n(8).f})},7:function(e,t,n){"use strict";t.__esModule=!0;var r,o=n(55),u=(r=o)&&r.__esModule?r:{default:r};t.default=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),(0,u.default)(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}()},76:function(e,t,n){var r=n(0),o=r.JSON||(r.JSON={stringify:JSON.stringify});e.exports=function(e){return o.stringify.apply(o,arguments)}},8:function(e,t,n){var r=n(9),o=n(38),u=n(24),i=Object.defineProperty;t.f=n(3)?Object.defineProperty:function(e,t,n){if(r(e),t=u(t,!0),r(n),o)try{return i(e,t,n)}catch(e){}if("get"in n||"set"in n)throw TypeError("Accessors not supported!");return"value"in n&&(e[t]=n.value),e}},9:function(e,t,n){var r=n(6);e.exports=function(e){if(!r(e))throw TypeError(e+" is not an object!");return e}}})});
},{}],5:[function(require,module,exports){
// version: 0.8.0
// date: Tue Jan 09 2018 17:01:37 GMT+0000 (WET)
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


!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define("RuntimeCatalogue",[],e):"object"==typeof exports?exports.RuntimeCatalogue=e():(t[""]=t[""]||{},t[""].RuntimeCatalogue=e())}("undefined"!=typeof self?self:this,function(){return function(t){var e={};function r(n){if(e[n])return e[n].exports;var i=e[n]={i:n,l:!1,exports:{}};return t[n].call(i.exports,i,i.exports,r),i.l=!0,i.exports}return r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:n})},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=182)}([function(t,e){var r=t.exports={version:"2.5.3"};"number"==typeof __e&&(__e=r)},function(t,e){var r=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=r)},function(t,e,r){var n=r(34)("wks"),i=r(19),o=r(1).Symbol,a="function"==typeof o;(t.exports=function(t){return n[t]||(n[t]=a&&o[t]||(a?o:i)("Symbol."+t))}).store=n},function(t,e,r){t.exports=!r(12)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},function(t,e,r){"use strict";e.__esModule=!0,e.default=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}},function(t,e,r){var n=r(1),i=r(0),o=r(14),a=r(10),u="prototype",s=function(t,e,r){var c,l,f,h=t&s.F,p=t&s.G,d=t&s.S,v=t&s.P,y=t&s.B,m=t&s.W,g=p?i:i[e]||(i[e]={}),_=g[u],O=p?n:d?n[e]:(n[e]||{})[u];p&&(r=e);for(c in r)(l=!h&&O&&void 0!==O[c])&&c in g||(f=l?O[c]:r[c],g[c]=p&&"function"!=typeof O[c]?r[c]:y&&l?o(f,n):m&&O[c]==f?function(t){var e=function(e,r,n){if(this instanceof t){switch(arguments.length){case 0:return new t;case 1:return new t(e);case 2:return new t(e,r)}return new t(e,r,n)}return t.apply(this,arguments)};return e[u]=t[u],e}(f):v&&"function"==typeof f?o(Function.call,f):f,v&&((g.virtual||(g.virtual={}))[c]=f,t&s.R&&_&&!_[c]&&a(_,c,f)))};s.F=1,s.G=2,s.S=4,s.P=8,s.B=16,s.W=32,s.U=64,s.R=128,t.exports=s},function(t,e){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},function(t,e,r){"use strict";e.__esModule=!0;var n,i=r(55),o=(n=i)&&n.__esModule?n:{default:n};e.default=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),(0,o.default)(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}()},function(t,e,r){var n=r(9),i=r(38),o=r(24),a=Object.defineProperty;e.f=r(3)?Object.defineProperty:function(t,e,r){if(n(t),e=o(e,!0),n(r),i)try{return a(t,e,r)}catch(t){}if("get"in r||"set"in r)throw TypeError("Accessors not supported!");return"value"in r&&(t[e]=r.value),t}},function(t,e,r){var n=r(6);t.exports=function(t){if(!n(t))throw TypeError(t+" is not an object!");return t}},function(t,e,r){var n=r(8),i=r(15);t.exports=r(3)?function(t,e,r){return n.f(t,e,i(1,r))}:function(t,e,r){return t[e]=r,t}},function(t,e){var r={}.hasOwnProperty;t.exports=function(t,e){return r.call(t,e)}},function(t,e){t.exports=function(t){try{return!!t()}catch(t){return!0}}},function(t,e,r){var n=r(56),i=r(29);t.exports=function(t){return n(i(t))}},function(t,e,r){var n=r(22);t.exports=function(t,e,r){if(n(t),void 0===e)return t;switch(r){case 1:return function(r){return t.call(e,r)};case 2:return function(r,n){return t.call(e,r,n)};case 3:return function(r,n,i){return t.call(e,r,n,i)}}return function(){return t.apply(e,arguments)}}},function(t,e){t.exports=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}}},function(t,e){t.exports={}},function(t,e,r){var n=r(44),i=r(35);t.exports=Object.keys||function(t){return n(t,i)}},function(t,e){var r={}.toString;t.exports=function(t){return r.call(t).slice(8,-1)}},function(t,e){var r=0,n=Math.random();t.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++r+n).toString(36))}},function(t,e,r){t.exports={default:r(102),__esModule:!0}},,function(t,e){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},function(t,e,r){var n,i;!function(o,a){"use strict";void 0===(i="function"==typeof(n=a)?n.call(e,r,e,t):n)||(t.exports=i)}(0,function(){"use strict";var t=function(){},e="undefined",r=["trace","debug","info","warn","error"];function n(t,e){var r=t[e];if("function"==typeof r.bind)return r.bind(t);try{return Function.prototype.bind.call(r,t)}catch(e){return function(){return Function.prototype.apply.apply(r,[t,arguments])}}}function i(e,n){for(var i=0;i<r.length;i++){var o=r[i];this[o]=i<e?t:this.methodFactory(o,e,n)}this.log=this.debug}function o(r,o,a){return"debug"===(u=r)&&(u="log"),typeof console!==e&&(void 0!==console[u]?n(console,u):void 0!==console.log?n(console,"log"):t)||function(t,r,n){return function(){typeof console!==e&&(i.call(this,r,n),this[t].apply(this,arguments))}}.apply(this,arguments);var u}function a(t,n,a){var u,s=this,c="loglevel";function l(){var t;if(typeof window!==e){try{t=window.localStorage[c]}catch(t){}if(typeof t===e)try{var r=window.document.cookie,n=r.indexOf(encodeURIComponent(c)+"=");-1!==n&&(t=/^([^;]+)/.exec(r.slice(n))[1])}catch(t){}return void 0===s.levels[t]&&(t=void 0),t}}t&&(c+=":"+t),s.name=t,s.levels={TRACE:0,DEBUG:1,INFO:2,WARN:3,ERROR:4,SILENT:5},s.methodFactory=a||o,s.getLevel=function(){return u},s.setLevel=function(n,o){if("string"==typeof n&&void 0!==s.levels[n.toUpperCase()]&&(n=s.levels[n.toUpperCase()]),!("number"==typeof n&&n>=0&&n<=s.levels.SILENT))throw"log.setLevel() called with invalid level: "+n;if(u=n,!1!==o&&function(t){var n=(r[t]||"silent").toUpperCase();if(typeof window!==e){try{return void(window.localStorage[c]=n)}catch(t){}try{window.document.cookie=encodeURIComponent(c)+"="+n+";"}catch(t){}}}(n),i.call(s,n,t),typeof console===e&&n<s.levels.SILENT)return"No console available for logging"},s.setDefaultLevel=function(t){l()||s.setLevel(t,!1)},s.enableAll=function(t){s.setLevel(s.levels.TRACE,t)},s.disableAll=function(t){s.setLevel(s.levels.SILENT,t)};var f=l();null==f&&(f=null==n?"WARN":n),s.setLevel(f,!1)}var u=new a,s={};u.getLogger=function(t){if("string"!=typeof t||""===t)throw new TypeError("You must supply a name when creating a logger.");var e=s[t];return e||(e=s[t]=new a(t,u.getLevel(),u.methodFactory)),e};var c=typeof window!==e?window.log:void 0;return u.noConflict=function(){return typeof window!==e&&window.log===u&&(window.log=c),u},u.getLoggers=function(){return s},u})},function(t,e,r){var n=r(6);t.exports=function(t,e){if(!n(t))return t;var r,i;if(e&&"function"==typeof(r=t.toString)&&!n(i=r.call(t)))return i;if("function"==typeof(r=t.valueOf)&&!n(i=r.call(t)))return i;if(!e&&"function"==typeof(r=t.toString)&&!n(i=r.call(t)))return i;throw TypeError("Can't convert object to primitive value")}},function(t,e,r){var n=r(8).f,i=r(11),o=r(2)("toStringTag");t.exports=function(t,e,r){t&&!i(t=r?t:t.prototype,o)&&n(t,o,{configurable:!0,value:e})}},function(t,e,r){var n=r(6),i=r(1).document,o=n(i)&&n(i.createElement);t.exports=function(t){return o?i.createElement(t):{}}},function(t,e){t.exports=!0},function(t,e,r){t.exports={default:r(91),__esModule:!0}},function(t,e){t.exports=function(t){if(void 0==t)throw TypeError("Can't call method on  "+t);return t}},function(t,e){var r=Math.ceil,n=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?n:r)(t)}},function(t,e){e.f={}.propertyIsEnumerable},function(t,e,r){var n=r(34)("keys"),i=r(19);t.exports=function(t){return n[t]||(n[t]=i(t))}},function(t,e,r){var n=r(29);t.exports=function(t){return Object(n(t))}},function(t,e,r){var n=r(1),i=n["__core-js_shared__"]||(n["__core-js_shared__"]={});t.exports=function(t){return i[t]||(i[t]={})}},function(t,e){t.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},function(t,e,r){"use strict";e.__esModule=!0;var n,i=r(49),o=(n=i)&&n.__esModule?n:{default:n};e.default=function(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!==(void 0===e?"undefined":(0,o.default)(e))&&"function"!=typeof e?t:e}},function(t,e,r){"use strict";e.__esModule=!0;var n=a(r(93)),i=a(r(97)),o=a(r(49));function a(t){return t&&t.__esModule?t:{default:t}}e.default=function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+(void 0===e?"undefined":(0,o.default)(e)));t.prototype=(0,i.default)(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(n.default?(0,n.default)(t,e):t.__proto__=e)}},function(t,e,r){t.exports=!r(3)&&!r(12)(function(){return 7!=Object.defineProperty(r(26)("div"),"a",{get:function(){return 7}}).a})},function(t,e,r){var n=r(9),i=r(72),o=r(35),a=r(32)("IE_PROTO"),u=function(){},s=function(){var t,e=r(26)("iframe"),n=o.length;for(e.style.display="none",r(57).appendChild(e),e.src="javascript:",(t=e.contentWindow.document).open(),t.write("<script>document.F=Object<\/script>"),t.close(),s=t.F;n--;)delete s.prototype[o[n]];return s()};t.exports=Object.create||function(t,e){var r;return null!==t?(u.prototype=n(t),r=new u,u.prototype=null,r[a]=t):r=s(),void 0===e?r:i(r,e)}},function(t,e,r){e.f=r(2)},function(t,e,r){var n=r(1),i=r(0),o=r(27),a=r(40),u=r(8).f;t.exports=function(t){var e=i.Symbol||(i.Symbol=o?{}:n.Symbol||{});"_"==t.charAt(0)||t in e||u(e,t,{value:a.f(t)})}},function(t,e){e.f=Object.getOwnPropertySymbols},,function(t,e,r){var n=r(11),i=r(13),o=r(63)(!1),a=r(32)("IE_PROTO");t.exports=function(t,e){var r,u=i(t),s=0,c=[];for(r in u)r!=a&&n(u,r)&&c.push(r);for(;e.length>s;)n(u,r=e[s++])&&(~o(c,r)||c.push(r));return c}},function(t,e,r){var n=r(5),i=r(0),o=r(12);t.exports=function(t,e){var r=(i.Object||{})[t]||Object[t],a={};a[t]=e(r),n(n.S+n.F*o(function(){r(1)}),"Object",a)}},function(t,e,r){"use strict";var n=r(27),i=r(5),o=r(50),a=r(10),u=r(11),s=r(16),c=r(71),l=r(25),f=r(52),h=r(2)("iterator"),p=!([].keys&&"next"in[].keys()),d=function(){return this};t.exports=function(t,e,r,v,y,m,g){c(r,e,v);var _,O,b,E=function(t){if(!p&&t in R)return R[t];switch(t){case"keys":case"values":return function(){return new r(this,t)}}return function(){return new r(this,t)}},P=e+" Iterator",S="values"==y,w=!1,R=t.prototype,T=R[h]||R["@@iterator"]||y&&R[y],k=!p&&T||E(y),M=y?S?E("entries"):k:void 0,x="Array"==e?R.entries||T:T;if(x&&(b=f(x.call(new t)))!==Object.prototype&&b.next&&(l(b,P,!0),n||u(b,h)||a(b,h,d)),S&&T&&"values"!==T.name&&(w=!0,k=function(){return T.call(this)}),n&&!g||!p&&!w&&R[h]||a(R,h,k),s[e]=k,s[P]=d,y)if(_={values:S?k:E("values"),keys:m?k:E("keys"),entries:M},g)for(O in _)O in R||o(R,O,_[O]);else i(i.P+i.F*(p||w),e,_);return _}},function(t,e,r){var n=r(31),i=r(15),o=r(13),a=r(24),u=r(11),s=r(38),c=Object.getOwnPropertyDescriptor;e.f=r(3)?c:function(t,e){if(t=o(t),e=a(e,!0),s)try{return c(t,e)}catch(t){}if(u(t,e))return i(!n.f.call(t,e),t[e])}},function(t,e,r){var n=r(30),i=Math.min;t.exports=function(t){return t>0?i(n(t),9007199254740991):0}},function(t,e,r){"use strict";e.__esModule=!0;var n=a(r(78)),i=a(r(80)),o="function"==typeof i.default&&"symbol"==typeof n.default?function(t){return typeof t}:function(t){return t&&"function"==typeof i.default&&t.constructor===i.default&&t!==i.default.prototype?"symbol":typeof t};function a(t){return t&&t.__esModule?t:{default:t}}e.default="function"==typeof i.default&&"symbol"===o(n.default)?function(t){return void 0===t?"undefined":o(t)}:function(t){return t&&"function"==typeof i.default&&t.constructor===i.default&&t!==i.default.prototype?"symbol":void 0===t?"undefined":o(t)}},function(t,e,r){t.exports=r(10)},function(t,e,r){"use strict";var n=r(70)(!0);r(46)(String,"String",function(t){this._t=String(t),this._i=0},function(){var t,e=this._t,r=this._i;return r>=e.length?{value:void 0,done:!0}:(t=n(e,r),this._i+=t.length,{value:t,done:!1})})},function(t,e,r){var n=r(11),i=r(33),o=r(32)("IE_PROTO"),a=Object.prototype;t.exports=Object.getPrototypeOf||function(t){return t=i(t),n(t,o)?t[o]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?a:null}},function(t,e,r){r(73);for(var n=r(1),i=r(10),o=r(16),a=r(2)("toStringTag"),u="CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,TextTrackList,TouchList".split(","),s=0;s<u.length;s++){var c=u[s],l=n[c],f=l&&l.prototype;f&&!f[a]&&i(f,a,c),o[c]=o.Array}},function(t,e,r){"use strict";var n=r(22);t.exports.f=function(t){return new function(t){var e,r;this.promise=new t(function(t,n){if(void 0!==e||void 0!==r)throw TypeError("Bad Promise constructor");e=t,r=n}),this.resolve=n(e),this.reject=n(r)}(t)}},function(t,e,r){t.exports={default:r(60),__esModule:!0}},function(t,e,r){var n=r(18);t.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==n(t)?t.split(""):Object(t)}},function(t,e,r){var n=r(1).document;t.exports=n&&n.documentElement},function(t,e,r){var n=r(44),i=r(35).concat("length","prototype");e.f=Object.getOwnPropertyNames||function(t){return n(t,i)}},function(t,e,r){t.exports={default:r(76),__esModule:!0}},function(t,e,r){r(61);var n=r(0).Object;t.exports=function(t,e,r){return n.defineProperty(t,e,r)}},function(t,e,r){var n=r(5);n(n.S+n.F*!r(3),"Object",{defineProperty:r(8).f})},function(t,e){},function(t,e,r){var n=r(13),i=r(48),o=r(64);t.exports=function(t){return function(e,r,a){var u,s=n(e),c=i(s.length),l=o(a,c);if(t&&r!=r){for(;c>l;)if((u=s[l++])!=u)return!0}else for(;c>l;l++)if((t||l in s)&&s[l]===r)return t||l||0;return!t&&-1}}},function(t,e,r){var n=r(30),i=Math.max,o=Math.min;t.exports=function(t,e){return(t=n(t))<0?i(t+e,0):o(t,e)}},function(t,e,r){var n=r(18),i=r(2)("toStringTag"),o="Arguments"==n(function(){return arguments}());t.exports=function(t){var e,r,a;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(r=function(t,e){try{return t[e]}catch(t){}}(e=Object(t),i))?r:o?n(e):"Object"==(a=n(e))&&"function"==typeof e.callee?"Arguments":a}},function(t,e,r){var n=r(9),i=r(22),o=r(2)("species");t.exports=function(t,e){var r,a=n(t).constructor;return void 0===a||void 0==(r=n(a)[o])?e:i(r)}},function(t,e,r){var n,i,o,a=r(14),u=r(108),s=r(57),c=r(26),l=r(1),f=l.process,h=l.setImmediate,p=l.clearImmediate,d=l.MessageChannel,v=l.Dispatch,y=0,m={},g=function(){var t=+this;if(m.hasOwnProperty(t)){var e=m[t];delete m[t],e()}},_=function(t){g.call(t.data)};h&&p||(h=function(t){for(var e=[],r=1;arguments.length>r;)e.push(arguments[r++]);return m[++y]=function(){u("function"==typeof t?t:Function(t),e)},n(y),y},p=function(t){delete m[t]},"process"==r(18)(f)?n=function(t){f.nextTick(a(g,t,1))}:v&&v.now?n=function(t){v.now(a(g,t,1))}:d?(o=(i=new d).port2,i.port1.onmessage=_,n=a(o.postMessage,o,1)):l.addEventListener&&"function"==typeof postMessage&&!l.importScripts?(n=function(t){l.postMessage(t+"","*")},l.addEventListener("message",_,!1)):n="onreadystatechange"in c("script")?function(t){s.appendChild(c("script")).onreadystatechange=function(){s.removeChild(this),g.call(t)}}:function(t){setTimeout(a(g,t,1),0)}),t.exports={set:h,clear:p}},function(t,e){t.exports=function(t){try{return{e:!1,v:t()}}catch(t){return{e:!0,v:t}}}},function(t,e,r){var n=r(9),i=r(6),o=r(54);t.exports=function(t,e){if(n(t),i(e)&&e.constructor===t)return e;var r=o.f(t);return(0,r.resolve)(e),r.promise}},function(t,e,r){var n=r(30),i=r(29);t.exports=function(t){return function(e,r){var o,a,u=String(i(e)),s=n(r),c=u.length;return s<0||s>=c?t?"":void 0:(o=u.charCodeAt(s))<55296||o>56319||s+1===c||(a=u.charCodeAt(s+1))<56320||a>57343?t?u.charAt(s):o:t?u.slice(s,s+2):a-56320+(o-55296<<10)+65536}}},function(t,e,r){"use strict";var n=r(39),i=r(15),o=r(25),a={};r(10)(a,r(2)("iterator"),function(){return this}),t.exports=function(t,e,r){t.prototype=n(a,{next:i(1,r)}),o(t,e+" Iterator")}},function(t,e,r){var n=r(8),i=r(9),o=r(17);t.exports=r(3)?Object.defineProperties:function(t,e){i(t);for(var r,a=o(e),u=a.length,s=0;u>s;)n.f(t,r=a[s++],e[r]);return t}},function(t,e,r){"use strict";var n=r(74),i=r(75),o=r(16),a=r(13);t.exports=r(46)(Array,"Array",function(t,e){this._t=a(t),this._i=0,this._k=e},function(){var t=this._t,e=this._k,r=this._i++;return!t||r>=t.length?(this._t=void 0,i(1)):i(0,"keys"==e?r:"values"==e?t[r]:[r,t[r]])},"values"),o.Arguments=o.Array,n("keys"),n("values"),n("entries")},function(t,e){t.exports=function(){}},function(t,e){t.exports=function(t,e){return{value:e,done:!!t}}},function(t,e,r){var n=r(0),i=n.JSON||(n.JSON={stringify:JSON.stringify});t.exports=function(t){return i.stringify.apply(i,arguments)}},function(t,e,r){var n=r(19)("meta"),i=r(6),o=r(11),a=r(8).f,u=0,s=Object.isExtensible||function(){return!0},c=!r(12)(function(){return s(Object.preventExtensions({}))}),l=function(t){a(t,n,{value:{i:"O"+ ++u,w:{}}})},f=t.exports={KEY:n,NEED:!1,fastKey:function(t,e){if(!i(t))return"symbol"==typeof t?t:("string"==typeof t?"S":"P")+t;if(!o(t,n)){if(!s(t))return"F";if(!e)return"E";l(t)}return t[n].i},getWeak:function(t,e){if(!o(t,n)){if(!s(t))return!0;if(!e)return!1;l(t)}return t[n].w},onFreeze:function(t){return c&&f.NEED&&s(t)&&!o(t,n)&&l(t),t}}},function(t,e,r){t.exports={default:r(79),__esModule:!0}},function(t,e,r){r(51),r(53),t.exports=r(40).f("iterator")},function(t,e,r){t.exports={default:r(81),__esModule:!0}},function(t,e,r){r(82),r(62),r(86),r(87),t.exports=r(0).Symbol},function(t,e,r){"use strict";var n=r(1),i=r(11),o=r(3),a=r(5),u=r(50),s=r(77).KEY,c=r(12),l=r(34),f=r(25),h=r(19),p=r(2),d=r(40),v=r(41),y=r(83),m=r(84),g=r(9),_=r(6),O=r(13),b=r(24),E=r(15),P=r(39),S=r(85),w=r(47),R=r(8),T=r(17),k=w.f,M=R.f,x=S.f,C=n.Symbol,j=n.JSON,A=j&&j.stringify,N="prototype",I=p("_hidden"),U=p("toPrimitive"),L={}.propertyIsEnumerable,D=l("symbol-registry"),F=l("symbols"),H=l("op-symbols"),Y=Object[N],B="function"==typeof C,K=n.QObject,G=!K||!K[N]||!K[N].findChild,J=o&&c(function(){return 7!=P(M({},"a",{get:function(){return M(this,"a",{value:7}).a}})).a})?function(t,e,r){var n=k(Y,e);n&&delete Y[e],M(t,e,r),n&&t!==Y&&M(Y,e,n)}:M,W=function(t){var e=F[t]=P(C[N]);return e._k=t,e},V=B&&"symbol"==typeof C.iterator?function(t){return"symbol"==typeof t}:function(t){return t instanceof C},q=function(t,e,r){return t===Y&&q(H,e,r),g(t),e=b(e,!0),g(r),i(F,e)?(r.enumerable?(i(t,I)&&t[I][e]&&(t[I][e]=!1),r=P(r,{enumerable:E(0,!1)})):(i(t,I)||M(t,I,E(1,{})),t[I][e]=!0),J(t,e,r)):M(t,e,r)},z=function(t,e){g(t);for(var r,n=y(e=O(e)),i=0,o=n.length;o>i;)q(t,r=n[i++],e[r]);return t},X=function(t){var e=L.call(this,t=b(t,!0));return!(this===Y&&i(F,t)&&!i(H,t))&&(!(e||!i(this,t)||!i(F,t)||i(this,I)&&this[I][t])||e)},$=function(t,e){if(t=O(t),e=b(e,!0),t!==Y||!i(F,e)||i(H,e)){var r=k(t,e);return!r||!i(F,e)||i(t,I)&&t[I][e]||(r.enumerable=!0),r}},Q=function(t){for(var e,r=x(O(t)),n=[],o=0;r.length>o;)i(F,e=r[o++])||e==I||e==s||n.push(e);return n},Z=function(t){for(var e,r=t===Y,n=x(r?H:O(t)),o=[],a=0;n.length>a;)!i(F,e=n[a++])||r&&!i(Y,e)||o.push(F[e]);return o};B||(u((C=function(){if(this instanceof C)throw TypeError("Symbol is not a constructor!");var t=h(arguments.length>0?arguments[0]:void 0),e=function(r){this===Y&&e.call(H,r),i(this,I)&&i(this[I],t)&&(this[I][t]=!1),J(this,t,E(1,r))};return o&&G&&J(Y,t,{configurable:!0,set:e}),W(t)})[N],"toString",function(){return this._k}),w.f=$,R.f=q,r(58).f=S.f=Q,r(31).f=X,r(42).f=Z,o&&!r(27)&&u(Y,"propertyIsEnumerable",X,!0),d.f=function(t){return W(p(t))}),a(a.G+a.W+a.F*!B,{Symbol:C});for(var tt="hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),et=0;tt.length>et;)p(tt[et++]);for(var rt=T(p.store),nt=0;rt.length>nt;)v(rt[nt++]);a(a.S+a.F*!B,"Symbol",{for:function(t){return i(D,t+="")?D[t]:D[t]=C(t)},keyFor:function(t){if(!V(t))throw TypeError(t+" is not a symbol!");for(var e in D)if(D[e]===t)return e},useSetter:function(){G=!0},useSimple:function(){G=!1}}),a(a.S+a.F*!B,"Object",{create:function(t,e){return void 0===e?P(t):z(P(t),e)},defineProperty:q,defineProperties:z,getOwnPropertyDescriptor:$,getOwnPropertyNames:Q,getOwnPropertySymbols:Z}),j&&a(a.S+a.F*(!B||c(function(){var t=C();return"[null]"!=A([t])||"{}"!=A({a:t})||"{}"!=A(Object(t))})),"JSON",{stringify:function(t){for(var e,r,n=[t],i=1;arguments.length>i;)n.push(arguments[i++]);if(r=e=n[1],(_(e)||void 0!==t)&&!V(t))return m(e)||(e=function(t,e){if("function"==typeof r&&(e=r.call(this,t,e)),!V(e))return e}),n[1]=e,A.apply(j,n)}}),C[N][U]||r(10)(C[N],U,C[N].valueOf),f(C,"Symbol"),f(Math,"Math",!0),f(n.JSON,"JSON",!0)},function(t,e,r){var n=r(17),i=r(42),o=r(31);t.exports=function(t){var e=n(t),r=i.f;if(r)for(var a,u=r(t),s=o.f,c=0;u.length>c;)s.call(t,a=u[c++])&&e.push(a);return e}},function(t,e,r){var n=r(18);t.exports=Array.isArray||function(t){return"Array"==n(t)}},function(t,e,r){var n=r(13),i=r(58).f,o={}.toString,a="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[];t.exports.f=function(t){return a&&"[object Window]"==o.call(t)?function(t){try{return i(t)}catch(t){return a.slice()}}(t):i(n(t))}},function(t,e,r){r(41)("asyncIterator")},function(t,e,r){r(41)("observable")},,,,function(t,e,r){r(92),t.exports=r(0).Object.getPrototypeOf},function(t,e,r){var n=r(33),i=r(52);r(45)("getPrototypeOf",function(){return function(t){return i(n(t))}})},function(t,e,r){t.exports={default:r(94),__esModule:!0}},function(t,e,r){r(95),t.exports=r(0).Object.setPrototypeOf},function(t,e,r){var n=r(5);n(n.S,"Object",{setPrototypeOf:r(96).set})},function(t,e,r){var n=r(6),i=r(9),o=function(t,e){if(i(t),!n(e)&&null!==e)throw TypeError(e+": can't set as prototype!")};t.exports={set:Object.setPrototypeOf||("__proto__"in{}?function(t,e,n){try{(n=r(14)(Function.call,r(47).f(Object.prototype,"__proto__").set,2))(t,[]),e=!(t instanceof Array)}catch(t){e=!0}return function(t,r){return o(t,r),e?t.__proto__=r:n(t,r),t}}({},!1):void 0),check:o}},function(t,e,r){t.exports={default:r(98),__esModule:!0}},function(t,e,r){r(99);var n=r(0).Object;t.exports=function(t,e){return n.create(t,e)}},function(t,e,r){var n=r(5);n(n.S,"Object",{create:r(39)})},function(t,e,r){var n=r(65),i=r(2)("iterator"),o=r(16);t.exports=r(0).getIteratorMethod=function(t){if(void 0!=t)return t[i]||t["@@iterator"]||o[n(t)]}},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.DataObjectSourceLanguage=e.CatalogueObjectType=void 0;var n=s(r(28)),i=s(r(4)),o=s(r(7)),a=s(r(36)),u=s(r(37));function s(t){return t&&t.__esModule?t:{default:t}}var c=function(t){function e(t,r,o,u,s,c,l){(0,i.default)(this,e);var f=(0,a.default)(this,(e.__proto__||(0,n.default)(e)).call(this));return f._guid=t,f._type=r,f._version=o,f._objectName=u,f._description=s,f._language=c,f._sourcePackageURL=l,f._signature=null,f._sourcePackage=null,f}return(0,u.default)(e,t),(0,o.default)(e,[{key:"guid",get:function(){return this._guid},set:function(t){t&&(this._guid=t)}},{key:"type",get:function(){return this._type},set:function(t){t&&(this._type=t)}},{key:"version",get:function(){return this._version},set:function(t){t&&(this._version=t)}},{key:"objectName",get:function(){return this._objectName},set:function(t){t&&(this._objectName=t)}},{key:"description",get:function(){return this._description},set:function(t){t&&(this._description=t)}},{key:"language",get:function(){return this._language},set:function(t){t&&(this._language=t)}},{key:"signature",get:function(){return this._signature},set:function(t){t&&(this._signature=t)}},{key:"sourcePackage",get:function(){return this._sourcePackage},set:function(t){t&&(this._sourcePackage=t)}},{key:"sourcePackageURL",get:function(){return this._sourcePackageURL},set:function(t){t&&(this._sourcePackageURL=t)}}]),e}(s(r(131)).default);e.CatalogueObjectType={HYPERTY:"hyperty",PROTOSTUB:"protostub",HYPERTY_RUNTIME:"hyperty_runtime",HYPERTY_INTERCEPTOR:"hyperty_inspector",HYPERTY_DATA_OBJECT:"hyperty_data_object"},e.DataObjectSourceLanguage={JAVASCRIPT_ECMA6:"javascript_ecma6",JAVASCRIPT_ECMA5:"javascript_ecma5",JSON_SCHEMA_V4:"json_schema_v4",PYTHON:"python",TYPESCRIPT:"typescript"};e.default=c},function(t,e,r){r(62),r(51),r(53),r(103),r(113),r(114),t.exports=r(0).Promise},function(t,e,r){"use strict";var n,i,o,a,u=r(27),s=r(1),c=r(14),l=r(65),f=r(5),h=r(6),p=r(22),d=r(104),v=r(105),y=r(66),m=r(67).set,g=r(109)(),_=r(54),O=r(68),b=r(69),E="Promise",P=s.TypeError,S=s.process,w=s.Promise,R="process"==l(S),T=function(){},k=i=_.f,M=!!function(){try{var t=w.resolve(1),e=(t.constructor={})[r(2)("species")]=function(t){t(T,T)};return(R||"function"==typeof PromiseRejectionEvent)&&t.then(T)instanceof e}catch(t){}}(),x=function(t){var e;return!(!h(t)||"function"!=typeof(e=t.then))&&e},C=function(t,e){if(!t._n){t._n=!0;var r=t._c;g(function(){for(var n=t._v,i=1==t._s,o=0,a=function(e){var r,o,a=i?e.ok:e.fail,u=e.resolve,s=e.reject,c=e.domain;try{a?(i||(2==t._h&&N(t),t._h=1),!0===a?r=n:(c&&c.enter(),r=a(n),c&&c.exit()),r===e.promise?s(P("Promise-chain cycle")):(o=x(r))?o.call(r,u,s):u(r)):s(n)}catch(t){s(t)}};r.length>o;)a(r[o++]);t._c=[],t._n=!1,e&&!t._h&&j(t)})}},j=function(t){m.call(s,function(){var e,r,n,i=t._v,o=A(t);if(o&&(e=O(function(){R?S.emit("unhandledRejection",i,t):(r=s.onunhandledrejection)?r({promise:t,reason:i}):(n=s.console)&&n.error&&n.error("Unhandled promise rejection",i)}),t._h=R||A(t)?2:1),t._a=void 0,o&&e.e)throw e.v})},A=function(t){return 1!==t._h&&0===(t._a||t._c).length},N=function(t){m.call(s,function(){var e;R?S.emit("rejectionHandled",t):(e=s.onrejectionhandled)&&e({promise:t,reason:t._v})})},I=function(t){var e=this;e._d||(e._d=!0,(e=e._w||e)._v=t,e._s=2,e._a||(e._a=e._c.slice()),C(e,!0))},U=function(t){var e,r=this;if(!r._d){r._d=!0,r=r._w||r;try{if(r===t)throw P("Promise can't be resolved itself");(e=x(t))?g(function(){var n={_w:r,_d:!1};try{e.call(t,c(U,n,1),c(I,n,1))}catch(t){I.call(n,t)}}):(r._v=t,r._s=1,C(r,!1))}catch(t){I.call({_w:r,_d:!1},t)}}};M||(w=function(t){d(this,w,E,"_h"),p(t),n.call(this);try{t(c(U,this,1),c(I,this,1))}catch(t){I.call(this,t)}},(n=function(t){this._c=[],this._a=void 0,this._s=0,this._d=!1,this._v=void 0,this._h=0,this._n=!1}).prototype=r(110)(w.prototype,{then:function(t,e){var r=k(y(this,w));return r.ok="function"!=typeof t||t,r.fail="function"==typeof e&&e,r.domain=R?S.domain:void 0,this._c.push(r),this._a&&this._a.push(r),this._s&&C(this,!1),r.promise},catch:function(t){return this.then(void 0,t)}}),o=function(){var t=new n;this.promise=t,this.resolve=c(U,t,1),this.reject=c(I,t,1)},_.f=k=function(t){return t===w||t===a?new o(t):i(t)}),f(f.G+f.W+f.F*!M,{Promise:w}),r(25)(w,E),r(111)(E),a=r(0).Promise,f(f.S+f.F*!M,E,{reject:function(t){var e=k(this);return(0,e.reject)(t),e.promise}}),f(f.S+f.F*(u||!M),E,{resolve:function(t){return b(u&&this===a?w:this,t)}}),f(f.S+f.F*!(M&&r(112)(function(t){w.all(t).catch(T)})),E,{all:function(t){var e=this,r=k(e),n=r.resolve,i=r.reject,o=O(function(){var r=[],o=0,a=1;v(t,!1,function(t){var u=o++,s=!1;r.push(void 0),a++,e.resolve(t).then(function(t){s||(s=!0,r[u]=t,--a||n(r))},i)}),--a||n(r)});return o.e&&i(o.v),r.promise},race:function(t){var e=this,r=k(e),n=r.reject,i=O(function(){v(t,!1,function(t){e.resolve(t).then(r.resolve,n)})});return i.e&&n(i.v),r.promise}})},function(t,e){t.exports=function(t,e,r,n){if(!(t instanceof e)||void 0!==n&&n in t)throw TypeError(r+": incorrect invocation!");return t}},function(t,e,r){var n=r(14),i=r(106),o=r(107),a=r(9),u=r(48),s=r(100),c={},l={};(e=t.exports=function(t,e,r,f,h){var p,d,v,y,m=h?function(){return t}:s(t),g=n(r,f,e?2:1),_=0;if("function"!=typeof m)throw TypeError(t+" is not iterable!");if(o(m)){for(p=u(t.length);p>_;_++)if((y=e?g(a(d=t[_])[0],d[1]):g(t[_]))===c||y===l)return y}else for(v=m.call(t);!(d=v.next()).done;)if((y=i(v,g,d.value,e))===c||y===l)return y}).BREAK=c,e.RETURN=l},function(t,e,r){var n=r(9);t.exports=function(t,e,r,i){try{return i?e(n(r)[0],r[1]):e(r)}catch(e){var o=t.return;throw void 0!==o&&n(o.call(t)),e}}},function(t,e,r){var n=r(16),i=r(2)("iterator"),o=Array.prototype;t.exports=function(t){return void 0!==t&&(n.Array===t||o[i]===t)}},function(t,e){t.exports=function(t,e,r){var n=void 0===r;switch(e.length){case 0:return n?t():t.call(r);case 1:return n?t(e[0]):t.call(r,e[0]);case 2:return n?t(e[0],e[1]):t.call(r,e[0],e[1]);case 3:return n?t(e[0],e[1],e[2]):t.call(r,e[0],e[1],e[2]);case 4:return n?t(e[0],e[1],e[2],e[3]):t.call(r,e[0],e[1],e[2],e[3])}return t.apply(r,e)}},function(t,e,r){var n=r(1),i=r(67).set,o=n.MutationObserver||n.WebKitMutationObserver,a=n.process,u=n.Promise,s="process"==r(18)(a);t.exports=function(){var t,e,r,c=function(){var n,i;for(s&&(n=a.domain)&&n.exit();t;){i=t.fn,t=t.next;try{i()}catch(n){throw t?r():e=void 0,n}}e=void 0,n&&n.enter()};if(s)r=function(){a.nextTick(c)};else if(!o||n.navigator&&n.navigator.standalone)if(u&&u.resolve){var l=u.resolve();r=function(){l.then(c)}}else r=function(){i.call(n,c)};else{var f=!0,h=document.createTextNode("");new o(c).observe(h,{characterData:!0}),r=function(){h.data=f=!f}}return function(n){var i={fn:n,next:void 0};e&&(e.next=i),t||(t=i,r()),e=i}}},function(t,e,r){var n=r(10);t.exports=function(t,e,r){for(var i in e)r&&t[i]?t[i]=e[i]:n(t,i,e[i]);return t}},function(t,e,r){"use strict";var n=r(1),i=r(0),o=r(8),a=r(3),u=r(2)("species");t.exports=function(t){var e="function"==typeof i[t]?i[t]:n[t];a&&e&&!e[u]&&o.f(e,u,{configurable:!0,get:function(){return this}})}},function(t,e,r){var n=r(2)("iterator"),i=!1;try{var o=[7][n]();o.return=function(){i=!0},Array.from(o,function(){throw 2})}catch(t){}t.exports=function(t,e){if(!e&&!i)return!1;var r=!1;try{var o=[7],a=o[n]();a.next=function(){return{done:r=!0}},o[n]=function(){return a},t(o)}catch(t){}return r}},function(t,e,r){"use strict";var n=r(5),i=r(0),o=r(1),a=r(66),u=r(69);n(n.P+n.R,"Promise",{finally:function(t){var e=a(this,i.Promise||o.Promise),r="function"==typeof t;return this.then(r?function(r){return u(e,t()).then(function(){return r})}:t,r?function(r){return u(e,t()).then(function(){throw r})}:t)}})},function(t,e,r){"use strict";var n=r(5),i=r(54),o=r(68);n(n.S,"Promise",{try:function(t){var e=i.f(this),r=o(t);return(r.e?e.reject:e.resolve)(r.v),e.promise}})},,,,,,,,,,,,,,,,,function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.RethinkObject=void 0;var n=u(r(59)),i=u(r(4)),o=u(r(7)),a=u(r(135));function u(t){return t&&t.__esModule?t:{default:t}}var s=e.RethinkObject=function(){function t(){(0,i.default)(this,t)}return(0,o.default)(t,[{key:"validate",value:function(t){a.default.addSchema(t.id,t);var e=a.default.validateMultiple(JSON.parse((0,n.default)(this)),t);return e.errors.forEach(function(t){delete t.stack}),(!e.valid||e.missing.length>0)&&(console.warn("Object validation "+(e.valid?"succeeded, but schema contained references:":"failed:"),(0,n.default)(e,null,2)),console.log("Object:",(0,n.default)(this,null,2))),e.valid}}]),t}();e.default=s},,,,function(t,e,r){var n,i,o;i=[],void 0===(o="function"==typeof(n=function(){var t,e,r,n;Object.keys||(Object.keys=(t=Object.prototype.hasOwnProperty,e=!{toString:null}.propertyIsEnumerable("toString"),n=(r=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"]).length,function(i){if("object"!=typeof i&&"function"!=typeof i||null===i)throw new TypeError("Object.keys called on non-object");var o=[];for(var a in i)t.call(i,a)&&o.push(a);if(e)for(var u=0;u<n;u++)t.call(i,r[u])&&o.push(r[u]);return o})),Object.create||(Object.create=function(){function t(){}return function(e){if(1!==arguments.length)throw new Error("Object.create implementation only accepts one parameter.");return t.prototype=e,new t}}()),Array.isArray||(Array.isArray=function(t){return"[object Array]"===Object.prototype.toString.call(t)}),Array.prototype.indexOf||(Array.prototype.indexOf=function(t){if(null===this)throw new TypeError;var e=Object(this),r=e.length>>>0;if(0===r)return-1;var n=0;if(arguments.length>1&&((n=Number(arguments[1]))!=n?n=0:0!==n&&n!==1/0&&n!==-1/0&&(n=(n>0||-1)*Math.floor(Math.abs(n)))),n>=r)return-1;for(var i=n>=0?n:Math.max(r-Math.abs(n),0);i<r;i++)if(i in e&&e[i]===t)return i;return-1}),Object.isFrozen||(Object.isFrozen=function(t){for(var e="tv4_test_frozen_key";t.hasOwnProperty(e);)e+=Math.random();try{return t[e]=!0,delete t[e],!1}catch(t){return!0}});var i={"+":!0,"#":!0,".":!0,"/":!0,";":!0,"?":!0,"&":!0},o={"*":!0};function a(t){return encodeURI(t).replace(/%25[0-9][0-9]/g,function(t){return"%"+t.substring(3)})}function u(t){var e="";i[t.charAt(0)]&&(e=t.charAt(0),t=t.substring(1));var r="",n="",u=!0,s=!1,c=!1;"+"===e?u=!1:"."===e?(n=".",r="."):"/"===e?(n="/",r="/"):"#"===e?(n="#",u=!1):";"===e?(n=";",r=";",s=!0,c=!0):"?"===e?(n="?",r="&",s=!0):"&"===e&&(n="&",r="&",s=!0);for(var l=[],f=t.split(","),h=[],p={},d=0;d<f.length;d++){var v=f[d],y=null;if(-1!==v.indexOf(":")){var m=v.split(":");v=m[0],y=parseInt(m[1],10)}for(var g={};o[v.charAt(v.length-1)];)g[v.charAt(v.length-1)]=!0,v=v.substring(0,v.length-1);var _={truncate:y,name:v,suffices:g};h.push(_),p[v]=_,l.push(v)}var O=function(t){for(var e="",i=0,o=0;o<h.length;o++){var l=h[o],f=t(l.name);if(null===f||void 0===f||Array.isArray(f)&&0===f.length||"object"==typeof f&&0===Object.keys(f).length)i++;else if(e+=o===i?n:r||",",Array.isArray(f)){s&&(e+=l.name+"=");for(var p=0;p<f.length;p++)p>0&&(e+=l.suffices["*"]?r||",":",",l.suffices["*"]&&s&&(e+=l.name+"=")),e+=u?encodeURIComponent(f[p]).replace(/!/g,"%21"):a(f[p])}else if("object"==typeof f){s&&!l.suffices["*"]&&(e+=l.name+"=");var d=!0;for(var v in f)d||(e+=l.suffices["*"]?r||",":","),d=!1,e+=u?encodeURIComponent(v).replace(/!/g,"%21"):a(v),e+=l.suffices["*"]?"=":",",e+=u?encodeURIComponent(f[v]).replace(/!/g,"%21"):a(f[v])}else s&&(e+=l.name,c&&""===f||(e+="=")),null!=l.truncate&&(f=f.substring(0,l.truncate)),e+=u?encodeURIComponent(f).replace(/!/g,"%21"):a(f)}return e};return O.varNames=l,{prefix:n,substitution:O}}function s(t){if(!(this instanceof s))return new s(t);for(var e=t.split("{"),r=[e.shift()],n=[],i=[],o=[];e.length>0;){var a=e.shift(),c=a.split("}")[0],l=a.substring(c.length+1),f=u(c);i.push(f.substitution),n.push(f.prefix),r.push(l),o=o.concat(f.substitution.varNames)}this.fill=function(t){for(var e=r[0],n=0;n<i.length;n++){e+=(0,i[n])(t),e+=r[n+1]}return e},this.varNames=o,this.template=t}s.prototype={toString:function(){return this.template},fillFromObject:function(t){return this.fill(function(e){return t[e]})}};var c=function(t,e,r,n,i){if(this.missing=[],this.missingMap={},this.formatValidators=t?Object.create(t.formatValidators):{},this.schemas=t?Object.create(t.schemas):{},this.collectMultiple=e,this.errors=[],this.handleError=e?this.collectError:this.returnError,n&&(this.checkRecursive=!0,this.scanned=[],this.scannedFrozen=[],this.scannedFrozenSchemas=[],this.scannedFrozenValidationErrors=[],this.validatedSchemasKey="tv4_validation_id",this.validationErrorsKey="tv4_validation_errors_id"),i&&(this.trackUnknownProperties=!0,this.knownPropertyPaths={},this.unknownPropertyPaths={}),this.errorReporter=r||m("en"),"string"==typeof this.errorReporter)throw new Error("debug");if(this.definedKeywords={},t)for(var o in t.definedKeywords)this.definedKeywords[o]=t.definedKeywords[o].slice(0)};function l(t,e){if(t===e)return!0;if(t&&e&&"object"==typeof t&&"object"==typeof e){if(Array.isArray(t)!==Array.isArray(e))return!1;if(Array.isArray(t)){if(t.length!==e.length)return!1;for(var r=0;r<t.length;r++)if(!l(t[r],e[r]))return!1}else{var n;for(n in t)if(void 0===e[n]&&void 0!==t[n])return!1;for(n in e)if(void 0===t[n]&&void 0!==e[n])return!1;for(n in t)if(!l(t[n],e[n]))return!1}return!0}return!1}c.prototype.defineKeyword=function(t,e){this.definedKeywords[t]=this.definedKeywords[t]||[],this.definedKeywords[t].push(e)},c.prototype.createError=function(t,e,r,n,i,o,a){var u=new E(t,e,r,n,i);return u.message=this.errorReporter(u,o,a),u},c.prototype.returnError=function(t){return t},c.prototype.collectError=function(t){return t&&this.errors.push(t),null},c.prototype.prefixErrors=function(t,e,r){for(var n=t;n<this.errors.length;n++)this.errors[n]=this.errors[n].prefixWith(e,r);return this},c.prototype.banUnknownProperties=function(t,e){for(var r in this.unknownPropertyPaths){var n=this.createError(g.UNKNOWN_PROPERTY,{path:r},r,"",null,t,e),i=this.handleError(n);if(i)return i}return null},c.prototype.addFormat=function(t,e){if("object"==typeof t){for(var r in t)this.addFormat(r,t[r]);return this}this.formatValidators[t]=e},c.prototype.resolveRefs=function(t,e){if(void 0!==t.$ref){if((e=e||{})[t.$ref])return this.createError(g.CIRCULAR_REFERENCE,{urls:Object.keys(e).join(", ")},"","",null,void 0,t);e[t.$ref]=!0,t=this.getSchema(t.$ref,e)}return t},c.prototype.getSchema=function(t,e){var r;if(void 0!==this.schemas[t])return r=this.schemas[t],this.resolveRefs(r,e);var n=t,i="";if(-1!==t.indexOf("#")&&(i=t.substring(t.indexOf("#")+1),n=t.substring(0,t.indexOf("#"))),"object"==typeof this.schemas[n]){r=this.schemas[n];var o=decodeURIComponent(i);if(""===o)return this.resolveRefs(r,e);if("/"!==o.charAt(0))return;for(var a=o.split("/").slice(1),u=0;u<a.length;u++){var s=a[u].replace(/~1/g,"/").replace(/~0/g,"~");if(void 0===r[s]){r=void 0;break}r=r[s]}if(void 0!==r)return this.resolveRefs(r,e)}void 0===this.missing[n]&&(this.missing.push(n),this.missing[n]=n,this.missingMap[n]=n)},c.prototype.searchSchemas=function(t,e){if(Array.isArray(t))for(var r=0;r<t.length;r++)this.searchSchemas(t[r],e);else if(t&&"object"==typeof t){"string"==typeof t.id&&function(t,e){if(e.substring(0,t.length)===t){var r=e.substring(t.length);if(e.length>0&&"/"===e.charAt(t.length-1)||"#"===r.charAt(0)||"?"===r.charAt(0))return!0}return!1}(e,t.id)&&void 0===this.schemas[t.id]&&(this.schemas[t.id]=t);for(var n in t)if("enum"!==n)if("object"==typeof t[n])this.searchSchemas(t[n],e);else if("$ref"===n){var i=v(t[n]);i&&void 0===this.schemas[i]&&void 0===this.missingMap[i]&&(this.missingMap[i]=i)}}},c.prototype.addSchema=function(t,e){if("string"!=typeof t||void 0===e){if("object"!=typeof t||"string"!=typeof t.id)return;t=(e=t).id}t===v(t)+"#"&&(t=v(t)),this.schemas[t]=e,delete this.missingMap[t],y(e,t),this.searchSchemas(e,t)},c.prototype.getSchemaMap=function(){var t={};for(var e in this.schemas)t[e]=this.schemas[e];return t},c.prototype.getSchemaUris=function(t){var e=[];for(var r in this.schemas)t&&!t.test(r)||e.push(r);return e},c.prototype.getMissingUris=function(t){var e=[];for(var r in this.missingMap)t&&!t.test(r)||e.push(r);return e},c.prototype.dropSchemas=function(){this.schemas={},this.reset()},c.prototype.reset=function(){this.missing=[],this.missingMap={},this.errors=[]},c.prototype.validateAll=function(t,e,r,n,i){var o;if(!(e=this.resolveRefs(e)))return null;if(e instanceof E)return this.errors.push(e),e;var a,u=this.errors.length,s=null,c=null;if(this.checkRecursive&&t&&"object"==typeof t){if(o=!this.scanned.length,t[this.validatedSchemasKey]){var l=t[this.validatedSchemasKey].indexOf(e);if(-1!==l)return this.errors=this.errors.concat(t[this.validationErrorsKey][l]),null}if(Object.isFrozen(t)&&-1!==(a=this.scannedFrozen.indexOf(t))){var f=this.scannedFrozenSchemas[a].indexOf(e);if(-1!==f)return this.errors=this.errors.concat(this.scannedFrozenValidationErrors[a][f]),null}if(this.scanned.push(t),Object.isFrozen(t))-1===a&&(a=this.scannedFrozen.length,this.scannedFrozen.push(t),this.scannedFrozenSchemas.push([])),s=this.scannedFrozenSchemas[a].length,this.scannedFrozenSchemas[a][s]=e,this.scannedFrozenValidationErrors[a][s]=[];else{if(!t[this.validatedSchemasKey])try{Object.defineProperty(t,this.validatedSchemasKey,{value:[],configurable:!0}),Object.defineProperty(t,this.validationErrorsKey,{value:[],configurable:!0})}catch(e){t[this.validatedSchemasKey]=[],t[this.validationErrorsKey]=[]}c=t[this.validatedSchemasKey].length,t[this.validatedSchemasKey][c]=e,t[this.validationErrorsKey][c]=[]}}var h=this.errors.length,p=this.validateBasic(t,e,i)||this.validateNumeric(t,e,i)||this.validateString(t,e,i)||this.validateArray(t,e,i)||this.validateObject(t,e,i)||this.validateCombinations(t,e,i)||this.validateHypermedia(t,e,i)||this.validateFormat(t,e,i)||this.validateDefinedKeywords(t,e,i)||null;if(o){for(;this.scanned.length;){delete this.scanned.pop()[this.validatedSchemasKey]}this.scannedFrozen=[],this.scannedFrozenSchemas=[]}if(p||h!==this.errors.length)for(;r&&r.length||n&&n.length;){var d=r&&r.length?""+r.pop():null,v=n&&n.length?""+n.pop():null;p&&(p=p.prefixWith(d,v)),this.prefixErrors(h,d,v)}return null!==s?this.scannedFrozenValidationErrors[a][s]=this.errors.slice(u):null!==c&&(t[this.validationErrorsKey][c]=this.errors.slice(u)),this.handleError(p)},c.prototype.validateFormat=function(t,e){if("string"!=typeof e.format||!this.formatValidators[e.format])return null;var r=this.formatValidators[e.format].call(null,t,e);return"string"==typeof r||"number"==typeof r?this.createError(g.FORMAT_CUSTOM,{message:r},"","/format",null,t,e):r&&"object"==typeof r?this.createError(g.FORMAT_CUSTOM,{message:r.message||"?"},r.dataPath||"",r.schemaPath||"/format",null,t,e):null},c.prototype.validateDefinedKeywords=function(t,e,r){for(var n in this.definedKeywords)if(void 0!==e[n])for(var i=this.definedKeywords[n],o=0;o<i.length;o++){var a=(0,i[o])(t,e[n],e,r);if("string"==typeof a||"number"==typeof a)return this.createError(g.KEYWORD_CUSTOM,{key:n,message:a},"","",null,t,e).prefixWith(null,n);if(a&&"object"==typeof a){var u=a.code;if("string"==typeof u){if(!g[u])throw new Error("Undefined error code (use defineError): "+u);u=g[u]}else"number"!=typeof u&&(u=g.KEYWORD_CUSTOM);var s="object"==typeof a.message?a.message:{key:n,message:a.message||"?"},c=a.schemaPath||"/"+n.replace(/~/g,"~0").replace(/\//g,"~1");return this.createError(u,s,a.dataPath||null,c,null,t,e)}}return null},c.prototype.validateBasic=function(t,e,r){var n;return(n=this.validateType(t,e,r))?n.prefixWith(null,"type"):(n=this.validateEnum(t,e,r))?n.prefixWith(null,"type"):null},c.prototype.validateType=function(t,e){if(void 0===e.type)return null;var r=typeof t;null===t?r="null":Array.isArray(t)&&(r="array");var n=e.type;Array.isArray(n)||(n=[n]);for(var i=0;i<n.length;i++){var o=n[i];if(o===r||"integer"===o&&"number"===r&&t%1==0)return null}return this.createError(g.INVALID_TYPE,{type:r,expected:n.join("/")},"","",null,t,e)},c.prototype.validateEnum=function(t,e){if(void 0===e.enum)return null;for(var r=0;r<e.enum.length;r++){if(l(t,e.enum[r]))return null}return this.createError(g.ENUM_MISMATCH,{value:"undefined"!=typeof JSON?JSON.stringify(t):t},"","",null,t,e)},c.prototype.validateNumeric=function(t,e,r){return this.validateMultipleOf(t,e,r)||this.validateMinMax(t,e,r)||this.validateNaN(t,e,r)||null};var f=Math.pow(2,-51),h=1-f;function p(t){var e=String(t).replace(/^\s+|\s+$/g,"").match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);return e?{href:e[0]||"",protocol:e[1]||"",authority:e[2]||"",host:e[3]||"",hostname:e[4]||"",port:e[5]||"",pathname:e[6]||"",search:e[7]||"",hash:e[8]||""}:null}function d(t,e){return e=p(e||""),t=p(t||""),e&&t?(e.protocol||t.protocol)+(e.protocol||e.authority?e.authority:t.authority)+(r=e.protocol||e.authority||"/"===e.pathname.charAt(0)?e.pathname:e.pathname?(t.authority&&!t.pathname?"/":"")+t.pathname.slice(0,t.pathname.lastIndexOf("/")+1)+e.pathname:t.pathname,n=[],r.replace(/^(\.\.?(\/|$))+/,"").replace(/\/(\.(\/|$))+/g,"/").replace(/\/\.\.$/,"/../").replace(/\/?[^\/]*/g,function(t){"/.."===t?n.pop():n.push(t)}),n.join("").replace(/^\//,"/"===r.charAt(0)?"/":""))+(e.protocol||e.authority||e.pathname?e.search:e.search||t.search)+e.hash:null;var r,n}function v(t){return t.split("#")[0]}function y(t,e){if(t&&"object"==typeof t)if(void 0===e?e=t.id:"string"==typeof t.id&&(e=d(e,t.id),t.id=e),Array.isArray(t))for(var r=0;r<t.length;r++)y(t[r],e);else{"string"==typeof t.$ref&&(t.$ref=d(e,t.$ref));for(var n in t)"enum"!==n&&y(t[n],e)}}function m(t){var e=P[t=t||"en"];return function(t){var r=e[t.code]||b[t.code];if("string"!=typeof r)return"Unknown error code "+t.code+": "+JSON.stringify(t.messageParams);var n=t.params;return r.replace(/\{([^{}]*)\}/g,function(t,e){var r=n[e];return"string"==typeof r||"number"==typeof r?r:t})}}c.prototype.validateMultipleOf=function(t,e){var r=e.multipleOf||e.divisibleBy;if(void 0===r)return null;if("number"==typeof t){var n=t/r%1;if(n>=f&&n<h)return this.createError(g.NUMBER_MULTIPLE_OF,{value:t,multipleOf:r},"","",null,t,e)}return null},c.prototype.validateMinMax=function(t,e){if("number"!=typeof t)return null;if(void 0!==e.minimum){if(t<e.minimum)return this.createError(g.NUMBER_MINIMUM,{value:t,minimum:e.minimum},"","/minimum",null,t,e);if(e.exclusiveMinimum&&t===e.minimum)return this.createError(g.NUMBER_MINIMUM_EXCLUSIVE,{value:t,minimum:e.minimum},"","/exclusiveMinimum",null,t,e)}if(void 0!==e.maximum){if(t>e.maximum)return this.createError(g.NUMBER_MAXIMUM,{value:t,maximum:e.maximum},"","/maximum",null,t,e);if(e.exclusiveMaximum&&t===e.maximum)return this.createError(g.NUMBER_MAXIMUM_EXCLUSIVE,{value:t,maximum:e.maximum},"","/exclusiveMaximum",null,t,e)}return null},c.prototype.validateNaN=function(t,e){return"number"!=typeof t?null:!0===isNaN(t)||t===1/0||t===-1/0?this.createError(g.NUMBER_NOT_A_NUMBER,{value:t},"","/type",null,t,e):null},c.prototype.validateString=function(t,e,r){return this.validateStringLength(t,e,r)||this.validateStringPattern(t,e,r)||null},c.prototype.validateStringLength=function(t,e){return"string"!=typeof t?null:void 0!==e.minLength&&t.length<e.minLength?this.createError(g.STRING_LENGTH_SHORT,{length:t.length,minimum:e.minLength},"","/minLength",null,t,e):void 0!==e.maxLength&&t.length>e.maxLength?this.createError(g.STRING_LENGTH_LONG,{length:t.length,maximum:e.maxLength},"","/maxLength",null,t,e):null},c.prototype.validateStringPattern=function(t,e){if("string"!=typeof t||"string"!=typeof e.pattern&&!(e.pattern instanceof RegExp))return null;var r;if(e.pattern instanceof RegExp)r=e.pattern;else{var n,i="",o=e.pattern.match(/^\/(.+)\/([img]*)$/);o?(n=o[1],i=o[2]):n=e.pattern,r=new RegExp(n,i)}return r.test(t)?null:this.createError(g.STRING_PATTERN,{pattern:e.pattern},"","/pattern",null,t,e)},c.prototype.validateArray=function(t,e,r){return Array.isArray(t)?this.validateArrayLength(t,e,r)||this.validateArrayUniqueItems(t,e,r)||this.validateArrayItems(t,e,r)||null:null},c.prototype.validateArrayLength=function(t,e){var r;return void 0!==e.minItems&&t.length<e.minItems&&(r=this.createError(g.ARRAY_LENGTH_SHORT,{length:t.length,minimum:e.minItems},"","/minItems",null,t,e),this.handleError(r))?r:void 0!==e.maxItems&&t.length>e.maxItems&&(r=this.createError(g.ARRAY_LENGTH_LONG,{length:t.length,maximum:e.maxItems},"","/maxItems",null,t,e),this.handleError(r))?r:null},c.prototype.validateArrayUniqueItems=function(t,e){if(e.uniqueItems)for(var r=0;r<t.length;r++)for(var n=r+1;n<t.length;n++)if(l(t[r],t[n])){var i=this.createError(g.ARRAY_UNIQUE,{match1:r,match2:n},"","/uniqueItems",null,t,e);if(this.handleError(i))return i}return null},c.prototype.validateArrayItems=function(t,e,r){if(void 0===e.items)return null;var n,i;if(Array.isArray(e.items)){for(i=0;i<t.length;i++)if(i<e.items.length){if(n=this.validateAll(t[i],e.items[i],[i],["items",i],r+"/"+i))return n}else if(void 0!==e.additionalItems)if("boolean"==typeof e.additionalItems){if(!e.additionalItems&&(n=this.createError(g.ARRAY_ADDITIONAL_ITEMS,{},"/"+i,"/additionalItems",null,t,e),this.handleError(n)))return n}else if(n=this.validateAll(t[i],e.additionalItems,[i],["additionalItems"],r+"/"+i))return n}else for(i=0;i<t.length;i++)if(n=this.validateAll(t[i],e.items,[i],["items"],r+"/"+i))return n;return null},c.prototype.validateObject=function(t,e,r){return"object"!=typeof t||null===t||Array.isArray(t)?null:this.validateObjectMinMaxProperties(t,e,r)||this.validateObjectRequiredProperties(t,e,r)||this.validateObjectProperties(t,e,r)||this.validateObjectDependencies(t,e,r)||null},c.prototype.validateObjectMinMaxProperties=function(t,e){var r,n=Object.keys(t);return void 0!==e.minProperties&&n.length<e.minProperties&&(r=this.createError(g.OBJECT_PROPERTIES_MINIMUM,{propertyCount:n.length,minimum:e.minProperties},"","/minProperties",null,t,e),this.handleError(r))?r:void 0!==e.maxProperties&&n.length>e.maxProperties&&(r=this.createError(g.OBJECT_PROPERTIES_MAXIMUM,{propertyCount:n.length,maximum:e.maxProperties},"","/maxProperties",null,t,e),this.handleError(r))?r:null},c.prototype.validateObjectRequiredProperties=function(t,e){if(void 0!==e.required)for(var r=0;r<e.required.length;r++){var n=e.required[r];if(void 0===t[n]){var i=this.createError(g.OBJECT_REQUIRED,{key:n},"","/required/"+r,null,t,e);if(this.handleError(i))return i}}return null},c.prototype.validateObjectProperties=function(t,e,r){var n;for(var i in t){var o=r+"/"+i.replace(/~/g,"~0").replace(/\//g,"~1"),a=!1;if(void 0!==e.properties&&void 0!==e.properties[i]&&(a=!0,n=this.validateAll(t[i],e.properties[i],[i],["properties",i],o)))return n;if(void 0!==e.patternProperties)for(var u in e.patternProperties){if(new RegExp(u).test(i)&&(a=!0,n=this.validateAll(t[i],e.patternProperties[u],[i],["patternProperties",u],o)))return n}if(a)this.trackUnknownProperties&&(this.knownPropertyPaths[o]=!0,delete this.unknownPropertyPaths[o]);else if(void 0!==e.additionalProperties){if(this.trackUnknownProperties&&(this.knownPropertyPaths[o]=!0,delete this.unknownPropertyPaths[o]),"boolean"==typeof e.additionalProperties){if(!e.additionalProperties&&(n=this.createError(g.OBJECT_ADDITIONAL_PROPERTIES,{key:i},"","/additionalProperties",null,t,e).prefixWith(i,null),this.handleError(n)))return n}else if(n=this.validateAll(t[i],e.additionalProperties,[i],["additionalProperties"],o))return n}else this.trackUnknownProperties&&!this.knownPropertyPaths[o]&&(this.unknownPropertyPaths[o]=!0)}return null},c.prototype.validateObjectDependencies=function(t,e,r){var n;if(void 0!==e.dependencies)for(var i in e.dependencies)if(void 0!==t[i]){var o=e.dependencies[i];if("string"==typeof o){if(void 0===t[o]&&(n=this.createError(g.OBJECT_DEPENDENCY_KEY,{key:i,missing:o},"","",null,t,e).prefixWith(null,i).prefixWith(null,"dependencies"),this.handleError(n)))return n}else if(Array.isArray(o))for(var a=0;a<o.length;a++){var u=o[a];if(void 0===t[u]&&(n=this.createError(g.OBJECT_DEPENDENCY_KEY,{key:i,missing:u},"","/"+a,null,t,e).prefixWith(null,i).prefixWith(null,"dependencies"),this.handleError(n)))return n}else if(n=this.validateAll(t,o,[],["dependencies",i],r))return n}return null},c.prototype.validateCombinations=function(t,e,r){return this.validateAllOf(t,e,r)||this.validateAnyOf(t,e,r)||this.validateOneOf(t,e,r)||this.validateNot(t,e,r)||null},c.prototype.validateAllOf=function(t,e,r){if(void 0===e.allOf)return null;for(var n,i=0;i<e.allOf.length;i++){var o=e.allOf[i];if(n=this.validateAll(t,o,[],["allOf",i],r))return n}return null},c.prototype.validateAnyOf=function(t,e,r){if(void 0===e.anyOf)return null;var n,i,o=[],a=this.errors.length;this.trackUnknownProperties&&(n=this.unknownPropertyPaths,i=this.knownPropertyPaths);for(var u=!0,s=0;s<e.anyOf.length;s++){this.trackUnknownProperties&&(this.unknownPropertyPaths={},this.knownPropertyPaths={});var c=e.anyOf[s],l=this.errors.length,f=this.validateAll(t,c,[],["anyOf",s],r);if(null===f&&l===this.errors.length){if(this.errors=this.errors.slice(0,a),this.trackUnknownProperties){for(var h in this.knownPropertyPaths)i[h]=!0,delete n[h];for(var p in this.unknownPropertyPaths)i[p]||(n[p]=!0);u=!1;continue}return null}f&&o.push(f.prefixWith(null,""+s).prefixWith(null,"anyOf"))}return this.trackUnknownProperties&&(this.unknownPropertyPaths=n,this.knownPropertyPaths=i),u?(o=o.concat(this.errors.slice(a)),this.errors=this.errors.slice(0,a),this.createError(g.ANY_OF_MISSING,{},"","/anyOf",o,t,e)):void 0},c.prototype.validateOneOf=function(t,e,r){if(void 0===e.oneOf)return null;var n,i,o=null,a=[],u=this.errors.length;this.trackUnknownProperties&&(n=this.unknownPropertyPaths,i=this.knownPropertyPaths);for(var s=0;s<e.oneOf.length;s++){this.trackUnknownProperties&&(this.unknownPropertyPaths={},this.knownPropertyPaths={});var c=e.oneOf[s],l=this.errors.length,f=this.validateAll(t,c,[],["oneOf",s],r);if(null===f&&l===this.errors.length){if(null!==o)return this.errors=this.errors.slice(0,u),this.createError(g.ONE_OF_MULTIPLE,{index1:o,index2:s},"","/oneOf",null,t,e);if(o=s,this.trackUnknownProperties){for(var h in this.knownPropertyPaths)i[h]=!0,delete n[h];for(var p in this.unknownPropertyPaths)i[p]||(n[p]=!0)}}else f&&a.push(f)}return this.trackUnknownProperties&&(this.unknownPropertyPaths=n,this.knownPropertyPaths=i),null===o?(a=a.concat(this.errors.slice(u)),this.errors=this.errors.slice(0,u),this.createError(g.ONE_OF_MISSING,{},"","/oneOf",a,t,e)):(this.errors=this.errors.slice(0,u),null)},c.prototype.validateNot=function(t,e,r){if(void 0===e.not)return null;var n,i,o=this.errors.length;this.trackUnknownProperties&&(n=this.unknownPropertyPaths,i=this.knownPropertyPaths,this.unknownPropertyPaths={},this.knownPropertyPaths={});var a=this.validateAll(t,e.not,null,null,r),u=this.errors.slice(o);return this.errors=this.errors.slice(0,o),this.trackUnknownProperties&&(this.unknownPropertyPaths=n,this.knownPropertyPaths=i),null===a&&0===u.length?this.createError(g.NOT_PASSED,{},"","/not",null,t,e):null},c.prototype.validateHypermedia=function(t,e,r){if(!e.links)return null;for(var n,i=0;i<e.links.length;i++){var o=e.links[i];if("describedby"===o.rel){for(var a=new s(o.href),u=!0,c=0;c<a.varNames.length;c++)if(!(a.varNames[c]in t)){u=!1;break}if(u){var l={$ref:a.fillFromObject(t)};if(n=this.validateAll(t,l,[],["links",i],r))return n}}}};var g={INVALID_TYPE:0,ENUM_MISMATCH:1,ANY_OF_MISSING:10,ONE_OF_MISSING:11,ONE_OF_MULTIPLE:12,NOT_PASSED:13,NUMBER_MULTIPLE_OF:100,NUMBER_MINIMUM:101,NUMBER_MINIMUM_EXCLUSIVE:102,NUMBER_MAXIMUM:103,NUMBER_MAXIMUM_EXCLUSIVE:104,NUMBER_NOT_A_NUMBER:105,STRING_LENGTH_SHORT:200,STRING_LENGTH_LONG:201,STRING_PATTERN:202,OBJECT_PROPERTIES_MINIMUM:300,OBJECT_PROPERTIES_MAXIMUM:301,OBJECT_REQUIRED:302,OBJECT_ADDITIONAL_PROPERTIES:303,OBJECT_DEPENDENCY_KEY:304,ARRAY_LENGTH_SHORT:400,ARRAY_LENGTH_LONG:401,ARRAY_UNIQUE:402,ARRAY_ADDITIONAL_ITEMS:403,FORMAT_CUSTOM:500,KEYWORD_CUSTOM:501,CIRCULAR_REFERENCE:600,UNKNOWN_PROPERTY:1e3},_={};for(var O in g)_[g[O]]=O;var b={INVALID_TYPE:"Invalid type: {type} (expected {expected})",ENUM_MISMATCH:"No enum match for: {value}",ANY_OF_MISSING:'Data does not match any schemas from "anyOf"',ONE_OF_MISSING:'Data does not match any schemas from "oneOf"',ONE_OF_MULTIPLE:'Data is valid against more than one schema from "oneOf": indices {index1} and {index2}',NOT_PASSED:'Data matches schema from "not"',NUMBER_MULTIPLE_OF:"Value {value} is not a multiple of {multipleOf}",NUMBER_MINIMUM:"Value {value} is less than minimum {minimum}",NUMBER_MINIMUM_EXCLUSIVE:"Value {value} is equal to exclusive minimum {minimum}",NUMBER_MAXIMUM:"Value {value} is greater than maximum {maximum}",NUMBER_MAXIMUM_EXCLUSIVE:"Value {value} is equal to exclusive maximum {maximum}",NUMBER_NOT_A_NUMBER:"Value {value} is not a valid number",STRING_LENGTH_SHORT:"String is too short ({length} chars), minimum {minimum}",STRING_LENGTH_LONG:"String is too long ({length} chars), maximum {maximum}",STRING_PATTERN:"String does not match pattern: {pattern}",OBJECT_PROPERTIES_MINIMUM:"Too few properties defined ({propertyCount}), minimum {minimum}",OBJECT_PROPERTIES_MAXIMUM:"Too many properties defined ({propertyCount}), maximum {maximum}",OBJECT_REQUIRED:"Missing required property: {key}",OBJECT_ADDITIONAL_PROPERTIES:"Additional properties not allowed",OBJECT_DEPENDENCY_KEY:"Dependency failed - key must exist: {missing} (due to key: {key})",ARRAY_LENGTH_SHORT:"Array is too short ({length}), minimum {minimum}",ARRAY_LENGTH_LONG:"Array is too long ({length}), maximum {maximum}",ARRAY_UNIQUE:"Array items are not unique (indices {match1} and {match2})",ARRAY_ADDITIONAL_ITEMS:"Additional items not allowed",FORMAT_CUSTOM:"Format validation failed ({message})",KEYWORD_CUSTOM:"Keyword failed: {key} ({message})",CIRCULAR_REFERENCE:"Circular $refs: {urls}",UNKNOWN_PROPERTY:"Unknown property (not in schema)"};function E(t,e,r,n,i){if(Error.call(this),void 0===t)throw new Error("No error code supplied: "+n);this.message="",this.params=e,this.code=t,this.dataPath=r||"",this.schemaPath=n||"",this.subErrors=i||null;var o=new Error(this.message);if(this.stack=o.stack||o.stacktrace,!this.stack)try{throw o}catch(o){this.stack=o.stack||o.stacktrace}}E.prototype=Object.create(Error.prototype),E.prototype.constructor=E,E.prototype.name="ValidationError",E.prototype.prefixWith=function(t,e){if(null!==t&&(t=t.replace(/~/g,"~0").replace(/\//g,"~1"),this.dataPath="/"+t+this.dataPath),null!==e&&(e=e.replace(/~/g,"~0").replace(/\//g,"~1"),this.schemaPath="/"+e+this.schemaPath),null!==this.subErrors)for(var r=0;r<this.subErrors.length;r++)this.subErrors[r].prefixWith(t,e);return this};var P={};var S=function t(e){var r,n,i=new c,o={setErrorReporter:function(t){return"string"==typeof t?this.language(t):(n=t,!0)},addFormat:function(){i.addFormat.apply(i,arguments)},language:function(t){return t?(P[t]||(t=t.split("-")[0]),!!P[t]&&(r=t,t)):r},addLanguage:function(t,e){var r;for(r in g)e[r]&&!e[g[r]]&&(e[g[r]]=e[r]);var n=t.split("-")[0];if(P[n]){P[t]=Object.create(P[n]);for(r in e)void 0===P[n][r]&&(P[n][r]=e[r]),P[t][r]=e[r]}else P[t]=e,P[n]=e;return this},freshApi:function(e){var r=t();return e&&r.language(e),r},validate:function(t,e,o,a){var u=m(r),s=new c(i,!1,n?function(t,e,r){return n(t,e,r)||u(t,e,r)}:u,o,a);"string"==typeof e&&(e={$ref:e}),s.addSchema("",e);var l=s.validateAll(t,e,null,null,"");return!l&&a&&(l=s.banUnknownProperties(t,e)),this.error=l,this.missing=s.missing,this.valid=null===l,this.valid},validateResult:function(){var t={toString:function(){return this.valid?"valid":this.error.message}};return this.validate.apply(t,arguments),t},validateMultiple:function(t,e,o,a){var u=m(r),s=new c(i,!0,n?function(t,e,r){return n(t,e,r)||u(t,e,r)}:u,o,a);"string"==typeof e&&(e={$ref:e}),s.addSchema("",e),s.validateAll(t,e,null,null,""),a&&s.banUnknownProperties(t,e);var l={toString:function(){return this.valid?"valid":this.error.message}};return l.errors=s.errors,l.missing=s.missing,l.valid=0===l.errors.length,l},addSchema:function(){return i.addSchema.apply(i,arguments)},getSchema:function(){return i.getSchema.apply(i,arguments)},getSchemaMap:function(){return i.getSchemaMap.apply(i,arguments)},getSchemaUris:function(){return i.getSchemaUris.apply(i,arguments)},getMissingUris:function(){return i.getMissingUris.apply(i,arguments)},dropSchemas:function(){i.dropSchemas.apply(i,arguments)},defineKeyword:function(){i.defineKeyword.apply(i,arguments)},defineError:function(t,e,r){if("string"!=typeof t||!/^[A-Z]+(_[A-Z]+)*$/.test(t))throw new Error("Code name must be a string in UPPER_CASE_WITH_UNDERSCORES");if("number"!=typeof e||e%1!=0||e<1e4)throw new Error("Code number must be an integer > 10000");if(void 0!==g[t])throw new Error("Error already defined: "+t+" as "+g[t]);if(void 0!==_[e])throw new Error("Error code already used: "+_[e]+" as "+e);g[t]=e,_[e]=t,b[t]=b[e]=r;for(var n in P){var i=P[n];i[t]&&(i[e]=i[e]||i[t])}},reset:function(){i.reset(),this.error=null,this.missing=[],this.valid=!0},missing:[],error:null,valid:!0,normSchema:y,resolveUrl:d,getDocumentUri:v,errorCodes:g};return o.language(e||"en"),o}();return S.addLanguage("en-gb",b),S.tv4=S,S})?n.apply(e,i):n)||(t.exports=o)},,,,function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=o(r(4)),i=o(r(7));function o(t){return t&&t.__esModule?t:{default:t}}var a=function(){function t(e,r){(0,n.default)(this,t),this._sourceCode=r,this._sourceCodeClassname=e,this._encoding=null,this._signature=null}return(0,i.default)(t,[{key:"sourceCode",get:function(){return this._sourceCode},set:function(t){t&&(this._sourceCode=t)}},{key:"sourceCodeClassname",get:function(){return this._sourceCodeClassname},set:function(t){t&&(this._sourceCodeClassname=t)}},{key:"encoding",get:function(){return this._encoding},set:function(t){t&&(this._encoding=t)}},{key:"signature",get:function(){return this._signature},set:function(t){t&&(this._signature=t)}}]),t}();e.default=a,t.exports=e.default},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.HypertyResourceType=e.HypertyType=e.RuntimeHypertyCapabilityType=void 0;var n=s(r(28)),i=s(r(4)),o=s(r(7)),a=s(r(36)),u=s(r(37));function s(t){return t&&t.__esModule?t:{default:t}}var c=function(t){function e(t,r,o,u,s,c,l,f,h){(0,i.default)(this,e);var p=(0,a.default)(this,(e.__proto__||(0,n.default)(e)).call(this,t,r,o,u,s,c,l));return p._configuration={},p._constraints={},p._policies={},p._messageSchema=null,p._hypertyType=f,p._dataObjects=h,p}return(0,u.default)(e,t),(0,o.default)(e,[{key:"hypertyType",get:function(){return this._hypertyType},set:function(t){t&&(this._hypertyType=t)}},{key:"dataObjects",get:function(){return this._dataObjects},set:function(t){t&&(this._dataObjects=t)}},{key:"configuration",get:function(){return this._configuration},set:function(t){t&&(this._configuration=t)}},{key:"constraints",get:function(){return this._constraints},set:function(t){t&&(this._constraints=t)}},{key:"messageSchema",get:function(){return this._messageSchema},set:function(t){t&&(this._messageSchema=t)}},{key:"policies",get:function(){return this._policies},set:function(t){t&&(this._policies=t)}}]),e}(s(r(101)).default);e.RuntimeHypertyCapabilityType={},e.HypertyType={COMMUNICATOR:"communicator",IDENTITY:"identity",CONTEXT:"context"},e.HypertyResourceType={chat:"CHAT",audio:"Audio",video:"Video",av:"AV",screen:"SCREEN",file:"FILe",midi:"MIDI"};e.default=c},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=s(r(28)),i=s(r(4)),o=s(r(7)),a=s(r(36)),u=s(r(37));function s(t){return t&&t.__esModule?t:{default:t}}var c=function(t){function e(t,r,o,u,s,c,l,f,h,p,d,v,y,m,g){(0,i.default)(this,e);var _=(0,a.default)(this,(e.__proto__||(0,n.default)(e)).call(this,t,r,o,u,s,c,l));return _._messageSchemas=f,_._configuration=h||{},_._constraints=p||{},_._hypertyType=d,_._dataObjects=v||[],_._interworking=y,_._idpProxy=m,_._mutualAuthentication=g,_}return(0,u.default)(e,t),(0,o.default)(e,[{key:"messageSchemas",get:function(){return this._messageSchemas},set:function(t){t&&(this._messageSchemas=t)}},{key:"constraints",get:function(){return this._constraints},set:function(t){t&&(this._constraints=t)}},{key:"configuration",get:function(){return this._configuration},set:function(t){t&&(this._configuration=t)}},{key:"hypertyType",get:function(){return this._hypertyType},set:function(t){this._hypertyType=t}},{key:"dataObjects",get:function(){return this._dataObjects},set:function(t){this._dataObjects=t}},{key:"interworking",get:function(){return this._interworking},set:function(t){this._interworking=t}},{key:"idpProxy",get:function(){return this._idpProxy},set:function(t){this._idpProxy=t}},{key:"mutualAuthentication",get:function(){return this._mutualAuthentication},set:function(t){this._mutualAuthentication=t}}]),e}(s(r(101)).default);e.default=c,t.exports=e.default},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=p(r(4)),i=p(r(7)),o=r(101),a=p(o),u=p(r(139)),s=p(r(140)),c=p(r(141)),l=p(r(143)),f=p(r(144)),h=r(145);function p(t){return t&&t.__esModule?t:{default:t}}var d=function(){function t(){(0,n.default)(this,t)}return(0,i.default)(t,[{key:"createCatalogueDataObject",value:function(t,e,r,n,i,o,u){if(void 0===t||void 0===e||void 0===r||void 0===n||void 0===i||void 0===o||void 0===u)throw new Error("Invalid parameters!");return new a.default(t,e,r,n,i,o,u)}},{key:"createHypertyDescriptorObject",value:function(t,e,r,n,i,a,u,c){if(void 0===t||void 0===e||void 0===r||void 0===n||void 0===i||void 0===a||void 0===u||void 0===c)throw new Error("Invalid parameters!");return new s.default(t,o.CatalogueObjectType.HYPERTY,e,r,n,i,a,u,c)}},{key:"createProtoStubDescriptorObject",value:function(t,e,r,n,i,a,u,s,l,f,h,p,d,v){if(void 0===t||void 0===e||void 0===r||void 0===n||void 0===i||void 0===a||void 0===u||void 0===s||void 0===l)throw new Error("Invalid parameters!");return new c.default(t,o.CatalogueObjectType.PROTOSTUB,e,r,n,i,a,u,s,l,f,h,p,d,v)}},{key:"createHypertyRuntimeDescriptorObject",value:function(t,e,r,n,i,a,u,s,c,f,h){if(void 0===t||void 0===e||void 0===r||void 0===n||void 0===i||void 0===a||void 0===u)throw new Error("Invalid parameters!");return new l.default(t,o.CatalogueObjectType.HYPERTY_RUNTIME,e,r,n,i,a,u,s,c,f,h)}},{key:"createHypertyInterceptorDescriptorObject",value:function(t,e,r,n,i,a,u,s){if(void 0===t||void 0===e||void 0===r||void 0===n||void 0===i||void 0===a)throw new Error("Invalid parameters!");return new f.default(t,o.CatalogueObjectType.HYPERTY_INTERCEPTOR,e,r,n,i,a,u,s)}},{key:"createDataObjectSchema",value:function(t,e,r,n,i,a){if(void 0===t||void 0===e||void 0===r||void 0===n||void 0===i||void 0===a)throw new Error("Invalid parameters!");return new h.DataObjectSchema(t,o.CatalogueObjectType.HYPERTY_DATA_OBJECT,e,r,n,i,a)}},{key:"createMessageDataObjectSchema",value:function(t,e,r,n,i,a){if(void 0===t||void 0===e||void 0===r||void 0===n||void 0===i||void 0===a)throw new Error("Invalid parameters!");return new h.DataObjectSchema(t,o.CatalogueObjectType.HYPERTY_DATA_OBJECT,e,r,n,i,a)}},{key:"createHypertyDataObjectSchema",value:function(t,e,r,n,i,a,u,s){if(void 0===t||void 0===e||void 0===r||void 0===n||void 0===i||void 0===a||void 0===s||void 0===u)throw new Error("Invalid parameters!");return s===h.DataUrlScheme.COMM?new h.CommunicationDataObjectSchema(t,o.CatalogueObjectType.HYPERTY_DATA_OBJECT,e,r,n,i,a,s,u):s===h.DataUrlScheme.CONNECTION?new h.ConnectionDataObjectSchema(t,o.CatalogueObjectType.HYPERTY_DATA_OBJECT,e,r,n,i,a,s,u):s===h.DataUrlScheme.CTXT?new h.ContextDataObjectSchema(t,o.CatalogueObjectType.HYPERTY_DATA_OBJECT,e,r,n,i,a,s,u):s===h.DataUrlScheme.IDENTITY?new h.IdentityDataObjectSchema(t,o.CatalogueObjectType.HYPERTY_DATA_OBJECT,e,r,n,i,a,s,u):void 0}},{key:"createSourcePackage",value:function(t,e){if(void 0===e||void 0===t)throw new Error("Invalid parameters!");return new u.default(t,e)}}]),t}();e.default=d,t.exports=e.default},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.RuntimeType=e.RuntimeProtocolCapability=e.RuntimeHypertyCapability=void 0;var n=c(r(59)),i=c(r(28)),o=c(r(4)),a=c(r(7)),u=c(r(36)),s=c(r(37));function c(t){return t&&t.__esModule?t:{default:t}}var l=function(t){function e(t,r,n,a,s,c,l,p,d,v,y,m){(0,o.default)(this,e);var g=(0,u.default)(this,(e.__proto__||(0,i.default)(e)).call(this,t,r,n,a,s,c,l));return g._runtimeType=p,g._hypertyCapabilities=d||new f(!0,!1,!1,!1,!1),g._protocolCapabilities=v||new h(!0,!1,!0,!1,!1,!1),g._p2pHandlerStub=y,g._p2pRequesterStub=m,g}return(0,s.default)(e,t),(0,a.default)(e,[{key:"runtimeType",get:function(){return this._runtimeType},set:function(t){t&&(this._runtimeType=t)}},{key:"hypertyCapabilities",get:function(){return this._hypertyCapabilities},set:function(t){t&&(this._hypertyCapabilities=t)}},{key:"protocolCapabilities",get:function(){return this._hypertyCapabilities},set:function(t){t&&(this._protocolCapabilities=t)}},{key:"p2pHandlerStub",get:function(){return this._p2pHandlerStub},set:function(t){this._p2pHandlerStub=t}},{key:"p2pRequesterStub",get:function(){return this._p2pRequesterStub},set:function(t){this._p2pRequesterStub=t}}]),e}(c(r(101)).default),f=e.RuntimeHypertyCapability=function(){function t(e,r,n,i,a){(0,o.default)(this,t),this._isWebRTC=e,this._isMic=r,this._isCamera=n,this._isSensor=i,this._isORTC=a}return(0,a.default)(t,[{key:"getCapabilitySet",value:function(){return(0,n.default)(this)}},{key:"isMic",get:function(){return this._isMic}},{key:"isCamera",get:function(){return this._isCamera}},{key:"isSensor",get:function(){return this._isSensor}},{key:"isWebRTC",get:function(){return this._isWebRTC}},{key:"isORTCS",get:function(){return this._isORTC}}]),t}(),h=e.RuntimeProtocolCapability=function(){function t(e,r,n,i,a,u){(0,o.default)(this,t),this._isHttp=e,this._isHttps=r,this._isWS=n,this._isWSS=i,this._isCoap=a,this._isDataChannel=u}return(0,a.default)(t,[{key:"isHttp",value:function(){return this._isHttp}},{key:"isHttps",value:function(){return this._isHttps}},{key:"isWS",value:function(){return this._isWS}},{key:"isSensorSupported",value:function(){return this._isSensor}},{key:"isWSS",value:function(){return this._isWSS}},{key:"isCoap",value:function(){return this._isCoap}},{key:"isDataChannel",value:function(){return this._isDataChannel}},{key:"getCapabilitySet",value:function(){return(0,n.default)(this)}}]),t}();e.RuntimeType={BROWSER:"browser",STANDALONE:"standalone",SERVER:"server",GATEWAY:"gateway"};e.default=l},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=s(r(28)),i=s(r(4)),o=s(r(7)),a=s(r(36)),u=s(r(37));function s(t){return t&&t.__esModule?t:{default:t}}var c=function(t){function e(t,r,o,u,s,c,l,f,h){(0,i.default)(this,e);var p=(0,a.default)(this,(e.__proto__||(0,n.default)(e)).call(this,t,r,o,u,s,c,l));return p._configuration=f,p._policies=h,p}return(0,u.default)(e,t),(0,o.default)(e,[{key:"configuration",get:function(){return this._configuration},set:function(t){this._configuration=t}},{key:"policies",get:function(){return this._policies},set:function(t){this._policies=t}}]),e}(s(r(101)).default);e.default=c,t.exports=e.default},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.DataUrlScheme=e.ContextDataObjectSchema=e.IdentityDataObjectSchema=e.ConnectionDataObjectSchema=e.CommunicationDataObjectSchema=e.HypertyDataObjectSchema=e.MessageDataObjectSchema=e.DataObjectSchema=void 0;var n=s(r(28)),i=s(r(4)),o=s(r(36)),a=s(r(37)),u=s(r(101));function s(t){return t&&t.__esModule?t:{default:t}}var c=e.DataObjectSchema=function(t){function e(t,r,a,u,s,c,l){return(0,i.default)(this,e),(0,o.default)(this,(e.__proto__||(0,n.default)(e)).call(this,t,r,a,u,s,c,l))}return(0,a.default)(e,t),e}(u.default),l=(e.MessageDataObjectSchema=function(t){function e(t,r,a,u,s,c,l){return(0,i.default)(this,e),(0,o.default)(this,(e.__proto__||(0,n.default)(e)).call(this,t,r,a,u,s,c,l))}return(0,a.default)(e,t),e}(c),e.HypertyDataObjectSchema=function(t){function e(t,r,a,u,s,c,l,f,h){(0,i.default)(this,e);var p=(0,o.default)(this,(e.__proto__||(0,n.default)(e)).call(this,t,r,a,u,s,c,l));return p._accessControlPolicy=f,p._scheme=h,p}return(0,a.default)(e,t),e}(c));e.CommunicationDataObjectSchema=function(t){function e(t,r,a,u,s,c,l,f){return(0,i.default)(this,e),(0,o.default)(this,(e.__proto__||(0,n.default)(e)).call(this,t,r,a,u,s,c,l,f))}return(0,a.default)(e,t),e}(l),e.ConnectionDataObjectSchema=function(t){function e(t,r,a,u,s,c,l,f){return(0,i.default)(this,e),(0,o.default)(this,(e.__proto__||(0,n.default)(e)).call(this,t,r,a,u,s,c,l,f))}return(0,a.default)(e,t),e}(l),e.IdentityDataObjectSchema=function(t){function e(t,r,a,u,s,c,l,f){return(0,i.default)(this,e),(0,o.default)(this,(e.__proto__||(0,n.default)(e)).call(this,t,r,a,u,s,c,l,f))}return(0,a.default)(e,t),e}(l),e.ContextDataObjectSchema=function(t){function e(t,r,a,u,s,c,l,f){return(0,i.default)(this,e),(0,o.default)(this,(e.__proto__||(0,n.default)(e)).call(this,t,r,a,u,s,c,l,f))}return(0,a.default)(e,t),e}(l),e.DataUrlScheme={COMM:"COMM",CONNECTION:"CONNECTION",CTXT:"CTXT",IDENTITY:"IDENTITY"};e.default=c},,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.RuntimeCatalogue=void 0;var n,i=function(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r]);return e.default=t,e}(r(23)),o=r(183),a=(n=o)&&n.__esModule?n:{default:n};i.getLogger("RuntimeCatalogue").setLevel(0),e.RuntimeCatalogue=a.default},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=l(r(184)),i=l(r(59)),o=l(r(20)),a=l(r(4)),u=l(r(7)),s=function(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r]);return e.default=t,e}(r(23)),c=l(r(142));function l(t){return t&&t.__esModule?t:{default:t}}var f=s.getLogger("RuntimeCatalogue"),h=function(){function t(e,r,n){if((0,a.default)(this,t),!e)throw Error("The catalogue needs the runtimeFactory");this._factory=new c.default,this.httpRequest=e.createHttpRequest(),this.atob=e.atob?e.atob:atob;var i=r||"runtimeCatalogue",o=n||"&cguid, accessControlPolicy, constraints, dataObjects, hypertyType, objectName, sourcePackage, version",u={};u[i]=o,this.storageManager=e.storageManager(i,u)}return(0,u.default)(t,[{key:"getDescriptor",value:function(t,e){var r=this,a=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],u=arguments[3];f.info("[RuntimeCatalogue] - getting descriptor from: ",t," with constraints: ",u);var s=!1,c=!1,l=void 0,h=l=(l=void 0!=u?o.default.all([this.httpRequest.post(t+"/version",{body:(0,i.default)(u)}),this.httpRequest.post(t+"/cguid",{body:(0,i.default)(u)})]):o.default.all([this.httpRequest.get(t+"/version"),this.httpRequest.get(t+"/cguid")])).then(function(e){var o=(0,n.default)(e,2),a=o[0],c=o[1];return f.info("[RuntimeCatalogue] - got version ("+a+") and cguid ("+c+") for descriptor "+t),r.storageManager.getVersion("cguid",c).then(function(e){return e>=a?(f.warn("storageManager contains saved version that is the same or newer than requested"),s=!0,r.storageManager.get("cguid",c)):(f.warn("storageManager does not contain saved version"),(void 0!=u?r.httpRequest.post(t,{body:(0,i.default)(u)}):r.httpRequest.get(t)).then(function(t){if((t=JSON.parse(t)).ERROR)throw new Error(t);return t}))})}).catch(function(e){var r="Unable to get descriptor for "+t+(void 0!=u?" with constraints "+u:"")+": "+e;throw f.error(r),new Error(r)});return a&&(f.log("adding promise to attach sourcePackage"),h=l.then(function(t){return t.sourcePackage?(c=!0,t):(c=!1,r.attachRawSourcePackage(t))})),h=h.then(function(t){return(!s||s&&!c&&a)&&r.storageManager.set(t.cguid,t.version,t),e.apply(r,[t,u])})}},{key:"attachRawSourcePackage",value:function(t,e){var r=this;return f.log("attaching raw sourcePackage from:",t.sourcePackageURL),new o.default(function(n,o){(void 0!=e?r.httpRequest.post(t.sourcePackageURL,{body:(0,i.default)(e)}):r.httpRequest.get(t.sourcePackageURL)).then(function(e){e=JSON.parse(e),t.sourcePackage=e,n(t)}).catch(function(t){o(t)})})}},{key:"getHypertyDescriptor",value:function(t){var e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],r=arguments[2];return this.getDescriptor(t,this.createHyperty,e,r)}},{key:"getStubDescriptor",value:function(t){var e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],r=arguments[2];return this.getDescriptor(t,this.createStub,e,r)}},{key:"getRuntimeDescriptor",value:function(t){var e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],r=arguments[2];return this.getDescriptor(t,this.createRuntimeDescriptor,e,r)}},{key:"getDataSchemaDescriptor",value:function(t){var e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],r=arguments[2];return this.getDescriptor(t,this.createDataSchema,e,r)}},{key:"getIdpProxyDescriptor",value:function(t){var e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],r=arguments[2];return this.getDescriptor(t,this.createIdpProxy,e,r)}},{key:"createHyperty",value:function(t){var e=this._factory.createHypertyDescriptorObject(t.cguid,t.version,t.objectName,t.description,t.language,t.sourcePackageURL,t.type||t.hypertyType,t.dataObjects);e.configuration=t.configuration,e.constraints=t.constraints,e.messageSchema=t.messageSchema,e.policies=t.policies,e.signature=t.signature;var r=t.sourcePackage;return r&&(e.sourcePackage=this.createSourcePackage(r)),e}},{key:"createStub",value:function(t){var e=this._factory.createProtoStubDescriptorObject(t.cguid,t.version,t.objectName,t.description,t.language,t.sourcePackageURL,t.messageSchemas,t.configuration,t.constraints,t.hypertyType,t.dataObjects,t.interworking,t.idpProxy,t.mutualAuthentication);e.signature=t.signature;var r=t.sourcePackage;return r&&(e.sourcePackage=this.createSourcePackage(r)),e}},{key:"createRuntimeDescriptor",value:function(t){try{t.hypertyCapabilities=JSON.parse(t.hypertyCapabilities),t.protocolCapabilities=JSON.parse(t.protocolCapabilities)}catch(t){}var e=this._factory.createHypertyRuntimeDescriptorObject(t.cguid,t.version,t.objectName,t.description,t.language,t.sourcePackageURL,t.type||t.runtimeType,t.hypertyCapabilities,t.protocolCapabilities,t.p2pHandlerStub,t.p2pRequesterStub);e.signature=t.signature;var r=t.sourcePackage;return r&&(e.sourcePackage=this.createSourcePackage(r)),e}},{key:"createDataSchema",value:function(t){var e=void 0;(e=t.accessControlPolicy&&t.scheme?this._factory.createHypertyDataObjectSchema(t.cguid,t.version,t.objectName,t.description,t.language,t.sourcePackageURL,t.accessControlPolicy,t.scheme):this._factory.createMessageDataObjectSchema(t.cguid,t.version,t.objectName,t.description,t.language,t.sourcePackageURL)).signature=t.signature;var r=t.sourcePackage;if(r){e.sourcePackage=this.createSourcePackage(r);try{e.sourcePackage.sourceCode=JSON.parse(e.sourcePackage.sourceCode)}catch(t){f.log("DataSchema Source code is already parsed")}return e}return e}},{key:"createIdpProxy",value:function(t){var e=this._factory.createProtoStubDescriptorObject(t.cguid,t.version,t.objectName,t.description,t.language,t.sourcePackageURL,t.messageSchemas,t.configuration,t.constraints,t.hypertyType,t.dataObjects,t.interworking,t.idpProxy,t.mutualAuthentication);e.signature=t.signature;var r=t.sourcePackage;return r&&(r=this.createSourcePackage(r),e.sourcePackage=r),e}},{key:"createSourcePackage",value:function(t){"base64"===t.encoding&&(t.sourceCode=this.atob(t.sourceCode),t.encoding="utf-8");var e=this._factory.createSourcePackage(t.sourceCodeClassname,t.sourceCode);return t.encoding&&(e.encoding=t.encoding),t.signature&&(e.signature=t.signature),e}},{key:"getSourcePackageFromURL",value:function(t){var e=this;return f.log("getting sourcePackage from:",t),new o.default(function(r,n){e.httpRequest.get(t).then(function(t){if(t.ERROR)n(t);else{t=JSON.parse(t);var i=e.createSourcePackage(t);r(i)}}).catch(function(t){n(t)})})}},{key:"getSourceCodeFromDescriptor",value:function(t){var e=this;return new o.default(function(r,n){t.sourcePackage?r(t.sourcePackage.sourceCode):e.storageManager.getVersion(t.sourcePackageURL+"/sourceCode").then(function(i){i>=t.version?(f.log("returning cached version from storageManager"),e.storageManager.get(t.sourcePackageURL+"/sourceCode").then(function(t){r(t)}).catch(function(t){n(t)})):e.httpRequest.get(t.sourcePackageURL+"/sourceCode").then(function(i){i.ERROR?n(i):(e.storageManager.set(t.sourcePackageURL+"/sourceCode",t.version,i),r(i))}).catch(function(t){n(t)})}).catch(function(t){n(t)})})}},{key:"getTypeList",value:function(t,e){var r=this;return new o.default(function(n,o){(void 0!=e?r.httpRequest.post(t,{body:(0,i.default)(e)}):r.httpRequest.get(t)).then(function(t){t=JSON.parse(t),n(t)}).catch(function(t){o(t)})})}},{key:"deleteFromPM",value:function(t){return this.storageManager.delete(t)}},{key:"runtimeURL",set:function(t){this._runtimeURL=t},get:function(){return this._runtimeURL}}]),t}();e.default=h,t.exports=e.default},function(t,e,r){"use strict";e.__esModule=!0;var n=o(r(185)),i=o(r(188));function o(t){return t&&t.__esModule?t:{default:t}}e.default=function(){return function(t,e){if(Array.isArray(t))return t;if((0,n.default)(Object(t)))return function(t,e){var r=[],n=!0,o=!1,a=void 0;try{for(var u,s=(0,i.default)(t);!(n=(u=s.next()).done)&&(r.push(u.value),!e||r.length!==e);n=!0);}catch(t){o=!0,a=t}finally{try{!n&&s.return&&s.return()}finally{if(o)throw a}}return r}(t,e);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}()},function(t,e,r){t.exports={default:r(186),__esModule:!0}},function(t,e,r){r(53),r(51),t.exports=r(187)},function(t,e,r){var n=r(65),i=r(2)("iterator"),o=r(16);t.exports=r(0).isIterable=function(t){var e=Object(t);return void 0!==e[i]||"@@iterator"in e||o.hasOwnProperty(n(e))}},function(t,e,r){t.exports={default:r(189),__esModule:!0}},function(t,e,r){r(53),r(51),t.exports=r(190)},function(t,e,r){var n=r(9),i=r(100);t.exports=r(0).getIterator=function(t){var e=i(t);if("function"!=typeof e)throw TypeError(t+" is not iterable!");return n(e.call(t))}}])});
},{}],6:[function(require,module,exports){
// version: 0.8.0
// date: Tue Jan 09 2018 17:01:37 GMT+0000 (WET)
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


!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define("StorageManager",[],e):"object"==typeof exports?exports.StorageManager=e():(t[""]=t[""]||{},t[""].StorageManager=e())}("undefined"!=typeof self?self:this,function(){return function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:r})},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=152)}([function(t,e){var n=t.exports={version:"2.5.3"};"number"==typeof __e&&(__e=n)},function(t,e){var n=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=n)},function(t,e,n){var r=n(34)("wks"),o=n(19),i=n(1).Symbol,u="function"==typeof i;(t.exports=function(t){return r[t]||(r[t]=u&&i[t]||(u?i:o)("Symbol."+t))}).store=r},function(t,e,n){t.exports=!n(12)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},function(t,e,n){"use strict";e.__esModule=!0,e.default=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}},function(t,e,n){var r=n(1),o=n(0),i=n(14),u=n(10),f="prototype",c=function(t,e,n){var a,s,l,p=t&c.F,v=t&c.G,y=t&c.S,d=t&c.P,h=t&c.B,g=t&c.W,b=v?o:o[e]||(o[e]={}),m=b[f],w=v?r:y?r[e]:(r[e]||{})[f];v&&(n=e);for(a in n)(s=!p&&w&&void 0!==w[a])&&a in b||(l=s?w[a]:n[a],b[a]=v&&"function"!=typeof w[a]?n[a]:h&&s?i(l,r):g&&w[a]==l?function(t){var e=function(e,n,r){if(this instanceof t){switch(arguments.length){case 0:return new t;case 1:return new t(e);case 2:return new t(e,n)}return new t(e,n,r)}return t.apply(this,arguments)};return e[f]=t[f],e}(l):d&&"function"==typeof l?i(Function.call,l):l,d&&((b.virtual||(b.virtual={}))[a]=l,t&c.R&&m&&!m[a]&&u(m,a,l)))};c.F=1,c.G=2,c.S=4,c.P=8,c.B=16,c.W=32,c.U=64,c.R=128,t.exports=c},function(t,e){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},function(t,e,n){"use strict";e.__esModule=!0;var r,o=n(55),i=(r=o)&&r.__esModule?r:{default:r};e.default=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),(0,i.default)(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}()},function(t,e,n){var r=n(9),o=n(38),i=n(24),u=Object.defineProperty;e.f=n(3)?Object.defineProperty:function(t,e,n){if(r(t),e=i(e,!0),r(n),o)try{return u(t,e,n)}catch(t){}if("get"in n||"set"in n)throw TypeError("Accessors not supported!");return"value"in n&&(t[e]=n.value),t}},function(t,e,n){var r=n(6);t.exports=function(t){if(!r(t))throw TypeError(t+" is not an object!");return t}},function(t,e,n){var r=n(8),o=n(15);t.exports=n(3)?function(t,e,n){return r.f(t,e,o(1,n))}:function(t,e,n){return t[e]=n,t}},function(t,e){var n={}.hasOwnProperty;t.exports=function(t,e){return n.call(t,e)}},function(t,e){t.exports=function(t){try{return!!t()}catch(t){return!0}}},function(t,e,n){var r=n(56),o=n(29);t.exports=function(t){return r(o(t))}},function(t,e,n){var r=n(22);t.exports=function(t,e,n){if(r(t),void 0===e)return t;switch(n){case 1:return function(n){return t.call(e,n)};case 2:return function(n,r){return t.call(e,n,r)};case 3:return function(n,r,o){return t.call(e,n,r,o)}}return function(){return t.apply(e,arguments)}}},function(t,e){t.exports=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}}},function(t,e){t.exports={}},function(t,e,n){var r=n(44),o=n(35);t.exports=Object.keys||function(t){return r(t,o)}},function(t,e){var n={}.toString;t.exports=function(t){return n.call(t).slice(8,-1)}},function(t,e){var n=0,r=Math.random();t.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++n+r).toString(36))}},,,function(t,e){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},function(t,e,n){var r,o;!function(i,u){"use strict";void 0===(o="function"==typeof(r=u)?r.call(e,n,e,t):r)||(t.exports=o)}(0,function(){"use strict";var t=function(){},e="undefined",n=["trace","debug","info","warn","error"];function r(t,e){var n=t[e];if("function"==typeof n.bind)return n.bind(t);try{return Function.prototype.bind.call(n,t)}catch(e){return function(){return Function.prototype.apply.apply(n,[t,arguments])}}}function o(e,r){for(var o=0;o<n.length;o++){var i=n[o];this[i]=o<e?t:this.methodFactory(i,e,r)}this.log=this.debug}function i(n,i,u){return"debug"===(f=n)&&(f="log"),typeof console!==e&&(void 0!==console[f]?r(console,f):void 0!==console.log?r(console,"log"):t)||function(t,n,r){return function(){typeof console!==e&&(o.call(this,n,r),this[t].apply(this,arguments))}}.apply(this,arguments);var f}function u(t,r,u){var f,c=this,a="loglevel";function s(){var t;if(typeof window!==e){try{t=window.localStorage[a]}catch(t){}if(typeof t===e)try{var n=window.document.cookie,r=n.indexOf(encodeURIComponent(a)+"=");-1!==r&&(t=/^([^;]+)/.exec(n.slice(r))[1])}catch(t){}return void 0===c.levels[t]&&(t=void 0),t}}t&&(a+=":"+t),c.name=t,c.levels={TRACE:0,DEBUG:1,INFO:2,WARN:3,ERROR:4,SILENT:5},c.methodFactory=u||i,c.getLevel=function(){return f},c.setLevel=function(r,i){if("string"==typeof r&&void 0!==c.levels[r.toUpperCase()]&&(r=c.levels[r.toUpperCase()]),!("number"==typeof r&&r>=0&&r<=c.levels.SILENT))throw"log.setLevel() called with invalid level: "+r;if(f=r,!1!==i&&function(t){var r=(n[t]||"silent").toUpperCase();if(typeof window!==e){try{return void(window.localStorage[a]=r)}catch(t){}try{window.document.cookie=encodeURIComponent(a)+"="+r+";"}catch(t){}}}(r),o.call(c,r,t),typeof console===e&&r<c.levels.SILENT)return"No console available for logging"},c.setDefaultLevel=function(t){s()||c.setLevel(t,!1)},c.enableAll=function(t){c.setLevel(c.levels.TRACE,t)},c.disableAll=function(t){c.setLevel(c.levels.SILENT,t)};var l=s();null==l&&(l=null==r?"WARN":r),c.setLevel(l,!1)}var f=new u,c={};f.getLogger=function(t){if("string"!=typeof t||""===t)throw new TypeError("You must supply a name when creating a logger.");var e=c[t];return e||(e=c[t]=new u(t,f.getLevel(),f.methodFactory)),e};var a=typeof window!==e?window.log:void 0;return f.noConflict=function(){return typeof window!==e&&window.log===f&&(window.log=a),f},f.getLoggers=function(){return c},f})},function(t,e,n){var r=n(6);t.exports=function(t,e){if(!r(t))return t;var n,o;if(e&&"function"==typeof(n=t.toString)&&!r(o=n.call(t)))return o;if("function"==typeof(n=t.valueOf)&&!r(o=n.call(t)))return o;if(!e&&"function"==typeof(n=t.toString)&&!r(o=n.call(t)))return o;throw TypeError("Can't convert object to primitive value")}},function(t,e,n){var r=n(8).f,o=n(11),i=n(2)("toStringTag");t.exports=function(t,e,n){t&&!o(t=n?t:t.prototype,i)&&r(t,i,{configurable:!0,value:e})}},function(t,e,n){var r=n(6),o=n(1).document,i=r(o)&&r(o.createElement);t.exports=function(t){return i?o.createElement(t):{}}},function(t,e){t.exports=!0},,function(t,e){t.exports=function(t){if(void 0==t)throw TypeError("Can't call method on  "+t);return t}},function(t,e){var n=Math.ceil,r=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?r:n)(t)}},function(t,e){e.f={}.propertyIsEnumerable},function(t,e,n){var r=n(34)("keys"),o=n(19);t.exports=function(t){return r[t]||(r[t]=o(t))}},function(t,e,n){var r=n(29);t.exports=function(t){return Object(r(t))}},function(t,e,n){var r=n(1),o=r["__core-js_shared__"]||(r["__core-js_shared__"]={});t.exports=function(t){return o[t]||(o[t]={})}},function(t,e){t.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},,,function(t,e,n){t.exports=!n(3)&&!n(12)(function(){return 7!=Object.defineProperty(n(26)("div"),"a",{get:function(){return 7}}).a})},function(t,e,n){var r=n(9),o=n(72),i=n(35),u=n(32)("IE_PROTO"),f=function(){},c=function(){var t,e=n(26)("iframe"),r=i.length;for(e.style.display="none",n(57).appendChild(e),e.src="javascript:",(t=e.contentWindow.document).open(),t.write("<script>document.F=Object<\/script>"),t.close(),c=t.F;r--;)delete c.prototype[i[r]];return c()};t.exports=Object.create||function(t,e){var n;return null!==t?(f.prototype=r(t),n=new f,f.prototype=null,n[u]=t):n=c(),void 0===e?n:o(n,e)}},function(t,e,n){e.f=n(2)},function(t,e,n){var r=n(1),o=n(0),i=n(27),u=n(40),f=n(8).f;t.exports=function(t){var e=o.Symbol||(o.Symbol=i?{}:r.Symbol||{});"_"==t.charAt(0)||t in e||f(e,t,{value:u.f(t)})}},function(t,e){e.f=Object.getOwnPropertySymbols},function(t,e,n){t.exports={default:n(89),__esModule:!0}},function(t,e,n){var r=n(11),o=n(13),i=n(63)(!1),u=n(32)("IE_PROTO");t.exports=function(t,e){var n,f=o(t),c=0,a=[];for(n in f)n!=u&&r(f,n)&&a.push(n);for(;e.length>c;)r(f,n=e[c++])&&(~i(a,n)||a.push(n));return a}},function(t,e,n){var r=n(5),o=n(0),i=n(12);t.exports=function(t,e){var n=(o.Object||{})[t]||Object[t],u={};u[t]=e(n),r(r.S+r.F*i(function(){n(1)}),"Object",u)}},function(t,e,n){"use strict";var r=n(27),o=n(5),i=n(50),u=n(10),f=n(11),c=n(16),a=n(71),s=n(25),l=n(52),p=n(2)("iterator"),v=!([].keys&&"next"in[].keys()),y=function(){return this};t.exports=function(t,e,n,d,h,g,b){a(n,e,d);var m,w,O,S=function(t){if(!v&&t in P)return P[t];switch(t){case"keys":case"values":return function(){return new n(this,t)}}return function(){return new n(this,t)}},_=e+" Iterator",x="values"==h,j=!1,P=t.prototype,M=P[p]||P["@@iterator"]||h&&P[h],L=!v&&M||S(h),T=h?x?S("entries"):L:void 0,E="Array"==e?P.entries||M:M;if(E&&(O=l(E.call(new t)))!==Object.prototype&&O.next&&(s(O,_,!0),r||f(O,p)||u(O,p,y)),x&&M&&"values"!==M.name&&(j=!0,L=function(){return M.call(this)}),r&&!b||!v&&!j&&P[p]||u(P,p,L),c[e]=L,c[_]=y,h)if(m={values:x?L:S("values"),keys:g?L:S("keys"),entries:T},b)for(w in m)w in P||i(P,w,m[w]);else o(o.P+o.F*(v||j),e,m);return m}},function(t,e,n){var r=n(31),o=n(15),i=n(13),u=n(24),f=n(11),c=n(38),a=Object.getOwnPropertyDescriptor;e.f=n(3)?a:function(t,e){if(t=i(t),e=u(e,!0),c)try{return a(t,e)}catch(t){}if(f(t,e))return o(!r.f.call(t,e),t[e])}},function(t,e,n){var r=n(30),o=Math.min;t.exports=function(t){return t>0?o(r(t),9007199254740991):0}},function(t,e,n){"use strict";e.__esModule=!0;var r=u(n(78)),o=u(n(80)),i="function"==typeof o.default&&"symbol"==typeof r.default?function(t){return typeof t}:function(t){return t&&"function"==typeof o.default&&t.constructor===o.default&&t!==o.default.prototype?"symbol":typeof t};function u(t){return t&&t.__esModule?t:{default:t}}e.default="function"==typeof o.default&&"symbol"===i(r.default)?function(t){return void 0===t?"undefined":i(t)}:function(t){return t&&"function"==typeof o.default&&t.constructor===o.default&&t!==o.default.prototype?"symbol":void 0===t?"undefined":i(t)}},function(t,e,n){t.exports=n(10)},function(t,e,n){"use strict";var r=n(70)(!0);n(46)(String,"String",function(t){this._t=String(t),this._i=0},function(){var t,e=this._t,n=this._i;return n>=e.length?{value:void 0,done:!0}:(t=r(e,n),this._i+=t.length,{value:t,done:!1})})},function(t,e,n){var r=n(11),o=n(33),i=n(32)("IE_PROTO"),u=Object.prototype;t.exports=Object.getPrototypeOf||function(t){return t=o(t),r(t,i)?t[i]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?u:null}},function(t,e,n){n(73);for(var r=n(1),o=n(10),i=n(16),u=n(2)("toStringTag"),f="CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,TextTrackList,TouchList".split(","),c=0;c<f.length;c++){var a=f[c],s=r[a],l=s&&s.prototype;l&&!l[u]&&o(l,u,a),i[a]=i.Array}},,function(t,e,n){t.exports={default:n(60),__esModule:!0}},function(t,e,n){var r=n(18);t.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==r(t)?t.split(""):Object(t)}},function(t,e,n){var r=n(1).document;t.exports=r&&r.documentElement},function(t,e,n){var r=n(44),o=n(35).concat("length","prototype");e.f=Object.getOwnPropertyNames||function(t){return r(t,o)}},,function(t,e,n){n(61);var r=n(0).Object;t.exports=function(t,e,n){return r.defineProperty(t,e,n)}},function(t,e,n){var r=n(5);r(r.S+r.F*!n(3),"Object",{defineProperty:n(8).f})},function(t,e){},function(t,e,n){var r=n(13),o=n(48),i=n(64);t.exports=function(t){return function(e,n,u){var f,c=r(e),a=o(c.length),s=i(u,a);if(t&&n!=n){for(;a>s;)if((f=c[s++])!=f)return!0}else for(;a>s;s++)if((t||s in c)&&c[s]===n)return t||s||0;return!t&&-1}}},function(t,e,n){var r=n(30),o=Math.max,i=Math.min;t.exports=function(t,e){return(t=r(t))<0?o(t+e,0):i(t,e)}},,,,,,function(t,e,n){var r=n(30),o=n(29);t.exports=function(t){return function(e,n){var i,u,f=String(o(e)),c=r(n),a=f.length;return c<0||c>=a?t?"":void 0:(i=f.charCodeAt(c))<55296||i>56319||c+1===a||(u=f.charCodeAt(c+1))<56320||u>57343?t?f.charAt(c):i:t?f.slice(c,c+2):u-56320+(i-55296<<10)+65536}}},function(t,e,n){"use strict";var r=n(39),o=n(15),i=n(25),u={};n(10)(u,n(2)("iterator"),function(){return this}),t.exports=function(t,e,n){t.prototype=r(u,{next:o(1,n)}),i(t,e+" Iterator")}},function(t,e,n){var r=n(8),o=n(9),i=n(17);t.exports=n(3)?Object.defineProperties:function(t,e){o(t);for(var n,u=i(e),f=u.length,c=0;f>c;)r.f(t,n=u[c++],e[n]);return t}},function(t,e,n){"use strict";var r=n(74),o=n(75),i=n(16),u=n(13);t.exports=n(46)(Array,"Array",function(t,e){this._t=u(t),this._i=0,this._k=e},function(){var t=this._t,e=this._k,n=this._i++;return!t||n>=t.length?(this._t=void 0,o(1)):o(0,"keys"==e?n:"values"==e?t[n]:[n,t[n]])},"values"),i.Arguments=i.Array,r("keys"),r("values"),r("entries")},function(t,e){t.exports=function(){}},function(t,e){t.exports=function(t,e){return{value:e,done:!!t}}},,function(t,e,n){var r=n(19)("meta"),o=n(6),i=n(11),u=n(8).f,f=0,c=Object.isExtensible||function(){return!0},a=!n(12)(function(){return c(Object.preventExtensions({}))}),s=function(t){u(t,r,{value:{i:"O"+ ++f,w:{}}})},l=t.exports={KEY:r,NEED:!1,fastKey:function(t,e){if(!o(t))return"symbol"==typeof t?t:("string"==typeof t?"S":"P")+t;if(!i(t,r)){if(!c(t))return"F";if(!e)return"E";s(t)}return t[r].i},getWeak:function(t,e){if(!i(t,r)){if(!c(t))return!0;if(!e)return!1;s(t)}return t[r].w},onFreeze:function(t){return a&&l.NEED&&c(t)&&!i(t,r)&&s(t),t}}},function(t,e,n){t.exports={default:n(79),__esModule:!0}},function(t,e,n){n(51),n(53),t.exports=n(40).f("iterator")},function(t,e,n){t.exports={default:n(81),__esModule:!0}},function(t,e,n){n(82),n(62),n(86),n(87),t.exports=n(0).Symbol},function(t,e,n){"use strict";var r=n(1),o=n(11),i=n(3),u=n(5),f=n(50),c=n(77).KEY,a=n(12),s=n(34),l=n(25),p=n(19),v=n(2),y=n(40),d=n(41),h=n(83),g=n(84),b=n(9),m=n(6),w=n(13),O=n(24),S=n(15),_=n(39),x=n(85),j=n(47),P=n(8),M=n(17),L=j.f,T=P.f,E=x.f,k=r.Symbol,A=r.JSON,F=A&&A.stringify,N="prototype",C=v("_hidden"),I=v("toPrimitive"),R={}.propertyIsEnumerable,D=s("symbol-registry"),G=s("symbols"),K=s("op-symbols"),V=Object[N],W="function"==typeof k,U=r.QObject,q=!U||!U[N]||!U[N].findChild,B=i&&a(function(){return 7!=_(T({},"a",{get:function(){return T(this,"a",{value:7}).a}})).a})?function(t,e,n){var r=L(V,e);r&&delete V[e],T(t,e,n),r&&t!==V&&T(V,e,r)}:T,H=function(t){var e=G[t]=_(k[N]);return e._k=t,e},J=W&&"symbol"==typeof k.iterator?function(t){return"symbol"==typeof t}:function(t){return t instanceof k},Y=function(t,e,n){return t===V&&Y(K,e,n),b(t),e=O(e,!0),b(n),o(G,e)?(n.enumerable?(o(t,C)&&t[C][e]&&(t[C][e]=!1),n=_(n,{enumerable:S(0,!1)})):(o(t,C)||T(t,C,S(1,{})),t[C][e]=!0),B(t,e,n)):T(t,e,n)},z=function(t,e){b(t);for(var n,r=h(e=w(e)),o=0,i=r.length;i>o;)Y(t,n=r[o++],e[n]);return t},Q=function(t){var e=R.call(this,t=O(t,!0));return!(this===V&&o(G,t)&&!o(K,t))&&(!(e||!o(this,t)||!o(G,t)||o(this,C)&&this[C][t])||e)},X=function(t,e){if(t=w(t),e=O(e,!0),t!==V||!o(G,e)||o(K,e)){var n=L(t,e);return!n||!o(G,e)||o(t,C)&&t[C][e]||(n.enumerable=!0),n}},Z=function(t){for(var e,n=E(w(t)),r=[],i=0;n.length>i;)o(G,e=n[i++])||e==C||e==c||r.push(e);return r},$=function(t){for(var e,n=t===V,r=E(n?K:w(t)),i=[],u=0;r.length>u;)!o(G,e=r[u++])||n&&!o(V,e)||i.push(G[e]);return i};W||(f((k=function(){if(this instanceof k)throw TypeError("Symbol is not a constructor!");var t=p(arguments.length>0?arguments[0]:void 0),e=function(n){this===V&&e.call(K,n),o(this,C)&&o(this[C],t)&&(this[C][t]=!1),B(this,t,S(1,n))};return i&&q&&B(V,t,{configurable:!0,set:e}),H(t)})[N],"toString",function(){return this._k}),j.f=X,P.f=Y,n(58).f=x.f=Z,n(31).f=Q,n(42).f=$,i&&!n(27)&&f(V,"propertyIsEnumerable",Q,!0),y.f=function(t){return H(v(t))}),u(u.G+u.W+u.F*!W,{Symbol:k});for(var tt="hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),et=0;tt.length>et;)v(tt[et++]);for(var nt=M(v.store),rt=0;nt.length>rt;)d(nt[rt++]);u(u.S+u.F*!W,"Symbol",{for:function(t){return o(D,t+="")?D[t]:D[t]=k(t)},keyFor:function(t){if(!J(t))throw TypeError(t+" is not a symbol!");for(var e in D)if(D[e]===t)return e},useSetter:function(){q=!0},useSimple:function(){q=!1}}),u(u.S+u.F*!W,"Object",{create:function(t,e){return void 0===e?_(t):z(_(t),e)},defineProperty:Y,defineProperties:z,getOwnPropertyDescriptor:X,getOwnPropertyNames:Z,getOwnPropertySymbols:$}),A&&u(u.S+u.F*(!W||a(function(){var t=k();return"[null]"!=F([t])||"{}"!=F({a:t})||"{}"!=F(Object(t))})),"JSON",{stringify:function(t){for(var e,n,r=[t],o=1;arguments.length>o;)r.push(arguments[o++]);if(n=e=r[1],(m(e)||void 0!==t)&&!J(t))return g(e)||(e=function(t,e){if("function"==typeof n&&(e=n.call(this,t,e)),!J(e))return e}),r[1]=e,F.apply(A,r)}}),k[N][I]||n(10)(k[N],I,k[N].valueOf),l(k,"Symbol"),l(Math,"Math",!0),l(r.JSON,"JSON",!0)},function(t,e,n){var r=n(17),o=n(42),i=n(31);t.exports=function(t){var e=r(t),n=o.f;if(n)for(var u,f=n(t),c=i.f,a=0;f.length>a;)c.call(t,u=f[a++])&&e.push(u);return e}},function(t,e,n){var r=n(18);t.exports=Array.isArray||function(t){return"Array"==r(t)}},function(t,e,n){var r=n(13),o=n(58).f,i={}.toString,u="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[];t.exports.f=function(t){return u&&"[object Window]"==i.call(t)?function(t){try{return o(t)}catch(t){return u.slice()}}(t):o(r(t))}},function(t,e,n){n(41)("asyncIterator")},function(t,e,n){n(41)("observable")},function(t,e,n){t.exports={default:n(118),__esModule:!0}},function(t,e,n){n(90),t.exports=n(0).Object.keys},function(t,e,n){var r=n(33),o=n(17);n(45)("keys",function(){return function(t){return o(r(t))}})},,,,,,,,,,,,,,,,,,,,,,,,,,,,function(t,e,n){n(119),t.exports=n(0).Object.assign},function(t,e,n){var r=n(5);r(r.S+r.F,"Object",{assign:n(120)})},function(t,e,n){"use strict";var r=n(17),o=n(42),i=n(31),u=n(33),f=n(56),c=Object.assign;t.exports=!c||n(12)(function(){var t={},e={},n=Symbol(),r="abcdefghijklmnopqrst";return t[n]=7,r.split("").forEach(function(t){e[t]=t}),7!=c({},t)[n]||Object.keys(c({},e)).join("")!=r})?function(t,e){for(var n=u(t),c=arguments.length,a=1,s=o.f,l=i.f;c>a;)for(var p,v=f(arguments[a++]),y=s?r(v).concat(s(v)):r(v),d=y.length,h=0;d>h;)l.call(v,p=y[h++])&&(n[p]=v[p]);return n}:c},,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r,o=function(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);return e.default=t,e}(n(23)),i=n(153),u=(r=i)&&r.__esModule?r:{default:r};o.getLogger("StorageManager").setLevel(0),e.default=u.default,t.exports=e.default},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=a(n(154)),o=a(n(43)),i=a(n(49)),u=a(n(88)),f=a(n(4)),c=a(n(7));function a(t){return t&&t.__esModule?t:{default:t}}var s=function(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);return e.default=t,e}(n(23)).getLogger("StorageManager"),l=function(){function t(e,n,r){var o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:1;if((0,f.default)(this,t),!e)throw Error("The Storage Manager needs the database instance");if(!n)throw Error("The Storage Manager needs the storage name");var i={};r?i=r:i[n]="key,version,value",e.version(o).stores(i),e.open().then(function(t){s.info("Found database name "+t.name+" with version no: "+t.verno)}).catch(s.error),this.db=e,this.storageName=n}return(0,c.default)(t,[{key:"_checkKey",value:function(t){return"string"!=typeof t?t.toString():t}},{key:"_getTable",value:function(t){var e=void 0;try{e=this.db.table(this.storageName).name}catch(n){e=this.db.table(t).name}return e}},{key:"_getPrimaryKey",value:function(t){return this.db.table(t).schema.primKey.name}},{key:"_isDefaultSchema",value:function(t){var e=this._getTable(t),n=this.db[e].schema.instanceTemplate;return n.hasOwnProperty("value")&&n.hasOwnProperty("version")&&n.hasOwnProperty("key")}},{key:"set",value:function(t,e,n,r){s.info("[StorageManager] - set ",t,n),r=r||t;var o=this._getTable(r),i=this._getPrimaryKey(o),f=n;if(this._isDefaultSchema(r))f={key:t,version:e,value:n};else{var c={};c[i]=t,(0,u.default)(f,c)}return this.db[o].put(f)}},{key:"get",value:function(t,e,n){var u=this;console.info("[StorageManager] - get ",t,e),n=n||t;var f=this._getTable(n),c=this._getPrimaryKey(f);return this.db.transaction("rw!",this.db[f],function(){if(!t&&!e)return u.db[f].toArray().then(function(t){return t.reduce(function(t,e){return t[e[c]]=e,t},{})});if(!e)return u.db[f].where(c).equals(t).first().then(function(t){return t&&t.hasOwnProperty("value")?t.value:t});var n=void 0===e?"undefined":(0,i.default)(e);switch(Array.isArray(e)&&(n="array"),n){case"string":return u.db[f].where(t).equals(e).first().then(function(t){return t&&t.hasOwnProperty("value")?t.value:t});case"object":var a="value."+(0,o.default)(e).toString(),s=(0,r.default)(e);return console.log(a,s),u.db[f].where(a).anyOf(s).first().then(function(t){return t&&t.hasOwnProperty("value")?t.value:t});case"array":return console.log("ARRAY:",e),u.db[f].where(e).then(function(t){return t&&t.hasOwnProperty("value")?t.value:t})}})}},{key:"getVersion",value:function(t,e,n){var r=this;s.info("[StorageManager] - getVersion for key ",t),n=n||t;var o=this._getTable(n),i=this._getPrimaryKey(o),u=e;return e||(u=t),this.db.transaction("rw!",this.db[o],function(){return r.db[o].where(i).equals(u).first().then(function(t){return t&&t.hasOwnProperty("version")?t.version:t}).catch(function(e){s.info("error getting the version for ",t," with error: ",e)})})}},{key:"delete",value:function(t,e,n){n=n||t;var r=this._getTable(n),o=this._getPrimaryKey(r),i=e;return e||(i=t),this.db[r].where(o).equals(i).delete()}}]),t}();e.default=l,t.exports=e.default},function(t,e,n){t.exports={default:n(155),__esModule:!0}},function(t,e,n){n(156),t.exports=n(0).Object.values},function(t,e,n){var r=n(5),o=n(157)(!1);r(r.S,"Object",{values:function(t){return o(t)}})},function(t,e,n){var r=n(17),o=n(13),i=n(31).f;t.exports=function(t){return function(e){for(var n,u=o(e),f=r(u),c=f.length,a=0,s=[];c>a;)i.call(u,n=f[a++])&&s.push(t?[n,u[n]]:u[n]);return s}}}])});
},{}],7:[function(require,module,exports){
/*!
 * URI.js - Mutating URLs
 * IPv6 Support
 *
 * Version: 1.19.0
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

},{}],8:[function(require,module,exports){
/*!
 * URI.js - Mutating URLs
 * Second Level Domain (SLD) Support
 *
 * Version: 1.19.0
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

},{}],9:[function(require,module,exports){
/*!
 * URI.js - Mutating URLs
 *
 * Version: 1.19.0
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

  URI.version = '1.19.0';

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
        if (hasOwn.call(this._parts, key)) {
          this._parts[key] = src[key];
        }
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

},{"./IPv6":7,"./SecondLevelDomains":8,"./punycode":10}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _PersistenceManager = require('service-framework/dist/PersistenceManager');

var _PersistenceManager2 = _interopRequireDefault(_PersistenceManager);

var _Sandboxes = require('./Sandboxes');

var _SandboxApp = require('./SandboxApp');

var _SandboxApp2 = _interopRequireDefault(_SandboxApp);

var _Request = require('./Request');

var _Request2 = _interopRequireDefault(_Request);

var _RuntimeCapabilities = require('./RuntimeCapabilities');

var _RuntimeCapabilities2 = _interopRequireDefault(_RuntimeCapabilities);

var _StorageManager = require('service-framework/dist/StorageManager');

var _StorageManager2 = _interopRequireDefault(_StorageManager);

var _dexie = require('dexie');

var _dexie2 = _interopRequireDefault(_dexie);

var _RuntimeCatalogue = require('service-framework/dist/RuntimeCatalogue');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
  createRuntimeCatalogue: function createRuntimeCatalogue() {
    if (!this.catalogue) {
      this.catalogue = new _RuntimeCatalogue.RuntimeCatalogue(this);
    }

    return this.catalogue;
  },
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
  persistenceManager: function persistenceManager() {
    var localStorage = window.localStorage;
    return new _PersistenceManager2.default(localStorage);
  },
  storageManager: function storageManager() {
    var db = new _dexie2.default('cache');
    var storeName = 'objects';

    return new _StorageManager2.default(db, storeName);
  },
  runtimeCapabilities: function runtimeCapabilities(storageManager) {
    return new _RuntimeCapabilities2.default(storageManager);
  }
};

},{"./Request":11,"./RuntimeCapabilities":12,"./SandboxApp":14,"./Sandboxes":15,"dexie":1,"service-framework/dist/PersistenceManager":4,"service-framework/dist/RuntimeCatalogue":5,"service-framework/dist/StorageManager":6}],14:[function(require,module,exports){
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

},{"runtime-core/dist/minibus":2,"runtime-core/dist/sandbox":3}],15:[function(require,module,exports){
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
      return _RuntimeFactory2.default.runtimeCapabilities(_RuntimeFactory2.default.storageManager()).getRuntimeCapabilities().then(function (capabilities) {
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
      return _RuntimeFactory2.default.runtimeCapabilities(_RuntimeFactory2.default.storageManager()).getRuntimeCapabilities();
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

},{"./RuntimeFactory":13,"runtime-core/dist/minibus":2,"runtime-core/dist/sandbox":3}],16:[function(require,module,exports){
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

    //if (!identityModule) throw Error('Identity Module not set!');
    if (!messageBus) throw Error('Message Bus not set!');
    var _this = this;
    _this._guiURL = guiURL;
    _this._idmURL = idmURL;
    _this._messageBus = messageBus;

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
    });

    drawerEl.addEventListener('MDCTemporaryDrawer:close', function () {
      console.log('Received MDCTemporaryDrawer:close');
      _this2._isDrawerOpen = false;

      parent.postMessage({ body: { method: 'hideAdminPage' }, to: 'runtime:gui-manager' }, '*');
    });
  }

  _createClass(IdentitiesGUI, [{
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

        _this3._getIdentities(callback);
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
    value: function _getIdentities(callback) {
      var _this4 = this;

      return this.callIdentityModuleFunc('getIdentitiesToChoose', {}).then(function (resultObject) {
        if (callback) {
          return Promise.all([_this4.showIdps(resultObject.idps, callback), _this4.showDefaultIdentity(resultObject.defaultIdentity), _this4.showIdentities(resultObject, callback)]);
        } else {
          return Promise.all([_this4.showIdps(resultObject.idps), _this4.showDefaultIdentity(resultObject.defaultIdentity), _this4.showIdentities(resultObject)]);
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
          var result = res.body.value;
          resolve(result);
        });
      });
    }
  }, {
    key: 'openPopup',
    value: function openPopup(urlreceived) {
      var _this6 = this;

      return new Promise(function (resolve, reject) {

        var win = void 0;
        if (!urlreceived) {
          win = window.open('', 'openIDrequest', 'location=1,status=1');
          _this6.win = win;
          resolve();
        } else {
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

              if ((win.document.URL.indexOf('access_token') !== -1 || win.document.URL.indexOf('code') !== -1) && win.document.URL.indexOf(location.origin) !== -1) {
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

        if (identities.length === 1) {

          if (callback) {
            callback({ type: 'identity', value: current });
          }

          return resolve({ type: 'identity', value: current });
        }

        if (identities.length > 1) {
          _this8._drawer.open = true;
        }

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
    key: 'loginWithIDP',
    value: function loginWithIDP(idp) {
      var _this9 = this;

      var _publicKey = void 0;

      return this.openPopup().then(function (result) {
        return _this9.callIdentityModuleFunc('getMyPublicKey', {});
      }).then(function (publicKey) {
        _publicKey = publicKey;
        var data = { contents: publicKey, origin: 'origin', usernameHint: undefined, idpDomain: idp };
        return _this9.callIdentityModuleFunc('sendGenerateMessage', data);
      }).then(function (value) {
        console.log('[IdentitiesGUI.obtainNewIdentity] receivedURL from idp Proxy: ' + value.loginUrl.substring(0, 20) + '...');

        var url = value.loginUrl;
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

        _this9.resultURL = finalURL || url;

        console.log('[IdentitiesGUI.openPopup]', _this9.resultURL);
        return _this9.openPopup(_this9.resultURL);
      }).then(function (identity) {

        console.log('[IdentitiesGUI.openPopup.result]', identity);

        var data = { contents: _publicKey, origin: 'origin', usernameHint: identity, idpDomain: idp };
        return _this9.callIdentityModuleFunc('sendGenerateMessage', data);
      }).then(function (result) {

        console.log('[IdentitiesGUI.sendGenerateMessage.result]', result);
        return _this9.callIdentityModuleFunc('addAssertion', result);
      }).then(function (value) {

        _this9._drawer.open = false;
        var userURL = { type: 'identity', value: value.userProfile.userURL };

        console.log('[IdentitiesGUI.loginWithIDP final]', value);
        return userURL;
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

},{}],17:[function(require,module,exports){
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

},{"./PoliciesManager":18}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
'use strict';

var _urijs = require('urijs');

var _urijs2 = _interopRequireDefault(_urijs);

var _IdentitiesGUI = require('./admin/IdentitiesGUI');

var _IdentitiesGUI2 = _interopRequireDefault(_IdentitiesGUI);

var _PoliciesGUI = require('./admin/PoliciesGUI');

var _PoliciesGUI2 = _interopRequireDefault(_PoliciesGUI);

var _RuntimeFactory = require('./RuntimeFactory');

var _RuntimeFactory2 = _interopRequireDefault(_RuntimeFactory);

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
try {
  window.cordova = parent.cordova !== undefined;
  if (window.cordova) {
    window.open = function (url) {
      return parent.cordova.InAppBrowser.open(url, '_blank', 'location=no,toolbar=no');
    };
  }
} catch (err) {
  console.log('cordova not supported');
}

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
var catalogue = _RuntimeFactory2.default.createRuntimeCatalogue(development);
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
          var hyperty = searchHyperty(runtime, descriptor);

          if (hyperty) {
            returnHyperty(event.source, { runtimeHypertyURL: hyperty.hypertyURL });
          } else {
            runtime.loadHyperty(descriptor, reuseAddress).then(returnHyperty.bind(null, event.source));
          }
        } else if (event.data.to === 'core:loadStub') {
          runtime.loadStub(event.data.body.domain).then(function (result) {
            console.log('Stub Loaded: ', result);
          }).catch(function (error) {
            console.error('Stub error:', error);
          });
        } else if (event.data.to === 'core:close') {
          runtime.close().then(event.source.postMessage({ to: 'runtime:runtimeClosed', body: true }, '*')).catch(event.source.postMessage({ to: 'runtime:runtimeClosed', body: false }, '*'));
        }
      }, false);

      window.addEventListener('beforeunload', function (e) {
        runtime.close();
      });

      parent.postMessage({ to: 'runtime:installed', body: {} }, '*');
    });
  });
});

},{"./RuntimeFactory":13,"./admin/IdentitiesGUI":16,"./admin/PoliciesGUI":17,"urijs":9}]},{},[19])(19)
});

//# sourceMappingURL=core.js.map
