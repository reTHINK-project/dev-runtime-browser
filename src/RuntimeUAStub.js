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

/**
 * @external {MSG_STATUS} https://github.com/reTHINK-project/core-framework/tree/master/docs/specs/service-framework
 */

import app from './ContextApp';
import URI from 'urijs';
import { create as createIframe } from './iframe';

let iframe = undefined;

/**
 * @typedef {Object} Hyperty
 * @property {string} runtimeHypertyURL - Hyperty address
 * @property {MSG_STATUS} status - Hyperty status
 * @property {Object} instance - Hyperty object
 * @property {string} name - Hyperty name
 */
let buildMsg = (hypertyComponent, msg) => {
  return {
    runtimeHypertyURL: msg.body.runtimeHypertyURL,
    status: msg.body.status,
    instance: hypertyComponent.instance,
    name: hypertyComponent.name
  };
};

let requireHypertyID = 0;

/**
 * @typedef {Object} RuntimeAdapter
 * @property {function(Hyperty descriptor: string, Hyperty addresses to be reused or empty in other case: string): Promise<Hyperty>} requireHyperty - Loads and returns a Hyperty
 * @property {function(Domain: string)} requireProtostub - Loads a protostub from the given domain
 * @property {function(): Promise} close - Unloads and closes the installed runtime
 */
let runtimeAdapter = {

  requireHyperty: (hypertyDescriptor, reuseAddress = false) => {
    return new Promise((resolve, reject) => {
      // keep current requireHypertyID
      const callbackID = requireHypertyID;
      requireHypertyID += 1;
      let loaded = (e) => {
        if (e.data.to === 'runtime:loadedHyperty') {
          if (e.data.body.id === callbackID) {
            window.removeEventListener('message', loaded);
            resolve(buildMsg(app.getHyperty(e.data.body.runtimeHypertyURL), e.data));
          }
        }
      };
      window.addEventListener('message', loaded);
      iframe.contentWindow.postMessage({ to: 'core:loadHyperty', body: { descriptor: hypertyDescriptor, reuseAddress, id: callbackID } }, '*');
    });
  },

  authorise: (idp, scope) => {

    return new Promise((resolve, reject) => {
      let loaded = (e) => {
        console.log('[RuntimeBrowser.RuntimeUAStub.Authorise] reply:', e.data);
        if (e.data.to === 'runtime:authorised') {
          window.removeEventListener('message', loaded);

          resolve(e.data.body);
        } else if (e.data.to === 'runtime:not-authorised') {
          window.removeEventListener('message', loaded);

          console.error('[RuntimeBrowser.RuntimeUAStub.Authorise] Error:', e.data);
          reject(e.data.body);
        }
      };
      window.addEventListener('message', loaded);
      console.log('Authorising IDP ', idp, ' with scope ', scope);
      iframe.contentWindow.postMessage({ to: 'core:authorise', body: { idp: idp, scope: scope } }, '*');
    });

  },

  reset: () => {
    console.log('Runtime Browser - reset ');
    return new Promise((resolve, reject) => {
      let resetEvt = (e) => {
        if (e.data.to === 'runtime:runtimeReset') {
          window.removeEventListener('message', resetEvt);
          resolve(e.data.body);
        }
      };
      window.addEventListener('message', resetEvt);
      iframe.contentWindow.postMessage({ to: 'core:reset', body: { } }, '*');
    });
  },

  login: (idp) => {

    return new Promise((resolve, reject) => {
      let loaded = (e) => {
        if (e.data.to === 'runtime:loggedIn') {
          window.removeEventListener('message', loaded);
          resolve(e.data.body);
        }
      };
      window.addEventListener('message', loaded);
      console.log('Logging with IDP: ', idp);
      iframe.contentWindow.postMessage({ to: 'core:login', body: { idp: idp } }, '*');
    });

  },

  listenShowAdmin: () => {
    return new Promise((resolve, reject) => {
      let loaded = (e) => {
        if (e.data.to === 'runtime:gui-manager') {
          if (e.data.body.method === 'tokenExpired') {
            window.removeEventListener('message', loaded);
            resolve(true);
          }
        }
      };
      window.addEventListener('message', loaded);
    });
  },


  requireProtostub: (domain) => {
    iframe.contentWindow.postMessage({ to: 'core:loadStub', body: { domain: domain } }, '*');
  },

  close: (logOut = false) => {
    console.log('Stub - logging out: ', logOut);
    return new Promise((resolve, reject) => {
      let loaded = (e) => {
        if (e.data.to === 'runtime:runtimeClosed') {
          window.removeEventListener('message', loaded);
          resolve(resolve(e.data.body));
        }
      };
      window.addEventListener('message', loaded);
      iframe.contentWindow.postMessage({ to: 'core:close', body: { logOut: logOut } }, '*');
    });
  }
};

