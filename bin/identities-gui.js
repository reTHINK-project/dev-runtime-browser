!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var t;t="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,t.identitiesGui=e()}}(function(){return function e(t,n,i){function o(a,d){if(!n[a]){if(!t[a]){var s="function"==typeof require&&require;if(!d&&s)return s(a,!0);if(r)return r(a,!0);var u=new Error("Cannot find module '"+a+"'");throw u.code="MODULE_NOT_FOUND",u}var c=n[a]={exports:{}};t[a][0].call(c.exports,function(e){var n=t[a][1][e];return o(n?n:e)},c,c.exports,e,t,n,i)}return n[a].exports}for(var r="function"==typeof require&&require,a=0;a<i.length;a++)o(i[a]);return o}({1:[function(e,t,n){"use strict";function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(n,"__esModule",{value:!0});var o=function(){function e(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(t,n,i){return n&&e(t.prototype,n),i&&e(t,i),t}}(),r=function(){function e(t,n,o){if(i(this,e),!o)throw Error("Message Bus not set!");var r=this;r._guiURL=t,r._idmURL=n,r._messageBus=o,r.callIdentityModuleFunc("deployGUI",{}).then(function(){r.resultURL=void 0,r._messageBus.addListener(t,function(e){var t=(e.body.value,e.body.method),n=void 0;if("openPopup"===t){var i=e.body.params.urlreceived;r.openPopup(i).then(function(t){var n={type:"execute",value:t,code:200},i={id:e.id,type:"response",to:e.from,from:e.to,body:n};r._messageBus.postMessage(i)})}document.getElementsByTagName("body")[0].style="background-color:white;",parent.postMessage({body:{method:"showAdminPage"},to:"runtime:gui-manager"},"*"),$(".admin-page").removeClass("hide"),r.showIdentitiesGUI(e.body.value).then(function(t){var i=void 0;switch(parent.postMessage({body:{method:"hideAdminPage"},to:"runtime:gui-manager"},"*"),$(".admin-page").addClass("hide"),document.getElementsByTagName("body")[0].style="background-color:transparent",$(".identities-section").addClass("hide"),$(".policies-section").addClass("hide"),t.type){case"idp":n={type:"idp",value:t.value,code:200},i={id:e.id,type:"response",to:e.from,from:e.to,body:n},r._messageBus.postMessage(i);break;case"identity":n={type:"identity",value:t.value,code:200},i={id:e.id,type:"response",to:e.from,from:e.to,body:n},r._messageBus.postMessage(i);break;default:n={type:"error",value:"Error on identity GUI",code:400},i={id:e.id,type:"response",to:e.from,from:e.to,body:n},r._messageBus.postMessage(i)}})}),$(".identities-page-show").on("click",function(){r.showIdentitiesGUI()})})}return o(e,[{key:"callIdentityModuleFunc",value:function(e,t){var n=this,i=void 0;return new Promise(function(o,r){i={type:"execute",to:n._idmURL,from:n._guiURL,body:{resource:"identity",method:e,params:t}},n._messageBus.postMessage(i,function(e){var t=e.body.value;o(t)})})}},{key:"openPopup",value:function(e){return new Promise(function(t,n){var i=window.open(e,"openIDrequest","width=800, height=600");if(window.cordova)i.addEventListener("loadstart",function(e){var n=e.url,o=/\&code=(.+)$/.exec(n),r=/\&error=(.+)$/.exec(n);(o||r)&&(i.close(),t(n))});else var o=setInterval(function(){try{if(i.closed&&(n("Some error occured when trying to get identity."),clearInterval(o)),i.document.URL.indexOf("id_token")!==-1||i.document.URL.indexOf(location.origin)!==-1){window.clearInterval(o);var e=i.document.URL;i.close(),t(e)}}catch(r){}},500)})}},{key:"showIdentitiesGUI",value:function(e){var t=this;return new Promise(function(n,i){var o=void 0,r=void 0;t._checkReceivedInfo(e).then(function(e){o=e.identityInfo,r=e.toRemoveID,$(".policies-section").addClass("hide"),$(".identities-section").removeClass("hide"),t.showMyIdentities(o.identities,r).then(function(e){console.log("chosen identity: ",e),n({type:"identity",value:e})});var i=function(e){console.log("chosen identity: ",e),n({type:"identity",value:e})},a=[],d=o.idps;d.forEach(function(e){e.type&&"idToken"==e.type&&a.push(e.domain)}),$("#idproviders").html(t._getList(a)),$("#idproviders").off(),$("#idproviders").on("click",function(e){return t.obtainNewIdentity(e,i,r)}),$(".identities-reset").off(),$(".identities-reset").on("click",function(e){return t._resetIdentities(i)})})})}},{key:"_checkReceivedInfo",value:function(e){var t=this;return new Promise(function(n,i){var o=void 0,r=void 0;e?(o=e,r=!1,n({identityInfo:o,toRemoveID:r})):(r=!0,t.callIdentityModuleFunc("getIdentitiesToChoose",{}).then(function(e){n({identityInfo:e,toRemoveID:r})}))})}},{key:"showMyIdentities",value:function(e,t){var n=this;return new Promise(function(i,o){var r=[];for(var a in e){var d=e[a].split("@");r.push({email:e[a],domain:d[1]})}var s=document.getElementById("my-ids");s.innerHTML="";for(var u=n.createTable(),c=document.createElement("tbody"),l=r.length,f=0;f<l;f++){var v=n.createTableRow(r[f],t);c.appendChild(v)}u.appendChild(c),s.appendChild(u);var p=function(e){i(e)};t||$(".clickable-cell").on("click",function(e){return n.changeID(p)}),$(".remove-id").on("click",function(t){return n.removeID(e)})})}},{key:"createTable",value:function(){var e=document.createElement("table");e.className="centered";var t=document.createElement("thead"),n=document.createElement("tr"),i=document.createElement("th");return i.textContent="Email",n.appendChild(i),t.appendChild(n),e.appendChild(t),e}},{key:"createTableRow",value:function(e,t){var n=document.createElement("tr"),i=document.createElement("td");if(i.textContent=e.email,i.className="clickable-cell",i.style="cursor: pointer",n.appendChild(i),i=document.createElement("td"),t){var o=document.createElement("button");o.textContent="Remove",o.className="remove-id waves-effect waves-light btn",i.appendChild(o)}return n.appendChild(i),n}},{key:"changeID",value:function(e){var t=event.target.innerText;if("settings"!==t)return e(t),t}},{key:"removeID",value:function(e){var t=this,n=event.target.parentNode.parentNode,i=n.children[0].textContent;n.children[1].textContent;t.callIdentityModuleFunc("unregisterIdentity",{email:i}).then(function(){for(var n=e.length,o=0;o<n;o++)if(e[o].email===i){e.splice(o,1);break}t.showMyIdentities(e,!0)})}},{key:"obtainNewIdentity",value:function(e,t,n){var i=this,o=e.target.textContent;e.target.text;i.callIdentityModuleFunc("generateRSAKeyPair",{}).then(function(e){var n=btoa(e["public"]);i.callIdentityModuleFunc("sendGenerateMessage",{contents:n,origin:"origin",usernameHint:void 0,idpDomain:o}).then(function(r){console.log("receivedURL: "+r.loginUrl.substring(0,20)+"...");var a=r.loginUrl,d=void 0;if(a.indexOf("redirect_uri")!==-1){var s=a.substring(0,a.indexOf("redirect_uri")),u=a.substring(a.indexOf("redirect_uri"),a.length),c=u.substring(u.indexOf("&"),a.length);d=c.indexOf("&")!==-1?s+"redirect_uri="+location.origin+c:s+"redirect_uri="+location.origin}i.resultURL=d||a,$(".login-idp").html("<p>Chosen IDP: "+o+"</p>"),$(".login").removeClass("hide"),$(".login-btn").off(),$(".login-btn").on("click",function(a){$(".login").addClass("hide"),i._authenticateUser(e,n,r,"origin",o).then(function(e){t(e),i.showIdentitiesGUI()})})})})["catch"](function(e){return console.log("obtanin new identity",e)})}},{key:"_getList",value:function(e){for(var t="",n=e.length,i=0;i<n;i++)t+='<li class="divider"></li>',t+='<li><a class="center-align">'+e[i]+"</a></li>";return t}},{key:"_authenticateUser",value:function(e,t,n,i,o){var r=this,a=r.resultURL;return new Promise(function(n,d){r.openPopup(a).then(function(a){r.callIdentityModuleFunc("sendGenerateMessage",{contents:t,origin:i,usernameHint:a,idpDomain:o}).then(function(t){t?r.callIdentityModuleFunc("storeIdentity",{result:t,keyPair:e}).then(function(e){n(e.userProfile.username)},function(e){d(e)}):d("error on obtaining identity information")})},function(e){d(e)})})}},{key:"_resetIdentities",value:function(){console.log("_resetIdentities")}}]),e}();n["default"]=r},{}]},{},[1])(1)});
//# sourceMappingURL=identities-gui.js.map
