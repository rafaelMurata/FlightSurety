exports.id=0,exports.modules={"./src/server/server.js":function(e,n,s){"use strict";s.r(n);var t=s("./build/contracts/FlightSuretyApp.json"),r=s("./src/server/config.json"),o=s("web3"),a=s.n(o),c=s("express"),i=s.n(c),u=r.localhost,l=new a.a(new a.a.providers.WebsocketProvider(u.url.replace("http","ws")));l.eth.defaultAccount=l.eth.accounts[0];var d=new l.eth.Contract(t.abi,u.appAddress),p=[{id:0,name:"FLGT001"},{id:1,name:"FLGT002"},{id:2,name:"FLGT003"},{id:3,name:"KL1105"},{id:4,name:"KE6419"},{id:5,name:"KL1107"},{id:6,name:"9W8515"}],f=null;d.events.OracleRequest({fromBlock:0},(function(e,n){e&&console.log(e),f=n.returnValues.index,console.log(n)}));var m=i()();m.get("/api",(function(e,n){n.send({message:"An API for use with your Dapp!"}),m.get("/flights",(function(e,n){n.json({result:p})})),m.get("/eventIndex",(function(e,n){n.json({result:f})}))})),m.use(cors()),n.default=m}};