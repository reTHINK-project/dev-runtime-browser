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
const methods = {GET: 'get', POST: 'post'}
/**
 * @typedef {Object} Request
 * @desc Bridge to make HTTP requests
 * @property {function(url:string, options:Object):string} get
 * @property {function(url:string, options:Object):string} post
 */

/**
 * Bridge to make HTTP requests
 */
class Request {

	constructor() {
		let _this = this

		Object.keys(methods).forEach(function(method) {
			_this[methods[method]] = function(url, options) {
				return new Promise(function(resolve, reject) {
					_this._makeLocalRequest(methods[method].toUpperCase(), url, options).then(function(result) {
						resolve(result)
					}).catch(function(reason) {
						reject(reason)
					})
				})
			}
		})
	}

	_makeLocalRequest(method, url, options) {
		let _this = this

		return new Promise(function(resolve, reject) {
			url = _this._mapProtocol(url)
			let xhr = new XMLHttpRequest()

			xhr.open(method, url, true)

			xhr.onreadystatechange = function(event) {
				let xhr = event.currentTarget
				if (xhr.readyState === 4) {
					if (xhr.status >= 200 || xhr.status <= 299) {
						resolve(xhr.responseText)
					} else {
						reject(xhr.responseText)
					}
				}
			}

			if(options && options.headers) {
				for(let prop in options.headers) {
					xhr.setRequestHeader(prop, options.headers[prop])
				}
			}

			xhr.send(options?options.body:null)
		})

	}

	_mapProtocol(url) {
		let protocolmap = {
			'localhost://': 'https://',
			'undefined://': 'https://',
			'hyperty-catalogue://': 'https://',
			'https://': 'https://',
			'http://': 'http://'
		}

		let foundProtocol = false
		for (let protocol in protocolmap) {
			if (url.slice(0, protocol.length) === protocol) {
				url = protocolmap[protocol] + url.slice(protocol.length, url.length)
				foundProtocol = true
				break
			}
		}

		if (!foundProtocol) {
			throw new Error('Invalid protocol of url: ' + url)
		}

		return url
	}
}

export default Request
