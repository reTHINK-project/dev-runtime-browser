// jshint browser:true, jquery: true

class IdentitiesGUI {

  constructor(identityModule) {
    if (!identityModule) throw Error('Identity Module not set!');
    let _this = this;
    let guiURL = identityModule._runtimeURL + '/identity-gui';
    _this._guiURL = guiURL;
    _this.identityModule = identityModule;
    _this._messageBus = identityModule.messageBus;
    _this.identityModule.deployGUI();

    _this._messageBus.addListener(guiURL, msg => {
      let identityInfo = msg.body.value;
      let value;

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
            value = {type: 'idp', value: identityInfo.value, code: 200};
            replyMsg = {id: msg.id, type: 'response', to: msg.from, from: msg.to, body: value};
            _this._messageBus.postMessage(replyMsg);
            break;

          case 'identity':
            value = {type: 'identity', value: identityInfo.value, code: 200};
            replyMsg = {id: msg.id, type: 'response', to: msg.from, from: msg.to, body: value};
            _this._messageBus.postMessage(replyMsg);
            break;

          default:
            value = {type: 'error', value: 'Error on identity GUI', code: 400};
            replyMsg = {id: msg.id, type: 'response', to: msg.from, from: msg.to, body: value};
            _this._messageBus.postMessage(replyMsg);
        }
      });
    });



    $('.identities-page-show').on('click', function () {
      //TODO call a IdM method that requests the identities
      _this.showIdentitiesGUI();
    });
  }

  showIdentitiesGUI(receivedInfo) {
    let _this = this;

    return new Promise((resolve, reject) => {

      let identityInfo;
      let toRemoveID;

      if (receivedInfo) {
        identityInfo = receivedInfo;
        toRemoveID = false;
      } else {
        toRemoveID = true;
        identityInfo = _this.identityModule.getIdentitiesToChoose();
      }

      $('.policies-section').addClass('hide');
      $('.identities-section').removeClass('hide');

      _this.showMyIdentities(identityInfo.identities, toRemoveID).then((identity) => {
        console.log('chosen identity: ', identity);
        resolve({type: 'identity', value: identity});
      });

      let callback = (value) => {
        console.log('chosen idp: ', value);
        resolve({type: 'idp', value: value});
      };

      let idps = identityInfo.idps;
      $('#idproviders').html(_this._getList(idps));
      $('#idproviders').off();
      $('#idproviders').on('click', (event) => _this.obtainNewIdentity(callback, toRemoveID));
      //$('.back').on('click', (event) => _this.goHome());
      $('.identities-reset').off();
      $('.identities-reset').on('click', (event) => _this._resetIdentities());
    });

  }

  showMyIdentities(emails, toRemoveID) {
    let _this = this;

    return new Promise((resolve, reject) => {

      // let identities = _this.identityModule.getIdentities();
      let identities = [];

      for(let i in emails) {
        let domain = emails[i].split('@');
        identities.push({email: emails[i], domain: domain[1]});
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

    if(toRemoveID) {
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
    callback(idToUse);
    return idToUse;
  }

  removeID(emails) {
    let _this = this;
    let row = event.target.parentNode.parentNode;
    let idToRemove = row.children[0].textContent;
    let domain = row.children[1].textContent;
    _this.identityModule.unregisterIdentity(idToRemove);

    let numEmails = emails.length;
    for (let i = 0; i < numEmails; i++) {
      if (emails[i].email === idToRemove) {
        emails.splice(i, 1);
        break;
      }
    }
    // -------------------------------------------------------------------------//
    _this.showMyIdentities(emails, true);

  }

  obtainNewIdentity(callback, toRemoveID) {
    let _this = this;
    let idProvider = event.target.textContent;
    let idProvider2 = event.target.text;

    //if the request came from the identity administration GUI then call the method to obtain an identity
    if(toRemoveID) {
      _this.identityModule.callGenerateMethods(idProvider).then(() => {
        _this.showIdentitiesGUI();
      });
    } else {
      callback(idProvider);

    }
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

_resetIdentities() {
  console.log('clicked resetIdentities');
}


}

export default IdentitiesGUI;
