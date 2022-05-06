exports.id=0,exports.modules={"./src/server/server.js":function(e,n,o){"use strict";o.r(n);var s=o("./build/contracts/FlightSuretyApp.json"),t=o("./src/server/config.json"),r=o("web3"),l=o.n(r),a=o("express"),c=o.n(a),i=t.localhost,u=new l.a(new l.a.providers.WebsocketProvider(i.url.replace("http","ws")));u.eth.defaultAccount=u.eth.accounts[0];var d=new u.eth.Contract(s.abi,i.appAddress),f=[{id:0,name:"FLGT001"},{id:1,name:"FLGT002"},{id:2,name:"FLGT003"},{id:3,name:"KL1105"},{id:4,name:"KE6419"},{id:5,name:"KL1107"},{id:6,name:"9W8515"}];d.events.OracleRequest({fromBlock:"latest"},(function(e,n){e&&console.log(e),console.log(n);for(var o=n.returnValues.airline,s=n.returnValues.flight,t=n.returnValues.timestamp,r=n.returnValues.indexes,l=n.returnValues.statusCode,a=0;a<oracle_address.length;a++)console.log("Oracle loop ",a),d.methods.submitOracleResponse(r,o,s,t,l).send({from:oracle_address[a]}).then((function(e){console.log(e)})).catch((function(e){console.log("Oracle didn't respond")}))})),d.events.RegisterAirline({fromBlock:0},(function(e,n){e&&console.log(e),console.log(n)})),d.events.OracleRequest({fromBlock:0},(function(e,n){e&&console.log(e),eventIndex=n.returnValues.index,console.log(n)}));var g=c()();g.get("/api",(function(e,n){n.send({message:"An API for use with your Dapp!"}),g.get("/flights",(function(e,n){n.json({result:f})})),g.get("/eventIndex",(function(e,n){n.json({result:eventIndex})}))})),n.default=g}};