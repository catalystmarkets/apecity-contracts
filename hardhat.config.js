require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter")
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.25",

  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      forking: {
        url: `https://base-mainnet.g.alchemy.com/v2/nKNFkn8mFrvWeVSg0trG1ELt9S73j3r8`,
        enabled: true
      }
    },
  },
};

// "npx hardhat node --fork https://base-mainnet.g.alchemy.com/v2/nKNFkn8mFrvWeVSg0trG1ELt9S73j3r8"
// "npx hardhat node --fork wss://base-mainnet.g.alchemy.com/v2/nKNFkn8mFrvWeVSg0trG1ELt9S73j3r8"