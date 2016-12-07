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

function returnHyperty(source, hyperty){
    source.postMessage({to: 'runtime:loadedHyperty', body: hyperty})
}

function searchHyperty(runtime, descriptor){
    let hyperty = undefined
    let index = 0
    while (!hyperty && index<runtime.registry.hypertiesList.length) {
        if (runtime.registry.hypertiesList[index].descriptor === descriptor)
            hyperty = runtime.registry.hypertiesList[index]

		index++
	}

	return hyperty
}

function loadRuntime(runtimeURL) {
	return catalogue.getRuntimeDescriptor(runtimeURL)
		.then(descriptor => {
			let sourcePackageURL = descriptor.sourcePackageURL
			if (sourcePackageURL === '/sourcePackage') {
				return descriptor.sourcePackage
			}

			return catalogue.getSourcePackageFromURL(sourcePackageURL)
		})
		.then(sourcePackage => {
			eval.apply(self,[sourcePackage.sourceCode])

			return new Runtime(RuntimeFactory, self.location.host)
		})
}

let runtime = undefined
let catalogue = undefined

onconnect = function(e) {
	console.log('juas')
	console.log(this)

	let parameters = new URI(self.location.href).search(true)
	let runtimeURL = parameters.runtime
	let development = parameters.development === 'true'
	catalogue = RuntimeFactory.createRuntimeCatalogue(development)
	let port = e.ports[0]

	port.addEventListener('message', function(e) {
		if(!runtime)
			throw new Error('runtime not installed')

		if(e.data.to==='core:loadHyperty'){
			let descriptor = e.data.body.descriptor
			let hyperty = searchHyperty(runtime, descriptor)

			if (hyperty){
				returnHyperty(e.source, {runtimeHypertyURL: hyperty.hypertyURL})
			} else {
				runtime.loadHyperty(descriptor)
					.then(returnHyperty.bind(null, e.source))
			}
		} else if (e.data.to==='core:loadStub'){
			runtime.loadStub(e.data.body.domain).then((result) => {
				console.log('Stub Loaded: ', result)
			}).catch((error) => {
				console.error('Stub error:', error)
			})
		} else if (e.data.to==='core:close'){
			runtime.close()
				.then(port.postMessage({to: 'runtime:runtimeClosed', body: true}, '*'))
				.catch(port.postMessage({to: 'runtime:runtimeClosed', body: false}, '*'))
		}
	})

	if(!runtime) {
		loadRuntime(runtimeURL)
		.then(rnt => {
			runtime = rnt
			port.postMessage({to:'runtime:installed', body:{}})
		})
	} else {
		port.postMessage({to:'runtime:installed', body:{}})
	}

	//new PoliciesGUI(runtime.policyEngine)
	//let identitiesGUI = new IdentitiesGUI(runtime.identityModule)
	//window.addEventListener('beforeunload', (e) => {
}
