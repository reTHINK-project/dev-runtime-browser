"format global";
(function(global) {

  var defined = {};

  // indexOf polyfill for IE8
  var indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++)
      if (this[i] === item)
        return i;
    return -1;
  }

  var getOwnPropertyDescriptor = true;
  try {
    Object.getOwnPropertyDescriptor({ a: 0 }, 'a');
  }
  catch(e) {
    getOwnPropertyDescriptor = false;
  }

  var defineProperty;
  (function () {
    try {
      if (!!Object.defineProperty({}, 'a', {}))
        defineProperty = Object.defineProperty;
    }
    catch (e) {
      defineProperty = function(obj, prop, opt) {
        try {
          obj[prop] = opt.value || opt.get.call(obj);
        }
        catch(e) {}
      }
    }
  })();

  function register(name, deps, declare) {
    if (arguments.length === 4)
      return registerDynamic.apply(this, arguments);
    doRegister(name, {
      declarative: true,
      deps: deps,
      declare: declare
    });
  }

  function registerDynamic(name, deps, executingRequire, execute) {
    doRegister(name, {
      declarative: false,
      deps: deps,
      executingRequire: executingRequire,
      execute: execute
    });
  }

  function doRegister(name, entry) {
    entry.name = name;

    // we never overwrite an existing define
    if (!(name in defined))
      defined[name] = entry;

    // we have to normalize dependencies
    // (assume dependencies are normalized for now)
    // entry.normalizedDeps = entry.deps.map(normalize);
    entry.normalizedDeps = entry.deps;
  }


  function buildGroups(entry, groups) {
    groups[entry.groupIndex] = groups[entry.groupIndex] || [];

    if (indexOf.call(groups[entry.groupIndex], entry) != -1)
      return;

    groups[entry.groupIndex].push(entry);

    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = defined[depName];

      // not in the registry means already linked / ES6
      if (!depEntry || depEntry.evaluated)
        continue;

      // now we know the entry is in our unlinked linkage group
      var depGroupIndex = entry.groupIndex + (depEntry.declarative != entry.declarative);

      // the group index of an entry is always the maximum
      if (depEntry.groupIndex === undefined || depEntry.groupIndex < depGroupIndex) {

        // if already in a group, remove from the old group
        if (depEntry.groupIndex !== undefined) {
          groups[depEntry.groupIndex].splice(indexOf.call(groups[depEntry.groupIndex], depEntry), 1);

          // if the old group is empty, then we have a mixed depndency cycle
          if (groups[depEntry.groupIndex].length == 0)
            throw new TypeError("Mixed dependency cycle detected");
        }

        depEntry.groupIndex = depGroupIndex;
      }

      buildGroups(depEntry, groups);
    }
  }

  function link(name) {
    var startEntry = defined[name];

    startEntry.groupIndex = 0;

    var groups = [];

    buildGroups(startEntry, groups);

    var curGroupDeclarative = !!startEntry.declarative == groups.length % 2;
    for (var i = groups.length - 1; i >= 0; i--) {
      var group = groups[i];
      for (var j = 0; j < group.length; j++) {
        var entry = group[j];

        // link each group
        if (curGroupDeclarative)
          linkDeclarativeModule(entry);
        else
          linkDynamicModule(entry);
      }
      curGroupDeclarative = !curGroupDeclarative; 
    }
  }

  // module binding records
  var moduleRecords = {};
  function getOrCreateModuleRecord(name) {
    return moduleRecords[name] || (moduleRecords[name] = {
      name: name,
      dependencies: [],
      exports: {}, // start from an empty module and extend
      importers: []
    })
  }

  function linkDeclarativeModule(entry) {
    // only link if already not already started linking (stops at circular)
    if (entry.module)
      return;

    var module = entry.module = getOrCreateModuleRecord(entry.name);
    var exports = entry.module.exports;

    var declaration = entry.declare.call(global, function(name, value) {
      module.locked = true;

      if (typeof name == 'object') {
        for (var p in name)
          exports[p] = name[p];
      }
      else {
        exports[name] = value;
      }

      for (var i = 0, l = module.importers.length; i < l; i++) {
        var importerModule = module.importers[i];
        if (!importerModule.locked) {
          for (var j = 0; j < importerModule.dependencies.length; ++j) {
            if (importerModule.dependencies[j] === module) {
              importerModule.setters[j](exports);
            }
          }
        }
      }

      module.locked = false;
      return value;
    });

    module.setters = declaration.setters;
    module.execute = declaration.execute;

    // now link all the module dependencies
    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = defined[depName];
      var depModule = moduleRecords[depName];

      // work out how to set depExports based on scenarios...
      var depExports;

      if (depModule) {
        depExports = depModule.exports;
      }
      else if (depEntry && !depEntry.declarative) {
        depExports = depEntry.esModule;
      }
      // in the module registry
      else if (!depEntry) {
        depExports = load(depName);
      }
      // we have an entry -> link
      else {
        linkDeclarativeModule(depEntry);
        depModule = depEntry.module;
        depExports = depModule.exports;
      }

      // only declarative modules have dynamic bindings
      if (depModule && depModule.importers) {
        depModule.importers.push(module);
        module.dependencies.push(depModule);
      }
      else
        module.dependencies.push(null);

      // run the setter for this dependency
      if (module.setters[i])
        module.setters[i](depExports);
    }
  }

  // An analog to loader.get covering execution of all three layers (real declarative, simulated declarative, simulated dynamic)
  function getModule(name) {
    var exports;
    var entry = defined[name];

    if (!entry) {
      exports = load(name);
      if (!exports)
        throw new Error("Unable to load dependency " + name + ".");
    }

    else {
      if (entry.declarative)
        ensureEvaluated(name, []);

      else if (!entry.evaluated)
        linkDynamicModule(entry);

      exports = entry.module.exports;
    }

    if ((!entry || entry.declarative) && exports && exports.__useDefault)
      return exports['default'];

    return exports;
  }

  function linkDynamicModule(entry) {
    if (entry.module)
      return;

    var exports = {};

    var module = entry.module = { exports: exports, id: entry.name };

    // AMD requires execute the tree first
    if (!entry.executingRequire) {
      for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
        var depName = entry.normalizedDeps[i];
        var depEntry = defined[depName];
        if (depEntry)
          linkDynamicModule(depEntry);
      }
    }

    // now execute
    entry.evaluated = true;
    var output = entry.execute.call(global, function(name) {
      for (var i = 0, l = entry.deps.length; i < l; i++) {
        if (entry.deps[i] != name)
          continue;
        return getModule(entry.normalizedDeps[i]);
      }
      throw new TypeError('Module ' + name + ' not declared as a dependency.');
    }, exports, module);

    if (output)
      module.exports = output;

    // create the esModule object, which allows ES6 named imports of dynamics
    exports = module.exports;
 
    if (exports && exports.__esModule) {
      entry.esModule = exports;
    }
    else {
      entry.esModule = {};
      
      // don't trigger getters/setters in environments that support them
      if ((typeof exports == 'object' || typeof exports == 'function') && exports !== global) {
        if (getOwnPropertyDescriptor) {
          var d;
          for (var p in exports)
            if (d = Object.getOwnPropertyDescriptor(exports, p))
              defineProperty(entry.esModule, p, d);
        }
        else {
          var hasOwnProperty = exports && exports.hasOwnProperty;
          for (var p in exports) {
            if (!hasOwnProperty || exports.hasOwnProperty(p))
              entry.esModule[p] = exports[p];
          }
         }
       }
      entry.esModule['default'] = exports;
      defineProperty(entry.esModule, '__useDefault', {
        value: true
      });
    }
  }

  /*
   * Given a module, and the list of modules for this current branch,
   *  ensure that each of the dependencies of this module is evaluated
   *  (unless one is a circular dependency already in the list of seen
   *  modules, in which case we execute it)
   *
   * Then we evaluate the module itself depth-first left to right 
   * execution to match ES6 modules
   */
  function ensureEvaluated(moduleName, seen) {
    var entry = defined[moduleName];

    // if already seen, that means it's an already-evaluated non circular dependency
    if (!entry || entry.evaluated || !entry.declarative)
      return;

    // this only applies to declarative modules which late-execute

    seen.push(moduleName);

    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      if (indexOf.call(seen, depName) == -1) {
        if (!defined[depName])
          load(depName);
        else
          ensureEvaluated(depName, seen);
      }
    }

    if (entry.evaluated)
      return;

    entry.evaluated = true;
    entry.module.execute.call(global);
  }

  // magical execution function
  var modules = {};
  function load(name) {
    if (modules[name])
      return modules[name];

    // node core modules
    if (name.substr(0, 6) == '@node/')
      return require(name.substr(6));

    var entry = defined[name];

    // first we check if this module has already been defined in the registry
    if (!entry)
      throw "Module " + name + " not present.";

    // recursively ensure that the module and all its 
    // dependencies are linked (with dependency group handling)
    link(name);

    // now handle dependency execution in correct order
    ensureEvaluated(name, []);

    // remove from the registry
    defined[name] = undefined;

    // exported modules get __esModule defined for interop
    if (entry.declarative)
      defineProperty(entry.module.exports, '__esModule', { value: true });

    // return the defined module object
    return modules[name] = entry.declarative ? entry.module.exports : entry.esModule;
  };

  return function(mains, depNames, declare) {
    return function(formatDetect) {
      formatDetect(function(deps) {
        var System = {
          _nodeRequire: typeof require != 'undefined' && require.resolve && typeof process != 'undefined' && require,
          register: register,
          registerDynamic: registerDynamic,
          get: load, 
          set: function(name, module) {
            modules[name] = module; 
          },
          newModule: function(module) {
            return module;
          }
        };
        System.set('@empty', {});

        // register external dependencies
        for (var i = 0; i < depNames.length; i++) (function(depName, dep) {
          if (dep && dep.__esModule)
            System.register(depName, [], function(_export) {
              return {
                setters: [],
                execute: function() {
                  for (var p in dep)
                    if (p != '__esModule' && !(typeof p == 'object' && p + '' == 'Module'))
                      _export(p, dep[p]);
                }
              };
            });
          else
            System.registerDynamic(depName, [], false, function() {
              return dep;
            });
        })(depNames[i], arguments[i]);

        // register modules in this bundle
        declare(System);

        // load mains
        var firstLoad = load(mains[0]);
        if (mains.length > 1)
          for (var i = 1; i < mains.length; i++)
            load(mains[i]);

        if (firstLoad.__useDefault)
          return firstLoad['default'];
        else
          return firstLoad;
      });
    };
  };

})(typeof self != 'undefined' ? self : global)
/* (['mainModule'], ['external-dep'], function($__System) {
  System.register(...);
})
(function(factory) {
  if (typeof define && define.amd)
    define(['external-dep'], factory);
  // etc UMD / module pattern
})*/

