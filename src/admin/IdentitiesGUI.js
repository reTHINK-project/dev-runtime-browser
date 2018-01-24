// jshint browser:true, jquery: true
import React from 'react';
import ReactDOM from 'react-dom';
import IDPList from './components/IDPList';
import IdentityList from './components/IdentityList';
import DefaultIdentity from './components/DefaultIdentity';

// TODO refresh page when adding new identityInfo
// TODO change default identity?

class IdentitiesGUI {

  constructor(guiURL, idmURL, messageBus) {
    //if (!identityModule) throw Error('Identity Module not set!');
    if (!messageBus) throw Error('Message Bus not set!');
    let _this = this;
    _this._guiURL = guiURL;
    _this._idmURL = idmURL;
    _this._messageBus = messageBus;

    this.callIdentityModuleFunc('deployGUI', {}).then((result) => {
      return this._buildDrawer();
    }).then((result) => {
      console.log('READY:', result);
    });

    this.isLogged = false;

    // temporary drawer
    const drawerEl = document.querySelector('.mdc-temporary-drawer');
    const MDCTemporaryDrawer = mdc.drawer.MDCTemporaryDrawer;
    const drawer = new MDCTemporaryDrawer(drawerEl);

    this._drawerEl = drawerEl;
    this._drawer = drawer;

    // handle click events on settings button
    document.querySelector('.settings-btn').addEventListener('click', function() {
      drawer.open = true;
    });

    drawerEl.addEventListener('MDCTemporaryDrawer:open', () => {
      console.log('Received MDCTemporaryDrawer:open');
      console.log('1234');
      this._isDrawerOpen = true;
    });

    drawerEl.addEventListener('MDCTemporaryDrawer:close', () => {
      console.log('Received MDCTemporaryDrawer:close');
      this._isDrawerOpen = false;

      parent.postMessage({ body: { method: 'hideAdminPage' }, to: 'runtime:gui-manager' }, '*');
    });

  }

  _buildDrawer() {

    const guiURL = this._guiURL;

    this._messageBus.addListener(guiURL, msg => {

      const funcName = msg.body.method;

      if (msg.type !== 'response') {


        if (!this.isLogged) {

          const clickClose = new MouseEvent('click');
          document.querySelector('.settings-btn').dispatchEvent(clickClose);

        }

      }

      if (funcName === 'openPopup') {

        this.openPopup().then(() => {

          let urlreceived = msg.body.params.urlreceived;
          this.openPopup(urlreceived).then((returnedValue) => {
            let value = {type: 'execute', value: returnedValue, code: 200};
            let replyMsg = {id: msg.id, type: 'response', to: msg.from, from: msg.to, body: value};
            this._messageBus.postMessage(replyMsg);
          });

        });

        return;

      }

      const callback = (identityInfo) => {

        this.isLogged = true;

        this._buildMessage(msg, identityInfo);

      };

      this.callback = callback;

      this._getIdentities(callback);

    });

    this._getIdentities();
  }

  _buildMessage(msg, identityInfo) {
    let replyMsg;
    let value;

    const from = msg ? msg.from : this._guiURL;
    const to = msg ? msg.to : this._idmURL;

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

    replyMsg = {id: msg.id, type: 'response', to: from, from: to, body: value };

    this._messageBus.postMessage(replyMsg);
  }

