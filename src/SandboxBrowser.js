import { Sandbox } from 'runtime-core';

export default class SandBoxWebWorker extends Sandbox{
   constructor(script){
     super();
     if(!!Worker){
         this._worker = new Worker(script);
         this._worker.addEventListener('message', function(e){
             this._onMessage(e.data);
         }.bind(this));
         this._worker.postMessage('');
     }else{
         throw new Error('Your environment does not support worker \n', e);
     }
   }

   _onPostMessage(msg){
       this._worker.postMessage(msg);
   }
}
