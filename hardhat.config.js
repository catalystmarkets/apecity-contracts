require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter")
/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: { 
    compilers: [{ version: "0.8.25", }, { version: "0.6.6", settings: {}, }], 
  },

  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      chains: {
        8453: {
          hardforkHistory: {
            "london": 13576076,
          }
        },
      },
      hardfork: "london",
      forking: {
        // url: `https://base-mainnet.g.alchemy.com/v2/nKNFkn8mFrvWeVSg0trG1ELt9S73j3r8`,
        url: `https://base-mainnet.blastapi.io/a4e97567-d675-414e-9ece-a99daac7ab56`,
        enabled: true
      }
    }, 
  },
  mocha: {
    timeout: 200000, // Increase the timeout value if needed
  },
};

// https://docs.alchemy.com/docs/how-to-implement-retries

// "npx hardhat node --fork https://base-mainnet.g.alchemy.com/v2/nKNFkn8mFrvWeVSg0trG1ELt9S73j3r8"
// "npx hardhat node --fork wss://base-mainnet.g.alchemy.com/v2/nKNFkn8mFrvWeVSg0trG1ELt9S73j3r8"