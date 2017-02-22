import webrtcSupport from 'webrtcsupport'

/**
 * Proxy to get access to runtime capabilities
 * */
class RuntimeCapabilities {
	/**
	 * @param {StorageManager} storageManager - StoprageManager instance
	 */
	constructor(storageManager) {
		if (!storageManager) throw new Error('The Runtime Capabilities need the storageManager')

		/**
		 * @ignore
		 */
		this.storageManager = storageManager
		/**
		 * @ignore
		 */
		this.storageKey = 'capabilities'
		/**
		 * @ignore
		 */
		this.storageVersion = '1'
	}

	/**
	 * Get runtime capabilities
	 * @return {Object}
	 */
	getRuntimeCapabilities() {
		return this.storageManager.get(this.storageKey)
			.then(capabilities => {
				if (capabilities)
					return capabilities
				return this.update().then(key => this.storageManager.get(key))
			})
	}

	/**
	 * Check if a capability is available
	 * @param {string} cap - Capability
	 * @return {boolean}
	 */
	isAvailable(cap) {
		return this.getRuntimeCapabilities()
			.then(capabilities => {
				return capabilities[cap]
			})
	}

	/**
	 * Update capabilities
	 */
	update() {
		const capabilities = this._getCapabilities()
		return this.storageManager.set(this.storageKey, this.storageVersion, capabilities)
	}

	_getCapabilities() {
		return {
			browser: !!window,
			node: !window,
			windowSandbox: !!window,
			webrtc: webrtcSupport.support,
			datachannel: webrtcSupport.supportDataChannel
		}
	}
}

export default RuntimeCapabilities
