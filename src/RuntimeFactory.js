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
//import PersistenceManager from 'service-framework/dist/PersistenceManager';
import { createSandbox } from './Sandboxes';
import SandboxApp from './SandboxApp';
import Request from './Request';
import RuntimeCapabilities from './RuntimeCapabilities';
import StorageManager from 'runtime-core/dist/StorageManager';
import Dexie from 'dexie';

import 'dexie-observable';
import 'dexie-syncable';

import SyncClient from 'sync-client/dist/sync-client';
import { sendNotification } from './core';

//import { RuntimeCatalogue } from 'service-framework/dist/RuntimeCatalogue';

/**
 * Is a bridge to isolate the runtime from the specific platform
 * @typedef {Object} RuntimeFactory
 * @property {function():Sandbox} createSandbox Creates a new Sandbox
 * @property {function():SandboxApp} createAppSandbox Creates a new SandboxApp
 * @property {function():Request} createHttpRequest Creates a new Request object
 * @property {function():RuntimeCatalogue} createRuntimeCatalogue Creates a new RuntimeCatalogue
 * @property {function(Encoded data: string):string} atob Returns the string decoded
 * @property {function():PersistenceManager} persistenceManager Returns a new PersistenceManager
 * @property {function():StorageManager} storageManager Returns a new StorageManager
 * @property {function():RuntimeCapabilities} runtimeCapabilities Returns a new RuntimeCapabilities
 */
export default {
  createSandbox(constraints) {
    return createSandbox(constraints);
  },

  createAppSandbox() {
    return new SandboxApp();
  },

  createHttpRequest() {
    let request = new Request();
    return request;
  },

  /*
  createRuntimeCatalogue() {
    if (!this.catalogue) { this.catalogue = new RuntimeCatalogue(this); }

    return this.catalogue;
  },*/

  atob(b64) {
    return atob(b64);
  },

  /*
  persistenceManager() {
    let localStorage = window.localStorage;
    return new PersistenceManager(localStorage);
  },*/
  storageManager(name, schemas, runtimeUA, remote = false) {

    if (!this.databases) { this.databases = {}; }
    if (!this.storeManager) { this.storeManager = {}; }

    // To make the storage persitent and now allow the system clear the storage when is under pressure;
    if (navigator && navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then(function(persistent) {
        if (persistent) {
          console.log('Storage will not be cleared except by explicit user action');
        } else {
          console.log('Storage may be cleared by the UA under storage pressure.');
          sendNotification('Storage may be cleared by the UA under storage pressure.');
        }
      });
    }

    // Using the implementation of Service Framework
    // Dexie is the IndexDB Wrapper
    if (!this.databases.hasOwnProperty(name)) {

      let stores =  {};

      if (schemas) {
        stores = schemas;
      } else {
        stores[name] = 'key,version,value';
      }

      if (!remote) {
        this.databases[name] =  new Dexie(name, {addons: []});
        this.databases[name].version(1).stores(stores);
      } else {

        let versions = [{
          version: 1,
          stores: stores
        }];

        this.databases[name] =  new SyncClient(name, versions);
      }
    }

    if (!this.storeManager.hasOwnProperty(name)) {
      this.storeManager[name] = new StorageManager(this.databases[name], name, schemas, runtimeUA, 1, remote);
    }
    if (remote) this.storeManager[name].remote = remote;

    return this.storeManager[name];
  },

  runtimeCapabilities() {

    if (!this.capabilitiesManager) {
      let storageManager = this.storageManager('capabilities');
      this.capabilitiesManager = new RuntimeCapabilities(storageManager);
    }

    return this.capabilitiesManager;
  }
};
