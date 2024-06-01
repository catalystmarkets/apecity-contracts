// const { ethers } = require("hardhat");

// async function main() {

//     //base-tenderly
//     const apeFactoryContractAddress = "0x205f875c5f69b3ae4d6cf9f3962d5187ff18fafd"

//     const ApeFactory = await ethers.getContractAt("ApeFactory", apeFactoryContractAddress);

//     let allTokensLength = await ApeFactory.allTokensLength()
//     console.log('allTokensLength', allTokensLength);
// }

// Import necessary libraries and modules
const { ethers } = require("hardhat");
const { ChainId, Token, WETH, Fetcher } = require('@uniswap/v2-sdk');

async function main() {
    // Specify the chain ID (e.g., mainnet, ropsten)
    // const chainId = ChainId.MAINNET;
    const chainId = 8453;

    // Replace with your Uniswap pair contract address
    const pairAddress = "0xd14b428a7820fe9a473aba877ab57cb9b2ddcc29";

    // Get the contract ABI for Uniswap V2 pair
    const UNISWAP_V2_PAIR_ABI = [
        "function token0() external view returns (address)",
        "function token1() external view returns (address)"
    ];

    // Initialize ethers provider and contract
    const pairContract = await ethers.getContractAt(UNISWAP_V2_PAIR_ABI, pairAddress);


    // Fetch the token addresses
    const token0Address = await pairContract.token0();
    const token1Address = await pairContract.token1();

    // Log the token addresses and details
    console.log(`Token 0 Address: ${token0Address}`);
    console.log(`Token 1 Address: ${token1Address}`);
}

// Execute the main function
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });



// "npx hardhat run scripts/fetchData.js --network baseTenderly"
