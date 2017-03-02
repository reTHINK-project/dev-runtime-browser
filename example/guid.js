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
let domain = "felix.dev"; // change to your URL!
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
  window.addEventListener("message", messageHandler, false);

  rethink.install({
    "domain": domain,
    development: true
  }).then(runtimeInstalled).catch(errorMessage);
}

function messageHandler(event) {
  if (event.data.to == "runtime:getContact") {
    let userList = event.data.body.userList;
    $('.testResult')
      .html('<h4>Matching Contacts are: </h4>');

    for (var i = 0; i < userList.length; i++) {
      $('.testResult')
        .append('<h5><b>First Name: </b>' + userList[i]._firstName + ', <b>Last Name: </b>' + userList[i]._lastName + '</h5>');
    }

  } else if (event.data.to == 'runtime:checkGUID') {
    let found = event.data.body.found; // true if there ist contacts list associated with the GUID,
    let FoF = event.data.body.usersFoF;
    console.log('@@@ Recrevived Postmessage' + event.data.to);
    let DirectContact = event.data.usersDirectContact;

    if (event.data.check) {
      console.log('FoF : ' + FoF);
      console.log(' DirectContact : ' + DirectContact);
    } else if (!event.data.check) {
      console.log('User with no contacts \n GUID: ' + event.data.body.GUID)
    };

  } else if (event.data.to === 'runtime:getAllContacts') {
    let contactsList = event.data.body.result;

    if (contactsList.length != 0) {
      $('.testResult')
        .html('<h4>List of all Contacts: </h4>');

      for (var i = 0; i < contactsList.length; i++) {
        $('.testResult')
          .append('<h5><b>First Name: </b>' + contactsList[i]._firstName + ', <b>Last Name: </b>' + contactsList[i]._lastName + '</h5>');
      }

    }
  } else if (event.data.to === 'runtime:getGroup') {
    let tempGroup = event.data.body.result;
    if (tempGroup.length != 0) {
      $('.testResult')
        .html("<h5>Group members are: </h5>");
      for (var i = 0; i < tempGroup.length; i++) {
        $('.testResult')
          .append('<h5>member\'s name is :' + tempGroup[i]._firstName + ' </h5>');
      };
    }
  } else if (event.data.to === "runtime:getGroupNames") {
    let tempGroupNames = event.data.body.result;
    console.info(tempGroupNames);

    if (tempGroupNames.length != 0) {
      $('.testResult')
        .html("<h5>Group names are: </h5>");
      for (var i = 0; i < tempGroupNames.length; i++) {
        $('.testResult')
          .append('<h5>' + tempGroupNames[i] + ' </h5>');
      };
    }

  } else if (event.data.to === 'runtime:generateGUID') {
    console.log('generateGUID: ' + event.data.body.guid);
  } else if (event.data.to === 'runtime:queryGlobalRegistry') {
    console.info(event.data.body.queriedContact);
    if(event.data.body.queriedContact._userIDs !== null) {
      $('.testResult')
        .html("<h5>Queried Contact's userIDs are "+event.data.body.queriedContact._userIDs[0]+" and "+event.data.body.queriedContact._userIDs[1]+" </h5>");
    } else {
      $('.testResult')
        .html("<h5>Error is  "+queriedContact+" </h5>");
    }
  } else if (event.data.to === 'runtime:useGUID') {
    let record = event.data.body.record;
    console.info(record);
  } else if (event.data.to === 'runtime:sendGlobalRegistryRecord') {
    let record = event.data.body.record;
    console.info(record);
  } else if (event.data.to === 'runtime:setContactUserIDs') {
    let success = event.data.body.result;
    if (success) {
      $('.testResult')
        .html("<h5>Succesfuly added user ID</h5>");
      //console.log('Succesfuly added group name')
    } else {
      $('.testResult')
        .html("<h5>!!!!Error: UserID already exist or the contact with GUID does not exist  </h5>");
      //console.log('Group name was not added!')
    };
  } else if (event.data.to === 'runtime:getContactUserIDs') {
    let success = event.data.body.result;
    if (success != 'Contact Does not exist') {
      $('.testResult')
        .html("<h5>User IDs are : </h5>");
      for (var i = 0; i < success.length; i++) {
        $('.testResult')
          .append("<h5><b>"+ success[i] +" </b> </h5>");
      }
      //console.log('Succesfuly added group name')
    } else {
      $('.testResult')
        .html("<h5>!!!!Error: Contact with this guid doesnot exist </h5>");
      //console.log('Group name was not added!')
    };
  } else if (event.data.to === 'runtime:getOwner') {
    $('.testResult')
        .html("<h5>Owner's first and last name is : " + event.data.body.owner._firstName + " and " + event.data.body.owner._lastName + " respectively.</h5>");
  } else if (event.data.to === 'runtime:addGroupName') {

    if (event.data.body.result) {
      $('.testResult')
        .html("<h5>Succesfuly added group name </h5>");
      //console.log('Succesfuly added group name')
    } else {
      $('.testResult')
        .html("<h5>!!!!Error: Guid does not exist or groupName already exists. <u>Tip:</u> please first add the contact with this GUID  </h5>");
      //console.log('Group name was not added!')
    };

  } else if (event.data.to === 'runtime:removeGroupName') {

    if (event.data.body.result) {
      $('.testResult')
        .html("<h5>Succesfuly removed group name </h5>");
      //console.log('Succesfuly removed group name')
    } else {
      $('.testResult')
        .html("<h5>!!!!Error: Guid does not exist or groupName does not exist <u>Tip:</u> please add the contact with this GUID or add the groupname to this contact</h5>");
      //console.log('Group name was not removed!')
    };

  }
}

