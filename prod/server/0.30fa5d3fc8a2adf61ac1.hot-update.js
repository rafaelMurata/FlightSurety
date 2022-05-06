exports.id=0,exports.modules={"./src/server/server.js":function(e,o,n){"use strict";n.r(o);var t=n("./build/contracts/FlightSuretyApp.json"),c=(n("./build/contracts/FlightSuretyData.json"),n("./src/server/config.json")),s=n("web3"),l=n.n(s),r=n("express"),a=n.n(r),i=n("cors"),u=[{id:0,name:"FLGT001"},{id:1,name:"FLGT002"},{id:2,name:"FLGT003"},{id:3,name:"KL1105"},{id:4,name:"KE6419"},{id:5,name:"KL1107"},{id:6,name:"9W8515"}],f=c.localhost,g=new l.a(new l.a.providers.WebsocketProvider(f.url.replace("http","ws")));g.eth.defaultAccount=g.eth.accounts[0];var d=new g.eth.Contract(t.abi,f.appAddress),h=[],m=null;new Promise((function(e,o){g.eth.getAccounts().then((function(n){var t=22,c=[];d.methods.REGISTRATION_FEE().call().then((function(s){n.slice(11,33).forEach((function(n){d.methods.registerOracle().send({from:n,value:s,gas:9999999,gasPrice:2e10}).then((function(){d.methods.getMyIndexes().call({from:n}).then((function(o){c.push(o),h.push(n),console.log("Oracle Registered: ".concat(o[0],", ").concat(o[1],", ").concat(o[2]," at ").concat(n)),(t-=1)||e(c)})).catch((function(e){o(e)}))})).catch((function(e){o(e)}))}))})).catch((function(e){o(e)}))})).catch((function(e){o(e)}))})).then((function(e){console.log("All oracles registered"),initREST(),d.events.SubmitOracleResponse({fromBlock:"latest"},(function(e,o){e&&console.log(e),console.log(o);for(var n=o.returnValues.airline,t=o.returnValues.flight,c=o.returnValues.timestamp,s=o.returnValues.indexes,l=o.returnValues.statusCode,r=0;r<h.length;r++)console.log("Oracle loop ",r),d.methods.submitOracleResponse(s,n,t,c,l).send({from:h[r]}).then((function(e){console.log(e)})).catch((function(e){console.log("Oracle didn't respond")}))})),d.events.RegisterAirline({fromBlock:0},(function(e,o){e&&console.log(e),console.log(o)})),d.events.FundedLines({fromBlock:0},(function(e,o){e&&console.log(e),console.log(o)})),d.events.PurchaseInsurance({fromBlock:0},(function(e,o){e&&console.log(e),console.log(o)})),d.events.CreditInsurees({fromBlock:0},(function(e,o){e&&console.log(e),console.log(o)})),d.events.Withdraw({fromBlock:0},(function(e,o){e&&console.log(e),console.log(o)})),d.events.OracleRequest({fromBlock:0},(function(e,o){e&&console.log(e),m=o.returnValues.index,console.log(o)})),d.events.OracleReport({fromBlock:0},(function(e,o){e&&console.log(e),console.log(o)}))})).catch((function(e){console.log(e.message)}));var p=a()();p.get("/api",(function(e,o){o.send({message:"An API for use with your Dapp!"}),p.get("/flights",(function(e,o){o.json({result:u})})),p.get("/eventIndex",(function(e,o){o.json({result:m})}))})),p.use(i()),o.default=p}};