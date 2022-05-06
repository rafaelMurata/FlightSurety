exports.id=0,exports.modules={"./src/server/server.js":function(e,o,n){"use strict";n.r(o);var t=n("./build/contracts/FlightSuretyApp.json"),c=(n("./build/contracts/FlightSuretyData.json"),n("./src/server/config.json")),s=n("web3"),l=n.n(s),r=n("express"),u=n.n(r),a=n("cors"),i=c.localhost,f=new l.a(new l.a.providers.WebsocketProvider(i.url.replace("http","ws")));f.eth.defaultAccount=f.eth.accounts[0];var g=new f.eth.Contract(t.abi,i.appAddress),d=[],h="0xDA88B7788a71b84395f0DEd23387692D70E261aF";new Promise((function(e,o){f.eth.getAccounts().then((function(n){var t=22,c=[];g.methods.REGISTRATION_FEE().call().then((function(s){n.slice(11,33).forEach((function(n){g.methods.registerOracle().send({from:n,value:s,gas:9999999,gasPrice:2e10}).then((function(){g.methods.getMyIndexes().call({from:n}).then((function(o){c.push(o),d.push(n),console.log("Oracle Registered: ".concat(o[0],", ").concat(o[1],", ").concat(o[2]," at ").concat(n)),(t-=1)||e(c)})).catch((function(e){o(e)}))})).catch((function(e){o(e)}))}))})).catch((function(e){o(e)}))})).catch((function(e){o(e)}))})).then((function(e){console.log("All oracles registered"),g.events.SubmitOracleResponse({fromBlock:0},(function(e,o){e&&console.log(e),console.log(o);var n=o.returnValues.airline,t=o.returnValues.flight,c=o.returnValues.timestamp,s=o.returnValues.indexes,l=o.returnValues.statusCode;h=o.returnValues.index;for(var r=0;r<d.length;r++)console.log("Oracle loop ",r),g.methods.submitOracleResponse(s,n,t,c,l).send({from:d[r]}).then((function(e){console.log(e)})).catch((function(e){console.log("Oracle didn't respond")}))})),g.events.RegisterAirline({fromBlock:0},(function(e,o){e&&console.log(e),console.log(o)})),g.events.FundedLines({fromBlock:0},(function(e,o){e&&console.log(e),console.log(o)})),g.events.PurchaseInsurance({fromBlock:0},(function(e,o){e&&console.log(e),console.log(o)})),g.events.CreditInsurees({fromBlock:0},(function(e,o){e&&console.log(e),console.log(o)})),g.events.Withdraw({fromBlock:0},(function(e,o){e&&console.log(e),console.log(o)})),g.events.OracleRequest({fromBlock:0},(function(e,o){e&&console.log(e),h=o.returnValues.index,console.log(o)})),g.events.OracleReport({fromBlock:0},(function(e,o){e&&console.log(e),console.log(o)}))})).catch((function(e){console.log(e.message)}));var m=u()();m.get("/api",(function(e,o){o.send({message:"An API for use with your Dapp!"}),m.get("/eventIndex",(function(e,o){o.json({result:h})}))})),m.use(a()),o.default=m}};