(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.identitiesGui = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

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

    var drawerEl = document.querySelector('.mdc-temporary-drawer');
    var MDCTemporaryDrawer = mdc.drawer.MDCTemporaryDrawer;
    var drawer = new MDCTemporaryDrawer(drawerEl);

    this._drawerEl = drawerEl;

    document.querySelector('.settings-btn').addEventListener('click', function () {
      drawer.open = true;
    });

    drawerEl.addEventListener('MDCTemporaryDrawer:open', function () {
      console.log('Received MDCTemporaryDrawer:open');

      _this2._openDrawer();
    });

    drawerEl.addEventListener('MDCTemporaryDrawer:close', function () {
      console.log('Received MDCTemporaryDrawer:close');

      parent.postMessage({ body: { method: 'hideAdminPage' }, to: 'runtime:gui-manager' }, '*');
    });
  }

  _createClass(IdentitiesGUI, [{
    key: '_openDrawer',
    value: function _openDrawer() {

      var _this = this;
      var guiURL = _this._guiURL;

      _this.showIdentitiesGUI(msg.body.value).then(function (identityInfo) {
        var replyMsg = void 0;
        console.log('[IdentitiesGUI] identityInfo from GUI: ', identityInfo);

        //hide config page with the identity GUI
        parent.postMessage({ body: { method: 'hideAdminPage' }, to: 'runtime:gui-manager' }, '*');
        $('.admin-page').addClass('hide');

        // document.getElementsByTagName('body')[0].style = 'background-color:transparent';
        $('.identities-section').addClass('hide');
        $('.policies-section').addClass('hide');

        switch (identityInfo.type) {
          case 'idp':
            value = { type: 'idp', value: identityInfo.value, code: 200 };
            replyMsg = { id: msg.id, type: 'response', to: msg.from, from: msg.to, body: value };
            _this._messageBus.postMessage(replyMsg);
            break;

          case 'identity':
            value = { type: 'identity', value: identityInfo.value, code: 200 };
            replyMsg = { id: msg.id, type: 'response', to: msg.from, from: msg.to, body: value };
            _this._messageBus.postMessage(replyMsg);
            break;

          default:
            value = { type: 'error', value: 'Error on identity GUI', code: 400 };
            replyMsg = { id: msg.id, type: 'response', to: msg.from, from: msg.to, body: value };
            _this._messageBus.postMessage(replyMsg);
        }
      });

      _this.callIdentityModuleFunc('deployGUI', {}).then(function () {
        _this.resultURL = undefined;

        _this._messageBus.addListener(guiURL, function (msg) {

          var identityInfo = msg.body.value;
          var funcName = msg.body.method;
          var value = void 0;
          console.log('[IdentitiesGUI] received msg: ', msg);

          if (funcName === 'openPopup') {
            var urlreceived = msg.body.params.urlreceived;
            _this.openPopup(urlreceived).then(function (returnedValue) {
              var value = { type: 'execute', value: returnedValue, code: 200 };
              var replyMsg = { id: msg.id, type: 'response', to: msg.from, from: msg.to, body: value };
              _this._messageBus.postMessage(replyMsg);
            });
            return; // this avoids getting stuck in the identities page
          }

          // unhide the config page with the identity GUI
          // document.getElementsByTagName('body')[0].style = 'background-color:white;';
          parent.postMessage({ body: { method: 'showAdminPage' }, to: 'runtime:gui-manager' }, '*');

          var clickOpen = new MouseEvent('click');
          document.querySelector('.settings-btn').dispatchEvent(clickOpen);

          $('.admin-page').removeClass('hide');
        });
      });
    }
  }, {
    key: 'callIdentityModuleFunc',
    value: function callIdentityModuleFunc(methodName, parameters) {
      var _this3 = this;

      var _this = this;

      return new Promise(function (resolve, reject) {
        var message = { type: 'execute', to: _this._idmURL, from: _this._guiURL,
          body: { resource: 'identity', method: methodName, params: parameters } };

        _this3._messageBus.postMessage(message, function (res) {
          var result = res.body.value;
          resolve(result);
        });
      });
    }
  }, {
    key: 'openPopup',
    value: function openPopup(urlreceived) {

      return new Promise(function (resolve, reject) {

        var win = window.open(urlreceived, 'openIDrequest', 'width=800, height=600');
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
                return reject('Some error occured when trying to get identity.');
              }

              if ((win.document.URL.indexOf('access_token') !== -1 || win.document.URL.indexOf('code') !== -1) && win.document.URL.indexOf(location.origin) !== -1) {
                window.clearInterval(pollTimer);
                var url = win.document.URL;

                win.close();
                return resolve(url);
              }
            } catch (e) {
              //return reject('openPopup error 2 - should not happen');
              console.log(e);
            }
          }, 500);
        }
      });
    }
  }, {
    key: 'showIdentitiesGUI',
    value: function showIdentitiesGUI(receivedInfo) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        console.log('[IdentitiesGUI.showIdentitiesGUI] receivedInfo: ', receivedInfo);

        var identityInfo = void 0;
        var toRemoveID = void 0;

        var callback = function callback(value) {
          console.log('chosen identity: ', value);

          var clickClose = new MouseEvent('click');
          document.querySelector('.settings-btn').dispatchEvent(clickClose);

          resolve({ type: 'identity', value: value });
        };

        _this._checkReceivedInfo(receivedInfo).then(function (resultObject) {
          identityInfo = resultObject.identityInfo;
          toRemoveID = resultObject.toRemoveID;

          $('.policies-section').addClass('hide');
          $('.identities-section').removeClass('hide');

          _this.showIdps(receivedInfo.idps, callback);

          _this.showMyIdentities(identityInfo.identities, toRemoveID).then(function (identity) {
            console.log('chosen identity: ', identity);
            resolve({ type: 'identity', value: identity });
          });

          var idps = [];
          var idpsObjects = identityInfo.idps;

          idpsObjects.forEach(function (entry) {
            if (entry.type && entry.type == 'idToken') {
              idps.push(entry.domain);
            }
          });

          $('#idproviders').html(_this._getList(idps));
          $('#idproviders').off();
          $('#idproviders').on('click', function (event) {
            return _this.obtainNewIdentity(event, callback, toRemoveID);
          });
          //$('.back').on('click', (event) => _this.goHome());
          $('.identities-reset').off();
          $('.identities-reset').on('click', function (event) {
            return _this._resetIdentities(callback);
          });
        });
      });
    }
  }, {
    key: '_checkReceivedInfo',
    value: function _checkReceivedInfo(receivedInfo) {
      var _this = this;
      return new Promise(function (resolve, reject) {
        var identityInfo = void 0,
            toRemoveID = void 0;
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
    value: function showIdps(idps, callback) {
      var _this4 = this;

      var idpsList = document.getElementById('idps-list');

      idps.forEach(function (key) {

        var linkEl = document.createElement('a');
        linkEl.setAttribute('data-idp', key.domain);
        linkEl.classList = 'mdc-list-item';
        linkEl.href = '#';

        linkEl.addEventListener('click', function (event) {

          event.preventDefault();

          var el = event.currentTarget;
          var idp = el.getAttribute('data-idp');

          _this4.loginWithIDP(idp, callback);
        });

        var linkElText = document.createTextNode(key.domain);

        var iconEl = document.createElement('i');
        iconEl.classList = 'material-icons mdc-list-item__start-detail';
        iconEl.setAttribute('aria-hidden', true);
        iconEl.textContent = 'inbox';

        linkEl.appendChild(iconEl);
        linkEl.appendChild(linkElText);

        idpsList.appendChild(linkEl);
      });
    }
  }, {
    key: 'showMyIdentities',
    value: function showMyIdentities(iDs, toRemoveID) {
      var _this = this;

      // TODO: iDs should be replaced by user urls

      return new Promise(function (resolve, reject) {

        console.log('[IdentitiesGUI.showMyIdentities] : ', iDs);

        var identities = [];

        for (var i in iDs) {
          var split1 = iDs[i].split('://');

          var identifier = split1[1].split('/')[1];
          var domain = iDs[i].replace('/' + identifier, '');
          identities.push({ userURL: iDs[i], domain: domain });
        }

        var activeIdentities = document.getElementById('active-identities');

        identities.forEach(function (key) {

          var linkEl = document.createElement('a');
          linkEl.classList = 'mdc-list-item';
          linkEl.href = '#';

          var linkElText = document.createTextNode(key.userURL);

          var iconEl = document.createElement('i');
          iconEl.classList = 'material-icons mdc-list-item__start-detail';
          iconEl.setAttribute('aria-hidden', true);
          iconEl.textContent = 'inbox';

          linkEl.appendChild(iconEl);
          linkEl.appendChild(linkElText);

          activeIdentities.appendChild(linkEl);
        });

        if (identities.length === 1) {
          return resolve(identities[0].userURL);
        }

        if (identities.length > 1) {
          var clickOpen = new MouseEvent('click');
          document.querySelector('.settings-btn').dispatchEvent(clickOpen);
        }

        var callback = function callback(identity) {
          resolve(identity);
        };

        if (!toRemoveID) {
          $('.clickable-cell').on('click', function (event) {
            return _this.changeID(event, callback);
          });
        }

        $('.remove-id').on('click', function (event) {
          return _this.removeID(iDs);
        });
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
        _this.showMyIdentities(emails, true);
      });

      //_this.identityModule.unregisterIdentity(idToRemove);
    }
  }, {
    key: 'loginWithIDP',
    value: function loginWithIDP(idProvider, callback) {
      var _this5 = this;

      console.log(idProvider);

      var _publicKey = void 0;
      this.callIdentityModuleFunc('getMyPublicKey', {}).then(function (publicKey) {
        _publicKey = publicKey;
        var data = { contents: publicKey, origin: 'origin', usernameHint: undefined, idpDomain: idProvider };
        return _this5.callIdentityModuleFunc('sendGenerateMessage', data);
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

        _this5.resultURL = finalURL || url;

        console.log('AQUI:', _this5.resultURL);

        return _this5._authenticateUser(_publicKey, value, 'origin', idProvider);
      }).then(function (email) {
        console.log('AQUI:', email);
        callback(email);
      });
    }
  }, {
    key: 'obtainNewIdentity',
    value: function obtainNewIdentity(event, callback, toRemoveID) {
      var _this = this;
      var idProvider = event.target.textContent;
      var idProvider2 = event.target.text;

      _this.callIdentityModuleFunc('getMyPublicKey', {}).then(function (publicKey) {
        //      let publicKey = btoa(keyPair.public);

        _this.callIdentityModuleFunc('sendGenerateMessage', { contents: publicKey, origin: 'origin', usernameHint: undefined,
          idpDomain: idProvider }).then(function (value) {
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

          _this.resultURL = finalURL || url;

          $('.login-idp').html('<p>Chosen IDP: ' + idProvider + '</p>');
          $('.login').removeClass('hide');
          $('.login-btn').off();
          $('.login-btn').on('click', function (event) {
            $('.login').addClass('hide');
            _this._authenticateUser(publicKey, value, 'origin', idProvider).then(function (email) {
              callback(email);
              _this.showIdentitiesGUI();
            });
          });
        });
      }).catch(function (err) {
        return console.log('obtanin new identity', err);
      });
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

},{"events":1}]},{},[2])(2)
});

//# sourceMappingURL=identities-gui.js.map
