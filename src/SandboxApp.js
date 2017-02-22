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
import { Sandbox, SandboxType } from 'runtime-core/dist/sandbox'
import MiniBus from 'runtime-core/dist/minibus'

/**
 * Proxy for the Application context
 * */
export default class SandboxApp extends Sandbox{
	constructor(){
		super()

		/**
		 * @type {runtime-core/dist/sandbox/SandboxType}
		 */
		this.type = SandboxType.NORMAL
		window.addEventListener('message', function(e){
			if(!this.origin){
				/**
				 * @type {Window}
				 */
				this.origin = e.source
			}

			if(e.data.hasOwnProperty('to') && e.data.to.startsWith('core:'))
				return

			this._onMessage(JSON.parse(JSON.stringify(e.data)))
		}.bind(this))

		window.addEventListener('error', function(error){
			console.error('[SANDBOX APP] - Error', error)
			throw error
		}.bind(this))

	}

	_onPostMessage(msg){
		this.origin.postMessage(JSON.parse(JSON.stringify(msg)), '*')
	}
}
