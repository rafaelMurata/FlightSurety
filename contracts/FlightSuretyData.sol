pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false

    // Multi-party consensus
    // Added to setOperational() to practice the concept
    uint constant AUTHORIZED = 1;

     // Restrict data contract callers
    mapping(address => uint256) private authorizedContracts;
    
    // Airlines
    struct Airline {
        string name;
        bool isFunded;
        bool isRegistered;
    }
    mapping(address => Airline) private airlines;
    address[] registeredAirlines = new address[](0);

    // Flights
    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;
        address airline;
        string flight;
    }
    mapping(bytes32 => Flight) private flights;
    bytes32[] registeredFlights = new bytes32[](0);

    // Insurances
    struct Insurance {
        address passenger;
        uint256 amount; // Passenger insurance payment
        uint256 multiplier; // General damages multiplier (1.5x by default)
        bool isCredited;
    }
    mapping (bytes32 => Insurance[]) insuredPassengersPerFlight;
    mapping (address => uint) public pendingPayments;
    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    
    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                ) 
                                public 
    {
         contractOwner = msg.sender;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    /**
    * @dev Modifier that requires the calling App contract has been authorized
    */
    modifier requireIsCallerAuthorized()
    {
        require(authorizedContracts[msg.sender] == AUTHORIZED, "Caller is not an authorized contract");
        _;
    }

    /**
    * @dev Modifier that requires the calling App contract has been authorized
    */
      function authorizeCaller
                            (
                                address contractAddress
                            )
                            external
                            requireContractOwner
    {
        authorizedContracts[contractAddress] = AUTHORIZED;
    }

    /**
    * @dev Modifier that requires the calling App contract is authorized
    */
     function isAuthorized
                            (
                                address contractAddress
                            )
                            external
                            view
                            returns(bool)
    {
        return(authorizedContracts[contractAddress] == AUTHORIZED);
    }

  /**
    * @dev The modifier can disallow the contract
    */
    function deauthorizeCaller
                            (
                                address contractAddress
                            )
                            external
                            requireContractOwner
    {
        delete authorizedContracts[contractAddress];
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Modifier that requires airline to be funded
    */
    modifier requireAirlineIsFunded(address airline) {
        require(this.isFundedAirline(airline), "Only existing and funded airlines are allowed");
        _;
    }
      /**
    * @dev Modifier that requires airline to be funded
    */
    modifier requireAirlineRegisted(address airline) {
        require(this.isAirlineRegisted(airline), "Airline has already been registered");
        _;
    }

    /**
    * @dev Modifier that requires airline to be funded
    */
    modifier requireFlightRegisted(bytes32 flightKey) {
        require(!flights[flightKey].isRegistered, "Flight has already been registered");
        _;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

     /**
   * @dev Get operating status of contract
   *
   * @return A bool that is the current operating status
   */      
  function isOperational() public view returns(bool) {
    return operational;
  }

  /**
   * @dev Check if the address is a registered airline
   *
   * @return A bool confirming whether or not the address is a registered airline
   */
  function isAirlineRegisted(address airline) external view returns(bool) {
    return airlines[airline].isRegistered;
  }

  /**
   * @dev Check if the address is a funded airline
   *
   * @return A bool confirming whether or not the address is a funded airline
   */
  function isFundedAirline(address airline) external view returns(bool) {
    return airlines[airline].isFunded;
  }

  /**
   * @dev Get registered airlines
   *
   * @return An array with the addresses of all registered airlines
   */
  function getRegisteredAirlines() external view returns(address[] memory) {
    return registeredAirlines;
  }

  /**
   * @dev Check if the flight is registered
   */
  function isFlightRegistered(address airline, string flight, uint256 timestamp) external view returns(bool) {
    return flights[getFlightKey(airline, flight, timestamp)].isRegistered;
  }
  /**
   * @dev Check if the passenger is registerd for the flight
   */
  function isInsuredRegistered(address passenger, address airline, string flight, uint256 timestamp) external view returns (bool) {
    Insurance[] memory insuredPassengers = insuredPassengersPerFlight[getFlightKey(airline, flight, timestamp)];
    for(uint i = 0; i < insuredPassengers.length; i++) {
      if (insuredPassengers[i].passenger == passenger) {
        return true;
      }
    }
    return false;
  }
    /**
   * @dev Submit funding for airline to true
   */   
  function fundAirline(address addr) external requireIsOperational requireIsCallerAuthorized {
    airlines[addr].isFunded = true;
  }
    /**
   * @dev check credit of the Passenger 
   */   
  function creditPassenger(address passenger, address airline, string flight, uint256 timestamp) external view requireIsOperational requireIsCallerAuthorized returns(uint256) {
    Insurance[] memory passengers = insuredPassengersPerFlight[getFlightKey(airline, flight, timestamp)];
    for(uint i = 0; i < passengers.length; i++) {
          if (passengers[i].passenger == passenger) {
            return passengers[i].amount;
          }
        }
    return 0;
  }
   
   /**
    * @dev Add an airline to the registration 
    *
    */   
    function registerAirline(address airline, string name)external requireIsOperational requireIsCallerAuthorized requireAirlineRegisted(airline) returns (bool)
    {
        airlines[airline] = Airline({
                                    name: name,
                                    isFunded: false, 
                                    isRegistered: true
                                    });

        registeredAirlines.push(airline);

        return true;
    }

  /**
   * @dev Register a flight
   */
  function registerFlight(address airline, string flight, uint256 timestamp) external requireIsOperational requireIsCallerAuthorized requireAirlineIsFunded(airline) requireFlightRegisted(flightKey) {
    bytes32 flightKey = getFlightKey(airline, flight, timestamp);

    flights[flightKey] = Flight({
      isRegistered: true,
      statusCode: 0,
      updatedTimestamp: timestamp,
      airline: airline,
      flight: flight
    });

    registeredFlights.push(flightKey);

  }
    /**
   * @dev Process flights
   */
    function processFlightStatus(address airline, string flight, uint256 timestamp, uint8 statusCode) external requireIsOperational requireIsCallerAuthorized {
        bytes32 flightKey = getFlightKey(airline, flight, timestamp);    
        
        flights[flightKey].statusCode = statusCode;
        if ((statusCode == STATUS_CODE_LATE_AIRLINE) || (statusCode == STATUS_CODE_LATE_TECHNICAL)) {
          creditInsurees(airline, flight, timestamp);
        }
    }
    
    /**
    * @dev Credits payouts to insurees
    */
    function creditInsurees(address airline, string memory flight, uint256 timestamp) internal view requireIsOperational requireIsCallerAuthorized {
        bytes32 flightKey = getFlightKey(airline, flight, timestamp);

        for (uint i = 0; i < insuredPassengersPerFlight[flightKey].length; i++) {
        Insurance memory insurance = insuredPassengersPerFlight[flightKey][i];

        if (insurance.isCredited == false) {
            insurance.isCredited = true;
            insurance.amount += insurance.amount.mul(insurance.multiplier).div(100);
            }
        }
    }

   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy(address airline,string flight,uint256 timestamp,address passenger,uint256 amount) external payable requireIsOperational returns (bytes32)
    {
        bytes32 flightKey = getFlightKey(airline, flight, timestamp);

        insuredPassengersPerFlight[flightKey].push(Insurance({
        passenger: passenger,
        amount: amount,
        multiplier: msg.value,
        isCredited: false
        }));
        return flightKey;
    }

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay(address insuredPassenger)public requireIsOperational returns (uint256, uint256, address)
    {
        require(insuredPassenger == tx.origin, "Contracts not allowed");
        require(pendingPayments[insuredPassenger] > 0, "No fund available for withdrawal");

        uint256 amount = pendingPayments[insuredPassenger];
        pendingPayments[insuredPassenger] = 0;
      
        address(insuredPassenger).transfer(amount);
        return (amount, pendingPayments[insuredPassenger], address(insuredPassenger));
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (   
                            )
                            public
                            payable
                            requireIsOperational
    {

    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        fund();
    }


}
