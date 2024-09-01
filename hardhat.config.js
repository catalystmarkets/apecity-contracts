require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter")
require('hardhat-ethernal');
/** @type import('hardhat/config').HardhatUserConfig */

// const tdly = require("@tenderly/hardhat-tenderly");
// tdly.setup();

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
//   ethernal: {
//     apiToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJlYmFzZVVzZXJJZCI6IjN3SkdqcVZhM1BNd3NpdnNzVVNXaXJYT2lJODIiLCJhcGlLZXkiOiI4MEoyMUM3LVJRUk1HMUgtSzdOU1RHOS1YN0RLN0I0XHUwMDAxIiwiaWF0IjoxNzE0MTI3MTcyfQ.VqaG2XpmFk9dTnui0NKVUQ8FpeOVw1hIB73FS4Aa4Do"
//   },
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
        url: `https://base.gateway.tenderly.co/7eSxf2jVQXhRN3QZ4bRkBj`,
        enabled: true
      }
    }, 
    baseSepolia: {
      url: "https://base-sepolia.blastapi.io/a4e97567-d675-414e-9ece-a99daac7ab56",
      accounts: ["0x0817f17544818332106d1facc02e1c2596611bd01ac51649ea22a0acd4b409ba"],
    },
    baseTenderly: {
      url: "https://virtual.base.rpc.tenderly.co/b67fff04-bd69-4b14-907a-3912e44f3f1d",
      accounts: ["0x0817f17544818332106d1facc02e1c2596611bd01ac51649ea22a0acd4b409ba","5c574e99acd1fc0ee232ce4c9dd29a59c9401bd850103726cddc762cb516a75a"],
      chainId: 8454
    },
    baseIdTenderly: {
      url: "https://virtual.base.rpc.tenderly.co/c070adf9-120d-4186-95f8-ca0978df9c08",
      accounts: ["0x0817f17544818332106d1facc02e1c2596611bd01ac51649ea22a0acd4b409ba","5c574e99acd1fc0ee232ce4c9dd29a59c9401bd850103726cddc762cb516a75a"],
      chainId: 8453
    },
    tenderly: {
        url: "https://virtual.base.rpc.tenderly.co/3f03ea4a-aebd-445c-94ca-22dee8209cb8",
        accounts: ["0x0817f17544818332106d1facc02e1c2596611bd01ac51649ea22a0acd4b409ba","5c574e99acd1fc0ee232ce4c9dd29a59c9401bd850103726cddc762cb516a75a"],
        chainId: 8455
    },
    merlintestnet: {
        url: "https://testnet-rpc.merlinchain.io/",
        accounts: ["0x0817f17544818332106d1facc02e1c2596611bd01ac51649ea22a0acd4b409ba","5c574e99acd1fc0ee232ce4c9dd29a59c9401bd850103726cddc762cb516a75a"],
        chainId: 686868
    },
    base: {
      // url: "https://base.llamarpc.com",
      url: "https://base-rpc.publicnode.com",
      accounts: ["0x0817f17544818332106d1facc02e1c2596611bd01ac51649ea22a0acd4b409ba","5c574e99acd1fc0ee232ce4c9dd29a59c9401bd850103726cddc762cb516a75a"],
      chainId: 8453
    },
    localhost: {
      url: "http://0.0.0.0:8545/",
      accounts: [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", 
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
        "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
        "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"
    ],
    //   chainId: 1337
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


// "npx hardhat node --fork https://base.gateway.tenderly.co/7eSxf2jVQXhRN3QZ4bRkBj
// XUy8qFyDe5unNtoL1Bwb1RsD0ZGozHdA