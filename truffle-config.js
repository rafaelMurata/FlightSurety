var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "theme rapid frame online margin spatial faith bottom wish light coyote enact";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost
      port: 8545,            // Standard Ganache UI port
      network_id: "*"
    }
  },
  compilers: {
    solc: {
      version: "^0.4.24"
    }
  }
};