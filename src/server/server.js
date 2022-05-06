import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';

var cors = require('cors');
//const ORACLES_COUNT = 20;


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
//let flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);

let oracle_address = [];


let oracleIndex = '';



function initOracles() {
  return new Promise((resolve, reject) => {
      web3.eth.getAccounts().then(accounts =>{
      let rounds = 22 
      let oracles = [];
      flightSuretyApp.methods.REGISTRATION_FEE().call().then(fee => {

        accounts.slice(11,33).forEach(account => {
          flightSuretyApp.methods.registerOracle().send({
              from: account,
              value: fee,
              gas: 9999999,
              gasPrice: 20000000000
          }).then(() => {
              flightSuretyApp.methods.getMyIndexes().call({
                  from: account
              }).then(result => {
                  oracles.push(result);
                  oracle_address.push(account);
                  oracleIndex = account;
                  console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]} at ${account}`);
                  rounds -= 1;
                  if (!rounds) {
                      resolve(oracles);
                  }
              }).catch(err => {
                  reject(err);
              });
          }).catch(err => {
              reject(err);
          });
      });

      }).catch(err => {
          reject(err);
      });
      }).catch(err => {
        reject(err);
    });
  });
}



initOracles().then(oracles =>{
  console.log("All oracles registered");

  flightSuretyApp.events.SubmitOracleResponse({
    fromBlock: 0
  }, function (error, event) {
      if (error) {
          console.log(error)
      }
      console.log(event);
      
      let airline = event.returnValues.airline;
      let flight = event.returnValues.flight;
      let timestamp = event.returnValues.timestamp;
      let indexes = event.returnValues.indexes;
      let statusCode = event.returnValues.statusCode;
      oracleIndex = event.returnValues.index;

      for(let a=0; a< oracle_address.length; a++){
          console.log("Oracle loop ",a);
          flightSuretyApp.methods
            .submitOracleResponse(indexes, airline,flight,timestamp, statusCode)
            .send({ 
              from: oracle_address[a]
            }).then(result => {
              console.log(result);
          }).catch(err => {
            console.log("Oracle didn't respond");

          });
      }

  });

  
  flightSuretyApp.events.AirlineRegistered({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log(event)
  });
  
  flightSuretyApp.events.AirlineFundedRegistered({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log(event)
  });

  flightSuretyApp.events.FlightRegistered({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log(event)
  });


  flightSuretyApp.events.InsuranceBoughtRegistered({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log(event)
  });


flightSuretyApp.events.FlightStatusInfo({
  fromBlock: 0
}, function (error, event) {
  if (error) console.log(error)
  console.log(event)
});

flightSuretyApp.events.OracleReport({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)

    console.log(event)
});

flightSuretyApp.events.OracleRequest({
  fromBlock: 0
}, function (error, event) {
  if (error) console.log(error)
  console.log(event)
});
  
}).catch(err => {
  console.log(err.message);
})

const app = express();
    app.get('/api', (req, res) => {
      res.send({
        message: 'An API for use with your Dapp!'
    })
   
    app.get('/oracleIndex', (req, res) => {
      res.json({
        result: oracleIndex
      })
    }) 
})

app.use(cors());


export default app;