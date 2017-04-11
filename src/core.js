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

function loadRuntime(runtimeURL, runtimeFactory, domain) {
	let d
	return catalogue.getRuntimeDescriptor(runtimeURL)
		.then(descriptor => {
			d = descriptor
			let sourcePackageURL = descriptor.sourcePackageURL
			if (sourcePackageURL === '/sourcePackage') {
				return descriptor.sourcePackage
			}

			return catalogue.getSourcePackageFromURL(sourcePackageURL)
		})
		.then(sourcePackage => {
			eval.apply(self,[sourcePackage.sourceCode])

			return new Runtime(d, runtimeFactory, domain)
		}).catch(console.error)
}

let runtime = undefined
let catalogue = undefined

onconnect = function(e) {
	let port = e.ports[0]
	let runtimeFactory = RuntimeFactory(port)

	port.onmessage = (e) => {
		console.log(e)
		if(e.data.to ==='core:installRuntime') {
			if(!catalogue)
				catalogue = runtimeFactory.createRuntimeCatalogue(e.data.data.development)

			if(!runtime) {
				loadRuntime(e.data.data.runtimeURL, runtimeFactory, e.data.data.domain)
				.then(rnt => {
					runtime = rnt
					rnt.init().then(()=>{

						port.postMessage({to:'runtime:installed', body:{}})
					})
				})
			} else {
				port.postMessage({to:'runtime:installed', body:{}})
			}
		} else if(!runtime) {
			throw new Error('runtime not installed')
		}else if(e.data.to==='core:loadHyperty'){
			let descriptor = e.data.body.descriptor
			let hyperty = searchHyperty(runtime, descriptor)

			if (hyperty){
				returnHyperty(port, {runtimeHypertyURL: hyperty.hypertyURL})
			} else {
				runtime.loadHyperty(descriptor)
					.then(returnHyperty.bind(null, port))
			}
		} else if (e.data.to==='core:loadStub'){
			runtime.loadStub(e.data.body.domain).then((result) => {
				console.log('Stub Loaded: ', result)
			}).catch((error) => {
				console.error('Stub error:', error)
			})
		} else if (e.data.to==='core:close'){
			runtime.close()
				.then(port.postMessage({to: 'runtime:runtimeClosed', body: true}))
				.catch(port.postMessage({to: 'runtime:runtimeClosed', body: false}))
		} else {
			runtimeFactory.createAppSandbox().onMessage(e.data)
		}
	}
	console.log('onconnect')
}