  _getIdentities(callback) {

    return this.callIdentityModuleFunc('getIdentitiesToChoose', {}).then((resultObject) => {
      if (callback) {
        return Promise.all([this.showIdps(resultObject.idps, callback), this.showDefaultIdentity(resultObject.defaultIdentity), this.showIdentities(resultObject, callback)]);
      } else {
        return Promise.all([this.showIdps(resultObject.idps), this.showDefaultIdentity(resultObject.defaultIdentity), this.showIdentities(resultObject)]);
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

  callIdentityModuleFunc(methodName, parameters) {
    let _this = this;

    return new Promise((resolve, reject) => {
      const message = { type: 'execute', to: _this._idmURL, from: _this._guiURL,
      body: { resource: 'identity', method: methodName, params: parameters }};

      this._messageBus.postMessage(message, (res) => {
        let result = res.body.value;
        resolve(result);
      });

    });
  }

  openPopup(urlreceived) {

    return new Promise((resolve, reject) => {

      let win;
      if (!urlreceived) {
        win = window.open('', 'openIDrequest', 'location=1,status=1');
        this.win = win;
        resolve();
      } else {
        win = this.win;
        win.location.href = urlreceived;
      }

      // let win = window.open(urlreceived, 'openIDrequest', 'location=1,status=1,scrollbars=1');
      if (window.cordova) {
        win.addEventListener('loadstart', function(e) {
          let url = e.url;
          let code = /\&code=(.+)$/.exec(url);
          let error = /\&error=(.+)$/.exec(url);

          if (code || error) {
            win.close();
            return resolve(url);
          } else {
            return reject('openPopup error 1 - should not happen');
          }
        });
      } else {

        let pollTimer = setInterval(function() {
          try {
            if (win.closed) {
              clearInterval(pollTimer);
              // return reject('Some error occured when trying to get identity.');
            }

            if ((win.document.URL.indexOf('access_token') !== -1 || win.document.URL.indexOf('code') !== -1) && win.document.URL.indexOf(location.origin) !== -1) {
              window.clearInterval(pollTimer);
              let url =   win.document.URL;

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

  _checkReceivedInfo(receivedInfo) {
    let _this = this;
    return new Promise((resolve, reject) => {

      let identityInfo;
      let toRemoveID;

      if (receivedInfo) {
        identityInfo = receivedInfo;
        toRemoveID = false;
        resolve({identityInfo: identityInfo, toRemoveID: toRemoveID});
      } else {
        toRemoveID = true;
        _this.callIdentityModuleFunc('getIdentitiesToChoose', {}).then((result) => {
          resolve({identityInfo: result, toRemoveID: toRemoveID});
        });
      }
    });
  }

  // show identity providers (fb, google, etc)
  showIdps(idps) {

    console.log('[IdentitiesGUI.showIdps] : ', idps);

    ReactDOM.render(<IDPList idps={idps}
      login={(idp) => this.loginWithIDP(idp)}
      callback={(idp) => this.callback(idp)}
    />,
    document.getElementById('idps-list'));
  }

  showDefaultIdentity(identity) {

    if (identity) {

      this.isLogged = true;

      ReactDOM.render(<DefaultIdentity identity={identity} />,
      document.querySelector('.mdc-list--avatar-list'));

    }

  }

  // show current user Identities
  // i.e. IdPs where he is registered
  showIdentities(iDs, callback) {

    return new Promise((resolve, reject) => {

      console.log('[IdentitiesGUI.showMyIdentities] : ', iDs.identities, iDs.defaultIdentity);

      const identities = iDs.identities;
      const current = iDs.defaultIdentity ? iDs.defaultIdentity.userURL : '';

      ReactDOM.render(<IdentityList identities={identities}
        callback={(idp) => this.callback(idp)}
        current={current}
      />,
      document.getElementById('active-identities'));


      if (identities.length === 1) {

        if (callback) {
          callback({type: 'identity', value: current});
        }

        return resolve({type: 'identity', value: current});
      }

      if (identities.length > 1) {
        this._drawer.open = true;
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

  removeID(event, emails) {
    let _this = this;
    let row = event.target.parentNode.parentNode;
    let idToRemove = row.children[0].textContent;
    let domain = row.children[1].textContent;

    _this.callIdentityModuleFunc('unregisterIdentity', { email: idToRemove }).then(() => {
      let numEmails = emails.length;
      for (let i = 0; i < numEmails; i++) {
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

  loginWithIDP(idp) {

    idp = arguments[0]

    console.log("Logging in with " + idp)

    let _publicKey;


    return this.openPopup()
    .then((result) => {
      return this.callIdentityModuleFunc('getMyPublicKey', {});
    }).then((publicKey) => {
      _publicKey = publicKey;
      const data = { contents: publicKey, origin: 'origin', usernameHint: undefined, idpDomain: idp };
      return this.callIdentityModuleFunc('sendGenerateMessage', data);
    })
    .then((value) => {
      console.log('[IdentitiesGUI.obtainNewIdentity] receivedURL from idp Proxy: ' + value.loginUrl.substring(0, 20) + '...');

      let url = value.loginUrl;
      let finalURL;

      //check if the receivedURL contains the redirect field and replace it
      if (url.indexOf('redirect_uri') !== -1) {
        let firstPart = url.substring(0, url.indexOf('redirect_uri'));
        let secondAuxPart = url.substring(url.indexOf('redirect_uri'), url.length);

        let secondPart = secondAuxPart.substring(secondAuxPart.indexOf('&'), url.length);

        //check if the reddirect field is the last field of the URL
        if (secondPart.indexOf('&') !== -1) {
          finalURL = firstPart + 'redirect_uri=' + location.origin + secondPart;
        } else {
          finalURL = firstPart + 'redirect_uri=' + location.origin;
        }
      }

      this.resultURL = finalURL || url;

      console.log('[IdentitiesGUI.openPopup]', this.resultURL);
      return this.openPopup(this.resultURL);
    }).then((identity) => {

      console.log('[IdentitiesGUI.openPopup.result]', identity);

      const data = { contents: _publicKey, origin: 'origin', usernameHint: identity, idpDomain: idp };
      return this.callIdentityModuleFunc('sendGenerateMessage', data);
    }).then((result) => {

      console.log('[IdentitiesGUI.sendGenerateMessage.result]', result);
      return this.callIdentityModuleFunc('addAssertion', result);
    }).then((value) => {

      this._drawer.open = false;
      const userURL = {type: 'identity', value: value.userProfile.userURL};

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

  _getList(items) {
    let list = '';
    let numItems = items.length;

    for (let i = 0; i < numItems; i++) {
      list += '<li class="divider"></li>';
      list += '<li><a class="center-align">' + items[i] + '</a></li>';
    }

    return list;
  }

  _authenticateUser(publicKey, value, origin, idProvider) {
    let _this = this;
    let url = _this.resultURL;

    return new Promise((resolve, reject) => {

      _this.openPopup(url).then((identity) => {

        _this.callIdentityModuleFunc('sendGenerateMessage',
        { contents: publicKey, origin: origin, usernameHint: identity, idpDomain: idProvider }).then((result) => {

          if (result) {

            //_this.identityModule.storeIdentity(result, keyPair).then((value) => {
            _this.callIdentityModuleFunc('addAssertion', result).then((value) => {
              resolve(value.userProfile.userURL);
            }, (err) => {
              reject(err);
            });

          } else {
            reject('error on obtaining identity information');
          }

        });
      }, (err) => {
        reject(err);
      });
    });
  }

  _resetIdentities() {
    console.log('_resetIdentities');
  }


}

export default IdentitiesGUI;
