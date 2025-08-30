const Vh=()=>{};var Ta={};/**
 * @license
 * Copyright 2017 Google LLC
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
 */const Lu={NODE_ADMIN:!1,SDK_VERSION:"${JSCORE_VERSION}"};/**
 * @license
 * Copyright 2017 Google LLC
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
 */const Dh=function(n,t){if(!n)throw Nh(t)},Nh=function(n){return new Error("Firebase Database ("+Lu.SDK_VERSION+") INTERNAL ASSERT FAILED: "+n)};/**
 * @license
 * Copyright 2017 Google LLC
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
 */const Fu=function(n){const t=[];let e=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?t[e++]=s:s<2048?(t[e++]=s>>6|192,t[e++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),t[e++]=s>>18|240,t[e++]=s>>12&63|128,t[e++]=s>>6&63|128,t[e++]=s&63|128):(t[e++]=s>>12|224,t[e++]=s>>6&63|128,t[e++]=s&63|128)}return t},kh=function(n){const t=[];let e=0,r=0;for(;e<n.length;){const s=n[e++];if(s<128)t[r++]=String.fromCharCode(s);else if(s>191&&s<224){const o=n[e++];t[r++]=String.fromCharCode((s&31)<<6|o&63)}else if(s>239&&s<365){const o=n[e++],a=n[e++],c=n[e++],h=((s&7)<<18|(o&63)<<12|(a&63)<<6|c&63)-65536;t[r++]=String.fromCharCode(55296+(h>>10)),t[r++]=String.fromCharCode(56320+(h&1023))}else{const o=n[e++],a=n[e++];t[r++]=String.fromCharCode((s&15)<<12|(o&63)<<6|a&63)}}return t.join("")},Uu={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,t){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const e=t?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const o=n[s],a=s+1<n.length,c=a?n[s+1]:0,h=s+2<n.length,d=h?n[s+2]:0,p=o>>2,g=(o&3)<<4|c>>4;let E=(c&15)<<2|d>>6,b=d&63;h||(b=64,a||(E=64)),r.push(e[p],e[g],e[E],e[b])}return r.join("")},encodeString(n,t){return this.HAS_NATIVE_SUPPORT&&!t?btoa(n):this.encodeByteArray(Fu(n),t)},decodeString(n,t){return this.HAS_NATIVE_SUPPORT&&!t?atob(n):kh(this.decodeStringToByteArray(n,t))},decodeStringToByteArray(n,t){this.init_();const e=t?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const o=e[n.charAt(s++)],c=s<n.length?e[n.charAt(s)]:0;++s;const d=s<n.length?e[n.charAt(s)]:64;++s;const g=s<n.length?e[n.charAt(s)]:64;if(++s,o==null||c==null||d==null||g==null)throw new Oh;const E=o<<2|c>>4;if(r.push(E),d!==64){const b=c<<4&240|d>>2;if(r.push(b),g!==64){const P=d<<6&192|g;r.push(P)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class Oh extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const xh=function(n){const t=Fu(n);return Uu.encodeByteArray(t,!0)},Dr=function(n){return xh(n).replace(/\./g,"")},Zs=function(n){try{return Uu.decodeString(n,!0)}catch(t){console.error("base64Decode failed: ",t)}return null};/**
 * @license
 * Copyright 2017 Google LLC
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
 */function O_(n){return Bu(void 0,n)}function Bu(n,t){if(!(t instanceof Object))return t;switch(t.constructor){case Date:const e=t;return new Date(e.getTime());case Object:n===void 0&&(n={});break;case Array:n=[];break;default:return t}for(const e in t)!t.hasOwnProperty(e)||!Mh(e)||(n[e]=Bu(n[e],t[e]));return n}function Mh(n){return n!=="__proto__"}/**
 * @license
 * Copyright 2022 Google LLC
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
 */function Lh(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
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
 */const Fh=()=>Lh().__FIREBASE_DEFAULTS__,Uh=()=>{if(typeof process>"u"||typeof Ta>"u")return;const n=Ta.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Bh=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const t=n&&Zs(n[1]);return t&&JSON.parse(t)},vi=()=>{try{return Vh()||Fh()||Uh()||Bh()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},qh=n=>vi()?.emulatorHosts?.[n],qu=n=>{const t=qh(n);if(!t)return;const e=t.lastIndexOf(":");if(e<=0||e+1===t.length)throw new Error(`Invalid host ${t} with no separate hostname and port!`);const r=parseInt(t.substring(e+1),10);return t[0]==="["?[t.substring(1,e-1),r]:[t.substring(0,e),r]},ju=()=>vi()?.config;/**
 * @license
 * Copyright 2017 Google LLC
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
 */class jh{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((t,e)=>{this.resolve=t,this.reject=e})}wrapCallback(t){return(e,r)=>{e?this.reject(e):this.resolve(r),typeof t=="function"&&(this.promise.catch(()=>{}),t.length===1?t(e):t(e,r))}}}/**
 * @license
 * Copyright 2025 Google LLC
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
 */function Hn(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function $u(n){return(await fetch(n,{credentials:"include"})).ok}/**
 * @license
 * Copyright 2021 Google LLC
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
 */function zu(n,t){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const e={alg:"none",type:"JWT"},r=t||"demo-project",s=n.iat||0,o=n.sub||n.user_id;if(!o)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a={iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:o,user_id:o,firebase:{sign_in_provider:"custom",identities:{}},...n};return[Dr(JSON.stringify(e)),Dr(JSON.stringify(a)),""].join(".")}const Dn={};function $h(){const n={prod:[],emulator:[]};for(const t of Object.keys(Dn))Dn[t]?n.emulator.push(t):n.prod.push(t);return n}function zh(n){let t=document.getElementById(n),e=!1;return t||(t=document.createElement("div"),t.setAttribute("id",n),e=!0),{created:e,element:t}}let Ia=!1;function Hu(n,t){if(typeof window>"u"||typeof document>"u"||!Hn(window.location.host)||Dn[n]===t||Dn[n]||Ia)return;Dn[n]=t;function e(E){return`__firebase__banner__${E}`}const r="__firebase__banner",o=$h().prod.length>0;function a(){const E=document.getElementById(r);E&&E.remove()}function c(E){E.style.display="flex",E.style.background="#7faaf0",E.style.position="fixed",E.style.bottom="5px",E.style.left="5px",E.style.padding=".5em",E.style.borderRadius="5px",E.style.alignItems="center"}function h(E,b){E.setAttribute("width","24"),E.setAttribute("id",b),E.setAttribute("height","24"),E.setAttribute("viewBox","0 0 24 24"),E.setAttribute("fill","none"),E.style.marginLeft="-6px"}function d(){const E=document.createElement("span");return E.style.cursor="pointer",E.style.marginLeft="16px",E.style.fontSize="24px",E.innerHTML=" &times;",E.onclick=()=>{Ia=!0,a()},E}function p(E,b){E.setAttribute("id",b),E.innerText="Learn more",E.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",E.setAttribute("target","__blank"),E.style.paddingLeft="5px",E.style.textDecoration="underline"}function g(){const E=zh(r),b=e("text"),P=document.getElementById(b)||document.createElement("span"),k=e("learnmore"),V=document.getElementById(k)||document.createElement("a"),q=e("preprendIcon"),F=document.getElementById(q)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(E.created){const M=E.element;c(M),p(V,k);const z=d();h(F,q),M.append(F,P,V,z),document.body.appendChild(M)}o?(P.innerText="Preview backend disconnected.",F.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(F.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,P.innerText="Preview backend running in this workspace."),P.setAttribute("id",b)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",g):g()}/**
 * @license
 * Copyright 2017 Google LLC
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
 */function Gu(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function x_(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Gu())}function Hh(){const n=vi()?.forceEnvironment;if(n==="node")return!0;if(n==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function M_(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function L_(){return Lu.NODE_ADMIN===!0}function Gh(){return!Hh()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Kh(){try{return typeof indexedDB=="object"}catch{return!1}}function Wh(){return new Promise((n,t)=>{try{let e=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),e||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{e=!1},s.onerror=()=>{t(s.error?.message||"")}}catch(e){t(e)}})}/**
 * @license
 * Copyright 2017 Google LLC
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
 */const Qh="FirebaseError";class ke extends Error{constructor(t,e,r){super(e),this.code=t,this.customData=r,this.name=Qh,Object.setPrototypeOf(this,ke.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Ku.prototype.create)}}class Ku{constructor(t,e,r){this.service=t,this.serviceName=e,this.errors=r}create(t,...e){const r=e[0]||{},s=`${this.service}/${t}`,o=this.errors[t],a=o?Xh(o,r):"Error",c=`${this.serviceName}: ${a} (${s}).`;return new ke(s,c,r)}}function Xh(n,t){return n.replace(Yh,(e,r)=>{const s=t[r];return s!=null?String(s):`<${r}?>`})}const Yh=/\{\$([^}]+)}/g;/**
 * @license
 * Copyright 2017 Google LLC
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
 */function wa(n){return JSON.parse(n)}function F_(n){return JSON.stringify(n)}/**
 * @license
 * Copyright 2017 Google LLC
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
 */const Wu=function(n){let t={},e={},r={},s="";try{const o=n.split(".");t=wa(Zs(o[0])||""),e=wa(Zs(o[1])||""),s=o[2],r=e.d||{},delete e.d}catch{}return{header:t,claims:e,data:r,signature:s}},U_=function(n){const t=Wu(n),e=t.claims;return!!e&&typeof e=="object"&&e.hasOwnProperty("iat")},B_=function(n){const t=Wu(n).claims;return typeof t=="object"&&t.admin===!0};/**
 * @license
 * Copyright 2017 Google LLC
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
 */function q_(n,t){return Object.prototype.hasOwnProperty.call(n,t)}function j_(n,t){if(Object.prototype.hasOwnProperty.call(n,t))return n[t]}function $_(n){for(const t in n)if(Object.prototype.hasOwnProperty.call(n,t))return!1;return!0}function z_(n,t,e){const r={};for(const s in n)Object.prototype.hasOwnProperty.call(n,s)&&(r[s]=t.call(e,n[s],s,n));return r}function Nr(n,t){if(n===t)return!0;const e=Object.keys(n),r=Object.keys(t);for(const s of e){if(!r.includes(s))return!1;const o=n[s],a=t[s];if(va(o)&&va(a)){if(!Nr(o,a))return!1}else if(o!==a)return!1}for(const s of r)if(!e.includes(s))return!1;return!0}function va(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
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
 */function H_(n){const t=[];for(const[e,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{t.push(encodeURIComponent(e)+"="+encodeURIComponent(s))}):t.push(encodeURIComponent(e)+"="+encodeURIComponent(r));return t.length?"&"+t.join("&"):""}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class G_{constructor(){this.chain_=[],this.buf_=[],this.W_=[],this.pad_=[],this.inbuf_=0,this.total_=0,this.blockSize=512/8,this.pad_[0]=128;for(let t=1;t<this.blockSize;++t)this.pad_[t]=0;this.reset()}reset(){this.chain_[0]=1732584193,this.chain_[1]=4023233417,this.chain_[2]=2562383102,this.chain_[3]=271733878,this.chain_[4]=3285377520,this.inbuf_=0,this.total_=0}compress_(t,e){e||(e=0);const r=this.W_;if(typeof t=="string")for(let g=0;g<16;g++)r[g]=t.charCodeAt(e)<<24|t.charCodeAt(e+1)<<16|t.charCodeAt(e+2)<<8|t.charCodeAt(e+3),e+=4;else for(let g=0;g<16;g++)r[g]=t[e]<<24|t[e+1]<<16|t[e+2]<<8|t[e+3],e+=4;for(let g=16;g<80;g++){const E=r[g-3]^r[g-8]^r[g-14]^r[g-16];r[g]=(E<<1|E>>>31)&4294967295}let s=this.chain_[0],o=this.chain_[1],a=this.chain_[2],c=this.chain_[3],h=this.chain_[4],d,p;for(let g=0;g<80;g++){g<40?g<20?(d=c^o&(a^c),p=1518500249):(d=o^a^c,p=1859775393):g<60?(d=o&a|c&(o|a),p=2400959708):(d=o^a^c,p=3395469782);const E=(s<<5|s>>>27)+d+h+p+r[g]&4294967295;h=c,c=a,a=(o<<30|o>>>2)&4294967295,o=s,s=E}this.chain_[0]=this.chain_[0]+s&4294967295,this.chain_[1]=this.chain_[1]+o&4294967295,this.chain_[2]=this.chain_[2]+a&4294967295,this.chain_[3]=this.chain_[3]+c&4294967295,this.chain_[4]=this.chain_[4]+h&4294967295}update(t,e){if(t==null)return;e===void 0&&(e=t.length);const r=e-this.blockSize;let s=0;const o=this.buf_;let a=this.inbuf_;for(;s<e;){if(a===0)for(;s<=r;)this.compress_(t,s),s+=this.blockSize;if(typeof t=="string"){for(;s<e;)if(o[a]=t.charCodeAt(s),++a,++s,a===this.blockSize){this.compress_(o),a=0;break}}else for(;s<e;)if(o[a]=t[s],++a,++s,a===this.blockSize){this.compress_(o),a=0;break}}this.inbuf_=a,this.total_+=e}digest(){const t=[];let e=this.total_*8;this.inbuf_<56?this.update(this.pad_,56-this.inbuf_):this.update(this.pad_,this.blockSize-(this.inbuf_-56));for(let s=this.blockSize-1;s>=56;s--)this.buf_[s]=e&255,e/=256;this.compress_(this.buf_);let r=0;for(let s=0;s<5;s++)for(let o=24;o>=0;o-=8)t[r]=this.chain_[s]>>o&255,++r;return t}}function K_(n,t){return`${n} failed: ${t} argument `}/**
 * @license
 * Copyright 2017 Google LLC
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
 */const W_=function(n){const t=[];let e=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);if(s>=55296&&s<=56319){const o=s-55296;r++,Dh(r<n.length,"Surrogate pair missing trail surrogate.");const a=n.charCodeAt(r)-56320;s=65536+(o<<10)+a}s<128?t[e++]=s:s<2048?(t[e++]=s>>6|192,t[e++]=s&63|128):s<65536?(t[e++]=s>>12|224,t[e++]=s>>6&63|128,t[e++]=s&63|128):(t[e++]=s>>18|240,t[e++]=s>>12&63|128,t[e++]=s>>6&63|128,t[e++]=s&63|128)}return t},Q_=function(n){let t=0;for(let e=0;e<n.length;e++){const r=n.charCodeAt(e);r<128?t++:r<2048?t+=2:r>=55296&&r<=56319?(t+=4,e++):t+=3}return t};/**
 * @license
 * Copyright 2021 Google LLC
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
 */function mt(n){return n&&n._delegate?n._delegate:n}class Qe{constructor(t,e,r){this.name=t,this.instanceFactory=e,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(t){return this.instantiationMode=t,this}setMultipleInstances(t){return this.multipleInstances=t,this}setServiceProps(t){return this.serviceProps=t,this}setInstanceCreatedCallback(t){return this.onInstanceCreated=t,this}}/**
 * @license
 * Copyright 2019 Google LLC
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
 */const Re="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
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
 */class Jh{constructor(t,e){this.name=t,this.container=e,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(t){const e=this.normalizeInstanceIdentifier(t);if(!this.instancesDeferred.has(e)){const r=new jh;if(this.instancesDeferred.set(e,r),this.isInitialized(e)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:e});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(e).promise}getImmediate(t){const e=this.normalizeInstanceIdentifier(t?.identifier),r=t?.optional??!1;if(this.isInitialized(e)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:e})}catch(s){if(r)return null;throw s}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(t){if(t.name!==this.name)throw Error(`Mismatching Component ${t.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=t,!!this.shouldAutoInitialize()){if(td(t))try{this.getOrInitializeService({instanceIdentifier:Re})}catch{}for(const[e,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(e);try{const o=this.getOrInitializeService({instanceIdentifier:s});r.resolve(o)}catch{}}}}clearInstance(t=Re){this.instancesDeferred.delete(t),this.instancesOptions.delete(t),this.instances.delete(t)}async delete(){const t=Array.from(this.instances.values());await Promise.all([...t.filter(e=>"INTERNAL"in e).map(e=>e.INTERNAL.delete()),...t.filter(e=>"_delete"in e).map(e=>e._delete())])}isComponentSet(){return this.component!=null}isInitialized(t=Re){return this.instances.has(t)}getOptions(t=Re){return this.instancesOptions.get(t)||{}}initialize(t={}){const{options:e={}}=t,r=this.normalizeInstanceIdentifier(t.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:e});for(const[o,a]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(o);r===c&&a.resolve(s)}return s}onInit(t,e){const r=this.normalizeInstanceIdentifier(e),s=this.onInitCallbacks.get(r)??new Set;s.add(t),this.onInitCallbacks.set(r,s);const o=this.instances.get(r);return o&&t(o,r),()=>{s.delete(t)}}invokeOnInitCallbacks(t,e){const r=this.onInitCallbacks.get(e);if(r)for(const s of r)try{s(t,e)}catch{}}getOrInitializeService({instanceIdentifier:t,options:e={}}){let r=this.instances.get(t);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Zh(t),options:e}),this.instances.set(t,r),this.instancesOptions.set(t,e),this.invokeOnInitCallbacks(r,t),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,t,r)}catch{}return r||null}normalizeInstanceIdentifier(t=Re){return this.component?this.component.multipleInstances?t:Re:t}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Zh(n){return n===Re?void 0:n}function td(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
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
 */class ed{constructor(t){this.name=t,this.providers=new Map}addComponent(t){const e=this.getProvider(t.name);if(e.isComponentSet())throw new Error(`Component ${t.name} has already been registered with ${this.name}`);e.setComponent(t)}addOrOverwriteComponent(t){this.getProvider(t.name).isComponentSet()&&this.providers.delete(t.name),this.addComponent(t)}getProvider(t){if(this.providers.has(t))return this.providers.get(t);const e=new Jh(t,this);return this.providers.set(t,e),e}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */var G;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(G||(G={}));const nd={debug:G.DEBUG,verbose:G.VERBOSE,info:G.INFO,warn:G.WARN,error:G.ERROR,silent:G.SILENT},rd=G.INFO,sd={[G.DEBUG]:"log",[G.VERBOSE]:"log",[G.INFO]:"info",[G.WARN]:"warn",[G.ERROR]:"error"},id=(n,t,...e)=>{if(t<n.logLevel)return;const r=new Date().toISOString(),s=sd[t];if(s)console[s](`[${r}]  ${n.name}:`,...e);else throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`)};class Qu{constructor(t){this.name=t,this._logLevel=rd,this._logHandler=id,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(t){if(!(t in G))throw new TypeError(`Invalid value "${t}" assigned to \`logLevel\``);this._logLevel=t}setLogLevel(t){this._logLevel=typeof t=="string"?nd[t]:t}get logHandler(){return this._logHandler}set logHandler(t){if(typeof t!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=t}get userLogHandler(){return this._userLogHandler}set userLogHandler(t){this._userLogHandler=t}debug(...t){this._userLogHandler&&this._userLogHandler(this,G.DEBUG,...t),this._logHandler(this,G.DEBUG,...t)}log(...t){this._userLogHandler&&this._userLogHandler(this,G.VERBOSE,...t),this._logHandler(this,G.VERBOSE,...t)}info(...t){this._userLogHandler&&this._userLogHandler(this,G.INFO,...t),this._logHandler(this,G.INFO,...t)}warn(...t){this._userLogHandler&&this._userLogHandler(this,G.WARN,...t),this._logHandler(this,G.WARN,...t)}error(...t){this._userLogHandler&&this._userLogHandler(this,G.ERROR,...t),this._logHandler(this,G.ERROR,...t)}}const od=(n,t)=>t.some(e=>n instanceof e);let Aa,Ra;function ad(){return Aa||(Aa=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function ud(){return Ra||(Ra=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Xu=new WeakMap,ti=new WeakMap,Yu=new WeakMap,qs=new WeakMap,Ai=new WeakMap;function cd(n){const t=new Promise((e,r)=>{const s=()=>{n.removeEventListener("success",o),n.removeEventListener("error",a)},o=()=>{e(ae(n.result)),s()},a=()=>{r(n.error),s()};n.addEventListener("success",o),n.addEventListener("error",a)});return t.then(e=>{e instanceof IDBCursor&&Xu.set(e,n)}).catch(()=>{}),Ai.set(t,n),t}function ld(n){if(ti.has(n))return;const t=new Promise((e,r)=>{const s=()=>{n.removeEventListener("complete",o),n.removeEventListener("error",a),n.removeEventListener("abort",a)},o=()=>{e(),s()},a=()=>{r(n.error||new DOMException("AbortError","AbortError")),s()};n.addEventListener("complete",o),n.addEventListener("error",a),n.addEventListener("abort",a)});ti.set(n,t)}let ei={get(n,t,e){if(n instanceof IDBTransaction){if(t==="done")return ti.get(n);if(t==="objectStoreNames")return n.objectStoreNames||Yu.get(n);if(t==="store")return e.objectStoreNames[1]?void 0:e.objectStore(e.objectStoreNames[0])}return ae(n[t])},set(n,t,e){return n[t]=e,!0},has(n,t){return n instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in n}};function hd(n){ei=n(ei)}function dd(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(t,...e){const r=n.call(js(this),t,...e);return Yu.set(r,t.sort?t.sort():[t]),ae(r)}:ud().includes(n)?function(...t){return n.apply(js(this),t),ae(Xu.get(this))}:function(...t){return ae(n.apply(js(this),t))}}function fd(n){return typeof n=="function"?dd(n):(n instanceof IDBTransaction&&ld(n),od(n,ad())?new Proxy(n,ei):n)}function ae(n){if(n instanceof IDBRequest)return cd(n);if(qs.has(n))return qs.get(n);const t=fd(n);return t!==n&&(qs.set(n,t),Ai.set(t,n)),t}const js=n=>Ai.get(n);function pd(n,t,{blocked:e,upgrade:r,blocking:s,terminated:o}={}){const a=indexedDB.open(n,t),c=ae(a);return r&&a.addEventListener("upgradeneeded",h=>{r(ae(a.result),h.oldVersion,h.newVersion,ae(a.transaction),h)}),e&&a.addEventListener("blocked",h=>e(h.oldVersion,h.newVersion,h)),c.then(h=>{o&&h.addEventListener("close",()=>o()),s&&h.addEventListener("versionchange",d=>s(d.oldVersion,d.newVersion,d))}).catch(()=>{}),c}const md=["get","getKey","getAll","getAllKeys","count"],gd=["put","add","delete","clear"],$s=new Map;function ba(n,t){if(!(n instanceof IDBDatabase&&!(t in n)&&typeof t=="string"))return;if($s.get(t))return $s.get(t);const e=t.replace(/FromIndex$/,""),r=t!==e,s=gd.includes(e);if(!(e in(r?IDBIndex:IDBObjectStore).prototype)||!(s||md.includes(e)))return;const o=async function(a,...c){const h=this.transaction(a,s?"readwrite":"readonly");let d=h.store;return r&&(d=d.index(c.shift())),(await Promise.all([d[e](...c),s&&h.done]))[0]};return $s.set(t,o),o}hd(n=>({...n,get:(t,e,r)=>ba(t,e)||n.get(t,e,r),has:(t,e)=>!!ba(t,e)||n.has(t,e)}));/**
 * @license
 * Copyright 2019 Google LLC
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
 */class _d{constructor(t){this.container=t}getPlatformInfoString(){return this.container.getProviders().map(e=>{if(yd(e)){const r=e.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(e=>e).join(" ")}}function yd(n){return n.getComponent()?.type==="VERSION"}const ni="@firebase/app",Sa="0.14.2";/**
 * @license
 * Copyright 2019 Google LLC
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
 */const Jt=new Qu("@firebase/app"),Ed="@firebase/app-compat",Td="@firebase/analytics-compat",Id="@firebase/analytics",wd="@firebase/app-check-compat",vd="@firebase/app-check",Ad="@firebase/auth",Rd="@firebase/auth-compat",bd="@firebase/database",Sd="@firebase/data-connect",Cd="@firebase/database-compat",Pd="@firebase/functions",Vd="@firebase/functions-compat",Dd="@firebase/installations",Nd="@firebase/installations-compat",kd="@firebase/messaging",Od="@firebase/messaging-compat",xd="@firebase/performance",Md="@firebase/performance-compat",Ld="@firebase/remote-config",Fd="@firebase/remote-config-compat",Ud="@firebase/storage",Bd="@firebase/storage-compat",qd="@firebase/firestore",jd="@firebase/ai",$d="@firebase/firestore-compat",zd="firebase",Hd="12.2.0";/**
 * @license
 * Copyright 2019 Google LLC
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
 */const ri="[DEFAULT]",Gd={[ni]:"fire-core",[Ed]:"fire-core-compat",[Id]:"fire-analytics",[Td]:"fire-analytics-compat",[vd]:"fire-app-check",[wd]:"fire-app-check-compat",[Ad]:"fire-auth",[Rd]:"fire-auth-compat",[bd]:"fire-rtdb",[Sd]:"fire-data-connect",[Cd]:"fire-rtdb-compat",[Pd]:"fire-fn",[Vd]:"fire-fn-compat",[Dd]:"fire-iid",[Nd]:"fire-iid-compat",[kd]:"fire-fcm",[Od]:"fire-fcm-compat",[xd]:"fire-perf",[Md]:"fire-perf-compat",[Ld]:"fire-rc",[Fd]:"fire-rc-compat",[Ud]:"fire-gcs",[Bd]:"fire-gcs-compat",[qd]:"fire-fst",[$d]:"fire-fst-compat",[jd]:"fire-vertex","fire-js":"fire-js",[zd]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
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
 */const kr=new Map,Kd=new Map,si=new Map;function Ca(n,t){try{n.container.addComponent(t)}catch(e){Jt.debug(`Component ${t.name} failed to register with FirebaseApp ${n.name}`,e)}}function Mn(n){const t=n.name;if(si.has(t))return Jt.debug(`There were multiple attempts to register component ${t}.`),!1;si.set(t,n);for(const e of kr.values())Ca(e,n);for(const e of Kd.values())Ca(e,n);return!0}function Ju(n,t){const e=n.container.getProvider("heartbeat").getImmediate({optional:!0});return e&&e.triggerHeartbeat(),n.container.getProvider(t)}function Zu(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
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
 */const Wd={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},ue=new Ku("app","Firebase",Wd);/**
 * @license
 * Copyright 2019 Google LLC
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
 */class Qd{constructor(t,e,r){this._isDeleted=!1,this._options={...t},this._config={...e},this._name=e.name,this._automaticDataCollectionEnabled=e.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new Qe("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(t){this.checkDestroyed(),this._automaticDataCollectionEnabled=t}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(t){this._isDeleted=t}checkDestroyed(){if(this.isDeleted)throw ue.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
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
 */const tc=Hd;function Xd(n,t={}){let e=n;typeof t!="object"&&(t={name:t});const r={name:ri,automaticDataCollectionEnabled:!0,...t},s=r.name;if(typeof s!="string"||!s)throw ue.create("bad-app-name",{appName:String(s)});if(e||(e=ju()),!e)throw ue.create("no-options");const o=kr.get(s);if(o){if(Nr(e,o.options)&&Nr(r,o.config))return o;throw ue.create("duplicate-app",{appName:s})}const a=new ed(s);for(const h of si.values())a.addComponent(h);const c=new Qd(e,r,a);return kr.set(s,c),c}function ec(n=ri){const t=kr.get(n);if(!t&&n===ri&&ju())return Xd();if(!t)throw ue.create("no-app",{appName:n});return t}function ce(n,t,e){let r=Gd[n]??n;e&&(r+=`-${e}`);const s=r.match(/\s|\//),o=t.match(/\s|\//);if(s||o){const a=[`Unable to register library "${r}" with version "${t}":`];s&&a.push(`library name "${r}" contains illegal characters (whitespace or "/")`),s&&o&&a.push("and"),o&&a.push(`version name "${t}" contains illegal characters (whitespace or "/")`),Jt.warn(a.join(" "));return}Mn(new Qe(`${r}-version`,()=>({library:r,version:t}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
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
 */const Yd="firebase-heartbeat-database",Jd=1,Ln="firebase-heartbeat-store";let zs=null;function nc(){return zs||(zs=pd(Yd,Jd,{upgrade:(n,t)=>{switch(t){case 0:try{n.createObjectStore(Ln)}catch(e){console.warn(e)}}}}).catch(n=>{throw ue.create("idb-open",{originalErrorMessage:n.message})})),zs}async function Zd(n){try{const e=(await nc()).transaction(Ln),r=await e.objectStore(Ln).get(rc(n));return await e.done,r}catch(t){if(t instanceof ke)Jt.warn(t.message);else{const e=ue.create("idb-get",{originalErrorMessage:t?.message});Jt.warn(e.message)}}}async function Pa(n,t){try{const r=(await nc()).transaction(Ln,"readwrite");await r.objectStore(Ln).put(t,rc(n)),await r.done}catch(e){if(e instanceof ke)Jt.warn(e.message);else{const r=ue.create("idb-set",{originalErrorMessage:e?.message});Jt.warn(r.message)}}}function rc(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
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
 */const tf=1024,ef=30;class nf{constructor(t){this.container=t,this._heartbeatsCache=null;const e=this.container.getProvider("app").getImmediate();this._storage=new sf(e),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){try{const e=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),r=Va();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===r||this._heartbeatsCache.heartbeats.some(s=>s.date===r))return;if(this._heartbeatsCache.heartbeats.push({date:r,agent:e}),this._heartbeatsCache.heartbeats.length>ef){const s=of(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(s,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(t){Jt.warn(t)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Va(),{heartbeatsToSend:e,unsentEntries:r}=rf(this._heartbeatsCache.heartbeats),s=Dr(JSON.stringify({version:2,heartbeats:e}));return this._heartbeatsCache.lastSentHeartbeatDate=t,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(t){return Jt.warn(t),""}}}function Va(){return new Date().toISOString().substring(0,10)}function rf(n,t=tf){const e=[];let r=n.slice();for(const s of n){const o=e.find(a=>a.agent===s.agent);if(o){if(o.dates.push(s.date),Da(e)>t){o.dates.pop();break}}else if(e.push({agent:s.agent,dates:[s.date]}),Da(e)>t){e.pop();break}r=r.slice(1)}return{heartbeatsToSend:e,unsentEntries:r}}class sf{constructor(t){this.app=t,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Kh()?Wh().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const e=await Zd(this.app);return e?.heartbeats?e:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(t){if(await this._canUseIndexedDBPromise){const r=await this.read();return Pa(this.app,{lastSentHeartbeatDate:t.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:t.heartbeats})}else return}async add(t){if(await this._canUseIndexedDBPromise){const r=await this.read();return Pa(this.app,{lastSentHeartbeatDate:t.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...t.heartbeats]})}else return}}function Da(n){return Dr(JSON.stringify({version:2,heartbeats:n})).length}function of(n){if(n.length===0)return-1;let t=0,e=n[0].date;for(let r=1;r<n.length;r++)n[r].date<e&&(e=n[r].date,t=r);return t}/**
 * @license
 * Copyright 2019 Google LLC
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
 */function af(n){Mn(new Qe("platform-logger",t=>new _d(t),"PRIVATE")),Mn(new Qe("heartbeat",t=>new nf(t),"PRIVATE")),ce(ni,Sa,n),ce(ni,Sa,"esm2020"),ce("fire-js","")}af("");var Na=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var le,sc;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function t(w,m){function _(){}_.prototype=m.prototype,w.D=m.prototype,w.prototype=new _,w.prototype.constructor=w,w.C=function(T,I,A){for(var y=Array(arguments.length-2),Gt=2;Gt<arguments.length;Gt++)y[Gt-2]=arguments[Gt];return m.prototype[I].apply(T,y)}}function e(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}t(r,e),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(w,m,_){_||(_=0);var T=Array(16);if(typeof m=="string")for(var I=0;16>I;++I)T[I]=m.charCodeAt(_++)|m.charCodeAt(_++)<<8|m.charCodeAt(_++)<<16|m.charCodeAt(_++)<<24;else for(I=0;16>I;++I)T[I]=m[_++]|m[_++]<<8|m[_++]<<16|m[_++]<<24;m=w.g[0],_=w.g[1],I=w.g[2];var A=w.g[3],y=m+(A^_&(I^A))+T[0]+3614090360&4294967295;m=_+(y<<7&4294967295|y>>>25),y=A+(I^m&(_^I))+T[1]+3905402710&4294967295,A=m+(y<<12&4294967295|y>>>20),y=I+(_^A&(m^_))+T[2]+606105819&4294967295,I=A+(y<<17&4294967295|y>>>15),y=_+(m^I&(A^m))+T[3]+3250441966&4294967295,_=I+(y<<22&4294967295|y>>>10),y=m+(A^_&(I^A))+T[4]+4118548399&4294967295,m=_+(y<<7&4294967295|y>>>25),y=A+(I^m&(_^I))+T[5]+1200080426&4294967295,A=m+(y<<12&4294967295|y>>>20),y=I+(_^A&(m^_))+T[6]+2821735955&4294967295,I=A+(y<<17&4294967295|y>>>15),y=_+(m^I&(A^m))+T[7]+4249261313&4294967295,_=I+(y<<22&4294967295|y>>>10),y=m+(A^_&(I^A))+T[8]+1770035416&4294967295,m=_+(y<<7&4294967295|y>>>25),y=A+(I^m&(_^I))+T[9]+2336552879&4294967295,A=m+(y<<12&4294967295|y>>>20),y=I+(_^A&(m^_))+T[10]+4294925233&4294967295,I=A+(y<<17&4294967295|y>>>15),y=_+(m^I&(A^m))+T[11]+2304563134&4294967295,_=I+(y<<22&4294967295|y>>>10),y=m+(A^_&(I^A))+T[12]+1804603682&4294967295,m=_+(y<<7&4294967295|y>>>25),y=A+(I^m&(_^I))+T[13]+4254626195&4294967295,A=m+(y<<12&4294967295|y>>>20),y=I+(_^A&(m^_))+T[14]+2792965006&4294967295,I=A+(y<<17&4294967295|y>>>15),y=_+(m^I&(A^m))+T[15]+1236535329&4294967295,_=I+(y<<22&4294967295|y>>>10),y=m+(I^A&(_^I))+T[1]+4129170786&4294967295,m=_+(y<<5&4294967295|y>>>27),y=A+(_^I&(m^_))+T[6]+3225465664&4294967295,A=m+(y<<9&4294967295|y>>>23),y=I+(m^_&(A^m))+T[11]+643717713&4294967295,I=A+(y<<14&4294967295|y>>>18),y=_+(A^m&(I^A))+T[0]+3921069994&4294967295,_=I+(y<<20&4294967295|y>>>12),y=m+(I^A&(_^I))+T[5]+3593408605&4294967295,m=_+(y<<5&4294967295|y>>>27),y=A+(_^I&(m^_))+T[10]+38016083&4294967295,A=m+(y<<9&4294967295|y>>>23),y=I+(m^_&(A^m))+T[15]+3634488961&4294967295,I=A+(y<<14&4294967295|y>>>18),y=_+(A^m&(I^A))+T[4]+3889429448&4294967295,_=I+(y<<20&4294967295|y>>>12),y=m+(I^A&(_^I))+T[9]+568446438&4294967295,m=_+(y<<5&4294967295|y>>>27),y=A+(_^I&(m^_))+T[14]+3275163606&4294967295,A=m+(y<<9&4294967295|y>>>23),y=I+(m^_&(A^m))+T[3]+4107603335&4294967295,I=A+(y<<14&4294967295|y>>>18),y=_+(A^m&(I^A))+T[8]+1163531501&4294967295,_=I+(y<<20&4294967295|y>>>12),y=m+(I^A&(_^I))+T[13]+2850285829&4294967295,m=_+(y<<5&4294967295|y>>>27),y=A+(_^I&(m^_))+T[2]+4243563512&4294967295,A=m+(y<<9&4294967295|y>>>23),y=I+(m^_&(A^m))+T[7]+1735328473&4294967295,I=A+(y<<14&4294967295|y>>>18),y=_+(A^m&(I^A))+T[12]+2368359562&4294967295,_=I+(y<<20&4294967295|y>>>12),y=m+(_^I^A)+T[5]+4294588738&4294967295,m=_+(y<<4&4294967295|y>>>28),y=A+(m^_^I)+T[8]+2272392833&4294967295,A=m+(y<<11&4294967295|y>>>21),y=I+(A^m^_)+T[11]+1839030562&4294967295,I=A+(y<<16&4294967295|y>>>16),y=_+(I^A^m)+T[14]+4259657740&4294967295,_=I+(y<<23&4294967295|y>>>9),y=m+(_^I^A)+T[1]+2763975236&4294967295,m=_+(y<<4&4294967295|y>>>28),y=A+(m^_^I)+T[4]+1272893353&4294967295,A=m+(y<<11&4294967295|y>>>21),y=I+(A^m^_)+T[7]+4139469664&4294967295,I=A+(y<<16&4294967295|y>>>16),y=_+(I^A^m)+T[10]+3200236656&4294967295,_=I+(y<<23&4294967295|y>>>9),y=m+(_^I^A)+T[13]+681279174&4294967295,m=_+(y<<4&4294967295|y>>>28),y=A+(m^_^I)+T[0]+3936430074&4294967295,A=m+(y<<11&4294967295|y>>>21),y=I+(A^m^_)+T[3]+3572445317&4294967295,I=A+(y<<16&4294967295|y>>>16),y=_+(I^A^m)+T[6]+76029189&4294967295,_=I+(y<<23&4294967295|y>>>9),y=m+(_^I^A)+T[9]+3654602809&4294967295,m=_+(y<<4&4294967295|y>>>28),y=A+(m^_^I)+T[12]+3873151461&4294967295,A=m+(y<<11&4294967295|y>>>21),y=I+(A^m^_)+T[15]+530742520&4294967295,I=A+(y<<16&4294967295|y>>>16),y=_+(I^A^m)+T[2]+3299628645&4294967295,_=I+(y<<23&4294967295|y>>>9),y=m+(I^(_|~A))+T[0]+4096336452&4294967295,m=_+(y<<6&4294967295|y>>>26),y=A+(_^(m|~I))+T[7]+1126891415&4294967295,A=m+(y<<10&4294967295|y>>>22),y=I+(m^(A|~_))+T[14]+2878612391&4294967295,I=A+(y<<15&4294967295|y>>>17),y=_+(A^(I|~m))+T[5]+4237533241&4294967295,_=I+(y<<21&4294967295|y>>>11),y=m+(I^(_|~A))+T[12]+1700485571&4294967295,m=_+(y<<6&4294967295|y>>>26),y=A+(_^(m|~I))+T[3]+2399980690&4294967295,A=m+(y<<10&4294967295|y>>>22),y=I+(m^(A|~_))+T[10]+4293915773&4294967295,I=A+(y<<15&4294967295|y>>>17),y=_+(A^(I|~m))+T[1]+2240044497&4294967295,_=I+(y<<21&4294967295|y>>>11),y=m+(I^(_|~A))+T[8]+1873313359&4294967295,m=_+(y<<6&4294967295|y>>>26),y=A+(_^(m|~I))+T[15]+4264355552&4294967295,A=m+(y<<10&4294967295|y>>>22),y=I+(m^(A|~_))+T[6]+2734768916&4294967295,I=A+(y<<15&4294967295|y>>>17),y=_+(A^(I|~m))+T[13]+1309151649&4294967295,_=I+(y<<21&4294967295|y>>>11),y=m+(I^(_|~A))+T[4]+4149444226&4294967295,m=_+(y<<6&4294967295|y>>>26),y=A+(_^(m|~I))+T[11]+3174756917&4294967295,A=m+(y<<10&4294967295|y>>>22),y=I+(m^(A|~_))+T[2]+718787259&4294967295,I=A+(y<<15&4294967295|y>>>17),y=_+(A^(I|~m))+T[9]+3951481745&4294967295,w.g[0]=w.g[0]+m&4294967295,w.g[1]=w.g[1]+(I+(y<<21&4294967295|y>>>11))&4294967295,w.g[2]=w.g[2]+I&4294967295,w.g[3]=w.g[3]+A&4294967295}r.prototype.u=function(w,m){m===void 0&&(m=w.length);for(var _=m-this.blockSize,T=this.B,I=this.h,A=0;A<m;){if(I==0)for(;A<=_;)s(this,w,A),A+=this.blockSize;if(typeof w=="string"){for(;A<m;)if(T[I++]=w.charCodeAt(A++),I==this.blockSize){s(this,T),I=0;break}}else for(;A<m;)if(T[I++]=w[A++],I==this.blockSize){s(this,T),I=0;break}}this.h=I,this.o+=m},r.prototype.v=function(){var w=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);w[0]=128;for(var m=1;m<w.length-8;++m)w[m]=0;var _=8*this.o;for(m=w.length-8;m<w.length;++m)w[m]=_&255,_/=256;for(this.u(w),w=Array(16),m=_=0;4>m;++m)for(var T=0;32>T;T+=8)w[_++]=this.g[m]>>>T&255;return w};function o(w,m){var _=c;return Object.prototype.hasOwnProperty.call(_,w)?_[w]:_[w]=m(w)}function a(w,m){this.h=m;for(var _=[],T=!0,I=w.length-1;0<=I;I--){var A=w[I]|0;T&&A==m||(_[I]=A,T=!1)}this.g=_}var c={};function h(w){return-128<=w&&128>w?o(w,function(m){return new a([m|0],0>m?-1:0)}):new a([w|0],0>w?-1:0)}function d(w){if(isNaN(w)||!isFinite(w))return g;if(0>w)return V(d(-w));for(var m=[],_=1,T=0;w>=_;T++)m[T]=w/_|0,_*=4294967296;return new a(m,0)}function p(w,m){if(w.length==0)throw Error("number format error: empty string");if(m=m||10,2>m||36<m)throw Error("radix out of range: "+m);if(w.charAt(0)=="-")return V(p(w.substring(1),m));if(0<=w.indexOf("-"))throw Error('number format error: interior "-" character');for(var _=d(Math.pow(m,8)),T=g,I=0;I<w.length;I+=8){var A=Math.min(8,w.length-I),y=parseInt(w.substring(I,I+A),m);8>A?(A=d(Math.pow(m,A)),T=T.j(A).add(d(y))):(T=T.j(_),T=T.add(d(y)))}return T}var g=h(0),E=h(1),b=h(16777216);n=a.prototype,n.m=function(){if(k(this))return-V(this).m();for(var w=0,m=1,_=0;_<this.g.length;_++){var T=this.i(_);w+=(0<=T?T:4294967296+T)*m,m*=4294967296}return w},n.toString=function(w){if(w=w||10,2>w||36<w)throw Error("radix out of range: "+w);if(P(this))return"0";if(k(this))return"-"+V(this).toString(w);for(var m=d(Math.pow(w,6)),_=this,T="";;){var I=z(_,m).g;_=q(_,I.j(m));var A=((0<_.g.length?_.g[0]:_.h)>>>0).toString(w);if(_=I,P(_))return A+T;for(;6>A.length;)A="0"+A;T=A+T}},n.i=function(w){return 0>w?0:w<this.g.length?this.g[w]:this.h};function P(w){if(w.h!=0)return!1;for(var m=0;m<w.g.length;m++)if(w.g[m]!=0)return!1;return!0}function k(w){return w.h==-1}n.l=function(w){return w=q(this,w),k(w)?-1:P(w)?0:1};function V(w){for(var m=w.g.length,_=[],T=0;T<m;T++)_[T]=~w.g[T];return new a(_,~w.h).add(E)}n.abs=function(){return k(this)?V(this):this},n.add=function(w){for(var m=Math.max(this.g.length,w.g.length),_=[],T=0,I=0;I<=m;I++){var A=T+(this.i(I)&65535)+(w.i(I)&65535),y=(A>>>16)+(this.i(I)>>>16)+(w.i(I)>>>16);T=y>>>16,A&=65535,y&=65535,_[I]=y<<16|A}return new a(_,_[_.length-1]&-2147483648?-1:0)};function q(w,m){return w.add(V(m))}n.j=function(w){if(P(this)||P(w))return g;if(k(this))return k(w)?V(this).j(V(w)):V(V(this).j(w));if(k(w))return V(this.j(V(w)));if(0>this.l(b)&&0>w.l(b))return d(this.m()*w.m());for(var m=this.g.length+w.g.length,_=[],T=0;T<2*m;T++)_[T]=0;for(T=0;T<this.g.length;T++)for(var I=0;I<w.g.length;I++){var A=this.i(T)>>>16,y=this.i(T)&65535,Gt=w.i(I)>>>16,cn=w.i(I)&65535;_[2*T+2*I]+=y*cn,F(_,2*T+2*I),_[2*T+2*I+1]+=A*cn,F(_,2*T+2*I+1),_[2*T+2*I+1]+=y*Gt,F(_,2*T+2*I+1),_[2*T+2*I+2]+=A*Gt,F(_,2*T+2*I+2)}for(T=0;T<m;T++)_[T]=_[2*T+1]<<16|_[2*T];for(T=m;T<2*m;T++)_[T]=0;return new a(_,0)};function F(w,m){for(;(w[m]&65535)!=w[m];)w[m+1]+=w[m]>>>16,w[m]&=65535,m++}function M(w,m){this.g=w,this.h=m}function z(w,m){if(P(m))throw Error("division by zero");if(P(w))return new M(g,g);if(k(w))return m=z(V(w),m),new M(V(m.g),V(m.h));if(k(m))return m=z(w,V(m)),new M(V(m.g),m.h);if(30<w.g.length){if(k(w)||k(m))throw Error("slowDivide_ only works with positive integers.");for(var _=E,T=m;0>=T.l(w);)_=ht(_),T=ht(T);var I=tt(_,1),A=tt(T,1);for(T=tt(T,2),_=tt(_,2);!P(T);){var y=A.add(T);0>=y.l(w)&&(I=I.add(_),A=y),T=tt(T,1),_=tt(_,1)}return m=q(w,I.j(m)),new M(I,m)}for(I=g;0<=w.l(m);){for(_=Math.max(1,Math.floor(w.m()/m.m())),T=Math.ceil(Math.log(_)/Math.LN2),T=48>=T?1:Math.pow(2,T-48),A=d(_),y=A.j(m);k(y)||0<y.l(w);)_-=T,A=d(_),y=A.j(m);P(A)&&(A=E),I=I.add(A),w=q(w,y)}return new M(I,w)}n.A=function(w){return z(this,w).h},n.and=function(w){for(var m=Math.max(this.g.length,w.g.length),_=[],T=0;T<m;T++)_[T]=this.i(T)&w.i(T);return new a(_,this.h&w.h)},n.or=function(w){for(var m=Math.max(this.g.length,w.g.length),_=[],T=0;T<m;T++)_[T]=this.i(T)|w.i(T);return new a(_,this.h|w.h)},n.xor=function(w){for(var m=Math.max(this.g.length,w.g.length),_=[],T=0;T<m;T++)_[T]=this.i(T)^w.i(T);return new a(_,this.h^w.h)};function ht(w){for(var m=w.g.length+1,_=[],T=0;T<m;T++)_[T]=w.i(T)<<1|w.i(T-1)>>>31;return new a(_,w.h)}function tt(w,m){var _=m>>5;m%=32;for(var T=w.g.length-_,I=[],A=0;A<T;A++)I[A]=0<m?w.i(A+_)>>>m|w.i(A+_+1)<<32-m:w.i(A+_);return new a(I,w.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,sc=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=d,a.fromString=p,le=a}).apply(typeof Na<"u"?Na:typeof self<"u"?self:typeof window<"u"?window:{});var yr=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var ic,Sn,oc,Rr,ii,ac,uc,cc;(function(){var n,t=typeof Object.defineProperties=="function"?Object.defineProperty:function(i,u,l){return i==Array.prototype||i==Object.prototype||(i[u]=l.value),i};function e(i){i=[typeof globalThis=="object"&&globalThis,i,typeof window=="object"&&window,typeof self=="object"&&self,typeof yr=="object"&&yr];for(var u=0;u<i.length;++u){var l=i[u];if(l&&l.Math==Math)return l}throw Error("Cannot find global object")}var r=e(this);function s(i,u){if(u)t:{var l=r;i=i.split(".");for(var f=0;f<i.length-1;f++){var v=i[f];if(!(v in l))break t;l=l[v]}i=i[i.length-1],f=l[i],u=u(f),u!=f&&u!=null&&t(l,i,{configurable:!0,writable:!0,value:u})}}function o(i,u){i instanceof String&&(i+="");var l=0,f=!1,v={next:function(){if(!f&&l<i.length){var R=l++;return{value:u(R,i[R]),done:!1}}return f=!0,{done:!0,value:void 0}}};return v[Symbol.iterator]=function(){return v},v}s("Array.prototype.values",function(i){return i||function(){return o(this,function(u,l){return l})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},c=this||self;function h(i){var u=typeof i;return u=u!="object"?u:i?Array.isArray(i)?"array":u:"null",u=="array"||u=="object"&&typeof i.length=="number"}function d(i){var u=typeof i;return u=="object"&&i!=null||u=="function"}function p(i,u,l){return i.call.apply(i.bind,arguments)}function g(i,u,l){if(!i)throw Error();if(2<arguments.length){var f=Array.prototype.slice.call(arguments,2);return function(){var v=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(v,f),i.apply(u,v)}}return function(){return i.apply(u,arguments)}}function E(i,u,l){return E=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?p:g,E.apply(null,arguments)}function b(i,u){var l=Array.prototype.slice.call(arguments,1);return function(){var f=l.slice();return f.push.apply(f,arguments),i.apply(this,f)}}function P(i,u){function l(){}l.prototype=u.prototype,i.aa=u.prototype,i.prototype=new l,i.prototype.constructor=i,i.Qb=function(f,v,R){for(var D=Array(arguments.length-2),Q=2;Q<arguments.length;Q++)D[Q-2]=arguments[Q];return u.prototype[v].apply(f,D)}}function k(i){const u=i.length;if(0<u){const l=Array(u);for(let f=0;f<u;f++)l[f]=i[f];return l}return[]}function V(i,u){for(let l=1;l<arguments.length;l++){const f=arguments[l];if(h(f)){const v=i.length||0,R=f.length||0;i.length=v+R;for(let D=0;D<R;D++)i[v+D]=f[D]}else i.push(f)}}class q{constructor(u,l){this.i=u,this.j=l,this.h=0,this.g=null}get(){let u;return 0<this.h?(this.h--,u=this.g,this.g=u.next,u.next=null):u=this.i(),u}}function F(i){return/^[\s\xa0]*$/.test(i)}function M(){var i=c.navigator;return i&&(i=i.userAgent)?i:""}function z(i){return z[" "](i),i}z[" "]=function(){};var ht=M().indexOf("Gecko")!=-1&&!(M().toLowerCase().indexOf("webkit")!=-1&&M().indexOf("Edge")==-1)&&!(M().indexOf("Trident")!=-1||M().indexOf("MSIE")!=-1)&&M().indexOf("Edge")==-1;function tt(i,u,l){for(const f in i)u.call(l,i[f],f,i)}function w(i,u){for(const l in i)u.call(void 0,i[l],l,i)}function m(i){const u={};for(const l in i)u[l]=i[l];return u}const _="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function T(i,u){let l,f;for(let v=1;v<arguments.length;v++){f=arguments[v];for(l in f)i[l]=f[l];for(let R=0;R<_.length;R++)l=_[R],Object.prototype.hasOwnProperty.call(f,l)&&(i[l]=f[l])}}function I(i){var u=1;i=i.split(":");const l=[];for(;0<u&&i.length;)l.push(i.shift()),u--;return i.length&&l.push(i.join(":")),l}function A(i){c.setTimeout(()=>{throw i},0)}function y(){var i=_s;let u=null;return i.g&&(u=i.g,i.g=i.g.next,i.g||(i.h=null),u.next=null),u}class Gt{constructor(){this.h=this.g=null}add(u,l){const f=cn.get();f.set(u,l),this.h?this.h.next=f:this.g=f,this.h=f}}var cn=new q(()=>new Ql,i=>i.reset());class Ql{constructor(){this.next=this.g=this.h=null}set(u,l){this.h=u,this.g=l,this.next=null}reset(){this.next=this.g=this.h=null}}let ln,hn=!1,_s=new Gt,To=()=>{const i=c.Promise.resolve(void 0);ln=()=>{i.then(Xl)}};var Xl=()=>{for(var i;i=y();){try{i.h.call(i.g)}catch(l){A(l)}var u=cn;u.j(i),100>u.h&&(u.h++,i.next=u.g,u.g=i)}hn=!1};function ee(){this.s=this.s,this.C=this.C}ee.prototype.s=!1,ee.prototype.ma=function(){this.s||(this.s=!0,this.N())},ee.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function _t(i,u){this.type=i,this.g=this.target=u,this.defaultPrevented=!1}_t.prototype.h=function(){this.defaultPrevented=!0};var Yl=(function(){if(!c.addEventListener||!Object.defineProperty)return!1;var i=!1,u=Object.defineProperty({},"passive",{get:function(){i=!0}});try{const l=()=>{};c.addEventListener("test",l,u),c.removeEventListener("test",l,u)}catch{}return i})();function dn(i,u){if(_t.call(this,i?i.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,i){var l=this.type=i.type,f=i.changedTouches&&i.changedTouches.length?i.changedTouches[0]:null;if(this.target=i.target||i.srcElement,this.g=u,u=i.relatedTarget){if(ht){t:{try{z(u.nodeName);var v=!0;break t}catch{}v=!1}v||(u=null)}}else l=="mouseover"?u=i.fromElement:l=="mouseout"&&(u=i.toElement);this.relatedTarget=u,f?(this.clientX=f.clientX!==void 0?f.clientX:f.pageX,this.clientY=f.clientY!==void 0?f.clientY:f.pageY,this.screenX=f.screenX||0,this.screenY=f.screenY||0):(this.clientX=i.clientX!==void 0?i.clientX:i.pageX,this.clientY=i.clientY!==void 0?i.clientY:i.pageY,this.screenX=i.screenX||0,this.screenY=i.screenY||0),this.button=i.button,this.key=i.key||"",this.ctrlKey=i.ctrlKey,this.altKey=i.altKey,this.shiftKey=i.shiftKey,this.metaKey=i.metaKey,this.pointerId=i.pointerId||0,this.pointerType=typeof i.pointerType=="string"?i.pointerType:Jl[i.pointerType]||"",this.state=i.state,this.i=i,i.defaultPrevented&&dn.aa.h.call(this)}}P(dn,_t);var Jl={2:"touch",3:"pen",4:"mouse"};dn.prototype.h=function(){dn.aa.h.call(this);var i=this.i;i.preventDefault?i.preventDefault():i.returnValue=!1};var Zn="closure_listenable_"+(1e6*Math.random()|0),Zl=0;function th(i,u,l,f,v){this.listener=i,this.proxy=null,this.src=u,this.type=l,this.capture=!!f,this.ha=v,this.key=++Zl,this.da=this.fa=!1}function tr(i){i.da=!0,i.listener=null,i.proxy=null,i.src=null,i.ha=null}function er(i){this.src=i,this.g={},this.h=0}er.prototype.add=function(i,u,l,f,v){var R=i.toString();i=this.g[R],i||(i=this.g[R]=[],this.h++);var D=Es(i,u,f,v);return-1<D?(u=i[D],l||(u.fa=!1)):(u=new th(u,this.src,R,!!f,v),u.fa=l,i.push(u)),u};function ys(i,u){var l=u.type;if(l in i.g){var f=i.g[l],v=Array.prototype.indexOf.call(f,u,void 0),R;(R=0<=v)&&Array.prototype.splice.call(f,v,1),R&&(tr(u),i.g[l].length==0&&(delete i.g[l],i.h--))}}function Es(i,u,l,f){for(var v=0;v<i.length;++v){var R=i[v];if(!R.da&&R.listener==u&&R.capture==!!l&&R.ha==f)return v}return-1}var Ts="closure_lm_"+(1e6*Math.random()|0),Is={};function Io(i,u,l,f,v){if(Array.isArray(u)){for(var R=0;R<u.length;R++)Io(i,u[R],l,f,v);return null}return l=Ao(l),i&&i[Zn]?i.K(u,l,d(f)?!!f.capture:!1,v):eh(i,u,l,!1,f,v)}function eh(i,u,l,f,v,R){if(!u)throw Error("Invalid event type");var D=d(v)?!!v.capture:!!v,Q=vs(i);if(Q||(i[Ts]=Q=new er(i)),l=Q.add(u,l,f,D,R),l.proxy)return l;if(f=nh(),l.proxy=f,f.src=i,f.listener=l,i.addEventListener)Yl||(v=D),v===void 0&&(v=!1),i.addEventListener(u.toString(),f,v);else if(i.attachEvent)i.attachEvent(vo(u.toString()),f);else if(i.addListener&&i.removeListener)i.addListener(f);else throw Error("addEventListener and attachEvent are unavailable.");return l}function nh(){function i(l){return u.call(i.src,i.listener,l)}const u=rh;return i}function wo(i,u,l,f,v){if(Array.isArray(u))for(var R=0;R<u.length;R++)wo(i,u[R],l,f,v);else f=d(f)?!!f.capture:!!f,l=Ao(l),i&&i[Zn]?(i=i.i,u=String(u).toString(),u in i.g&&(R=i.g[u],l=Es(R,l,f,v),-1<l&&(tr(R[l]),Array.prototype.splice.call(R,l,1),R.length==0&&(delete i.g[u],i.h--)))):i&&(i=vs(i))&&(u=i.g[u.toString()],i=-1,u&&(i=Es(u,l,f,v)),(l=-1<i?u[i]:null)&&ws(l))}function ws(i){if(typeof i!="number"&&i&&!i.da){var u=i.src;if(u&&u[Zn])ys(u.i,i);else{var l=i.type,f=i.proxy;u.removeEventListener?u.removeEventListener(l,f,i.capture):u.detachEvent?u.detachEvent(vo(l),f):u.addListener&&u.removeListener&&u.removeListener(f),(l=vs(u))?(ys(l,i),l.h==0&&(l.src=null,u[Ts]=null)):tr(i)}}}function vo(i){return i in Is?Is[i]:Is[i]="on"+i}function rh(i,u){if(i.da)i=!0;else{u=new dn(u,this);var l=i.listener,f=i.ha||i.src;i.fa&&ws(i),i=l.call(f,u)}return i}function vs(i){return i=i[Ts],i instanceof er?i:null}var As="__closure_events_fn_"+(1e9*Math.random()>>>0);function Ao(i){return typeof i=="function"?i:(i[As]||(i[As]=function(u){return i.handleEvent(u)}),i[As])}function yt(){ee.call(this),this.i=new er(this),this.M=this,this.F=null}P(yt,ee),yt.prototype[Zn]=!0,yt.prototype.removeEventListener=function(i,u,l,f){wo(this,i,u,l,f)};function At(i,u){var l,f=i.F;if(f)for(l=[];f;f=f.F)l.push(f);if(i=i.M,f=u.type||u,typeof u=="string")u=new _t(u,i);else if(u instanceof _t)u.target=u.target||i;else{var v=u;u=new _t(f,i),T(u,v)}if(v=!0,l)for(var R=l.length-1;0<=R;R--){var D=u.g=l[R];v=nr(D,f,!0,u)&&v}if(D=u.g=i,v=nr(D,f,!0,u)&&v,v=nr(D,f,!1,u)&&v,l)for(R=0;R<l.length;R++)D=u.g=l[R],v=nr(D,f,!1,u)&&v}yt.prototype.N=function(){if(yt.aa.N.call(this),this.i){var i=this.i,u;for(u in i.g){for(var l=i.g[u],f=0;f<l.length;f++)tr(l[f]);delete i.g[u],i.h--}}this.F=null},yt.prototype.K=function(i,u,l,f){return this.i.add(String(i),u,!1,l,f)},yt.prototype.L=function(i,u,l,f){return this.i.add(String(i),u,!0,l,f)};function nr(i,u,l,f){if(u=i.i.g[String(u)],!u)return!0;u=u.concat();for(var v=!0,R=0;R<u.length;++R){var D=u[R];if(D&&!D.da&&D.capture==l){var Q=D.listener,dt=D.ha||D.src;D.fa&&ys(i.i,D),v=Q.call(dt,f)!==!1&&v}}return v&&!f.defaultPrevented}function Ro(i,u,l){if(typeof i=="function")l&&(i=E(i,l));else if(i&&typeof i.handleEvent=="function")i=E(i.handleEvent,i);else throw Error("Invalid listener argument");return 2147483647<Number(u)?-1:c.setTimeout(i,u||0)}function bo(i){i.g=Ro(()=>{i.g=null,i.i&&(i.i=!1,bo(i))},i.l);const u=i.h;i.h=null,i.m.apply(null,u)}class sh extends ee{constructor(u,l){super(),this.m=u,this.l=l,this.h=null,this.i=!1,this.g=null}j(u){this.h=arguments,this.g?this.i=!0:bo(this)}N(){super.N(),this.g&&(c.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function fn(i){ee.call(this),this.h=i,this.g={}}P(fn,ee);var So=[];function Co(i){tt(i.g,function(u,l){this.g.hasOwnProperty(l)&&ws(u)},i),i.g={}}fn.prototype.N=function(){fn.aa.N.call(this),Co(this)},fn.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Rs=c.JSON.stringify,ih=c.JSON.parse,oh=class{stringify(i){return c.JSON.stringify(i,void 0)}parse(i){return c.JSON.parse(i,void 0)}};function bs(){}bs.prototype.h=null;function Po(i){return i.h||(i.h=i.i())}function Vo(){}var pn={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Ss(){_t.call(this,"d")}P(Ss,_t);function Cs(){_t.call(this,"c")}P(Cs,_t);var Ie={},Do=null;function rr(){return Do=Do||new yt}Ie.La="serverreachability";function No(i){_t.call(this,Ie.La,i)}P(No,_t);function mn(i){const u=rr();At(u,new No(u))}Ie.STAT_EVENT="statevent";function ko(i,u){_t.call(this,Ie.STAT_EVENT,i),this.stat=u}P(ko,_t);function Rt(i){const u=rr();At(u,new ko(u,i))}Ie.Ma="timingevent";function Oo(i,u){_t.call(this,Ie.Ma,i),this.size=u}P(Oo,_t);function gn(i,u){if(typeof i!="function")throw Error("Fn must not be null and must be a function");return c.setTimeout(function(){i()},u)}function _n(){this.g=!0}_n.prototype.xa=function(){this.g=!1};function ah(i,u,l,f,v,R){i.info(function(){if(i.g)if(R)for(var D="",Q=R.split("&"),dt=0;dt<Q.length;dt++){var K=Q[dt].split("=");if(1<K.length){var Et=K[0];K=K[1];var Tt=Et.split("_");D=2<=Tt.length&&Tt[1]=="type"?D+(Et+"="+K+"&"):D+(Et+"=redacted&")}}else D=null;else D=R;return"XMLHTTP REQ ("+f+") [attempt "+v+"]: "+u+`
`+l+`
`+D})}function uh(i,u,l,f,v,R,D){i.info(function(){return"XMLHTTP RESP ("+f+") [ attempt "+v+"]: "+u+`
`+l+`
`+R+" "+D})}function Fe(i,u,l,f){i.info(function(){return"XMLHTTP TEXT ("+u+"): "+lh(i,l)+(f?" "+f:"")})}function ch(i,u){i.info(function(){return"TIMEOUT: "+u})}_n.prototype.info=function(){};function lh(i,u){if(!i.g)return u;if(!u)return null;try{var l=JSON.parse(u);if(l){for(i=0;i<l.length;i++)if(Array.isArray(l[i])){var f=l[i];if(!(2>f.length)){var v=f[1];if(Array.isArray(v)&&!(1>v.length)){var R=v[0];if(R!="noop"&&R!="stop"&&R!="close")for(var D=1;D<v.length;D++)v[D]=""}}}}return Rs(l)}catch{return u}}var sr={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},xo={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},Ps;function ir(){}P(ir,bs),ir.prototype.g=function(){return new XMLHttpRequest},ir.prototype.i=function(){return{}},Ps=new ir;function ne(i,u,l,f){this.j=i,this.i=u,this.l=l,this.R=f||1,this.U=new fn(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Mo}function Mo(){this.i=null,this.g="",this.h=!1}var Lo={},Vs={};function Ds(i,u,l){i.L=1,i.v=cr(Kt(u)),i.m=l,i.P=!0,Fo(i,null)}function Fo(i,u){i.F=Date.now(),or(i),i.A=Kt(i.v);var l=i.A,f=i.R;Array.isArray(f)||(f=[String(f)]),Jo(l.i,"t",f),i.C=0,l=i.j.J,i.h=new Mo,i.g=ga(i.j,l?u:null,!i.m),0<i.O&&(i.M=new sh(E(i.Y,i,i.g),i.O)),u=i.U,l=i.g,f=i.ca;var v="readystatechange";Array.isArray(v)||(v&&(So[0]=v.toString()),v=So);for(var R=0;R<v.length;R++){var D=Io(l,v[R],f||u.handleEvent,!1,u.h||u);if(!D)break;u.g[D.key]=D}u=i.H?m(i.H):{},i.m?(i.u||(i.u="POST"),u["Content-Type"]="application/x-www-form-urlencoded",i.g.ea(i.A,i.u,i.m,u)):(i.u="GET",i.g.ea(i.A,i.u,null,u)),mn(),ah(i.i,i.u,i.A,i.l,i.R,i.m)}ne.prototype.ca=function(i){i=i.target;const u=this.M;u&&Wt(i)==3?u.j():this.Y(i)},ne.prototype.Y=function(i){try{if(i==this.g)t:{const Tt=Wt(this.g);var u=this.g.Ba();const qe=this.g.Z();if(!(3>Tt)&&(Tt!=3||this.g&&(this.h.h||this.g.oa()||ia(this.g)))){this.J||Tt!=4||u==7||(u==8||0>=qe?mn(3):mn(2)),Ns(this);var l=this.g.Z();this.X=l;e:if(Uo(this)){var f=ia(this.g);i="";var v=f.length,R=Wt(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){we(this),yn(this);var D="";break e}this.h.i=new c.TextDecoder}for(u=0;u<v;u++)this.h.h=!0,i+=this.h.i.decode(f[u],{stream:!(R&&u==v-1)});f.length=0,this.h.g+=i,this.C=0,D=this.h.g}else D=this.g.oa();if(this.o=l==200,uh(this.i,this.u,this.A,this.l,this.R,Tt,l),this.o){if(this.T&&!this.K){e:{if(this.g){var Q,dt=this.g;if((Q=dt.g?dt.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!F(Q)){var K=Q;break e}}K=null}if(l=K)Fe(this.i,this.l,l,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,ks(this,l);else{this.o=!1,this.s=3,Rt(12),we(this),yn(this);break t}}if(this.P){l=!0;let xt;for(;!this.J&&this.C<D.length;)if(xt=hh(this,D),xt==Vs){Tt==4&&(this.s=4,Rt(14),l=!1),Fe(this.i,this.l,null,"[Incomplete Response]");break}else if(xt==Lo){this.s=4,Rt(15),Fe(this.i,this.l,D,"[Invalid Chunk]"),l=!1;break}else Fe(this.i,this.l,xt,null),ks(this,xt);if(Uo(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),Tt!=4||D.length!=0||this.h.h||(this.s=1,Rt(16),l=!1),this.o=this.o&&l,!l)Fe(this.i,this.l,D,"[Invalid Chunked Response]"),we(this),yn(this);else if(0<D.length&&!this.W){this.W=!0;var Et=this.j;Et.g==this&&Et.ba&&!Et.M&&(Et.j.info("Great, no buffering proxy detected. Bytes received: "+D.length),Us(Et),Et.M=!0,Rt(11))}}else Fe(this.i,this.l,D,null),ks(this,D);Tt==4&&we(this),this.o&&!this.J&&(Tt==4?da(this.j,this):(this.o=!1,or(this)))}else Ch(this.g),l==400&&0<D.indexOf("Unknown SID")?(this.s=3,Rt(12)):(this.s=0,Rt(13)),we(this),yn(this)}}}catch{}finally{}};function Uo(i){return i.g?i.u=="GET"&&i.L!=2&&i.j.Ca:!1}function hh(i,u){var l=i.C,f=u.indexOf(`
`,l);return f==-1?Vs:(l=Number(u.substring(l,f)),isNaN(l)?Lo:(f+=1,f+l>u.length?Vs:(u=u.slice(f,f+l),i.C=f+l,u)))}ne.prototype.cancel=function(){this.J=!0,we(this)};function or(i){i.S=Date.now()+i.I,Bo(i,i.I)}function Bo(i,u){if(i.B!=null)throw Error("WatchDog timer not null");i.B=gn(E(i.ba,i),u)}function Ns(i){i.B&&(c.clearTimeout(i.B),i.B=null)}ne.prototype.ba=function(){this.B=null;const i=Date.now();0<=i-this.S?(ch(this.i,this.A),this.L!=2&&(mn(),Rt(17)),we(this),this.s=2,yn(this)):Bo(this,this.S-i)};function yn(i){i.j.G==0||i.J||da(i.j,i)}function we(i){Ns(i);var u=i.M;u&&typeof u.ma=="function"&&u.ma(),i.M=null,Co(i.U),i.g&&(u=i.g,i.g=null,u.abort(),u.ma())}function ks(i,u){try{var l=i.j;if(l.G!=0&&(l.g==i||Os(l.h,i))){if(!i.K&&Os(l.h,i)&&l.G==3){try{var f=l.Da.g.parse(u)}catch{f=null}if(Array.isArray(f)&&f.length==3){var v=f;if(v[0]==0){t:if(!l.u){if(l.g)if(l.g.F+3e3<i.F)mr(l),fr(l);else break t;Fs(l),Rt(18)}}else l.za=v[1],0<l.za-l.T&&37500>v[2]&&l.F&&l.v==0&&!l.C&&(l.C=gn(E(l.Za,l),6e3));if(1>=$o(l.h)&&l.ca){try{l.ca()}catch{}l.ca=void 0}}else Ae(l,11)}else if((i.K||l.g==i)&&mr(l),!F(u))for(v=l.Da.g.parse(u),u=0;u<v.length;u++){let K=v[u];if(l.T=K[0],K=K[1],l.G==2)if(K[0]=="c"){l.K=K[1],l.ia=K[2];const Et=K[3];Et!=null&&(l.la=Et,l.j.info("VER="+l.la));const Tt=K[4];Tt!=null&&(l.Aa=Tt,l.j.info("SVER="+l.Aa));const qe=K[5];qe!=null&&typeof qe=="number"&&0<qe&&(f=1.5*qe,l.L=f,l.j.info("backChannelRequestTimeoutMs_="+f)),f=l;const xt=i.g;if(xt){const _r=xt.g?xt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(_r){var R=f.h;R.g||_r.indexOf("spdy")==-1&&_r.indexOf("quic")==-1&&_r.indexOf("h2")==-1||(R.j=R.l,R.g=new Set,R.h&&(xs(R,R.h),R.h=null))}if(f.D){const Bs=xt.g?xt.g.getResponseHeader("X-HTTP-Session-Id"):null;Bs&&(f.ya=Bs,Y(f.I,f.D,Bs))}}l.G=3,l.l&&l.l.ua(),l.ba&&(l.R=Date.now()-i.F,l.j.info("Handshake RTT: "+l.R+"ms")),f=l;var D=i;if(f.qa=ma(f,f.J?f.ia:null,f.W),D.K){zo(f.h,D);var Q=D,dt=f.L;dt&&(Q.I=dt),Q.B&&(Ns(Q),or(Q)),f.g=D}else la(f);0<l.i.length&&pr(l)}else K[0]!="stop"&&K[0]!="close"||Ae(l,7);else l.G==3&&(K[0]=="stop"||K[0]=="close"?K[0]=="stop"?Ae(l,7):Ls(l):K[0]!="noop"&&l.l&&l.l.ta(K),l.v=0)}}mn(4)}catch{}}var dh=class{constructor(i,u){this.g=i,this.map=u}};function qo(i){this.l=i||10,c.PerformanceNavigationTiming?(i=c.performance.getEntriesByType("navigation"),i=0<i.length&&(i[0].nextHopProtocol=="hq"||i[0].nextHopProtocol=="h2")):i=!!(c.chrome&&c.chrome.loadTimes&&c.chrome.loadTimes()&&c.chrome.loadTimes().wasFetchedViaSpdy),this.j=i?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function jo(i){return i.h?!0:i.g?i.g.size>=i.j:!1}function $o(i){return i.h?1:i.g?i.g.size:0}function Os(i,u){return i.h?i.h==u:i.g?i.g.has(u):!1}function xs(i,u){i.g?i.g.add(u):i.h=u}function zo(i,u){i.h&&i.h==u?i.h=null:i.g&&i.g.has(u)&&i.g.delete(u)}qo.prototype.cancel=function(){if(this.i=Ho(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const i of this.g.values())i.cancel();this.g.clear()}};function Ho(i){if(i.h!=null)return i.i.concat(i.h.D);if(i.g!=null&&i.g.size!==0){let u=i.i;for(const l of i.g.values())u=u.concat(l.D);return u}return k(i.i)}function fh(i){if(i.V&&typeof i.V=="function")return i.V();if(typeof Map<"u"&&i instanceof Map||typeof Set<"u"&&i instanceof Set)return Array.from(i.values());if(typeof i=="string")return i.split("");if(h(i)){for(var u=[],l=i.length,f=0;f<l;f++)u.push(i[f]);return u}u=[],l=0;for(f in i)u[l++]=i[f];return u}function ph(i){if(i.na&&typeof i.na=="function")return i.na();if(!i.V||typeof i.V!="function"){if(typeof Map<"u"&&i instanceof Map)return Array.from(i.keys());if(!(typeof Set<"u"&&i instanceof Set)){if(h(i)||typeof i=="string"){var u=[];i=i.length;for(var l=0;l<i;l++)u.push(l);return u}u=[],l=0;for(const f in i)u[l++]=f;return u}}}function Go(i,u){if(i.forEach&&typeof i.forEach=="function")i.forEach(u,void 0);else if(h(i)||typeof i=="string")Array.prototype.forEach.call(i,u,void 0);else for(var l=ph(i),f=fh(i),v=f.length,R=0;R<v;R++)u.call(void 0,f[R],l&&l[R],i)}var Ko=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function mh(i,u){if(i){i=i.split("&");for(var l=0;l<i.length;l++){var f=i[l].indexOf("="),v=null;if(0<=f){var R=i[l].substring(0,f);v=i[l].substring(f+1)}else R=i[l];u(R,v?decodeURIComponent(v.replace(/\+/g," ")):"")}}}function ve(i){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,i instanceof ve){this.h=i.h,ar(this,i.j),this.o=i.o,this.g=i.g,ur(this,i.s),this.l=i.l;var u=i.i,l=new In;l.i=u.i,u.g&&(l.g=new Map(u.g),l.h=u.h),Wo(this,l),this.m=i.m}else i&&(u=String(i).match(Ko))?(this.h=!1,ar(this,u[1]||"",!0),this.o=En(u[2]||""),this.g=En(u[3]||"",!0),ur(this,u[4]),this.l=En(u[5]||"",!0),Wo(this,u[6]||"",!0),this.m=En(u[7]||"")):(this.h=!1,this.i=new In(null,this.h))}ve.prototype.toString=function(){var i=[],u=this.j;u&&i.push(Tn(u,Qo,!0),":");var l=this.g;return(l||u=="file")&&(i.push("//"),(u=this.o)&&i.push(Tn(u,Qo,!0),"@"),i.push(encodeURIComponent(String(l)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),l=this.s,l!=null&&i.push(":",String(l))),(l=this.l)&&(this.g&&l.charAt(0)!="/"&&i.push("/"),i.push(Tn(l,l.charAt(0)=="/"?yh:_h,!0))),(l=this.i.toString())&&i.push("?",l),(l=this.m)&&i.push("#",Tn(l,Th)),i.join("")};function Kt(i){return new ve(i)}function ar(i,u,l){i.j=l?En(u,!0):u,i.j&&(i.j=i.j.replace(/:$/,""))}function ur(i,u){if(u){if(u=Number(u),isNaN(u)||0>u)throw Error("Bad port number "+u);i.s=u}else i.s=null}function Wo(i,u,l){u instanceof In?(i.i=u,Ih(i.i,i.h)):(l||(u=Tn(u,Eh)),i.i=new In(u,i.h))}function Y(i,u,l){i.i.set(u,l)}function cr(i){return Y(i,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),i}function En(i,u){return i?u?decodeURI(i.replace(/%25/g,"%2525")):decodeURIComponent(i):""}function Tn(i,u,l){return typeof i=="string"?(i=encodeURI(i).replace(u,gh),l&&(i=i.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),i):null}function gh(i){return i=i.charCodeAt(0),"%"+(i>>4&15).toString(16)+(i&15).toString(16)}var Qo=/[#\/\?@]/g,_h=/[#\?:]/g,yh=/[#\?]/g,Eh=/[#\?@]/g,Th=/#/g;function In(i,u){this.h=this.g=null,this.i=i||null,this.j=!!u}function re(i){i.g||(i.g=new Map,i.h=0,i.i&&mh(i.i,function(u,l){i.add(decodeURIComponent(u.replace(/\+/g," ")),l)}))}n=In.prototype,n.add=function(i,u){re(this),this.i=null,i=Ue(this,i);var l=this.g.get(i);return l||this.g.set(i,l=[]),l.push(u),this.h+=1,this};function Xo(i,u){re(i),u=Ue(i,u),i.g.has(u)&&(i.i=null,i.h-=i.g.get(u).length,i.g.delete(u))}function Yo(i,u){return re(i),u=Ue(i,u),i.g.has(u)}n.forEach=function(i,u){re(this),this.g.forEach(function(l,f){l.forEach(function(v){i.call(u,v,f,this)},this)},this)},n.na=function(){re(this);const i=Array.from(this.g.values()),u=Array.from(this.g.keys()),l=[];for(let f=0;f<u.length;f++){const v=i[f];for(let R=0;R<v.length;R++)l.push(u[f])}return l},n.V=function(i){re(this);let u=[];if(typeof i=="string")Yo(this,i)&&(u=u.concat(this.g.get(Ue(this,i))));else{i=Array.from(this.g.values());for(let l=0;l<i.length;l++)u=u.concat(i[l])}return u},n.set=function(i,u){return re(this),this.i=null,i=Ue(this,i),Yo(this,i)&&(this.h-=this.g.get(i).length),this.g.set(i,[u]),this.h+=1,this},n.get=function(i,u){return i?(i=this.V(i),0<i.length?String(i[0]):u):u};function Jo(i,u,l){Xo(i,u),0<l.length&&(i.i=null,i.g.set(Ue(i,u),k(l)),i.h+=l.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const i=[],u=Array.from(this.g.keys());for(var l=0;l<u.length;l++){var f=u[l];const R=encodeURIComponent(String(f)),D=this.V(f);for(f=0;f<D.length;f++){var v=R;D[f]!==""&&(v+="="+encodeURIComponent(String(D[f]))),i.push(v)}}return this.i=i.join("&")};function Ue(i,u){return u=String(u),i.j&&(u=u.toLowerCase()),u}function Ih(i,u){u&&!i.j&&(re(i),i.i=null,i.g.forEach(function(l,f){var v=f.toLowerCase();f!=v&&(Xo(this,f),Jo(this,v,l))},i)),i.j=u}function wh(i,u){const l=new _n;if(c.Image){const f=new Image;f.onload=b(se,l,"TestLoadImage: loaded",!0,u,f),f.onerror=b(se,l,"TestLoadImage: error",!1,u,f),f.onabort=b(se,l,"TestLoadImage: abort",!1,u,f),f.ontimeout=b(se,l,"TestLoadImage: timeout",!1,u,f),c.setTimeout(function(){f.ontimeout&&f.ontimeout()},1e4),f.src=i}else u(!1)}function vh(i,u){const l=new _n,f=new AbortController,v=setTimeout(()=>{f.abort(),se(l,"TestPingServer: timeout",!1,u)},1e4);fetch(i,{signal:f.signal}).then(R=>{clearTimeout(v),R.ok?se(l,"TestPingServer: ok",!0,u):se(l,"TestPingServer: server error",!1,u)}).catch(()=>{clearTimeout(v),se(l,"TestPingServer: error",!1,u)})}function se(i,u,l,f,v){try{v&&(v.onload=null,v.onerror=null,v.onabort=null,v.ontimeout=null),f(l)}catch{}}function Ah(){this.g=new oh}function Rh(i,u,l){const f=l||"";try{Go(i,function(v,R){let D=v;d(v)&&(D=Rs(v)),u.push(f+R+"="+encodeURIComponent(D))})}catch(v){throw u.push(f+"type="+encodeURIComponent("_badmap")),v}}function lr(i){this.l=i.Ub||null,this.j=i.eb||!1}P(lr,bs),lr.prototype.g=function(){return new hr(this.l,this.j)},lr.prototype.i=(function(i){return function(){return i}})({});function hr(i,u){yt.call(this),this.D=i,this.o=u,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}P(hr,yt),n=hr.prototype,n.open=function(i,u){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=i,this.A=u,this.readyState=1,vn(this)},n.send=function(i){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const u={headers:this.u,method:this.B,credentials:this.m,cache:void 0};i&&(u.body=i),(this.D||c).fetch(new Request(this.A,u)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,wn(this)),this.readyState=0},n.Sa=function(i){if(this.g&&(this.l=i,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=i.headers,this.readyState=2,vn(this)),this.g&&(this.readyState=3,vn(this),this.g)))if(this.responseType==="arraybuffer")i.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof c.ReadableStream<"u"&&"body"in i){if(this.j=i.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Zo(this)}else i.text().then(this.Ra.bind(this),this.ga.bind(this))};function Zo(i){i.j.read().then(i.Pa.bind(i)).catch(i.ga.bind(i))}n.Pa=function(i){if(this.g){if(this.o&&i.value)this.response.push(i.value);else if(!this.o){var u=i.value?i.value:new Uint8Array(0);(u=this.v.decode(u,{stream:!i.done}))&&(this.response=this.responseText+=u)}i.done?wn(this):vn(this),this.readyState==3&&Zo(this)}},n.Ra=function(i){this.g&&(this.response=this.responseText=i,wn(this))},n.Qa=function(i){this.g&&(this.response=i,wn(this))},n.ga=function(){this.g&&wn(this)};function wn(i){i.readyState=4,i.l=null,i.j=null,i.v=null,vn(i)}n.setRequestHeader=function(i,u){this.u.append(i,u)},n.getResponseHeader=function(i){return this.h&&this.h.get(i.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const i=[],u=this.h.entries();for(var l=u.next();!l.done;)l=l.value,i.push(l[0]+": "+l[1]),l=u.next();return i.join(`\r
`)};function vn(i){i.onreadystatechange&&i.onreadystatechange.call(i)}Object.defineProperty(hr.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(i){this.m=i?"include":"same-origin"}});function ta(i){let u="";return tt(i,function(l,f){u+=f,u+=":",u+=l,u+=`\r
`}),u}function Ms(i,u,l){t:{for(f in l){var f=!1;break t}f=!0}f||(l=ta(l),typeof i=="string"?l!=null&&encodeURIComponent(String(l)):Y(i,u,l))}function rt(i){yt.call(this),this.headers=new Map,this.o=i||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}P(rt,yt);var bh=/^https?$/i,Sh=["POST","PUT"];n=rt.prototype,n.Ha=function(i){this.J=i},n.ea=function(i,u,l,f){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+i);u=u?u.toUpperCase():"GET",this.D=i,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():Ps.g(),this.v=this.o?Po(this.o):Po(Ps),this.g.onreadystatechange=E(this.Ea,this);try{this.B=!0,this.g.open(u,String(i),!0),this.B=!1}catch(R){ea(this,R);return}if(i=l||"",l=new Map(this.headers),f)if(Object.getPrototypeOf(f)===Object.prototype)for(var v in f)l.set(v,f[v]);else if(typeof f.keys=="function"&&typeof f.get=="function")for(const R of f.keys())l.set(R,f.get(R));else throw Error("Unknown input type for opt_headers: "+String(f));f=Array.from(l.keys()).find(R=>R.toLowerCase()=="content-type"),v=c.FormData&&i instanceof c.FormData,!(0<=Array.prototype.indexOf.call(Sh,u,void 0))||f||v||l.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[R,D]of l)this.g.setRequestHeader(R,D);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{sa(this),this.u=!0,this.g.send(i),this.u=!1}catch(R){ea(this,R)}};function ea(i,u){i.h=!1,i.g&&(i.j=!0,i.g.abort(),i.j=!1),i.l=u,i.m=5,na(i),dr(i)}function na(i){i.A||(i.A=!0,At(i,"complete"),At(i,"error"))}n.abort=function(i){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=i||7,At(this,"complete"),At(this,"abort"),dr(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),dr(this,!0)),rt.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?ra(this):this.bb())},n.bb=function(){ra(this)};function ra(i){if(i.h&&typeof a<"u"&&(!i.v[1]||Wt(i)!=4||i.Z()!=2)){if(i.u&&Wt(i)==4)Ro(i.Ea,0,i);else if(At(i,"readystatechange"),Wt(i)==4){i.h=!1;try{const D=i.Z();t:switch(D){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var u=!0;break t;default:u=!1}var l;if(!(l=u)){var f;if(f=D===0){var v=String(i.D).match(Ko)[1]||null;!v&&c.self&&c.self.location&&(v=c.self.location.protocol.slice(0,-1)),f=!bh.test(v?v.toLowerCase():"")}l=f}if(l)At(i,"complete"),At(i,"success");else{i.m=6;try{var R=2<Wt(i)?i.g.statusText:""}catch{R=""}i.l=R+" ["+i.Z()+"]",na(i)}}finally{dr(i)}}}}function dr(i,u){if(i.g){sa(i);const l=i.g,f=i.v[0]?()=>{}:null;i.g=null,i.v=null,u||At(i,"ready");try{l.onreadystatechange=f}catch{}}}function sa(i){i.I&&(c.clearTimeout(i.I),i.I=null)}n.isActive=function(){return!!this.g};function Wt(i){return i.g?i.g.readyState:0}n.Z=function(){try{return 2<Wt(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(i){if(this.g){var u=this.g.responseText;return i&&u.indexOf(i)==0&&(u=u.substring(i.length)),ih(u)}};function ia(i){try{if(!i.g)return null;if("response"in i.g)return i.g.response;switch(i.H){case"":case"text":return i.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in i.g)return i.g.mozResponseArrayBuffer}return null}catch{return null}}function Ch(i){const u={};i=(i.g&&2<=Wt(i)&&i.g.getAllResponseHeaders()||"").split(`\r
`);for(let f=0;f<i.length;f++){if(F(i[f]))continue;var l=I(i[f]);const v=l[0];if(l=l[1],typeof l!="string")continue;l=l.trim();const R=u[v]||[];u[v]=R,R.push(l)}w(u,function(f){return f.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function An(i,u,l){return l&&l.internalChannelParams&&l.internalChannelParams[i]||u}function oa(i){this.Aa=0,this.i=[],this.j=new _n,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=An("failFast",!1,i),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=An("baseRetryDelayMs",5e3,i),this.cb=An("retryDelaySeedMs",1e4,i),this.Wa=An("forwardChannelMaxRetries",2,i),this.wa=An("forwardChannelRequestTimeoutMs",2e4,i),this.pa=i&&i.xmlHttpFactory||void 0,this.Xa=i&&i.Tb||void 0,this.Ca=i&&i.useFetchStreams||!1,this.L=void 0,this.J=i&&i.supportsCrossDomainXhr||!1,this.K="",this.h=new qo(i&&i.concurrentRequestLimit),this.Da=new Ah,this.P=i&&i.fastHandshake||!1,this.O=i&&i.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=i&&i.Rb||!1,i&&i.xa&&this.j.xa(),i&&i.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&i&&i.detectBufferingProxy||!1,this.ja=void 0,i&&i.longPollingTimeout&&0<i.longPollingTimeout&&(this.ja=i.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=oa.prototype,n.la=8,n.G=1,n.connect=function(i,u,l,f){Rt(0),this.W=i,this.H=u||{},l&&f!==void 0&&(this.H.OSID=l,this.H.OAID=f),this.F=this.X,this.I=ma(this,null,this.W),pr(this)};function Ls(i){if(aa(i),i.G==3){var u=i.U++,l=Kt(i.I);if(Y(l,"SID",i.K),Y(l,"RID",u),Y(l,"TYPE","terminate"),Rn(i,l),u=new ne(i,i.j,u),u.L=2,u.v=cr(Kt(l)),l=!1,c.navigator&&c.navigator.sendBeacon)try{l=c.navigator.sendBeacon(u.v.toString(),"")}catch{}!l&&c.Image&&(new Image().src=u.v,l=!0),l||(u.g=ga(u.j,null),u.g.ea(u.v)),u.F=Date.now(),or(u)}pa(i)}function fr(i){i.g&&(Us(i),i.g.cancel(),i.g=null)}function aa(i){fr(i),i.u&&(c.clearTimeout(i.u),i.u=null),mr(i),i.h.cancel(),i.s&&(typeof i.s=="number"&&c.clearTimeout(i.s),i.s=null)}function pr(i){if(!jo(i.h)&&!i.s){i.s=!0;var u=i.Ga;ln||To(),hn||(ln(),hn=!0),_s.add(u,i),i.B=0}}function Ph(i,u){return $o(i.h)>=i.h.j-(i.s?1:0)?!1:i.s?(i.i=u.D.concat(i.i),!0):i.G==1||i.G==2||i.B>=(i.Va?0:i.Wa)?!1:(i.s=gn(E(i.Ga,i,u),fa(i,i.B)),i.B++,!0)}n.Ga=function(i){if(this.s)if(this.s=null,this.G==1){if(!i){this.U=Math.floor(1e5*Math.random()),i=this.U++;const v=new ne(this,this.j,i);let R=this.o;if(this.S&&(R?(R=m(R),T(R,this.S)):R=this.S),this.m!==null||this.O||(v.H=R,R=null),this.P)t:{for(var u=0,l=0;l<this.i.length;l++){e:{var f=this.i[l];if("__data__"in f.map&&(f=f.map.__data__,typeof f=="string")){f=f.length;break e}f=void 0}if(f===void 0)break;if(u+=f,4096<u){u=l;break t}if(u===4096||l===this.i.length-1){u=l+1;break t}}u=1e3}else u=1e3;u=ca(this,v,u),l=Kt(this.I),Y(l,"RID",i),Y(l,"CVER",22),this.D&&Y(l,"X-HTTP-Session-Id",this.D),Rn(this,l),R&&(this.O?u="headers="+encodeURIComponent(String(ta(R)))+"&"+u:this.m&&Ms(l,this.m,R)),xs(this.h,v),this.Ua&&Y(l,"TYPE","init"),this.P?(Y(l,"$req",u),Y(l,"SID","null"),v.T=!0,Ds(v,l,null)):Ds(v,l,u),this.G=2}}else this.G==3&&(i?ua(this,i):this.i.length==0||jo(this.h)||ua(this))};function ua(i,u){var l;u?l=u.l:l=i.U++;const f=Kt(i.I);Y(f,"SID",i.K),Y(f,"RID",l),Y(f,"AID",i.T),Rn(i,f),i.m&&i.o&&Ms(f,i.m,i.o),l=new ne(i,i.j,l,i.B+1),i.m===null&&(l.H=i.o),u&&(i.i=u.D.concat(i.i)),u=ca(i,l,1e3),l.I=Math.round(.5*i.wa)+Math.round(.5*i.wa*Math.random()),xs(i.h,l),Ds(l,f,u)}function Rn(i,u){i.H&&tt(i.H,function(l,f){Y(u,f,l)}),i.l&&Go({},function(l,f){Y(u,f,l)})}function ca(i,u,l){l=Math.min(i.i.length,l);var f=i.l?E(i.l.Na,i.l,i):null;t:{var v=i.i;let R=-1;for(;;){const D=["count="+l];R==-1?0<l?(R=v[0].g,D.push("ofs="+R)):R=0:D.push("ofs="+R);let Q=!0;for(let dt=0;dt<l;dt++){let K=v[dt].g;const Et=v[dt].map;if(K-=R,0>K)R=Math.max(0,v[dt].g-100),Q=!1;else try{Rh(Et,D,"req"+K+"_")}catch{f&&f(Et)}}if(Q){f=D.join("&");break t}}}return i=i.i.splice(0,l),u.D=i,f}function la(i){if(!i.g&&!i.u){i.Y=1;var u=i.Fa;ln||To(),hn||(ln(),hn=!0),_s.add(u,i),i.v=0}}function Fs(i){return i.g||i.u||3<=i.v?!1:(i.Y++,i.u=gn(E(i.Fa,i),fa(i,i.v)),i.v++,!0)}n.Fa=function(){if(this.u=null,ha(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var i=2*this.R;this.j.info("BP detection timer enabled: "+i),this.A=gn(E(this.ab,this),i)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,Rt(10),fr(this),ha(this))};function Us(i){i.A!=null&&(c.clearTimeout(i.A),i.A=null)}function ha(i){i.g=new ne(i,i.j,"rpc",i.Y),i.m===null&&(i.g.H=i.o),i.g.O=0;var u=Kt(i.qa);Y(u,"RID","rpc"),Y(u,"SID",i.K),Y(u,"AID",i.T),Y(u,"CI",i.F?"0":"1"),!i.F&&i.ja&&Y(u,"TO",i.ja),Y(u,"TYPE","xmlhttp"),Rn(i,u),i.m&&i.o&&Ms(u,i.m,i.o),i.L&&(i.g.I=i.L);var l=i.g;i=i.ia,l.L=1,l.v=cr(Kt(u)),l.m=null,l.P=!0,Fo(l,i)}n.Za=function(){this.C!=null&&(this.C=null,fr(this),Fs(this),Rt(19))};function mr(i){i.C!=null&&(c.clearTimeout(i.C),i.C=null)}function da(i,u){var l=null;if(i.g==u){mr(i),Us(i),i.g=null;var f=2}else if(Os(i.h,u))l=u.D,zo(i.h,u),f=1;else return;if(i.G!=0){if(u.o)if(f==1){l=u.m?u.m.length:0,u=Date.now()-u.F;var v=i.B;f=rr(),At(f,new Oo(f,l)),pr(i)}else la(i);else if(v=u.s,v==3||v==0&&0<u.X||!(f==1&&Ph(i,u)||f==2&&Fs(i)))switch(l&&0<l.length&&(u=i.h,u.i=u.i.concat(l)),v){case 1:Ae(i,5);break;case 4:Ae(i,10);break;case 3:Ae(i,6);break;default:Ae(i,2)}}}function fa(i,u){let l=i.Ta+Math.floor(Math.random()*i.cb);return i.isActive()||(l*=2),l*u}function Ae(i,u){if(i.j.info("Error code "+u),u==2){var l=E(i.fb,i),f=i.Xa;const v=!f;f=new ve(f||"//www.google.com/images/cleardot.gif"),c.location&&c.location.protocol=="http"||ar(f,"https"),cr(f),v?wh(f.toString(),l):vh(f.toString(),l)}else Rt(2);i.G=0,i.l&&i.l.sa(u),pa(i),aa(i)}n.fb=function(i){i?(this.j.info("Successfully pinged google.com"),Rt(2)):(this.j.info("Failed to ping google.com"),Rt(1))};function pa(i){if(i.G=0,i.ka=[],i.l){const u=Ho(i.h);(u.length!=0||i.i.length!=0)&&(V(i.ka,u),V(i.ka,i.i),i.h.i.length=0,k(i.i),i.i.length=0),i.l.ra()}}function ma(i,u,l){var f=l instanceof ve?Kt(l):new ve(l);if(f.g!="")u&&(f.g=u+"."+f.g),ur(f,f.s);else{var v=c.location;f=v.protocol,u=u?u+"."+v.hostname:v.hostname,v=+v.port;var R=new ve(null);f&&ar(R,f),u&&(R.g=u),v&&ur(R,v),l&&(R.l=l),f=R}return l=i.D,u=i.ya,l&&u&&Y(f,l,u),Y(f,"VER",i.la),Rn(i,f),f}function ga(i,u,l){if(u&&!i.J)throw Error("Can't create secondary domain capable XhrIo object.");return u=i.Ca&&!i.pa?new rt(new lr({eb:l})):new rt(i.pa),u.Ha(i.J),u}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function _a(){}n=_a.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function gr(){}gr.prototype.g=function(i,u){return new Vt(i,u)};function Vt(i,u){yt.call(this),this.g=new oa(u),this.l=i,this.h=u&&u.messageUrlParams||null,i=u&&u.messageHeaders||null,u&&u.clientProtocolHeaderRequired&&(i?i["X-Client-Protocol"]="webchannel":i={"X-Client-Protocol":"webchannel"}),this.g.o=i,i=u&&u.initMessageHeaders||null,u&&u.messageContentType&&(i?i["X-WebChannel-Content-Type"]=u.messageContentType:i={"X-WebChannel-Content-Type":u.messageContentType}),u&&u.va&&(i?i["X-WebChannel-Client-Profile"]=u.va:i={"X-WebChannel-Client-Profile":u.va}),this.g.S=i,(i=u&&u.Sb)&&!F(i)&&(this.g.m=i),this.v=u&&u.supportsCrossDomainXhr||!1,this.u=u&&u.sendRawJson||!1,(u=u&&u.httpSessionIdParam)&&!F(u)&&(this.g.D=u,i=this.h,i!==null&&u in i&&(i=this.h,u in i&&delete i[u])),this.j=new Be(this)}P(Vt,yt),Vt.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Vt.prototype.close=function(){Ls(this.g)},Vt.prototype.o=function(i){var u=this.g;if(typeof i=="string"){var l={};l.__data__=i,i=l}else this.u&&(l={},l.__data__=Rs(i),i=l);u.i.push(new dh(u.Ya++,i)),u.G==3&&pr(u)},Vt.prototype.N=function(){this.g.l=null,delete this.j,Ls(this.g),delete this.g,Vt.aa.N.call(this)};function ya(i){Ss.call(this),i.__headers__&&(this.headers=i.__headers__,this.statusCode=i.__status__,delete i.__headers__,delete i.__status__);var u=i.__sm__;if(u){t:{for(const l in u){i=l;break t}i=void 0}(this.i=i)&&(i=this.i,u=u!==null&&i in u?u[i]:void 0),this.data=u}else this.data=i}P(ya,Ss);function Ea(){Cs.call(this),this.status=1}P(Ea,Cs);function Be(i){this.g=i}P(Be,_a),Be.prototype.ua=function(){At(this.g,"a")},Be.prototype.ta=function(i){At(this.g,new ya(i))},Be.prototype.sa=function(i){At(this.g,new Ea)},Be.prototype.ra=function(){At(this.g,"b")},gr.prototype.createWebChannel=gr.prototype.g,Vt.prototype.send=Vt.prototype.o,Vt.prototype.open=Vt.prototype.m,Vt.prototype.close=Vt.prototype.close,cc=function(){return new gr},uc=function(){return rr()},ac=Ie,ii={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},sr.NO_ERROR=0,sr.TIMEOUT=8,sr.HTTP_ERROR=6,Rr=sr,xo.COMPLETE="complete",oc=xo,Vo.EventType=pn,pn.OPEN="a",pn.CLOSE="b",pn.ERROR="c",pn.MESSAGE="d",yt.prototype.listen=yt.prototype.K,Sn=Vo,rt.prototype.listenOnce=rt.prototype.L,rt.prototype.getLastError=rt.prototype.Ka,rt.prototype.getLastErrorCode=rt.prototype.Ba,rt.prototype.getStatus=rt.prototype.Z,rt.prototype.getResponseJson=rt.prototype.Oa,rt.prototype.getResponseText=rt.prototype.oa,rt.prototype.send=rt.prototype.ea,rt.prototype.setWithCredentials=rt.prototype.Ha,ic=rt}).apply(typeof yr<"u"?yr:typeof self<"u"?self:typeof window<"u"?window:{});const ka="@firebase/firestore",Oa="4.9.1";/**
 * @license
 * Copyright 2017 Google LLC
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
 */class wt{constructor(t){this.uid=t}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(t){return t.uid===this.uid}}wt.UNAUTHENTICATED=new wt(null),wt.GOOGLE_CREDENTIALS=new wt("google-credentials-uid"),wt.FIRST_PARTY=new wt("first-party-uid"),wt.MOCK_USER=new wt("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
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
 */let rn="12.2.0";/**
 * @license
 * Copyright 2017 Google LLC
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
 */const Ve=new Qu("@firebase/firestore");function $e(){return Ve.logLevel}function O(n,...t){if(Ve.logLevel<=G.DEBUG){const e=t.map(Ri);Ve.debug(`Firestore (${rn}): ${n}`,...e)}}function Zt(n,...t){if(Ve.logLevel<=G.ERROR){const e=t.map(Ri);Ve.error(`Firestore (${rn}): ${n}`,...e)}}function Xe(n,...t){if(Ve.logLevel<=G.WARN){const e=t.map(Ri);Ve.warn(`Firestore (${rn}): ${n}`,...e)}}function Ri(n){if(typeof n=="string")return n;try{/**
* @license
* Copyright 2020 Google LLC
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
*/return(function(e){return JSON.stringify(e)})(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */function L(n,t,e){let r="Unexpected state";typeof t=="string"?r=t:e=t,lc(n,r,e)}function lc(n,t,e){let r=`FIRESTORE (${rn}) INTERNAL ASSERTION FAILED: ${t} (ID: ${n.toString(16)})`;if(e!==void 0)try{r+=" CONTEXT: "+JSON.stringify(e)}catch{r+=" CONTEXT: "+e}throw Zt(r),new Error(r)}function W(n,t,e,r){let s="Unexpected state";typeof e=="string"?s=e:r=e,n||lc(t,s,r)}function B(n,t){return n}/**
 * @license
 * Copyright 2017 Google LLC
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
 */const S={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class N extends ke{constructor(t,e){super(t,e),this.code=t,this.message=e,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Xt{constructor(){this.promise=new Promise(((t,e)=>{this.resolve=t,this.reject=e}))}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class hc{constructor(t,e){this.user=e,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${t}`)}}class uf{getToken(){return Promise.resolve(null)}invalidateToken(){}start(t,e){t.enqueueRetryable((()=>e(wt.UNAUTHENTICATED)))}shutdown(){}}class cf{constructor(t){this.token=t,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(t,e){this.changeListener=e,t.enqueueRetryable((()=>e(this.token.user)))}shutdown(){this.changeListener=null}}class lf{constructor(t){this.t=t,this.currentUser=wt.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(t,e){W(this.o===void 0,42304);let r=this.i;const s=h=>this.i!==r?(r=this.i,e(h)):Promise.resolve();let o=new Xt;this.o=()=>{this.i++,this.currentUser=this.u(),o.resolve(),o=new Xt,t.enqueueRetryable((()=>s(this.currentUser)))};const a=()=>{const h=o;t.enqueueRetryable((async()=>{await h.promise,await s(this.currentUser)}))},c=h=>{O("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=h,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit((h=>c(h))),setTimeout((()=>{if(!this.auth){const h=this.t.getImmediate({optional:!0});h?c(h):(O("FirebaseAuthCredentialsProvider","Auth not yet detected"),o.resolve(),o=new Xt)}}),0),a()}getToken(){const t=this.i,e=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(e).then((r=>this.i!==t?(O("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(W(typeof r.accessToken=="string",31837,{l:r}),new hc(r.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const t=this.auth&&this.auth.getUid();return W(t===null||typeof t=="string",2055,{h:t}),new wt(t)}}class hf{constructor(t,e,r){this.P=t,this.T=e,this.I=r,this.type="FirstParty",this.user=wt.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const t=this.R();return t&&this.A.set("Authorization",t),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class df{constructor(t,e,r){this.P=t,this.T=e,this.I=r}getToken(){return Promise.resolve(new hf(this.P,this.T,this.I))}start(t,e){t.enqueueRetryable((()=>e(wt.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class xa{constructor(t){this.value=t,this.type="AppCheck",this.headers=new Map,t&&t.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class ff{constructor(t,e){this.V=e,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Zu(t)&&t.settings.appCheckToken&&(this.p=t.settings.appCheckToken)}start(t,e){W(this.o===void 0,3512);const r=o=>{o.error!=null&&O("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${o.error.message}`);const a=o.token!==this.m;return this.m=o.token,O("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?e(o.token):Promise.resolve()};this.o=o=>{t.enqueueRetryable((()=>r(o)))};const s=o=>{O("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=o,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit((o=>s(o))),setTimeout((()=>{if(!this.appCheck){const o=this.V.getImmediate({optional:!0});o?s(o):O("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.p)return Promise.resolve(new xa(this.p));const t=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(t).then((e=>e?(W(typeof e.token=="string",44558,{tokenResult:e}),this.m=e.token,new xa(e.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */function pf(n){const t=typeof self<"u"&&(self.crypto||self.msCrypto),e=new Uint8Array(n);if(t&&typeof t.getRandomValues=="function")t.getRandomValues(e);else for(let r=0;r<n;r++)e[r]=Math.floor(256*Math.random());return e}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class bi{static newId(){const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",e=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const s=pf(40);for(let o=0;o<s.length;++o)r.length<20&&s[o]<e&&(r+=t.charAt(s[o]%62))}return r}}function j(n,t){return n<t?-1:n>t?1:0}function oi(n,t){const e=Math.min(n.length,t.length);for(let r=0;r<e;r++){const s=n.charAt(r),o=t.charAt(r);if(s!==o)return Hs(s)===Hs(o)?j(s,o):Hs(s)?1:-1}return j(n.length,t.length)}const mf=55296,gf=57343;function Hs(n){const t=n.charCodeAt(0);return t>=mf&&t<=gf}function Ye(n,t,e){return n.length===t.length&&n.every(((r,s)=>e(r,t[s])))}/**
 * @license
 * Copyright 2017 Google LLC
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
 */const Ma="__name__";class Ft{constructor(t,e,r){e===void 0?e=0:e>t.length&&L(637,{offset:e,range:t.length}),r===void 0?r=t.length-e:r>t.length-e&&L(1746,{length:r,range:t.length-e}),this.segments=t,this.offset=e,this.len=r}get length(){return this.len}isEqual(t){return Ft.comparator(this,t)===0}child(t){const e=this.segments.slice(this.offset,this.limit());return t instanceof Ft?t.forEach((r=>{e.push(r)})):e.push(t),this.construct(e)}limit(){return this.offset+this.length}popFirst(t){return t=t===void 0?1:t,this.construct(this.segments,this.offset+t,this.length-t)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(t){return this.segments[this.offset+t]}isEmpty(){return this.length===0}isPrefixOf(t){if(t.length<this.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}isImmediateParentOf(t){if(this.length+1!==t.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}forEach(t){for(let e=this.offset,r=this.limit();e<r;e++)t(this.segments[e])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(t,e){const r=Math.min(t.length,e.length);for(let s=0;s<r;s++){const o=Ft.compareSegments(t.get(s),e.get(s));if(o!==0)return o}return j(t.length,e.length)}static compareSegments(t,e){const r=Ft.isNumericId(t),s=Ft.isNumericId(e);return r&&!s?-1:!r&&s?1:r&&s?Ft.extractNumericId(t).compare(Ft.extractNumericId(e)):oi(t,e)}static isNumericId(t){return t.startsWith("__id")&&t.endsWith("__")}static extractNumericId(t){return le.fromString(t.substring(4,t.length-2))}}class X extends Ft{construct(t,e,r){return new X(t,e,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...t){const e=[];for(const r of t){if(r.indexOf("//")>=0)throw new N(S.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);e.push(...r.split("/").filter((s=>s.length>0)))}return new X(e)}static emptyPath(){return new X([])}}const _f=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class pt extends Ft{construct(t,e,r){return new pt(t,e,r)}static isValidIdentifier(t){return _f.test(t)}canonicalString(){return this.toArray().map((t=>(t=t.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),pt.isValidIdentifier(t)||(t="`"+t+"`"),t))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Ma}static keyField(){return new pt([Ma])}static fromServerFormat(t){const e=[];let r="",s=0;const o=()=>{if(r.length===0)throw new N(S.INVALID_ARGUMENT,`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);e.push(r),r=""};let a=!1;for(;s<t.length;){const c=t[s];if(c==="\\"){if(s+1===t.length)throw new N(S.INVALID_ARGUMENT,"Path has trailing escape character: "+t);const h=t[s+1];if(h!=="\\"&&h!=="."&&h!=="`")throw new N(S.INVALID_ARGUMENT,"Path has invalid escape sequence: "+t);r+=h,s+=2}else c==="`"?(a=!a,s++):c!=="."||a?(r+=c,s++):(o(),s++)}if(o(),a)throw new N(S.INVALID_ARGUMENT,"Unterminated ` in path: "+t);return new pt(e)}static emptyPath(){return new pt([])}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class x{constructor(t){this.path=t}static fromPath(t){return new x(X.fromString(t))}static fromName(t){return new x(X.fromString(t).popFirst(5))}static empty(){return new x(X.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(t){return this.path.length>=2&&this.path.get(this.path.length-2)===t}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(t){return t!==null&&X.comparator(this.path,t.path)===0}toString(){return this.path.toString()}static comparator(t,e){return X.comparator(t.path,e.path)}static isDocumentKey(t){return t.length%2==0}static fromSegments(t){return new x(new X(t.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */function dc(n,t,e){if(!e)throw new N(S.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${t}.`)}function yf(n,t,e,r){if(t===!0&&r===!0)throw new N(S.INVALID_ARGUMENT,`${n} and ${e} cannot be used together.`)}function La(n){if(!x.isDocumentKey(n))throw new N(S.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function Fa(n){if(x.isDocumentKey(n))throw new N(S.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function fc(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function Wr(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const t=(function(r){return r.constructor?r.constructor.name:null})(n);return t?`a custom ${t} object`:"an object"}}return typeof n=="function"?"a function":L(12329,{type:typeof n})}function Ot(n,t){if("_delegate"in n&&(n=n._delegate),!(n instanceof t)){if(t.name===n.constructor.name)throw new N(S.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const e=Wr(n);throw new N(S.INVALID_ARGUMENT,`Expected type '${t.name}', but it was: ${e}`)}}return n}function Ef(n,t){if(t<=0)throw new N(S.INVALID_ARGUMENT,`Function ${n}() requires a positive number, but it was: ${t}.`)}/**
 * @license
 * Copyright 2025 Google LLC
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
 */function ut(n,t){const e={typeString:n};return t&&(e.value=t),e}function Gn(n,t){if(!fc(n))throw new N(S.INVALID_ARGUMENT,"JSON must be an object");let e;for(const r in t)if(t[r]){const s=t[r].typeString,o="value"in t[r]?{value:t[r].value}:void 0;if(!(r in n)){e=`JSON missing required field: '${r}'`;break}const a=n[r];if(s&&typeof a!==s){e=`JSON field '${r}' must be a ${s}.`;break}if(o!==void 0&&a!==o.value){e=`Expected '${r}' field to equal '${o.value}'`;break}}if(e)throw new N(S.INVALID_ARGUMENT,e);return!0}/**
 * @license
 * Copyright 2017 Google LLC
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
 */const Ua=-62135596800,Ba=1e6;class J{static now(){return J.fromMillis(Date.now())}static fromDate(t){return J.fromMillis(t.getTime())}static fromMillis(t){const e=Math.floor(t/1e3),r=Math.floor((t-1e3*e)*Ba);return new J(e,r)}constructor(t,e){if(this.seconds=t,this.nanoseconds=e,e<0)throw new N(S.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(e>=1e9)throw new N(S.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(t<Ua)throw new N(S.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t);if(t>=253402300800)throw new N(S.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Ba}_compareTo(t){return this.seconds===t.seconds?j(this.nanoseconds,t.nanoseconds):j(this.seconds,t.seconds)}isEqual(t){return t.seconds===this.seconds&&t.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:J._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(t){if(Gn(t,J._jsonSchema))return new J(t.seconds,t.nanoseconds)}valueOf(){const t=this.seconds-Ua;return String(t).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}J._jsonSchemaVersion="firestore/timestamp/1.0",J._jsonSchema={type:ut("string",J._jsonSchemaVersion),seconds:ut("number"),nanoseconds:ut("number")};/**
 * @license
 * Copyright 2017 Google LLC
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
 */class U{static fromTimestamp(t){return new U(t)}static min(){return new U(new J(0,0))}static max(){return new U(new J(253402300799,999999999))}constructor(t){this.timestamp=t}compareTo(t){return this.timestamp._compareTo(t.timestamp)}isEqual(t){return this.timestamp.isEqual(t.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2021 Google LLC
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
 */const Fn=-1;function Tf(n,t){const e=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=U.fromTimestamp(r===1e9?new J(e+1,0):new J(e,r));return new de(s,x.empty(),t)}function If(n){return new de(n.readTime,n.key,Fn)}class de{constructor(t,e,r){this.readTime=t,this.documentKey=e,this.largestBatchId=r}static min(){return new de(U.min(),x.empty(),Fn)}static max(){return new de(U.max(),x.empty(),Fn)}}function wf(n,t){let e=n.readTime.compareTo(t.readTime);return e!==0?e:(e=x.comparator(n.documentKey,t.documentKey),e!==0?e:j(n.largestBatchId,t.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
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
 */const vf="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Af{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(t){this.onCommittedListeners.push(t)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((t=>t()))}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */async function sn(n){if(n.code!==S.FAILED_PRECONDITION||n.message!==vf)throw n;O("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class C{constructor(t){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,t((e=>{this.isDone=!0,this.result=e,this.nextCallback&&this.nextCallback(e)}),(e=>{this.isDone=!0,this.error=e,this.catchCallback&&this.catchCallback(e)}))}catch(t){return this.next(void 0,t)}next(t,e){return this.callbackAttached&&L(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(e,this.error):this.wrapSuccess(t,this.result):new C(((r,s)=>{this.nextCallback=o=>{this.wrapSuccess(t,o).next(r,s)},this.catchCallback=o=>{this.wrapFailure(e,o).next(r,s)}}))}toPromise(){return new Promise(((t,e)=>{this.next(t,e)}))}wrapUserFunction(t){try{const e=t();return e instanceof C?e:C.resolve(e)}catch(e){return C.reject(e)}}wrapSuccess(t,e){return t?this.wrapUserFunction((()=>t(e))):C.resolve(e)}wrapFailure(t,e){return t?this.wrapUserFunction((()=>t(e))):C.reject(e)}static resolve(t){return new C(((e,r)=>{e(t)}))}static reject(t){return new C(((e,r)=>{r(t)}))}static waitFor(t){return new C(((e,r)=>{let s=0,o=0,a=!1;t.forEach((c=>{++s,c.next((()=>{++o,a&&o===s&&e()}),(h=>r(h)))})),a=!0,o===s&&e()}))}static or(t){let e=C.resolve(!1);for(const r of t)e=e.next((s=>s?C.resolve(s):r()));return e}static forEach(t,e){const r=[];return t.forEach(((s,o)=>{r.push(e.call(this,s,o))})),this.waitFor(r)}static mapArray(t,e){return new C(((r,s)=>{const o=t.length,a=new Array(o);let c=0;for(let h=0;h<o;h++){const d=h;e(t[d]).next((p=>{a[d]=p,++c,c===o&&r(a)}),(p=>s(p)))}}))}static doWhile(t,e){return new C(((r,s)=>{const o=()=>{t()===!0?e().next((()=>{o()}),s):r()};o()}))}}function Rf(n){const t=n.match(/Android ([\d.]+)/i),e=t?t[1].split(".").slice(0,2).join("."):"-1";return Number(e)}function on(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
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
 */class Qr{constructor(t,e){this.previousValue=t,e&&(e.sequenceNumberHandler=r=>this.ae(r),this.ue=r=>e.writeSequenceNumber(r))}ae(t){return this.previousValue=Math.max(t,this.previousValue),this.previousValue}next(){const t=++this.previousValue;return this.ue&&this.ue(t),t}}Qr.ce=-1;/**
 * @license
 * Copyright 2017 Google LLC
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
 */const Si=-1;function Xr(n){return n==null}function Or(n){return n===0&&1/n==-1/0}function bf(n){return typeof n=="number"&&Number.isInteger(n)&&!Or(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
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
 */const pc="";function Sf(n){let t="";for(let e=0;e<n.length;e++)t.length>0&&(t=qa(t)),t=Cf(n.get(e),t);return qa(t)}function Cf(n,t){let e=t;const r=n.length;for(let s=0;s<r;s++){const o=n.charAt(s);switch(o){case"\0":e+="";break;case pc:e+="";break;default:e+=o}}return e}function qa(n){return n+pc+""}/**
 * @license
 * Copyright 2017 Google LLC
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
 */function ja(n){let t=0;for(const e in n)Object.prototype.hasOwnProperty.call(n,e)&&t++;return t}function Ee(n,t){for(const e in n)Object.prototype.hasOwnProperty.call(n,e)&&t(e,n[e])}function mc(n){for(const t in n)if(Object.prototype.hasOwnProperty.call(n,t))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class et{constructor(t,e){this.comparator=t,this.root=e||ft.EMPTY}insert(t,e){return new et(this.comparator,this.root.insert(t,e,this.comparator).copy(null,null,ft.BLACK,null,null))}remove(t){return new et(this.comparator,this.root.remove(t,this.comparator).copy(null,null,ft.BLACK,null,null))}get(t){let e=this.root;for(;!e.isEmpty();){const r=this.comparator(t,e.key);if(r===0)return e.value;r<0?e=e.left:r>0&&(e=e.right)}return null}indexOf(t){let e=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(t,r.key);if(s===0)return e+r.left.size;s<0?r=r.left:(e+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(t){return this.root.inorderTraversal(t)}forEach(t){this.inorderTraversal(((e,r)=>(t(e,r),!1)))}toString(){const t=[];return this.inorderTraversal(((e,r)=>(t.push(`${e}:${r}`),!1))),`{${t.join(", ")}}`}reverseTraversal(t){return this.root.reverseTraversal(t)}getIterator(){return new Er(this.root,null,this.comparator,!1)}getIteratorFrom(t){return new Er(this.root,t,this.comparator,!1)}getReverseIterator(){return new Er(this.root,null,this.comparator,!0)}getReverseIteratorFrom(t){return new Er(this.root,t,this.comparator,!0)}}class Er{constructor(t,e,r,s){this.isReverse=s,this.nodeStack=[];let o=1;for(;!t.isEmpty();)if(o=e?r(t.key,e):1,e&&s&&(o*=-1),o<0)t=this.isReverse?t.left:t.right;else{if(o===0){this.nodeStack.push(t);break}this.nodeStack.push(t),t=this.isReverse?t.right:t.left}}getNext(){let t=this.nodeStack.pop();const e={key:t.key,value:t.value};if(this.isReverse)for(t=t.left;!t.isEmpty();)this.nodeStack.push(t),t=t.right;else for(t=t.right;!t.isEmpty();)this.nodeStack.push(t),t=t.left;return e}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const t=this.nodeStack[this.nodeStack.length-1];return{key:t.key,value:t.value}}}class ft{constructor(t,e,r,s,o){this.key=t,this.value=e,this.color=r??ft.RED,this.left=s??ft.EMPTY,this.right=o??ft.EMPTY,this.size=this.left.size+1+this.right.size}copy(t,e,r,s,o){return new ft(t??this.key,e??this.value,r??this.color,s??this.left,o??this.right)}isEmpty(){return!1}inorderTraversal(t){return this.left.inorderTraversal(t)||t(this.key,this.value)||this.right.inorderTraversal(t)}reverseTraversal(t){return this.right.reverseTraversal(t)||t(this.key,this.value)||this.left.reverseTraversal(t)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(t,e,r){let s=this;const o=r(t,s.key);return s=o<0?s.copy(null,null,null,s.left.insert(t,e,r),null):o===0?s.copy(null,e,null,null,null):s.copy(null,null,null,null,s.right.insert(t,e,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return ft.EMPTY;let t=this;return t.left.isRed()||t.left.left.isRed()||(t=t.moveRedLeft()),t=t.copy(null,null,null,t.left.removeMin(),null),t.fixUp()}remove(t,e){let r,s=this;if(e(t,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(t,e),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),e(t,s.key)===0){if(s.right.isEmpty())return ft.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(t,e))}return s.fixUp()}isRed(){return this.color}fixUp(){let t=this;return t.right.isRed()&&!t.left.isRed()&&(t=t.rotateLeft()),t.left.isRed()&&t.left.left.isRed()&&(t=t.rotateRight()),t.left.isRed()&&t.right.isRed()&&(t=t.colorFlip()),t}moveRedLeft(){let t=this.colorFlip();return t.right.left.isRed()&&(t=t.copy(null,null,null,null,t.right.rotateRight()),t=t.rotateLeft(),t=t.colorFlip()),t}moveRedRight(){let t=this.colorFlip();return t.left.left.isRed()&&(t=t.rotateRight(),t=t.colorFlip()),t}rotateLeft(){const t=this.copy(null,null,ft.RED,null,this.right.left);return this.right.copy(null,null,this.color,t,null)}rotateRight(){const t=this.copy(null,null,ft.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,t)}colorFlip(){const t=this.left.copy(null,null,!this.left.color,null,null),e=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,t,e)}checkMaxDepth(){const t=this.check();return Math.pow(2,t)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw L(43730,{key:this.key,value:this.value});if(this.right.isRed())throw L(14113,{key:this.key,value:this.value});const t=this.left.check();if(t!==this.right.check())throw L(27949);return t+(this.isRed()?0:1)}}ft.EMPTY=null,ft.RED=!0,ft.BLACK=!1;ft.EMPTY=new class{constructor(){this.size=0}get key(){throw L(57766)}get value(){throw L(16141)}get color(){throw L(16727)}get left(){throw L(29726)}get right(){throw L(36894)}copy(t,e,r,s,o){return this}insert(t,e,r){return new ft(t,e)}remove(t,e){return this}isEmpty(){return!0}inorderTraversal(t){return!1}reverseTraversal(t){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
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
 */class ct{constructor(t){this.comparator=t,this.data=new et(this.comparator)}has(t){return this.data.get(t)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(t){return this.data.indexOf(t)}forEach(t){this.data.inorderTraversal(((e,r)=>(t(e),!1)))}forEachInRange(t,e){const r=this.data.getIteratorFrom(t[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,t[1])>=0)return;e(s.key)}}forEachWhile(t,e){let r;for(r=e!==void 0?this.data.getIteratorFrom(e):this.data.getIterator();r.hasNext();)if(!t(r.getNext().key))return}firstAfterOrEqual(t){const e=this.data.getIteratorFrom(t);return e.hasNext()?e.getNext().key:null}getIterator(){return new $a(this.data.getIterator())}getIteratorFrom(t){return new $a(this.data.getIteratorFrom(t))}add(t){return this.copy(this.data.remove(t).insert(t,!0))}delete(t){return this.has(t)?this.copy(this.data.remove(t)):this}isEmpty(){return this.data.isEmpty()}unionWith(t){let e=this;return e.size<t.size&&(e=t,t=this),t.forEach((r=>{e=e.add(r)})),e}isEqual(t){if(!(t instanceof ct)||this.size!==t.size)return!1;const e=this.data.getIterator(),r=t.data.getIterator();for(;e.hasNext();){const s=e.getNext().key,o=r.getNext().key;if(this.comparator(s,o)!==0)return!1}return!0}toArray(){const t=[];return this.forEach((e=>{t.push(e)})),t}toString(){const t=[];return this.forEach((e=>t.push(e))),"SortedSet("+t.toString()+")"}copy(t){const e=new ct(this.comparator);return e.data=t,e}}class $a{constructor(t){this.iter=t}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */class Dt{constructor(t){this.fields=t,t.sort(pt.comparator)}static empty(){return new Dt([])}unionWith(t){let e=new ct(pt.comparator);for(const r of this.fields)e=e.add(r);for(const r of t)e=e.add(r);return new Dt(e.toArray())}covers(t){for(const e of this.fields)if(e.isPrefixOf(t))return!0;return!1}isEqual(t){return Ye(this.fields,t.fields,((e,r)=>e.isEqual(r)))}}/**
 * @license
 * Copyright 2023 Google LLC
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
 */class gc extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */class gt{constructor(t){this.binaryString=t}static fromBase64String(t){const e=(function(s){try{return atob(s)}catch(o){throw typeof DOMException<"u"&&o instanceof DOMException?new gc("Invalid base64 string: "+o):o}})(t);return new gt(e)}static fromUint8Array(t){const e=(function(s){let o="";for(let a=0;a<s.length;++a)o+=String.fromCharCode(s[a]);return o})(t);return new gt(e)}[Symbol.iterator](){let t=0;return{next:()=>t<this.binaryString.length?{value:this.binaryString.charCodeAt(t++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(e){return btoa(e)})(this.binaryString)}toUint8Array(){return(function(e){const r=new Uint8Array(e.length);for(let s=0;s<e.length;s++)r[s]=e.charCodeAt(s);return r})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(t){return j(this.binaryString,t.binaryString)}isEqual(t){return this.binaryString===t.binaryString}}gt.EMPTY_BYTE_STRING=new gt("");const Pf=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function fe(n){if(W(!!n,39018),typeof n=="string"){let t=0;const e=Pf.exec(n);if(W(!!e,46558,{timestamp:n}),e[1]){let s=e[1];s=(s+"000000000").substr(0,9),t=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:t}}return{seconds:st(n.seconds),nanos:st(n.nanos)}}function st(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function pe(n){return typeof n=="string"?gt.fromBase64String(n):gt.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
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
 */const _c="server_timestamp",yc="__type__",Ec="__previous_value__",Tc="__local_write_time__";function Yr(n){return(n?.mapValue?.fields||{})[yc]?.stringValue===_c}function Jr(n){const t=n.mapValue.fields[Ec];return Yr(t)?Jr(t):t}function Un(n){const t=fe(n.mapValue.fields[Tc].timestampValue);return new J(t.seconds,t.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Vf{constructor(t,e,r,s,o,a,c,h,d,p){this.databaseId=t,this.appId=e,this.persistenceKey=r,this.host=s,this.ssl=o,this.forceLongPolling=a,this.autoDetectLongPolling=c,this.longPollingOptions=h,this.useFetchStreams=d,this.isUsingEmulator=p}}const xr="(default)";class Bn{constructor(t,e){this.projectId=t,this.database=e||xr}static empty(){return new Bn("","")}get isDefaultDatabase(){return this.database===xr}isEqual(t){return t instanceof Bn&&t.projectId===this.projectId&&t.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */const Ic="__type__",Df="__max__",Tr={mapValue:{}},wc="__vector__",Mr="value";function me(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Yr(n)?4:kf(n)?9007199254740991:Nf(n)?10:11:L(28295,{value:n})}function zt(n,t){if(n===t)return!0;const e=me(n);if(e!==me(t))return!1;switch(e){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===t.booleanValue;case 4:return Un(n).isEqual(Un(t));case 3:return(function(s,o){if(typeof s.timestampValue=="string"&&typeof o.timestampValue=="string"&&s.timestampValue.length===o.timestampValue.length)return s.timestampValue===o.timestampValue;const a=fe(s.timestampValue),c=fe(o.timestampValue);return a.seconds===c.seconds&&a.nanos===c.nanos})(n,t);case 5:return n.stringValue===t.stringValue;case 6:return(function(s,o){return pe(s.bytesValue).isEqual(pe(o.bytesValue))})(n,t);case 7:return n.referenceValue===t.referenceValue;case 8:return(function(s,o){return st(s.geoPointValue.latitude)===st(o.geoPointValue.latitude)&&st(s.geoPointValue.longitude)===st(o.geoPointValue.longitude)})(n,t);case 2:return(function(s,o){if("integerValue"in s&&"integerValue"in o)return st(s.integerValue)===st(o.integerValue);if("doubleValue"in s&&"doubleValue"in o){const a=st(s.doubleValue),c=st(o.doubleValue);return a===c?Or(a)===Or(c):isNaN(a)&&isNaN(c)}return!1})(n,t);case 9:return Ye(n.arrayValue.values||[],t.arrayValue.values||[],zt);case 10:case 11:return(function(s,o){const a=s.mapValue.fields||{},c=o.mapValue.fields||{};if(ja(a)!==ja(c))return!1;for(const h in a)if(a.hasOwnProperty(h)&&(c[h]===void 0||!zt(a[h],c[h])))return!1;return!0})(n,t);default:return L(52216,{left:n})}}function qn(n,t){return(n.values||[]).find((e=>zt(e,t)))!==void 0}function Je(n,t){if(n===t)return 0;const e=me(n),r=me(t);if(e!==r)return j(e,r);switch(e){case 0:case 9007199254740991:return 0;case 1:return j(n.booleanValue,t.booleanValue);case 2:return(function(o,a){const c=st(o.integerValue||o.doubleValue),h=st(a.integerValue||a.doubleValue);return c<h?-1:c>h?1:c===h?0:isNaN(c)?isNaN(h)?0:-1:1})(n,t);case 3:return za(n.timestampValue,t.timestampValue);case 4:return za(Un(n),Un(t));case 5:return oi(n.stringValue,t.stringValue);case 6:return(function(o,a){const c=pe(o),h=pe(a);return c.compareTo(h)})(n.bytesValue,t.bytesValue);case 7:return(function(o,a){const c=o.split("/"),h=a.split("/");for(let d=0;d<c.length&&d<h.length;d++){const p=j(c[d],h[d]);if(p!==0)return p}return j(c.length,h.length)})(n.referenceValue,t.referenceValue);case 8:return(function(o,a){const c=j(st(o.latitude),st(a.latitude));return c!==0?c:j(st(o.longitude),st(a.longitude))})(n.geoPointValue,t.geoPointValue);case 9:return Ha(n.arrayValue,t.arrayValue);case 10:return(function(o,a){const c=o.fields||{},h=a.fields||{},d=c[Mr]?.arrayValue,p=h[Mr]?.arrayValue,g=j(d?.values?.length||0,p?.values?.length||0);return g!==0?g:Ha(d,p)})(n.mapValue,t.mapValue);case 11:return(function(o,a){if(o===Tr.mapValue&&a===Tr.mapValue)return 0;if(o===Tr.mapValue)return 1;if(a===Tr.mapValue)return-1;const c=o.fields||{},h=Object.keys(c),d=a.fields||{},p=Object.keys(d);h.sort(),p.sort();for(let g=0;g<h.length&&g<p.length;++g){const E=oi(h[g],p[g]);if(E!==0)return E;const b=Je(c[h[g]],d[p[g]]);if(b!==0)return b}return j(h.length,p.length)})(n.mapValue,t.mapValue);default:throw L(23264,{he:e})}}function za(n,t){if(typeof n=="string"&&typeof t=="string"&&n.length===t.length)return j(n,t);const e=fe(n),r=fe(t),s=j(e.seconds,r.seconds);return s!==0?s:j(e.nanos,r.nanos)}function Ha(n,t){const e=n.values||[],r=t.values||[];for(let s=0;s<e.length&&s<r.length;++s){const o=Je(e[s],r[s]);if(o)return o}return j(e.length,r.length)}function Ze(n){return ai(n)}function ai(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?(function(e){const r=fe(e);return`time(${r.seconds},${r.nanos})`})(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?(function(e){return pe(e).toBase64()})(n.bytesValue):"referenceValue"in n?(function(e){return x.fromName(e).toString()})(n.referenceValue):"geoPointValue"in n?(function(e){return`geo(${e.latitude},${e.longitude})`})(n.geoPointValue):"arrayValue"in n?(function(e){let r="[",s=!0;for(const o of e.values||[])s?s=!1:r+=",",r+=ai(o);return r+"]"})(n.arrayValue):"mapValue"in n?(function(e){const r=Object.keys(e.fields||{}).sort();let s="{",o=!0;for(const a of r)o?o=!1:s+=",",s+=`${a}:${ai(e.fields[a])}`;return s+"}"})(n.mapValue):L(61005,{value:n})}function br(n){switch(me(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const t=Jr(n);return t?16+br(t):16;case 5:return 2*n.stringValue.length;case 6:return pe(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return(function(r){return(r.values||[]).reduce(((s,o)=>s+br(o)),0)})(n.arrayValue);case 10:case 11:return(function(r){let s=0;return Ee(r.fields,((o,a)=>{s+=o.length+br(a)})),s})(n.mapValue);default:throw L(13486,{value:n})}}function Lr(n,t){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${t.path.canonicalString()}`}}function ui(n){return!!n&&"integerValue"in n}function Ci(n){return!!n&&"arrayValue"in n}function Ga(n){return!!n&&"nullValue"in n}function Ka(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Sr(n){return!!n&&"mapValue"in n}function Nf(n){return(n?.mapValue?.fields||{})[Ic]?.stringValue===wc}function Nn(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const t={mapValue:{fields:{}}};return Ee(n.mapValue.fields,((e,r)=>t.mapValue.fields[e]=Nn(r))),t}if(n.arrayValue){const t={arrayValue:{values:[]}};for(let e=0;e<(n.arrayValue.values||[]).length;++e)t.arrayValue.values[e]=Nn(n.arrayValue.values[e]);return t}return{...n}}function kf(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===Df}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Pt{constructor(t){this.value=t}static empty(){return new Pt({mapValue:{}})}field(t){if(t.isEmpty())return this.value;{let e=this.value;for(let r=0;r<t.length-1;++r)if(e=(e.mapValue.fields||{})[t.get(r)],!Sr(e))return null;return e=(e.mapValue.fields||{})[t.lastSegment()],e||null}}set(t,e){this.getFieldsMap(t.popLast())[t.lastSegment()]=Nn(e)}setAll(t){let e=pt.emptyPath(),r={},s=[];t.forEach(((a,c)=>{if(!e.isImmediateParentOf(c)){const h=this.getFieldsMap(e);this.applyChanges(h,r,s),r={},s=[],e=c.popLast()}a?r[c.lastSegment()]=Nn(a):s.push(c.lastSegment())}));const o=this.getFieldsMap(e);this.applyChanges(o,r,s)}delete(t){const e=this.field(t.popLast());Sr(e)&&e.mapValue.fields&&delete e.mapValue.fields[t.lastSegment()]}isEqual(t){return zt(this.value,t.value)}getFieldsMap(t){let e=this.value;e.mapValue.fields||(e.mapValue={fields:{}});for(let r=0;r<t.length;++r){let s=e.mapValue.fields[t.get(r)];Sr(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},e.mapValue.fields[t.get(r)]=s),e=s}return e.mapValue.fields}applyChanges(t,e,r){Ee(e,((s,o)=>t[s]=o));for(const s of r)delete t[s]}clone(){return new Pt(Nn(this.value))}}function vc(n){const t=[];return Ee(n.fields,((e,r)=>{const s=new pt([e]);if(Sr(r)){const o=vc(r.mapValue).fields;if(o.length===0)t.push(s);else for(const a of o)t.push(s.child(a))}else t.push(s)})),new Dt(t)}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class vt{constructor(t,e,r,s,o,a,c){this.key=t,this.documentType=e,this.version=r,this.readTime=s,this.createTime=o,this.data=a,this.documentState=c}static newInvalidDocument(t){return new vt(t,0,U.min(),U.min(),U.min(),Pt.empty(),0)}static newFoundDocument(t,e,r,s){return new vt(t,1,e,U.min(),r,s,0)}static newNoDocument(t,e){return new vt(t,2,e,U.min(),U.min(),Pt.empty(),0)}static newUnknownDocument(t,e){return new vt(t,3,e,U.min(),U.min(),Pt.empty(),2)}convertToFoundDocument(t,e){return!this.createTime.isEqual(U.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=t),this.version=t,this.documentType=1,this.data=e,this.documentState=0,this}convertToNoDocument(t){return this.version=t,this.documentType=2,this.data=Pt.empty(),this.documentState=0,this}convertToUnknownDocument(t){return this.version=t,this.documentType=3,this.data=Pt.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=U.min(),this}setReadTime(t){return this.readTime=t,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(t){return t instanceof vt&&this.key.isEqual(t.key)&&this.version.isEqual(t.version)&&this.documentType===t.documentType&&this.documentState===t.documentState&&this.data.isEqual(t.data)}mutableCopy(){return new vt(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
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
 */class tn{constructor(t,e){this.position=t,this.inclusive=e}}function Wa(n,t,e){let r=0;for(let s=0;s<n.position.length;s++){const o=t[s],a=n.position[s];if(o.field.isKeyField()?r=x.comparator(x.fromName(a.referenceValue),e.key):r=Je(a,e.data.field(o.field)),o.dir==="desc"&&(r*=-1),r!==0)break}return r}function Qa(n,t){if(n===null)return t===null;if(t===null||n.inclusive!==t.inclusive||n.position.length!==t.position.length)return!1;for(let e=0;e<n.position.length;e++)if(!zt(n.position[e],t.position[e]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
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
 */class jn{constructor(t,e="asc"){this.field=t,this.dir=e}}function Of(n,t){return n.dir===t.dir&&n.field.isEqual(t.field)}/**
 * @license
 * Copyright 2022 Google LLC
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
 */class Ac{}class at extends Ac{constructor(t,e,r){super(),this.field=t,this.op=e,this.value=r}static create(t,e,r){return t.isKeyField()?e==="in"||e==="not-in"?this.createKeyFieldInFilter(t,e,r):new Mf(t,e,r):e==="array-contains"?new Uf(t,r):e==="in"?new Bf(t,r):e==="not-in"?new qf(t,r):e==="array-contains-any"?new jf(t,r):new at(t,e,r)}static createKeyFieldInFilter(t,e,r){return e==="in"?new Lf(t,r):new Ff(t,r)}matches(t){const e=t.data.field(this.field);return this.op==="!="?e!==null&&e.nullValue===void 0&&this.matchesComparison(Je(e,this.value)):e!==null&&me(this.value)===me(e)&&this.matchesComparison(Je(e,this.value))}matchesComparison(t){switch(this.op){case"<":return t<0;case"<=":return t<=0;case"==":return t===0;case"!=":return t!==0;case">":return t>0;case">=":return t>=0;default:return L(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Lt extends Ac{constructor(t,e){super(),this.filters=t,this.op=e,this.Pe=null}static create(t,e){return new Lt(t,e)}matches(t){return Rc(this)?this.filters.find((e=>!e.matches(t)))===void 0:this.filters.find((e=>e.matches(t)))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce(((t,e)=>t.concat(e.getFlattenedFilters())),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}}function Rc(n){return n.op==="and"}function bc(n){return xf(n)&&Rc(n)}function xf(n){for(const t of n.filters)if(t instanceof Lt)return!1;return!0}function ci(n){if(n instanceof at)return n.field.canonicalString()+n.op.toString()+Ze(n.value);if(bc(n))return n.filters.map((t=>ci(t))).join(",");{const t=n.filters.map((e=>ci(e))).join(",");return`${n.op}(${t})`}}function Sc(n,t){return n instanceof at?(function(r,s){return s instanceof at&&r.op===s.op&&r.field.isEqual(s.field)&&zt(r.value,s.value)})(n,t):n instanceof Lt?(function(r,s){return s instanceof Lt&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce(((o,a,c)=>o&&Sc(a,s.filters[c])),!0):!1})(n,t):void L(19439)}function Cc(n){return n instanceof at?(function(e){return`${e.field.canonicalString()} ${e.op} ${Ze(e.value)}`})(n):n instanceof Lt?(function(e){return e.op.toString()+" {"+e.getFilters().map(Cc).join(" ,")+"}"})(n):"Filter"}class Mf extends at{constructor(t,e,r){super(t,e,r),this.key=x.fromName(r.referenceValue)}matches(t){const e=x.comparator(t.key,this.key);return this.matchesComparison(e)}}class Lf extends at{constructor(t,e){super(t,"in",e),this.keys=Pc("in",e)}matches(t){return this.keys.some((e=>e.isEqual(t.key)))}}class Ff extends at{constructor(t,e){super(t,"not-in",e),this.keys=Pc("not-in",e)}matches(t){return!this.keys.some((e=>e.isEqual(t.key)))}}function Pc(n,t){return(t.arrayValue?.values||[]).map((e=>x.fromName(e.referenceValue)))}class Uf extends at{constructor(t,e){super(t,"array-contains",e)}matches(t){const e=t.data.field(this.field);return Ci(e)&&qn(e.arrayValue,this.value)}}class Bf extends at{constructor(t,e){super(t,"in",e)}matches(t){const e=t.data.field(this.field);return e!==null&&qn(this.value.arrayValue,e)}}class qf extends at{constructor(t,e){super(t,"not-in",e)}matches(t){if(qn(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const e=t.data.field(this.field);return e!==null&&e.nullValue===void 0&&!qn(this.value.arrayValue,e)}}class jf extends at{constructor(t,e){super(t,"array-contains-any",e)}matches(t){const e=t.data.field(this.field);return!(!Ci(e)||!e.arrayValue.values)&&e.arrayValue.values.some((r=>qn(this.value.arrayValue,r)))}}/**
 * @license
 * Copyright 2019 Google LLC
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
 */class $f{constructor(t,e=null,r=[],s=[],o=null,a=null,c=null){this.path=t,this.collectionGroup=e,this.orderBy=r,this.filters=s,this.limit=o,this.startAt=a,this.endAt=c,this.Te=null}}function Xa(n,t=null,e=[],r=[],s=null,o=null,a=null){return new $f(n,t,e,r,s,o,a)}function Pi(n){const t=B(n);if(t.Te===null){let e=t.path.canonicalString();t.collectionGroup!==null&&(e+="|cg:"+t.collectionGroup),e+="|f:",e+=t.filters.map((r=>ci(r))).join(","),e+="|ob:",e+=t.orderBy.map((r=>(function(o){return o.field.canonicalString()+o.dir})(r))).join(","),Xr(t.limit)||(e+="|l:",e+=t.limit),t.startAt&&(e+="|lb:",e+=t.startAt.inclusive?"b:":"a:",e+=t.startAt.position.map((r=>Ze(r))).join(",")),t.endAt&&(e+="|ub:",e+=t.endAt.inclusive?"a:":"b:",e+=t.endAt.position.map((r=>Ze(r))).join(",")),t.Te=e}return t.Te}function Vi(n,t){if(n.limit!==t.limit||n.orderBy.length!==t.orderBy.length)return!1;for(let e=0;e<n.orderBy.length;e++)if(!Of(n.orderBy[e],t.orderBy[e]))return!1;if(n.filters.length!==t.filters.length)return!1;for(let e=0;e<n.filters.length;e++)if(!Sc(n.filters[e],t.filters[e]))return!1;return n.collectionGroup===t.collectionGroup&&!!n.path.isEqual(t.path)&&!!Qa(n.startAt,t.startAt)&&Qa(n.endAt,t.endAt)}function li(n){return x.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Oe{constructor(t,e=null,r=[],s=[],o=null,a="F",c=null,h=null){this.path=t,this.collectionGroup=e,this.explicitOrderBy=r,this.filters=s,this.limit=o,this.limitType=a,this.startAt=c,this.endAt=h,this.Ie=null,this.Ee=null,this.de=null,this.startAt,this.endAt}}function zf(n,t,e,r,s,o,a,c){return new Oe(n,t,e,r,s,o,a,c)}function Zr(n){return new Oe(n)}function Ya(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function Di(n){return n.collectionGroup!==null}function Ke(n){const t=B(n);if(t.Ie===null){t.Ie=[];const e=new Set;for(const o of t.explicitOrderBy)t.Ie.push(o),e.add(o.field.canonicalString());const r=t.explicitOrderBy.length>0?t.explicitOrderBy[t.explicitOrderBy.length-1].dir:"asc";(function(a){let c=new ct(pt.comparator);return a.filters.forEach((h=>{h.getFlattenedFilters().forEach((d=>{d.isInequality()&&(c=c.add(d.field))}))})),c})(t).forEach((o=>{e.has(o.canonicalString())||o.isKeyField()||t.Ie.push(new jn(o,r))})),e.has(pt.keyField().canonicalString())||t.Ie.push(new jn(pt.keyField(),r))}return t.Ie}function Bt(n){const t=B(n);return t.Ee||(t.Ee=Hf(t,Ke(n))),t.Ee}function Hf(n,t){if(n.limitType==="F")return Xa(n.path,n.collectionGroup,t,n.filters,n.limit,n.startAt,n.endAt);{t=t.map((s=>{const o=s.dir==="desc"?"asc":"desc";return new jn(s.field,o)}));const e=n.endAt?new tn(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new tn(n.startAt.position,n.startAt.inclusive):null;return Xa(n.path,n.collectionGroup,t,n.filters,n.limit,e,r)}}function hi(n,t){const e=n.filters.concat([t]);return new Oe(n.path,n.collectionGroup,n.explicitOrderBy.slice(),e,n.limit,n.limitType,n.startAt,n.endAt)}function Fr(n,t,e){return new Oe(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),t,e,n.startAt,n.endAt)}function ts(n,t){return Vi(Bt(n),Bt(t))&&n.limitType===t.limitType}function Vc(n){return`${Pi(Bt(n))}|lt:${n.limitType}`}function ze(n){return`Query(target=${(function(e){let r=e.path.canonicalString();return e.collectionGroup!==null&&(r+=" collectionGroup="+e.collectionGroup),e.filters.length>0&&(r+=`, filters: [${e.filters.map((s=>Cc(s))).join(", ")}]`),Xr(e.limit)||(r+=", limit: "+e.limit),e.orderBy.length>0&&(r+=`, orderBy: [${e.orderBy.map((s=>(function(a){return`${a.field.canonicalString()} (${a.dir})`})(s))).join(", ")}]`),e.startAt&&(r+=", startAt: ",r+=e.startAt.inclusive?"b:":"a:",r+=e.startAt.position.map((s=>Ze(s))).join(",")),e.endAt&&(r+=", endAt: ",r+=e.endAt.inclusive?"a:":"b:",r+=e.endAt.position.map((s=>Ze(s))).join(",")),`Target(${r})`})(Bt(n))}; limitType=${n.limitType})`}function es(n,t){return t.isFoundDocument()&&(function(r,s){const o=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(o):x.isDocumentKey(r.path)?r.path.isEqual(o):r.path.isImmediateParentOf(o)})(n,t)&&(function(r,s){for(const o of Ke(r))if(!o.field.isKeyField()&&s.data.field(o.field)===null)return!1;return!0})(n,t)&&(function(r,s){for(const o of r.filters)if(!o.matches(s))return!1;return!0})(n,t)&&(function(r,s){return!(r.startAt&&!(function(a,c,h){const d=Wa(a,c,h);return a.inclusive?d<=0:d<0})(r.startAt,Ke(r),s)||r.endAt&&!(function(a,c,h){const d=Wa(a,c,h);return a.inclusive?d>=0:d>0})(r.endAt,Ke(r),s))})(n,t)}function Gf(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function Dc(n){return(t,e)=>{let r=!1;for(const s of Ke(n)){const o=Kf(s,t,e);if(o!==0)return o;r=r||s.field.isKeyField()}return 0}}function Kf(n,t,e){const r=n.field.isKeyField()?x.comparator(t.key,e.key):(function(o,a,c){const h=a.data.field(o),d=c.data.field(o);return h!==null&&d!==null?Je(h,d):L(42886)})(n.field,t,e);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return L(19790,{direction:n.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class xe{constructor(t,e){this.mapKeyFn=t,this.equalsFn=e,this.inner={},this.innerSize=0}get(t){const e=this.mapKeyFn(t),r=this.inner[e];if(r!==void 0){for(const[s,o]of r)if(this.equalsFn(s,t))return o}}has(t){return this.get(t)!==void 0}set(t,e){const r=this.mapKeyFn(t),s=this.inner[r];if(s===void 0)return this.inner[r]=[[t,e]],void this.innerSize++;for(let o=0;o<s.length;o++)if(this.equalsFn(s[o][0],t))return void(s[o]=[t,e]);s.push([t,e]),this.innerSize++}delete(t){const e=this.mapKeyFn(t),r=this.inner[e];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],t))return r.length===1?delete this.inner[e]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(t){Ee(this.inner,((e,r)=>{for(const[s,o]of r)t(s,o)}))}isEmpty(){return mc(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */const Wf=new et(x.comparator);function te(){return Wf}const Nc=new et(x.comparator);function Cn(...n){let t=Nc;for(const e of n)t=t.insert(e.key,e);return t}function kc(n){let t=Nc;return n.forEach(((e,r)=>t=t.insert(e,r.overlayedDocument))),t}function be(){return kn()}function Oc(){return kn()}function kn(){return new xe((n=>n.toString()),((n,t)=>n.isEqual(t)))}const Qf=new et(x.comparator),Xf=new ct(x.comparator);function $(...n){let t=Xf;for(const e of n)t=t.add(e);return t}const Yf=new ct(j);function Jf(){return Yf}/**
 * @license
 * Copyright 2020 Google LLC
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
 */function Ni(n,t){if(n.useProto3Json){if(isNaN(t))return{doubleValue:"NaN"};if(t===1/0)return{doubleValue:"Infinity"};if(t===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Or(t)?"-0":t}}function xc(n){return{integerValue:""+n}}function Zf(n,t){return bf(t)?xc(t):Ni(n,t)}/**
 * @license
 * Copyright 2018 Google LLC
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
 */class ns{constructor(){this._=void 0}}function tp(n,t,e){return n instanceof Ur?(function(s,o){const a={fields:{[yc]:{stringValue:_c},[Tc]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return o&&Yr(o)&&(o=Jr(o)),o&&(a.fields[Ec]=o),{mapValue:a}})(e,t):n instanceof $n?Lc(n,t):n instanceof zn?Fc(n,t):(function(s,o){const a=Mc(s,o),c=Ja(a)+Ja(s.Ae);return ui(a)&&ui(s.Ae)?xc(c):Ni(s.serializer,c)})(n,t)}function ep(n,t,e){return n instanceof $n?Lc(n,t):n instanceof zn?Fc(n,t):e}function Mc(n,t){return n instanceof Br?(function(r){return ui(r)||(function(o){return!!o&&"doubleValue"in o})(r)})(t)?t:{integerValue:0}:null}class Ur extends ns{}class $n extends ns{constructor(t){super(),this.elements=t}}function Lc(n,t){const e=Uc(t);for(const r of n.elements)e.some((s=>zt(s,r)))||e.push(r);return{arrayValue:{values:e}}}class zn extends ns{constructor(t){super(),this.elements=t}}function Fc(n,t){let e=Uc(t);for(const r of n.elements)e=e.filter((s=>!zt(s,r)));return{arrayValue:{values:e}}}class Br extends ns{constructor(t,e){super(),this.serializer=t,this.Ae=e}}function Ja(n){return st(n.integerValue||n.doubleValue)}function Uc(n){return Ci(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}function np(n,t){return n.field.isEqual(t.field)&&(function(r,s){return r instanceof $n&&s instanceof $n||r instanceof zn&&s instanceof zn?Ye(r.elements,s.elements,zt):r instanceof Br&&s instanceof Br?zt(r.Ae,s.Ae):r instanceof Ur&&s instanceof Ur})(n.transform,t.transform)}class rp{constructor(t,e){this.version=t,this.transformResults=e}}class Mt{constructor(t,e){this.updateTime=t,this.exists=e}static none(){return new Mt}static exists(t){return new Mt(void 0,t)}static updateTime(t){return new Mt(t)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(t){return this.exists===t.exists&&(this.updateTime?!!t.updateTime&&this.updateTime.isEqual(t.updateTime):!t.updateTime)}}function Cr(n,t){return n.updateTime!==void 0?t.isFoundDocument()&&t.version.isEqual(n.updateTime):n.exists===void 0||n.exists===t.isFoundDocument()}class rs{}function Bc(n,t){if(!n.hasLocalMutations||t&&t.fields.length===0)return null;if(t===null)return n.isNoDocument()?new ki(n.key,Mt.none()):new Kn(n.key,n.data,Mt.none());{const e=n.data,r=Pt.empty();let s=new ct(pt.comparator);for(let o of t.fields)if(!s.has(o)){let a=e.field(o);a===null&&o.length>1&&(o=o.popLast(),a=e.field(o)),a===null?r.delete(o):r.set(o,a),s=s.add(o)}return new Te(n.key,r,new Dt(s.toArray()),Mt.none())}}function sp(n,t,e){n instanceof Kn?(function(s,o,a){const c=s.value.clone(),h=tu(s.fieldTransforms,o,a.transformResults);c.setAll(h),o.convertToFoundDocument(a.version,c).setHasCommittedMutations()})(n,t,e):n instanceof Te?(function(s,o,a){if(!Cr(s.precondition,o))return void o.convertToUnknownDocument(a.version);const c=tu(s.fieldTransforms,o,a.transformResults),h=o.data;h.setAll(qc(s)),h.setAll(c),o.convertToFoundDocument(a.version,h).setHasCommittedMutations()})(n,t,e):(function(s,o,a){o.convertToNoDocument(a.version).setHasCommittedMutations()})(0,t,e)}function On(n,t,e,r){return n instanceof Kn?(function(o,a,c,h){if(!Cr(o.precondition,a))return c;const d=o.value.clone(),p=eu(o.fieldTransforms,h,a);return d.setAll(p),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),null})(n,t,e,r):n instanceof Te?(function(o,a,c,h){if(!Cr(o.precondition,a))return c;const d=eu(o.fieldTransforms,h,a),p=a.data;return p.setAll(qc(o)),p.setAll(d),a.convertToFoundDocument(a.version,p).setHasLocalMutations(),c===null?null:c.unionWith(o.fieldMask.fields).unionWith(o.fieldTransforms.map((g=>g.field)))})(n,t,e,r):(function(o,a,c){return Cr(o.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):c})(n,t,e)}function ip(n,t){let e=null;for(const r of n.fieldTransforms){const s=t.data.field(r.field),o=Mc(r.transform,s||null);o!=null&&(e===null&&(e=Pt.empty()),e.set(r.field,o))}return e||null}function Za(n,t){return n.type===t.type&&!!n.key.isEqual(t.key)&&!!n.precondition.isEqual(t.precondition)&&!!(function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&Ye(r,s,((o,a)=>np(o,a)))})(n.fieldTransforms,t.fieldTransforms)&&(n.type===0?n.value.isEqual(t.value):n.type!==1||n.data.isEqual(t.data)&&n.fieldMask.isEqual(t.fieldMask))}class Kn extends rs{constructor(t,e,r,s=[]){super(),this.key=t,this.value=e,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class Te extends rs{constructor(t,e,r,s,o=[]){super(),this.key=t,this.data=e,this.fieldMask=r,this.precondition=s,this.fieldTransforms=o,this.type=1}getFieldMask(){return this.fieldMask}}function qc(n){const t=new Map;return n.fieldMask.fields.forEach((e=>{if(!e.isEmpty()){const r=n.data.field(e);t.set(e,r)}})),t}function tu(n,t,e){const r=new Map;W(n.length===e.length,32656,{Re:e.length,Ve:n.length});for(let s=0;s<e.length;s++){const o=n[s],a=o.transform,c=t.data.field(o.field);r.set(o.field,ep(a,c,e[s]))}return r}function eu(n,t,e){const r=new Map;for(const s of n){const o=s.transform,a=e.data.field(s.field);r.set(s.field,tp(o,a,t))}return r}class ki extends rs{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class op extends rs{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class ap{constructor(t,e,r,s){this.batchId=t,this.localWriteTime=e,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(t,e){const r=e.mutationResults;for(let s=0;s<this.mutations.length;s++){const o=this.mutations[s];o.key.isEqual(t.key)&&sp(o,t,r[s])}}applyToLocalView(t,e){for(const r of this.baseMutations)r.key.isEqual(t.key)&&(e=On(r,t,e,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(t.key)&&(e=On(r,t,e,this.localWriteTime));return e}applyToLocalDocumentSet(t,e){const r=Oc();return this.mutations.forEach((s=>{const o=t.get(s.key),a=o.overlayedDocument;let c=this.applyToLocalView(a,o.mutatedFields);c=e.has(s.key)?null:c;const h=Bc(a,c);h!==null&&r.set(s.key,h),a.isValidDocument()||a.convertToNoDocument(U.min())})),r}keys(){return this.mutations.reduce(((t,e)=>t.add(e.key)),$())}isEqual(t){return this.batchId===t.batchId&&Ye(this.mutations,t.mutations,((e,r)=>Za(e,r)))&&Ye(this.baseMutations,t.baseMutations,((e,r)=>Za(e,r)))}}class Oi{constructor(t,e,r,s){this.batch=t,this.commitVersion=e,this.mutationResults=r,this.docVersions=s}static from(t,e,r){W(t.mutations.length===r.length,58842,{me:t.mutations.length,fe:r.length});let s=(function(){return Qf})();const o=t.mutations;for(let a=0;a<o.length;a++)s=s.insert(o[a].key,r[a].version);return new Oi(t,e,r,s)}}/**
 * @license
 * Copyright 2022 Google LLC
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
 */class up{constructor(t,e){this.largestBatchId=t,this.mutation=e}getKey(){return this.mutation.key}isEqual(t){return t!==null&&this.mutation===t.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class cp{constructor(t,e){this.count=t,this.unchangedNames=e}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */var ot,H;function lp(n){switch(n){case S.OK:return L(64938);case S.CANCELLED:case S.UNKNOWN:case S.DEADLINE_EXCEEDED:case S.RESOURCE_EXHAUSTED:case S.INTERNAL:case S.UNAVAILABLE:case S.UNAUTHENTICATED:return!1;case S.INVALID_ARGUMENT:case S.NOT_FOUND:case S.ALREADY_EXISTS:case S.PERMISSION_DENIED:case S.FAILED_PRECONDITION:case S.ABORTED:case S.OUT_OF_RANGE:case S.UNIMPLEMENTED:case S.DATA_LOSS:return!0;default:return L(15467,{code:n})}}function jc(n){if(n===void 0)return Zt("GRPC error has no .code"),S.UNKNOWN;switch(n){case ot.OK:return S.OK;case ot.CANCELLED:return S.CANCELLED;case ot.UNKNOWN:return S.UNKNOWN;case ot.DEADLINE_EXCEEDED:return S.DEADLINE_EXCEEDED;case ot.RESOURCE_EXHAUSTED:return S.RESOURCE_EXHAUSTED;case ot.INTERNAL:return S.INTERNAL;case ot.UNAVAILABLE:return S.UNAVAILABLE;case ot.UNAUTHENTICATED:return S.UNAUTHENTICATED;case ot.INVALID_ARGUMENT:return S.INVALID_ARGUMENT;case ot.NOT_FOUND:return S.NOT_FOUND;case ot.ALREADY_EXISTS:return S.ALREADY_EXISTS;case ot.PERMISSION_DENIED:return S.PERMISSION_DENIED;case ot.FAILED_PRECONDITION:return S.FAILED_PRECONDITION;case ot.ABORTED:return S.ABORTED;case ot.OUT_OF_RANGE:return S.OUT_OF_RANGE;case ot.UNIMPLEMENTED:return S.UNIMPLEMENTED;case ot.DATA_LOSS:return S.DATA_LOSS;default:return L(39323,{code:n})}}(H=ot||(ot={}))[H.OK=0]="OK",H[H.CANCELLED=1]="CANCELLED",H[H.UNKNOWN=2]="UNKNOWN",H[H.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",H[H.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",H[H.NOT_FOUND=5]="NOT_FOUND",H[H.ALREADY_EXISTS=6]="ALREADY_EXISTS",H[H.PERMISSION_DENIED=7]="PERMISSION_DENIED",H[H.UNAUTHENTICATED=16]="UNAUTHENTICATED",H[H.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",H[H.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",H[H.ABORTED=10]="ABORTED",H[H.OUT_OF_RANGE=11]="OUT_OF_RANGE",H[H.UNIMPLEMENTED=12]="UNIMPLEMENTED",H[H.INTERNAL=13]="INTERNAL",H[H.UNAVAILABLE=14]="UNAVAILABLE",H[H.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
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
 */function hp(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
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
 */const dp=new le([4294967295,4294967295],0);function nu(n){const t=hp().encode(n),e=new sc;return e.update(t),new Uint8Array(e.digest())}function ru(n){const t=new DataView(n.buffer),e=t.getUint32(0,!0),r=t.getUint32(4,!0),s=t.getUint32(8,!0),o=t.getUint32(12,!0);return[new le([e,r],0),new le([s,o],0)]}class xi{constructor(t,e,r){if(this.bitmap=t,this.padding=e,this.hashCount=r,e<0||e>=8)throw new Pn(`Invalid padding: ${e}`);if(r<0)throw new Pn(`Invalid hash count: ${r}`);if(t.length>0&&this.hashCount===0)throw new Pn(`Invalid hash count: ${r}`);if(t.length===0&&e!==0)throw new Pn(`Invalid padding when bitmap length is 0: ${e}`);this.ge=8*t.length-e,this.pe=le.fromNumber(this.ge)}ye(t,e,r){let s=t.add(e.multiply(le.fromNumber(r)));return s.compare(dp)===1&&(s=new le([s.getBits(0),s.getBits(1)],0)),s.modulo(this.pe).toNumber()}we(t){return!!(this.bitmap[Math.floor(t/8)]&1<<t%8)}mightContain(t){if(this.ge===0)return!1;const e=nu(t),[r,s]=ru(e);for(let o=0;o<this.hashCount;o++){const a=this.ye(r,s,o);if(!this.we(a))return!1}return!0}static create(t,e,r){const s=t%8==0?0:8-t%8,o=new Uint8Array(Math.ceil(t/8)),a=new xi(o,s,e);return r.forEach((c=>a.insert(c))),a}insert(t){if(this.ge===0)return;const e=nu(t),[r,s]=ru(e);for(let o=0;o<this.hashCount;o++){const a=this.ye(r,s,o);this.Se(a)}}Se(t){const e=Math.floor(t/8),r=t%8;this.bitmap[e]|=1<<r}}class Pn extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class ss{constructor(t,e,r,s,o){this.snapshotVersion=t,this.targetChanges=e,this.targetMismatches=r,this.documentUpdates=s,this.resolvedLimboDocuments=o}static createSynthesizedRemoteEventForCurrentChange(t,e,r){const s=new Map;return s.set(t,Wn.createSynthesizedTargetChangeForCurrentChange(t,e,r)),new ss(U.min(),s,new et(j),te(),$())}}class Wn{constructor(t,e,r,s,o){this.resumeToken=t,this.current=e,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=o}static createSynthesizedTargetChangeForCurrentChange(t,e,r){return new Wn(r,e,$(),$(),$())}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Pr{constructor(t,e,r,s){this.be=t,this.removedTargetIds=e,this.key=r,this.De=s}}class $c{constructor(t,e){this.targetId=t,this.Ce=e}}class zc{constructor(t,e,r=gt.EMPTY_BYTE_STRING,s=null){this.state=t,this.targetIds=e,this.resumeToken=r,this.cause=s}}class su{constructor(){this.ve=0,this.Fe=iu(),this.Me=gt.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(t){t.approximateByteSize()>0&&(this.Oe=!0,this.Me=t)}ke(){let t=$(),e=$(),r=$();return this.Fe.forEach(((s,o)=>{switch(o){case 0:t=t.add(s);break;case 2:e=e.add(s);break;case 1:r=r.add(s);break;default:L(38017,{changeType:o})}})),new Wn(this.Me,this.xe,t,e,r)}qe(){this.Oe=!1,this.Fe=iu()}Qe(t,e){this.Oe=!0,this.Fe=this.Fe.insert(t,e)}$e(t){this.Oe=!0,this.Fe=this.Fe.remove(t)}Ue(){this.ve+=1}Ke(){this.ve-=1,W(this.ve>=0,3241,{ve:this.ve})}We(){this.Oe=!0,this.xe=!0}}class fp{constructor(t){this.Ge=t,this.ze=new Map,this.je=te(),this.Je=Ir(),this.He=Ir(),this.Ye=new et(j)}Ze(t){for(const e of t.be)t.De&&t.De.isFoundDocument()?this.Xe(e,t.De):this.et(e,t.key,t.De);for(const e of t.removedTargetIds)this.et(e,t.key,t.De)}tt(t){this.forEachTarget(t,(e=>{const r=this.nt(e);switch(t.state){case 0:this.rt(e)&&r.Le(t.resumeToken);break;case 1:r.Ke(),r.Ne||r.qe(),r.Le(t.resumeToken);break;case 2:r.Ke(),r.Ne||this.removeTarget(e);break;case 3:this.rt(e)&&(r.We(),r.Le(t.resumeToken));break;case 4:this.rt(e)&&(this.it(e),r.Le(t.resumeToken));break;default:L(56790,{state:t.state})}}))}forEachTarget(t,e){t.targetIds.length>0?t.targetIds.forEach(e):this.ze.forEach(((r,s)=>{this.rt(s)&&e(s)}))}st(t){const e=t.targetId,r=t.Ce.count,s=this.ot(e);if(s){const o=s.target;if(li(o))if(r===0){const a=new x(o.path);this.et(e,a,vt.newNoDocument(a,U.min()))}else W(r===1,20013,{expectedCount:r});else{const a=this._t(e);if(a!==r){const c=this.ut(t),h=c?this.ct(c,t,a):1;if(h!==0){this.it(e);const d=h===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ye=this.Ye.insert(e,d)}}}}}ut(t){const e=t.Ce.unchangedNames;if(!e||!e.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:o=0}=e;let a,c;try{a=pe(r).toUint8Array()}catch(h){if(h instanceof gc)return Xe("Decoding the base64 bloom filter in existence filter failed ("+h.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw h}try{c=new xi(a,s,o)}catch(h){return Xe(h instanceof Pn?"BloomFilter error: ":"Applying bloom filter failed: ",h),null}return c.ge===0?null:c}ct(t,e,r){return e.Ce.count===r-this.Pt(t,e.targetId)?0:2}Pt(t,e){const r=this.Ge.getRemoteKeysForTarget(e);let s=0;return r.forEach((o=>{const a=this.Ge.ht(),c=`projects/${a.projectId}/databases/${a.database}/documents/${o.path.canonicalString()}`;t.mightContain(c)||(this.et(e,o,null),s++)})),s}Tt(t){const e=new Map;this.ze.forEach(((o,a)=>{const c=this.ot(a);if(c){if(o.current&&li(c.target)){const h=new x(c.target.path);this.It(h).has(a)||this.Et(a,h)||this.et(a,h,vt.newNoDocument(h,t))}o.Be&&(e.set(a,o.ke()),o.qe())}}));let r=$();this.He.forEach(((o,a)=>{let c=!0;a.forEachWhile((h=>{const d=this.ot(h);return!d||d.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)})),c&&(r=r.add(o))})),this.je.forEach(((o,a)=>a.setReadTime(t)));const s=new ss(t,e,this.Ye,this.je,r);return this.je=te(),this.Je=Ir(),this.He=Ir(),this.Ye=new et(j),s}Xe(t,e){if(!this.rt(t))return;const r=this.Et(t,e.key)?2:0;this.nt(t).Qe(e.key,r),this.je=this.je.insert(e.key,e),this.Je=this.Je.insert(e.key,this.It(e.key).add(t)),this.He=this.He.insert(e.key,this.dt(e.key).add(t))}et(t,e,r){if(!this.rt(t))return;const s=this.nt(t);this.Et(t,e)?s.Qe(e,1):s.$e(e),this.He=this.He.insert(e,this.dt(e).delete(t)),this.He=this.He.insert(e,this.dt(e).add(t)),r&&(this.je=this.je.insert(e,r))}removeTarget(t){this.ze.delete(t)}_t(t){const e=this.nt(t).ke();return this.Ge.getRemoteKeysForTarget(t).size+e.addedDocuments.size-e.removedDocuments.size}Ue(t){this.nt(t).Ue()}nt(t){let e=this.ze.get(t);return e||(e=new su,this.ze.set(t,e)),e}dt(t){let e=this.He.get(t);return e||(e=new ct(j),this.He=this.He.insert(t,e)),e}It(t){let e=this.Je.get(t);return e||(e=new ct(j),this.Je=this.Je.insert(t,e)),e}rt(t){const e=this.ot(t)!==null;return e||O("WatchChangeAggregator","Detected inactive target",t),e}ot(t){const e=this.ze.get(t);return e&&e.Ne?null:this.Ge.At(t)}it(t){this.ze.set(t,new su),this.Ge.getRemoteKeysForTarget(t).forEach((e=>{this.et(t,e,null)}))}Et(t,e){return this.Ge.getRemoteKeysForTarget(t).has(e)}}function Ir(){return new et(x.comparator)}function iu(){return new et(x.comparator)}const pp={asc:"ASCENDING",desc:"DESCENDING"},mp={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},gp={and:"AND",or:"OR"};class _p{constructor(t,e){this.databaseId=t,this.useProto3Json=e}}function di(n,t){return n.useProto3Json||Xr(t)?t:{value:t}}function qr(n,t){return n.useProto3Json?`${new Date(1e3*t.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+t.nanoseconds).slice(-9)}Z`:{seconds:""+t.seconds,nanos:t.nanoseconds}}function Hc(n,t){return n.useProto3Json?t.toBase64():t.toUint8Array()}function yp(n,t){return qr(n,t.toTimestamp())}function qt(n){return W(!!n,49232),U.fromTimestamp((function(e){const r=fe(e);return new J(r.seconds,r.nanos)})(n))}function Mi(n,t){return fi(n,t).canonicalString()}function fi(n,t){const e=(function(s){return new X(["projects",s.projectId,"databases",s.database])})(n).child("documents");return t===void 0?e:e.child(t)}function Gc(n){const t=X.fromString(n);return W(Yc(t),10190,{key:t.toString()}),t}function pi(n,t){return Mi(n.databaseId,t.path)}function Gs(n,t){const e=Gc(t);if(e.get(1)!==n.databaseId.projectId)throw new N(S.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+e.get(1)+" vs "+n.databaseId.projectId);if(e.get(3)!==n.databaseId.database)throw new N(S.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+e.get(3)+" vs "+n.databaseId.database);return new x(Wc(e))}function Kc(n,t){return Mi(n.databaseId,t)}function Ep(n){const t=Gc(n);return t.length===4?X.emptyPath():Wc(t)}function mi(n){return new X(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function Wc(n){return W(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function ou(n,t,e){return{name:pi(n,t),fields:e.value.mapValue.fields}}function Tp(n,t){let e;if("targetChange"in t){t.targetChange;const r=(function(d){return d==="NO_CHANGE"?0:d==="ADD"?1:d==="REMOVE"?2:d==="CURRENT"?3:d==="RESET"?4:L(39313,{state:d})})(t.targetChange.targetChangeType||"NO_CHANGE"),s=t.targetChange.targetIds||[],o=(function(d,p){return d.useProto3Json?(W(p===void 0||typeof p=="string",58123),gt.fromBase64String(p||"")):(W(p===void 0||p instanceof Buffer||p instanceof Uint8Array,16193),gt.fromUint8Array(p||new Uint8Array))})(n,t.targetChange.resumeToken),a=t.targetChange.cause,c=a&&(function(d){const p=d.code===void 0?S.UNKNOWN:jc(d.code);return new N(p,d.message||"")})(a);e=new zc(r,s,o,c||null)}else if("documentChange"in t){t.documentChange;const r=t.documentChange;r.document,r.document.name,r.document.updateTime;const s=Gs(n,r.document.name),o=qt(r.document.updateTime),a=r.document.createTime?qt(r.document.createTime):U.min(),c=new Pt({mapValue:{fields:r.document.fields}}),h=vt.newFoundDocument(s,o,a,c),d=r.targetIds||[],p=r.removedTargetIds||[];e=new Pr(d,p,h.key,h)}else if("documentDelete"in t){t.documentDelete;const r=t.documentDelete;r.document;const s=Gs(n,r.document),o=r.readTime?qt(r.readTime):U.min(),a=vt.newNoDocument(s,o),c=r.removedTargetIds||[];e=new Pr([],c,a.key,a)}else if("documentRemove"in t){t.documentRemove;const r=t.documentRemove;r.document;const s=Gs(n,r.document),o=r.removedTargetIds||[];e=new Pr([],o,s,null)}else{if(!("filter"in t))return L(11601,{Rt:t});{t.filter;const r=t.filter;r.targetId;const{count:s=0,unchangedNames:o}=r,a=new cp(s,o),c=r.targetId;e=new $c(c,a)}}return e}function Ip(n,t){let e;if(t instanceof Kn)e={update:ou(n,t.key,t.value)};else if(t instanceof ki)e={delete:pi(n,t.key)};else if(t instanceof Te)e={update:ou(n,t.key,t.data),updateMask:Vp(t.fieldMask)};else{if(!(t instanceof op))return L(16599,{Vt:t.type});e={verify:pi(n,t.key)}}return t.fieldTransforms.length>0&&(e.updateTransforms=t.fieldTransforms.map((r=>(function(o,a){const c=a.transform;if(c instanceof Ur)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof $n)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof zn)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof Br)return{fieldPath:a.field.canonicalString(),increment:c.Ae};throw L(20930,{transform:a.transform})})(0,r)))),t.precondition.isNone||(e.currentDocument=(function(s,o){return o.updateTime!==void 0?{updateTime:yp(s,o.updateTime)}:o.exists!==void 0?{exists:o.exists}:L(27497)})(n,t.precondition)),e}function wp(n,t){return n&&n.length>0?(W(t!==void 0,14353),n.map((e=>(function(s,o){let a=s.updateTime?qt(s.updateTime):qt(o);return a.isEqual(U.min())&&(a=qt(o)),new rp(a,s.transformResults||[])})(e,t)))):[]}function vp(n,t){return{documents:[Kc(n,t.path)]}}function Ap(n,t){const e={structuredQuery:{}},r=t.path;let s;t.collectionGroup!==null?(s=r,e.structuredQuery.from=[{collectionId:t.collectionGroup,allDescendants:!0}]):(s=r.popLast(),e.structuredQuery.from=[{collectionId:r.lastSegment()}]),e.parent=Kc(n,s);const o=(function(d){if(d.length!==0)return Xc(Lt.create(d,"and"))})(t.filters);o&&(e.structuredQuery.where=o);const a=(function(d){if(d.length!==0)return d.map((p=>(function(E){return{field:He(E.field),direction:Sp(E.dir)}})(p)))})(t.orderBy);a&&(e.structuredQuery.orderBy=a);const c=di(n,t.limit);return c!==null&&(e.structuredQuery.limit=c),t.startAt&&(e.structuredQuery.startAt=(function(d){return{before:d.inclusive,values:d.position}})(t.startAt)),t.endAt&&(e.structuredQuery.endAt=(function(d){return{before:!d.inclusive,values:d.position}})(t.endAt)),{ft:e,parent:s}}function Rp(n){let t=Ep(n.parent);const e=n.structuredQuery,r=e.from?e.from.length:0;let s=null;if(r>0){W(r===1,65062);const p=e.from[0];p.allDescendants?s=p.collectionId:t=t.child(p.collectionId)}let o=[];e.where&&(o=(function(g){const E=Qc(g);return E instanceof Lt&&bc(E)?E.getFilters():[E]})(e.where));let a=[];e.orderBy&&(a=(function(g){return g.map((E=>(function(P){return new jn(Ge(P.field),(function(V){switch(V){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}})(P.direction))})(E)))})(e.orderBy));let c=null;e.limit&&(c=(function(g){let E;return E=typeof g=="object"?g.value:g,Xr(E)?null:E})(e.limit));let h=null;e.startAt&&(h=(function(g){const E=!!g.before,b=g.values||[];return new tn(b,E)})(e.startAt));let d=null;return e.endAt&&(d=(function(g){const E=!g.before,b=g.values||[];return new tn(b,E)})(e.endAt)),zf(t,s,a,o,c,"F",h,d)}function bp(n,t){const e=(function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return L(28987,{purpose:s})}})(t.purpose);return e==null?null:{"goog-listen-tags":e}}function Qc(n){return n.unaryFilter!==void 0?(function(e){switch(e.unaryFilter.op){case"IS_NAN":const r=Ge(e.unaryFilter.field);return at.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=Ge(e.unaryFilter.field);return at.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const o=Ge(e.unaryFilter.field);return at.create(o,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=Ge(e.unaryFilter.field);return at.create(a,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return L(61313);default:return L(60726)}})(n):n.fieldFilter!==void 0?(function(e){return at.create(Ge(e.fieldFilter.field),(function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return L(58110);default:return L(50506)}})(e.fieldFilter.op),e.fieldFilter.value)})(n):n.compositeFilter!==void 0?(function(e){return Lt.create(e.compositeFilter.filters.map((r=>Qc(r))),(function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return L(1026)}})(e.compositeFilter.op))})(n):L(30097,{filter:n})}function Sp(n){return pp[n]}function Cp(n){return mp[n]}function Pp(n){return gp[n]}function He(n){return{fieldPath:n.canonicalString()}}function Ge(n){return pt.fromServerFormat(n.fieldPath)}function Xc(n){return n instanceof at?(function(e){if(e.op==="=="){if(Ka(e.value))return{unaryFilter:{field:He(e.field),op:"IS_NAN"}};if(Ga(e.value))return{unaryFilter:{field:He(e.field),op:"IS_NULL"}}}else if(e.op==="!="){if(Ka(e.value))return{unaryFilter:{field:He(e.field),op:"IS_NOT_NAN"}};if(Ga(e.value))return{unaryFilter:{field:He(e.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:He(e.field),op:Cp(e.op),value:e.value}}})(n):n instanceof Lt?(function(e){const r=e.getFilters().map((s=>Xc(s)));return r.length===1?r[0]:{compositeFilter:{op:Pp(e.op),filters:r}}})(n):L(54877,{filter:n})}function Vp(n){const t=[];return n.fields.forEach((e=>t.push(e.canonicalString()))),{fieldPaths:t}}function Yc(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class oe{constructor(t,e,r,s,o=U.min(),a=U.min(),c=gt.EMPTY_BYTE_STRING,h=null){this.target=t,this.targetId=e,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=o,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=c,this.expectedCount=h}withSequenceNumber(t){return new oe(this.target,this.targetId,this.purpose,t,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(t,e){return new oe(this.target,this.targetId,this.purpose,this.sequenceNumber,e,this.lastLimboFreeSnapshotVersion,t,null)}withExpectedCount(t){return new oe(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,t)}withLastLimboFreeSnapshotVersion(t){return new oe(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,t,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Dp{constructor(t){this.yt=t}}function Np(n){const t=Rp({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?Fr(t,t.limit,"L"):t}/**
 * @license
 * Copyright 2019 Google LLC
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
 */class kp{constructor(){this.Cn=new Op}addToCollectionParentIndex(t,e){return this.Cn.add(e),C.resolve()}getCollectionParents(t,e){return C.resolve(this.Cn.getEntries(e))}addFieldIndex(t,e){return C.resolve()}deleteFieldIndex(t,e){return C.resolve()}deleteAllFieldIndexes(t){return C.resolve()}createTargetIndexes(t,e){return C.resolve()}getDocumentsMatchingTarget(t,e){return C.resolve(null)}getIndexType(t,e){return C.resolve(0)}getFieldIndexes(t,e){return C.resolve([])}getNextCollectionGroupToUpdate(t){return C.resolve(null)}getMinOffset(t,e){return C.resolve(de.min())}getMinOffsetFromCollectionGroup(t,e){return C.resolve(de.min())}updateCollectionGroup(t,e,r){return C.resolve()}updateIndexEntries(t,e){return C.resolve()}}class Op{constructor(){this.index={}}add(t){const e=t.lastSegment(),r=t.popLast(),s=this.index[e]||new ct(X.comparator),o=!s.has(r);return this.index[e]=s.add(r),o}has(t){const e=t.lastSegment(),r=t.popLast(),s=this.index[e];return s&&s.has(r)}getEntries(t){return(this.index[t]||new ct(X.comparator)).toArray()}}/**
 * @license
 * Copyright 2018 Google LLC
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
 */const au={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},Jc=41943040;class St{static withCacheSize(t){return new St(t,St.DEFAULT_COLLECTION_PERCENTILE,St.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(t,e,r){this.cacheSizeCollectionThreshold=t,this.percentileToCollect=e,this.maximumSequenceNumbersToCollect=r}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */St.DEFAULT_COLLECTION_PERCENTILE=10,St.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,St.DEFAULT=new St(Jc,St.DEFAULT_COLLECTION_PERCENTILE,St.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),St.DISABLED=new St(-1,0,0);/**
 * @license
 * Copyright 2017 Google LLC
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
 */class en{constructor(t){this.ar=t}next(){return this.ar+=2,this.ar}static ur(){return new en(0)}static cr(){return new en(-1)}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */const uu="LruGarbageCollector",xp=1048576;function cu([n,t],[e,r]){const s=j(n,e);return s===0?j(t,r):s}class Mp{constructor(t){this.Ir=t,this.buffer=new ct(cu),this.Er=0}dr(){return++this.Er}Ar(t){const e=[t,this.dr()];if(this.buffer.size<this.Ir)this.buffer=this.buffer.add(e);else{const r=this.buffer.last();cu(e,r)<0&&(this.buffer=this.buffer.delete(r).add(e))}}get maxValue(){return this.buffer.last()[0]}}class Lp{constructor(t,e,r){this.garbageCollector=t,this.asyncQueue=e,this.localStore=r,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Vr(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Vr(t){O(uu,`Garbage collection scheduled in ${t}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",t,(async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(e){on(e)?O(uu,"Ignoring IndexedDB error during garbage collection: ",e):await sn(e)}await this.Vr(3e5)}))}}class Fp{constructor(t,e){this.mr=t,this.params=e}calculateTargetCount(t,e){return this.mr.gr(t).next((r=>Math.floor(e/100*r)))}nthSequenceNumber(t,e){if(e===0)return C.resolve(Qr.ce);const r=new Mp(e);return this.mr.forEachTarget(t,(s=>r.Ar(s.sequenceNumber))).next((()=>this.mr.pr(t,(s=>r.Ar(s))))).next((()=>r.maxValue))}removeTargets(t,e,r){return this.mr.removeTargets(t,e,r)}removeOrphanedDocuments(t,e){return this.mr.removeOrphanedDocuments(t,e)}collect(t,e){return this.params.cacheSizeCollectionThreshold===-1?(O("LruGarbageCollector","Garbage collection skipped; disabled"),C.resolve(au)):this.getCacheSize(t).next((r=>r<this.params.cacheSizeCollectionThreshold?(O("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),au):this.yr(t,e)))}getCacheSize(t){return this.mr.getCacheSize(t)}yr(t,e){let r,s,o,a,c,h,d;const p=Date.now();return this.calculateTargetCount(t,this.params.percentileToCollect).next((g=>(g>this.params.maximumSequenceNumbersToCollect?(O("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${g}`),s=this.params.maximumSequenceNumbersToCollect):s=g,a=Date.now(),this.nthSequenceNumber(t,s)))).next((g=>(r=g,c=Date.now(),this.removeTargets(t,r,e)))).next((g=>(o=g,h=Date.now(),this.removeOrphanedDocuments(t,r)))).next((g=>(d=Date.now(),$e()<=G.DEBUG&&O("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${a-p}ms
	Determined least recently used ${s} in `+(c-a)+`ms
	Removed ${o} targets in `+(h-c)+`ms
	Removed ${g} documents in `+(d-h)+`ms
Total Duration: ${d-p}ms`),C.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:o,documentsRemoved:g}))))}}function Up(n,t){return new Fp(n,t)}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Bp{constructor(){this.changes=new xe((t=>t.toString()),((t,e)=>t.isEqual(e))),this.changesApplied=!1}addEntry(t){this.assertNotApplied(),this.changes.set(t.key,t)}removeEntry(t,e){this.assertNotApplied(),this.changes.set(t,vt.newInvalidDocument(t).setReadTime(e))}getEntry(t,e){this.assertNotApplied();const r=this.changes.get(e);return r!==void 0?C.resolve(r):this.getFromCache(t,e)}getEntries(t,e){return this.getAllFromCache(t,e)}apply(t){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(t)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
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
 *//**
 * @license
 * Copyright 2022 Google LLC
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
 */class qp{constructor(t,e){this.overlayedDocument=t,this.mutatedFields=e}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class jp{constructor(t,e,r,s){this.remoteDocumentCache=t,this.mutationQueue=e,this.documentOverlayCache=r,this.indexManager=s}getDocument(t,e){let r=null;return this.documentOverlayCache.getOverlay(t,e).next((s=>(r=s,this.remoteDocumentCache.getEntry(t,e)))).next((s=>(r!==null&&On(r.mutation,s,Dt.empty(),J.now()),s)))}getDocuments(t,e){return this.remoteDocumentCache.getEntries(t,e).next((r=>this.getLocalViewOfDocuments(t,r,$()).next((()=>r))))}getLocalViewOfDocuments(t,e,r=$()){const s=be();return this.populateOverlays(t,s,e).next((()=>this.computeViews(t,e,s,r).next((o=>{let a=Cn();return o.forEach(((c,h)=>{a=a.insert(c,h.overlayedDocument)})),a}))))}getOverlayedDocuments(t,e){const r=be();return this.populateOverlays(t,r,e).next((()=>this.computeViews(t,e,r,$())))}populateOverlays(t,e,r){const s=[];return r.forEach((o=>{e.has(o)||s.push(o)})),this.documentOverlayCache.getOverlays(t,s).next((o=>{o.forEach(((a,c)=>{e.set(a,c)}))}))}computeViews(t,e,r,s){let o=te();const a=kn(),c=(function(){return kn()})();return e.forEach(((h,d)=>{const p=r.get(d.key);s.has(d.key)&&(p===void 0||p.mutation instanceof Te)?o=o.insert(d.key,d):p!==void 0?(a.set(d.key,p.mutation.getFieldMask()),On(p.mutation,d,p.mutation.getFieldMask(),J.now())):a.set(d.key,Dt.empty())})),this.recalculateAndSaveOverlays(t,o).next((h=>(h.forEach(((d,p)=>a.set(d,p))),e.forEach(((d,p)=>c.set(d,new qp(p,a.get(d)??null)))),c)))}recalculateAndSaveOverlays(t,e){const r=kn();let s=new et(((a,c)=>a-c)),o=$();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(t,e).next((a=>{for(const c of a)c.keys().forEach((h=>{const d=e.get(h);if(d===null)return;let p=r.get(h)||Dt.empty();p=c.applyToLocalView(d,p),r.set(h,p);const g=(s.get(c.batchId)||$()).add(h);s=s.insert(c.batchId,g)}))})).next((()=>{const a=[],c=s.getReverseIterator();for(;c.hasNext();){const h=c.getNext(),d=h.key,p=h.value,g=Oc();p.forEach((E=>{if(!o.has(E)){const b=Bc(e.get(E),r.get(E));b!==null&&g.set(E,b),o=o.add(E)}})),a.push(this.documentOverlayCache.saveOverlays(t,d,g))}return C.waitFor(a)})).next((()=>r))}recalculateAndSaveOverlaysForDocumentKeys(t,e){return this.remoteDocumentCache.getEntries(t,e).next((r=>this.recalculateAndSaveOverlays(t,r)))}getDocumentsMatchingQuery(t,e,r,s){return(function(a){return x.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0})(e)?this.getDocumentsMatchingDocumentQuery(t,e.path):Di(e)?this.getDocumentsMatchingCollectionGroupQuery(t,e,r,s):this.getDocumentsMatchingCollectionQuery(t,e,r,s)}getNextDocuments(t,e,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(t,e,r,s).next((o=>{const a=s-o.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(t,e,r.largestBatchId,s-o.size):C.resolve(be());let c=Fn,h=o;return a.next((d=>C.forEach(d,((p,g)=>(c<g.largestBatchId&&(c=g.largestBatchId),o.get(p)?C.resolve():this.remoteDocumentCache.getEntry(t,p).next((E=>{h=h.insert(p,E)}))))).next((()=>this.populateOverlays(t,d,o))).next((()=>this.computeViews(t,h,d,$()))).next((p=>({batchId:c,changes:kc(p)})))))}))}getDocumentsMatchingDocumentQuery(t,e){return this.getDocument(t,new x(e)).next((r=>{let s=Cn();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s}))}getDocumentsMatchingCollectionGroupQuery(t,e,r,s){const o=e.collectionGroup;let a=Cn();return this.indexManager.getCollectionParents(t,o).next((c=>C.forEach(c,(h=>{const d=(function(g,E){return new Oe(E,null,g.explicitOrderBy.slice(),g.filters.slice(),g.limit,g.limitType,g.startAt,g.endAt)})(e,h.child(o));return this.getDocumentsMatchingCollectionQuery(t,d,r,s).next((p=>{p.forEach(((g,E)=>{a=a.insert(g,E)}))}))})).next((()=>a))))}getDocumentsMatchingCollectionQuery(t,e,r,s){let o;return this.documentOverlayCache.getOverlaysForCollection(t,e.path,r.largestBatchId).next((a=>(o=a,this.remoteDocumentCache.getDocumentsMatchingQuery(t,e,r,o,s)))).next((a=>{o.forEach(((h,d)=>{const p=d.getKey();a.get(p)===null&&(a=a.insert(p,vt.newInvalidDocument(p)))}));let c=Cn();return a.forEach(((h,d)=>{const p=o.get(h);p!==void 0&&On(p.mutation,d,Dt.empty(),J.now()),es(e,d)&&(c=c.insert(h,d))})),c}))}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */class $p{constructor(t){this.serializer=t,this.Lr=new Map,this.kr=new Map}getBundleMetadata(t,e){return C.resolve(this.Lr.get(e))}saveBundleMetadata(t,e){return this.Lr.set(e.id,(function(s){return{id:s.id,version:s.version,createTime:qt(s.createTime)}})(e)),C.resolve()}getNamedQuery(t,e){return C.resolve(this.kr.get(e))}saveNamedQuery(t,e){return this.kr.set(e.name,(function(s){return{name:s.name,query:Np(s.bundledQuery),readTime:qt(s.readTime)}})(e)),C.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
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
 */class zp{constructor(){this.overlays=new et(x.comparator),this.qr=new Map}getOverlay(t,e){return C.resolve(this.overlays.get(e))}getOverlays(t,e){const r=be();return C.forEach(e,(s=>this.getOverlay(t,s).next((o=>{o!==null&&r.set(s,o)})))).next((()=>r))}saveOverlays(t,e,r){return r.forEach(((s,o)=>{this.St(t,e,o)})),C.resolve()}removeOverlaysForBatchId(t,e,r){const s=this.qr.get(r);return s!==void 0&&(s.forEach((o=>this.overlays=this.overlays.remove(o))),this.qr.delete(r)),C.resolve()}getOverlaysForCollection(t,e,r){const s=be(),o=e.length+1,a=new x(e.child("")),c=this.overlays.getIteratorFrom(a);for(;c.hasNext();){const h=c.getNext().value,d=h.getKey();if(!e.isPrefixOf(d.path))break;d.path.length===o&&h.largestBatchId>r&&s.set(h.getKey(),h)}return C.resolve(s)}getOverlaysForCollectionGroup(t,e,r,s){let o=new et(((d,p)=>d-p));const a=this.overlays.getIterator();for(;a.hasNext();){const d=a.getNext().value;if(d.getKey().getCollectionGroup()===e&&d.largestBatchId>r){let p=o.get(d.largestBatchId);p===null&&(p=be(),o=o.insert(d.largestBatchId,p)),p.set(d.getKey(),d)}}const c=be(),h=o.getIterator();for(;h.hasNext()&&(h.getNext().value.forEach(((d,p)=>c.set(d,p))),!(c.size()>=s)););return C.resolve(c)}St(t,e,r){const s=this.overlays.get(r.key);if(s!==null){const a=this.qr.get(s.largestBatchId).delete(r.key);this.qr.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new up(e,r));let o=this.qr.get(e);o===void 0&&(o=$(),this.qr.set(e,o)),this.qr.set(e,o.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
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
 */class Hp{constructor(){this.sessionToken=gt.EMPTY_BYTE_STRING}getSessionToken(t){return C.resolve(this.sessionToken)}setSessionToken(t,e){return this.sessionToken=e,C.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Li{constructor(){this.Qr=new ct(lt.$r),this.Ur=new ct(lt.Kr)}isEmpty(){return this.Qr.isEmpty()}addReference(t,e){const r=new lt(t,e);this.Qr=this.Qr.add(r),this.Ur=this.Ur.add(r)}Wr(t,e){t.forEach((r=>this.addReference(r,e)))}removeReference(t,e){this.Gr(new lt(t,e))}zr(t,e){t.forEach((r=>this.removeReference(r,e)))}jr(t){const e=new x(new X([])),r=new lt(e,t),s=new lt(e,t+1),o=[];return this.Ur.forEachInRange([r,s],(a=>{this.Gr(a),o.push(a.key)})),o}Jr(){this.Qr.forEach((t=>this.Gr(t)))}Gr(t){this.Qr=this.Qr.delete(t),this.Ur=this.Ur.delete(t)}Hr(t){const e=new x(new X([])),r=new lt(e,t),s=new lt(e,t+1);let o=$();return this.Ur.forEachInRange([r,s],(a=>{o=o.add(a.key)})),o}containsKey(t){const e=new lt(t,0),r=this.Qr.firstAfterOrEqual(e);return r!==null&&t.isEqual(r.key)}}class lt{constructor(t,e){this.key=t,this.Yr=e}static $r(t,e){return x.comparator(t.key,e.key)||j(t.Yr,e.Yr)}static Kr(t,e){return j(t.Yr,e.Yr)||x.comparator(t.key,e.key)}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Gp{constructor(t,e){this.indexManager=t,this.referenceDelegate=e,this.mutationQueue=[],this.tr=1,this.Zr=new ct(lt.$r)}checkEmpty(t){return C.resolve(this.mutationQueue.length===0)}addMutationBatch(t,e,r,s){const o=this.tr;this.tr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new ap(o,e,r,s);this.mutationQueue.push(a);for(const c of s)this.Zr=this.Zr.add(new lt(c.key,o)),this.indexManager.addToCollectionParentIndex(t,c.key.path.popLast());return C.resolve(a)}lookupMutationBatch(t,e){return C.resolve(this.Xr(e))}getNextMutationBatchAfterBatchId(t,e){const r=e+1,s=this.ei(r),o=s<0?0:s;return C.resolve(this.mutationQueue.length>o?this.mutationQueue[o]:null)}getHighestUnacknowledgedBatchId(){return C.resolve(this.mutationQueue.length===0?Si:this.tr-1)}getAllMutationBatches(t){return C.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(t,e){const r=new lt(e,0),s=new lt(e,Number.POSITIVE_INFINITY),o=[];return this.Zr.forEachInRange([r,s],(a=>{const c=this.Xr(a.Yr);o.push(c)})),C.resolve(o)}getAllMutationBatchesAffectingDocumentKeys(t,e){let r=new ct(j);return e.forEach((s=>{const o=new lt(s,0),a=new lt(s,Number.POSITIVE_INFINITY);this.Zr.forEachInRange([o,a],(c=>{r=r.add(c.Yr)}))})),C.resolve(this.ti(r))}getAllMutationBatchesAffectingQuery(t,e){const r=e.path,s=r.length+1;let o=r;x.isDocumentKey(o)||(o=o.child(""));const a=new lt(new x(o),0);let c=new ct(j);return this.Zr.forEachWhile((h=>{const d=h.key.path;return!!r.isPrefixOf(d)&&(d.length===s&&(c=c.add(h.Yr)),!0)}),a),C.resolve(this.ti(c))}ti(t){const e=[];return t.forEach((r=>{const s=this.Xr(r);s!==null&&e.push(s)})),e}removeMutationBatch(t,e){W(this.ni(e.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.Zr;return C.forEach(e.mutations,(s=>{const o=new lt(s.key,e.batchId);return r=r.delete(o),this.referenceDelegate.markPotentiallyOrphaned(t,s.key)})).next((()=>{this.Zr=r}))}ir(t){}containsKey(t,e){const r=new lt(e,0),s=this.Zr.firstAfterOrEqual(r);return C.resolve(e.isEqual(s&&s.key))}performConsistencyCheck(t){return this.mutationQueue.length,C.resolve()}ni(t,e){return this.ei(t)}ei(t){return this.mutationQueue.length===0?0:t-this.mutationQueue[0].batchId}Xr(t){const e=this.ei(t);return e<0||e>=this.mutationQueue.length?null:this.mutationQueue[e]}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Kp{constructor(t){this.ri=t,this.docs=(function(){return new et(x.comparator)})(),this.size=0}setIndexManager(t){this.indexManager=t}addEntry(t,e){const r=e.key,s=this.docs.get(r),o=s?s.size:0,a=this.ri(e);return this.docs=this.docs.insert(r,{document:e.mutableCopy(),size:a}),this.size+=a-o,this.indexManager.addToCollectionParentIndex(t,r.path.popLast())}removeEntry(t){const e=this.docs.get(t);e&&(this.docs=this.docs.remove(t),this.size-=e.size)}getEntry(t,e){const r=this.docs.get(e);return C.resolve(r?r.document.mutableCopy():vt.newInvalidDocument(e))}getEntries(t,e){let r=te();return e.forEach((s=>{const o=this.docs.get(s);r=r.insert(s,o?o.document.mutableCopy():vt.newInvalidDocument(s))})),C.resolve(r)}getDocumentsMatchingQuery(t,e,r,s){let o=te();const a=e.path,c=new x(a.child("__id-9223372036854775808__")),h=this.docs.getIteratorFrom(c);for(;h.hasNext();){const{key:d,value:{document:p}}=h.getNext();if(!a.isPrefixOf(d.path))break;d.path.length>a.length+1||wf(If(p),r)<=0||(s.has(p.key)||es(e,p))&&(o=o.insert(p.key,p.mutableCopy()))}return C.resolve(o)}getAllFromCollectionGroup(t,e,r,s){L(9500)}ii(t,e){return C.forEach(this.docs,(r=>e(r)))}newChangeBuffer(t){return new Wp(this)}getSize(t){return C.resolve(this.size)}}class Wp extends Bp{constructor(t){super(),this.Nr=t}applyChanges(t){const e=[];return this.changes.forEach(((r,s)=>{s.isValidDocument()?e.push(this.Nr.addEntry(t,s)):this.Nr.removeEntry(r)})),C.waitFor(e)}getFromCache(t,e){return this.Nr.getEntry(t,e)}getAllFromCache(t,e){return this.Nr.getEntries(t,e)}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Qp{constructor(t){this.persistence=t,this.si=new xe((e=>Pi(e)),Vi),this.lastRemoteSnapshotVersion=U.min(),this.highestTargetId=0,this.oi=0,this._i=new Li,this.targetCount=0,this.ai=en.ur()}forEachTarget(t,e){return this.si.forEach(((r,s)=>e(s))),C.resolve()}getLastRemoteSnapshotVersion(t){return C.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(t){return C.resolve(this.oi)}allocateTargetId(t){return this.highestTargetId=this.ai.next(),C.resolve(this.highestTargetId)}setTargetsMetadata(t,e,r){return r&&(this.lastRemoteSnapshotVersion=r),e>this.oi&&(this.oi=e),C.resolve()}Pr(t){this.si.set(t.target,t);const e=t.targetId;e>this.highestTargetId&&(this.ai=new en(e),this.highestTargetId=e),t.sequenceNumber>this.oi&&(this.oi=t.sequenceNumber)}addTargetData(t,e){return this.Pr(e),this.targetCount+=1,C.resolve()}updateTargetData(t,e){return this.Pr(e),C.resolve()}removeTargetData(t,e){return this.si.delete(e.target),this._i.jr(e.targetId),this.targetCount-=1,C.resolve()}removeTargets(t,e,r){let s=0;const o=[];return this.si.forEach(((a,c)=>{c.sequenceNumber<=e&&r.get(c.targetId)===null&&(this.si.delete(a),o.push(this.removeMatchingKeysForTargetId(t,c.targetId)),s++)})),C.waitFor(o).next((()=>s))}getTargetCount(t){return C.resolve(this.targetCount)}getTargetData(t,e){const r=this.si.get(e)||null;return C.resolve(r)}addMatchingKeys(t,e,r){return this._i.Wr(e,r),C.resolve()}removeMatchingKeys(t,e,r){this._i.zr(e,r);const s=this.persistence.referenceDelegate,o=[];return s&&e.forEach((a=>{o.push(s.markPotentiallyOrphaned(t,a))})),C.waitFor(o)}removeMatchingKeysForTargetId(t,e){return this._i.jr(e),C.resolve()}getMatchingKeysForTargetId(t,e){const r=this._i.Hr(e);return C.resolve(r)}containsKey(t,e){return C.resolve(this._i.containsKey(e))}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Zc{constructor(t,e){this.ui={},this.overlays={},this.ci=new Qr(0),this.li=!1,this.li=!0,this.hi=new Hp,this.referenceDelegate=t(this),this.Pi=new Qp(this),this.indexManager=new kp,this.remoteDocumentCache=(function(s){return new Kp(s)})((r=>this.referenceDelegate.Ti(r))),this.serializer=new Dp(e),this.Ii=new $p(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.li=!1,Promise.resolve()}get started(){return this.li}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(t){return this.indexManager}getDocumentOverlayCache(t){let e=this.overlays[t.toKey()];return e||(e=new zp,this.overlays[t.toKey()]=e),e}getMutationQueue(t,e){let r=this.ui[t.toKey()];return r||(r=new Gp(e,this.referenceDelegate),this.ui[t.toKey()]=r),r}getGlobalsCache(){return this.hi}getTargetCache(){return this.Pi}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ii}runTransaction(t,e,r){O("MemoryPersistence","Starting transaction:",t);const s=new Xp(this.ci.next());return this.referenceDelegate.Ei(),r(s).next((o=>this.referenceDelegate.di(s).next((()=>o)))).toPromise().then((o=>(s.raiseOnCommittedEvent(),o)))}Ai(t,e){return C.or(Object.values(this.ui).map((r=>()=>r.containsKey(t,e))))}}class Xp extends Af{constructor(t){super(),this.currentSequenceNumber=t}}class Fi{constructor(t){this.persistence=t,this.Ri=new Li,this.Vi=null}static mi(t){return new Fi(t)}get fi(){if(this.Vi)return this.Vi;throw L(60996)}addReference(t,e,r){return this.Ri.addReference(r,e),this.fi.delete(r.toString()),C.resolve()}removeReference(t,e,r){return this.Ri.removeReference(r,e),this.fi.add(r.toString()),C.resolve()}markPotentiallyOrphaned(t,e){return this.fi.add(e.toString()),C.resolve()}removeTarget(t,e){this.Ri.jr(e.targetId).forEach((s=>this.fi.add(s.toString())));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(t,e.targetId).next((s=>{s.forEach((o=>this.fi.add(o.toString())))})).next((()=>r.removeTargetData(t,e)))}Ei(){this.Vi=new Set}di(t){const e=this.persistence.getRemoteDocumentCache().newChangeBuffer();return C.forEach(this.fi,(r=>{const s=x.fromPath(r);return this.gi(t,s).next((o=>{o||e.removeEntry(s,U.min())}))})).next((()=>(this.Vi=null,e.apply(t))))}updateLimboDocument(t,e){return this.gi(t,e).next((r=>{r?this.fi.delete(e.toString()):this.fi.add(e.toString())}))}Ti(t){return 0}gi(t,e){return C.or([()=>C.resolve(this.Ri.containsKey(e)),()=>this.persistence.getTargetCache().containsKey(t,e),()=>this.persistence.Ai(t,e)])}}class jr{constructor(t,e){this.persistence=t,this.pi=new xe((r=>Sf(r.path)),((r,s)=>r.isEqual(s))),this.garbageCollector=Up(this,e)}static mi(t,e){return new jr(t,e)}Ei(){}di(t){return C.resolve()}forEachTarget(t,e){return this.persistence.getTargetCache().forEachTarget(t,e)}gr(t){const e=this.wr(t);return this.persistence.getTargetCache().getTargetCount(t).next((r=>e.next((s=>r+s))))}wr(t){let e=0;return this.pr(t,(r=>{e++})).next((()=>e))}pr(t,e){return C.forEach(this.pi,((r,s)=>this.br(t,r,s).next((o=>o?C.resolve():e(s)))))}removeTargets(t,e,r){return this.persistence.getTargetCache().removeTargets(t,e,r)}removeOrphanedDocuments(t,e){let r=0;const s=this.persistence.getRemoteDocumentCache(),o=s.newChangeBuffer();return s.ii(t,(a=>this.br(t,a,e).next((c=>{c||(r++,o.removeEntry(a,U.min()))})))).next((()=>o.apply(t))).next((()=>r))}markPotentiallyOrphaned(t,e){return this.pi.set(e,t.currentSequenceNumber),C.resolve()}removeTarget(t,e){const r=e.withSequenceNumber(t.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(t,r)}addReference(t,e,r){return this.pi.set(r,t.currentSequenceNumber),C.resolve()}removeReference(t,e,r){return this.pi.set(r,t.currentSequenceNumber),C.resolve()}updateLimboDocument(t,e){return this.pi.set(e,t.currentSequenceNumber),C.resolve()}Ti(t){let e=t.key.toString().length;return t.isFoundDocument()&&(e+=br(t.data.value)),e}br(t,e,r){return C.or([()=>this.persistence.Ai(t,e),()=>this.persistence.getTargetCache().containsKey(t,e),()=>{const s=this.pi.get(e);return C.resolve(s!==void 0&&s>r)}])}getCacheSize(t){return this.persistence.getRemoteDocumentCache().getSize(t)}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Ui{constructor(t,e,r,s){this.targetId=t,this.fromCache=e,this.Es=r,this.ds=s}static As(t,e){let r=$(),s=$();for(const o of e.docChanges)switch(o.type){case 0:r=r.add(o.doc.key);break;case 1:s=s.add(o.doc.key)}return new Ui(t,e.fromCache,r,s)}}/**
 * @license
 * Copyright 2023 Google LLC
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
 */class Yp{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(t){this._documentReadCount+=t}}/**
 * @license
 * Copyright 2019 Google LLC
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
 */class Jp{constructor(){this.Rs=!1,this.Vs=!1,this.fs=100,this.gs=(function(){return Gh()?8:Rf(Gu())>0?6:4})()}initialize(t,e){this.ps=t,this.indexManager=e,this.Rs=!0}getDocumentsMatchingQuery(t,e,r,s){const o={result:null};return this.ys(t,e).next((a=>{o.result=a})).next((()=>{if(!o.result)return this.ws(t,e,s,r).next((a=>{o.result=a}))})).next((()=>{if(o.result)return;const a=new Yp;return this.Ss(t,e,a).next((c=>{if(o.result=c,this.Vs)return this.bs(t,e,a,c.size)}))})).next((()=>o.result))}bs(t,e,r,s){return r.documentReadCount<this.fs?($e()<=G.DEBUG&&O("QueryEngine","SDK will not create cache indexes for query:",ze(e),"since it only creates cache indexes for collection contains","more than or equal to",this.fs,"documents"),C.resolve()):($e()<=G.DEBUG&&O("QueryEngine","Query:",ze(e),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.gs*s?($e()<=G.DEBUG&&O("QueryEngine","The SDK decides to create cache indexes for query:",ze(e),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(t,Bt(e))):C.resolve())}ys(t,e){if(Ya(e))return C.resolve(null);let r=Bt(e);return this.indexManager.getIndexType(t,r).next((s=>s===0?null:(e.limit!==null&&s===1&&(e=Fr(e,null,"F"),r=Bt(e)),this.indexManager.getDocumentsMatchingTarget(t,r).next((o=>{const a=$(...o);return this.ps.getDocuments(t,a).next((c=>this.indexManager.getMinOffset(t,r).next((h=>{const d=this.Ds(e,c);return this.Cs(e,d,a,h.readTime)?this.ys(t,Fr(e,null,"F")):this.vs(t,d,e,h)}))))})))))}ws(t,e,r,s){return Ya(e)||s.isEqual(U.min())?C.resolve(null):this.ps.getDocuments(t,r).next((o=>{const a=this.Ds(e,o);return this.Cs(e,a,r,s)?C.resolve(null):($e()<=G.DEBUG&&O("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),ze(e)),this.vs(t,a,e,Tf(s,Fn)).next((c=>c)))}))}Ds(t,e){let r=new ct(Dc(t));return e.forEach(((s,o)=>{es(t,o)&&(r=r.add(o))})),r}Cs(t,e,r,s){if(t.limit===null)return!1;if(r.size!==e.size)return!0;const o=t.limitType==="F"?e.last():e.first();return!!o&&(o.hasPendingWrites||o.version.compareTo(s)>0)}Ss(t,e,r){return $e()<=G.DEBUG&&O("QueryEngine","Using full collection scan to execute query:",ze(e)),this.ps.getDocumentsMatchingQuery(t,e,de.min(),r)}vs(t,e,r,s){return this.ps.getDocumentsMatchingQuery(t,r,s).next((o=>(e.forEach((a=>{o=o.insert(a.key,a)})),o)))}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */const Bi="LocalStore",Zp=3e8;class tm{constructor(t,e,r,s){this.persistence=t,this.Fs=e,this.serializer=s,this.Ms=new et(j),this.xs=new xe((o=>Pi(o)),Vi),this.Os=new Map,this.Ns=t.getRemoteDocumentCache(),this.Pi=t.getTargetCache(),this.Ii=t.getBundleCache(),this.Bs(r)}Bs(t){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(t),this.indexManager=this.persistence.getIndexManager(t),this.mutationQueue=this.persistence.getMutationQueue(t,this.indexManager),this.localDocuments=new jp(this.Ns,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Ns.setIndexManager(this.indexManager),this.Fs.initialize(this.localDocuments,this.indexManager)}collectGarbage(t){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(e=>t.collect(e,this.Ms)))}}function em(n,t,e,r){return new tm(n,t,e,r)}async function tl(n,t){const e=B(n);return await e.persistence.runTransaction("Handle user change","readonly",(r=>{let s;return e.mutationQueue.getAllMutationBatches(r).next((o=>(s=o,e.Bs(t),e.mutationQueue.getAllMutationBatches(r)))).next((o=>{const a=[],c=[];let h=$();for(const d of s){a.push(d.batchId);for(const p of d.mutations)h=h.add(p.key)}for(const d of o){c.push(d.batchId);for(const p of d.mutations)h=h.add(p.key)}return e.localDocuments.getDocuments(r,h).next((d=>({Ls:d,removedBatchIds:a,addedBatchIds:c})))}))}))}function nm(n,t){const e=B(n);return e.persistence.runTransaction("Acknowledge batch","readwrite-primary",(r=>{const s=t.batch.keys(),o=e.Ns.newChangeBuffer({trackRemovals:!0});return(function(c,h,d,p){const g=d.batch,E=g.keys();let b=C.resolve();return E.forEach((P=>{b=b.next((()=>p.getEntry(h,P))).next((k=>{const V=d.docVersions.get(P);W(V!==null,48541),k.version.compareTo(V)<0&&(g.applyToRemoteDocument(k,d),k.isValidDocument()&&(k.setReadTime(d.commitVersion),p.addEntry(k)))}))})),b.next((()=>c.mutationQueue.removeMutationBatch(h,g)))})(e,r,t,o).next((()=>o.apply(r))).next((()=>e.mutationQueue.performConsistencyCheck(r))).next((()=>e.documentOverlayCache.removeOverlaysForBatchId(r,s,t.batch.batchId))).next((()=>e.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,(function(c){let h=$();for(let d=0;d<c.mutationResults.length;++d)c.mutationResults[d].transformResults.length>0&&(h=h.add(c.batch.mutations[d].key));return h})(t)))).next((()=>e.localDocuments.getDocuments(r,s)))}))}function el(n){const t=B(n);return t.persistence.runTransaction("Get last remote snapshot version","readonly",(e=>t.Pi.getLastRemoteSnapshotVersion(e)))}function rm(n,t){const e=B(n),r=t.snapshotVersion;let s=e.Ms;return e.persistence.runTransaction("Apply remote event","readwrite-primary",(o=>{const a=e.Ns.newChangeBuffer({trackRemovals:!0});s=e.Ms;const c=[];t.targetChanges.forEach(((p,g)=>{const E=s.get(g);if(!E)return;c.push(e.Pi.removeMatchingKeys(o,p.removedDocuments,g).next((()=>e.Pi.addMatchingKeys(o,p.addedDocuments,g))));let b=E.withSequenceNumber(o.currentSequenceNumber);t.targetMismatches.get(g)!==null?b=b.withResumeToken(gt.EMPTY_BYTE_STRING,U.min()).withLastLimboFreeSnapshotVersion(U.min()):p.resumeToken.approximateByteSize()>0&&(b=b.withResumeToken(p.resumeToken,r)),s=s.insert(g,b),(function(k,V,q){return k.resumeToken.approximateByteSize()===0||V.snapshotVersion.toMicroseconds()-k.snapshotVersion.toMicroseconds()>=Zp?!0:q.addedDocuments.size+q.modifiedDocuments.size+q.removedDocuments.size>0})(E,b,p)&&c.push(e.Pi.updateTargetData(o,b))}));let h=te(),d=$();if(t.documentUpdates.forEach((p=>{t.resolvedLimboDocuments.has(p)&&c.push(e.persistence.referenceDelegate.updateLimboDocument(o,p))})),c.push(sm(o,a,t.documentUpdates).next((p=>{h=p.ks,d=p.qs}))),!r.isEqual(U.min())){const p=e.Pi.getLastRemoteSnapshotVersion(o).next((g=>e.Pi.setTargetsMetadata(o,o.currentSequenceNumber,r)));c.push(p)}return C.waitFor(c).next((()=>a.apply(o))).next((()=>e.localDocuments.getLocalViewOfDocuments(o,h,d))).next((()=>h))})).then((o=>(e.Ms=s,o)))}function sm(n,t,e){let r=$(),s=$();return e.forEach((o=>r=r.add(o))),t.getEntries(n,r).next((o=>{let a=te();return e.forEach(((c,h)=>{const d=o.get(c);h.isFoundDocument()!==d.isFoundDocument()&&(s=s.add(c)),h.isNoDocument()&&h.version.isEqual(U.min())?(t.removeEntry(c,h.readTime),a=a.insert(c,h)):!d.isValidDocument()||h.version.compareTo(d.version)>0||h.version.compareTo(d.version)===0&&d.hasPendingWrites?(t.addEntry(h),a=a.insert(c,h)):O(Bi,"Ignoring outdated watch update for ",c,". Current version:",d.version," Watch version:",h.version)})),{ks:a,qs:s}}))}function im(n,t){const e=B(n);return e.persistence.runTransaction("Get next mutation batch","readonly",(r=>(t===void 0&&(t=Si),e.mutationQueue.getNextMutationBatchAfterBatchId(r,t))))}function om(n,t){const e=B(n);return e.persistence.runTransaction("Allocate target","readwrite",(r=>{let s;return e.Pi.getTargetData(r,t).next((o=>o?(s=o,C.resolve(s)):e.Pi.allocateTargetId(r).next((a=>(s=new oe(t,a,"TargetPurposeListen",r.currentSequenceNumber),e.Pi.addTargetData(r,s).next((()=>s)))))))})).then((r=>{const s=e.Ms.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(e.Ms=e.Ms.insert(r.targetId,r),e.xs.set(t,r.targetId)),r}))}async function gi(n,t,e){const r=B(n),s=r.Ms.get(t),o=e?"readwrite":"readwrite-primary";try{e||await r.persistence.runTransaction("Release target",o,(a=>r.persistence.referenceDelegate.removeTarget(a,s)))}catch(a){if(!on(a))throw a;O(Bi,`Failed to update sequence numbers for target ${t}: ${a}`)}r.Ms=r.Ms.remove(t),r.xs.delete(s.target)}function lu(n,t,e){const r=B(n);let s=U.min(),o=$();return r.persistence.runTransaction("Execute query","readwrite",(a=>(function(h,d,p){const g=B(h),E=g.xs.get(p);return E!==void 0?C.resolve(g.Ms.get(E)):g.Pi.getTargetData(d,p)})(r,a,Bt(t)).next((c=>{if(c)return s=c.lastLimboFreeSnapshotVersion,r.Pi.getMatchingKeysForTargetId(a,c.targetId).next((h=>{o=h}))})).next((()=>r.Fs.getDocumentsMatchingQuery(a,t,e?s:U.min(),e?o:$()))).next((c=>(am(r,Gf(t),c),{documents:c,Qs:o})))))}function am(n,t,e){let r=n.Os.get(t)||U.min();e.forEach(((s,o)=>{o.readTime.compareTo(r)>0&&(r=o.readTime)})),n.Os.set(t,r)}class hu{constructor(){this.activeTargetIds=Jf()}zs(t){this.activeTargetIds=this.activeTargetIds.add(t)}js(t){this.activeTargetIds=this.activeTargetIds.delete(t)}Gs(){const t={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(t)}}class um{constructor(){this.Mo=new hu,this.xo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(t){}updateMutationState(t,e,r){}addLocalQueryTarget(t,e=!0){return e&&this.Mo.zs(t),this.xo[t]||"not-current"}updateQueryState(t,e,r){this.xo[t]=e}removeLocalQueryTarget(t){this.Mo.js(t)}isLocalQueryTarget(t){return this.Mo.activeTargetIds.has(t)}clearQueryState(t){delete this.xo[t]}getAllActiveQueryTargets(){return this.Mo.activeTargetIds}isActiveQueryTarget(t){return this.Mo.activeTargetIds.has(t)}start(){return this.Mo=new hu,Promise.resolve()}handleUserChange(t,e,r){}setOnlineState(t){}shutdown(){}writeSequenceNumber(t){}notifyBundleLoaded(t){}}/**
 * @license
 * Copyright 2019 Google LLC
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
 */class cm{Oo(t){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
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
 */const du="ConnectivityMonitor";class fu{constructor(){this.No=()=>this.Bo(),this.Lo=()=>this.ko(),this.qo=[],this.Qo()}Oo(t){this.qo.push(t)}shutdown(){window.removeEventListener("online",this.No),window.removeEventListener("offline",this.Lo)}Qo(){window.addEventListener("online",this.No),window.addEventListener("offline",this.Lo)}Bo(){O(du,"Network connectivity changed: AVAILABLE");for(const t of this.qo)t(0)}ko(){O(du,"Network connectivity changed: UNAVAILABLE");for(const t of this.qo)t(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
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
 */let wr=null;function _i(){return wr===null?wr=(function(){return 268435456+Math.round(2147483648*Math.random())})():wr++,"0x"+wr.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
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
 */const Ks="RestConnection",lm={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class hm{get $o(){return!1}constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const e=t.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Uo=e+"://"+t.host,this.Ko=`projects/${r}/databases/${s}`,this.Wo=this.databaseId.database===xr?`project_id=${r}`:`project_id=${r}&database_id=${s}`}Go(t,e,r,s,o){const a=_i(),c=this.zo(t,e.toUriEncodedString());O(Ks,`Sending RPC '${t}' ${a}:`,c,r);const h={"google-cloud-resource-prefix":this.Ko,"x-goog-request-params":this.Wo};this.jo(h,s,o);const{host:d}=new URL(c),p=Hn(d);return this.Jo(t,c,h,r,p).then((g=>(O(Ks,`Received RPC '${t}' ${a}: `,g),g)),(g=>{throw Xe(Ks,`RPC '${t}' ${a} failed with error: `,g,"url: ",c,"request:",r),g}))}Ho(t,e,r,s,o,a){return this.Go(t,e,r,s,o)}jo(t,e,r){t["X-Goog-Api-Client"]=(function(){return"gl-js/ fire/"+rn})(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),e&&e.headers.forEach(((s,o)=>t[o]=s)),r&&r.headers.forEach(((s,o)=>t[o]=s))}zo(t,e){const r=lm[t];return`${this.Uo}/v1/${e}:${r}`}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class dm{constructor(t){this.Yo=t.Yo,this.Zo=t.Zo}Xo(t){this.e_=t}t_(t){this.n_=t}r_(t){this.i_=t}onMessage(t){this.s_=t}close(){this.Zo()}send(t){this.Yo(t)}o_(){this.e_()}__(){this.n_()}a_(t){this.i_(t)}u_(t){this.s_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */const It="WebChannelConnection";class fm extends hm{constructor(t){super(t),this.c_=[],this.forceLongPolling=t.forceLongPolling,this.autoDetectLongPolling=t.autoDetectLongPolling,this.useFetchStreams=t.useFetchStreams,this.longPollingOptions=t.longPollingOptions}Jo(t,e,r,s,o){const a=_i();return new Promise(((c,h)=>{const d=new ic;d.setWithCredentials(!0),d.listenOnce(oc.COMPLETE,(()=>{try{switch(d.getLastErrorCode()){case Rr.NO_ERROR:const g=d.getResponseJson();O(It,`XHR for RPC '${t}' ${a} received:`,JSON.stringify(g)),c(g);break;case Rr.TIMEOUT:O(It,`RPC '${t}' ${a} timed out`),h(new N(S.DEADLINE_EXCEEDED,"Request time out"));break;case Rr.HTTP_ERROR:const E=d.getStatus();if(O(It,`RPC '${t}' ${a} failed with status:`,E,"response text:",d.getResponseText()),E>0){let b=d.getResponseJson();Array.isArray(b)&&(b=b[0]);const P=b?.error;if(P&&P.status&&P.message){const k=(function(q){const F=q.toLowerCase().replace(/_/g,"-");return Object.values(S).indexOf(F)>=0?F:S.UNKNOWN})(P.status);h(new N(k,P.message))}else h(new N(S.UNKNOWN,"Server responded with status "+d.getStatus()))}else h(new N(S.UNAVAILABLE,"Connection failed."));break;default:L(9055,{l_:t,streamId:a,h_:d.getLastErrorCode(),P_:d.getLastError()})}}finally{O(It,`RPC '${t}' ${a} completed.`)}}));const p=JSON.stringify(s);O(It,`RPC '${t}' ${a} sending request:`,s),d.send(e,"POST",p,r,15)}))}T_(t,e,r){const s=_i(),o=[this.Uo,"/","google.firestore.v1.Firestore","/",t,"/channel"],a=cc(),c=uc(),h={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},d=this.longPollingOptions.timeoutSeconds;d!==void 0&&(h.longPollingTimeout=Math.round(1e3*d)),this.useFetchStreams&&(h.useFetchStreams=!0),this.jo(h.initMessageHeaders,e,r),h.encodeInitMessageHeaders=!0;const p=o.join("");O(It,`Creating RPC '${t}' stream ${s}: ${p}`,h);const g=a.createWebChannel(p,h);this.I_(g);let E=!1,b=!1;const P=new dm({Yo:V=>{b?O(It,`Not sending because RPC '${t}' stream ${s} is closed:`,V):(E||(O(It,`Opening RPC '${t}' stream ${s} transport.`),g.open(),E=!0),O(It,`RPC '${t}' stream ${s} sending:`,V),g.send(V))},Zo:()=>g.close()}),k=(V,q,F)=>{V.listen(q,(M=>{try{F(M)}catch(z){setTimeout((()=>{throw z}),0)}}))};return k(g,Sn.EventType.OPEN,(()=>{b||(O(It,`RPC '${t}' stream ${s} transport opened.`),P.o_())})),k(g,Sn.EventType.CLOSE,(()=>{b||(b=!0,O(It,`RPC '${t}' stream ${s} transport closed`),P.a_(),this.E_(g))})),k(g,Sn.EventType.ERROR,(V=>{b||(b=!0,Xe(It,`RPC '${t}' stream ${s} transport errored. Name:`,V.name,"Message:",V.message),P.a_(new N(S.UNAVAILABLE,"The operation could not be completed")))})),k(g,Sn.EventType.MESSAGE,(V=>{if(!b){const q=V.data[0];W(!!q,16349);const F=q,M=F?.error||F[0]?.error;if(M){O(It,`RPC '${t}' stream ${s} received error:`,M);const z=M.status;let ht=(function(m){const _=ot[m];if(_!==void 0)return jc(_)})(z),tt=M.message;ht===void 0&&(ht=S.INTERNAL,tt="Unknown error status: "+z+" with message "+M.message),b=!0,P.a_(new N(ht,tt)),g.close()}else O(It,`RPC '${t}' stream ${s} received:`,q),P.u_(q)}})),k(c,ac.STAT_EVENT,(V=>{V.stat===ii.PROXY?O(It,`RPC '${t}' stream ${s} detected buffering proxy`):V.stat===ii.NOPROXY&&O(It,`RPC '${t}' stream ${s} detected no buffering proxy`)})),setTimeout((()=>{P.__()}),0),P}terminate(){this.c_.forEach((t=>t.close())),this.c_=[]}I_(t){this.c_.push(t)}E_(t){this.c_=this.c_.filter((e=>e===t))}}function Ws(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
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
 */function is(n){return new _p(n,!0)}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class nl{constructor(t,e,r=1e3,s=1.5,o=6e4){this.Mi=t,this.timerId=e,this.d_=r,this.A_=s,this.R_=o,this.V_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.V_=0}g_(){this.V_=this.R_}p_(t){this.cancel();const e=Math.floor(this.V_+this.y_()),r=Math.max(0,Date.now()-this.f_),s=Math.max(0,e-r);s>0&&O("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.V_} ms, delay with jitter: ${e} ms, last attempt: ${r} ms ago)`),this.m_=this.Mi.enqueueAfterDelay(this.timerId,s,(()=>(this.f_=Date.now(),t()))),this.V_*=this.A_,this.V_<this.d_&&(this.V_=this.d_),this.V_>this.R_&&(this.V_=this.R_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.V_}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */const pu="PersistentStream";class rl{constructor(t,e,r,s,o,a,c,h){this.Mi=t,this.S_=r,this.b_=s,this.connection=o,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=c,this.listener=h,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new nl(t,e)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Mi.enqueueAfterDelay(this.S_,6e4,(()=>this.k_())))}q_(t){this.Q_(),this.stream.send(t)}async k_(){if(this.O_())return this.close(0)}Q_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(t,e){this.Q_(),this.U_(),this.M_.cancel(),this.D_++,t!==4?this.M_.reset():e&&e.code===S.RESOURCE_EXHAUSTED?(Zt(e.toString()),Zt("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):e&&e.code===S.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.K_(),this.stream.close(),this.stream=null),this.state=t,await this.listener.r_(e)}K_(){}auth(){this.state=1;const t=this.W_(this.D_),e=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([r,s])=>{this.D_===e&&this.G_(r,s)}),(r=>{t((()=>{const s=new N(S.UNKNOWN,"Fetching auth token failed: "+r.message);return this.z_(s)}))}))}G_(t,e){const r=this.W_(this.D_);this.stream=this.j_(t,e),this.stream.Xo((()=>{r((()=>this.listener.Xo()))})),this.stream.t_((()=>{r((()=>(this.state=2,this.v_=this.Mi.enqueueAfterDelay(this.b_,1e4,(()=>(this.O_()&&(this.state=3),Promise.resolve()))),this.listener.t_())))})),this.stream.r_((s=>{r((()=>this.z_(s)))})),this.stream.onMessage((s=>{r((()=>++this.F_==1?this.J_(s):this.onNext(s)))}))}N_(){this.state=5,this.M_.p_((async()=>{this.state=0,this.start()}))}z_(t){return O(pu,`close with error: ${t}`),this.stream=null,this.close(4,t)}W_(t){return e=>{this.Mi.enqueueAndForget((()=>this.D_===t?e():(O(pu,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class pm extends rl{constructor(t,e,r,s,o,a){super(t,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",e,r,s,a),this.serializer=o}j_(t,e){return this.connection.T_("Listen",t,e)}J_(t){return this.onNext(t)}onNext(t){this.M_.reset();const e=Tp(this.serializer,t),r=(function(o){if(!("targetChange"in o))return U.min();const a=o.targetChange;return a.targetIds&&a.targetIds.length?U.min():a.readTime?qt(a.readTime):U.min()})(t);return this.listener.H_(e,r)}Y_(t){const e={};e.database=mi(this.serializer),e.addTarget=(function(o,a){let c;const h=a.target;if(c=li(h)?{documents:vp(o,h)}:{query:Ap(o,h).ft},c.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){c.resumeToken=Hc(o,a.resumeToken);const d=di(o,a.expectedCount);d!==null&&(c.expectedCount=d)}else if(a.snapshotVersion.compareTo(U.min())>0){c.readTime=qr(o,a.snapshotVersion.toTimestamp());const d=di(o,a.expectedCount);d!==null&&(c.expectedCount=d)}return c})(this.serializer,t);const r=bp(this.serializer,t);r&&(e.labels=r),this.q_(e)}Z_(t){const e={};e.database=mi(this.serializer),e.removeTarget=t,this.q_(e)}}class mm extends rl{constructor(t,e,r,s,o,a){super(t,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",e,r,s,a),this.serializer=o}get X_(){return this.F_>0}start(){this.lastStreamToken=void 0,super.start()}K_(){this.X_&&this.ea([])}j_(t,e){return this.connection.T_("Write",t,e)}J_(t){return W(!!t.streamToken,31322),this.lastStreamToken=t.streamToken,W(!t.writeResults||t.writeResults.length===0,55816),this.listener.ta()}onNext(t){W(!!t.streamToken,12678),this.lastStreamToken=t.streamToken,this.M_.reset();const e=wp(t.writeResults,t.commitTime),r=qt(t.commitTime);return this.listener.na(r,e)}ra(){const t={};t.database=mi(this.serializer),this.q_(t)}ea(t){const e={streamToken:this.lastStreamToken,writes:t.map((r=>Ip(this.serializer,r)))};this.q_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class gm{}class _m extends gm{constructor(t,e,r,s){super(),this.authCredentials=t,this.appCheckCredentials=e,this.connection=r,this.serializer=s,this.ia=!1}sa(){if(this.ia)throw new N(S.FAILED_PRECONDITION,"The client has already been terminated.")}Go(t,e,r,s){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([o,a])=>this.connection.Go(t,fi(e,r),s,o,a))).catch((o=>{throw o.name==="FirebaseError"?(o.code===S.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new N(S.UNKNOWN,o.toString())}))}Ho(t,e,r,s,o){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([a,c])=>this.connection.Ho(t,fi(e,r),s,a,c,o))).catch((a=>{throw a.name==="FirebaseError"?(a.code===S.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new N(S.UNKNOWN,a.toString())}))}terminate(){this.ia=!0,this.connection.terminate()}}class ym{constructor(t,e){this.asyncQueue=t,this.onlineStateHandler=e,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve()))))}ha(t){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${t.toString()}`),this.ca("Offline")))}set(t){this.Pa(),this.oa=0,t==="Online"&&(this.aa=!1),this.ca(t)}ca(t){t!==this.state&&(this.state=t,this.onlineStateHandler(t))}la(t){const e=`Could not reach Cloud Firestore backend. ${t}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(Zt(e),this.aa=!1):O("OnlineStateTracker",e)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */const De="RemoteStore";class Em{constructor(t,e,r,s,o){this.localStore=t,this.datastore=e,this.asyncQueue=r,this.remoteSyncer={},this.Ta=[],this.Ia=new Map,this.Ea=new Set,this.da=[],this.Aa=o,this.Aa.Oo((a=>{r.enqueueAndForget((async()=>{Me(this)&&(O(De,"Restarting streams for network reachability change."),await(async function(h){const d=B(h);d.Ea.add(4),await Qn(d),d.Ra.set("Unknown"),d.Ea.delete(4),await os(d)})(this))}))})),this.Ra=new ym(r,s)}}async function os(n){if(Me(n))for(const t of n.da)await t(!0)}async function Qn(n){for(const t of n.da)await t(!1)}function sl(n,t){const e=B(n);e.Ia.has(t.targetId)||(e.Ia.set(t.targetId,t),zi(e)?$i(e):an(e).O_()&&ji(e,t))}function qi(n,t){const e=B(n),r=an(e);e.Ia.delete(t),r.O_()&&il(e,t),e.Ia.size===0&&(r.O_()?r.L_():Me(e)&&e.Ra.set("Unknown"))}function ji(n,t){if(n.Va.Ue(t.targetId),t.resumeToken.approximateByteSize()>0||t.snapshotVersion.compareTo(U.min())>0){const e=n.remoteSyncer.getRemoteKeysForTarget(t.targetId).size;t=t.withExpectedCount(e)}an(n).Y_(t)}function il(n,t){n.Va.Ue(t),an(n).Z_(t)}function $i(n){n.Va=new fp({getRemoteKeysForTarget:t=>n.remoteSyncer.getRemoteKeysForTarget(t),At:t=>n.Ia.get(t)||null,ht:()=>n.datastore.serializer.databaseId}),an(n).start(),n.Ra.ua()}function zi(n){return Me(n)&&!an(n).x_()&&n.Ia.size>0}function Me(n){return B(n).Ea.size===0}function ol(n){n.Va=void 0}async function Tm(n){n.Ra.set("Online")}async function Im(n){n.Ia.forEach(((t,e)=>{ji(n,t)}))}async function wm(n,t){ol(n),zi(n)?(n.Ra.ha(t),$i(n)):n.Ra.set("Unknown")}async function vm(n,t,e){if(n.Ra.set("Online"),t instanceof zc&&t.state===2&&t.cause)try{await(async function(s,o){const a=o.cause;for(const c of o.targetIds)s.Ia.has(c)&&(await s.remoteSyncer.rejectListen(c,a),s.Ia.delete(c),s.Va.removeTarget(c))})(n,t)}catch(r){O(De,"Failed to remove targets %s: %s ",t.targetIds.join(","),r),await $r(n,r)}else if(t instanceof Pr?n.Va.Ze(t):t instanceof $c?n.Va.st(t):n.Va.tt(t),!e.isEqual(U.min()))try{const r=await el(n.localStore);e.compareTo(r)>=0&&await(function(o,a){const c=o.Va.Tt(a);return c.targetChanges.forEach(((h,d)=>{if(h.resumeToken.approximateByteSize()>0){const p=o.Ia.get(d);p&&o.Ia.set(d,p.withResumeToken(h.resumeToken,a))}})),c.targetMismatches.forEach(((h,d)=>{const p=o.Ia.get(h);if(!p)return;o.Ia.set(h,p.withResumeToken(gt.EMPTY_BYTE_STRING,p.snapshotVersion)),il(o,h);const g=new oe(p.target,h,d,p.sequenceNumber);ji(o,g)})),o.remoteSyncer.applyRemoteEvent(c)})(n,e)}catch(r){O(De,"Failed to raise snapshot:",r),await $r(n,r)}}async function $r(n,t,e){if(!on(t))throw t;n.Ea.add(1),await Qn(n),n.Ra.set("Offline"),e||(e=()=>el(n.localStore)),n.asyncQueue.enqueueRetryable((async()=>{O(De,"Retrying IndexedDB access"),await e(),n.Ea.delete(1),await os(n)}))}function al(n,t){return t().catch((e=>$r(n,e,t)))}async function as(n){const t=B(n),e=ge(t);let r=t.Ta.length>0?t.Ta[t.Ta.length-1].batchId:Si;for(;Am(t);)try{const s=await im(t.localStore,r);if(s===null){t.Ta.length===0&&e.L_();break}r=s.batchId,Rm(t,s)}catch(s){await $r(t,s)}ul(t)&&cl(t)}function Am(n){return Me(n)&&n.Ta.length<10}function Rm(n,t){n.Ta.push(t);const e=ge(n);e.O_()&&e.X_&&e.ea(t.mutations)}function ul(n){return Me(n)&&!ge(n).x_()&&n.Ta.length>0}function cl(n){ge(n).start()}async function bm(n){ge(n).ra()}async function Sm(n){const t=ge(n);for(const e of n.Ta)t.ea(e.mutations)}async function Cm(n,t,e){const r=n.Ta.shift(),s=Oi.from(r,t,e);await al(n,(()=>n.remoteSyncer.applySuccessfulWrite(s))),await as(n)}async function Pm(n,t){t&&ge(n).X_&&await(async function(r,s){if((function(a){return lp(a)&&a!==S.ABORTED})(s.code)){const o=r.Ta.shift();ge(r).B_(),await al(r,(()=>r.remoteSyncer.rejectFailedWrite(o.batchId,s))),await as(r)}})(n,t),ul(n)&&cl(n)}async function mu(n,t){const e=B(n);e.asyncQueue.verifyOperationInProgress(),O(De,"RemoteStore received new credentials");const r=Me(e);e.Ea.add(3),await Qn(e),r&&e.Ra.set("Unknown"),await e.remoteSyncer.handleCredentialChange(t),e.Ea.delete(3),await os(e)}async function Vm(n,t){const e=B(n);t?(e.Ea.delete(2),await os(e)):t||(e.Ea.add(2),await Qn(e),e.Ra.set("Unknown"))}function an(n){return n.ma||(n.ma=(function(e,r,s){const o=B(e);return o.sa(),new pm(r,o.connection,o.authCredentials,o.appCheckCredentials,o.serializer,s)})(n.datastore,n.asyncQueue,{Xo:Tm.bind(null,n),t_:Im.bind(null,n),r_:wm.bind(null,n),H_:vm.bind(null,n)}),n.da.push((async t=>{t?(n.ma.B_(),zi(n)?$i(n):n.Ra.set("Unknown")):(await n.ma.stop(),ol(n))}))),n.ma}function ge(n){return n.fa||(n.fa=(function(e,r,s){const o=B(e);return o.sa(),new mm(r,o.connection,o.authCredentials,o.appCheckCredentials,o.serializer,s)})(n.datastore,n.asyncQueue,{Xo:()=>Promise.resolve(),t_:bm.bind(null,n),r_:Pm.bind(null,n),ta:Sm.bind(null,n),na:Cm.bind(null,n)}),n.da.push((async t=>{t?(n.fa.B_(),await as(n)):(await n.fa.stop(),n.Ta.length>0&&(O(De,`Stopping write stream with ${n.Ta.length} pending writes`),n.Ta=[]))}))),n.fa}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Hi{constructor(t,e,r,s,o){this.asyncQueue=t,this.timerId=e,this.targetTimeMs=r,this.op=s,this.removalCallback=o,this.deferred=new Xt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((a=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(t,e,r,s,o){const a=Date.now()+r,c=new Hi(t,e,a,s,o);return c.start(r),c}start(t){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),t)}skipDelay(){return this.handleDelayElapsed()}cancel(t){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new N(S.CANCELLED,"Operation cancelled"+(t?": "+t:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((t=>this.deferred.resolve(t)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Gi(n,t){if(Zt("AsyncQueue",`${t}: ${n}`),on(n))return new N(S.UNAVAILABLE,`${t}: ${n}`);throw n}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class We{static emptySet(t){return new We(t.comparator)}constructor(t){this.comparator=t?(e,r)=>t(e,r)||x.comparator(e.key,r.key):(e,r)=>x.comparator(e.key,r.key),this.keyedMap=Cn(),this.sortedSet=new et(this.comparator)}has(t){return this.keyedMap.get(t)!=null}get(t){return this.keyedMap.get(t)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(t){const e=this.keyedMap.get(t);return e?this.sortedSet.indexOf(e):-1}get size(){return this.sortedSet.size}forEach(t){this.sortedSet.inorderTraversal(((e,r)=>(t(e),!1)))}add(t){const e=this.delete(t.key);return e.copy(e.keyedMap.insert(t.key,t),e.sortedSet.insert(t,null))}delete(t){const e=this.get(t);return e?this.copy(this.keyedMap.remove(t),this.sortedSet.remove(e)):this}isEqual(t){if(!(t instanceof We)||this.size!==t.size)return!1;const e=this.sortedSet.getIterator(),r=t.sortedSet.getIterator();for(;e.hasNext();){const s=e.getNext().key,o=r.getNext().key;if(!s.isEqual(o))return!1}return!0}toString(){const t=[];return this.forEach((e=>{t.push(e.toString())})),t.length===0?"DocumentSet ()":`DocumentSet (
  `+t.join(`  
`)+`
)`}copy(t,e){const r=new We;return r.comparator=this.comparator,r.keyedMap=t,r.sortedSet=e,r}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class gu{constructor(){this.ga=new et(x.comparator)}track(t){const e=t.doc.key,r=this.ga.get(e);r?t.type!==0&&r.type===3?this.ga=this.ga.insert(e,t):t.type===3&&r.type!==1?this.ga=this.ga.insert(e,{type:r.type,doc:t.doc}):t.type===2&&r.type===2?this.ga=this.ga.insert(e,{type:2,doc:t.doc}):t.type===2&&r.type===0?this.ga=this.ga.insert(e,{type:0,doc:t.doc}):t.type===1&&r.type===0?this.ga=this.ga.remove(e):t.type===1&&r.type===2?this.ga=this.ga.insert(e,{type:1,doc:r.doc}):t.type===0&&r.type===1?this.ga=this.ga.insert(e,{type:2,doc:t.doc}):L(63341,{Rt:t,pa:r}):this.ga=this.ga.insert(e,t)}ya(){const t=[];return this.ga.inorderTraversal(((e,r)=>{t.push(r)})),t}}class nn{constructor(t,e,r,s,o,a,c,h,d){this.query=t,this.docs=e,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=o,this.fromCache=a,this.syncStateChanged=c,this.excludesMetadataChanges=h,this.hasCachedResults=d}static fromInitialDocuments(t,e,r,s,o){const a=[];return e.forEach((c=>{a.push({type:0,doc:c})})),new nn(t,e,We.emptySet(e),a,r,s,!0,!1,o)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(t){if(!(this.fromCache===t.fromCache&&this.hasCachedResults===t.hasCachedResults&&this.syncStateChanged===t.syncStateChanged&&this.mutatedKeys.isEqual(t.mutatedKeys)&&ts(this.query,t.query)&&this.docs.isEqual(t.docs)&&this.oldDocs.isEqual(t.oldDocs)))return!1;const e=this.docChanges,r=t.docChanges;if(e.length!==r.length)return!1;for(let s=0;s<e.length;s++)if(e[s].type!==r[s].type||!e[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Dm{constructor(){this.wa=void 0,this.Sa=[]}ba(){return this.Sa.some((t=>t.Da()))}}class Nm{constructor(){this.queries=_u(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(e,r){const s=B(e),o=s.queries;s.queries=_u(),o.forEach(((a,c)=>{for(const h of c.Sa)h.onError(r)}))})(this,new N(S.ABORTED,"Firestore shutting down"))}}function _u(){return new xe((n=>Vc(n)),ts)}async function Ki(n,t){const e=B(n);let r=3;const s=t.query;let o=e.queries.get(s);o?!o.ba()&&t.Da()&&(r=2):(o=new Dm,r=t.Da()?0:1);try{switch(r){case 0:o.wa=await e.onListen(s,!0);break;case 1:o.wa=await e.onListen(s,!1);break;case 2:await e.onFirstRemoteStoreListen(s)}}catch(a){const c=Gi(a,`Initialization of query '${ze(t.query)}' failed`);return void t.onError(c)}e.queries.set(s,o),o.Sa.push(t),t.va(e.onlineState),o.wa&&t.Fa(o.wa)&&Qi(e)}async function Wi(n,t){const e=B(n),r=t.query;let s=3;const o=e.queries.get(r);if(o){const a=o.Sa.indexOf(t);a>=0&&(o.Sa.splice(a,1),o.Sa.length===0?s=t.Da()?0:1:!o.ba()&&t.Da()&&(s=2))}switch(s){case 0:return e.queries.delete(r),e.onUnlisten(r,!0);case 1:return e.queries.delete(r),e.onUnlisten(r,!1);case 2:return e.onLastRemoteStoreUnlisten(r);default:return}}function km(n,t){const e=B(n);let r=!1;for(const s of t){const o=s.query,a=e.queries.get(o);if(a){for(const c of a.Sa)c.Fa(s)&&(r=!0);a.wa=s}}r&&Qi(e)}function Om(n,t,e){const r=B(n),s=r.queries.get(t);if(s)for(const o of s.Sa)o.onError(e);r.queries.delete(t)}function Qi(n){n.Ca.forEach((t=>{t.next()}))}var yi,yu;(yu=yi||(yi={})).Ma="default",yu.Cache="cache";class Xi{constructor(t,e,r){this.query=t,this.xa=e,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=r||{}}Fa(t){if(!this.options.includeMetadataChanges){const r=[];for(const s of t.docChanges)s.type!==3&&r.push(s);t=new nn(t.query,t.docs,t.oldDocs,r,t.mutatedKeys,t.fromCache,t.syncStateChanged,!0,t.hasCachedResults)}let e=!1;return this.Oa?this.Ba(t)&&(this.xa.next(t),e=!0):this.La(t,this.onlineState)&&(this.ka(t),e=!0),this.Na=t,e}onError(t){this.xa.error(t)}va(t){this.onlineState=t;let e=!1;return this.Na&&!this.Oa&&this.La(this.Na,t)&&(this.ka(this.Na),e=!0),e}La(t,e){if(!t.fromCache||!this.Da())return!0;const r=e!=="Offline";return(!this.options.qa||!r)&&(!t.docs.isEmpty()||t.hasCachedResults||e==="Offline")}Ba(t){if(t.docChanges.length>0)return!0;const e=this.Na&&this.Na.hasPendingWrites!==t.hasPendingWrites;return!(!t.syncStateChanged&&!e)&&this.options.includeMetadataChanges===!0}ka(t){t=nn.fromInitialDocuments(t.query,t.docs,t.mutatedKeys,t.fromCache,t.hasCachedResults),this.Oa=!0,this.xa.next(t)}Da(){return this.options.source!==yi.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class ll{constructor(t){this.key=t}}class hl{constructor(t){this.key=t}}class xm{constructor(t,e){this.query=t,this.Ya=e,this.Za=null,this.hasCachedResults=!1,this.current=!1,this.Xa=$(),this.mutatedKeys=$(),this.eu=Dc(t),this.tu=new We(this.eu)}get nu(){return this.Ya}ru(t,e){const r=e?e.iu:new gu,s=e?e.tu:this.tu;let o=e?e.mutatedKeys:this.mutatedKeys,a=s,c=!1;const h=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,d=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(t.inorderTraversal(((p,g)=>{const E=s.get(p),b=es(this.query,g)?g:null,P=!!E&&this.mutatedKeys.has(E.key),k=!!b&&(b.hasLocalMutations||this.mutatedKeys.has(b.key)&&b.hasCommittedMutations);let V=!1;E&&b?E.data.isEqual(b.data)?P!==k&&(r.track({type:3,doc:b}),V=!0):this.su(E,b)||(r.track({type:2,doc:b}),V=!0,(h&&this.eu(b,h)>0||d&&this.eu(b,d)<0)&&(c=!0)):!E&&b?(r.track({type:0,doc:b}),V=!0):E&&!b&&(r.track({type:1,doc:E}),V=!0,(h||d)&&(c=!0)),V&&(b?(a=a.add(b),o=k?o.add(p):o.delete(p)):(a=a.delete(p),o=o.delete(p)))})),this.query.limit!==null)for(;a.size>this.query.limit;){const p=this.query.limitType==="F"?a.last():a.first();a=a.delete(p.key),o=o.delete(p.key),r.track({type:1,doc:p})}return{tu:a,iu:r,Cs:c,mutatedKeys:o}}su(t,e){return t.hasLocalMutations&&e.hasCommittedMutations&&!e.hasLocalMutations}applyChanges(t,e,r,s){const o=this.tu;this.tu=t.tu,this.mutatedKeys=t.mutatedKeys;const a=t.iu.ya();a.sort(((p,g)=>(function(b,P){const k=V=>{switch(V){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return L(20277,{Rt:V})}};return k(b)-k(P)})(p.type,g.type)||this.eu(p.doc,g.doc))),this.ou(r),s=s??!1;const c=e&&!s?this._u():[],h=this.Xa.size===0&&this.current&&!s?1:0,d=h!==this.Za;return this.Za=h,a.length!==0||d?{snapshot:new nn(this.query,t.tu,o,a,t.mutatedKeys,h===0,d,!1,!!r&&r.resumeToken.approximateByteSize()>0),au:c}:{au:c}}va(t){return this.current&&t==="Offline"?(this.current=!1,this.applyChanges({tu:this.tu,iu:new gu,mutatedKeys:this.mutatedKeys,Cs:!1},!1)):{au:[]}}uu(t){return!this.Ya.has(t)&&!!this.tu.has(t)&&!this.tu.get(t).hasLocalMutations}ou(t){t&&(t.addedDocuments.forEach((e=>this.Ya=this.Ya.add(e))),t.modifiedDocuments.forEach((e=>{})),t.removedDocuments.forEach((e=>this.Ya=this.Ya.delete(e))),this.current=t.current)}_u(){if(!this.current)return[];const t=this.Xa;this.Xa=$(),this.tu.forEach((r=>{this.uu(r.key)&&(this.Xa=this.Xa.add(r.key))}));const e=[];return t.forEach((r=>{this.Xa.has(r)||e.push(new hl(r))})),this.Xa.forEach((r=>{t.has(r)||e.push(new ll(r))})),e}cu(t){this.Ya=t.Qs,this.Xa=$();const e=this.ru(t.documents);return this.applyChanges(e,!0)}lu(){return nn.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,this.Za===0,this.hasCachedResults)}}const Yi="SyncEngine";class Mm{constructor(t,e,r){this.query=t,this.targetId=e,this.view=r}}class Lm{constructor(t){this.key=t,this.hu=!1}}class Fm{constructor(t,e,r,s,o,a){this.localStore=t,this.remoteStore=e,this.eventManager=r,this.sharedClientState=s,this.currentUser=o,this.maxConcurrentLimboResolutions=a,this.Pu={},this.Tu=new xe((c=>Vc(c)),ts),this.Iu=new Map,this.Eu=new Set,this.du=new et(x.comparator),this.Au=new Map,this.Ru=new Li,this.Vu={},this.mu=new Map,this.fu=en.cr(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}}async function Um(n,t,e=!0){const r=_l(n);let s;const o=r.Tu.get(t);return o?(r.sharedClientState.addLocalQueryTarget(o.targetId),s=o.view.lu()):s=await dl(r,t,e,!0),s}async function Bm(n,t){const e=_l(n);await dl(e,t,!0,!1)}async function dl(n,t,e,r){const s=await om(n.localStore,Bt(t)),o=s.targetId,a=n.sharedClientState.addLocalQueryTarget(o,e);let c;return r&&(c=await qm(n,t,o,a==="current",s.resumeToken)),n.isPrimaryClient&&e&&sl(n.remoteStore,s),c}async function qm(n,t,e,r,s){n.pu=(g,E,b)=>(async function(k,V,q,F){let M=V.view.ru(q);M.Cs&&(M=await lu(k.localStore,V.query,!1).then((({documents:w})=>V.view.ru(w,M))));const z=F&&F.targetChanges.get(V.targetId),ht=F&&F.targetMismatches.get(V.targetId)!=null,tt=V.view.applyChanges(M,k.isPrimaryClient,z,ht);return Tu(k,V.targetId,tt.au),tt.snapshot})(n,g,E,b);const o=await lu(n.localStore,t,!0),a=new xm(t,o.Qs),c=a.ru(o.documents),h=Wn.createSynthesizedTargetChangeForCurrentChange(e,r&&n.onlineState!=="Offline",s),d=a.applyChanges(c,n.isPrimaryClient,h);Tu(n,e,d.au);const p=new Mm(t,e,a);return n.Tu.set(t,p),n.Iu.has(e)?n.Iu.get(e).push(t):n.Iu.set(e,[t]),d.snapshot}async function jm(n,t,e){const r=B(n),s=r.Tu.get(t),o=r.Iu.get(s.targetId);if(o.length>1)return r.Iu.set(s.targetId,o.filter((a=>!ts(a,t)))),void r.Tu.delete(t);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await gi(r.localStore,s.targetId,!1).then((()=>{r.sharedClientState.clearQueryState(s.targetId),e&&qi(r.remoteStore,s.targetId),Ei(r,s.targetId)})).catch(sn)):(Ei(r,s.targetId),await gi(r.localStore,s.targetId,!0))}async function $m(n,t){const e=B(n),r=e.Tu.get(t),s=e.Iu.get(r.targetId);e.isPrimaryClient&&s.length===1&&(e.sharedClientState.removeLocalQueryTarget(r.targetId),qi(e.remoteStore,r.targetId))}async function zm(n,t,e){const r=Ym(n);try{const s=await(function(a,c){const h=B(a),d=J.now(),p=c.reduce(((b,P)=>b.add(P.key)),$());let g,E;return h.persistence.runTransaction("Locally write mutations","readwrite",(b=>{let P=te(),k=$();return h.Ns.getEntries(b,p).next((V=>{P=V,P.forEach(((q,F)=>{F.isValidDocument()||(k=k.add(q))}))})).next((()=>h.localDocuments.getOverlayedDocuments(b,P))).next((V=>{g=V;const q=[];for(const F of c){const M=ip(F,g.get(F.key).overlayedDocument);M!=null&&q.push(new Te(F.key,M,vc(M.value.mapValue),Mt.exists(!0)))}return h.mutationQueue.addMutationBatch(b,d,q,c)})).next((V=>{E=V;const q=V.applyToLocalDocumentSet(g,k);return h.documentOverlayCache.saveOverlays(b,V.batchId,q)}))})).then((()=>({batchId:E.batchId,changes:kc(g)})))})(r.localStore,t);r.sharedClientState.addPendingMutation(s.batchId),(function(a,c,h){let d=a.Vu[a.currentUser.toKey()];d||(d=new et(j)),d=d.insert(c,h),a.Vu[a.currentUser.toKey()]=d})(r,s.batchId,e),await Xn(r,s.changes),await as(r.remoteStore)}catch(s){const o=Gi(s,"Failed to persist write");e.reject(o)}}async function fl(n,t){const e=B(n);try{const r=await rm(e.localStore,t);t.targetChanges.forEach(((s,o)=>{const a=e.Au.get(o);a&&(W(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?a.hu=!0:s.modifiedDocuments.size>0?W(a.hu,14607):s.removedDocuments.size>0&&(W(a.hu,42227),a.hu=!1))})),await Xn(e,r,t)}catch(r){await sn(r)}}function Eu(n,t,e){const r=B(n);if(r.isPrimaryClient&&e===0||!r.isPrimaryClient&&e===1){const s=[];r.Tu.forEach(((o,a)=>{const c=a.view.va(t);c.snapshot&&s.push(c.snapshot)})),(function(a,c){const h=B(a);h.onlineState=c;let d=!1;h.queries.forEach(((p,g)=>{for(const E of g.Sa)E.va(c)&&(d=!0)})),d&&Qi(h)})(r.eventManager,t),s.length&&r.Pu.H_(s),r.onlineState=t,r.isPrimaryClient&&r.sharedClientState.setOnlineState(t)}}async function Hm(n,t,e){const r=B(n);r.sharedClientState.updateQueryState(t,"rejected",e);const s=r.Au.get(t),o=s&&s.key;if(o){let a=new et(x.comparator);a=a.insert(o,vt.newNoDocument(o,U.min()));const c=$().add(o),h=new ss(U.min(),new Map,new et(j),a,c);await fl(r,h),r.du=r.du.remove(o),r.Au.delete(t),Ji(r)}else await gi(r.localStore,t,!1).then((()=>Ei(r,t,e))).catch(sn)}async function Gm(n,t){const e=B(n),r=t.batch.batchId;try{const s=await nm(e.localStore,t);ml(e,r,null),pl(e,r),e.sharedClientState.updateMutationState(r,"acknowledged"),await Xn(e,s)}catch(s){await sn(s)}}async function Km(n,t,e){const r=B(n);try{const s=await(function(a,c){const h=B(a);return h.persistence.runTransaction("Reject batch","readwrite-primary",(d=>{let p;return h.mutationQueue.lookupMutationBatch(d,c).next((g=>(W(g!==null,37113),p=g.keys(),h.mutationQueue.removeMutationBatch(d,g)))).next((()=>h.mutationQueue.performConsistencyCheck(d))).next((()=>h.documentOverlayCache.removeOverlaysForBatchId(d,p,c))).next((()=>h.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(d,p))).next((()=>h.localDocuments.getDocuments(d,p)))}))})(r.localStore,t);ml(r,t,e),pl(r,t),r.sharedClientState.updateMutationState(t,"rejected",e),await Xn(r,s)}catch(s){await sn(s)}}function pl(n,t){(n.mu.get(t)||[]).forEach((e=>{e.resolve()})),n.mu.delete(t)}function ml(n,t,e){const r=B(n);let s=r.Vu[r.currentUser.toKey()];if(s){const o=s.get(t);o&&(e?o.reject(e):o.resolve(),s=s.remove(t)),r.Vu[r.currentUser.toKey()]=s}}function Ei(n,t,e=null){n.sharedClientState.removeLocalQueryTarget(t);for(const r of n.Iu.get(t))n.Tu.delete(r),e&&n.Pu.yu(r,e);n.Iu.delete(t),n.isPrimaryClient&&n.Ru.jr(t).forEach((r=>{n.Ru.containsKey(r)||gl(n,r)}))}function gl(n,t){n.Eu.delete(t.path.canonicalString());const e=n.du.get(t);e!==null&&(qi(n.remoteStore,e),n.du=n.du.remove(t),n.Au.delete(e),Ji(n))}function Tu(n,t,e){for(const r of e)r instanceof ll?(n.Ru.addReference(r.key,t),Wm(n,r)):r instanceof hl?(O(Yi,"Document no longer in limbo: "+r.key),n.Ru.removeReference(r.key,t),n.Ru.containsKey(r.key)||gl(n,r.key)):L(19791,{wu:r})}function Wm(n,t){const e=t.key,r=e.path.canonicalString();n.du.get(e)||n.Eu.has(r)||(O(Yi,"New document in limbo: "+e),n.Eu.add(r),Ji(n))}function Ji(n){for(;n.Eu.size>0&&n.du.size<n.maxConcurrentLimboResolutions;){const t=n.Eu.values().next().value;n.Eu.delete(t);const e=new x(X.fromString(t)),r=n.fu.next();n.Au.set(r,new Lm(e)),n.du=n.du.insert(e,r),sl(n.remoteStore,new oe(Bt(Zr(e.path)),r,"TargetPurposeLimboResolution",Qr.ce))}}async function Xn(n,t,e){const r=B(n),s=[],o=[],a=[];r.Tu.isEmpty()||(r.Tu.forEach(((c,h)=>{a.push(r.pu(h,t,e).then((d=>{if((d||e)&&r.isPrimaryClient){const p=d?!d.fromCache:e?.targetChanges.get(h.targetId)?.current;r.sharedClientState.updateQueryState(h.targetId,p?"current":"not-current")}if(d){s.push(d);const p=Ui.As(h.targetId,d);o.push(p)}})))})),await Promise.all(a),r.Pu.H_(s),await(async function(h,d){const p=B(h);try{await p.persistence.runTransaction("notifyLocalViewChanges","readwrite",(g=>C.forEach(d,(E=>C.forEach(E.Es,(b=>p.persistence.referenceDelegate.addReference(g,E.targetId,b))).next((()=>C.forEach(E.ds,(b=>p.persistence.referenceDelegate.removeReference(g,E.targetId,b)))))))))}catch(g){if(!on(g))throw g;O(Bi,"Failed to update sequence numbers: "+g)}for(const g of d){const E=g.targetId;if(!g.fromCache){const b=p.Ms.get(E),P=b.snapshotVersion,k=b.withLastLimboFreeSnapshotVersion(P);p.Ms=p.Ms.insert(E,k)}}})(r.localStore,o))}async function Qm(n,t){const e=B(n);if(!e.currentUser.isEqual(t)){O(Yi,"User change. New user:",t.toKey());const r=await tl(e.localStore,t);e.currentUser=t,(function(o,a){o.mu.forEach((c=>{c.forEach((h=>{h.reject(new N(S.CANCELLED,a))}))})),o.mu.clear()})(e,"'waitForPendingWrites' promise is rejected due to a user change."),e.sharedClientState.handleUserChange(t,r.removedBatchIds,r.addedBatchIds),await Xn(e,r.Ls)}}function Xm(n,t){const e=B(n),r=e.Au.get(t);if(r&&r.hu)return $().add(r.key);{let s=$();const o=e.Iu.get(t);if(!o)return s;for(const a of o){const c=e.Tu.get(a);s=s.unionWith(c.view.nu)}return s}}function _l(n){const t=B(n);return t.remoteStore.remoteSyncer.applyRemoteEvent=fl.bind(null,t),t.remoteStore.remoteSyncer.getRemoteKeysForTarget=Xm.bind(null,t),t.remoteStore.remoteSyncer.rejectListen=Hm.bind(null,t),t.Pu.H_=km.bind(null,t.eventManager),t.Pu.yu=Om.bind(null,t.eventManager),t}function Ym(n){const t=B(n);return t.remoteStore.remoteSyncer.applySuccessfulWrite=Gm.bind(null,t),t.remoteStore.remoteSyncer.rejectFailedWrite=Km.bind(null,t),t}class zr{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(t){this.serializer=is(t.databaseInfo.databaseId),this.sharedClientState=this.Du(t),this.persistence=this.Cu(t),await this.persistence.start(),this.localStore=this.vu(t),this.gcScheduler=this.Fu(t,this.localStore),this.indexBackfillerScheduler=this.Mu(t,this.localStore)}Fu(t,e){return null}Mu(t,e){return null}vu(t){return em(this.persistence,new Jp,t.initialUser,this.serializer)}Cu(t){return new Zc(Fi.mi,this.serializer)}Du(t){return new um}async terminate(){this.gcScheduler?.stop(),this.indexBackfillerScheduler?.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}zr.provider={build:()=>new zr};class Jm extends zr{constructor(t){super(),this.cacheSizeBytes=t}Fu(t,e){W(this.persistence.referenceDelegate instanceof jr,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new Lp(r,t.asyncQueue,e)}Cu(t){const e=this.cacheSizeBytes!==void 0?St.withCacheSize(this.cacheSizeBytes):St.DEFAULT;return new Zc((r=>jr.mi(r,e)),this.serializer)}}class Ti{async initialize(t,e){this.localStore||(this.localStore=t.localStore,this.sharedClientState=t.sharedClientState,this.datastore=this.createDatastore(e),this.remoteStore=this.createRemoteStore(e),this.eventManager=this.createEventManager(e),this.syncEngine=this.createSyncEngine(e,!t.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Eu(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=Qm.bind(null,this.syncEngine),await Vm(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(t){return(function(){return new Nm})()}createDatastore(t){const e=is(t.databaseInfo.databaseId),r=(function(o){return new fm(o)})(t.databaseInfo);return(function(o,a,c,h){return new _m(o,a,c,h)})(t.authCredentials,t.appCheckCredentials,r,e)}createRemoteStore(t){return(function(r,s,o,a,c){return new Em(r,s,o,a,c)})(this.localStore,this.datastore,t.asyncQueue,(e=>Eu(this.syncEngine,e,0)),(function(){return fu.v()?new fu:new cm})())}createSyncEngine(t,e){return(function(s,o,a,c,h,d,p){const g=new Fm(s,o,a,c,h,d);return p&&(g.gu=!0),g})(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,t.initialUser,t.maxConcurrentLimboResolutions,e)}async terminate(){await(async function(e){const r=B(e);O(De,"RemoteStore shutting down."),r.Ea.add(5),await Qn(r),r.Aa.shutdown(),r.Ra.set("Unknown")})(this.remoteStore),this.datastore?.terminate(),this.eventManager?.terminate()}}Ti.provider={build:()=>new Ti};/**
 * @license
 * Copyright 2020 Google LLC
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
 *//**
 * @license
 * Copyright 2017 Google LLC
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
 */class Zi{constructor(t){this.observer=t,this.muted=!1}next(t){this.muted||this.observer.next&&this.Ou(this.observer.next,t)}error(t){this.muted||(this.observer.error?this.Ou(this.observer.error,t):Zt("Uncaught Error in snapshot listener:",t.toString()))}Nu(){this.muted=!0}Ou(t,e){setTimeout((()=>{this.muted||t(e)}),0)}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */const _e="FirestoreClient";class Zm{constructor(t,e,r,s,o){this.authCredentials=t,this.appCheckCredentials=e,this.asyncQueue=r,this.databaseInfo=s,this.user=wt.UNAUTHENTICATED,this.clientId=bi.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=o,this.authCredentials.start(r,(async a=>{O(_e,"Received user=",a.uid),await this.authCredentialListener(a),this.user=a})),this.appCheckCredentials.start(r,(a=>(O(_e,"Received new app check token=",a),this.appCheckCredentialListener(a,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(t){this.authCredentialListener=t}setAppCheckTokenChangeListener(t){this.appCheckCredentialListener=t}terminate(){this.asyncQueue.enterRestrictedMode();const t=new Xt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),t.resolve()}catch(e){const r=Gi(e,"Failed to shutdown persistence");t.reject(r)}})),t.promise}}async function Qs(n,t){n.asyncQueue.verifyOperationInProgress(),O(_e,"Initializing OfflineComponentProvider");const e=n.configuration;await t.initialize(e);let r=e.initialUser;n.setCredentialChangeListener((async s=>{r.isEqual(s)||(await tl(t.localStore,s),r=s)})),t.persistence.setDatabaseDeletedListener((()=>n.terminate())),n._offlineComponents=t}async function Iu(n,t){n.asyncQueue.verifyOperationInProgress();const e=await tg(n);O(_e,"Initializing OnlineComponentProvider"),await t.initialize(e,n.configuration),n.setCredentialChangeListener((r=>mu(t.remoteStore,r))),n.setAppCheckTokenChangeListener(((r,s)=>mu(t.remoteStore,s))),n._onlineComponents=t}async function tg(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){O(_e,"Using user provided OfflineComponentProvider");try{await Qs(n,n._uninitializedComponentsProvider._offline)}catch(t){const e=t;if(!(function(s){return s.name==="FirebaseError"?s.code===S.FAILED_PRECONDITION||s.code===S.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11})(e))throw e;Xe("Error using user provided cache. Falling back to memory cache: "+e),await Qs(n,new zr)}}else O(_e,"Using default OfflineComponentProvider"),await Qs(n,new Jm(void 0));return n._offlineComponents}async function yl(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(O(_e,"Using user provided OnlineComponentProvider"),await Iu(n,n._uninitializedComponentsProvider._online)):(O(_e,"Using default OnlineComponentProvider"),await Iu(n,new Ti))),n._onlineComponents}function eg(n){return yl(n).then((t=>t.syncEngine))}async function Hr(n){const t=await yl(n),e=t.eventManager;return e.onListen=Um.bind(null,t.syncEngine),e.onUnlisten=jm.bind(null,t.syncEngine),e.onFirstRemoteStoreListen=Bm.bind(null,t.syncEngine),e.onLastRemoteStoreUnlisten=$m.bind(null,t.syncEngine),e}function ng(n,t,e={}){const r=new Xt;return n.asyncQueue.enqueueAndForget((async()=>(function(o,a,c,h,d){const p=new Zi({next:E=>{p.Nu(),a.enqueueAndForget((()=>Wi(o,g)));const b=E.docs.has(c);!b&&E.fromCache?d.reject(new N(S.UNAVAILABLE,"Failed to get document because the client is offline.")):b&&E.fromCache&&h&&h.source==="server"?d.reject(new N(S.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):d.resolve(E)},error:E=>d.reject(E)}),g=new Xi(Zr(c.path),p,{includeMetadataChanges:!0,qa:!0});return Ki(o,g)})(await Hr(n),n.asyncQueue,t,e,r))),r.promise}function rg(n,t,e={}){const r=new Xt;return n.asyncQueue.enqueueAndForget((async()=>(function(o,a,c,h,d){const p=new Zi({next:E=>{p.Nu(),a.enqueueAndForget((()=>Wi(o,g))),E.fromCache&&h.source==="server"?d.reject(new N(S.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):d.resolve(E)},error:E=>d.reject(E)}),g=new Xi(c,p,{includeMetadataChanges:!0,qa:!0});return Ki(o,g)})(await Hr(n),n.asyncQueue,t,e,r))),r.promise}/**
 * @license
 * Copyright 2023 Google LLC
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
 */function El(n){const t={};return n.timeoutSeconds!==void 0&&(t.timeoutSeconds=n.timeoutSeconds),t}/**
 * @license
 * Copyright 2020 Google LLC
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
 */const wu=new Map;/**
 * @license
 * Copyright 2020 Google LLC
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
 */const Tl="firestore.googleapis.com",vu=!0;class Au{constructor(t){if(t.host===void 0){if(t.ssl!==void 0)throw new N(S.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=Tl,this.ssl=vu}else this.host=t.host,this.ssl=t.ssl??vu;if(this.isUsingEmulator=t.emulatorOptions!==void 0,this.credentials=t.credentials,this.ignoreUndefinedProperties=!!t.ignoreUndefinedProperties,this.localCache=t.localCache,t.cacheSizeBytes===void 0)this.cacheSizeBytes=Jc;else{if(t.cacheSizeBytes!==-1&&t.cacheSizeBytes<xp)throw new N(S.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=t.cacheSizeBytes}yf("experimentalForceLongPolling",t.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",t.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!t.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:t.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!t.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=El(t.experimentalLongPollingOptions??{}),(function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new N(S.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new N(S.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new N(S.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!t.useFetchStreams}isEqual(t){return this.host===t.host&&this.ssl===t.ssl&&this.credentials===t.credentials&&this.cacheSizeBytes===t.cacheSizeBytes&&this.experimentalForceLongPolling===t.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===t.experimentalAutoDetectLongPolling&&(function(r,s){return r.timeoutSeconds===s.timeoutSeconds})(this.experimentalLongPollingOptions,t.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===t.ignoreUndefinedProperties&&this.useFetchStreams===t.useFetchStreams}}class us{constructor(t,e,r,s){this._authCredentials=t,this._appCheckCredentials=e,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Au({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new N(S.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(t){if(this._settingsFrozen)throw new N(S.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Au(t),this._emulatorOptions=t.emulatorOptions||{},t.credentials!==void 0&&(this._authCredentials=(function(r){if(!r)return new uf;switch(r.type){case"firstParty":return new df(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new N(S.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(t.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(e){const r=wu.get(e);r&&(O("ComponentProvider","Removing Datastore"),wu.delete(e),r.terminate())})(this),Promise.resolve()}}function sg(n,t,e,r={}){n=Ot(n,us);const s=Hn(t),o=n._getSettings(),a={...o,emulatorOptions:n._getEmulatorOptions()},c=`${t}:${e}`;s&&($u(`https://${c}`),Hu("Firestore",!0)),o.host!==Tl&&o.host!==c&&Xe("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const h={...o,host:c,ssl:s,emulatorOptions:r};if(!Nr(h,a)&&(n._setSettings(h),r.mockUserToken)){let d,p;if(typeof r.mockUserToken=="string")d=r.mockUserToken,p=wt.MOCK_USER;else{d=zu(r.mockUserToken,n._app?.options.projectId);const g=r.mockUserToken.sub||r.mockUserToken.user_id;if(!g)throw new N(S.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");p=new wt(g)}n._authCredentials=new cf(new hc(d,p))}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */class Ht{constructor(t,e,r){this.converter=e,this._query=r,this.type="query",this.firestore=t}withConverter(t){return new Ht(this.firestore,t,this._query)}}class it{constructor(t,e,r){this.converter=e,this._key=r,this.type="document",this.firestore=t}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new he(this.firestore,this.converter,this._key.path.popLast())}withConverter(t){return new it(this.firestore,t,this._key)}toJSON(){return{type:it._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(t,e,r){if(Gn(e,it._jsonSchema))return new it(t,r||null,new x(X.fromString(e.referencePath)))}}it._jsonSchemaVersion="firestore/documentReference/1.0",it._jsonSchema={type:ut("string",it._jsonSchemaVersion),referencePath:ut("string")};class he extends Ht{constructor(t,e,r){super(t,e,Zr(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const t=this._path.popLast();return t.isEmpty()?null:new it(this.firestore,null,new x(t))}withConverter(t){return new he(this.firestore,t,this._path)}}function Y_(n,t,...e){if(n=mt(n),dc("collection","path",t),n instanceof us){const r=X.fromString(t,...e);return Fa(r),new he(n,null,r)}{if(!(n instanceof it||n instanceof he))throw new N(S.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(X.fromString(t,...e));return Fa(r),new he(n.firestore,null,r)}}function ig(n,t,...e){if(n=mt(n),arguments.length===1&&(t=bi.newId()),dc("doc","path",t),n instanceof us){const r=X.fromString(t,...e);return La(r),new it(n,null,new x(r))}{if(!(n instanceof it||n instanceof he))throw new N(S.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(X.fromString(t,...e));return La(r),new it(n.firestore,n instanceof he?n.converter:null,new x(r))}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */const Ru="AsyncQueue";class bu{constructor(t=Promise.resolve()){this.Xu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new nl(this,"async_queue_retry"),this._c=()=>{const r=Ws();r&&O(Ru,"Visibility state changed to "+r.visibilityState),this.M_.w_()},this.ac=t;const e=Ws();e&&typeof e.addEventListener=="function"&&e.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(t){this.enqueue(t)}enqueueAndForgetEvenWhileRestricted(t){this.uc(),this.cc(t)}enterRestrictedMode(t){if(!this.ec){this.ec=!0,this.sc=t||!1;const e=Ws();e&&typeof e.removeEventListener=="function"&&e.removeEventListener("visibilitychange",this._c)}}enqueue(t){if(this.uc(),this.ec)return new Promise((()=>{}));const e=new Xt;return this.cc((()=>this.ec&&this.sc?Promise.resolve():(t().then(e.resolve,e.reject),e.promise))).then((()=>e.promise))}enqueueRetryable(t){this.enqueueAndForget((()=>(this.Xu.push(t),this.lc())))}async lc(){if(this.Xu.length!==0){try{await this.Xu[0](),this.Xu.shift(),this.M_.reset()}catch(t){if(!on(t))throw t;O(Ru,"Operation failed with retryable error: "+t)}this.Xu.length>0&&this.M_.p_((()=>this.lc()))}}cc(t){const e=this.ac.then((()=>(this.rc=!0,t().catch((r=>{throw this.nc=r,this.rc=!1,Zt("INTERNAL UNHANDLED ERROR: ",Su(r)),r})).then((r=>(this.rc=!1,r))))));return this.ac=e,e}enqueueAfterDelay(t,e,r){this.uc(),this.oc.indexOf(t)>-1&&(e=0);const s=Hi.createAndSchedule(this,t,e,r,(o=>this.hc(o)));return this.tc.push(s),s}uc(){this.nc&&L(47125,{Pc:Su(this.nc)})}verifyOperationInProgress(){}async Tc(){let t;do t=this.ac,await t;while(t!==this.ac)}Ic(t){for(const e of this.tc)if(e.timerId===t)return!0;return!1}Ec(t){return this.Tc().then((()=>{this.tc.sort(((e,r)=>e.targetTimeMs-r.targetTimeMs));for(const e of this.tc)if(e.skipDelay(),t!=="all"&&e.timerId===t)break;return this.Tc()}))}dc(t){this.oc.push(t)}hc(t){const e=this.tc.indexOf(t);this.tc.splice(e,1)}}function Su(n){let t=n.message||"";return n.stack&&(t=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),t}/**
 * @license
 * Copyright 2017 Google LLC
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
 */function Cu(n){return(function(e,r){if(typeof e!="object"||e===null)return!1;const s=e;for(const o of r)if(o in s&&typeof s[o]=="function")return!0;return!1})(n,["next","error","complete"])}class ye extends us{constructor(t,e,r,s){super(t,e,r,s),this.type="firestore",this._queue=new bu,this._persistenceKey=s?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const t=this._firestoreClient.terminate();this._queue=new bu(t),this._firestoreClient=void 0,await t}}}function J_(n,t){const e=typeof n=="object"?n:ec(),r=typeof n=="string"?n:xr,s=Ju(e,"firestore").getImmediate({identifier:r});if(!s._initialized){const o=qu("firestore");o&&sg(s,...o)}return s}function cs(n){if(n._terminated)throw new N(S.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||og(n),n._firestoreClient}function og(n){const t=n._freezeSettings(),e=(function(s,o,a,c){return new Vf(s,o,a,c.host,c.ssl,c.experimentalForceLongPolling,c.experimentalAutoDetectLongPolling,El(c.experimentalLongPollingOptions),c.useFetchStreams,c.isUsingEmulator)})(n._databaseId,n._app?.options.appId||"",n._persistenceKey,t);n._componentsProvider||t.localCache?._offlineComponentProvider&&t.localCache?._onlineComponentProvider&&(n._componentsProvider={_offline:t.localCache._offlineComponentProvider,_online:t.localCache._onlineComponentProvider}),n._firestoreClient=new Zm(n._authCredentials,n._appCheckCredentials,n._queue,e,n._componentsProvider&&(function(s){const o=s?._online.build();return{_offline:s?._offline.build(o),_online:o}})(n._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
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
 */class kt{constructor(t){this._byteString=t}static fromBase64String(t){try{return new kt(gt.fromBase64String(t))}catch(e){throw new N(S.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+e)}}static fromUint8Array(t){return new kt(gt.fromUint8Array(t))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(t){return this._byteString.isEqual(t._byteString)}toJSON(){return{type:kt._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(t){if(Gn(t,kt._jsonSchema))return kt.fromBase64String(t.bytes)}}kt._jsonSchemaVersion="firestore/bytes/1.0",kt._jsonSchema={type:ut("string",kt._jsonSchemaVersion),bytes:ut("string")};/**
 * @license
 * Copyright 2020 Google LLC
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
 */class ls{constructor(...t){for(let e=0;e<t.length;++e)if(t[e].length===0)throw new N(S.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new pt(t)}isEqual(t){return this._internalPath.isEqual(t._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */class to{constructor(t){this._methodName=t}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class jt{constructor(t,e){if(!isFinite(t)||t<-90||t>90)throw new N(S.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+t);if(!isFinite(e)||e<-180||e>180)throw new N(S.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+e);this._lat=t,this._long=e}get latitude(){return this._lat}get longitude(){return this._long}isEqual(t){return this._lat===t._lat&&this._long===t._long}_compareTo(t){return j(this._lat,t._lat)||j(this._long,t._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:jt._jsonSchemaVersion}}static fromJSON(t){if(Gn(t,jt._jsonSchema))return new jt(t.latitude,t.longitude)}}jt._jsonSchemaVersion="firestore/geoPoint/1.0",jt._jsonSchema={type:ut("string",jt._jsonSchemaVersion),latitude:ut("number"),longitude:ut("number")};/**
 * @license
 * Copyright 2024 Google LLC
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
 */class $t{constructor(t){this._values=(t||[]).map((e=>e))}toArray(){return this._values.map((t=>t))}isEqual(t){return(function(r,s){if(r.length!==s.length)return!1;for(let o=0;o<r.length;++o)if(r[o]!==s[o])return!1;return!0})(this._values,t._values)}toJSON(){return{type:$t._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(t){if(Gn(t,$t._jsonSchema)){if(Array.isArray(t.vectorValues)&&t.vectorValues.every((e=>typeof e=="number")))return new $t(t.vectorValues);throw new N(S.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}$t._jsonSchemaVersion="firestore/vectorValue/1.0",$t._jsonSchema={type:ut("string",$t._jsonSchemaVersion),vectorValues:ut("object")};/**
 * @license
 * Copyright 2017 Google LLC
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
 */const ag=/^__.*__$/;class ug{constructor(t,e,r){this.data=t,this.fieldMask=e,this.fieldTransforms=r}toMutation(t,e){return this.fieldMask!==null?new Te(t,this.data,this.fieldMask,e,this.fieldTransforms):new Kn(t,this.data,e,this.fieldTransforms)}}class Il{constructor(t,e,r){this.data=t,this.fieldMask=e,this.fieldTransforms=r}toMutation(t,e){return new Te(t,this.data,this.fieldMask,e,this.fieldTransforms)}}function wl(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw L(40011,{Ac:n})}}class eo{constructor(t,e,r,s,o,a){this.settings=t,this.databaseId=e,this.serializer=r,this.ignoreUndefinedProperties=s,o===void 0&&this.Rc(),this.fieldTransforms=o||[],this.fieldMask=a||[]}get path(){return this.settings.path}get Ac(){return this.settings.Ac}Vc(t){return new eo({...this.settings,...t},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}mc(t){const e=this.path?.child(t),r=this.Vc({path:e,fc:!1});return r.gc(t),r}yc(t){const e=this.path?.child(t),r=this.Vc({path:e,fc:!1});return r.Rc(),r}wc(t){return this.Vc({path:void 0,fc:!0})}Sc(t){return Gr(t,this.settings.methodName,this.settings.bc||!1,this.path,this.settings.Dc)}contains(t){return this.fieldMask.find((e=>t.isPrefixOf(e)))!==void 0||this.fieldTransforms.find((e=>t.isPrefixOf(e.field)))!==void 0}Rc(){if(this.path)for(let t=0;t<this.path.length;t++)this.gc(this.path.get(t))}gc(t){if(t.length===0)throw this.Sc("Document fields must not be empty");if(wl(this.Ac)&&ag.test(t))throw this.Sc('Document fields cannot begin and end with "__"')}}class cg{constructor(t,e,r){this.databaseId=t,this.ignoreUndefinedProperties=e,this.serializer=r||is(t)}Cc(t,e,r,s=!1){return new eo({Ac:t,methodName:e,Dc:r,path:pt.emptyPath(),fc:!1,bc:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function hs(n){const t=n._freezeSettings(),e=is(n._databaseId);return new cg(n._databaseId,!!t.ignoreUndefinedProperties,e)}function lg(n,t,e,r,s,o={}){const a=n.Cc(o.merge||o.mergeFields?2:0,t,e,s);no("Data must be an object, but it was:",a,r);const c=Al(r,a);let h,d;if(o.merge)h=new Dt(a.fieldMask),d=a.fieldTransforms;else if(o.mergeFields){const p=[];for(const g of o.mergeFields){const E=Ii(t,g,e);if(!a.contains(E))throw new N(S.INVALID_ARGUMENT,`Field '${E}' is specified in your field mask but missing from your input data.`);bl(p,E)||p.push(E)}h=new Dt(p),d=a.fieldTransforms.filter((g=>h.covers(g.field)))}else h=null,d=a.fieldTransforms;return new ug(new Pt(c),h,d)}class ds extends to{_toFieldTransform(t){if(t.Ac!==2)throw t.Ac===1?t.Sc(`${this._methodName}() can only appear at the top level of your update data`):t.Sc(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return t.fieldMask.push(t.path),null}isEqual(t){return t instanceof ds}}function hg(n,t,e,r){const s=n.Cc(1,t,e);no("Data must be an object, but it was:",s,r);const o=[],a=Pt.empty();Ee(r,((h,d)=>{const p=ro(t,h,e);d=mt(d);const g=s.yc(p);if(d instanceof ds)o.push(p);else{const E=Yn(d,g);E!=null&&(o.push(p),a.set(p,E))}}));const c=new Dt(o);return new Il(a,c,s.fieldTransforms)}function dg(n,t,e,r,s,o){const a=n.Cc(1,t,e),c=[Ii(t,r,e)],h=[s];if(o.length%2!=0)throw new N(S.INVALID_ARGUMENT,`Function ${t}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let E=0;E<o.length;E+=2)c.push(Ii(t,o[E])),h.push(o[E+1]);const d=[],p=Pt.empty();for(let E=c.length-1;E>=0;--E)if(!bl(d,c[E])){const b=c[E];let P=h[E];P=mt(P);const k=a.yc(b);if(P instanceof ds)d.push(b);else{const V=Yn(P,k);V!=null&&(d.push(b),p.set(b,V))}}const g=new Dt(d);return new Il(p,g,a.fieldTransforms)}function vl(n,t,e,r=!1){return Yn(e,n.Cc(r?4:3,t))}function Yn(n,t){if(Rl(n=mt(n)))return no("Unsupported field value:",t,n),Al(n,t);if(n instanceof to)return(function(r,s){if(!wl(s.Ac))throw s.Sc(`${r._methodName}() can only be used with update() and set()`);if(!s.path)throw s.Sc(`${r._methodName}() is not currently supported inside arrays`);const o=r._toFieldTransform(s);o&&s.fieldTransforms.push(o)})(n,t),null;if(n===void 0&&t.ignoreUndefinedProperties)return null;if(t.path&&t.fieldMask.push(t.path),n instanceof Array){if(t.settings.fc&&t.Ac!==4)throw t.Sc("Nested arrays are not supported");return(function(r,s){const o=[];let a=0;for(const c of r){let h=Yn(c,s.wc(a));h==null&&(h={nullValue:"NULL_VALUE"}),o.push(h),a++}return{arrayValue:{values:o}}})(n,t)}return(function(r,s){if((r=mt(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return Zf(s.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const o=J.fromDate(r);return{timestampValue:qr(s.serializer,o)}}if(r instanceof J){const o=new J(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:qr(s.serializer,o)}}if(r instanceof jt)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof kt)return{bytesValue:Hc(s.serializer,r._byteString)};if(r instanceof it){const o=s.databaseId,a=r.firestore._databaseId;if(!a.isEqual(o))throw s.Sc(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${o.projectId}/${o.database}`);return{referenceValue:Mi(r.firestore._databaseId||s.databaseId,r._key.path)}}if(r instanceof $t)return(function(a,c){return{mapValue:{fields:{[Ic]:{stringValue:wc},[Mr]:{arrayValue:{values:a.toArray().map((d=>{if(typeof d!="number")throw c.Sc("VectorValues must only contain numeric values.");return Ni(c.serializer,d)}))}}}}}})(r,s);throw s.Sc(`Unsupported field value: ${Wr(r)}`)})(n,t)}function Al(n,t){const e={};return mc(n)?t.path&&t.path.length>0&&t.fieldMask.push(t.path):Ee(n,((r,s)=>{const o=Yn(s,t.mc(r));o!=null&&(e[r]=o)})),{mapValue:{fields:e}}}function Rl(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof J||n instanceof jt||n instanceof kt||n instanceof it||n instanceof to||n instanceof $t)}function no(n,t,e){if(!Rl(e)||!fc(e)){const r=Wr(e);throw r==="an object"?t.Sc(n+" a custom object"):t.Sc(n+" "+r)}}function Ii(n,t,e){if((t=mt(t))instanceof ls)return t._internalPath;if(typeof t=="string")return ro(n,t);throw Gr("Field path arguments must be of type string or ",n,!1,void 0,e)}const fg=new RegExp("[~\\*/\\[\\]]");function ro(n,t,e){if(t.search(fg)>=0)throw Gr(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,e);try{return new ls(...t.split("."))._internalPath}catch{throw Gr(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,e)}}function Gr(n,t,e,r,s){const o=r&&!r.isEmpty(),a=s!==void 0;let c=`Function ${t}() called with invalid data`;e&&(c+=" (via `toFirestore()`)"),c+=". ";let h="";return(o||a)&&(h+=" (found",o&&(h+=` in field ${r}`),a&&(h+=` in document ${s}`),h+=")"),new N(S.INVALID_ARGUMENT,c+n+h)}function bl(n,t){return n.some((e=>e.isEqual(t)))}/**
 * @license
 * Copyright 2020 Google LLC
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
 */class so{constructor(t,e,r,s,o){this._firestore=t,this._userDataWriter=e,this._key=r,this._document=s,this._converter=o}get id(){return this._key.path.lastSegment()}get ref(){return new it(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const t=new pg(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(t)}return this._userDataWriter.convertValue(this._document.data.value)}}get(t){if(this._document){const e=this._document.data.field(fs("DocumentSnapshot.get",t));if(e!==null)return this._userDataWriter.convertValue(e)}}}class pg extends so{data(){return super.data()}}function fs(n,t){return typeof t=="string"?ro(n,t):t instanceof ls?t._internalPath:t._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
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
 */function Sl(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new N(S.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class io{}class ps extends io{}function Z_(n,t,...e){let r=[];t instanceof io&&r.push(t),r=r.concat(e),(function(o){const a=o.filter((h=>h instanceof oo)).length,c=o.filter((h=>h instanceof ms)).length;if(a>1||a>0&&c>0)throw new N(S.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")})(r);for(const s of r)n=s._apply(n);return n}class ms extends ps{constructor(t,e,r){super(),this._field=t,this._op=e,this._value=r,this.type="where"}static _create(t,e,r){return new ms(t,e,r)}_apply(t){const e=this._parse(t);return Cl(t._query,e),new Ht(t.firestore,t.converter,hi(t._query,e))}_parse(t){const e=hs(t.firestore);return(function(o,a,c,h,d,p,g){let E;if(d.isKeyField()){if(p==="array-contains"||p==="array-contains-any")throw new N(S.INVALID_ARGUMENT,`Invalid Query. You can't perform '${p}' queries on documentId().`);if(p==="in"||p==="not-in"){Vu(g,p);const P=[];for(const k of g)P.push(Pu(h,o,k));E={arrayValue:{values:P}}}else E=Pu(h,o,g)}else p!=="in"&&p!=="not-in"&&p!=="array-contains-any"||Vu(g,p),E=vl(c,a,g,p==="in"||p==="not-in");return at.create(d,p,E)})(t._query,"where",e,t.firestore._databaseId,this._field,this._op,this._value)}}function ty(n,t,e){const r=t,s=fs("where",n);return ms._create(s,r,e)}class oo extends io{constructor(t,e){super(),this.type=t,this._queryConstraints=e}static _create(t,e){return new oo(t,e)}_parse(t){const e=this._queryConstraints.map((r=>r._parse(t))).filter((r=>r.getFilters().length>0));return e.length===1?e[0]:Lt.create(e,this._getOperator())}_apply(t){const e=this._parse(t);return e.getFilters().length===0?t:((function(s,o){let a=s;const c=o.getFlattenedFilters();for(const h of c)Cl(a,h),a=hi(a,h)})(t._query,e),new Ht(t.firestore,t.converter,hi(t._query,e)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class ao extends ps{constructor(t,e){super(),this._field=t,this._direction=e,this.type="orderBy"}static _create(t,e){return new ao(t,e)}_apply(t){const e=(function(s,o,a){if(s.startAt!==null)throw new N(S.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new N(S.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new jn(o,a)})(t._query,this._field,this._direction);return new Ht(t.firestore,t.converter,(function(s,o){const a=s.explicitOrderBy.concat([o]);return new Oe(s.path,s.collectionGroup,a,s.filters.slice(),s.limit,s.limitType,s.startAt,s.endAt)})(t._query,e))}}function ey(n,t="asc"){const e=t,r=fs("orderBy",n);return ao._create(r,e)}class uo extends ps{constructor(t,e,r){super(),this.type=t,this._limit=e,this._limitType=r}static _create(t,e,r){return new uo(t,e,r)}_apply(t){return new Ht(t.firestore,t.converter,Fr(t._query,this._limit,this._limitType))}}function ny(n){return Ef("limit",n),uo._create("limit",n,"F")}class co extends ps{constructor(t,e,r){super(),this.type=t,this._docOrFields=e,this._inclusive=r}static _create(t,e,r){return new co(t,e,r)}_apply(t){const e=mg(t,this.type,this._docOrFields,this._inclusive);return new Ht(t.firestore,t.converter,(function(s,o){return new Oe(s.path,s.collectionGroup,s.explicitOrderBy.slice(),s.filters.slice(),s.limit,s.limitType,o,s.endAt)})(t._query,e))}}function ry(...n){return co._create("startAfter",n,!1)}function mg(n,t,e,r){if(e[0]=mt(e[0]),e[0]instanceof so)return(function(o,a,c,h,d){if(!h)throw new N(S.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${c}().`);const p=[];for(const g of Ke(o))if(g.field.isKeyField())p.push(Lr(a,h.key));else{const E=h.data.field(g.field);if(Yr(E))throw new N(S.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+g.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(E===null){const b=g.field.canonicalString();throw new N(S.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${b}' (used as the orderBy) does not exist.`)}p.push(E)}return new tn(p,d)})(n._query,n.firestore._databaseId,t,e[0]._document,r);{const s=hs(n.firestore);return(function(a,c,h,d,p,g){const E=a.explicitOrderBy;if(p.length>E.length)throw new N(S.INVALID_ARGUMENT,`Too many arguments provided to ${d}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);const b=[];for(let P=0;P<p.length;P++){const k=p[P];if(E[P].field.isKeyField()){if(typeof k!="string")throw new N(S.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${d}(), but got a ${typeof k}`);if(!Di(a)&&k.indexOf("/")!==-1)throw new N(S.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${d}() must be a plain document ID, but '${k}' contains a slash.`);const V=a.path.child(X.fromString(k));if(!x.isDocumentKey(V))throw new N(S.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${d}() must result in a valid document path, but '${V}' is not because it contains an odd number of segments.`);const q=new x(V);b.push(Lr(c,q))}else{const V=vl(h,d,k);b.push(V)}}return new tn(b,g)})(n._query,n.firestore._databaseId,s,t,e,r)}}function Pu(n,t,e){if(typeof(e=mt(e))=="string"){if(e==="")throw new N(S.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Di(t)&&e.indexOf("/")!==-1)throw new N(S.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${e}' contains a '/' character.`);const r=t.path.child(X.fromString(e));if(!x.isDocumentKey(r))throw new N(S.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return Lr(n,new x(r))}if(e instanceof it)return Lr(n,e._key);throw new N(S.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Wr(e)}.`)}function Vu(n,t){if(!Array.isArray(n)||n.length===0)throw new N(S.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${t.toString()}' filters.`)}function Cl(n,t){const e=(function(s,o){for(const a of s)for(const c of a.getFlattenedFilters())if(o.indexOf(c.op)>=0)return c.op;return null})(n.filters,(function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}})(t.op));if(e!==null)throw e===t.op?new N(S.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${t.op.toString()}' filter.`):new N(S.INVALID_ARGUMENT,`Invalid query. You cannot use '${t.op.toString()}' filters with '${e.toString()}' filters.`)}class gg{convertValue(t,e="none"){switch(me(t)){case 0:return null;case 1:return t.booleanValue;case 2:return st(t.integerValue||t.doubleValue);case 3:return this.convertTimestamp(t.timestampValue);case 4:return this.convertServerTimestamp(t,e);case 5:return t.stringValue;case 6:return this.convertBytes(pe(t.bytesValue));case 7:return this.convertReference(t.referenceValue);case 8:return this.convertGeoPoint(t.geoPointValue);case 9:return this.convertArray(t.arrayValue,e);case 11:return this.convertObject(t.mapValue,e);case 10:return this.convertVectorValue(t.mapValue);default:throw L(62114,{value:t})}}convertObject(t,e){return this.convertObjectMap(t.fields,e)}convertObjectMap(t,e="none"){const r={};return Ee(t,((s,o)=>{r[s]=this.convertValue(o,e)})),r}convertVectorValue(t){const e=t.fields?.[Mr].arrayValue?.values?.map((r=>st(r.doubleValue)));return new $t(e)}convertGeoPoint(t){return new jt(st(t.latitude),st(t.longitude))}convertArray(t,e){return(t.values||[]).map((r=>this.convertValue(r,e)))}convertServerTimestamp(t,e){switch(e){case"previous":const r=Jr(t);return r==null?null:this.convertValue(r,e);case"estimate":return this.convertTimestamp(Un(t));default:return null}}convertTimestamp(t){const e=fe(t);return new J(e.seconds,e.nanos)}convertDocumentKey(t,e){const r=X.fromString(t);W(Yc(r),9688,{name:t});const s=new Bn(r.get(1),r.get(3)),o=new x(r.popFirst(5));return s.isEqual(e)||Zt(`Document ${o} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${e.projectId}/${e.database}) instead.`),o}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */function _g(n,t,e){let r;return r=n?n.toFirestore(t):t,r}class Vn{constructor(t,e){this.hasPendingWrites=t,this.fromCache=e}isEqual(t){return this.hasPendingWrites===t.hasPendingWrites&&this.fromCache===t.fromCache}}class Se extends so{constructor(t,e,r,s,o,a){super(t,e,r,s,a),this._firestore=t,this._firestoreImpl=t,this.metadata=o}exists(){return super.exists()}data(t={}){if(this._document){if(this._converter){const e=new Vr(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(e,t)}return this._userDataWriter.convertValue(this._document.data.value,t.serverTimestamps)}}get(t,e={}){if(this._document){const r=this._document.data.field(fs("DocumentSnapshot.get",t));if(r!==null)return this._userDataWriter.convertValue(r,e.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new N(S.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const t=this._document,e={};return e.type=Se._jsonSchemaVersion,e.bundle="",e.bundleSource="DocumentSnapshot",e.bundleName=this._key.toString(),!t||!t.isValidDocument()||!t.isFoundDocument()?e:(this._userDataWriter.convertObjectMap(t.data.value.mapValue.fields,"previous"),e.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),e)}}Se._jsonSchemaVersion="firestore/documentSnapshot/1.0",Se._jsonSchema={type:ut("string",Se._jsonSchemaVersion),bundleSource:ut("string","DocumentSnapshot"),bundleName:ut("string"),bundle:ut("string")};class Vr extends Se{data(t={}){return super.data(t)}}class Ce{constructor(t,e,r,s){this._firestore=t,this._userDataWriter=e,this._snapshot=s,this.metadata=new Vn(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const t=[];return this.forEach((e=>t.push(e))),t}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(t,e){this._snapshot.docs.forEach((r=>{t.call(e,new Vr(this._firestore,this._userDataWriter,r.key,r,new Vn(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(t={}){const e=!!t.includeMetadataChanges;if(e&&this._snapshot.excludesMetadataChanges)throw new N(S.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===e||(this._cachedChanges=(function(s,o){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map((c=>{const h=new Vr(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Vn(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);return c.doc,{type:"added",doc:h,oldIndex:-1,newIndex:a++}}))}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter((c=>o||c.type!==3)).map((c=>{const h=new Vr(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Vn(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);let d=-1,p=-1;return c.type!==0&&(d=a.indexOf(c.doc.key),a=a.delete(c.doc.key)),c.type!==1&&(a=a.add(c.doc),p=a.indexOf(c.doc.key)),{type:yg(c.type),doc:h,oldIndex:d,newIndex:p}}))}})(this,e),this._cachedChangesIncludeMetadataChanges=e),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new N(S.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const t={};t.type=Ce._jsonSchemaVersion,t.bundleSource="QuerySnapshot",t.bundleName=bi.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const e=[],r=[],s=[];return this.docs.forEach((o=>{o._document!==null&&(e.push(o._document),r.push(this._userDataWriter.convertObjectMap(o._document.data.value.mapValue.fields,"previous")),s.push(o.ref.path))})),t.bundle=(this._firestore,this.query._query,t.bundleName,"NOT SUPPORTED"),t}}function yg(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return L(61501,{type:n})}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */function sy(n){n=Ot(n,it);const t=Ot(n.firestore,ye);return ng(cs(t),n._key).then((e=>Pl(t,n,e)))}Ce._jsonSchemaVersion="firestore/querySnapshot/1.0",Ce._jsonSchema={type:ut("string",Ce._jsonSchemaVersion),bundleSource:ut("string","QuerySnapshot"),bundleName:ut("string"),bundle:ut("string")};class lo extends gg{constructor(t){super(),this.firestore=t}convertBytes(t){return new kt(t)}convertReference(t){const e=this.convertDocumentKey(t,this.firestore._databaseId);return new it(this.firestore,null,e)}}function iy(n){n=Ot(n,Ht);const t=Ot(n.firestore,ye),e=cs(t),r=new lo(t);return Sl(n._query),rg(e,n._query).then((s=>new Ce(t,r,n,s)))}function oy(n,t,e,...r){n=Ot(n,it);const s=Ot(n.firestore,ye),o=hs(s);let a;return a=typeof(t=mt(t))=="string"||t instanceof ls?dg(o,"updateDoc",n._key,t,e,r):hg(o,"updateDoc",n._key,t),ho(s,[a.toMutation(n._key,Mt.exists(!0))])}function ay(n){return ho(Ot(n.firestore,ye),[new ki(n._key,Mt.none())])}function uy(n,t){const e=Ot(n.firestore,ye),r=ig(n),s=_g(n.converter,t);return ho(e,[lg(hs(n.firestore),"addDoc",r._key,s,n.converter!==null,{}).toMutation(r._key,Mt.exists(!1))]).then((()=>r))}function cy(n,...t){n=mt(n);let e={includeMetadataChanges:!1,source:"default"},r=0;typeof t[r]!="object"||Cu(t[r])||(e=t[r++]);const s={includeMetadataChanges:e.includeMetadataChanges,source:e.source};if(Cu(t[r])){const h=t[r];t[r]=h.next?.bind(h),t[r+1]=h.error?.bind(h),t[r+2]=h.complete?.bind(h)}let o,a,c;if(n instanceof it)a=Ot(n.firestore,ye),c=Zr(n._key.path),o={next:h=>{t[r]&&t[r](Pl(a,n,h))},error:t[r+1],complete:t[r+2]};else{const h=Ot(n,Ht);a=Ot(h.firestore,ye),c=h._query;const d=new lo(a);o={next:p=>{t[r]&&t[r](new Ce(a,d,h,p))},error:t[r+1],complete:t[r+2]},Sl(n._query)}return(function(d,p,g,E){const b=new Zi(E),P=new Xi(p,b,g);return d.asyncQueue.enqueueAndForget((async()=>Ki(await Hr(d),P))),()=>{b.Nu(),d.asyncQueue.enqueueAndForget((async()=>Wi(await Hr(d),P)))}})(cs(a),c,s,o)}function ho(n,t){return(function(r,s){const o=new Xt;return r.asyncQueue.enqueueAndForget((async()=>zm(await eg(r),s,o))),o.promise})(cs(n),t)}function Pl(n,t,e){const r=e.docs.get(t._key),s=new lo(n);return new Se(n,s,t._key,r,new Vn(e.hasPendingWrites,e.fromCache),t.converter)}(function(t,e=!0){(function(s){rn=s})(tc),Mn(new Qe("firestore",((r,{instanceIdentifier:s,options:o})=>{const a=r.getProvider("app").getImmediate(),c=new ye(new lf(r.getProvider("auth-internal")),new ff(a,r.getProvider("app-check-internal")),(function(d,p){if(!Object.prototype.hasOwnProperty.apply(d.options,["projectId"]))throw new N(S.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Bn(d.options.projectId,p)})(a,s),a);return o={useFetchStreams:e,...o},c._setSettings(o),c}),"PUBLIC").setMultipleInstances(!0)),ce(ka,Oa,t),ce(ka,Oa,"esm2020")})();/**
 * @license
 * Copyright 2017 Google LLC
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
 */const Vl="firebasestorage.googleapis.com",Dl="storageBucket",Eg=120*1e3,Tg=600*1e3,Ig=1e3;/**
 * @license
 * Copyright 2017 Google LLC
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
 */class nt extends ke{constructor(t,e,r=0){super(Xs(t),`Firebase Storage: ${e} (${Xs(t)})`),this.status_=r,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,nt.prototype)}get status(){return this.status_}set status(t){this.status_=t}_codeEquals(t){return Xs(t)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(t){this.customData.serverResponse=t,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var Z;(function(n){n.UNKNOWN="unknown",n.OBJECT_NOT_FOUND="object-not-found",n.BUCKET_NOT_FOUND="bucket-not-found",n.PROJECT_NOT_FOUND="project-not-found",n.QUOTA_EXCEEDED="quota-exceeded",n.UNAUTHENTICATED="unauthenticated",n.UNAUTHORIZED="unauthorized",n.UNAUTHORIZED_APP="unauthorized-app",n.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",n.INVALID_CHECKSUM="invalid-checksum",n.CANCELED="canceled",n.INVALID_EVENT_NAME="invalid-event-name",n.INVALID_URL="invalid-url",n.INVALID_DEFAULT_BUCKET="invalid-default-bucket",n.NO_DEFAULT_BUCKET="no-default-bucket",n.CANNOT_SLICE_BLOB="cannot-slice-blob",n.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",n.NO_DOWNLOAD_URL="no-download-url",n.INVALID_ARGUMENT="invalid-argument",n.INVALID_ARGUMENT_COUNT="invalid-argument-count",n.APP_DELETED="app-deleted",n.INVALID_ROOT_OPERATION="invalid-root-operation",n.INVALID_FORMAT="invalid-format",n.INTERNAL_ERROR="internal-error",n.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(Z||(Z={}));function Xs(n){return"storage/"+n}function fo(){const n="An unknown error occurred, please check the error payload for server response.";return new nt(Z.UNKNOWN,n)}function wg(n){return new nt(Z.OBJECT_NOT_FOUND,"Object '"+n+"' does not exist.")}function vg(n){return new nt(Z.QUOTA_EXCEEDED,"Quota for bucket '"+n+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function Ag(){const n="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new nt(Z.UNAUTHENTICATED,n)}function Rg(){return new nt(Z.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function bg(n){return new nt(Z.UNAUTHORIZED,"User does not have permission to access '"+n+"'.")}function Nl(){return new nt(Z.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function kl(){return new nt(Z.CANCELED,"User canceled the upload/download.")}function Sg(n){return new nt(Z.INVALID_URL,"Invalid URL '"+n+"'.")}function Cg(n){return new nt(Z.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+n+"'.")}function Pg(){return new nt(Z.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+Dl+"' property when initializing the app?")}function Ol(){return new nt(Z.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function Vg(){return new nt(Z.SERVER_FILE_WRONG_SIZE,"Server recorded incorrect upload file size, please retry the upload.")}function Dg(){return new nt(Z.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function Ng(n){return new nt(Z.UNSUPPORTED_ENVIRONMENT,`${n} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function wi(n){return new nt(Z.INVALID_ARGUMENT,n)}function xl(){return new nt(Z.APP_DELETED,"The Firebase app was deleted.")}function kg(n){return new nt(Z.INVALID_ROOT_OPERATION,"The operation '"+n+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function xn(n,t){return new nt(Z.INVALID_FORMAT,"String does not match format '"+n+"': "+t)}function bn(n){throw new nt(Z.INTERNAL_ERROR,"Internal error: "+n)}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Nt{constructor(t,e){this.bucket=t,this.path_=e}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const t=encodeURIComponent;return"/b/"+t(this.bucket)+"/o/"+t(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(t,e){let r;try{r=Nt.makeFromUrl(t,e)}catch{return new Nt(t,"")}if(r.path==="")return r;throw Cg(t)}static makeFromUrl(t,e){let r=null;const s="([A-Za-z0-9.\\-_]+)";function o(z){z.path.charAt(z.path.length-1)==="/"&&(z.path_=z.path_.slice(0,-1))}const a="(/(.*))?$",c=new RegExp("^gs://"+s+a,"i"),h={bucket:1,path:3};function d(z){z.path_=decodeURIComponent(z.path)}const p="v[A-Za-z0-9_]+",g=e.replace(/[.]/g,"\\."),E="(/([^?#]*).*)?$",b=new RegExp(`^https?://${g}/${p}/b/${s}/o${E}`,"i"),P={bucket:1,path:3},k=e===Vl?"(?:storage.googleapis.com|storage.cloud.google.com)":e,V="([^?#]*)",q=new RegExp(`^https?://${k}/${s}/${V}`,"i"),M=[{regex:c,indices:h,postModify:o},{regex:b,indices:P,postModify:d},{regex:q,indices:{bucket:1,path:2},postModify:d}];for(let z=0;z<M.length;z++){const ht=M[z],tt=ht.regex.exec(t);if(tt){const w=tt[ht.indices.bucket];let m=tt[ht.indices.path];m||(m=""),r=new Nt(w,m),ht.postModify(r);break}}if(r==null)throw Sg(t);return r}}class Og{constructor(t){this.promise_=Promise.reject(t)}getPromise(){return this.promise_}cancel(t=!1){}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */function xg(n,t,e){let r=1,s=null,o=null,a=!1,c=0;function h(){return c===2}let d=!1;function p(...V){d||(d=!0,t.apply(null,V))}function g(V){s=setTimeout(()=>{s=null,n(b,h())},V)}function E(){o&&clearTimeout(o)}function b(V,...q){if(d){E();return}if(V){E(),p.call(null,V,...q);return}if(h()||a){E(),p.call(null,V,...q);return}r<64&&(r*=2);let M;c===1?(c=2,M=0):M=(r+Math.random())*1e3,g(M)}let P=!1;function k(V){P||(P=!0,E(),!d&&(s!==null?(V||(c=2),clearTimeout(s),g(0)):V||(c=1)))}return g(0),o=setTimeout(()=>{a=!0,k(!0)},e),k}function Mg(n){n(!1)}/**
 * @license
 * Copyright 2017 Google LLC
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
 */function Lg(n){return n!==void 0}function Fg(n){return typeof n=="function"}function Ug(n){return typeof n=="object"&&!Array.isArray(n)}function gs(n){return typeof n=="string"||n instanceof String}function Du(n){return po()&&n instanceof Blob}function po(){return typeof Blob<"u"}function Nu(n,t,e,r){if(r<t)throw wi(`Invalid value for '${n}'. Expected ${t} or greater.`);if(r>e)throw wi(`Invalid value for '${n}'. Expected ${e} or less.`)}/**
 * @license
 * Copyright 2017 Google LLC
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
 */function un(n,t,e){let r=t;return e==null&&(r=`https://${t}`),`${e}://${r}/v0${n}`}function Ml(n){const t=encodeURIComponent;let e="?";for(const r in n)if(n.hasOwnProperty(r)){const s=t(r)+"="+t(n[r]);e=e+s+"&"}return e=e.slice(0,-1),e}var Pe;(function(n){n[n.NO_ERROR=0]="NO_ERROR",n[n.NETWORK_ERROR=1]="NETWORK_ERROR",n[n.ABORT=2]="ABORT"})(Pe||(Pe={}));/**
 * @license
 * Copyright 2022 Google LLC
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
 */function Ll(n,t){const e=n>=500&&n<600,s=[408,429].indexOf(n)!==-1,o=t.indexOf(n)!==-1;return e||s||o}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Bg{constructor(t,e,r,s,o,a,c,h,d,p,g,E=!0,b=!1){this.url_=t,this.method_=e,this.headers_=r,this.body_=s,this.successCodes_=o,this.additionalRetryCodes_=a,this.callback_=c,this.errorCallback_=h,this.timeout_=d,this.progressCallback_=p,this.connectionFactory_=g,this.retry=E,this.isUsingEmulator=b,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((P,k)=>{this.resolve_=P,this.reject_=k,this.start_()})}start_(){const t=(r,s)=>{if(s){r(!1,new vr(!1,null,!0));return}const o=this.connectionFactory_();this.pendingConnection_=o;const a=c=>{const h=c.loaded,d=c.lengthComputable?c.total:-1;this.progressCallback_!==null&&this.progressCallback_(h,d)};this.progressCallback_!==null&&o.addUploadProgressListener(a),o.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&o.removeUploadProgressListener(a),this.pendingConnection_=null;const c=o.getErrorCode()===Pe.NO_ERROR,h=o.getStatus();if(!c||Ll(h,this.additionalRetryCodes_)&&this.retry){const p=o.getErrorCode()===Pe.ABORT;r(!1,new vr(!1,null,p));return}const d=this.successCodes_.indexOf(h)!==-1;r(!0,new vr(d,o))})},e=(r,s)=>{const o=this.resolve_,a=this.reject_,c=s.connection;if(s.wasSuccessCode)try{const h=this.callback_(c,c.getResponse());Lg(h)?o(h):o()}catch(h){a(h)}else if(c!==null){const h=fo();h.serverResponse=c.getErrorText(),this.errorCallback_?a(this.errorCallback_(c,h)):a(h)}else if(s.canceled){const h=this.appDelete_?xl():kl();a(h)}else{const h=Nl();a(h)}};this.canceled_?e(!1,new vr(!1,null,!0)):this.backoffId_=xg(t,e,this.timeout_)}getPromise(){return this.promise_}cancel(t){this.canceled_=!0,this.appDelete_=t||!1,this.backoffId_!==null&&Mg(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class vr{constructor(t,e,r){this.wasSuccessCode=t,this.connection=e,this.canceled=!!r}}function qg(n,t){t!==null&&t.length>0&&(n.Authorization="Firebase "+t)}function jg(n,t){n["X-Firebase-Storage-Version"]="webjs/"+(t??"AppManager")}function $g(n,t){t&&(n["X-Firebase-GMPID"]=t)}function zg(n,t){t!==null&&(n["X-Firebase-AppCheck"]=t)}function Hg(n,t,e,r,s,o,a=!0,c=!1){const h=Ml(n.urlParams),d=n.url+h,p=Object.assign({},n.headers);return $g(p,t),qg(p,e),jg(p,o),zg(p,r),new Bg(d,n.method,p,n.body,n.successCodes,n.additionalRetryCodes,n.handler,n.errorHandler,n.timeout,n.progressCallback,s,a,c)}/**
 * @license
 * Copyright 2017 Google LLC
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
 */function Gg(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function Kg(...n){const t=Gg();if(t!==void 0){const e=new t;for(let r=0;r<n.length;r++)e.append(n[r]);return e.getBlob()}else{if(po())return new Blob(n);throw new nt(Z.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function Wg(n,t,e){return n.webkitSlice?n.webkitSlice(t,e):n.mozSlice?n.mozSlice(t,e):n.slice?n.slice(t,e):null}/**
 * @license
 * Copyright 2021 Google LLC
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
 */function Qg(n){if(typeof atob>"u")throw Ng("base-64");return atob(n)}/**
 * @license
 * Copyright 2017 Google LLC
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
 */const Ut={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class Ys{constructor(t,e){this.data=t,this.contentType=e||null}}function Xg(n,t){switch(n){case Ut.RAW:return new Ys(Fl(t));case Ut.BASE64:case Ut.BASE64URL:return new Ys(Ul(n,t));case Ut.DATA_URL:return new Ys(Jg(t),Zg(t))}throw fo()}function Fl(n){const t=[];for(let e=0;e<n.length;e++){let r=n.charCodeAt(e);if(r<=127)t.push(r);else if(r<=2047)t.push(192|r>>6,128|r&63);else if((r&64512)===55296)if(!(e<n.length-1&&(n.charCodeAt(e+1)&64512)===56320))t.push(239,191,189);else{const o=r,a=n.charCodeAt(++e);r=65536|(o&1023)<<10|a&1023,t.push(240|r>>18,128|r>>12&63,128|r>>6&63,128|r&63)}else(r&64512)===56320?t.push(239,191,189):t.push(224|r>>12,128|r>>6&63,128|r&63)}return new Uint8Array(t)}function Yg(n){let t;try{t=decodeURIComponent(n)}catch{throw xn(Ut.DATA_URL,"Malformed data URL.")}return Fl(t)}function Ul(n,t){switch(n){case Ut.BASE64:{const s=t.indexOf("-")!==-1,o=t.indexOf("_")!==-1;if(s||o)throw xn(n,"Invalid character '"+(s?"-":"_")+"' found: is it base64url encoded?");break}case Ut.BASE64URL:{const s=t.indexOf("+")!==-1,o=t.indexOf("/")!==-1;if(s||o)throw xn(n,"Invalid character '"+(s?"+":"/")+"' found: is it base64 encoded?");t=t.replace(/-/g,"+").replace(/_/g,"/");break}}let e;try{e=Qg(t)}catch(s){throw s.message.includes("polyfill")?s:xn(n,"Invalid character found")}const r=new Uint8Array(e.length);for(let s=0;s<e.length;s++)r[s]=e.charCodeAt(s);return r}class Bl{constructor(t){this.base64=!1,this.contentType=null;const e=t.match(/^data:([^,]+)?,/);if(e===null)throw xn(Ut.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const r=e[1]||null;r!=null&&(this.base64=t_(r,";base64"),this.contentType=this.base64?r.substring(0,r.length-7):r),this.rest=t.substring(t.indexOf(",")+1)}}function Jg(n){const t=new Bl(n);return t.base64?Ul(Ut.BASE64,t.rest):Yg(t.rest)}function Zg(n){return new Bl(n).contentType}function t_(n,t){return n.length>=t.length?n.substring(n.length-t.length)===t:!1}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Qt{constructor(t,e){let r=0,s="";Du(t)?(this.data_=t,r=t.size,s=t.type):t instanceof ArrayBuffer?(e?this.data_=new Uint8Array(t):(this.data_=new Uint8Array(t.byteLength),this.data_.set(new Uint8Array(t))),r=this.data_.length):t instanceof Uint8Array&&(e?this.data_=t:(this.data_=new Uint8Array(t.length),this.data_.set(t)),r=t.length),this.size_=r,this.type_=s}size(){return this.size_}type(){return this.type_}slice(t,e){if(Du(this.data_)){const r=this.data_,s=Wg(r,t,e);return s===null?null:new Qt(s)}else{const r=new Uint8Array(this.data_.buffer,t,e-t);return new Qt(r,!0)}}static getBlob(...t){if(po()){const e=t.map(r=>r instanceof Qt?r.data_:r);return new Qt(Kg.apply(null,e))}else{const e=t.map(a=>gs(a)?Xg(Ut.RAW,a).data:a.data_);let r=0;e.forEach(a=>{r+=a.byteLength});const s=new Uint8Array(r);let o=0;return e.forEach(a=>{for(let c=0;c<a.length;c++)s[o++]=a[c]}),new Qt(s,!0)}}uploadData(){return this.data_}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */function ql(n){let t;try{t=JSON.parse(n)}catch{return null}return Ug(t)?t:null}/**
 * @license
 * Copyright 2017 Google LLC
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
 */function e_(n){if(n.length===0)return null;const t=n.lastIndexOf("/");return t===-1?"":n.slice(0,t)}function n_(n,t){const e=t.split("/").filter(r=>r.length>0).join("/");return n.length===0?e:n+"/"+e}function jl(n){const t=n.lastIndexOf("/",n.length-2);return t===-1?n:n.slice(t+1)}/**
 * @license
 * Copyright 2017 Google LLC
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
 */function r_(n,t){return t}class bt{constructor(t,e,r,s){this.server=t,this.local=e||t,this.writable=!!r,this.xform=s||r_}}let Ar=null;function s_(n){return!gs(n)||n.length<2?n:jl(n)}function mo(){if(Ar)return Ar;const n=[];n.push(new bt("bucket")),n.push(new bt("generation")),n.push(new bt("metageneration")),n.push(new bt("name","fullPath",!0));function t(o,a){return s_(a)}const e=new bt("name");e.xform=t,n.push(e);function r(o,a){return a!==void 0?Number(a):a}const s=new bt("size");return s.xform=r,n.push(s),n.push(new bt("timeCreated")),n.push(new bt("updated")),n.push(new bt("md5Hash",null,!0)),n.push(new bt("cacheControl",null,!0)),n.push(new bt("contentDisposition",null,!0)),n.push(new bt("contentEncoding",null,!0)),n.push(new bt("contentLanguage",null,!0)),n.push(new bt("contentType",null,!0)),n.push(new bt("metadata","customMetadata",!0)),Ar=n,Ar}function i_(n,t){function e(){const r=n.bucket,s=n.fullPath,o=new Nt(r,s);return t._makeStorageReference(o)}Object.defineProperty(n,"ref",{get:e})}function o_(n,t,e){const r={};r.type="file";const s=e.length;for(let o=0;o<s;o++){const a=e[o];r[a.local]=a.xform(r,t[a.server])}return i_(r,n),r}function $l(n,t,e){const r=ql(t);return r===null?null:o_(n,r,e)}function a_(n,t,e,r){const s=ql(t);if(s===null||!gs(s.downloadTokens))return null;const o=s.downloadTokens;if(o.length===0)return null;const a=encodeURIComponent;return o.split(",").map(d=>{const p=n.bucket,g=n.fullPath,E="/b/"+a(p)+"/o/"+a(g),b=un(E,e,r),P=Ml({alt:"media",token:d});return b+P})[0]}function zl(n,t){const e={},r=t.length;for(let s=0;s<r;s++){const o=t[s];o.writable&&(e[o.server]=n[o.local])}return JSON.stringify(e)}class Le{constructor(t,e,r,s){this.url=t,this.method=e,this.handler=r,this.timeout=s,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */function Yt(n){if(!n)throw fo()}function go(n,t){function e(r,s){const o=$l(n,s,t);return Yt(o!==null),o}return e}function u_(n,t){function e(r,s){const o=$l(n,s,t);return Yt(o!==null),a_(o,s,n.host,n._protocol)}return e}function Jn(n){function t(e,r){let s;return e.getStatus()===401?e.getErrorText().includes("Firebase App Check token is invalid")?s=Rg():s=Ag():e.getStatus()===402?s=vg(n.bucket):e.getStatus()===403?s=bg(n.path):s=r,s.status=e.getStatus(),s.serverResponse=r.serverResponse,s}return t}function _o(n){const t=Jn(n);function e(r,s){let o=t(r,s);return r.getStatus()===404&&(o=wg(n.path)),o.serverResponse=s.serverResponse,o}return e}function c_(n,t,e){const r=t.fullServerUrl(),s=un(r,n.host,n._protocol),o="GET",a=n.maxOperationRetryTime,c=new Le(s,o,go(n,e),a);return c.errorHandler=_o(t),c}function l_(n,t,e){const r=t.fullServerUrl(),s=un(r,n.host,n._protocol),o="GET",a=n.maxOperationRetryTime,c=new Le(s,o,u_(n,e),a);return c.errorHandler=_o(t),c}function h_(n,t){const e=t.fullServerUrl(),r=un(e,n.host,n._protocol),s="DELETE",o=n.maxOperationRetryTime;function a(h,d){}const c=new Le(r,s,a,o);return c.successCodes=[200,204],c.errorHandler=_o(t),c}function d_(n,t){return n&&n.contentType||t&&t.type()||"application/octet-stream"}function Hl(n,t,e){const r=Object.assign({},e);return r.fullPath=n.path,r.size=t.size(),r.contentType||(r.contentType=d_(null,t)),r}function Gl(n,t,e,r,s){const o=t.bucketOnlyServerUrl(),a={"X-Goog-Upload-Protocol":"multipart"};function c(){let M="";for(let z=0;z<2;z++)M=M+Math.random().toString().slice(2);return M}const h=c();a["Content-Type"]="multipart/related; boundary="+h;const d=Hl(t,r,s),p=zl(d,e),g="--"+h+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+p+`\r
--`+h+`\r
Content-Type: `+d.contentType+`\r
\r
`,E=`\r
--`+h+"--",b=Qt.getBlob(g,r,E);if(b===null)throw Ol();const P={name:d.fullPath},k=un(o,n.host,n._protocol),V="POST",q=n.maxUploadRetryTime,F=new Le(k,V,go(n,e),q);return F.urlParams=P,F.headers=a,F.body=b.uploadData(),F.errorHandler=Jn(t),F}class Kr{constructor(t,e,r,s){this.current=t,this.total=e,this.finalized=!!r,this.metadata=s||null}}function yo(n,t){let e=null;try{e=n.getResponseHeader("X-Goog-Upload-Status")}catch{Yt(!1)}return Yt(!!e&&(t||["active"]).indexOf(e)!==-1),e}function f_(n,t,e,r,s){const o=t.bucketOnlyServerUrl(),a=Hl(t,r,s),c={name:a.fullPath},h=un(o,n.host,n._protocol),d="POST",p={"X-Goog-Upload-Protocol":"resumable","X-Goog-Upload-Command":"start","X-Goog-Upload-Header-Content-Length":`${r.size()}`,"X-Goog-Upload-Header-Content-Type":a.contentType,"Content-Type":"application/json; charset=utf-8"},g=zl(a,e),E=n.maxUploadRetryTime;function b(k){yo(k);let V;try{V=k.getResponseHeader("X-Goog-Upload-URL")}catch{Yt(!1)}return Yt(gs(V)),V}const P=new Le(h,d,b,E);return P.urlParams=c,P.headers=p,P.body=g,P.errorHandler=Jn(t),P}function p_(n,t,e,r){const s={"X-Goog-Upload-Command":"query"};function o(d){const p=yo(d,["active","final"]);let g=null;try{g=d.getResponseHeader("X-Goog-Upload-Size-Received")}catch{Yt(!1)}g||Yt(!1);const E=Number(g);return Yt(!isNaN(E)),new Kr(E,r.size(),p==="final")}const a="POST",c=n.maxUploadRetryTime,h=new Le(e,a,o,c);return h.headers=s,h.errorHandler=Jn(t),h}const ku=256*1024;function m_(n,t,e,r,s,o,a,c){const h=new Kr(0,0);if(a?(h.current=a.current,h.total=a.total):(h.current=0,h.total=r.size()),r.size()!==h.total)throw Vg();const d=h.total-h.current;let p=d;s>0&&(p=Math.min(p,s));const g=h.current,E=g+p;let b="";p===0?b="finalize":d===p?b="upload, finalize":b="upload";const P={"X-Goog-Upload-Command":b,"X-Goog-Upload-Offset":`${h.current}`},k=r.slice(g,E);if(k===null)throw Ol();function V(z,ht){const tt=yo(z,["active","final"]),w=h.current+p,m=r.size();let _;return tt==="final"?_=go(t,o)(z,ht):_=null,new Kr(w,m,tt==="final",_)}const q="POST",F=t.maxUploadRetryTime,M=new Le(e,q,V,F);return M.headers=P,M.body=k.uploadData(),M.progressCallback=c||null,M.errorHandler=Jn(n),M}const Ct={RUNNING:"running",PAUSED:"paused",SUCCESS:"success",CANCELED:"canceled",ERROR:"error"};function Js(n){switch(n){case"running":case"pausing":case"canceling":return Ct.RUNNING;case"paused":return Ct.PAUSED;case"success":return Ct.SUCCESS;case"canceled":return Ct.CANCELED;case"error":return Ct.ERROR;default:return Ct.ERROR}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class g_{constructor(t,e,r){if(Fg(t)||e!=null||r!=null)this.next=t,this.error=e??void 0,this.complete=r??void 0;else{const o=t;this.next=o.next,this.error=o.error,this.complete=o.complete}}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */function je(n){return(...t)=>{Promise.resolve().then(()=>n(...t))}}class __{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=Pe.NO_ERROR,this.sendPromise_=new Promise(t=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=Pe.ABORT,t()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=Pe.NETWORK_ERROR,t()}),this.xhr_.addEventListener("load",()=>{t()})})}send(t,e,r,s,o){if(this.sent_)throw bn("cannot .send() more than once");if(Hn(t)&&r&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(e,t,!0),o!==void 0)for(const a in o)o.hasOwnProperty(a)&&this.xhr_.setRequestHeader(a,o[a].toString());return s!==void 0?this.xhr_.send(s):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw bn("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw bn("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw bn("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw bn("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(t){return this.xhr_.getResponseHeader(t)}addUploadProgressListener(t){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",t)}removeUploadProgressListener(t){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",t)}}class y_ extends __{initXhr(){this.xhr_.responseType="text"}}function ie(){return new y_}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class E_{isExponentialBackoffExpired(){return this.sleepTime>this.maxSleepTime}constructor(t,e,r=null){this._transferred=0,this._needToFetchStatus=!1,this._needToFetchMetadata=!1,this._observers=[],this._error=void 0,this._uploadUrl=void 0,this._request=void 0,this._chunkMultiplier=1,this._resolve=void 0,this._reject=void 0,this._ref=t,this._blob=e,this._metadata=r,this._mappings=mo(),this._resumable=this._shouldDoResumable(this._blob),this._state="running",this._errorHandler=s=>{if(this._request=void 0,this._chunkMultiplier=1,s._codeEquals(Z.CANCELED))this._needToFetchStatus=!0,this.completeTransitions_();else{const o=this.isExponentialBackoffExpired();if(Ll(s.status,[]))if(o)s=Nl();else{this.sleepTime=Math.max(this.sleepTime*2,Ig),this._needToFetchStatus=!0,this.completeTransitions_();return}this._error=s,this._transition("error")}},this._metadataErrorHandler=s=>{this._request=void 0,s._codeEquals(Z.CANCELED)?this.completeTransitions_():(this._error=s,this._transition("error"))},this.sleepTime=0,this.maxSleepTime=this._ref.storage.maxUploadRetryTime,this._promise=new Promise((s,o)=>{this._resolve=s,this._reject=o,this._start()}),this._promise.then(null,()=>{})}_makeProgressCallback(){const t=this._transferred;return e=>this._updateProgress(t+e)}_shouldDoResumable(t){return t.size()>256*1024}_start(){this._state==="running"&&this._request===void 0&&(this._resumable?this._uploadUrl===void 0?this._createResumable():this._needToFetchStatus?this._fetchStatus():this._needToFetchMetadata?this._fetchMetadata():this.pendingTimeout=setTimeout(()=>{this.pendingTimeout=void 0,this._continueUpload()},this.sleepTime):this._oneShotUpload())}_resolveToken(t){Promise.all([this._ref.storage._getAuthToken(),this._ref.storage._getAppCheckToken()]).then(([e,r])=>{switch(this._state){case"running":t(e,r);break;case"canceling":this._transition("canceled");break;case"pausing":this._transition("paused");break}})}_createResumable(){this._resolveToken((t,e)=>{const r=f_(this._ref.storage,this._ref._location,this._mappings,this._blob,this._metadata),s=this._ref.storage._makeRequest(r,ie,t,e);this._request=s,s.getPromise().then(o=>{this._request=void 0,this._uploadUrl=o,this._needToFetchStatus=!1,this.completeTransitions_()},this._errorHandler)})}_fetchStatus(){const t=this._uploadUrl;this._resolveToken((e,r)=>{const s=p_(this._ref.storage,this._ref._location,t,this._blob),o=this._ref.storage._makeRequest(s,ie,e,r);this._request=o,o.getPromise().then(a=>{a=a,this._request=void 0,this._updateProgress(a.current),this._needToFetchStatus=!1,a.finalized&&(this._needToFetchMetadata=!0),this.completeTransitions_()},this._errorHandler)})}_continueUpload(){const t=ku*this._chunkMultiplier,e=new Kr(this._transferred,this._blob.size()),r=this._uploadUrl;this._resolveToken((s,o)=>{let a;try{a=m_(this._ref._location,this._ref.storage,r,this._blob,t,this._mappings,e,this._makeProgressCallback())}catch(h){this._error=h,this._transition("error");return}const c=this._ref.storage._makeRequest(a,ie,s,o,!1);this._request=c,c.getPromise().then(h=>{this._increaseMultiplier(),this._request=void 0,this._updateProgress(h.current),h.finalized?(this._metadata=h.metadata,this._transition("success")):this.completeTransitions_()},this._errorHandler)})}_increaseMultiplier(){ku*this._chunkMultiplier*2<32*1024*1024&&(this._chunkMultiplier*=2)}_fetchMetadata(){this._resolveToken((t,e)=>{const r=c_(this._ref.storage,this._ref._location,this._mappings),s=this._ref.storage._makeRequest(r,ie,t,e);this._request=s,s.getPromise().then(o=>{this._request=void 0,this._metadata=o,this._transition("success")},this._metadataErrorHandler)})}_oneShotUpload(){this._resolveToken((t,e)=>{const r=Gl(this._ref.storage,this._ref._location,this._mappings,this._blob,this._metadata),s=this._ref.storage._makeRequest(r,ie,t,e);this._request=s,s.getPromise().then(o=>{this._request=void 0,this._metadata=o,this._updateProgress(this._blob.size()),this._transition("success")},this._errorHandler)})}_updateProgress(t){const e=this._transferred;this._transferred=t,this._transferred!==e&&this._notifyObservers()}_transition(t){if(this._state!==t)switch(t){case"canceling":case"pausing":this._state=t,this._request!==void 0?this._request.cancel():this.pendingTimeout&&(clearTimeout(this.pendingTimeout),this.pendingTimeout=void 0,this.completeTransitions_());break;case"running":const e=this._state==="paused";this._state=t,e&&(this._notifyObservers(),this._start());break;case"paused":this._state=t,this._notifyObservers();break;case"canceled":this._error=kl(),this._state=t,this._notifyObservers();break;case"error":this._state=t,this._notifyObservers();break;case"success":this._state=t,this._notifyObservers();break}}completeTransitions_(){switch(this._state){case"pausing":this._transition("paused");break;case"canceling":this._transition("canceled");break;case"running":this._start();break}}get snapshot(){const t=Js(this._state);return{bytesTransferred:this._transferred,totalBytes:this._blob.size(),state:t,metadata:this._metadata,task:this,ref:this._ref}}on(t,e,r,s){const o=new g_(e||void 0,r||void 0,s||void 0);return this._addObserver(o),()=>{this._removeObserver(o)}}then(t,e){return this._promise.then(t,e)}catch(t){return this.then(null,t)}_addObserver(t){this._observers.push(t),this._notifyObserver(t)}_removeObserver(t){const e=this._observers.indexOf(t);e!==-1&&this._observers.splice(e,1)}_notifyObservers(){this._finishPromise(),this._observers.slice().forEach(e=>{this._notifyObserver(e)})}_finishPromise(){if(this._resolve!==void 0){let t=!0;switch(Js(this._state)){case Ct.SUCCESS:je(this._resolve.bind(null,this.snapshot))();break;case Ct.CANCELED:case Ct.ERROR:const e=this._reject;je(e.bind(null,this._error))();break;default:t=!1;break}t&&(this._resolve=void 0,this._reject=void 0)}}_notifyObserver(t){switch(Js(this._state)){case Ct.RUNNING:case Ct.PAUSED:t.next&&je(t.next.bind(t,this.snapshot))();break;case Ct.SUCCESS:t.complete&&je(t.complete.bind(t))();break;case Ct.CANCELED:case Ct.ERROR:t.error&&je(t.error.bind(t,this._error))();break;default:t.error&&je(t.error.bind(t,this._error))()}}resume(){const t=this._state==="paused"||this._state==="pausing";return t&&this._transition("running"),t}pause(){const t=this._state==="running";return t&&this._transition("pausing"),t}cancel(){const t=this._state==="running"||this._state==="pausing";return t&&this._transition("canceling"),t}}/**
 * @license
 * Copyright 2019 Google LLC
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
 */class Ne{constructor(t,e){this._service=t,e instanceof Nt?this._location=e:this._location=Nt.makeFromUrl(e,t.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(t,e){return new Ne(t,e)}get root(){const t=new Nt(this._location.bucket,"");return this._newRef(this._service,t)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return jl(this._location.path)}get storage(){return this._service}get parent(){const t=e_(this._location.path);if(t===null)return null;const e=new Nt(this._location.bucket,t);return new Ne(this._service,e)}_throwIfRoot(t){if(this._location.path==="")throw kg(t)}}function T_(n,t,e){n._throwIfRoot("uploadBytes");const r=Gl(n.storage,n._location,mo(),new Qt(t,!0),e);return n.storage.makeRequestWithTokens(r,ie).then(s=>({metadata:s,ref:n}))}function I_(n,t,e){return n._throwIfRoot("uploadBytesResumable"),new E_(n,new Qt(t),e)}function w_(n){n._throwIfRoot("getDownloadURL");const t=l_(n.storage,n._location,mo());return n.storage.makeRequestWithTokens(t,ie).then(e=>{if(e===null)throw Dg();return e})}function v_(n){n._throwIfRoot("deleteObject");const t=h_(n.storage,n._location);return n.storage.makeRequestWithTokens(t,ie)}function A_(n,t){const e=n_(n._location.path,t),r=new Nt(n._location.bucket,e);return new Ne(n.storage,r)}/**
 * @license
 * Copyright 2017 Google LLC
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
 */function R_(n){return/^[A-Za-z]+:\/\//.test(n)}function b_(n,t){return new Ne(n,t)}function Kl(n,t){if(n instanceof Eo){const e=n;if(e._bucket==null)throw Pg();const r=new Ne(e,e._bucket);return t!=null?Kl(r,t):r}else return t!==void 0?A_(n,t):n}function S_(n,t){if(t&&R_(t)){if(n instanceof Eo)return b_(n,t);throw wi("To use ref(service, url), the first argument must be a Storage instance.")}else return Kl(n,t)}function Ou(n,t){const e=t?.[Dl];return e==null?null:Nt.makeFromBucketSpec(e,n)}function C_(n,t,e,r={}){n.host=`${t}:${e}`;const s=Hn(t);s&&($u(`https://${n.host}/b`),Hu("Storage",!0)),n._isUsingEmulator=!0,n._protocol=s?"https":"http";const{mockUserToken:o}=r;o&&(n._overrideAuthToken=typeof o=="string"?o:zu(o,n.app.options.projectId))}class Eo{constructor(t,e,r,s,o,a=!1){this.app=t,this._authProvider=e,this._appCheckProvider=r,this._url=s,this._firebaseVersion=o,this._isUsingEmulator=a,this._bucket=null,this._host=Vl,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=Eg,this._maxUploadRetryTime=Tg,this._requests=new Set,s!=null?this._bucket=Nt.makeFromBucketSpec(s,this._host):this._bucket=Ou(this._host,this.app.options)}get host(){return this._host}set host(t){this._host=t,this._url!=null?this._bucket=Nt.makeFromBucketSpec(this._url,t):this._bucket=Ou(t,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(t){Nu("time",0,Number.POSITIVE_INFINITY,t),this._maxUploadRetryTime=t}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(t){Nu("time",0,Number.POSITIVE_INFINITY,t),this._maxOperationRetryTime=t}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const t=this._authProvider.getImmediate({optional:!0});if(t){const e=await t.getToken();if(e!==null)return e.accessToken}return null}async _getAppCheckToken(){if(Zu(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=this._appCheckProvider.getImmediate({optional:!0});return t?(await t.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(t=>t.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(t){return new Ne(this,t)}_makeRequest(t,e,r,s,o=!0){if(this._deleted)return new Og(xl());{const a=Hg(t,this._appId,r,s,e,this._firebaseVersion,o,this._isUsingEmulator);return this._requests.add(a),a.getPromise().then(()=>this._requests.delete(a),()=>this._requests.delete(a)),a}}async makeRequestWithTokens(t,e){const[r,s]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(t,e,r,s).getPromise()}}const xu="@firebase/storage",Mu="0.14.0";/**
 * @license
 * Copyright 2020 Google LLC
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
 */const Wl="storage";function ly(n,t,e){return n=mt(n),T_(n,t,e)}function hy(n,t,e){return n=mt(n),I_(n,t,e)}function dy(n){return n=mt(n),w_(n)}function fy(n){return n=mt(n),v_(n)}function py(n,t){return n=mt(n),S_(n,t)}function my(n=ec(),t){n=mt(n);const r=Ju(n,Wl).getImmediate({identifier:t}),s=qu("storage");return s&&P_(r,...s),r}function P_(n,t,e,r={}){C_(n,t,e,r)}function V_(n,{instanceIdentifier:t}){const e=n.getProvider("app").getImmediate(),r=n.getProvider("auth-internal"),s=n.getProvider("app-check-internal");return new Eo(e,r,s,t,tc)}function D_(){Mn(new Qe(Wl,V_,"PUBLIC").setMultipleInstances(!0)),ce(xu,Mu,""),ce(xu,Mu,"esm2020")}D_();var N_="firebase",k_="12.2.0";/**
 * @license
 * Copyright 2020 Google LLC
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
 */ce(N_,k_,"app");export{z_ as A,W_ as B,Qe as C,Uu as D,Nh as E,K_ as F,Zu as G,G as H,jh as I,H_ as J,B_ as K,Qu as L,U_ as M,$_ as N,x_ as O,M_ as P,mt as Q,O_ as R,G_ as S,Q_ as T,xh as U,L_ as V,tc as W,hy as X,Mn as _,my as a,dy as b,uy as c,Y_ as d,ig as e,oy as f,J_ as g,fy as h,Xd as i,ay as j,iy as k,ny as l,cy as m,sy as n,ey as o,Dh as p,Z_ as q,py as r,ry as s,ce as t,ly as u,F_ as v,ty as w,wa as x,q_ as y,j_ as z};
