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

/**
 * @external {MSG_STATUS} https://github.com/reTHINK-project/core-framework/tree/master/docs/specs/service-framework
 */

import app from './ContextApp'
import URI from 'urijs'
import { create as createIframe } from './iframe'

let iframe = undefined

/**
 * @typedef {Object} Hyperty
 * @property {string} runtimeHypertyURL - Hyperty address
 * @property {MSG_STATUS} status - Hyperty status
 * @property {Object} instance - Hyperty object
 * @property {string} name - Hyperty name
 */
let buildMsg = (hypertyComponent, msg) => {
	return {
		runtimeHypertyURL: msg.body.runtimeHypertyURL,
		status: msg.body.status,
		instance: hypertyComponent.instance,
		name: hypertyComponent.name
	}
}

/**
 * @typedef {Object} RuntimeAdapter
 * @property {function(Hyperty descriptor: string, Hyperty addresses to be reused or empty in other case: string): Promise<Hyperty>} requireHyperty - Loads and returns a Hyperty
 * @property {function(Domain: string)} requireProtostub - Loads a protostub from the given domain
 * @property {function(): Promise} close - Unloads and closes the installed runtime
 */
let runtimeAdapter = {
	requireHyperty: (hypertyDescriptor, reuseAddress = false)=>{
		return new Promise((resolve, reject)=>{
			let loaded = (e)=>{
				if(e.data.to === 'runtime:loadedHyperty'){
					window.removeEventListener('message', loaded)
					resolve(buildMsg(app.getHyperty(e.data.body.runtimeHypertyURL), e.data))
				}
			}
			window.addEventListener('message', loaded)
			iframe.contentWindow.postMessage({to:'core:loadHyperty', body:{descriptor: hypertyDescriptor, reuseAddress}}, '*')
		})
	},

	requireProtostub: (domain)=>{
		iframe.contentWindow.postMessage({to:'core:loadStub', body:{'domain': domain}}, '*')
	},

	close: ()=>{
		return new Promise((resolve, reject)=>{
			let loaded = (e)=>{
				if(e.data.to === 'runtime:runtimeClosed'){
					window.removeEventListener('message', loaded)
					resolve(resolve(e.data.body))
				}
			}
			window.addEventListener('message', loaded)
			iframe.contentWindow.postMessage({to:'core:close', body:{}}, '*')
		})
	},
}

let GuiManager = function(){
	window.addEventListener('message', (e) => {
		if(e.data.to === 'runtime:gui-manager') {

			if (e.data.body.method === 'showAdminPage') {
				iframe.style.width = '100%'
				iframe.style.height = '100%'
			} else {
				if (e.data.body.method === 'hideAdminPage') {
					iframe.style.width = '40px'
					iframe.style.height = '40px'
				}
			}

		}
	})
}

/**
 * @typedef {Object} RuntimeUA
 * @property {function(Runtime domain: string, Runtime url: string, Development mode: boolean): Promise<RuntimeAdapter>} install - Installs a runtime locally
 */
let RethinkBrowser = {
	install: function({domain, runtimeURL, development}={}){
		return new Promise((resolve, reject)=>{
			let runtime = this._getRuntime(runtimeURL, domain, development)
			iframe = createIframe(`https://${runtime.domain}/.well-known/runtime/index.html?runtime=${runtime.url}&development=${development}`)
			let installed = (e)=>{
				if(e.data.to === 'runtime:installed'){
					window.removeEventListener('message', installed)
					resolve(runtimeAdapter)
				}
			}
			window.addEventListener('message', installed)
			window.addEventListener('message', (e) => {
				if(e.data.to && e.data.to === 'runtime:createSandboxWindow'){
					const ifr = createIframe(`https://${runtime.domain}/.well-known/runtime/sandbox.html`)
					ifr.addEventListener('load', () => {
						ifr.contentWindow.postMessage(e.data, '*', e.ports)
					}, false)
				}
			})
			app.create(iframe)
			GuiManager()
		})
	},

	_getRuntime (runtimeURL, domain, development) {
		if(!!development){
			runtimeURL = runtimeURL || 'hyperty-catalogue://catalogue.' + domain + '/.well-known/runtime/Runtime'
			domain = domain || new URI(runtimeURL).host()
		}else{
			runtimeURL = runtimeURL || `https://catalogue.${domain}/.well-known/runtime/default`
			domain = domain || new URI(runtimeURL).host().replace('catalogue.', '')
		}

		return {
			url: runtimeURL,
			domain: domain
		}
	}
}

export default RethinkBrowser
