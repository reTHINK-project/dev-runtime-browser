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
import Request from './Request'
import { create as createIframe } from './iframe'
import Rx from 'rx'
import IdentitiesGUI from './admin/IdentitiesGUI'
import PoliciesGUI from './admin/PoliciesGUI'

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

let appContext
const runtimeAdapter = (port, messages) => {
	// TIAGO
	if (!runtime.policyEngine) throw Error('Policy Engine is not set!');
	let pepGuiURL = runtime.policyEngine.context.guiURL;
	let pepURL = runtime.policyEngine.context.pepURL;
	let pepGUI = new PoliciesGUI(pepGuiURL, pepURL, runtime.policyEngine.messageBus, runtime.policyEngine);

	pepGUI.prepareAttributes().then(() => {
		let idmGuiURL = runtime.identityModule._runtimeURL + '/identity-gui';
		let idmURL = runtime.identityModule._runtimeURL + '/idm';
		let identitiesGUI = new IdentitiesGUI(idmGuiURL, idmURL, runtime.identityModule.messageBus);
	})

	return {
		requireHyperty: (hypertyDescriptor, reuseAddress = false)=>{
			return new Promise((resolve)=>{
				messages.filter(e => e.data.to && e.data.to === 'runtime:loadedHyperty')
					.subscribe(e => resolve(buildMsg(appContext.getHyperty(e.data.body.runtimeHypertyURL), e.data)))
				port.postMessage({to:'core:loadHyperty', body:{descriptor: hypertyDescriptor}})
			})
		},

		requireProtostub: (domain)=>{
			port.postMessage({to:'core:loadStub', body:{'domain': domain}})
		},

		close: ()=>{
			return new Promise((resolve)=>{
				messages.filter(e => e.data.to && e.data.to === 'runtime:runtimeClosed')
					.subscribe(e => resolve(e.data.body))
				port.postMessage({to:'core:close', body:{}})
			})
		}
	}
}

/**
 * @typedef {Object} RuntimeUA
 * @property {function(Runtime domain: string, Runtime url: string, Development mode: boolean): Promise<RuntimeAdapter>} install - Installs a runtime locally
 */
const RethinkBrowser = {
	install: function({domain, runtimeURL, development}={}){
		const req = new Request();
		const runtime = this._getRuntime(runtimeURL, domain, development)
		return new Promise((resolve) => {
			const adminGUI = createIframe(`https://${runtime.domain}/.well-known/runtime/index.html`)
			const core = new SharedWorker(`https://${runtime.domain}/.well-known/runtime/core.js`)
			const messages = Rx.Observable.fromEvent(core.port, 'message')
			core.port.start()

			messages.subscribe((m) => console.log('message', m))
			messages.filter(e => e.data.to && e.data.to === 'runtime:installed')
				.subscribe(() => resolve(runtimeAdapter(core.port, messages)))
			messages.filter(e => e.data.to && e.data.to === 'runtime:createSandboxWindow')
				.subscribe((e) => {
					const ifr = createIframe(`https://${runtime.domain}/.well-known/runtime/sandbox.html`)
					ifr.addEventListener('load', () => {
						ifr.contentWindow.postMessage(e.data, '*', e.ports)
					}, false)
				})
			messages.filter(e => e.data.to && e.data.to === 'runtime:createAppSandbox')
				.subscribe((e) => {
					appContext = app.create(e.ports[0])
				})
			messages.filter(e => e.data.to && e.data.to === 'runtime:gui-manager')
				.subscribe(e => {
					if (e.data.body.method === 'showAdminPage') {
						adminGUI.style.width = '100%'
						adminGUI.style.height = '100%'
					} else {
						if (e.data.body.method === 'hideAdminPage') {
							adminGUI.style.width = '40px'
							adminGUI.style.height = '40px'
						}
					}
				})
			setTimeout(()=>{
				console.log('juas')
				core.port.postMessage({to:'core:installRuntime', data: { runtimeURL:runtimeURL, development: development, domain: domain }})
			}, 500)
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
			'url': runtimeURL,
			'domain': domain
		}
	}
}

export default RethinkBrowser
