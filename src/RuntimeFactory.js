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
import PersistenceManager from 'service-framework/dist/PersistenceManager'
import { createSandbox } from './Sandboxes'
import SandboxApp from './SandboxApp'
import Request from './Request'
import RuntimeCapabilities from './RuntimeCapabilities'
import storageManager from 'service-framework/dist/StorageManager'
import Dexie from 'dexie'
import { RuntimeCatalogue } from 'service-framework/dist/RuntimeCatalogue'

/**
 * Is a bridge to isolate the runtime from the specific platform
 * @typedef {Object} RuntimeFactory
 * @property {function():Sandbox} createSandbox Creates a new Sandbox
 * @property {function():SandboxApp} createAppSandbox Creates a new SandboxApp
 * @property {function():Request} createHttpRequest Creates a new Request object
 * @property {function():RuntimeCatalogue} createRuntimeCatalogue Creates a new RuntimeCatalogue
 * @property {function(Encoded data: string):string} atob Returns the string decoded
 * @property {function():PersistenceManager} persistenceManager Returns a new PersistenceManager
 * @property {function():StorageManager} storageManager Returns a new StorageManager
 * @property {function():RuntimeCapabilities} runtimeCapabilities Returns a new RuntimeCapabilities
 */
export default {
	createSandbox(constraints) {
		return createSandbox(constraints)
	},

	createAppSandbox() {
		return new SandboxApp()
	},

	createHttpRequest() {
		let request = new Request()
		return request
	},

	createRuntimeCatalogue() {
		if (!this.catalogue)
			this.catalogue = new RuntimeCatalogue(this)

		return this.catalogue
	},

	atob(b64) {
		return atob(b64)
	},

	persistenceManager() {
		let localStorage = window.localStorage
		return new PersistenceManager(localStorage)
	},

	storageManager() {
		const db = new Dexie('cache')
		const storeName = 'objects'

		return new storageManager(db, storeName)
	},

	runtimeCapabilities(storageManager) {
		return new RuntimeCapabilities(storageManager)
	}
}
