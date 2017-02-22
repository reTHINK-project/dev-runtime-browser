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
import URI from 'urijs'
import IdentitiesGUI from './admin/IdentitiesGUI'
import PoliciesGUI from './admin/PoliciesGUI'
import RuntimeFactory from './RuntimeFactory'

try{
	window.cordova = parent.cordova !== undefined
	if(window.cordova)
		window.open = function(url){ return parent.cordova.InAppBrowser.open(url, '_blank', 'location=no,toolbar=no')}
}catch(err){ console.log('cordova not supported') }

function returnHyperty(source, hyperty){
	source.postMessage({to: 'runtime:loadedHyperty', body: hyperty}, '*')
}

function searchHyperty(runtime, descriptor){
	let hyperty = undefined
	let index = 0
	while(!hyperty && index<runtime.registry.hypertiesList.length){
		if(runtime.registry.hypertiesList[index].descriptor === descriptor)
			hyperty = runtime.registry.hypertiesList[index]

		index++
	}

	return hyperty
}

let parameters = new URI(window.location).search(true)
let runtimeURL = parameters.runtime
let development = parameters.development === 'true'
let catalogue = RuntimeFactory.createRuntimeCatalogue(development)
let runtimeDescriptor;
catalogue.getRuntimeDescriptor(runtimeURL)
    .then(function(descriptor){
      runtimeDescriptor = descriptor;
        let sourcePackageURL = descriptor.sourcePackageURL;
        if (sourcePackageURL === '/sourcePackage') {
            return descriptor.sourcePackage;
        }

		return catalogue.getSourcePackageFromURL(sourcePackageURL)
	})
.then(function(sourcePackage){
	eval.apply(window,[sourcePackage.sourceCode])

	let runtime = new Runtime(runtimeDescriptor, RuntimeFactory, window.location.host);
	window.runtime = runtime;
	runtime.init().then( function(result){
	  new PoliciesGUI(runtime.policyEngine);
	  let identitiesGUI = new IdentitiesGUI(runtime.identityModule);

	  window.addEventListener('message', function(event){
		  if(event.data.to==='core:loadHyperty'){
			  let descriptor = event.data.body.descriptor;
			  let reuseAddress = event.data.body.reuseAddress
			  let hyperty = searchHyperty(runtime, descriptor);

			  if(hyperty){
				  returnHyperty(event.source, {runtimeHypertyURL: hyperty.hypertyURL});
			  }else{
				  runtime.loadHyperty(descriptor, reuseAddress)
					  .then(returnHyperty.bind(null, event.source));
			  }
		  }else if(event.data.to==='core:loadStub'){
			  runtime.loadStub(event.data.body.domain).then((result) => {
				console.log('Stub Loaded: ', result);
			  }).catch((error) => {
				console.error('Stub error:', error);
			  })
		  }else if(event.data.to==='core:close'){
			  runtime.close()
				  .then(event.source.postMessage({to: 'runtime:runtimeClosed', body: true}, '*'))
				  .catch(event.source.postMessage({to: 'runtime:runtimeClosed', body: false}, '*'))
		  }

	  }, false);
	  window.addEventListener('beforeunload', (e) => {
		  runtime.close()
	  })
	  parent.postMessage({to:'runtime:installed', body:{}}, '*');
	  console.log('AFTER PARENT');
	});
});
