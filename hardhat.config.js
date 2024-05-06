require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter")
require('hardhat-ethernal');
/** @type import('hardhat/config').HardhatUserConfig */
const tdly = require("@tenderly/hardhat-tenderly");

tdly.setup();

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.25",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  defaultNetwork: "hardhat",
  ethernal: {
    apiToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJlYmFzZVVzZXJJZCI6IjN3SkdqcVZhM1BNd3NpdnNzVVNXaXJYT2lJODIiLCJhcGlLZXkiOiI4MEoyMUM3LVJRUk1HMUgtSzdOU1RHOS1YN0RLN0I0XHUwMDAxIiwiaWF0IjoxNzE0MTI3MTcyfQ.VqaG2XpmFk9dTnui0NKVUQ8FpeOVw1hIB73FS4Aa4Do"
  },
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
        enabled: false
      }
    }, 
    baseSepolia: {
      url: "https://base-sepolia.blastapi.io/a4e97567-d675-414e-9ece-a99daac7ab56",
      accounts: ["0x0817f17544818332106d1facc02e1c2596611bd01ac51649ea22a0acd4b409ba"],
    },
    baseTenderly: {
      url: "https://virtual.base.rpc.tenderly.co/7c1e1b28-8b54-4350-9fa6-8d52fd9de32b",
      accounts: ["0x0817f17544818332106d1facc02e1c2596611bd01ac51649ea22a0acd4b409ba"],
      chainId: 8454
    },
    localhost: {
      url: "http://0.0.0.0:8545/",
      accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d","0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"],
      chainId: 1337
    }
  },
  tenderly: {
    username: "Siddharth009",
    project: "apefun",
    
    // Contract visible only in Tenderly.
    // Omitting or setting to `false` makes it visible to the whole world.
    // Alternatively, admin-rpc verification visibility using
    // an environment variable `TENDERLY_PRIVATE_VERIFICATION`.
    privateVerification: true,
  },
  mocha: {
    timeout: 200000, // Increase the timeout value if needed
  },
  gasReporter: {
    enabled:true,
    currency: "USD",
    currencyDisplayPrecision:4,
    coinmarketcap: "45afcfb7-e746-4d41-b46c-05d19d5d73aa",
    L2: "base",
    L2Etherscan: "IH8XC9YYCR6ZP5WDAKANWFG3KGZSPRDGBB",
    token: "ETH",
    gasPriceApi: "https://api.basescan.org/api?module=proxy&action=eth_gasPrice",
    showTimeSpent: true,
  },
};

// admin-private rpc url
// "https://virtual.base.rpc.tenderly.co/d8f7b76d-3d9c-4386-a388-04c7fa5c096b"

// public rpc url
// "https://virtual.base.rpc.tenderly.co/431b304f-522f-416d-99ec-cd50deb63c8a"

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJlYmFzZVVzZXJJZCI6IjN3SkdqcVZhM1BNd3NpdnNzVVNXaXJYT2lJODIiLCJhcGlLZXkiOiI4MEoyMUM3LVJRUk1HMUgtSzdOU1RHOS1YN0RLN0I0XHUwMDAxIiwiaWF0IjoxNzE0MTI3MTcyfQ.VqaG2XpmFk9dTnui0NKVUQ8FpeOVw1hIB73FS4Aa4Do
// "npx hardhat run scripts/deployApeFactory.js --network hardhat"
// https://base-sepolia.blastapi.io/a4e97567-d675-414e-9ece-a99daac7ab56
// https://docs.alchemy.com/docs/how-to-implement-retries
// "npx hardhat node --fork https://base-mainnet.g.alchemy.com/v2/nKNFkn8mFrvWeVSg0trG1ELt9S73j3r8"
// "npx hardhat node --fork wss://base-mainnet.g.alchemy.com/v2/nKNFkn8mFrvWeVSg0trG1ELt9S73j3r8"