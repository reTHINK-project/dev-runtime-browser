import when from 'when'
import { expect } from 'chai'
import RuntimeCapabilities from '../src/RuntimeCapabilities'

let storageManager, runtimeCapabilities
const caps = {
	browser: true,
	node: false,
	mic: true,
	camera: true
}

describe('RuntimeCapabilities', () => {
	beforeEach(() => {
		storageManager = {
			get: () => when(caps),
			set: (key, version, value) => {}
		}
		runtimeCapabilities = new RuntimeCapabilities(storageManager)
	})

	//## getRuntimeCapabilities
	//Returns as a promise RuntimeCapabilities json object with all available capabilities of the runtime.<br/>
	//If it was not yet persisted in the Storage Manager it collects all required info from the platform and saves in the storage manager.<br/>
	//returns Promise(object)

	describe('getRuntimeCapabilities', () => {
		it('should return all available capabilities of the runtime', (done) => {
			runtimeCapabilities.getRuntimeCapabilities()
				.then(capabilities => {
					expect(capabilities).to.be.eql(caps)
					done()
				}).catch(console.log)
		})

		it('should persist the capabilities in the storagemanager', (done) => {
			storageManager = {
				get: () => when(),
				set: (key, version, value) => {
					expect(value).to.be.eql(caps)
					done()
					return when(key)
				}
			}
			runtimeCapabilities = new RuntimeCapabilities(storageManager)
			runtimeCapabilities.getRuntimeCapabilities()
		})
	})

	//## isAvailable
	//returns as a promise a boolean according to available capabilities or undefined if it doesn't exist.<br/>
	//returns Promise(boolean?)
	describe('isAvailable', () => {
		it('should return is a capability is available', (done) => {
			runtimeCapabilities.isAvailable('browser')
				.then(available => {
					expect(available).to.be.true
					done()
				})

		})
	})

	//## update
	//it refreshes previously collected capabilities and updates the storage manager
	describe('update', () => {
		it('should refresh previously collected values', (done) => {
			storageManager = {
				set: (key, version, value) => {
					expect(value).to.be.eql(caps)
					done()
					return when(key)
				}
			}
			runtimeCapabilities = new RuntimeCapabilities(storageManager)
			runtimeCapabilities.update()
		})
	})
})

