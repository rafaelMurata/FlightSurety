exports.id=0,exports.modules={"./src/server/server.js":function(e,n,s){"use strict";s.r(n);var r=s("./build/contracts/FlightSuretyApp.json"),t=s("./src/server/config.json"),o=s("web3"),c=s.n(o),a=s("express"),i=s.n(a),u=s("cors"),l=t.localhost,d=new c.a(new c.a.providers.WebsocketProvider(l.url.replace("http","ws")));d.eth.defaultAccount=d.eth.accounts[0];var p=new d.eth.Contract(r.abi,l.appAddress),f=[{id:0,name:"FLGT001"},{id:1,name:"FLGT002"},{id:2,name:"FLGT003"},{id:3,name:"KL1105"},{id:4,name:"KE6419"},{id:5,name:"KL1107"},{id:6,name:"9W8515"}],m=null;p.events.OracleRequest({fromBlock:0},(function(e,n){e&&console.log(e),m=n.returnValues.index,console.log(n)}));var v=i()();v.get("/api",(function(e,n){n.send({message:"An API for use with your Dapp!"}),v.get("/flights",(function(e,n){n.json({result:f})})),v.get("/eventIndex",(function(e,n){n.json({result:m})}))})),v.use(u()),n.default=v},cors:function(e,n){e.exports=require("cors")}};