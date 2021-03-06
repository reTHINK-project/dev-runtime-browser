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
import URI from 'urijs';
import IdentitiesGUI from './admin/IdentitiesGUI';
import PoliciesGUI from './admin/PoliciesGUI';
import RuntimeFactory from './RuntimeFactory';
import RuntimeCatalogue from 'runtime-core/dist/RuntimeCatalogue';

try {
  window.cordova = parent.cordova !== undefined;
  if (window.cordova) { window.open = function(url) { return parent.cordova.InAppBrowser.open(url, '_blank', 'location=no,toolbar=no'); }; }
} catch (err) { console.log('cordova not supported'); }

function returnHyperty(source, hyperty) {
  source.postMessage({to: 'runtime:loadedHyperty', body: hyperty}, '*');
}

function searchHyperty(runtime, descriptor) {
  let hyperty = undefined;
  let index = 0;
  while (!hyperty && index < runtime.registry.hypertiesList.length) {
    if (runtime.registry.hypertiesList[index].descriptor === descriptor) { hyperty = runtime.registry.hypertiesList[index]; }

    index++;
  }

  return hyperty;
}

let parameters = new URI(window.location).search(true);
let runtimeURL = parameters.runtime;
let domain = parameters.domain;
let development = parameters.development === 'true';
let catalogue = new RuntimeCatalogue(RuntimeFactory);
let runtimeDescriptor;
catalogue.getRuntimeDescriptor(runtimeURL)
  .then(function(descriptor) {
    runtimeDescriptor = descriptor;
    let sourcePackageURL = descriptor.sourcePackageURL;
    if (sourcePackageURL === '/sourcePackage') {
      return descriptor.sourcePackage;
    }
    return catalogue.getSourcePackageFromURL(sourcePackageURL);
  })
  .then(function(sourcePackage) {
    eval.apply(window, [sourcePackage.sourceCode]);

    //let runtime = new Runtime(RuntimeFactory, window.location.host);
    if (!domain) domain = window.location.host;
    let runtime = new Runtime(runtimeDescriptor, RuntimeFactory, domain);
    window.runtime = runtime;
    runtime.init().then(function(result) {

      // TIAGO
      if (!runtime.policyEngine) throw Error('Policy Engine is not set!');
      let pepGuiURL = runtime.policyEngine.context.guiURL;
      let pepURL = runtime.policyEngine.context.pepURL;
      let pepGUI = new PoliciesGUI(pepGuiURL, pepURL, runtime.policyEngine.messageBus, runtime.policyEngine);

      pepGUI.prepareAttributes().then(() => {
        let idmGuiURL = runtime.identityModule._runtimeURL + '/identity-gui';
        let idmURL = runtime.identityModule._runtimeURL + '/idm';
        let identitiesGUI = new IdentitiesGUI(idmGuiURL, idmURL, runtime.identityModule.messageBus);

        window.addEventListener('message', function(event) {
          if (event.data.to === 'core:loadHyperty') {
            let descriptor = event.data.body.descriptor;
            let reuseAddress = event.data.body.reuseAddress;
            let requireHypertyID = event.data.body.id;

            let hyperty = searchHyperty(runtime, descriptor);

            if (hyperty) {
              returnHyperty(event.source, { runtimeHypertyURL: hyperty.hypertyURL, id: requireHypertyID});
            } else {
              runtime.loadHyperty(descriptor, reuseAddress).then(function(hyperty) {
                hyperty.id = requireHypertyID;
                returnHyperty(event.source, hyperty);
              });
            }
          } else if (event.data.to === 'core:loadStub') {
            runtime.loadStub(event.data.body.domain).then((result) => {
              console.log('Stub Loaded: ', result);
            }).catch((error) => {
              console.error('Stub error:', error);
            });
          } else if (event.data.to === 'core:close') {
            runtime.close(event.data.body.logOut).then((result)=>{
                event.source.postMessage({to: 'runtime:runtimeClosed', body: result}, '*')
              })
              .catch((result)=>{
                event.source.postMessage({to: 'runtime:runtimeClosed', body: result}, '*')
              });

            //  send logout
            identitiesGUI.logOut().then((result) => {
              console.log(result);
            });

          } else if (event.data.to === 'core:reset') {
            runtime.reset().then(function(result) {
                event.source.postMessage({to: 'runtime:runtimeReset', body: result}, '*')
              });

            //  send logout
            identitiesGUI.logOut().then((result) => {
              console.log(result);
            });

          } else if (event.data.to === 'core:login') {
            console.log('core: logging with ', event.data.body.idp);
            identitiesGUI.loginWithIDP(event.data.body.idp).then((result) => {
              event.source.postMessage({to: 'runtime:loggedIn', body: result}, '*');
            });
          } else if (event.data.to === 'core:authorise') {
            console.log('core:authorise ', event.data.body.idp, event.data.body.scope);
            identitiesGUI.authorise(event.data.body.idp, event.data.body.scope).then((result) => {
              if (result.hasOwnProperty('code') && result.code > 299) {
                event.source.postMessage({ to: 'runtime:not-authorised', body: JSON.stringify(result) }, '*');
              } else {
                event.source.postMessage({ to: 'runtime:authorised', body: JSON.stringify(result) }, '*');
              }
            });
          }


        }, false);

        window.addEventListener('beforeunload', (e) => {
          runtime.close();
        });

        parent.postMessage({to: 'runtime:installed', body: {}}, '*');

      });
    });
  });