(['1'], [], function($__System) {

(function(__global) {
  var loader = $__System;
  var indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++)
      if (this[i] === item)
        return i;
    return -1;
  }

  var commentRegEx = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;
  var cjsRequirePre = "(?:^|[^$_a-zA-Z\\xA0-\\uFFFF.])";
  var cjsRequirePost = "\\s*\\(\\s*(\"([^\"]+)\"|'([^']+)')\\s*\\)";
  var fnBracketRegEx = /\(([^\)]*)\)/;
  var wsRegEx = /^\s+|\s+$/g;
  
  var requireRegExs = {};

  function getCJSDeps(source, requireIndex) {

    // remove comments
    source = source.replace(commentRegEx, '');

    // determine the require alias
    var params = source.match(fnBracketRegEx);
    var requireAlias = (params[1].split(',')[requireIndex] || 'require').replace(wsRegEx, '');

    // find or generate the regex for this requireAlias
    var requireRegEx = requireRegExs[requireAlias] || (requireRegExs[requireAlias] = new RegExp(cjsRequirePre + requireAlias + cjsRequirePost, 'g'));

    requireRegEx.lastIndex = 0;

    var deps = [];

    var match;
    while (match = requireRegEx.exec(source))
      deps.push(match[2] || match[3]);

    return deps;
  }

  /*
    AMD-compatible require
    To copy RequireJS, set window.require = window.requirejs = loader.amdRequire
  */
  function require(names, callback, errback, referer) {
    // in amd, first arg can be a config object... we just ignore
    if (typeof names == 'object' && !(names instanceof Array))
      return require.apply(null, Array.prototype.splice.call(arguments, 1, arguments.length - 1));

    // amd require
    if (typeof names == 'string' && typeof callback == 'function')
      names = [names];
    if (names instanceof Array) {
      var dynamicRequires = [];
      for (var i = 0; i < names.length; i++)
        dynamicRequires.push(loader['import'](names[i], referer));
      Promise.all(dynamicRequires).then(function(modules) {
        if (callback)
          callback.apply(null, modules);
      }, errback);
    }

    // commonjs require
    else if (typeof names == 'string') {
      var module = loader.get(names);
      return module.__useDefault ? module['default'] : module;
    }

    else
      throw new TypeError('Invalid require');
  }

  function define(name, deps, factory) {
    if (typeof name != 'string') {
      factory = deps;
      deps = name;
      name = null;
    }
    if (!(deps instanceof Array)) {
      factory = deps;
      deps = ['require', 'exports', 'module'].splice(0, factory.length);
    }

    if (typeof factory != 'function')
      factory = (function(factory) {
        return function() { return factory; }
      })(factory);

    // in IE8, a trailing comma becomes a trailing undefined entry
    if (deps[deps.length - 1] === undefined)
      deps.pop();

    // remove system dependencies
    var requireIndex, exportsIndex, moduleIndex;
    
    if ((requireIndex = indexOf.call(deps, 'require')) != -1) {
      
      deps.splice(requireIndex, 1);

      // only trace cjs requires for non-named
      // named defines assume the trace has already been done
      if (!name)
        deps = deps.concat(getCJSDeps(factory.toString(), requireIndex));
    }

    if ((exportsIndex = indexOf.call(deps, 'exports')) != -1)
      deps.splice(exportsIndex, 1);
    
    if ((moduleIndex = indexOf.call(deps, 'module')) != -1)
      deps.splice(moduleIndex, 1);

    var define = {
      name: name,
      deps: deps,
      execute: function(req, exports, module) {

        var depValues = [];
        for (var i = 0; i < deps.length; i++)
          depValues.push(req(deps[i]));

        module.uri = module.id;

        module.config = function() {};

        // add back in system dependencies
        if (moduleIndex != -1)
          depValues.splice(moduleIndex, 0, module);
        
        if (exportsIndex != -1)
          depValues.splice(exportsIndex, 0, exports);
        
        if (requireIndex != -1) 
          depValues.splice(requireIndex, 0, function(names, callback, errback) {
            if (typeof names == 'string' && typeof callback != 'function')
              return req(names);
            return require.call(loader, names, callback, errback, module.id);
          });

        var output = factory.apply(exportsIndex == -1 ? __global : exports, depValues);

        if (typeof output == 'undefined' && module)
          output = module.exports;

        if (typeof output != 'undefined')
          return output;
      }
    };

    // anonymous define
    if (!name) {
      // already defined anonymously -> throw
      if (lastModule.anonDefine)
        throw new TypeError('Multiple defines for anonymous module');
      lastModule.anonDefine = define;
    }
    // named define
    else {
      // if we don't have any other defines,
      // then let this be an anonymous define
      // this is just to support single modules of the form:
      // define('jquery')
      // still loading anonymously
      // because it is done widely enough to be useful
      if (!lastModule.anonDefine && !lastModule.isBundle) {
        lastModule.anonDefine = define;
      }
      // otherwise its a bundle only
      else {
        // if there is an anonDefine already (we thought it could have had a single named define)
        // then we define it now
        // this is to avoid defining named defines when they are actually anonymous
        if (lastModule.anonDefine && lastModule.anonDefine.name)
          loader.registerDynamic(lastModule.anonDefine.name, lastModule.anonDefine.deps, false, lastModule.anonDefine.execute);

        lastModule.anonDefine = null;
      }

      // note this is now a bundle
      lastModule.isBundle = true;

      // define the module through the register registry
      loader.registerDynamic(name, define.deps, false, define.execute);
    }
  }
  define.amd = {};

  // adds define as a global (potentially just temporarily)
  function createDefine(loader) {
    lastModule.anonDefine = null;
    lastModule.isBundle = false;

    // ensure no NodeJS environment detection
    var oldModule = __global.module;
    var oldExports = __global.exports;
    var oldDefine = __global.define;

    __global.module = undefined;
    __global.exports = undefined;
    __global.define = define;

    return function() {
      __global.define = oldDefine;
      __global.module = oldModule;
      __global.exports = oldExports;
    };
  }

  var lastModule = {
    isBundle: false,
    anonDefine: null
  };

  loader.set('@@amd-helpers', loader.newModule({
    createDefine: createDefine,
    require: require,
    define: define,
    lastModule: lastModule
  }));
  loader.amdDefine = define;
  loader.amdRequire = require;
})(typeof self != 'undefined' ? self : global);

