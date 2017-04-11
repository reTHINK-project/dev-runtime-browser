// jshint browser:true, jquery: true

class IdentitiesGUI {

  constructor(guiURL, idmURL, messageBus) {
    //if (!identityModule) throw Error('Identity Module not set!');
    if (!messageBus) throw Error('Message Bus not set!');
    let _this = this;
    _this._guiURL = guiURL;
    _this._idmURL = idmURL;
    _this._messageBus = messageBus;

    //console.log('TIAGO: Calling deployGUI');
    //_this.identityModule.deployGUI();
    _this.callIdentityModuleFunc('deployGUI', {}).then(() => {
      _this.resultURL  = undefined;

      _this._messageBus.addListener(guiURL, msg => {
        let identityInfo = msg.body.value;
        let funcName = msg.body.method;
        let value;

        if (funcName === 'openPopup') {
          let urlreceived = msg.body.params.urlreceived;
          //console.log('TIAGO openPopup on browser');
          _this.openPopup(urlreceived).then((returnedValue) => {
            let value = {type: 'execute', value: returnedValue, code: 200};
            let replyMsg = {id: msg.id, type: 'response', to: msg.from, from: msg.to, body: value};
            _this._messageBus.postMessage(replyMsg);
          });
        }

        // unhide the config page with the identity GUI
        document.getElementsByTagName('body')[0].style = 'background-color:white;';
        parent.postMessage({ body: { method: 'showAdminPage' }, to: 'runtime:gui-manager' }, '*');
        $('.admin-page').removeClass('hide');
        _this.showIdentitiesGUI(msg.body.value).then((identityInfo) => {
          let replyMsg;

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

  callIdentityModuleFunc(methodName, parameters) {
    let _this = this;
    let message;

    return new Promise((resolve, reject) => {
      message = { type: 'execute', to: _this._idmURL, from: _this._guiURL,
        body: { resource: 'identity', method: methodName, params: parameters }, };
      _this._messageBus.postMessage(message, (res) => {
        let result = res.body.value;

        //console.log('TIAGO: return from callIdentityModuleFunc ', result);
        resolve(result);
      });
    });
  }

  openPopup(urlreceived) {

    //console.log('TIAGO openPopup local browser');

    return new Promise((resolve, reject) => {

      let win = window.open(urlreceived, 'openIDrequest', 'width=800, height=600');
      if (window.cordova) {
        win.addEventListener('loadstart', function(e) {
          let url = e.url;
          let code = /\&code=(.+)$/.exec(url);
          let error = /\&error=(.+)$/.exec(url);

          if (code || error) {
            win.close();
            resolve(url);
          }
        });
      } else {
        let pollTimer = setInterval(function() {
          try {
            if (win.closed) {
              reject('Some error occured when trying to get identity.');
              clearInterval(pollTimer);
            }

            if (win.document.URL.indexOf('id_token') !== -1 || win.document.URL.indexOf(location.origin) !== -1) {
              window.clearInterval(pollTimer);
              let url =   win.document.URL;

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

  showIdentitiesGUI(receivedInfo) {
    let _this = this;

    return new Promise((resolve, reject) => {

      let identityInfo;
      let toRemoveID;

      _this._checkReceivedInfo(receivedInfo).then((resultObject) => {
        identityInfo = resultObject.identityInfo;
        toRemoveID = resultObject.toRemoveID;

        $('.policies-section').addClass('hide');
        $('.identities-section').removeClass('hide');

        _this.showMyIdentities(identityInfo.identities, toRemoveID).then((identity) => {
          console.log('chosen identity: ', identity);
          resolve({type: 'identity', value: identity});
        });

        let callback = (value) => {
          console.log('chosen identity: ', value);
          resolve({type: 'identity', value: value});
        };

        let idps = [];
        let idpsObjects = identityInfo.idps;

        idpsObjects.forEach(function(entry) {
          idps.push(entry.domain);
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
        resolve({identityInfo: identityInfo, toRemoveID:toRemoveID});
      } else {
        toRemoveID = true;
        _this.callIdentityModuleFunc('getIdentitiesToChoose', {}).then((result) => {
          resolve({identityInfo: result, toRemoveID: toRemoveID});
        });
      }
    });
  }

  showMyIdentities(emails, toRemoveID) {
    let _this = this;

    return new Promise((resolve, reject) => {

      // let identities = _this.identityModule.getIdentities();
      let identities = [];

      for (let i in emails) {
        let domain = emails[i].split('@');
        identities.push({ email: emails[i], domain: domain[1] });
      }

      let myIdentities = document.getElementById('my-ids');
      myIdentities.innerHTML = '';

      let table = _this.createTable();

      let tbody = document.createElement('tbody');
      let numIdentities = identities.length;
      for (let i = 0; i < numIdentities; i++) {
        let tr = _this.createTableRow(identities[i], toRemoveID);
        tbody.appendChild(tr);
      }

      table.appendChild(tbody);
      myIdentities.appendChild(table);

      let callback = (identity) => {
        resolve(identity);
      };

      if (!toRemoveID) {
        $('.clickable-cell').on('click', (event) => _this.changeID(callback));
      }

      $('.remove-id').on('click', (event) => _this.removeID(emails));

    });
  }

  createTable() {
    let table = document.createElement('table');
    table.className = 'centered';
    let thead = document.createElement('thead');
    let tr = document.createElement('tr');
    let thEmail = document.createElement('th');
    thEmail.textContent = 'Email';
    tr.appendChild(thEmail);
    thead.appendChild(tr);
    table.appendChild(thead);
    return table;
  }

  createTableRow(identity, toRemoveID) {
    let tr = document.createElement('tr');

    let td = document.createElement('td');
    td.textContent = identity.email;
    td.className = 'clickable-cell';
    td.style = 'cursor: pointer';
    tr.appendChild(td);

    td = document.createElement('td');

    if (toRemoveID) {
      let btn = document.createElement('button');
      btn.textContent = 'Remove';
      btn.className = 'remove-id waves-effect waves-light btn';
      td.appendChild(btn);
    }

    tr.appendChild(td);

    return tr;
  }

  changeID(callback) {
    let _this = this;

    let idToUse = event.target.innerText;

    //TODO improve later.
    //prevents when the users selects an hyperty, exit the identity page and
    //goes again to the identity page, from selecting "settings" button as identity.
    if (idToUse !== 'settings') {

      callback(idToUse);
      return idToUse;
    }
  }

  removeID(emails) {
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

  obtainNewIdentity(event, callback, toRemoveID) {
    let _this = this;
    let idProvider = event.target.textContent;
    let idProvider2 = event.target.text;

    _this.callIdentityModuleFunc('generateRSAKeyPair', {}).then((keyPair) => {
      let publicKey = btoa(keyPair.public);

      _this.callIdentityModuleFunc('sendGenerateMessage',
        { contents: publicKey, origin: 'origin', usernameHint: undefined,
        idpDomain: idProvider, }).then((value) => {
        console.log('receivedURL: ' + value.loginUrl.substring(0, 20) + '...');

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
          _this._authenticateUser(keyPair, publicKey, value, 'origin', idProvider).then((email) => {
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

  _authenticateUser(keyPair, publicKey, value, origin, idProvider) {
    let _this = this;
    let url = _this.resultURL;

    return new Promise((resolve, reject) => {

      _this.openPopup(url).then((identity) => {

        _this.callIdentityModuleFunc('sendGenerateMessage',
          { contents: publicKey, origin: origin, usernameHint: identity, idpDomain: idProvider }).then((result) => {

          if (result) {

           //_this.identityModule.storeIdentity(result, keyPair).then((value) => {
           _this.callIdentityModuleFunc('storeIdentity', {result: result, keyPair: keyPair}).then((value) => {
             resolve(value.userProfile.username);
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
