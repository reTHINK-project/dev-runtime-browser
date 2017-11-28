(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.identitiesGui = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// jshint browser:true, jquery: true

var IdentitiesGUI = function () {
  function IdentitiesGUI(guiURL, idmURL, messageBus) {
    _classCallCheck(this, IdentitiesGUI);

    //if (!identityModule) throw Error('Identity Module not set!');
    if (!messageBus) throw Error('Message Bus not set!');
    var _this = this;
    _this._guiURL = guiURL;
    _this._idmURL = idmURL;
    _this._messageBus = messageBus;

    _this.callIdentityModuleFunc('deployGUI', {}).then(function () {
      _this.resultURL = undefined;

      _this._messageBus.addListener(guiURL, function (msg) {
        var identityInfo = msg.body.value;
        var funcName = msg.body.method;
        var value = void 0;

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
        document.getElementsByTagName('body')[0].style = 'background-color:white;';
        parent.postMessage({ body: { method: 'showAdminPage' }, to: 'runtime:gui-manager' }, '*');
        $('.admin-page').removeClass('hide');
        _this.showIdentitiesGUI(msg.body.value).then(function (identityInfo) {
          var replyMsg = void 0;

          //hide config page with the identity GUI
          parent.postMessage({ body: { method: 'hideAdminPage' }, to: 'runtime:gui-manager' }, '*');
          $('.admin-page').addClass('hide');
          document.getElementsByTagName('body')[0].style = 'background-color:transparent';
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
      });

      $('.identities-page-show').on('click', function () {
        //TODO call a IdM method that requests the identities
        _this.showIdentitiesGUI();
      });
    });
  }

  _createClass(IdentitiesGUI, [{
    key: 'callIdentityModuleFunc',
    value: function callIdentityModuleFunc(methodName, parameters) {
      var _this = this;
      var message = void 0;

      return new Promise(function (resolve, reject) {
        message = { type: 'execute', to: _this._idmURL, from: _this._guiURL,
          body: { resource: 'identity', method: methodName, params: parameters } };
        _this._messageBus.postMessage(message, function (res) {
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
              resolve(url);
            }
          });
        } else {
          var pollTimer = setInterval(function () {
            try {
              if (win.closed) {
                reject('Some error occured when trying to get identity.');
                clearInterval(pollTimer);
              }

              if (win.document.URL.indexOf('id_token') !== -1 || win.document.URL.indexOf(location.origin) !== -1) {
                window.clearInterval(pollTimer);
                var url = win.document.URL;

                win.close();
                resolve(url);
              }
            } catch (e) {
              //console.log(e);
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

        var identityInfo = void 0;
        var toRemoveID = void 0;

        _this._checkReceivedInfo(receivedInfo).then(function (resultObject) {
          identityInfo = resultObject.identityInfo;
          toRemoveID = resultObject.toRemoveID;

          $('.policies-section').addClass('hide');
          $('.identities-section').removeClass('hide');

          _this.showMyIdentities(identityInfo.identities, toRemoveID).then(function (identity) {
            console.log('chosen identity: ', identity);
            resolve({ type: 'identity', value: identity });
          });

          var callback = function callback(value) {
            console.log('chosen identity: ', value);
            resolve({ type: 'identity', value: value });
          };

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
    key: 'showMyIdentities',
    value: function showMyIdentities(emails, toRemoveID) {
      var _this = this;

      return new Promise(function (resolve, reject) {

        // let identities = _this.identityModule.getIdentities();
        var identities = [];

        for (var i in emails) {
          var domain = emails[i].split('@');
          identities.push({ email: emails[i], domain: domain[1] });
        }

        var myIdentities = document.getElementById('my-ids');
        myIdentities.innerHTML = '';

        var table = _this.createTable();

        var tbody = document.createElement('tbody');
        var numIdentities = identities.length;
        for (var _i = 0; _i < numIdentities; _i++) {
          var tr = _this.createTableRow(identities[_i], toRemoveID);
          tbody.appendChild(tr);
        }

        table.appendChild(tbody);
        myIdentities.appendChild(table);

        var callback = function callback(identity) {
          resolve(identity);
        };

        if (!toRemoveID) {
          $('.clickable-cell').on('click', function (event) {
            return _this.changeID(event, callback);
          });
        }

        $('.remove-id').on('click', function (event) {
          return _this.removeID(emails);
        });
      });
    }
  }, {
    key: 'createTable',
    value: function createTable() {
      var table = document.createElement('table');
      table.className = 'centered';
      var thead = document.createElement('thead');
      var tr = document.createElement('tr');
      var thEmail = document.createElement('th');
      thEmail.textContent = 'Email';
      tr.appendChild(thEmail);
      thead.appendChild(tr);
      table.appendChild(thead);
      return table;
    }
  }, {
    key: 'createTableRow',
    value: function createTableRow(identity, toRemoveID) {
      var tr = document.createElement('tr');

      var td = document.createElement('td');
      td.textContent = identity.email;
      td.className = 'clickable-cell';
      td.style = 'cursor: pointer';
      tr.appendChild(td);

      td = document.createElement('td');

      if (toRemoveID) {
        var btn = document.createElement('button');
        btn.textContent = 'Remove';
        btn.className = 'remove-id waves-effect waves-light btn';
        td.appendChild(btn);
      }

      tr.appendChild(td);

      return tr;
    }
  }, {
    key: 'changeID',
    value: function changeID(event, callback) {
      var _this = this;

      var idToUse = event.target.innerText;

      //TODO improve later.
      //prevents when the users selects an hyperty, exit the identity page and
      //goes again to the identity page, from selecting "settings" button as identity.
      if (idToUse !== 'settings') {

        callback(idToUse);
        return idToUse;
      }
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
    key: 'obtainNewIdentity',
    value: function obtainNewIdentity(event, callback, toRemoveID) {
      var _this = this;
      var idProvider = event.target.textContent;
      var idProvider2 = event.target.text;

      _this.callIdentityModuleFunc('generateRSAKeyPair', {}).then(function (keyPair) {
        var publicKey = btoa(keyPair.public);

        _this.callIdentityModuleFunc('sendGenerateMessage', { contents: publicKey, origin: 'origin', usernameHint: undefined,
          idpDomain: idProvider }).then(function (value) {
          console.log('receivedURL: ' + value.loginUrl.substring(0, 20) + '...');

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
            _this._authenticateUser(keyPair, publicKey, value, 'origin', idProvider).then(function (email) {
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
    value: function _authenticateUser(keyPair, publicKey, value, origin, idProvider) {
      var _this = this;
      var url = _this.resultURL;

      return new Promise(function (resolve, reject) {

        _this.openPopup(url).then(function (identity) {

          _this.callIdentityModuleFunc('sendGenerateMessage', { contents: publicKey, origin: origin, usernameHint: identity, idpDomain: idProvider }).then(function (result) {

            if (result) {

              //_this.identityModule.storeIdentity(result, keyPair).then((value) => {
              _this.callIdentityModuleFunc('storeIdentity', { result: result, keyPair: keyPair }).then(function (value) {
                resolve(value.userProfile.username);
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