"bundle";
$__System.register('2', ['3', '4', '5', '6', '7'], function (_export) {
   var Sandbox, _get, _inherits, _createClass, _classCallCheck, SandboxIframe;

   return {
      setters: [function (_5) {
         Sandbox = _5.Sandbox;
      }, function (_) {
         _get = _['default'];
      }, function (_2) {
         _inherits = _2['default'];
      }, function (_3) {
         _createClass = _3['default'];
      }, function (_4) {
         _classCallCheck = _4['default'];
      }],
      execute: function () {
         'use strict';

         SandboxIframe = (function (_Sandbox) {
            _inherits(SandboxIframe, _Sandbox);

            function SandboxIframe(scriptUrl) {
               _classCallCheck(this, SandboxIframe);

               _get(Object.getPrototypeOf(SandboxIframe.prototype), 'constructor', this).call(this);
               this.sandbox = document.getElementById('sandbox');

               if (!!!this.sandbox) {
                  this.sandbox = document.createElement('iframe');
                  this.sandbox.setAttribute('id', 'sandbox');
                  this.sandbox.setAttribute('seamless', '');
                  this.sandbox.setAttribute('sandbox', 'allow-scripts allow-same-origin');
                  this.sandbox.style.display = 'none';
                  document.querySelector('body').appendChild(this.sandbox);

                  var script = document.createElement('script');
                  script.type = 'text/JavaScript';
                  script.src = scriptUrl;
                  this.sandbox.contentWindow.document.getElementsByTagName('body')[0].appendChild(script);
               }

               this.sandbox.contentWindow.addEventListener('message', (function (e) {
                  this._onMessage(e.data);
               }).bind(this));
            }

            _createClass(SandboxIframe, [{
               key: '_onPostMessage',
               value: function _onPostMessage(msg) {
                  this.sandbox.contentWindow.postMessage(msg, '*');
               }
            }]);

            return SandboxIframe;
         })(Sandbox);

         _export('default', SandboxIframe);
      }
   };
});
$__System.registerDynamic("7", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  exports["default"] = function(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };
  exports.__esModule = true;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("8", ["9"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = $__require('9');
  module.exports = function defineProperty(it, key, desc) {
    return $.setDesc(it, key, desc);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("a", ["8"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": $__require('8'),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("6", ["a"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var _Object$defineProperty = $__require('a')["default"];
  exports["default"] = (function() {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor)
          descriptor.writable = true;
        _Object$defineProperty(target, descriptor.key, descriptor);
      }
    }
    return function(Constructor, protoProps, staticProps) {
      if (protoProps)
        defineProperties(Constructor.prototype, protoProps);
      if (staticProps)
        defineProperties(Constructor, staticProps);
      return Constructor;
    };
  })();
  exports.__esModule = true;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("b", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(it) {
    if (typeof it != 'function')
      throw TypeError(it + ' is not a function!');
    return it;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("c", ["b"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var aFunction = $__require('b');
  module.exports = function(fn, that, length) {
    aFunction(fn);
    if (that === undefined)
      return fn;
    switch (length) {
      case 1:
        return function(a) {
          return fn.call(that, a);
        };
      case 2:
        return function(a, b) {
          return fn.call(that, a, b);
        };
      case 3:
        return function(a, b, c) {
          return fn.call(that, a, b, c);
        };
    }
    return function() {
      return fn.apply(that, arguments);
    };
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("d", ["e"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var isObject = $__require('e');
  module.exports = function(it) {
    if (!isObject(it))
      throw TypeError(it + ' is not an object!');
    return it;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("e", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("f", ["9", "e", "d", "c"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var getDesc = $__require('9').getDesc,
      isObject = $__require('e'),
      anObject = $__require('d');
  var check = function(O, proto) {
    anObject(O);
    if (!isObject(proto) && proto !== null)
      throw TypeError(proto + ": can't set as prototype!");
  };
  module.exports = {
    set: Object.setPrototypeOf || ('__proto__' in {} ? function(test, buggy, set) {
      try {
        set = $__require('c')(Function.call, getDesc(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) {
        buggy = true;
      }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy)
          O.__proto__ = proto;
        else
          set(O, proto);
        return O;
      };
    }({}, false) : undefined),
    check: check
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("10", ["11", "f"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $def = $__require('11');
  $def($def.S, 'Object', {setPrototypeOf: $__require('f').set});
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("12", ["10", "13"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  $__require('10');
  module.exports = $__require('13').Object.setPrototypeOf;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("14", ["12"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": $__require('12'),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("15", ["9"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = $__require('9');
  module.exports = function create(P, D) {
    return $.create(P, D);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("16", ["15"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": $__require('15'),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("5", ["16", "14"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var _Object$create = $__require('16')["default"];
  var _Object$setPrototypeOf = $__require('14')["default"];
  exports["default"] = function(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }
    subClass.prototype = _Object$create(superClass && superClass.prototype, {constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }});
    if (superClass)
      _Object$setPrototypeOf ? _Object$setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };
  exports.__esModule = true;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("17", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(exec) {
    try {
      return !!exec();
    } catch (e) {
      return true;
    }
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("13", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var core = module.exports = {version: '1.2.3'};
  if (typeof __e == 'number')
    __e = core;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("18", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var global = module.exports = typeof window != 'undefined' && window.Math == Math ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
  if (typeof __g == 'number')
    __g = global;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("11", ["18", "13"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var global = $__require('18'),
      core = $__require('13'),
      PROTOTYPE = 'prototype';
  var ctx = function(fn, that) {
    return function() {
      return fn.apply(that, arguments);
    };
  };
  var $def = function(type, name, source) {
    var key,
        own,
        out,
        exp,
        isGlobal = type & $def.G,
        isProto = type & $def.P,
        target = isGlobal ? global : type & $def.S ? global[name] : (global[name] || {})[PROTOTYPE],
        exports = isGlobal ? core : core[name] || (core[name] = {});
    if (isGlobal)
      source = name;
    for (key in source) {
      own = !(type & $def.F) && target && key in target;
      if (own && key in exports)
        continue;
      out = own ? target[key] : source[key];
      if (isGlobal && typeof target[key] != 'function')
        exp = source[key];
      else if (type & $def.B && own)
        exp = ctx(out, global);
      else if (type & $def.W && target[key] == out)
        !function(C) {
          exp = function(param) {
            return this instanceof C ? new C(param) : C(param);
          };
          exp[PROTOTYPE] = C[PROTOTYPE];
        }(out);
      else
        exp = isProto && typeof out == 'function' ? ctx(Function.call, out) : out;
      exports[key] = exp;
      if (isProto)
        (exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
    }
  };
  $def.F = 1;
  $def.G = 2;
  $def.S = 4;
  $def.P = 8;
  $def.B = 16;
  $def.W = 32;
  module.exports = $def;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("19", ["11", "13", "17"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(KEY, exec) {
    var $def = $__require('11'),
        fn = ($__require('13').Object || {})[KEY] || Object[KEY],
        exp = {};
    exp[KEY] = exec(fn);
    $def($def.S + $def.F * $__require('17')(function() {
      fn(1);
    }), 'Object', exp);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1a", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(it) {
    if (it == undefined)
      throw TypeError("Can't call method on  " + it);
    return it;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1b", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var toString = {}.toString;
  module.exports = function(it) {
    return toString.call(it).slice(8, -1);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1c", ["1b"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var cof = $__require('1b');
  module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it) {
    return cof(it) == 'String' ? it.split('') : Object(it);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1d", ["1c", "1a"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var IObject = $__require('1c'),
      defined = $__require('1a');
  module.exports = function(it) {
    return IObject(defined(it));
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1e", ["1d", "19"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var toIObject = $__require('1d');
  $__require('19')('getOwnPropertyDescriptor', function($getOwnPropertyDescriptor) {
    return function getOwnPropertyDescriptor(it, key) {
      return $getOwnPropertyDescriptor(toIObject(it), key);
    };
  });
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("9", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $Object = Object;
  module.exports = {
    create: $Object.create,
    getProto: $Object.getPrototypeOf,
    isEnum: {}.propertyIsEnumerable,
    getDesc: $Object.getOwnPropertyDescriptor,
    setDesc: $Object.defineProperty,
    setDescs: $Object.defineProperties,
    getKeys: $Object.keys,
    getNames: $Object.getOwnPropertyNames,
    getSymbols: $Object.getOwnPropertySymbols,
    each: [].forEach
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1f", ["9", "1e"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = $__require('9');
  $__require('1e');
  module.exports = function getOwnPropertyDescriptor(it, key) {
    return $.getDesc(it, key);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("20", ["1f"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": $__require('1f'),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("4", ["20"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var _Object$getOwnPropertyDescriptor = $__require('20')["default"];
  exports["default"] = function get(_x, _x2, _x3) {
    var _again = true;
    _function: while (_again) {
      var object = _x,
          property = _x2,
          receiver = _x3;
      _again = false;
      if (object === null)
        object = Function.prototype;
      var desc = _Object$getOwnPropertyDescriptor(object, property);
      if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
          return undefined;
        } else {
          _x = parent;
          _x2 = property;
          _x3 = receiver;
          _again = true;
          desc = parent = undefined;
          continue _function;
        }
      } else if ("value" in desc) {
        return desc.value;
      } else {
        var getter = desc.get;
        if (getter === undefined) {
          return undefined;
        }
        return getter.call(receiver);
      }
    }
  };
  exports.__esModule = true;
  global.define = __define;
  return module.exports;
});

$__System.register('21', ['3', '4', '5', '6', '7'], function (_export) {
    var Sandbox, _get, _inherits, _createClass, _classCallCheck, SandboxWorker;

    return {
        setters: [function (_5) {
            Sandbox = _5.Sandbox;
        }, function (_) {
            _get = _['default'];
        }, function (_2) {
            _inherits = _2['default'];
        }, function (_3) {
            _createClass = _3['default'];
        }, function (_4) {
            _classCallCheck = _4['default'];
        }],
        execute: function () {
            'use strict';

            SandboxWorker = (function (_Sandbox) {
                _inherits(SandboxWorker, _Sandbox);

                function SandboxWorker(script) {
                    _classCallCheck(this, SandboxWorker);

                    _get(Object.getPrototypeOf(SandboxWorker.prototype), 'constructor', this).call(this);
                    if (!!Worker) {
                        this._worker = new Worker(script);
                        this._worker.addEventListener('message', (function (e) {
                            this._onMessage(e.data);
                        }).bind(this));
                        this._worker.postMessage('');
                    } else {
                        throw new Error('Your environment does not support worker \n', e);
                    }
                }

                _createClass(SandboxWorker, [{
                    key: '_onPostMessage',
                    value: function _onPostMessage(msg) {
                        this._worker.postMessage(msg);
                    }
                }]);

                return SandboxWorker;
            })(Sandbox);

            _export('default', SandboxWorker);
        }
    };
});
$__System.register('22', ['2', '21'], function (_export) {

    //TODO: resources url dependency
    'use strict';

    var SandboxIframe, SandboxWorker;
    function createSandbox() {
        return new SandboxWorker('../dist/context-service.js');
    }

    function createAppSandbox() {}

    return {
        setters: [function (_2) {
            SandboxIframe = _2['default'];
        }, function (_) {
            SandboxWorker = _['default'];
        }],
        execute: function () {
            _export('default', { createSandbox: createSandbox, createAppSandbox: createAppSandbox });
        }
    };
});
(function() {
var _removeDefine = $__System.get("@@amd-helpers").createDefine();
!function(e) {
  if ("object" == typeof exports && "undefined" != typeof module)
    module.exports = e();
  else if ("function" == typeof define && define.amd)
    define("23", [], e);
  else {
    var t;
    t = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, t.runtimeCore = e();
  }
}(function() {
  var define,
      module,
      exports;
  return function e(t, n, o) {
    function r(s, u) {
      if (!n[s]) {
        if (!t[s]) {
          var a = "function" == typeof require && require;
          if (!u && a)
            return a(s, !0);
          if (i)
            return i(s, !0);
          var c = new Error("Cannot find module '" + s + "'");
          throw c.code = "MODULE_NOT_FOUND", c;
        }
        var l = n[s] = {exports: {}};
        t[s][0].call(l.exports, function(e) {
          var n = t[s][1][e];
          return r(n ? n : e);
        }, l, l.exports, e, t, n, o);
      }
      return n[s].exports;
    }
    for (var i = "function" == typeof require && require,
        s = 0; s < o.length; s++)
      r(o[s]);
    return r;
  }({
    1: [function(e, t, n) {
      "use strict";
      function o(e) {
        return e && e.__esModule ? e : {"default": e};
      }
      function r(e, t) {
        if (!(e instanceof t))
          throw new TypeError("Cannot call a class as a function");
      }
      function i(e, t) {
        if ("function" != typeof t && null !== t)
          throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {constructor: {
            value: e,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }}), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t);
      }
      Object.defineProperty(n, "__esModule", {value: !0});
      var s = function() {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var o = t[n];
            o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o);
          }
        }
        return function(t, n, o) {
          return n && e(t.prototype, n), o && e(t, o), t;
        };
      }(),
          u = function(e, t, n) {
            for (var o = !0; o; ) {
              var r = e,
                  i = t,
                  s = n;
              o = !1, null === r && (r = Function.prototype);
              var u = Object.getOwnPropertyDescriptor(r, i);
              if (void 0 !== u) {
                if ("value" in u)
                  return u.value;
                var a = u.get;
                if (void 0 === a)
                  return;
                return a.call(s);
              }
              var c = Object.getPrototypeOf(r);
              if (null === c)
                return;
              e = c, t = i, n = s, o = !0, u = c = void 0;
            }
          },
          a = e("./MiniBus"),
          c = o(a),
          l = function(e) {
            function t(e) {
              r(this, t), u(Object.getPrototypeOf(t.prototype), "constructor", this).call(this), this._registry = e;
            }
            return i(t, e), s(t, [{
              key: "_onPostMessage",
              value: function(e) {
                var t = this;
                t._registry.resolve(e.to).then(function(n) {
                  var o = t._subscriptions[n];
                  o && t._publishOn(o, e);
                })["catch"](function(e) {
                  console.log("PROTO-STUB-ERROR: ", e);
                });
              }
            }]), t;
          }(c["default"]);
      n["default"] = l, t.exports = n["default"];
    }, {"./MiniBus": 2}],
    2: [function(e, t, n) {
      "use strict";
      function o(e, t) {
        if (!(e instanceof t))
          throw new TypeError("Cannot call a class as a function");
      }
      Object.defineProperty(n, "__esModule", {value: !0});
      var r = function() {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var o = t[n];
            o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o);
          }
        }
        return function(t, n, o) {
          return n && e(t.prototype, n), o && e(t, o), t;
        };
      }(),
          i = function() {
            function e() {
              o(this, e);
              var t = this;
              t._msgId = 0, t._subscriptions = {}, t._responseTimeOut = 3e3, t._responseCallbacks = {}, t._registerExternalListener();
            }
            return r(e, [{
              key: "addListener",
              value: function(e, t) {
                var n = this,
                    o = new s(n._subscriptions, e, t),
                    r = n._subscriptions[e];
                return r || (r = [], n._subscriptions[e] = r), r.push(o), o;
              }
            }, {
              key: "addResponseListener",
              value: function(e, t, n) {
                this._responseCallbacks[e + t] = n;
              }
            }, {
              key: "removeResponseListener",
              value: function(e, t) {
                delete this._responseCallbacks[e + t];
              }
            }, {
              key: "removeAllListenersOf",
              value: function(e) {
                delete this._subscriptions[e];
              }
            }, {
              key: "postMessage",
              value: function(e, t) {
                var n = this;
                if (e.id && 0 !== e.id || (n._msgId++, e.id = n._msgId), t && !function() {
                  var o = e.from + e.id;
                  n._responseCallbacks[o] = t, setTimeout(function() {
                    var t = n._responseCallbacks[o];
                    if (delete n._responseCallbacks[o], t) {
                      var r = {
                        id: e.id,
                        type: "response",
                        body: {
                          code: "error",
                          desc: "Response timeout!"
                        }
                      };
                      t(r);
                    }
                  }, n._responseTimeOut);
                }(), !n._onResponse(e)) {
                  var o = n._subscriptions[e.to];
                  o ? n._publishOn(o, e) : n._onPostMessage(e);
                }
                return e.id;
              }
            }, {
              key: "bind",
              value: function(e, t, n) {
                var o = this,
                    r = this,
                    i = r.addListener(e, function(e) {
                      n.postMessage(e);
                    }),
                    s = n.addListener(t, function(e) {
                      r.postMessage(e);
                    });
                return {
                  thisListener: i,
                  targetListener: s,
                  unbind: function() {
                    o.thisListener.remove(), o.targetListener.remove();
                  }
                };
              }
            }, {
              key: "_publishOn",
              value: function(e, t) {
                e.forEach(function(e) {
                  e._callback(t);
                });
              }
            }, {
              key: "_onResponse",
              value: function(e) {
                var t = this;
                if ("response" === e.type) {
                  var n = e.to + e.id,
                      o = t._responseCallbacks[n];
                  if (delete t._responseCallbacks[n], o)
                    return o(e), !0;
                }
                return !1;
              }
            }, {
              key: "_onMessage",
              value: function(e) {
                var t = this;
                if (!t._onResponse(e)) {
                  var n = t._subscriptions[e.to];
                  n ? t._publishOn(n, e) : (n = t._subscriptions["*"], n && t._publishOn(n, e));
                }
              }
            }, {
              key: "_onPostMessage",
              value: function(e) {}
            }, {
              key: "_registerExternalListener",
              value: function() {}
            }]), e;
          }(),
          s = function() {
            function e(t, n, r) {
              o(this, e);
              var i = this;
              i._subscriptions = t, i._url = n, i._callback = r;
            }
            return r(e, [{
              key: "remove",
              value: function() {
                var e = this,
                    t = e._subscriptions[e._url];
                if (t) {
                  var n = t.indexOf(e);
                  t.splice(n, 1), 0 === t.length && delete e._subscriptions[e._url];
                }
              }
            }, {
              key: "url",
              get: function() {
                return this._url;
              }
            }]), e;
          }();
      n["default"] = i, t.exports = n["default"];
    }, {}],
    3: [function(e, t, n) {
      "use strict";
      function o(e, t) {
        if (!(e instanceof t))
          throw new TypeError("Cannot call a class as a function");
      }
      Object.defineProperty(n, "__esModule", {value: !0});
      var r = function() {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var o = t[n];
            o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o);
          }
        }
        return function(t, n, o) {
          return n && e(t.prototype, n), o && e(t, o), t;
        };
      }(),
          i = function() {
            function e() {
              o(this, e);
            }
            return r(e, [{
              key: "registerIdentity",
              value: function() {}
            }, {
              key: "registerWithRP",
              value: function() {}
            }, {
              key: "loginWithRP",
              value: function(e, t) {
                function n(e, t) {
                  t = t.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                  var n = "[\\#&]" + t + "=([^&#]*)",
                      o = new RegExp(n),
                      r = o.exec(e);
                  return null === r ? "" : r[1];
                }
                var o = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=",
                    r = "https://www.googleapis.com/oauth2/v1/userinfo?access_token=",
                    i = "https://accounts.google.com/o/oauth2/auth?",
                    s = "email%20profile",
                    u = "808329566012-tqr8qoh111942gd2kg007t0s8f277roi.apps.googleusercontent.com",
                    a = "http://127.0.0.1:8080/",
                    c = "token",
                    l = i + "scope=" + s + "&client_id=" + u + "&redirect_uri=" + a + "&response_type=" + c,
                    f = void 0,
                    d = void 0,
                    p = void 0,
                    y = void 0;
                return new Promise(function(e, t) {
                  function i(e) {
                    var n = new XMLHttpRequest;
                    n.open("GET", o + e, !0), n.onreadystatechange = function(o) {
                      4 == n.readyState && (200 == n.status ? s(e) : t(400 == n.status ? "There was an error processing the token" : "something else other than 200 was returned"));
                    }, n.send();
                  }
                  function s(n) {
                    var o = new XMLHttpRequest;
                    o.open("GET", r + n, !0), o.onreadystatechange = function(n) {
                      4 == o.readyState && (200 == o.status ? (console.log("getUserInfo ", o), y = JSON.parse(o.responseText), e(y)) : t(400 == o.status ? "There was an error processing the token" : "something else other than 200 was returned"));
                    }, o.send();
                  }
                  var u = window.open(l, "openIDrequest", "width=800, height=600"),
                      c = window.setInterval(function() {
                        try {
                          if (u.closed && (t("Some error occured."), clearInterval(c)), -1 != u.document.URL.indexOf(a)) {
                            window.clearInterval(c);
                            var e = u.document.URL;
                            f = n(e, "access_token"), d = n(e, "token_type"), p = n(e, "expires_in"), u.close(), i(f);
                          }
                        } catch (o) {}
                      }, 500);
                });
              }
            }, {
              key: "setHypertyIdentity",
              value: function() {}
            }, {
              key: "generateAssertion",
              value: function(e, t, n) {}
            }, {
              key: "validateAssertion",
              value: function(e) {}
            }, {
              key: "getAssertionTrustLevel",
              value: function(e) {}
            }]), e;
          }();
      n["default"] = i, t.exports = n["default"];
    }, {}],
    4: [function(require, module, exports) {
      "use strict";
      function _classCallCheck(e, t) {
        if (!(e instanceof t))
          throw new TypeError("Cannot call a class as a function");
      }
      Object.defineProperty(exports, "__esModule", {value: !0});
      var _createClass = function() {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var o = t[n];
            o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o);
          }
        }
        return function(t, n, o) {
          return n && e(t.prototype, n), o && e(t, o), t;
        };
      }(),
          PolicyEngine = function() {
            function PolicyEngine(e, t) {
              _classCallCheck(this, PolicyEngine);
              var n = this;
              n.idModule = e, n.registry = t, n.policiesTable = new Object, n.blacklist = [];
            }
            return _createClass(PolicyEngine, [{
              key: "addPolicies",
              value: function(e, t) {
                var n = this;
                n.policiesTable[e] = t;
              }
            }, {
              key: "removePolicies",
              value: function(e) {
                var t = this;
                delete t.policiesTable[e];
              }
            }, {
              key: "authorise",
              value: function(e) {
                var t = this;
                return console.log(t.policiesTable), new Promise(function(n, o) {
                  "allow" == t.checkPolicies(e) ? t.idModule.loginWithRP("google identity", "scope").then(function(t) {
                    e.body.assertedIdentity = JSON.stringify(t), e.body.authorised = !0, n(e);
                  }, function(e) {
                    o(e);
                  }) : n(!1);
                });
              }
            }, {
              key: "checkPolicies",
              value: function checkPolicies(message) {
                var _this = this,
                    _results = ["allow"],
                    _policies = _this.policiesTable[message.body.hypertyURL];
                if (void 0 != _policies)
                  for (var _numPolicies = _policies.length,
                      i = 0; _numPolicies > i; i++) {
                    var _policy = _policies[i];
                    console.log(_policy), "blacklist" == _policy.target && _this.blacklist.indexOf(eval(_policy.subject)) > -1 && (console.log("Is in blacklist!"), _results.push(_policy.action)), "whitelist" == _policy.target && _this.whitelist.indexOf(eval(_policy.subject)) > -1 && (console.log("Is in whitelist!"), _results.push(_policy.action));
                  }
                return console.log(_results), _results.indexOf("deny") > -1 ? "deny" : "allow";
              }
            }]), PolicyEngine;
          }();
      exports["default"] = PolicyEngine, module.exports = exports["default"];
    }, {}],
    5: [function(e, t, n) {
      "use strict";
      function o(e, t) {
        if (!(e instanceof t))
          throw new TypeError("Cannot call a class as a function");
      }
      Object.defineProperty(n, "__esModule", {value: !0});
      var r = function() {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var o = t[n];
            o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o);
          }
        }
        return function(t, n, o) {
          return n && e(t.prototype, n), o && e(t, o), t;
        };
      }(),
          i = function() {
            function e(t, n) {
              o(this, e);
              var r = this;
              r._url = t, r._bus = n;
            }
            return r(e, [{
              key: "create",
              value: function(e, t) {
                var n = this,
                    o = {
                      type: "create",
                      from: n._url,
                      to: "domain://msg-node." + e + "/hyperty-address-allocation",
                      body: {number: t}
                    };
                return new Promise(function(e, t) {
                  n._bus.postMessage(o, function(n) {
                    200 === n.body.code ? e(n.body.allocated) : t(n.body.desc);
                  });
                });
              }
            }, {
              key: "url",
              get: function() {
                return this._url;
              }
            }]), e;
          }();
      n["default"] = i, t.exports = n["default"];
    }, {}],
    6: [function(e, t, n) {
      "use strict";
      function o(e) {
        return e && e.__esModule ? e : {"default": e};
      }
      function r(e, t) {
        if (!(e instanceof t))
          throw new TypeError("Cannot call a class as a function");
      }
      function i(e, t) {
        if ("function" != typeof t && null !== t)
          throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {constructor: {
            value: e,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }}), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t);
      }
      Object.defineProperty(n, "__esModule", {value: !0});
      var s = function() {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var o = t[n];
            o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o);
          }
        }
        return function(t, n, o) {
          return n && e(t.prototype, n), o && e(t, o), t;
        };
      }(),
          u = function(e, t, n) {
            for (var o = !0; o; ) {
              var r = e,
                  i = t,
                  s = n;
              o = !1, null === r && (r = Function.prototype);
              var u = Object.getOwnPropertyDescriptor(r, i);
              if (void 0 !== u) {
                if ("value" in u)
                  return u.value;
                var a = u.get;
                if (void 0 === a)
                  return;
                return a.call(s);
              }
              var c = Object.getPrototypeOf(r);
              if (null === c)
                return;
              e = c, t = i, n = s, o = !0, u = c = void 0;
            }
          },
          a = e("../utils/EventEmitter"),
          c = o(a),
          l = e("./AddressAllocation"),
          f = o(l),
          d = e("../utils/utils.js"),
          p = function(e) {
            function t(e, n, o) {
              if (r(this, t), u(Object.getPrototypeOf(t.prototype), "constructor", this).call(this), !e)
                throw new Error("runtimeURL is missing.");
              var i = this;
              i.registryURL = e + "/registry/123", i.appSandbox = n, i.runtimeURL = e, i.remoteRegistry = o, i.hypertyiesList = {}, i.protostubsList = {}, i.sandboxesList = {}, i.pepList = {};
            }
            return i(t, e), s(t, [{
              key: "getAppSandbox",
              value: function() {
                var e = this;
                return e.appSandbox;
              }
            }, {
              key: "registerHyperty",
              value: function(e, t) {
                var n = this,
                    o = (0, d.divideURL)(t).domain,
                    r = new Promise(function(t, r) {
                      return void 0 !== n._messageBus ? n.resolve("hyperty-runtime://" + o).then(function() {}).then(function() {
                        var o = n._messageBus.addListener(n.registryURL, function(t) {
                          var r = t.body.hypertyRuntime;
                          n.hypertiesList[r] = {identity: r + "/identity"}, n.sandboxesList[r] = e, o.remove();
                        }),
                            i = 1,
                            s = "ua.pt";
                        n.addressAllocation.create(s, i).then(function(e) {
                          e.forEach(function(e) {
                            n._messageBus.addListener(e + "/status", function(t) {
                              console.log("Message addListener for : ", e + "/status -> " + t);
                            });
                          }), t(e[0]);
                        })["catch"](function(e) {
                          console.log("Address Reason: ", e), r(e);
                        });
                      }) : void r("MessageBus not found on registerStub");
                    });
                return r;
              }
            }, {
              key: "unregisterHyperty",
              value: function(e) {
                var t = this,
                    n = new Promise(function(n, o) {
                      var r = t.hypertiesList[e];
                      void 0 === r ? o("Hyperty not found") : n("Hyperty successfully deleted");
                    });
                return n;
              }
            }, {
              key: "discoverProtostub",
              value: function(e) {
                if (!e)
                  throw new Error("Parameter url needed");
                var t = this,
                    n = new Promise(function(n, o) {
                      var r = t.protostubsList[e];
                      void 0 === r ? o("requestUpdate couldn' get the ProtostubURL") : n(r);
                    });
                return n;
              }
            }, {
              key: "registerStub",
              value: function(e, t) {
                var n,
                    o = this,
                    r = new Promise(function(r, i) {
                      void 0 === o._messageBus && i("MessageBus not found on registerStub");
                      var s = t;
                      t.indexOf("msg-node.") || (s = t.substring(t.indexOf(".") + 1)), n = "msg-node." + s + "/protostub/" + Math.floor(1e4 * Math.random() + 1), o.protostubsList[s] = n, o.sandboxesList[n] = e, r(n), o._messageBus.addListener(n + "/status", function(e) {
                        e.resource === e.to + "/status" && console.log("RuntimeProtostubURL/status message: ", e.body.value);
                      });
                    });
                return r;
              }
            }, {
              key: "unregisterStub",
              value: function(e) {
                var t = this,
                    n = new Promise(function(n, o) {
                      var r = t.protostubsList[e];
                      void 0 === r ? o("Error on unregisterStub: Hyperty not found") : (delete t.protostubsList[e], n("ProtostubURL removed"));
                    });
                return n;
              }
            }, {
              key: "registerPEP",
              value: function(e, t) {
                var n = this,
                    o = new Promise(function(o, r) {
                      n.pepList[t] = e, o("PEP registered with success");
                    });
                return o;
              }
            }, {
              key: "unregisterPEP",
              value: function(e) {
                var t = this,
                    n = new Promise(function(n, o) {
                      var r = t.pepList[e];
                      void 0 === r ? o("Pep Not found.") : n("PEP successfully removed.");
                    });
                return n;
              }
            }, {
              key: "onEvent",
              value: function(e) {}
            }, {
              key: "getSandbox",
              value: function(e) {
                if (!e)
                  throw new Error("Parameter url needed");
                var t = this,
                    n = new Promise(function(n, o) {
                      var r = t.sandboxesList[e];
                      void 0 === r ? o("Sandbox not found") : n(r);
                    });
                return n;
              }
            }, {
              key: "resolve",
              value: function(e) {
                console.log("resolve " + e);
                var t = this,
                    n = (0, d.divideURL)(e).domain,
                    o = new Promise(function(e, o) {
                      n.indexOf("msg-node.") || (n = n.substring(n.indexOf(".") + 1));
                      var r = t.protostubsList[n];
                      t.addEventListener("runtime:stubLoaded", function(t) {
                        e(t);
                      }), void 0 !== r ? e(r) : t.trigger("runtime:loadStub", n);
                    });
                return o;
              }
            }, {
              key: "messageBus",
              get: function() {
                var e = this;
                return e._messageBus;
              },
              set: function(e) {
                var t = this;
                t._messageBus = e;
                var n = new f["default"](t.registryURL, e);
                t.addressAllocation = n;
              }
            }]), t;
          }(c["default"]);
      n["default"] = p, t.exports = n["default"];
    }, {
      "../utils/EventEmitter": 12,
      "../utils/utils.js": 13,
      "./AddressAllocation": 5
    }],
    7: [function(e, t, n) {
      "use strict";
      function o(e) {
        return e && e.__esModule ? e : {"default": e};
      }
      Object.defineProperty(n, "__esModule", {value: !0});
      var r = e("./runtime/RuntimeUA"),
          i = o(r),
          s = e("./sandbox/Sandbox"),
          u = o(s),
          a = e("./bus/MiniBus"),
          c = o(a),
          l = e("./sandbox/SandboxRegistry"),
          f = o(l);
      n.RuntimeUA = i["default"], n.Sandbox = u["default"], n.MiniBus = c["default"], n.SandboxRegistry = f["default"];
    }, {
      "./bus/MiniBus": 2,
      "./runtime/RuntimeUA": 9,
      "./sandbox/Sandbox": 10,
      "./sandbox/SandboxRegistry": 11
    }],
    8: [function(e, t, n) {
      "use strict";
      function o(e, t) {
        if (!(e instanceof t))
          throw new TypeError("Cannot call a class as a function");
      }
      Object.defineProperty(n, "__esModule", {value: !0});
      var r = function() {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var o = t[n];
            o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o);
          }
        }
        return function(t, n, o) {
          return n && e(t.prototype, n), o && e(t, o), t;
        };
      }(),
          i = function() {
            function e() {
              o(this, e), console.log("runtime catalogue");
            }
            return r(e, [{
              key: "getHypertyRuntimeURL",
              value: function() {
                return _hypertyRuntimeURL;
              }
            }, {
              key: "_makeExternalRequest",
              value: function(e) {
                return console.log("_makeExternalRequest", e), new Promise(function(t, n) {
                  var o = new XMLHttpRequest;
                  o.onreadystatechange = function(e) {
                    var o = e.currentTarget;
                    4 === o.readyState && (console.log("got response:", o), 200 === o.status ? t(o.responseText) : n(o.responseText));
                  }, o.open("GET", e, !0), o.send();
                });
              }
            }, {
              key: "getHypertyDescriptor",
              value: function(e) {
                var t = this;
                return console.log("getHypertyDescriptor", e), new Promise(function(n, o) {
                  t._makeExternalRequest(e).then(function(e) {
                    e = JSON.parse(e), e.ERROR ? o(e) : n(e);
                  });
                });
              }
            }, {
              key: "getHypertySourcePackage",
              value: function(e) {
                var t = this;
                return new Promise(function(n, o) {
                  t._makeExternalRequest(e).then(function(e) {
                    e.ERROR ? o(e) : (e = JSON.parse(e), sourcePackage = JSON.parse(e.sourcePackage), n(sourcePackage));
                  })["catch"](function(e) {
                    o(e);
                  });
                });
              }
            }, {
              key: "getStubDescriptor",
              value: function(e) {
                return new Promise(function(t, n) {
                  _makeExternalRequest(e).then(function(e) {
                    e = JSON.parse(e), e.ERROR ? n(e) : t(e);
                  });
                });
              }
            }, {
              key: "getStubSourcePackage",
              value: function(e) {
                var t = this;
                return new Promise(function(n, o) {
                  t._makeExternalRequest(e).then(function(e) {
                    n(e);
                  })["catch"](function(e) {
                    o(e);
                  });
                });
              }
            }, {
              key: "runtimeURL",
              set: function(e) {
                var t = this;
                t._runtimeURL = e;
              },
              get: function() {
                var e = this;
                return e._runtimeURL;
              }
            }]), e;
          }();
      n["default"] = i, t.exports = n["default"];
    }, {}],
    9: [function(e, t, n) {
      "use strict";
      function o(e) {
        return e && e.__esModule ? e : {"default": e};
      }
      function r(e, t) {
        if (!(e instanceof t))
          throw new TypeError("Cannot call a class as a function");
      }
      Object.defineProperty(n, "__esModule", {value: !0});
      var i = function() {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var o = t[n];
            o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o);
          }
        }
        return function(t, n, o) {
          return n && e(t.prototype, n), o && e(t, o), t;
        };
      }(),
          s = e("../registry/Registry"),
          u = o(s),
          a = e("../identity/IdentityModule"),
          c = o(a),
          l = e("../policy/PolicyEngine"),
          f = o(l),
          d = e("../bus/MessageBus"),
          p = o(d),
          y = e("./RuntimeCatalogue"),
          v = o(y),
          g = function() {
            function e(t) {
              if (r(this, e), !t)
                throw new Error("The sandbox factory is a needed parameter");
              var n = this;
              n.sandboxFactory = t, n.runtimeCatalogue = new v["default"];
              var o = "runtime://sp1/" + Math.floor(1e4 * Math.random() + 1);
              n.runtimeURL = o, n.runtimeCatalogue.runtimeURL = o;
              var i = t.createAppSandbox();
              n.identityModule = new c["default"], n.policyEngine = new f["default"], n.registry = new u["default"](o, i), n.messageBus = new p["default"](n.registry), n.registry.messageBus = n.messageBus, n.registry.addEventListener("runtime:loadStub", function(e) {
                n.loadStub(e).then(function(t) {
                  n.registry.trigger("runtime:stubLoaded", e);
                })["catch"](function(e) {
                  console.error(e);
                });
              }), t.messageBus = n.messageBus;
            }
            return i(e, [{
              key: "discoverHiperty",
              value: function(e) {}
            }, {
              key: "registerHyperty",
              value: function(e, t) {}
            }, {
              key: "loadHyperty",
              value: function(e) {
                var t = this;
                if (!e)
                  throw new Error("Hyperty descriptor url parameter is needed");
                return new Promise(function(n, o) {
                  var r = void 0,
                      i = void 0,
                      s = void 0,
                      u = void 0,
                      a = function(e) {
                        console.error(e), o(e);
                      };
                  console.log("------------------ Hyperty ------------------------"), console.info("Get hyperty descriptor for :", e), t.runtimeCatalogue.getHypertyDescriptor(e).then(function(e) {
                    console.info("1: return hyperty descriptor", e), s = e;
                    var n = e.sourcePackageURL;
                    return "/sourcePackage" == n ? JSON.parse(e.sourcePackage) : t.runtimeCatalogue.getHypertySourcePackage(n);
                  }).then(function(e) {
                    console.info("2: return hyperty source package", e), u = e;
                    var t = !0;
                    return t;
                  }).then(function(e) {
                    console.info("3: return policy engine result", e);
                    var n = !0,
                        o = void 0;
                    return o = n ? t.registry.getAppSandbox() : t.registry.getSandbox(domain);
                  }).then(function(e) {
                    return console.info("4: return the sandbox", e), e;
                  }, function(e) {
                    return console.info("4.1: try to register a new sandbox", e), t.sandboxFactory.createSandbox();
                  }).then(function(n) {
                    return console.info("5: return sandbox and register"), i = n, t.registry.registerHyperty(n, e);
                  }).then(function(e) {
                    return console.info("6: Hyperty url, after register hyperty", e), r = e, i.deployComponent(u, r, s.configuration);
                  }).then(function(e) {
                    console.info("7: Deploy component status for hyperty: ", r), t.messageBus.addListener(r, function(e) {
                      i.postMessage(e);
                    }), i.addListener("*", function(e) {
                      t.messageBus.postMessage(e);
                    });
                    var o = {
                      runtimeHypertyURL: r,
                      status: "Deployed"
                    };
                    n(o), console.log("------------------ END ------------------------");
                  })["catch"](a);
                });
              }
            }, {
              key: "loadStub",
              value: function(e) {
                var t = this;
                if (!e)
                  throw new Error("domain parameter is needed");
                return new Promise(function(n, o) {
                  var r = void 0,
                      i = void 0,
                      s = void 0,
                      u = void 0,
                      a = function(e) {
                        console.error(e), o(e);
                      };
                  console.info("------------------- ProtoStub ---------------------------\n"), console.info("Discover or Create a new ProtoStub for domain: ", e), t.registry.discoverProtostub(e).then(function(e) {
                    return console.info("1. Proto Stub Discovered: ", e), i = e;
                  }, function(n) {
                    return console.info("1. Proto Stub not found:", n), t.runtimeCatalogue.getStubDescriptor(e);
                  }).then(function(e) {
                    console.info("2. return the ProtoStub descriptor:", e), i = e;
                    var n = e.sourcePackageURL;
                    return n.isEqual("/sourcePackage") ? e.sourcePackage : t.runtimeCatalogue.getStubSourcePackage(n);
                  }).then(function(e) {
                    console.info("3. return the ProtoStub Source Package: "), u = e;
                    var t = !0;
                    return t;
                  }).then(function(n) {
                    return t.registry.getSandbox(e);
                  }).then(function(e) {
                    return console.info("4. if the sandbox is registered then return the sandbox", e), r = e, e;
                  }, function(e) {
                    return console.info("5. Sandbox was not found, creating a new one"), t.sandboxFactory.createSandbox();
                  }).then(function(n) {
                    return console.info("6. return the sandbox instance and the register", n), r = n, t.registry.registerStub(r, e);
                  }).then(function(e) {
                    return console.info("7. return the runtime protostub url: ", e), s = e, r.deployComponent(u, e, i.configuration);
                  }).then(function(e) {
                    console.info("8: return deploy component for sandbox status"), t.messageBus.addListener(s, function(e) {
                      r.postMessage(e);
                    }), r.addListener("*", function(e) {
                      t.messageBus.postMessage(e);
                    });
                    var o = {
                      runtimeProtoStubURL: s,
                      status: "Deployed"
                    };
                    n(o), console.info("------------------- END ---------------------------\n");
                  })["catch"](a);
                });
              }
            }, {
              key: "checkForUpdate",
              value: function(e) {}
            }]), e;
          }();
      n["default"] = g, t.exports = n["default"];
    }, {
      "../bus/MessageBus": 1,
      "../identity/IdentityModule": 3,
      "../policy/PolicyEngine": 4,
      "../registry/Registry": 6,
      "./RuntimeCatalogue": 8
    }],
    10: [function(e, t, n) {
      "use strict";
      function o(e) {
        return e && e.__esModule ? e : {"default": e};
      }
      function r(e, t) {
        if (!(e instanceof t))
          throw new TypeError("Cannot call a class as a function");
      }
      function i(e, t) {
        if ("function" != typeof t && null !== t)
          throw new TypeError("Super expression must either be null or a function, not " + typeof t);
        e.prototype = Object.create(t && t.prototype, {constructor: {
            value: e,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }}), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t);
      }
      Object.defineProperty(n, "__esModule", {value: !0});
      var s = function() {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var o = t[n];
            o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o);
          }
        }
        return function(t, n, o) {
          return n && e(t.prototype, n), o && e(t, o), t;
        };
      }(),
          u = function(e, t, n) {
            for (var o = !0; o; ) {
              var r = e,
                  i = t,
                  s = n;
              o = !1, null === r && (r = Function.prototype);
              var u = Object.getOwnPropertyDescriptor(r, i);
              if (void 0 !== u) {
                if ("value" in u)
                  return u.value;
                var a = u.get;
                if (void 0 === a)
                  return;
                return a.call(s);
              }
              var c = Object.getPrototypeOf(r);
              if (null === c)
                return;
              e = c, t = i, n = s, o = !0, u = c = void 0;
            }
          },
          a = e("../sandbox/SandboxRegistry"),
          c = o(a),
          l = e("../bus/MiniBus"),
          f = o(l),
          d = function(e) {
            function t() {
              r(this, t), u(Object.getPrototypeOf(t.prototype), "constructor", this).call(this);
            }
            return i(t, e), s(t, [{
              key: "deployComponent",
              value: function(e, t, n) {
                var o = this;
                return new Promise(function(r, i) {
                  var s = {
                    type: "create",
                    from: c["default"].ExternalDeployAddress,
                    to: c["default"].InternalDeployAddress,
                    body: {
                      url: t,
                      sourceCode: e,
                      config: n
                    }
                  };
                  o.postMessage(s, function(e) {
                    200 === e.body.code ? r("deployed") : i(e.body.desc);
                  });
                });
              }
            }, {
              key: "removeComponent",
              value: function(e) {
                var t = this;
                return new Promise(function(n, o) {
                  var r = {
                    type: "delete",
                    from: c["default"].ExternalDeployAddress,
                    to: c["default"].InternalDeployAddress,
                    body: {url: e}
                  };
                  t.postMessage(r, function(e) {
                    200 === e.body.code ? n("undeployed") : o(e.body.desc);
                  });
                });
              }
            }]), t;
          }(f["default"]);
      n["default"] = d, t.exports = n["default"];
    }, {
      "../bus/MiniBus": 2,
      "../sandbox/SandboxRegistry": 11
    }],
    11: [function(e, t, n) {
      "use strict";
      function o(e, t) {
        if (!(e instanceof t))
          throw new TypeError("Cannot call a class as a function");
      }
      Object.defineProperty(n, "__esModule", {value: !0});
      var r = function() {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var o = t[n];
            o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o);
          }
        }
        return function(t, n, o) {
          return n && e(t.prototype, n), o && e(t, o), t;
        };
      }(),
          i = function() {
            function e(t) {
              o(this, e);
              var n = this;
              n._bus = t, n._components = {}, t.addListener(e.InternalDeployAddress, function(t) {
                console.log("SandboxRegistry-RCV: ", t);
                ({
                  id: t.id,
                  type: "response",
                  from: e.InternalDeployAddress,
                  to: e.ExternalDeployAddress
                });
                switch (t.type) {
                  case "create":
                    n._onDeploy(t);
                    break;
                  case "delete":
                    n._onRemove(t);
                }
              });
            }
            return r(e, [{
              key: "_responseMsg",
              value: function(t, n, o) {
                var r = {
                  id: t.id,
                  type: "response",
                  from: e.InternalDeployAddress,
                  to: e.ExternalDeployAddress
                },
                    i = {};
                return n && (i.code = n), o && (i.desc = o), r.body = i, r;
              }
            }, {
              key: "_onDeploy",
              value: function(e) {
                var t = this,
                    n = e.body.config,
                    o = e.body.url,
                    r = e.body.sourceCode,
                    i = void 0,
                    s = void 0;
                if (t._components.hasOwnProperty(o))
                  i = 500, s = "Instance " + o + " already exist!";
                else
                  try {
                    t._components[o] = t._create(o, r, n), i = 200;
                  } catch (u) {
                    i = 500, s = u;
                  }
                var a = t._responseMsg(e, i, s);
                t._bus.postMessage(a);
              }
            }, {
              key: "_onRemove",
              value: function(e) {
                var t = this,
                    n = e.body.url,
                    o = void 0,
                    r = void 0;
                t._components.hasOwnProperty(n) ? (delete t._components[n], t._bus.removeAllListenersOf(n), o = 200) : (o = 500, r = "Instance " + n + " doesn't exist!");
                var i = t._responseMsg(e, o, r);
                t._bus.postMessage(i);
              }
            }, {
              key: "_create",
              value: function(e, t, n) {}
            }, {
              key: "components",
              get: function() {
                return this._components;
              }
            }]), e;
          }();
      i.ExternalDeployAddress = "sandbox://external", i.InternalDeployAddress = "sandbox://internal", n["default"] = i, t.exports = n["default"];
    }, {}],
    12: [function(e, t, n) {
      "use strict";
      function o(e, t) {
        if (!(e instanceof t))
          throw new TypeError("Cannot call a class as a function");
      }
      Object.defineProperty(n, "__esModule", {value: !0});
      var r = function() {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var o = t[n];
            o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o);
          }
        }
        return function(t, n, o) {
          return n && e(t.prototype, n), o && e(t, o), t;
        };
      }(),
          i = function() {
            function e() {
              o(this, e);
            }
            return r(e, [{
              key: "addEventListener",
              value: function(e, t) {
                var n = this;
                n[e] = t;
              }
            }, {
              key: "trigger",
              value: function(e, t) {
                var n = this;
                n[e] && n[e](t);
              }
            }]), e;
          }();
      n["default"] = i, t.exports = n["default"];
    }, {}],
    13: [function(e, t, n) {
      "use strict";
      function o(e) {
        var t = /([a-zA-Z-]*)?:\/\/(?:\.)?([-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b)*(\/[\/\d\w\.-]*)*(?:[\?])*(.+)*/gi,
            n = "$1,$2,$3",
            o = e.replace(t, n).split(","),
            r = {
              type: o[0],
              domain: o[1],
              identity: o[2]
            };
        return r;
      }
      function r(e) {
        return JSON.parse(JSON.stringify(e));
      }
      Object.defineProperty(n, "__esModule", {value: !0}), n.divideURL = o, n.deepClone = r;
    }, {}]
  }, {}, [7])(7);
});

