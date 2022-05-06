exports.id=0,exports.modules={"./build/contracts/FlightSuretyData.json":!1,"./src/server/server.js":function(e,r,t){"use strict";t.r(r);var n=t("./build/contracts/FlightSuretyApp.json"),s=t("./src/server/config.json"),a=t("web3"),o=t.n(a),c=t("express");function i(e,r,t,n,s,a,o){try{var c=e[a](o),i=c.value}catch(e){return void t(e)}c.done?r(i):Promise.resolve(i).then(n,s)}function l(e){return function(){var r=this,t=arguments;return new Promise((function(n,s){var a=e.apply(r,t);function o(e){i(a,n,s,o,c,"next",e)}function c(e){i(a,n,s,o,c,"throw",e)}o(void 0)}))}}var u=t.n(c)()();l(regeneratorRuntime.mark((function e(){var r,t,a,c,i,d,f,g,p,m,x,h,v,b;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=s.localhost,t=new o.a(new o.a.providers.WebsocketProvider(r.url.replace("http","ws"))),a=10,c=5,e.next=6,t.eth.getAccounts();case 6:return i=e.sent,console.log("accounts = ",i),d=new t.eth.Contract(n.abi,r.appAddress),e.next=11,d.methods.REGISTRATION_FEE().call();case 11:f=e.sent,g={},console.log("oracleRegistrationfee "+f),x=1;case 15:if(!(x<=c)){e.next=35;break}return p=i[a+x],console.log("Register Oracle "+p+"..."),e.next=21,d.methods.isRegistredOracle().call({from:p});case 21:if(m=e.sent,v=(h=m)[0],b=h[1],v){e.next=31;break}return e.next=26,d.methods.registerOracle().send({from:p,value:f,gas:6e6});case 26:return console.log("Oracle registred!"),e.next=29,d.methods.getMyIndexes().call({from:p});case 29:b=e.sent,console.log("Oracle indexes: "+b[0]+", "+b[1]+", "+b[2]);case 31:g[p]=b;case 32:x++,e.next=15;break;case 35:console.log(g),d.events.OracleRequest({fromBlock:"latest"},function(){var e=l(regeneratorRuntime.mark((function e(r,t){var n,s,o,l,u,f,p,m,x,h;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(!r){e.next=4;break}console.log(r),e.next=28;break;case 4:console.log(t),l=parseInt(t.returnValues.index),u=t.returnValues.airline,f=t.returnValues.flight,p=t.returnValues.timestamp,console.log("Request data: oracleIndexRequested "+l+", airlineAddress "+u+", flight "+f+", timestamp "+p),x=1;case 11:if(!(x<=c)){e.next=28;break}s=i[n=a+x],o=g[s],h=0;case 16:if(!(h<o.length)){e.next=25;break}if(o[h]!==l){e.next=22;break}return m=20,e.next=21,d.methods.submitOracleResponse(l,u,f,p,m).send({from:i[n],gas:1e6});case 21:console.log("SubmitOracleResponse sent from "+s+" with data |"+u+"|"+f+"|"+p+"| Flight status code "+m);case 22:h++,e.next=16;break;case 25:x++,e.next=11;break;case 28:case"end":return e.stop()}}),e)})));return function(r,t){return e.apply(this,arguments)}}()),u.get("/api",(function(e,r){r.send({message:"An API for use with your Dapp!"})}));case 38:case"end":return e.stop()}}),e)})))(),r.default=u},cors:!1};