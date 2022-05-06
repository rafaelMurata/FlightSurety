import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

var BigNumber = require('bignumber.js');
export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.appAddress = config.appAddress;
        this.initialize(callback);
        this.weiMultiple = (new BigNumber(10)).pow(18);
        this.owner = null;
        this.airlines = ["LATAM","AZUL","GOL","TAP","Passaredo"];
        this.passengers = ["Jose","Maria","Rafael","Chewie","User"];
        this.passengersRegistered = [];
        this.airlinesRegistered=[];
        this.oracles = [];
        this.price = null;
        this.fund_fee = 10;

        this.CREDIT_MULTIPLIER = 1.5;
        // Watch contract events
        const STATUS_CODE_UNKNOWN = 0;
        const STATUS_CODE_ON_TIME = 10;
        const STATUS_CODE_LATE_AIRLINE = 20;
        const STATUS_CODE_LATE_WEATHER = 30;
        const STATUS_CODE_LATE_TECHNICAL = 40;
        const STATUS_CODE_LATE_OTHER = 50;

        this.STATUS_CODES = Array(STATUS_CODE_UNKNOWN, STATUS_CODE_ON_TIME, STATUS_CODE_LATE_AIRLINE, STATUS_CODE_LATE_WEATHER, STATUS_CODE_LATE_TECHNICAL, STATUS_CODE_LATE_OTHER);
        this.transaction_passenger = null;
        this.transaction_airline = null;
    }
        
    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];
            
            for (let index = 0; index < 5; index++) {
                if(!containsObject(accts[index],this.airlinesRegistered)){
                    this.registerAirline(accts[index],this.airlines[index]);
                    this.registerFlight(accts[index],this.airlines[index]);
                    this.fundAriline(accts[index]);
                    this.airlinesRegistered.push({
                        "id":index,
                        "address":accts[index],
                        "fund":this.web3.utils.toWei(this.fund_fee.toString(), "ether"),
                        "name":this.airlines[index]
                    })
                }
              
            }
            for (let index = 5, index2 =0; index < 10; index++, index2++) {
             
                this.passengersRegistered.push({
                    "id":index,
                    "address":accts[index],
                    "name":this.passengers[index2]
                });
            }

            this.flightSuretyData.methods.authorizeCaller(this.appAddress).send({from: this.owner}, (error, result) => {
              if(error) {
                   console.log("Could not authorize the App contract");
                  console.log(error);
                }
            });

            callback();
        });
    }

    registerAirline(airlineAddress,arilineName){
        let self =this;
        let payload = {
            airlineAddress: airlineAddress,
            arilineName: arilineName
        }
        self.flightSuretyApp.methods
            .registerAirline(payload.airlineAddress,payload.arilineName)
            .send({from: this.owner, gas: 5000000,gasPrice: 20000000}, (error, result) => {
                if (error) {
                    console.log(error);
                }
            });
    }
    async registerFlight(airlineAddress,flight){
        let self = this;
        let payload = {
            airlineAddress: airlineAddress,
            flight: flight,
            timestamp: Math.round(new Date().getTime() / 1000).toString()
        }
        self.flightSuretyData.methods.
        registerFlight(payload.airlineAddress,payload.flight,payload.timestamp)
        .send({ from: self.owner}, (error, result) => {
        });
    }
    async fundAriline(flight){
        let self = this;
        let payload = {
            flight: flight
        }
        self.flightSuretyApp.methods.
        fundAirline()
        .send({ from: self.owner}, (error, result) => {
           return result;
        });
    }
    
    submitOracleResponse(indexes, airline, flight, timestamp, callback){
        let self = this;
        let payload = {
            indexes: indexes,
            airline: self.airlinesRegistered[2].address,
            flight: flight,
            timestamp: timestamp,
            statusCode: self.STATUS_CODES[Math.floor(Math.random()*self.STATUS_CODES.length)]
        }
        self.flightSuretyApp.methods
            .submitOracleResponse(payload.indexes, payload.airline, payload.flight, payload.timestamp, payload.statusCode)
            .send({from: self.owner}, (error, result) =>{
                callback(error, payload);
            });

    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flight,depatureDate , callback) {
        let self = this;
        let payload = {
            airline: self.airlinesRegistered[2].address,
            flight: flight,
            timestamp: Date.parse(depatureDate.toString())/1000
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }

    buy(flight,depatureDate,price, callback){
        let self = this;
        self.price = Number(price);
        let payload = {
            flight: flight,
            timestamp: Date.parse(depatureDate.toString())/1000,
            airline: self.airlinesRegistered[2].address,
            price_wei: self.weiMultiple * price, //  Web3.utils.toWei(price.toString(), "ether")
        }
        self.flightSuretyApp.methods
            .buy(payload.flight,payload.airline,payload.timestamp)
            .send({from: payload.passenger, value: payload.price_wei}, (error, result) => {
                callback(error, payload);
            });
    }

    pay(callback){
        let self = this;
        let payload = {
            passenger: self.passengersRegistered[0].address
        }
        self.flightSuretyApp.methods
        .pay()
        .send({from: payload.passenger}, (error, result) => {
            console.log("pay "+result);
            callback(error, payload);
        });
    }
    async creditPassenger(flight,fdate,callback){
        let self = this;
        let payload = {
            flight: flight,
            airline: self.airlinesRegistered[2].address,
            timestamp: Date.parse(fdate.toString())/1000,
            passenger: self.passengersRegistered[0].address
        }
        self.flightSuretyData.methods.
        creditPassenger(payload.passenger,payload.airline,payload.flight,payload.timestamp)
        .send({ from: self.owner}, (error, result) => { 
            let x = new BigNumber(result);
            console.log("creditPassenger22 "+result);
            console.log("creditPassenger "+x.toFixed());
        });
    }
    
}
function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}