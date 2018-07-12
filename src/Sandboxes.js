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
import { Sandbox, SandboxType } from 'runtime-core/dist/sandbox';
import MiniBus from 'runtime-core/dist/minibus';
import RuntimeFactory from './RuntimeFactory';


export class SandboxWindow extends Sandbox {
  static capabilities() {
    return RuntimeFactory.runtimeCapabilities().getRuntimeCapabilities();
  }

  static new(capabilities) {
    return new SandboxWindow(capabilities);
  }

  constructor(capabilities) {
    super(capabilities);

    this.type = SandboxType.WINDOW;
    this.channel = new MessageChannel();

    this.channel.port1.onmessage = function(e) {
      this._onMessage(e.data);
    }.bind(this);

    parent.postMessage({ to: 'runtime:createSandboxWindow' }, '*', [this.channel.port2]);
  }

  _onPostMessage(msg) {
    this.channel.port1.postMessage(msg);
  }
}

export function createSandbox(constraints) {
  const sandboxes = [SandboxWindow];
  let diff = (a, b) => Object.keys(a).filter(x => a[x] !== b[x]);

  return Promise.all(sandboxes.map(s => s.capabilities().then(c=>{ return {capabilities: c, sandbox: s}; })))
    .then(sbs => {
      let i = 0;
      while (i < sbs.length) {
        if (diff(constraints, sbs[i].capabilities).length === 0) {
          let capabilities = sbs[i].capabilities;
          let sandbox = sbs[i].sandbox.new(capabilities);
          return sandbox;
        }

        i++;
      }
      throw new Error('None of supported sandboxes match your constraints');
    });
}
