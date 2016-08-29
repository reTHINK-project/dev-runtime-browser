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
import URI from 'urijs';
import PoliciesGUI from './admin/PoliciesGUI';
import RuntimeFactory from './RuntimeFactory';

<<<<<<< HEAD
function returnHyperty(source, hyperty) {
    source.postMessage({
        to: 'runtime:loadedHyperty',
        body: hyperty
    }, '*')
=======
try{
    window.cordova = parent.cordova !== undefined
    if(window.cordova)
        window.open = function(url){ return parent.cordova.InAppBrowser.open(url, '_blank', 'location=no,toolbar=no')};
}catch(err){ console.log('cordova not supported') }

function returnHyperty(source, hyperty){
    source.postMessage({to: 'runtime:loadedHyperty', body: hyperty}, '*')
>>>>>>> refs/remotes/origin/master
}

function searchHyperty(runtime, descriptor) {
    let hyperty = undefined;
    let index = 0;
<<<<<<< HEAD
    while (!!hyperty) {
        if (runtime.registry.hypertiesList[index] === descriptor)
=======
    while(!hyperty && index<runtime.registry.hypertiesList.length){
        if(runtime.registry.hypertiesList[index].descriptor === descriptor)
>>>>>>> refs/remotes/origin/master
            hyperty = runtime.registry.hypertiesList[index]

        index++
    }

    return hyperty;
}

let parameters = new URI(window.location).search(true)
let runtimeURL = parameters.runtime
let development = parameters.development === "true"
let catalogue = RuntimeFactory.createRuntimeCatalogue(development)

catalogue.getRuntimeDescriptor(runtimeURL)
    .then(function(descriptor) {
        let sourcePackageURL = descriptor.sourcePackageURL;
        if (sourcePackageURL === '/sourcePackage') {
            return descriptor.sourcePackage;
        }

        return catalogue.getSourcePackageFromURL(sourcePackageURL);
    })
    .then(function(sourcePackage) {
        eval.apply(window, [sourcePackage.sourceCode])

        let runtime = new Runtime(RuntimeFactory, window.location.host);
<<<<<<< HEAD
        window.addEventListener('message', function(event) {
            if (event.data.to === 'core:loadHyperty') {
=======
        let gui = new PoliciesGUI(runtime.policyEngine);

        window.addEventListener('message', function(event){
            if(event.data.to==='core:loadHyperty'){
>>>>>>> refs/remotes/origin/master
                let descriptor = event.data.body.descriptor;
                let hyperty = searchHyperty(runtime, descriptor);

                if (hyperty) {
                    returnHyperty(event.source, {
                        runtimeHypertyURL: hyperty.hypertyURL
                    });
                } else {
                    runtime.loadHyperty(descriptor)
                        .then(returnHyperty.bind(null, event.source));
                }
            

            }else if(event.data.to === 'graph:getAllContacts'){

                console.log("##Inside core: returning all contacts");
                let contactsList = runtime.graphConnector.getAllContacts();

                  if(contactsList.length !=0) {
                    console.log("List of all contacts: ");
                    for (var i = 0; i < contactsList.length; i++) {
                        console.log('First Name: '+contactsList[i].firstName+' Last Name: '+contactsList[i].lastName);
                    }
                    parent.postMessage({to:'runtime:getAllContacts', body:{"success" : true, "result" :contactsList}}, '*');
                } else {
                    console.log("!!!! Error : No contacts in the contact list, Please add contacts");
                    parent.postMessage({to:'runtime:getAllContacts', body:{"success" : false, "result" :contactsList}}, '*');
                }

            }else if(event.data.to === 'graph:removeLocation'){
                let tmpGuid= event.data.body.guid;

                console.log("##Inside core: removing location from the "+ tmpGuid);
                let result=runtime.graphConnector.removeLocation(tmpGuid);
                if(result){
                    console.log('Location successfully removed');
                    parent.postMessage({to:'runtime:removeLocation', body:{"success" : result}},'*');
                }else{
                    console.log('Location has not been removed ');
                    parent.postMessage({to:'runtime:removeLocation', body:{"success" : result}},'*');
                }
                //parent.postMessage({to:'runtime:removeLocation', body:{"result" :result}}, '*');


            }else if(event.data.to === 'graph:setLocation') {
                let tmpGuid= event.data.body.guid;
                let tmpLoc= event.data.body.locationName;

                console.log("##Inside core: setting location- "+tmpLoc +"  + for: "+ tmpGuid);
                let result = runtime.graphConnector.setLocation(tmpGuid,tmpLoc);
                console.log('User found? - '+result);
                if(result){
                    console.log('Location \"'+tmpLoc+'\"" has been successfully set for the contact with GUID '+tmpGuid);
                    parent.postMessage({to:'runtime:setLocation', body:{"success" : result}},'*');
                } else {
                    console.log('Location \"'+tmpLoc+'\"" has not been set for the contact with GUID '+tmpGuid);
                    parent.postMessage({to:'runtime:setLocation', body:{"success" : result}},'*');
                }
               
            }else if (event.data.to === 'graph:getGroup'){  

                let tmpGroup = event.data.body.groupName;
                console.log("##Inside core: getting members of the: "+ tmpGroup)
                let result = runtime.graphConnector.getGroup(tmpGroup);
                if(result.length !=0) {
                    console.log("!!!!Group members are: ");
                    for (var i = 0; i < result.length; i++) {
                        console.log(i+'. '+result[i].firstName);
                    };
                    parent.postMessage({to:'runtime:getGroup',body:{"found" : true, "result": result}},'*');
                } else {
                    console.log('!!!!No group members for groupname \"'+tmpGroup+'\"');
                    parent.postMessage({to:'runtime:getGroup',body:{"found" : false, "result": result}},'*');
                }

            }else if(event.data.to === 'graph:getGroupNames') {

                console.log("##Inside core: getting all group names")
                let result= runtime.graphConnector.getGroupNames();
                if(result.length != 0){
                    for (var i = 0; i < result.length; i++) {
                        console.log(result[i]);
                    };
                    parent.postMessage({to:'runtime:getGroupNames',body:{"found" : true, "result": result}},'*');
                } else {
                    console.log("!!!!Error: No group names Yet. Tip: Please add contacts and add group names!!!!")
                    parent.postMessage({to:'runtime:getGroupNames',body:{"found" : false, "result": result}},'*');
                }
                
            }else if(event.data.to === 'graph:addGroupName') {
                let tmpGuid= event.data.body.guid;
                let tmpGroup= event.data.body.groupName;
                // post message 
                console.log("##Inside core: adding a groupName: " + tmpGroup +" to "+tmpGuid);
                let success = runtime.graphConnector.addGroupName(tmpGuid,tmpGroup);
                if(success){
                    console.log("!!!!Added \""+ tmpGroup +"\" successfully to \""+ tmpGuid +"\"!!!!");
                } else {
                    console.log("!!!!Error: Guid \""+ tmpGuid +"\" does not exist or groupName \""+ tmpGroup +"\" already exists");
                }
                parent.postMessage({to:'runtime:addGroupName', body:{"result" :success}}, '*');
            }else if(event.data.to === 'graph:removeGroupName') {
                let tmpGuid= event.data.body.guid;
                let tmpGroup= event.data.body.groupName;
                console.log("##Inside core: Removing a groupName: " + tmpGroup +" to "+tmpGuid);
                let success = runtime.graphConnector.removeGroupName(tmpGuid,tmpGroup);
                if(success){
                    console.log("!!!!Removed \""+ tmpGroup +"\" successfully from \""+ tmpGuid +"\"!!!!");
                } else {
                    console.log("!!!!Error: Guid \""+ tmpGuid +"\" does not exist or groupName \""+ tmpGroup +"\" does not exist");
                }
                parent.postMessage({to:'runtime:removeGroupName', body:{"result" :success}}, '*');
            } else if (event.data.to === 'core:loadStub') {
                runtime.loadStub(event.data.body.domain)
<<<<<<< HEAD
            } else if (event.data.to === 'graph:generateGUID') {
                console.log('##try generating GUID');
                let userGUID = runtime.graphConnector.generateGUID();
                if (userGUID != null) {
                    parent.postMessage({to:'runtime:generateGUID', body:{"success" : true, "guid" : userGUID, }}, '*');
                    console.log('## GUID generated! ')
                }else {
                    console.log('##Could not generate GUID!')
                    parent.postMessage({to:'runtime:generateGUID', body:{"success" : false, "guid" : userGUID, }}, '*');
                }                
            } else if (event.data.to === 'graph:addUserID') {
                console.log('##Inside core: Adding userID: '+ event.data.body.userID);
                let success = runtime.graphConnector.addUserID(event.data.body.userID);
                if(success) {
                    console.log("!!!!Added \""+ event.data.body.userID +"\" successfully!!!!");
                } else {
                    console.log("!!!Error: \""+ event.data.body.userID +"\" already exists!!!");
                }
                parent.postMessage({to:'runtime:addUserID', body:{"result" : success}}, '*');
            } else if (event.data.to === 'graph:removeUserID') {
                let userID = event.data.body.userID;
                console.log('##Inside core: Removing userID: ' + userID);
                let success = runtime.graphConnector.removeUserID(userID);
                if(success){
                    console.log("!!!!Removed \""+ event.data.body.userID +"\" successfully!!!!");
                } else {
                    console.log("!!!!Error: \""+ event.data.body.userID +"\" does not exist!!!!");
                }
                parent.postMessage({to:'runtime:removeUserID', body:{"result" : success}}, '*');
            } else if (event.data.to === 'graph:addContact') {
                let guid = event.data.body.guid;
                let fname = event.data.body.fname;
                let lname = event.data.body.lname;
                console.log('##Inside Core: Adding a new contact with firstname: ' + fname+' '+lname+' GUDI: '+ guid);
                let success = runtime.graphConnector.addContact(guid, fname, lname);
                parent.postMessage({to:'runtime:addContact', body:{"result" : success}}, '*');
            } else if (event.data.to === 'graph:getContact') {
                let username = event.data.body.username;
                console.log("##Inside core: finding user with username: " + username);
                let userList = runtime.graphConnector.getContact(username);
                if(typeof userList != 'undefined'){
                    if (userList.length == 0) {
                        console.log('!!!!Contact with name \"'+username +'\" not found!!!!');
                        parent.postMessage({to:'runtime:getContact', body:{"found" : false}}, '*');
                    } else if (userList.length >= 1) {
                        console.log("!!!!Found matching users: ");
                        for (var i = 0; i < userList.length; i++) {
                          console.log('First Name: '+userList[i].firstName+' Last Name: '+userList[i].lastName);
                        }
                        parent.postMessage({to:'runtime:getContact', body:{"found" : true, "userList": userList}}, '*');
                    }
                } 
            } else if (event.data.to === 'graph:checkGUID'){
                let guid = event.data.body.guid;

                console.log("##Inside core: looking conctacts of user with GUID: " + guid);
                
                let usersDirectContact = runtime.graphConnector.checkGUID(guid)[0][0];
                let usersFoF = runtime.graphConnector.checkGUID(guid)[0][1];

                if (usersDirectContact != null || usersDirectContact != '') {
                    console.log("Direct Friend found from given GUID: \n FirstName " + usersDirectContact.firstName +
                        "\n LastName " + usersDirectContact.lastName +
                        "\n GUID " + usersDirectContact.guid);
                    parent.postMessage({to:'runtime:checkGUID', body :{"found": true, 'GUID': guid, 'usersFoF': usersFoF,'usersDirectContact':usersDirectContact}}, '*');
                    // Returns 2 Array of conected friends
                   //parent.postMessage({to:'runtime:checkGUID', body:{"userDirectContacts" : usersDirectContact, "usersFoF" : usersFoF}}, '*');
                } else {
                    console.log("##This user does not have any contacts stored!!");
                    parent.postMessage({to:'runtime:checkGUID', body :{"found": false, 'GUID': guid}}, '*');

                }
            } else if (event.data.to === 'graph:removeContact') {
                let guid = event.data.body.guid;
                console.log("##Inside core: Deleting user with GUID: " + guid);

                let success = runtime.graphConnector.removeContact(guid);
                if(success){
                    console.log("!!!!Contact with \""+ guid +"\" has been deleted successfully!!!!");
                } else {
                    console.log("!!!!Contact with \""+ guid +"\" does not exist!!!!");
                }
                parent.postMessage({to:'runtime:removeContact', body :{"result": success}}, '*');
            } else if (event.data.to === 'graph:useGUID') {
                let seed = event.data.body.seed;
                console.log("##Inside core: generating keys using seed: " + seed);
                let globalRegistryRecord = runtime.graphConnector.useGUID(seed).then(function (response){
                    return response;
                }).catch (function (error){
                    return error;
                });
                console.info(globalRegistryRecord);
                parent.postMessage({to:'runtime:useGUID', body :{"record": globalRegistryRecord}}, '*');
                console.log("##Seed is created");
            } else if (event.data.to === 'graph:sendGlobalRegistryRecord') {
                let jwt = event.data.body.jwt;
                console.log("##Inside core: Sending JWT with value: " + jwt);
                let globalregistry = runtime.graphConnector.sendGlobalRegistryRecord(jwt).then(function (response) {
                    return response;
                }).catch (function (error){
                    return error;
                });
                console.log('global resgistry is ');
                console.info(globalregistry);
                parent.postMessage({to:'runtime:sendGlobalRegistryRecord', body :{"record": globalregistry}}, '*');
            } else if (event.data.to === 'graph:queryGlobalRegistry') {
                let guid = event.data.body.guid;
                console.log("##Inside core: Querying with GUID: " + guid);
                let queriedContact = runtime.graphConnector.queryGlobalRegistry(guid).then(function (queriedContact){
                    return queriedContact;
                }).catch (function (error){
                    return error;
                });
                parent.postMessage({to:'runtime:queryGlobalRegistry', body :{"queriedContact": queriedContact}}, '*');
            } else if (event.data.to === 'graph:calculateBloomFilter1Hop') {
                console.log("##Inside bloom filter");
                console.log("##Calculating Bloom filter : " + runtime.graphConnector.calculateBloomFilter1Hop());
            } else if (event.data.to === 'graph:setBloomFilter1HopContact') {
                console.log("##Inside set bloom filter");
                let guid = event.data.body.guid;
                let bloomFilterOwner = runtime.graphConnector.contactsBloomFilter1Hop;
                console.log("##setting the bloom filter for a contact : " + runtime.graphConnector.setBloomFilter1HopContact(guid, bloomFilterOwner));
            } else if (event.data.to === 'graph:getOwner') {
                console.log("##Inside core: get Owner Details");
                let owner = runtime.graphConnector.getOwner();
                if(owner == null){
                    parent.postMessage({to:'runtime:getOwner', body :{"success": false, "owner": owner}}, '*');
                } else {
                    console.log("!!!!Owner is: " + 
                        "\nFirstname " + owner.firstName +
                        "\nLast Name " + owner.lastName + 
                        "\nGUID "+ owner.guid +
                        "\nNo of groups " + owner.groups.length +
                        "\nResidence Location " + owner.residenceLocation +
                        "\nBloom filter " + owner.contactsBloomFilter1Hop +
                        "\nLast Calculations bloom filter " + owner.lastCalculationBloomFilter1Hop);
                    parent.postMessage({to:'runtime:getOwner', body :{"success": true, "owner": owner}}, '*');
                }
            } else if (event.data.to === 'graph:setOwnerName') {
                console.log("##Inside core: set Owner Details");
                let ownerFirstname = event.data.body.firstName;
                let ownerLastName = event.data.body.lastName;
                let success = runtime.graphConnector.setOwnerName(ownerFirstname, ownerLastName);
                if(success){
                    console.log('!!!! Successfully set owners firstName '+ ownerFirstname + ' and last name as ' + ownerLastName);
                    parent.postMessage({to:'runtime:setOwner', body :{"success": success}}, '*');
                } else {
                    console.log('!!!! Error: Setting of owners firstName as '+ ownerFirstname + ' and last name as ' + ownerLastName +' was unsuccessful');
                    parent.postMessage({to:'runtime:setOwner', body :{"success": success}}, '*');
                }
            } else if (event.data.to === 'graph:signGlobalRegistryRecord') {
                console.log("##Inside signing");
                console.log("##Signing and the returned JWT is : " + runtime.graphConnector.signGlobalRegistryRecord());
            } else if (event.data.to === 'graph:editContact') {
                console.log("##Inside Core: Edit Contact function to change guid, fname, lname and privacy");
                let guidOld = event.data.body.guidOld;
                let fname = event.data.body.fname;
                let lname = event.data.body.lname;
                let privStatus = event.data.body.privStatus;
                let guidNew = event.data.body.guidNew;
                let result = runtime.graphConnector.editContact(guidOld, fname, lname, guidNew, privStatus);
                console.log("##Old GUID is : " + guidOld +
                     "\nNew Guid is : " + result[0].guid +
                     "\nFirst Name is : " + result[0].firstName +
                     "\nLast Name is : " + result[0].lastName +
                     "\nPrivacy is : " + result[0].privateContact );
                if(result.length !=0){
                    parent.postMessage({to:'runtime:editContact', body :{"success": true, "contact": result}}, '*');
                } else {
                    parent.postMessage({to:'runtime:editContact', body :{"success": false, "contact": result}}, '*');
                }
            }

        }, false);
        parent.postMessage({
            to: 'runtime:installed',
            body: {}
        }, '*');
    });
=======
            }else if(event.data.to==='core:close'){
                runtime.close()
                    .then(event.source.postMessage({to: 'runtime:runtimeClosed', body: true}, '*'))
                    .catch(event.source.postMessage({to: 'runtime:runtimeClosed', body: false}, '*'))
            }

        }, false);
        window.addEventListener('beforeunload', (e) => {
            runtime.close()
        })
        parent.postMessage({to:'runtime:installed', body:{}}, '*');
    });
>>>>>>> refs/remotes/origin/master
