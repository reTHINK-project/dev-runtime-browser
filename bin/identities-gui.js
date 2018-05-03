(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.identitiesGui = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
        // const userIdentity = {type: 'identity', value: value.userProfile};

        console.log('[IdentitiesGUI.loginWithIDP final]', value);
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

},{}]},{},[1])(1)
});

//# sourceMappingURL=identities-gui.js.map
