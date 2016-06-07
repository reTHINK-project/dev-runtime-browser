import { ready, errorMessage } from './support';

// polyfills
import 'babel-polyfill';
import 'indexeddbshim';
import 'mutationobserver-shim';
import 'object.observe';
import 'array.observe';

import rethink from '../bin/rethink';

// reTHINK modules
// import RuntimeUA from 'runtime-core/dist/runtimeUA';

// import SandboxFactory from '../resources/sandboxes/SandboxFactory';
// let sandboxFactory = new SandboxFactory();
// let avatar = 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg';

// You can change this at your own domain
let domain = "localhost";
window.runtime = {
  "domain": domain
}

// Hack because the GraphConnector jsrsasign module;
window.KJUR = {};

// Check if the document is ready
if (document.readyState === 'complete') {
  documentReady();
} else {
  window.addEventListener('onload', documentReady, false);
  document.addEventListener('DOMContentLoaded', documentReady, false);
}

var runtimeLoader;

function documentReady() {
  // ready();
  let hypertyHolder = $('.hyperties');
  hypertyHolder.removeClass('hide');
    window.addEventListener("message", printContact, false);

  rethink.install({
    "domain": domain,
    development: true
  }).then(runtimeInstalled).catch(errorMessage);
}

function printContact(event){
  if(event.data.to == "runtime:getContact"){
    let userFirstName = event.data.body.firstName;
    let userLastName = event.data.body.lastName;
    $('.testResult').append("<h3>The user's firstName is <u>"+ userFirstName+"<h3></u> and Last Name is <u>"+ userLastName+"</u></h3>");
  }else if(event.data.to =='runtime:checkGUID'){
    let found =event.data.check; // true if there ist contacts list associated with the GUID,
    let FoF = event.data.usersFoF;

    console.log('@@@ Recrevived Postmessage' + event.data.to);

    let DirectContact =event.data.usersDirectContact;
    if (event.data.check){  
      console.log('FoF : '+ FoF);
      console.log(' DirectContact : '+ DirectContact);
    }else if(!event.data.check){
      console.log('User with no contacts \n GUID: ' + event.data.body.GUID )
    };

  }
}


function runtimeInstalled(runtime) {
  console.log(runtime);
  window.runtime = {"runtime": runtime};
  $('.getDet').on('click', (e)=>{
    runtime.generateGUID();
    runtime.addUserID('facebook.com/felix');
    runtime.removeUserID('facebook.com/felix');
    runtime.addContact('budc8fucd8cdsc98dc899dc', 'reThinkUser', 'Test');
    runtime.getContact('reThinkUser');
    runtime.checkGUID('budc8fucd8cdsc98dc899dc');
    runtime.removeContact('budc8fucd8cdsc98dc899dc');
    runtime.checkGUID('budc8fucd8cdsc98dc899dc');
    runtime.useGUID('grey climb demon snap shove fruit grasp hum self grey climb demon snap shove fruit grasp');
    runtime.sendGlobalRegistryRecord("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ");
    runtime.queryGlobalRegistry('budc8fucd8cdsc98dc899dc');
    runtime.calculateBloomFilter1Hop();
    runtime.signGlobalRegistryRecord();
  //let hypertyObserver = 'hyperty-catalogue://' + runtime.domain + '/.well-known/hyperty/HelloWorldObserver';

  // Load First Hyperty
  //runtime.requireHyperty(hypertyObserver).then(hypertyObserverDeployed).catch(function(reason) {
  //  errorMessage(reason);
  //});
  });
}
