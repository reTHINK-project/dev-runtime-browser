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
import app from './ContextApp'
import URI from 'urijs'
import { create as createIframe } from './iframe'
import Rx from 'rx'

const buildMsg = (hypertyComponent, msg) => {
	return {
		runtimeHypertyURL: msg.body.runtimeHypertyURL,
		status: msg.body.status,
		instance: hypertyComponent.instance,
		name: hypertyComponent.name
	}
}

const runtimeAdapter = (port, messages) => {
	return {
		requireHyperty: (hypertyDescriptor)=>{
			return new Promise((resolve)=>{
				messages.filter(e => e.data.to && e.data.to === 'runtime:loadedHyperty')
					.subscribe(e => resolve(buildMsg(app.getHyperty(e.data.body.runtimeHypertyURL), e.data)))
				port.postMessage({to:'core:loadHyperty', body:{descriptor: hypertyDescriptor}}, '*')
			})
		},

		requireProtostub: (domain)=>{
			port.postMessage({to:'core:loadStub', body:{'domain': domain}}, '*')
		},

		close: ()=>{
			return new Promise((resolve)=>{
				messages.filter(e => e.data.to && e.data.to === 'runtime:runtimeClosed')
					.subscribe(e => resolve(e.data.body))
				port.postMessage({to:'core:close', body:{}}, '*')
			})
		}
	}
}

const RethinkBrowser = {
	install: function({domain, runtimeURL, development}={}){
		return new Promise((resolve)=>{
			const runtime = this._getRuntime(runtimeURL, domain, development)
			const url = `https://${runtime.domain}/.well-known/runtime/core.js?runtime=${runtime.url}&development=${development}`
			const core = new SharedWorker(url)
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
			messages.filter(e => e.data.to && !e.data.to.startsWith('runtime'))
				.subscribe((m) => app.onMessage(m))
			//messages.filter(e => e.data.to && e.data.to === 'runtime:gui-manager')
			//	.subscribe(e => {
			//		if (e.data.body.method === 'showAdminPage') {
			//			iframe.style.width = '100%'
			//			iframe.style.height = '100%'
			//		} else {
			//			if (e.data.body.method === 'hideAdminPage') {
			//				iframe.style.width = '40px'
			//				iframe.style.height = '40px'
			//			}
			//		}
			//	})

			//app.init(iframe)
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
