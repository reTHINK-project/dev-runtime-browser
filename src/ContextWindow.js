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

self._miniBus = new MiniBus()
self._miniBus._onPostMessage = function(msg){
	self.port.postMessage(JSON.parse(JSON.stringify(msg)))
}

self.addEventListener('message', function(event){
	self.port = event.ports[0]
	self.port.onmessage = (event) => {
		self._miniBus._onMessage(JSON.parse(JSON.stringify(event.data)))
	}
})

self._registry = new SandboxRegistry(self._miniBus)
self._registry._create = function(url, sourceCode, config){
	try {
		eval.apply(self, [sourceCode])
		return activate(url, self._miniBus, config)
	} catch (error) {
		console.error("[Context Window] - Error: ", error)
		throw JSON.stringify(error.message)
	}
}