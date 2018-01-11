import chai from 'chai';
import rethink from '../src/RuntimeLoader';

let expect = chai.expect;

describe('Service framework', function() {

  describe('Require Hyperty', function() {
    it('should returns required hyperty', function(done) {
      let runtime = rethink.install({
        domain: 'localhost',
        runtimeURL: 'https://catalogue.localhost/.well-known/runtime/Runtime',
        development: true})
        .then(function(runtime) {
          console.log('Runtime?!', runtime);
          let hyURL = 'https://catalogue.localhost/.well-known/hyperty/Connector';
          let hyperty = runtime.requireHyperty(hyURL);
          expect(hyperty).to.not.be.undefined;
          done();
        });
    });
  })
});
