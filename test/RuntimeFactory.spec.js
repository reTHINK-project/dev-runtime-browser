import { expect } from 'chai'
import runtimeFactory from '../src/RuntimeFactory'
import { SandboxWorker } from '../src/Sandboxes'

describe('RuntimeFactory', () => {
	const data = [
		{sandbox_name: 'SandboxWorker', sandbox: SandboxWorker, constraints: { mic: false, camera: false }}
	]

	describe('createSandbox', () => {
		for(let d of data) {
			it(`should return ${d.sandbox_name} for a component with this constraints ${JSON.stringify(d.constraints)}`, (done) => {
				runtimeFactory.createSandbox(d.constraints)
					.then(sandbox => {
						expect(sandbox).to.be.an.instanceof(d.sandbox)
						done()
					})
			})
		}

		it('should throw an error if none sandbox match the constraints', (done) => {
			runtimeFactory.createSandbox({mic:true})
				.catch(() => {
						done()
				})
		})
	})
})