function runtimeInstalled(runtime) {
  console.info(runtime);
  window.runtime = {"runtime": runtime};

  $('.getDet').on('click', (e)=>{
    runtime.generateGUID();
    runtime.addUserID('facebook.com/felix','google.com');
    runtime.removeUserID('facebook.com/felix','google.com');
    runtime.addContact('budc8fucd8cdsc98dc899dc', 'reThinkUser', 'Test');
    runtime.getContact('reThinkUser');
    runtime.checkGUID('budc8fucd8cdsc98dc899dc');
    runtime.removeContact('budc8fucd8cdsc98dc899dc');
    //adding contact again to do further testing
    runtime.addContact('budc8fucd8cdsc98dc899dc', 'reThinkUser', 'Test');
    runtime.checkGUID('budc8fucd8cdsc98dc899dc');
    runtime.useGUID('grey climb demon snap shove fruit grasp hum self grey climb demon snap shove fruit grasp');
    runtime.sendGlobalRegistryRecord("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ");
    runtime.queryGlobalRegistry('budc8fucd8cdsc98dc899dc');
    runtime.calculateBloomFilter1Hop();
    //passing string instead of bloomfilter just for testing
    runtime.setBloomFilter1HopContact('budc8fucd8cdsc98dc899dc', 'bloomFilter');
    runtime.signGlobalRegistryRecord();
    runtime.addContact('jdfjhdskfkdshfbdkfkjff989e', 'TestingNew', 'runtime');
    runtime.editContact('jdfjhdskfkdshfbdkfkjff989e', 'TestingNew', 'runtime', 'hfjdsbsjfhdiusfbuidshfcudss87cv7ds8c7d', true);
    runtime.addContact('123456', 'john', 'snow');
    runtime.addContact('1234', 'Joey', 'Landwunder');
    runtime.addGroupName('123456', 'Winterfell');
    runtime.addGroupName('1234', 'Winterfell');
    runtime.getGroup('Winterfell')
    runtime.removeGroupName('123456', 'Winterfell');
    runtime.getAllContacts();
    runtime.setLocation('123456', 'Berlin');
    runtime.removeLocation('123456');
    runtime.setDefaults('a','b','c');
  //let hypertyObserver = 'hyperty-catalogue://' + runtime.domain + '/.well-known/hyperty/HelloWorldObserver';

  // Load First Hyperty
  //runtime.requireHyperty(hypertyObserver).then(hypertyObserverDeployed).catch(function(reason) {
  //  errorMessage(reason);
  //});
  });

$('#getContact')
  .on('click', () => {
    runtime.getContact('reThinkUser');
  });
$('#getFewContacts')
  .on('click', () => {
    runtime.getContact('jo');
  });

$('#useGUID')
  .on('click', () => {
    runtime.useGUID('grey climb demon snap shove fruit grasp hum self grey climb demon snap shove fruit grasp');
  });

$('#generateGUID')
  .on('click', () => {
    runtime.generateGUID();

  });

$('#addUserID')
  .on('click', () => {
    runtime.addUserID('facebook.com/felix','google.com');

  });

$('#removeUserID')
  .on('click', () => {
    runtime.removeUserID('facebook.com/felix','google.com');

  });

$('#addContact')
  .on('click', () => {
    runtime.addContact('budc8fucd8cdsc98dc899dc', 'reThinkUser', 'Test');
    runtime.addContact('budc8fucd8cdsc98dc899dctest', 'reThinkUserSecondContact', 'Test');
    runtime.addContact('123456', 'john', 'snow');
    runtime.addContact('1234', 'Joey', 'Landwunder');

  });

$('#removeContact')
  .on('click', () => {
    runtime.removeContact('budc8fucd8cdsc98dc899dc');
    runtime.removeContact('123456');
    runtime.removeContact('1234');

  });

$('#getAllContacts')
  .on('click', () => {
    runtime.getAllContacts();
  });

$('#addGroupName')
  .on('click', () => {
    runtime.addGroupName('123456', 'Winterfell');
    runtime.addGroupName('1234', 'Winterfell');
    runtime.addGroupName('budc8fucd8cdsc98dc899dc', 'Football');

  });

$('#getGroup')
  .on('click', () => {
    runtime.getGroup('Winterfell')


  });
$('#getGroupNames')
  .on('click', () => {
    runtime.getGroupNames();

  });
$('#removeGroupName')
  .on('click', () => {
    runtime.removeGroupName('123456', 'Winterfell');

  });

$('#setLocation')
  .on('click', () => {
    runtime.setLocation('budc8fucd8cdsc98dc899dc', 'Berlin');


  });

$('#removeLocation')
  .on('click', () => {
    runtime.removeLocation('budc8fucd8cdsc98dc899dc');

  });
$('#queryGlobal')
  .on('click', () => {
    runtime.queryGlobalRegistry('bXBhhJm-o40WBIcXQQECH0-_MqNux6p3ANxt7lFA-Mg');

  });
$('#getOwner')
  .on('click', () => {
    runtime.getOwner();

  });
$('#setGetContactUserID')
    .on('click', () => {
      runtime.addContact('budc8fucd8cdsc98dc899dcadduserIDtest', 'contactUserIDTest', 'Test');
      runtime.setContactUserIDs('budc8fucd8cdsc98dc899dcadduserIDtest', 'test.com/test','google.com');
      runtime.setContactUserIDs('budc8fucd8cdsc98dc899dcadduserIDtest', 'test.com/test','google.com');
      runtime.setContactUserIDs('budc8fucd8cdsc98dc899dcadduserIDtest', 'facebook.com/contact','google.com');
      runtime.getContactUserIDs('budc8fucd8cdsc98dc899dcadduserIDtest');
  });
$('#setOwner')
  .on('click', () => {
    runtime.setOwnerName('OwnerFirstNameJohn', 'OwnerLastNameKennedy').then(function (result){
      console.log(" result from promise is " + result);
    });
  });
$('#sendGlobalRegistryRecord')
  .on('click', () => {
    runtime.sendGlobalRegistryRecord("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ");

});
}
