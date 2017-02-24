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
import RuntimeFactory from './RuntimeFactory'

/**
 * Proxy for a WebWorker
 * */
export class SandboxWorker extends Sandbox{
	static capabilities() {
		return RuntimeFactory.runtimeCapabilities(RuntimeFactory.storageManager()).getRuntimeCapabilities()
			.then(capabilities =>Object.assign(capabilities, { mic:false, camera:false }))
	}

	static new() {
		return new SandboxWorker('./context-service.js')
	}

	/**
	 * @param {string} script - Script that will be loaded in the web worker
	 */
	constructor(script){
		super(script)

		/**
		 * @type {runtime-core/dist/sandbox/SandboxType}
		 */
		this.type = SandboxType.NORMAL
		if(Worker){
			this._worker = new Worker(script)
			this._worker.addEventListener('message', function(e){
				this._onMessage(JSON.parse(JSON.stringify(e.data)))
			}.bind(this))

			this._worker.addEventListener('error', function(error){
				console.log('[Sandbox Worker] - Error: ', error)
				throw JSON.stringify(error)
			}.bind(this))

			this._worker.postMessage('')
		}else{
			throw new Error('Your environment does not support worker \n')
		}
	}

	_onPostMessage(msg){
		this._worker.postMessage(JSON.parse(JSON.stringify(msg)))
	}
}

export class SandboxWindow extends Sandbox{
	static capabilities() {
		return RuntimeFactory.runtimeCapabilities(RuntimeFactory.storageManager()).getRuntimeCapabilities()
	}

	static new() {
		return new SandboxWindow()
	}

	constructor(){
		super()

		this.type = SandboxType.NORMAL
		this.channel = new MessageChannel()

		this.channel.port1.onmessage = function(e){
			this._onMessage(JSON.parse(JSON.stringify(e.data)))
		}.bind(this)

		parent.postMessage({ to:'runtime:createSandboxWindow' }, '*', [this.channel.port2])
	}

	_onPostMessage(msg){
		this.channel.port1.postMessage(JSON.parse(JSON.stringify(msg)))
	}
}

export function createSandbox(constraints) {
	const sandboxes = [SandboxWorker, SandboxWindow]
	let diff = (a, b) => Object.keys(a).filter(x => a[x]!==b[x])

	return Promise.all(sandboxes.map(s => s.capabilities().then(c=>{return {capabilities:c, sandbox:s}})))
		.then(sbs => {
			let i = 0
			while(i<sbs.length) {
				if(diff(constraints, sbs[i].capabilities).length === 0)
					return sbs[i].sandbox.new()
				i++
			}
			throw new Error('None of supported sandboxes match your constraints')
		})
}
