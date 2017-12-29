import { EventEmitter } from "events";

// jshint browser:true, jquery: true

class IdentitiesGUI {

  constructor(guiURL, idmURL, messageBus) {
    //if (!identityModule) throw Error('Identity Module not set!');
    if (!messageBus) throw Error('Message Bus not set!');
    let _this = this;
    _this._guiURL = guiURL;
    _this._idmURL = idmURL;
    _this._messageBus = messageBus;

    const drawerEl = document.querySelector('.mdc-temporary-drawer');
    const MDCTemporaryDrawer = mdc.drawer.MDCTemporaryDrawer;
    const drawer = new MDCTemporaryDrawer(drawerEl);

    this._drawerEl = drawerEl;

    document.querySelector('.settings-btn').addEventListener('click', function() {
      drawer.open = true;
    });

    drawerEl.addEventListener('MDCTemporaryDrawer:open', () => {
      console.log('Received MDCTemporaryDrawer:open');

      this._openDrawer();
    });

    drawerEl.addEventListener('MDCTemporaryDrawer:close', () => {
      console.log('Received MDCTemporaryDrawer:close');

      parent.postMessage({ body: { method: 'hideAdminPage' }, to: 'runtime:gui-manager' }, '*');

    });

  }

  _openDrawer() {

    let _this = this;
    const guiURL = _this._guiURL;


    _this.showIdentitiesGUI(msg.body.value).then((identityInfo) => {
      let replyMsg;
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

    _this.callIdentityModuleFunc('deployGUI', {}).then(() => {
      _this.resultURL  = undefined;

      _this._messageBus.addListener(guiURL, msg => {

        let identityInfo = msg.body.value;
        let funcName = msg.body.method;
        let value;
        console.log('[IdentitiesGUI] received msg: ', msg);

        if (funcName === 'openPopup') {
          let urlreceived = msg.body.params.urlreceived;
          _this.openPopup(urlreceived).then((returnedValue) => {
            let value = {type: 'execute', value: returnedValue, code: 200};
            let replyMsg = {id: msg.id, type: 'response', to: msg.from, from: msg.to, body: value};
            _this._messageBus.postMessage(replyMsg);
          });
          return; // this avoids getting stuck in the identities page
        }

        // unhide the config page with the identity GUI
        // document.getElementsByTagName('body')[0].style = 'background-color:white;';
        parent.postMessage({ body: { method: 'showAdminPage' }, to: 'runtime:gui-manager' }, '*');

        const clickOpen = new MouseEvent('click');
        document.querySelector('.settings-btn').dispatchEvent(clickOpen);

        $('.admin-page').removeClass('hide');

      });

    });

  }

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

      let win = window.open(urlreceived, 'openIDrequest', 'width=800, height=600');
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
              return reject('Some error occured when trying to get identity.');
            }

            if ((win.document.URL.indexOf('access_token') !== -1 || win.document.URL.indexOf('code') !== -1) && win.document.URL.indexOf(location.origin) !== -1) {
              window.clearInterval(pollTimer);
              let url =   win.document.URL;

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

  showIdentitiesGUI(receivedInfo) {
    let _this = this;

    return new Promise((resolve, reject) => {
      console.log('[IdentitiesGUI.showIdentitiesGUI] receivedInfo: ', receivedInfo);

      let identityInfo;
      let toRemoveID;

      let callback = (value) => {
        console.log('chosen identity: ', value);

        const clickClose = new MouseEvent('click');
        document.querySelector('.settings-btn').dispatchEvent(clickClose);

        resolve({type: 'identity', value: value});
      };

      _this._checkReceivedInfo(receivedInfo).then((resultObject) => {
        identityInfo = resultObject.identityInfo;
        toRemoveID = resultObject.toRemoveID;

        $('.policies-section').addClass('hide');
        $('.identities-section').removeClass('hide');

        _this.showIdps(receivedInfo.idps, callback);

        _this.showMyIdentities(identityInfo.identities, toRemoveID).then((identity) => {
          console.log('chosen identity: ', identity);
          resolve({type: 'identity', value: identity});
        });

        let idps = [];
        let idpsObjects = identityInfo.idps;

        idpsObjects.forEach(function(entry) {
          if(entry.type && entry.type == 'idToken') {
            idps.push(entry.domain);
          }
        });

        $('#idproviders').html(_this._getList(idps));
        $('#idproviders').off();
        $('#idproviders').on('click', (event) => _this.obtainNewIdentity(event, callback, toRemoveID));
        //$('.back').on('click', (event) => _this.goHome());
        $('.identities-reset').off();
        $('.identities-reset').on('click', (event) => _this._resetIdentities(callback));
      });
    });
  }

  _checkReceivedInfo(receivedInfo) {
    let _this = this;
    return new Promise((resolve, reject) => {
      let identityInfo, toRemoveID;
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

  showIdps(idps, callback) {

    let idpsList = document.getElementById('idps-list');

    idps.forEach((key) => {

      const linkEl = document.createElement('a');
      linkEl.setAttribute('data-idp', key.domain);
      linkEl.classList = 'mdc-list-item';
      linkEl.href = '#';

      linkEl.addEventListener('click', (event) => {

        event.preventDefault();

        const el = event.currentTarget;
        const idp = el.getAttribute('data-idp');

        this.loginWithIDP(idp, callback);

      });

      const linkElText = document.createTextNode(key.domain);

      const iconEl = document.createElement('i');
      iconEl.classList = 'material-icons mdc-list-item__start-detail';
      iconEl.setAttribute('aria-hidden', true);
      iconEl.textContent = 'inbox';

      linkEl.appendChild(iconEl);
      linkEl.appendChild(linkElText);

      idpsList.appendChild(linkEl);
    });

  }

  showMyIdentities(iDs, toRemoveID) {
    let _this = this;

    // TODO: iDs should be replaced by user urls

    return new Promise((resolve, reject) => {

      console.log('[IdentitiesGUI.showMyIdentities] : ', iDs);

      let identities = [];

      for (let i in iDs) {
        let split1 = iDs[i].split('://');

        let identifier = split1[1].split('/')[1];
        let domain = iDs[i].replace('/' + identifier, '');
        identities.push({ userURL: iDs[i], domain: domain });
      }

      let activeIdentities = document.getElementById('active-identities');

      identities.forEach((key) => {

        const linkEl = document.createElement('a');
        linkEl.classList = 'mdc-list-item';
        linkEl.href = '#';

        const linkElText = document.createTextNode(key.userURL);

        const iconEl = document.createElement('i');
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
        const clickOpen = new MouseEvent('click');
        document.querySelector('.settings-btn').dispatchEvent(clickOpen);
      }

      let callback = (identity) => {
        resolve(identity);
      };

      if (!toRemoveID) {
        $('.clickable-cell').on('click', (event) => _this.changeID(event, callback));
      }

      $('.remove-id').on('click', (event) => _this.removeID(iDs));

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
      _this.showMyIdentities(emails, true);
    });

    //_this.identityModule.unregisterIdentity(idToRemove);

  }

  loginWithIDP(idProvider, callback) {

    console.log(idProvider);

    let _publicKey;
    this.callIdentityModuleFunc('getMyPublicKey', {})
      .then((publicKey) => {
        _publicKey = publicKey;
        const data = { contents: publicKey, origin: 'origin', usernameHint: undefined, idpDomain: idProvider };
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

        console.log('AQUI:', this.resultURL);

        return this._authenticateUser(_publicKey, value, 'origin', idProvider);
      }).then((email) => {
        console.log('AQUI:', email);
        callback(email);
      });

  }

  obtainNewIdentity(event, callback, toRemoveID) {
    let _this = this;
    let idProvider = event.target.textContent;
    let idProvider2 = event.target.text;

    _this.callIdentityModuleFunc('getMyPublicKey', {}).then((publicKey) => {
//      let publicKey = btoa(keyPair.public);

      _this.callIdentityModuleFunc('sendGenerateMessage',
        { contents: publicKey, origin: 'origin', usernameHint: undefined,
        idpDomain: idProvider, }).then((value) => {
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

        _this.resultURL = finalURL || url;

        $('.login-idp').html('<p>Chosen IDP: ' + idProvider + '</p>');
        $('.login').removeClass('hide');
        $('.login-btn').off();
        $('.login-btn').on('click', (event) => {
          $('.login').addClass('hide');
          _this._authenticateUser(publicKey, value, 'origin', idProvider).then((email) => {
            callback(email);
            _this.showIdentitiesGUI();
          });
        });
      });
    }).catch(err => console.log('obtanin new identity', err));

  }

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
