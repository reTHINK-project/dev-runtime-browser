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
import { SandboxRegistry } from 'runtime-core/dist/sandbox'
import MiniBus from 'runtime-core/dist/minibus'

function create(port){
	const _miniBus = new MiniBus()
	_miniBus._onPostMessage = function(msg){
		port.postMessage(JSON.parse(JSON.stringify(msg)))
	}

	const _registry = new SandboxRegistry(_miniBus)
	_registry._create = function(url, sourceCode, config){
		try {
			eval.apply(self, [sourceCode])
			return activate(url, _miniBus, config)
		} catch (error) {
			console.error("[Context APP Create] - Error: ", error)
			throw JSON.stringify(error.message)
		}
	}

	port.onmessage = (message) => {
		_miniBus._onMessage(JSON.parse(JSON.stringify(message.data)))
	}

	return {
		getHyperty: (hypertyDescriptor) => {
			return _registry.components[hypertyDescriptor]
		}
	}
}
/**
 * SandboxContext for application
 * @typedef ContextApp
 * @property {function(iFrame: iframe)} create Creates the context for the sandbox hosted in the iframe
 * @property {function(Hyperty descriptor: string):Hyperty} getHyperty Returns the hyperty for the given descriptor
 * */
export default { create }