let GuiManager = function () {
  window.addEventListener('message', (e) => {
    if (e.data.to === 'runtime:gui-manager') {

      if (e.data.body.method === 'showAdminPage') {
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.zIndex = 99999;
      } else {
        if (e.data.body.method === 'hideAdminPage') {
          iframe.style.width = '48px';
          iframe.style.height = '48px';
          iframe.style.zIndex = 1;
        }
      }

    }
  });
};

/**
 * @typedef {Object} RuntimeUA
 * @property {function(Runtime domain: string, Runtime url: string, Development mode: boolean): Promise<RuntimeAdapter>} install - Installs a runtime locally
 */
let RethinkBrowser = {
  install: function ({ domain, runtimeURL, development, indexURL, sandboxURL, hideAdmin } = {}) {
    console.info('Install: ', domain, runtimeURL, development, indexURL, sandboxURL, hideAdmin);
    return new Promise((resolve, reject) => {
      let runtime = this._getRuntime(runtimeURL, domain, development, indexURL, sandboxURL, hideAdmin);
      iframe = createIframe(`${runtime.indexURL}?domain=${runtime.domain}&runtime=${runtime.url}&development=${development}`, 99999, hideAdmin);
      let installed = (e) => {
        if (e.data.to === 'runtime:installed') {
          window.removeEventListener('message', installed);
          resolve(runtimeAdapter);
        }
      };
      window.addEventListener('message', installed);
      window.addEventListener('message', (e) => {
        if (e.data.to && e.data.to === 'runtime:createSandboxWindow') {
          const ifr = createIframe(runtime.sandboxURL, undefined, hideAdmin);
          ifr.addEventListener('load', () => {
            ifr.contentWindow.postMessage(e.data, '*', e.ports);
          }, false);
        }
      });
      app.create(iframe);
      GuiManager();
    });
  },

  _getRuntime(runtimeURL, domain, development, indexURL, sandboxURL) {
    if (development) {
      runtimeURL = runtimeURL || 'hyperty-catalogue://catalogue.' + domain + '/.well-known/runtime/Runtime';
      domain = domain || new URI(runtimeURL).host();
      indexURL = indexURL || 'https://' + domain + '/.well-known/runtime/index.html';
      sandboxURL = sandboxURL || 'https://' + domain + '/.well-known/runtime/sandbox.html';
    } else {
      runtimeURL = runtimeURL || `https://catalogue.${domain}/.well-known/runtime/default`;
      domain = domain || new URI(runtimeURL).host().replace('catalogue.', '');
      indexURL = indexURL || 'https://' + domain + '/.well-known/runtime/index.html';
      sandboxURL = sandboxURL || 'https://' + domain + '/.well-known/runtime/sandbox.html';
    }

    console.info('get Runtime: ', runtimeURL, domain, indexURL, sandboxURL);

    return {
      url: runtimeURL,
      domain: domain,
      indexURL: indexURL,
      sandboxURL: sandboxURL
    };
  }
};

export default RethinkBrowser;
