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
import { Sandbox, SandboxRegistry } from 'runtime-core/dist/sandbox'
import MiniBus from 'runtime-core/dist/minibus'

function create(iframe){
	window._miniBus = new MiniBus()
	window._miniBus._onPostMessage = function(msg){
		iframe.contentWindow.postMessage(JSON.parse(JSON.stringify(msg)), '*')
	}
	window.addEventListener('message', function(event){
		if(event.data.to && (event.data.to.startsWith('runtime:loadedHyperty') || event.data.to.endsWith('gui-manager')))
			return

		window._miniBus._onMessage(JSON.parse(JSON.stringify(event.data)))
	}, false)

	window._registry = new SandboxRegistry(window._miniBus)
	window._registry._create = function(url, sourceCode, config){
		try {
			eval.apply(window, [sourceCode])
			return activate(url, window._miniBus, config)
		} catch (error) {
			console.error('[Context APP Create] - Error: ', error)
			throw JSON.stringify(error.message)
		}
	}
}

function getHyperty(hypertyDescriptor){
	return window._registry.components[hypertyDescriptor]
}
/**
 * SandboxContext for application
 * @typedef ContextApp
 * @property {function(iFrame: iframe)} create Creates the context for the sandbox hosted in the iframe
 * @property {function(Hyperty descriptor: string):Hyperty} getHyperty Returns the hyperty for the given descriptor
 * */
export default { create, getHyperty }