_removeDefine();
})();
(function() {
var _removeDefine = $__System.get("@@amd-helpers").createDefine();
define("3", ["23"], function(main) {
  return main;
});

_removeDefine();
})();
$__System.register('1', ['3', '22'], function (_export) {
    'use strict';

    var RuntimeUA, SandboxFactory, runtime;
    return {
        setters: [function (_) {
            RuntimeUA = _.RuntimeUA;
        }, function (_2) {
            SandboxFactory = _2['default'];
        }],
        execute: function () {
            runtime = new RuntimeUA(SandboxFactory);

            SandboxFactory.messageBus._onPostMessage = function (msg) {
                window.postMessage(msg);
            };

            window.addEventListener('message', function (event) {
                if (event.data.to === 'runtime:loadHyperty') {
                    runtime.loadHyperty(event.data.body.descriptor).then(function (msg) {
                        return self.postMessage(msg);
                    });
                } else if (event.data.to === 'runtime:loadStub') {
                    runtime.loadStub(event.data.body.domain).then(function (msg) {
                        return self.postMessage(msg);
                    });
                } else {
                    SandboxFactory.messageBus._onMessage(event.data);
                }
            }, false);
        }
    };
});
})
(function(factory) {
  factory();
});
//# sourceMappingURL=context-core.js.map